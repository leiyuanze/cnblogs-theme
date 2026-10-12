const https = require('https');
const http = require('http');
const SONGS = [
  [3322773657, '游山恋'], [2095876512, '探故知'], [3442248108, '关山酒'], [3420272282, '牡丹亭'],
  [3373839227, '春不晚'], [167850, '庐州月'], [167882, '清明雨上'], [167937, '断桥残雪'],
  [28802028, '山水之间'], [28854182, '惊鸿一面'], [402073807, '燕归巢'], [411214279, '雅俗共赏'],
  [101131, '倾尽天下'], [28188434, '锦鲤抄'], [28188427, '棠梨煎雪'], [2078062390, '典狱司'],
  [409654891, '故梦'], [39224244, '狐言'],
];
const API = 'https://api.injahow.cn/meting/?server=netease&type=url&id=';
function head(url, depth = 0, method = 'GET') {
  return new Promise((res) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { method, timeout: 15000, headers: { 'Range': 'bytes=0-2047' } }, (r) => {
      if ([301, 302, 303, 307, 308].includes(r.statusCode) && r.headers.location && depth < 4) {
        r.resume();
        const next = new URL(r.headers.location, url).toString();
        return res(head(next, depth + 1));
      }
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => {
        const len = Buffer.concat(chunks).length;
        res({ status: r.statusCode, type: r.headers['content-type'] || '', len, url: url.slice(0, 70), depth });
      });
    });
    req.on('timeout', () => { req.destroy(); res({ status: 'TIMEOUT' }); });
    req.on('error', (e) => res({ status: 'ERR ' + e.code }));
    req.end();
  });
}
(async () => {
  for (const [id, name] of SONGS) {
    const r = await head(API + id);
    const ok = r.status === 200 && /audio|octet|mpeg|mp3/i.test(r.type);
    console.log((ok ? 'OK   ' : 'BAD  ') + String(id).padStart(11) + ' ' + name.padEnd(6) + ' status=' + r.status + ' type=' + r.type + ' size=' + (r.len || 0) + ' hops=' + r.depth);
  }
})();
