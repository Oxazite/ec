/**
 * Meet Recorder — Offscreen Recorder Engine
 *
 * Runs inside an invisible offscreen document. Receives a tab-capture
 * stream ID from the service worker, starts a MediaRecorder, collects
 * chunks, and stores the final recording in IndexedDB for the popup
 * to download.
 *
 * NOTE: Offscreen documents only have access to chrome.runtime messaging
 * APIs — NOT chrome.downloads, chrome.tabs, etc. All download logic
 * lives in the popup, which reads from the shared IndexedDB.
 */

let mediaRecorder = null;
let recordedChunks = [];
let mediaStream = null;
let audioCtx = null;
let startTime = 0;
let timerInterval = null;

// ── IndexedDB helpers (shared schema with popup.js) ──────────────────
const DB_NAME = 'meetRecorderDB';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;
const TTL_24H = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeRecordingItem(item) {
  const db = await openDB();
  await purgeExpiredRecordings(db);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(item, item.id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function purgeExpiredRecordings(dbInstance) {
  try {
    const db = dbInstance || await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      const now = Date.now();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const data = cursor.value;
          if (data.timestamp && (now - data.timestamp > TTL_24H)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
      tx.oncomplete = () => { if (!dbInstance) db.close(); resolve(); };
      tx.onerror = () => { if (!dbInstance) db.close(); resolve(); };
    });
  } catch (_) { }
}

// ── Message handler ──────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'offscreen-start':
      handleStart(message.streamId, message.settings)
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true; // async

    case 'offscreen-stop':
      handleStop();
      sendResponse({ success: true });
      return false;

    case 'offscreen-discard':
      handleDiscard()
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true; // async because of clearRecording
  }
});

// ── Start recording ──────────────────────────────────────────────────
async function handleStart(streamId, settings) {
  const { resolution, fps, qualityBitrate } = settings;

  // Build constraints from the stream ID upfront (tabCapture requires mandatory block)
  const videoConstraints = {
    chromeMediaSource: 'tab',
    chromeMediaSourceId: streamId,
    maxFrameRate: fps || 30,
  };

  if (resolution !== 'original') {
    const [w, h] = resolution === '720p' ? [1280, 720] : [1920, 1080];
    videoConstraints.maxWidth = w;
    videoConstraints.maxHeight = h;
  }

  const constraints = {
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
    video: {
      mandatory: videoConstraints,
    },
  };

  mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

  // ── Audio passthrough — keep tab audio audible for the user ──────
  // tabCapture mutes the tab by default; re-route audio tracks through AudioContext.
  const audioTracks = mediaStream.getAudioTracks();
  if (audioTracks.length > 0) {
    audioCtx = new AudioContext();
    const audioStream = new MediaStream(audioTracks);
    const source = audioCtx.createMediaStreamSource(audioStream);
    source.connect(audioCtx.destination);
  }

  // ── Choose MIME type ─────────────────────────────────────────────
  const mimeType = getMimeType();

  // ── MediaRecorder ────────────────────────────────────────────────
  recordedChunks = [];

  const recorderOptions = { mimeType };
  if (qualityBitrate) {
    recorderOptions.videoBitsPerSecond = qualityBitrate;
  }

  mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    finishRecording().catch((err) => {
      console.error('[Offscreen] Error finishing recording:', err);
      chrome.runtime.sendMessage({
        type: 'recording-error',
        error: err.message || 'Failed to save recording',
      });
    });
  };

  mediaRecorder.onerror = (event) => {
    console.error('[Offscreen] MediaRecorder error:', event.error);
    chrome.runtime.sendMessage({
      type: 'recording-error',
      error: event.error?.message || 'Unknown recording error',
    });
    cleanupStream();
  };

  // Start continuous recording (no timeslice fragmentation — fixes 1-second freeze bug)
  mediaRecorder.start();
  startTime = Date.now();

  // Timer updates for the popup
  timerInterval = setInterval(() => {
    try {
      chrome.runtime.sendMessage({
        type: 'timer-update',
        elapsed: Date.now() - startTime,
      });
    } catch (_) {
      // Popup or background might not be listening
    }
  }, 500);

  console.log('[Offscreen] Recording started', { mimeType, qualityBitrate, resolution, fps });
}

// ── Stop recording ───────────────────────────────────────────────────
function handleStop() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ── Discard current recording data ───────────────────────────────────
async function handleDiscard() {
  handleStop();
  recordedChunks = [];
  cleanupStream();
  chrome.runtime.sendMessage({ type: 'recording-discarded' });
}

// ── Assemble blob, patch WebM metadata, store in IndexedDB ────────────
async function finishRecording() {
  const mimeType = getMimeType();
  const rawBlob = new Blob(recordedChunks, { type: mimeType });
  const durationMs = startTime > 0 ? Date.now() - startTime : 0;

  // Patch WebM header duration & timecodes so the video is seekable
  let finalBlob = rawBlob;
  if (typeof window.ysFixWebmDuration === 'function' && durationMs > 0) {
    try {
      finalBlob = await window.ysFixWebmDuration(rawBlob, durationMs);
    } catch (err) {
      console.warn('[Offscreen] Could not patch WebM duration header:', err);
    }
  }

  const fileSize = finalBlob.size;
  const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  const filename = `meet-recording-${timestamp}.${ext}`;
  const id = `rec_${Date.now()}`;

  const recordingItem = {
    id,
    blob: finalBlob,
    filename,
    timestamp: Date.now(),
    durationMs,
    fileSize,
  };

  // Store fixed blob in IndexedDB (persists on disk across sessions for 24h)
  await storeRecordingItem(recordingItem);

  // Free chunk memory now that the blob is persisted
  recordedChunks = [];

  // Notify background that recording is ready
  chrome.runtime.sendMessage({
    type: 'recording-complete',
    id,
    filename,
    fileSize,
    elapsed: durationMs,
  });

  // Clean up stream/audio resources
  cleanupStream();
  console.log('[Offscreen] Recording finished & stored in IndexedDB (24h retention)', {
    id,
    durationMs,
    fileSize,
    filename,
  });
}

// ── Cleanup stream/audio resources ───────────────────────────────────
function cleanupStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
  mediaRecorder = null;
}

// ── MIME type selection ──────────────────────────────────────────────
function getMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'video/webm';
}
