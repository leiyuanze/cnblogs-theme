/* 线上实拍：桌面 + 手机，首页 + 代码文章 */
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live\\';
const HOME = 'https://www.cnblogs.com/leiyuanze/';
const POST = 'https://www.cnblogs.com/leiyuanze/p/17405952.html';

const DESKTOP = { viewport: { width: 1440, height: 900 } };
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

async function shoot(browser, url, opts, shots, scrolls) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  for (let i = 0; i < shots.length; i++) {
    if (scrolls[i]) {
      await page.evaluate((y) => window.scrollTo(0, y), scrolls[i]);
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: OUT + shots[i] });
  }
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  await shoot(browser, HOME, DESKTOP, ['now-desktop-home-top.png', 'now-desktop-home-mid.png'], [0, 1250]);
  await shoot(browser, POST, DESKTOP, ['now-desktop-post-code.png'], [1500]);
  await shoot(browser, HOME, MOBILE, ['now-mobile-home-top.png', 'now-mobile-home-mid.png'], [0, 900]);
  await shoot(browser, POST, MOBILE, ['now-mobile-post-code.png'], [1300]);
  await browser.close();
})();
