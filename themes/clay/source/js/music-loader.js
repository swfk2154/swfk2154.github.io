/* =====================================================================
   音乐多源容灾加载器（APlayer 原生模式）
   依次探测候选 Meting API，第一个返回有效歌单的胜出；
   用拿到的数据直接 new APlayer，不再二次请求，节省中转配额。
   全部失效时在挂载点显示占位提示，面板/按钮保持可用。
   ===================================================================== */
(function () {
  'use strict';

  var cfg = window.__CLAY_MUSIC__;
  if (!cfg || !cfg.apis || !cfg.apis.length || !cfg.sources || !cfg.sources.length) return;

  var registry = window.__CLAY_APLAYER__ = [];

  function buildUrl(api, source) {
    return api
      .replace(':server', encodeURIComponent(source.server))
      .replace(':type', encodeURIComponent(source.type))
      .replace(':id', encodeURIComponent(source.id));
  }

  function fetchPlaylist(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        reject(new Error('timeout'));
      }, timeoutMs);
      fetch(url, { referrerPolicy: 'no-referrer' }).then(function (res) {
        if (done) return null;
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (data) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(data);
      }).catch(function (err) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  function validList(data) {
    return Array.isArray(data) && data.length > 0 &&
      typeof data[0] === 'object' && data[0] !== null &&
      !!(data[0].title || data[0].name);
  }

  /* meting 字段 {title,author,url,pic,lrc} -> APlayer {name,artist,url,cover,lrc} */
  function toAudios(items) {
    return items.map(function (it) {
      return {
        name: it.title || it.name || '未知曲目',
        artist: it.author || it.artist || '',
        url: it.url || '',
        cover: it.pic || it.cover || '',
        lrc: it.lrc || ''
      };
    });
  }

  function showEmpty(mount) {
    mount.innerHTML = '<p class="music-player__empty">音乐中转服务暂时不可用，请稍后再试。</p>';
  }

  async function bootSource(index, source) {
    var mount = document.querySelector('[data-ap-mount="' + index + '"]');
    if (!mount) return null;

    for (var i = 0; i < cfg.apis.length; i++) {
      var api = cfg.apis[i];
      try {
        var data = await fetchPlaylist(buildUrl(api, source), 9000);
        if (!validList(data)) throw new Error('invalid list');

        if (typeof APlayer !== 'function') throw new Error('APlayer missing');
        mount.innerHTML = '';
        var player = new APlayer({
          container: mount,
          audio: toAudios(data),
          fixed: false,
          mini: false,
          autoplay: !!cfg.autoplay,
          order: cfg.order === 'random' ? 'random' : 'list',
          listMaxHeight: cfg.listMaxHeight || '320px',
          preload: 'none',
          mutex: true,
          theme: '#b0532b'
        });
        registry[index] = player;
        return player;
      } catch (err) {
        if (window.console && console.warn) {
          console.warn('[clay-music] api failover:', api, err && err.message);
        }
      }
    }
    showEmpty(mount);
    return null;
  }

  function boot() {
    var tasks = cfg.sources.map(function (source, i) {
      return bootSource(i, source);
    });
    Promise.all(tasks).catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
