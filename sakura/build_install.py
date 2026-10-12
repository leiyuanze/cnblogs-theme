# -*- coding: utf-8 -*-
"""基于 Sakura 主题源码，生成 leiyuanze 的博客园安装包（复刻 + 自适配）。

2026-10-12 版重点：
1. 首页卡片不再抛异常（原版遇到没有「编辑」链接的访客直接 Cannot read properties of undefined）
2. 主题 JS 内联进页脚，不再依赖 cdn.jsdelivr.net / cdn.bootcss.com
3. 手机端与桌面端分开适配：首屏不再被外部 CDN 卡住，重特效全部延后
4. 代码块加工具条（语言标注 + 复制），目录不再破坏正文标题
"""
import os
import re
import json

BASE = r"D:\leiyuanze\cnblogs-beautify\sakura"
SRC = os.path.join(BASE, "zouwang")
OUT = os.path.join(BASE, "install")
os.makedirs(OUT, exist_ok=True)

CDN = "https://cdn.jsdelivr.net/gh/leiyuanze/leiyuanze.github.io@master/skin"  # 旧图床，仅作兜底
# 主题主脚本放在博客园自己的文件存储里（快、稳、不受 jsdelivr 影响）
JS_CDN = "https://blog-static.cnblogs.com/files/leiyuanze/leiyuanze-main-20261012m.js"
JS_VER = "20261012m"


def load_uploaded(name):
    """读取 tools/upload_images.js 生成的 名称->图床URL 映射。"""
    path = os.path.join(BASE, name)
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    return {}


HEADER_MAP = load_uploaded("uploaded-headers.json")
COVER_MAP = load_uploaded("uploaded-covers.json")

# 头图走博客园图床（国内快）；没有映射时回退到旧的 GitHub 图床
HEADERS = [HEADER_MAP.get(f"h{i:02d}") or f"{CDN}/headers/h{i:02d}.jpg" for i in range(1, 21)]
NOT_HOME = [HEADERS[i] for i in (0, 2, 4, 7, 10, 13, 17)]

# 首页卡片封面：素材池里挑出来的古风女子图
# 两套风格交替排列（二次元 / 写实），避免同一类连着出现
_COVER_A = ["a01", "a02", "a03", "a06", "a07", "a08", "a14", "a18", "a20", "a21", "a26"]
# c06 用重裁过的上半身版（c06b）；c07 / c22 / c27 原图带水印，按要求照样放进来
_COVER_C = ["c01", "c02", "c03", "c06b", "c07", "c09", "c10", "c14", "c18", "c19", "c22", "c27", "c28", "c30"]
COVER_ORDER = [x for pair in zip(_COVER_A, _COVER_C) for x in pair]
COVER_ORDER += _COVER_A[len(_COVER_C):] + _COVER_C[len(_COVER_A):]
COVERS = [COVER_MAP[name] for name in COVER_ORDER if COVER_MAP.get(name)]

# 头图下面那句签名：每次刷新随机取一条
# （配置里用 | 拼成一串，随机逻辑在 main.js 的 mainHeader 里）
MOTTOS = [
    "心之所向，素履以往。",
    "生如逆旅，一苇以航。",
    "人生若只如初见，何事秋风悲画扇。",
    "山有木兮木有枝，心悦君兮君不知。",
    "落霞与孤鹜齐飞，秋水共长天一色。",
    "醉后不知天在水，满船清梦压星河。",
    "此心安处是吾乡。",
    "且将新火试新茶，诗酒趁年华。",
    "一蓑烟雨任平生。",
    "长风破浪会有时，直挂云帆济沧海。",
    "疏影横斜水清浅，暗香浮动月黄昏。",
    "落花人独立，微雨燕双飞。",
    "云想衣裳花想容，春风拂槛露华浓。",
    "星光不问赶路人，时光不负有心人。",
    "以梦为马，不负韶华。",
    "愿你出走半生，归来仍是少年。",
]

PLACEHOLDER = (
    "data:image/gif;base64,"
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
)


def replace_block(text, start, end, new, label):
    """用锚点切片替换主题源码里的整段方法，找不到就报错，避免静默改坏。"""
    i = text.find(start)
    if i < 0:
        raise SystemExit("[patch] 找不到起点: %s\n%r" % (label, start))
    j = text.find(end, i)
    if j < 0:
        raise SystemExit("[patch] 找不到终点: %s\n%r" % (label, end))
    return text[:i] + new + text[j:]


