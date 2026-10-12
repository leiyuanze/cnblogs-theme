/* 诊断：首页内容区为什么是空的 */
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
  page.on('console', function (m) { if (m.type() === 'error' || m.type() === 'warning') console.log('CONSOLE', m.type(), m.text().slice(0, 200)); });
  page.on('pageerror', function (e) { console.log('PAGEERROR', String(e).slice(0, 300)); });

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
  await page.addScriptTag({ url: 'https://cdn.bootcss.com/jquery/1.8.3/jquery.min.js' });
  await page.addScriptTag({ path: path.join(INSTALL, 'main.js') });
  await page.addScriptTag({ content: config });
  await page.waitForTimeout(4000);

  const info = await page.evaluate(() => {
    const days = Array.from(document.querySelectorAll('.day'));
    const flow = document.querySelector('#mainContent .forFlow') || document.querySelector('#mainContent');
    const rect = flow ? flow.getBoundingClientRect() : null;
    return {
      dayCount: days.length,
      dayRects: days.slice(0, 3).map(function (d) {
        const r = d.getBoundingClientRect();
        const cs = getComputedStyle(d);
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), display: cs.display, visibility: cs.visibility, opacity: cs.opacity };
      }),
      flowRect: rect ? [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)] : null,
      docHeight: document.documentElement.scrollHeight,
      postCards: document.querySelectorAll('.post-list-thumb').length,
      postCardRects: Array.from(document.querySelectorAll('.post-list-thumb')).slice(0, 3).map(function (d) {
        const r = d.getBoundingClientRect();
        const cs = getComputedStyle(d);
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), display: cs.display, visibility: cs.visibility, opacity: cs.opacity };
      }),
      forFlowChildren: Array.from((document.querySelector('#mainContent .forFlow') || document.createElement('div')).children).slice(0, 3).map(function (el) { return el.className + ' :: ' + el.tagName; }),
      html: days.length ? days[0].outerHTML.slice(0, 400) : null
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
