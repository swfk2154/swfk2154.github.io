/*
 * 百度「主动推送（实时）」脚本
 * ------------------------------------------------
 * 百度对 sitemap 抓取很懒，官方推荐的加速方式是「主动推送」：
 * 每次发新文章 / 部署后，把 URL 直接 POST 给百度接口，最快当天进索引。
 * 接口文档：https://ziyuan.baidu.com/college/article/knowledge?id=325
 *
 * 使用前置：
 *   1) 登录 https://ziyuan.baidu.com → 站点管理 → 你的站点 → 资源提交 → 普通收录 → API 提交
 *      复制那串 token（形如 1234567890abcdef）。
 *   2) 三种提供 token 的方式（任选其一）：
 *        - 环境变量：  set BAIDU_PUSH_TOKEN=你的token   (Windows CMD)
 *                      $env:BAIDU_PUSH_TOKEN="你的token" (PowerShell)
 *        - 命令行参数： node tools/baidu-push.js 你的token
 *        - 本地文件：   在项目根目录新建 .baidu-token，内容就是 token（记得加进 .gitignore）
 *
 * 运行：
 *   hexo g && node tools/baidu-push.js
 *   或  npm run baidu:push   （见 package.json 脚本）
 *
 * 说明：脚本默认读取生成好的 public/sitemap.xml，保证推送 URL 与站点实际链接完全一致。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');

function readToken() {
  if (process.argv[2]) return process.argv[2].trim();
  if (process.env.BAIDU_PUSH_TOKEN) return process.env.BAIDU_PUSH_TOKEN.trim();
  const tokenFile = path.join(ROOT, '.baidu-token');
  if (fs.existsSync(tokenFile)) return fs.readFileSync(tokenFile, 'utf8').trim();
  return '';
}

function readSiteFromConfig() {
  // 从 _config.yml 里解析 url，拿到站点域名（不含协议）
  try {
    const cfg = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8');
    const m = cfg.match(/^url:\s*(\S+)/m);
    if (m) return new URL(m[1]).host;
  } catch (_) { /* ignore */ }
  return '';
}

function readUrlsFromSitemap() {
  const sitemapPath = path.join(ROOT, 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ 找不到 public/sitemap.xml，请先执行：hexo generate');
    process.exit(1);
  }
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) urls.push(m[1].trim());
  return Array.from(new Set(urls));
}

function pushBatch(site, token, urls) {
  return new Promise((resolve, reject) => {
    const endpoint = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(site)}&token=${encodeURIComponent(token)}`;
    const u = new URL(endpoint);
    const body = urls.join('\n');
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(data); } catch (_) { /* non-json error page */ }
          resolve({ status: res.statusCode, raw: data, json });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('请求超时（20s）')));
    req.write(body);
    req.end();
  });
}

(async function main() {
  const token = readToken();
  if (!token) {
    console.error('❌ 未找到百度推送 token。请用以下任一方式提供：');
    console.error('   • node tools/baidu-push.js <token>');
    console.error('   • 设置环境变量 BAIDU_PUSH_TOKEN');
    console.error('   • 在项目根目录创建 .baidu-token 文件');
    console.error('   获取位置：百度站长平台 → 资源提交 → 普通收录 → API 提交');
    process.exit(1);
  }

  const site = readSiteFromConfig();
  if (!site) {
    console.error('❌ 无法从 _config.yml 解析站点域名（url 字段）。');
    process.exit(1);
  }

  const urls = readUrlsFromSitemap();
  console.log(`站点：${site}`);
  console.log(`从 sitemap.xml 读取到 ${urls.length} 个 URL，准备推送百度…\n`);

  const CHUNK = 500;
  let successTotal = 0;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const batch = urls.slice(i, i + CHUNK);
    try {
      const res = await pushBatch(site, token, batch);
      if (res.json && (res.json.success || res.json.success === 0)) {
        const ok = res.json.success || 0;
        successTotal += ok;
        console.log(`  批次 ${i / CHUNK + 1}: 成功推送 ${ok} 条` +
          (res.json.remaining !== undefined ? `，今日剩余配额 ${res.json.remaining} 条` : ''));
        if (res.json.error) console.log('    接口返回错误：', JSON.stringify(res.json.error));
      } else {
        console.log(`  批次 ${i / CHUNK + 1}: HTTP ${res.status} → ${res.raw.slice(0, 300)}`);
      }
    } catch (err) {
      console.error(`  批次 ${i / CHUNK + 1} 推送失败：${err.message}`);
    }
  }

  console.log(`\n✅ 完成。本次累计推送成功 ${successTotal} 条。`);
  console.log('   提示：主动推送有每日配额，若只推送成功一部分属正常，新文章优先推即可；');
  console.log('   可把 `hexo g && node tools/baidu-push.js` 接到每次部署之后自动执行。');
})();
