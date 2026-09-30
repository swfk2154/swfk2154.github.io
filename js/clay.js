(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 入场编排结束后移除标记，避免 both 填充的残留 filter/transform 合成层 */
  if (document.documentElement.classList.contains('boot')) {
    window.setTimeout(function () { document.documentElement.classList.remove('boot'); }, 1600);
  }

  /* ================= 主题切换（全局，一次） ================= */
  function currentTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }
  function applyTheme(theme, persist) {
    document.documentElement.dataset.theme = theme;
    var meta = document.getElementById('theme-color');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e1116' : '#f8f7f4');
    if (persist !== false) {
      try { localStorage.setItem('clay-theme', theme); } catch (e) {}
    }
    // 同步 giscus 评论框主题
    var giscusFrame = document.querySelector('iframe.giscus-frame');
    if (giscusFrame) {
      try {
        giscusFrame.contentWindow.postMessage(
          { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
          'https://giscus.app'
        );
      } catch (e) {}
    }
  }
  applyTheme(currentTheme(), false);
  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  /* ================= 移动端汉堡菜单 ================= */
  var navToggle = document.querySelector('[data-nav-toggle]');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var pill = navToggle.closest('.site-nav__pill');
      if (!pill) return;
      var open = pill.classList.toggle('is-menu-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    // 点击菜单项后自动收起
    document.querySelectorAll('[data-nav-links] a').forEach(function (a) {
      a.addEventListener('click', function () {
        var pill = navToggle.closest('.site-nav__pill');
        if (pill) pill.classList.remove('is-menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ========== Hero 装饰微视差（Daydream 移植）：仅精确指针 + 允许动态 ========== */
  (function () {
    var scene = document.querySelector('.hero-scene');
    var heroEl = document.querySelector('.hero');
    if (!scene || !heroEl || reduceMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var orbs = scene.querySelectorAll('[data-depth]');
    if (!orbs.length) return;

    var cx = 0, cy = 0, tx = 0, ty = 0, rafId = null;
    function step() {
      cx += (tx - cx) * 0.085;
      cy += (ty - cy) * 0.085;
      for (var i = 0; i < orbs.length; i++) {
        var d = parseFloat(orbs[i].getAttribute('data-depth')) || 0;
        orbs[i].style.transform =
          'translate3d(' + (cx * d).toFixed(2) + 'px,' + (cy * d * 0.7).toFixed(2) + 'px,0)';
      }
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        rafId = window.requestAnimationFrame(step);
      } else {
        rafId = null;
      }
    }
    function wake() { if (rafId === null) rafId = window.requestAnimationFrame(step); }

    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / Math.max(240, r.height) - 0.5) * 2));
      wake();
    });
    heroEl.addEventListener('pointerleave', function () { tx = 0; ty = 0; wake(); });
    window.addEventListener('blur', function () { tx = 0; ty = 0; wake(); });
  })();

  /* ================= 回到顶部（全局，一次） ================= */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ========== 阅读进度 + TOC：滚动时读取「当前页」的引用 ========== */
  var currentBar = null;
  var currentArticle = null;
  var currentTocItems = [];

  function updateReadingProgress() {
    var y = window.scrollY;
    if (currentBar && currentArticle) {
      var start = currentArticle.offsetTop;
      var total = currentArticle.offsetHeight - window.innerHeight;
      var p = total > 0 ? (y - start) / total : 0;
      currentBar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    }
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }

  function syncToc() {
    if (!currentTocItems.length) return;
    var offset = 130;
    var active = currentTocItems[0].link;
    for (var i = 0; i < currentTocItems.length; i++) {
      if (currentTocItems[i].heading.getBoundingClientRect().top <= offset) active = currentTocItems[i].link;
      else break;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60) {
      active = currentTocItems[currentTocItems.length - 1].link;
    }
    var cur = document.querySelector('.toc a.is-active');
    if (cur !== active) {
      if (cur) cur.classList.remove('is-active');
      active.classList.add('is-active');
    }
  }

  var scrollTick = false;
  window.addEventListener('scroll', function () {
    if (!scrollTick) {
      scrollTick = true;
      window.requestAnimationFrame(function () {
        scrollTick = false;
        updateReadingProgress();
        syncToc();
      });
    }
  }, { passive: true });

  /* ================= 工具函数 ================= */
  function writeClipboard(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      done(ok);
    }
  }

  /* ================= 评论（giscus）按需动态加载 ================= */
  function renderGiscus() {
    var el = document.getElementById('gitalk-container');
    var cfg = window.__giscusConfig;
    if (!el || !cfg || !cfg.repoId || !cfg.categoryId) return;
    if (el.querySelector('.giscus, iframe.giscus-frame')) return;

    el.innerHTML = '';
    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.setAttribute('data-repo', cfg.repo);
    s.setAttribute('data-repo-id', cfg.repoId);
    s.setAttribute('data-category', cfg.category);
    s.setAttribute('data-category-id', cfg.categoryId);
    s.setAttribute('data-mapping', cfg.mapping || 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', cfg.reactionsEnabled === false ? '0' : '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', cfg.inputPosition || 'top');
    s.setAttribute('data-theme', document.documentElement.dataset.theme === 'dark' ? 'dark' : (cfg.theme || 'light'));
    s.setAttribute('data-lang', cfg.lang || 'zh-CN');
    s.setAttribute('crossorigin', 'anonymous');
    s.async = true;
    el.appendChild(s);
  }

  /* ================= 内容初始化（每次换页后重跑） ================= */
  var revealObserver = null;

  function initContent() {
    // 滚动入场动画
    if (revealObserver) revealObserver.disconnect();
    var revealEls = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
    } else {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }

    // 终端风格代码块美化（macOS 三色小圆点 + 语言徽章 + 复制胶囊）
    document.querySelectorAll('.post-content pre').forEach(function (pre) {
      if (pre.querySelector('.code-terminal-header')) return;
      var code = pre.querySelector('code');

      var header = document.createElement('div');
      header.className = 'code-terminal-header';

      var dots = document.createElement('div');
      dots.className = 'code-terminal-dots';
      dots.innerHTML = '<span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>';
      header.appendChild(dots);

      var m = code ? (code.className || '').match(/language-([\w#+-]+)/) : null;
      var langName = (m && m[1] && m[1] !== 'plaintext') ? m[1].toUpperCase() : 'TERMINAL';
      var title = document.createElement('span');
      title.className = 'code-terminal-title';
      title.textContent = langName;
      header.appendChild(title);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-code-button';
      btn.textContent = '复制';
      btn.setAttribute('aria-label', '复制代码');
      header.appendChild(btn);

      btn.addEventListener('click', function () {
        var text = code ? code.innerText : pre.innerText;
        writeClipboard(text.trimEnd(), function (ok) {
          btn.textContent = ok ? '✓ 已复制' : '复制失败';
          btn.classList.add('is-copied');
          window.setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('is-copied');
          }, 1800);
        });
      });

      pre.insertBefore(header, pre.firstChild);
      pre.classList.add('is-terminal');
    });

    // 表格滚动包裹
    document.querySelectorAll('.post-content table').forEach(function (t) {
      if (t.parentElement && t.parentElement.classList.contains('table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });

    // 现代 Callout 智能提示框
    document.querySelectorAll('.post-content blockquote').forEach(function (bq) {
      var text = bq.innerText || '';
      var firstLine = text.trim().split('\n')[0] || '';
      if (/⚠️|警告|注意|warning/i.test(firstLine)) {
        bq.classList.add('callout', 'callout--warning');
      } else if (/💡|提示|技巧|tip/i.test(firstLine)) {
        bq.classList.add('callout', 'callout--tip');
      } else if (/🛡️|安全|合规|security|边界/i.test(firstLine)) {
        bq.classList.add('callout', 'callout--security');
      } else if (/ℹ️|说明|参考|note|严谨性说明/i.test(firstLine)) {
        bq.classList.add('callout', 'callout--note');
      } else {
        bq.classList.add('callout', 'callout--default');
      }
    });

    // 阅读进度引用（当前页）
    currentBar = document.querySelector('[data-reading-progress]');
    currentArticle = document.querySelector('.article');
    updateReadingProgress();

    // TOC 滚动高亮 + 点击跳转
    currentTocItems = [];
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
    if (tocLinks.length) {
      currentTocItems = tocLinks.map(function (link) {
        var id = decodeURIComponent(link.getAttribute('href').slice(1));
        return { link: link, heading: document.getElementById(id) };
      }).filter(function (it) { return it.heading; });

      currentTocItems.forEach(function (item) {
        item.link.addEventListener('click', function (e) {
          e.preventDefault();
          var top = item.heading.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
          if (window.history && window.history.pushState) {
            history.pushState(null, '', item.link.getAttribute('href'));
          }
        });
      });
      syncToc();
    }

    // 图片灯箱
    document.querySelectorAll('.post-content img').forEach(function (img) {
      img.addEventListener('click', function () {
        if (reduceMotion) return;
        var overlay = document.createElement('div');
        overlay.className = 'lightbox';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', img.alt || '图片预览');
        var full = document.createElement('img');
        full.src = img.currentSrc || img.src;
        full.alt = img.alt || '';
        overlay.appendChild(full);
        var close = function () {
          overlay.classList.remove('is-open');
          document.removeEventListener('keydown', onKey);
          window.setTimeout(function () { overlay.remove(); }, 200);
        };
        var onKey = function (e) { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        overlay.addEventListener('click', close);
        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('is-open'); });
      });
    });

    // 打赏展开
    var rewardToggle = document.querySelector('[data-reward-toggle]');
    var rewardBox = document.querySelector('[data-reward-box]');
    if (rewardToggle && rewardBox) {
      rewardToggle.addEventListener('click', function () {
        rewardBox.classList.toggle('is-open');
      });
    }

    // 导航高亮
    updateNavActive();

    // 评论（giscus）按需动态加载渲染
    renderGiscus();
  }

  function updateNavActive() {
    var path = location.pathname.replace(/\/+$/, '');
    document.querySelectorAll('.site-nav__pill a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      var clean = href.replace(/\/+$/, '');
      var active = (clean === path) || (clean !== '/' && clean !== '' && path.indexOf(clean) === 0);
      a.classList.toggle('is-current', active);
    });
  }

  /* ================= 悬浮音乐播放器（全局，一次） ================= */
  var musicPlayer = document.querySelector('[data-music-player]');
  if (musicPlayer) {
    var mToggle = musicPlayer.querySelector('[data-music-toggle]');
    var mPanel = musicPlayer.querySelector('[data-music-panel]');
    var mClose = musicPlayer.querySelector('[data-music-close]');
    var mBackdrop = musicPlayer.querySelector('[data-music-backdrop]');
    function setMusicOpen(open) {
      musicPlayer.classList.toggle('is-open', open);
      if (mPanel) mPanel.setAttribute('aria-hidden', String(!open));
      if (mToggle) mToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('music-sheet-open', open && window.innerWidth <= 640);
    }
    if (mToggle) mToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMusicOpen(!musicPlayer.classList.contains('is-open'));
    });
    if (mClose) mClose.addEventListener('click', function (e) {
      e.stopPropagation();
      setMusicOpen(false);
    });
    if (mBackdrop) mBackdrop.addEventListener('click', function (e) {
      e.stopPropagation();
      setMusicOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (musicPlayer.classList.contains('is-open') && !musicPlayer.contains(e.target)) setMusicOpen(false);
    });

    var mTabs = musicPlayer.querySelectorAll('[data-music-tab]');
    var mPanes = musicPlayer.querySelectorAll('[data-music-pane]');
    mTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = tab.getAttribute('data-music-tab');
        mTabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        mPanes.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-music-pane') === idx); });
      });
    });

    var discCover = musicPlayer.querySelector('[data-music-cover]');
    var discNote = musicPlayer.querySelector('.music-player__disc-note');
    var toast = musicPlayer.querySelector('[data-music-toast]');
    var toastTitle = musicPlayer.querySelector('[data-toast-title]');
    var toastArtist = musicPlayer.querySelector('[data-toast-artist]');
    var ambient = musicPlayer.querySelector('[data-music-ambient]');
    var toastTimer = null;

    function showMusicToast(title, artist) {
      if (!toast || musicPlayer.classList.contains('is-open')) return;
      if (toastTitle) toastTitle.textContent = title || '未知曲目';
      if (toastArtist) toastArtist.textContent = artist || '未知歌手';
      toast.classList.add('is-visible');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove('is-visible');
      }, 3400);
    }

    function getAplayer() {
      var arr = window.__CLAY_APLAYER__;
      if (arr && arr[0]) return arr[0];
      var metingEl = musicPlayer.querySelector('meting-js') || document.querySelector('meting-js');
      return (metingEl && metingEl.aplayer) ? metingEl.aplayer : null;
    }
    function syncDiscCover() {
      var ap = getAplayer();
      if (!ap || !ap.list || !ap.list.audios) return;
      var audio = ap.list.audios[ap.list.index];
      var cover = audio && (audio.cover || audio.pic);
      if (cover && discCover) {
        if (discCover.getAttribute('src') !== cover) discCover.src = cover;
        discCover.hidden = false;
        if (discNote) discNote.hidden = true;
      } else {
        if (discCover) discCover.hidden = true;
        if (discNote) discNote.hidden = false;
      }
      if (ambient && cover) {
        ambient.style.backgroundImage = 'url(' + cover + ')';
      }
    }
    function addListCovers(ap) {
      var items = musicPlayer.querySelectorAll('.aplayer-list ol li');
      if (!items.length || !ap.list || !ap.list.audios) return;
      items.forEach(function (li, i) {
        if (li.querySelector('.aplayer-list-cover')) return;
        var audio = ap.list.audios[i];
        var cover = audio && (audio.cover || audio.pic);
        if (cover) {
          var img = document.createElement('img');
          img.className = 'aplayer-list-cover';
          img.src = cover;
          img.alt = '';
          img.loading = 'lazy';
          img.referrerPolicy = 'no-referrer';
          li.insertBefore(img, li.firstChild);
        }
      });
    }
    function buildCustomControls(ap) {
      var apEl = musicPlayer.querySelector('.aplayer');
      var info = apEl && apEl.querySelector('.aplayer-info');
      var list = apEl && apEl.querySelector('.aplayer-list');
      if (!info || !list || apEl.querySelector('[data-mp-controls]')) return;

      var icons = {
        play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
        pause: '<svg viewBox="0 0 24 24"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill="currentColor"/></svg>',
        prev: '<svg viewBox="0 0 24 24"><path d="M7 5h2.4v14H7zM18.5 5v14L9.5 12z" fill="currentColor"/></svg>',
        next: '<svg viewBox="0 0 24 24"><path d="M14.6 5H17v14h-2.4zM5.5 5v14l9-7z" fill="currentColor"/></svg>',
        volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
        volumeMute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
        orderList: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
        orderRandom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>'
      };

      var box = document.createElement('div');
      box.className = 'mp-controls';
      box.setAttribute('data-mp-controls', '');
      box.innerHTML =
        '<div class="mp-progress">' +
          '<div class="mp-bar" data-mp-bar><div class="mp-played" data-mp-played></div></div>' +
          '<div class="mp-time"><span data-mp-ptime>0:00</span><span class="mp-sep">/</span><span data-mp-dtime>0:00</span></div>' +
        '</div>' +
        '<div class="mp-buttons">' +
          '<button type="button" class="mp-btn mp-btn--sub" data-mp-order title="切换播放模式">' + icons.orderList + '</button>' +
          '<button type="button" class="mp-btn" data-mp-prev title="上一首">' + icons.prev + '</button>' +
          '<button type="button" class="mp-btn mp-play" data-mp-play title="播放">' + icons.play + '</button>' +
          '<button type="button" class="mp-btn" data-mp-next title="下一首">' + icons.next + '</button>' +
          '<div class="mp-vol-wrap">' +
            '<button type="button" class="mp-btn mp-btn--sub" data-mp-volbtn title="音量">' + icons.volume + '</button>' +
            '<div class="mp-vol-slider" data-mp-volslider><div class="mp-vol-bar"><div class="mp-vol-fill" data-mp-volfill style="width: 70%"></div></div></div>' +
          '</div>' +
        '</div>';
      list.parentNode.insertBefore(box, list);

      var ctrl = info.querySelector('.aplayer-controller');
      if (ctrl) ctrl.style.display = 'none';

      var played = box.querySelector('[data-mp-played]');
      var ptime = box.querySelector('[data-mp-ptime]');
      var dtime = box.querySelector('[data-mp-dtime]');
      var playBtn = box.querySelector('[data-mp-play]');

      function fmt(s) {
        if (!isFinite(s) || s < 0) return '0:00';
        var m = Math.floor(s / 60);
        return m + ':' + ('0' + Math.floor(s % 60)).slice(-2);
      }
      function updateTime() {
        var d = ap.audio && ap.audio.duration;
        var c = ap.audio && ap.audio.currentTime;
        dtime.textContent = fmt(d || 0);
        ptime.textContent = fmt(c || 0);
        if (d) played.style.width = (c / d * 100) + '%';
      }
      ap.on('timeupdate', updateTime);
      ap.on('loadedmetadata', updateTime);
      ap.on('play', function () { playBtn.innerHTML = icons.pause; playBtn.setAttribute('title', '暂停'); });
      ap.on('pause', function () { playBtn.innerHTML = icons.play; playBtn.setAttribute('title', '播放'); });

      playBtn.addEventListener('click', function () { ap.toggle(); });
      box.querySelector('[data-mp-prev]').addEventListener('click', function () { ap.skipBack(); });
      box.querySelector('[data-mp-next]').addEventListener('click', function () { ap.skipForward(); });

      // 播放模式切换（顺序 / 随机）
      var orderBtn = box.querySelector('[data-mp-order]');
      if (orderBtn) {
        var isRandom = (ap.options && ap.options.order === 'random');
        function syncOrderUi() {
          orderBtn.innerHTML = isRandom ? icons.orderRandom : icons.orderList;
          orderBtn.setAttribute('title', isRandom ? '当前：随机播放' : '当前：顺序播放');
          orderBtn.classList.toggle('is-random', isRandom);
        }
        syncOrderUi();
        orderBtn.addEventListener('click', function () {
          isRandom = !isRandom;
          if (ap.options) ap.options.order = isRandom ? 'random' : 'list';
          syncOrderUi();
          if (ap.notice) ap.notice(isRandom ? '已切换至随机播放' : '已切换至顺序播放', 2000);
        });
      }

      // 音量控制
      var volBtn = box.querySelector('[data-mp-volbtn]');
      var volSlider = box.querySelector('[data-mp-volslider]');
      var volFill = box.querySelector('[data-mp-volfill]');
      var lastVol = ap.audio ? (ap.audio.volume || 0.7) : 0.7;
      function syncVolUi(v) {
        if (volFill) volFill.style.width = Math.round(v * 100) + '%';
        if (volBtn) {
          volBtn.innerHTML = v <= 0.02 ? icons.volumeMute : icons.volume;
        }
      }
      syncVolUi(lastVol);
      if (volBtn) {
        volBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (!ap.audio) return;
          if (ap.audio.volume > 0.02) {
            lastVol = ap.audio.volume;
            ap.volume(0, true);
            syncVolUi(0);
          } else {
            ap.volume(lastVol || 0.7, true);
            syncVolUi(lastVol || 0.7);
          }
        });
      }
      if (volSlider) {
        var volDrag = false;
        function updateVol(clientX) {
          var rect = volSlider.getBoundingClientRect();
          var r = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
          ap.volume(r, true);
          lastVol = r;
          syncVolUi(r);
        }
        volSlider.addEventListener('pointerdown', function (e) {
          volDrag = true;
          if (volSlider.setPointerCapture) { try { volSlider.setPointerCapture(e.pointerId); } catch (err) {} }
          updateVol(e.clientX);
        });
        volSlider.addEventListener('pointermove', function (e) { if (volDrag) updateVol(e.clientX); });
        volSlider.addEventListener('pointerup', function () { volDrag = false; });
        volSlider.addEventListener('pointercancel', function () { volDrag = false; });
      }

      // 进度条：支持点击与按住拖拽（pointer 事件兼容触屏）
      var bar = box.querySelector('[data-mp-bar]');
      var dragging = false;
      function seekTo(clientX) {
        var d = ap.audio && ap.audio.duration;
        if (!d || !isFinite(d)) return;
        var rect = bar.getBoundingClientRect();
        var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        ap.audio.currentTime = ratio * d;
        played.style.width = (ratio * 100) + '%';
      }
      bar.addEventListener('pointerdown', function (e) {
        dragging = true;
        if (bar.setPointerCapture) { try { bar.setPointerCapture(e.pointerId); } catch (err) {} }
        seekTo(e.clientX);
      });
      bar.addEventListener('pointermove', function (e) { if (dragging) seekTo(e.clientX); });
      bar.addEventListener('pointerup', function () { dragging = false; });
      bar.addEventListener('pointercancel', function () { dragging = false; });

      var head = document.createElement('div');
      head.className = 'mp-listhead';
      head.innerHTML = '<span>播放列表</span><small data-mp-count></small>';
      list.parentNode.insertBefore(head, list);
      function updateCount() {
        var total = ap.list.audios ? ap.list.audios.length : 0;
        var cur = ap.list.index != null ? ap.list.index + 1 : 0;
        head.querySelector('[data-mp-count]').textContent = total ? (cur + '/' + total) : '';
        // 切歌提示气泡
        if (ap.list && ap.list.audios && ap.list.audios[ap.list.index]) {
          var curAudio = ap.list.audios[ap.list.index];
          showMusicToast(curAudio.name, curAudio.artist);
        }
      }
      updateCount();
      ap.on('listswitch', updateCount);

      /* ---------- 曲目加载失败自动跳下一首（中转源部分曲目 404 的兜底） ---------- */
      var errStreak = 0;
      ap.on('play', function () { errStreak = 0; });
      ap.on('error', function () {
        errStreak += 1;
        if (!ap.list || !ap.list.audios || ap.list.audios.length < 2) return;
        if (errStreak > 2) {
          if (ap.notice) ap.notice('连续多首曲目加载失败，已停止自动切换', 3000);
          return;
        }
        if (ap.notice) ap.notice('当前曲目加载失败，已自动切换下一首', 2500);
        ap.skipForward();
        ap.play();
      });

      /* ---------- Media Session：系统媒体键 / 锁屏与系统媒体浮层控制 ---------- */
      if ('mediaSession' in navigator) {
        var siteNameMeta = document.querySelector('meta[property="og:site_name"]');
        var siteName = siteNameMeta ? siteNameMeta.content : '';
        function syncMediaMeta() {
          try {
            var audio = ap.list && ap.list.audios ? ap.list.audios[ap.list.index] : null;
            if (!audio || typeof MediaMetadata !== 'function') return;
            var meta = { title: audio.name || '', artist: audio.artist || '', album: siteName };
            if (audio.cover) meta.artwork = [{ src: audio.cover, sizes: '512x512' }];
            navigator.mediaSession.metadata = new MediaMetadata(meta);
          } catch (e) {}
        }
        function bindMsAction(name, fn) {
          try { navigator.mediaSession.setActionHandler(name, fn); } catch (e) {}
        }
        bindMsAction('play', function () { ap.play(); });
        bindMsAction('pause', function () { ap.pause(); });
        bindMsAction('previoustrack', function () { ap.skipBack(); });
        bindMsAction('nexttrack', function () { ap.skipForward(); });
        bindMsAction('seekto', function (details) {
          if (details && details.seekTime != null && ap.audio && isFinite(ap.audio.duration)) {
            ap.audio.currentTime = details.seekTime;
          }
        });
        ap.on('listswitch', syncMediaMeta);
        ap.on('play', function () { navigator.mediaSession.playbackState = 'playing'; });
        ap.on('pause', function () { navigator.mediaSession.playbackState = 'paused'; });
        ap.on('ended', function () { navigator.mediaSession.playbackState = 'paused'; });
        ap.on('timeupdate', function () {
          try {
            var a = ap.audio;
            if (a && isFinite(a.duration) && a.duration > 0) {
              navigator.mediaSession.setPositionState({
                duration: a.duration,
                playbackRate: a.playbackRate || 1,
                position: Math.min(a.currentTime, a.duration)
              });
            }
          } catch (e) {}
        });
        syncMediaMeta();
      }

      updateTime();
    }

    var apTries = 0;
    var apTimer = setInterval(function () {
      apTries += 1;
      var ap = getAplayer();
      if (ap) {
        clearInterval(apTimer);
        ap.on('play', function () { musicPlayer.classList.add('is-playing'); syncDiscCover(); });
        ap.on('pause', function () { musicPlayer.classList.remove('is-playing'); });
        ap.on('ended', function () { musicPlayer.classList.remove('is-playing'); });
        ap.on('listswitch', function () { syncDiscCover(); addListCovers(ap); });
        syncDiscCover();
        addListCovers(ap);
        buildCustomControls(ap);

        // 播放状态持久化：整页刷新时自动续播（PJAX 情况下用不到，作为兜底）
        function savePlayback() {
          try {
            var state = {
              index: ap.list.index,
              time: (ap.audio && isFinite(ap.audio.currentTime)) ? ap.audio.currentTime : 0,
              playing: !!(ap.audio && !ap.audio.paused)
            };
            localStorage.setItem('clay-music-state', JSON.stringify(state));
          } catch (e) {}
        }
        function restorePlayback() {
          try {
            var raw = localStorage.getItem('clay-music-state');
            if (!raw) return;
            var state = JSON.parse(raw);
            if (state.index == null || !ap.list.audios || !ap.list.audios[state.index]) return;
            ap.list.switch(state.index);
            var audio = ap.audio;
            if (audio && state.time > 1) {
              var onMeta = function () {
                try { audio.currentTime = state.time; } catch (e) {}
                audio.removeEventListener('loadedmetadata', onMeta);
              };
              audio.addEventListener('loadedmetadata', onMeta);
            }
            if (state.playing) {
              try { ap.play(); } catch (e) {}
            }
          } catch (e) {}
        }
        var lastSave = 0;
        ap.on('timeupdate', function () {
          var now = Date.now();
          if (now - lastSave > 2000) { lastSave = now; savePlayback(); }
        });
        ap.on('play', savePlayback);
        ap.on('pause', savePlayback);
        ap.on('ended', savePlayback);
        restorePlayback();
      } else if (apTries > 100) {
        clearInterval(apTimer);
      }
    }, 300);
  }

  /* ================= PJAX 无刷新导航（音乐不间断的关键） ================= */
  function loadPage(url, push) {
    fetch(url, { headers: { 'X-Requested-With': 'fetch' } })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var newMain = doc.querySelector('main#main');
        var curMain = document.querySelector('main#main');
        if (!newMain || !curMain) throw new Error('no main');
        var newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.textContent;
        document.body.className = doc.body.className;
        curMain.innerHTML = newMain.innerHTML;
        if (push && window.history) history.pushState(null, '', url);
        window.scrollTo(0, 0);
        initContent();
      })
      .catch(function () {
        location.href = url;
      });
  }

  function setupPjax() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      var link = e.target.closest ? e.target.closest('a') : null;
      if (!link) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0 || href.indexOf('mailto:') === 0) return;
      var url;
      try { url = new URL(href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (/\.(xml|json|txt|png|jpe?g|gif|svg|webp|css|js|pdf|zip|ico|woff2?|ttf)$/i.test(url.pathname)) return;

      e.preventDefault();
      loadPage(url.href, true);
    });

    window.addEventListener('popstate', function () {
      loadPage(location.href, false);
    });
  }

  /* ================= 启动 ================= */
  initContent();
  setupPjax();
})();
