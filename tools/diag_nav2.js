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
  const info = await p.evaluate(() => {
    const nav = document.querySelector('#navigator');
    const header = document.querySelector('#header');
    const list = document.querySelector('#navList');
    const r = (el) => { const x = el.getBoundingClientRect(); return [Math.round(x.x), Math.round(x.y), Math.round(x.width), Math.round(x.height)]; };
    const cs = (el) => { const c = getComputedStyle(el); return { display: c.display, opacity: c.opacity, visibility: c.visibility, position: c.position, transform: c.transform.slice(0, 30), overflow: c.overflow }; };
    return {
      headerAncestorOfNav: !!(header && header.contains(nav)),
      header: header ? { box: r(header), style: cs(header) } : null,
      nav: nav ? { box: r(nav), style: cs(nav), inlineStyle: nav.getAttribute('style') } : null,
      list: list ? { box: r(list), style: cs(list) } : null,
      liCount: document.querySelectorAll('#navList > li').length,
      toolbar: !!document.querySelector('.esa-toolbar'),
      toolbarText: (document.querySelector('.esa-toolbar') || {}).innerText,
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await ctx.close();
  await b.close();
})();
