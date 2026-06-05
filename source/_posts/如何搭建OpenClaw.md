---
title: 如何搭建 OpenClaw
date: 2026-03-19 13:16:00
updated: 2026-03-19 13:16:00
tags:
  - OpenClaw
  - AI助手
  - 部署
  - Node.js
categories:
  - 工具实践
keywords: OpenClaw, AI助手, 部署教程, Node.js, MiniMax, 自托管
summary: 从零开始搭建 OpenClaw AI 助手网关，覆盖 PowerShell 一键安装、npm 手动安装、WSL2 部署三种方式，附 MiniMax API Key 配置和常见问题排查。
img: /medias/featureimages/8.jpg
---

> ⚠️ **重要声明**：以下内容主要由 OpenClaw（AI）生成，综合了官方文档和中文社区教程，**部分命令和步骤未经我本人逐一实测验证**。执行前请务必：
> 1. 在 [OpenClaw 官方渠道](https://openclaw.ai/docs) 核实命令
> 2. 执行远程 PowerShell 脚本前，**先下载审查脚本内容**
> 3. 不要在生产环境或含有敏感数据的机器上直接运行
>
> 参考来源：OpenClaw 官方文档、博客园 - 陈晓猛

---

## 什么是 OpenClaw？

OpenClaw 是一个**自托管的 AI 助手网关**，可以连接多个聊天平台（WhatsApp、Telegram、Discord、飞书等）到 AI 编程助手。你只需要在一台电脑上运行 Gateway，就能随时随地通过手机发消息跟 AI 对话。

**特点：**
- 多平台支持：一个 Gateway 同时服务多个聊天软件
- 自托管：数据掌握在自己手里
- 支持语音和摄像头（需要配对手机节点）
- 开源免费

---

## 1. 环境准备

### 安装 Node.js

> ⚠️ **Windows 用户注意**：官方文档建议在 **WSL2** 下运行 OpenClaw，Windows 原生支持相对不完善。

OpenClaw 需要 **Node.js 22+ LTS**（推荐 Node.js 24）。

下载安装：https://nodejs.org/zh-cn

验证安装：
```bash
# 查看 Node.js 版本
node -v
# 查看 npm 版本
npm -v
```

### 更换 npm 镜像源（国内加速）

```bash
npm config set registry https://registry.npmmirror.com
```

---

## 2. 安装 OpenClaw

### 方式一：PowerShell 一键脚本（新手推荐）

#### 步骤 1：打开 PowerShell

- 开始菜单搜索 **PowerShell** → 右键 → **以管理员身份运行**

#### 步骤 2：修改执行策略

```powershell
# 允许 PowerShell 执行本地脚本
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

提示时输入 `Y` 并回车确认。

#### 步骤 3：执行一键安装脚本

<details>
<summary>官方脚本（海外网络）</summary>

```powershell
# 一键安装 OpenClaw
iwr -useb https://openclaw.ai/install.ps1 | iex
```

</details>

<details>
<summary>国内加速脚本（推荐）</summary>

```powershell
# 国内镜像加速
iwr -useb https://open-claw.org.cn/install-cn.ps1 | iex
```

</details>

> ⚠️ 首次运行可能会被安全软件拦截，建议临时关闭杀毒软件。

> 🔒 **安全建议**：执行远程脚本前，建议先下载脚本到本地审查内容：
> ```powershell
> # 下载脚本到本地审查后再执行
> iwr -useb https://openclaw.ai/install.ps1 -OutFile install.ps1
> # 用编辑器打开 install.ps1 审查内容
> # 确认无误后再执行
> .\install.ps1
> ```

#### 步骤 4：验证安装

```bash
# 查看 OpenClaw 版本
openclaw --version
```

#### 步骤 5：初始化配置

```bash
openclaw onboard --install-daemon
```

按提示选择：
- **选择模型**：推荐 MiniMax（M2.5）或 Kimi（国内可用的 AI）
- **选择端口**：默认 18789
- **选择运行环境**：推荐 Node

> 💡 如果选择错误，可以按 **ESC** 键重新选择。

---

### 方式二：npm 手动安装

如果一键脚本失败，可以手动安装：

```bash
# 1. 配置国内镜像（加速下载）
npm config set registry https://registry.npmmirror.com

# 2. 全局安装 OpenClaw
npm install -g openclaw@latest

# 3. 初始化配置
openclaw onboard --install-daemon
```

---

### 方式三：WSL2 部署（官方推荐，最稳定）

#### 步骤 1：安装 WSL2

在管理员 PowerShell 中执行：

```powershell
# 一键安装 WSL2（会自动安装 Ubuntu）
wsl --install
```

> 重启电脑后自动安装 Ubuntu，首次启动需设置用户名和密码。

#### 步骤 2：在 WSL2 中安装依赖

打开 Ubuntu 终端，执行：

```bash
# 更新系统软件包
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

#### 步骤 3：安装 OpenClaw

```bash
# 配置国内 npm 镜像
npm config set registry https://registry.npmmirror.com

# 全局安装 OpenClaw
npm install -g openclaw@latest

# 初始化配置（安装守护进程）
openclaw onboard --install-daemon
```

---

## 3. 配置 AI 模型（以 MiniMax 为例）

> 国内用户推荐使用 MiniMax，性价比高，稳定。

### 获取 MiniMax API Key

1. 访问 https://www.minimaxi.com/ 注册账号
2. 完成实名认证
3. 进入「控制台」→「API 密钥」→ 创建新密钥
4. 复制密钥并**妥善保存**（只会显示一次！）
5. 充值余额（支持支付宝/微信）

### 在 OpenClaw 中配置

在初始化时选择 **MiniMax M2.5 (CN)**，然后粘贴 API Key 即可。

---

## 4. 启动与使用

### 启动 Gateway

```bash
openclaw gateway --port 18789
```

### 访问控制面板

浏览器打开：http://127.0.0.1:18789/

### 常用命令

| 命令 | 说明 |
|------|------|
| `openclaw gateway` | 启动网关 |
| `openclaw gateway status` | 查看状态 |
| `openclaw --help` | 查看帮助 |
| `openclaw configure` | 重新配置 |

---

## 5. 常见问题与解决

### ❓ 安装脚本报错

- 确认以**管理员身份**运行 PowerShell
- 执行 `Set-ExecutionPolicy RemoteSigned`
- 临时关闭杀毒/安全软件

### ❓ node/npm 不是内部命令

- 重启电脑
- 或手动将 Node.js 添加到 PATH

### ❓ Gateway 启动失败

- 检查 Node.js 版本（必须 ≥22）
- 尝试重新初始化：`openclaw onboard`

### ❓ 端口被占用

```bash
openclaw gateway --port 18790
```

---

## 6. 安全注意事项

⚠️ 使用 OpenClaw 时请注意：

1. **API Key 安全**：不要泄露你的 API Key，定期检查用量
2. **网络暴露**：默认配置下 Gateway 可能暴露端口，建议仅内网使用
3. **文件权限**：AI 有权限执行删除命令，操作前仔细确认
4. **插件安全**：谨慎安装来源不明的 Skills 插件

---

快去试试搭建你的 AI 助手吧！ 🦞🐨

**参考来源：**
- [OpenClaw 官方文档](https://openclaw.ai/docs)
- [博客园 - OpenClaw 安装教程](https://www.cnblogs.com/chenxiaomeng/p/19712272)
