/**
 * Global Pest Supplies — Pest-radar cursor (decorative only)
 * Small dot + trailing glow ring that "locks on" over interactive elements.
 * Automatically disabled on touch devices and for prefers-reduced-motion;
 * the native cursor is only hidden while the custom one is active, so the
 * site remains fully usable without it.
 */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.__gpsCursorInit) return;
  window.__gpsCursorInit = true;

  var dot = document.createElement('div');
  var ring = document.createElement('div');
  dot.className = 'gps-cursor-dot';
  ring.className = 'gps-cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');

  var active = false;

  function attach() {
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // retire the old giant cursor glow if present — the ring replaces it
    var oldGlow = document.getElementById('cursorGlow');
    if (oldGlow) oldGlow.style.display = 'none';

    // both elements track the pointer exactly — no trailing lerp, so the
    // ring can never drift away from the dot on hover, click, or scroll
    document.addEventListener('mousemove', function (e) {
      if (!active) {
        active = true;
        document.documentElement.classList.add('gps-cursor-on');
      }
      // scale(var(--gps-s)) AFTER the translate so lock/press effects scale the
      // element in place instead of multiplying its position (see CSS comment)
      dot.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 3) + 'px) scale(var(--gps-s, 1))';
      ring.style.transform = 'translate(' + (e.clientX - 17) + 'px,' + (e.clientY - 17) + 'px) scale(var(--gps-s, 1))';
    }, { passive: true });

    // hide when the pointer leaves the window
    document.addEventListener('mouseleave', function () {
      active = false;
      document.documentElement.classList.remove('gps-cursor-on');
    });

    // lock-on state over interactive elements (event delegation so
    // dynamically rendered product cards are covered too)
    var HOT = 'a, button, [role="tab"], input, select, textarea, .pcard, .pest-tab, .finder-option, .finder-pest-btn, .kit-card, .kit-loadout-card, .path-panel, .guide-file, .cmd-path, .pest-chip, .theme-toggle';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOT)) {
        ring.classList.add('lock');
        dot.classList.add('lock');
      }
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(HOT)) {
        ring.classList.remove('lock');
        dot.classList.remove('lock');
      }
    }, { passive: true });

    document.addEventListener('mousedown', function () { ring.classList.add('press'); });
    document.addEventListener('mouseup',   function () { ring.classList.remove('press'); });
  }

  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach);
})();
