---
title: 设计哲学 · 安全哲学 · 架构：六大 AI 编程智能体的本质差异
permalink: ai-coding-agents-compare/
date: 2026-08-14 14:00:00
tags:
  - AI编程
  - Agent
  - Codex
  - Claude Code
  - Antigravity
  - Grok
  - Kimi Code
  - DeepSeek
  - 架构设计
categories:
  - AI工具
keywords: AI编程智能体对比, 设计哲学, 安全哲学, 架构差异, Codex, Claude Code, Antigravity, Grok Build, Kimi Code, DeepSeek Harness, 沙箱, MCP, 子代理, 记忆
img: /medias/featureimages/21.jpg
---

> 五款主流编程智能体（加上 DeepSeek Harness 共六款）表面功能高度趋同，内里却遵循着六套完全不同的设计哲学、安全哲学与架构取舍。这篇文章把这六套「世界观」并排摊开，看它们在哪里分道扬镳。

---

## 前言：功能趋同，哲学分歧

如果只看功能清单，你会以为 Codex、Claude Code、Antigravity、Grok Build、Kimi Code 是同一款产品的六个皮肤——它们都有 TUI、都支持 MCP、都能派生子代理、都带计划模式、都做了沙箱。

但真正决定一个工具「手感」的，是藏在功能之下的三样东西：**设计哲学**（它相信怎样的工作流）、**安全哲学**（它如何界定「信任边界」）、**架构**（它用什么语言、什么形态承载这一切）。本文逐一拆解。

---

## 一、设计哲学：加法、减法、平台化与编排

### 1. Codex —— 「减法」哲学

Codex 走的是**克制路线**：一个极简的 agent loop，读 → 改（patch）→ 跑 → 验证，每个环节都最小化干预。它的补丁式改动强调「只动该动的地方」，把「精确」放在「快速」之前。这对应 OpenAI 对 Agent 的理解——**让机器可靠地执行，而不是堆砌花哨命令**。

### 2. Claude Code —— 「加法」哲学

与 Codex 相反，Claude Code 是**做加法**：上百条斜杠命令、内置技能（Skill）、子代理、多代理工作流、云端代码审查……它相信「能力多总没错」，把选择的权力交给用户。代价是学习曲线更陡，但对重度用户来说，「什么都能干」本身就是价值。

### 3. Antigravity —— 「平台化」哲学

Antigravity 不满足于做一个 CLI，它是一条**产品家族**：IDE + CLI + SDK + Managed Agents。它相信 Agent 应该渗透到开发的每个入口，从终端到桌面到云端托管。这种「全家桶」思路继承了 Google 的平台基因（Vertex、Gemini、Imagen 全家联动）。

### 4. Grok Build —— 「终端原生 + 多模态」哲学

Grok Build 的核心是把 xAI 的「实时信息 + 多模态生成」基因搬进终端：`/imagine` 生图、`/imagine-video` 生视频、联网读 X 平台实时内容。它相信**一个终端里既要有代码，也要有世界**——编程只是 Grok 大模型能力的一个切面。

### 5. Kimi Code —— 「会员权益 + 兼容」哲学

Kimi Code 的定位很务实：**它是 Kimi 会员的一部分**，主打「中文生态 + 高性价比 + 广泛兼容」。双档速度（标准/高速）是在「质量 vs 成本」之间给用户一个旋钮；`kimi acp`、API Key 兼容第三方工具则体现了「不绑架用户」的姿态。

### 6. DeepSeek Harness —— 「目标驱动 + 编排」哲学

本文作者「我」—— DeepSeek Harness——相信的是**目标（Goal）与编排（Orchestration）**：把一个长线目标拆成多轮自动推进（goal 工具），把大型任务用 `workflow` 脚本 fan-out 给一批子代理并行，把需要全新视角的工作交给 `ralph` 循环。它的设计重心不是「单次问答多强」，而是 **「如何可靠地把一个大目标跑完」**。

