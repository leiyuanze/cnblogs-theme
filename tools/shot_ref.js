/* 截图参考站，研究其界面 */
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\ref';
const HOME = 'https://www.cnblogs.com/nibabadeboke/';
const POST = 'https://www.cnblogs.com/nibabadeboke/p/19000000.html';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT, 'ref-home-top.png') });
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'ref-home-mid.png') });
  await page.evaluate(() => window.scrollTo(0, 2600));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'ref-home-low.png') });
  const title = await page.title();
  const bodyClass = await page.evaluate(() => document.body.className);
  console.log('home title:', title, '| body class:', bodyClass);
  await page.close();

  // 文章页：从首页拿第一篇随笔链接
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p2.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p2.waitForTimeout(2500);
  const link = await p2.evaluate(() => {
    const a = document.querySelector('.postTitle a, .postTitle2, #mainContent a[href*="/p/"]');
    return a ? a.href : null;
  });
  console.log('post link:', link);
  if (link) {
    await p2.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p2.waitForTimeout(4000);
    await p2.screenshot({ path: path.join(OUT, 'ref-post-top.png') });
    await p2.evaluate(() => window.scrollTo(0, 900));
    await p2.waitForTimeout(1200);
    await p2.screenshot({ path: path.join(OUT, 'ref-post-mid.png') });
  }
  await p2.close();

  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await m.waitForTimeout(4000);
  await m.screenshot({ path: path.join(OUT, 'ref-mobile-top.png') });
  await m.evaluate(() => window.scrollTo(0, 900));
  await m.waitForTimeout(1000);
  await m.screenshot({ path: path.join(OUT, 'ref-mobile-mid.png') });
  await m.close();

  await browser.close();
  console.log('done');
})();
