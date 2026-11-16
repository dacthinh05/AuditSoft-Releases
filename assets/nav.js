/* Thanh menu dùng chung cho mọi trang tenstartup.com (markup sinh từ get_navbar_html).
   Menu "Sản phẩm", "Tài liệu" và menu điện thoại là popover có sẵn của trình duyệt: nút bấm mở
   bằng popovertarget, tự đóng khi bấm ra ngoài hoặc nhấn Esc, tự trả con trỏ về nút.
   Mã ở đây chỉ làm phần trình duyệt chưa tự làm được:
   - đặt menu ngay dưới nút (CSS neo vị trí chưa có đủ trên các trình duyệt);
   - mở menu khi rê chuột trên máy tính;
   - đóng menu khi chọn một mục dẫn tới chỗ khác trong cùng trang;
   - trình duyệt cũ chưa có popover thì bật tắt bằng class is-open. */
(function () {
  'use strict';
  var header = document.querySelector('.navbar');
  if (!header) return;
  var native = Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'popover');
  var menus = Array.prototype.slice.call(header.querySelectorAll('[popover]'));
  var GAP = 8;

  function triggerOf(menu) { return header.querySelector('[popovertarget="' + menu.id + '"]'); }
  function isOpen(menu) { return native ? menu.matches(':popover-open') : menu.classList.contains('is-open'); }

  function place(menu) {
    if (menu.id === 'navMobileDrawer') {
      var top = Math.max(0, header.getBoundingClientRect().bottom);
      menu.style.top = top + 'px';
      menu.style.maxHeight = (innerHeight - top) + 'px';
      return;
    }
    var r = triggerOf(menu).getBoundingClientRect();
    var width = menu.offsetWidth;
    menu.style.top = (r.bottom + GAP) + 'px';
    menu.style.left = (width ? Math.max(GAP, Math.min(r.left, innerWidth - width - GAP)) : r.left) + 'px';
  }

  function show(menu) {
    if (isOpen(menu)) return;
    if (native) { menu.showPopover({ source: triggerOf(menu) }); return; }
    menus.forEach(hide);
    place(menu);
    menu.classList.add('is-open');
    triggerOf(menu).setAttribute('aria-expanded', 'true');
    place(menu);
  }

  function hide(menu) {
    if (!isOpen(menu)) return;
    if (native) { menu.hidePopover(); return; }
    menu.classList.remove('is-open');
    triggerOf(menu).setAttribute('aria-expanded', 'false');
  }

  menus.forEach(function (menu) {
    // Đặt chỗ trước khi menu hiện để không nháy ở giữa màn hình, rồi chỉnh lại khi đã đo được bề rộng.
    menu.addEventListener('beforetoggle', function (e) { if (e.newState === 'open') place(menu); });
    menu.addEventListener('toggle', function (e) { if (e.newState === 'open') place(menu); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) hide(menu); });
  });

  function placeOpen() { menus.forEach(function (menu) { if (isOpen(menu)) place(menu); }); }
  addEventListener('scroll', placeOpen, { passive: true });
  addEventListener('resize', placeOpen);

  // Rê chuột thì mở xem trước; bấm nút khi đang xem trước thì giữ menu mở thay vì đóng lại.
  var hoverable = matchMedia('(hover: hover) and (pointer: fine)');
  Array.prototype.slice.call(header.querySelectorAll('.nav-dropdown')).forEach(function (item) {
    var trigger = item.querySelector('[popovertarget]');
    var menu = trigger && document.getElementById(trigger.getAttribute('popovertarget'));
    if (!menu) return;
    var preview = false;
    item.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'touch' || !hoverable.matches || isOpen(menu)) return;
      preview = true;
      show(menu);
    });
    item.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'touch' || !preview) return;
      preview = false;
      hide(menu);
    });
    trigger.addEventListener('click', function (e) {
      if (!preview) return;
      preview = false;
      e.preventDefault();
      e.stopImmediatePropagation();
    });
    menu.addEventListener('toggle', function (e) { if (e.newState === 'closed') preview = false; });
    // Tab ra khỏi menu thì đóng menu.
    item.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !item.contains(e.relatedTarget)) { preview = false; hide(menu); }
    });
  });

  // Trình duyệt cũ: nút bấm tự bật tắt menu (gắn sau phần rê chuột để bấm khi đang xem trước vẫn giữ menu mở).
  if (!native) {
    menus.forEach(function (menu) {
      var trigger = triggerOf(menu);
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('click', function () {
        if (isOpen(menu)) hide(menu); else show(menu);
      });
    });
  }
})();
