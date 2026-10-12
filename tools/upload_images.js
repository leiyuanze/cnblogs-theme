/* 批量上传图片到博客园图片库，输出 名称 -> URL 映射
 *
 *   node tools/upload_images.js <目录> <输出json>
 *
 * 说明：博客园图片库选择文件后会自动上传，标题就是文件名；
 *       这里靠"标题 + 同卡片里的 <img>"来配对，避免猜顺序。
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const DIR = process.argv[2];
const OUT = process.argv[3] || path.join(DIR, 'uploaded.json');

const findByTitle = (page, title) =>
  page.evaluate((t) => {
    const imgs = Array.from(document.querySelectorAll('img')).filter((i) =>
      /img\d+\.cnblogs\.com/.test(i.src)
    );
    for (const img of imgs) {
      let el = img;
      for (let i = 0; i < 10 && el; i++) {
        const txt = el.textContent || '';
        if (txt.indexOf(t) >= 0 && txt.indexOf('标题') >= 0) return img.src;
        el = el.parentElement;
      }
    }
    return null;
  }, title);

(async () => {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  console.log('待上传', files.length, '张 ->', DIR);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', String(e.message).split('\n')[0]));
  await page.goto('https://i.cnblogs.com/albums/uploads', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const map = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  let done = 0;

  for (const file of files) {
    const name = path.basename(file, path.extname(file));
    if (map[name]) {
      console.log('跳过（映射里已有）', name);
      continue;
    }
    // 之前可能已上传过同名图，先看看列表里有没有
    let url = await findByTitle(page, name);
    if (url) {
      map[name] = url;
      fs.writeFileSync(OUT, JSON.stringify(map, null, 2), 'utf8');
      console.log('复用', name, '->', url);
      continue;
    }

    const full = path.join(DIR, file);
    await page.setInputFiles('input[type=file]', full).catch((e) => console.log('选择失败', name, e.message.split('\n')[0]));
    for (let i = 0; i < 16 && !url; i++) {
      await page.waitForTimeout(1500);
      url = await findByTitle(page, name);
    }
    if (url) {
      map[name] = url;
      fs.writeFileSync(OUT, JSON.stringify(map, null, 2), 'utf8');
      done++;
      console.log('OK  ', name, '->', url);
    } else {
      console.log('FAIL', name);
    }
  }

  console.log('完成：新上传', done, '张，映射共', Object.keys(map).length, '张 ->', OUT);
  await page.close();
  browser.close().catch(() => {});
})();
