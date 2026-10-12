/* 手机端卡片布局检查：封面与正文是否还重叠 */
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HOME = 'https://www.cnblogs.com/leiyuanze/';
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await browser.newContext(MOBILE);
  const page = await ctx.newPage();
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.scrollTo(0, 950));
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.post-list-thumb')).slice(0, 4).map((card) => {
      const thumb = card.querySelector('.post-thumb');
      const link = card.querySelector('.post-thumb a');
      const wrap = card.querySelector('.post-content-wrap');
      const img = card.querySelector('.post-thumb img');
      const t = thumb ? thumb.getBoundingClientRect() : null;
      const a = link ? link.getBoundingClientRect() : null;
      const w = wrap ? wrap.getBoundingClientRect() : null;
      const i = img ? img.getBoundingClientRect() : null;
      return {
        thumbBox: t ? [Math.round(t.top), Math.round(t.height)] : null,
        imgBox: i ? [Math.round(i.top), Math.round(i.height), Math.round(i.width)] : null,
        contentTop: w ? Math.round(w.top) : null,
        gapImgToText: i && w ? Math.round(w.top - i.bottom) : null,
        overlap: i && w ? Math.round(i.bottom - w.top) > 0 : null,
        cardHeight: Math.round(card.getBoundingClientRect().height),
      };
    });
  });
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live\\now-mobile-cards.png' });
  await ctx.close();
  await browser.close();
})();
