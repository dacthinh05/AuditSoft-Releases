/* Trang chủ tenstartup.com: menu thả xuống, menu điện thoại và hiện dần các khối.
   Thanh menu dùng chung markup với các trang sản phẩm (get_navbar_html).
   Không ghim cuộn: nội dung luôn đọc được kể cả khi tắt JavaScript hoặc giảm chuyển động. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // Hiện dần từng khối khi cuộn tới; trình duyệt cũ hoặc giảm chuyển động thì hiện ngay.
  var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  function showAll() { blocks.forEach(function (el) { el.classList.add('is-in'); }); }
  addEventListener('beforeprint', showAll);
  if (reduce || !('IntersectionObserver' in window)) { showAll(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  blocks.forEach(function (el) { io.observe(el); });
})();