# ---------------------------------------------------------------- 新首页列表
NEW_LIST_JS = r'''		/**
		 * 首页随笔列表：解析原生 DOM，一次性生成卡片。
		 * 任何一步取不到值都不抛异常，最差情况保持原生列表可见。
		 */
		setHomeSuiBiList() {
			const $flow = ($('#mainContent .forFlow').length ? $('#mainContent .forFlow') : $('.forFlow')).first();
			if (!$flow.length) {
				return false;
			}
			const $days = $flow.children('.day');
			if (!$days.length) {
				return false;
			}

			const topImg = this.defaluts.topImg || {};
			// 封面池：之前选中的素材（女子图 + 风景头图）合成一池
			const shufflePick = (arr) => {
				const out = arr.slice();
				for (let i = out.length - 1; i > 0; i -= 1) {
					const j = Math.floor(Math.random() * (i + 1));
					const tmp = out[i];
					out[i] = out[j];
					out[j] = tmp;
				}
				return out;
			};
			// 整池去重后随机重排，每次刷新按顺序取，类别自然混着出现
			const fallbacks = shufflePick(Array.from(new Set(
					(topImg.coverImg || []).concat(topImg.homeTopImg || []).concat(topImg.notHomeTopImg || [])
			)));
			const coverOffset = 0;
			const authorName = this.esaText($(this.cnblogs.publicProfile).find('a:eq(0)').text()) || 'leiyuanze';
			const cards = [];
			let cardIndex = 0;

			$days.each((dayIndex, dayEl) => {
				const $day = $(dayEl);
				const dayText = this.esaText($day.find('.dayTitle').text());
				const descText = this.esaText($day.find('.postDesc').first().text());
				let date = (dayText.match(/\d{4}-\d{1,2}-\d{1,2}/) || [])[0] ||
						(descText.match(/\d{4}-\d{1,2}-\d{1,2}/) || [])[0] || '';
				if (!date) {
					const href = $day.find('.dayTitle a').attr('href') || '';
					const m = href.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
					if (m) {
						date = m[1] + '-' + this.esaPad(m[2]) + '-' + this.esaPad(m[3]);
					}
				}

				$day.find('.postTitle').each((j, titleEl) => {
					const $titleEl = $(titleEl);
					const $link = $titleEl.find('a').first();
					if (!$link.length) {
						return;
					}
					const url = $link.attr('href') || '#';

					let pinned = '';
					let title = this.esaText($link.text());
					if ($titleEl.find('.pinned-post-mark').length || $day.hasClass('pinned')) {
						pinned = '<span class="esa-card-pinned">置顶</span>';
						title = title.replace(/^\[置顶\]\s*/, '');
					}
					if (!title) {
						title = '(无标题)';
					}

					const $con = $day.find('.postCon').eq(j);
					const $desc = $con.find('.c_b_p_desc').first();
					let summary = this.esaText(
							$desc.clone().find('img,script,style,.MathJax_Preview,.MathJax_CHTML,.MathJax_Assistive_MathML').remove().end().text()
					);
					summary = summary.replace(/^摘要[:：]?\s*/, '').slice(0, 96);
					// cnblogs 自动摘要会带 markdown 记号，清掉开头的 # / > / *
					summary = summary.replace(/^[#>\s*\-]+/, '').replace(/\*\*/g, '');
					if (!summary) {
						summary = '点击阅读全文';
					}

					let cover = '';
					$con.find('img').each((k, img) => {
						if (cover) {
							return;
						}
						const src = img.getAttribute('data-original') || img.getAttribute('data-src') || img.getAttribute('src') || '';
						if (!src || /(^data:|blank|spacer|loading|\.gif($|\?)|1646268|zouwangblog)/i.test(src)) {
							return;
						}
						if (img.naturalWidth && img.naturalWidth < 120) {
							return;
						}
						cover = src;
					});
					if (!cover && fallbacks.length) {
						cover = fallbacks[(coverOffset + cardIndex) % fallbacks.length];
					}

					const readNum = this.esaNum($day.find('.post-view-count').eq(j).text()) || this.esaNum(descText) || '0';
					const comNum = this.esaNum($day.find('.post-comment-count').eq(j).text()) || '0';

					const thumb = cover
							? '<div class="post-thumb"><a href="' + url + '"><img class="esa-lazy-img" src="' + PLACEHOLDER +
							  '" data-src="' + this.esaEscape(cover) + '" alt="' + this.esaEscape(title) +
							  '" loading="lazy" decoding="async"></a></div>'
							: '<div class="post-thumb esa-no-thumb"><a href="' + url + '"></a></div>';

					cards.push(
							'<div class="post post-list-thumb post-list-show">' +
							thumb +
							'<div class="post-content-wrap">' +
							'<div class="post-content">' +
							'<div class="post-date"><i class="iconfont icon-time"></i>发布于 ' + this.esaEscape(date) + '</div>' +
							'<div class="post-title"><a href="' + url + '">' + pinned + this.esaEscape(title) + '</a></div>' +
							'<div class="post-meta">' +
							'<span><i class="iconfont icon-attention"></i>' + this.esaEscape(readNum) + ' 热度</span>' +
							'<span class="comments-number"><i class="iconfont icon-mark"></i>' + this.esaEscape(comNum) + ' 条评论</span>' +
							'<span><i class="iconfont icon-cc-user"></i>' + this.esaEscape(authorName) + '</span>' +
							'</div>' +
							'<div class="float-content">' +
							'<p>' + this.esaEscape(summary) + '</p>' +
							'<div class="post-bottom"><a href="' + url + '" class="button-normal"><i class="iconfont icon-gengduo"></i></a></div>' +
							'</div>' +
							'</div>' +
							'</div>' +
							'</div>'
					);
					cardIndex++;
				});
			});

			if (!cards.length) {
				return false;
			}

			$flow.prepend(cards.join(''));
			$flow.children('.post-list-thumb').filter(':odd').addClass('post-list-thumb-left');
			$flow.addClass('silence-ready');
			this.loadLazyCovers($flow);

			const notice = (this.defaluts.profile || {}).notice;
			if (notice) {
				$('#main').prepend('<div class="notice"> <i class="iconfont icon-notification"></i><div class="notice-content">' + notice + '</div></div>');
			}
		}

		/**
		 * 封面懒加载：进入视口才真正请求图片
		 */
		loadLazyCovers($flow) {
			const imgs = $flow.find('img.esa-lazy-img').toArray();
			if (!imgs.length) {
				return;
			}
			const load = (img) => {
				const src = img.getAttribute('data-src');
				if (!src || img.getAttribute('data-esa-loaded') === '1') {
					return;
				}
				img.setAttribute('data-esa-loaded', '1');
				img.src = src;
				img.removeAttribute('data-src');
			};
			if (!('IntersectionObserver' in window)) {
				imgs.forEach(load);
				return;
			}
			const io = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						load(entry.target);
						io.unobserve(entry.target);
					}
				});
			}, { rootMargin: '240px 0px' });
			imgs.forEach((img) => io.observe(img));
		}

		esaText(value) {
			return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
		}

		/**
		 * 取标题文字：去掉锚点和 MathJax 的辅助节点，避免目录里出现公式源码
		 */
		esaHeadingText($header) {
			const $clone = $header.clone();
			$clone.find('.esa-anchor, script, style, .MathJax_Preview, .MathJax_Assistive_MathML, .MJX_Assistive_MathML').remove();
			let text = this.esaText($clone.text());
			if (/\\\(|\\text\{|\$/.test(text)) {
				text = text
						.replace(/\\text\{([^}]*)\}/g, '$1')
						.replace(/\\[a-zA-Z]+/g, ' ')
						.replace(/[\\$(){}]/g, ' ')
						.replace(/\s+/g, ' ')
						.trim();
			}
			return text;
		}

		esaEscape(value) {
			return String(value == null ? '' : value)
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&#39;');
		}

		esaNum(value) {
			const m = String(value == null ? '' : value).match(/\d+/);
			return m ? m[0] : '';
		}

		esaPad(value) {
			const n = parseInt(value, 10);
			return n < 10 ? '0' + n : String(n);
		}

'''

