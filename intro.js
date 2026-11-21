// Wejście strony głównej = preloader (decyzja Konrada 2026-11-19): logo Movabit gra ok. 1,5 s, w tym czasie strona
// ładuje się pod spodem; potem strona pojawia się od razu,
// a znak „m” zmniejsza się i leci na swoje miejsce w nagłówku strony (#mvb-mark).
// Raz na sesję przeglądarki; dotknięcie pomija; przy ograniczonym ruchu wejścia nie ma (klasa mvb-seen z <head>).
// Kliknięcie logo w nagłówku (decyzja Konrada 2026-11-19) zawsze gra je jeszcze raz – na półprzezroczystej
// warstwie, pod którą widać stronę – i znak znów wraca do nagłówka.
(function () {
  var root = document.documentElement;
  var PATH = 'M13 118 V63 A50 50 0 0 1 113 63 V118 M113 63 A50 50 0 0 1 213 63 V118';
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Znak „m” z logo (host) leci do znaku w nagłówku; warstwa (layer) w tym czasie znika.
  function flyHome(host, layer, after) {
    var from = host && host.mvbMarkRect ? host.mvbMarkRect() : null;
    var target = document.getElementById('mvb-mark');
    layer.classList.remove('in');
    layer.classList.add('out');
    function end() { root.classList.remove('mvb-fly'); after(); }
    if (!from || !target) { setTimeout(end, 350); return; }
    var t = target.getBoundingClientRect();
    var to = { x: t.left, y: t.top, w: t.width * 226 / 271, h: t.height };   // sam znak „m”, bez kropki
    var fly = document.createElement('div');
    fly.style.cssText = 'position:fixed;left:0;top:0;z-index:10000;pointer-events:none;transform-origin:0 0;' +
      'width:' + from.w + 'px;height:' + from.h + 'px;transform:translate(' + from.x + 'px,' + from.y + 'px);' +
      'transition:transform .6s cubic-bezier(.6,0,.2,1)';
    fly.innerHTML = '<svg viewBox="0 0 226 131" width="100%" height="100%"><path d="' + PATH +
      '" fill="none" stroke="' + (getComputedStyle(target).color || '#D5FF5F') +
      '" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(fly);
    host.style.visibility = 'hidden';            // w logo zostaje tylko lecący znak
    fly.getBoundingClientRect();                 // start przejścia
    fly.style.transform = 'translate(' + to.x + 'px,' + to.y + 'px) scale(' + (to.w / from.w) + ',' + (to.h / from.h) + ')';
    setTimeout(function () { end(); fly.remove(); }, 640);
  }

  // 1) Preloader przy wejściu
  var intro = document.getElementById('mvb-intro');
  if (intro && !root.classList.contains('mvb-seen')) {
    var host = intro.querySelector('[data-movabit-logo]'), done = false;
    var go = function () {
      if (done) return;
      done = true;
      try { sessionStorage.setItem('mvb-intro', '1'); } catch (e) {}
      root.classList.remove('mvb-wait');          // strona pojawia się od razu
      flyHome(host, intro, function () { intro.style.display = 'none'; });
    };
    // Strona ładuje się pod logo; wychodzimy, gdy logo skończyło grać ORAZ strona jest wczytana
    // (zdjęcia, czcionki). Wolne łącze: logo czeka najwyżej do 4 s od startu.
    var played = false, loaded = document.readyState === 'complete';
    var maybe = function () { if (played && loaded) go(); };
    intro.addEventListener('movabit-logo-done', function () { setTimeout(function () { played = true; maybe(); }, 200); });
    if (!loaded) window.addEventListener('load', function () { loaded = true; maybe(); });
    intro.addEventListener('click', go);
    setTimeout(go, 4000);                          // zapas, gdyby animacja nie ruszyła
  }

  // 2) Kliknięcie logo w nagłówku = logo jeszcze raz, strona widoczna pod spodem
  var busy = false;
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('a') : null;
    if (!a || !a.querySelector('#mvb-mark')) return;
    if (still || busy || !window.movabitLogoMount || (intro && intro.style.display !== 'none' && !root.classList.contains('mvb-seen'))) return;
    ev.preventDefault();
    busy = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var layer = document.createElement('div');
    layer.className = 'mvb-replay';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<div><div data-movabit-logo data-loop="false" data-tagline="" data-end="4250" data-speed="2.85"></div></div>';
    document.body.appendChild(layer);
    root.classList.add('mvb-fly');               // znak w nagłówku „przechodzi” do logo na środku
    var h = layer.querySelector('[data-movabit-logo]');
    window.movabitLogoMount(h);
    layer.getBoundingClientRect();
    layer.classList.add('in');
    var gone = false;
    function back() {
      if (gone) return;
      gone = true;
      flyHome(h, layer, function () { layer.remove(); busy = false; });
    }
    h.addEventListener('movabit-logo-done', function () { setTimeout(back, 250); });
    layer.addEventListener('click', back);
    setTimeout(back, 4000);
  });
})();
