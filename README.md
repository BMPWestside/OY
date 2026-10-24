# OY! (Only You)

Private password vault. Everything is encrypted on the device (AES-256, key from your master password) before it is saved.

## Files
- `index.html`, `styles.css`, `app.js` – the app
- `crypto.js` – encryption (master password, recovery key, Face ID unlock)
- `store.js` – saving on the device and in each person's own Google Drive
- `config.js` – paste your Google OAuth Client ID here to switch on Drive sync
- `sw.js`, `manifest.json`, `icon.svg` – home-screen install and offline use

## Put it online (GitHub Pages)
1. Upload all files to a GitHub repo.
2. Settings → Pages → deploy from the `main` branch.
3. Open the Pages link on your phone and choose "Add to Home Screen".

Without a Client ID the app runs in "this device only" mode. Face ID needs the https link from GitHub Pages.
