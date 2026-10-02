---
title: MCP 网络分析工具配置指南：Wireshark、科来与 AI 编码助手联动实战
permalink: mcp-network/
date: 2026-06-02 16:00:00
updated: 2026-06-06 16:00:00
tags:
  - Wireshark
  - 科来
  - MCP
  - 网络分析
  - tshark
  - 抓包
categories:
  - 工具实践
keywords: Wireshark, 科来, CSNAS, MCP, tshark, 网络抓包, 流量分析, AI安全
summary: 真实记录 Wireshark（tshark）与科来网络分析系统（CSNAS）在 Claude Code 中的 MCP 配置全过程，包含踩坑记录、验证方法与工具对比。
top: false
img: /medias/featureimages/22.jpg
---

> 本文基于真实配置经验撰写，环境为 Windows 11 + bash shell。所有命令和路径均经过实际验证，目的是把"AI + 网络分析工具"的联动配置讲清楚、踩过的坑标出来。

---

## 一、整体架构

这套工具链的核心思路是：**通过 MCP（Model Context Protocol）协议，让 Claude Code / Codex Desktop 直接调用 Wireshark 和科来的 CLI 工具，实现"用自然语言驱动网络分析"的工作流。**

```
┌─────────────┐     MCP/stdio    ┌─────────────────────────┐
│             │ ◄─────────────►│  Wireshark / tshark     │
│ Claude Code │                │  (pyshark_mcp.py)       │
│ / Codex     │                │                         │
│             │     MCP/stdio  └─────────────────────────┘
│             │ ◄─────────────►┌─────────────────────────┐
│             │                │  科来 CSNAS             │
└─────────────┘                │  (csnas_mcp.py)         │
                               └─────────────────────────┘
```

**各组件作用：**

| 组件 | 来源 | 传输方式 | 监听地址 |
|------|------|----------|----------|
| **Wireshark MCP** | 社区 `wireshark-mcp` + `tshark.exe` | stdio | 通过子进程交互 |
| **科来 MCP** | 自建 `csnas_mcp.py` + `cmdl.exe` | stdio | 通过子进程交互 |
| **Claude Code** | Anthropic CLI | — | MCP Client |
| **Codex Desktop** | OpenAI Codex 桌面端 | — | MCP Client（`config.toml`） |

---

## 二、环境概述

| 项目 | 值 |
|------|-----|
| OS | Windows 11 Pro |
| Wireshark 版本 | 4.6.6 (v4.6.6-0-g3a22c3ef473d) |
| Wireshark 安装路径 | `D:\yingyong\Wireshark\` |
| Python | 3.10 (C:\Program Files\Python310) |
| MCP 框架 | `mcp[cli]` + `FastMCP` |
| 原 MCP 服务器 | `mcp-wireshark` (pyz 打包，stdio 连接失败) |
| 替换方案 | [A-G-U-P-T-A/wireshark-mcp](https://github.com/A-G-U-P-T-A/wireshark-mcp) + PyShark + subprocess fallback |

---

## 安装步骤

### 1. 克隆仓库

```bash
cd D:\<user>\Documents\Agent\claude
git clone https://github.com/A-G-U-P-T-A/wireshark-mcp.git
```

### 2. 安装依赖

```bash
# pyshark 已就绪
pip install pyshark

# 解决 MCP 异步 + PyShark 事件循环冲突
pip install nest_asyncio

# mcp CLI 已就绪
# pip install mcp[cli]
```

### 3. 修改 `pyshark_mcp.py`

> 共 3 处修改：

**修改 1 — 插入 tshark 路径注入 + nest_asyncio 补丁 + 工作目录切换**（文件顶部，约第 25 行后）：

```python
# Ensure tshark is in PATH for Windows
_TSHARK_DIR = r"D:\yingyong\Wireshark"
if os.path.isdir(_TSHARK_DIR) and _TSHARK_DIR not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _TSHARK_DIR + os.pathsep + os.environ.get("PATH", "")

# Patch asyncio to allow nested event loops (MCP + PyShark conflict)
import nest_asyncio
nest_asyncio.apply()

# Ensure PyShark can find tshark
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if os.getcwd() != _SCRIPT_DIR:
    os.chdir(_SCRIPT_DIR)
