/* Trang chủ tenstartup.com: menu, và sổ dấu tick trên vạch chia.
   Engine Scroll Craft (scrollcraft.js) lo pin, parallax, lau ảnh, hiện dần.
   File này lo phần riêng của trang:
   - đoạn đối chiếu: mỗi dòng làm tay bị gạch, dòng phần mềm hiện ra, một dấu
     tick đóng lên vạch chia ngang dòng đó và ở lại;
   - đoạn đỉnh: vạch chia và nền xám cuốn sang mép trái (--collapse 0..1), các
     dấu tick rơi vào Giấy làm việc "Đã soát".
   Thanh menu dùng chung markup với các trang sản phẩm (get_navbar_html). */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = matchMedia('(max-width: 860px)');
  var root = document.documentElement;

  // Menu thả xuống "Sản phẩm" và "Tài liệu".
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-dropdown'));
  function setDropdown(dd, open) {
    dd.classList.toggle('is-open', open);
    var btn = dd.querySelector('.nav-dropdown-toggle');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  dropdowns.forEach(function (dd) {
    var btn = dd.querySelector('.nav-dropdown-toggle');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !dd.classList.contains('is-open');
        dropdowns.forEach(function (other) { setDropdown(other, false); });
        setDropdown(dd, open);
      });
    }
    if (finePointer) {
      dd.addEventListener('mouseenter', function () { setDropdown(dd, true); });
      dd.addEventListener('mouseleave', function () { setDropdown(dd, false); });
    }
  });
  document.addEventListener('click', function (e) {
    dropdowns.forEach(function (dd) { if (!dd.contains(e.target)) setDropdown(dd, false); });
  });

  // Menu điện thoại.
  var burger = document.getElementById('navMobileBtn');
  var drawer = document.getElementById('navMobileDrawer');
  function setDrawer(open) {
    if (!burger || !drawer) return;
    drawer.style.display = open ? 'block' : 'none';
    burger.setAttribute('aria-expanded', String(open));
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () { setDrawer(drawer.style.display !== 'block'); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    dropdowns.forEach(function (dd) { setDropdown(dd, false); });
    if (drawer && drawer.style.display === 'block') { setDrawer(false); burger.focus(); }
  });

  // ---------------------------------------------------- sổ dấu tick ----
  var ledger = document.getElementById('comparison');
  var peak = document.getElementById('dung-thu');
  if (!ledger || !peak) return;
  var stage = ledger.querySelector('[data-sc-stage]');
  var rows = Array.prototype.slice.call(ledger.querySelectorAll('.ledger__row'));
  var dividerTicks = Array.prototype.slice.call(document.querySelectorAll('.divider__ticks .tick'));
  var railTicks = Array.prototype.slice.call(document.querySelectorAll('.tick-rail .tick'));
  var rail = document.querySelector('.tick-rail');
  var wp = peak.querySelector('.wp');
  var wpItems = Array.prototype.slice.call(peak.querySelectorAll('.wp__item'));

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  // Tiến độ của một đoạn pin: 0 khi đỉnh đoạn chạm đỉnh màn hình, 1 khi hết pin.
  function progress(el) {
    var r = el.getBoundingClientRect();
    return clamp(-r.top / Math.max(r.height - innerHeight, 1));
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  // Dấu tick trên vạch chia nằm ngang đúng dòng của nó khi đoạn đối chiếu đang pin.
  // Vị trí đo trong khung pin nên không phụ thuộc vị trí cuộn.
  var struck = peak.querySelector('.peak__manual');
  function placeTicks() {
    // Điện thoại: khối phần mềm ở đỉnh nằm dưới danh sách việc bị gạch cho tới khi cột sập.
    if (struck) peak.style.setProperty('--struck-h', (struck.offsetHeight + 8) + 'px');
    var top = stage.getBoundingClientRect().top;
    rows.forEach(function (row, i) {
      var r = row.getBoundingClientRect();
      var y = Math.round(r.top - top + r.height / 2);
      if (!dividerTicks[i]) return;
      dividerTicks[i].style.setProperty('--y', y + 'px');
      // Chỗ gom ở đỉnh vạch chia, ngay dưới hai nhãn.
      dividerTicks[i].style.setProperty('--dy', (PARK_TOP + i * PARK_STEP - y) + 'px');
    });
  }
  var divider = document.querySelector('.divider');
  var PARK_TOP = 64, PARK_STEP = 22;

  var START = 0.06, STEP = 0.13, RUN = 0.09;
  var last = '';
  function frame() {
    ticking = false;
    var lp = progress(ledger);
    var done = 0;
    rows.forEach(function (row, i) {
      var r = clamp((lp - START - i * STEP) / RUN);
      if (reduce) r = r > 0 ? 1 : 0;
      row.style.setProperty('--r', r.toFixed(3));
      var on = r >= 0.999;
      row.classList.toggle('is-done', on);
      if (on) done++;
    });

    // Đỉnh: 0..0,12 nín thở, 0,12..0,55 sập cột, tick rơi vào Giấy làm việc từ 0,40.
    var pp = progress(peak);
    var c = clamp((pp - 0.12) / 0.43);
    c = reduce ? (pp > 0.3 ? 1 : 0) : ease(c);
    // Rời bảng đối chiếu thì tick gom lên đỉnh vạch chia; giữa hai đoạn đối chiếu
    // (ba phần mềm, quy trình) nhãn hai phía tắt vì cột trái không còn là "làm tay" của cột phải.
    var vh = innerHeight;
    var parked = ledger.getBoundingClientRect().bottom < vh * 0.85;
    var quiet = parked && peak.getBoundingClientRect().top > vh * 0.2;
    var key = done + '|' + c.toFixed(4) + '|' + pp.toFixed(3) + '|' + parked + quiet;
    if (key === last) return;
    last = key;
    if (divider) {
      divider.classList.toggle('is-parked', parked);
      divider.style.setProperty('--label-on', quiet ? '0' : '1');
    }
    root.style.setProperty('--collapse', c.toFixed(4));
    root.classList.toggle('is-collapsed', c >= 1);

    // Các dấu tick đã đóng ở lại cho tới khi rơi vào Giấy làm việc.
    var fallen = 0;
    wpItems.forEach(function (it, i) {
      var on = pp >= 0.40 + i * 0.045;
      it.classList.toggle('is-on', on);
      if (on) fallen++;
    });
    wp.classList.toggle('is-done', fallen === wpItems.length);
    var kept = Math.max(done, 0);
    dividerTicks.forEach(function (t, i) { t.classList.toggle('is-on', i < kept && i >= fallen); });
    railTicks.forEach(function (t, i) { t.classList.toggle('is-on', i < kept && i >= fallen); });
    if (rail) rail.classList.toggle('is-shown', kept > 0 && !quiet && fallen < wpItems.length && c < 1);
  }

  var ticking = false;
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', function () { placeTicks(); last = ''; request(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeTicks(); last = ''; request(); });
  if (small.addEventListener) small.addEventListener('change', function () { placeTicks(); last = ''; request(); });
  placeTicks();
  frame();
})();
