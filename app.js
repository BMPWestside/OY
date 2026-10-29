// OY! (Only You) — app screens
import * as C from './crypto.js';
import * as S from './store.js';

// ---------------- Categories ----------------
// 'files' categories can hold photos / PDFs (front and back of a card, scans).
const TYPES = {
  login:    { label: 'Logins', one: 'login', fields: [
    ['url', 'Website or app'], ['username', 'Username'], ['password', 'Password', 'secret'], ['notes', 'Notes', 'multi']] },
  email:    { label: 'Email', one: 'email account', fields: [
    ['address', 'Email address'], ['password', 'Password', 'secret'], ['provider', 'Provider (Gmail, Outlook, iCloud…)'],
    ['recovery', 'Recovery email or phone'], ['notes', 'Notes', 'multi']] },
  passport: { label: 'Passports', one: 'passport', files: true, fields: [
    ['fullName', 'Full name'], ['number', 'Passport number', 'secret'], ['nationality', 'Nationality'],
    ['issued', 'Date of issue'], ['expiry', 'Date of expiry'], ['placeOfIssue', 'Place of issue'], ['notes', 'Notes', 'multi']] },
  medicare: { label: 'Medicare', one: 'Medicare card', files: true, fields: [
    ['number', 'Card number', 'secret'], ['members', 'People on card (with reference numbers)', 'multi'],
    ['validTo', 'Valid to'], ['notes', 'Notes', 'multi']] },
  card:     { label: 'Cards', one: 'card', fields: [
    ['holder', 'Name on card'], ['number', 'Card number', 'secret'], ['expiry', 'Expiry (MM/YY)'],
    ['cvv', 'CVV', 'secret'], ['pin', 'PIN', 'secret'], ['notes', 'Notes', 'multi']] },
  bank:     { label: 'Bank accounts', one: 'bank account', fields: [
    ['bank', 'Bank'], ['accountName', 'Account name'], ['bsb', 'BSB'], ['accountNumber', 'Account number', 'secret'],
    ['netbankId', 'Online banking ID', 'secret'], ['notes', 'Notes', 'multi']] },
  rewards:  { label: 'Reward cards', one: 'reward card', fields: [
    ['program', 'Program (Flybuys, Everyday Rewards, Qantas…)'], ['memberNumber', 'Member number'],
    ['password', 'Password or PIN', 'secret'], ['notes', 'Notes', 'multi']] },
  licence:  { label: 'Licences', one: 'licence', files: true, fields: [
    ['fullName', 'Full name'], ['number', 'Licence number', 'secret'], ['cardNumber', 'Card number', 'secret'],
    ['state', 'State'], ['class', 'Class'], ['expiry', 'Expiry'], ['notes', 'Notes', 'multi']] },
  taxid:    { label: 'Tax & business IDs', one: 'tax ID', fields: [
    ['name', 'Person or business name'], ['tfn', 'TFN', 'secret'], ['abn', 'ABN'], ['acn', 'ACN'],
    ['gst', 'GST registered from'], ['notes', 'Notes', 'multi']] },
  wifi:     { label: 'Wi‑Fi', one: 'Wi‑Fi network', fields: [
    ['ssid', 'Network name'], ['password', 'Password', 'secret'], ['notes', 'Notes', 'multi']] },
  note:     { label: 'Secure notes', one: 'note', fields: [
    ['note', 'Note', 'multi secret']] },
  document: { label: 'Other documents', one: 'document', files: true, fields: [
    ['kind', 'Document (birth certificate, visa, insurance…)'], ['number', 'Number', 'secret'],
    ['expiry', 'Expiry'], ['notes', 'Notes', 'multi']] }
};
const TYPE_KEYS = Object.keys(TYPES);
// All / Favourites / Recent are views across every category, shown first on the home screen
const SPECIAL = { all: 'All', fav: 'Favourites', recent: 'Recent', expiring: 'Expiring soon' };
const HOME_KEYS = ['all', 'fav', 'recent', ...TYPE_KEYS.filter((k) => k !== 'document'), 'more'];   // 'Other documents' lives in More
const CUSTOM_ICONS = ['folder', 'house', 'car', 'heart', 'briefcase', 'globe', 'phone', 'shield', 'tag', 'book', 'rewards', 'login'];
const CUSTOM_FIELDS = [['username', 'Username or ID'], ['password', 'Password or PIN', 'secret'], ['number', 'Number', 'secret'],
  ['url', 'Website'], ['notes', 'Notes', 'multi']];
function customCats() { return (state.data && state.data.prefs.custom) || []; }
function baseDef(k) {
  if (TYPES[k]) return TYPES[k];
  const c = customCats().find((x) => x.id === k);
  if (c) return { label: c.label, one: c.label.toLowerCase(), files: true, custom: true, icon: c.icon, fields: CUSTOM_FIELDS };
  return TYPES.note;
}
// A category's fields can be customised; the custom list is stored (encrypted) in the vault
function typeDef(k) {
  const def = baseDef(k);
  const custom = state.data && state.data.prefs.fields && state.data.prefs.fields[k];
  return custom ? { ...def, fields: custom } : def;
}
function typeIcon(k) { return TYPES[k] ? k : (typeDef(k).icon || 'folder'); }

// Gold line icons (static markup, no user data)
const ICON_PATHS = {
  login: '<circle cx="8" cy="15" r="4"/><path d="M11 12.2 19.5 3.7M16.5 6.7l2.6 2.6M14.3 8.9l2 2"/>',
  email: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.6 6.6 8.4 6.6 8.4-6.6"/>',
  passport: '<rect x="5" y="2.8" width="14" height="18.4" rx="1.6"/><circle cx="12" cy="10" r="3.4"/><path d="M8.6 10h6.8M12 6.6c1.2 1 1.2 5.8 0 6.8M12 6.6c-1.2 1-1.2 5.8 0 6.8M9 17h6"/>',
  medicare: '<rect x="2.8" y="5.5" width="18.4" height="13" rx="2"/><path d="M8 9.4v5.2M5.4 12h5.2M13.5 10h4.5M13.5 13.8h3"/>',
  card: '<rect x="2.8" y="5.5" width="18.4" height="13" rx="2"/><path d="M2.8 9.6h18.4M6 14.6h4"/>',
  bank: '<path d="M3 9.2 12 4l9 5.2M4.5 20h15M6 10.5V17M10 10.5V17M14 10.5V17M18 10.5V17M3.5 20h17"/>',
  rewards: '<rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8v12M12 8c-1.6-3.4-5.6-3.6-5.6-1.2C6.4 8 9 8 12 8zM12 8c1.6-3.4 5.6-3.6 5.6-1.2C17.6 8 15 8 12 8z"/>',
  more: '<circle cx="6" cy="6" r="1.7"/><circle cx="12" cy="6" r="1.7"/><circle cx="18" cy="6" r="1.7"/><circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/><circle cx="6" cy="18" r="1.7"/><circle cx="12" cy="18" r="1.7"/><circle cx="18" cy="18" r="1.7"/>',
  folder: '<path d="M3 6.2c0-.9.7-1.6 1.6-1.6h4.7l2 2.3h8.1c.9 0 1.6.7 1.6 1.6v9.7c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6z"/>',
  house: '<path d="m3.5 11 8.5-7 8.5 7M5.5 9.4V20h13V9.4M10 20v-5.5h4V20"/>',
  car: '<path d="M4 16.5V12l1.8-4.6c.3-.7.9-1.1 1.6-1.1h9.2c.7 0 1.3.4 1.6 1.1L20 12v4.5M3 12h18M4 16.5h16M6.5 19.5v-3M17.5 19.5v-3"/><circle cx="7.5" cy="14" r=".6" fill="currentColor"/><circle cx="16.5" cy="14" r=".6" fill="currentColor"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/><path d="M8.5 12.2h2l1-2 1.5 4 1-2h1.5"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M8.5 7.5V5.8c0-.7.6-1.3 1.3-1.3h4.4c.7 0 1.3.6 1.3 1.3v1.7M3 12.5h18"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 2.4 14.6 0 17M12 3.5c-2.4 2.4-2.4 14.6 0 17"/>',
  phone: '<rect x="7" y="2.8" width="10" height="18.4" rx="2"/><path d="M10.5 17.8h3"/>',
  shield: '<path d="M12 3 5 5.8v5.4c0 4.4 3 7.8 7 9.8 4-2 7-5.4 7-9.8V5.8z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  tag: '<path d="M3.5 12.2V4.8c0-.7.6-1.3 1.3-1.3h7.4l8.3 8.3c.5.5.5 1.3 0 1.8l-7.1 7.1c-.5.5-1.3.5-1.8 0z"/><circle cx="8" cy="8" r="1.4"/>',
  book: '<path d="M4 5.5c2.7-1.3 5.3-1.3 8 .3v14c-2.7-1.6-5.3-1.6-8-.3zM20 5.5c-2.7-1.3-5.3-1.3-8 .3v14c2.7-1.6 5.3-1.6 8-.3z"/>',
  licence: '<rect x="2.8" y="5.5" width="18.4" height="13" rx="2"/><circle cx="8.3" cy="10.8" r="2"/><path d="M5.4 15.6c.6-1.6 1.6-2.3 2.9-2.3s2.3.7 2.9 2.3M13.6 10h4.6M13.6 13.6h3.4"/>',
  taxid: '<path d="M6 2.8h8.5L19 7.3v13.9H6z"/><path d="M14.5 2.8v4.5H19M10.8 10.5l-.8 7M14.2 10.5l-.8 7M9 12.6h6.6M8.6 15.4h6.6"/>',
  wifi: '<path d="M2.5 9.4a14 14 0 0 1 19 0M5.6 12.7a9.4 9.4 0 0 1 12.8 0M8.7 16a4.8 4.8 0 0 1 6.6 0"/><circle cx="12" cy="19.2" r="1" fill="currentColor"/>',
  note: '<rect x="5" y="3.5" width="14" height="17.5" rx="1.8"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5"/>',
  document: '<path d="M3 6.2c0-.9.7-1.6 1.6-1.6h4.7l2 2.3h8.1c.9 0 1.6.7 1.6 1.6v9.7c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6z"/>',
  attach: '<path d="m20 11.3-8.1 8.1a5.1 5.1 0 0 1-7.2-7.2l8.4-8.4a3.4 3.4 0 0 1 4.8 4.8l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4l7.7-7.7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.6A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.6 6.6C4 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
  trash: '<path d="M4.5 7h15M10 11v5M14 11v5M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 19l1-12M9 7V4.8c0-.4.4-.8.8-.8h4.4c.4 0 .8.4.8.8V7"/>',
  heartPulse: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/><path d="M7.5 12.2h2.5l1.2-2.4 1.8 4.6 1.2-2.2h2.3"/>',
  all: '<rect x="3.5" y="8" width="17" height="12.5" rx="2"/><path d="M5.5 5.2h13M7.5 2.8h9"/>',
  fav: '<path d="m12 3.6 2.5 5.1 5.6.8-4 4 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-4 5.6-.8z"/>',
  recent: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 2"/>',
  expiring: '<path d="M10.3 4.2 2.9 17.4A2 2 0 0 0 4.6 20.4h14.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4.2"/><circle cx="12" cy="16.8" r=".9" fill="currentColor"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor"/>',
  arrange: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><path d="M17 13.5v7M13.5 17h7"/>'
};
// Filled "body" shapes behind the line art, for the richer two-tone look
const ICON_FILLS = {
  all: '<rect x="3.5" y="8" width="17" height="12.5" rx="2"/>',
  fav: '<path d="m12 3.6 2.5 5.1 5.6.8-4 4 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-4 5.6-.8z"/>',
  recent: '<circle cx="12" cy="12" r="8.5"/>',
  expiring: '<path d="M10.3 4.2 2.9 17.4A2 2 0 0 0 4.6 20.4h14.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z"/>',
  login: '<circle cx="8" cy="15" r="4"/>',
  email: '<rect x="3" y="5.5" width="18" height="13" rx="2"/>',
  passport: '<rect x="5" y="2.8" width="14" height="18.4" rx="1.6"/>',
  medicare: '<rect x="2.8" y="5.5" width="18.4" height="13" rx="2"/>',
  card: '<rect x="2.8" y="5.5" width="18.4" height="13" rx="2"/>',
  bank: '<path d="M3 9.2 12 4l9 5.2z"/><rect x="4.5" y="18.5" width="15" height="1.5"/>',
  rewards: '<rect x="5" y="12.5" width="14" height="7.5"/><rect x="3.5" y="8" width="17" height="4.5" rx="1"/>',
  licence: '<rect x="2.8" y="5.5" width="18.4" height="13" rx="2"/>',
  taxid: '<path d="M6 2.8h8.5L19 7.3v13.9H6z"/>',
  wifi: '<path d="M5.6 12.7a9.4 9.4 0 0 1 12.8 0L12 19.2z"/>',
  note: '<rect x="5" y="3.5" width="14" height="17.5" rx="1.8"/>',
  document: '<path d="M3 6.2c0-.9.7-1.6 1.6-1.6h4.7l2 2.3h8.1c.9 0 1.6.7 1.6 1.6v9.7c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6z"/>',
  folder: '<path d="M3 6.2c0-.9.7-1.6 1.6-1.6h4.7l2 2.3h8.1c.9 0 1.6.7 1.6 1.6v9.7c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6z"/>',
  more: '',
  house: '<path d="M5.5 9.4 12 4l6.5 5.4V20h-13z"/>',
  car: '<path d="M4 16.5V12l1.8-4.6c.3-.7.9-1.1 1.6-1.1h9.2c.7 0 1.3.4 1.6 1.1L20 12v4.5z"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12" rx="2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/>',
  phone: '<rect x="7" y="2.8" width="10" height="18.4" rx="2"/>',
  shield: '<path d="M12 3 5 5.8v5.4c0 4.4 3 7.8 7 9.8 4-2 7-5.4 7-9.8V5.8z"/>',
  tag: '<path d="M3.5 12.2V4.8c0-.7.6-1.3 1.3-1.3h7.4l8.3 8.3c.5.5.5 1.3 0 1.8l-7.1 7.1c-.5.5-1.3.5-1.8 0z"/>',
  book: '<path d="M4 5.5c2.7-1.3 5.3-1.3 8 .3v14c-2.7-1.6-5.3-1.6-8-.3zM20 5.5c-2.7-1.3-5.3-1.3-8 .3v14c2.7-1.6 5.3-1.6 8-.3z"/>'
};
// One shared gradient for every rich icon (colours follow the theme)
function ensureIconDefs() {
  if (document.getElementById('oy-defs')) return;
  const holder = document.createElement('div');
  holder.innerHTML = `<svg id="oy-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="oyStroke" gradientUnits="userSpaceOnUse" x1="3" y1="3" x2="21" y2="21">
      <stop offset="0" style="stop-color:var(--gold-hi)"/><stop offset="1" style="stop-color:var(--gold)"/></linearGradient>
    <linearGradient id="oyFill" gradientUnits="userSpaceOnUse" x1="4" y1="3" x2="20" y2="21">
      <stop offset="0" style="stop-color:var(--gold-hi);stop-opacity:.6"/><stop offset="1" style="stop-color:var(--gold);stop-opacity:.22"/></linearGradient>
    <linearGradient id="oyLogo" x1="0" y1="0" x2=".6" y2="1">
      <stop offset="0" style="stop-color:var(--gold-hi)"/><stop offset=".55" style="stop-color:var(--gold)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--gold) 78%, #000)"/></linearGradient>
    <linearGradient id="oyChip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc95"/><stop offset=".5" stop-color="#d7ad4e"/><stop offset="1" stop-color="#f3d488"/></linearGradient>
    <linearGradient id="oyLockStroke" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style="stop-color:var(--gold-hi)"/><stop offset="1" style="stop-color:var(--gold)"/></linearGradient>
    <linearGradient id="oyLockBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(--gold-hi)"/><stop offset=".55" style="stop-color:var(--gold)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--gold) 70%, #000)"/></linearGradient>
  </defs></svg>`;
  document.body.append(holder.firstChild);
}
function icon(name, cls = 'ico', rich = false) {
  const span = document.createElement('span');
  span.className = cls;
  span.setAttribute('aria-hidden', 'true');
  const lines = ICON_PATHS[name] || ICON_PATHS.note;
  if (rich) {
    ensureIconDefs();
    const fill = ICON_FILLS[name] || '';
    span.innerHTML = `<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">` +
      `<g fill="url(#oyFill)" stroke="none">${fill}</g>` +
      `<g fill="none" stroke="url(#oyStroke)" stroke-width="1.7">${lines}</g></svg>`;
  } else {
    span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${lines}</svg>`;
  }
  return span;
}

// ---------------- State ----------------
const state = {
  screen: 'welcome',
  account: null,         // { id, email, name } or { id: 'local' }
  file: null,            // encrypted vault file
  session: null,         // unlocked keys (memory only)
  data: null,            // decrypted { items, prefs }
  filter: 'all',
  query: '',
  itemId: null,
  draft: null,
  sync: 'idle',          // idle | saving | saved | pending | local | error
  recoveryKey: null,
  busy: ''
};
const app = document.getElementById('app');
const PREVIEW = !!window.OY_PREVIEW; // design preview: no downloads, no Google
const isDrive = () => state.account && state.account.id !== 'local' && state.account.id !== 'sample';

// ---------------- Tiny DOM helper (never uses innerHTML for user data) ----------------
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

// The OY! mark: solid O with a keyhole, Y and !, drawn in the theme's accent colours
function logoMark() {
  ensureIconDefs();
  const span = document.createElement('span');
  span.className = 'logo-mark';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="68 160 360 178"><g transform="translate(256 256) scale(.86) translate(-276 -256)">
    <circle cx="168" cy="256" r="106" fill="url(#oyLogo)"/>
    <g class="logo-key"><circle cx="168" cy="232" r="30" class="logo-hole"/><path d="M153 246 h30 l12 66 h-54z" class="logo-hole"/></g>
    <path d="M276 170 L336 256 L396 170 M336 256 V342" fill="none" stroke="url(#oyLogo)" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="434" y="170" width="36" height="120" rx="18" fill="url(#oyLogo)"/><circle cx="452" cy="326" r="20" fill="url(#oyLogo)"/>
  </g></svg>`;
  return span;
}
function logo(size = 'md') {
  return h('div', { class: `logo logo-${size}`, 'aria-label': 'OY! Only You' },
    logoMark(),
    size !== 'sm' && h('span', { class: 'logo-sub' },
      h('span', { class: 'sub-a' }, 'Only You'), h('span', { class: 'sub-b', 'aria-hidden': 'true' }, 'Can See')));
}

let toastTimer;
function toast(msg, kind = '') {
  let t = document.querySelector('.toast');
  if (!t) { t = h('div', { class: 'toast', role: 'status' }); document.body.append(t); }
  t.textContent = msg;
  t.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function modal(title, body, actions) {
  const close = () => wrap.remove();
  const wrap = h('div', { class: 'overlay', onclick: (e) => { if (e.target === wrap) close(); } },
    h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' },
      h('h2', {}, title), body,
      h('div', { class: 'sheet-actions' }, ...actions(close))));
  document.body.append(wrap);
  const first = wrap.querySelector('input'); if (first) first.focus();
  return close;
}

function confirmBox(title, text, okLabel = 'Confirm', danger = false) {
  return new Promise((resolve) => {
    modal(title, h('p', { class: 'muted' }, text), (close) => [
      h('button', { class: 'btn ghost', onclick: () => { close(); resolve(false); } }, 'Cancel'),
      h('button', { class: `btn ${danger ? 'danger' : 'gold'}`, onclick: () => { close(); resolve(true); } }, okLabel)
    ]);
  });
}

function passwordInput(attrs) {
  const input = h('input', { type: 'password', class: 'input', autocapitalize: 'off', spellcheck: 'false', ...attrs });
  const btn = h('button', { type: 'button', class: 'eye', 'aria-label': 'Show password', onclick: () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? 'Show' : 'Hide';
  } }, 'Show');
  return { input, el: h('div', { class: 'pw-wrap' }, input, btn) };
}

