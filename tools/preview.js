/* 本地渲染预览：把皮肤注入到线上博客页面并截图 */
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CSS = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\skin.css';
const JS = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\skin.js';
const OUT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura';
const URL = 'https://www.cnblogs.com/leiyuanze/';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const shots = [
    { name: 'preview-desktop.png', viewport: { width: 1440, height: 900 } },
    { name: 'preview-mobile.png', viewport: { width: 390, height: 844 } }
  ];
  for (const s of shots) {
    const page = await browser.newPage({ viewport: s.viewport });
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);
    // 模拟「Custom 皮肤」基座：移除旧皮肤样式（保留博客园全局样式），再挂 Custom 基础样式 + 我们的皮肤
    await page.evaluate(() => {
      document.querySelectorAll('link[rel="stylesheet"]').forEach(function (el) {
        var href = el.getAttribute('href') || '';
        if (href.indexOf('/skins/') >= 0 || href.indexOf('custom.css') >= 0 || href.indexOf('simplememory') >= 0 || href.indexOf('SimpleMemory') >= 0) {
          el.remove();
        }
      });
      document.querySelectorAll('style').forEach(function (el) { el.remove(); });
    });
    await page.addStyleTag({ url: 'https://www.cnblogs.com/skins/custom/bundle-custom.min.css' });
    await page.addStyleTag({ path: CSS });
    await page.addScriptTag({ path: JS });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: path.join(OUT, s.name), fullPage: false });
    console.log('shot', s.name);
    await page.close();
  }
  await browser.close();
})();