# ---------------------------------------------------------------- 新目录
NEW_CATALOG_JS = r'''		buildPostCatalog() {
			const config = this.defaluts.catalog;
			if (!config.enable) {
				return false;
			}

			const levels = [config.level1, config.level2, config.level3].filter(Boolean).join(',');
			const $body = $(this.cnblogs.postBody);
			if (!$body.length || !levels) {
				return false;
			}

			const $headers = $body.find(levels).filter(function () {
				return this.tagName && $.trim($(this).text()).length > 0;
			});
			if (!$headers.length) {
				return false;
			}

			const $catalog = $(
					`<div class="esa-catalog">
                        <div class="esa-catalog-contents">
                            <div class="esa-catalog-title">目录</div>
                            <a class="esa-catalog-close">✕</a>
                        </div>
                    </div>`);

			let h1c = 0;
			let h2c = 0;
			let h3c = 0;
			let listHtml = '';

			$headers.each((index, header) => {
				const tagName = (header.tagName || '').toLowerCase();
				const title = this.esaHeadingText($(header));
				if (!title) {
					return;
				}

				let indexText = '';
				if (config.index) {
					if (tagName === config.level1) {
						h1c++;
						h2c = 0;
						h3c = 0;
						indexText = h1c + '. ';
					} else if (tagName === config.level2) {
						h2c++;
						h3c = 0;
						indexText = h1c + '.' + h2c + '. ';
					} else if (tagName === config.level3) {
						h3c++;
						indexText = h1c + '.' + h2c + '.' + h3c + '. ';
					}
				}

				// 只挂 id 和锚点，不再改标题内部 HTML（以前会把公式和链接吃掉）
				const id = 'esa-toc-' + index;
				header.id = id;
				if (!$(header).find('a.esa-anchor').length) {
					const anchor = document.createElement('a');
					anchor.className = 'esa-anchor';
					anchor.href = '#' + id;
					anchor.textContent = '#';
					header.appendChild(anchor);
				}

				listHtml += '<li class="li_' + tagName + '" title="' + this.esaEscape(title) + '">' +
						'<a class="esa-anchor-link" href="#' + id + '">' +
						'<span class="' + tagName + '">' + this.esaEscape(indexText) + '</span>' +
						this.esaEscape(title) +
						'</a></li>';
			});

			if (!listHtml) {
				return false;
			}

			$catalog.find('.esa-catalog-contents').append('<ul>' + listHtml + '</ul>');
			$catalog.appendTo('body');

			const $tabContent = $catalog.find('.esa-catalog-contents');
			$tabContent.fadeIn();

			$tabContent.on('click', '.esa-anchor-link', function (e) {
				e.preventDefault();
				const anchor = document.getElementById((($(this).attr('href')) || '').slice(1));
				if (!anchor) {
					return;
				}
				$('html, body').animate({
					scrollTop: $(anchor).offset().top - 80
				}, 300);
			});

			$catalog.find('.esa-catalog-close').on('click', () => {
				$tabContent.hide();
			});

			if (config.move) {
				let move = {
					start: false,
					pois: [0, 0],
				};
				$('.esa-catalog-title').on('mousedown', function (e) {
					e.preventDefault();
					move.start = true;
					const position = $('.esa-catalog').position();
					move.pois = [e.clientX - parseFloat(position.left), e.clientY - parseFloat(position.top)];
				});
				$(document).on('mousemove.esaCatalog', (e) => {
					if (!move.start) {
						return;
					}
					const $catalogBox = $('.esa-catalog');
					const fixed = $catalogBox.css('position') === 'fixed';
					const stX = fixed ? 0 : $(window).scrollLeft();
					const stY = fixed ? 0 : $(window).scrollTop();
					let offsetX = e.clientX - move.pois[0];
					let offsetY = e.clientY - move.pois[1];
					const maxX = $(window).width() - $catalogBox.outerWidth() + stX;
					const maxY = $(window).height() - $catalogBox.outerHeight() + stY;
					offsetX = Math.min(Math.max(offsetX, stX), maxX);
					offsetY = Math.min(Math.max(offsetY, stY), maxY);
					$catalogBox.css({ left: offsetX, top: offsetY, right: 'auto' });
				}).on('mouseup.esaCatalog', () => {
					move.start = false;
				});
			}
		}

'''

