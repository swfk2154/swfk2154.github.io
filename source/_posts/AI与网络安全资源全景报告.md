---
title: AI 与网络安全资源全景报告：中国、欧美、俄罗斯教程、工具与文档
permalink: ai-security-atlas/
date: 2025-11-20 12:00:00
updated: 2026-06-04 12:45:00
tags:
  - AI安全
  - 网络安全
  - LLM
  - 红队
  - 资料整理
categories:
  - AI安全
keywords: AI安全,大模型安全,LLM安全,网络安全,PyRIT,garak,OWASP,MITRE ATLAS,AI-Infra-Guard
summary: 系统整理中国、欧美、俄罗斯 AI 与网络安全结合方向的教程、视频、工具、文档和文章，并给出学习路线与落地建议。
top: true
img: /medias/featureimages/15.jpg
---

> 本文整理的是 AI 与网络安全结合方向的学习与实践入口，覆盖中国、欧美、俄罗斯三类生态。资料链接基于 2026-06-04 前后公开信息整理；正式引用或落地前，建议重新打开原始链接核对。

<div class="ai-atlas">
  <div class="ai-atlas-hero">
    <div>
      <p class="ai-kicker">AI Security Resource Atlas</p>
      <h2>从 LLM 安全入门到企业 AI 安全治理</h2>
      <p>重点关注 Prompt Injection、RAG 数据污染、Agent 工具越权、模型供应链、AI 基础设施暴露和安全运营自动化。</p>
    </div>
    <div class="ai-atlas-stats">
      <span><b>3</b>地区生态</span>
      <span><b>20+</b>核心入口</span>
      <span><b>5</b>阶段路线</span>
    </div>
  </div>
</div>

## 一、先看主线

学习 AI 安全不要只盯着“越狱提示词”。更完整的路线应该是：

1. **概念框架**：AI 系统威胁建模、LLM / Agent 风险、MLSecOps。
2. **应用安全**：Prompt Injection、RAG 数据污染、Agent 工具越权、敏感数据泄露。
3. **AI 基础设施安全**：Ollama、ComfyUI、vLLM、向量库、MCP Server、模型供应链。
4. **防御落地**：LLM-WAF、AI Gateway、Guardrails、日志审计、权限隔离。
5. **AI 赋能安全运营**：告警研判、威胁情报摘要、检测规则生成、代码审计辅助。

## 二、地区生态对比

<div class="ai-region-grid">
  <section>
    <h3>中国</h3>
    <p><strong>特点：</strong>政策治理、政企合规、厂商方案和 AI 基础设施扫描发展快。</p>
    <p><strong>重点：</strong>大模型安全评估、MCP / Agent 安全、LLM-WAF、数据分类分级。</p>
    <p><strong>风险：</strong>组件暴露、默认配置、数据泄露、出入口合规、越权工具调用。</p>
  </section>
  <section>
    <h3>欧美</h3>
    <p><strong>特点：</strong>开放框架、标准文档、开源工具和红队方法论最完整。</p>
    <p><strong>重点：</strong>LLM 红队、RAG 安全、Agentic AI、模型供应链、AI 风险管理。</p>
    <p><strong>风险：</strong>提示词注入、数据投毒、模型提取、跨租户泄露、供应链风险。</p>
  </section>
  <section>
    <h3>俄罗斯</h3>
    <p><strong>特点：</strong>Kaspersky、Sber、Positive Technologies、Habr 等厂商和社区资料较集中。</p>
    <p><strong>重点：</strong>AI 防御、LLM 安全培训、威胁模型、企业安全实践。</p>
    <p><strong>风险：</strong>资料入口分散，商业培训偏多，部分文档需要二次核验。</p>
  </section>
</div>

## 三、中国资源

### 官方、治理与报告

