const browserApi = typeof browser !== 'undefined'
  ? browser
  : (typeof chrome !== 'undefined' ? chrome : null);

if (!browserApi) {
  throw new Error('WebExtension APIs are unavailable in this context.');
}

const statusEl = document.getElementById('status');
const currentBtn = document.getElementById('dedupe-current');
const allBtn = document.getElementById('dedupe-all');

currentBtn.addEventListener('click', () => handleScope('current'));
allBtn.addEventListener('click', () => handleScope('all'));

async function handleScope(scope) {
  setButtonsDisabled(true);
  setStatus('Scanning for duplicate tabs...');

  try {
    const tabs = await getTabs(scope);
    const result = await closeDuplicateTabs(tabs);

    if (result.closed === 0) {
      let note = 'No duplicate tabs found.';
      if (result.skippedPinned > 0 || result.skippedProtected > 0) {
        note += describeSkips(result);
      }
      setStatus(note, 'success');
    } else {
      let message = `Closed ${result.closed} duplicate tab${result.closed === 1 ? '' : 's'}.`;
      if (result.failed > 0 || result.skippedPinned > 0 || result.skippedProtected > 0) {
        message += describeSkips(result);
      }
      setStatus(message, 'success');
    }
  } catch (error) {
    const readable = error && error.message ? error.message : String(error);
    setStatus(`Error: ${readable}`, 'error');
    console.error('Tabsdedup failed:', error);
  } finally {
    setButtonsDisabled(false);
  }
}

function describeSkips({ failed = 0, skippedPinned = 0, skippedProtected = 0 }) {
  const notes = [];
  if (skippedPinned > 0) {
    notes.push(`${skippedPinned} pinned`);
  }
  if (skippedProtected > 0) {
    notes.push(`${skippedProtected} protected`);
  }
  if (failed > 0) {
    notes.push(`${failed} failed`);
  }
  return notes.length ? ` (skipped ${notes.join(', ')})` : '';
}

async function getTabs(scope) {
  if (scope === 'current') {
    const currentWindow = await browserApi.windows.getCurrent();
    return browserApi.tabs.query({ windowId: currentWindow.id });
  }
  if (scope === 'all') {
    return browserApi.tabs.query({});
  }
  throw new Error(`Unsupported scope: ${scope}`);
}

async function closeDuplicateTabs(tabs) {
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return { closed: 0, failed: 0, skippedPinned: 0, skippedProtected: 0 };
  }

  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.windowId === b.windowId) {
      return (a.index ?? 0) - (b.index ?? 0);
    }
    return (a.windowId ?? 0) - (b.windowId ?? 0);
  });

  const seenUrls = new Map();
  const duplicateIds = [];
  let skippedPinned = 0;
  let skippedProtected = 0;

  for (const tab of sortedTabs) {
    if (!tab || tab.id == null) {
      continue;
    }

    const url = tab.url || '';

    if (!url) {
      continue;
    }

    if (tab.pinned) {
      skippedPinned++;
      continue;
    }

    if (isProtectedUrl(url)) {
      skippedProtected++;
      continue;
    }

    if (seenUrls.has(url)) {
      duplicateIds.push(tab.id);
    } else {
      seenUrls.set(url, tab.id);
    }
  }

  if (duplicateIds.length === 0) {
    return { closed: 0, failed: 0, skippedPinned, skippedProtected };
  }

  const results = await Promise.allSettled(duplicateIds.map((tabId) => browserApi.tabs.remove(tabId)));
  const closed = results.filter((entry) => entry.status === 'fulfilled').length;
  const failed = results.length - closed;

  return { closed, failed, skippedPinned, skippedProtected };
}

function isProtectedUrl(url) {
  const lowered = url.toLowerCase();
  return lowered.startsWith('chrome://') ||
    lowered.startsWith('edge://') ||
    lowered.startsWith('about:') ||
    lowered.startsWith('devtools://') ||
    lowered.startsWith('chrome-extension://') ||
    lowered.startsWith('moz-extension://');
}

function setButtonsDisabled(disabled) {
  currentBtn.disabled = disabled;
  allBtn.disabled = disabled;
}

function setStatus(message, tone) {
  statusEl.textContent = message;
  statusEl.classList.remove('error', 'success');
  if (tone === 'error' || tone === 'success') {
    statusEl.classList.add(tone);
  }
}