# ---------------------------------------------------------------- 新复制按钮
NEW_COPY_JS = r'''		buildPostCodeCopyBtns() {
			const $body = $(this.cnblogs.postBody);
			if (!$body.length) {
				return false;
			}
			const $pres = $body.find('pre').filter(function () {
				if ($(this).closest('.esa-code').length) {
					return false;
				}
				// 富文本编辑器插入的代码块自带工具栏，不重复包装
				if ($(this).closest('.cnblogs_code').length) {
					return false;
				}
				return $(this).find('code').length > 0;
			});
			if (!$pres.length) {
				return false;
			}

			const fallbackCopy = (text) => {
				try {
					const area = document.createElement('textarea');
					area.value = text;
					area.setAttribute('readonly', 'readonly');
					area.style.position = 'fixed';
					area.style.top = '-1000px';
					document.body.appendChild(area);
					area.select();
					const ok = document.execCommand('copy');
					document.body.removeChild(area);
					return ok;
				} catch (e) {
					return false;
				}
			};

			$pres.each((index, pre) => {
				const $pre = $(pre);
				const code = $pre.find('code').get(0) || pre;
				const cls = (code.getAttribute('class') || '') + ' ' + ($pre.attr('class') || '');
				const langMatch = cls.match(/(?:language|lang)-([\w+#]+)/) || cls.match(/\bhljs\s+([\w+#]+)\b/);
				const lang = langMatch ? langMatch[1].toLowerCase() : 'code';

				$pre.wrap('<div class="esa-code"></div>');
				$pre.before(
						'<div class="esa-code-tools">' +
						'<span class="esa-code-dot red"></span>' +
						'<span class="esa-code-dot yellow"></span>' +
						'<span class="esa-code-dot green"></span>' +
						'<span class="esa-code-lang">' + this.esaEscape(lang) + '</span>' +
						'<button type="button" class="esa-clipboard-button" title="复制代码">复制</button>' +
						'</div>'
				);
			});

			$(document).off('click.esaCopy').on('click.esaCopy', '.esa-clipboard-button', function () {
				const $btn = $(this);
				const text = ($btn.closest('.esa-code').find('pre').text() || '').replace(/\s+$/, '');
				const done = (ok) => {
					$btn.addClass('copied').text(ok ? '已复制' : '复制失败');
					setTimeout(() => {
						$btn.removeClass('copied').text('复制');
					}, 1600);
				};
				if (navigator.clipboard && window.isSecureContext) {
					navigator.clipboard.writeText(text).then(() => done(true)).catch(() => done(fallbackCopy(text)));
				} else {
					done(fallbackCopy(text));
				}
			});

			return true;
		}

'''

# ---------------------------------------------------------------- 新进度条
NEW_SCROLL_JS = r'''		scrollDy() {
			$('body').prepend(`<div class="scrollCls" id="scrollInfo"></div>`);
			const scrollEl = document.getElementById('scrollInfo');
			if (!scrollEl) {
				return;
			}
			let ticking = false;
			const update = () => {
				ticking = false;
				const scrollTotal = Math.max(1, this.getScrollHeight() - this.getWindowHeight());
				const bl = Math.min((this.getScrollTop() / scrollTotal) * 100, 100);
				scrollEl.style.width = bl + '%';
			};
			$(window).on('scroll.esaProgress resize.esaProgress', () => {
				if (!ticking) {
					ticking = true;
					window.requestAnimationFrame(update);
				}
			});
		}

'''

