---
title: AI 编程 CLI + 桌面版工具大全｜安装、配置第三方模型、辅助管理工具
permalink: ai-cli-tools/
date: 2026-06-03 16:00:00
tags:
  - AI工具
  - Agent
  - CC Switch
  - EchoBird
  - 配置指南
categories:
  - AI工具
keywords: Codex CLI, Claude Code, Hermes, Gemini CLI, Antigravity CLI, OpenClaw, OpenCode, CC Switch, EchoBird, 配置第三方模型, AI编程, MaaS, 桌面版, Claude Desktop, Antigravity Desktop, Codex Desktop, Hermes Desktop, OpenClaw Desktop
img: /medias/featureimages/18.jpg
---

> 八个主流 AI 编程工具的 CLI + 桌面版安装配置，从命令行到图形界面一次讲清。

---

## 前言

目前主流的 AI 编程工具主要有八个：**Codex**（OpenAI）、**Claude Code**（Anthropic）、**Hermes Agent**（NousResearch）、**Antigravity**（Google，原 Gemini CLI 继任者）、**OpenClaw**、**OpenCode**。其中大部分既有 CLI 命令行版，也有桌面 GUI 应用。

很多开发者手上同时用着两三个或更多，但每个工具的安装方式、配置文件写法、API Key 设置规则都不一样。这篇文章逐一覆盖：

1. 每个工具的 **CLI 版 + 桌面版** 安装方式
2. 如何在应用内配置第三方模型（原生方式）
3. 如果嫌手动改配置文件麻烦，用 **CC Switch** 或 **EchoBird** 怎么简化

### 两种思路

- **原生配置**：工具本身支持设置第三方 API 端点，不依赖额外工具。每个工具单独配
- **辅助工具**：通过 CC Switch 或 EchoBird 的 GUI 统一管理，还能做协议转换和故障切换

### CLI 版 vs 桌面版

大部分工具同时提供 CLI 和桌面版，两者不是互斥的——可以在不同场景下切换使用：

| 对比维度 | CLI 版 | 桌面版 |
|---------|--------|--------|
| 适合场景 | SSH 远程、CI/CD、快捷键流 | 日常开发、项目管理、图形化操作 |
| 第三方模型配置 | 原生支持（config / env） | 部分支持，见各工具详情 |
| 资源占用 | 轻量 | 较重（Electron 等框架） |
| 学习成本 | 需记命令 | 所见即所得 |

两个方案不冲突，可以混合用。

---

## 一、OpenAI Codex

Codex 是 OpenAI 推出的通用 AI Agent 工具，支持云端模型和本地开源模型。提供 CLI 命令行版和桌面 App。

### 安装

```bash
# npm（推荐，全平台）
npm install -g @openai/codex

# macOS Homebrew
brew install codex
```

### 原生配置第三方模型

Codex CLI 的 Rust 版本通过 `~/.codex/config.toml` 原生支持第三方模型提供商。

```toml
model = "deepseek-chat"
model_provider = "deepseek"

[model_providers.deepseek]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
env_key = "DEEPSEEK_API_KEY"

[model_providers.openrouter]
name = "OpenRouter"
base_url = "https://openrouter.ai/api/v1"
env_key = "OPENROUTER_API_KEY"
wire_api = "responses"    # Codex 要求 Responses API

[model_providers.ollama]
name = "Ollama"
base_url = "http://localhost:11434/v1"

[profiles.deepseek]
model_provider = "deepseek"
model = "deepseek-chat"

[profiles.local]
model_provider = "ollama"
model = "qwen3-coder-30b"
```

```bash
# 切换 profile
codex --profile deepseek
codex --profile local
```

**支持的提供商：** OpenRouter、Azure、DeepSeek、Ollama、Gemini、Mistral、xAI、Groq、LM Studio、MLX 等。

**API Key 环境变量（写入 ~/.bashrc / ~/.zshrc）：**

```bash
export DEEPSEEK_API_KEY="sk-xxxx"
export OPENROUTER_API_KEY="sk-or-xxxx"
```

### Codex 桌面版配置第三方模型

Codex 桌面版（v0.138+，2026 年 6 月起）已正式支持第三方模型。配置方式与 CLI 版完全一致——修改 `~/.codex/config.toml`，**配置一次，CLI、桌面版、IDE 插件全端生效**。

```toml
# ~/.codex/config.toml
model = "deepseek-chat"
model_provider = "deepseek"

[model_providers.deepseek]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
env_key = "DEEPSEEK_API_KEY"

[model_providers.openrouter]
name = "OpenRouter"
base_url = "https://openrouter.ai/api/v1"
env_key = "OPENROUTER_API_KEY"
```

