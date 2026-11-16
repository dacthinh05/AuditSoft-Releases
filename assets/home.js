/* Trang chủ tenstartup.com: hiện dần các khối khi cuộn tới.
   Thanh menu nằm ở assets/nav.js, dùng chung với các trang sản phẩm.
   Không ghim cuộn: nội dung luôn đọc được kể cả khi tắt JavaScript hoặc giảm chuyển động. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
