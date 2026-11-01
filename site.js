/* El Alfy Holding — site motion and behaviour. No dependencies (Lenis optional).
   Seven motions from the Standard, all on the reader's scroll except M7:
   M1 [data-read]  words light 22% → 100% from 230 px to 560 px after the paragraph enters, 60 px a word
   M2 [data-pic]   frame opens from a 14% top clip, 48 px low, 15% → 100% (entry 0% → cover 32%); photo 108% → 100% over the pass
   M3 [data-cap]   14 px low, 0 → 1 (entry 40% → cover 28%)
   M4 .row > .txt  sticky, top 120 px (CSS)
   M5 [data-rule]  draws from the left (entry 0% → cover 30%)
   M6 header       84 → 64 px over the first 240 px of scroll
   M7 [data-m7]    opening headline, word by word, once on load
   Plus: tone (Onyx / Limestone) follows the section at mid-screen; filters; menu; project viewer; forms. */
(function () {
  var d = document.documentElement, W = window;
  var q = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var stat = /[?&]static\b/.test(location.search);
  var reduce = W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = !stat && !reduce && 'IntersectionObserver' in W;
  d.classList.add(motion ? 'js-motion' : 'html-static');
  var touch = W.matchMedia && matchMedia('(hover: none)').matches;

  /* ---------- menu ---------- */
  var pm = document.querySelector('.panel-menu'), mb = document.querySelector('.menu-btn');
  if (pm && mb) {
    var close = pm.querySelector('.close-btn');
    var set = function (o) { pm.classList.toggle('open', o); mb.setAttribute('aria-expanded', o); document.body.classList.toggle('lock', o); if (o) close.focus(); else mb.focus(); };
    mb.addEventListener('click', function () { set(true); });
    close.addEventListener('click', function () { set(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && pm.classList.contains('open')) set(false); });
  }

  /* ---------- filters: .filters[data-for][data-key] buttons[data-v]; items carry data-<key> (space-separated) ---------- */
  q('.filters[data-for]').forEach(function (g) {
    var target = document.querySelector(g.getAttribute('data-for')), key = g.getAttribute('data-key');
    if (!target) return;
    target._f = target._f || {};
    q('button', g).forEach(function (b) {
      b.addEventListener('click', function () {
        q('button', g).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        target._f[key] = b.getAttribute('data-v');
        var shown = 0;
        q('[data-item]', target).forEach(function (it) {
          var ok = Object.keys(target._f).every(function (k) { var v = target._f[k]; return v === 'all' || (' ' + (it.getAttribute('data-' + k) || '') + ' ').indexOf(' ' + v + ' ') > -1; });
          it.hidden = !ok; if (ok) shown++;
        });
        var cnt = document.querySelector('[data-count-for="' + g.getAttribute('data-for') + '"]'); if (cnt) cnt.textContent = shown;
        var empty = target.querySelector('[data-empty]'); if (empty) empty.hidden = shown > 0;
        if (motion) requestAnimationFrame(run);
      });
    });
  });
  /* logo wall dims instead of hiding */
  q('.filters[data-dim]').forEach(function (g) {
    var wall = document.querySelector(g.getAttribute('data-dim'));
    q('button', g).forEach(function (b) { b.addEventListener('click', function () {
      q('button', g).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var v = b.getAttribute('data-v'); wall.classList.toggle('f', v !== 'all');
      q('.lg', wall).forEach(function (l) { l.classList.toggle('on', v === 'all' || l.getAttribute('data-g') === v); });
    }); });
  });

  /* ---------- brand panels ---------- */
  var pans = q('.bpanel');
  pans.forEach(function (p) { ['mouseenter', 'focus'].forEach(function (ev) { p.addEventListener(ev, function () { pans.forEach(function (x) { x.classList.toggle('open', x === p); }); }); }); });

  /* ---------- forms: no back end in this build; confirm in place ---------- */
  q('form[data-demo]').forEach(function (f) {
    q('.file input', f).forEach(function (inp) { inp.addEventListener('change', function () { var s = inp.closest('.file').querySelector('[data-fname]'); if (s) s.textContent = inp.files.length ? inp.files[0].name : s.getAttribute('data-empty'); }); });
    f.addEventListener('submit', function (e) { e.preventDefault(); if (!f.checkValidity()) { f.reportValidity(); return; } var ok = f.parentNode.querySelector('.form-ok'); if (ok) { f.hidden = true; ok.classList.add('on'); ok.focus(); } });
  });
  q('select[data-route]').forEach(function (s) {
    var out = document.querySelector(s.getAttribute('data-route'));
    var upd = function () { var o = s.options[s.selectedIndex]; out.textContent = o.getAttribute('data-to') || 'The group'; };
    s.addEventListener('change', upd); upd();
  });

  /* ---------- project viewer ---------- */
  var PJ = document.getElementById('pj-data'), ov = document.querySelector('.ov');
  if (PJ && ov) {
    var data = JSON.parse(PJ.textContent), order = Object.keys(data), cur = null, ci = 0, opener = null;
    var img = ov.querySelector('.stage img'), th = ov.querySelector('.thumbs');
    function show(i) { var p = data[cur]; ci = i; img.src = p.imgs[i][0]; img.alt = p.imgs[i][1]; q('button', th).forEach(function (b, k) { b.setAttribute('aria-current', k === i); }); }
    function open(id) {
      cur = id; var p = data[id];
      ov.querySelector('[data-k="label"]').textContent = p.division;
      ov.querySelector('[data-k="title"]').innerHTML = p.title;
      ov.querySelector('[data-k="text"]').textContent = p.text;
      ov.querySelector('[data-k="dl"]').innerHTML = p.facts.map(function (f) { return '<dt>' + f[0] + '</dt><dd>' + f[1] + '</dd>'; }).join('');
      th.innerHTML = p.imgs.length > 1 ? p.imgs.map(function (m, k) { return '<button type="button" aria-label="Picture ' + (k + 1) + '"><img src="' + m[0] + '" alt=""></button>'; }).join('') : '';
      q('button', th).forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });
      show(0); ov.classList.add('open'); ov.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock'); if (W.__lenis) W.__lenis.stop();
      ov.querySelector('.x').focus();
    }
    function shut() { ov.classList.remove('open'); ov.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); if (W.__lenis) W.__lenis.start(); if (opener) opener.focus(); }
    q('[data-open]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); opener = a; open(a.getAttribute('data-open')); }); });
    ov.querySelector('.x').addEventListener('click', shut);
    ov.querySelector('[data-k="prev"]').addEventListener('click', function () { var vis = order.filter(function (k) { var c = document.querySelector('[data-open="' + k + '"]'); return c && !c.closest('[hidden]'); }); var i = vis.indexOf(cur); open(vis[(i - 1 + vis.length) % vis.length]); });
    ov.querySelector('[data-k="next"]').addEventListener('click', function () { var vis = order.filter(function (k) { var c = document.querySelector('[data-open="' + k + '"]'); return c && !c.closest('[hidden]'); }); var i = vis.indexOf(cur); open(vis[(i + 1) % vis.length]); });
    var hh = location.hash.slice(1); if (data[hh]) setTimeout(function () { open(hh); }, 300);
    addEventListener('keydown', function (e) { if (!ov.classList.contains('open')) return; if (e.key === 'Escape') shut(); if (e.key === 'ArrowRight') show((ci + 1) % data[cur].imgs.length); if (e.key === 'ArrowLeft') show((ci - 1 + data[cur].imgs.length) % data[cur].imgs.length); });
  }

  /* ---------- map: arc lengths ---------- */
  q('.arc').forEach(function (p) { p.style.setProperty('--len', Math.ceil(p.getTotalLength())); });
  var fp = document.querySelector('[data-fp]'), lastK = -1;
  function setK(k) { if (!fp || k === lastK) return; lastK = k; q('[data-k]', fp).forEach(function (el) { el.classList.toggle('on', +el.getAttribute('data-k') <= k); }); var c = fp.querySelector('[data-cnt]'); if (c) c.textContent = ('0' + k).slice(-2); }
  function fpOff() { if (!fp) return true; var off = !motion || innerWidth < 900 || !fp.hasAttribute('data-pinmap'); fp.classList.toggle('pin-off', off); if (off) setK(6); return off; }
  fpOff();

  if (!motion) { document.querySelectorAll('img[loading="lazy"]').forEach(function () {}); return; }

  /* ---------- M7 opening headline ---------- */
  q('[data-m7]').forEach(function (el) {
    var i = 0;
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'); o.className = 'w'; var x = document.createElement('span'); x.className = 'wi'; x.style.setProperty('--i', i++); x.textContent = w; o.appendChild(x); f.appendChild(o);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    el.classList.add('m7');
  });

  /* ---------- M1 words ---------- */
  var reads = q('[data-read]').map(function (el) {
    var words = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'rw'; s.textContent = w; words.push(s); f.appendChild(s);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
    return { el: el, words: words, last: -1 };
  });

  /* ---------- active set ---------- */
  var pics = q('[data-pic]').map(function (el) { return { el: el, fr: el.querySelector('.fr') || el, img: el.querySelector('img') }; });
  var caps = q('[data-cap]').map(function (el) { return { el: el }; });
  var rules = q('[data-rule]').map(function (el) { return { el: el }; });
  var all = [].concat(reads.map(function (r) { r.t = 'r'; return r; }), pics.map(function (r) { r.t = 'p'; return r; }), caps.map(function (r) { r.t = 'c'; return r; }), rules.map(function (r) { r.t = 'l'; return r; }));
  var byEl = new Map(); all.forEach(function (r) { byEl.set(r.el, r); r.on = true; });
  /* everything starts in its "before" state */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var r = byEl.get(e.target); if (r) r.on = e.isIntersecting; }); requestAnimationFrame(run); }, { rootMargin: '25% 0px 25% 0px' });
  all.forEach(function (r) { io.observe(r.el); });

  function apply(r, vh) {
    var b = r.el.getBoundingClientRect(), h = b.height, s = vh - b.top, p;
    if (r.t === 'r') {
      var n = r.words.length; if (!n) return;
      for (var i = 0; i < n; i++) {
        var a0 = 230 + 270 * i / n, o = clamp((s - a0) / 60, 0, 1);
        r.words[i].style.opacity = (0.22 + 0.78 * o).toFixed(3);
      }
    } else if (r.t === 'p') {
      p = clamp(s / (0.32 * (vh + h)), 0, 1);
      var z = clamp(s / (vh + h), 0, 1);
      r.fr.style.clipPath = 'inset(' + (14 * (1 - p)).toFixed(2) + '% 0 0 0)';
      r.fr.style.transform = 'translate3d(0,' + (48 * (1 - p)).toFixed(1) + 'px,0)';
      r.fr.style.opacity = (0.15 + 0.85 * p).toFixed(3);
      if (r.img) r.img.style.transform = 'scale(' + (1.08 - 0.08 * z).toFixed(4) + ')';
    } else if (r.t === 'c') {
      var st = 0.4 * Math.min(h, vh), en = 0.28 * (vh + h); if (en - st < 40) { st = 0; }
      p = clamp((s - st) / Math.max(40, en - st), 0, 1);
      r.el.style.opacity = p.toFixed(3); r.el.style.transform = 'translate3d(0,' + (14 * (1 - p)).toFixed(1) + 'px,0)';
    } else if (r.t === 'l') {
      p = clamp(s / (0.3 * (vh + h)), 0, 1); r.el.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
  }

  /* ---------- page-specific scroll pieces ---------- */
  var tones = q('[data-tone]'), opening = document.querySelector('.opening'), xp = document.querySelector('.xp'), stack = q('[data-stack] > *');

  var ticking = false;
  function run() {
    ticking = false;
    var vh = innerHeight, y = scrollY;
    /* M6 */
    if (innerWidth > 860) d.style.setProperty('--hh', (84 - 20 * clamp(y / 240, 0, 1)).toFixed(1) + 'px'); else d.style.removeProperty('--hh');
    /* tone */
    var line = vh * 0.5, t = null;
    for (var i = 0; i < tones.length; i++) { var r = tones[i].getBoundingClientRect(); if (r.top <= line && r.bottom > line) t = tones[i].getAttribute('data-tone'); }
    if (t && d.getAttribute('data-tone') !== t) d.setAttribute('data-tone', t);
    /* elements */
    for (var k = 0; k < all.length; k++) if (all[k].on) apply(all[k], vh);
    /* hero hand-off */
    if (opening) opening.style.setProperty('--hp', clamp(y / vh, 0, 1).toFixed(4));
    /* stacked cards */
    stack.forEach(function (c, i) { var nx = stack[i + 1]; if (!nx) return; var tp = nx.getBoundingClientRect().top; c.style.setProperty('--c', clamp(1 - (tp - 120) / (vh - 120), 0, 1).toFixed(4)); });
    /* expanding project frame */
    if (xp) { var xr = xp.getBoundingClientRect(), xpP = clamp(-xr.top / Math.max(1, xp.offsetHeight - vh), 0, 1), e = clamp(xpP / 0.62, 0, 1); e = e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2; xp.style.setProperty('--e', e.toFixed(4)); }
    /* countries */
    if (fp && !fp.classList.contains('pin-off')) { var fr = fp.getBoundingClientRect(), fpP = clamp(-fr.top / Math.max(1, fp.offsetHeight - vh), 0, 1); setK(Math.min(6, 1 + Math.floor(fpP * 6.4))); }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(run); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { fpOff(); req(); });

  /* smooth wheel on desktop only (Lenis, lerp 0.1); off on touch */
  if (W.Lenis && !touch) {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    W.__lenis = lenis;
    lenis.on('scroll', req);
    (function raf(tm) { lenis.raf(tm); requestAnimationFrame(raf); })(performance.now());
    q('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { var h = a.getAttribute('href'); if (h.length < 2) return; var tg = document.querySelector(h); if (tg) { e.preventDefault(); lenis.scrollTo(tg, { offset: -80 }); } }); });
  }

  /* ---------- interactive hero: a lens shows the finished room over the raw block yard ---------- */
  var hero = document.querySelector('[data-hero]');
  if (hero && hero.querySelector('[data-reveal]')) (function () {
    var W2 = 0, H2 = 0, x = 0, y = 0, tx = 0, ty = 0, r = 0, last = -1e9, t0 = performance.now(), moved = false, vis = true;
    function size() { var b = hero.getBoundingClientRect(); W2 = b.width; H2 = b.height; }
    size(); addEventListener('resize', size);
    x = tx = W2 * .68; y = ty = H2 * .42;
    function at(e) { var b = hero.getBoundingClientRect(); tx = e.clientX - b.left; ty = e.clientY - b.top; last = performance.now(); if (!moved) { moved = true; hero.classList.add('moved'); } }
    hero.addEventListener('pointermove', at);
    hero.addEventListener('pointerdown', at);
    var rooms = q('.reveal .top img', hero), ri = 0, lastSwap = performance.now(), room = hero.querySelector('[data-room]');
    function swap() { rooms[ri].classList.remove('on'); ri = (ri + 1) % rooms.length; rooms[ri].classList.add('on'); room.textContent = rooms[ri].getAttribute('data-t'); lastSwap = performance.now(); }
    hero.addEventListener('click', function (e) { if (e.target.closest('a,button')) return; swap(); });
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(hero);
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!vis) return;
      var idle = now - last > 2600;
      if (idle && now - lastSwap > 6500 && rooms.length > 1) swap();
      if (idle) { var k = (now - t0) / 1000; tx = W2 * (.62 + .2 * Math.sin(k * .35)); ty = H2 * (.42 + .16 * Math.sin(k * .52 + 1.2)); }
      var e = idle ? .025 : .14; x += (tx - x) * e; y += (ty - y) * e;
      var hp = clamp(scrollY / innerHeight, 0, 1), intro = clamp((now - t0 - 500) / 1400, 0, 1); intro = 1 - Math.pow(1 - intro, 3);
      var base = Math.min(W2, H2) * (W2 < 700 ? .36 : .3), tr = base * intro + hp * Math.hypot(W2, H2) * 1.1;
      r += (tr - r) * .12;
      hero.style.setProperty('--x', x.toFixed(1) + 'px'); hero.style.setProperty('--y', y.toFixed(1) + 'px');
      hero.style.setProperty('--xp', x.toFixed(1) + 'px'); hero.style.setProperty('--yp', y.toFixed(1) + 'px');
      hero.style.setProperty('--r', r.toFixed(1) + 'px');
    })(t0);
  })();

  run();
  addEventListener('load', run);
  requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('loaded'); }); });
})();
