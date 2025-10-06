# Tabsdedup

Tabsdedup is a Firefox extension that keeps your browsing tidy by closing duplicate tabs based on the full URL (protocol, host, path, query string, and hash). It offers one-click actions to deduplicate either the current window or every window you have open, while respecting pinned and privileged tabs.

## Features
- Detects duplicates by exact URL match, preventing accidental closure of pages that share a domain but differ by path or parameters.
- Two scopes: current window only, or every Firefox window.
- Leaves pinned tabs untouched, so important pinned workspaces stay intact.
- Skips URLs that Firefox extensions cannot close (`about:`, `chrome://`, `devtools://`, etc.) and reports them as skipped.
- Lightweight popup UI with status messages describing the outcome.

## Requirements
- Firefox 91 or later (manifest v2 is still supported and required for unsigned local usage).
- `tabs` permission to enumerate and close the user's open tabs.

## Quick Start (Temporary Load)
Use this flow when developing or testing locally.
1. Download or clone the repository.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...** and choose `manifest.json` (or any file inside the project directory).
4. The Tabsdedup icon appears in the toolbar. Launch it to pick an action and watch duplicate tabs close.

The temporary install lasts until Firefox restarts. Repeat the steps above whenever you want to reload the unsigned extension.

## Permanent Installation (Signed Build)
Mozilla requires signed add-ons for permanent installation on release builds.

### Option A: Use the bundled `TabsDedup.xpi`
The repository includes a pre-signed package at `TabsDedup.xpi`.
1. In Firefox, open `about:addons`.
2. Click the gear icon → **Install Add-on From File...**.
3. Select `TabsDedup.xpi` from this project directory and confirm the install.

If you change the source code, generate a new signed package (see Options B/C).

### Option B: Submit for signing on AMO
1. Ensure the project folder contains only extension assets (e.g., `manifest.json`, popup files, optional icons).
2. Create a ZIP archive with those files at the root (no nested parent folder).
3. Sign in at [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) and submit the ZIP as an **unlisted** add-on if you do not intend to publish it publicly.
4. After review/signing, download the generated `.xpi` and install it via `about:addons` → gear icon → **Install Add-on From File...**.

### Option C: Use web-ext tooling
1. Install the CLI with `npm install --global web-ext`.
2. Obtain AMO API credentials (Issuer/Secret) from your developer account.
3. Run `web-ext sign --api-key=<ISSUER> --api-secret=<SECRET>` in the project directory.
4. Retrieve the signed `.xpi` from the `web-ext-artifacts/` folder and install it in Firefox.

## Usage
1. Open several tabs, optionally duplicating a tab (right-click → **Duplicate Tab**) to create a known duplicate.
2. Click the Tabsdedup toolbar icon.
3. Choose **Current window** or **All windows**.
4. Review the status message:
   - `Closed n duplicate tab(s)` confirms how many were removed.
   - Skipped counts call out pinned or privileged tabs.
   - Errors (rare) are surfaced in the status line and logged to the popup console (`Cmd+Opt+I` / `Ctrl+Shift+I`).

Tabsdedup keeps the first instance of each URL it encounters (tab order within a window, then window order). Subsequent duplicates close automatically.

## Development
- Popup HTML/CSS/JS lives at the repository root (`popup.html`, `popup.css`, `popup.js`).
- `manifest.json` defines the manifest v2 configuration and Firefox-specific metadata.
- To iterate quickly, load the project temporarily via `about:debugging` and use the popup’s devtools for logs.
- For linting during development, install `web-ext` and run `web-ext lint` to catch manifest or API issues.

### Project Layout
```
manifest.json   # Firefox MV2 manifest with gecko id
popup.html      # Extension popup markup
popup.css       # Popup styling
popup.js        # Duplicate detection and removal logic
README.md       # This documentation
```

## Troubleshooting
- **“This add-on appears to be corrupt”**: install the signed `.xpi` from AMO or use Firefox Developer Edition with signature enforcement disabled.
- **Buttons disabled indefinitely**: reload the extension; a failed API call may have left the popup in an error state. Check the console for details.
- **Pinned tabs closed unexpectedly**: Tabsdedup intentionally skips pinned tabs. If yours closed, verify they were not unpinned or duplicated as hidden windows.
- **Privileged URLs remain open**: Firefox prevents extensions from closing `about:`, `chrome://`, `moz-extension://`, `devtools://`, etc. Tabsdedup reports these as “protected”.

See `docs/TROUBLESHOOTING.md` for a deeper checklist.

## Privacy & Permissions
- Tabsdedup only requests the `tabs` permission to read tab metadata and close duplicates. No browsing data is stored or transmitted.
- No network requests are made by the extension beyond the Firefox WebExtension APIs.

## License
MIT

## Further Reading
- Packaging guide: `docs/PACKAGING.md`
- Troubleshooting reference: `docs/TROUBLESHOOTING.md`
- Firefox Extension Workshop: <https://extensionworkshop.com/documentation/>
