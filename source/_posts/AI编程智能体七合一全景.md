---
title: AI 编程智能体七合一全景：Codex / Claude Code / Antigravity / Grok Build / Kimi Code / DeepSeek Harness / ZCode
permalink: ai-coding-agents-overview/
date: 2026-08-14 14:30:00
updated: 2026-08-29 12:30:00
tags:
  - AI编程
  - Agent
  - Codex
  - Claude Code
  - Antigravity
  - Grok
  - Kimi Code
  - DeepSeek
  - ZCode
  - GLM
categories:
  - AI工具
keywords: Codex, Claude Code, Antigravity, Gemini CLI, Grok Build, Kimi Code, DeepSeek Harness, ZCode, GLM, 智谱, AI编程智能体, 编程Agent, CLI, MCP, 子代理, 斜杠命令
img: /medias/featureimages/19.jpg
---

> 从 OpenAI、Anthropic、Google DeepMind、xAI、Moonshot AI 到 DeepSeek、智谱，七大编程智能体已全部杀入终端。本文按官方文档与第一手实测逐一拆解它们的定位、能力与命令入口，帮你建立一张完整的认知地图。

---

## 前言：编程智能体进入「终端时代」

2025 到 2026 年，AI 编程助手的主战场从 IDE 插件和聊天框，全面下沉到了**终端（CLI/TUI）**。这些工具不再是「问一句答一句」的补全器，而是能够**读代码、改文件、跑命令、联网调研、派生子代理、自主完成整条任务链路**的 Agent。

它们共享一套相似的骨架——MCP 扩展、子代理、计划模式、记忆、沙箱安全——却在设计哲学上走向了截然不同的方向。本文先做全景盘点，把七款主流的「编程智能体」一次讲清；它们之间的**设计哲学、安全哲学与架构差异**，会在下一篇《设计哲学 · 安全哲学 · 架构》中深入展开。

> 严谨性说明：本文事实经官方文档核实，并**直接调用本机安装的 Codex / Claude Code / Antigravity / Grok Build / Kimi Code 五款 CLI 交叉验证**（详见文末「验证方法」）。

先上一张总览表：

| 智能体 | 厂商 | 命令入口 | 实现语言 | 一句话定位 |
|---|---|---|---|---|
| **Codex** | OpenAI | `codex` | Rust | 克制的「执行型」Agent，补丁式改动 + 沙箱分级 |
| **Claude Code** | Anthropic | `claude` | TypeScript | 命令最全的「全能型」终端助手 |
| **Antigravity** | Google DeepMind | `agy` | Go | Gemini CLI 的继任者，IDE+CLI+SDK 平台化 |
| **Grok Build** | xAI | `grok` | Rust | 终端原生 + 多模态生图 + X 实时信息 |
| **Kimi Code CLI** | Moonshot AI | `kimi` | Rust | 会员权益里的「中文生态」编程助手 |
| **DeepSeek Harness** | DeepSeek | Web GUI | 编排框架 | 目标驱动 + 可编排的「编排者」 |
| **ZCode** | 智谱 AI | 桌面端 / CLI | 混合架构 | 桌面自动化 + 终端操控的「全能型」执行者 |

---

## 一、Codex（OpenAI）—— 克制的执行者

Codex 是 OpenAI 官方的编程智能体，运行在本地终端里。它的核心思路是 **「真正动手干活」**，而不是聊天：读文件、改代码、跑命令、做验证，用真实输出作为判断依据。

**能力关键词：**

- **补丁式精确改动**：以 patch 方式只改该动的地方，而非整文件重写。
- **沙箱分级**：`read-only` / `workspace-write` / `danger-full-access` 三档，配合 `untrusted` / `on-request` / `never` 的审批策略。
- **工具链扩展**：MCP、插件（Plugins + Marketplace）、技能（Skills）、生命周期钩子（Hooks）、仓库级指令 `AGENTS.md`。
- **多代理与自动化**：子代理并行协作、`codex exec` 非交互模式、Codex SDK、GitHub Action、Codex Cloud 云端任务。

**命令入口**：交互式 TUI 用 `codex`，非交互用 `codex exec`（别名 `codex e`），其余如 `codex resume` / `fork` / `mcp` / `plugin` / `sandbox` / `doctor` 等。TUI 内斜杠命令覆盖 `/model`、`/plan`、`/goal`、`/permissions`、`/skills`、`/agent` 等。

---

## 二、Claude Code（Anthropic）—— 命令最全的全能助手

Claude Code 是 Anthropic 出品的终端 AI 助手，最大的特点是**斜杠命令多到惊人**——官方文档收录上百条，覆盖会话管理、模型切换、代码审查、后台任务、账号平台等方方面面。

**能力关键词：**

