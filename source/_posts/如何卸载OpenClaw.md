---
title: 如何卸载 OpenClaw
date: 2026-03-19 13:26:00
updated: 2026-03-19 13:26:00
tags:
  - OpenClaw
  - 卸载
  - AI助手
  - 安全
categories:
  - 工具实践
keywords: OpenClaw, 卸载, AI助手, Node.js, 安全清理
summary: 完整记录 OpenClaw 的三种卸载方式（官方命令、手动卸载、彻底清理），以及卸载后的安全补救措施：API Key 撤销、账单检查、端口排查。
img: /medias/featureimages/5.jpg
---

> ⚠️ **警告**：卸载是一个**不可逆**的操作，请谨慎操作。

> ⚠️ **重要声明**：以下内容主要由 OpenClaw（AI）生成，综合了官方文档和中文社区教程。**部分命令（尤其是 `openclaw uninstall --all --yes`）未经我本人逐一实测验证**。执行前请务必：
> 1. 在 [OpenClaw 官方文档](https://openclaw.ai/docs/install/uninstall) 核实卸载命令
> 2. 手动卸载时，仔细核对删除路径，避免误删其他文件
> 3. 卸载后务必按本文"安全补救措施"撤销 API Key
>
> 参考来源：OpenClaw 官方文档、博客园 - 慕容木木

---

## 简短引言：为什么我们要"送走"这只龙虾？

很多人被"拥有自己的贾维斯"、"让 AI 帮你自动干活"的演示吸引，部署了 OpenClaw。但使用过程中可能会遇到：

- **钱包刺客**：API Key 配置后，AI 后台执行任务可能导致 Token 快速消耗
- **数据风险**：权限过大可能误删重要文件，或暴露端口
- **体验不稳定**：作为快速迭代的开源项目，可能存在各种 Bug

如果你觉得"驾驭不了"，及时卸载是明智的选择。

---

## 方法一：官方卸载命令（推荐）

### 步骤 1：停止 Gateway

如果 OpenClaw 正在运行，先停止：

```bash
# 在终端中按 Ctrl + C 强制停止当前进程
```

### 步骤 2：执行官方卸载

```bash
# 一键彻底卸载 OpenClaw
openclaw uninstall --all --yes
```

**参数说明：**
- `--all`：彻底删除，包括服务、数据、配置文件
- `--yes`：自动确认，无需手动输入

### 步骤 3：删除 CLI 工具

```bash
# 删除全局安装的 OpenClaw CLI
npm uninstall -g openclaw

# 如果权限不足（Mac/Linux）
sudo npm uninstall -g openclaw
```

---

## 方法二：手动卸载（适合 CLI 已删除但服务仍在）

### Windows

#### 1. 停止服务

```powershell
# 打开任务管理器，找到 OpenClaw 相关进程，结束任务
```

#### 2. 删除计划任务

```powershell
# 删除 Windows 计划任务
schtasks /Delete /F /TN "OpenClaw Gateway"
```

#### 3. 删除残留文件

```powershell
# 删除配置目录
Remove-Item -Recurse -Force "$env:USERPROFILE\.openclaw"

# 删除 Gateway 脚本
Remove-Item -Force "$env:USERPROFILE\.openclaw\gateway.cmd"
```

#### 4. 删除 npm 全局包

```powershell
# 卸载 OpenClaw CLI
npm uninstall -g openclaw
```

### macOS / Linux

#### 1. 停止服务

```bash
# 停止 launchd 服务（macOS）
launchctl bootout gui/$UID/ai.openclaw.gateway
rm -f ~/Library/LaunchAgents/ai.openclaw.gateway.plist

# 停止 systemd 服务（Linux）
systemctl --user disable --now openclaw-gateway.service
```

#### 2. 删除配置目录

```bash
# 删除 OpenClaw 配置目录
rm -rf ~/.openclaw
```

#### 3. 删除 CLI

```bash
# 卸载 OpenClaw CLI
sudo npm uninstall -g openclaw
```

---

## 方法三：彻底清理（完美主义者）

如果你想确保不留任何残留：

### 1. 删除所有相关目录

```bash
# 默认配置目录
rm -rf ~/.openclaw

# 工作区（如果有）
rm -rf ~/.openclaw/workspace

# npm 全局目录中的残留
rm -rf $(npm prefix -g)/lib/node_modules/openclaw
```

### 2. 清理环境变量

检查以下环境变量是否包含 OpenClaw 相关路径，如有则删除：
- `PATH` 中的 OpenClaw 路径
- `OPENCLAW_HOME`
- `OPENCLAW_STATE_DIR`

### 3. 重启电脑

> ⚠️ 强烈建议重启电脑，确保所有后台进程被清除。

---

## 卸载后的安全补救措施（非常重要！）

⚠️ 卸载软件不等于安全！你还需要：

### 1. 废弃并重新生成 API Key

请立即前往你使用过的模型服务商官网，撤销旧的密钥：

| 服务商 | 网址 |
|--------|------|
| OpenAI | platform.openai.com → API Keys |
| Claude | console.anthropic.com → API Keys |
| DeepSeek | platform.deepseek.com → API 密钥 |
| MiniMax | www.minimaxi.com → 控制台 |

> ⚠️ 不要心存侥幸！黑客拿到 API Key 后可能短时间内消耗完所有余额。

### 2. 检查云端账单

登录服务商后台，查看最近用量。如有异常暴涨，记录并联系客服。

### 3. 检查是否有公网暴露

如果你曾经配置过远程访问，建议：
- 修改路由器端口转发规则
- 检查防火墙规则
- 如果使用 Tailscale，考虑断开或重置

---

## 常见问题

**Q: 卸载后想重装怎么办？**

```bash
# Windows
iwr -useb https://openclaw.ai/install.ps1 | iex

# 或使用国内镜像
iwr -useb https://open-claw.org.cn/install-cn.ps1 | iex
```

**Q: 提示"不是内部命令"？**

说明 CLI 已成功卸载，OpenClaw 已离开你的电脑。

**Q: 之前用了 `--profile` 怎么办？**

需要手动删除各 profile 的目录：
```bash
rm -rf ~/.openclaw-<profile名>
```

---

## 理性看待 AI，安全第一

OpenClaw 展示了"AI 自主行动"的未来，但它还在快速迭代中。

**当前阶段的风险：**
- 裸奔的网关可能让你成为黑客跳板
- 供应链投毒：不明来源的插件可能包含恶意代码
- 不受控的行为可能导致文件误删

**安全建议：**
- 最小权限原则
- 不要轻易把系统最高权限交给 AI
- 仅在内网使用，不暴露到公网

---

希望这篇指南能帮你安全地卸载 OpenClaw！🐨

**参考来源：**
- [OpenClaw 官方文档](https://openclaw.ai/docs/install/uninstall)
- [博客园 - 手把手教你安全移除 OpenClaw](https://www.cnblogs.com/miao-zp/p/19718662)