function strengthBar(input) {
  const labels = ['Very weak', 'Weak', 'Okay', 'Strong', 'Very strong'];
  const fill = h('div', { class: 'meter-fill' });
  const label = h('span', { class: 'meter-label' }, '');
  const update = () => {
    const s = C.strength(input.value);
    fill.style.width = input.value ? `${(s + 1) * 20}%` : '0';
    fill.dataset.level = s;
    label.textContent = input.value ? labels[s] : '';
  };
  input.addEventListener('input', update);
  return h('div', { class: 'meter' }, h('div', { class: 'meter-track' }, fill), label);
}

async function copy(text, what = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    buzz(12);
    toast(`${what} — clears in 30s`);
    setTimeout(() => { if (document.hasFocus()) navigator.clipboard.writeText('').catch(() => {}); }, 30000);
  } catch { toast('Could not copy on this device', 'err'); }
}

function download(name, text, type = 'application/json') {
  if (PREVIEW) return toast('Downloads work in the real app');
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------- Themes ----------------
// Each theme is three colours: accent, light accent, deep base. The rest is mixed from them.
const THEMES = {
  vault:    { name: 'Vault',    colours: null },                                  // navy & gold, follows light/dark
  gold:     { name: 'Gold',     colours: ['#C9A24A', '#E0BD68', '#3A2C0E'] },
  teal:     { name: 'Teal',     colours: ['#1AA3B2', '#4FD0DB', '#062B35'] },
  emerald:  { name: 'Emerald',  colours: ['#2FB872', '#6FDDA2', '#0A2A1C'] },
  rose:     { name: 'Rose',     colours: ['#D9748A', '#F0A6B6', '#2F1019'] },
  copper:   { name: 'Copper',   colours: ['#D07A45', '#EBA37A', '#2E170B'] },
  sapphire: { name: 'Sapphire', colours: ['#4C8DDB', '#8DB9EE', '#0B1E36'] },
  crimson:  { name: 'Crimson',  colours: ['#D9534A', '#EF8C84', '#2C0C0A'] },
  graphite: { name: 'Graphite', colours: ['#AEB8C6', '#D9E0E9', '#16191F'] }
};
const VAULT_SWATCH = ['#D9AD4B', '#F1CD78', '#08152B'];
function mix(a, b, t) {
  const p = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return '#' + [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}
const TOKENS = ['--bg', '--surface', '--surface-2', '--line', '--fg', '--muted', '--gold', '--gold-hi', '--on-gold'];
const VAULT_COLOURS = ['#D9AD4B', '#F1CD78', '#0F2140'];
function savedAppearance() { try { return localStorage.getItem('oy.appearance') || 'auto'; } catch { return 'auto'; } }
function isLight() {
  const a = savedAppearance();
  return a === 'light' || (a === 'auto' && matchMedia('(prefers-color-scheme: light)').matches);
}
function applyTheme(key) {
  const root = document.documentElement;
  const t = THEMES[key] || THEMES.vault;
  if (!t.colours && savedAppearance() === 'auto') {
    // Vault on Auto keeps the hand-tuned light and dark palettes from the stylesheet
    TOKENS.forEach((k) => root.style.removeProperty(k));
    root.style.removeProperty('color-scheme');
    delete root.dataset.oyTheme;
  } else {
    const [accent, hi, deep] = t.colours || VAULT_COLOURS;
    let set;
    if (isLight()) {
      const fg = mix(deep, '#000000', 0.25);
      set = {
        '--bg': mix(deep, '#ffffff', 0.93), '--surface': mix(deep, '#ffffff', 0.985), '--surface-2': mix(deep, '#ffffff', 0.89),
        '--line': mix(deep, '#ffffff', 0.78), '--fg': fg, '--muted': mix(fg, '#ffffff', 0.38),
        '--gold': mix(accent, '#000000', 0.2), '--gold-hi': accent, '--on-gold': '#ffffff'
      };
    } else {
      const fg = mix('#ffffff', hi, 0.08);
      set = {
        '--bg': mix(deep, '#000000', 0.38), '--surface': deep, '--surface-2': mix(deep, accent, 0.14),
        '--line': mix(deep, accent, 0.3), '--fg': fg, '--muted': mix(fg, deep, 0.4),
        '--gold': accent, '--gold-hi': hi, '--on-gold': mix(deep, '#000000', 0.35)
      };
    }
    Object.entries(set).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('color-scheme', isLight() ? 'light' : 'dark');
    root.dataset.oyTheme = key;
  }
  root.dataset.mode = isLight() ? 'light' : 'dark';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim() || '#08152b';
}
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (savedAppearance() === 'auto') applyTheme(savedTheme()); });
function setAppearance(a) {
  try { localStorage.setItem('oy.appearance', a); } catch {}
  applyTheme(savedTheme());
  if (state.data) { state.data.prefs.appearance = a; save(); }
}
function savedTheme() { try { return localStorage.getItem('oy.theme') || 'vault'; } catch { return 'vault'; } }
function chooseTheme(key) {
  try { localStorage.setItem('oy.theme', key); } catch {}
  applyTheme(key);
  if (state.data) { state.data.prefs.theme = key; save(); }
}

function today() { return new Date().toISOString().slice(0, 10); }
function uid() { return C.b64.from(C.randomBytes(9)).replace(/[+/=]/g, ''); }

// Gentle vibration on Android (iPhones ignore this)
function buzz(p = 8) { try { if (navigator.vibrate) navigator.vibrate(p); } catch {} }
// Tap ripples
document.addEventListener('pointerdown', (e) => {
  const t = e.target.closest('.home-tile, .row-main, .btn, .more-row, .dd-opt, .setting-row:not(.static), .fab, .big-lock');
  if (!t || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const host = t.classList.contains('home-tile') ? t.querySelector('.home-icon') : t;
  if (!host) return;
  const r = host.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 1.6;
  const rip = document.createElement('span');
  rip.className = 'ripple';
  rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.style.overflow = 'hidden';
  host.append(rip);
  setTimeout(() => rip.remove(), 600);
}, { passive: true });

// ---------------- Navigation ----------------
function go(screen, extra = {}) {
  document.querySelectorAll('.overlay').forEach((o) => o.remove());
  openSwipe = null;
  Object.assign(state, { screen }, extra);
  render();
  window.scrollTo(0, 0);
}

// Pages slide forward/back by how deep they sit
const DEPTH = { welcome: 0, create: 1, recovery: 2, unlock: 0, recover: 1, vault: 1, settings: 2, category: 2, item: 3, edit: 4 };
let lastScreen = null;
function render() {
  const view = VIEWS[state.screen] || VIEWS.welcome;
  document.body.classList.toggle('is-home', state.screen === 'vault' && !!state.data);
  const el = view();
  if (state.noAnim) state.noAnim = false;
  else if (lastScreen && lastScreen !== state.screen && el && el.classList) {
    const fwd = (DEPTH[state.screen] ?? 1) >= (DEPTH[lastScreen] ?? 1);
    el.classList.add(fwd ? 'enter-fwd' : 'enter-back');
  }
  lastScreen = state.screen;
  app.replaceChildren(el);
  if (state.busy) app.append(h('div', { class: 'busy' }, h('div', { class: 'spinner' }), h('p', {}, state.busy)));
}

async function withBusy(msg, fn) {
  state.busy = msg; render();
  try { return await fn(); }
  finally { state.busy = ''; render(); }
}

// ---------------- Saving & syncing ----------------
async function save() {
  if (state.account && state.account.id === 'sample') { await C.sealData(state.file, state.session, state.data); return; }
  await C.sealData(state.file, state.session, state.data);
  await S.local.put(state.account.id, state.file);
  if (!isDrive()) { state.sync = 'local'; return; }
  state.sync = 'saving'; updateSyncBadge();
  try {
    await S.driveSave(state.file, state.account.email);
    state.sync = 'saved';
    S.flushPendingAtts(state.account.id).catch((e) => console.warn(e));
  } catch (e) {
    console.warn(e);
    state.sync = e && e.code === 'reconnect' ? 'reconnect' : 'pending';
  }
  updateSyncBadge();
  const bar = document.querySelector('.sync-bar'); if (bar) bar.hidden = !(isDrive() && !S.hasToken());
}
async function persistKeysOnly() {
  if (state.account && state.account.id === 'sample') return;
  // after password / recovery changes (data unchanged)
  await S.local.put(state.account.id, state.file);
  if (isDrive()) { try { await S.driveSave(state.file, state.account.email); state.sync = 'saved'; } catch { state.sync = 'pending'; } }
}
window.addEventListener('online', () => { if (state.sync === 'pending' && state.session) save(); });

const SYNC_TEXT = { idle: '', saving: 'Saving…', saved: 'Synced to your Drive', pending: 'Saved on device · will sync', reconnect: 'Not synced · sign in again', local: 'This device only', sample: 'Sample data · not saved', error: 'Sync error' };
function syncBadge() {
  return h('span', { class: `sync sync-${state.sync}`, id: 'sync' }, SYNC_TEXT[state.sync] || '');
}
function updateSyncBadge() { const b = document.getElementById('sync'); if (b) b.replaceWith(syncBadge()); }

// ---------------- Lock / auto-lock ----------------
function lock(msg) {
  if (state.screen === 'edit') discardDraftFiles(state.draft);
  C.lockSession(state.session);
  Object.assign(state, { session: null, data: null, itemId: null, draft: null, query: '', arranging: null });
  document.querySelectorAll('.overlay').forEach((o) => o.remove());
  go('unlock');
  if (msg) toast(msg);
}
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  if (!state.session) return;
  const mins = (state.data && state.data.prefs && state.data.prefs.lockMinutes) || 5;
  idleTimer = setTimeout(() => lock('Locked after inactivity'), mins * 60000);
}
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((ev) => addEventListener(ev, resetIdle, { passive: true }));
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hiddenAt = Date.now();
  else if (state.session && hiddenAt) {
    const mins = (state.data.prefs && state.data.prefs.lockMinutes) || 5;
    if (Date.now() - hiddenAt > mins * 60000) lock('Locked while you were away');
  }
});

// ---------------- Account start-up ----------------
// ---------- Google Drive ----------
function startDrive(hint) {
  return S.signIn(hint, 'signin'); // goes to Google; we pick up again in boot()
}
/** Open a Google-linked vault: newest of Drive and this device's copy. */
async function openDrive(acc) {
  state.account = acc;
  S.rememberAccount(acc);
  let remote = null, reachable = false;
  await withBusy('Looking for your vault…', async () => {
    if (S.hasToken()) {
      try { remote = await S.driveLoad(acc.email); reachable = true; } catch (e) { console.warn(e); }
    }
    const cached = await S.local.get(acc.id);
    state.file = pickNewest(remote, cached);
    state.sync = !reachable ? 'pending' : (cached && (!remote || cached.updatedAt > remote.updatedAt)) ? 'pending' : 'saved';
  });
  if (state.file) return go('unlock');
  // Nothing in Drive yet: offer to move a vault that already lives on this device
  const here = await S.local.get('local');
  if (C.isVaultFile(here) && reachable) {
    const move = await confirmBox('Move your vault into Google Drive?',
      'OY! found a vault on this device. Unlock it with its master password and it will move into your Google Drive. Nothing is lost.', 'Move it');
    if (move) {
      Object.assign(state, { account: { id: 'local', name: 'This device' }, file: here, sync: 'local', pendingLink: acc });
      go('unlock'); toast('Unlock to finish moving your vault');
      return;
    }
  }
  if (!reachable) { toast('Could not reach Google Drive. Check your connection and try again.', 'err'); return go('welcome'); }
  go('create');
}
/** Move the unlocked device-only vault (and its photos) into this Google account. */
async function linkToDrive(acc) {
  state.pendingLink = null;
  let remote = null;
  try { remote = await withBusy('Checking your Google Drive…', () => S.driveLoad(acc.email)); }
  catch { return toast('Could not reach Google Drive. Your vault is still safe on this device.', 'err'); }
  if (remote && !(await confirmBox('Replace the vault in Google Drive?',
    'This Google account already has an OY! vault. Replace it with the vault on this device? The one in Drive will be overwritten.', 'Replace', true))) {
    return toast('Nothing changed. Your vault stays on this device.');
  }
  const from = state.account.id;
  let ok = true;
  await withBusy('Moving your vault to Google Drive…', async () => {
    for (const it of state.data.items) for (const att of it.files || []) {
      const box = await S.local.get(`${from}:att:${att.id}`);
      if (box) await S.attPut(acc.id, att.id, box, acc.email);
    }
    state.account = acc;
    S.rememberAccount(acc);
    await save();
    ok = state.sync === 'saved';
  });
  if (!ok) return toast('Moved, but the upload has not finished. It will retry automatically.', 'err');
  // Clean up the old device-only copy now that Drive has it
  for (const it of state.data.items) for (const att of it.files || []) await S.local.del(`${from}:att:${att.id}`).catch(() => {});
  await S.local.del(from).catch(() => {});
  try { const b = localStorage.getItem(`oy.bio.${from}`); if (b) { localStorage.setItem(`oy.bio.${acc.id}`, b); localStorage.removeItem(`oy.bio.${from}`); } } catch {}
  render();
  toast('Your vault is now synced to Google Drive');
}
function reconnectDrive() {
  return confirmBox('Reconnect Google Drive?', 'You’ll sign in with Google again, then unlock OY! to carry on. Nothing is lost.', 'Continue')
    .then((yes) => { if (yes) S.signIn(state.account.email, 'reconnect'); });
}
function pickNewest(a, b) {
  const ok = (x) => C.isVaultFile(x) ? x : null;
  a = ok(a); b = ok(b);
  if (a && b) return a.updatedAt >= b.updatedAt ? a : b;
  return a || b;
}
async function startLocal() {
  state.account = { id: 'local', name: 'This device' };
  S.rememberAccount(state.account);
  state.file = await S.local.get('local');
  state.sync = 'local';
  go(state.file && C.isVaultFile(state.file) ? 'unlock' : 'create');
}

function pickFile(accept = '.oyvault,.json,application/json') {
  return new Promise((resolve) => {
    const input = h('input', { type: 'file', accept, style: 'display:none', onchange: async () => {
      const f = input.files[0]; input.remove();
      if (!f) return resolve(null);
      try { resolve(JSON.parse(await f.text())); } catch { resolve('bad'); }
    } });
    document.body.append(input); input.click();
  });
}

async function restoreBackup({ replacingCurrent = false } = {}) {
  const file = await pickFile();
  if (!file) return;
  if (file === 'bad' || !C.isVaultFile(file)) return toast('That is not an OY! backup file', 'err');
  const pw = passwordInput({ placeholder: 'Master password for this backup', autocomplete: 'current-password' });
  modal('Restore backup', h('div', {},
    h('p', { class: 'muted' }, 'Enter the master password that was used when this backup was made.'),
    pw.el), (close) => [
    h('button', { class: 'btn ghost', onclick: close }, 'Cancel'),
    h('button', { class: 'btn gold', onclick: async () => {
      try {
        const res = await withBusy('Checking backup…', () => C.unlockWithPassword(file, pw.input.value));
        close();
        if (replacingCurrent && !(await confirmBox('Replace your vault?', 'Everything currently in your vault will be replaced by this backup. Export a backup first if you are unsure.', 'Replace', true))) return;
        if (!state.account) { state.account = { id: 'local', name: 'This device' }; S.rememberAccount(state.account); }
        if (state.session) C.lockSession(state.session);
        const attachments = file.attachments || {};
        delete file.attachments;
        Object.assign(state, { file, session: res.session, data: normaliseData(res.data) });
        await withBusy('Restoring…', async () => {
          for (const [id, box] of Object.entries(attachments)) {
            if (!box) continue;
            if (state.account.id === 'sample') memAtt.set(id, box); else await S.attPut(state.account.id, id, box, hint());
          }
          await save();
        });
        go('vault'); resetIdle(); toast('Backup restored');
      } catch { toast('Wrong password for that backup', 'err'); }
    } }, 'Restore')
  ]);
}

