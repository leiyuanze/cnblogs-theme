/* 读取/写入博客园后台的主题配置（通过已登录的调试浏览器 + Monaco 编辑器）
 *
 *   node tools/admin_deploy.js read    只备份当前线上配置
 *   node tools/admin_deploy.js write   写入 install/ 下的新配置并保存
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const INSTALL = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\install';
const BACKUP = 'D:\\leiyuanze\\cnblogs-beautify\\sakura\\backup-live';
const MODE = process.argv[2] || 'read';

const FILES = {
  'blog-sidebar': path.join(INSTALL, 'sidebar.html'),
  'custom-css': path.join(INSTALL, 'page.css'),
  'header-html': path.join(INSTALL, 'head.html'),
  'footer-html': path.join(INSTALL, 'footer.html'),
};

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).split('\n')[0]));

  await page.goto('https://i.cnblogs.com/settings', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const hasMonaco = await page.evaluate(() => !!(window.monaco && window.monaco.editor));
  if (!hasMonaco) {
    console.log('页面里没有 window.monaco，无法直接操作编辑器');
    await page.close();
    browser.close().catch(() => {});
    return;
  }

  // 用编辑器实例把它和 cnb-code-editor 的 id 对上，绝不靠顺序猜
  const mapping = await page.evaluate(() => {
    const editors = window.monaco.editor.getEditors
      ? window.monaco.editor.getEditors()
      : window.monaco.editor.getModels().map((m) => ({ getDomNode: () => null, getModel: () => m, getValue: () => m.getValue() }));
    return editors.map((ed, i) => {
      const node = ed.getDomNode ? ed.getDomNode() : null;
      const holder = node ? node.closest('cnb-code-editor') : null;
      const model = ed.getModel();
      return {
        i,
        id: holder ? holder.id : null,
        uri: model ? String(model.uri) : null,
        len: ed.getValue ? ed.getValue().length : null,
        head: (ed.getValue ? ed.getValue() : '').replace(/\s+/g, ' ').slice(0, 70),
      };
    });
  });
  console.log('编辑器映射:');
  console.log(JSON.stringify(mapping, null, 1));

  fs.mkdirSync(BACKUP, { recursive: true });
  const dump = await page.evaluate(() => {
    const out = {};
    (window.monaco.editor.getEditors ? window.monaco.editor.getEditors() : []).forEach((ed) => {
      const node = ed.getDomNode ? ed.getDomNode() : null;
      const holder = node ? node.closest('cnb-code-editor') : null;
      if (holder && holder.id) out[holder.id] = ed.getValue();
    });
    return out;
  });
  for (const [id, value] of Object.entries(dump)) {
    const file = path.join(BACKUP, id + '-' + value.length + '.txt');
    fs.writeFileSync(file, value, 'utf8');
    console.log('backup ->', path.basename(file));
  }

  if (MODE !== 'write') {
    await page.close();
    browser.close().catch(() => {});
    return;
  }

  const payload = {};
  for (const [id, p] of Object.entries(FILES)) {
    payload[id] = fs.readFileSync(p, 'utf8');
  }

  const applied = await page.evaluate((values) => {
    const report = {};
    (window.monaco.editor.getEditors ? window.monaco.editor.getEditors() : []).forEach((ed) => {
      const node = ed.getDomNode ? ed.getDomNode() : null;
      const holder = node ? node.closest('cnb-code-editor') : null;
      const id = holder && holder.id;
      if (!id || !(id in values)) return;
      ed.setValue(values[id]);
      const now = ed.getValue();
      report[id] = { want: values[id].length, got: now.length, ok: now === values[id] };
    });
    return report;
  }, payload);
  console.log('写入模型:', JSON.stringify(applied, null, 1));

  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(BACKUP, 'settings-before-save.png') });

  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button,a')).filter(
      (el) => el.textContent.replace(/\s+/g, '') === '保存' && el.offsetParent !== null
    );
    if (!btns.length) return false;
    btns[btns.length - 1].click();
    return true;
  });
  console.log('点击保存:', clicked);
  await page.waitForTimeout(7000);
  await page.screenshot({ path: path.join(BACKUP, 'settings-after-save.png') });

  const after = await page.evaluate(() => {
    const out = {};
    (window.monaco.editor.getEditors ? window.monaco.editor.getEditors() : []).forEach((ed) => {
      const node = ed.getDomNode ? ed.getDomNode() : null;
      const holder = node ? node.closest('cnb-code-editor') : null;
      if (holder && holder.id) out[holder.id] = ed.getValue().length;
    });
    return out;
  });
  console.log('保存后长度:', JSON.stringify(after));
  if (errors.length) console.log('页面错误:', errors.slice(0, 5).join(' | '));

  await page.close();
  browser.close().catch(() => {});
})();
