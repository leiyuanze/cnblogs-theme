/* 手机端性能对比：我们的博客 vs 参考样例 */
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const IPHONE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

async function probe(browser, url, label, shot) {
  const context = await browser.newContext(IPHONE);
  const page = await context.newPage();
  const reqs = [];
  const failed = [];
  const started = Date.now();
  let loadAt = null;

  page.on('request', (r) => reqs.push({ url: r.url(), type: r.resourceType() }));
  page.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + (r.failure() || {}).errorText));

  await page.addInitScript(() => {
    window.__longtasks = [];
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__longtasks.push(Math.round(e.duration));
      }).observe({ entryTypes: ['longtask'] });
    } catch (e) {}
  });

  page.on('load', () => (loadAt = Date.now() - started));

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  } catch (e) {
    console.log(label, 'GOTO ERROR', e.message.split('\n')[0]);
  }

  await page.waitForTimeout(6000);

  const info = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paints = performance.getEntriesByType('paint').map((p) => [p.name, Math.round(p.startTime)]);
    const res = performance.getEntriesByType('resource');
    const byType = {};
    let transfer = 0;
    for (const r of res) {
      const t = r.initiatorType || 'other';
      byType[t] = byType[t] || { n: 0, kb: 0, ms: 0 };
      byType[t].n++;
      byType[t].kb += (r.transferSize || 0) / 1024;
      byType[t].ms += r.duration || 0;
    }
    for (const k in byType) byType[k].kb = Math.round(byType[k].kb);

    const slow = res
      .filter((r) => r.duration > 800 && r.initiatorType !== 'img')
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 8)
      .map((r) => Math.round(r.duration) + 'ms ' + r.name.replace(/^https?:\/\//, '').slice(0, 90));

    const imgs = res.filter((r) => r.initiatorType === 'img');
    const imgKb = Math.round(imgs.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024);

    return {
      docHeight: document.documentElement.scrollHeight,
      paints,
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      loadEvent: nav.loadEventEnd ? Math.round(nav.loadEventEnd) : null,
      scripts: res.filter((r) => r.initiatorType === 'script').length,
      styles: res.filter((r) => r.initiatorType === 'link' || r.initiatorType === 'css').length,
      images: imgs.length,
      imgKb,
      transferKb: Math.round(transfer / 1024),
      longtasks: window.__longtasks || [],
      longtaskTotal: (window.__longtasks || []).reduce((a, b) => a + b, 0),
      byType,
      slow,
      cards: document.querySelectorAll('.post-list-thumb').length,
      days: document.querySelectorAll('.day').length,
      mobileMenu: !!document.querySelector('.esa-mobile-menu'),
      heroBg: (function () {
        const el = document.querySelector('.main-header');
        return el ? getComputedStyle(el).backgroundImage.slice(0, 80) : null;
      })(),
    };
  });

  console.log('===== ' + label + ' =====');
  console.log('loadEvent(ms)      ', loadAt, '| nav.loadEventEnd', info.loadEvent);
  console.log('docHeight          ', info.docHeight, '| cards', info.cards, '| days', info.days, '| mobileMenu', info.mobileMenu);
  console.log('paint              ', JSON.stringify(info.paints));
  console.log('requests           ', 'script=' + info.scripts, 'css=' + info.styles, 'img=' + info.images, '(img KB=' + info.imgKb + ')');
  console.log('transferKb         ', info.transferKb, JSON.stringify(info.byType));
  console.log('longtasks          ', info.longtasks.length, '任务 / 合计', info.longtaskTotal + 'ms', JSON.stringify(info.longtasks.slice(0, 12)));
  console.log('slow(>800ms)       ', info.slow.join(' | '));
  console.log('heroBg             ', info.heroBg);
  if (shot) await page.screenshot({ path: shot, fullPage: false });
  if (failed.length) console.log('failed             ', failed.slice(0, 8).join(' | '));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  await probe(browser, 'https://www.cnblogs.com/leiyuanze/', 'OURS live home', 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live\\m-home-ours.png');
  await probe(browser, 'https://www.cnblogs.com/nibabadeboke/', 'REF nibabadeboke', 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live\\m-home-ref.png');
  await browser.close();
})();
