(function ($) {
	$.extend({
		silence: (options) => {
			var silence = new Silence();
			silence.init(options);
		}
	});

	class Silence {
		constructor() {
			this.defaluts = {
				profile: {
					enable: false,
					avatar: null,
					favicon: null,
				},
				catalog: {
					enable: false,
					move: true,
					index: true,
					level1: 'h2',
					level2: 'h3',
					level3: 'h4',
				},
				signature: {
					author: null,
					enable: false,
					home: 'https://www.cnblogs.com',
					license: 'CC BY 4.0',
					link: 'https://creativecommons.org/licenses/by/4.0'
				},
				sponsor: {
					enable: true,
					paypal: null,
					wechat: 'https://www.cnblogs.com/images/cnblogs_com/zouwangblog/1477590/t_%e5%be%ae%e4%bf%a1%e5%9b%be%e7%89%87_20190704175553.png',
					alipay: 'https://www.cnblogs.com/images/cnblogs_com/zouwangblog/1477590/t_%e5%be%ae%e4%bf%a1%e5%9b%be%e7%89%87_20190704174158.png'
				},
				github: {
					enable: false,
					color: '#fff',
					fill: null,
					link: null,
				},
				topImg: {
					homeTopImg: [
						"https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190806172418911-2037584311.jpg",
					],
					notHomeTopImg: [
						"https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190806172418911-2037584311.jpg"
					]
				},
				topInfo: {
					title: 'Hi,leiyuanze',
					text: 'You got to put the past behind you before you can move on.',
					github: "",
					weibo: "",
					telegram: "",
					music: "",
					twitter: "",
					zhihu: "",
					mail: "",
				}
			};

			this.version = '1.0.0';
		}

		get cnblogs() {
			return {
				header: '#header',
				blogTitle: '#blogTitle',
				publicProfile: '#profile_block',
				navigator: '#navigator',
				navList: '#navList',
				sideBar: '#sideBar',
				sideBarMain: '#sideBarMain',
				forFlow: '.forFlow',
				postTitle: '#cb_post_title_url',
				postDetail: '#post_detail',
				postBody: '#cnblogs_post_body',
				postDigg: '#div_digg',
				postCommentBody: '.blog_comment_body',
				feedbackContent: '.feedbackCon',
				postSignature: '#MySignature',
				footer: '#footer',
			};
		}

		get isPostPage() {
			return $(this.cnblogs.postDetail).length > 0;
		}

		/**
		 * 初始化
		 * @param {Object} options 全局配置选项
		 */
		init(options) {
			if (options) {
				$.extend(true, this.defaluts, options);
			}
			this.buildCustomElements();
			this.buildGithubCorner();
			this.buildCopyright();
			this.buildBloggerProfile();
			this.getMainMode();
			// 「捕获」按钮已移除
			if (this.isPostPage) {
				this.postHeader();
				this.goIntoReadingMode();
				this.buildPostCatalog();
				this.buildPostCodeCopyBtns();
				this.buildPostSignature();
				this.buildPostFavoriteBtn();
				this.buildPostSponsor();
				this.buildPostCommentAvatars();
				this.setNotHomeTopImg();
			} else {
				this.mainHeader();
				this.goIntoNormalMode();
				this.homeImg();
				this.setHomeSuiBiList();
			}
			this.scrollDy();
		}

		/**
		 * 消息弹窗
		 * @param {String} content 消息内容
		 */
		showMessage(content) {
			$('body').prepend(`<div class="esa-layer"><span class="esa-layer-content">${content}</span></div>`);
			let $layer = $('.esa-layer');
			$layer.fadeIn(200);
			setTimeout(() => {
				$layer.remove();
			}, 2000);
		}

		/**
		 * 通用模式设置
		 */
		getMainMode() {
			$('.site-branding').hover(function () {
				$('.logolink .sakuraso').css({
					'background-color': '#FE9600',
					'color': '#fff'
				})
				$('.chinese-font').css('display', 'block')
			}, function () {
				$('.logolink .sakuraso').css({
					'background-color': 'rgba(255,255,255,.5)',
					'color': '#464646'
				})
				$('.chinese-font').css('display', 'none')
			});
			//<!--离开页面改变title-->
			var time;
			var normar_title = document.title;
			document.addEventListener('visibilitychange', function () {
				if (document.visibilityState == 'hidden') {
					clearTimeout(time);
					document.title = '桥豆麻袋(＃°Д°)';
				} else {
					document.title = '你终于回来了(。・∀・)ノ';
					time = setTimeout(function () {
						document.title = normar_title;
					}, 3000);

				}
			});
		}

		/**
		 * 进入阅读模式
		 */
		goIntoReadingMode() {
			let $win = $(window);
			let _that = this;
			if ($win.width() > 767) {
				$(_that.cnblogs.header).css('opacity', '1');
				$('#header #navList').css('margin-left', '0px');
				//修改文章布局
				$('#main').css({'margin': '0 auto', 'padding': '0 10px', 'min-width': '950px'});
			}
		}

		/**
		 * 进入正常模式
		 */
		goIntoNormalMode() {
			let $win = $(window);
			let _that = this;
			var oldScrollY = 0;
			if ($win.width() > 767) {
				$('#main').css({'min-width': '800px'});
				//鼠标悬浮判断，如果页面不是位于顶部则head不消失
				$(_that.cnblogs.header).hover(function () {
					$(_that.cnblogs.header).css('opacity', '1');
					$('#header #navList').css('margin-left', '0px');
				}, function () {
					if ($(document).scrollTop() > 0) {
						$(_that.cnblogs.header).css('opacity', '1');
						$('#header #navList').css('margin-left', '0px');
					} else {
						$(_that.cnblogs.header).css('opacity', '0');
						$('#header #navList').css('margin-left', '100px');
					}

				})
				//鼠标悬浮logo判断
				$('.site-branding').hover(function () {
					$(_that.cnblogs.header).css('opacity', '1');
					$('#header #navList').css('margin-left', '0px');
				}, function () {
					if ($(document).scrollTop() > 0) {
						$(_that.cnblogs.header).css('opacity', '1');
						$('#header #navList').css('margin-left', '0px');
					} else {
						$(_that.cnblogs.header).css('opacity', '0');
						$('#header #navList').css('margin-left', '100px');
					}

				})
				//页面滚动判断
				$win.scroll(function () {
					oldScrollY = this.scrollY;
					if (oldScrollY > 0) {
						$(_that.cnblogs.header).css('opacity', '1');
						$('#header #navList').css('margin-left', '0px');
					} else {
						$(_that.cnblogs.header).css('opacity', '0');
						$('#header #navList').css('margin-left', '100px');
					}
				});
			}
		}

		/**
		 * 构建自定义 DOM 元素
		 */
		buildCustomElements() {
			// Change page title.
			const blogTitle = $(this.cnblogs.blogTitle).find('h1 a').html();
			const autherName = $(this.cnblogs.publicProfile).find('a:eq(0)').html();
			let $title = $('head').find('title');
			$title.html($title.html().replace(`春原庄的雪 | ${autherName}`, `${blogTitle}`));

			// Build a tags button on navbar.
			let $navList = $(this.cnblogs.navList);
			$.each($navList.find('li'), (index, nav) => {
				$(nav).append('<i></i>');
			});

			// Build a menu button on mobile browser.
			$('body').prepend(`<div class="esa-mobile-menu"></div>`);
			$('.esa-mobile-menu').on('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				$('body').toggleClass('esa-nav-open');
			});
			$('#navigator').on('click', 'a', () => {
				$('body').removeClass('esa-nav-open');
			});

			//回到顶部特效
			$('body').prepend(`<a href="#" class="cd-top faa-float animated cd-fade-out"></a>`);
			let $win = $(window);
			let oldScrollY = 0;
			$win.scroll(function () {
				oldScrollY = this.scrollY;
				let height = window.innerHeight;
				let top = '-' + (900 - height + 80) + 'px';
				if (oldScrollY > 0) {
					$('.cd-top').css('top', top);
				} else {
					$('.cd-top').css('top', '-900px');
				}
			});


			$("#navList").append('<li><a id="blog_nav_myyoulian" class="menu" href="https://www.cnblogs.com/leiyuanze/tag/">标签</a><i></i></li><li><a id="blog_nav_myzanshang" class="menu" href="https://www.cnblogs.com/leiyuanze/archive/">归档</a><i></i></li><li><a id="blog_nav_myguanyu" class="menu" href="https://github.com/leiyuanze">关于</a><i></i></li>');
			//添加标签icon
			$('#blog_nav_myhome').prepend('<i class="fa fa-fort-awesome" aria-hidden="true"></i>');
			$('#blog_nav_contact').prepend('<i class="fa fa-address-book-o" aria-hidden="true"></i>');
			$('#blog_nav_rss').prepend('<i class="fa fa-rss faa-pulse" aria-hidden="true"></i>');
			$('#blog_nav_admin').prepend('<i class="fa fa-list" aria-hidden="true"></i>');
			$('#blog_nav_myyoulian').prepend('<i class="fa fa-link" aria-hidden="true"></i>');
			$('#blog_nav_myzanshang').prepend('<i class="fa fa-heart" aria-hidden="true"></i>');
			$('#blog_nav_myguanyu').prepend('<i class="fa fa-leaf" aria-hidden="true"></i>');

			//添加li内嵌ui
			

		}

		/**
		 * 构建主题版权信息
		 */
		buildCopyright() {
			//这里能保留么，算是我的一个小心愿。
			var content = `<div> Powered By <a href="https://www.cnblogs.com" target="_blank">Cnblogs</a> |
            Theme <a href="https://github.com/Zou-Wang/CNblogs-Theme-Sakura" target="_blank">leiyuanze v${this.version}</a></div>`;
			$(this.cnblogs.footer).append(content);
		}

		/**
		 * 构建博客签名
		 */
		buildPostSignature() {
			const config = this.defaluts.signature;
			if (config.enable) {
				const postUrl = $(this.cnblogs.postTitle).attr('href');
				const authorName = config.author || $(this.cnblogs.publicProfile).find('a:eq(0)').html();

				const content =
						`<div class="esa-post-signature"> 
                    <p>作者：<a href="${config.home}">${authorName}</a></p> 
                    <p>出处：<a href="${postUrl}">${postUrl}</a></p> 
                    <p>本站使用「<a href="${config.link}"  target="_blank">${config.license}</a>」创作共享协议，转载请在文章明显位置注明作者及出处。</p> 
                </div>`;

				$(this.cnblogs.postSignature).html(content).show();
			}
		}

		/**
		 * 构建评论者头像
		 */
		buildPostCommentAvatars() {
			var builder = () => {
				$(this.cnblogs.postCommentBody).before(`<div class='esa-comment-avatar'><a target='_blank'><img /></a></div>`);
				let feedbackCon = $(this.cnblogs.feedbackContent);
				for (var i = 0; i < feedbackCon.length; i++) {
					let avatar = 'https://pic.cnblogs.com/face/sample_face.gif';
					let span = $(feedbackCon[i]).find("span:last")[0];
					if (span) {
						avatar = $(span).html().replace('http://', '//');
					}
					$(feedbackCon[i]).find(".esa-comment-avatar img").attr("src", avatar);
					let href = $(feedbackCon[i]).parent().find(".comment_date").next().attr("href");
					$(feedbackCon[i]).find(".esa-comment-avatar a").attr("href", href);
				}
			}
			if ($(this.cnblogs.postCommentBody).length) {
				builder();
			} else {
				let count = 1;
				// poll whether the feedbacks is loaded.
				let intervalId = setInterval(() => {
					if ($(this.cnblogs.postCommentBody).length) {
						clearInterval(intervalId);
						builder();
					}
					if (count == 10) {
						// no feedback.
						clearInterval(intervalId);
					}
					count++;
				}, 500);
			}
		}

		/**
		 * 构建赞赏模块
		 */
		buildPostSponsor() {
			const sponsor = this.defaluts.sponsor;
			const github = this.defaluts.github;
			const that = this;
			if (!sponsor.enable) {
				return;
			}

			$('#blog_post_info').prepend(`
            <div class="esa-sponsor">
                <a class="github" href="${github.enable ? github.link : 'https://github.com/Kaiyuan/donate-page'}" target="_blank" class="posa tr3" title="Github"></a>
                <div class="text tr3">${sponsor.text || 'Sponsor'}</div>
                <ul class="box posa tr3">
                    <li class="paypal">PayPal</li>
                    <li class="alipay">AliPay</li>
                    <li class="wechat">WeChat</li>
                </ul>
                <div id="QRBox" class="posa left-100">
                    <div id="MainBox"></div>
                </div>
            </div>`);

			const $sponsor = $('.esa-sponsor');
			const QRBox = $('#QRBox');
			const MainBox = $('#MainBox');

			function showQR(QR) {
				if (QR) {
					MainBox.css('background-image', 'url(' + QR + ')');
				}
				$sponsor.find('.text, .box, .github').addClass('blur');
				QRBox.fadeIn(300, function () {
					MainBox.addClass('showQR');
				});
			}

			$sponsor.find('.box>li').click(function () {
				var type = $(this).attr('class');
				if (type === 'paypal') {
					if (!sponsor.paypal) {
						return that.showMessage('博主忘记设置 PayPal 收款地址');
					}
					window.open(sponsor.paypal, '_blank');
				} else if (type === 'alipay') {
					if (!sponsor.alipay) {
						return that.showMessage('博主忘记设置支付宝收款二维码');
					}
					showQR(sponsor.alipay);
				} else if (type === 'wechat') {
					if (!sponsor.wechat) {
						return that.showMessage('博主忘记设置微信收款二维码');
					}
					showQR(sponsor.wechat);
				}
			});

			MainBox.click(function () {
				MainBox.removeClass('showQR').addClass('hideQR');
				setTimeout(function (a) {
					QRBox.fadeOut(300, function () {
						MainBox.removeClass('hideQR');
					});
					$sponsor.find('.text, .box, .github').removeClass('blur');
				}, 600);
			});
		}

		/**
		 * 构建收藏按钮
		 */
		buildPostFavoriteBtn() {
			let builder = () => {
				$(this.cnblogs.postDigg).prepend(`<div class="favorite" onclick="AddToWz(cb_entryId);return false;"><span class="favoritenum" id="favorite_count"></span></div>`);
			};

			if ($(this.cnblogs.postDigg).length) {
				builder();
			} else {
				let intervalId = setInterval(() => {
					if ($(this.cnblogs.postDigg).length) {
						clearInterval(intervalId);
						builder();
					}
				}, 200);
			}
		}

		/**
		 * 构建博客目录
		 */
		buildPostCatalog() {
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

		/**
		 * 构建 Github Corner
		 */
		buildGithubCorner() {
			const config = this.defaluts.github;
			if (config.enable) {
				let fillStyle = config.fill ? `fill:${config.fill};` : '';
				$('body').append(
						`<a href="${config.link}" class="github-corner" title="Fork me on GitHub">
                        <svg width="60" height="60" viewBox="0 0 250 250" style="${fillStyle} color:${config.color}; z-index: 999999; position: fixed; top: 0; border: 0; left: 0; transform: scale(-1, 1);" aria-hidden="true">
                            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
                            <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
                            <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
                        </svg>
                    </a>`);
			}
		}

		/**
		 * 构建代码复制按钮
		 */
		buildPostCodeCopyBtns() {
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

		/**
		 * 构建工具栏
		 */
		buildToolbar() {
			const catalog = this.defaluts.catalog;

			$('body').append(`<div class="esa-toolbar">
                <!--<button class="esa-toolbar-gotop"><div class="tips">返回顶部</div></button>-->
                <!--<button class="esa-toolbar-contents"><div class="tips">阅读目录</div></button>-->
                <button class="esa-toolbar-follow">捕获</button>
            </div>`);

			// let $btnGotop = $('.esa-toolbar-gotop');
			// let $btnContents = $('.esa-toolbar-contents');
			let $btnFollow = $('.esa-toolbar-follow');

			// if (catalog.enable) {
			// 	$btnContents.on('click', () => {
			// 		let $catalog = $('.esa-catalog-contents');
			// 		if ($catalog.css('display') == 'none') {
			// 			$catalog.fadeIn();
			// 		} else {
			// 			$catalog.hide();
			// 		}
			// 	}).hover(() => {
			// 		$btnContents.find('.tips').show();
			// 	}, () => {
			// 		$btnContents.find('.tips').hide();
			// 	});
			// } else {
			// 	$btnContents.remove();
			// }
			//
			// $btnGotop.on('click', () => {
			// 	$(window).scrollTop(0);
			// }).hover(() => {
			// 	$btnGotop.find('.tips').show();
			// }, () => {
			// 	$btnGotop.find('.tips').hide();
			// });
			//
			// $(window).scroll(function () {
			// 	if (this.scrollY > 200) {
			// 		$btnGotop.fadeIn();
			// 	} else {
			// 		$btnGotop.fadeOut();
			// 	}
			// });

			$btnFollow.on('click', () => {
				loadLink(location.protocol + "//common.cnblogs.com/scripts/artDialog/ui-dialog.css", () => {
					loadScript(location.protocol + "//common.cnblogs.com/scripts/artDialog/dialog-min.js", () => {
						if (!isLogined) {
							return login();
						}
						if (c_has_follwed) {
							return this.showMessage('您已经关注过该博主');
						}
						const n = cb_blogUserGuid;
						$.ajax({
							url: "/mvc/Follow/FollowBlogger.aspx",
							data: '{"blogUserGuid":"' + n + '"}',
							dataType: "text",
							type: "post",
							contentType: "application/json; charset=utf-8",
							success: (msg) => {
								msg == "未登录" ? login() : (msg == "关注成功" && followByGroup(n, !0));
								this.showMessage(msg);
							}
						})
					})
				})
			}).hover(() => {
				$btnFollow.find('.tips').show();
			}, () => {
				$btnFollow.find('.tips').hide();
			});
		}

		/**
		 * 构建博主信息
		 */
		buildBloggerProfile() {
			const config = this.defaluts.profile;

			if (!config.enable) {
				return;
			}

			if (!this.isPostPage && config.avatar) {
				$(this.cnblogs.sideBarMain).prepend(`<img class="esa-profile-avatar" src="${config.avatar}" />`);
			}

			if (config.favicon) {
				$('head').append(`<link rel="shortcut icon" href="${config.favicon}" type="image/x-icon" />`);
			}

			//博客logo
			var title = '<div class="site-branding">' +
					'<span class="logolink moe-mashiro">' +
					'<a href="https://www.cnblogs.com/leiyuanze/" alt="春原庄的雪">' +
					'<ruby><span class="sakuraso">すのはら荘</span><span class="no">の</span><span class="shironeko">雪</span>' +
					'<rt class="chinese-font">春原庄的雪</rt></ruby></a></span>' +
					'</div>'
			$('body').prepend(title);


		}

		/**
		 * 构建顶部滚动进度条 需要在页面dom元素构建成功之后再计算文档高度。
		 */
		scrollDy() {
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


		// 已经滚动距离
		getScrollTop() {
			var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
			if (document.body) {
				bodyScrollTop = document.body.scrollTop;
			}
			if (document.documentElement) {
				documentScrollTop = document.documentElement.scrollTop;
			}
			scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
			return scrollTop;
		}

		// 文档的总高度
		getScrollHeight() {
			var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
			if (document.body) {
				bodyScrollHeight = document.body.scrollHeight;
			}
			if (document.documentElement) {
				documentScrollHeight = document.documentElement.scrollHeight;
			}
			scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
			return scrollHeight;
		}

		// 窗体高度
		getWindowHeight() {
			var windowHeight = 0;
			if (document.compatMode == "CSS1Compat") {
				windowHeight = document.documentElement.clientHeight;
			} else {
				windowHeight = document.body.clientHeight;
			}
			return windowHeight;
		}

		//=========================设置主页逻辑
		/**
		 * 构建主页头部html
		 * headertop 网格遮罩
		 */
		mainHeader() {
			const config = this.defaluts.topInfo;
			// 签名诗句：配置里用 | 分隔多条，每次刷新随机取一条
			const mottoList = String(config.text || '').split('|').map((s) => s.trim()).filter((s) => s);
			if (mottoList.length > 1) {
				config.text = mottoList[Math.floor(Math.random() * mottoList.length)];
			}
			var header =
					`<div class="headertop filter-dot">` +
					`</div>` +
					`<div class="main-header">` +
					`</div>` +
					`<div class="focusinfo no-select">` +
					`       <h1 class="center-text Ubuntu-font" data-text="leiyuanze">${config.title}</h1>` +
					`       <div class="header-info"><p><i class="fa fa-quote-left"></i> ${config.text} <i class="fa fa-quote-right"></i></p>` +
					`           <div class="top-social_v2">` +
					`              <li id="bg-pre"><img class="flipx" src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808103709869-648245711.png"></li>` +
					`              <li><a href="${config.github}" target="_blank" class="social-github" title="github"><img src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808095618459-218538626.png"></a></li>` +
					`              <li><a href="${config.weibo}" target="_blank" class="social-sina" title="sina"><img src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808095623418-1617766229.png"></a></li>` +
					`              <li><a href="${config.telegram}" target="_blank" class="social-lofter" title="telegram"><img src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808095628401-835828752.png"></a></li>` +
					`              <li><a href="${config.music}" target="_blank" class="social-wangyiyun" title="CloudMusic"><img src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808095640330-1209750721.png"></a></li>` +
					`              <li><a href="${config.twitter}" target="_blank" class="social-wangyiyun" title="Twitter"><img src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808095635213-701885869.png"></a></li>` +
					`              <li><a href="${config.zhihu}" target="_blank" class="social-wangyiyun" title="Zhihu"><img src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808095650119-1882504549.png"></a></li>` +
					`              <li><a href="${config.mail}" target="_blank" class="social-wangyiyun" title="E-mail"><img src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808095613956-1350546638.png"></a></li>` +
					`              <li id="bg-next"><img src="https://img2018.cnblogs.com/blog/1646268/201908/1646268-20190808103709869-648245711.png"></li>` +
					`           </div>` +
					`      </div>` +
					`</div>` +
					`<div class="wave">` +
					`   <div id="banner_wave_1"></div>` +
					`   <div id="banner_wave_2"></div>` +
					`</div>` +
					`<div class="scroll-down" data-offset="-45">` +
					`        <span class="hidden">Scroll Down</span>` +
					`        <i class="fa fa-chevron-down" aria-hidden="true"></i>` +
					`</div>`;
			$('#home').prepend(header);
		}

		/**
		 * 构建主页头图
		 */
		homeImg() {
			const config = this.defaluts.topImg;
			// 设置主页图片
			let homeTopImg = config.homeTopImg, bgImg;
			let index = this.randomNum(0, homeTopImg.length - 1);
			homeTopImg.length > 0 ?
					(homeTopImg.length > 1 ? bgImg = homeTopImg[index] : bgImg = homeTopImg[0])
					: bgImg = "";
			$('.main-header').css({
				'background-image': 'url(' + bgImg + ')',
			});

			// 头图点击滚动到内容位置
			$('.scroll-down').click(function () {
				let endScroll;
				endScroll = $('#main').offset().top - 20;
				$('html,body').stop().animate({scrollTop: endScroll}, 1000);
			});

			//切换首页壁纸
			$('#bg-pre').click(function () {
				index--;
				if (index < 0) {
					index = homeTopImg.length - 1
				}
				let nextImg = homeTopImg[index]
				$('.main-header').css({
					'background-image': 'url(' + nextImg + ')',
				});
			});
			$('#bg-next').click(function () {
				index++;
				if (index > homeTopImg.length - 1) {
					index = 0
				}
				let preImg = homeTopImg[index]
				$('.main-header').css({
					'background-image': 'url(' + preImg + ')',
				});

			})
		}

		/**
		 * 构建首页随笔列表
		 */
		/**
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
			const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
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

		//=================阅读页逻辑
		/**
		 * 构建阅读页头部html 如果是文章则只显示标题，如果是随笔则显示发布时间，头像，阅读量
		 */
		postHeader() {
			$('body').addClass('esa-post-page');
			var center =
					'<div class="pattern-center">' +
					' <div class="pattern-attachment-img"><img src="" data-src=""' +
					'    style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></div>' +
					' <header class="pattern-header "><h1 class="entry-title"></h1></header>' +
					'</div>';
			$('#home').prepend(center);
			const sbTitle = $('#cb_post_title_url').text();
			$('.entry-title').text(sbTitle);// 设置标题
			$('.postTitle').css('display', 'none');
			let post_date = $('#post-date').text() //发布时间
			let post_view_count = $('#post_view_count').text() //阅读数
			if (window.location.href.indexOf('articles') === -1) {
				var header =
						`<p class="entry-census"><span><a href="https://www.cnblogs.com/leiyuanze/"></a></span><span><a href="https://www.cnblogs.com/leiyuanze/">leiyuanze</a></span><span class="bull">·</span>${post_date}<span class="bull">·</span>${post_view_count} 次阅读</p>`;
				$('.pattern-header').append(header)
				$('.pattern-center').addClass('single-center')
				$('.pattern-header').addClass('single-header')
			} else {
				return
			}

		}

		/**
		 * 构建非主页头图
		 */
		setNotHomeTopImg = function () {
			const config = this.defaluts.topImg;
			// 设置主页图片
			let notHomeTopImg = config.notHomeTopImg, bgImg;

			notHomeTopImg.length > 0 ?
					(notHomeTopImg.length > 1 ? bgImg = notHomeTopImg[this.randomNum(0, notHomeTopImg.length - 1)] : bgImg = notHomeTopImg[0])
					: bgImg = "";
			$('.pattern-attachment-img img').attr('src', bgImg);
		};

		/**
		 * 随机数
		 */
		randomNum = function (minNum, maxNum) {
			switch (arguments.length) {
				case 1:
					return parseInt(Math.random() * minNum + 1);
					break;
				case 2:
					return parseInt(Math.random() * (maxNum - minNum + 1) + minNum);
					break;
				default:
					return 0;
					break;
			}
		};
	}
})(jQuery);

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
            { id: 3322773657, name: "游山恋", artist: "浅影阿", pic: 109951172355669080 },
            { id: 3442248108, name: "关山酒", artist: "浅影阿", pic: 109951174022423147 },
            { id: 3420272282, name: "牡丹亭", artist: "浅影阿", pic: 109951173739951494 },
            { id: 3373839227, name: "春不晚", artist: "浅影阿", pic: 109951173108183621 },
            { id: 167850, name: "庐州月", artist: "许嵩", pic: 109951172202579057 },
            { id: 167882, name: "清明雨上", artist: "许嵩", pic: 109951172899966259 },
            { id: 167937, name: "断桥残雪", artist: "许嵩", pic: 58274116284456 },
            { id: 28802028, name: "山水之间", artist: "许嵩", pic: 109951172321467418 },
            { id: 28854182, name: "惊鸿一面", artist: "许嵩 / 黄龄", pic: 109951172321467418 },
            { id: 402073807, name: "燕归巢", artist: "许嵩", pic: 3431575794705764 },
            { id: 411214279, name: "雅俗共赏", artist: "许嵩", pic: 3431575794705764 },
            { id: 101131, name: "倾尽天下", artist: "河图", pic: 6049512976313503 },
            { id: 28188434, name: "锦鲤抄", artist: "银临 / 云之泣", pic: 5859297464524710 },
            { id: 28188427, name: "棠梨煎雪", artist: "银临", pic: 5859297464524710 },
            { id: 2078062390, name: "典狱司", artist: "音频怪物", pic: 109951168881672971 },
            { id: 409654891, name: "故梦", artist: "双笙", pic: 109951168638984216 },
            { id: 39224244, name: "狐言", artist: "河图 / 洛天依", pic: 109951167999122273 }
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
