/* 验证：封面每次刷新是否变化 + 手机端大标题是否完整可见 */
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

async function covers(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  const list = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.post-list-thumb .post-thumb img'))
      .slice(0, 4)
      .map((img) => (img.getAttribute('data-src') || img.getAttribute('src') || '').split('/').pop())
  );
  await ctx.close();
  return list;
}

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const a = await covers(browser);
  const b = await covers(browser);
  console.log('第一次:', a.join(', '));
  console.log('第二次:', b.join(', '));
  console.log('是否变化:', JSON.stringify(a) !== JSON.stringify(b) ? '是' : '否');

  const ctx = await browser.newContext(MOBILE);
  const page = await ctx.newPage();
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  const title = await page.evaluate(() => {
    const h1 = document.querySelector('.focusinfo .center-text');
    if (!h1) return null;
    const r = h1.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    const hero = document.querySelector('.main-header');
    const heroCs = hero ? getComputedStyle(hero) : null;
    return {
      text: h1.textContent,
      box: [Math.round(r.left), Math.round(r.right), Math.round(r.width)],
      viewportWidth: window.innerWidth,
      fontSize: cs.fontSize,
      color: cs.color,
      shadow: cs.textShadow.slice(0, 60),
      heroBg: heroCs ? heroCs.backgroundImage.slice(0, 90) : null,
      heroColor: heroCs ? heroCs.backgroundColor : null,
      overflow: r.left < 0 || r.right > window.innerWidth,
    };
  });
  console.log('手机端大标题:', JSON.stringify(title, null, 1));
  await page.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live\\now-mobile-hero.png' });
  await ctx.close();
  await browser.close();
})();
