/* 列出后台设置页每个 textarea 的归属与当前内容长度 */
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto('https://i.cnblogs.com/settings', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const out = await page.evaluate(() => {
    function pathOf(el) {
      const parts = [];
      let cur = el.parentElement;
      let n = 0;
      while (cur && n < 6) {
        let s = cur.tagName.toLowerCase();
        if (cur.id) s += '#' + cur.id;
        if (cur.className && typeof cur.className === 'string') {
          s += '.' + cur.className.trim().split(/\s+/).slice(0, 2).join('.');
        }
        parts.unshift(s);
        cur = cur.parentElement;
        n++;
      }
      return parts.join(' > ');
    }
    function sectionTitle(el) {
      let cur = el;
      for (let i = 0; i < 8 && cur; i++) {
        const head = cur.querySelector
          ? cur.querySelector('h1,h2,h3,h4,.title,.panel-title,legend')
          : null;
        if (head && head.textContent.trim() && head.textContent.trim().length < 40) {
          return head.textContent.trim();
        }
        cur = cur.parentElement;
      }
      return '';
    }
    const areas = Array.from(document.querySelectorAll('textarea')).map((el, i) => ({
      i,
      id: el.id || null,
      name: el.getAttribute('name'),
      cls: el.className || null,
      len: el.value.length,
      head: el.value.replace(/\s+/g, ' ').slice(0, 70),
      visible: el.offsetParent !== null,
      section: sectionTitle(el),
      path: pathOf(el),
    }));
    const skins = Array.from(document.querySelectorAll('#skin-list li, .skin-item, [id*=skin] li, #skinList li'))
      .map((el) => el.className + ' :: ' + el.textContent.replace(/\s+/g, ' ').trim().slice(0, 30))
      .slice(0, 8);
    const checkedSkin = Array.from(document.querySelectorAll('input[type=radio]:checked, input[type=checkbox]:checked'))
      .map((el) => (el.id || '') + '=' + el.value)
      .slice(0, 20);
    return { areas, skins, checkedSkin };
  });
  console.log(JSON.stringify(out, null, 1));
  await page.close();
  browser.close().catch(() => {});
})();
