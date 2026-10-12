/* 诊断：为什么头图没显示 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const INSTALL = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\install';

(async () => {
  const sidebar = fs.readFileSync(path.join(INSTALL, 'sidebar.html'), 'utf8');
  const config = sidebar.slice(sidebar.indexOf('<script type="text/javascript">')).replace(/^<script[^>]*>/, '').replace(/<\/script>[\s\S]*$/, '');

  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('requestfailed', function (r) { console.log('FAILED', r.url(), r.failure() && r.failure().errorText); });
  page.on('response', function (r) { if (r.url().indexOf('skin/headers') >= 0) { console.log('RESP', r.status(), r.url()); } });

  await page.goto('https://www.cnblogs.com/leiyuanze/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function (el) {
      var href = el.getAttribute('href') || '';
      if (href.indexOf('/skins/') >= 0 || href.indexOf('custom.css') >= 0) { el.remove(); }
    });
  });
  await page.addStyleTag({ url: 'https://www.cnblogs.com/skins/custom/bundle-custom.min.css' });
  await page.addStyleTag({ path: path.join(INSTALL, 'page.css') });
  await page.addStyleTag({ content: '.main-header{z-index:0!important}#header{opacity:1!important}' });
  await page.addScriptTag({ path: path.join(INSTALL, 'main.js') });
  await page.addScriptTag({ content: config });
  await page.waitForTimeout(5000);

  const info = await page.evaluate(() => {
    const ht = document.querySelector('.headertop');
    const mh = document.querySelector('.main-header');
    const hdr = document.getElementById('header');
    const cs = ht ? getComputedStyle(ht) : null;
    const mcs = mh ? getComputedStyle(mh) : null;
    const mrect = mh ? mh.getBoundingClientRect() : null;
    return {
      headertopExists: !!ht,
      headertopClass: ht ? ht.className : null,
      bgImage: cs ? cs.backgroundImage.slice(0, 200) : null,
      mainHeaderExists: !!mh,
      mainHeaderBg: mcs ? mcs.backgroundImage.slice(0, 220) : null,
      mainHeaderRect: mrect ? [Math.round(mrect.x), Math.round(mrect.y), Math.round(mrect.width), Math.round(mrect.height)] : null,
      mainHeaderZ: mcs ? mcs.zIndex : null,
      homeBg: (function () { const h = document.getElementById('home'); return h ? getComputedStyle(h).background.slice(0, 160) : null; })(),
      bodyBg: getComputedStyle(document.body).background.slice(0, 160),
      headerBg: hdr ? getComputedStyle(hdr).backgroundImage.slice(0, 200) : null,
      resources: performance.getEntriesByType('resource').filter(function (e) { return e.name.indexOf('skin/headers') >= 0; }).map(function (e) { return e.name + ' => ' + (e.transferSize || 0); }),
      imgs: Array.from(document.querySelectorAll('img')).map(function (i) { return i.src; }).filter(function (s) { return s.indexOf('skin') >= 0; })
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
