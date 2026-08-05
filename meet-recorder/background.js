/**
 * Meet Recorder — Service Worker (Background)
 *
 * Orchestrates the recording lifecycle: manages tabCapture stream IDs,
 * creates/destroys the offscreen document, persists state in session
 * storage, and triggers downloads.
 */

// ── Recording state ──────────────────────────────────────────────────
let state = {
  isRecording: false,
  tabId: null,
  startTime: null,
  elapsed: 0,
  downloadReady: false,
  downloadFilename: null,
  fileSize: 0,
};

// Restore state from session storage on service worker wake-up
chrome.storage.session.get('recorderState', (data) => {
  if (data.recorderState) {
    state = { ...state, ...data.recorderState };
  }
});

// ── Message router ───────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Ignore messages from the offscreen doc that are meant for us
  // but also received by the popup (they'll just ignore them).
  switch (message.type) {
    // ── From popup ──────────────────────────────────────────────
    case 'start-recording':
      startRecording(message.settings).then(sendResponse);
      return true;

    case 'stop-recording':
      stopRecording().then(sendResponse);
      return true;

    case 'get-state':
      sendResponse({ ...state });
      return false;

    case 'discard-recording':
      discardRecording();
      sendResponse({ success: true });
      return false;

    // ── From offscreen ──────────────────────────────────────────
    case 'recording-complete':
      state.isRecording = false;
      state.downloadReady = true;
      state.downloadFilename = message.filename;
      state.fileSize = message.fileSize;
      if (message.elapsed) state.elapsed = message.elapsed;
      persistState();
      return false;

    case 'recording-error':
      state.isRecording = false;
      state.error = message.error;
      persistState();
      return false;

    case 'recording-discarded':
      resetState();
      return false;

    case 'timer-update':
      state.elapsed = message.elapsed;
      // Don't persist on every tick — too frequent
      return false;
  }
});

// ── Start recording ──────────────────────────────────────────────────
async function startRecording(settings) {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      return { success: false, error: 'No active tab found.' };
    }

    if (!tab.url || !tab.url.includes('meet.google.com')) {
      return {
        success: false,
        error: 'Please open a Google Meet tab first.',
      };
    }

    // Get the tab capture stream ID
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tab.id,
    });

    // Ensure offscreen document exists
    await ensureOffscreenDocument();

    // Map quality preset to bitrate
    const qualityMap = {
      low: 1_000_000,
      medium: 2_500_000,
      high: 5_000_000,
      ultra: 8_000_000,
    };

    // Send start command to offscreen recorder
    chrome.runtime.sendMessage({
      type: 'offscreen-start',
      streamId,
      settings: {
        resolution: settings.resolution || '1080p',
        fps: settings.fps || 30,
        qualityBitrate: qualityMap[settings.quality] || qualityMap.high,
      },
    });

    // Update state
    state = {
      isRecording: true,
      tabId: tab.id,
      startTime: Date.now(),
      elapsed: 0,
      downloadReady: false,
      downloadFilename: null,
      fileSize: 0,
    };

    persistState();
    return { success: true };
  } catch (err) {
    console.error('[Background] startRecording error:', err);
    return { success: false, error: err.message };
  }
}

// ── Stop recording ───────────────────────────────────────────────────
async function stopRecording() {
  try {
    chrome.runtime.sendMessage({ type: 'offscreen-stop' });
    state.isRecording = false;
    persistState();
    return { success: true };
  } catch (err) {
    console.error('[Background] stopRecording error:', err);
    return { success: false, error: err.message };
  }
}

// ── Discard recording ────────────────────────────────────────────────
function discardRecording() {
  chrome.runtime.sendMessage({ type: 'offscreen-discard' });
  resetState();
}

// ── Offscreen document management ────────────────────────────────────
async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });

  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Recording Google Meet tab audio and video',
  });
}

// ── State persistence ────────────────────────────────────────────────
function persistState() {
  chrome.storage.session.set({ recorderState: state });
}

function resetState() {
  state = {
    isRecording: false,
    tabId: null,
    startTime: null,
    elapsed: 0,
    downloadReady: false,
    downloadFilename: null,
    fileSize: 0,
  };
  persistState();
}
