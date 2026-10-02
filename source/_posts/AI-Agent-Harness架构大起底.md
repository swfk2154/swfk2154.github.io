---
title: Agent Harness 架构大起底：14 款编程智能体的设计哲学对决
permalink: ai-agent-harness-architecture/
date: 2026-08-31 13:40:00
updated: 2026-08-31 13:40:00
tags:
  - AI编程
  - Agent
  - Harness
  - 架构
  - Codex
  - Claude Code
  - Antigravity
  - Grok Build
  - OpenCode
  - OpenClaw
  - DeepSeek
categories:
  - AI工具
keywords: Agent Harness, Codex, Claude Code, Antigravity, Gemini CLI, Grok Build, OpenCode, OpenClaw, Pi, Hermes, DeepSeek Harness, Kimi Code, ZCode, ChatGPT桌面版, 架构对比, 设计哲学
img: /medias/featureimages/20.jpg
---

> 同一个模型，套上不同的身体和装备，干完全不一样的活。上一篇《AI 编程智能体七合一全景》盘了各家能干什么，这一篇拆它们**内部怎么干**——14 款 Agent 的 harness 架构选型与设计思想一次讲透。文中所有开源状态均经逐项核实（包括两处曾被广泛误传的事实）。

---

## 前言：Agent = Model + Harness

2026 年的行业共识已经收敛成一个公式：

```
Agent = Model + Harness
```

**Model 是大脑**——GPT、Claude、Gemini、GLM，负责理解和推理。
**Harness 是大脑之外的一切**——系统提示词、工具定义、编辑格式、上下文管理、错误处理、重试逻辑、安全边界、通信协议……就是给模型套上的那套装备。

一个反直觉的证据：开发者 Can Bölük 做过一组实验，把编辑工具的格式从 `str_replace` 换成自己发明的 `hashline`，**什么模型都没换**，Grok Code Fast 1 的成功率直接从 6.7% 飙到 68.3%——翻了十倍。你拿最新的模型升级，能涨几个点？Martin Fowler 给过一个精辟定义：**Harness = Guides（前馈控制）+ Sensors（反馈控制）**。Guides 在 Agent 行动前引导它做对，Sensors 在行动后帮它自我纠正。

先上总览表（⚠️ 开源状态已逐项审计修正，详见下文）：

| Agent | 厂商 | 流派 | harness 开源 | 模型 |
|---|---|---|---|---|
| Claude Code | Anthropic | 厂商闭环 | ❌ 闭源 | Claude（闭源） |
| Claude Desktop | Anthropic | 厂商闭环 | ❌ 闭源 | Claude（闭源） |
| Codex | OpenAI | 厂商闭环 | ✅ Apache-2.0（接受社区 PR） | GPT（闭源） |
| ChatGPT 桌面版 | OpenAI | 厂商闭环 | ❌ 闭源（底层 harness 单独开源） | GPT（闭源） |
| Gemini CLI | Google | 厂商闭环 | ✅ Apache-2.0（个人已停服） | Gemini（闭源） |
| Antigravity | Google | 厂商闭环 | ❌ 闭源 | Gemini（闭源） |
| Grok Build | xAI | 厂商闭环 | ✅ Apache-2.0（**只读**，PR 禁用） | Grok（闭源） |
| Kimi Code | Moonshot | 厂商闭环 | ✅ 开源 | Kimi（闭源） |
| ZCode | 智谱 Z.ai | 厂商闭环 | ❌ 闭源 | GLM-5.2（**MIT 开放权重**） |
| OpenCode | SST/Anomaly | 开源中立 | ✅ MIT | BYOK 任意 |
| OpenClaw | 基金会治理 | 开源中立 | ✅ MIT | BYOK 任意 |
| Pi | 社区 | 特殊路线 | ✅ 开源 | BYOK 任意 |
| Hermes | — | 特殊路线 | ❓ 未核实 | — |
| DeepSeek Harness | DeepSeek | 插件化生态 | ✅ MIT | BYOK 任意 |

