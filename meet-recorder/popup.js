/**
 * Meet Recorder — Popup Controller
 *
 * Manages the popup UI: state display, view navigation, recording controls,
 * settings panel, 24h recordings library, and downloads via IndexedDB + chrome.downloads.
 */

(function () {
  'use strict';

  // ── IndexedDB helpers (shared schema with offscreen.js) ────────────
  const DB_NAME = 'meetRecorderDB';
  const STORE_NAME = 'recordings';
  const DB_VERSION = 1;
  const TTL_24H = 24 * 60 * 60 * 1000;

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAllRecordings() {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => {
          db.close();
          const items = (req.result || []).filter(
            (item) => item.timestamp && Date.now() - item.timestamp <= TTL_24H,
          );
          // Sort newest first
          items.sort((a, b) => b.timestamp - a.timestamp);
          resolve(items);
        };
        req.onerror = () => { db.close(); reject(req.error); };
      });
    } catch (err) {
      return [];
    }
  }

  async function getRecordingById(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => { db.close(); resolve(req.result); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }

  async function deleteRecordingById(id) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
      });
    } catch (_) { }
  }

  // ── DOM refs ─────────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);

  // Headers & Views
  const headerMain     = $('#header-main');
  const headerSubview  = $('#header-subview');
  const subviewTitle   = $('#subview-title');
  const btnNavBack     = $('#btn-nav-back');
  const btnSettings    = $('#btn-settings');
  const btnLibrary     = $('#btn-library');
  const libraryBadge   = $('#library-badge');

  const viewMain       = $('#view-main');
  const viewSettings   = $('#view-settings');
  const viewLibrary    = $('#view-library');

  // Main View elements
  const statusDot       = $('#status-dot');
  const statusText      = $('#status-text');
  const timer           = $('#timer');
  const timerContainer  = $('.timer-container');
  const recordControls  = $('#record-controls');
  const btnRecord       = $('#btn-record');
  const btnRecordIcon   = $('#btn-record-icon');
  const btnRecordLabel  = $('#btn-record-label');
  const errorBar        = $('#error-bar');
  const errorText       = $('#error-text');

  // Post Actions elements
  const postActions     = $('#post-actions');
  const fileSizeEl      = $('#file-size');
  const btnDownload     = $('#btn-download');
  const btnNewRecord    = $('#btn-new-record');
  const btnDiscard      = $('#btn-discard');

  // Library View elements
  const libraryList     = $('#library-list');
  const libraryEmpty    = $('#library-empty');

  // Chip option groups
  const optResolution = $('#opt-resolution');
  const optFps        = $('#opt-fps');
  const optQuality    = $('#opt-quality');

  // ── Settings state ──────────────────────────────────────────────
  let settings = {
    resolution: '1080p',
    fps: 30,
    quality: 'high',
  };

  // Load persisted settings
  chrome.storage.local.get('recorderSettings', (data) => {
    if (data.recorderSettings) {
      settings = { ...settings, ...data.recorderSettings };
      syncChips();
    }
  });

  // ── Timer ───────────────────────────────────────────────────────
  let timerInterval = null;
  let recordingStartTime = 0;

  function startTimer(startTime) {
    recordingStartTime = startTime;
    stopTimer();
    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 200);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const elapsed = Date.now() - recordingStartTime;
    timer.textContent = formatTime(elapsed);
  }

  function formatTime(ms) {
    if (!ms || ms < 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // ── View Navigation ──────────────────────────────────────────────
  function showMainView() {
    viewMain.classList.add('active');
    viewSettings.classList.remove('active');
    viewLibrary.classList.remove('active');

    headerMain.classList.remove('hidden');
    headerSubview.classList.add('hidden');
    refreshState();
  }

  function showSubview(title, targetView) {
    viewMain.classList.remove('active');
    viewSettings.classList.remove('active');
    viewLibrary.classList.remove('active');

    targetView.classList.add('active');
    subviewTitle.textContent = title;

    headerMain.classList.add('hidden');
    headerSubview.classList.remove('hidden');
  }

  btnSettings.addEventListener('click', () => {
    showSubview('Settings', viewSettings);
  });

  btnLibrary.addEventListener('click', () => {
    showSubview('Saved Recordings (24h)', viewLibrary);
    renderLibrary();
  });

  btnNavBack.addEventListener('click', () => {
    showMainView();
  });

  // ── State rendering ─────────────────────────────────────────────
  async function renderState(state) {
    hideError();
    updateLibraryBadge();

    if (state.isRecording) {
      // State B: Recording in progress
      stopTimer();
      statusDot.className = 'status-dot recording';
      statusText.textContent = 'Recording';
      timer.className = 'timer recording';
      timerContainer.classList.add('recording');

      recordControls.classList.remove('hidden');
      postActions.classList.add('hidden');
      setBtnStop();
      lockSettings(true);

      if (state.startTime) {
        startTimer(state.startTime);
      }
    } else if (state.downloadReady) {
      // State C: Recording finished
      stopTimer();
      statusDot.className = 'status-dot done';
      statusText.textContent = 'Recording Complete';
      timer.className = 'timer';
      timerContainer.classList.remove('recording');

      // Display actual final duration
      timer.textContent = formatTime(state.elapsed);

      recordControls.classList.add('hidden');
      postActions.classList.remove('hidden');
      fileSizeEl.textContent = formatFileSize(state.fileSize);
      lockSettings(false);
    } else {
      // State A: Idle / Ready
      stopTimer();
      statusDot.className = 'status-dot';
      statusText.textContent = 'Ready';
      timer.textContent = '00:00:00';
      timer.className = 'timer';
      timerContainer.classList.remove('recording');

      recordControls.classList.remove('hidden');
      postActions.classList.add('hidden');
      setBtnStart();
      lockSettings(false);
    }
  }

  function setBtnStart() {
    btnRecord.className = 'btn-primary btn-start';
    btnRecordLabel.textContent = 'Start Recording';
    btnRecordIcon.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <circle cx="12" cy="12" r="7"/>
      </svg>`;
  }

  function setBtnStop() {
    btnRecord.className = 'btn-primary btn-stop';
    btnRecordLabel.textContent = 'Stop Recording';
    btnRecordIcon.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <rect x="5" y="5" width="14" height="14" rx="2"/>
      </svg>`;
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorBar.classList.remove('hidden');
  }

  function hideError() {
    errorBar.classList.add('hidden');
  }

  function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  // ── Settings lock during recording ──────────────────────────────
  function lockSettings(locked) {
    const chips = viewSettings.querySelectorAll('.chip');
    chips.forEach((chip) => {
      if (locked) {
        chip.classList.add('disabled');
        chip.disabled = true;
      } else {
        chip.classList.remove('disabled');
        chip.disabled = false;
      }
    });
  }

  // ── Chip selection ──────────────────────────────────────────────
  function initChips(container, key) {
    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip || chip.disabled) return;

      // Deselect siblings
      container.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');

      // Update settings
      let value = chip.dataset.value;
      if (key === 'fps') value = parseInt(value, 10);
      settings[key] = value;

      // Persist
      chrome.storage.local.set({ recorderSettings: settings });
    });
  }

  function syncChips() {
    syncChipGroup(optResolution, settings.resolution);
    syncChipGroup(optFps, String(settings.fps));
    syncChipGroup(optQuality, settings.quality);
  }

  function syncChipGroup(container, value) {
    container.querySelectorAll('.chip').forEach((c) => {
      c.classList.toggle('selected', c.dataset.value === value);
    });
  }

  initChips(optResolution, 'resolution');
  initChips(optFps, 'fps');
  initChips(optQuality, 'quality');

  // ── Render Library ──────────────────────────────────────────────
  async function renderLibrary() {
    const items = await getAllRecordings();
    libraryList.innerHTML = '';

    if (items.length === 0) {
      libraryEmpty.classList.remove('hidden');
      return;
    }

    libraryEmpty.classList.add('hidden');

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'recording-card';
      card.innerHTML = `
        <div class="card-info">
          <span class="card-title">${formatDate(item.timestamp)}</span>
          <div class="card-meta">
            <span>${formatTime(item.durationMs)}</span>
            <span>•</span>
            <span>${formatFileSize(item.fileSize)}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-icon btn-dl" data-id="${item.id}" title="Download recording">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button class="btn-ghost btn-del" data-id="${item.id}" title="Delete recording">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;

      card.querySelector('.btn-dl').addEventListener('click', () => downloadItem(item.id));
      card.querySelector('.btn-del').addEventListener('click', async () => {
        await deleteRecordingById(item.id);
        renderLibrary();
        updateLibraryBadge();
      });

      libraryList.appendChild(card);
    });
  }

  async function updateLibraryBadge() {
    const items = await getAllRecordings();
    if (items.length > 0) {
      libraryBadge.textContent = String(items.length);
      libraryBadge.classList.remove('hidden');
    } else {
      libraryBadge.classList.add('hidden');
    }
  }

  async function downloadItem(id) {
    try {
      const data = await getRecordingById(id);
      if (!data || !data.blob) {
        showError('Recording data not found. It may have expired.');
        return;
      }

      const url = URL.createObjectURL(data.blob);

      chrome.downloads.download(
        {
          url,
          filename: data.filename || `meet-recording-${id}.webm`,
          saveAs: true,
        },
        () => {
          if (chrome.runtime.lastError) {
            showError('Download failed: ' + chrome.runtime.lastError.message);
            URL.revokeObjectURL(url);
          } else {
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
          }
        },
      );
    } catch (err) {
      showError('Download error: ' + err.message);
    }
  }

  // ── Recording controls ─────────────────────────────────────────
  btnRecord.addEventListener('click', async () => {
    const state = await sendMessage({ type: 'get-state' });

    if (state && state.isRecording) {
      // Stop recording
      const result = await sendMessage({ type: 'stop-recording' });
      if (result && !result.success) {
        showError(result.error || 'Failed to stop recording.');
      }
    } else {
      // Start recording
      hideError();
      const result = await sendMessage({
        type: 'start-recording',
        settings,
      });
      if (result && !result.success) {
        showError(result.error || 'Failed to start recording.');
      }
    }

    setTimeout(refreshState, 300);
  });

  // Download latest completed recording
  btnDownload.addEventListener('click', async () => {
    const items = await getAllRecordings();
    if (items.length > 0) {
      downloadItem(items[0].id);
    } else {
      showError('No recording available.');
    }
  });

  // Start new recording from completed view
  btnNewRecord.addEventListener('click', () => {
    sendMessage({ type: 'discard-recording' });
    renderState({ isRecording: false, downloadReady: false });
  });

  // Discard latest recording
  btnDiscard.addEventListener('click', async () => {
    const items = await getAllRecordings();
    if (items.length > 0) {
      await deleteRecordingById(items[0].id);
    }
    sendMessage({ type: 'discard-recording' });
    renderState({ isRecording: false, downloadReady: false });
  });

  // ── Messaging helper ───────────────────────────────────────────
  function sendMessage(msg) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('[Popup] sendMessage error:', chrome.runtime.lastError.message);
            resolve(null);
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        console.warn('[Popup] sendMessage exception:', err);
        resolve(null);
      }
    });
  }

  // ── Listen for state updates from background ───────────────────
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'recording-complete') {
      refreshState();
    }
  });

  // ── Initial state fetch ─────────────────────────────────────────
  async function refreshState() {
    const state = await sendMessage({ type: 'get-state' });
    if (state) renderState(state);
  }

  refreshState();
  updateLibraryBadge();

  // Poll to keep timer smooth while popup is open
  setInterval(refreshState, 1000);
})();
