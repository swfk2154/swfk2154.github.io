---
title: 如何搭建 Hexo 博客 - 完整教程
date: 2026-01-29 20:50:20
tags:
  - Hexo
  - 博客
  - GitHub Pages
---

> ⚠️ **说明**：本文由本人原创编写，手把手教你搭建 Hexo 博客。

> 📚 **配套阅读**：[如何搭建 OpenClaw](/2026/03/19/如何搭建OpenClaw/)

---

Hexo 是一个**快速、简洁且高效的博客框架**，基于 Node.js 开发。本教程将带你从零开始搭建自己的博客。

---

## 1. 安装 Node.js

Hexo 基于 Node.js 运行，所以首先需要安装 Node.js。

### 下载安装

访问 Node.js 官网：https://nodejs.org/zh-cn

下载 **LTS 长期支持版**（推荐 20.x 或 22.x）

安装过程中会同时安装：
- `node` - Node.js 运行环境
- `npm` - Node.js 包管理器

### 验证安装

```bash
# 查看 Node.js 版本
node -v
# 查看 npm 版本
npm -v
```

如果能输出版本号，说明安装成功 ✅

---

## 2. 安装 Hexo

Hexo 是一个命令行工具，通过 npm 安装。

### 配置国内镜像（可选但推荐）

```bash
# 替换为国内镜像源，加速下载
npm config set registry https://registry.npmmirror.com
```

### 安装 Hexo CLI

```bash
# 全局安装 Hexo 命令行工具
npm install -g hexo-cli
```

### 初始化博客项目

```bash
# 初始化博客文件夹（han 是文件夹名，可自定义）
hexo init han

# 进入文件夹
cd han

# 安装依赖包
npm install
```

现在 Hexo 环境配置完成！🎉

---

## 3. 博客目录结构

用 VS Code 打开 `han` 文件夹，看看有哪些内容：

| 文件/文件夹 | 说明 |
|------------|------|
| `_config.yml` | 博客全局配置文件（网站名称、描述、作者等） |
| `source/_posts` | 存放博客文章（Markdown 文件） |
| `themes` | 博客主题文件夹 |
| `public` | 生成的静态网站（部署时自动生成） |

> ⚠️ **注意**：`source/_posts` 下会有一篇默认文章 `hello-world.md`，可以删除它。

---

## 4. 本地预览

在博客目录下执行：

```bash
# 生成静态网页
hexo generate
# 或简写
hexo g

# 启动本地服务器
hexo server
# 或简写
hexo s
```

然后打开浏览器访问：http://localhost:4000/

就能看到你的博客啦！🎊

---

## 5. 部署到 GitHub Pages

让其他人也能通过网络访问你的博客。

### 5.1 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击 **New repository** 创建新仓库
3. 仓库名设置为：`你的用户名.github.io`
   - 例如：`swfk2154.github.io`

### 5.2 配置 SSH 公钥（可选）

如果你不想每次部署都输入密码，可以配置 SSH：

```bash
# 生成 SSH 密钥（替换为你的邮箱）
ssh-keygen -t rsa -C "your-email@example.com"
```

然后把公钥内容添加到 GitHub → Settings → SSH Keys。

### 5.3 配置 Hexo 部署

编辑 `_config.yml`，在末尾添加：

```yaml
deploy:
  type: git
  repo: git@github.com:你的用户名/你的仓库名.git
  branch: main
```

例如：

```yaml
deploy:
  type: git
  repo: git@github.com:swfk2154/swfk2154.github.io.git
  branch: main
```

### 5.4 一键部署

```bash
# 清理缓存 + 生成 + 部署
hexo clean && hexo g -d
# 或分步执行
hexo clean
hexo generate
hexo deploy
```

部署完成后，访问 `https://你的用户名.github.io` 就能看到博客啦！

---

## 6. 写作指南

### 创建新文章

```bash
hexo new "文章标题"
```

这会在 `source/_posts/` 下创建一个 Markdown 文件。

### 写作格式

```markdown
---
title: 文章标题
date: 2026-01-29 20:50:20
tags:
  - 标签1
  - 标签2
---

正文内容...
```

---

## 7. 常见问题

### Q: 部署后页面是 404？

检查 `_config.yml` 中的 `url` 配置是否正确：

```yaml
url: https://你的用户名.github.io
```

### Q: 图片显示不出来？

把图片放在 `source/images/` 目录下，引用时用：

```markdown
![图片描述](/images/图片名.png)
```

### Q: 想换主题怎么办？

去 [Hexo 主题市场](https://hexo.io/themes/) 下载主题，解压到 `themes/` 目录下，然后修改 `_config.yml` 中的 `theme` 配置。

---

## 8. 进阶优化

### 安装必备插件

```bash
# SEO 优化
npm install hexo-generator-sitemap hexo-generator-baidu-sitemap --save

# 评论系统
npm install gitalk --save
```

### 常用命令速查

| 命令 | 说明 |
|------|------|
| `hexo new "标题"` | 创建新文章 |
| `hexo g` | 生成静态网页 |
| `hexo s` | 启动本地服务器 |
| `hexo clean` | 清理缓存 |
| `hexo d` | 部署到 GitHub |
| `hexo g -d` | 生成并部署 |

---

有问题欢迎在评论区留言！ Happy Blogging! 🚀🐨
