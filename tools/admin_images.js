/* 查看博客园图片库上传入口 */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto('https://i.cnblogs.com/images', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => ({
    url: location.href,
    text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 400),
    inputs: Array.from(document.querySelectorAll('input')).map((el) => ({
      type: el.type,
      accept: el.getAttribute('accept'),
      cls: el.className,
    })),
    buttons: Array.from(document.querySelectorAll('button,a')).map((el) => el.textContent.replace(/\s+/g, ' ').trim()).filter((t) => t && t.length < 12).slice(0, 30),
  }));
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\backup-live\\images-page.png' });
  await page.close();
  browser.close().catch(() => {});
})();
