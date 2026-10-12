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
- `node tools\shoot_live2.js`：线上实拍截图（存到 `sakura/live/`）

## 关键坑（都踩过）

1. **博客园页脚 HTML 会丢 `<script>`**：字段内容太大时脚本整段被过滤。
   所以主脚本必须放文件存储，页脚只留配置。
2. **博客园文件不能覆盖同名文件**：每次改 JS 都要换文件名，并同步 `JS_CDN`。
3. **首页卡片曾经整页空白**：主题原版读 `.postDesc a[0].href`（游客没有编辑链接）直接抛异常，
   而 `.day{display:none}` 又把原生列表藏了。现在改成 `.forFlow.silence-ready` 才隐藏，
   JS 挂了也能看到原生列表。
4. **jQuery 版本**：主题原版依赖 jQuery 1.8 的 `.context`，现在统一用博客园自带的 3.3.1。
5. **图片别放 GitHub/jsdelivr**：这里实测单张 2.2 秒，头图/封面统一走博客园自己的域名。

## 回退

- 后台「设置 → 历史版本」可以回滚；
- 本地 `sakura/backup-live/*.txt` 是上一次线上配置的完整原文；
- 把 `backup-live` 里对应文件写回 `install/` 再跑 `admin_deploy.js write` 即可还原。