# ---------------------------------------------------------------- 生成 page.css
page_css = open(os.path.join(SRC, "page.css"), encoding="utf-8").read()
page_css += r'''

/* ================= leiyuanze 定制覆盖 ================= */
/* 1. 去掉头图上的点阵网格遮罩 */
.headertop:before,
.headertop.filter-dot:before {
    display: none !important;
    background-image: none !important;
}

/* 2. 列表兜底：主题脚本没跑起来时保持原生列表可见，页面不会只剩头图 */
#mainContent .forFlow > .day {
    display: block !important;
}

#mainContent .forFlow.silence-ready > .day {
    display: none !important;
}

/* 3. 首页卡片 */
/* 头图：加载真实头图前先给深色底，避免白底白字看不清 */
.main-header {
    background-color: #26303d;
    background-image: linear-gradient(135deg, #2b3644 0%, #4a3f52 100%);
}

.main-header:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, .10) 0%, rgba(0, 0, 0, .26) 55%, rgba(0, 0, 0, .42) 100%);
    pointer-events: none;
}

/* 头图大标题：原来是深色字，压在亮背景上完全看不清 */
.focusinfo .center-text {
    color: #fff;
    text-shadow: 0 2px 20px rgba(0, 0, 0, .55), 0 1px 3px rgba(0, 0, 0, .45);
    word-break: keep-all;
}

/* 文章页：头图 500px，正文不该被 100vh 顶到屏幕外 */
body.esa-post-page #main {
    margin-top: 500px;
}

.post-list-thumb .post-thumb {
    /* 容器本身高度为 0（图片是绝对定位），这里不能再裁剪，否则封面会整块消失 */
    overflow: visible;
}

.post-list-thumb .post-thumb a {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 300px;
    overflow: hidden;
    background: #f2f4f5;
}

.post-list-thumb .post-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .5s ease;
}

.post-list-thumb:hover .post-thumb img {
    transform: scale(1.05);
}

.post-list-thumb .post-title a {
    color: #504e4e;
}

.post-list-thumb .post-title a:hover {
    color: #FE9600;
    text-decoration: none;
}

.esa-card-pinned {
    display: inline-block;
    margin-right: 6px;
    padding: 0 6px;
    border-radius: 4px;
    background: #FE9600;
    color: #fff;
    font-size: 12px;
    font-weight: 400;
    vertical-align: 2px;
}

.esa-no-thumb a {
    background: linear-gradient(135deg, #f6c7dd 0%, #ffd9b3 100%);
}

.esa-no-thumb a:after {
    content: 'leiyuanze';
    display: block;
    text-align: center;
    line-height: 300px;
    color: #fff;
    letter-spacing: 2px;
}

/* 4. 代码块：工具条 + 语言标注 + 复制 */
.post .postBody .esa-code {
    position: relative;
    margin: 1.4em 0;
    border: 1px solid #e6e9ef;
    border-radius: 8px;
    overflow: hidden;
    background: #f7f8fa;
}

.esa-code .esa-code-tools {
    display: flex;
    align-items: center;
    height: 34px;
    padding: 0 12px;
    background: #eef1f5;
    border-bottom: 1px solid #e2e6ed;
}

.esa-code .esa-code-dot {
    width: 10px;
    height: 10px;
    margin-right: 6px;
    border-radius: 50%;
    background: #d3d8e0;
}

.esa-code .esa-code-dot.red { background: #ff5f57; }
.esa-code .esa-code-dot.yellow { background: #febc2e; }
.esa-code .esa-code-dot.green { background: #28c840; }

.esa-code .esa-code-lang {
    margin-left: 6px;
    color: #8a94a6;
    font-size: 12px;
    letter-spacing: .3px;
}

.esa-code .esa-clipboard-button {
    margin-left: auto;
    padding: 5px 10px;
    border: 0;
    border-radius: 4px;
    background: #fff;
    color: #6b7686;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .08);
}

.esa-code .esa-clipboard-button:hover { color: #FE9600; }
.esa-code .esa-clipboard-button.copied { color: #28c840; }

.esa-code pre,
.esa-code pre.hljs,
.esa-code .hljs {
    margin: 0 !important;
    padding: 14px 16px !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: #f7f8fa !important;
    font-size: 13.5px !important;
    line-height: 1.65 !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

/* 4.5 播放器收起后只留一个 “>”（这份 APlayer.min.css 没有滑出样式，自己补上；
   PC 和手机端一致，鼠标移上去或点一下开关就展开） */
.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body {
    left: -66px !important;
    bottom: 0 !important;
    transition: left .2s;
}

.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body:hover,
.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body:focus-within {
    left: 0 !important;
}

/* 5. 手机端适配：头图高度用 svh，卡片竖排带封面 */
@media only screen and (max-width: 767px) {
    #main {
        margin-top: 100svh;
        padding: 0 12px !important;
    }

    /* 80px 的大标题在手机上会顶出屏幕，这里压到能完整显示 */
    .focusinfo {
        top: 46%;
    }

    .focusinfo .center-text {
        max-width: 100%;
        font-size: 40px;
        letter-spacing: 1px;
    }

    #mainContent .forFlow {
        padding: 0 0 40px;
    }

    .post-list-thumb {
        height: auto !important;
        margin: 0 0 18px !important;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 1px 14px -6px rgba(0, 0, 0, .35);
    }

    .post-list-thumb .post-thumb {
        display: block !important;
        float: none !important;
        width: 100% !important;
        /* 封面是绝对定位，容器必须有真实高度，否则正文会整段压在图片上 */
        height: 172px;
        position: relative;
    }

    .post-list-thumb .post-thumb a {
        height: 172px;
        border-radius: 8px 8px 0 0 !important;
    }

    .post-list-thumb .post-content-wrap {
        float: none !important;
        left: 0 !important;
        width: 100% !important;
        padding: 12px 14px 4px !important;
    }

    .post-list-thumb .post-title {
        margin: 8px 0;
        font-size: 16px;
    }

    .post-list-thumb:before {
        display: none !important;
    }

    .float-content p {
        height: auto !important;
        margin: 10px 0 6px;
        font-size: 13px;
    }

    .esa-code pre,
    .esa-code pre.hljs,
    .esa-code .hljs {
        padding: 12px !important;
        font-size: 12.5px !important;
    }

    /* ---- 手机端菜单 ----
       #header 平时 opacity:0（桌面端靠 hover 显示），菜单挂在它里面，
       所以必须打开时才把 header 显示出来，否则点了也看不见任何东西 */
    body.esa-nav-open #header {
        opacity: 1 !important;
    }

    #header #navigator {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        display: block !important;
        height: auto !important;
        background: #fff;
        box-shadow: 0 8px 24px rgba(0, 0, 0, .14);
        transform: translateY(-110%);
        transition: transform .28s ease;
        z-index: 941112;
        max-height: 100vh;
        overflow-y: auto;
    }

    body.esa-nav-open #header #navigator {
        transform: translateY(0);
    }

    #header #navList {
        display: block !important;
        height: auto !important;
        margin: 0 !important;
        padding: 56px 16px 16px !important;
    }

    #header #navList li {
        display: block;
        float: none !important;
        width: 100% !important;
        border-bottom: 1px solid #f2f4f7;
    }

    #header #navList li:last-child {
        border-bottom: 0;
    }

    #header #navList a,
    #header #navList a:link,
    #header #navList a:visited {
        float: none !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        padding: 13px 2px !important;
        color: #4a5462;
        font-size: 15px;
    }

    #header #navList li i {
        display: none;
    }

    .esa-mobile-menu {
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-radius: 50%;
        color: #61687C;
        background: rgba(255, 255, 255, .9);
        box-shadow: 0 1px 6px rgba(0, 0, 0, .12);
    }

    .esa-mobile-menu:after {
        font-family: inherit;
        font-size: 20px;
    }

    body.esa-nav-open .esa-mobile-menu:after {
        content: '✕';
    }

    /* 文章页：头图 280px，但 #main 被 100vh 顶下去，中间会空一大截 */
    body.esa-post-page #main {
        margin-top: 0 !important;
    }

    /* MathJax 的辅助 MathML 是绝对定位的隐藏副本，不裁掉溢出会把整页撑宽，
       表现就是置顶文章右侧多一条白边、要横向滑动才看得到 */
    .MJX_Assistive_MathML,
    .MathJax_Assistive_MathML {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
    }

    /* 过宽的公式改成公式内部滚动，不要把整页顶宽 */
    #cnblogs_post_body .MathJax_CHTML,
    #cnblogs_post_body .mjx-chtml {
        max-width: 100% !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
    }

    /* MathJax 的展示公式外面套了一层 display:table-cell 的 “full width” 壳，
       它带着 em 单位的 min-width，手机窄屏下会把这层壳钉在 430px 以上，
       整页被顶宽、浏览器缩小页面，右边就露出白边。归零后让公式自己在框里滚 */
    #cnblogs_post_body .mjx-full-width {
        display: block !important;
        min-width: 0 !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
    }

    /* MathJax v3 的展示公式同样限制在容器内 */
    #cnblogs_post_body mjx-container {
        max-width: 100% !important;
    }

    #cnblogs_post_body mjx-container[display="true"] {
        overflow-x: auto !important;
        overflow-y: hidden !important;
    }

    #cnblogs_post_body h1,
    #cnblogs_post_body h2,
    #cnblogs_post_body h3,
    #cnblogs_post_body h4,
    #cnblogs_post_body p,
    #cnblogs_post_body li {
        overflow-wrap: break-word;
    }

}
'''
open(os.path.join(OUT, "page.css"), "w", encoding="utf-8").write(page_css)

