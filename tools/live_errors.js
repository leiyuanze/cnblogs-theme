/* 抓线上首页在两端的真实报错 */
const { chromium } = require('playwright-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'https://www.cnblogs.com/leiyuanze/';

async function run(browser, label, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e.message || e).split('\n')[0]));
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 200));
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => {
    const day = document.querySelector('.day');
    return {
      jquery: window.jQuery ? jQuery.fn.jquery : null,
      cards: document.querySelectorAll('.post-list-thumb').length,
      days: document.querySelectorAll('.day').length,
      dayTitleNode: day ? (day.querySelector('.dayTitle') || {}).className || 'NO .dayTitle' : null,
      descLinks: day ? day.querySelectorAll('.postDesc a').length : null,
      postConImgs: day ? day.querySelectorAll('.postCon img').length : null,
      firstDayHtml: day ? day.outerHTML.replace(/\s+/g, ' ').slice(0, 500) : null,
    };
  });
  console.log('===== ' + label + ' =====');
  console.log(JSON.stringify(info, null, 2));
  console.log('errors:', errs.length ? errs.slice(0, 6).join('\n  ') : 'none');
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  await run(browser, 'DESKTOP 1440', { viewport: { width: 1440, height: 900 } });
  await run(browser, 'MOBILE 390', {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  await browser.close();
})();
