---
title: "安全产品与安全设备全景"
permalink: security-products-and-devices/
date: 2026-02-03 01:14:43
categories:
  - 网络安全
  - 安全运营
tags:
  - 安全设备
  - WAF
  - 态势感知
img: /medias/featureimages/21.jpg
summary: "防火墙、WAF、IDS/IPS、EDR、态势感知、堡垒机等安全产品的定位、厂商与部署场景。"
---

<!-- more -->

## 哪些就业岗位需要用到安全产品
+  红队、蓝队
+ 安全服务、安全运营、产品研发、产品基础支持、安全开发、安全运维

## 安全产品有哪些
## 网信办-网络关键设备和网络安全专用产品目录
##  安全厂商的产品 ⭐️
###  奇安信
 https://www.qianxin.com/

###  深信服
 https://www.sangfor.com.cn/

###  绿盟
 https://www.nsfocus.com.cn/

###  启明
 https://www.venustech.com.cn/

###  飞塔
 https://www.fortinet.com/cn

###  派拓
 https://www.paloaltonetworks.cn/

###  CrowdStrike
 https://www.crowdstrike.com/en-us/

##  安全运营知识库
+  微软 安全101 文库 （⭐️ ）： https://www.microsoft.com/zh-cn/security/business/security-101/
+ CF 官方文库（注重看 Ddos、零信任部分）： https://www.cloudflare-cn.com/learning/
+ 派拓官方知识库： https://www.paloaltonetworks.cn/cyberpedia

安全断言标记语言 (SAML)

