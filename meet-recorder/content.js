/**
 * Meet Recorder — Visibility Override (Content Script)
 * 
 * Injected into Google Meet pages in MAIN world at document_start.
 * Overrides Page Visibility API, focus detection, and IntersectionObserver
 * so that Meet continues rendering all video feeds even when the tab is
 * backgrounded or the browser is minimized.
 */

(function () {
  'use strict';

  // ── Page Visibility API ────────────────────────────────────────────
  Object.defineProperty(document, 'visibilityState', {
    get: () => 'visible',
    configurable: true,
  });

  Object.defineProperty(document, 'hidden', {
    get: () => false,
    configurable: true,
  });

  // Suppress visibilitychange events — capture phase so we intercept
  // before Meet's listeners fire
  const stopEvent = (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
  };

  document.addEventListener('visibilitychange', stopEvent, true);

  // Also block on the window target (some libraries attach there)
  window.addEventListener('visibilitychange', stopEvent, true);

  // ── Focus / Blur ───────────────────────────────────────────────────
  // Suppress blur events on window to prevent Meet from detecting tab switch
  window.addEventListener('blur', (e) => {
    e.stopImmediatePropagation();
  }, true);

  // ── Page Lifecycle API (freeze / resume) ────────────────────────────
  // Chrome may fire 'freeze' when a tab is backgrounded; suppress it.
  document.addEventListener('freeze', (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
  }, true);

  document.addEventListener('resume', (e) => {
    e.stopImmediatePropagation();
  }, true);

  // Periodically dispatch synthetic focus events to reinforce "active" state
  setInterval(() => {
    window.dispatchEvent(new FocusEvent('focus'));
  }, 2000);

  // Override document.hasFocus() — always true
  const _origHasFocus = document.hasFocus.bind(document);
  document.hasFocus = () => true;

  // ── requestAnimationFrame Keep-Alive ───────────────────────────────
  // Chrome completely pauses requestAnimationFrame when a tab is backgrounded
  // or minimized. Google Meet uses rAF to drive canvas/video render loops.
  // We wrap rAF so if it takes longer than 33ms to fire, it falls back to a
  // 33ms timer (~30 FPS) to keep Meet's video renderer actively painting frames!
  const _origRAF = window.requestAnimationFrame.bind(window);

  window.requestAnimationFrame = function (cb) {
    let fired = false;
    const fallbackTimer = setTimeout(() => {
      if (!fired) {
        fired = true;
        cb(performance.now());
      }
    }, 33); // ~30 FPS fallback

    return _origRAF((time) => {
      if (!fired) {
        fired = true;
        clearTimeout(fallbackTimer);
        cb(time);
      }
    });
  };

  // ── IntersectionObserver ───────────────────────────────────────────
  // Google Meet uses IntersectionObserver to detect off-screen video tiles
  // and pause their rendering. We patch it to always report full visibility.

  const OriginalIO = window.IntersectionObserver;

  class FakeIntersectionObserver {
    constructor(callback, options) {
      this._callback = callback;
      this._targets = new Set();
      this._options = options || {};

      // Wrap the real observer so we still get notified when elements
      // are observed/unobserved, but we override the reported entries.
      this._real = new OriginalIO((entries) => {
        const faked = entries.map((entry) => this._fakeEntry(entry));
        try {
          callback(faked, this);
        } catch (_) { /* swallow errors from Meet's handler */ }
      }, options);
    }

    // Some code reads observer.root / observer.thresholds
    get root() {
      return this._options.root || null;
    }

    get rootMargin() {
      return this._options.rootMargin || '0px 0px 0px 0px';
    }

    get thresholds() {
      const t = this._options.threshold;
      if (Array.isArray(t)) return Object.freeze([...t]);
      if (typeof t === 'number') return Object.freeze([t]);
      return Object.freeze([0]);
    }

    _fakeEntry(entry) {
      const rect = entry.target.getBoundingClientRect();
      return {
        boundingClientRect: rect,
        intersectionRatio: 1,
        intersectionRect: rect,
        isIntersecting: true,
        isVisible: true,
        rootBounds: entry.rootBounds || null,
        target: entry.target,
        time: entry.time || performance.now(),
      };
    }

    observe(target) {
      this._targets.add(target);
      this._real.observe(target);

      // Immediately report this target as fully visible
      queueMicrotask(() => {
        const rect = target.getBoundingClientRect();
        try {
          this._callback(
            [{
              boundingClientRect: rect,
              intersectionRatio: 1,
              intersectionRect: rect,
              isIntersecting: true,
              isVisible: true,
              rootBounds: null,
              target,
              time: performance.now(),
            }],
            this,
          );
        } catch (_) { }
      });
    }

    unobserve(target) {
      this._targets.delete(target);
      this._real.unobserve(target);
    }

    disconnect() {
      this._targets.clear();
      this._real.disconnect();
    }

    takeRecords() {
      return [];
    }
  }

  // Preserve prototype chain expectations
  Object.defineProperty(FakeIntersectionObserver, 'name', { value: 'IntersectionObserver' });
  window.IntersectionObserver = FakeIntersectionObserver;

  console.log('[Meet Recorder] Visibility overrides active ✓');
})();
