/* TEACHER LINE — module PWA v1 (installation sur smartphone, tablette et ordinateur + hors ligne). ES5, autonome.
   - Enregistre service-worker.js
   - Bouton « Installer » dans la barre du haut + bandeau discret (une fois, puis tous les 14 jours si fermé)
   - Modes d’emploi selon l’appareil : Android (Chrome, Samsung, Firefox), iPhone/iPad (Safari, Chrome, Firefox, Edge), PC, Mac
   - Message « Nouvelle version » après une mise à jour sur GitHub
   Peut être retiré en supprimant sa balise <script> dans index.html. */
(function () {
  'use strict';

  var APP = 'Teacher Line';
  var KEY = 'teacherline_pwa';
  var RESHOW_DAYS = 14;
  var deferred = null;
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var inApp = /FBAN|FBAV|Instagram|Snapchat|TikTok|Line\/|wv\)/i.test(ua);

  function standalone() {
    return !!((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true);
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function store(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  /* ---------- Styles (reprennent les variables du site : clair / sombre) ---------- */
  var css =
    '.pwa-hbtn{flex:none;height:40px;border-radius:999px;border:2px solid rgba(255,255,255,.28);background:transparent;color:#fff;cursor:pointer;' +
    'display:inline-flex;align-items:center;gap:7px;padding:0 14px 0 11px;font:inherit;font-weight:800;font-size:14px}' +
    '.pwa-hbtn svg{width:18px;height:18px}' +
    '.pwa-hbtn:hover{border-color:#fff}' +
    '@media(max-width:520px){.pwa-hbtn span{display:none}.pwa-hbtn{width:40px;padding:0;justify-content:center}.bar-in .brand{flex:1 0 100%}.bar-in .search{flex-basis:150px}}' +
    '.pwa-banner{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;' +
    'width:min(480px,calc(100vw - 20px));display:flex;align-items:center;gap:12px;padding:12px 10px 12px 12px;' +
    'background:var(--surface,#fff);color:var(--ink,#13203F);border-radius:14px;border-left:8px solid #DC241F;' +
    'box-shadow:0 10px 30px rgba(19,32,63,.28);animation:pwaIn .3s ease-out}' +
    '.pwa-banner img{width:46px;height:46px;flex:none}' +
    '.pwa-banner b{display:block;font-weight:900;font-size:16px;line-height:1.2}' +
    '.pwa-banner small{display:block;font-size:13px;color:var(--muted,#4E5A72);margin-top:2px}' +
    '.pwa-txt{flex:1;min-width:0}' +
    '.pwa-btn{font:inherit;font-weight:800;font-size:15px;cursor:pointer;padding:10px 16px;border-radius:999px;border:0;background:#13203F;color:#fff;white-space:nowrap}' +
    ':root[data-theme="dark"] .pwa-btn{background:#F2A900;color:#13203F}' +
    '.pwa-x{background:none;border:0;color:inherit;font-size:20px;cursor:pointer;padding:4px 6px;opacity:.6;align-self:flex-start}' +
    '.pwa-overlay{position:fixed;inset:0;z-index:70;background:rgba(14,21,40,.6);display:flex;align-items:flex-end;justify-content:center;' +
    'padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))}' +
    '@media(min-width:700px){.pwa-overlay{align-items:center}}' +
    '.pwa-sheet{position:relative;width:min(460px,100%);max-height:calc(100vh - 24px);overflow:auto;padding:22px 20px 20px;border-radius:16px;' +
    'background:var(--surface,#fff);color:var(--ink,#13203F);border-top:8px solid #DC241F;box-shadow:0 14px 40px rgba(0,0,0,.35);animation:pwaUp .3s ease-out}' +
    '.pwa-sheet h3{margin:0 34px 4px 0;font-weight:900;font-size:21px;line-height:1.2}' +
    '.pwa-sheet p{margin:6px 0 12px;font-size:15px}' +
    '.pwa-steps{list-style:none;margin:0 0 14px;padding:0;counter-reset:s;position:relative}' +
    '.pwa-steps li{counter-increment:s;position:relative;display:flex;gap:14px;align-items:center;padding:8px 0 8px 0;font-size:15px;line-height:1.4}' +
    '.pwa-steps li:before{content:counter(s);flex:none;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
    'background:var(--surface,#fff);border:5px solid #1E3FB8;color:var(--ink,#13203F);font-weight:900;font-size:14px;position:relative;z-index:1}' +
    '.pwa-steps:before{content:"";position:absolute;left:18px;top:22px;bottom:22px;width:6px;background:#1E3FB8;border-radius:3px}' +
    '.pwa-ico{display:inline-flex;vertical-align:middle;width:26px;height:26px;border-radius:7px;background:var(--surface-2,#F4F6F9);' +
    'border:1px solid var(--rule,#C8D0DA);color:#1a5fd0;align-items:center;justify-content:center;margin:0 2px;font-weight:900}' +
    '.pwa-ico svg{width:17px;height:17px}' +
    '.pwa-note{font-size:13px!important;color:var(--muted,#4E5A72)}' +
    '.pwa-arrow{position:fixed;left:50%;bottom:calc(2px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:80;font-size:34px;' +
    'color:#F2A900;text-shadow:0 2px 6px #000;animation:pwaBounce 1s ease-in-out infinite;pointer-events:none}' +
    '@keyframes pwaIn{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}' +
    '@keyframes pwaUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}' +
    '@keyframes pwaBounce{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,8px)}}' +
    '@media(prefers-reduced-motion:reduce){.pwa-banner,.pwa-sheet,.pwa-arrow{animation:none!important}}' +
    '.pwa-toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:90;' +
    'background:#13203F;color:#fff;padding:12px 18px;border-radius:999px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:calc(100vw - 30px)}';
  var st = document.createElement('style');
  st.id = 'teacherline-pwa-v1';
  st.appendChild(document.createTextNode(css));
  document.head.appendChild(st);

  var SHARE_SVG = '<span class="pwa-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg></span>';
  var PLUS_SVG = '<span class="pwa-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
    '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg></span>';
  var DOTS = '<span class="pwa-ico" aria-hidden="true">⋮</span>';
  var DL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M12 7v7"/><path d="M9 11l3 3 3-3"/></svg>';
  var CLOSE_BTN = '<button class="pwa-btn" data-pwa="close" style="width:100%">J’ai compris</button>';

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }
  function remove(node) { if (node && node.parentNode) { node.parentNode.removeChild(node); } }
  function steps(a, b, c) { return '<ol class="pwa-steps"><li><span>' + a + '</span></li><li><span>' + b + '</span></li><li><span>' + c + '</span></li></ol>'; }

  /* ---------- Fenêtre d’aide ---------- */
  var sheetNode = null, arrowNode = null, lastFocus = null;
  function closeSheet() {
    remove(sheetNode); remove(arrowNode); sheetNode = null; arrowNode = null;
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function openSheet(inner, withArrow) {
    closeSheet();
    lastFocus = document.activeElement;
    sheetNode = el('<div class="pwa-overlay" data-pwa="overlay"><div class="pwa-sheet" role="dialog" aria-modal="true" aria-labelledby="pwaTitle">' +
      '<button class="pwa-x" data-pwa="close" aria-label="Fermer" style="position:absolute;top:10px;right:10px">✕</button>' + inner + '</div></div>');
    document.body.appendChild(sheetNode);
    if (withArrow && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      arrowNode = el('<div class="pwa-arrow" aria-hidden="true">⬇</div>'); document.body.appendChild(arrowNode);
    }
    var b = sheetNode.querySelector('.pwa-btn');
    if (b) { b.focus(); }
  }

  var LAST = 'Touchez <b>« Ajouter »</b>. L’icône Teacher Line apparaît avec vos applis.';
  var PICK = 'Choisissez <b>« Sur l’écran d’accueil »</b> ' + PLUS_SVG + ' (faites défiler si besoin).';

  function helpIOS() {
    var ipad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var fx = /FxiOS/.test(ua), cr = /CriOS/.test(ua), ed = /EdgiOS/.test(ua), safari = !(fx || cr || ed);
    var first = fx ? 'Touchez le menu <b>≡</b> en bas à droite, puis <b>« Partager »</b> ' + SHARE_SVG + '.' :
      cr ? 'Touchez le bouton Partager ' + SHARE_SVG + ' à droite de la barre d’adresse (ou dans le menu <b>⋯</b>).' :
      ed ? 'Touchez le menu <b>⋯</b> en bas, puis <b>« Partager »</b> ' + SHARE_SVG + '.' :
      'Touchez le bouton Partager ' + SHARE_SVG + (ipad ? ' en haut de l’écran.' : ' en bas de l’écran (ou dans le menu <b>⋯</b>).');
    openSheet(
      '<h3 id="pwaTitle">Installer Teacher Line</h3>' +
      '<p>En trois gestes, Teacher Line s’ouvre comme une appli, en plein écran.</p>' +
      steps(first, PICK, LAST) +
      '<p class="pwa-note">' + (inApp ? '⚠️ Le lien est ouvert dans une autre appli. Ouvrez-le d’abord dans <b>Safari</b>.' :
        safari ? 'Option absente ? Vérifiez que le lien est bien ouvert dans <b>Safari</b>.' :
        'Option absente ? Mettez l’iPhone à jour (iOS 16.4 ou plus) ou ouvrez le lien dans <b>Safari</b>.') + '</p>' +
      CLOSE_BTN,
      safari && !ipad
    );
  }

  function helpOther() {
    var macSafari = !isIOS && /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua);
    var samsung = /SamsungBrowser/.test(ua);
    var firefox = /Firefox/.test(ua);
    var body;
    if (macSafari) {
      body = '<h3 id="pwaTitle">Mettre Teacher Line dans le Dock</h3>' +
        steps('Ouvrez le menu <b>Fichier</b> en haut de l’écran.', 'Choisissez <b>« Ajouter au Dock… »</b> (macOS 14 Sonoma ou plus).', 'Cliquez sur <b>« Ajouter »</b>.');
    } else if (isAndroid && firefox) {
      body = '<h3 id="pwaTitle">Installer Teacher Line</h3>' +
        steps('Touchez le menu ' + DOTS + ' (en bas ou en haut à droite).', 'Choisissez <b>« Ajouter à l’écran d’accueil »</b>.', LAST);
    } else if (samsung) {
      body = '<h3 id="pwaTitle">Installer Teacher Line</h3>' +
        steps('Touchez le menu <b>≡</b> en bas à droite.', 'Choisissez <b>« Ajouter la page à »</b>, puis <b>« Écran d’accueil »</b>.', LAST);
    } else if (firefox) {
      body = '<h3 id="pwaTitle">Installer Teacher Line</h3>' +
        '<p>Firefox ne sait pas installer d’applis sur l’ordinateur.</p>' +
        '<p>Ouvrez <b>brot2you.github.io/Teacher-Line</b> dans <b>Chrome</b> ou <b>Edge</b> : le bouton « Installer » fonctionnera en un clic.</p>' +
        '<p class="pwa-note">Vous pouvez aussi simplement ajouter Teacher Line à vos marque-pages.</p>';
    } else {
      body = '<h3 id="pwaTitle">Installer Teacher Line</h3>' +
        steps('Ouvrez le menu du navigateur ' + DOTS + ' (en haut à droite).',
          'Choisissez <b>« Installer Teacher Line »</b>, <b>« Applications › Installer »</b> ou <b>« Ajouter à l’écran d’accueil »</b>.',
          'Confirmez. Teacher Line s’ouvre dans sa propre fenêtre.') +
        '<p class="pwa-note">Sur ordinateur, l’icône d’installation apparaît aussi parfois à droite de la barre d’adresse.</p>';
    }
    openSheet(body + CLOSE_BTN);
  }

  function install() {
    hideBanner();
    if (deferred) {
      var p = deferred; deferred = null;
      p.prompt();
      if (p.userChoice) { p.userChoice.then(function (r) { if (r && r.outcome === 'accepted') { done(); } }); }
    } else if (isIOS) { helpIOS(); }
    else { helpOther(); }
  }

  function toast(msg) {
    var t = el('<div class="pwa-toast" role="status">' + msg + '</div>');
    document.body.appendChild(t);
    setTimeout(function () { remove(t); }, 3800);
  }
  function done() {
    var s = load(); s.installed = true; store(s);
    hideBanner(); remove(document.getElementById('pwaHeadBtn'));
    toast('Teacher Line est installé ✓');
  }

  /* ---------- Bouton dans la barre du haut ---------- */
  function headButton() {
    if (standalone() || document.getElementById('pwaHeadBtn')) { return; }
    var theme = document.getElementById('themeBtn');
    if (!theme) { return; }
    var b = el('<button class="pwa-hbtn" id="pwaHeadBtn" type="button" data-pwa="install" aria-label="Installer l’appli Teacher Line">' +
      DL_SVG + '<span>Installer</span></button>');
    theme.parentNode.insertBefore(b, theme);
  }

  /* ---------- Bandeau ---------- */
  var bannerNode = null;
  function hideBanner() { remove(bannerNode); bannerNode = null; }
  function maybeBanner() {
    if (bannerNode || standalone() || !(deferred || isIOS || isAndroid)) { return; }
    if (sheetNode) { setTimeout(maybeBanner, 3000); return; }
    var s = load();
    if (s.installed && !deferred) { return; }
    if (s.later && (Date.now() - s.later) < RESHOW_DAYS * 864e5) { return; }
    bannerNode = el('<div class="pwa-banner" role="region" aria-label="Installer l’appli">' +
      '<img src="pwa/icon-192.png" alt="">' +
      '<div class="pwa-txt"><b>Teacher Line en appli</b><small>Une icône sur l’écran d’accueil, ouverture en plein écran.</small></div>' +
      '<button class="pwa-btn" data-pwa="install">Installer</button>' +
      '<button class="pwa-x" data-pwa="later" aria-label="Plus tard">✕</button></div>');
    document.body.appendChild(bannerNode);
  }

  /* ---------- Clics ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== document && !(t.getAttribute && t.getAttribute('data-pwa'))) { t = t.parentNode; }
    if (!t || t === document) { return; }
    var a = t.getAttribute('data-pwa');
    if (a === 'overlay' && e.target !== t) { return; }
    e.preventDefault(); e.stopPropagation();
    if (a === 'install') { install(); }
    else if (a === 'later') { var s = load(); s.later = Date.now(); store(s); hideBanner(); }
    else if (a === 'close' || a === 'overlay') { closeSheet(); }
    else if (a === 'update') { applyUpdate(); }
  }, true);
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && sheetNode) { closeSheet(); }
  });

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function () { deferred = null; done(); });

  /* ---------- Service worker + mises à jour ---------- */
  var waitingWorker = null, reloading = false;
  function showUpdate(w) {
    waitingWorker = w;
    remove(document.getElementById('pwaUpdate'));
    document.body.appendChild(el('<div class="pwa-banner" id="pwaUpdate" role="status">' +
      '<img src="pwa/icon-192.png" alt="">' +
      '<div class="pwa-txt"><b>Nouvelle version disponible</b><small>De nouveaux outils vous attendent.</small></div>' +
      '<button class="pwa-btn" data-pwa="update">Mettre à jour</button></div>'));
  }
  function applyUpdate() {
    remove(document.getElementById('pwaUpdate'));
    if (waitingWorker) { waitingWorker.postMessage('skipWaiting'); } else { location.reload(); }
  }

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' }).then(function (reg) {
        if (reg.waiting && navigator.serviceWorker.controller) { showUpdate(reg.waiting); }
        reg.addEventListener('updatefound', function () {
          var w = reg.installing;
          if (!w) { return; }
          w.addEventListener('statechange', function () {
            if (w.state === 'installed' && navigator.serviceWorker.controller) { showUpdate(w); }
          });
        });
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') { reg.update().catch(function () {}); }
        });
      }).catch(function () {});
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (reloading) { return; }
        reloading = true; location.reload();
      });
    });
  }

  function start() {
    headButton();
    if (standalone()) { var s = load(); if (!s.installed) { s.installed = true; store(s); } }
    setTimeout(maybeBanner, 4000);
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); } else { start(); }

  window.TeacherLinePWA = { install: install, app: APP };
})();
