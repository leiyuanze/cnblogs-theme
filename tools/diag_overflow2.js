/* 找出真正把移动端页面撑宽的节点：谁 scrollWidth > clientWidth，谁的元素右边界超出视口 */
const { chromium } = require('playwright-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const M = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

const URLS = process.argv.slice(2);
const TARGETS = URLS.length
  ? URLS
  : ['https://www.cnblogs.com/leiyuanze/p/17492419.html', 'https://www.cnblogs.com/leiyuanze/p/17275061.html'];

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  for (const url of TARGETS) {
    const ctx = await browser.newContext(M);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(7000);
    const info = await page.evaluate(() => {
      const vw = window.innerWidth;
      const meta = document.querySelector('meta[name=viewport]');
      const selfWide = [];
      const boxWide = [];
      document.querySelectorAll('body *').forEach((el) => {
        const cls = String(el.className || '').slice(0, 50);
        let d = 0;
        for (let p = el; p; p = p.parentElement) d += 1;
        if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && getComputedStyle(el).overflowX !== 'auto' && getComputedStyle(el).overflowX !== 'scroll') {
          selfWide.push({
            d,
            tag: el.tagName,
            cls,
            sw: el.scrollWidth,
            cw: el.clientWidth,
            ox: getComputedStyle(el).overflowX,
            pos: getComputedStyle(el).position,
            html: el.outerHTML.replace(/\s+/g, ' ').slice(0, 110),
          });
        }
        const r = el.getBoundingClientRect();
        if (r.right > vw + 2 && r.width > 4 && r.height > 4) {
          boxWide.push({ tag: el.tagName, cls, w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right) });
        }
      });
      selfWide.sort((a, b) => b.d - a.d);
      const widest = [];
      document.querySelectorAll('#cnblogs_post_body *, .postBody *').forEach((el) => {
        const w = Math.max(el.clientWidth, el.scrollWidth);
        if (w > 380) {
          widest.push({
            w,
            tag: el.tagName,
            cls: String(el.className || '').slice(0, 44),
            ox: getComputedStyle(el).overflowX,
            disp: getComputedStyle(el).display,
            style: (el.getAttribute('style') || '').slice(0, 50),
          });
        }
      });
      widest.sort((a, b) => b.w - a.w);
      return {
        vw,
        widest: widest.slice(0, 12),
        widestCount: widest.length,
        sample: Array.from(document.querySelectorAll('.MJX_Assistive_MathML'))
          .slice(0, 2)
          .map((el) => {
            const p = el.parentElement;
            const cs = p ? getComputedStyle(p) : null;
            return {
              parentTag: p ? p.tagName : null,
              parentClass: p ? String(p.className).slice(0, 80) : null,
              parentStyle: p ? p.getAttribute('style') : null,
              parentBox: p ? [p.clientWidth, p.scrollWidth, cs.display, cs.overflowX, cs.maxWidth, cs.position] : null,
              outer: p ? p.outerHTML.replace(/\s+/g, ' ').slice(0, 400) : null,
            };
          }),
        meta: meta ? meta.getAttribute('content') : null,
        docSW: document.documentElement.scrollWidth,
        bodySW: document.body.scrollWidth,
        htmlOX: getComputedStyle(document.documentElement).overflowX,
        bodyOX: getComputedStyle(document.body).overflowX,
        selfWide: selfWide.slice(0, 15),
        selfWideCount: selfWide.length,
        boxWide: boxWide.slice(0, 15),
        boxWideCount: boxWide.length,
        mathjax: document.querySelectorAll('mjx-container, .MathJax, .MathJax_CHTML, .MJX_Assistive_MathML, .MathJax_Assistive_MathML').length,
        mathClasses: Array.from(new Set(Array.from(document.querySelectorAll('[class*=MathJax], [class*=MJX], mjx-container')).map((e) => e.tagName + '.' + String(e.className).slice(0, 40)))).slice(0, 12),
      };
    });
    console.log('\n=== ' + url);
    console.log(JSON.stringify(info, null, 1));
    await ctx.close();
  }
  await browser.close();
})();
