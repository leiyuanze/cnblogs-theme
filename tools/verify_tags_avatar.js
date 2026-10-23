/* 验收：手机标签页遮挡 + 首屏头像 + 汉堡按钮滚动隐藏 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const INSTALL = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\install';
const OUT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live';
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

const footer = fs.readFileSync(path.join(INSTALL, 'footer.html'), 'utf8');
const start = footer.indexOf('$.silence({');
const config = footer.slice(start, footer.indexOf('</script>', start));

async function prepare(page) {
  await page.evaluate(() => {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
      const href = el.getAttribute('href') || '';
      if (href.indexOf('/skins/') >= 0 || href.indexOf('custom.css') >= 0) el.remove();
    });
  });
  await page.addStyleTag({ url: 'https://www.cnblogs.com/skins/custom/bundle-custom.min.css' });
  await page.addStyleTag({ content: '.main-header{z-index:0!important}#header{opacity:1!important}' });
  // 线上旧主题已经生成过头部；注入新包前先移除，避免新包的防重复保护跳过测试。
  await page.evaluate(() => {
    document.querySelectorAll('.headertop, .main-header, .focusinfo, .wave, .scroll-down').forEach((el) => el.remove());
    document.querySelector('.forFlow')?.classList.remove('silence-ready');
  });
  await page.addStyleTag({ path: path.join(INSTALL, 'page.css') });
  await page.addScriptTag({ url: 'https://assets.cnblogs.com/scripts/jquery-3.3.1.min.js' });
  await page.addScriptTag({ path: path.join(INSTALL, 'main.js') });
  await page.addScriptTag({ content: config });
  await page.waitForTimeout(2500);
}

async function inspect(page) {
  return page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    };
    const overlap = (a, b) => {
      if (!a || !b) return false;
      return !(a[0] + a[2] <= b[0] || b[0] + b[2] <= a[0] || a[1] + a[3] <= b[1] || b[1] + b[3] <= a[1]);
    };
    const menu = rect('.esa-mobile-menu');
    const tagTitle = rect('#taglist_title_wrap');
    const listTitle = rect('.PostListTitle');
    const avatar = rect('.esa-hero-avatar');
    const heroTitle = rect('.focusinfo .center-text');
    return {
      bodyClass: document.body.className,
      menu,
      tagTitle,
      listTitle,
      overlapTagTitle: overlap(menu, tagTitle),
      overlapListTitle: overlap(menu, listTitle),
      avatar,
      heroTitle,
      avatarAboveTitle: !!(avatar && heroTitle && avatar[1] + avatar[3] < heroTitle[1]),
      avatarSrc: (document.querySelector('.esa-hero-avatar img') || {}).src || null,
      docWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const routes = [
    ['tags', 'https://www.cnblogs.com/leiyuanze/tag/'],
    ['tag-detail', 'https://www.cnblogs.com/leiyuanze/tag/%E5%8A%A8%E6%80%81dp/'],
  ];

  for (const [name, url] of routes) {
    const ctx = await browser.newContext(MOBILE);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1200);
    await prepare(page);
    console.log('[top] ' + name + ': ' + JSON.stringify(await inspect(page)));
    await page.screenshot({ path: path.join(OUT, 'fix-' + name + '-top.png') });

    const y = await page.evaluate(() => {
      const main = document.querySelector('#main');
      return main ? main.getBoundingClientRect().top + window.scrollY - 80 : 760;
    });
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(900);
    console.log('[scroll-down] ' + name + ': ' + JSON.stringify(await inspect(page)));
    await page.screenshot({ path: path.join(OUT, 'fix-' + name + '-scroll.png') });

    await page.evaluate(() => window.scrollBy(0, -120));
    await page.waitForTimeout(700);
    console.log('[scroll-up] ' + name + ': ' + JSON.stringify(await inspect(page)));
    await ctx.close();
  }
  await browser.close();
})();
