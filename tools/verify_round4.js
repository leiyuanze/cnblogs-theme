/* 验收第 4 轮：手机端置顶文章不再被顶宽 / 音乐播放器自动收起 /
 * 封面与音乐都是混合排布（不是一类连着一串） */
const fs = require('fs');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HOME = 'https://www.cnblogs.com/leiyuanze/';
const ROOT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura';
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};
const DESKTOP = { viewport: { width: 1440, height: 900 } };

const coverMap = JSON.parse(fs.readFileSync(ROOT + '\\uploaded-covers.json', 'utf8'));
const urlToName = {};
Object.entries(coverMap).forEach(([name, url]) => {
  urlToName[url.split('/').pop()] = name;
});
const headerMap = JSON.parse(fs.readFileSync(ROOT + '\\uploaded-headers.json', 'utf8'));
const headerUrls = new Set(Object.values(headerMap).map((u) => u.split('/').pop()));
const songsSrc = fs.readFileSync(ROOT + '\\install\\main.js', 'utf8');
const songs = {};
Array.from(songsSrc.matchAll(/name: "([^"]+)", artist: "([^"]+)"/g)).forEach((m) => {
  songs[m[1]] = m[2];
});

const longestRun = (arr) => {
  let best = 1;
  let cur = 1;
  for (let i = 1; i < arr.length; i += 1) {
    cur = arr[i] === arr[i - 1] ? cur + 1 : 1;
    if (cur > best) best = cur;
  }
  return best;
};

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });

  // 1) 置顶文章：手机端不能再被顶宽
  const ctx0 = await browser.newContext(MOBILE);
  const p0 = await ctx0.newPage();
  await p0.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p0.waitForTimeout(5000);
  const pinned = await p0.evaluate(() =>
    Array.from(document.querySelectorAll('.post-list-thumb .esa-card-pinned')).slice(0, 3).map((el) => {
      const card = el.closest('.post-list-thumb');
      const a = card && card.querySelector('.post-title a');
      return a ? a.href : null;
    })
  );
  await ctx0.close();
  console.log('置顶文章:', pinned.filter(Boolean).join(' , ') || '(首页没标出置顶)');

  for (const url of pinned.filter(Boolean)) {
    const ctx = await browser.newContext(MOBILE);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(7000);
    const info = await page.evaluate(() => ({
      title: document.title.slice(0, 30),
      vw: window.innerWidth,
      docSW: document.documentElement.scrollWidth,
      bodySW: document.body.scrollWidth,
      fullWidthMath: Array.from(document.querySelectorAll('.mjx-full-width')).map((el) => Math.round(el.getBoundingClientRect().width)),
    }));
    console.log('  ' + url + ' -> vw=' + info.vw + ' docSW=' + info.docSW + ' bodySW=' + info.bodySW +
      ' 公式壳宽=' + JSON.stringify(info.fullWidthMath.slice(0, 6)));
    await ctx.close();
  }

  // 2) 手机端：封面混排 + 播放器自动收起
  const ctx = await browser.newContext(MOBILE);
  const page = await ctx.newPage();
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('touchstart'));
    document.dispatchEvent(new Event('touchstart'));
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(9000);

  const mixInfo = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('.post-list-thumb .post-thumb img'));
    return {
      covers: imgs.map((i) => (i.getAttribute('data-src') || i.getAttribute('src') || '').split('/').pop()),
      aplayer: !!document.querySelector('.aplayer'),
      narrow: !!document.querySelector('.aplayer-narrow'),
      switcherVisible: (() => {
        const sw = document.querySelector('.aplayer-miniswitcher');
        if (!sw) return null;
        const r = sw.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(sw).visibility !== 'hidden';
      })(),
      barBox: (() => {
        const el = document.querySelector('.aplayer-body');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
      })(),
      playerBoxes: ['.aplayer', '.aplayer-body', '.aplayer-pic', '.aplayer-miniswitcher', '.aplayer-info'].map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return sel + ': 无';
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return (
          sel + ': x=' + Math.round(r.left) + ' y=' + Math.round(r.top) + ' w=' + Math.round(r.width) +
          ' h=' + Math.round(r.height) + ' display=' + cs.display + ' opacity=' + cs.opacity +
          ' left=' + cs.left + ' transform=' + cs.transform
        );
      }),
      playerClass: (() => {
        const el = document.querySelector('.aplayer');
        return el ? el.className : null;
      })(),
      titles: Array.from(document.querySelectorAll('.aplayer-list .aplayer-list-title')).map((el) => el.textContent.trim()),
    };
  });

  const cats = mixInfo.covers.map((f) => (urlToName[f] || '?')[0]);
  const kinds = mixInfo.covers.map((f) => (urlToName[f] ? 'cover' : headerUrls.has(f) ? 'header' : 'post'));
  const kindCount = kinds.reduce((acc, k) => ((acc[k] = (acc[k] || 0) + 1), acc), {});
  console.log('\n手机端封面顺序:', mixInfo.covers.map((f) => urlToName[f] || f).join(' '));
  console.log('风格序列:', cats.join(''), ' 同类最长连排 =', longestRun(cats));
  console.log('图片来源:', kinds.join(' '), JSON.stringify(kindCount), ' 同类最长连排 =', longestRun(kinds));
  console.log('播放器存在:', mixInfo.aplayer, ' 已收起(narrow):', mixInfo.narrow, ' 开关可见:', mixInfo.switcherVisible, ' body 位置:', JSON.stringify(mixInfo.barBox));
  console.log('播放器类名:', mixInfo.playerClass);
  mixInfo.playerBoxes.forEach((line) => console.log('  ' + line));
  const artists = mixInfo.titles.map((t) => (songs[t] || '').split('/')[0].trim());
  console.log('播放列表:', mixInfo.titles.join(' / '));
  console.log('歌手序列:', artists.join(' | '), ' 同一歌手最长连排 =', longestRun(artists));
  await ctx.close();

  // 3) 桌面端：播放器保持原来的 66px 小胶囊（不跟着滑出），页面也不该有横向溢出
  //    注：APlayer 在 fixed 模式下默认就是 narrow，PC 端本来就是这个样子
  const dctx = await browser.newContext(DESKTOP);
  const dpage = await dctx.newPage();
  await dpage.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await dpage.waitForTimeout(12000);
  const desk = await dpage.evaluate(() => {
    const el = document.querySelector('.aplayer');
    const bar = document.querySelector('.aplayer-body');
    const r = bar ? bar.getBoundingClientRect() : null;
    return {
      className: el ? el.className : null,
      bodyBox: r ? [Math.round(r.left), Math.round(r.width), Math.round(r.height)] : null,
      vw: window.innerWidth,
      docSW: document.documentElement.scrollWidth,
      covers: Array.from(document.querySelectorAll('.post-list-thumb .post-thumb img')).length,
    };
  });
  console.log('\n桌面端: 播放器类名=' + desk.className + ' body[x,w,h]=' + JSON.stringify(desk.bodyBox) +
    ' vw=' + desk.vw + ' docSW=' + desk.docSW + ' 卡片=' + desk.covers);
  await dctx.close();
  await browser.close();
})();
