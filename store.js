// OY! storage: an encrypted copy on this device (IndexedDB) plus, when signed
// in, the same encrypted file in the user's own Google Drive app folder.
// Only encrypted vault files ever pass through this module.

import { GOOGLE_CLIENT_ID, VAULT_FILE_NAME } from './config.js';

// ---------- Device storage (IndexedDB) ----------
const DB_NAME = 'oy';
const STORE = 'vaults';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => { db.close(); resolve(req && req.result); };
    t.onerror = () => { db.close(); reject(t.error); };
  });
}
export const local = {
  get: (id) => tx('readonly', (s) => s.get(id)),
  put: (id, file) => tx('readwrite', (s) => s.put(file, id)),
  del: (id) => tx('readwrite', (s) => s.delete(id))
};

// ---------- Remembered account (not secret: just name/email) ----------
const ACCOUNT_KEY = 'oy.account';
export function rememberedAccount() {
  try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY)); } catch { return null; }
}
export function rememberAccount(acc) {
  try { acc ? localStorage.setItem(ACCOUNT_KEY, JSON.stringify(acc)) : localStorage.removeItem(ACCOUNT_KEY); } catch {}
}

// ---------- Google Drive ----------
export const driveConfigured = !!GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid email profile';
const API = 'https://www.googleapis.com';

let token = null;        // access token, kept in memory only
let tokenExpiry = 0;
let tokenClient = null;
let fileId = null;

function loadGis() {
  if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not reach Google sign-in. Check your internet connection.'));
    document.head.appendChild(s);
  });
}

function requestToken(hint, prompt) {
  return new Promise((resolve, reject) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      hint: hint || undefined,
      callback: (resp) => {
        if (resp.error) return reject(new Error(resp.error_description || resp.error));
        token = resp.access_token;
        tokenExpiry = Date.now() + (resp.expires_in - 60) * 1000;
        resolve();
      },
      error_callback: (err) => reject(new Error(err && err.type === 'popup_closed' ? 'Sign-in was cancelled.' : 'Google sign-in failed.'))
    });
    tokenClient.requestAccessToken({ prompt });
  });
}

/** Sign in with Google. Returns { id, email, name }. */
export async function signIn(hint) {
  await loadGis();
  await requestToken(hint, hint ? '' : 'select_account');
  const me = await api('/oauth2/v3/userinfo');
  fileId = null;
  return { id: me.sub, email: me.email, name: me.name || me.email };
}

export function signOut() {
  if (token && window.google) google.accounts.oauth2.revoke(token, () => {});
  token = null; tokenExpiry = 0; fileId = null;
}

async function ensureToken(hint) {
  if (token && Date.now() < tokenExpiry) return;
  await loadGis();
  await requestToken(hint, '');
}

async function api(path, opts = {}, retry = true) {
  const res = await fetch(API + path, { ...opts, headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + token } });
  if (res.status === 401 && retry) {
    token = null;
    await ensureToken();
    return api(path, opts, false);
  }
  if (!res.ok) throw new Error('Google Drive error ' + res.status);
  const type = res.headers.get('content-type') || '';
  return type.includes('json') ? res.json() : res.text();
}

async function findFile() {
  if (fileId) return fileId;
  const q = encodeURIComponent(`name='${VAULT_FILE_NAME}' and trashed=false`);
  const r = await api(`/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime desc`);
  fileId = r.files && r.files[0] ? r.files[0].id : null;
  return fileId;
}

// ---------- Attachments (each photo/PDF is its own encrypted file) ----------
const attName = (id) => `oy-att-${id}.json`;
const attIds = new Map(); // attachment id -> Drive file id

async function findAtt(id) {
  if (attIds.has(id)) return attIds.get(id);
  const q = encodeURIComponent(`name='${attName(id)}' and trashed=false`);
  const r = await api(`/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id)`);
  const fid = r.files && r.files[0] ? r.files[0].id : null;
  if (fid) attIds.set(id, fid);
  return fid;
}

/** Save an encrypted attachment on this device and, when signed in, to Drive. */
export async function attPut(accountId, id, box, hint) {
  await local.put(`${accountId}:att:${id}`, box);
  if (!driveConfigured || !token && !hint) return;
  await ensureToken(hint);
  const boundary = 'oy' + Math.random().toString(36).slice(2);
  const meta = JSON.stringify({ name: attName(id), parents: ['appDataFolder'], mimeType: 'application/json' });
  const multipart =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(box)}\r\n--${boundary}--`;
  const r = await api('/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart
  });
  attIds.set(id, r.id);
}

/** Load an encrypted attachment (device copy first, then Drive). */
export async function attGet(accountId, id, hint) {
  const cached = await local.get(`${accountId}:att:${id}`);
  if (cached) return cached;
  if (!driveConfigured || (!token && !hint)) return null;
  await ensureToken(hint);
  const fid = await findAtt(id);
  if (!fid) return null;
  const txt = await api(`/drive/v3/files/${fid}?alt=media`);
  const box = typeof txt === 'string' ? JSON.parse(txt) : txt;
  await local.put(`${accountId}:att:${id}`, box);
  return box;
}

/** Delete an attachment everywhere. */
export async function attDel(accountId, id, hint) {
  await local.del(`${accountId}:att:${id}`);
  if (!driveConfigured || (!token && !hint)) return;
  try {
    await ensureToken(hint);
    const fid = await findAtt(id);
    if (fid) await api(`/drive/v3/files/${fid}`, { method: 'DELETE' });
    attIds.delete(id);
  } catch (e) { console.warn('Could not delete attachment from Drive', e); }
}

/** Download the encrypted vault from Drive, or null if none yet. */
export async function driveLoad(hint) {
  await ensureToken(hint);
  const id = await findFile();
  if (!id) return null;
  const txt = await api(`/drive/v3/files/${id}?alt=media`);
  return typeof txt === 'string' ? JSON.parse(txt) : txt;
}

/** Upload the encrypted vault to Drive (create or update). */
export async function driveSave(file, hint) {
  await ensureToken(hint);
  const body = JSON.stringify(file);
  const id = await findFile();
  if (id) {
    await api(`/upload/drive/v3/files/${id}?uploadType=media`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body
    });
    return;
  }
  const boundary = 'oy' + Math.random().toString(36).slice(2);
  const meta = JSON.stringify({ name: VAULT_FILE_NAME, parents: ['appDataFolder'], mimeType: 'application/json' });
  const multipart =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
  const r = await api('/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart
  });
  fileId = r.id;
}
