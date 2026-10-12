/* 通过已登录的调试浏览器查看博客园后台设置页结构 */
const { chromium } = require('playwright-core');

const URLS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['https://i.cnblogs.com/settings'];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0] || (await browser.newContext());
  const page = await ctx.newPage();
  for (const url of URLS) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3500);
      const info = await page.evaluate(() => {
        const fields = Array.from(document.querySelectorAll('input,select,textarea')).map((el) => ({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          name: el.getAttribute('name'),
          type: el.type || null,
          len: el.value ? String(el.value).length : 0,
          ph: el.getAttribute('placeholder'),
        }));
        const tabs = Array.from(document.querySelectorAll('a,button,li')).map((el) => el.textContent.replace(/\s+/g, ' ').trim()).filter((t) => t && t.length < 18);
        return {
          url: location.href,
          title: document.title,
          hasLoginForm: !!document.querySelector('input[type=password]'),
          bodyStart: document.body.innerText.replace(/\s+/g, ' ').slice(0, 400),
          fieldCount: fields.length,
          fields: fields.slice(0, 40),
          tabs: Array.from(new Set(tabs)).slice(0, 60),
        };
      });
      console.log('===== ' + url + ' =====');
      console.log(JSON.stringify(info, null, 1));
    } catch (e) {
      console.log('===== ' + url + ' ERROR: ' + e.message.split('\n')[0]);
    }
  }
  await page.close();
  // 只断开连接，保留用户的调试浏览器不关
  browser.close().catch(() => {});
})();