**注意：「厂商闭环」指深度绑定自家模型生态，不等于闭源**——Codex CLI 和 Grok Build 的 harness 都是 Apache-2.0 开源的。开源与否要拆两层看（harness 一层、模型一层），甚至要拆三种（接受 PR 的开源、只读开源、闭源）。

---

## 一、四大流派：它们对世界的不同回答

### 厂商闭环型：模型与 harness 联合调优

**Claude Code —— 本地工匠：全程透明。** 终端原生 ReAct 循环、每步破坏性操作弹审批门、每步动作都有日志、子代理 + Skills + Hooks。npm 包为专有 license，GitHub 仓库只含安装脚本和 issue 跟踪，**无产品源码**。哲学：透明与可控优先，你永远知道它在干什么。

**Codex —— 云端工厂：流水线并行。** OS 级沙箱（macOS Seatbelt / Linux seccomp），app-server 统一 JSON-RPC 协议，云端多 Agent 并行出 PR。**harness 是 Apache-2.0 开源的**，仓库即产品源码，96% Rust 单静态二进制便于审计；模型闭源。哲学：harness 工程化，环境本身就是产品。

**ChatGPT 桌面版 —— 三合一超级应用。** 2026 年 7 月 Codex App 并入后的形态：Chat / Work / Codex 三模态同窗。Codex 模块经 OS API 直取本地仓库、git 历史、终端——这是浏览器沙箱做不到的，也是它区别于网页版的核心架构点。多仓库项目、PR 审阅进侧边栏、Computer Use、与 Work/Excel 共享额度池。哲学：聊天办公编程一个窗口全干完，本地权限与云端数据分离。

**Gemini CLI —— 瑞士军刀：什么都带。** 1M token 上下文、限额自动降级换小模型、shadow-git 检查点可回滚、A2A 多 Agent 协议。harness 是 Apache-2.0 开源——**但 2026-06-18 起个人免费及 AI Pro/Ultra 用户已停止服务**，个人用户被迁移到闭源的继任者，仓库转入企业维护。哲学：大而全，吸收各家精华（个体免费时代已终结）。

**Antigravity —— 动态拉施工队的包工头。** Google 出品，Go 重写（取代 Node 版 Gemini CLI，2026-05-19 起全面可用）。异步多智能体：自动 spawn 前端、后端、测试专用子代理；闲时定时后台任务；公开 SDK 与内部同款 harness；CLI 与桌面 IDE 同引擎同步发版。**关键反转：它闭源了**——Gemini CLI 的开源路线在此中断，社区对此强烈不满（官宣帖 291 踩 6 赞）。哲学：你只管下需求，施工队它自己组。

**Grok Build —— 全屏鼠标点选的车间。** 约 84.5 万行 Rust，全屏鼠标交互 TUI（像 htop/lazygit，不是滚动日志流）。三种模式：交互 TUI + headless 跑 CI + ACP 嵌入编辑器。并行子代理最多 8 个，`config.toml` 可指向 Ollama 本地推理。代码中含自 openai/codex 和 sst/opencode 的移植（THIRD_PARTY_NOTICES 有记录）。**开源状态最微妙**：Apache-2.0 是真的，但「只读」——外部 PR 与 issue 均禁用，内部 monorepo 定期同步公开镜像。开源动因是 2026-07 隐私危机（被抓到整仓上传 git 数据后以「读代码自查」回应）。哲学：开源是「给你读」不是「给你改」。

**Kimi Code —— 最干净的洋葱：三层分明。** kosong（LLM 抽象）/ kaos（OS 抽象）/ agent-core（循环）三层分离；事件溯源 + 可视化回放调试器；缓存感知压缩——压缩历史前先算 prompt 缓存的经济学；ACP 协议接 Zed；TUI 基于 Pi 的 UI 库。源码可读。哲学：分层干净 + 成本敏感，模型便宜活也细。

