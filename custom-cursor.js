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
  var mx = -100, my = -100;   // pointer
  var rx = -100, ry = -100;   // ring (lerps toward pointer for the trail effect)
  var raf = null;

  // trail lerp that goes idle once the ring converges — no per-frame style
  // writes while the mouse is still (keeps the page at full framerate)
  function tick() {
    var dx = mx - rx, dy = my - ry;
    if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
      rx = mx; ry = my;
      ringPos();
      raf = null;
      return;
    }
    rx += dx * 0.22;
    ry += dy * 0.22;
    ringPos();
    raf = requestAnimationFrame(tick);
  }
  function ringPos() {
    ring.style.transform = 'translate(' + (rx - 17) + 'px,' + (ry - 17) + 'px) scale(var(--gps-s, 1))';
  }

  function attach() {
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // retire the old giant cursor glow if present — the ring replaces it
    var oldGlow = document.getElementById('cursorGlow');
    if (oldGlow) oldGlow.style.display = 'none';

    // dot pins to the pointer; the ring trails via the rAF lerp below and
    // settles exactly on the pointer when it stops. Lock/press scaling can't
    // displace either one: scale(var(--gps-s)) sits AFTER the translate, so
    // it scales in place instead of multiplying the position (see CSS).
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!active) {
        active = true;
        document.documentElement.classList.add('gps-cursor-on');
        rx = mx; ry = my; // appear at the pointer, don't fly in from off-screen
      }
      dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px) scale(var(--gps-s, 1))';
      if (raf === null) raf = requestAnimationFrame(tick);
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
