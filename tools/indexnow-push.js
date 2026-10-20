/*
 * IndexNow 推送脚本（Bing / Yandex / Seznam / Naver 等共享）
 * ------------------------------------------------
 * IndexNow 让搜索引擎（尤其是 Bing——ChatGPT 搜索 / Copilot / DuckDuckGo 的数据源）
 * 在你发布或更新文章后「秒级」收到 URL 通知，不必等爬虫慢慢发现。
 * 协议文档：https://www.indexnow.org
 *
 * 前置（本仓库已配好，无需去 Bing 控制台拿 key）：
 *   1) 密钥文件已放在 source/9dd80d14ed52001ca4926eb6f79c2552.txt
 *      —— 部署后线上地址为 https://www.blogbu2154.site/9dd80d14ed52001ca4926eb6f79c2552.txt
 *      IndexNow 服务器会抓取该文件来验证 key 属于本站，因此必须先部署再推送。
 *   2) 密钥值同时写在脚本同目录的 .indexnow-key（可选）；默认用上面文件名里的 key。
 *
 * 运行：
 *   hexo g && hexo d          # 先生成并部署，让密钥文件上线
 *   node tools/indexnow-push.js
 *   或  npm run indexnow:push （见 package.json）
 *
 * 说明：默认读取 public/sitemap.xml 里的全部 URL 一次性提交（IndexNow 单次上限 10000 条）。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFile } = require('child_process');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const HOST = 'www.blogbu2154.site';
const KEY = '9dd80d14ed52001ca4926eb6f79c2552';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
// 可选：走本地代理（这台机器直连 api.indexnow.org 会被代理拦截时很有用）
// 用法：set INDEXNOW_PROXY=http://127.0.0.1:7897  或 HTTPS_PROXY 同名亦可
const PROXY = (process.env.INDEXNOW_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || '').trim();

function readUrlsFromSitemap() {
  const p = path.join(ROOT, 'public', 'sitemap.xml');
  if (!fs.existsSync(p)) {
    console.error('❌ 找不到 public/sitemap.xml，请先执行：hexo generate');
    process.exit(1);
  }
  const xml = fs.readFileSync(p, 'utf8');
  const urls = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) urls.push(m[1].trim());
  return Array.from(new Set(urls));
}

function buildPayload(urlList) {
  return JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  });
}

function submitViaProxy(payload) {
  return new Promise((resolve, reject) => {
    const curl = execFile(
      'curl',
      [
        '-s', '-o', '-', '-w', '\n%{http_code}',
        '--max-time', '40',
        '-x', PROXY,
        '-X', 'POST', 'https://api.indexnow.org/indexnow',
        '-H', 'Content-Type: application/json; charset=utf-8',
        '--data-binary', '@-',
      ],
      (err, stdout) => {
        if (err) return reject(err);
        const idx = stdout.lastIndexOf('\n');
        const body = idx >= 0 ? stdout.slice(0, idx) : stdout;
        const status = parseInt((idx >= 0 ? stdout.slice(idx + 1) : stdout).trim(), 10) || 0;
        resolve({ status, body });
      }
    );
    curl.stdin.write(payload);
    curl.stdin.end();
  });
}

function submitDirect(payload) {
  return new Promise((resolve, reject) => {
    const u = new URL('https://api.indexnow.org/indexnow');
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('请求超时（20s）')));
    req.write(payload);
    req.end();
  });
}

function submitIndexNow(urlList) {
  const payload = buildPayload(urlList);
  return PROXY ? submitViaProxy(payload) : submitDirect(payload);
}

(async function main() {
  const urls = readUrlsFromSitemap();
  console.log(`站点：${HOST}`);
  console.log(`从 sitemap.xml 读取到 ${urls.length} 个 URL，提交 IndexNow…\n`);

  const CHUNK = 10000;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const batch = urls.slice(i, i + CHUNK);
    try {
      const res = await submitIndexNow(batch);
      // IndexNow 成功返回 200（全部接收）或 202（部分接收）
      if (res.status === 200 || res.status === 202) {
        console.log(`  ✅ 批次 ${i / CHUNK + 1}: HTTP ${res.status}，已提交 ${batch.length} 条`);
      } else {
        console.log(`  ⚠️ 批次 ${i / CHUNK + 1}: HTTP ${res.status} → ${res.body.slice(0, 300)}`);
        if (res.status === 403) {
          console.log('     403 通常是密钥文件还没上线：请先 hexo d 部署，再重跑本脚本。');
        }
      }
    } catch (err) {
      console.error(`  ❌ 批次 ${i / CHUNK + 1} 失败：${err.message}`);
    }
  }
  console.log('\n完成。Bing / Yandex / Seznam / Naver 会共享这批 URL（ChatGPT 搜索等基于 Bing 索引）。');
})();
