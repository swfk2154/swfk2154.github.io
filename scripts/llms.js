/*
 * llms.txt 生成脚本（Hexo generator）
 * ------------------------------------------------
 * llms.txt 是面向大语言模型（GPT / Claude / Perplexity / Copilot 等）的
 * "本站导航清单"，让 AI 爬虫一份文件就能读懂站点有哪些内容。
 * 本脚本挂在 hexo 的 generator 上，每次 `hexo generate` 都会重新生成，
 * 文章增删自动同步，无需手工维护。产物输出到站点根目录 public/llms.txt。
 *
 * 规范参考：https://llmstxt.org
 */
'use strict';

const MAX_DESC = 160;

// 从 post 里提取一段干净的纯文本摘要（优先 description，其次 keywords，最后正文首段）
function pickDescription(post) {
  const data = post.data || {};
  let text = data.description || data.excerpt_text || data.keywords || '';

  if (!text) {
    // 去掉 front-matter、markdown 标记、html 标签，取正文前段
    let body = String(post.content || post.raw || data.content || '');
    body = body.replace(/---[\s\S]*?---/, '');           // front-matter
    body = body.replace(/```[\s\S]*?```/g, ' ');         // 代码块
    body = body.replace(/<[^>]+>/g, ' ');                // html 标签
    body = body.replace(/!?\[[^\]]*\]\([^)]*\)/g, ' ');  // 图片 / 链接语法
    body = body.replace(/[#>*_`~\-]+/g, ' ');            // markdown 符号
    body = body.replace(/\s+/g, ' ').trim();
    text = body;
  }

  text = String(text).replace(/\s+/g, ' ').trim();
  if (text.length > MAX_DESC) text = text.slice(0, MAX_DESC).replace(/\s+\S*$/, '') + '…';
  return text;
}

// 取文章的绝对 URL（permalink 已含 config.url + /title/）
function absUrl(post) {
  let url = post.permalink || '';
  if (!url && post.path) url = new URL(post.path, hexo.config.url + '/').href;
  return url.replace(/index\.html$/, '');
}

hexo.extend.generator.register('llms_txt', function (locals) {
  const cfg = hexo.config;
  const posts = (locals.posts && locals.posts.data) ? locals.posts.data : (locals.posts || []);

  const lines = [];

  // —— 站点标题 + 摘要 ——
  lines.push(`# ${cfg.title || 'Blog'}`);
  lines.push('');
  const summary = [
    cfg.description,
    cfg.subtitle ? `主题方向：${cfg.subtitle}` : '',
  ].filter(Boolean).join(' ');
  lines.push(`> ${summary || cfg.title}`);
  lines.push('');
  lines.push(`- 站点：<${cfg.url}>`);
  if (cfg.author) lines.push(`- 作者：${cfg.author}`);
  if (cfg.keywords) lines.push(`- 关键词：${String(cfg.keywords).replace(/,\s*/g, '、')}`);
  lines.push(`- 语言：${cfg.language || 'zh-CN'}`);
  lines.push('');
  lines.push(
    '本站是一个记录 AI 安全 / 网络安全 / 大模型安全与工程实践的个人技术博客，' +
    '以下按分类列出全部文章，链接均指向对应文章页，可直接抓取正文。'
  );
  lines.push('');

  // —— 按分类分组（无分类归入「其他」）——
  const groups = new Map();
  for (const post of posts) {
    if (post.draft) continue;
    const cats = (post.categories && post.categories.data) ? post.categories.data : [];
    const key = cats.length ? cats[0].name : '其他';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  }

  // 分类名排序：数量多的在前，稳定输出
  const sortedKeys = [...groups.keys()].sort((a, b) => {
    const diff = groups.get(b).length - groups.get(a).length;
    return diff !== 0 ? diff : a.localeCompare(b, 'zh');
  });

  for (const key of sortedKeys) {
    lines.push(`## ${key}`);
    lines.push('');
    const list = groups
      .get(key)
      .slice()
      .sort((a, b) => (b.date || 0) - (a.date || 0)); // 新→旧
    for (const post of list) {
      const title = (post.data && post.data.title) || post.title || '(未命名)';
      const url = absUrl(post);
      const desc = pickDescription(post);
      lines.push(desc ? `- [${title}](${url}): ${desc}` : `- [${title}](${url})`);
    }
    lines.push('');
  }

  // —— 关键静态页面 ——
  const pages = (locals.pages && locals.pages.data) ? locals.pages.data : [];
  const important = pages.filter((p) => {
    const slug = (p.path || '').replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/^\//, '');
    return ['about', 'archives', 'categories', 'tags'].includes(slug);
  });
  const PAGE_LABELS = {
    about: '关于作者',
    archives: '文章归档',
    categories: '全部分类',
    tags: '全部标签',
  };
  if (important.length) {
    lines.push('## 站点页面');
    lines.push('');
    for (const p of important) {
      const url = (p.permalink || '').replace(/index\.html$/, '');
      const slug = (p.path || '').replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/^\//, '');
      const name = (p.data && p.data.title) || PAGE_LABELS[slug] || slug;
      lines.push(`- [${name}](${url})`);
    }
    lines.push('');
  }

  const content = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  return { path: 'llms.txt', data: content };
});
