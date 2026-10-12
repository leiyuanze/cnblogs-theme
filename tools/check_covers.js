/* 检查首页卡片封面的懒加载与真实尺寸 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const INSTALL = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\install';
const footer = fs.readFileSync(path.join(INSTALL, 'footer.html'), 'utf8');
const cfgStart = footer.indexOf('$.silence({');
const config = footer.slice(cfgStart, footer.indexOf('</script>', cfgStart));

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => console.log('PAGEERROR', String(e.message).split('\n')[0]));
  page.on('requestfailed', (r) => console.log('REQFAIL', r.url().slice(0, 100), (r.failure() || {}).errorText));
  await page.route('**/leiyuanze/**', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const res = await route.fetch();
    let html = await res.text();
    const cut = html.indexOf('<!--live2d-->');
    if (cut > 0) {
      const tail = html.indexOf('</body>', cut);
      html = html.slice(0, cut) + (tail > 0 ? html.slice(tail) : '</body></html>');
    }
    await route.fulfill({ response: res, body: html });
  });
  await page.goto('https://www.cnblogs.com/leiyuanze/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
      const href = el.getAttribute('href') || '';
      if (href.indexOf('/skins/') >= 0 || href.indexOf('custom.css') >= 0) el.remove();
    });
  });
  await page.addStyleTag({ url: 'https://www.cnblogs.com/skins/custom/bundle-custom.min.css' });
  await page.addStyleTag({ path: path.join(INSTALL, 'page.css') });
  await page.addScriptTag({ url: 'https://assets.cnblogs.com/scripts/jquery-3.3.1.min.js' });
  await page.addScriptTag({ path: path.join(INSTALL, 'main.js') });
  await page.addScriptTag({ content: config });

  for (const y of [600, 1200, 1800, 2400]) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(1200);
  }

  const out = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.post-list-thumb')).slice(0, 4).map((card) => {
      const thumb = card.querySelector('.post-thumb');
      const img = card.querySelector('.post-thumb img');
      const r = thumb ? thumb.getBoundingClientRect() : null;
      return {
        thumbBox: r ? [Math.round(r.width), Math.round(r.height)] : null,
        thumbDisplay: thumb ? getComputedStyle(thumb).display : null,
        src: img ? String(img.getAttribute('src')).slice(0, 70) : null,
        dataSrc: img ? String(img.getAttribute('data-src')).slice(0, 70) : null,
        complete: img ? img.complete : null,
        natural: img ? [img.naturalWidth, img.naturalHeight] : null,
        imgBox: img ? [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)] : null,
      };
    });
  });
  console.log(JSON.stringify(out, null, 1));
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live\\v-covers.png' });
  await browser.close();
})();