> 一句话概括：Codex 做减法，Claude 做加法，Antigravity 做平台，Grok 做多模态终端，Kimi 做会员权益，DeepSeek Harness 做目标编排。

---

## 二、安全哲学：六套不同的「信任边界」

安全哲学的本质是回答一个问题：**在把终端和文件系统交给 AI 之前，你愿意在多大程度上「先授权、后执行」？**

> 严谨性说明：本节六款的权限/沙箱档位，为**直接调用本机 CLI 自述 + `--help` 交叉核对**所得（`codex` / `claude -p` / `agy -p` / `grok -p` / `kimi -p`），比二手资料更贴近实际。工具自述可能存在小偏差（漏档、多档），故一律以 `--help` 的 `[possible values]` 为准。

### 1. 沙箱分级

| 工具 | 沙箱/权限档位 |
|---|---|
| Codex | `read-only` / `workspace-write` / `danger-full-access`（官方文档） |
| DeepSeek Harness | 同三档：`read-only` / `workspace-write` / `danger-full-access` |
| Grok Build | `workspace` / `read-only` / `strict` / `project` 四档 |
| Claude Code | OS 级沙箱（macOS/Linux 可选）+ 权限模式四档 |
| Antigravity | 工具执行策略四档，其中 `proceed-in-sandbox` 为沙箱隔离档 |
| Kimi Code | 权限三档 `manual` / `yolo` / `auto`（无独立沙箱档，靠 Plan + 规则补充） |

Codex 与 DeepSeek Harness 的三档命名几乎一致（`danger-full-access` 这个名字本身就是强烈的安全信号），体现的是「**默认最小权限，逐级放开**」的共同理念；Claude Code 与 Antigravity 则把「沙箱」做成了权限模式中的**一个可选项**，而非独立的沙箱档位。

### 2. 审批模式与「YOLO」

所有工具都提供「自动批准」开关，但**档位命名与语义差别很大**：

- **Codex**：审批策略 `untrusted` / `on-request` / `never`，另有极度危险的 `--dangerously-bypass-approvals-and-sandbox`（别名 `--yolo`）。
- **Claude Code**：`--permission-mode` 四档——`default`（敏感操作逐个询问）/ `acceptEdits`（自动接受文件编辑）/ `plan`（只读规划）/ `bypassPermissions`（跳过所有审批），再叠加可选的 OS 级沙箱。
- **Antigravity**：工具执行策略（Tool Execution Policy）四档——`always-proceed`（自动执行）/ `request-review`（请求审核）/ `strict`（严格限制）/ `proceed-in-sandbox`（沙箱隔离运行），配合文件与网络的 `allow` / `ask` / `deny` 三级。
- **Grok Build**：`--permission-mode` 六档——`default`（逐次询问）/ `acceptEdits`（自动接受编辑）/ `auto`（分类器自动批准安全操作）/ `dontAsk`（不询问）/ `bypassPermissions`（跳过所有审批）/ `plan`（只读规划），另配 `--sandbox` 沙箱档（`workspace` / `read-only` / `strict` / `project`）。
- **Kimi Code**：权限三档——`manual`（每次询问，默认）/ `yolo`（自动批准常规调用）/ `auto`（完全自主），辅以 Plan 模式与静态 `permission.rules`（allow/deny/ask）。
- **DeepSeek Harness**：审批提示（approval prompts）+ 沙箱三档，PowerShell 在只读态下运行于 ConstrainedLanguage 约束模式。

**关键区别**在于「放权」的**建模方式**：Codex 和 DeepSeek Harness 用「**沙箱档位 + 审批策略**」两层模型（沙箱管「能碰哪里」，审批管「何时问」），把风险前置、默认最小权限；Claude Code / Grok / Antigravity 则收敛到**同一个「权限模式」枚举**（`default` / `acceptEdits` / `plan` / `bypassPermissions` 这一套命名几乎互通），把沙箱做成其中的一个可选项；Kimi 最简，只有 `manual` / `yolo` / `auto` 三档。**前者更保守、更分层，后者更统一、更可组合**——这是安全哲学上最直观的分野。