4A统一安全管控平台（以下简称4A企业版），实现T资源（包括系统资源和业务资源）集中管理，为企业提供集中的账号(Account）、认证（Authentication)、授权(Authorization）、审计(Audit)管理技术支撑及配套流程，提升系统安全性和可管理能力。

##  重要安全产品、设备
##  1️⃣零信任
 零信任架构：永不信任，永远验证 **作用**：最小权限访问、持续验证、防止横向、减少攻击面、 持续监控

 零信任中最重要的环节：身份验证

⭐️ 怎么做身份验证？

+ 多因素身份验证 (MFA)， 多种认证机制共同使用 （密码+手机验证码+人脸识别）
+ 双因素身份验证 (2FA)，使用两个认证机制 （密码+手机验证码）
+ 单点登录（SSO），用户会有统一的身份验证页面，参考百度 （百度一下、百度地图、百度 贴吧使用同一个登录验证页面 ）

+  OAuth 2.0 认证： 微信扫描登录，授权微信账号登录另外一个服务器应用 ，**第三方认证**
+ 令牌认证：jwt

 零信任的验证和授权规范：4A 既 账号（Account） 、认证（Authentication）、授权 (Authorization) 、审计(Audit)

## 2️⃣EDR
 终    端安全检测与响应 参考：深信服 edr ： https://www.sangfor.com.cn/knowledge/edr

XDR 可扩展式检测和响应 ： https://www.sangfor.com.cn/knowledge/xdr

XDR 和 EDR 的区别： https://www.microsoft.com/zh-cn/security/business/security-101/edr-vsxdr

EDR 侧重终端级威胁检测与响应，而 XDR 通过整合终端、网络、云、邮件等多维安全数据，实现跨安全域的关联分析与自动化响应，适合应对复杂攻击和 APT 场景

## 3️⃣VPN
 虚拟专用网 ：https://www.cloudflare-cn.com/learning/access-management/what-is-a-vpn/

###  VPN 和零信任的区别？
+  VPN 提供加密、隧道，缺乏vpn接入后的访问控制、权限识别、日志记录
+  零信任不仅提供加密隧道，且对接入后的资源进行持续的身份验证、严格权限控制和完整的 记录

## 4️⃣ IDS / IPS
+ IDS 入侵检测系统 NIDS基于网络的入侵检测系统 ： 监测和记录网络中的恶意行为
+ IPS 入侵防护系统 NIPS基于网络的入侵防护系统：检测、组织、记录网络中的恶意行为
+ 深信服 ids https://www.sangfor.com.cn/knowledge/ids
+ 深信服 ips https://www.sangfor.com.cn/knowledge/ips

| **特性** | **IDS (Intrusion Detection System)** | **IPS (Intrusion Prevention System)** |
| --- | --- | --- |
| **全称** | 入侵检测系统 | 入侵防御系统 |
| **动作** | **被动**：检测、记录并发出警报 | **主动**：检测、拦截并阻断威胁 |
| **部署方式** | 旁路部署（监听网络副本） | 直连部署（串联在网络中） |
| **对流量影响** | 无延迟（不处理原始数据包） | 略有延迟（需实时扫描并决定是否放行） |
| **主要功能** | 发现违规行为，事后分析 | 实时防护，防止攻击到达目标 |

## 5️⃣ 防火墙 / 下一代防火墙
+  防火墙：包过滤防火墙，拦截入、出方向特定网络协议或特定端口的防火墙
+ 下一代防火墙：集成了 ids 、ips 的防火墙

深信服下一代防火墙： https://www.sangfor.com.cn/knowledge/ngfw

## 6️⃣ SIEM  安全信息和事件管理 (日志）
 实时收集、聚合和分析来自整个组织的应用程序、设备、服务器和用户的大量数据

+ 微软文库： https://www.microsoft.com/zh-cn/security/business/security-101/what-is-siem
+ 深信服 siem ： https://www.sangfor.com.cn/knowledge/siem

 SIEM  安全信息和事件管理

## 7️⃣ NDR  网络检测与响应，全流量检测
实时收集网络流量、分析流量是否可疑。

+ 深信服ndr ： https://www.sangfor.com.cn/knowledge/ndr
+ 奇安信天眼： https://www.qianxin.com/product/detail/pid/328

## 8️⃣ 堡垒机  运维统一管理平台

+  jumpserver： https://jumpserver.org/
+  阿里云堡垒机 ： https://help.aliyun.com/zh/bh/product-overview/what-is-a-bastion-machine

## 9️⃣ 态势感知
 把几乎所有的安全设备、探针、采集器收集到的数据集中到一个统一的管理平台

 奇安信态势感知 ： `**https://www.qianxin.com/product/detail/pid/358  **`

## 🔟  SOC 安全运营中心
soc 不是特定的产品，是一类 安全产品、安全从业者、安全架构的集合

+ 微软知识库：
+ https://www.microsoft.com/zh-cn/security/business/security-101/what-is-asecurity-operations-center-soc

## 11  SOAR 安全编排自动化响应
 SOAR 是支持 SOC 的技术之一，自动防范网络攻击、自动进行应急响应、自动识别安全事件， 无需人工干预

+  微软知识库： https://www.microsoft.com/zh-cn/security/business/security-101/what-is-soar

## 12  DAST 漏洞扫描

+ **绿盟 WVSS ： https://www.nsfocus.com.cn/html/2019/206_0911/8.html**
+ **安恒明鉴： https://www.dbappsecurity.com.cn/product/cloud161.html**
+ **长亭洞鉴： https://www.chaitin.cn/xray**
+ **长亭无锋： https://www.chaitin.cn/xblad**e

## 13  SAST 静态应用程序检测工具
 代码审计、安全开发工具

+ github 官方代审工具 CodeQL ： https://codeql.github.com/
+ 长亭 慧鉴 ： https://www.chaitin.cn/codeinsight
+ 长亭 码力： https://www.chaitin.cn/codeforce

## 14  威胁情报
 态势感知的重要组成部分 https://x.threatbook.com/

## 15  RASP 运行时程序自我保护
###  和 waf 的区别：
+ **waf 是基于流量检测和匹配的，比如流量中有字符串 order by 9 ，waf 就认为是sql注入进行 拦截**
+ **rasp 是网站运行时进行的检测，比如用户输入了 order by 9 且真正发生了 sql注入，rsap 才 会拦截**

 百度rasp ： `**https://github.com/baidu/openrasp  **`

**1 修改配置文件**

2  启动网站时，使用 javaagent 加载 rasp.jar

`** java   -javaagent:rasp.jar所在绝对路径   -jar   javasec-1.15.jar  **`

3  攻击漏洞，被拦截

##  16. 蜜罐
 蜜罐 默安  ： https://github.com/hacklcx/HFish

[https://hfish.net/#/docker](https://hfish.net/#/docker)

```plain
docker pull threatbook/hfish-server:latest
```

```plain
docker run -itd --name hfish \
-v /usr/share/hfish:/usr/share/hfish \
--network host \
--privileged=true \
threatbook/hfish-server:latest
```

```plain
登陆地址：https://[server]:4433/web/
初始用户名：admin
初始密码：HFish2021
```





## 17 WAF
 雷池waf

 https://waf-ce.chaitin.cn/

安装：[https://help.waf-ce.chaitin.cn/node/01973fc6-df0f-7650-bafa-8ed8d2fc2bc1](https://help.waf-ce.chaitin.cn/node/01973fc6-df0f-7650-bafa-8ed8d2fc2bc1)

`bash -c "$(curl -fsSLk [https://waf-ce.chaitin.cn/release/latest/manager.sh)"](https://waf-ce.chaitin.cn/release/latest/manager.sh)")`