function normaliseData(d) {
  d = d && typeof d === 'object' ? d : {};
  d.items = Array.isArray(d.items) ? d.items : [];
  d.prefs = d.prefs || { lockMinutes: 5 };
  for (const it of d.items) {           // older 'ID document' items → new categories
    if (it.type === 'identity') {
      const kind = String(it.fields.docType || '').toLowerCase();
      it.type = kind.includes('passport') ? 'passport' : kind.includes('licen') ? 'licence' : kind.includes('medicare') ? 'medicare' : 'document';
      if (it.type === 'document') it.fields.kind = it.fields.docType;
      if (it.type === 'licence' && it.fields.country) it.fields.state = it.fields.country;
    }
    if (!TYPES[it.type] && !(d.prefs.custom || []).some((c) => c.id === it.type)) it.type = 'note';
    it.files = Array.isArray(it.files) ? it.files : [];
  }
  // Old versions changed fields for a whole category. Move those changes onto the items that use them,
  // so a field added for one item no longer shows on every other item.
  if (d.prefs.fields && typeof d.prefs.fields === 'object') {
    for (const [cat, list] of Object.entries(d.prefs.fields)) {
      const base = (TYPES[cat] || (d.prefs.custom || []).some((c) => c.id === cat) ? (TYPES[cat] ? TYPES[cat].fields : CUSTOM_FIELDS) : null);
      if (!base || !Array.isArray(list)) continue;
      const baseKeys = new Set(base.map(([k]) => k));
      for (const it of d.items) {
        if (it.type !== cat || Array.isArray(it.fieldList)) continue;
        const extras = list.filter(([k]) => !baseKeys.has(k) && String(it.fields[k] || '').trim());
        const kept = list.filter(([k]) => baseKeys.has(k));
        const missing = base.filter(([k]) => !kept.some(([x]) => x === k) && String(it.fields[k] || '').trim());
        const changed = extras.length || missing.length || kept.length !== base.length || kept.some(([k, l, kind = ''], i) => {
          const o = base.find(([x]) => x === k); return !o || o[1] !== l || (o[2] || '') !== (kind || '');
        });
        if (changed) it.fieldList = [...kept, ...missing, ...extras];
      }
    }
    delete d.prefs.fields;
  }
  return d;
}

// Sample vault for the design preview (kept in memory, never saved)
async function startSample() {
  const now = Date.now();
  const sd = new Date(now + 86400000 * 41);
  const soon = `${String(sd.getDate()).padStart(2, '0')}/${String(sd.getMonth() + 1).padStart(2, '0')}/${sd.getFullYear()}`;
  const sample = normaliseData({ items: [
    { id: 's1', type: 'login', title: 'Netflix', updated: now, fields: { url: 'netflix.com', username: 'sample.user@gmail.com', password: 'Tq8#vLm2-Rk9wPz!' } },
    { id: 's2', type: 'login', title: 'myGov', fav: true, updated: now, fields: { url: 'my.gov.au', username: 'sample.user', password: 'Mango-tree-river-1987!' } },
    { id: 's3', type: 'email', title: 'Personal Gmail', updated: now, fields: { address: 'sample.user@gmail.com', password: 'Mango-tree-river-1987!', provider: 'Gmail' } },
    { id: 's4', type: 'card', title: 'Everyday Visa', updated: now, fields: { holder: 'SAMPLE USER', number: '4111 1111 1111 1234', expiry: '08/29', cvv: '123' } },
    { id: 's5', type: 'bank', title: 'Savings account', updated: now, fields: { bank: 'Sample Bank', accountName: 'Sample User', bsb: '062-000', accountNumber: '12345678' } },
    { id: 's6', type: 'licence', title: 'NSW driver licence', updated: now, fields: { fullName: 'Sample User', number: '12345678', state: 'NSW', class: 'C', expiry: soon } },
    { id: 's12', type: 'card', title: 'Travel Mastercard', updated: now - 86400000 * 9, fields: { holder: 'SAMPLE USER', number: '5555 4444 3333 1111', expiry: '09/26' } },
    { id: 's13', type: 'login', title: 'Old forum', updated: now - 86400000 * 30, fields: { url: 'forum.example.com', username: 'sampleuser', password: 'password1' } },
    { id: 's7', type: 'passport', title: 'Australian passport', updated: now, fields: { fullName: 'Sample User', number: 'PA1234567', nationality: 'Australian', expiry: '14/06/2033' } },
    { id: 's8', type: 'medicare', title: 'Family Medicare', updated: now, fields: { number: '2123 45670 1', members: '1  Sample User\n2  Sample Child', validTo: '11/2030' } },
    { id: 's9', type: 'rewards', title: 'Flybuys', updated: now, fields: { program: 'Flybuys', memberNumber: '6014 3550 0000 0000' } },
    { id: 's10', type: 'taxid', title: 'My TFN', updated: now, fields: { name: 'Sample User', tfn: '123 456 782' } },
    { id: 's11', type: 'wifi', title: 'Home Wi‑Fi', updated: now, fields: { ssid: 'Home-5G', password: 'coconut-ladder-88' } }
  ] });
  const res = await withBusy('Building sample vault…', () => C.createVault('sample-password-123', sample));
  Object.assign(state, { account: { id: 'sample', name: 'Sample' }, file: res.file, session: res.session, data: sample, sync: 'sample' });
  go('vault'); resetIdle();
  toast('Sample data — nothing here is saved');
}

// ---------------- Views ----------------
const VIEWS = {};

VIEWS.welcome = () => {
  const remembered = S.rememberedAccount();
  const google = remembered && remembered.id !== 'local' ? remembered : null;
  return h('main', { class: 'center-screen welcome' },
    logo('lg'),
    h('div', { class: 'stack welcome-actions' },
      google && S.driveConfigured &&
        h('button', { class: 'btn gold big', onclick: () => (S.hasToken() ? openDrive(google) : startDrive(google.email)) }, `Continue as ${google.email}`),
      remembered && remembered.id === 'local' &&
        h('button', { class: 'btn gold big', onclick: startLocal }, 'Open my vault on this device'),
      S.driveConfigured &&
        h('button', { class: `btn ${remembered ? 'outline' : 'gold'} big`, onclick: () => startDrive() },
          h('span', { class: 'g' }, 'G'), google ? 'Use a different Google account' : 'Sign in with Google'),
      !S.driveConfigured && !PREVIEW && h('button', { class: 'btn gold big', onclick: startLocal }, 'Get started'),
      PREVIEW && h('button', { class: 'btn gold big', onclick: startSample }, 'Explore with sample data')),
    h('button', { class: 'btn link subtle welcome-restore', onclick: () => restoreBackup() }, 'Restore from a backup file'));
};
function isDriveText() { return S.driveConfigured ? 'Stored in your own Google Drive, not on our servers' : 'Stored only on your device'; }

VIEWS.create = () => {
  const pw = passwordInput({ placeholder: 'Create master password', autocomplete: 'new-password', id: 'pw1' });
  const pw2 = passwordInput({ placeholder: 'Type it again', autocomplete: 'new-password' });
  const agree = h('input', { type: 'checkbox', id: 'agree' });
  const submit = async (e) => {
    e.preventDefault();
    const a = pw.input.value, b = pw2.input.value;
    if (a.length < 10) return toast('Use at least 10 characters', 'err');
    if (C.strength(a) < 2) return toast('Make it stronger — try a short sentence', 'err');
    if (a !== b) return toast('The two passwords do not match', 'err');
    if (!agree.checked) return toast('Please tick the box to confirm', 'err');
    const res = await withBusy('Creating your encrypted vault…', () => C.createVault(a, normaliseData({})));
    Object.assign(state, { file: res.file, session: res.session, data: normaliseData({}), recoveryKey: res.recoveryKey });
    await withBusy('Saving…', save);
    go('recovery');
  };
  return h('main', { class: 'center-screen' },
    logo(),
    h('h1', {}, 'Create your master password'),
    h('p', { class: 'muted' }, 'This is the one password you need to remember. It is never stored or sent anywhere.'),
    h('form', { class: 'stack', onsubmit: submit },
      pw.el, strengthBar(pw.input), pw2.el,
      h('div', { class: 'tip' }, 'Tip: a short sentence is strong and easy to remember, e.g. “Mango-tree-by-the-river-1987!”'),
      h('label', { class: 'check' }, agree, h('span', {}, 'I understand that if I forget it, only my recovery key can get me back in.')),
      h('button', { class: 'btn gold big', type: 'submit' }, 'Create vault')),
    h('button', { class: 'btn link', onclick: () => go('welcome') }, 'Back'));
};

VIEWS.recovery = () => {
  const rk = state.recoveryKey;
  const saved = h('input', { type: 'checkbox' });
  return h('main', { class: 'center-screen' },
    h('div', { class: 'badge-gold' }, 'Save this now'),
    h('h1', {}, 'Your recovery key'),
    h('p', { class: 'muted' }, 'If you ever forget your master password, this key is the only way back in. It will not be shown again.'),
    h('div', { class: 'rk' }, rk),
    h('div', { class: 'row' },
      h('button', { class: 'btn outline', onclick: () => copy(rk, 'Recovery key copied') }, 'Copy'),
      h('button', { class: 'btn outline', onclick: () => download(`OY-recovery-key-${today()}.txt`,
        `OY! (Only You) recovery key\nCreated: ${today()}\nAccount: ${state.account.email || 'this device'}\n\n${rk}\n\nKeep this somewhere safe and private (printed in a drawer, or another password manager).\n`, 'text/plain') }, 'Download'),
      !PREVIEW && h('button', { class: 'btn outline', onclick: () => window.print() }, 'Print')),
    h('p', { class: 'note' }, 'Best: print it or write it down and keep it at home. Do not store it in the same place as your vault.'),
    h('label', { class: 'check' }, saved, h('span', {}, 'I have saved my recovery key somewhere safe')),
    h('button', { class: 'btn gold big', onclick: () => {
      if (!saved.checked) return toast('Please save it first, then tick the box', 'err');
      state.recoveryKey = null; go('vault'); resetIdle();
    } }, 'Open my vault'));
};

// ---------- Face ID / fingerprint ----------
const bioKey = () => `oy.bio.${state.account && state.account.id}`;
function bioRecord() { try { return JSON.parse(localStorage.getItem(bioKey())); } catch { return null; } }
function bioSupported() {
  return !PREVIEW && window.PublicKeyCredential && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
}
async function bioEnable() {
  if (!bioSupported() || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) {
    throw new Error('Face ID or fingerprint is not available on this device');
  }
  const salt = C.randomBytes(32);
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: C.randomBytes(32),
    rp: { name: 'OY! Only You' },
    user: { id: C.randomBytes(16), name: state.account.email || 'OY! vault', displayName: 'OY! vault' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
    extensions: { prf: { eval: { first: salt } } }
  } });
  const ext = cred.getClientExtensionResults();
  if (!ext.prf || ext.prf.enabled === false) throw new Error('This browser cannot use Face ID to unlock yet. Keep using your master password.');
  let secret = ext.prf.results && ext.prf.results.first;
  if (!secret) secret = await bioSecret({ id: C.b64.from(new Uint8Array(cred.rawId)), salt: C.b64.from(salt) });
  const box = await C.wrapForDevice(new Uint8Array(secret), state.session);
  localStorage.setItem(bioKey(), JSON.stringify({ id: C.b64.from(new Uint8Array(cred.rawId)), salt: C.b64.from(salt), box }));
}
async function bioSecret(rec) {
  const assertion = await navigator.credentials.get({ publicKey: {
    challenge: C.randomBytes(32),
    allowCredentials: [{ type: 'public-key', id: C.b64.to(rec.id) }],
    userVerification: 'required',
    extensions: { prf: { eval: { first: C.b64.to(rec.salt) } } }
  } });
  const r = assertion.getClientExtensionResults();
  if (!r.prf || !r.prf.results || !r.prf.results.first) throw new Error('Face ID did not return a key');
  return new Uint8Array(r.prf.results.first);
}
function bioDisable() { try { localStorage.removeItem(bioKey()); } catch {} }

// Shared finish for every way of unlocking: open the padlock, swap "Only You" → "Can See", then go in
async function unlockSuccess(res) {
  Object.assign(state, { session: res.session, data: normaliseData(res.data) });
  if (state.data.prefs.icons && state.data.prefs.icons !== savedIconStyle()) { try { localStorage.setItem('oy.icons', state.data.prefs.icons); } catch {} applyIconStyle(state.data.prefs.icons); }
  if (state.data.prefs.appearance && state.data.prefs.appearance !== savedAppearance()) { try { localStorage.setItem('oy.appearance', state.data.prefs.appearance); } catch {} applyTheme(savedTheme()); }
  if (state.data.prefs.theme && state.data.prefs.theme !== savedTheme()) { try { localStorage.setItem('oy.theme', state.data.prefs.theme); } catch {} applyTheme(state.data.prefs.theme); }
  const screen = document.querySelector('.unlock-screen');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (screen && !reduce) {
    screen.classList.add('opening');                 // dial spins the combination, "Only You" → "Can See"
    buzz(8); setTimeout(() => buzz(8), 330); setTimeout(() => buzz(8), 560); setTimeout(() => buzz([6, 40, 18]), 820);
    await new Promise((r) => setTimeout(r, 1000));
    const panel = liftPanel();                       // freeze the lock screen…
    state.noAnim = true; go('vault');                // …build the vault behind it…
    document.querySelector('.home-grid')?.classList.add('settle');
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('up'))); // …and lift it away
    setTimeout(() => panel.remove(), 800);
  } else {
    if (screen) { screen.classList.add('opening'); await new Promise((r) => setTimeout(r, 400)); }
    go('vault');
  }
  resetIdle();
  if (state.pendingLink) return linkToDrive(state.pendingLink);
  if (isDrive() && S.hasToken() && state.sync !== 'saved') save();
}

// The lock screen as a single panel that lifts away, revealing the vault built behind it
function liftPanel() {
  const bg = document.querySelector('.glow-backdrop');
  const banner = document.querySelector('.preview-banner');
  const inner = h('div', { class: 'lift-inner' });
  if (bg && getComputedStyle(bg).display !== 'none') { const b = bg.cloneNode(true); b.classList.add('door-bg'); inner.append(b); }
  if (banner) inner.append(banner.cloneNode(true));
  const a = app.cloneNode(true); a.removeAttribute('id'); a.className = 'door-app';
  a.querySelectorAll('.intro').forEach((el) => el.classList.remove('intro'));
  a.querySelectorAll('[id]').forEach((el) => { if (!el.closest('svg')) el.removeAttribute('id'); }); // keep SVG gradients
  inner.append(a);
  const panel = h('div', { class: 'lift', 'aria-hidden': 'true' }, inner, h('span', { class: 'lift-edge' }));
  document.body.append(panel);
  return panel;
}

