const https = require('https');
const SONGS = [
  [3322773657, '游山恋'], [2095876512, '探故知'], [3442248108, '关山酒'], [3420272282, '牡丹亭'],
  [3373839227, '春不晚'], [167850, '庐州月'], [167882, '清明雨上'], [167937, '断桥残雪'],
  [28802028, '山水之间'], [28854182, '惊鸿一面'], [402073807, '燕归巢'], [411214279, '雅俗共赏'],
  [101131, '倾尽天下'], [28188434, '锦鲤抄'], [28188427, '棠梨煎雪'], [2078062390, '典狱司'],
  [409654891, '故梦'], [39224244, '狐言'],
];
const API = 'https://api.injahow.cn/meting/?server=netease&type=url&id=';
const get = (url) => new Promise((res) => {
  const req = https.get(url, { timeout: 15000 }, (r) => {
    let d = '';
    r.on('data', (c) => (d += c));
    r.on('end', () => res({ status: r.statusCode, type: r.headers['content-type'], body: d.slice(0, 120) }));
  });
  req.on('timeout', () => { req.destroy(); res({ status: 'TIMEOUT' }); });
  req.on('error', (e) => res({ status: 'ERR ' + e.code }));
});
(async () => {
  for (const [id, name] of SONGS) {
    const r = await get(API + id);
    const ok = r.status === 200 && /audio|octet|mp3|mpeg/i.test(r.type || '');
    console.log((ok ? 'OK   ' : 'BAD  ') + String(id).padStart(11) + ' ' + name.padEnd(6) + ' ' + r.status + ' ' + (r.type || '') + ' ' + String(r.body).replace(/\s+/g, ' ').slice(0, 60));
  }
})();