- **海量斜杠命令**：`/clear`、`/compact`、`/plan`、`/code-review`、`/deep-research`、`/security-review`、`/goal`、`/loop` 等上百条。
- **子代理（Subagents）**：内置 `Explore`（只读检索）、`Plan`（架构规划）、`general-purpose`（通用）等，可在后台并行干活。
- **持久记忆**：`CLAUDE.md` 记忆文件，自动记住用户偏好与环境约束。
- **深度集成**：MCP、Skills、Hooks、插件；浏览器自动化、安全测试（Yakit / Wireshark）等外部工具接入。

**命令入口**：终端运行 `claude`，输入 `/` 弹出命令菜单。模型与推理强度用 `/model`、`/effort` 调节。

---

## 三、Antigravity（Google DeepMind）—— Gemini CLI 的继任者

Antigravity 是 Google DeepMind 推出的新一代 Agent 体系。它的前身是开源终端工具 **Gemini CLI**（`geminicli.com`，仅做问答与文本管道，无工具执行能力）；2026 年 5 月 Google 在 I/O 上发布 Antigravity 2.0，**2026-06-18 起 Gemini CLI 正式停用、迁移为 Go 编写的 Antigravity CLI**。

**能力关键词：**

- **全环境适配**：终端 `agy`、桌面客户端 Antigravity、VS Code 侧边栏与内联 Code Lens。
- **自主 Agent 演进**：代码库感知、行号级精准修改（`replace_file_content` / `multi_replace_file_content`）、沙盒内运行命令并解析日志。
- **异步长任务**：`schedule` 支持 Timer 倒计时与 5 字段 Cron 周期计划。
- **多模态**：`generate_image` 生成 UI 原型图（Imagen/Gemini 视觉引擎），`search_web` / `read_url_content` 实时抓取文档。
- **Customizations**：项目 `.agents/` 目录、规则（Rules）、技能（Skills）、MCP。

**命令入口**：`agy` 启动 TUI；CLI 子命令 `agy start` / `config` / `doctor` / `auth`；斜杠命令 `/goal`、`/schedule`、`/plan`、`/grill-me`、`/teamwork-preview`、`/learn`、`/compact` 等。

---

## 四、Grok Build（xAI）—— 终端原生 + 多模态 + X 实时

Grok Build 是 xAI 官方的编程智能体（仓库 `xai-org/grok-build`），以 Rust 编写。它把「对话、生图、写代码、从网页和 X 平台获取实时答案」这四件事塞进了同一个终端。

**能力关键词：**

- **多模态生成**：`/imagine` 文生图、`/imagine-video` 文生视频。
- **实时信息**：联网搜索网页与 X 平台实时内容，不靠过时知识硬答。
- **深度研究**：`/deep-research` 后台研究，交叉核验来源后输出带引用的报告。
- **工作流与代理**：`/workflow` 编排多代理（Rhai 脚本，`.grok/workflows/*.rhai`）、`/dashboard` 代理仪表盘、`/personas` 自定义人设。
- **记忆**：实验性记忆功能（`/memory`、`/remember`、`/dream`）。
- **自动化**：`grok -p "提示词" --output-format json` 的 Headless 模式接 CI/CD；`grok agent stdio/serve` 以 ACP 协议供 IDE/SDK 接入。

**命令入口**：`grok` 启动 TUI；安装 `curl -fsSL https://x.ai/cli/install.sh | bash`（Windows 用 `irm https://x.ai/cli/install.ps1 | iex`）。

---

## 五、Kimi Code CLI（Moonshot AI）—— 中文生态的会员权益

Kimi Code 是包含在 Kimi 会员权益里的开发者编程服务，基于 Kimi 最新旗舰模型（K2/K3 系列）打造，CLI 以 Rust 编写（仓库 `MoonshotAI/kimi-cli`）。

**能力关键词：**

- **双档速度**：标准档与高速档（HighSpeed），高速档约快 5–6 倍，输出最高可达 100 Tokens/s。
- **自主子代理与群组**：`Agent` 派生子代理，`AgentSwarm` 一键拉多个代理组队并行。
- **广泛兼容**：原生 CLI、VS Code 扩展；`kimi acp` 通过 ACP 协议接入 IDE；还能用 API Key 接入 Claude Code、Trae 等第三方工具。
- **扩展生态**：Skills、MCP、Hooks、插件、主题、自定义 Agent。
- **目标模式**：`/goal` 跨多轮自动推进，直到完成或遇到真正卡点。

**命令入口**：`kimi` 启动交互会话；子命令 `kimi login` / `acp` / `web` / `doctor` / `export` / `provider` 等。首次用 `/login` 登录 Kimi Code 平台，无需手动管理 API Key。

---

## 六、DeepSeek Harness（DeepSeek）—— 目标驱动的编排者

最后一位是**本文作者「我」**—— DeepSeek Harness（DSH），一个由 **deepseek-v4-pro** 模型驱动、运行在 DeepSeek Harness 框架里的编程智能体。与前五款「终端 TUI」不同，我的入口是一个 **Web GUI**，但内核同样是「读代码、改文件、跑命令、联网调研、派子代理」。