// Safe combination dial: fixed knurled rim + pointer, a numbered face that spins, a centre knob with a grip
function safeDialSvg() {
  let ticks = '', nums = '', knurl = '';
  for (let i = 0; i < 100; i++) {
    const a = (i / 100) * 360, major = i % 10 === 0, mid = i % 5 === 0;
    const r1 = major ? 62 : mid ? 66 : 69;
    ticks += `<line x1="100" y1="${100 - 74}" x2="100" y2="${100 - r1}" transform="rotate(${a} 100 100)" class="${major ? 'dt-major' : 'dt'}"/>`;
    if (major) nums += `<text x="100" y="${100 - 50}" transform="rotate(${a} 100 100)" class="dn">${i}</text>`;
  }
  for (let i = 0; i < 72; i++) knurl += `<rect x="98.6" y="3" width="2.8" height="9" rx="1.2" transform="rotate(${i * 5} 100 100)"/>`;
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <radialGradient id="dFace" cx=".42" cy=".35" r=".75"><stop offset="0" style="stop-color:var(--gold-hi)"/><stop offset=".6" style="stop-color:var(--gold)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--gold) 65%, #000)"/></radialGradient>
      <radialGradient id="dKnob" cx=".4" cy=".32" r=".8"><stop offset="0" style="stop-color:var(--gold-hi)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--gold) 55%, #000)"/></radialGradient>
      <linearGradient id="dRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--gold) 70%, #fff)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--gold) 45%, #000)"/></linearGradient>
    </defs>
    <circle cx="100" cy="100" r="97" fill="url(#dRim)"/>
    <g class="d-knurl" fill="color-mix(in srgb, var(--gold) 40%, #000)" opacity=".55">${knurl}</g>
    <circle cx="100" cy="100" r="86" fill="color-mix(in srgb, var(--gold) 35%, #000)"/>
    <g class="d-face">
      <circle cx="100" cy="100" r="82" fill="url(#dFace)"/>
      <g class="d-ticks">${ticks}</g>
      <g class="d-nums">${nums}</g>
      <circle cx="100" cy="100" r="36" fill="url(#dKnob)" stroke="color-mix(in srgb, var(--gold) 50%, #000)" stroke-width="1.5"/>
      <rect x="68" y="93" width="64" height="14" rx="7" fill="url(#dFace)" stroke="color-mix(in srgb, var(--gold) 45%, #000)" stroke-width="1.5"/>
      <circle cx="100" cy="100" r="5" fill="color-mix(in srgb, var(--gold) 45%, #000)"/>
    </g>
    <path class="d-pointer" d="M100 14 l-7 -11 h14 z"/>
  </svg>`;
}

// The unlock button: a safe combination dial
function bigLock() {
  ensureIconDefs();
  const wrap = document.createElement('span');
  wrap.className = 'big-lock-art dial-art';
  wrap.innerHTML = safeDialSvg();
  return wrap;
}

VIEWS.unlock = () => {
  const who = isDrive() ? state.account.email : state.account && state.account.id === 'sample' ? 'Sample vault' : 'This device';
  const rec = bioRecord();
  const pw = passwordInput({ placeholder: 'Master password', autocomplete: 'current-password', id: 'unlock-pw' });
  const panel = h('form', { class: 'unlock-panel', hidden: true, onsubmit: async (e) => {
    e.preventDefault();
    let res;
    try { res = await withBusyKeep('Unlocking…', () => C.unlockWithPassword(state.file, pw.input.value)); }
    catch { toast('Wrong master password', 'err'); pw.input.select(); lockBtn.classList.add('shake'); setTimeout(() => lockBtn.classList.remove('shake'), 500); return; }
    panel.hidden = true; await unlockSuccess(res);
  } }, pw.el, h('button', { class: 'btn gold big', type: 'submit' }, 'Unlock'));
  const showPassword = () => { panel.hidden = false; hint.textContent = 'Enter your master password'; setTimeout(() => pw.input.focus(), 30); };
  const hint = h('p', { class: 'lock-hint' }, rec ? 'Tap to unlock with Face ID' : 'Tap to unlock');
  const lockBtn = h('button', { class: 'big-lock', 'aria-label': 'Unlock', onclick: async () => {
    if (document.querySelector('.unlock-screen.opening')) return;
    if (rec && bioSupported()) {
      try {
        const secret = await bioSecret(rec);
        const res = await C.unlockWithDeviceSecret(state.file, secret, rec.box);
        return unlockSuccess(res);
      } catch (e) {
        if (e && e.name !== 'NotAllowedError') toast('Face ID did not work — use your password', 'err');
      }
    }
    showPassword();
  } }, bigLock());
  const intro = !state.introShown && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  state.introShown = true;
  return h('main', { class: `unlock-screen ${intro ? 'intro' : ''}` },
    h('div', { class: 'unlock-top' }, logo('lg')),
    h('div', { class: 'unlock-mid' }, lockBtn, hint, panel),
    h('div', { class: 'unlock-foot' },
      h('p', { class: 'who' }, who),
      h('button', { class: 'btn link', onclick: () => go('recover') }, 'Forgot master password?'),
      h('button', { class: 'btn link subtle', onclick: () => { S.signOut(); S.rememberAccount(null); Object.assign(state, { account: null, file: null }); go('welcome'); } }, 'Switch account')));
};

VIEWS.recover = () => {
  const rk = h('input', { class: 'input mono', placeholder: 'XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX', autocapitalize: 'characters', autocomplete: 'off', spellcheck: 'false' });
  const pw = passwordInput({ placeholder: 'New master password', autocomplete: 'new-password' });
  const pw2 = passwordInput({ placeholder: 'Type it again', autocomplete: 'new-password' });
  const submit = async (e) => {
    e.preventDefault();
    if (pw.input.value.length < 10 || C.strength(pw.input.value) < 2) return toast('Choose a stronger password (10+ characters)', 'err');
    if (pw.input.value !== pw2.input.value) return toast('The two passwords do not match', 'err');
    try {
      const res = await withBusy('Checking recovery key…', () => C.unlockWithRecovery(state.file, rk.value));
      await withBusy('Setting new password…', () => C.changePassword(state.file, res.session, pw.input.value));
      Object.assign(state, { session: res.session, data: normaliseData(res.data) });
      await withBusy('Saving…', persistKeysOnly);
      go('vault'); resetIdle(); toast('New master password set');
    } catch { toast('That recovery key is not right', 'err'); }
  };
  return h('main', { class: 'center-screen' },
    logo(),
    h('h1', {}, 'Recover your vault'),
    h('p', { class: 'muted' }, 'Enter the recovery key you saved when you created your vault, then choose a new master password.'),
    h('form', { class: 'stack', onsubmit: submit }, rk, pw.el, strengthBar(pw.input), pw2.el,
      h('button', { class: 'btn gold big', type: 'submit' }, 'Recover')),
    h('button', { class: 'btn link', onclick: () => go('unlock') }, 'Back'));
};

function topBar(title, left, right) {
  return h('header', { class: 'topbar' },
    h('div', { class: 'topbar-left' }, left),
    h('div', { class: 'topbar-title' }, title),
    h('div', { class: 'topbar-right' }, right));
}
function iconBtn(name, label, onclick) {
  return h('button', { class: 'icon-btn', 'aria-label': label, title: label, onclick }, icon(name));
}

function itemSubtitle(it) {
  const f = it.fields || {};
  if (typeDef(it.type).files && it.mode === 'files') {
    const n = (it.files || []).length;
    return n ? `${n} file${n > 1 ? 's' : ''}` : 'No files yet';
  }
  const last4 = (v) => v ? `•••• ${String(v).replace(/\s/g, '').slice(-4)}` : '';
  switch (it.type) {
    case 'login': return f.username || f.url || '';
    case 'email': return f.address || f.provider || '';
    case 'card': return last4(f.number) || f.holder || '';
    case 'bank': return [f.bank, f.bsb].filter(Boolean).join(' · ');
    case 'rewards': return f.program || f.memberNumber || '';
    case 'passport': return [f.fullName, f.expiry && `expires ${f.expiry}`].filter(Boolean).join(' · ');
    case 'licence': return [f.state, f.expiry && `expires ${f.expiry}`].filter(Boolean).join(' · ');
    case 'medicare': return f.validTo ? `valid to ${f.validTo}` : last4(f.number);
    case 'taxid': return f.abn ? `ABN ${f.abn}` : f.name || '';
    case 'wifi': return f.ssid || '';
    case 'document': return f.kind || '';
    default: return '';
  }
}

// ---------- Attachments ----------
const memAtt = new Map(); // sample vault keeps files in memory only
const hint = () => (isDrive() ? state.account.email : null);
async function attSave(id, bytes) {
  const box = await C.encryptBytes(state.session, bytes);
  if (state.account.id === 'sample') return memAtt.set(id, box);
  await S.attPut(state.account.id, id, box, hint());
}
async function attLoad(id) {
  const box = state.account.id === 'sample' ? memAtt.get(id) : await S.attGet(state.account.id, id, hint());
  if (!box) throw new Error('File not found');
  return C.decryptBytes(state.session, box);
}
async function attRemove(id) {
  if (state.account.id === 'sample') return memAtt.delete(id);
  await S.attDel(state.account.id, id, hint());
}

// Shrink big phone photos so they are quick to sync (keeps them sharp enough to read)
async function prepareFile(file) {
  const MAX_BYTES = 15 * 1024 * 1024;
  if (file.type === 'application/pdf' || !file.type.startsWith('image/') || file.type === 'image/gif') {
    if (file.size > MAX_BYTES) throw new Error('That file is over 15 MB');
    return { bytes: new Uint8Array(await file.arrayBuffer()), type: file.type || 'application/octet-stream', name: file.name };
  }
  const img = await createImageBitmap(file).catch(() => null);
  if (!img) return { bytes: new Uint8Array(await file.arrayBuffer()), type: file.type, name: file.name };
  const scale = Math.min(1, 2400 / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.88));
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: 'image/jpeg', name: file.name.replace(/\.\w+$/, '') + '.jpg' };
}

function pickUploads() {
  return new Promise((resolve) => {
    const input = h('input', { type: 'file', accept: 'image/*,application/pdf', multiple: true, style: 'display:none',
      onchange: () => { resolve([...input.files]); input.remove(); } });
    document.body.append(input); input.click();
  });
}

async function addFiles(it) {
  const files = await pickUploads();
  if (!files.length) return;
  try {
    await withBusy('Encrypting and saving…', async () => {
      it.files = it.files || [];
      for (const f of files) {
        const prep = await prepareFile(f);
        const att = { id: uid(), name: prep.name, type: prep.type, size: prep.bytes.length, added: Date.now() };
        await attSave(att.id, prep.bytes);
        it.files.push(att);
      }
      it.updated = Date.now();
      await save();
    });
    toast(files.length > 1 ? `${files.length} files added` : 'File added');
  } catch (e) { toast(e.message || 'Could not add that file', 'err'); }
}

async function openAttachment(it, att) {
  let bytes;
  try { bytes = await withBusy('Opening…', () => attLoad(att.id)); }
  catch { return toast('Could not open that file', 'err'); }
  const blob = new Blob([bytes], { type: att.type });
  const url = URL.createObjectURL(blob);
  const isImg = att.type.startsWith('image/');
  const isPdf = att.type === 'application/pdf';
  const file = new File([blob], att.name, { type: att.type });

  const shareIt = async () => {
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: it.title }); return; }
    } catch (e) { if (e.name === 'AbortError') return; }
    toast('Sharing is not available here — use Save instead', 'err');
  };
  const copyIt = async () => {
    try {
      let png = blob;
      if (att.type !== 'image/png') {
        const bmp = await createImageBitmap(blob);
        const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
        c.getContext('2d').drawImage(bmp, 0, 0);
        png = await new Promise((r) => c.toBlob(r, 'image/png'));
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
      toast('Image copied');
    } catch { toast('Copy is not available here — use Share', 'err'); }
  };
  const saveIt = () => {
    if (PREVIEW) return toast('Saving files works in the real app');
    const a = h('a', { href: url, download: att.name }); document.body.append(a); a.click(); a.remove();
  };
  const removeIt = async (close) => {
    if (!(await confirmBox('Delete this file?', `“${att.name}” will be removed from ${it.title}.`, 'Delete', true))) return;
    close();
    it.files = it.files.filter((x) => x.id !== att.id);
    await withBusy('Deleting…', async () => { await attRemove(att.id); await save(); });
    render(); toast('File deleted');
  };

  const preview = isImg
    ? h('img', { class: 'att-full', src: url, alt: att.name })
    : h('div', { class: 'att-pdf' }, icon('document', 'ico ico-xl'), h('p', {}, att.name),
        isPdf && !PREVIEW && h('a', { class: 'btn outline', href: url, target: '_blank', rel: 'noopener' }, 'Open PDF'));
  const closeAll = modal(att.name, preview, (close) => [
    h('button', { class: 'btn danger-outline slim', onclick: () => removeIt(close) }, 'Delete'),
    isImg && h('button', { class: 'btn outline', onclick: copyIt }, 'Copy'),
    h('button', { class: 'btn outline', onclick: saveIt }, 'Save'),
    h('button', { class: 'btn gold', onclick: shareIt }, 'Share'),
    h('button', { class: 'btn ghost', onclick: () => { close(); URL.revokeObjectURL(url); } }, 'Close')
  ]);
  void closeAll;
}

function thumbTile(att, onclick) {
  const tile = h('button', { type: 'button', class: 'att-tile', 'aria-label': `Open ${att.name}`, onclick },
    att.type.startsWith('image/') ? h('span', { class: 'att-thumb loading' }) : h('span', { class: 'att-thumb pdf' }, icon('document'), 'PDF'));
  if (att.type.startsWith('image/')) {
    attLoad(att.id).then((bytes) => {
      const url = URL.createObjectURL(new Blob([bytes], { type: att.type }));
      const span = tile.querySelector('.att-thumb');
      span.classList.remove('loading');
      span.style.backgroundImage = `url("${url}")`;
    }).catch(() => {});
  }
  return tile;
}

// Upload area inside the add/edit form: files are encrypted as you add them,
// but only become part of the item when you tap Save (Cancel removes them).
function draftAttachments(d) {
  d.files = d.files || []; d._added = d._added || []; d._removed = d._removed || [];
  const box = h('section', { class: 'card att-card' });
  const draw = () => {
    const tiles = d.files.map((att) => h('div', { class: 'att-wrap' },
      thumbTile(att, () => {}),
      h('button', { type: 'button', class: 'att-x', 'aria-label': `Remove ${att.name}`, onclick: async () => {
        d.files = d.files.filter((x) => x.id !== att.id);
        if (d._added.includes(att.id)) { d._added = d._added.filter((x) => x !== att.id); attRemove(att.id).catch(() => {}); }
        else d._removed.push(att.id);
        draw();
      } }, '×')));
    const add = async () => {
      const files = await pickUploads();
      if (!files.length) return;
      try {
        await withBusyKeep('Encrypting…', async () => {
          for (const f of files) {
            const prep = await prepareFile(f);
            const att = { id: uid(), name: prep.name, type: prep.type, size: prep.bytes.length, added: Date.now() };
            await attSave(att.id, prep.bytes);
            d.files.push(att); d._added.push(att.id);
          }
        });
        draw();
      } catch (e) { toast(e.message || 'Could not add that file', 'err'); }
    };
    box.replaceChildren(
      h('div', { class: 'att-head' }, h('span', { class: 'field-label' }, 'Photos & PDFs'),
        h('button', { type: 'button', class: 'mini', onclick: add }, icon('attach', 'ico ico-sm'), 'Upload')),
      d.files.length
        ? h('div', { class: 'att-grid' }, tiles)
        : h('button', { type: 'button', class: 'att-empty', onclick: add }, 'Upload a photo of the front and back, or a PDF scan'));
  };
  draw();
  return box;
}
// busy overlay without re-rendering the form (keeps what you typed)
async function withBusyKeep(msg, fn) {
  const o = h('div', { class: 'busy' }, h('div', { class: 'spinner' }), h('p', {}, msg));
  document.body.append(o);
  try { return await fn(); } finally { o.remove(); }
}
async function discardDraftFiles(d) {
  if (!d) return;
  for (const id of d._added || []) await attRemove(id).catch(() => {});
}

function attachmentsBlock(it) {
  const files = it.files || [];
  const thumbs = files.map((att) => thumbTile(att, () => openAttachment(it, att)));
  return h('section', { class: 'card att-card' },
    h('div', { class: 'att-head' }, h('span', { class: 'field-label' }, 'Photos & PDFs'),
      h('button', { class: 'mini', onclick: () => addFiles(it) }, icon('attach', 'ico ico-sm'), 'Add')),
    files.length
      ? h('div', { class: 'att-grid' }, thumbs)
      : h('button', { class: 'att-empty', onclick: () => addFiles(it) }, 'Add a photo of the front and back, or a PDF scan'));
}

// Details / Documents-only switch for passports, licences, Medicare, other documents
function modeToggle(current, onChange) {
  const opt = (val, label) => h('button', { type: 'button', role: 'radio', 'aria-checked': String(current === val),
    class: `seg-opt ${current === val ? 'on' : ''}`, onclick: () => { if (current !== val) onChange(val); } }, label);
  return h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'What to keep' }, opt('details', 'Enter details'), opt('files', 'Documents'));
}

// ---------- Home: icon grid with small labels, rearrangeable ----------
const SHORT = { login: 'Logins', email: 'Email', passport: 'Passports', medicare: 'Medicare', card: 'Cards', bank: 'Bank',
  rewards: 'Rewards', licence: 'Licences', taxid: 'Tax IDs', wifi: 'Wi‑Fi', note: 'Notes', document: 'Documents', more: 'More' };

function homeOrder() {
  const saved = (state.data.prefs.order || []).filter((k) => HOME_KEYS.includes(k));
  const missing = HOME_KEYS.filter((k) => !saved.includes(k));
  return [...missing.filter((k) => SPECIAL[k] && k !== 'expiring'), ...saved, ...missing.filter((k) => !SPECIAL[k])];
}

VIEWS.vault = () => {
  const counts = {};
  state.data.items.forEach((it) => {
    const key = HOME_KEYS.includes(it.type) ? it.type : 'more';
    counts[key] = (counts[key] || 0) + 1;
  });
  counts.all = state.data.items.length;
  counts.fav = state.data.items.filter((it) => it.fav).length;
  const arranging = !!state.arranging;
  const listView = homeView() === 'list';
  let order = arranging ? state.arranging : homeOrder();

  const tile = (k, n) => {
    let pressTimer;
    const el = h('button', {
      class: `home-tile ${counts[k] ? 'has' : ''} ${arranging ? 'wiggle' : ''}`, 'data-key': k, style: `--n:${n || 0}`,
      'aria-label': `${k === 'more' ? 'More' : SPECIAL[k] || TYPES[k].label}${counts[k] ? `, ${counts[k]} saved` : ''}`,
      onclick: () => {
        if (!state.arranging && !el.dataset.longpressed) { if (k === 'more') openMore(); else go('category', { category: k, from: null, query: '' }); }
        delete el.dataset.longpressed;
      },
      onpointerdown: (e) => {
        if (state.arranging) return startDrag(e, el);
        pressTimer = setTimeout(() => { el.dataset.longpressed = '1'; startArrange(); }, 550);
      },
      onpointerup: () => clearTimeout(pressTimer),
      onpointerleave: () => clearTimeout(pressTimer),
      oncontextmenu: (e) => e.preventDefault()
    }, h('span', { class: 'home-icon', style: `--c:${COLOURS[k]}` }, catIcon(k, 'ico ico-home', { onTile: true }),
        counts[k] ? h('span', { class: 'home-badge' }, counts[k] > 99 ? '99+' : counts[k]) : null),
      h('span', { class: 'home-label' }, k === 'more' ? 'More' : SPECIAL[k] || (listView ? TYPES[k].label : SHORT[k])),
      h('span', { class: 'home-count' }, counts[k] || ''), h('span', { class: 'home-chev' }, '›'));
    return el;
  };
  const grid = h('nav', { class: `home-grid ${listView ? 'as-list' : ''} ${arranging ? 'arranging' : ''}`, 'aria-label': 'Vault',
    onpointerdown: (e) => { if (!state.arranging) pull.start(e); },
    style: `--rows:${listView ? order.length : Math.ceil(order.length / 3)}` }, order.map(tile));

  // drag to reorder: tiles swap places as your finger passes over them
  function startDrag(e, el) {
    e.preventDefault();
    el.classList.add('dragging');
    const move = (ev) => {
      const over = document.elementFromPoint(ev.clientX, ev.clientY);
      const target = over && over.closest('.home-tile');
      if (!target || target === el) return;
      const from = order.indexOf(el.dataset.key), to = order.indexOf(target.dataset.key);
      order.splice(from, 1); order.splice(to, 0, el.dataset.key);
      if (from < to) target.after(el); else target.before(el);
    };
    const up = () => {
      el.classList.remove('dragging');
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      state.arranging = order;
    };
    // listen on the window: moving the tile in the page would drop a pointer capture
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }

  const right = arranging
    ? h('button', { class: 'icon-btn text', onclick: finishArrange }, 'Done')
    : h('span', { class: 'topbar-group' },
        iconBtn(listView ? 'grid' : 'list', listView ? 'Show as icons' : 'Show as list', () => setHomeView(listView ? 'icons' : 'list')),
        iconBtn('lock', 'Lock', () => lock('Locked')));
  const left = arranging
    ? h('button', { class: 'icon-btn text muted-btn', onclick: () => { state.arranging = null; render(); } }, 'Cancel')
    : iconBtn('settings', 'Settings', () => go('settings'));
  return h('div', { class: 'screen home' },
    topBar(arranging ? 'Drag to rearrange' : logo('sm'), left, right),
    !arranging && h('div', { class: `pull-hint ${(() => { try { return localStorage.getItem('oy.pulled') ? '' : 'first'; } catch { return ''; } })()}`, 'aria-hidden': 'true' }, icon('search', 'ico'), h('span', { class: 'ph-a' }, 'Pull down to search'), h('span', { class: 'ph-b' }, 'Let go to search')),
    !arranging && homeHeader(),
    !arranging && h('button', { class: 'sync-bar', hidden: !(isDrive() && !S.hasToken()), onclick: reconnectDrive },
      icon('recent', 'ico'), h('span', {}, 'Sync paused — tap to reconnect Google Drive')),
    grid,
    arranging && h('button', { class: 'btn link subtle reset-order', onclick: () => { state.arranging = [...HOME_KEYS]; render(); } }, 'Reset to original order'));
};
function homeView() {
  if (state.data && state.data.prefs.homeView) return state.data.prefs.homeView;
  try { return localStorage.getItem('oy.homeView') || 'icons'; } catch { return 'icons'; }
}
function setHomeView(v) {
  try { localStorage.setItem('oy.homeView', v); } catch {}
  state.data.prefs.homeView = v; render(); save();
}
// Pull the home screen down to search
const pull = {
  y0: null, x0: 0, dy: 0,
  start(e) { this.y0 = e.clientY; this.x0 = e.clientX; this.dy = 0;
    const mv = (ev) => this.move(ev), up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); this.end(); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up); },
  move(e) {
    if (this.y0 === null) return;
    const dy = e.clientY - this.y0, dx = e.clientX - this.x0;
    if (dy < 12 || Math.abs(dx) > dy) return;
    this.dy = dy;
    document.querySelectorAll('.home-tile').forEach((t) => t.dispatchEvent(new Event('pointerleave'))); // stop press-and-hold
    const g = document.querySelector('.home-grid'), hint = document.querySelector('.pull-hint');
    const d = Math.min(110, dy * 0.45);
    if (g) { g.style.transition = 'none'; g.style.transform = `translateY(${d}px)`; }
    if (hint) { hint.classList.add('show'); hint.classList.toggle('ready', dy > 120); hint.style.transform = `translateY(${d * 0.6}px)`; }
  },
  end() {
    const g = document.querySelector('.home-grid'), hint = document.querySelector('.pull-hint');
    if (g) { g.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1)'; g.style.transform = ''; }
    if (hint) { hint.classList.remove('show', 'ready'); hint.style.transform = ''; }
    const go2 = this.dy > 120;
    if (this.dy > 12) document.querySelectorAll('.home-tile').forEach((t) => { t.dataset.longpressed = '1'; setTimeout(() => delete t.dataset.longpressed, 80); });
    this.y0 = null; this.dy = 0;
    if (go2) { buzz(10); openSearch(); }
  }
};
function startArrange() { state.arranging = homeOrder(); render(); toast('Drag icons to move them, then tap Done'); }
async function finishArrange() {
  state.data.prefs.order = state.arranging;
  state.arranging = null;
  render();
  await save();
  toast('Order saved');
}

// ---------- Theme dropdown ----------
// ---------------- Icon styles ----------------
// Classic: gold outline. Bold: solid symbols. Colour: app-style coloured tiles. Emoji: your phone's own emoji.
const ICON_STYLES = { classic: 'Classic', bold: 'Bold', colour: 'Colour', emoji: 'Emoji' };
const BOLD = {
  all: '<rect x="3" y="8.2" width="18" height="12.8" rx="2.2"/><rect x="5" y="5" width="14" height="2" rx="1"/><rect x="7" y="2" width="10" height="2" rx="1"/>',
  fav: '<path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2-4.6-4.4 6.3-.9z"/>',
  recent: '<path fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zM11 6.5V12.6l4.2 2.6.9-1.5-3.3-2V6.5z"/>',
  login: '<path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" stroke-width="2.2"/><path fill-rule="evenodd" d="M5.5 10h13a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-8A1.5 1.5 0 0 1 5.5 10zM12 13.2a1.6 1.6 0 0 0-.8 3V18h1.6v-1.8a1.6 1.6 0 0 0-.8-3z"/>',
  email: '<path fill-rule="evenodd" d="M12 2.6a9.4 9.4 0 1 0 4.8 17.5l-.9-1.6A7.5 7.5 0 1 1 19.5 12v1.1a1.6 1.6 0 0 1-3.2 0V8h-1.8v.9A4.5 4.5 0 1 0 15 15.4a3.4 3.4 0 0 0 6.3-2.3V12A9.4 9.4 0 0 0 12 2.6zm0 12.1a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z"/>',
  passport: '<path d="M21 15.6v-1.9l-7.6-4.8V4.1a1.4 1.4 0 0 0-2.8 0v4.8L3 13.7v1.9l7.6-2.3v4.9l-2 1.5V21l3.4-1 3.4 1v-1.3l-2-1.5v-4.9z"/>',
  medicare: '<path fill-rule="evenodd" d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm4.4 3.8v3.6H6.8v3.2h3.6v3.6h3.2v-3.6h3.6v-3.2h-3.6V6.8z"/>',
  card: '<path fill-rule="evenodd" d="M4.5 5h15A2.5 2.5 0 0 1 22 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 16.5v-9A2.5 2.5 0 0 1 4.5 5zM5 8.5V12h4.5V8.5zM5 15v1.6h5.5V15zm7.5 0v1.6H16V15z"/>',
  bank: '<ellipse cx="12" cy="5.8" rx="7.2" ry="2.8"/><path d="M4.8 8.1v2.7c0 1.6 3.2 2.9 7.2 2.9s7.2-1.3 7.2-2.9V8.1c-1.4 1.2-4.1 2-7.2 2s-5.8-.8-7.2-2zM4.8 13.4v2.7c0 1.6 3.2 2.9 7.2 2.9s7.2-1.3 7.2-2.9v-2.7c-1.4 1.2-4.1 2-7.2 2s-5.8-.8-7.2-2z"/>',
  rewards: '<path d="m3 7.5 4.6 3.7L12 4.5l4.4 6.7L21 7.5l-1.9 10H4.9z"/><rect x="4.9" y="18.8" width="14.2" height="2" rx=".8"/>',
  licence: '<path fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zm0 2.4a7.1 7.1 0 0 0-6.8 5h13.6a7.1 7.1 0 0 0-6.8-5zM4.9 12.4a7.1 7.1 0 0 0 5.5 6.5v-2.5c0-1.6-1.1-2.9-2.7-3.6zm14.2 0-2.8.4c-1.6.7-2.7 2-2.7 3.6v2.5a7.1 7.1 0 0 0 5.5-6.5zM12 10.7a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z"/>',
  taxid: '<path fill-rule="evenodd" d="M5 2.5h14V21l-2.3-1.4-2.4 1.4L12 19.6 9.7 21l-2.4-1.4L5 21zM8 6.8v1.8h8V6.8zm0 4v1.8h8v-1.8zm0 4v1.8h5v-1.8z"/>',
  wifi: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M3 9.6a13.5 13.5 0 0 1 18 0M6.2 13a8.8 8.8 0 0 1 11.6 0M9.3 16.4a4.3 4.3 0 0 1 5.4 0"/></g><circle cx="12" cy="19.6" r="1.7"/>',
  note: '<path d="M15.4 3.7a2 2 0 0 1 2.8 0l2.1 2.1a2 2 0 0 1 0 2.8L9 19.9l-5.6 1.3 1.3-5.6z"/>',
  more: '<path fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zm-1.3 5v3.2H7.5v2.6h3.2v3.2h2.6v-3.2h3.2v-2.6h-3.2V7.5z"/>',
  document: '<path d="M3 6.2c0-.9.7-1.6 1.6-1.6h4.7l2 2.3h8.1c.9 0 1.6.7 1.6 1.6v9.7c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6z"/>',
  folder: '<path d="M3 6.2c0-.9.7-1.6 1.6-1.6h4.7l2 2.3h8.1c.9 0 1.6.7 1.6 1.6v9.7c0 .9-.7 1.6-1.6 1.6H4.6c-.9 0-1.6-.7-1.6-1.6z"/>',
  house: '<path d="M12 3 2.8 10.6l1.2 1.5 1.5-1.2V20h5v-5.2h3V20h5v-9.1l1.5 1.2 1.2-1.5z"/>',
  heart: '<path d="M12 20.5S3.5 15.4 3.5 9.4A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8.5 2.6c0 6-8.5 11.1-8.5 11.1z"/>',
  shield: '<path fill-rule="evenodd" d="M12 2.6 4.5 5.6v5.6c0 4.7 3.2 8.4 7.5 10.5 4.3-2.1 7.5-5.8 7.5-10.5V5.6zm3.4 6.3-4.5 4.6-2.2-2.2-1.3 1.3 3.5 3.5 5.8-5.9z"/>',
  briefcase: '<path fill-rule="evenodd" d="M9.2 4h5.6c.9 0 1.6.7 1.6 1.6V7h3.1c1 0 1.9.9 1.9 1.9V12H3V8.9C3 7.9 3.9 7 4.9 7H8V5.6C8 4.7 8.7 4 9.6 4zm.4 1.8V7h4.8V5.8zM3 13.5h7.5V15h3v-1.5H21v4.6c0 1-.9 1.9-1.9 1.9H4.9c-1 0-1.9-.9-1.9-1.9z"/>',
  phone: '<path fill-rule="evenodd" d="M8.5 2.5h7a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2zm2 15.6v1.6h3v-1.6z"/>',
  tag: '<path fill-rule="evenodd" d="M3 12.3V4.6C3 3.7 3.7 3 4.6 3h7.7l8.4 8.4c.6.6.6 1.6 0 2.3l-7 7c-.6.6-1.6.6-2.3 0zM8 6.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z"/>',
  book: '<path d="M3.5 5c2.9-1.4 5.8-1.3 7.6.4V20c-1.8-1.6-4.7-1.7-7.6-.5zM20.5 5c-2.9-1.4-5.8-1.3-7.6.4V20c1.8-1.6 4.7-1.7 7.6-.5z"/>',
  globe: '<path fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zM4.8 11h3.6c.1-2.5.6-4.7 1.4-6.2A7.4 7.4 0 0 0 4.8 11zm5.6 0h3.2c-.1-2.6-.8-4.8-1.6-5.9-.8 1.1-1.5 3.3-1.6 5.9zm5.2 0h3.6a7.4 7.4 0 0 0-5-6.2c.8 1.5 1.3 3.7 1.4 6.2zM4.8 13a7.4 7.4 0 0 0 5 6.2c-.8-1.5-1.3-3.7-1.4-6.2zm5.6 0c.1 2.6.8 4.8 1.6 5.9.8-1.1 1.5-3.3 1.6-5.9zm5.2 0c-.1 2.5-.6 4.7-1.4 6.2a7.4 7.4 0 0 0 5-6.2z"/>',
  car: '<path fill-rule="evenodd" d="M7.3 5h9.4c.9 0 1.6.5 1.9 1.3l1.7 4.4c.9.4 1.7 1.3 1.7 2.4v4.4c0 .5-.4.9-.9.9H20v1.6a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1.6h-9v1.6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1.6h-1.1a.9.9 0 0 1-.9-.9v-4.4c0-1.1.8-2 1.7-2.4l1.7-4.4C5.7 5.5 6.4 5 7.3 5zm.2 2-1.4 3.6h11.8L16.5 7zM6.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>'
};
const COLOURS = {
  all: '#78716C', fav: '#EAB308', recent: '#0284C7', expiring: '#F59E0B',
  login: '#E9A23B', email: '#3B82F6', passport: '#0EA5A4', medicare: '#16A34A', card: '#8B5CF6', bank: '#E5484D',
  rewards: '#EC4899', licence: '#F97316', taxid: '#64748B', wifi: '#06B6D4', note: '#CA8A04', more: '#6366F1',
  document: '#A16207', folder: '#A16207', house: '#0891B2', car: '#F97316', heart: '#E11D48', briefcase: '#7C3AED',
  globe: '#2563EB', phone: '#0D9488', shield: '#059669', tag: '#DB2777', book: '#B45309'
};
const EMOJI = {
  all: '🗂️', fav: '⭐', recent: '🕘', expiring: '⚠️',
  login: '🔑', email: '📧', passport: '🛂', medicare: '🏥', card: '💳', bank: '🏦', rewards: '🎁', licence: '🚗',
  taxid: '🧾', wifi: '📶', note: '📝', more: '➕', document: '📂', folder: '📁', house: '🏠', car: '🚙', heart: '❤️',
  briefcase: '💼', globe: '🌏', phone: '📱', shield: '🛡️', tag: '🏷️', book: '📚'
};
function savedGlass() { try { return localStorage.getItem('oy.glass') !== 'off'; } catch { return true; } }
function applyGlass(on) { document.documentElement.dataset.glass = on ? 'on' : 'off'; }
function setGlass(on) { try { localStorage.setItem('oy.glass', on ? 'on' : 'off'); } catch {} applyGlass(on); }
function savedIconStyle() { try { return localStorage.getItem('oy.icons') || 'classic'; } catch { return 'classic'; } }
function applyIconStyle(s) { document.documentElement.dataset.icons = ICON_STYLES[s] ? s : 'classic'; }
function chooseIconStyle(s) {
  try { localStorage.setItem('oy.icons', s); } catch {}
  applyIconStyle(s);
  if (state.data) { state.data.prefs.icons = s; save(); }
}
function boldSvg(name) {
  const body = BOLD[name];
  if (!body) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ICON_PATHS.note}</svg>`;
  return `<svg viewBox="0 0 24 24" fill="currentColor">${body}</svg>`;
}
/** Category icon in the chosen style. onTile: the home tile paints the colour itself. */
function catIcon(name, cls, { onTile = false, style = savedIconStyle() } = {}) {
  if (style === 'classic') return icon(name, cls, true);
  const span = document.createElement('span');
  span.className = `${cls} ico-${style}`;
  span.setAttribute('aria-hidden', 'true');
  if (style === 'emoji') span.textContent = EMOJI[name] || '📁';
  else span.innerHTML = boldSvg(name);
  if (style === 'colour' && !onTile) span.style.setProperty('--c', COLOURS[name] || '#64748B');
  return span;
}
function iconStyleDropdown() {
  const current = savedIconStyle();
  const sample = (s) => h('span', { class: 'style-sample' }, ['login', 'bank', 'passport'].map((n) => catIcon(n, 'ico style-ico', { style: s })));
  const list = h('div', { class: 'dd-list', role: 'listbox', hidden: true },
    Object.entries(ICON_STYLES).map(([key, name]) => h('button', { class: `dd-opt ${key === current ? 'on' : ''}`, role: 'option', 'aria-selected': String(key === current),
      onclick: () => { chooseIconStyle(key); render(); } }, sample(key), h('span', { class: 'dd-name' }, name), key === current ? h('span', { class: 'dd-tick' }, '✓') : null)));
  const btn = h('button', { class: 'dd-btn', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', onclick: () => {
    list.hidden = !list.hidden; btn.setAttribute('aria-expanded', String(!list.hidden)); btn.classList.toggle('open', !list.hidden);
  } }, sample(current), h('span', { class: 'dd-name' }, ICON_STYLES[current]), h('span', { class: 'dd-chev' }, '⌄'));
  return h('div', { class: 'dd' }, btn, list);
}

