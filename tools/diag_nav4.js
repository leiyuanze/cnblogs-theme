const { chromium } = require('playwright-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' };
(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await b.newContext(MOBILE);
  const p = await ctx.newPage();
  await p.goto('https://www.cnblogs.com/leiyuanze/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(6000);
  await p.click('.esa-mobile-menu');
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => {
    const li = document.querySelector('#navList li');
    const a = li.querySelector('a');
    const i = li.querySelector('i');
    const pick = (el, keys) => { const c = getComputedStyle(el); const o = {}; keys.forEach((k) => (o[k] = c[k])); return o; };
    return {
      li: pick(li, ['position', 'float', 'height', 'minHeight', 'lineHeight', 'overflow', 'padding']),
      a: pick(a, ['position', 'float', 'display', 'width', 'height', 'padding', 'top', 'left', 'lineHeight']),
      iTag: i ? pick(i, ['position', 'display', 'width', 'height', 'float']) : null,
      liOuter: li.outerHTML.slice(0, 200),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await p.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live\\menu-debug.png' });
  await ctx.close();
  await b.close();
})();