```

**修改 2 — 设置默认 tshark 路径**（约第 47 行）：

```python
config = {
    "default_timeout": 30,
    "capture_dir": "./captures",
    "tshark_path": r"D:\yingyong\Wireshark"
}
```

**修改 3 — `subprocess.check_output` 编码修复**（`list_interfaces` 函数中）：

```python
output = subprocess.check_output(['tshark', '-D'], universal_newlines=True, encoding='utf-8', errors='replace')
```

### 4. 创建 `config.ini`

位置：`wireshark-mcp/config.ini`

```ini
[tshark]
tshark_path = D:\yingyong\Wireshark
```

### 5. 重写 `read_pcap_file`

> PyShark 的 `FileCapture` 在 Windows 非管理员权限下触发 `[WinError 5] 拒绝访问`，改用 `subprocess` 直接调 `tshark` 替代。

将原 `read_pcap_file` 函数替换为基于 `subprocess.run` 的实现，通过 `-T fields` 格式输出并解析管道分隔文本，绕过 PyShark 的权限问题。

### 6. 配置 `.mcp.json`

```json
{
  "mcpServers": {
    "wireshark": {
      "command": "C:\\Program Files\\Python310\\python.exe",
      "args": [
        "D:\\<user>\\Documents\\Agent\\claude\\wireshark-mcp\\pyshark_mcp.py"
      ],
      "env": {
        "PATH": "D:\\yingyong\\Wireshark;C:\\Program Files\\Python310;..."
      }
    }
  }
}
```

---

## 验证用例与结果

### 用例 1：`list_interfaces` — 列出网络接口

**目的**：验证 MCP 服务器能启动并与 tshark 通信

**命令**：
```json
{"method": "tools/call", "params": {"name": "list_interfaces", "arguments": {}}}
```

**结果路径**：`$` → 首次失败（空列表，编码问题） → 修复 `encoding='utf-8', errors='replace'` → **通过**

**正确输出**（12 个接口）：
```
本地连接* 5, 本地连接* 4, 本地连接* 3,
VMware Network Adapter VMnet8, VMware Network Adapter VMnet1,
WLAN, WLAN 4, WLAN 3,
..., Adapter for loopback traffic capture, 以太网,
Event Tracing for Windows (ETW reader)
```

---

### 用例 2：`read_pcap_file` — 读取 pcap 文件

**目的**：验证能正确解析捕获文件并输出协议统计

**用例 2a — 原始 PyShark 方式**（失败）：

| 问题阶段 | 现象 | 根因 |
|---------|------|------|
| 首次 | `This event loop is already running` | MCP FastMCP 的 asyncio 事件循环与 PyShark `FileCapture` 冲突 |
| 修复 | `TShark not found` | PyShark 在 Windows 上不读 `PATH`，只查 `Program Files` |
| 修复 | `[WinError 5] 拒绝访问` | PyShark 需要管理员权限读取 pcap |

**解决方案**：放弃 PyShark `FileCapture`，改用 `subprocess.run` 直接调 `tshark -r`。

**用例 2b — subprocess 方式**（通过）：

```json
{"name": "read_pcap_file", "arguments": {"file_path": "C:/.../test_capture.pcapng", "packet_count": 10}}
```

输出：
```
Capture File: test_capture.pcapng
Timestamp: 2026-06-06T16:39:10
Filter: None
Packet Count: 5

Protocol Distribution:
  - UDP: 4 packets (80.0%)
  - TCP: 1 packets (20.0%)

Packet Details (first 5 of 5):
#     Time         Source           Dest           Proto   Info
----------------------------------------------------------------
1     0.000000000  x.x.x.x  192.168.x.x   UDP     443 → 56154 Len=26
2     0.034851000  192.168.x.x     x.x.x.x   TCP     23337 → 57044 [ACK]
3     0.039885600  192.168.x.x     x.x.x.x   UDP     55531 → 443 Len=379
4     0.085165500  x.x.x.x  192.168.x.x   UDP     443 → 56154 Len=1055
5     0.085186000  x.x.x.x  192.168.x.x   UDP     443 → 56154 Len=1054
```

---

### 用例 3：实时捕获分析

**目的**：验证能从 Wireshark 实时写入的临时文件读取并做完整分析

**临时捕获文件**：`%TEMP%\wireshark_*.pcapng`

**3a — 协议层次统计**（`tshark -r -q -z io,phs`）：

```
frame: 6834
  eth: 6834
    ip: 6805
      udp: 4731 (69.2%)
        data: 4662 (QUIC/HTTP3)
        dns: 26
      tcp: 2035 (29.8%)
        tls: 780
        http: 2
      icmp: 39
    arp: 24