**⚠️ 注意事项：**
- Codex 已弃用 Chat Completions API，必须使用 Responses API 兼容的提供商。如果提供商只支持 `/v1/chat/completions`，需要加一层协议转换（如 OpenRouter、LiteLLM）
- 云端模式（远程任务队列）和 GitHub PR 自动化仍需 OpenAI 官方认证
- 本地模型走 OSS 模式：`codex --oss`，使用 Ollama/LM Studio 的专属配置块

**桌面版优势：**

- **Computer Use**：让 Codex 直接操作你的桌面应用和浏览器
- **远程控制**：手机 ChatGPT App 可以查看、审批、指挥桌面 Codex
- **项目管理**：基于本地文件夹作为项目上下文
- **技能系统**：可复用的指令和工作流
- **定时任务**：自动化重复性工作

---

## 二、Anthropic Claude Code

Claude Code 是 Anthropic 的 AI 编程 Agent，从 v1.0.61+ 开始原生支持配置第三方 API 端点。提供 CLI 命令行版和桌面版（Claude Desktop）。

### 安装

```bash
npm install -g @anthropic-ai/claude-code
```

### 原生配置第三方模型

核心原理：通过 `ANTHROPIC_BASE_URL` 把 API 请求转发到指定端点，通过 `ANTHROPIC_AUTH_TOKEN` 传递第三方 API Key。

**方法一：settings.json（推荐）**

编辑 `~/.claude/settings.json`：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-or-xxxx",
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_MODEL": "anthropic/claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "anthropic/claude-haiku-4-5",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "anthropic/claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "anthropic/claude-opus-4-6"
  }
}
```

**方法二：环境变量（临时切换）**

```bash
export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
export ANTHROPIC_AUTH_TOKEN="sk-or-xxxx"
claude
```

**支持直接配置的提供商（具有 Anthropic 兼容端点）：**

| 提供商 | ANTHROPIC_BASE_URL |
|--------|-------------------|
| OpenRouter | `https://openrouter.ai/api` |
| DeepSeek | `https://api.deepseek.com/anthropic` |
| 智谱 GLM | `https://open.bigmodel.cn/api/anthropic` |
| Kimi / Moonshot | `https://api.moonshot.cn/anthropic` |
| 通义千问（百炼） | `https://dashscope.aliyuncs.com/apps/anthropic` |
| MiniMax | `https://api.minimax.io/anthropic` |

> `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_API_KEY` 二选一，不要同时设。

**原生支持的云平台：**

