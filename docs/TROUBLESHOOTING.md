# Troubleshooting Tabsdedup

Use this guide to debug common issues while developing, testing, or deploying the Tabsdedup Firefox extension.

## Extension Will Not Install
- **“This add-on appears to be corrupt”**  
  Unsigned packages are blocked on Firefox release builds. Install the signed `.xpi` from AMO or use Firefox Developer Edition with `xpinstall.signatures.required` set to `false`.
- **Open button disabled in file picker**  
  The “Install Add-on From File...” dialog only accepts `.xpi` or `.zip`. Create a signed `.xpi` or load the extension temporarily through `about:debugging`.
- **Version downgrade blocked**  
  Firefox prevents installing an older version over a newer one. Increment the `version` field in `manifest.json` before re-packaging.

## Extension Loads but Buttons Do Nothing
- Open the popup and press `Cmd+Opt+I` (macOS) or `Ctrl+Shift+I` (Windows/Linux) to inspect it. Check the **Console** panel for errors.
- Ensure the `tabs` permission is present in `manifest.json`. Without it, Firefox denies tab queries and removals.
- Reload the extension from `about:debugging`; a stale temporary load may be in an inconsistent state.

## Tabs Not Closing
- **Pinned tabs** are intentionally skipped to avoid data loss. Unpin the tab if you truly want it removed.
- **Privileged URLs** (`about:`, `chrome://`, `moz-extension://`, `devtools://`, `file://`) cannot be closed by WebExtensions. The popup status reports them as “protected”.
- Make sure duplicates are exact URL matches. Slight differences in query parameters or trailing slashes make them distinct.

## Status Shows Failures
- Firefox may report “No window with id” or “No tab with id” when tabs close externally during processing. Re-run Tabsdedup to clean up remaining duplicates.
- If multiple failures persist, collect console logs and file an issue with steps to reproduce.

## Packaging & Signing Problems
- Run `web-ext lint` before packaging to catch manifest schema errors.
- Verify the ZIP contains files at the root (no nested folder). `unzip -l tabsdedup.zip` should list `manifest.json` near the top.
- When using `web-ext sign`, confirm your AMO credentials are set via `--api-key` and `--api-secret` or environment variables (`WEB_EXT_API_KEY`, `WEB_EXT_API_SECRET`).

## Need Help?
- Check Firefox’s WebExtension docs: <https://extensionworkshop.com/documentation/>
- File an issue in your repository with environment details (Firefox version, OS, steps taken, console output).
