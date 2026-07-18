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

  var mx = -100, my = -100;   // mouse
  var rx = -100, ry = -100;   // ring (lerped)
  var active = false;

  function attach() {
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // retire the old giant cursor glow if present — the ring replaces it
    var oldGlow = document.getElementById('cursorGlow');
    if (oldGlow) oldGlow.style.display = 'none';

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!active) {
        active = true;
        document.documentElement.classList.add('gps-cursor-on');
        rx = mx; ry = my;
      }
      dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)';
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
        // snap the ring onto the cursor so it doesn't visibly lag behind
        // while it's also scaling up to the lock size
        rx = mx; ry = my;
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

    (function loop() {
      // follow tightly enough that the ring stays visually attached to the dot
      rx += (mx - rx) * 0.35;
      ry += (my - ry) * 0.35;
      ring.style.transform = 'translate(' + (rx - 17) + 'px,' + (ry - 17) + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach);
})();
