// Animowane logo Movabit (decyzja Konrada 2026-11-19). Domyślnie „biegnące b”: drugie „m” wstaje z pierwszego,
// pochyla się jak biegacz i biegnie ze smugami na miejsce „b” (pochylone, z przerywanymi smugami za sobą).
// Użycie: <div data-movabit-logo></div> + <script src="movabit-logo.js"></script>
//   data-loop="false"  – zagraj raz i zostań na gotowym logo (domyślnie pętla)
//   data-tagline="…"   – hasło pod logo (puste = bez hasła)
//   data-end="4250"    – skończ wcześniej (ms animacji; 4250 = gotowe słowo bez hasła)
//   data-variant="roll" – dawna wersja: drugie „m” toczy się łukiem i staje jako „B” (bez pochylenia)
//   data-speed="1.5"   – szybciej / wolniej; po zagraniu raz element wysyła zdarzenie „movabit-logo-done”
// „m” i „B” to ten sam znak (limonka, ta sama grubość), „B” = „m” obrócone o 90°, bez domykania.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var MARK = 'M13 118 V63 A50 50 0 0 1 113 63 V118 M113 63 A50 50 0 0 1 213 63 V118';
  var LIME = '#D5FF5F', F = 160, Y = 250, T = 9000;
  var FONT = '600 160px "Plus Jakarta Sans"';
  var uid = 0;

  function css() {
    if (document.getElementById('movabit-logo-font')) return;
    var here = (document.currentScript && document.currentScript.src) || '';
    var base = here.replace(/[^/]*$/, '');
    var st = document.createElement('style');
    st.id = 'movabit-logo-font';
    st.textContent =
      '@font-face{font-family:"Plus Jakarta Sans";font-weight:600;font-display:swap;src:url(' + base + 'fonts/plus-jakarta-sans-600.ttf) format("truetype")}' +
      '@font-face{font-family:"Plus Jakarta Sans";font-weight:400;font-display:swap;src:url(' + base + 'fonts/plus-jakarta-sans-400.ttf) format("truetype")}';
    document.head.appendChild(st);
  }

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  var c = function (x) { return Math.max(0, Math.min(1, x)); };
  var L = function (a, b, k) { return a + (b - a) * k; };
  var e = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var back = function (x) { var k = 1.70158, y = x - 1; return 1 + (k + 1) * y * y * y + k * y * y; };
  var seg = function (ms, a, b) { return c((ms - a) / (b - a)); };

  function mount(host) {
    var id = ++uid;
    var loop = host.getAttribute('data-loop') !== 'false';
    var tagline = host.hasAttribute('data-tagline') ? host.getAttribute('data-tagline') : 'Move a bit. Every day.';
    var speed = parseFloat(host.getAttribute('data-speed')) || 1;
    var fam = 'font-family:"Plus Jakarta Sans",system-ui,sans-serif';
    var runner = host.getAttribute('data-variant') !== 'roll';

    var svg = el('svg', { viewBox: '0 0 1000 ' + (tagline ? 400 : 330), width: '100%', role: 'img', 'aria-label': 'Movabit' }, host);
    var defs = el('defs', {}, svg);
    var r1 = el('rect', { x: 0, y: 0, width: 0, height: 400 }, el('clipPath', { id: 'mvb-c1-' + id }, defs));
    var r2 = el('rect', { x: 0, y: 0, width: 0, height: 400 }, el('clipPath', { id: 'mvb-c2-' + id }, defs));
    var all = el('g', {}, svg);
    var tova = el('text', { y: Y, 'font-size': F, 'font-weight': 600, fill: '#F3F3F3', 'clip-path': 'url(#mvb-c1-' + id + ')', style: fam }, all);
    tova.textContent = 'ova';
    var tit = el('text', { y: Y, 'font-size': F, 'font-weight': 600, fill: '#F3F3F3', 'clip-path': 'url(#mvb-c2-' + id + ')', style: fam }, all);
    tit.textContent = 'ıt'; // „i” bez kropki – kropką jest satelita z logo
    var stroke = { d: MARK, fill: 'none', stroke: LIME, 'stroke-width': 26, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    var m1 = el('g', { opacity: 0 }, all);
    var p1 = el('path', stroke, m1);
    p1.setAttribute('pathLength', 1); p1.setAttribute('stroke-dasharray', 1); p1.setAttribute('stroke-dashoffset', 1);
    var bWrap = el('g', {}, all);
    var ghosts = runner ? [0.26, 0.1].map(function (o) { var g = el('g', { opacity: 0, 'data-o': o }, bWrap); el('path', stroke, g); return g; }) : [];
    var m2 = el('g', { opacity: 0 }, bWrap);
    el('path', stroke, m2);
    var lineAttr = { stroke: LIME, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0 };
    var streaks = runner ? [0, 1, 2].map(function () { return el('line', lineAttr, all); }) : [];
    if (runner) all.insertBefore(bWrap, null);
    var dot = el('circle', { r: 10, fill: LIME }, all);
    var tag = null;
    if (tagline) {
      tag = el('text', { x: 500, y: 330, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 400, fill: '#BABABA', opacity: 0, 'letter-spacing': 1, style: fam }, all);
      tag.textContent = tagline;
    }

    var G = null;
    function layout() {
      var cv = document.createElement('canvas').getContext('2d');
      cv.font = FONT;
      var xh = cv.measureText('x').actualBoundingBoxAscent || F * 0.52;
      var s = xh / 131, gap = F * 0.06, lean = runner ? 226 * (xh / 131) * 0.5 * Math.tan(15 * Math.PI / 180) : 0;
      var w = function (t) { return cv.measureText(t).width; };
      var wova = w('ova'), wit = w('ıt');
      var gapB = F * 0.11; // więcej miejsca za „B”, żeby kropka nad „i” go nie dotykała
      var total = 226 * s + gap + wova + gap + lean + 131 * s + gapB + lean + wit;
      var x0 = (1000 - total) / 2, ovaX = x0 + 226 * s + gap, bX = ovaX + wova + gap + lean, itX = bX + 131 * s + gapB + lean;
      tova.setAttribute('x', ovaX); tit.setAttribute('x', itX);
      var top = Y - xh, rd = 26 * s * 0.62;
      G = {
        s: s, ovaX: ovaX, wova: wova, itX: itX, wit: wit,
        pts: [[x0 + 226 * s + 2, top - rd - 8], [ovaX + w('o') / 2, top - rd], [ovaX + w('o') + w('v') / 2, top - rd],
              [ovaX + w('ov') + w('a') / 2, top - rd], [itX + w('ı') / 2, top - rd - 10]],
        mc: [x0 + 113 * s, Y - 65.5 * s], bc: [bX + 65.5 * s, Y - 113 * s]
      };
      dot.setAttribute('r', rd);
    }
    function tf(g, x, y, th, s) {
      g.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + th + ') scale(' + s + ') translate(-113 -65.5)');
    }
    // „b” jak biegacz: wstaje z „m” (obrót o 90° i uniesienie na linię pisma), rusza z pochyleniem,
    // za nim smugi i dwa cienie, staje pochylone, z poszarpaną tylną krawędzią (wcięcia + krótkie smugi).
    var SK = -15;
    function runPos(ms) {
      var mc = G.mc, bc = G.bc;
      var r = e(seg(ms, 2100, 2650));                       // wstaje
      var u = seg(ms, 2550, 3350);                          // bieg
      var k = 0.55, y1 = u - 1, run = u <= 0 ? 0 : 1 + (k + 1) * y1 * y1 * y1 + k * y1 * y1; // ruszenie z miejsca, lekki przelot
      var x = L(mc[0], bc[0], run) + r * 6 * (1 - u);
      var y = L(mc[1], bc[1], r) - Math.sin(Math.PI * r) * 26 * (1 - u);
      var v = Math.sin(Math.PI * c(u * 1.05));              // „prędkość” do smug i dodatkowego pochylenia
      var skew = SK * e(seg(ms, 2400, 2800)) - 9 * v;
      return { x: x, y: y, th: 90 * r, skew: skew, v: u > 0 && u < 1 ? v : 0 };
    }
    function tfRun(g, p) {
      g.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') skewX(' + p.skew + ') rotate(' + p.th + ') scale(' + G.s + ') translate(-113 -65.5)');
    }
    function drawRunner(ms) {
      var s = G.s, bc = G.bc, hh = 113 * s, hw = 65.5 * s;   // połowa wysokości / szerokości „b”
      var p = runPos(ms);
      m2.setAttribute('opacity', ms >= 2100 ? 1 : 0);
      tfRun(m2, p);
      ghosts.forEach(function (g, i) {
        var q = runPos(ms - 55 * (i + 1));
        g.setAttribute('opacity', p.v * parseFloat(g.getAttribute('data-o')));
        tfRun(g, q);
      });
      var land = e(seg(ms, 3250, 3600));
      // smugi nad linią liter (nie zasłaniają „a”), przerywane = „poszarpany” ślad szybkiego biegu
      var rows = [-0.84, -0.6, -0.36], lens = [1.0, 1.45, 0.7];
      var dash = ['26 9 9 9 4 60', '40 10 14 9 6 60', '18 8 6 60'];
      streaks.forEach(function (ln, i) {
        var yy = p.y + rows[i] * hh;
        var tail = p.x - hw * 0.78 + rows[i] * hh * Math.tan(p.skew * Math.PI / 180);
        var live = 210 * lens[i] * p.v, rest = 62 * lens[i] * land;
        var len = Math.max(live, rest);
        ln.setAttribute('x1', tail - len); ln.setAttribute('x2', tail); ln.setAttribute('y1', yy); ln.setAttribute('y2', yy);
        ln.setAttribute('stroke-dasharray', p.v > 0.05 ? 'none' : dash[i]);
        ln.setAttribute('opacity', len > 2 ? Math.min(1, 0.3 + len / 70) : 0);
      });
    }
    function draw(ms) {
      var s = G.s, pts = G.pts, mc = G.mc, bc = G.bc;
      m1.setAttribute('opacity', ms > 420 ? 1 : 0);
      p1.setAttribute('stroke-dashoffset', 1 - e(seg(ms, 420, 1350)));
      tf(m1, mc[0], mc[1], 0, s);
      r1.setAttribute('x', G.ovaX - 10); r1.setAttribute('width', (G.wova + 20) * e(seg(ms, 1150, 2000)));
      if (runner) drawRunner(ms); else {
      var q = seg(ms, 2200, 3500), qp = e(q), qr = back(q);
      m2.setAttribute('opacity', ms >= 2200 ? 1 : 0);
      tf(m2, L(mc[0], bc[0], qp), L(mc[1], bc[1], qp) - Math.sin(Math.PI * qp) * 130, 450 * qr, s);
      }
      r2.setAttribute('x', G.itX - 10); r2.setAttribute('width', (G.wit + 20) * e(seg(ms, 3500, 4100)));
      var dx, dy, h = 400;
      if (ms < 2600) { dx = pts[0][0]; dy = L(-30, pts[0][1], back(seg(ms, 0, 600))); }
      else if (ms >= 2600 + 4 * h) { dx = pts[4][0]; dy = pts[4][1]; }
      else {
        var i = Math.min(3, Math.floor((ms - 2600) / h)), u = c((ms - 2600 - i * h) / h);
        dx = L(pts[i][0], pts[i + 1][0], u);
        dy = L(pts[i][1], pts[i + 1][1], u) - Math.sin(Math.PI * u) * (i === 3 ? 95 : 55);
      }
      dot.setAttribute('cx', dx); dot.setAttribute('cy', dy);
      if (tag) { tag.setAttribute('opacity', seg(ms, 4400, 5000)); tag.setAttribute('y', L(342, 330, e(seg(ms, 4400, 5000)))); }
      all.setAttribute('opacity', loop ? 1 - seg(ms, 8300, 8900) : 1);
    }

    var END = parseFloat(host.getAttribute('data-end')) || 5200; // gotowe logo z hasłem (data-end = wcześniej)
    // Gdzie na ekranie jest pierwszy znak „m” (dla wejścia strony – znak leci stąd do nagłówka)
    host.mvbMarkRect = function () {
      if (!G) return null;
      var b = svg.getBoundingClientRect(), k = b.width / 1000;
      return { x: b.left + (G.mc[0] - 113 * G.s) * k, y: b.top + (G.mc[1] - 65.5 * G.s) * k, w: 226 * G.s * k, h: 131 * G.s * k };
    };
    host.mvbDraw = function (ms) { if (G) draw(ms); };      // podgląd klatka po klatce (data-paused)
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var t0 = performance.now(), fired = false;
    function done() { if (fired) return; fired = true; host.dispatchEvent(new CustomEvent('movabit-logo-done', { bubbles: true })); }
    function frame(now) {
      if (host.hasAttribute('data-paused')) return;
      var ms = (now - t0) * speed;
      if (still) { draw(END); done(); return; }
      if (!loop && ms >= END) { draw(END); done(); return; }
      draw(loop ? ms % T : ms);
      requestAnimationFrame(frame);
    }
    function start() { layout(); t0 = performance.now(); }
    layout();
    requestAnimationFrame(frame);
    if (document.fonts && document.fonts.load) document.fonts.load(FONT).then(start).catch(function () {});
    host.addEventListener('click', function () { if (!loop && !still) { t0 = performance.now(); requestAnimationFrame(frame); } });
  }

  function init() {
    css();
    var hosts = document.querySelectorAll('[data-movabit-logo]');
    for (var i = 0; i < hosts.length; i++) if (!hosts[i].firstChild) mount(hosts[i]);
  }
  css();
  // Dla skryptów strony (powtórka logo po kliknięciu w nagłówku)
  window.movabitLogoMount = function (h) { css(); if (!h.firstChild) mount(h); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
