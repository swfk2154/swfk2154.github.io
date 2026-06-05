---
title: 如何搭建Hexo博客
date: 2026-01-29 20:50:20
tags:
---

## 1 安装Node.js


https://nodejs.org/zh-cn


![Node.js](/images/Node.png)

安装这个软件，会同时安装 `node` 和 `npm`这2个工具 

验证一下是否安装成功

```bash
node -v
npm -v
```

如果能输出版本号就安装成功了

## 2 安装 Hexo

我们这里安装的是 `hexo`客户端

安装 `hexo` 需要使用 `npm` 命令，但是在国内使用 `npm` 安装软件，速度很慢

给 `npm` 替换成国内的源，这样安装速度就会快很多了

```bash
npm config set registry https://registry.npmmirror.com 
```

执行下面这条命令，使用 `npm` 安装 `hexo`客户端

```
npm install -g hexo-cli
```

安装好 `hexo` 以后，执行 `hexo init han` 初始化 `han `文件夹（自定义）

然后 `cd han` 进入到文件夹，接着执行 `npm install` 命令安装依赖包

到这里我们的 `hexo` 环境配置就基本完成了


## 使用 Hexo 管理博客

`vscode` 打开 `han` 文件夹

1 `_config.yml`：博客的全局配置文件，网站的名称、描述、作者等，都可以在这里进行设置

2 `source/_post`：存放我们全部的文章，而且 `hexo` 自带了一篇 `demo` 文章 `hello-world`

3 `themes`：博客的主题配置文件，`hexo` 有一个默认主题，但不太好看，后面可以改成漂亮一些的主题

![vscode](/images/vscode.png)

接着我们执行 `hexo generate` 和 `hexo server` 这2条命令，在本地把 `hexo` 服务跑起来

```bash
访问：http://localhost:4000/
```

![预览](/images/Hexoys.png)

## 将博客托管到 GitHub Pages

给`github` 配置 `ssh` 公私钥

```bash
⚠️：ssh-keygen -t rsa -C "your-email@example.com"
```

生成的 `ssh` 公私钥 要指定 自己的 `github`邮箱

把公钥放在`github`上

![ssh](/images/sshgithub.png)

## 博客项目托管到GitHub

首先在 `GitHub` 上创建一个项目，项目名可以设置为 我们的`GitHub用户名.github.io`

![新建库](/images/xm.png)

创建完成后，`GitHub` 给我们列出了一些，快速设置这个仓库的操作指令。我们选择第一种

`git add README.md` 这条命令我们要替换成 `git add .` 来把 `han`文件夹下的全部文件，都暂存到仓库

依次执行命令（在`han` 目录下如：`D:\demo\han`）

![代码](/images/gitdr.png)

以后想更改可以依次执行以下命令`hexo cleanhexo ghexo d`

接下来我们把 `han` 项目，部署到 `GitHub Pages` 上。 这样我们的博客，就不再只是一个本地网站了。其他人也可以通过网络，来访问我们的博客

首先在 han 项目的 `_config.yml` 配置文件中，把 git 服务部署的配置加进去。在 type 配置项这里填上 git，然后分别添加一个 repository 和一个 

branch 配置，指定部署博客网站时，所使用的 GitHub 项目和对应的分支。repository这里填 `git@github.com:GitHub用户名/GitHub仓库名`

branch 这里指定 main 分支，然后保存配置

![配置](/images/main.png)

这里可以更改一下，名称

![名称](/images/mc.png)

运行命令：`hexo clean`,`hexo g`,`hexo d`.