**ZCode —— 国产合规的一站式车间。** 智谱出品，深度绑定 GLM-5.2（MIT 开放权重，753B，SWE-bench Pro 62.1%）。Goal Mode 把目标做成持久化可恢复对象，不达验收不停手；Subagents 并行；微信/飞书远程 Bot 管控；闲时任务调度；上下文缓存命中率 >98%；Zread 自动梳理代码库成知识库。harness 免费但闭源。哲学：目标即任务对象，数据不出境。

### 开源中立型：harness 是家，模型只是租客

**OpenCode —— 万能插座。** server-first：核心是个 HTTP server（带 OpenAPI spec），TUI、桌面端、Web UI、GitHub bot 全是薄客户端。75+ 家模型 BYOK，MIT 协议可 fork 可自托管。把「计划模式」「子代理」表达成纯权限规则集而非硬编码模式，git 检查点 + 事件溯源 V2 重构中。哲学：harness 是家，模型只是运行时的选择。

**OpenClaw —— 永不下班的员工。** MIT 开源（OpenClaw 基金会治理，OpenAI/NVIDIA/微软/腾讯赞助）。心跳调度 24/7 常驻，不等你说就主动干活；WebSocket 网关接入 WhatsApp、Telegram、Slack；TaskFlow 多 Agent 编排带溯源。哲学：proactive——不是 reactive。

### 特殊路线：不参加同一场比赛

**Pi —— 极简修行者。** 约 2700 行最小内核，却被 Kimi Code 和 OpenClaw 团队当过地基。session-as-tree：每次操作是节点，分支和时间旅行免费；40+ provider 一套抽象；TTSR 规则按需注入不占上下文；无沙箱无权限弹窗。哲学：少即是多——拒绝功能，一切推给扩展。

**Hermes —— 会成长的学徒。** 自改进循环、跨会话持久记忆、偏研究工作流。公开资料对其具体实现和许可描述最少，开源状态未核实，此处如实存疑。哲学：越用越懂你，记忆即人格。

### 插件化生态：harness 即平台

**DeepSeek Harness —— 乐高积木。** 独立开源项目（MIT）。Cordis 内核只管插件装卸，**模型、工具、沙箱、存储、Agent 循环甚至 UI 全是可替换插件**——改配置不改核心。PTC 模式让模型一次生成 TypeScript 程序批量调工具，砍掉「模型→工具→结果→模型」的来回轮次；Trajectory 追加式日志写入系统提示、工具调用、结果与子 Agent 调度，支持回放、分支、检索。哲学：一切皆插件。

---

## 二、Harness 七层解剖：差别全在选型上

每一家 Agent 都是这套骨架：

**1. 模型层** —— Claude / Codex / Gemini / Grok 锁自家模型，模型和 harness 联合训练；Kimi Code / ZCode 走国产厂商路线；OpenCode / OpenClaw / Pi / DeepSeek 走 BYOK 多模型解耦。

**2. 工具层（最隐蔽的胜负手）** —— Codex 的 `apply_patch` 自创 diff 格式，自家模型原生会，别家模型失败率高；Claude Code 的 `str_replace` 要求模型逐字符复现原文（含空格缩进）；Pi 的 `hashline` 每行带短哈希标签，换格式不换模型，弱模型获益最大，Grok 4 Fast 输出 token 还降了 61%。JetBrains 的 EDIT-Bench 也证实：**没有任何一种编辑格式在所有模型和场景下都占优**。

**3. 循环层** —— 大多数用标准 ReAct；DeepSeek 的 PTC 一次生成程序批量调工具；Claude Code 的 Ralph Loop 用 hook 拦截退出、重新注入提示逼它继续干；ZCode 的 Goal Mode 把目标持久化，计划→实现→测试→修复循环直到验收。

