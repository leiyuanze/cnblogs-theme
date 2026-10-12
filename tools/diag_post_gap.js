const { chromium } = require('playwright-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const M = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' };
(async () => {
  const b = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await b.newContext(M);
  const p = await ctx.newPage();
  await p.goto('https://www.cnblogs.com/leiyuanze/p/17405952.html', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(6000);
  const info = await p.evaluate(() => {
    const g = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { box: [Math.round(r.top + window.scrollY), Math.round(r.height)], pos: cs.position, marginTop: cs.marginTop, display: cs.display }; };
    return {
      home: g('#home'),
      patternCenter: g('.pattern-center'),
      patternImg: g('.pattern-attachment-img'),
      main: g('#main'),
      postBody: g('#cnblogs_post_body'),
      postDetail: g('#post_detail'),
      firstText: (function () { const el = document.querySelector('#cnblogs_post_body'); return el ? el.textContent.replace(/\s+/g, ' ').slice(0, 60) : null; })(),
      scrollDown: g('.scroll-down'),
      wave: g('.wave'),
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await ctx.close();
  await b.close();
})();
