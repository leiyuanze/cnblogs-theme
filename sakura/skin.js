/* ========================================================
   leiyuanze 博客园皮肤 · 交互脚本
   配合「页脚 HTML 代码」粘贴使用
   ======================================================== */
(function () {
  'use strict';

  var CDN_BASES = [
    'https://cdn.jsdelivr.net/gh/leiyuanze/leiyuanze.github.io@master/skin',
    'https://leiyuanze.github.io/skin'
  ];

  var HEADERS = [
    '仙山拱桥·夜', '云海山峦·晨', '月照青峦', '暮色原野', '星河红霞',
    '花树仙鹤', '暮云小镇', '流星夜空', '星海旅人', '霞光星海',
    '灯火长街', '暮色城郭', '星河守望', '古河灯夜', '灯笼长街',
    '长街深灯', '水上灯城', '雪夜灯街', '古街黄昏', '古宅庭院'
  ];

  var CHARS = [
    ['白狐纸伞', 'a01'], ['和风留声机', 'a02'], ['白发侧颜', 'a05'],
    ['灯笼少女', 'a07'], ['红白和服', 'a08'], ['红纸伞', 'a18']
  ];

  var SONGS = [
    [3322773657, '游山恋', '浅影阿', 109951172355669080],
    [2095876512, '探故知', '浅影阿 / 汐音社', 109951169024567662],
    [3442248108, '关山酒', '浅影阿', 109951174022423147],
    [3420272282, '牡丹亭', '浅影阿', 109951173739951494],
    [3373839227, '春不晚', '浅影阿', 109951173108183621],
    [167850, '庐州月', '许嵩', 109951172202579057],
    [167882, '清明雨上', '许嵩', 109951172899966259],
    [167937, '断桥残雪', '许嵩', 58274116284456],
    [28802028, '山水之间', '许嵩', 109951172321467418],
    [28854182, '惊鸿一面', '许嵩 / 黄龄', 109951172321467418],
    [402073807, '燕归巢', '许嵩', 3431575794705764],
    [411214279, '雅俗共赏', '许嵩', 3431575794705764],
    [101131, '倾尽天下', '河图', 6049512976313503],
    [28188434, '锦鲤抄', '银临 / 云之泣', 5859297464524710],
    [28188427, '棠梨煎雪', '银临', 5859297464524710],
    [2078062390, '典狱司', '音频怪物', 109951168881672971],
    [409654891, '故梦', '双笙', 109951168638984216],
    [39224244, '狐言', '河图 / 洛天依', 109951167999122273]
  ];

  function pickBase(cb) {
    var i = 0;
    (function tryNext() {
      if (i >= CDN_BASES.length) { cb(CDN_BASES[0]); return; }
      var probe = new Image();
      var base = CDN_BASES[i++];
      probe.onload = function () { cb(base); };
      probe.onerror = tryNext;
      probe.src = base + '/headers/h01.jpg';
    })();
  }

  /* ---------- 头图 ---------- */
  function setupHeader(base) {
    var header = document.getElementById('header');
    if (!header) { return; }
    var bg = document.createElement('div');
    bg.className = 'header-bg';
    header.insertBefore(bg, header.firstChild);
    var idx = Math.floor(Math.random() * HEADERS.length);   // 每次访问随机换图
    var url = base + '/headers/h' + String(idx + 1).padStart(2, '0') + '.jpg';
    var img = new Image();
    img.onload = function () { bg.style.backgroundImage = 'url("' + url + '")'; };
    img.src = url;
  }

  /* ---------- 侧边栏配图卡片 ---------- */
  function setupSidebarFigure(base) {
    var bar = document.getElementById('sideBar');
    if (!bar) { return; }
    var pair = CHARS[Math.floor(Math.random() * CHARS.length)];
    var file = base + '/chars/c' + String(CHARS.indexOf(pair) + 1).padStart(2, '0') + '.jpg';
    var card = document.createElement('div');
    card.className = 'sidebar-figure';
    card.innerHTML = '<img alt="' + pair[0] + '" src="' + file + '"><div class="caption">古风 · ' + pair[0] + '</div>';
    bar.insertBefore(card, bar.firstChild);
  }

  /* ---------- 雪花 ---------- */
  function setupSnow() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || document.getElementById('snow-canvas')) { return; }
    var canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var flakes = [];
    var W, H;
    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    var count = Math.min(70, Math.round(window.innerWidth / 22));
    for (var i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.8 + Math.random() * 1.8,
        vy: 0.4 + Math.random() * 0.9,
        vx: -0.3 + Math.random() * 0.6,
        a: 0.25 + Math.random() * 0.55
      });
    }
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.x += f.vx;
        f.y += f.vy;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        if (f.x < -4) { f.x = W + 4; }
        if (f.x > W + 4) { f.x = -4; }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(235, 243, 255, ' + f.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 返回顶部 ---------- */
  function setupTop() {
    var btn = document.createElement('div');
    btn.id = 'back-to-top';
    btn.innerHTML = '↑';
    btn.title = '回到顶部';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 420);
    });
  }

  /* ---------- 图片点击放大 ---------- */
  function setupViewer() {
    var body = document.getElementById('cnblogs_post_body');
    if (!body) { return; }
    var viewer = document.createElement('div');
    viewer.id = 'img-viewer';
    viewer.innerHTML = '<img alt="preview">';
    document.body.appendChild(viewer);
    var pic = viewer.querySelector('img');
    body.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG') {
        pic.src = t.src;
        viewer.classList.add('show');
      }
    });
    viewer.addEventListener('click', function () { viewer.classList.remove('show'); pic.src = ''; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { viewer.classList.remove('show'); }
    });
  }

  /* ---------- 音乐播放器 ---------- */
  function setupMusic() {
    if (!document.getElementById('guofeng-player')) {
      var holder = document.createElement('div');
      holder.id = 'guofeng-player';
      document.body.appendChild(holder);
    }
    function boot() {
      if (!window.APlayer) { return; }
      var API = 'https://api.injahow.cn/meting/';
      var audio = SONGS.map(function (s) {
        return {
          name: s[1],
          artist: s[2],
          url: API + '?server=netease&type=url&id=' + s[0],
          cover: API + '?server=netease&type=pic&id=' + s[3],
          lrc: API + '?server=netease&type=lrc&id=' + s[0]
        };
      });
      new APlayer({
        container: document.getElementById('guofeng-player'),
        theme: '#b03a2e',
        lrcType: 3,
        listFolded: true,
        audio: audio
      });
    }
    if (!window.APlayer) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css';
      document.head.appendChild(css);
      var js = document.createElement('script');
      js.src = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js';
      js.onload = boot;
      document.body.appendChild(js);
    } else {
      boot();
    }
  }

  function start() {
    pickBase(function (base) {
      setupHeader(base);
      setupSidebarFigure(base);
    });
    setupSnow();
    setupTop();
    setupViewer();
    setupMusic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
