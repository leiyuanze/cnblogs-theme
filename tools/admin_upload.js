/* 把主题 JS 上传到博客园「文件」，拿到 blog-static 直链 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const SRC = process.argv[2] || 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\install\\main.js';
const NAME = process.argv[3] || 'leiyuanze-main.js';
const TMP = path.join('D:\\leiyuanze\\cnblogs-beautify\\sakura\\backup-live', NAME);

(async () => {
  fs.mkdirSync(path.dirname(TMP), { recursive: true });
  fs.copyFileSync(SRC, TMP);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', String(e.message).split('\n')[0]));
  await page.goto('https://i.cnblogs.com/files', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  await page.setInputFiles('input[type=file]', TMP);
  await page.waitForTimeout(1200);

  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button,a')).find(
      (el) => el.textContent.replace(/\s+/g, '') === '上传' && el.offsetParent !== null
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  console.log('点击上传:', clicked);
  await page.waitForTimeout(8000);

  const info = await page.evaluate(() => ({
    text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 500),
    links: Array.from(document.querySelectorAll('a')).map((a) => a.href).filter((h) => h.indexOf('/files/') >= 0),
    rows: Array.from(document.querySelectorAll('tr')).map((tr) => tr.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 8),
  }));
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\backup-live\\files-after-upload.png' });
  await page.close();
  browser.close().catch(() => {});
})();
