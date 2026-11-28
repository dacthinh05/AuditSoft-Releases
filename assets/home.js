/* Trang chủ tenstartup.com: hiện dần các khối khi cuộn tới.
   Thanh menu nằm ở assets/nav.js, dùng chung với các trang sản phẩm.
   Không ghim cuộn: nội dung luôn đọc được kể cả khi tắt JavaScript hoặc giảm chuyển động. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hiện dần từng khối khi cuộn tới; trình duyệt cũ hoặc giảm chuyển động thì hiện ngay.
  // Giấy làm việc (.wp) có ngưỡng riêng cao hơn để chuỗi tick và đóng dấu chạy khi người đọc đã thấy rõ khối.
  var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var sheets = Array.prototype.slice.call(document.querySelectorAll('.wp'));
  function showAll() { blocks.concat(sheets).forEach(function (el) { el.classList.add('is-in'); }); }
  addEventListener('beforeprint', showAll);
  if (reduce || !('IntersectionObserver' in window)) { showAll(); return; }
  function watch(targets, options) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, options);
    targets.forEach(function (el) { io.observe(el); });
  }
  watch(blocks, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  watch(sheets, { threshold: 0.4 });
})();
