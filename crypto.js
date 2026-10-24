// OY! (Only You) — encryption core
// Everything is encrypted on the user's device. The master password and the
// vault key never leave the device and are never stored in plain form.
//
// Design:
//  - A random 256-bit vault key (VK) encrypts the vault data with AES-256-GCM.
//  - VK is "wrapped" (encrypted) twice:
//      1. with a key derived from the master password (PBKDF2-SHA256, 600k rounds)
//      2. with a key derived from the recovery key (random 128-bit, shown once)
//  - Changing the master password only re-wraps VK; the data does not change.

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();

export const KDF_ITERATIONS = 600000;
const RECOVERY_ITERATIONS = 100000; // recovery key is already high-entropy

export const b64 = {
  from(buf) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  },
  to(str) {
    const s = atob(str);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
};

export function randomBytes(n) {
  return globalThis.crypto.getRandomValues(new Uint8Array(n));
}

async function deriveKey(secret, salt, iterations) {
  const base = await subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function aesEncrypt(key, bytes) {
  const iv = randomBytes(12);
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
  return { iv: b64.from(iv), ct: b64.from(ct) };
}

async function aesDecrypt(key, box) {
  const pt = await subtle.decrypt({ name: 'AES-GCM', iv: b64.to(box.iv) }, key, b64.to(box.ct));
  return new Uint8Array(pt);
}

async function importVaultKey(raw) {
  return subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

// Recovery key: 32 characters from an unambiguous alphabet, shown as 8 groups of 4
const RK_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 symbols = 5 bits each → 160 bits
export function makeRecoveryKey() {
  const bytes = randomBytes(32);
  let out = '';
  for (let i = 0; i < 32; i++) out += RK_ALPHABET[bytes[i] & 31];
  return out.match(/.{4}/g).join('-');
}
export function normaliseRecoveryKey(rk) {
  return String(rk).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function wrap(secret, iterations, vkRaw) {
  const salt = randomBytes(16);
  const kek = await deriveKey(secret, salt, iterations);
  const box = await aesEncrypt(kek, vkRaw);
  return { salt: b64.from(salt), iter: iterations, ...box };
}

async function unwrap(secret, w) {
  const kek = await deriveKey(secret, b64.to(w.salt), w.iter);
  return aesDecrypt(kek, w); // throws if secret is wrong (GCM auth fails)
}

// ---- Public API ---------------------------------------------------------

/** Create a brand new vault. Returns { file, session, recoveryKey }. */
export async function createVault(masterPassword, data = { items: [] }) {
  const vkRaw = randomBytes(32);
  const recoveryKey = makeRecoveryKey();
  const file = {
    app: 'OY',
    version: 1,
    keys: {
      password: await wrap(masterPassword, KDF_ITERATIONS, vkRaw),
      recovery: await wrap(normaliseRecoveryKey(recoveryKey), RECOVERY_ITERATIONS, vkRaw)
    },
    data: null,
    updatedAt: 0
  };
  const session = { vk: await importVaultKey(vkRaw), vkRaw };
  await sealData(file, session, data);
  return { file, session, recoveryKey };
}

/** Unlock with master password. Returns { session, data }. Throws on wrong password. */
export async function unlockWithPassword(file, masterPassword) {
  const vkRaw = await unwrap(masterPassword, file.keys.password);
  return openWith(file, vkRaw);
}

/** Unlock with recovery key. Returns { session, data }. */
export async function unlockWithRecovery(file, recoveryKey) {
  const vkRaw = await unwrap(normaliseRecoveryKey(recoveryKey), file.keys.recovery);
  return openWith(file, vkRaw);
}

async function openWith(file, vkRaw) {
  const session = { vk: await importVaultKey(vkRaw), vkRaw };
  const data = JSON.parse(dec.decode(await aesDecrypt(session.vk, file.data)));
  return { session, data };
}

/** Encrypt data into the file (fresh IV every time). Mutates and returns file. */
export async function sealData(file, session, data) {
  file.data = await aesEncrypt(session.vk, enc.encode(JSON.stringify(data)));
  file.updatedAt = Date.now();
  return file;
}

/** Encrypt a file's bytes (photo, PDF) with the vault key. */
export async function encryptBytes(session, bytes) {
  return aesEncrypt(session.vk, bytes);
}
/** Decrypt a file encrypted with encryptBytes. */
export async function decryptBytes(session, box) {
  return aesDecrypt(session.vk, box);
}

// ---- Face ID / fingerprint (WebAuthn PRF) ----
// The passkey gives back a secret only after Face ID/fingerprint succeeds.
// We turn that secret into a key that wraps the vault key on this device.
async function keyFromSecret(secretBytes) {
  const base = await subtle.importKey('raw', secretBytes, 'HKDF', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: enc.encode('OY-biometric-v1'), info: new Uint8Array(0) },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function wrapForDevice(secretBytes, session) {
  return aesEncrypt(await keyFromSecret(secretBytes), session.vkRaw);
}
export async function unlockWithDeviceSecret(file, secretBytes, box) {
  const vkRaw = await aesDecrypt(await keyFromSecret(secretBytes), box);
  return openWith(file, vkRaw);
}

/** Set a new master password (after unlocking by password or recovery key). */
export async function changePassword(file, session, newPassword) {
  file.keys.password = await wrap(newPassword, KDF_ITERATIONS, session.vkRaw);
  file.updatedAt = Date.now();
  return file;
}

/** Issue a new recovery key (old one stops working). */
export async function rotateRecoveryKey(file, session) {
  const recoveryKey = makeRecoveryKey();
  file.keys.recovery = await wrap(normaliseRecoveryKey(recoveryKey), RECOVERY_ITERATIONS, session.vkRaw);
  file.updatedAt = Date.now();
  return recoveryKey;
}

export function isVaultFile(obj) {
  return !!(obj && obj.app === 'OY' && obj.keys && obj.keys.password && obj.keys.recovery && obj.data);
}

/** Wipe key material from memory as far as JS allows. */
export function lockSession(session) {
  if (session && session.vkRaw) session.vkRaw.fill(0);
}

// ---- Password generator -------------------------------------------------

export function generatePassword({ length = 20, upper = true, lower = true, digits = true, symbols = true } = {}) {
  const sets = [];
  if (lower) sets.push('abcdefghijkmnopqrstuvwxyz');
  if (upper) sets.push('ABCDEFGHJKLMNPQRSTUVWXYZ');
  if (digits) sets.push('23456789');
  if (symbols) sets.push('!@#$%^&*-_=+?');
  if (!sets.length) sets.push('abcdefghijkmnopqrstuvwxyz');
  const all = sets.join('');
  const pick = (chars) => {
    // rejection sampling to avoid modulo bias
    const limit = 256 - (256 % chars.length);
    while (true) {
      const b = randomBytes(1)[0];
      if (b < limit) return chars[b % chars.length];
    }
  };
  const out = sets.map(pick); // at least one from each chosen set
  while (out.length < length) out.push(pick(all));
  // Fisher–Yates shuffle with unbiased indices
  for (let i = out.length - 1; i > 0; i--) {
    const limit = 256 - (256 % (i + 1));
    let b; do { b = randomBytes(1)[0]; } while (b >= limit);
    const j = b % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, length).join('');
}

/** Rough strength score 0–4 based on length and character variety. */
export function strength(pw) {
  if (!pw) return 0;
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 20;
  const bits = pw.length * Math.log2(Math.max(pool, 1));
  if (bits < 40) return 0;
  if (bits < 60) return 1;
  if (bits < 80) return 2;
  if (bits < 100) return 3;
  return 4;
}