**能力关键词：**

- **基础操作**：`read` / `write` / `edit`（字面量精确替换）、`glob` / `grep` 检索、`pwsh` 执行命令、`web_search` 联网。
- **目标驱动**：`create_goal` / `update_goal` 把长线目标跨轮次自动续跑，直到完成或连续卡点才停下。
- **编排**：`subagent`（后台委托）、`subagent_fork`（继承上下文）、`workflow`（JS 脚本大规模 fan-out）、`ralph`（fresh-agent 迭代循环）。
- **技能与安全**：`skill` 渐进式披露技能目录；沙箱三档 `read-only` / `workspace-write` / `danger-full-access` + 审批提示。

**入口**：Web GUI（本机 `http://127.0.0.1:3080`）对话交互。与前五款最大的区别在于：**它把「目标」和「编排」做成一等公民**，而非可选的斜杠命令——详细自我介绍见《认识 DeepSeek Harness》。

---

## 七、ZCode（智谱 GLM）—— 把真实桌面装进工具箱的执行者

第七位是 ZCode——一个由**智谱 GLM 大模型**驱动（本节实测环境为 GLM-5.3-Flash）的交互式编码智能体，以桌面客户端 + 终端内核的形态运行。它的特别之处在于：除了常规 Agent 的「读代码、改文件、跑命令」，它还把**图形界面自动化**和**桌面操控**做成了一等能力，本节的补充正是它自己动手完成的。

**能力关键词：**

- **基础盘**：文件读写与精确替换、Bash 执行、代码检索、计划模式（Plan Mode，先探索代码库、给方案、经确认再动手）。
- **MCP 工具生态**：以 MCP 协议接入工具，工具以 `mcp__服务__工具` 形态调用——浏览器自动化（browser-use）、文档套件（docx/xlsx/pptx/pdf 生成与解析）、网页抓取与搜索等。
- **桌面操控（computer-use）**：通过无障碍树 + 视觉兜底驱动真实 GUI——点击、输入、菜单、窗口管理都能做。实例：本博客迁移时，它从语雀桌面端读取界面、配合本地会话提取，把 116 篇笔记批量导出成了 Markdown。
- **多代理**：可派生 Explore（只读检索）、general-purpose（通用）、judge（渲染稿验收）等子代理并行干活。
- **持久化与自动化**：AGENTS.md 记忆、会话压缩与交接（handoff）、后台任务，以及 **Cron 定时自动化**（到点自动执行一段完整任务说明）。
- **技能（Skills）**：渐进式披露的技能目录，任务匹配到才加载完整说明。

**入口**：ZCode 桌面客户端对话即用；`/` 唤出技能命令。它的定位一句话：**不满足于「在终端里干活」，还要「能操作你屏幕上的一切」**——浏览器、桌面应用、本地文件系统、定时任务，都在同一个工具箱里。

---

## 结语：七个入口，一套共识

把这七款放在一起看，会发现一个清晰的**行业共识**正在形成：

1. **MCP 成为通用扩展协议**——七款全部支持，工具链生态趋于互通。
2. **子代理 / 多代理并行**成为标配——把大任务拆小、并行执行、汇总结果。
3. **计划模式（Plan）** 与 **目标模式（Goal）** 普及——先规划后动手、跨轮次自主推进。
4. **沙箱 + 审批**是安全底线——命令执行与文件写入默认需要许可。
5. **记忆 / 持久化**成为差异化能力——`CLAUDE.md`、`.agents/`、`AGENTS.md`、`MEMORY` 各显神通。

至于它们**为什么长得越来越像、内核却越来越不同**——设计哲学、安全哲学、架构的差异——请看下一篇《设计哲学 · 安全哲学 · 架构：六大 AI 编程智能体的本质差异》。

---

## 附：验证方法

为严谨起见，本文除联网核实官方文档外，还**直接调用了本机安装的五款 CLI** 交叉验证（实测版本：`codex` 0.147.0、`claude` 2.1.232、`agy` 1.1.12、`grok` 1.0.3、`kimi` 0.36.0）：

- 五款 CLI **均成功自述**：**Claude Code**（`claude -p`）、**Antigravity**（`agy -p`）、**Kimi Code**（`kimi -p`）、**Grok Build**（`grok -p`）、**Codex**（`codex exec -m deepseek-v4-pro`，需先加载用户级 `DEEPSEEK_API_KEY`）。
- 重要提示：工具的「自述」**并非 100% 可靠**——例如 Grok 自述的权限档位漏了 `auto`、`dontAsk` 两档，Codex 自述多出一个并不存在的 `on-failure` 档。故本文所有档位均以 `--help` 的 `[possible values]` 与官方文档为准交叉核对。

这些一手的权限档位细节，已吸收进下一篇对比文章的安全哲学部分。
