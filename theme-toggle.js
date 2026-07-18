/**
 * Global Pest Supplies — Light/Dark theme system
 * Load synchronously in <head> (before <body>) so the data-theme attribute
 * is set pre-paint and the page never flashes the wrong theme.
 *
 * Order of precedence: saved choice (localStorage) → system preference → dark.
 * The toggle button is injected into .nav-right on DOMContentLoaded.
 */
(function () {
  var KEY = 'gps_theme';

  function preferred() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light' : 'dark';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  apply(preferred());

  window.gpsSetTheme = function (theme) {
    // brief transition class = smooth swap without animating page load
    var html = document.documentElement;
    html.classList.add('theme-switching');
    apply(theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    });
    clearTimeout(window.__gpsThemeT);
    window.__gpsThemeT = setTimeout(function () {
      html.classList.remove('theme-switching');
    }, 400);
  };

  window.gpsToggleTheme = function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    window.gpsSetTheme(cur === 'light' ? 'dark' : 'light');
  };

  function buildToggle() {
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Switch between dark and light theme');
    btn.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'light' ? 'true' : 'false');
    btn.title = 'Toggle light / dark theme';
    btn.innerHTML =
      '<span class="theme-toggle-track" aria-hidden="true">' +
        '<svg class="tt-icon tt-moon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>' +
        '<svg class="tt-icon tt-sun" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2 12h2.4M19.6 12H22M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/></svg>' +
        '<span class="theme-toggle-thumb"></span>' +
      '</span>';
    btn.addEventListener('click', window.gpsToggleTheme);
    return btn;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var navRight = document.querySelector('.nav-right');
    if (!navRight || navRight.querySelector('.theme-toggle')) return;
    navRight.insertBefore(buildToggle(), navRight.firstChild);
  });
})();
