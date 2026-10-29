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

// Sign-in uses Google's redirect flow: the app goes to Google and Google sends it back with
// a short-lived access token (about 1 hour). Unlike a pop-up this also works inside an iPhone
// Home Screen app. The token only allows access to OY!'s own hidden folder in the user's Drive.
let token = null;
let tokenExpiry = 0;
let fileId = null;
const TOK_KEY = 'oy.tok';
const FLOW_KEY = 'oy.oauth';
(function loadTok() {
  try { const t = JSON.parse(sessionStorage.getItem(TOK_KEY)); if (t && t.exp > Date.now()) { token = t.t; tokenExpiry = t.exp; } } catch {}
})();
function saveTok() {
  try { token ? sessionStorage.setItem(TOK_KEY, JSON.stringify({ t: token, exp: tokenExpiry })) : sessionStorage.removeItem(TOK_KEY); } catch {}
}
export function hasToken() { return !!token && Date.now() < tokenExpiry; }
const redirectUri = () => location.origin + location.pathname.replace(/index\.html$/, '');

/** Go to Google to sign in. intent says what to do when we come back. Never resolves (the page navigates). */
export function signIn(hint, intent = 'signin', { silent = false } = {}) {
  const st = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  try { sessionStorage.setItem(FLOW_KEY, JSON.stringify({ st, intent, silent })); } catch {}
  const q = new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, redirect_uri: redirectUri(), response_type: 'token',
    scope: SCOPES, include_granted_scopes: 'true', state: st });
  if (hint) q.set('login_hint', hint);
  if (silent) q.set('prompt', 'none'); else if (!hint) q.set('prompt', 'select_account');
  location.assign('https://accounts.google.com/o/oauth2/v2/auth?' + q.toString());
  return new Promise(() => {});
}

/** Call once at start-up. If we have just come back from Google, keep the token and say who signed in. */
export async function takeRedirect() {
  const hash = location.hash || '';
  if (!/access_token=|error=/.test(hash)) return null;
  const q = new URLSearchParams(hash.slice(1));
  history.replaceState(null, '', location.pathname + location.search);
  let flow = null;
  try { flow = JSON.parse(sessionStorage.getItem(FLOW_KEY)); sessionStorage.removeItem(FLOW_KEY); } catch {}
  if (!flow || q.get('state') !== flow.st) return { error: 'Sign-in could not be confirmed. Please try again.' };
  if (q.get('error')) {
    const e = q.get('error');
    return { intent: flow.intent, silent: flow.silent, error: e === 'access_denied' ? 'Sign-in was cancelled.' : flow.silent ? null : 'Google sign-in did not finish. Please try again.' };
  }
  token = q.get('access_token');
  tokenExpiry = Date.now() + (Number(q.get('expires_in') || 3600) - 60) * 1000;
  saveTok();
  const me = await api('/oauth2/v3/userinfo', {}, false);
  return { intent: flow.intent, silent: flow.silent, account: { id: me.sub, email: me.email, name: me.name || me.email } };
}

export function signOut() {
  token = null; tokenExpiry = 0; fileId = null; saveTok();
}

function ensureToken() {
  if (hasToken()) return;
  const e = new Error('Google Drive needs you to sign in again');
  e.code = 'reconnect';
  throw e;
}

async function api(path, opts = {}, retry = true) {
  const res = await fetch(API + path, { ...opts, headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + token } });
  if (res.status === 401) { token = null; saveTok(); ensureToken(); }
  if (!res.ok) throw new Error('Google Drive error ' + res.status);
  const type = res.headers.get('content-type') || '';
  return type.includes('json') ? res.json() : res.text();
}

async function findFile() {
  if (fileId) return fileId;
  const q = encodeURIComponent(`name='${VAULT_FILE_NAME}' and trashed=false`);
  const r = await api(`/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime%20desc`);
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
// Files added while not connected to Google wait in a queue and upload on the next sync
const pendKey = (acc) => `oy.pendingAtt.${acc}`;
function pending(acc) { try { return JSON.parse(localStorage.getItem(pendKey(acc))) || []; } catch { return []; } }
function setPending(acc, list) { try { list.length ? localStorage.setItem(pendKey(acc), JSON.stringify(list)) : localStorage.removeItem(pendKey(acc)); } catch {} }
export async function flushPendingAtts(accountId) {
  if (!driveConfigured || !hasToken()) return;
  for (const id of pending(accountId)) {
    const box = await local.get(`${accountId}:att:${id}`);
    if (box) await uploadAtt(id, box);
    setPending(accountId, pending(accountId).filter((x) => x !== id));
  }
}
export async function attPut(accountId, id, box, hint) {
  await local.put(`${accountId}:att:${id}`, box);
  if (!driveConfigured || accountId === 'local' || accountId === 'sample') return;
  if (!hasToken()) { setPending(accountId, [...new Set([...pending(accountId), id])]); return; }
  try { await uploadAtt(id, box); }
  catch (e) { setPending(accountId, [...new Set([...pending(accountId), id])]); }
}
async function uploadAtt(id, box) {
  if (await findAtt(id)) return; // already there
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
  if (!driveConfigured || !hasToken()) return null;
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
  setPending(accountId, pending(accountId).filter((x) => x !== id));
  if (!driveConfigured || !hasToken()) return;
  try {
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
