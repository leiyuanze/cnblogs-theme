/* 预览：把复刻主题（Sakura 源码 + 我们的配置）注入到 leiyuanze 博客上 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const INSTALL = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\install';
const OUT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura';

(async () => {
  const sidebar = fs.readFileSync(path.join(INSTALL, 'sidebar.html'), 'utf8');
  const config = sidebar.slice(sidebar.indexOf('<script type="text/javascript">')).replace(/^<script[^>]*>/, '').replace(/<\/script>[\s\S]*$/, '');

  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const shots = [
    { name: 'clone-desktop-top.png', y: 0, viewport: { width: 1440, height: 900 } },
    { name: 'clone-desktop-mid.png', y: 1100, viewport: { width: 1440, height: 900 } },
    { name: 'clone-mobile-top.png', y: 0, viewport: { width: 390, height: 844 } }
  ];

  for (const s of shots) {
    const page = await browser.newPage({ viewport: s.viewport });
    await page.goto('https://www.cnblogs.com/leiyuanze/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
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
    await page.waitForTimeout(3000);
    if (s.y) {
      await page.evaluate(function (y) { window.scrollTo(0, y); }, s.y);
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: path.join(OUT, s.name) });
    console.log('shot', s.name);
    await page.close();
  }
  await browser.close();
})();