# ---------------------------------------------------------------- 生成 main.js
js = open(os.path.join(SRC, "main.js"), encoding="utf-8").read()

js = js.replace(
    'href="https://www.cnblogs.com/zouwangblog/articles/11177049.html">友链</a>',
    'href="https://www.cnblogs.com/leiyuanze/tag/">标签</a>',
)
js = js.replace(
    'href="https://www.cnblogs.com/zouwangblog/articles/11340077.html">赞赏</a>',
    'href="https://www.cnblogs.com/leiyuanze/archive/">归档</a>',
)
js = js.replace('href="">关于</a>', 'href="https://github.com/leiyuanze">关于</a>')
js = js.replace("https://www.cnblogs.com/zouwangblog/", "https://www.cnblogs.com/leiyuanze/")
js = js.replace('<img src="//pic.cnblogs.com/face/1646268/20190628143903.png">', "")
js = js.replace("Toretto", "leiyuanze")

# 首页大标题：去掉会和标题叠在一起的故障字效果
js = js.replace(
    'class="center-text glitch is-glitching Ubuntu-font" data-text="Hi, leiyuanze!"',
    'class="center-text Ubuntu-font" data-text="leiyuanze"',
)

js = replace_block(
    js,
    "\t\tsetHomeSuiBiList() {",
    "\t\t//=================阅读页逻辑",
    NEW_LIST_JS,
    "setHomeSuiBiList",
)
js = replace_block(
    js,
    "\t\tbuildPostCatalog() {",
    "\t\t/**\n\t\t * 构建 Github Corner",
    NEW_CATALOG_JS,
    "buildPostCatalog",
)
js = replace_block(
    js,
    "\t\tbuildPostCodeCopyBtns() {",
    "\t\t/**\n\t\t * 构建工具栏",
    NEW_COPY_JS,
    "buildPostCodeCopyBtns",
)
js = replace_block(
    js,
    "\t\tscrollDy() {",
    "\n\t\t// 已经滚动距离",
    NEW_SCROLL_JS,
    "scrollDy",
)

# 首页卡片懒加载的占位图
js = js.replace(
    "const cards = [];",
    "const PLACEHOLDER = '" + PLACEHOLDER + "';\n\t\t\tconst cards = [];",
    1,
)

# 去掉原作者写的「关于」子菜单
js = re.sub(
    r"let guanyu = '<ul class=\"sub-menu\">'[\s\S]*?\$\('#blog_nav_myguanyu'\)\.after\(guanyu\);",
    "",
    js,
)

# 手机端菜单：原版只 fadeToggle #navigator，但 #header 在手机端 opacity:0，
# 菜单永远看不见。改成给 body 加类，由 CSS 控制展开/收起。
old_mobile_menu = (
    "\t\t\t$('.esa-mobile-menu').on('click', () => {\n"
    "\t\t\t\t$(this.cnblogs.navigator).fadeToggle(200);\n"
    "\t\t\t});"
)
new_mobile_menu = (
    "\t\t\t$('.esa-mobile-menu').on('click', (e) => {\n"
    "\t\t\t\te.preventDefault();\n"
    "\t\t\t\te.stopPropagation();\n"
    "\t\t\t\t$('body').toggleClass('esa-nav-open');\n"
    "\t\t\t});\n"
    "\t\t\t$('#navigator').on('click', 'a', () => {\n"
    "\t\t\t\t$('body').removeClass('esa-nav-open');\n"
    "\t\t\t});"
)
if old_mobile_menu not in js:
    raise SystemExit("[patch] 找不到手机菜单代码")
js = js.replace(old_mobile_menu, new_mobile_menu)

# 「捕获」按钮对访客没有意义，去掉
js = js.replace("\t\t\tthis.buildToolbar();", "\t\t\t// 「捕获」按钮已移除")

