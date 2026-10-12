/* 验收：PC 端播放器也收起只留 ">"；头图签名每次刷新随机换 */
const fs = require('fs');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HOME = 'https://www.cnblogs.com/leiyuanze/';
const DESKTOP = { viewport: { width: 1440, height: 900 } };

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });

  // 1) 签名：连开 5 次，看有没有换
  const seen = [];
  for (let i = 0; i < 5; i += 1) {
    const ctx = await browser.newContext(DESKTOP);
    const page = await ctx.newPage();
    await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3500);
    const text = await page.evaluate(() => {
      const p = document.querySelector('.header-info p');
      return p ? p.textContent.trim().replace(/\s+/g, ' ') : null;
    });
    seen.push(text);
    console.log('第' + (i + 1) + '次:', text);
    await ctx.close();
  }
  console.log('不同签名条数:', new Set(seen).size, '/', seen.length);

  // 2) PC 播放器：默认收起（body 滑出），鼠标移上去展开
  const ctx = await browser.newContext(DESKTOP);
  const page = await ctx.newPage();
  await page.goto(HOME, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(12000);
  const collapsed = await page.evaluate(() => {
    const el = document.querySelector('.aplayer');
    const body = document.querySelector('.aplayer-body');
    const sw = document.querySelector('.aplayer-miniswitcher');
    const r = body ? body.getBoundingClientRect() : null;
    const sr = sw ? sw.getBoundingClientRect() : null;
    return {
      cls: el ? el.className : null,
      bodyX: r ? Math.round(r.left) : null,
      switcherBox: sr ? [Math.round(sr.left), Math.round(sr.width), Math.round(sr.height)] : null,
    };
  });
  console.log('\nPC 默认:', JSON.stringify(collapsed));
  const sw = await page.$('.aplayer-miniswitcher');
  if (sw) {
    await sw.hover();
    await page.waitForTimeout(900);
  }
  const expanded = await page.evaluate(() => {
    const body = document.querySelector('.aplayer-body');
    const r = body ? body.getBoundingClientRect() : null;
    return { bodyX: r ? Math.round(r.left) : null, width: r ? Math.round(r.width) : null };
  });
  console.log('PC 悬停后:', JSON.stringify(expanded));
  await ctx.close();
  await browser.close();
})();