function themeDropdown() {
  const swatch = (key) => {
    const cols = THEMES[key].colours || VAULT_SWATCH;
    return h('span', { class: 'theme-swatch', style: `--t-accent:${cols[0]};--t-hi:${cols[1]};--t-deep:${cols[2]}` }, h('span'), h('span'), h('span'));
  };
  const current = savedTheme();
  const list = h('div', { class: 'dd-list', role: 'listbox', hidden: true },
    Object.entries(THEMES).map(([key, t]) => h('button', { class: `dd-opt ${key === current ? 'on' : ''}`, role: 'option', 'aria-selected': String(key === current),
      onclick: () => { chooseTheme(key); render(); } }, swatch(key), h('span', { class: 'dd-name' }, t.name), key === current ? h('span', { class: 'dd-tick' }, '✓') : null)));
  const btn = h('button', { class: 'dd-btn', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', onclick: () => {
    list.hidden = !list.hidden; btn.setAttribute('aria-expanded', String(!list.hidden)); btn.classList.toggle('open', !list.hidden);
  } }, swatch(current), h('span', { class: 'dd-name' }, (THEMES[current] || THEMES.vault).name), h('span', { class: 'dd-chev' }, '⌄'));
  return h('div', { class: 'dd' }, btn, list);
}

// ---------- Field editor (per category) ----------
const KIND_LABEL = { '': 'Text', secret: 'Hidden', multi: 'Long text' };
const KIND_NEXT = { '': 'secret', secret: 'multi', multi: '' };
// Fields belong to one item: an item can add, rename, retype, reorder or remove its own fields
// without changing any other item. Items that were never customised use their category's fields.
function itemFields(it) {
  return Array.isArray(it.fieldList) ? it.fieldList : typeDef(it.type).fields;
}
const kindOf = (kind = '') => (kind.includes('multi') ? 'multi' : kind.includes('secret') ? 'secret' : '');
function fieldEditor(d, onDone) {
  let rows = itemFields(d).map(([key, label, kind = '']) => ({ key, label, kind: kindOf(kind) }));
  const listEl = h('div', { class: 'fe-list' });
  const draw = () => {
    listEl.replaceChildren(...rows.map((r, i) => {
      const input = h('input', { class: 'input fe-name', id: `fe-${r.key}`, value: r.label, placeholder: 'Field name', maxlength: 40,
        oninput: (e) => { r.label = e.target.value; } });
      return h('div', { class: 'fe-row' },
        h('div', { class: 'fe-move' },
          h('button', { type: 'button', class: 'fe-arrow', 'aria-label': 'Move up', disabled: i === 0, onclick: () => { [rows[i - 1], rows[i]] = [rows[i], rows[i - 1]]; draw(); } }, '▲'),
          h('button', { type: 'button', class: 'fe-arrow', 'aria-label': 'Move down', disabled: i === rows.length - 1, onclick: () => { [rows[i + 1], rows[i]] = [rows[i], rows[i + 1]]; draw(); } }, '▼')),
        input,
        h('button', { type: 'button', class: `fe-kind kind-${r.kind || 'text'}`, title: 'Tap to change type', onclick: () => { r.kind = KIND_NEXT[r.kind]; draw(); } }, KIND_LABEL[r.kind]),
        h('button', { type: 'button', class: 'fe-del', 'aria-label': `Delete ${r.label || 'field'}`, onclick: () => { rows.splice(i, 1); draw(); } }, '×'));
    }));
  };
  draw();
  const addBtn = h('button', { type: 'button', class: 'btn outline', onclick: () => {
    rows.push({ key: 'f_' + uid(), label: '', kind: '' }); draw();
    const last = listEl.querySelector('.fe-row:last-child .fe-name'); if (last) last.focus();
  } }, '+ Add field');
  const reset = h('button', { type: 'button', class: 'btn link subtle', onclick: () => {
    rows = typeDef(d.type).fields.map(([key, label, kind = '']) => ({ key, label, kind: kindOf(kind) }));
    draw();
  } }, 'Reset to the usual fields');
  const name = (d.title || '').trim() || `this ${typeDef(d.type).one}`;
  modal('Fields', h('div', { class: 'stack' },
    h('p', { class: 'muted small' }, `Changes apply to ${name} only. Tap the type to switch between Text, Hidden (shown as dots) and Long text.`),
    listEl, addBtn, reset),
  (close) => [
    h('button', { class: 'btn ghost', onclick: close }, 'Cancel'),
    h('button', { class: 'btn gold', onclick: async () => {
      rows = rows.map((r) => ({ ...r, label: r.label.trim() }));
      if (rows.some((r) => !r.label)) return toast('Give every field a name, or delete the empty one', 'err');
      const keep = new Set(rows.map((r) => r.key));
      const removed = itemFields(d).map(([key]) => key).filter((key) => !keep.has(key) && String(d.fields[key] || '').trim());
      if (removed.length) {
        close();
        if (!(await confirmBox('Delete fields?', `What you typed in the deleted field${removed.length > 1 ? 's' : ''} will be removed when you save.`, 'Delete', true))) return;
      } else close();
      for (const key of itemFields(d).map(([k]) => k)) if (!keep.has(key)) delete d.fields[key];
      d.fieldList = rows.map((r) => [r.key, r.label, r.kind]);
      onDone && onDone();
    } }, 'Done')
  ]);
}

