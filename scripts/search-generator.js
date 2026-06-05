'use strict';

const escapeXml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

hexo.extend.generator.register('local-search-xml', function (locals) {
  const posts = locals.posts.sort('-date').filter((post) => post.published !== false);
  const items = posts.map((post) => {
    const content = String(post.content || post.excerpt || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return [
      '<entry>',
      `<title>${escapeXml(post.title)}</title>`,
      `<url>${escapeXml(this.config.root + post.path)}</url>`,
      `<content>${escapeXml(content)}</content>`,
      '</entry>'
    ].join('');
  }).join('');

  return {
    path: 'search.xml',
    data: `<?xml version="1.0" encoding="utf-8"?><search>${items}</search>`
  };
});