| 平台 | 配置方式 |
|------|---------|
| AWS Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` + AWS 凭证 |
| Google Vertex AI | `CLAUDE_CODE_USE_VERTEX=1` + GCP 凭证 |
| Microsoft Foundry | `CLAUDE_CODE_USE_FOUNDRY=1` |

### 模型别名

| 别名 | 用途 |
|------|------|
| `sonnet` | 日常编码 |
| `opus` | 复杂推理 |
| `haiku` | 轻量快速 |
| `fable` | 最强模型，适合长任务 |
| `opusplan` | Plan Mode 用 opus，执行用 sonnet |

```bash
claude --model opus
# 进入后 /model opus 切换
```

### Claude Code 汉化

Claude Desktop 原生界面为英文，可通过社区汉化补丁实现中文显示。

#### 方法一：javaht/claude-desktop-zh-cn（推荐）

项目：[javaht/claude-desktop-zh-cn](https://github.com/javaht/claude-desktop-zh-cn)

一键安装步骤：

1. **下载并安装 Claude Desktop**：从 [code.claude.com/docs/zh-TW/desktop](https://code.claude.com/docs/zh-TW/desktop) 下载官方安装包
2. **下载汉化补丁**：克隆或下载 [javaht/claude-desktop-zh-cn](https://github.com/javaht/claude-desktop-zh-cn)
3. **退出 Claude Desktop**（一定要完全退出）
4. **安装汉化**：
   - **Windows**：右键 → 管理员身份运行 `install-windows.bat` → 选择语言（1=简体中文，2=繁体中文）
   - **macOS**：双击 `install-mac.command`
5. 安装完成后 Claude 自动重启，界面即显示中文

> 官方更新后会覆盖汉化文件，每次升级后需重新运行一次安装脚本。

#### 方法二：Qiao-920/claude-desktop-cn

项目：[Qiao-920/claude-desktop-cn](https://github.com/Qiao-920/claude-desktop-cn)

不单纯是汉化补丁，而是**二次封装的中文桌面客户端**，内置中文界面 + 本地 Code 工作区 + GitHub 导入 + 权限守卫等功能，下载即用，无需原版 Claude Desktop。

### Claude Desktop 配置第三方模型

Claude Desktop 在 2026 年 5 月加入了官方第三方模型接入能力（需开启开发者模式），但有所限制，以下是完整说明。

#### 支持官方 Gateway 方式

通过 Developer Mode → Configure Third-Party Inference 可配置三种连接类型：

| 连接类型 | 说明 | 配置方式 |
|----------|------|---------|
| **Gateway**（通用网关） | OpenRouter、LiteLLM、Portkey 等 | 填入 Base URL + API Key |
| **Amazon Bedrock** | AWS 云直连 | AWS 凭证认证 |
| **Google Vertex AI** | GCP 云直连 | GCP 凭证认证 |
| **Azure AI Foundry** | 微软云直连 | Azure 凭证认证 |

**配置步骤：**
1. `Help → Troubleshooting → Enable Developer Mode` 开启开发者模式
2. `Developer → Configure Third-Party Inference` 打开配置面板
3. 选择连接类型（Gateway / Bedrock / Vertex / Foundry）
4. 填入 Base URL（必须是 HTTPS）、API Key
5. `Apply locally` → `Relaunch now`，重启后选择 `Continue with Gateway`

#### ⚠️ 模型 ID 白名单限制（关键限制）

2026 年 5 月 6 日，Anthropic 推送了 **1.6259.1 版本更新**，新增了模型 ID 白名单——Gateway 模式只允许以 `claude-` 或 `anthropic-` 开头的模型名通过。非官方模型（如 DeepSeek、GPT、Grok 等）无法直接在桌面版中使用，手动配置会报错 `"configured model is not an Anthropic model"`。

**社区规避方案：** 使用本地代理服务将第三方模型名映射为 `claude-sonnet-4-6` 等官方格式（如 GitHub 上 `wanghao9610/Claude-Model-Proxy` 项目）。但绕过方案随时可能失效。

**总结：** 桌面版配第三方模型从"开放了两周后收紧"——官方 Gateway 方式确实存在，但白名单限制了非 `claude-*` 模型。因此国内/第三方模型的稳定使用仍依赖辅助工具（CC Switch 的本地路由或社区代理方案）。

### 官方文档

- [模型配置（中文）](https://code.claude.com/docs/zh-CN/model-config)
- [桌面版文档（中文）](https://code.claude.com/docs/zh-TW/desktop)
- [GitHub](https://github.com/anthropics/claude-code)

---

## 三、Hermes Agent

Hermes Agent 由 NousResearch 开发，开源的 24/7 持久化 AI 编码 Agent，支持 CLI、Telegram、Discord、Slack 等多平台。v0.16.0+ 起正式推出桌面版。

### 安装

```bash
# Linux / macOS / WSL2
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
source ~/.zshrc
```

```powershell
# Windows（PowerShell 7+）
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

### 原生配置第三方模型

Hermes 原生支持 200+ 模型，交互式选择即可。

```bash
hermes setup --portal    # Nous Portal 一键登录（推荐）
hermes model             # 或手动选择提供商和模型
```

**支持的提供商：**

| 提供商 | 环境变量 |
|--------|---------|
| OpenRouter | `OPENROUTER_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| 智谱 GLM | `GLM_API_KEY` |
| Kimi | `KIMI_API_KEY` |
| 通义千问 | `DASHSCOPE_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| Ollama（本地） | 自定义端点 |
| LM Studio（本地） | 自定义端点 |

**CLI 配置：**

```bash
hermes config set model anthropic/claude-opus-4
hermes config set OPENROUTER_API_KEY sk-or-xxx
```

**配置存放：**
- 密钥 → `~/.hermes/.env`
- 配置 → `~/.hermes/config.yaml`

**验证：**

```bash
hermes doctor    # 健康检查
hermes --tui     # 启动 TUI 界面
```

### 官方文档

