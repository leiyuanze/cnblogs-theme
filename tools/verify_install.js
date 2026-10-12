/* 本地验证新的 install 包：桌面 + 手机，首页 + 文章页 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const INSTALL = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\install';
const OUT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live';
const HOME = 'https://www.cnblogs.com/leiyuanze/';
const POST = 'https://www.cnblogs.com/leiyuanze/p/17405952.html';

const footer = fs.readFileSync(path.join(INSTALL, 'footer.html'), 'utf8');
const cfgStart = footer.indexOf('$.silence({');
const config = footer.slice(cfgStart, footer.indexOf('</script>', cfgStart));

const DESKTOP = { viewport: { width: 1440, height: 900 } };
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};

/* 先把线上正在用的旧主题页脚整段切掉，只测新包（必须在 goto 之前挂） */
async function stripLiveTheme(page) {
  await page.route('**/leiyuanze/**', async (route) => {
    if (route.request().resourceType() !== 'document') {
      return route.continue();
    }
    const res = await route.fetch();
    let html = await res.text();
    const cut = html.indexOf('<!--live2d-->');
    if (cut > 0) {
      const tail = html.indexOf('</body>', cut);
      html = html.slice(0, cut) + (tail > 0 ? html.slice(tail) : '</body></html>');
    }
    await route.fulfill({ response: res, body: html });
  });
}

async function prepare(page) {
  await page.evaluate(() => {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
      const href = el.getAttribute('href') || '';
      if (href.indexOf('/skins/') >= 0 || href.indexOf('custom.css') >= 0) el.remove();
    });
  });
  await page.addStyleTag({ url: 'https://www.cnblogs.com/skins/custom/bundle-custom.min.css' });
  await page.addStyleTag({ content: '.main-header{z-index:0!important}#header{opacity:1!important}' });
  await page.addStyleTag({ path: path.join(INSTALL, 'page.css') });
  await page.addScriptTag({ url: 'https://assets.cnblogs.com/scripts/jquery-3.3.1.min.js' });
  await page.addScriptTag({ path: path.join(INSTALL, 'main.js') });
  await page.addScriptTag({ content: config });
}

async function run(browser, label, url, opts, shots, extra) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e.message || e).split('\n')[0]));
  page.on('console', (m) => {
    if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160));
  });
  await stripLiveTheme(page);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1200);
  await prepare(page);
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.post-list-thumb'));
    const covers = cards
      .map((c) => {
        const img = c.querySelector('.post-thumb img');
        if (!img) return null;
        return img.getAttribute('data-src') || img.getAttribute('src');
      })
      .filter(Boolean);
    const cat = document.querySelector('.esa-catalog');
    const heads = Array.from(document.querySelectorAll('#cnblogs_post_body h2, #cnblogs_post_body h3')).slice(0, 3);
    return {
      ready: !!document.querySelector('.forFlow.silence-ready'),
      cards: cards.length,
      uniqueCovers: new Set(covers).size,
      firstCardTitle: cards.length ? cards[0].querySelector('.post-title').textContent.trim() : null,
      firstCardDate: cards.length ? cards[0].querySelector('.post-date').textContent.trim() : null,
      catalogs: document.querySelectorAll('.esa-catalog').length,
      catalogItems: document.querySelectorAll('.esa-catalog li').length,
      catalogFirst: (function () {
        const li = document.querySelector('.esa-catalog li');
        return li ? li.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : null;
      })(),
      headSample: heads.map((h) => h.outerHTML.replace(/\s+/g, ' ').slice(0, 120)),
      headHasMathJax: !!document.querySelector('#cnblogs_post_body h2 .MathJax, #cnblogs_post_body h3 .MathJax'),
      codeBlocks: document.querySelectorAll('.esa-code').length,
      rawPres: document.querySelectorAll('#cnblogs_post_body pre').length,
      codeLang: (function () {
        const el = document.querySelector('.esa-code-lang');
        return el ? el.textContent : null;
      })(),
      copyBtn: document.querySelectorAll('.esa-clipboard-button').length,
      visibleDays: Array.from(document.querySelectorAll('.day')).filter((d) => d.offsetParent !== null).length,
      docHeight: document.documentElement.scrollHeight,
    };
  });

  console.log('===== ' + label + ' =====');
  console.log(JSON.stringify(info, null, 1));
  if (errs.length) console.log('errors:', errs.slice(0, 5).join('\n  '));
  else console.log('errors: none');

  if (shots) {
    await page.screenshot({ path: path.join(OUT, shots[0]) });
    await page.evaluate(() => window.scrollTo(0, 1100));
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, shots[1]) });
  }
  if (extra) await extra(page);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  await run(browser, 'DESKTOP home', HOME, DESKTOP, ['v-desktop-home-top.png', 'v-desktop-home-mid.png']);
  await run(browser, 'DESKTOP post', POST, DESKTOP, ['v-desktop-post-top.png', 'v-desktop-post-code.png'], async (page) => {
    const y = await page.evaluate(() => {
      const el = document.querySelector('.esa-code');
      return el ? el.getBoundingClientRect().top + window.scrollY - 120 : 900;
    });
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'v-desktop-code-focus.png') });
  });
  await run(browser, 'MOBILE home', HOME, MOBILE, ['v-mobile-home-top.png', 'v-mobile-home-mid.png']);
  await run(browser, 'MOBILE post', POST, MOBILE, ['v-mobile-post-top.png', 'v-mobile-post-mid.png']);
  await browser.close();
})();
