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
    const list = document.querySelector('#navList');
    const li = list.querySelector('li');
    const a = li.querySelector('a');
    const css = getComputedStyle(list);
    const cssLi = getComputedStyle(li);
    const cssA = getComputedStyle(a);
    const sheetCount = document.styleSheets.length;
    let ruleFound = false;
    try {
      for (const sh of document.styleSheets) {
        let rules; try { rules = sh.cssRules; } catch (e) { continue; }
        for (const r of rules) {
          if (r.cssText && r.cssText.indexOf('#header #navList') >= 0 && r.cssText.indexOf('display: block') >= 0) ruleFound = true;
        }
      }
    } catch (e) {}
    const r = (el) => { const x = el.getBoundingClientRect(); return [Math.round(x.x), Math.round(x.y), Math.round(x.width), Math.round(x.height)]; };
    return {
      listDisplay: css.display, listFlexWrap: css.flexWrap, listBox: r(list),
      liDisplay: cssLi.display, liBox: r(li), liFloat: cssLi.float,
      aDisplay: cssA.display, aBox: r(a),
      ruleFound,
      navHeight: r(document.querySelector('#navigator')),
      bodyClass: document.body.className,
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await ctx.close();
  await b.close();
})();
