const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.message).split('\n')[0]));
  await p.goto('https://i.cnblogs.com/albums/uploads', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(5000);
  const before = await p.evaluate(() => ({
    imgs: Array.from(document.querySelectorAll('img')).map((i) => i.src).slice(0, 6),
    firstItem: (document.querySelector('img') || {}).closest ? String(document.querySelector('img').closest('div').outerHTML || '').replace(/\s+/g, ' ').slice(0, 700) : null,
    used: (document.body.innerText.match(/已用[^\n]*/) || [''])[0],
  }));
  console.log('BEFORE', JSON.stringify(before, null, 1));
  await p.setInputFiles('input[type=file]', 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\headers-web\\h01.jpg');
  await p.waitForTimeout(1500);
  const mid = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300));
  console.log('AFTER SELECT:', mid);
  const btns = await p.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => b.textContent.replace(/\s+/g, '') + '|' + (b.offsetParent !== null)).slice(0, 20));
  console.log('BUTTONS', JSON.stringify(btns));
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) => el.textContent.replace(/\s+/g, '').indexOf('上传') >= 0 && el.offsetParent !== null);
    if (btn) btn.click();
  });
  await p.waitForTimeout(9000);
  const after = await p.evaluate(() => ({
    imgs: Array.from(document.querySelectorAll('img')).map((i) => i.src).slice(0, 6),
    used: (document.body.innerText.match(/已用[^\n]*/) || [''])[0],
    text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 260),
  }));
  console.log('AFTER UPLOAD', JSON.stringify(after, null, 1));
  await p.screenshot({ path: 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\backup-live\\albums-debug.png' });
  await p.close();
  b.close().catch(() => {});
})();