### 3. 钩子与「事前约束」

- Codex、Claude Code、Grok Build、Kimi Code 都支持 **Hooks**：在工具调用前后插入自定义脚本，强制拦截危险操作。
- Codex 的 `--dangerously-bypass-hook-trust` 和 Grok 的 `/hooks-trust` 都提示「钩子信任」是一个需要显式维护的边界。
- Claude Code 独有 **`/security-review`** 命令：审查分支改动中的注入、越权等安全漏洞，把「安全」本身做成一个产品功能。

---

## 三、架构：语言、扩展、多代理与记忆

### 1. 实现语言

| 工具 | 实现语言 |
|---|---|
| Codex | Rust |
| Claude Code | TypeScript / Node.js |
| Antigravity CLI | Go（前身 Gemini CLI 为 Node） |
| Grok Build | Rust |
| Kimi Code | Rust |
| DeepSeek Harness | 编排框架（宿主侧，与模型/工具解耦） |

一个有趣的现象：**Rust 正在成为新一代编程 Agent 的默认选择**（Codex、Grok、Kimi 三家都选了 Rust），看重的是单二进制分发、启动快、跨平台一致。而 Claude Code 仍扎根 Node（npm 生态），Antigravity 则用 Go 重写以换取更轻的部署与并发。

### 2. 扩展机制：MCP 之上，各有私货

MCP（Model Context Protocol）是六款的**公约数**。但在此之上，各家各有私货：

- **Skills（技能）**：Claude Code、Codex、Grok、Kimi、Antigravity、DeepSeek Harness 全部支持，本质是「按需加载的专业工作流」。
- **Plugins（插件）**：Codex（含 Marketplace）、Claude Code、Grok、Kimi 支持，可安装/热重载。
- **Hooks（钩子）**：Codex、Claude Code、Grok、Kimi 支持生命周期拦截。
- **Workflow（脚本化编排）**：Grok 用 **Rhai 脚本**（`.grok/workflows/*.rhai`）；DeepSeek Harness 用 **JavaScript 脚本**编排子代理（`workflow` 工具）。这是「可编程的编排层」在终端 Agent 里出现的标志。

### 3. 多代理模型：四种「派活」方式

| 工具 | 多代理机制 |
|---|---|
| Claude Code | 子代理（Explore/Plan/general-purpose）+ 多代理工作流 |
| Codex | 子代理 + Codex Cloud 云端任务 |
| Antigravity | Subagents（research/self/custom） |
| Grok Build | 子代理 + Rhai 工作流 + 代理仪表盘 + personas 人设 |
| Kimi Code | Agent + **AgentSwarm**（一键组队） |
| DeepSeek Harness | `subagent` / `subagent_fork`（继承上下文）+ `workflow`（大规模 fan-out）+ `ralph`（fresh-agent 循环） |

差异点：**Grok 的「人设（personas）」** 和 **Kimi 的「AgentSwarm」** 强调「一群不同性格的代理协作」；而 **DeepSeek Harness 的 `subagent_fork`** 强调「子代理继承父对话的完整上下文」，`workflow` 则强调「脚本化的批量并行」——三种「派活」范式对应三种不同的团队协作隐喻。

### 4. 记忆 / 持久化：文件名的战争

| 工具 | 记忆机制 |
|---|---|
| Claude Code | `CLAUDE.md` + 自动记忆 |
| Codex | `AGENTS.md` + Memories |
| Antigravity | `.agents/` 目录 + Rules |
| Grok Build | 实验性 Memory（`/memory`、`/remember`、`/dream`） |
| Kimi Code | `AGENTS.md`（`/init` 生成） |
| DeepSeek Harness | 工作区持久记忆 + Goal 状态（跨轮次续跑） |

各家都选择了「**仓库内一个 Markdown 文件**」作为持久指令载体，只是文件名不同（`CLAUDE.md` vs `AGENTS.md` vs `.agents/`）——这正在成为一个需要社区对齐的「事实标准」问题。

