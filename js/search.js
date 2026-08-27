(function () {
  'use strict';

  /* ================= 站内搜索 =================
     索引：/search.json（hexo-generator-searchdb 生成，懒加载）
     匹配：多词 AND 子串匹配；标题 ×5、标签/分类 ×3、正文 ×1
     交互：导航放大镜 / 「/」或 Ctrl+K 唤起，Esc 关闭，↑↓ 选择，Enter 打开 */

  var overlay = document.getElementById('search-overlay');
  if (!overlay) return;

  var input = document.getElementById('search-input');
  var listBox = document.getElementById('search-results');
  var index = null;          // 懒加载的文章索引
  var active = -1;           // 当前键盘选中的结果下标
  var lastItems = [];        // 最近一次渲染的结果（供键盘操作）

  /* ---------- 工具 ---------- */
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 高亮命中词（先转义再包 mark，避免注入）
  function highlight(escapedText, words) {
    var out = escapedText;
    words.forEach(function (w) {
      if (!w) return;
      // 转义后的文本里特殊字符已变形，这里按原文位置匹配会漏；简单做法：对转义串直接做大小写不敏感替换
      var re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      out = out.replace(re, '<mark>$&</mark>');
    });
    return out;
  }

  // 从正文中截取首个命中点附近的摘要
  function snippet(content, words) {
    if (!content) return '';
    var pos = -1;
    for (var i = 0; i < words.length && pos < 0; i++) {
      pos = content.toLowerCase().indexOf(words[i].toLowerCase());
    }
    if (pos < 0) pos = 0;
    var start = Math.max(0, pos - 30);
    var end = Math.min(content.length, start + 110);
    var text = (start > 0 ? '…' : '') + content.slice(start, end).replace(/\s+/g, ' ') + (end < content.length ? '…' : '');
    return highlight(escapeHtml(text), words);
  }

  function relativeUrl(u) {
    // 插件输出的链接可能是绝对地址或 `//slug/` 这类畸形形式，
    // 统一规范成站内相对路径，本地预览与线上均可正确跳转
    if (!u) return '/';
    if (/^https?:\/\//i.test(u)) {
      try { return new URL(u).pathname; } catch (e) { /* fall through */ }
    }
    return '/' + String(u).replace(/^\/+/, '');
  }

  /* ---------- 索引加载 ---------- */
  function loadIndex(cb) {
    if (index) { cb(index); return; }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/search.json', true);
    xhr.onload = function () {
      try {
        index = JSON.parse(xhr.responseText) || [];
      } catch (e) {
        index = [];
      }
      cb(index);
    };
    xhr.onerror = function () { cb([]); };
    xhr.send();
  }

  /* ---------- 搜索 ---------- */
  function splitWords(q) {
    // 中英文混合按空白切词；中文短语整体作为一个词
    return q.trim().split(/\s+/).filter(Boolean);
  }

  function score(post, words) {
    var total = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i].toLowerCase();
      var hitTitle = post.title && post.title.toLowerCase().indexOf(w) > -1;
      var hitTag = (post.tags || []).join(' ').toLowerCase().indexOf(w) > -1 ||
                   (post.categories || []).join(' ').toLowerCase().indexOf(w) > -1;
      var hitBody = post.content && post.content.toLowerCase().indexOf(w) > -1;
      if (!hitTitle && !hitTag && !hitBody) return -1; // AND 语义：一个词没中就淘汰
      total += (hitTitle ? 5 : 0) + (hitTag ? 3 : 0) + (hitBody ? 1 : 0);
    }
    return total;
  }

  function query(words) {
    var result = [];
    for (var i = 0; i < index.length; i++) {
      var s = score(index[i], words);
      if (s > 0) result.push({ post: index[i], s: s });
    }
    result.sort(function (a, b) { return b.s - a.s; });
    return result.map(function (r) { return r.post; });
  }

  /* ---------- 渲染 ---------- */
  function render(posts, words) {
    lastItems = posts.slice(0, 8);
    active = -1;
    if (!lastItems.length) {
      listBox.innerHTML = '<li class="search-empty">没有找到「' + escapeHtml(words.join(' ')) + '」相关的文章</li>';
      return;
    }
    var html = '';
    lastItems.forEach(function (p) {
      html += '<li class="search-item" data-url="' + escapeHtml(relativeUrl(p.url || p.permalink)) + '">' +
        '<div class="search-item__title">' + highlight(escapeHtml(p.title || '无标题'), words) + '</div>' +
        '<div class="search-item__meta">' + escapeHtml([]
          .concat(p.categories || [], p.tags || []).slice(0, 4).join(' · ')) + '</div>' +
        (words.length ? '<div class="search-item__snippet">' + snippet(p.content, words) + '</div>' : '') +
        '</li>';
    });
    listBox.innerHTML = html;
    Array.prototype.forEach.call(listBox.querySelectorAll('.search-item'), function (el) {
      el.addEventListener('click', function () { go(el.getAttribute('data-url')); });
      el.addEventListener('mousemove', function () { setActive(+el.getAttribute('data-i')); });
    });
    // 补 data-i 用于鼠标移动高亮
    Array.prototype.forEach.call(listBox.children, function (el, idx) {
      el.setAttribute('data-i', idx);
    });
  }

  function setActive(i) {
    if (!lastItems.length) return;
    active = (i + lastItems.length) % lastItems.length;
    Array.prototype.forEach.call(listBox.children, function (el, idx) {
      el.classList.toggle('is-active', idx === active);
    });
  }

  function go(url) {
    if (url) window.location.href = url;
  }

  function runSearch() {
    var words = splitWords(input.value);
    loadIndex(function (idx) {
      if (!words.length) {
        // 空查询：显示最近文章（索引本身按日期倒序生成）
        render(idx.slice(0, 8), []);
      } else {
        render(query(words), words);
      }
    });
  }

  /* ---------- 开关与事件 ---------- */
  function open() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    input.value = '';
    runSearch(); // 无词时展示最近文章
    input.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest ? e.target.closest('[data-search-open]') : null;
    if (opener) { open(); return; }
    if (e.target.closest('[data-search-close]')) { close(); return; }
    if (e.target === overlay) { close(); }
  });

  document.addEventListener('keydown', function (e) {
    var typingElsewhere = /^(input|textarea|select)$/i.test(document.activeElement.tagName) &&
                         !overlay.contains(document.activeElement);
    if ((e.key === '/' && !typingElsewhere && overlay.hidden) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      open();
      return;
    }
    if (overlay.hidden) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') {
      var el = listBox.children[active > -1 ? active : 0];
      go(el ? el.getAttribute('data-url') : null);
    }
  });

  // 输入防抖触发搜索
  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 120);
  });
})();
