/* 看你线上博客的现状 */
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\live';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://www.cnblogs.com/leiyuanze/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(OUT, 'live-home-top.png') });
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'live-home-mid.png') });

  const info = await page.evaluate(() => {
    const covers = Array.from(document.querySelectorAll('.post-list-thumb .post-thumb img')).map(function (i) { return i.src; });
    const branding = document.querySelector('.site-branding');
    const blogTitle = document.querySelector('#blogTitle');
    return {
      coverCount: covers.length,
      uniqueCovers: Array.from(new Set(covers)).length,
      firstCovers: covers.slice(0, 6),
      brandingText: branding ? branding.textContent.trim().slice(0, 40) : null,
      blogTitleText: blogTitle ? blogTitle.textContent.trim().slice(0, 40) : null,
      catalogOnHome: document.querySelectorAll('.catalog,.toc-container,.post-catalog').length
    };
  });
  console.log('HOME', JSON.stringify(info, null, 2));

  const link = await page.evaluate(() => {
    const a = document.querySelector('.post-list-thumb .post-title a, .post-list-thumb a.button-normal');
    return a ? a.href : document.querySelector('#mainContent a[href*="/p/"]').href;
  });
  await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(OUT, 'live-post-top.png') });
  const postInfo = await page.evaluate(() => {
    const cat = document.querySelector('.catalog,.toc-container,.post-catalog');
    return {
      hasCatalog: !!cat,
      catalogText: cat ? cat.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) : null,
      catalogHtml: cat ? cat.outerHTML.slice(0, 600) : null
    };
  });
  console.log('POST', JSON.stringify(postInfo, null, 2));
  await browser.close();
})();
