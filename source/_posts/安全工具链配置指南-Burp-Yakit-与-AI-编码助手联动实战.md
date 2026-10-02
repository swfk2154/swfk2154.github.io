---
title: 安全工具链配置指南：Burp、Yakit 与 AI 编码助手联动实战
permalink: security-tools/
date: 2026-06-01 16:00:00
updated: 2026-06-04 15:00:00
tags:
  - Burp Suite
  - Yakit
  - Claude Code
  - Codex Desktop
  - MCP
  - 工具配置
  - AI安全
categories:
  - 工具实践
keywords: Burp Suite, Yakit, Claude Code, Codex Desktop, MCP, AI安全, 渗透测试工具链, PortSwigger
summary: 真实记录 Burp Suite（PortSwigger 官方 MCP Server）与 Yakit 在 Claude Code / Codex Desktop 中的 MCP 配置全过程，包含踩坑记录、验证方法与可用工具速查。
top: false
img: /medias/featureimages/0.jpg
---

> 本文基于真实配置经验撰写，环境为 Windows 11 + bash shell。所有命令和路径均经过实际验证，目的是把"AI + 安全工具"的联动配置讲清楚、踩过的坑标出来。

---

## 一、整体架构

这套工具链的核心思路是：**通过 MCP（Model Context Protocol）协议，让 Claude Code / Codex Desktop 直接调用 Burp Suite 和 Yakit 的 API，实现"用自然语言驱动安全工具"的工作流。**

```
┌─────────────┐     MCP/SSE    ┌─────────────────────────┐
│             │ ◄─────────────►│  Burp Suite             │
│ Claude Code │                │  (PortSwigger MCP Server│
│ / Codex     │                │   @ 127.0.0.1:9876)     │
│             │     MCP/stdio  └─────────────────────────┘
│             │ ◄─────────────►┌─────────────────────────┐
│             │                │  Yakit / yaklang        │
└─────────────┘                │  (yak.exe mcp)          │
                               └─────────────────────────┘
```

**各组件作用：**

