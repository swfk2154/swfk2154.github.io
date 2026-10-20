# swfk 的安全笔记

基于 [Hexo](https://hexo.io/) 的个人博客，记录 AI 安全、网络安全与工程实践。
线上地址：<https://blogbu2154.site>

> 🌐 **在线阅读：<https://blogbu2154.site>** ｜ 关注 AI 安全 / 网络安全 / 大模型安全 / 渗透测试 / 护网攻防 的技术笔记与实战复盘。

## 站点概况

- **主题**：`themes/clay` —— 自研「粘土拟态」风格主题（暖纸底色、陶土点缀、明暗双主题）
- **内容**：`source/_posts/` 下的 Markdown 文章，全部通过 `permalink` 固定英文短链
- **语雀笔记系列**：整理自个人语雀知识库「2025 kls 网络安全」，按
  网络安全 → Web 安全 / 内网渗透 / 移动安全 / 安全运营 / 面试实战
  的层级分类收纳（分类页按父子层级展示）
- **评论**：giscus（基于 GitHub Discussions）
- **站内搜索**：`hexo-generator-searchdb` 生成 `/search.json` 索引，前端懒加载匹配
- **SEO / 收录**：sitemap / baidusitemap / RSS(atom) / robots.txt / Google & Bing 站点验证；
  自动生成面向大模型的 `llms.txt`（`scripts/llms.js`）；IndexNow 秒级推送 Bing/AI（`tools/indexnow-push.js`）；
  百度主动推送脚本（`tools/baidu-push.js`，可选）

## 常用命令

```bash
# 本地预览（http://localhost:4000）
hexo clean && hexo server

# 生成静态页面到 public/（仅本地预览用）
hexo generate        # 简写 hexo g

# 发布上线：把源码推到 source 分支，Cloudflare Pages 自动构建部署
git add -A && git commit -m "post: 文章标题"
git push             # 已配置 push.default=upstream，推到 origin/source
```

> 部署链路：`source 分支` → Cloudflare Pages（`npm run build`，输出 `public`）→
> `blogbu2154.site` / `www.blogbu2154.site`。
> `hexo deploy` 已不再需要；若仍执行，产物会 force push 到 `main` 分支（仅作 GitHub Pages 备份，不参与线上发布）。

## 目录结构

```
├── _config.yml            # Hexo 全局配置（站点信息/URL/插件/部署）
├── themes/clay/           # 自研主题（layout 模板 + css/js 静态资源）
├── source/
│   ├── _posts/            # 博客文章（Markdown）
│   ├── about|contact|tags|categories/   # 独立页面
│   ├── images/medias/     # 图片资源
│   └── icon.png           # RSS 图标 / apple-touch-icon
├── scaffolds/post.md      # 新建文章模板（hexo new 时套用）
└── .verify/               # 本地 UI 检查截图（已 gitignore，不入库）
```

## 写作流程

```bash
hexo new "文章标题"       # 在 source/_posts/ 创建文章骨架
# 编辑 front-matter：permalink 固定短链、tags/categories、img 封面
hexo clean && hexo s      # 本地预览确认
```

> 注意：`_config.yml` 中 `url` 与 `deploy.repo` 已绑定自定义域名 blogbu2154.site，
> 修改域名时需同步更新 `source/CNAME`。

## 让搜索引擎与 AI 收录本站

技术地基（sitemap / robots / 验证文件 / llms.txt）仓库里都已就绪，剩下的主要是「提交」与「外链信任」：

1. **Google Search Console**（<https://search.google.com/search-console>）
   - 验证站点（域名属性最佳，需在 DNS 加 TXT；文件验证用仓库里的 `googlef6796c*.html` 亦可）
   - `Sitemaps` 提交 `https://blogbu2154.site/sitemap.xml`
   - `网址检查` 逐条对首页与重点文章点「请求编索引」
2. **Bing Webmaster Tools**（<https://bingwebmasters.microsoft.com>）
   - 站点与 `sitemap.xml` 已提交并在正常抓取（已发现 400+ URL）。
   - ⚠️ Bing 索引供 ChatGPT 搜索 / Copilot / DuckDuckGo / 多数 AI 使用，**想被 AI 搜到这条最关键**。
3. **IndexNow（推荐给 Bing/AI 的秒级推送，本仓库已配好）**
   - 密钥文件已放在 `source/9dd80d14ed52001ca4926eb6f79c2552.txt`，部署后线上地址为
     `https://blogbu2154.site/9dd80d14ed52001ca4926eb6f79c2552.txt`（IndexNow 靠它校验 key 属于本站，**必须先部署再推送**）。
   - 每次发/改文章后，先部署再推送：

     ```bash
     npm run deploy:push        # clean + generate + deploy + IndexNow 推送
     # 或站点已上线、只想重推：
     npm run indexnow:push
     ```
   - 一次提交即同步给 Bing / Yandex / Seznam / Naver。
   - 若本机直连 `api.indexnow.org` 被代理/防火墙拦截，加环境变量走代理：
     `set INDEXNOW_PROXY=http://127.0.0.1:7897`（PowerShell 用 `$env:INDEXNOW_PROXY="..."`），脚本会自动经代理提交。
4. **百度（可选，暂不启用）**：如需再开，去 <https://ziyuan.baidu.com> 拿 API token，
   放进 `.baidu-token` 后 `npm run baidu:push`。
5. **llms.txt**：`scripts/llms.js` 会在每次 `hexo generate` 时自动生成站点根目录的
   `llms.txt`，供大模型爬虫读取全站文章清单，文章增删自动同步，无需手工维护。
6. **外链**：新域名信任度低，在 GitHub 主页/README、掘金、CSDN、知乎、V2EX 等处放博客链接，
   是提升收录与排名最有效的杠杆。
7. **验证是否收录**：在 Google / Bing 搜 `site:blogbu2154.site`，能看到页面数持续增长即生效。
   Google 一般数天到数周，需耐心。