- [《人工智能安全治理框架》1.0 - 中央网信办](https://www.cac.gov.cn/2024-09/09/c_1727567886199789.htm)
- [《人工智能安全治理框架》2.0 PDF](https://cms.gzwxb.gov.cn/netcom/ueditor-file/file/20250918/1758205976589006025.pdf)
- [中国信通院：人工智能风险治理报告 PDF](https://www.caict.ac.cn/english/research/whitepapers/202504/P020250402526466179450.pdf)
- [国家互联网应急中心 CNCERT](https://www.cert.org.cn/)：关注“大模型安全众测”“AI 组件漏洞通报”等。

### 平台与工具

- [FlagSafe 大模型安全平台](https://flagsafe.baai.ac.cn/)：偏大模型安全评估、红队 / 蓝队、防护与可解释。
- [Tencent AI-Infra-Guard](https://github.com/Tencent/AI-Infra-Guard)：腾讯朱雀实验室开源 AI 红队与 AI 基础设施扫描平台，覆盖 MCP、Agent Skills、AI Infra、越狱评估等。
- [腾讯云 LLM-WAF](https://cloud.tencent.com/product/llmwaf)：了解企业级 LLM 网关、防护、限流和审计设计。
- [腾讯云 AI Agent 安全网关](https://cloud.tencent.com/product/llmsgw)：适合参考 Agent 工具调用安全网关思路。
- [奇安信大模型卫士](https://www.qianxin.com/product/detail/pid/522)、[QAX-GPT 安全机器人](https://www.qianxin.com/product/detail/pid/496)：偏企业产品和安全运营。

### 教程、文章与视频

- [AI Security Guide 中文版：OWASP LLM Top 10 解析](https://yeasy.gitbook.io/ai_security_guide/di-yi-bu-fen-ji-chu-pian/03_frameworks/3.1_owasp_top10)
- [腾讯云大模型安全方案文章](https://cloud.tencent.com/developer/article/2672023)
- [FlagSafe 发布介绍](https://hub.baai.ac.cn/view/54558)
- FreeBuf、安全客、看雪、先知社区：关键词建议 `AI安全`、`大模型安全`、`LLM安全`、`MCP安全`、`Agent安全`。
- B站可搜：`大模型安全 OWASP LLM Top10`、`AI-Infra-Guard`、`PyRIT AI 红队`、`大模型安全 智源 FlagSafe`。

## 四、欧美资源

### 框架与文档

- [OWASP GenAI Security Project](https://genai.owasp.org/)：LLM Top 10、Agentic Security、工具、白皮书和视频的主入口。
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [MITRE ATLAS](https://atlas.mitre.org/)：AI / ML 对抗技术矩阵，适合威胁建模和红队映射。
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)：AI 风险管理框架。
- [NIST Adversarial Machine Learning Taxonomy](https://csrc.nist.gov/pubs/ai/100/2/e2025/final)：对抗机器学习攻击与缓解术语体系。
- [CISA / NCSC Secure AI System Development](https://www.cisa.gov/news-events/news/dhs-cisa-and-uk-ncsc-release-joint-guidelines-secure-ai-system-development)
- [CISA Deploying AI Systems Securely](https://www.cisa.gov/news-events/alerts/2024/04/15/joint-guidance-deploying-ai-systems-securely)
- [ENISA Artificial Intelligence Cybersecurity Challenges](https://www.enisa.europa.eu/publications/artificial-intelligence-cybersecurity-challenges)
- [ENISA Multilayer Framework for Good Cybersecurity Practices for AI](https://www.enisa.europa.eu/publications/multilayer-framework-for-good-cybersecurity-practices-for-ai)
- [Google Secure AI Framework / SAIF](https://safety.google/intl/en_us/safety/saif/)
- [Coalition for Secure AI / CoSAI](https://www.coalitionforsecureai.org/)

### 开源工具

| 工具 | 用途 | 适合阶段 |
|---|---|---|
| [Microsoft PyRIT](https://github.com/microsoft/PyRIT) | 生成式 AI 风险识别和自动化红队编排 | 红队评估、持续测试 |
| [NVIDIA garak](https://github.com/NVIDIA/garak) | LLM 漏洞、安全和鲁棒性探测 | 模型 / 应用上线前测试 |
| [Promptfoo Red Team](https://www.promptfoo.dev/docs/red-team/) | LLM、RAG、Agent 红队测试，可接入 CI | 开发、回归、发布门禁 |
| [Protect AI LLM Guard](https://github.com/protectai/llm-guard) | LLM 输入输出扫描 | 应用防护、网关前置 |
| [Protect AI ModelScan](https://github.com/protectai/modelscan) | 模型序列化安全扫描 | 模型供应链、模型导入 |
| [NVIDIA NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) | 为 LLM 应用添加可编程护栏 | 应用设计、运行时控制 |
| [Guardrails AI](https://github.com/guardrails-ai/guardrails) | 输出校验、结构化约束和运行时护栏 | 应用层防护 |

### 视频与课程

- [OWASP GenAI Learning Archive](https://genai.owasp.org/learning/)
- Microsoft Build / BlueHat：关键词 `How Microsoft Approaches AI Red Teaming PyRIT`
- Black Hat / DEF CON / RSA：关键词 `LLM security red teaming`、`AI supply chain security`、`agentic AI security`

## 五、俄罗斯 / 俄语生态资源

公开资料相对分散，偏 Kaspersky、Sber、Positive Technologies、Yandex Cloud、Habr。开源工具不如欧美多，很多是商业产品、培训或文章。

### 课程与报告

- [Kaspersky Large Language Models Security](https://xtraining.kaspersky.com/courses/large-language-models-security/)：付费课程，覆盖 LLM 攻击、防御和安全框架。
- [Kaspersky：AI under Attack - How to Secure Machine Learning](https://media.kaspersky.com/en/business-security/enterprise/machine-learning-cybersecurity-whitepaper.pdf)
- Sber AI 威胁模型：公开入口不稳定，可从 [Habr 介绍](https://habr.com/ru/news/902882/) 或 [Банковское обозрение](https://bosfera.ru/press-release/sber-razrabotal-model-dlya-kiberbezopasnosti-ii) 追踪。

### 文章与教程

- [Habr：AI-security развивается...](https://habr.com/ru/companies/cloud_ru/articles/1003844/)
- [Habr：MLSecOps защита машинного обучения](https://habr.com/ru/articles/906172/)
- [Positive Technologies：Искусственный интеллект в киберзащите](https://habr.com/en/companies/pt/articles/904936/)
- [Yandex Cloud：LLM 在网络安全中的应用](https://habr.com/ru/companies/yandex_cloud_and_infra/articles/876004/)
- [Habr：LLM agents in cybersecurity](https://habr.com/ru/articles/871780/)

### 视频检索关键词

- `безопасность LLM`
- `AI security кибербезопасность`
- `MLSecOps`
- `ИИ в киберзащите`
- `Kaspersky LLM security`

## 六、推荐学习顺序

<div class="ai-roadmap">
  <div><b>1</b><span>网络安全基础</span><p>Linux、Python、HTTP、Web 安全、身份认证、日志和基础攻防。</p></div>
  <div><b>2</b><span>AI / LLM 基础</span><p>Transformer、RAG、Agent、向量数据库、模型推理、微调和评测。</p></div>
  <div><b>3</b><span>AI 安全框架</span><p>OWASP GenAI、MITRE ATLAS、NIST AI RMF、CISA、ENISA。</p></div>
  <div><b>4</b><span>红队与防御</span><p>Prompt Injection、越狱、RAG 污染、模型提取、Agent 工具越权。</p></div>
  <div><b>5</b><span>企业落地</span><p>LLM 网关、AI-BOM、日志审计、权限隔离、持续评估和合规文档。</p></div>
</div>

## 七、落地建议

1. **列出 AI 资产**：模型、RAG、向量库、MCP、Agent、API Key、日志。
2. **做威胁建模**：用 OWASP 与 MITRE ATLAS 明确攻击面和业务影响。
3. **建立红队基线**：用 PyRIT、garak、Promptfoo 保存可复现评估报告。
4. **检查基础设施**：用 AI-Infra-Guard 排查 AI 组件和 MCP / Agent 生态暴露面。
5. **在模型外做控制**：权限隔离、DLP、审批、审计、速率限制和回滚机制。

## 八、容易误判的点

- Prompt 过滤不是完整防线，工具权限和数据访问控制更关键。
- 红队扫描结果不是合规结论，需要结合业务、日志和人工复核。
- Agent 能调用真实工具时，风险从聊天安全变成系统权限安全。
- 社区文章可能过期或带厂商立场，关键事实要回到官方文档验证。

> 所有测试应在授权环境、靶场或自有系统中进行。本文只做资料索引和工程化学习路线整理，不提供未授权攻击步骤。
