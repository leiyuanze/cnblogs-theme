/* 导出线上首页 .day / .forFlow 的真实结构，用于重写列表解析 */
const { chromium } = require('playwright-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://www.cnblogs.com/leiyuanze/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const flow = document.querySelector('#mainContent .forFlow');
    const days = Array.from(document.querySelectorAll('.day'));
    const kids = flow ? Array.from(flow.children).map((e) => e.tagName + '.' + e.className) : [];
    const day = days[0];
    const desc = day ? day.querySelector('.postDesc') : null;
    const con = day ? day.querySelector('.postCon') : null;
    const descImg = con ? con.querySelector('img') : null;
    return {
      flowClass: flow ? flow.className : null,
      flowKids: kids,
      dayCount: days.length,
      dayClass: day ? day.className : null,
      dayParent: day ? day.parentElement.tagName + '.' + day.parentElement.className : null,
      postDescHtml: desc ? desc.outerHTML.replace(/\s+/g, ' ').slice(0, 600) : null,
      postDescText: desc ? desc.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) : null,
      postConHtml: con ? con.outerHTML.replace(/\s+/g, ' ').slice(0, 900) : null,
      descImgAttrs: descImg
        ? Array.from(descImg.attributes).map((a) => a.name + '=' + a.value.slice(0, 80))
        : null,
      titlesInDay: day ? Array.from(day.querySelectorAll('.postTitle a')).map((a) => a.textContent.trim().slice(0, 40)) : null,
      anyImgOnFlow: document.querySelectorAll('#mainContent .forFlow img').length,
    };
  });
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