// ---------- More: add your own categories ----------
function openMore() {
  const count = (k) => state.data.items.filter((it) => it.type === k).length;
  const row = (k, label, ic, onclick, cls = '') => h('button', { class: `more-row ${cls}`, onclick },
    ic === 'plus' ? icon(ic, 'ico more-ico') : catIcon(ic, 'ico more-ico'), h('span', { class: 'more-label' }, label),
    k ? h('span', { class: 'more-count' }, count(k) || '') : null);
  const close = modal('More', h('div', { class: 'more-list' },
    row(null, 'Add new', 'plus', () => { close(); categoryEditor(); }, 'more-add'),
    row('document', 'Other documents', 'document', () => { close(); go('category', { category: 'document' }); }),
    customCats().slice().sort((a, b) => a.label.localeCompare(b.label))
      .map((c) => row(c.id, c.label, c.icon, () => { close(); go('category', { category: c.id }); }))),
  (c) => [h('button', { class: 'btn ghost', onclick: c }, 'Close')]);
}

function categoryEditor(existing) {
  let chosen = existing ? existing.icon : 'folder';
  const name = h('input', { class: 'input', id: 'cat-name', placeholder: 'Name (e.g. Insurance, Car, Health)', value: existing ? existing.label : '', autocomplete: 'off', maxlength: 28 });
  const picks = CUSTOM_ICONS.map((ic) => h('button', { type: 'button', class: `icon-pick ${ic === chosen ? 'on' : ''}`, 'aria-label': ic,
    onclick: (e) => { chosen = ic; picks.forEach((p) => p.classList.remove('on')); e.currentTarget.classList.add('on'); } }, catIcon(ic, 'ico pick-ico')));
  modal(existing ? 'Edit category' : 'New category', h('div', { class: 'stack' },
    name, h('span', { class: 'field-label' }, 'Icon'), h('div', { class: 'icon-picks' }, picks),
    existing && h('button', { type: 'button', class: 'btn danger-outline', onclick: () => deleteCategory(existing) }, 'Delete category')),
  (close) => [
    h('button', { class: 'btn ghost', onclick: close }, 'Cancel'),
    h('button', { class: 'btn gold', onclick: async () => {
      const label = name.value.trim();
      if (!label) return toast('Give it a name', 'err');
      if (existing) { existing.label = label; existing.icon = chosen; }
      else {
        const c = { id: 'c_' + uid(), label, icon: chosen };
        state.data.prefs.custom = [...customCats(), c];
        state.category = c.id;
      }
      close(); go('category', { category: state.category }); await save();
      toast(existing ? 'Category updated' : `${label} added`);
    } }, existing ? 'Save' : 'Create')
  ]);
}

async function deleteCategory(c) {
  const items = state.data.items.filter((it) => it.type === c.id);
  document.querySelectorAll('.overlay').forEach((o) => o.remove());
  const msg = items.length ? `${c.label} and the ${items.length} item${items.length > 1 ? 's' : ''} in it will be deleted.` : `${c.label} will be removed.`;
  if (!(await confirmBox('Delete category?', msg, 'Delete', true))) return;
  for (const it of items) for (const att of it.files || []) await attRemove(att.id).catch(() => {});
  state.data.items = state.data.items.filter((it) => it.type !== c.id);
  state.data.prefs.custom = customCats().filter((x) => x.id !== c.id);
  go('vault'); await save(); toast('Category deleted');
}

// ---------- Category list ----------
// ---------- Vault health ----------
function vaultHealth(items = state.data.items) {
  const pw = items.map((it) => ({ it, hl: health(it) })).filter((x) => x.hl);
  const weak = pw.filter((x) => x.hl.label === 'Weak').map((x) => x.it);
  const reused = pw.filter((x) => x.hl.label === 'Reused').map((x) => x.it);
  const okay = pw.filter((x) => x.hl.label === 'Okay').map((x) => x.it);
  const dated = items.filter((it) => expiryOf(it));
  const expiring = expiringItems();
  const expired = expiring.filter((it) => expiryOf(it).status === 'expired');
  const checks = pw.length + dated.length;
  const bad = weak.length + reused.length + okay.length * 0.4 + expired.length + (expiring.length - expired.length) * 0.5;
  const score = checks ? Math.max(0, Math.min(100, Math.round(100 * (1 - bad / checks)))) : 100;
  return { score, checks, weak, reused, okay, expiring, toFix: weak.length + reused.length + expiring.length };
}
function scoreRing(score, size = 140) {
  const r = 52, c = 2 * Math.PI * r;
  const col = score >= 80 ? '#2fb872' : score >= 50 ? '#f0b429' : '#e5484d';
  const w = document.createElement('span');
  w.className = 'score-ring';
  w.style.width = w.style.height = size + 'px';
  w.innerHTML = `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="10"/>
    <circle class="score-arc" cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - score / 100)}" transform="rotate(-90 60 60)" style="--c:${c}"/></svg>
    <span class="score-num">${score}<small>%</small></span>`;
  return w;
}
function homeHeader() {
  const name = (state.data.prefs.name || '').trim();
  const hr = new Date().getHours();
  const hello = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const vh = vaultHealth();
  const strip = vh.checks > 0 && h('button', { class: `health-strip ${vh.score >= 80 ? 'good' : vh.score >= 50 ? 'mid' : 'bad'}`, onclick: () => go('category', { category: 'health', from: null }) },
    scoreRing(vh.score, 30),
    h('span', { class: 'hs-text' }, h('b', {}, `Vault health ${vh.score}%`), h('span', {}, vh.toFix ? ` · ${vh.toFix} to fix` : ' · All good')),
    h('span', { class: 'home-chev' }, '›'));
  if (!name) return null;
  return h('div', { class: 'home-head' },
    name && h('p', { class: 'greeting' }, `${hello}, `, h('span', {}, name)));
}
function healthCard(items, cat) {
  const vh = vaultHealth(items);
  if (!vh.checks) return null;
  const bits = [vh.weak.length && `${vh.weak.length} weak`, vh.reused.length && `${vh.reused.length} reused`, vh.expiring.length && `${vh.expiring.length} expiring`].filter(Boolean);
  return h('button', { class: `health-strip ${vh.score >= 80 ? 'good' : vh.score >= 50 ? 'mid' : 'bad'}`,
    onclick: () => go('category', { category: 'health', healthCat: cat, healthTab: null, from: null }) },
    scoreRing(vh.score, 30),
    h('span', { class: 'hs-text' }, h('b', {}, `Health ${vh.score}%`), h('span', {}, bits.length ? ` · ${bits.join(' · ')}` : ' · All good')),
    h('span', { class: 'home-chev' }, '›'));
}
function healthView() {
  const cat = state.healthCat;
  const vh = vaultHealth(cat && cat !== 'all' ? state.data.items.filter((it) => it.type === cat) : state.data.items);
  const tab = state.healthTab || (vh.weak.length ? 'weak' : vh.reused.length ? 'reused' : 'expiring');
  const lists = { weak: vh.weak, reused: vh.reused, expiring: vh.expiring };
  const card = (key, label, ic, note) => h('button', { class: `hcard ${tab === key ? 'on' : ''} ${lists[key].length ? 'has' : ''}`,
    onclick: () => { state.healthTab = key; render(); } },
    icon(ic, 'ico'), h('span', { class: 'hcard-n' }, lists[key].length), h('span', { class: 'hcard-l' }, label), h('span', { class: 'hcard-note' }, note));
  const verdict = vh.score >= 90 ? 'Excellent' : vh.score >= 80 ? 'Looking good' : vh.score >= 50 ? 'A few things to fix' : 'Needs attention';
  const rows = lists[tab];
  const tips = { weak: 'Open each one, tap Edit, then Generate a new password.', reused: 'Give each account its own password, so one leak can’t unlock the others.', expiring: 'Renew these, then update the expiry date here.' };
  return h('div', { class: 'screen' },
    topBar(cat && cat !== 'all' ? `${typeDef(cat).label} health` : 'Vault health', iconBtn('back', 'Back', () => go('category', { category: cat || 'all' })), null),
    h('div', { class: 'content' },
      h('div', { class: 'health-hero' }, scoreRing(vh.score, 150),
        h('p', { class: 'health-verdict' }, verdict),
        h('p', { class: 'muted small' }, vh.checks ? `Based on ${vh.checks} password${vh.checks === 1 ? '' : 's'} and expiry dates` : 'Add logins and IDs to see your score')),
      h('div', { class: 'hcards' },
        card('weak', 'Weak', 'login', 'Easy to guess'),
        card('reused', 'Reused', 'copy', 'Same password twice'),
        card('expiring', 'Expiring', 'expiring', 'Within 3 months')),
      rows.length
        ? [h('p', { class: 'tap-hint left' }, tips[tab]), h('ul', { class: 'list' }, rows.map((it) => itemRow(it, { showCat: !cat || cat === 'all', from: 'health' })))]
        : h('div', { class: 'empty' }, h('p', { class: 'muted' }, tab === 'expiring' ? 'Nothing is expiring soon.' : `No ${tab} passwords. Nice work.`))));
}

VIEWS.category = () => {
  const k = state.category;
  if (k === 'health') return healthView();
  if (SPECIAL[k]) return specialView(k);
  const def = typeDef(k);
  const custom = customCats().find((c) => c.id === k);
  const rows = state.data.items.filter((it) => it.type === k)
    .sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || a.title.localeCompare(b.title));
  const add = () => showFact(() => go('edit', { itemId: null, draft: { id: uid(), type: k, title: '', fav: false, fields: {}, files: [] } }));
  return h('div', { class: 'screen' },
    topBar(def.label, iconBtn('back', 'Back', () => go('vault')),
      custom ? h('button', { class: 'icon-btn text', onclick: () => categoryEditor(custom) }, 'Edit') : null),
    h('div', { class: 'content' },
      h('div', { class: 'cat-hero' }, catIcon(typeIcon(k), 'ico ico-hero')),
      rows.length > 0 && healthCard(rows, k),
      rows.length
        ? h('ul', { class: 'list' }, rows.map((it) => itemRow(it)))
        : emptyState(k, def.label, add),
      null),
    h('button', { class: 'fab', 'aria-label': `Add ${def.one}`, onclick: add }, icon('plus', 'ico ico-fab')));
};

// One short fact, shown for a moment when you tap + (tap to skip)
const FACTS = [
  ['lock', 'Encrypted on your phone', 'Everything you add is locked on this device before it is saved anywhere.'],
  ['folder', 'Stored in your own Google Drive', 'Your vault lives in a hidden folder in your Drive — never on our servers.'],
  ['eyeOff', 'Nobody else can read it', 'Not Google, and not even the person who made this app. Only your master password opens it.'],
  ['shield', 'One password each', 'If one site leaks, a unique password stops it unlocking your other accounts.'],
  ['recent', 'Keep your recovery key safe', 'It is the only way back in if you ever forget your master password.'],
  ['fav', 'Long beats clever', 'A short sentence like “mango-tree-by-the-river” is harder to crack than “P@ssw0rd!”.']
];
function showFact(then) {
  let i = 0;
  try { i = (Number(localStorage.getItem('oy.fact')) || 0) % FACTS.length; localStorage.setItem('oy.fact', String(i + 1)); } catch {}
  const [ic, title, text] = FACTS[i];
  let done = false;
  const finish = () => { if (done) return; done = true; o.classList.add('out'); setTimeout(() => { o.remove(); then(); }, 220); };
  const o = h('div', { class: 'fact', role: 'status', onclick: finish },
    h('div', { class: 'fact-card' }, icon(ic, 'ico fact-ico'), h('p', { class: 'fact-title' }, title), h('p', { class: 'fact-text' }, text),
      h('span', { class: 'fact-bar' })));
  document.body.append(o);
  setTimeout(finish, 2200);
}

function findItem(id) { return state.data.items.find((i) => i.id === id); }

// ---------- Letter badges ----------
const AVATAR_HUES = [12, 32, 48, 140, 168, 190, 205, 222, 262, 292, 330, 350];
function hashStr(str) { let x = 0; for (const ch of String(str)) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x; }
function avatar(it) {
  const letter = (String(it.title).trim().match(/[\p{L}\p{N}]/u) || ['?'])[0].toUpperCase();
  const hue = AVATAR_HUES[hashStr(it.title.toLowerCase()) % AVATAR_HUES.length];
  return h('span', { class: 'avatar', 'aria-hidden': 'true', style: `--h:${hue}` }, letter);
}

// ---------- Expiry ----------
const EXPIRY_FIELDS = { card: 'expiry', passport: 'expiry', licence: 'expiry', medicare: 'validTo', document: 'expiry' };
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
/** Read the dates people actually type: 14/06/2033, 2033-06-14, 08/29, 11/2030, Mar 2031. Returns the last valid day. */
function parseExpiry(v) {
  if (!v) return null;
  const s = String(v).trim().toLowerCase();
  let m;
  const endOfMonth = (y, mo) => new Date(y, mo, 0, 23, 59);
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/))) return new Date(+m[1], +m[2] - 1, +m[3], 23, 59);
  if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/))) { const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]; return new Date(y, +m[2] - 1, +m[1], 23, 59); }
  if ((m = s.match(/^(\d{1,2})\s*[-/.]\s*(\d{2}|\d{4})$/))) { const y = +m[2] < 100 ? 2000 + +m[2] : +m[2]; if (+m[1] >= 1 && +m[1] <= 12) return endOfMonth(y, +m[1]); }
  if ((m = s.match(/^([a-z]{3})[a-z]*\.?\s+(\d{4})$/)) && MONTHS[m[1]]) return endOfMonth(+m[2], MONTHS[m[1]]);
  return null;
}
function expiryOf(it) {
  const key = EXPIRY_FIELDS[it.type] || (it.fields.expiry ? 'expiry' : null);
  const d = key && parseExpiry(it.fields[key]);
  if (!d || isNaN(d)) return null;
  const days = Math.ceil((d - Date.now()) / 86400000);
  const status = days < 0 ? 'expired' : days <= 90 ? 'soon' : 'ok';
  return { date: d, days, status };
}
function expiryTag(it, long = false) {
  const e = expiryOf(it);
  if (!e || e.status === 'ok') return null;
  const text = e.status === 'expired'
    ? (long ? `Expired ${Math.abs(e.days)} day${Math.abs(e.days) === 1 ? '' : 's'} ago` : 'Expired')
    : e.days === 0 ? 'Expires today' : long ? `Expires in ${e.days} day${e.days === 1 ? '' : 's'}` : `${e.days}d left`;
  return h('span', { class: `tag tag-${e.status}` }, text);
}
function expiringItems() {
  return state.data.items.map((it) => ({ it, e: expiryOf(it) })).filter((x) => x.e && x.e.status !== 'ok')
    .sort((a, b) => a.e.days - b.e.days).map((x) => x.it);
}