**4. 上下文层** —— Gemini 用 1M token 硬扛 + 限额自动换小模型；Claude Code 靠缓存 + 压缩 + `/recap` 恢复；Pi 的 TTSR 规则只在输出匹配特定模式时才注入，平时零占用。

**5. 沙箱层** —— Codex 是 OS 级隔离（断网默认），沙箱是架构不是补丁；Claude Code 是双层——权限审批 + 路径/域名黑名单；Pi / DeepSeek Minimal 不设防，交给操作系统；Gemini 用 shadow-git 检查点，出错可 `/rewind`。

**6. 记忆层（文件系统为王）** —— 通用做法是 AGENTS.md / CLAUDE.md 项目约定；DeepSeek 的 Trajectory 可回放可分支；Kimi Code 事件溯源 + 可视化调试器逐帧回放；Pi 的 session-as-tree 时间旅行免费；Hermes / OpenClaw 跨会话记忆 + TaskFlow 溯源；ZCode 的 Zread 自动梳理代码库。没有花哨的向量数据库——**生产级 harness 都把文件系统当首要状态机制**。

**7. 服务层** —— Claude Code 是 CLI stdio 单门面；Codex 的 app-server JSON-RPC 让 CLI/IDE/Web 同源；OpenCode 是 HTTP server，一切皆客户端；OpenClaw 是 WebSocket 网关全平台接入；ZCode 是 Electron + 微信/飞书远程 Bot；Kimi Code 用 ACP 直连 Zed。

---

## 三、按场景选 Agent 速查

| 场景 | 首选 | 次选 | 为什么 |
|---|---|---|---|
| 本地深度编码、复杂重构 | Claude Code | Codex | 审批门 + 子代理 + Skills，每一步透明可控 |
| 云端批量任务、并行出 PR | Codex | Gemini | OS 沙箱隔离 + 多 Agent 并行 + 自动生成 diff |
| 多模型 A/B 测试、不绑厂商 | OpenCode | Pi | 75+ provider 一键切换，BYOK 自由 |
| 24/7 自动化运维、消息触达 | OpenClaw | Hermes | 心跳调度 + WhatsApp/Slack 网关 |
| 学习 Agent 原理、自研 harness | Pi | DeepSeek | 2700 行可读内核 + session-as-tree |
| 需要深度插件化定制 | DeepSeek | OpenCode | Cordis 内核，模型/工具/沙箱全是插件 |
| 快速轻量查询、免费大方 | Antigravity | Grok Build | 个体免费额度大方；Grok 可接本地推理；Gemini CLI 已对个人停服 |
| 便宜跑量、日常编码 | Kimi Code | Gemini | 模型便宜且编码强 + 缓存感知压缩控成本 |
| 信创合规、数据不出境 | ZCode | DeepSeek | 全链路国产 + 微信/飞书远程管控 + 私有化部署 |
| 自改进、跨会话记忆进化 | Hermes | OpenClaw | 记忆即人格，越用越懂你 |
| GUI 聊天 + MCP 外挂 | Claude Desktop | ChatGPT 桌面版 | 人类在环，对话优先 |

---

## 四、设计思想的三条根本分歧

### 分歧一：你信不信任这个模型？

| 立场 | 代表 | 做法 | 代价 |
|---|---|---|---|
| 不信任 | Claude Code | 每步破坏性操作弹审批门 | 效率换可控，长任务里可能要按很多次 |
| 半信任 | Codex | 关在 OS 级沙箱里，里面随便折腾 | 沙箱有开销，本地交互需挂载 |
| 完全信任 | Pi | 不设沙箱不设弹窗，交给操作系统 | 极简极快，踩坑也是自己的 |

本质：Claude Code 是**人在环**，Codex 是**环境隔离**，Pi 是**工具极简**。没有对错，取决于你更怕误操作还是更怕效率低。

### 分歧二：任务状态怎么存？

