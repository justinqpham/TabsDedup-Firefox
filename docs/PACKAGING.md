# Packaging & Signing Tabsdedup

Mozilla requires signed packages for permanent installation on Firefox release builds. Use the steps below to prepare, sign, and distribute Tabsdedup safely.

## 1. Clean the Workspace
- Keep only the extension assets: `manifest.json`, popup files, icons, and documentation.
- Delete temporary artifacts such as `.DS_Store`, `Thumbs.db`, `web-ext-artifacts/`, or build leftovers.
- Optional: run `web-ext lint` to catch manifest or API problems before packaging.

## 2. Create the ZIP Archive
From the project root, zip only the contents (not the parent folder):

```bash
zip -r tabsdedup.zip manifest.json popup.html popup.css popup.js README.md
```

Adjust the file list to include icons or other assets you add (for example, append `icons/`). Confirm the archive root lists the files directly—no nested folder or `__MACOSX/`.

## 3. Sign the Add-on

### Option A: Mozilla Add-on Developer Hub
1. Visit [https://addons.mozilla.org/developers/](https://addons.mozilla.org/developers/) and sign in.
2. Choose **Submit a New Add-on** → **On your own (unlisted)** if you do not want a public listing.
3. Upload `tabsdedup.zip`. After automated review, download the signed `.xpi`.

### Option B: `web-ext sign`
1. Install the CLI: `npm install --global web-ext`.
2. Generate AMO API credentials (Issuer + Secret) from the developer hub.
3. Run:
   ```bash
   web-ext sign \
     --api-key="$AMO_ISSUER" \
     --api-secret="$AMO_SECRET" \
     --artifacts-dir ./web-ext-artifacts
   ```
4. Retrieve the signed `.xpi` from `web-ext-artifacts/`.

## 4. Distribute or Install
- Install locally via `about:addons` → gear icon → **Install Add-on From File...** and select the signed `.xpi`.
- Share the `.xpi` with teammates or deploy it through enterprise tooling (Group Policy, MDM, etc.).

## 5. Versioning Tips
- Update `version` in `manifest.json` before packaging.
- Record changes in `CHANGELOG.md` or release notes for clarity.
- Tag the commit in git (`git tag v1.0.0 && git push --tags`) to match the signed package.

## 6. Re-signing After Changes
Every code change requires a new package and signature. Repeat steps 2–4 for each release.