// ---------- Password health ----------
function passwordKey(it) {
  const f = itemFields(it).find(([k, label, kind = '']) => kind.includes('secret') && (k === 'password' || /password/i.test(label)));
  return f ? f[0] : null;
}
function health(it) {
  const key = passwordKey(it);
  const pw = key && it.fields[key];
  if (!pw || it.type === 'rewards') return null;
  const reused = state.data.items.some((o) => o !== it && passwordKey(o) && o.fields[passwordKey(o)] === pw);
  const s = C.strength(pw);
  if (reused) return { level: 'bad', label: 'Reused', note: 'This password is used somewhere else too' };
  if (s <= 1) return { level: 'bad', label: 'Weak', note: 'Easy to guess — generate a new one' };
  if (s === 2) return { level: 'mid', label: 'Okay', note: 'Could be stronger' };
  return { level: 'good', label: 'Strong', note: 'Hard to guess' };
}
function healthRing(it, withLabel = false) {
  const hl = health(it);
  if (!hl) return null;
  const pct = hl.level === 'good' ? 100 : hl.level === 'mid' ? 60 : 25;
  return h('span', { class: `health health-${hl.level}`, title: `${hl.label}: ${hl.note}`, 'aria-label': `Password ${hl.label}` },
    h('span', { class: 'ring', style: `--p:${pct}` }), withLabel ? h('span', { class: 'health-label' }, hl.label) : null);
}

// ---------- Card face & ID card ----------
function cardNetwork(num) {
  const n = String(num || '').replace(/\D/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'AMEX';
  if (/^62/.test(n)) return 'UnionPay';
  return '';
}
function chip() {
  const s = document.createElement('span');
  s.className = 'chip-art';
  s.innerHTML = '<svg viewBox="0 0 40 30" aria-hidden="true"><rect x="1" y="1" width="38" height="28" rx="6" fill="url(#oyChip)"/><path d="M1 11h11v8H1M39 11H28v8h11M14 1v8c0 2 1 3 3 3h6c2 0 3-1 3-3V1M14 29v-8c0-2 1-3 3-3h6c2 0 3 1 3 3v8" fill="none" stroke="#7a5c18" stroke-width="1.2" opacity=".6"/></svg>';
  return s;
}
function cardFace(it) {
  ensureIconDefs();
  const f = it.fields;
  const digits = String(f.number || '').replace(/\D/g, '');
  const last4 = digits.slice(-4) || '••••';
  const hue = AVATAR_HUES[hashStr(it.title.toLowerCase()) % AVATAR_HUES.length];
  const numEl = h('span', { class: 'cf-number' }, `•••• •••• •••• ${last4}`);
  let shown = false;
  const face = h('button', { class: 'card-face', style: `--h:${hue}`, 'aria-label': 'Card — tap to show the full number', onclick: () => {
    if (!digits) return;
    shown = !shown;
    numEl.textContent = shown ? digits.replace(/(.{4})/g, '$1 ').trim() : `•••• •••• •••• ${last4}`;
  } },
    h('span', { class: 'cf-top' }, h('span', { class: 'cf-name' }, it.title), h('span', { class: 'cf-net' }, cardNetwork(digits))),
    chip(), numEl,
    h('span', { class: 'cf-bottom' },
      h('span', { class: 'cf-holder' }, h('span', { class: 'cf-cap' }, 'Card holder'), f.holder || '—'),
      h('span', { class: 'cf-exp' }, h('span', { class: 'cf-cap' }, 'Expires'), f.expiry || '—')));
  return h('div', { class: 'face-wrap' }, face, digits && h('p', { class: 'face-hint' }, 'Tap the card to show the full number'));
}
const ID_TITLES = { passport: 'PASSPORT', licence: 'DRIVER LICENCE', medicare: 'MEDICARE', document: 'DOCUMENT' };
function idCard(it) {
  const f = it.fields;
  const img = (it.files || []).find((a) => a.type.startsWith('image/'));
  const photo = h('span', { class: 'id-photo' }, catIcon(typeIcon(it.type), 'ico id-ph-ico'));
  if (img) attLoad(img.id).then((bytes) => {
    photo.replaceChildren();
    photo.style.backgroundImage = `url("${URL.createObjectURL(new Blob([bytes], { type: img.type }))}")`;
    photo.classList.add('has-img');
  }).catch(() => {});
  const num = f.number ? `•••• ${String(f.number).replace(/\s/g, '').slice(-3)}` : '';
  const exp = f.expiry || f.validTo || '';
  const name = f.fullName || f.name || (it.type === 'medicare' ? String(f.members || '').split('\n')[0].replace(/^\d+\s*/, '') : '') || it.title;
  return h('div', { class: `id-card id-${it.type}`, style: `--c:${COLOURS[typeIcon(it.type)] || '#64748B'}` },
    h('span', { class: 'id-band' }, ID_TITLES[it.type] || (f.kind || it.title).toUpperCase(), h('span', { class: 'id-state' }, f.state || f.nationality || '')),
    h('span', { class: 'id-body' }, photo,
      h('span', { class: 'id-lines' },
        h('span', { class: 'id-name' }, name),
        num && h('span', { class: 'id-row' }, h('span', { class: 'cf-cap' }, 'No.'), num),
        exp && h('span', { class: 'id-row' }, h('span', { class: 'cf-cap' }, it.type === 'medicare' ? 'Valid to' : 'Expires'), exp),
        expiryTag(it))));
}

// ---------- Empty screens ----------
const EMPTY_TIPS = {
  login: 'Save the sites and apps you sign in to, then copy passwords with one tap.',
  email: 'Keep your email logins and recovery details together.',
  passport: 'Add your passport details or just a photo of the photo page.',
  medicare: 'Add your Medicare card, including everyone on it.',
  card: 'Add a bank or credit card. Only you can see the full number.',
  bank: 'Keep your BSB and account numbers handy for transfers.',
  rewards: 'Flybuys, Everyday Rewards, frequent flyer — all in one place.',
  licence: 'Add your licence and a photo of the front and back.',
  taxid: 'Store your TFN, ABN and other tax numbers safely.',
  wifi: 'Save Wi‑Fi passwords so you can share them with guests.',
  note: 'Anything private: codes, combinations, answers to security questions.',
  document: 'Birth certificates, visas, insurance — photos or PDFs.'
};
function emptyState(k, label, onAdd) {
  return h('div', { class: 'empty-art' },
    h('span', { class: 'empty-orb' }, catIcon(typeIcon(k), 'ico empty-ico'), h('span', { class: 'spark s1' }), h('span', { class: 'spark s2' }), h('span', { class: 'spark s3' })),
    h('p', { class: 'empty-title' }, `No ${label.toLowerCase()} yet`),
    h('p', { class: 'muted empty-tip' }, EMPTY_TIPS[k] || 'Tap the button below to add your first one.'),
    onAdd && h('button', { class: 'btn gold', onclick: onAdd }, '+ Add your first'));
}

// List rows: tap to open; swipe left for Copy / Favourite / Delete
let openSwipe = null;
function closeSwipe() { if (openSwipe) { openSwipe(); openSwipe = null; } }
document.addEventListener('pointerdown', (e) => { if (openSwipe && !e.target.closest('.row-item.open')) closeSwipe(); }, true);

function rowLead(it, showCat) {
  const img = typeDef(it.type).files && (it.files || []).find((a) => a.type.startsWith('image/'));
  if (img) {
    const t = h('span', { class: 'row-thumb loading', 'aria-hidden': 'true' });
    attLoad(img.id).then((bytes) => {
      t.style.backgroundImage = `url("${URL.createObjectURL(new Blob([bytes], { type: img.type }))}")`;
      t.classList.remove('loading');
    }).catch(() => { t.replaceWith(showCat ? catIcon(typeIcon(it.type), 'ico row-cat') : avatar(it)); });
    return t;
  }
  return showCat ? catIcon(typeIcon(it.type), 'ico row-cat') : avatar(it);
}

function itemRow(it, { showCat = false, from = null } = {}) {
  const pk = passwordKey(it);
  const pw = pk && it.fields[pk];
  const quick = ['login', 'email', 'wifi'].includes(it.type) ? pw : null;
  let dragged = false;
  const front = h('div', { class: 'row-front' },
    h('button', { class: 'row-main', onclick: () => { if (dragged) return; go('item', { itemId: it.id, from }); } },
      rowLead(it, showCat),
      h('span', { class: 'row-text' },
        h('span', { class: 'row-title' }, it.title, it.fav ? h('span', { class: 'star' }, ' ★') : null),
        h('span', { class: 'row-sub' }, showCat ? [typeDef(it.type).label, itemSubtitle(it)].filter(Boolean).join(' · ') : itemSubtitle(it))),
      h('span', { class: 'row-badges' }, expiryTag(it), healthRing(it),
        it.files && it.files.length ? h('span', { class: 'row-att', title: 'Has files' }, icon('attach', 'ico ico-sm'), it.files.length) : null)),
    quick && h('button', { class: 'icon-btn copy-btn', 'aria-label': 'Copy password', onclick: () => { if (!dragged) copy(quick, 'Password copied'); } }, 'Copy'));
  const act = (cls, ic, label, fn) => h('button', { class: `swipe-act ${cls}`, 'aria-label': label, onclick: (e) => { e.stopPropagation(); fn(); } },
    icon(ic, 'ico'), h('span', {}, label));
  const actions = h('div', { class: 'swipe-actions' },
    pw && act('sa-copy', 'copy', 'Copy', () => { copy(pw, 'Password copied'); closeSwipe(); }),
    act('sa-fav', 'fav', it.fav ? 'Unstar' : 'Star', async () => { it.fav = !it.fav; closeSwipe(); render(); await save(); }),
    act('sa-del', 'trash', 'Delete', async () => {
      closeSwipe();
      if (!(await confirmBox('Delete this item?', `“${it.title}” and any files attached to it will be removed from your vault.`, 'Delete', true))) return;
      state.data.items = state.data.items.filter((x) => x.id !== it.id);
      for (const att of it.files || []) await attRemove(att.id).catch(() => {});
      render(); await save(); toast('Deleted');
    }));
  const li = h('li', { class: 'row-item swipe' }, actions, front);

  let x0 = 0, y0 = 0, dx = 0, mode = null, base = 0, width = 0;
  const place = (x, anim) => {
    front.style.transition = actions.style.transition = anim ? 'transform .22s cubic-bezier(.2,.8,.2,1)' : 'none';
    front.style.transform = x ? `translateX(${x}px)` : '';
    actions.style.transform = `translateX(${width + x}px)`;
  };
  front.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    x0 = e.clientX; y0 = e.clientY; dx = 0; mode = null; dragged = false;
    width = actions.offsetWidth; base = li.classList.contains('open') ? -width : 0;
  });
  front.addEventListener('pointermove', (e) => {
    if (x0 === null) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (!mode) { if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) { mode = 'x'; if (openSwipe && !li.classList.contains('open')) closeSwipe(); } else if (Math.abs(my) > 8) mode = 'y'; }
    if (mode !== 'x') return;
    dragged = true; li.classList.add('swiping');
    dx = Math.min(0, Math.max(-width - 30, base + mx));
    place(dx, false);
  });
  const end = () => {
    if (mode === 'x') {
      const open = dx < -width / 2.5;
      li.classList.toggle('open', open); li.classList.remove('swiping');
      place(open ? -width : 0, true);
      if (open) { buzz(6); openSwipe = () => { li.classList.remove('open'); place(0, true); }; }
      else if (openSwipe && li.classList.contains('open') === false) openSwipe = null;
      setTimeout(() => { dragged = false; }, 50);
    } else if (li.classList.contains('open')) { dragged = true; closeSwipe(); setTimeout(() => { dragged = false; }, 50); }
    x0 = null; mode = null;
  };
  front.addEventListener('pointerup', end);
  front.addEventListener('pointercancel', end);
  requestAnimationFrame(() => { width = actions.offsetWidth; actions.style.transform = `translateX(${width}px)`; });
  return li;
}

// ---------- Search (pull down on the home screen) ----------
function searchText(it) {
  const parts = [it.title, typeDef(it.type).label, itemSubtitle(it)];
  for (const [k, , kind = ''] of itemFields(it)) if (!kind.includes('secret') && it.fields[k]) parts.push(it.fields[k]);
  return parts.join(' ').toLowerCase();
}
function openSearch() {
  const results = h('div', { class: 'search-results' });
  const input = h('input', { class: 'input search', id: 'pull-search', type: 'search', placeholder: 'Search everything', autocomplete: 'off', enterkeyhint: 'search' });
  const draw = () => {
    const q = input.value.trim().toLowerCase();
    const items = state.data.items.slice().sort((a, b) => Math.max(b.used || 0, b.updated || 0) - Math.max(a.used || 0, a.updated || 0));
    const rows = q ? items.filter((it) => searchText(it).includes(q)) : items.slice(0, 6);
    results.replaceChildren(
      h('p', { class: 'search-cap' }, q ? `${rows.length} result${rows.length === 1 ? '' : 's'}` : 'Recent'),
      rows.length ? h('ul', { class: 'list' }, rows.slice(0, 40).map((it) => itemRow(it, { showCat: true, from: 'all' })))
        : h('p', { class: 'muted center pad' }, 'Nothing matches.'));
  };
  input.addEventListener('input', draw);
  draw();
  modal('Search', h('div', { class: 'stack search-sheet' }, input, results), (close) => [h('button', { class: 'btn ghost', onclick: close }, 'Close')]);
  setTimeout(() => input.focus(), 60);
  try { localStorage.setItem('oy.pulled', '1'); } catch {}
}

function specialView(k) {
  const items = state.data.items;
  let rows;
  if (k === 'fav') rows = items.filter((it) => it.fav).sort((a, b) => a.title.localeCompare(b.title));
  else if (k === 'expiring') rows = expiringItems();
  else if (k === 'recent') rows = items.slice().sort((a, b) => Math.max(b.used || 0, b.updated || 0) - Math.max(a.used || 0, a.updated || 0)).slice(0, 20);
  else rows = items.slice().sort((a, b) => a.title.localeCompare(b.title));
  const listWrap = h('div', {});
  const drawList = () => {
    const q = (state.query || '').trim().toLowerCase();
    const shown = q ? rows.filter((it) => [it.title, typeDef(it.type).label, itemSubtitle(it)].join(' ').toLowerCase().includes(q)) : rows;
    listWrap.replaceChildren(shown.length
      ? h('ul', { class: 'list' }, shown.map((it) => itemRow(it, { showCat: true, from: k })))
      : h('div', { class: 'empty' }, h('p', { class: 'muted' },
          q ? 'Nothing matches.' : k === 'expiring' ? 'Nothing is expiring in the next 3 months.' : k === 'fav' ? 'No favourites yet. Tap ☆ on any item to add it here.' : 'Nothing saved yet.')));
  };
  drawList();
  return h('div', { class: 'screen' },
    topBar(SPECIAL[k], iconBtn('back', 'Back', () => go('vault', { query: '' })), null),
    h('div', { class: 'content' },
      h('div', { class: 'cat-hero' }, catIcon(k, 'ico ico-hero')),
      k === 'all' && items.length > 0 && healthCard(items, 'all'),
      k === 'all' && items.length > 0 && h('input', { class: 'input search', id: 'all-search', type: 'search', placeholder: 'Search everything', value: state.query || '', autocomplete: 'off',
        oninput: (e) => { state.query = e.target.value; drawList(); } }),
      listWrap));
}

VIEWS.item = () => {
  const it = findItem(state.itemId);
  if (!it) { setTimeout(() => go('vault')); return h('div'); }
  const def = typeDef(it.type);
  if (!it.used || Date.now() - it.used > 60000) { it.used = Date.now(); save(); } // for Recent
  const fieldRows = itemFields(it).map(([k, label, kind = '']) => {
    const v = it.fields[k];
    if (!v) return null;
    const secret = kind.includes('secret');
    const multi = kind.includes('multi');
    const valEl = h(multi ? 'pre' : 'span', { class: `field-val ${secret ? 'masked' : ''}` }, secret ? '••••••••••' : v);
    let shown = !secret;
    const name = label.replace(/ \(.*\)$/, '');
    const side = [];
    if (secret) side.push(h('button', { class: 'eye-btn', 'aria-label': `Show ${name}`, onclick: (e) => {
      e.stopPropagation();
      shown = !shown; valEl.textContent = shown ? v : '••••••••••'; valEl.classList.toggle('masked', !shown);
      e.currentTarget.replaceChildren(icon(shown ? 'eyeOff' : 'eye', 'ico'));
    } }, icon('eye', 'ico')));
    if (k === 'url') {
      const href = /^https?:\/\//i.test(v) ? v : `https://${v}`;
      side.push(h('a', { class: 'eye-btn', href, target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Open website', onclick: (e) => e.stopPropagation() }, icon('external', 'ico')));
    }
    const hl = k === passwordKey(it) ? healthRing(it, true) : null;
    const row = h('div', { class: 'field tap', role: 'button', tabindex: '0', 'aria-label': `Copy ${name}`,
      onclick: async () => {
        await copy(v, `${name} copied`);
        row.classList.remove('copied'); void row.offsetWidth; row.classList.add('copied');
        setTimeout(() => row.classList.remove('copied'), 1400);
      },
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); } } },
      h('div', { class: 'field-label' }, name, hl),
      h('div', { class: 'field-body' }, valEl, h('div', { class: 'field-actions' }, side, h('span', { class: 'copy-mark', 'aria-hidden': 'true' }, icon('copy', 'ico ico-copy'), icon('check', 'ico ico-check')))));
    return row;
  }).filter(Boolean);
  return h('div', { class: 'screen' },
    topBar(def.label, iconBtn('back', 'Back', () => go('category', { category: state.from || it.type })),
      h('button', { class: 'icon-btn text', onclick: () => go('edit', { draft: structuredClone(it) }) }, 'Edit')),
    h('div', { class: 'content' },
      h('div', { class: 'item-hero', style: `--c:${COLOURS[typeIcon(it.type)] || 'var(--gold)'}` }),
      h('div', { class: 'item-head' },
        catIcon(typeIcon(it.type), 'ico item-icon'),
        h('div', {}, h('h1', {}, it.title), h('p', { class: 'muted small head-sub' }, `Updated ${new Date(it.updated || Date.now()).toLocaleDateString('en-AU')}`, expiryTag(it, true))),
        h('button', { class: `star-btn ${it.fav ? 'on' : ''}`, 'aria-label': 'Favourite', onclick: async () => {
          it.fav = !it.fav; render(); await save();
        } }, it.fav ? '★' : '☆')),
      it.type === 'card' && cardFace(it),
      ID_TITLES[it.type] && idCard(it),
      def.files && modeToggle(it.mode || 'details', async (m) => { it.mode = m; render(); await save(); }),
      def.files && attachmentsBlock(it),
      !(def.files && it.mode === 'files') &&
        h('div', { class: 'card' }, fieldRows.length ? fieldRows : h('p', { class: 'muted pad' }, 'No details yet.')),
      !(def.files && it.mode === 'files') && fieldRows.length > 0 && h('p', { class: 'tap-hint' }, 'Tap any detail to copy it'),
      h('button', { class: 'btn danger-outline', onclick: async () => {
        if (!(await confirmBox('Delete this item?', `“${it.title}” and any files attached to it will be removed from your vault.`, 'Delete', true))) return;
        state.data.items = state.data.items.filter((x) => x.id !== it.id);
        go('category', { category: it.type });
        for (const att of it.files || []) await attRemove(att.id).catch(() => {});
        await save(); toast('Deleted');
      } }, 'Delete item')));
};

