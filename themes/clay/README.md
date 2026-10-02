# Clay —— 粘土拟态风格 Hexo 主题

一个为 Hexo 博客设计的「粘土拟态」（Claymorphism）+ 液态玻璃风格的轻量主题。
视觉语言参考 [clay-blog](https://github.com/laogou717/clay-blog)：

- 暖纸底色（`#f8f7f4`）+ 陶土点缀色（`#b0532b`）
- 圆角 + 柔和分层阴影 + 墨色渐变标题
- 液态玻璃（backdrop-filter）导航胶囊
- 排版式文章列表（日期 · 标题 · 分类，无卡片堆砌）
- 明 / 暗双主题，随系统或手动切换

## 功能

- 首页：Hero（头像 / 简介 / 社交按钮）+「精选」大图推荐 + 最新文章列表
- 文章页：目录（TOC）侧栏、代码复制、阅读进度、图片灯箱、标签、上一篇/下一篇、打赏、Gitalk 评论
- 归档（按年份分组）、分类、标签、关于、联系、404
- 右下角悬浮音乐播放器（网易云 / QQ音乐 等多源，APlayer + Meting，点开面板切换）
- RSS、SEO（Open Graph / canonical / keywords）、不蒜子访问统计
- 滚动入场动画、回到顶部、`prefers-reduced-motion` 无障碍降级
- 纯 CSS + 原生 JS，无 jQuery / 图标字体 / 外部字体依赖

## 目录结构

```
themes/clay/
├── _config.yml                 # 主题配置
├── layout/
│   ├── layout.ejs              # 基础外壳（head / nav / footer / scripts）
│   ├── index.ejs               # 首页
│   ├── post.ejs                # 文章页
│   ├── page.ejs                # 通用页面兜底
│   ├── archive.ejs             # 归档
│   ├── category.ejs / categories.ejs
│   ├── tag.ejs / tags.ejs
│   ├── about.ejs / contact.ejs / 404.ejs
│   └── _partial/               # head、nav、footer、post-row、pagination、toc、scripts
├── source/
│   ├── css/clay.css            # 设计系统（明/暗主题变量）
│   ├── js/clay.js              # 主题切换、动画、代码复制等
│   └── images/clay-avatar.svg  # 默认头像
└── README.md
```

## 配置

编辑 `themes/clay/_config.yml`：

| 字段 | 说明 |
| --- | --- |
| `menu` | 顶部导航（name / url） |
| `avatar` | 头像路径（可换成 `/medias/xxx.png`） |
| `eyebrow` / `greeting` / `bio` | 首页 Hero 的小字 / 大标题 / 简介 |
| `social.github` / `social.email` / `social.rss` | 社交按钮，留空不显示 |
| `featured.count` | 首页「精选」最多展示几篇 |
| `toc.enable` / `toc.max_depth` | 文章目录（max_depth: 3 = h2~h4） |
| `code.copy` | 代码块「复制」按钮 |
| `reward.*` | 打赏二维码（wechat / alipay 图片路径） |
| `comments.giscus.*` | giscus 评论（repo / repoId / category / categoryId，基于 GitHub Discussions，无需 secret） |
| `music.*` | 悬浮音乐播放器：`enable` 开关、`sources` 音乐源列表（name / server / type / id） |
| `footer.since` / `footer.busuanzi` / `footer.icp` | 页脚年份 / 访问统计 / 备案 |
| `about.career` / `about.intro` | 关于页信息 |

## 文章 front-matter

主题兼容你现有的 front-matter，无需改动：

```yaml
---
title: 标题
date: 2026-06-24 11:59:59
updated: 2026-06-24 11:59:59
categories: 安全          # 或 - 列表
tags: [护网, 蓝队]        # 或 - 列表
summary: 摘要             # 列表页描述（可选）
img: /images/cover.png    # 封面图（可选，支持 coverImg / img / cover）
top: true                 # 置顶，进入首页「精选」（可选）
coverImg: /images/x.png   # matery 兼容：封面图
---
```

> `cover: true` 是 matery 的布尔标记（表示进入轮播），本主题会忽略它，封面优先取
> `coverImg`，其次 `img`。封面缺失时自动使用陶土渐变占位，不会出现裂图。

## 使用

主题已配置为当前站点主题（根目录 `_config.yml` 的 `theme: clay`）。

```bash
npm run clean    # 清空
npm run build    # 生成到 public/
npm run server   # 本地预览 http://localhost:4000
```

切回旧主题：把根目录 `_config.yml` 的 `theme:` 改回 `hexo-theme-matery` 即可。

## 说明

- 头像默认是主题内置的盾牌 SVG（`/images/clay-avatar.svg`），可换成自己的图片。
- 评论默认启用 giscus，指向 `swfk2154/swfk2154.github.io` 的 Discussions；
  不需要可在 `_config.yml` 把 `comments.giscus.enable` 改为 `false`。
  前提：仓库开启 Discussions 功能并安装 [giscus App](https://github.com/apps/giscus)。
- 不蒜子统计默认开启，可在 `footer.busuanzi` 关闭。