# 头图下面那句签名：配置里用 | 分隔多条，每次刷新随机取一条
old_motto = "\t\t\tconst config = this.defaluts.topInfo;"
new_motto = (
    "\t\t\tconst config = this.defaluts.topInfo;\n"
    "\t\t\t// 签名诗句：配置里用 | 分隔多条，每次刷新随机取一条\n"
    "\t\t\tconst mottoList = String(config.text || '').split('|').map((s) => s.trim()).filter((s) => s);\n"
    "\t\t\tif (mottoList.length > 1) {\n"
    "\t\t\t\tconfig.text = mottoList[Math.floor(Math.random() * mottoList.length)];\n"
    "\t\t\t}"
)
if old_motto not in js:
    raise SystemExit("[patch] 找不到头图签名配置")
js = js.replace(old_motto, new_motto, 1)

# 文章页打标记：手机端用它把 #main 的 100vh 顶距收回头图高度
old_post_header = "\t\tpostHeader() {\n"
if old_post_header not in js:
    raise SystemExit("[patch] 找不到 postHeader")
js = js.replace(
    old_post_header,
    "\t\tpostHeader() {\n\t\t\t$('body').addClass('esa-post-page');\n",
    1,
)

open(os.path.join(OUT, "main.js"), "w", encoding="utf-8").write(js)

# ---------------------------------------------------------------- 配置块
config_tpl = """<script type="text/javascript">
$.silence({{
    profile: {{
        enable: false
    }},
    catalog: {{
        enable: true,
        move: true,
        index: true,
        level1: 'h2',
        level2: 'h3',
        level3: 'h4'
    }},
    signature: {{
        enable: true,
        home: 'https://www.cnblogs.com/leiyuanze/',
        license: 'CC BY 4.0',
        link: 'https://creativecommons.org/licenses/by/4.0'
    }},
    sponsor: {{
        enable: false
    }},
    github: {{
        enable: true,
        color: '#fff',
        fill: '#FF85B8',
        link: 'https://github.com/leiyuanze'
    }},
    topImg: {{
        coverImg: [
{cover}
        ],
        homeTopImg: [
{home}
        ],
        notHomeTopImg: [
{not_home}
        ]
    }},
    topInfo: {{
        title: 'leiyuanze',
        text: '{mottos}',
        github: 'https://github.com/leiyuanze',
        weibo: '',
        telegram: '',
        music: '',
        twitter: '',
        zhihu: '',
        mail: ''
    }}
}});
</script>
"""

silence_config = config_tpl.format(
    cover="\n".join('            "%s",' % u for u in COVERS),
    home="\n".join('            "%s",' % u for u in HEADERS),
    not_home="\n".join('            "%s",' % u for u in NOT_HOME),
    mottos="|".join(MOTTOS),
)

# ---------------------------------------------------------------- 侧边栏
sidebar = """<link rel="stylesheet" href="//at.alicdn.com/t/font_1346053_111ghkv8md9.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome/css/font-awesome.min.css">
"""
open(os.path.join(OUT, "sidebar.html"), "w", encoding="utf-8").write(sidebar)

# ---------------------------------------------------------------- 页脚
SONGS = [
    (3322773657, "游山恋", "浅影阿", 109951172355669080),
    # 探故知（2095876512）音源已失效，暂时下线
    (3442248108, "关山酒", "浅影阿", 109951174022423147),
    (3420272282, "牡丹亭", "浅影阿", 109951173739951494),
    (3373839227, "春不晚", "浅影阿", 109951173108183621),
    (167850, "庐州月", "许嵩", 109951172202579057),
    (167882, "清明雨上", "许嵩", 109951172899966259),
    (167937, "断桥残雪", "许嵩", 58274116284456),
    (28802028, "山水之间", "许嵩", 109951172321467418),
    (28854182, "惊鸿一面", "许嵩 / 黄龄", 109951172321467418),
    (402073807, "燕归巢", "许嵩", 3431575794705764),
    (411214279, "雅俗共赏", "许嵩", 3431575794705764),
    (101131, "倾尽天下", "河图", 6049512976313503),
    (28188434, "锦鲤抄", "银临 / 云之泣", 5859297464524710),
    (28188427, "棠梨煎雪", "银临", 5859297464524710),
    (2078062390, "典狱司", "音频怪物", 109951168881672971),
    (409654891, "故梦", "双笙", 109951168638984216),
    (39224244, "狐言", "河图 / 洛天依", 109951167999122273),
]


song_js = ",\n".join(
    '            { id: %d, name: "%s", artist: "%s", pic: %d }' % s for s in SONGS
)