| 策略 | 代表 | 机制 | 适合 |
|---|---|---|---|
| 无状态 / 可回放 | Codex | 不存中间状态，靠工具调用日志 + git worktree 重做 | CI/CD、云端批量 |
| 追加式日志 | DeepSeek | Trajectory 只读日志，可回放/分支/检索 | 审计、复盘、debug |
| 树形分支 | Pi | session-as-tree，回滚即换分支 | 探索性任务、反复试错 |
| 跨会话记忆 | Hermes / OpenClaw | 记忆持久化，唤醒时带着上次状态 | 长期陪伴、自进化 |

关键洞察：Codex / Claude Code 偏向「**任务即函数**」——跑完即结束；OpenClaw / Hermes 偏向「**Agent 即进程**」——活着就有状态。这是「工具」和「员工」的本质区别。

### 分歧三：扩展靠「文件约定」还是「运行时插件」？

| 方式 | 代表 | 怎么做 | 优缺点 |
|---|---|---|---|
| 文件约定 | Claude Code | SKILL.md / CLAUDE.md / Hooks 放项目目录 | 简单、版本控制友好，但只能换提示词和轻脚本 |
| 运行时插件 | DeepSeek | Cordis 内核动态装卸，一切皆插件 | 极强灵活性，但兼容性是大工程 |
| TS 扩展 | Pi | 零内置功能，全推给开发者写扩展 | 内核极小上限极高，上手门槛也高 |
| MCP 外挂 | Claude Desktop | 不内置能力，靠外部 MCP 服务器 | 生态互通，但配置复杂延迟高 |

趋势：DeepSeek / OpenCode 走「**harness 即平台**」——内核小生态大；Claude Code 走「**harness 即产品**」——开箱即用，扩展靠约定而非架构。

---

## 五、开源审计：两处曾被误传的事实

写这篇时逐项核对了开源状态，两个容易踩的坑：

**坑一：「厂商出品 = 闭源」。** Codex CLI 是 Apache-2.0 开源（仓库即产品源码，96% Rust），Grok Build 同为 Apache-2.0。但开源 harness 保护的是代码，**不是模型端点**——Gemini CLI 仓库至今仍是 Apache-2.0，个人用户却已被停服。

**坑二：「Apache-2.0 = 社区项目」。** Grok Build 的许可证是真的，但外部 PR 和 issue 全部禁用，只读镜像同步自内部 monorepo。开源分三种：**接受 PR 的开源**（Codex、OpenCode）、**只读开源**（Grok Build）、**闭源**（Claude Code、Antigravity）。评估「能不能赌上去」时，license 字符串已经不够用了。

---

## 六、一句话收束

这些 Agent 本质上是在回答同一个问题：**「AI 应该怎么被放进人类的工作流里？」**

- **Claude Code** 说：放在你手边，每一步都让你看见。
- **Codex** 说：放在云端工厂里，批量产出，你最后审查。
- **ChatGPT 桌面版** 说：聊天、办公、写代码，一个窗口全干完。
- **OpenClaw** 说：放在服务器上，它自己找活干。
- **Pi** 说：放在教科书里，让你看明白它怎么动。
- **DeepSeek** 说：放在乐高盒子里，你想怎么拼就怎么拼。
- **Kimi Code** 说：把车间每层都标清楚，便宜也能干精细活。
- **ZCode** 说：数据不出境，目标不达成不收工。
- **Antigravity** 说：把需求扔过来，施工队我自己组。
- **Grok Build** 说：门给你开，随便看——但扳手我自己攥着。

---

> **事实核查说明**：本文开源状态基于 npm registry license 字段、GitHub 仓库实测（2026-07-02 与 2026-08 数据）及多家独立评测交叉验证。快速变动项：Gemini CLI 个人停服（2026-06-18 起）、Grok Build 开源（2026-07-14 起）、ChatGPT 桌面版整合 Codex（2026-07 起）。Hermes 因公开资料不足，开源状态标注为未核实。版本判断请以各项目实际仓库为准。
