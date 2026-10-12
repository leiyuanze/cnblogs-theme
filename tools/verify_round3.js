/* 验收：古风封面 / 文章页空白 / 音乐列表与随机 */
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
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

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });

  // 1) 首页封面：两次刷新是否变化、是否用的图床古风图
  for (const run of [1, 2]) {
    const ctx = await browser.newContext(DESKTOP);
    const page = await ctx.newPage();
    await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(5000);
    const info = await page.evaluate(() => {
      const covers = Array.from(document.querySelectorAll('.post-list-thumb .post-thumb img'))
        .slice(0, 5)
        .map((i) => i.getAttribute('data-src') || i.getAttribute('src') || '');
      return {
        first: covers.map((u) => u.split('/').pop().slice(-20)),
        allCnblogs: covers.every((u) => u.indexOf('img2024.cnblogs.com') >= 0),
        unique: new Set(Array.from(document.querySelectorAll('.post-list-thumb .post-thumb img')).map((i) => i.getAttribute('data-src') || i.src)).size,
        total: document.querySelectorAll('.post-list-thumb').length,
      };
    });
    console.log('首页第' + run + '次:', JSON.stringify(info));
    await ctx.close();
  }

  // 2) 文章页：头图到正文之间还有多少空白
  for (const [label, opts] of [['手机', MOBILE], ['桌面', DESKTOP]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    await page.goto(POST, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(5000);
    const gap = await page.evaluate(() => {
      const img = document.querySelector('.pattern-attachment-img');
      const main = document.querySelector('#main');
      const body = document.querySelector('#cnblogs_post_body');
      const bottom = img ? img.getBoundingClientRect().bottom + window.scrollY : 0;
      return {
        heroBottom: Math.round(bottom),
        mainTop: main ? Math.round(main.getBoundingClientRect().top + window.scrollY) : null,
        bodyTop: body ? Math.round(body.getBoundingClientRect().top + window.scrollY) : null,
        blank: main && img ? Math.round(main.getBoundingClientRect().top + window.scrollY - bottom) : null,
      };
    });
    console.log(label + '文章页:', JSON.stringify(gap));
    await ctx.close();
  }

  // 3) 音乐：列表内容 + 顺序是否随机
  const orders = [];
  for (const run of [1, 2]) {
    const ctx = await browser.newContext(DESKTOP);
    const page = await ctx.newPage();
    await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(9000);
    const songs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.aplayer-list .aplayer-list-title')).map((el) => el.textContent.trim())
    );
    orders.push(songs);
    console.log('播放列表第' + run + '次 (' + songs.length + ' 首):', songs.join(' / '));
    await ctx.close();
  }
  console.log('顺序是否随机:', JSON.stringify(orders[0]) !== JSON.stringify(orders[1]) ? '是' : '否');
  console.log('是否还有探故知:', JSON.stringify(orders).indexOf('探故知') >= 0 ? '有' : '没有');
  await browser.close();
})();