# 非关键增强（放大图片 / 音乐 / 雪花 / 鼠标特效）随主脚本一起上传，
# 这样页脚只需要一段配置，不会被博客园的体积限制截断。
EXTRA_TPL = """
/* ================= leiyuanze 非关键增强：首屏渲染完再加载 ================= */
(function () {
    var isMobile = window.matchMedia('(max-width: 767px)').matches;

    function idle(fn) {
        if (window.requestIdleCallback) {
            requestIdleCallback(fn, { timeout: 2500 });
        } else {
            setTimeout(fn, 900);
        }
    }

    function loadScript(src, done) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        if (done) { s.onload = done; }
        document.body.appendChild(s);
    }

    function loadStyle(href) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
    }

    // 图片点击放大
    if (document.getElementById('cnblogs_post_body')) {
        loadStyle('https://blog-static.cnblogs.com/files/zouwangblog/zoom.css');
        loadScript('https://blog-static.cnblogs.com/files/zouwangblog/zoom.js', function () {
            if (window.jQuery) {
                jQuery('#cnblogs_post_body img').attr('data-action', 'zoom');
            }
        });
    }

    // 音乐播放器：桌面空闲时加载，手机端等第一次交互，不抢首屏
    var musicReady = false;
    function startMusic() {
        if (musicReady) { return; }
        musicReady = true;
        loadStyle('https://blog-static.cnblogs.com/files/zouwangblog/APlayer.min.css');
        loadScript('https://blog-static.cnblogs.com/files/zouwangblog/APlayer.min.js', function () {
            if (!window.APlayer) { return; }
            var API = 'https://api.injahow.cn/meting/';
            var list = [
__SONGS__
            ];
            // 每次刷新重排：歌手顺序随机 + 每个歌手内部随机 + 按歌手轮流穿插，
            // 这样不会连着好几首都是同一个人
            var byArtist = {};
            var artists = [];
            var shuffled = [];
            var i;
            for (i = 0; i < list.length; i += 1) {
                var key = String(list[i].artist || '').split('/')[0].trim();
                if (!byArtist[key]) {
                    byArtist[key] = [];
                    artists.push(key);
                }
                byArtist[key].push(list[i]);
            }
            for (i = artists.length - 1; i > 0; i -= 1) {
                var a = Math.floor(Math.random() * (i + 1));
                var ta = artists[i];
                artists[i] = artists[a];
                artists[a] = ta;
            }
            for (i = 0; i < artists.length; i += 1) {
                var bucket = byArtist[artists[i]];
                for (var k = bucket.length - 1; k > 0; k -= 1) {
                    var m = Math.floor(Math.random() * (k + 1));
                    var tb = bucket[k];
                    bucket[k] = bucket[m];
                    bucket[m] = tb;
                }
            }
            // 每次挑“剩下最多”的歌手，并避开上一位，歌多的歌手自然被摊开
            var lastKey = null;
            while (shuffled.length < list.length) {
                var pick = null;
                for (i = 0; i < artists.length; i += 1) {
                    var key2 = artists[i];
                    var queue = byArtist[key2];
                    if (!queue.length || key2 === lastKey) {
                        continue;
                    }
                    if (pick === null || queue.length > byArtist[pick].length) {
                        pick = key2;
                    }
                }
                if (pick === null) {          // 只剩上一位歌手，退而求其次
                    for (i = 0; i < artists.length; i += 1) {
                        if (byArtist[artists[i]].length) {
                            pick = artists[i];
                            break;
                        }
                    }
                }
                lastKey = pick;
                shuffled.push(byArtist[pick].shift());
            }
            list = shuffled;
            var audio = list.map(function (s) {
                return {
                    name: s.name,
                    artist: s.artist,
                    url: API + '?server=netease&type=url&id=' + s.id,
                    cover: API + '?server=netease&type=pic&id=' + s.pic,
                    lrc: API + '?server=netease&type=lrc&id=' + s.id
                };
            });
            var box = document.getElementById('player');
            if (!box) { return; }
            new APlayer({
                container: box,
                fixed: true,
                listFolded: true,
                theme: '#FF85B8',
                audio: audio
            });
            // 默认收起播放器，只留一个 ">"（PC 和手机端一致），不挡内容
            setTimeout(function () {
                var player = document.querySelector('.aplayer');
                var switcher = document.querySelector('.aplayer-miniswitcher');
                if (player && switcher && !player.classList.contains('aplayer-narrow')) {
                    switcher.click();
                }
            }, 400);
        });
    }

    if (isMobile) {
        window.addEventListener('touchstart', startMusic, { once: true, passive: true });
        window.addEventListener('scroll', startMusic, { once: true, passive: true });
        setTimeout(startMusic, 8000);
    } else {
        idle(startMusic);
    }

    // 雪花 / 鼠标特效：只在桌面端，而且延后
    if (!isMobile) {
        idle(function () {
            var snow = document.createElement('div');
            snow.className = 'Snow';
            snow.innerHTML = '<canvas id="Snow"></canvas>';
            document.body.appendChild(snow);
            loadScript('https://blog-static.cnblogs.com/files/zouwangblog/xue.js');

            var canvas = document.createElement('canvas');
            canvas.width = 1777;
            canvas.height = 841;
            canvas.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;';
            document.body.appendChild(canvas);
            loadScript('https://blog-static.cnblogs.com/files/zouwangblog/mouse-click.js');
        });
    }
})();
"""

extras_js = EXTRA_TPL.replace("__SONGS__", song_js)
open(os.path.join(OUT, "main.js"), "w", encoding="utf-8").write(js + "\n" + extras_js)

footer_tpl = """<!-- ============================================================
     leiyuanze 主题（复刻 Sakura + 自适配）
     主脚本放在博客园文件存储，不再依赖 jsdelivr / bootcss
     ============================================================ -->
<script src="https://assets.cnblogs.com/scripts/jquery-3.3.1.min.js"></script>
<script src="__JS_CDN__?v=__JS_VER__"></script>
__SILENCE__

<div id="player" class="aplayer aplayer-withlist aplayer-fixed"></div>
"""

footer = (
    footer_tpl.replace("__SILENCE__", silence_config)
    .replace("__JS_CDN__", JS_CDN)
    .replace("__JS_VER__", JS_VER)
)
open(os.path.join(OUT, "footer.html"), "w", encoding="utf-8").write(footer)

# ---------------------------------------------------------------- 页首（可选）
open(os.path.join(OUT, "head.html"), "w", encoding="utf-8").write(
    "<!-- leiyuanze：页首代码保持空白即可，主题不依赖它 -->\n"
)

print("OK ->", OUT)
for f in ("page.css", "main.js", "sidebar.html", "footer.html", "head.html"):
    p = os.path.join(OUT, f)
    print(f, os.path.getsize(p), "bytes")