| 组件 | 来源 | 传输方式 | 监听地址 |
|------|------|----------|----------|
| **Burp MCP** | [PortSwigger/mcp-server](https://github.com/PortSwigger/mcp-server) | SSE | `http://127.0.0.1:9876/` |
| **Yaklang MCP** | Yakit 自带 yak 引擎 | stdio | 通过子进程交互 |
| **Claude Code** | Anthropic CLI | — | MCP Client |
| **Codex Desktop** | OpenAI Codex 桌面端 | — | MCP Client（`config.toml`） |

---

## 二、Burp Suite MCP 配置

### 2.1 前置条件

- Burp Suite Professional / Community 已安装并运行
- 从 [PortSwigger/mcp-server](https://github.com/PortSwigger/mcp-server) 获取 MCP Server（不是 BApp Store 插件）
- Claude Code 或 Codex Desktop 已安装

### 2.2 启动 MCP Server

Burp 的 MCP Server 以 **SSE（Server-Sent Events）** 方式暴露，默认监听：

```
Endpoint: http://127.0.0.1:9876/
Transport: SSE
```

启动方式（根据 PortSwigger/mcp-server 文档）：
1. 下载/克隆 [PortSwigger/mcp-server](https://github.com/PortSwigger/mcp-server) 仓库
2. 按仓库说明启动 MCP Server（通常为独立进程或集成到 Burp 扩展中）
3. 确认端口监听：
   ```bash
   netstat -ano | grep 9876
   ```

### 2.3 配置 Claude Code / Codex Desktop 连接

**不要**手动写 `.mcp.json` 文件——放在项目根目录或 `.claude/.mcp.json` 中均不被 Claude Code 读取。

使用 CLI 命令直接写入项目级配置：

```bash
claude mcp add --transport sse burp http://127.0.0.1:9876/
```

写入位置：`C:\Users\<用户名>\.claude.json` 中对应项目的 `mcpServers.burp` 字段。

最终生效的配置片段示例：

```json
{
  "projects": {
    "C:\\Users\\32550": {
      "mcpServers": {
        "burp": {
          "type": "sse",
          "url": "http://127.0.0.1:9876/"
        }
      }
    }
  }
}
```

#### 我的实际配置补充

我在 Codex Desktop 里不是直接写 Claude Code 的 `.claude.json`，而是把 Burp 注册到了 `C:\Users\32550\.codex\config.toml`。实际采用的是 **stdio 启动 Burp MCP proxy，再由 proxy 连接 Burp SSE 服务** 的方式：

```toml
[mcp_servers.burp]
type = "stdio"
command = 'D:\yingyong\BurpSuite\BurpSuite V2026.4.3\jre\bin\java.exe'
args = [
  '-jar',
  'C:\Users\32550\AppData\Roaming\BurpSuite\mcp-proxy\mcp-proxy-all.jar',
  '--sse-url',
  'http://127.0.0.1:9876'
]
```

这里有两个关键点：

- Burp Suite Professional 版本为 `2026.4.3`，直接复用 Burp 自带 JRE，避免系统 Java 版本不一致。
- `mcp-proxy-all.jar` 来自 Burp 的 MCP proxy 目录，本质上是把本地 SSE MCP 服务桥接成 Codex 可管理的 stdio MCP server。

### 2.4 验证是否生效

重启 Claude Code / Codex Desktop 后，检查工具列表中是否出现 `mcp__burp__*` 前缀的工具。若出现，说明连接成功。

也可用保底 Python 客户端验证：

```bash
python .claude/tools/burp_mcp_client.py --list
```

### 2.5 踩坑记录

| 坑点 | 说明 |
|------|------|
| `.mcp.json` 无效 | 放在项目根或 `.claude/.mcp.json` 均不被读取 |
| SSE 路径 | `/sse` 返回 404，根路径 `/` 才返回 sessionId |
| Bridge 方案失败 | Claude Code CLI 场景中，`npx supergateway` 和 `java -jar mcp-proxy-all.jar` 作为子进程启动均失败，**原生 SSE 才是正确方式**；Codex Desktop 场景可用 `config.toml` 托管 `mcp-proxy-all.jar` 再连接 SSE |
| 路径斜杠 | `claude mcp add` 可能用正斜杠创建新项目条目，导致与已有项目重复，需手动合并 `.claude.json` |

---

## 三、Yakit / yaklang MCP 配置

### 3.1 前置条件

- Yakit 已安装（示例路径：`D:\yingyong\yakit\Yakit.exe`）
- Yak 引擎已初始化（`yak.exe` 所在目录已确认）
- Yakit 项目数据库已创建（如 `default-yakit.db`）

### 3.2 配置方式

Yakit 的 MCP 通过 **stdio** 方式连接，调用本地 `yak.exe` 作为 MCP server。

使用 CLI 写入配置：

```bash
claude mcp add --transport stdio yaklang "D:\yingyong\yakit\yakit-projects\yak-engine\yak.exe" -- mcp
```

或手动在 `.claude.json` 的项目级配置中添加：

```json
{
  "projects": {
    "C:\\Users\\32550": {
      "mcpServers": {
        "yaklang": {
          "command": "D:\\yingyong\\yakit\\yakit-projects\\yak-engine\\yak.exe",
          "args": ["mcp"],
          "type": "stdio"
        }
      }
    }
  }
}
```

#### 我的实际配置补充

我在 Codex Desktop 里的实际配置同样写在 `C:\Users\32550\.codex\config.toml`，但没有只执行裸 `yak.exe mcp`，而是通过 `-t` 明确加载需要暴露给 AI 的工具域：

```toml
[mcp_servers.yaklang]
type = "stdio"
command = 'D:\yingyong\yakit\yakit-projects\yak-engine\yak.exe'
args = [
  "mcp",
  "-t",
  "codec,cve,httpflow,hybrid_scan,payload,port_scan,yak_document,yak_script,reverse_shell,http_fuzzer,brute,subdomain,crawler,dynamic,ssa,project_database"
]
```

这样做的好处是工具能力边界更清楚：需要 HTTPFlow、Fuzzer、端口扫描、Yak 脚本、SyntaxFlow/SSA 等能力时可以直接调用；不需要的能力就不暴露，后续排查也更容易定位是哪一类工具没有加载。

### 3.3 关键路径说明

| 路径 | 用途 |
|------|------|
| `D:\yingyong\yakit\yakit-projects\yak-engine\yak.exe` | Yak 引擎可执行文件，MCP server 入口 |
| `D:\yingyong\yakit\yakit-projects\default-yakit.db` | 默认项目数据库 |
| `D:\yingyong\yakit\yakit-projects` | Yakit home 目录 |

> 根据实际安装路径调整，以上为示例路径。

### 3.4 验证是否生效

重启 Claude Code / Codex Desktop 后，检查工具列表中是否出现 `mcp__yaklang__*` 前缀的工具。

常用验证命令（在 Claude Code / Codex Desktop 中直接调用）：

```
get_current_database_context
list_project_databases
query_yak_script
```

---

## 四、配置位置总结

| 场景 | 配置文件 |
|------|----------|
| Claude Code 项目级 | `C:\Users\<用户名>\.claude.json` → `projects["<项目路径>"].mcpServers` |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` |
| Codex Desktop | `C:\Users\<用户名>\.codex\config.toml` → `[mcp_servers.<name>]` |

> 优先级：Claude Code CLI 使用 `.claude.json`，Claude Desktop 使用 `claude_desktop_config.json`，Codex Desktop 使用 `.codex\config.toml`，三者配置文件不同，不互通。

---

## 五、Burp Suite 与 Yakit 对比

在配置之前，先厘清两者的定位和差异，方便按需选择或组合使用。

### 5.1 相同点

| 维度 | 说明 |
|------|------|
| **核心能力** | 都支持 HTTP/HTTPS 代理抓包、请求重放、主动/被动扫描 |
| **扩展生态** | 都有插件/脚本机制（Burp BApp / Yak 脚本） |
| **MCP 支持** | 都提供官方 MCP Server，可与 Claude Code / Codex Desktop 联动 |
| **工作模式** | 都支持拦截代理模式，可在浏览器与目标之间插入做分析 |
| **版本策略** | 都有免费版（Community / 社区版）和付费版（Professional / 企业版） |
| **目标场景** | 主要面向 Web 应用安全测试、API 测试、渗透测试 |

### 5.2 不同点

| 维度 | Burp Suite | Yakit |
|------|-----------|-------|
| **开发商** | PortSwigger（英国） | 源鉴科技 / yaklang.io（中国） |
| **开源程度** | 闭源商业软件 | yaklang 核心开源，Yakit 为开源客户端 |
| **语言与文档** | 英文为主，文档体系成熟 | 中文原生，中文社区活跃 |
| **协议覆盖** | 聚焦 Web（HTTP/HTTPS/WebSocket） | 除 Web 外，还集成端口扫描、SSH、DNS、POC 等 |
| **扫描引擎** | Scanner 成熟稳定，规则库由 PortSwigger 维护 | 基于 Yak 脚本，内置大量国产漏洞 POC，可自定义 |
| **国产适配** | 对国内框架、中间件、CMS 识别一般 | 对国产应用、中间件、IoT 协议支持更好 |
| **附加功能** | Repeater、Intruder、Sequencer、Decoder 分立 | 集成 MITM、Fuzzer、Codec、SSA 代码分析、Web Fuzzer 于一体 |
| **价格** | Professional 年费较高（约 $449/年） | 社区版免费，企业版价格相对亲民 |
| **插件开发** | Java / Kotlin（BApp） | Yak 语言（类 Go 语法，内置安全函数库） |
| **数据存储** | 项目文件（.burp） | SQLite 项目数据库（.db），便于查询 |

### 5.3 选型建议

| 场景 | 推荐工具 | 原因 |
|------|---------|------|
| 国际标准渗透测试、合规报告 | **Burp Suite** | 行业标杆，报告认可度高，Scanner 稳定 |
| 国产应用测试、IoT/工控场景 | **Yakit** | 国产协议支持好，POC 库覆盖国内漏洞 |
| 快速一站式安全测试 | **Yakit** | 工具集成度高，一个平台覆盖多类测试 |
| 深度 Web 漏洞研究 | **Burp Suite** | Repeater/Intruder 精细控制，插件生态丰富 |
| 预算有限、个人学习 | **Yakit 社区版** | 免费，中文资料多，社区活跃 |
| **最佳实践** | **两者互补** | Burp 做标准 Web 测试，Yakit 做扩展扫描和国产场景 |

---

## 六、可用工具速查

### Burp Suite（27 个工具）

HTTP 请求、Repeater、Intruder、编解码、代理历史（含正则/WebSocket）、Organizer、Collaborator、扫描器、配置读写、编辑器读写、任务引擎、拦截控制等。

### Yakit（15+ 个工具集）

| 工具名 | 用途 |
|--------|------|
| `query_http_flow` | 查询 Yakit 抓取的 HTTP 流量 |
| `get_current_database_context` | 获取当前项目数据库上下文 |
| `list_project_databases` | 列出所有项目库 |
| `http_fuzzer` | 重放和 fuzz HTTP 请求 |
| `exec_yak_script` | 执行 Yak 脚本 |
| `query_yak_script` | 查询 Yak 插件 |
| `exec_codec` | 编码/解码（配合 `codec_method_details`）|
| `port_scan` | 端口扫描 |
| `ssa_compile` / `ssa_query` | SSA/SyntaxFlow 代码分析 |
| `hybrid_scan` | 批量插件扫描 |
| `brute` | 暴力破解 |
| `subdomain_collection` | 子域名收集 |
| `web_crawler` | 网站爬虫 |
| `generate_reverse_shell_command` | 生成反弹 Shell |

---

## 七、敏感数据约束

Yakit HTTPFlow 和项目库中可能包含 Cookie、Token、私密 URL 等敏感数据。

**默认操作原则**：
- 除非用户明确要求查看原始包，否则只做聚合统计（数量、时间范围、host、method、status、content-type）
- 不主动复述 Cookie、Token、完整请求体/响应体、个人定位信息

---

## 八、故障排查

### MCP 工具未出现
1. 检查对应服务是否已启动（Burp MCP Server 是否运行、Yakit 引擎是否正常）
2. 检查 `.claude.json` 或 `.codex\config.toml` 中配置是否写入了正确的项目路径/服务器条目
3. 重启 Claude Code / Codex Desktop（配置更改后需重启）
4. 检查端口是否被占用（Burp 9876）

### Burp SSE 连接失败
- 确认 Burp 的 MCP Server 已启动（来自 PortSwigger/mcp-server）
- 浏览器访问 `http://127.0.0.1:9876/` 应返回类似 sessionId 的响应
- 若返回 404，检查路径是否为根路径 `/` 而非 `/sse`

### Yakit stdio 连接失败
- 确认 `yak.exe mcp` 能独立运行（在终端手动执行看是否有 JSONRPC 输出）
- 确认路径中无中文或特殊字符，必要时用双反斜杠转义
- 确认 Yakit 项目数据库已初始化

---

## 九、实战工作流示例

### 场景一：分析 Burp 代理历史

```
> 查看 burp 中最近 20 条包含 /api 的请求，统计状态码分布
```

Claude Code / Codex Desktop 自动调用 `mcp__burp__get_proxy_history`，按条件过滤后给出统计结果。

### 场景二：Yakit 端口扫描

```
> 用 yaklang 扫描 192.168.1.10 的 22,80,443,3306,6379,8080 端口
```

Claude Code / Codex Desktop 调用 `mcp__yaklang__port_scan`，返回开放端口和服务指纹。

### 场景三：HTTP Fuzzer 验证

```
> 对 http://target.com/login 用 yaklang fuzzer 测试 SQL 注入，payload 用 {{int(1-100)}}
```

Claude Code / Codex Desktop 构造 fuzz 请求，通过 `mcp__yaklang__http_fuzzer` 批量发送并分析响应差异。

---

## 十、安全与合规提醒

1. **授权边界**：所有扫描和测试行为必须在授权范围内进行，严禁对非自有资产进行探测
2. **数据隐私**：Burp 抓包和 Yakit HTTPFlow 可能包含敏感信息，注意本地存储安全
3. **AI 输出校验**：AI 生成的 PoC 代码需人工审核后再执行，避免误操作
4. **环境隔离**：建议在虚拟机或隔离网络中运行高风险测试

---

## 十一、参考链接

- [PortSwigger/mcp-server](https://github.com/PortSwigger/mcp-server) — Burp Suite 官方 MCP Server
- [Claude Code MCP 文档](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Burp Suite 官方文档](https://portswigger.net/burp/documentation)
- [Yakit 官方文档](https://www.yaklang.com/)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/)

---

> 本文所有配置均基于实际环境验证，工具版本更新可能导致行为变化，建议以官方文档为准。如有疑问欢迎在评论区留言交流。
