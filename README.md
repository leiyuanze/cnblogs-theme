# cnblogs 美化工作区

目标博客：https://www.cnblogs.com/leiyuanze
参考风格：https://www.cnblogs.com/nibabadeboke（复刻 Sakura 主题 + 换成自己的图/歌）

> 主题基于 [Zou-Wang/CNblogs-Theme-Sakura](https://github.com/Zou-Wang/CNblogs-Theme-Sakura) 二次开发：
> 修掉了原版在游客视角下的致命报错，重写了首页列表、目录、代码块，并做了移动端适配。

## 目录结构

- `sakura/zouwang/`：Sakura 主题原始源码（不要直接改，留着对比）
- `sakura/build_install.py`：**唯一入口**，跑一遍生成 `sakura/install/` 下的安装包
- `sakura/install/`
  - `page.css` → 后台「页面定制CSS代码」
  - `footer.html` → 后台「页脚HTML代码」（只放配置，约 4KB）
  - `sidebar.html` → 后台「博客侧边栏公告」
  - `head.html` → 后台「页首HTML代码」（保持空白即可）
  - `main.js` → **上传到博客园「文件」**，页脚只引用它的直链
- `sakura/backup-live/`：每次读写后台前的线上配置备份 + 操作截图
- `sakura/original-theme/`：**改造前**的线上配置原文（回退用）

## 素材

- `guofeng/`：收集的古风素材池（按批次存放原图 + 拼图，仅存档，站点不直接引用）
- `sakura/headers-web/`：头图成品（1600×667，20 张）
  - `h19.jpg` 原为 pick5/g13（古街黄昏，整幅带「图查查」平铺水印），
    已换成 web/img01（仙山楼阁夜景），重新上传图床后 `uploaded-headers.json` 的 `h19` 指向新文件
- `sakura/covers-web/`：首页卡片封面成品（900×600，古风女子，25 张）
  - `c06b.jpg` 是 `c06` 的重裁版：原图中下部有「小红书」水印，改成只取上半身，
    文件名带 b 是为了让博客园图床当成新文件重新上传（同名不让覆盖）
- `sakura/uploaded-headers.json` / `uploaded-covers.json`：上传到**博客园图床**后的
  名称 → URL 映射，`build_install.py` 直接读它生成配置

> 站点实际加载的图片全部走博客园自己的图床（`img2024.cnblogs.com`），
> 不走 GitHub / jsdelivr——国内实测后者单张要 2 秒以上。
> 素材池进仓库只是为了存档和以后换图。
- `tools/`：Playwright 诊断/部署脚本（连本机已登录的 Edge 调试实例）
- `before/`：最早期的线上基线快照

## 部署流程

```powershell
# 1. 起一个带调试端口的 Edge（用专用配置，登录一次就能一直复用）
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --remote-debugging-port=9222 `
  --remote-allow-origins=http://127.0.0.1:9222 `
  --user-data-dir="D:\leiyuanze\.workbuddy\edge-debug-profile"

# 2. 本地生成安装包
python sakura\build_install.py

# 3. 上传主题脚本（文件名必须换新，博客园不允许覆盖同名文件）
node tools\admin_upload.js "D:\leiyuanze\cnblogs-beautify\sakura\install\main.js" leiyuanze-main-<版本>.js
#    上传后把 build_install.py 里的 JS_CDN / JS_VER 改成新文件名，再跑一次 build

# 4. 备份 + 写入后台（CSS / 页首 / 页脚 / 侧边栏）
node tools\admin_deploy.js read     # 只备份
node tools\admin_deploy.js write    # 写入并保存
```

## 诊断脚本

- `node tools\live_errors.js`：PC + 手机抓线上页面报错、卡片数量
- `node tools\mobile_perf.js`：手机端性能对比（资源量、首屏、长任务）
- `node tools\verify_install.js`：本地装新包试跑（不碰线上）
- `node tools\check_random.js`：验证封面每次刷新是否变化、手机端大标题是否溢出
- `node tools\diag_menu.js`：手机端汉堡菜单能否展开、展开高度
- `node tools\check_mobile_cards.js`：手机端卡片封面与正文是否重叠
- `node tools\diag_overflow2.js <文章URL>`：找出把手机端页面撑宽的节点（谁 scrollWidth > clientWidth）
- `node tools\verify_round4.js`：整轮验收（置顶文章不再顶宽 / 播放器收起 / 封面与音乐是否混排）
- `node tools\verify_tags_avatar.js`：手机标签页标题遮挡、首屏头像和汉堡按钮滚动隐藏
- `node tools\shoot_live2.js`：线上实拍截图（存到 `sakura/live/`）

## 播放器与签名

- **播放器默认收起（PC 和手机端一致）**：初始化 APlayer 后自动切到 narrow，只留一个 `>`。
  用的那份 APlayer.min.css 没有滑出样式，`sakura/build_install.py` 里全局补了
  `.aplayer-narrow .aplayer-body { left: -66px }`；鼠标悬停（PC）或点一下开关（手机）就展开。
- **头图签名随机**：`MOTTOS` 里的 16 句诗句用 `|` 拼进配置的 `topInfo.text`，
  `main.js` 的 `mainHeader()` 每次加载随机取一条。
- **首屏头像**：`AVATAR` 写入 `topInfo.avatar`；脚本优先使用页面里真实的 `#user_icon`，
  只有默认灰头像时才回退到配置地址。头像放在标题上方，不替换博客园账号头像。
- **手机标签页/归档页遮挡**：头图与正文统一用 `svh`；列表页正文额外留 22px 安全区；
  汉堡按钮向下滚动淡出，向上滑恢复。
- **封面池**：`coverImg` 和头图两池各自打乱后再拼接、并去重，保证每次刷新都是
  二次元 / 写实混着出现，且封面池够用时不用头图顶替。
- **音乐顺序**：每次刷新挑“剩下最多”的歌手、且避开上一位，避免同一个人的歌连排。

## 关键坑（都踩过）

1. **博客园页脚 HTML 会丢 `<script>`**：字段内容太大时脚本整段被过滤。
   所以主脚本必须放文件存储，页脚只留配置。
2. **博客园文件不能覆盖同名文件**：每次改 JS 都要换文件名，并同步 `JS_CDN`。
3. **首页卡片曾经整页空白**：主题原版读 `.postDesc a[0].href`（游客没有编辑链接）直接抛异常，
   而 `.day{display:none}` 又把原生列表藏了。现在改成 `.forFlow.silence-ready` 才隐藏，
   JS 挂了也能看到原生列表。
4. **jQuery 版本**：主题原版依赖 jQuery 1.8 的 `.context`，现在统一用博客园自带的 3.3.1。
5. **图片别放 GitHub/jsdelivr**：这里实测单张 2.2 秒，头图/封面统一走博客园自己的域名。
6. **手机端置顶文章右侧一条白边**：MathJax 的展示公式外层有一层 `display:table-cell`
   的 `.mjx-full-width` 壳，带着 em 单位的 `min-width`，窄屏下被钉在 430px 以上，
   整页被顶宽成 455px、浏览器缩小页面。修法是手机端把它改成
   `display:block; min-width:0; overflow-x:auto`，公式在框里滚，页面不再被顶宽。
   （另：`.MJX_Assistive_MathML` 辅助副本也要裁掉溢出。）

## 回退

- 后台「设置 → 历史版本」可以回滚；
- 本地 `sakura/backup-live/*.txt` 是上一次线上配置的完整原文；
- 把 `backup-live` 里对应文件写回 `install/` 再跑 `admin_deploy.js write` 即可还原。
