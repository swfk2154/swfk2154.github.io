(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 主题切换 ---------- */
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
  }
  applyTheme(currentTheme(), false);

  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- 滚动入场动画 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 代码复制 ---------- */
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
  document.querySelectorAll('.post-content pre').forEach(function (pre) {
    if (pre.querySelector('[data-copy-code]')) return;
    var code = pre.querySelector('code');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-code-button';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码');
    pre.appendChild(btn);
    btn.addEventListener('click', function () {
      var text = code ? code.innerText : pre.innerText.replace(btn.innerText, '');
      writeClipboard(text.trimEnd(), function (ok) {
        btn.textContent = ok ? '已复制' : '复制失败';
        btn.classList.add('is-copied');
        window.setTimeout(function () {
          btn.textContent = '复制';
          btn.classList.remove('is-copied');
        }, 1800);
      });
    });
  });

  /* ---------- 代码语言标签 ---------- */
  document.querySelectorAll('.post-content pre').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (!code || pre.querySelector('[data-code-lang]')) return;
    var m = (code.className || '').match(/language-([\w#+-]+)/);
    if (m && m[1] && m[1] !== 'plaintext') {
      var lang = document.createElement('span');
      lang.className = 'code-lang';
      lang.setAttribute('data-code-lang', '');
      lang.textContent = m[1];
      pre.appendChild(lang);
      pre.classList.add('has-lang');
    }
  });

  /* ---------- 表格滚动包裹 ---------- */
  document.querySelectorAll('.post-content table').forEach(function (t) {
    if (t.parentElement && t.parentElement.classList.contains('table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    t.parentNode.insertBefore(wrap, t);
    wrap.appendChild(t);
  });

  /* ---------- 阅读进度 + 回到顶部 ---------- */
  var bar = document.querySelector('[data-reading-progress]');
  var article = document.querySelector('.article');
  var toTop = document.querySelector('.to-top');
  var ticking = false;

  function updateScroll() {
    ticking = false;
    var y = window.scrollY;
    if (bar && article) {
      var start = article.offsetTop;
      var total = article.offsetHeight - window.innerHeight;
      var p = total > 0 ? (y - start) / total : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    }
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- TOC 滚动高亮 ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  if (tocLinks.length) {
    var items = tocLinks.map(function (link) {
      var id = decodeURIComponent(link.getAttribute('href').slice(1));
      return { link: link, heading: document.getElementById(id) };
    }).filter(function (it) { return it.heading; });

    if (items.length) {
      var current = null;
      function setActive(link) {
        if (current === link) return;
        if (current) current.classList.remove('is-active');
        link.classList.add('is-active');
        current = link;
      }
      var tocTick = false;
      function syncToc() {
        tocTick = false;
        var offset = 130;
        var active = items[0].link;
        for (var i = 0; i < items.length; i++) {
          if (items[i].heading.getBoundingClientRect().top <= offset) active = items[i].link;
          else break;
        }
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60) {
          active = items[items.length - 1].link;
        }
        setActive(active);
      }
      window.addEventListener('scroll', function () {
        if (!tocTick) { tocTick = true; window.requestAnimationFrame(syncToc); }
      }, { passive: true });
      syncToc();

      // 点击目录 → 手动平滑滚动定位（带导航偏移），保证跳转
      items.forEach(function (item) {
        item.link.addEventListener('click', function (e) {
          e.preventDefault();
          var top = item.heading.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
          if (window.history && window.history.pushState) {
            history.pushState(null, '', item.link.getAttribute('href'));
          }
        });
      });
    }
  }

  /* ---------- 图片灯箱 ---------- */
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

  /* ---------- 打赏展开 ---------- */
  var rewardToggle = document.querySelector('[data-reward-toggle]');
  var rewardBox = document.querySelector('[data-reward-box]');
  if (rewardToggle && rewardBox) {
    rewardToggle.addEventListener('click', function () {
      rewardBox.classList.toggle('is-open');
    });
  }

  /* ---------- 悬浮音乐播放器 ---------- */
  var musicPlayer = document.querySelector('[data-music-player]');
  if (musicPlayer) {
    var mToggle = musicPlayer.querySelector('[data-music-toggle]');
    var mPanel = musicPlayer.querySelector('[data-music-panel]');
    var mClose = musicPlayer.querySelector('[data-music-close]');
    function setMusicOpen(open) {
      musicPlayer.classList.toggle('is-open', open);
      if (mPanel) mPanel.setAttribute('aria-hidden', String(!open));
      if (mToggle) mToggle.setAttribute('aria-expanded', String(open));
    }
    if (mToggle) mToggle.addEventListener('click', function () {
      setMusicOpen(!musicPlayer.classList.contains('is-open'));
    });
    if (mClose) mClose.addEventListener('click', function () { setMusicOpen(false); });
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

    // 同步 APlayer 播放状态到唱片按钮（封面 + 旋转 + 脉冲）
    var discCover = musicPlayer.querySelector('[data-music-cover]');
    var discNote = musicPlayer.querySelector('.music-player__disc-note');
    function getAplayer() {
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
    // 构建自定义控制区（进度条 + 大播放键 + 上下曲/模式），隐藏 APlayer 默认控制器
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
        mode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>'
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
          '<button type="button" class="mp-btn" data-mp-prev title="上一首">' + icons.prev + '</button>' +
          '<button type="button" class="mp-btn mp-play" data-mp-play title="播放">' + icons.play + '</button>' +
          '<button type="button" class="mp-btn" data-mp-next title="下一首">' + icons.next + '</button>' +
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

      var bar = box.querySelector('[data-mp-bar]');
      bar.addEventListener('click', function (e) {
        var d = ap.audio && ap.audio.duration;
        if (!d) return;
        var rect = bar.getBoundingClientRect();
        var ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        ap.audio.currentTime = ratio * d;
        played.style.width = (ratio * 100) + '%';
      });

      // 播放列表计数头
      var head = document.createElement('div');
      head.className = 'mp-listhead';
      head.innerHTML = '<span>播放列表</span><small data-mp-count></small>';
      list.parentNode.insertBefore(head, list);
      function updateCount() {
        var total = ap.list.audios ? ap.list.audios.length : 0;
        var cur = ap.list.index != null ? ap.list.index + 1 : 0;
        head.querySelector('[data-mp-count]').textContent = total ? (cur + '/' + total) : '';
      }
      updateCount();
      ap.on('listswitch', updateCount);

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
      } else if (apTries > 100) {
        clearInterval(apTimer);
      }
    }, 300);
  }
})();