```

**3b — TCP 会话**（`tshark -r -q -z conv,tcp`）：

| 本地:端口 | 远程:端口 | 双向包数 | 双向流量 |
|-----------|----------|---------|---------|
| 192.168.x.x:54328 | x.x.x.x:443 | 1,056 | 652 KB |
| 192.168.x.x:36265 | x.x.x.x:443 | 296 | 174 KB |

**3c — IPv4 端点 Top 5**：

| IP | 总包数 | 总流量 |
|----|--------|--------|
| 192.168.x.x (本机) | 6,804 | 3.31 MB |
| x.x.x.x | 4,126 | 2.23 MB |
| x.x.x.x | 1,056 | 652 KB |
| x.x.x.x | 309 | 180 KB |

**3d — 专家信息**：

| 级别 | 数量 | 主要类型 |
|------|------|---------|
| Warn | 121 | D-SACK(91), ACK missing(11), RST(3), out-of-order(1) |
| Note | 381 | 超 MSS(142), keep-alive(66), 重复ACK(33), 重传(17) |
| Chat | 111 | SYN, FIN, TLS legacy_version |

**3e — DNS 查询记录**（已脱敏）：

```
browser-intake-us5-datadoghq.com
signaler-pa.clients6.google.com
a-api.anthropic.com
api.anthropic.com
api.deepseek.com
claude.ai
collect.alipay.com
clientsservices.googleapis.com
```

---

## 已知问题

| 问题 | 影响 | 状态 |
|------|------|------|
| PyShark `FileCapture` 需管理员权限 | 无法用 PyShark 解析包 | **已绕过**：subprocess 替代 |
| `capture_live_packets` 依赖 PyShark `LiveCapture` | 实时抓包可能失败 | ⚠️ 待验证 |
| Windows 中文接口名导致编码问题 | `list_interfaces` 中文名乱码 | ✅ 已修复 |
| nest_asyncio 补丁 | 确保 PyShark + MCP 共存 | ✅ 已应用 |

---

## 可用工具清单

| 工具 | 依赖 | 已验证 |
|------|------|--------|
| `list_interfaces` | subprocess → tshark -D | ✅ |
| `read_pcap_file` | subprocess → tshark -r | ✅ |
| `get_capture_history` | 纯内存 | ✅ |
| `display_filter` / `filtered_packet_display` | tshark | ⚠️ |
| `analyze_traffic` | 基于 capture_history | ⚠️ |
| `analyze_http_traffic` | PyShark → subprocess | ⚠️ |
| `analyze_dns_traffic` | PyShark → subprocess | ⚠️ |
| `capture_live_packets` | PyShark LiveCapture | ⚠️ |
| `quick_capture` | subprocess → tshark -i | ⚠️ |
| `protocol_hierarchy_statistics` | tshark -z | ⚠️ |
| `expert_information` | tshark -z expert | ⚠️ |
| `save_capture_to_file` | PyShark | ⚠️ |
| `deep_packet_analysis` | subprocess → tshark | ⚠️ |
| `detect_protocols` | PyShark | ⚠️ |
| SSH 相关（remote_capture 等） | 不适用 | ❌ windows 跳过 |

---

## 科来 / CSNAS MCP 配置

> 科来网络分析系统（技术交流版）自带的 `cmdl.exe` CLI 工具，封装为 MCP Server 后可与 Wireshark MCP 互补使用。

### 环境概述

| 项目 | 值 |
|------|-----|
| 产品 | 科来网络分析系统 技术交流版 |
| CLI 工具 | `cmdl.exe` v1.0.0.8 |
| 安装路径 | `D:\yingyong\CSNAS\` |
| 帮助文档 | `mui/zh_cn/cmdl.chm`（已提取 HTML） |
| MCP 脚本 | `wireshark-mcp/csnas_mcp.py` |
| 运行方式 | FastMCP stdio |

### 安装与配置

**无额外依赖**，`cmdl.exe` 是独立的 Windows exe，Python 仅做包装。

**注册到 Claude Code（CLI 方式，推荐）**：

```bash
claude mcp add --transport stdio csnas "C:\Program Files\Python310\python.exe" -- "D:\path\to\wireshark-mcp\csnas_mcp.py"
```

> CLI 注册后需手动在 `.claude.json` 的 `env` 中补充 `PATH`（加入 CSNAS 目录），否则 cmdl.exe 会找不到。

**注册到 Claude Code（原始 `.mcp.json` 方式）**：

```json
{
  "mcpServers": {
    "csnas": {
      "command": "C:\\Program Files\\Python310\\python.exe",
      "args": ["D:\\path\\to\\wireshark-mcp\\csnas_mcp.py"],
      "env": {
        "PATH": "D:\\yingyong\\CSNAS;...其余 PATH..."
      }
    }
  }
}
```

### 可用工具清单

| 工具 | 功能 | 依赖 | 状态 |
|------|------|------|------|
| `list_interfaces` | 列出可用网络接口 | `cmdl -D` | ✅ |
| `read_pcap` | 读取 pcap 文件并综合分析（协议分布、Top IP、Top 端口、会话） | `cmdl -r -T json` | ✅ |
| `protocol_hierarchy` | 协议层次分布统计 | `cmdl -r -T json` | ✅ |
| `capture_live` | 实时抓包 + 综合分析（指定接口、时长） | `cmdl -i -T json` | ✅ |
| `get_capture_history` | 本次会话的抓取历史 | 内存存储 | ✅ |

### 验证用例

**用例 1 — `list_interfaces`**（通过）

```
VMware Network Adapter VMnet8, VMware Network Adapter VMnet1,
WLAN, WLAN 4, WLAN 3, ..., 以太网
```

**用例 2 — `read_pcap` 读取 pcap 文件**（通过）

```
Protocol Distribution:
  UDP    80.0%  ████████████████░░░░
  TCP    20.0%  ████░░░░░░░░░░░░░░░░
