/* 查看博客园「文件」管理页结构，用于上传主题 JS */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto('https://i.cnblogs.com/files', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 600),
    inputs: Array.from(document.querySelectorAll('input')).map((el) => ({
      type: el.type,
      id: el.id || null,
      name: el.getAttribute('name'),
      accept: el.getAttribute('accept'),
      cls: el.className,
    })),
    buttons: Array.from(document.querySelectorAll('button,.btn,a')).map((el) => el.textContent.replace(/\s+/g, ' ').trim()).filter((t) => t && t.length < 14).slice(0, 40),
    fileLinks: Array.from(document.querySelectorAll('a[href*=files]')).slice(0, 12).map((a) => a.href),
  }));
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\backup-live\\files-page.png' });
  await page.close();
  browser.close().catch(() => {});
})();
