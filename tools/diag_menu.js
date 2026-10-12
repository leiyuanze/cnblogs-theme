const { chromium } = require('playwright-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' };
(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await b.newContext(MOBILE);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.message).split('\n')[0]));
  await p.goto('https://www.cnblogs.com/leiyuanze/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(6000);
  const before = await p.evaluate(() => {
    const btn = document.querySelector('.esa-mobile-menu');
    const nav = document.querySelector('#navigator');
    const cs = btn ? getComputedStyle(btn) : null;
    const r = btn ? btn.getBoundingClientRect() : null;
    const top = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
    return {
      btnBox: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null,
      btnStyle: cs ? { display: cs.display, opacity: cs.opacity, zIndex: cs.zIndex, position: cs.position, pointerEvents: cs.pointerEvents, filter: cs.filter } : null,
      btnHtml: btn ? btn.outerHTML.slice(0, 160) : null,
      topElementAtBtnCenter: top ? top.tagName + '.' + top.className : null,
      navExists: !!nav,
      navId: nav ? nav.id : null,
      navDisplay: nav ? getComputedStyle(nav).display : null,
      navClass: nav ? nav.className : null,
      navParent: nav && nav.parentElement ? nav.parentElement.tagName + '.' + nav.parentElement.className : null,
      navListHtml: nav ? nav.outerHTML.replace(/\s+/g, ' ').slice(0, 300) : null,
    };
  });
  console.log('BEFORE', JSON.stringify(before, null, 1));
  await p.click('.esa-mobile-menu').catch((e) => console.log('click failed', e.message.split('\n')[0]));
  await p.waitForTimeout(1200);
  const after = await p.evaluate(() => {
    const nav = document.querySelector('#navigator');
    return { navDisplay: nav ? getComputedStyle(nav).display : null, navBox: nav ? JSON.stringify(nav.getBoundingClientRect()) : null };
  });
  console.log('AFTER', JSON.stringify(after));
  await p.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live\\menu-after-click.png' });
  await ctx.close();
  await b.close();
})();
