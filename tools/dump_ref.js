/* 导出参考站渲染后的关键 DOM 结构 */
const fs = require('fs');
const { chromium } = require('playwright-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\ref';

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://www.cnblogs.com/nibabadeboke/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  const data = await page.evaluate(() => {
    const grab = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.outerHTML : null;
    };
    const scripts = Array.from(document.querySelectorAll('script')).map(function (s) {
      return s.src ? 'SRC ' + s.src : 'INLINE ' + s.textContent.trim().slice(0, 400);
    });
    const interesting = [];
    document.querySelectorAll('body *').forEach(function (el) {
      const cls = String(el.className || '');
      if (/headertop|pattern-center|site-title|header-info|wave|topInfo|top-img|post-card|card|moe|sakura/i.test(cls) && interesting.length < 40) {
        interesting.push(el.tagName + ' .' + cls.split(/\s+/).join('.') + ' :: ' + el.textContent.trim().slice(0, 60));
      }
    });
    return {
      header: grab('#header'),
      sidebarNews: grab('#sidebar_news'),
      sidebarMain: grab('#sideBarMain'),
      bodyChildren: Array.from(document.body.children).map(function (el) {
        return el.tagName + '#' + el.id + '.' + String(el.className).slice(0, 60);
      }),
      scripts: scripts,
      interesting: interesting
    };
  });

  fs.writeFileSync(OUT + '\\ref-dom.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('header len:', data.header ? data.header.length : 0);
  console.log('sidebarNews len:', data.sidebarNews ? data.sidebarNews.length : 0);
  console.log('body children:\n' + data.bodyChildren.join('\n'));
  console.log('interesting:\n' + data.interesting.join('\n'));
  console.log('scripts:\n' + data.scripts.join('\n'));
  await browser.close();
})();