VIEWS.edit = () => {
  const d = state.draft;
  const def = typeDef(d.type);
  const isNew = !findItem(d.id);
  const title = h('input', { class: 'input', id: 'f-title', placeholder: `Name (e.g. ${EXAMPLE_NAMES[d.type] || 'My ' + def.one})`, value: d.title, autocomplete: 'off' });
  const inputs = {};
  const fieldEls = itemFields(d).map(([k, label, kind = '']) => {
    const secret = kind.includes('secret');
    const multi = kind.includes('multi');
    let control;
    if (multi) {
      control = h('textarea', { class: 'input', id: `f-${k}`, rows: k === 'note' ? 8 : 3, placeholder: label, autocomplete: 'off', spellcheck: k === 'note' ? 'true' : 'false' });
      control.value = d.fields[k] || '';
      inputs[k] = control;
    } else if (secret) {
      const p = passwordInput({ id: `f-${k}`, placeholder: label, value: d.fields[k] || '', autocomplete: 'off' });
      inputs[k] = p.input;
      const isPw = k === 'password' && d.type !== 'rewards';
      const extra = isPw ? [h('button', { type: 'button', class: 'mini', onclick: () => openGenerator((pw) => { p.input.value = pw; p.input.type = 'text'; p.input.dispatchEvent(new Event('input')); }) }, 'Generate')] : [];
      control = h('div', {}, h('div', { class: 'with-btn' }, p.el, ...extra), isPw ? strengthBar(p.input) : null);
      if (isPw) setTimeout(() => p.input.dispatchEvent(new Event('input')));
    } else {
      control = h('input', { class: 'input', id: `f-${k}`, placeholder: label, value: d.fields[k] || '', autocomplete: 'off',
        inputmode: ['bsb', 'abn', 'acn', 'memberNumber'].includes(k) ? 'numeric' : null,
        type: 'text', autocapitalize: ['url', 'address', 'username'].includes(k) ? 'off' : null,
        ...(k === 'url' ? { inputmode: 'url' } : k === 'address' ? { inputmode: 'email' } : {}) });
      inputs[k] = control;
    }
    return h('label', { class: 'form-field' }, h('span', { class: 'field-label' }, label.replace(/ \(.*\)$/, '')), control);
  });
  const submit = async (e) => {
    e.preventDefault();
    const t = title.value.trim();
    if (!t) return toast('Give it a name', 'err');
    const fields = {};
    const filesOnly = def.files && d.mode === 'files';
    if (filesOnly) for (const [k, v] of Object.entries(d.fields)) { if (String(v).trim()) fields[k] = v; } // details are hidden, not deleted
    else for (const [k, el] of Object.entries(inputs)) { const v = el.value.trim(); if (v) fields[k] = el.tagName === 'TEXTAREA' ? el.value : v; }
    for (const id of d._removed || []) await attRemove(id).catch(() => {});
    const item = { ...d, title: t, fields, files: d.files || [], updated: Date.now() };
    delete item._added; delete item._removed;
    const idx = state.data.items.findIndex((x) => x.id === item.id);
    if (idx >= 0) state.data.items[idx] = item; else state.data.items.push(item);
    go('item', { itemId: item.id, draft: null });
    await save();
    toast('Saved');
  };
  return h('div', { class: 'screen' },
    topBar(isNew ? `New ${def.one}` : 'Edit',
      h('button', { class: 'icon-btn text', onclick: async () => {
        await discardDraftFiles(d);
        isNew ? go('category', { category: d.type }) : go('item', { itemId: d.id });
      } }, 'Cancel'),
      null),
    h('form', { class: 'content stack', onsubmit: submit, novalidate: true },
      def.files && modeToggle(d.mode || 'details', (m) => {
        // keep what was typed so far, then redraw with the chosen mode
        d.title = title.value;
        for (const [k, el] of Object.entries(inputs)) d.fields[k] = el.value;
        d.mode = m; render();
      }),
      h('label', { class: 'form-field' }, h('span', { class: 'field-label' }, 'Name'), title),
      !(def.files && d.mode === 'files') && fieldEls,
      !(def.files && d.mode === 'files') && h('button', { type: 'button', class: 'btn link edit-fields', onclick: () => {
        d.title = title.value;
        for (const [k, el] of Object.entries(inputs)) d.fields[k] = el.value;
        fieldEditor(d, () => render());
      } }, '+ Add, edit or delete fields'),
      def.files && draftAttachments(d),
      h('button', { class: 'btn gold big', type: 'submit' }, 'Save')));
};
const EXAMPLE_NAMES = { login: 'Netflix', email: 'Personal Gmail', passport: 'My passport', medicare: 'Family Medicare', card: 'CommBank Visa',
  bank: 'Everyday account', rewards: 'Flybuys', licence: 'NSW driver licence', taxid: 'My TFN', wifi: 'Home Wi‑Fi', note: 'Locker code', document: 'Birth certificate' };

function openGenerator(onUse) {
  const opts = { length: 20, upper: true, lower: true, digits: true, symbols: true };
  const out = h('div', { class: 'gen-out mono' });
  const lenLabel = h('span', {}, '');
  const regen = () => { out.textContent = C.generatePassword(opts); lenLabel.textContent = `Length: ${opts.length}`; };
  const slider = h('input', { type: 'range', min: 8, max: 64, value: opts.length, oninput: (e) => { opts.length = +e.target.value; regen(); } });
  const toggle = (key, label) => h('label', { class: 'check' },
    h('input', { type: 'checkbox', checked: opts[key], onchange: (e) => { opts[key] = e.target.checked; regen(); } }), h('span', {}, label));
  regen();
  modal('Password generator', h('div', { class: 'stack' },
    out,
    h('button', { type: 'button', class: 'btn outline', onclick: regen }, '↻ New one'),
    lenLabel, slider,
    h('div', { class: 'toggles' }, toggle('upper', 'A–Z'), toggle('lower', 'a–z'), toggle('digits', '0–9'), toggle('symbols', '!@#'))),
  (close) => [
    h('button', { class: 'btn ghost', onclick: close }, 'Cancel'),
    h('button', { class: 'btn gold', onclick: () => { onUse(out.textContent); close(); } }, 'Use this')
  ]);
}

VIEWS.settings = () => {
  const prefs = state.data.prefs;
  const lockSel = h('select', { class: 'input', onchange: async (e) => { prefs.lockMinutes = +e.target.value; resetIdle(); await save(); toast('Saved'); } },
    [1, 2, 5, 10, 15, 30].map((m) => h('option', { value: m, selected: prefs.lockMinutes === m }, `${m} minute${m > 1 ? 's' : ''}`)));

  const bioRow = () => {
    const on = !!bioRecord();
    const sw = h('button', { class: `switch ${on ? 'on' : ''}`, role: 'switch', 'aria-checked': String(on), 'aria-label': 'Unlock with Face ID or fingerprint',
      onclick: async () => {
        if (on) { bioDisable(); render(); return toast('Face ID unlock turned off'); }
        if (PREVIEW || state.account.id === 'sample') return toast('Face ID works in the real app on your phone');
        try { await bioEnable(); render(); toast('Face ID unlock is on'); }
        catch (e) { if (e && e.name !== 'NotAllowedError') toast(e.message || 'Could not turn on Face ID', 'err'); }
      } }, h('span', { class: 'knob' }));
    return h('div', { class: 'setting-row static' },
      h('span', {}, h('span', { class: 'setting-label' }, 'Face ID / fingerprint'), h('span', { class: 'setting-sub' }, 'Unlock with your face or finger on this device')), sw);
  };
  const changePw = () => {
    const cur = passwordInput({ placeholder: 'Current master password', autocomplete: 'current-password' });
    const n1 = passwordInput({ placeholder: 'New master password', autocomplete: 'new-password' });
    const n2 = passwordInput({ placeholder: 'Type it again', autocomplete: 'new-password' });
    modal('Change master password', h('div', { class: 'stack' }, cur.el, n1.el, strengthBar(n1.input), n2.el), (close) => [
      h('button', { class: 'btn ghost', onclick: close }, 'Cancel'),
      h('button', { class: 'btn gold', onclick: async () => {
        if (n1.input.value.length < 10 || C.strength(n1.input.value) < 2) return toast('Choose a stronger password (10+ characters)', 'err');
        if (n1.input.value !== n2.input.value) return toast('The new passwords do not match', 'err');
        try { await withBusy('Checking…', () => C.unlockWithPassword(state.file, cur.input.value)); }
        catch { return toast('Current password is wrong', 'err'); }
        await withBusy('Updating…', async () => { await C.changePassword(state.file, state.session, n1.input.value); await persistKeysOnly(); });
        close(); toast('Master password changed');
      } }, 'Change')
    ]);
  };

  const newRecovery = async () => {
    if (!(await confirmBox('Make a new recovery key?', 'Your old recovery key will stop working. You will need to save the new one.', 'Make new key'))) return;
    const rk = await withBusy('Creating…', async () => { const k = await C.rotateRecoveryKey(state.file, state.session); await persistKeysOnly(); return k; });
    state.recoveryKey = rk; go('recovery');
  };

  const exportBackup = async () => {
    // vault + every attached photo/PDF, all still encrypted
    const attachments = {};
    try {
      await withBusy('Preparing backup…', async () => {
        for (const it of state.data.items) for (const att of it.files || []) {
          attachments[att.id] = state.account.id === 'sample' ? memAtt.get(att.id) : await S.attGet(state.account.id, att.id, hint());
        }
      });
    } catch { return toast('Could not fetch all files — check your connection', 'err'); }
    download(`OY-backup-${today()}.oyvault`, JSON.stringify({ ...state.file, attachments }));
    if (!PREVIEW) toast('Encrypted backup downloaded');
  };

  const removeFromDevice = async () => {
    if (!(await confirmBox('Remove from this device?', isDrive()
      ? 'The copy on this phone or computer will be removed. Your vault stays safe in your Google Drive.'
      : 'This deletes your vault from this device. Without a backup file it cannot be recovered.', 'Remove', true))) return;
    await S.local.del(state.account.id);
    bioDisable();
    S.signOut(); S.rememberAccount(null);
    C.lockSession(state.session);
    Object.assign(state, { account: null, file: null, session: null, data: null });
    go('welcome'); toast('Removed from this device');
  };

  const section = (title, ...rows) => h('section', { class: 'card' }, h('h2', { class: 'section-title' }, title), ...rows);
  const rowBtn = (label, sub, onclick, cls = '') => h('button', { class: `setting-row ${cls}`, onclick },
    h('span', {}, h('span', { class: 'setting-label' }, label), sub && h('span', { class: 'setting-sub' }, sub)), h('span', { class: 'chev' }, '›'));

  return h('div', { class: 'screen' },
    topBar('Settings', iconBtn('back', 'Back', () => go('vault')), null),
    h('div', { class: 'content stack' },
      section('Account',
        h('div', { class: 'setting-row static' }, h('span', {},
          h('span', { class: 'setting-label' }, isDrive() ? state.account.email : 'This device only'),
          h('span', { class: 'setting-sub' }, isDrive() ? (S.hasToken() ? 'Vault stored encrypted in your Google Drive' : 'Signed out of Google for now — changes wait on this device') : 'Vault stored encrypted on this device'))),
        !isDrive() && S.driveConfigured && state.account.id !== 'sample' && rowBtn('Turn on Google Drive sync', 'Keep an encrypted copy in your own Google Drive, and use it on other devices', async () => {
          if (await confirmBox('Turn on Google Drive sync?', 'You’ll sign in with Google, then unlock OY! again to finish. Your vault stays encrypted, so Google can’t read it.', 'Continue')) S.signIn(null, 'link');
        }),
        isDrive() && !S.hasToken() && rowBtn('Reconnect Google Drive', 'Sign in again so your changes sync', reconnectDrive),
        h('label', { class: 'setting-row static' }, h('span', { class: 'setting-label' }, 'Your name'),
          h('input', { class: 'input name-input', id: 'set-name', value: prefs.name || '', placeholder: 'For the greeting', maxlength: 24, autocomplete: 'given-name',
            onchange: async (e) => { prefs.name = e.target.value.trim(); await save(); toast('Saved'); } }))),
      section('Icons', iconStyleDropdown()),
      section('Look', (() => {
        const on = savedGlass();
        const sw = h('button', { class: `switch ${on ? 'on' : ''}`, role: 'switch', 'aria-checked': String(on), 'aria-label': 'Glass effect',
          onclick: () => { setGlass(!on); render(); } }, h('span', { class: 'knob' }));
        return h('div', { class: 'setting-row static' },
          h('span', {}, h('span', { class: 'setting-label' }, 'Glass effect'), h('span', { class: 'setting-sub' }, 'See-through panels over a soft colour glow')), sw);
      })()),
      section('Theme', themeDropdown(),
        h('div', { class: 'setting-row static appearance-row' }, h('span', { class: 'setting-label' }, 'Appearance'),
          h('div', { class: 'seg seg-sm', role: 'radiogroup', 'aria-label': 'Appearance' },
            [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => h('button', { type: 'button', role: 'radio',
              'aria-checked': String(savedAppearance() === v), class: `seg-opt ${savedAppearance() === v ? 'on' : ''}`,
              onclick: () => { setAppearance(v); render(); } }, l)))),
        h('p', { class: 'setting-sub theme-note' }, 'Auto follows your phone’s light or dark mode.')),
      section('Security',
        bioRow(),
        rowBtn('Change master password', null, changePw),
        rowBtn('New recovery key', 'Use if you lost the old one', newRecovery),
        h('label', { class: 'setting-row static' }, h('span', { class: 'setting-label' }, 'Auto-lock after'), lockSel)),
      section('Backup',
        rowBtn('Export encrypted backup', 'Opens only with your master password', exportBackup),
        rowBtn('Restore from backup', 'Replaces what is in your vault now', () => restoreBackup({ replacingCurrent: true }))),
      section('This device',
        rowBtn('Lock now', null, () => lock('Locked')),
        rowBtn('Remove vault from this device', null, removeFromDevice, 'danger-text')),
      h('p', { class: 'note center' }, 'OY! v1.0 · AES‑256 encryption on your device')));
};

// ---------------- Boot ----------------
if (!PREVIEW && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
if (PREVIEW) document.body.classList.add('preview');
applyTheme(savedTheme());
applyIconStyle(savedIconStyle());
applyGlass(savedGlass());
document.body.prepend(h('div', { class: 'glow-backdrop', 'aria-hidden': 'true' }, h('span', { class: 'blob b1' }), h('span', { class: 'blob b2' }), h('span', { class: 'blob b3' })));
render();
boot();

// Start-up: finish a Google sign-in we just came back from, or reopen the remembered vault
async function boot() {
  if (PREVIEW) return;
  let r = null;
  try { r = await S.takeRedirect(); } catch (e) { r = { error: 'Could not finish signing in to Google. Please try again.' }; }
  if (r) {
    if (r.error) toast(r.error, 'err');
    const acc = r.account;
    if (r.intent === 'link') {
      if (acc) state.pendingLink = acc;
      await startLocal();
      if (acc) toast('Unlock to finish turning on Google Drive sync');
      return;
    }
    if (acc) return openDrive(acc);
    const rem = S.rememberedAccount();
    if (rem && rem.id !== 'local' && r.silent) return openDrive(rem); // couldn't refresh quietly: open offline copy
    return;
  }
  const rem = S.rememberedAccount();
  if (!rem) return;
  if (rem.id === 'local') return startLocal();
  if (!S.driveConfigured) return;
  if (S.hasToken()) return openDrive(rem);
  // New session: refresh the Google sign-in quietly once, then open the vault
  let tried = false;
  try { tried = sessionStorage.getItem('oy.silent') === '1'; sessionStorage.setItem('oy.silent', '1'); } catch {}
  if (!tried && navigator.onLine) return S.signIn(rem.email, 'signin', { silent: true });
  return openDrive(rem);
}