### 5. 自动化 / CI

- Codex：`codex exec` + SDK + GitHub Action + Scheduled tasks。
- Claude Code：`/schedule` 定时例程、云托管会话。
- Grok Build：`grok -p ... --output-format json` / `streaming-json` 的 Headless 模式 + ACP。
- Kimi Code：`kimi -p ... --output-format stream-json` + `kimi acp`。
- Antigravity：`agy` 非交互 + SDK。
- DeepSeek Harness：后台作业（`job_list` / `job_output` / `job_kill`）+ 子代理后台执行 + 目标自动续跑。

---

## 四、其他值得注意的差异

- **商业模式**：Claude Code（Claude 订阅）、Kimi Code（Kimi 会员）、Grok（X Premium / API）、Codex（ChatGPT / API）、Antigravity（Google AI / Vertex）。**「订阅绑定」还是「API 计费」**，决定了工具的开放程度。
- **中文生态**：Kimi Code 是唯一把「中文文档 + 中文会员」做成核心卖点的；Claude Code / Codex 的中文体验依赖社区。
- **云与本地**：Codex Cloud、Antigravity Managed Agents、Claude Code 云托管，都指向「**终端跑不动，云端接着跑**」的趋势；Grok / Kimi / DeepSeek Harness 则更强调本地可控。

---

## 结语：没有「最好」，只有「最合」

六款工具的本质差异，可以浓缩成三个问题：

1. **你要的是克制还是全能？**（Codex 的减法 vs Claude Code 的加法）
2. **你要多保守的安全？**（Codex/DeepSeek 的「dangerously」前缀 vs Grok/Kimi 的一键 YOLO）
3. **你要单机还是平台？**（Antigravity 的全家桶 vs 各家单点 CLI vs DeepSeek Harness 的编排框架）

理解了这三问，你就能在「长得差不多」的表象下，真正读懂每一款工具，也就能为手里的项目挑到最顺手的那一个。

---

## 参考资料

本文除官方文档与直接调用本机 CLI 自述外，还参考了以下「harness 对比」类文章：

- [The Post-Google I/O Coding Agent Landscape: Codex CLI vs Antigravity 2.0 vs Claude Code vs Grok Build](https://codex.danielvaughan.com/2026/05/20/post-google-io-coding-agent-landscape-codex-antigravity-jules-claude-grok/) —— Google I/O 后五大编码 Agent 格局横评。
- [Antigravity CLI vs Claude Code vs Codex: The Terminal Agent Field Guide (July 2026)](https://www.developersdigest.tech/blog/antigravity-cli-vs-claude-code-vs-codex-2026) —— 三款终端 Agent 的实战指南。
- [Codex CLI and Claude Code Compared: April 2026 Architecture Deep Dive](https://codex.danielvaughan.com/2026/04/09/codex-cli-vs-claude-code-architecture/) —— Codex 与 Claude Code 架构深挖。
- [Claude Code、Codex、Cursor、OpenCode Harness 架构与执行逻辑深度对比](https://developer.aliyun.com/article/1742597) —— 中文圈对多款 harness 的执行逻辑拆解。
- [71,700 Stars and 60 Rust Crates: Inside OpenAI's Codex CLI Source](https://dev.to/ji_ai/71700-stars-and-60-rust-crates-inside-openais-codex-cli-source-363i) —— Codex CLI 源码结构（60 个 Rust crate）解析。
- [From editor to agent management — Google Antigravity 2.0 marks the arrival of the Agent OS](https://dev.to/okikusan-public/from-editor-to-agent-management-google-antigravity-20-marks-the-arrival-of-the-agent-os-4816) —— Antigravity 2.0 的「Agent OS」定位。
- [Chorus: 分析 OpenAI Codex 与 Anthropic Claude Code 的 harness 结构收敛](https://github.com/Chorus-AIDLC/Chorus/blob/main/docs/notes-externalization-llm-agents.md) —— 核心洞见：两家产品表面差异显著，却收敛到惊人相似的 harness 结构集。