- [官网](https://hermes-agent.nousresearch.com/)
- [GitHub](https://github.com/NousResearch/hermes-agent)
- [快速开始](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart/)

### Hermes 桌面版

Hermes Agent 在 v0.16.0（2026.6.5 "Surface Release"）中正式推出了官方桌面版。

**安装方式：**

| 平台 | 方式 |
|------|------|
| macOS / Windows | 从 [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com) 下载桌面安装程序 |
| Linux | `.AppImage` / `.deb` / `.rpm` |
| 已有 CLI | 终端运行 `hermes desktop` |

**功能特点：**

- 原生 Electron 桌面应用，支持拖放文件
- Cmd+K 命令面板、状态栏模型选择器
- 内置自动更新
- 已有简体中文翻译

> 如果已安装过 CLI 版，桌面版会自动连接已有环境，不会重复创建。CLI 版 `hermes config set` 配好的模型和 API Key 桌面版直接沿用。

---

## 四、Google Gemini CLI → Antigravity（含桌面版）

### ⚠️ Gemini CLI 已停服

**2026 年 6 月 18 日，Google 停止了对个人用户的 Gemini CLI 服务。** 受影响范围包括：

- 免费用户
- Google AI Pro / Ultra 订阅用户
- 个人 Gemini Code Assist / GitHub 用户

**不受影响的用户：**
- 企业版 Gemini Code Assist Standard / Enterprise
- Google Cloud 企业客户
- 使用付费 Gemini API Key 的用户

Google 给出的理由是把重心转移到新的多 Agent 平台架构上。

### 继任者：Antigravity CLI

Antigravity CLI（命令名 `agy`）是 Google 推出的继任工具，用 Go 编写，支持异步后台工作流、Agent Skills、Hooks、Subagents、Extensions（现称插件）。新装或迁移都行，它会自动检测并迁移 Gemini CLI 的旧配置（skills、MCP servers、agents、memory 文件）。

**安装：**

```bash
# macOS / Linux
curl -fsSL https://antigravity.google/cli/install.sh | bash
```

```powershell
# Windows PowerShell
irm https://antigravity.google/cli/install.ps1 | iex
```

**配置第三方模型：**

Antigravity CLI 支持多种模型提供商，通过 `agy` 命令进行操作。具体配置方式请参考官方文档。

> Gemini CLI 现有安装对个人用户已无法使用，建议直接迁移到 Antigravity CLI。

### 官方文档

- [Gemini CLI 官方公告](https://github.com/google-gemini/gemini-cli/discussions/27274)
- [Antigravity CLI](https://antigravity.google/)
- [Antigravity 桌面版/IDE/SDK 介绍](https://cloud.google.com/blog/topics/developers-practitioners/choosing-your-surface-antigravity-20-antigravity-cli-antigravity-ide-or-antigravity-sdk/)

### Antigravity 桌面版

Google 在 **2026 年 5 月 I/O 大会** 上发布了 Antigravity 2.0，从一个 AI IDE 扩展为四个产品面：

| 产品 | 说明 |
|------|------|
| **Antigravity Desktop** | 独立桌面应用——Agent 控制中心，多项目管理台 |
| **Antigravity CLI**（命令 `agy`） | 终端命令行，无头执行和自动化 |
| **Antigravity IDE** | 面向开发者的代码编辑器，与 Agent 并肩协作 |
| **Antigravity SDK** | Python 库，构建和部署自定义 Agent |

**Desktop 版核心功能：**

- **多 Agent 并行**：同时运行多个 Agent 处理不同项目
- **动态子 Agent**：主 Agent 自动拆分任务并行执行
- **定时任务**：支持 cron 式定时触发
- **原生语音命令**：支持语音输入并实时转写
- **Project 概念**：一个 Project 可绑定多个本地目录
- **工作模式**：Local Mode（直接修改）或 Worktree Mode（隔离分支）

**安装：** 从 [antigravity.google](https://antigravity.google/) 下载桌面安装包，Google 账号登录即可。
**定价：** Pro 计划个人免费，AI Ultra 计划 $100/月。

---

## 五、OpenClaw

OpenClaw 是一个个人 AI 助手，运行在你自己的设备上。与其说是一个编码 CLI，不如说是一个**全能型的个人 Agent**，它最大的特点是支持超多消息平台（WhatsApp、Telegram、Slack、Discord、微信等），不只局限在终端。目前仅提供 CLI 命令行版，没有官方桌面应用。

### 安装

```bash
# npm 安装
npm install -g openclaw@latest

# 或一键脚本
curl -fsSL https://openclaw.ai/install.sh | bash
```

```powershell
# Windows PowerShell 一键安装（海外）
iwr -useb https://openclaw.ai/install.ps1 | iex

# 国内加速脚本（推荐，避免网络问题）
iwr -useb https://open-claw.org.cn/install-cn.ps1 | iex
```

> 远程脚本执行前建议先审查内容：
> ```powershell
> iwr -useb https://openclaw.ai/install.ps1 -OutFile install.ps1
> # 用编辑器查看 install.ps1 确认无问题
> .\install.ps1
> ```

安装后运行初始化向导：

```bash
openclaw onboard --install-daemon
```

这一步会引导你选择模型供应商、设置 API Key，并安装后台守护进程。

### WSL2 部署（官方推荐最稳定）

如果 Windows 原生运行不稳定，推荐在 WSL2 中部署：

```powershell
# 管理员 PowerShell 安装 WSL2
wsl --install
```

重启后打开 Ubuntu 终端：

```bash
# 安装 Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 配置国内镜像
npm config set registry https://registry.npmmirror.com

# 安装 OpenClaw
npm install -g openclaw@latest

# 初始化配置
openclaw onboard --install-daemon
```

### 配置模型

OpenClaw 支持 OpenAI（OAuth 或 API Key）、Anthropic（API Key 或 OAuth）、Ollama（本地模型）。

**国内推荐 MiniMax（性价比高，稳定）：**

1. 访问 [minimaxi.com](https://www.minimaxi.com/) 注册账号
2. 完成实名认证
3. 进入「控制台」→「API 密钥」→ 创建新密钥
4. 复制密钥并妥善保存（只会显示一次）
5. 初始化时选择 **MiniMax M2.5 (CN)**，粘贴 API Key 即可

配置文件 `~/.openclaw/openclaw.json`：

```json
{
  "agent": {
    "model": "anthropic/claude-opus-4-5"
  }
}
```

**常用命令：**

```bash
openclaw gateway status          # 检查网关状态
openclaw agent --message "..."   # 发送任务
openclaw dashboard               # 打开 Web 管理面板
openclaw config                  # 配置 TUI
```

### 官方文档

- [官网 / 文档](https://docs.openclaw.ai/start/getting-started)
- [GitHub](https://github.com/openclaw/openclaw)

> 注：OpenClaw 目前只有 CLI 版，没有官方桌面应用。社区有第三方桌面封装（如 ClawX、OpenClaw Desktop），非官方出品。如需要桌面端体验可自行搜索评估。

---

## 六、OpenCode

OpenCode 是一个 Go 语言编写的终端 AI 编码助手，特点是**交互式 TUI 界面**。它模型中立，支持多种提供商。

> ⚠️ 原仓库 `opencode-ai/opencode` 已归档。原项目已更名为 **Crush**，由 Charm 团队继续维护。同时社区也有活跃的 fork（如 `fuvines/ai-agent-cli-opencode`）。

### 安装

```bash
# npm
npm i -g opencode-ai@latest

# macOS Homebrew
brew install anomalyco/tap/opencode

# Windows Scoop
scoop install opencode

# 一键脚本
curl -fsSL https://opencode.ai/install | bash
```

### 配置第三方模型

配置文件 `~/.opencode.json`：

```json
{
  "providers": {
    "anthropic": { "apiKey": "sk-ant-...", "disabled": false },
    "openai":    { "apiKey": "sk-...",       "disabled": false },
    "gemini":    { "apiKey": "AIza..." },
    "groq":      { "apiKey": "gsk-..." }
  },
  "agents": {
    "coder": { "model": "claude-3-7-sonnet", "maxTokens": 5000 },
    "task":  { "model": "claude-3-7-sonnet", "maxTokens": 5000 }
  }
}
```

环境变量方式快速上手的也行：

```bash
export ANTHROPIC_API_KEY=sk-ant-...
cd my-project
opencode
```

**内置 Agent 角色：**

| Agent | 说明 |
|-------|------|
| `build`（默认） | 完整权限的编码 Agent |
| `plan` | 只读，用于分析、探索代码 |
| `@general` | 内部子 Agent，处理复杂多步任务 |

TUI 中按 `Tab` 切换 Agent。

### 官方文档

- [GitHub（原仓库，已存档）](https://github.com/opencode-ai/opencode)
- [社区活跃 Fork](https://github.com/fuvines/ai-agent-cli-opencode)
- [Crush（继任者）](https://github.com/charmcli)

---

## 七、配置方式总览

| 工具 | 配置文件位置 | 配置方式 |
|------|------------|---------|
| **Codex CLI** | `~/.codex/config.toml` | `[model_providers]` + `[profiles]` |
| **Claude Code** | `~/.claude/settings.json` | `env.ANTHROPIC_BASE_URL` + `env.ANTHROPIC_AUTH_TOKEN` |
| **Hermes Agent** | `~/.hermes/config.yaml` | `hermes model` 交互式或 `hermes config set` |
| **Antigravity CLI** | 官方文档指引 | 交互式向导 |
| **OpenClaw** | `~/.openclaw/openclaw.json` | `openclaw onboard` 向导 |
| **OpenCode** | `~/.opencode.json` | JSON 配置 providers + agents |

---

## 八、辅助管理工具

如果你的工作流涉及多个 CLI 工具、多个供应商，手动管理配置文件会变得很烦。下面两个工具可以帮你省事。

### 8.1 CC Switch

> 仓库：[farion1231/cc-switch](https://github.com/farion1231/cc-switch) ｜ 下载：[Releases](https://github.com/farion1231/cc-switch/releases)

基于 Tauri 2.8 + Rust 的开源桌面应用，把六个主流 Agent CLI 工具的配置统一收进一个 GUI：

**支持的工具：** Claude Code、Codex CLI、Gemini CLI、OpenCode、OpenClaw、Hermes Agent

**安装：**

| 平台 | 方式 |
|------|------|
| macOS | `brew install --cask cc-switch` |
| Windows | 下载 `.msi` |
| Linux | `.deb` / `.rpm` / `.AppImage` |

#### 核心功能

**① 供应商管理（50+ 预设）**

内置 DeepSeek、GLM、Kimi、SiliconFlow、MiniMax、OpenRouter 等主流供应商，也可自定义添加。

**② 本地路由与协议转换（关键特性）**

CC Switch 在本地启动一个代理服务（默认 `127.0.0.1:15721`），**自动做 OpenAI Chat Completions ↔ Anthropic Messages 的协议转换**。这让本来只认 Anthropic 格式的 Claude Code 也能调用国内模型。配置时需打开「本地路由」开关，启用 API 并测试确认通。

**③ 模型映射**

Claude Code 有三个角色槽位：Sonnet（主力）、Opus（高级推理）、Haiku（轻量快速）。CC Switch 让你把实际模型名填入对应的槽位，不同档位自动切换模型。

**④ 自动熔断（故障转移）**

配置多个供应商后，CC Switch 定期做健康检测，异常时自动切到备用供应商。

**⑤ 其他功能**

- MCP 服务器统一管理（跨应用同步）
- Prompts 提示词 / Skills 管理
- 会话管理器、模型延迟测试、用量统计

### 8.2 EchoBird（回声鸟）

> 仓库：[edison7009/EchoBird](https://github.com/edison7009/EchoBird)

同样是基于 Tauri 的桌面应用，但侧重**一键安装和管理 AI Agent 工具本身**——适合刚接触这些工具、不想敲命令行的用户。

**一键安装：**

```powershell
# Windows（PowerShell）
irm https://echobird.ai/install.ps1 | iex
```

```bash
# macOS / Linux
curl -fsSL https://echobird.ai/install.sh | sh
```

**核心功能：**

- **应用管理**：一键安装 Claude Code、Codex、Hermes、OpenClaw 等 12+ Agent，自动检测环境
- **模型中心（Model Nexus）**：一次配好 API Key，所有 Agent 共用
- **一键本地模型**：内置 llama.cpp / vLLM / SGLang，一键拉起 Qwen、DeepSeek 等开源模型
- **国内友好**：内置 DeepSeek、GLM、SiliconFlow、MiniMax 等平台预设

---

## 九、关于 MaaS 平台

除了直接配各家 API 和用辅助工具，还有一个选择是 **MaaS（Model as a Service）平台**——通过一个统一的 OpenAI 兼容 API 端点和一个 API Key，调用多个模型。

典型例子如 **万界方舟 MaaS**、**SiliconFlow** 等。这类平台适合：
- 想用一个 Key 管理多个模型的费用和权限
- 不想在每个工具里分别配各个供应商的 Key
- 需要国内模型 + 国外模型混合使用

配置方式就是标准的 OpenAI 端点填法：`base_url` 指向 MaaS 平台的 API 地址，`api_key` 填平台的 Key，`model` 填实际要用的模型名。

---

## 十、彻底卸载各 Agent

装了不想要了，或者想从零重新配，下面是各工具彻底卸载的方法。

> 核心原则：**删除安装文件 + 删除配置目录**，两步搞定。

### 10.1 Codex CLI + 桌面版

```bash
npm uninstall -g @openai/codex
rm -rf ~/.codex                    # 配置、会话、认证信息

# macOS 如果装过 Homebrew 版
brew uninstall codex

# 桌面版卸载
# Windows: 设置 → 应用 → Codex → 卸载
# macOS: 从 Applications 删除 Codex.app

# 验证
command -v codex  # 应返回空
```

### 10.2 Claude Code（CLI + 桌面版）

```bash
npm uninstall -g @anthropic-ai/claude-code
rm -rf ~/.claude                    # 配置、认证
rm -rf ~/.cache/claude-code         # 缓存
rm -rf ~/.local/bin/claude          # 原生安装的二进制
rm -rf ~/.local/share/claude        # 原生安装的数据

# 桌面版卸载
# Windows: 设置 → 应用 → Claude → 卸载
# macOS: 从 Applications 删除 Claude.app
# 汉化补丁不影响卸载，直接删应用即可

# 验证
claude  # 应提示 command not found
```

### 10.3 Hermes Agent（CLI + 桌面版）

```bash
# 方式一：自带卸载命令（推荐）
hermes uninstall

# 按提示选择是否保留 ~/.hermes（含 API Key、会话、记忆）
# 如果想彻底删除：
rm -rf ~/.hermes

# 方式二：手动删除
rm -f ~/.local/bin/hermes
rm -rf ~/.hermes

# 桌面版卸载（官方 Hermes Desktop）
# Windows: 设置 → 应用 → Hermes → 卸载
# macOS: 从 Applications 删除 Hermes.app

# 如果有网关服务
hermes gateway stop
# Linux:  systemctl --user disable hermes-gateway
# macOS:  launchctl remove ai.hermes.gateway
```

### 10.4 Antigravity（CLI + 桌面版）

```bash
# 删除 CLI 二进制
rm -f ~/.local/bin/agy

# 删除所有配置和缓存
rm -rf ~/.gemini
rm -rf ~/.antigravity
rm -rf ~/.cache/antigravity
rm -rf ~/.config/antigravity
rm -rf ~/.local/share/antigravity

# macOS 额外
rm -rf ~/Library/Application\ Support/Antigravity
rm -rf ~/Library/Caches/Antigravity

# Windows（PowerShell）
Remove-Item -Recurse -Force "$env:APPDATA\Antigravity"
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Antigravity"

# 桌面版卸载
# Windows: 设置 → 应用 → Antigravity → 卸载
# macOS: 从 Applications 删除 Antigravity.app
# Antigravity IDE 同理
```

### 10.5 OpenClaw

```bash
# 方式一：自带卸载命令（推荐，CLI 仍在时）
openclaw uninstall --all --yes --non-interactive
# 如果 CLI 坏了但还有 Node.js
npx -y openclaw uninstall --all --yes --non-interactive

# 方式二：手动
npm rm -g openclaw                 # 卸载 CLI
rm -rf ~/.openclaw                 # 删除所有配置和数据

# 如果有网关服务（先停掉）
# Windows: schtasks /Delete /F /TN "OpenClaw Gateway"
# macOS:   launchctl bootout gui/$UID/ai.openclaw.gateway
# Linux:   systemctl --user disable --now openclaw-gateway.service
```

> **卸载后的安全补救措施：**
> 1. 废弃并重新生成 API Key：前往所用模型服务商官网（OpenAI / Anthropic / MiniMax / DeepSeek 等）撤销旧密钥
> 2. 检查云端账单：登录服务商后台查看近期用量，如有异常暴涨需联系客服
> 3. 检查公网暴露：如有配置远程访问，修改路由器端口转发规则

### 10.6 OpenCode

```bash
npm uninstall -g opencode-ai
rm -rf ~/.config/opencode           # 配置文件
# 如果装过 Homebrew 版
brew uninstall anomalyco/tap/opencode

# 验证
which opencode  # 应返回空
```

### 10.7 CC Switch

| 平台 | 卸载方式 |
|------|---------|
| Windows | 设置 → 应用 → CC Switch → 卸载 |
| macOS | 从 Applications 删除 CC Switch.app |
| macOS（Homebrew） | `brew uninstall cc-switch` |
| Linux | 包管理器卸载（apt / rpm 等） |

删除配置数据：

```bash
rm -rf ~/.cc-switch
```

> 注意：CC Switch 的本地路由代理（默认 127.0.0.1:15721）会随应用退出自动停止，不需要手动关闭。

### 10.8 EchoBird

| 平台 | 卸载方式 |
|------|---------|
| Windows | 设置 → 应用 → EchoBird → 卸载 |
| macOS | 从 Applications 删除 EchoBird.app |
| Linux | 包管理器卸载 |

### 卸载总结

| 工具 | 卸载命令 | 配置目录 |
|------|---------|---------|
| **Codex CLI** | `npm uninstall -g @openai/codex` | `~/.codex` |
| **Claude Code** | `npm uninstall -g @anthropic-ai/claude-code` | `~/.claude` |
| **Hermes Agent** | `hermes uninstall` | `~/.hermes` |
| **Antigravity CLI** | `rm -f ~/.local/bin/agy` | `~/.antigravity` |
| **OpenClaw** | `openclaw uninstall --all --yes` | `~/.openclaw` |
| **OpenCode** | `npm uninstall -g opencode-ai` | `~/.config/opencode` |
| **CC Switch** | 系统设置卸载 | `~/.cc-switch` |
| **EchoBird** | 系统设置卸载 | 应用数据目录 |

---

## 十一、总结对比

| 工具 | 类型 | CLI | 桌面版 | 安装方式 | 适合谁 |
|------|------|-----|--------|---------|--------|
| **Codex** | 编程 Agent | ✅ `npm install -g @openai/codex` | ✅ macOS + Windows 桌面 App | npm / brew / 官网 | 偏 OpenAI 生态 |
| **Claude Code** | 编程 Agent CLI | ✅ `npm install -g @anthropic-ai/claude-code` | ✅ [code.claude.com](https://code.claude.com) 桌面 App | npm / 官网 | 复杂编码任务 |
| **Hermes Agent** | 持久化 Agent | ✅ curl / PowerShell | ✅ 官方 Hermes Desktop（v0.16+） | curl / 官网 | 多平台 24h 自动化 |
| **Antigravity** | 编程 Agent | ✅ `agy`（Go 编写） | ✅ Antigravity Desktop + IDE | curl / 官网 | Gemini CLI 迁移用户 |
| **OpenClaw** | 个人 AI 助手 | ✅ `npm install -g openclaw` | ❌ 仅 CLI | npm / 官网 | 全平台消息集成 |
| **OpenCode** | 编程 CLI（TUI） | ✅ npm / brew / scoop | ❌ 纯 CLI/TUI | npm / brew / scoop | 喜欢 TUI 界面 |
| **CC Switch** | 配置管理 GUI | — | ✅ 桌面 App（Tauri） | brew / msi | 多工具多供应商，需集中配置 |
| **EchoBird** | 工具管理 GUI | — | ✅ 桌面 App（Tauri） | curl / PowerShell | 刚入门，需一键安装 |

### 推荐路线

- **刚入门**：用 EchoBird 一键装好工具 → 在工具内用本文的原生方式配模型
- **日常使用两三个工具**：原生配置就够了
- **工具越来越多、供应商经常切换**：加 CC Switch，统一管理 + 协议转换 + 故障转移
- **不想管多个 API Key**：找个 MaaS 平台，所有工具指向同一个端点

---

## 参考

- [OpenAI Codex 官方配置](https://developers.openai.com/codex/config-basic)
- [OpenAI Codex 桌面 App](https://developers.openai.com/codex/app)
- [Claude Code 模型配置（中文）](https://code.claude.com/docs/zh-CN/model-config)
- [Claude Code 桌面版文档（中文）](https://code.claude.com/docs/zh-TW/desktop)
- [Claude Desktop 汉化补丁（javaht）](https://github.com/javaht/claude-desktop-zh-cn)
- [Claude Desktop 中文增强版（Qiao-920）](https://github.com/Qiao-920/claude-desktop-cn)
- [Hermes Agent 快速开始](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart/)
- [Hermes Desktop 官网](https://hermes-agent.nousresearch.com/)
- [Google Gemini CLI → Antigravity 公告](https://github.com/google-gemini/gemini-cli/discussions/27274)
- [Antigravity 官方](https://antigravity.google/)
- [Antigravity 桌面版/IDE/SDK 介绍](https://cloud.google.com/blog/topics/developers-practitioners/choosing-your-surface-antigravity-20-antigravity-cli-antigravity-ide-or-antigravity-sdk/)
- [OpenClaw 官方文档](https://docs.openclaw.ai/start/getting-started)
- [OpenClaw Desktop（agentkernel）](https://github.com/agentkernel/openclaw-desktop)
- [ClawX](https://github.com/ValueCell-ai/ClawX)
- [OpenCode（原仓库，已存档）](https://github.com/opencode-ai/opencode)
- [CC Switch - GitHub](https://github.com/farion1231/cc-switch)
- [EchoBird - GitHub](https://github.com/edison7009/EchoBird)
- [Codex 第三方模型配置参考](https://www.morphllm.com/codex-provider-configuration)
