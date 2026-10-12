/* 诊断：看页面结构与主要容器的布局盒 */
const { chromium } = require('playwright-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CSS = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\skin.css';
const URL = 'https://www.cnblogs.com/leiyuanze/';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.querySelectorAll('link[rel="stylesheet"], style').forEach(function (el) { el.remove(); });
  });
  await page.addStyleTag({ url: 'https://www.cnblogs.com/skins/custom/bundle-custom.min.css' });
  await page.addStyleTag({ path: CSS });
  const info = await page.evaluate(() => {
    const out = [];
    const dump = (el, label) => {
      const r = el.getBoundingClientRect();
      out.push(label + ' <' + el.tagName.toLowerCase() + ' id=' + el.id + ' class=' + String(el.className).slice(0, 40) + '> x=' + Math.round(r.x) + ' y=' + Math.round(r.y) + ' w=' + Math.round(r.width) + ' h=' + Math.round(r.height));
    };
    Array.from(document.body.children).forEach(function (el) { dump(el, 'body>'); });
    const main = document.getElementById('main');
    if (main) {
      dump(main, 'MAIN');
      Array.from(main.children).forEach(function (el) { dump(el, '  main>'); });
    }
    ['header', 'blogTitle', 'navigator', 'mainContent', 'sideBar', 'footer'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) dump(el, id);
    });
    const seen = new Set();
    document.querySelectorAll('div, nav, aside, ul').forEach(function (el) {
      const r = el.getBoundingClientRect();
      if (r.x <= 6 && r.width > 120 && r.width < 420 && r.height > 300 && !seen.has(el)) {
        seen.add(el);
        dump(el, 'LEFT?');
      }
    });
    return out.join('\n');
  });
  console.log(info);
  await browser.close();
})();
