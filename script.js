// ---------- helpers ----------
function $(id) { return document.getElementById(id); }
function on(id, fn) { var e = $(id); if (e) e.addEventListener('click', fn); }
function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ---------- WhatsApp welcome popup ----------
var pop = $('pp') || document.createElement('div');
on('pt', function () { pop.classList.toggle('o'); });
on('pc', function () { pop.classList.remove('o'); });
setTimeout(function () { pop.classList.add('o'); }, 3000);

// ---------- Join form ----------
(function () {
  var f = $('jf'); if (!f) return;
  var st = $('fs');
  function say(msg, ok) { st.textContent = msg; st.className = 'fs ' + (ok ? 'ok' : 'bad'); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('n').value.trim(), phone = $('p').value.trim(), ward = $('w').value.trim();
    if (!name || !phone) { say('Please enter your name and phone number.', false); return; }
    if (!$('cn').checked) { say('Please tick the box so we may contact you.', false); return; }
    var url = (typeof CONFIG !== 'undefined' && CONFIG.formEndpoint) || '';
    if (url) {
      var btn = $('js'); btn.disabled = true; say('Sending…', true);
      fetch(url, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                   body: JSON.stringify({ name: name, phone: phone, ward: ward }) })
        .then(function (r) { if (!r.ok) throw 0; say('Asante! You are in. We will contact you soon.', true); f.reset(); })
        .catch(function () { say('Could not send. Please try again or message us on WhatsApp.', false); })
        .then(function () { btn.disabled = false; });
    } else {
      var mail = (typeof CONFIG !== 'undefined' && CONFIG.email) || 'kondo4senator2027@gmail.com';
      var body = 'Name: ' + name + '\nPhone: ' + phone + '\nWard: ' + ward + '\nI want to join the movement.';
      location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Join the campaign') + '&body=' + encodeURIComponent(body);
      say('Your email app is opening. Press send to finish.', true);
    }
  });
})();

// ---------- Copy M-Pesa number ----------
on('cp', function () {
  var b = $('cp');
  try { navigator.clipboard.writeText('0716635052'); b.textContent = 'Copied ✓'; }
  catch (e) { b.textContent = '0716635052'; }
});

// ---------- Events ----------
(function () {
  var M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var list = $('evl');
  if (!list) return;
  var ev = (typeof EVENTS !== 'undefined' ? EVENTS : []).slice()
    .sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  if (!ev.length) {
    list.innerHTML = '<div class="em">New events will be announced here soon. Follow us on WhatsApp for updates.</div>';
    return;
  }
  list.innerHTML = ev.map(function (e) {
    var p = e.d.split('-');
    return '<div class="ev"><div class="d">' + esc(p[2] || '') + '<small>' + M[(+p[1] || 1) - 1] +
      '</small></div><div><b>' + esc(e.t) + '</b><p>' + esc(e.l || '') + '</p></div></div>';
  }).join('');
})();

// ---------- Gallery: photos + short videos, auto-scrolling ----------
(function () {
  var g = $('gl'), lb = $('lb'), lbi = $('lbi'), lbv = $('lbv');
  if (!g || !lb) return;
  var items = (typeof GALLERY !== 'undefined' ? GALLERY : []);
  if (!items.length) { g.parentNode.style.display = 'none'; return; }
  var html = '';
  for (var round = 0; round < 2; round++) {          // listed twice for the endless loop
    items.forEach(function (it, k) {
      if (it.type === 'video') {
        html += '<div class="gi" data-k="' + k + '"><video src="' + esc(it.src) + '#t=0.1" ' +
          (it.poster ? 'poster="' + esc(it.poster) + '" ' : '') +
          'preload="metadata" muted playsinline></video><span class="pl">▶</span></div>';
      } else {
        html += '<div class="gi" data-k="' + k + '"><img src="' + esc(it.src) + '" alt="' + esc(it.alt || '') + '"></div>';
      }
    });
  }
  g.innerHTML = html;
  function closeLb() { lb.classList.remove('o'); lbv.pause(); lbv.removeAttribute('src'); lbv.style.display = 'none'; lbi.style.display = 'none'; }
  g.addEventListener('click', function (e) {
    var box = e.target.closest ? e.target.closest('.gi') : null;
    if (!box) return;
    var it = items[+box.getAttribute('data-k')];
    if (it.type === 'video') {
      lbi.style.display = 'none'; lbv.style.display = 'block'; lbv.src = it.src;
      if (it.poster) lbv.poster = it.poster;
      lb.classList.add('o'); lbv.play();
    } else {
      lbv.style.display = 'none'; lbi.style.display = 'block'; lbi.src = it.src; lb.classList.add('o');
    }
  });
  lb.addEventListener('click', function (e) { if (e.target !== lbv) closeLb(); });
})();

// ---------- Hide any photo that fails to load ----------
Array.prototype.forEach.call(document.querySelectorAll('img'), function (img) {
  img.addEventListener('error', function () { img.style.display = 'none'; });
});

// ---------- Social links (from config.js) ----------
(function () {
  var box = $('soc'); if (!box) return;
  var soc = (typeof CONFIG !== 'undefined' && CONFIG.social) || {}, html = '';
  Object.keys(soc).forEach(function (k) {
    if (soc[k]) html += '<a href="' + esc(soc[k]) + '" target="_blank" rel="noopener">' + esc(k) + '</a>';
  });
  if (html) box.innerHTML = html; else box.style.display = 'none';
})();

// ---------- Footer year ----------
(function () { var y = $('yr'); if (y) y.textContent = new Date().getFullYear(); })();

// ---------- Analytics (only if an ID is set in config.js) ----------
(function () {
  var id = typeof CONFIG !== 'undefined' && CONFIG.analyticsId;
  if (!id) return;
  var s = document.createElement('script'); s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date()); gtag('config', id);
})();

// ---------- Hamburger menu ----------
(function () {
  var bg = $('bg'), menu = $('menu');
  if (!bg || !menu) return;
  function setOpen(o) {
    menu.classList.toggle('o', o);
    bg.setAttribute('aria-expanded', o ? 'true' : 'false');
    bg.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  }
  bg.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!menu.classList.contains('o')); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
  document.addEventListener('click', function (e) { if (!menu.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 860) setOpen(false); });
})();