```

**用例 3 — `capture_live` 实时抓取 8 秒 WLAN 流量**（通过）

```
Live Capture (WLAN, 8s), Packet Count: 80
TCP: 46 (57.5%), UDP: 33 (41.2%), ICMP: 1 (1.2%)
Top Talkers: 本机 IP, 出口代理 IP, 远程 443 服务端...
```

### 与 Wireshark MCP 对比

| 对比维度 | 科来 csnas | Wireshark / tshark |
|----------|-----------|-------------------|
| 协议深度解析 | 仅 IP/TCP/UDP 协议层，无 TLS/HTTP/DNS 细节 | 完整协议树（700+ 协议解析器） |
| 输出格式 | `-T text`/`json`/`fields`；JSON 含 `ip`、`tcp`、`udp` 三层 | 多种格式：`-T fields`、`-z` 统计、JSON、PDML |
| 过滤能力 | capsa dpifilter 语法（`protocol=tcp and dstport=80`） | Wireshark display filter + BPF capture filter |
| 统计功能 | 需自己算（JSON 解析后聚合） | 内置 `-z` 统计（io,phs/conv,tcp/endpoints 等） |
| 实时写入文件 | ❌ `-w` 写入疑似依赖 GUI 后台，CLI 直接 kill 无法保存 | ✅ `-w` 直接写 pcap，信号处理完善 |
| JSON 截断 | ⚠️ kill 进程后 JSON 不完整，MCP 脚本做了截断修复 | ✅ 输出完整 |
| 高级分析 | ❌ 无 expert info、无 TLS 解密、无 HTTP 对象导出 | ✅ expert info、follow stream、SSL key log |
| 应用层日志 | 部分支持：`-l http_apache,dns,ssl,ftp,email`（未封装） | ✅ 全面 |
| 适用场景 | 快速看一眼网络状态（协议分布、Top 会话） | 深度分析、排查问题、取证 |

### 科来与 Wireshark 的异同

#### 相同点

1. **核心功能一致** — 两者都是网络数据包分析工具，都支持实时抓包和离线分析 pcap/pcapng 文件
2. **协议解析目标一致** — 都能识别 IP、TCP、UDP、ICMP、ARP、DNS、HTTP、SSL/TLS 等常见协议（科来 GUI 支持度高，cmdl CLI 有局限）
3. **过滤机制** — 都支持捕获过滤和分析过滤。科来用 capsa dpifilter 语法，Wireshark 用 BPF + display filter
4. **输出格式多样** — 都支持 text、fields、JSON 等多种输出格式
5. **GUI 能力** — 两者都提供图形界面，科来 GUI 功能完整（类似于 Wireshark 的主窗口），含实时统计、图表、会话重组、对象导出等
6. **Windows 生态** — 两者在 Windows 上都有良好支持
7. **命令行工具** — 两者都提供 CLI 接口（cmdl.exe / tshark.exe），均可被 MCP 封装调用
8. **MCP 集成方式一致** — 都是通过 stdio 子进程 + FastMCP 包装 CLI 工具暴露工具函数

#### 不同点

| 维度 | 科来 / CSNAS | Wireshark / tshark |
|------|-------------|-------------------|
| **开发商** | 中国公司 科来（Colasoft） | 全球开源社区（Wireshark Foundation） |
| **开源/闭源** | 闭源商业软件（技术交流版免费） | 开源（GPLv2） |
| **协议解析器数量** | 有限（以常见协议为主，偏工业/国产生态） | 700+ 协议解析器，覆盖几乎所有已知协议 |
| **社区与生态** | 国内论坛 + 商业支持，插件生态小 | 全球社区活跃，大量扩展、Lua 脚本、第三方工具 |
| **国产协议支持** | ✅ 对国内常见协议、工业控制协议支持更好 | ❌ 缺乏部分国产/专有协议解析器 |
| **中文界面** | ✅ 原生中文，中文文档完善 | ⚠️ 有中文语言包，但社区文档以英文为主 |
| **易用性（入门）** | 面向国内网管/安全运维，上手更直观 | 功能强大但学习曲线较陡 |
| **MCP 工具数** | 5 个（list_interfaces, read_pcap, protocol_hierarchy, capture_live, get_capture_history） | 15 个（含实时抓包、协议统计、expert info、DNS/HTTP 专项分析等） |
| **cmdl JSON 接口** | 仅暴露 ip/tcp/udp 三个协议层的 JSON 字段 | tshark 可通过 `-T json` 暴露全部协议层字段 |
| **实时抓包稳定性** | 进程终止时 JSON 截断，需修复 | 信号处理完善，输出完整 |
| **pcap 写入** | CLI 直接写入有问题，依赖 GUI 保存 | `-w` 稳定写入 |
| **信号处理** | Windows 上 `taskkill /F` 粗暴终止 | 支持 SIGINT 优雅退出 |
| **深度分析能力** | 需要配合 GUI 做 expert info、会话重组、文件还原 | CLI 自带 `-z` 统计 + Lua 扩展，功能丰富 |
| **跨平台** | ❌ 仅 Windows | ✅ Windows / macOS / Linux |
| **价格** | 技术交流版免费；企业版付费 | 完全免费 |
| **厂商支持** | 商业公司，有技术支持和服务 | 开源社区 + 商业支持（Wireshark 公司） |

#### 选型建议

| 场景 | 推荐工具 | 原因 |
|------|---------|------|
| 快速查看网络状态（协议分布、Top 会话） | **科来**（看一眼就够） | 无需等 tshark 加载大量协议解析器 |
| 国产/工业协议分析 | **科来** | 国内协议支持更好 |
| 深度取证、漏洞分析 | **Wireshark** | 协议解析全面、filter 强大 |
| 日常 MCP 快速查询 | **科来 csnas** | 响应快，5 个工具覆盖基础需求 |
| 复杂网络问题排查 | **Wireshark** | expert info、会话统计、follow stream |
| 跨平台环境 | **Wireshark** | 全平台支持 |
| **最佳组合** | **两者互补** | 科来快速查看 + Wireshark 深度分析 |

### 局限性（重要）

1. **仅封装了 IP/TCP/UDP 三层** — `-j ip,tcp,udp`。cmdl 虽支持 DNS、HTTP、SSL 等高层协议，但 JSON 输出只暴露这三层；高层信息需通过 `-T fields` 或 `-l` 模块日志获取，MCP 脚本暂未实现
2. **实时抓包文件无法保存** — `cmdl -w` 在 kill 进程时写不出有效文件，只能走 `-T json` stdout 并通过截断修复获得数据
3. **JSON 输出不完整** — cmdl 没有 `-q` 静默标志，实时抓包时 stderr 混入进度信息，JSON stdout 在 kill 时截断。MCP 脚本 `_fix_truncated_json()` 做了修复，但最后一个包可能丢失
4. **无 pcap 写入能力** — 当前脚本仅供实时查看，抓到的数据不落盘。如需持久化，需配合 Wireshark 补抓
5. **无高协议层解析** — 看不到 HTTP URL、DNS 查询名、TLS 证书等应用层细节。科来 GUI 有此能力，但 `cmdl.exe` 的 JSON 接口只暴露 IP/TCP/UDP
6. **科来 GUI 捕获格式私有** — GUI 界面捕获的数据存为 `.cscproj`/`.cscpkt` 格式，`cmdl.exe` 无法直接读取，需从 GUI 中"另存为 pcapng"后才能用 `read_pcap` 分析
7. **单进程抓包** — 不支持多接口并发捕获
8. **cmdl 帮助文档为 chm 格式** — 已提取为 HTML，确认无 API/MCP/SDK 等二次开发接口

---

## 八、网络分析工具与 Web 安全工具的对比

前面章节介绍了 Wireshark、科来（网络分析工具）的 MCP 配置。而在另一篇《安全工具链配置指南》中，还配置了 Burp Suite 和 Yakit（Web 安全测试工具）。这两类工具经常被混淆，下面厘清它们的定位差异。

### 8.1 工具分类定位

```
┌─────────────────────────────────────────────────────────────┐
│                     网络安全工具生态                           │
├─────────────────────────────┬───────────────────────────────┤
│      Web 应用安全测试         │        网络协议分析            │
│    （应用层 L7，代理模式）      │   （网络层 L2-L7，网卡模式）   │
├─────────────────────────────┼───────────────────────────────┤
│  Burp Suite                 │  Wireshark / tshark           │
│  Yakit                      │  科来 CSNAS                   │
├─────────────────────────────┼───────────────────────────────┤
│  目标：Web 漏洞、API 安全      │  目标：流量协议、网络故障      │
│  方式：拦截→修改→重放→扫描    │  方式：捕获→解析→统计→取证    │
└─────────────────────────────┴───────────────────────────────┘
```

### 8.2 相同点

| 维度 | 说明 |
|------|------|
| **流量获取** | 都能捕获和分析网络流量 |
| **MCP 集成** | 都提供 MCP Server，可与 Claude Code / Codex Desktop 联动 |
| **过滤能力** | 都支持按协议、IP、端口、关键字等条件过滤流量 |
| **安全用途** | 都可用于安全分析（漏洞验证 / 恶意流量检测） |
| **离线分析** | 都支持读取 pcap/pcapng 文件做离线分析 |
| **CLI 接口** | 都提供命令行工具（Burp MCP proxy / yak.exe / tshark / cmdl） |

### 8.3 不同点

| 维度 | Burp Suite / Yakit（Web 安全） | 科来 / Wireshark（网络分析） |
|------|-------------------------------|-----------------------------|
| **工作层级** | 应用层（HTTP/HTTPS/WebSocket） | 网络层到应用层（全协议栈 L2-L7） |
| **核心定位** | Web 应用渗透测试与漏洞验证 | 网络协议分析、故障排查与取证 |
| **抓包方式** | 代理模式（拦截浏览器/客户端流量） | 网卡模式（捕获网卡所有进出流量） |
| **流量范围** | 主要是 HTTP/HTTPS，可扩展 WebSocket | 所有协议（TCP/UDP/ICMP/ARP/DNS/HTTP 等） |
| **请求修改** | ✅ 可拦截并实时修改请求/响应 | ❌ 只读分析，不可修改流量 |
| **漏洞扫描** | ✅ 主动/被动扫描，发现 Web 漏洞 | ❌ 无漏洞扫描能力 |
| **重放测试** | ✅ Repeater / Fuzzer 重复发送请求 | ❌ 无重放能力 |
| **协议解析深度** | HTTP 协议深入（参数、Cookie、Header、Body） | 全协议树解析（Wireshark 700+ 协议） |
| **加密处理** | 代理证书自动解密 HTTPS | 需 SSLKEYLOGFILE 或导入私钥解密 |
| **会话重组** | ❌ 不关注 TCP 会话重组 | ✅ 支持 TCP 流重组、Follow Stream |
| **统计输出** | 漏洞列表、扫描报告 | 协议分布、Top IP/端口/会话、流量趋势 |
| **专家分析** | ❌ 无 | ✅ Wireshark Expert Info 异常标记 |
| **目标用户** | 渗透测试员、Web 安全工程师、红队 | 网络工程师、运维、蓝队、安全分析师 |
| **典型场景** | SQL 注入测试、API 越权验证、XSS 检测 | 网络卡顿排查、恶意域名检测、流量基线分析 |

### 8.4 互补工作流示例

**场景：排查一次疑似数据泄露事件**

1. **网络层发现异常**：用 Wireshark / 科来捕获流量，发现某主机频繁向外发送大流量
2. **定位具体应用**：通过 Wireshark 的 `Follow TCP Stream` 或 HTTP 过滤，定位到具体 Web 接口
3. **应用层验证漏洞**：将接口导入 Burp Suite / Yakit，用 Repeater/Fuzzer 验证是否存在越权或注入
4. **AI 辅助分析**：通过 MCP 让 Claude Code 同时读取网络层统计（科来）和应用层细节（Burp/Yakit），生成完整的事件分析报告

### 8.5 选型建议

| 场景 | 推荐工具 | 原因 |
|------|---------|------|
| Web 渗透测试、漏洞挖掘 | **Burp Suite / Yakit** | 代理拦截、请求修改、扫描是核心能力 |
| 网络故障排查、流量基线 | **Wireshark / 科来** | 全流量可见、协议统计、会话分析 |
| 恶意流量检测、取证分析 | **Wireshark / 科来** | 深度协议解析、专家信息、流重组 |
| API 安全测试 | **Burp Suite / Yakit** | 参数 fuzz、认证绕过、响应分析 |
| 完整事件溯源 | **两者结合** | 网络层定位 + 应用层验证 |
| AI 自动化安全运营 | **四者全部接入 MCP** | 用自然语言统一调度，减少切换成本 |

---

## 九、故障排查

### MCP 工具未出现

1. 检查 tshark / cmdl 是否在 PATH 中，能否在终端独立运行
2. 检查 `.claude.json` 或 `.codex\config.toml` 中配置是否写入了正确的项目路径
3. 重启 Claude Code / Codex Desktop（配置更改后需重启）
4. 检查 Python 脚本路径是否正确，Windows 下建议使用绝对路径

### PyShark `FileCapture` 失败

- 现象：`[WinError 5] 拒绝访问` 或 `This event loop is already running`
- 根因：Windows 非管理员权限下 PyShark 无法读取管道文件，或 asyncio 事件循环冲突
- 解决：改用 `subprocess.run` 直接调用 `tshark -r`，绕过 PyShark

### 科来 `cmdl.exe` 找不到

- 现象：MCP 启动后提示 `cmdl 不是内部或外部命令`
- 根因：`.claude.json` 的 `env.PATH` 未包含 CSNAS 安装目录
- 解决：在配置中显式添加 `"PATH": "D:\\yingyong\\CSNAS;..."`

### tshark 中文接口名乱码

- 现象：`list_interfaces` 返回乱码或空列表
- 根因：Windows 中文接口名编码问题
- 解决：`subprocess.check_output` 添加 `encoding='utf-8', errors='replace'`

---

## 十、参考链接

- [Wireshark 官方文档](https://www.wireshark.org/docs/)
- [tshark 手册页](https://www.wireshark.org/docs/man-pages/tshark.html)
- [科来官方网站](https://www.colasoft.com.cn/)
- [A-G-U-P-T-A/wireshark-mcp](https://github.com/A-G-U-P-T-A/wireshark-mcp) — Wireshark MCP Server 社区实现
- [Claude Code MCP 文档](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/)

---

> 本文所有配置均基于实际环境验证，工具版本更新可能导致行为变化，建议以官方文档为准。如有疑问欢迎在评论区留言交流。
