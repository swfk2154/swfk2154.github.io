---
title: "红蓝对抗"
permalink: red-blue-teaming/
date: 2026-02-04 14:56:25
categories:
  - 网络安全
  - 安全运营
tags:
  - 红蓝对抗
  - 护网
  - 安全运营
img: /medias/featureimages/4.jpg
summary: "红蓝对抗的组织形式、紫队职责、复盘度量与常态化攻防演练的落地要点。"
---

<!-- more -->

## 红蓝对抗
### 参与方
红队：模拟攻击方

蓝队：防御方

紫队：技战法总结、裁判、沙盘推演

### 攻防演练 （护网）
- 国家HW

- 地区HW

- 行业HW

### 重保 （蓝队）
- 冬奥会

- 亚运会

- 两会

### 蓝队工作概览
1. 准备阶段 ： 方案制定、前期沟通协调、前期渗透、安全基线、设备上架部署、安全意识培训、 资产梳理

2. 预演练（红蓝对抗）

3. 正式HW （主防、监测、 溯源）

    - 领导组

    - 保障组

    - 监测组

    - 应急处置组

    - 溯源组

    - 研判组

4. 复盘、总结

5. 常态化HW

## 蓝队
### 1️⃣ 资产梳理
企业资产：

+ 公司信息、分公司、下属单位
+ 域名： 主域名、子域名、测试域名、废弃域名
+ 应用资产：公众号、小程序、app 、桌面端应用

互联网资产：

+ 边界服务
+ 云资产
+ AI 模型、接口、token 资产
+ 配置排查
+ 弱口令排查
+ 敏感信息排查
    - 公开文档信息
    - 网盘、NAS （参考：飞牛os任意文件读取）
    - github
    - 论坛、贴吧
    - 邮箱
+ 常见服务排查
    - ssh、rdp、redis、ftp ...
+ 常见供应链、依赖库历史漏洞排查
    - fastjson 、OA
+ API 接口测试
+ VPN 管控

内网资产：

+ 终端安全
    - 杀毒软件、EDR
    - 准入系统 vpn、零信任
    - 桌面管理
+ 无线网络
+ 蓝牙

### 2️⃣ 安全意识
+ 禁止个人终端存放口令等敏感文件
+ 禁止点击来源不明的邮件和链接
+ 发现疑似钓鱼行为，及时上报
+ 禁止开启远程协助工具，vnc、向日葵、todesk、rustdesk、teamveiwer
+ 禁止使用非工作邮箱代替工作邮件
+ 下班关闭计算机，离开电脑锁定计算机
+ 禁止工作计算机插入不明来源的设备
+ 禁止接入不明来源的网络，禁止开热点
+ 禁止内网穿透
+ 禁止传播涉密文件
+ 禁止传播涉密文件到互联网大模型
+ 禁止网盘、禁止云存储

### 3️⃣ 安全运营
+ 监测 流量、监测日志
+ 溯源、取证
+ 安全开发
+ 威胁情报
+ 协作
+ 安全合规
+ 安全知识图谱
+ 漏洞库
+ SOAR 、SOC

4️⃣ 应急响应

准备、检测、遏制、根除、恢复、跟踪

+ 入侵排查
+ 溯源取证
+ 漏洞修复
+ 总结归纳

知识库：
[https://book.noptrace.com/](https://book.noptrace.com/)
[https://bypass007.github.io/Emergency-Response-Notes/](https://bypass007.github.io/Emergency-Response-Notes/)
[https://blue.y1ng.org/](https://blue.y1ng.org/)
[https://wiki.y1ng.org/](https://wiki.y1ng.org/)

工具箱：
[https://github.com/abc123info/BlueTeamTools](https://github.com/abc123info/BlueTeamTools)
[https://github.com/ChinaRan0/BlueTeamTools](https://github.com/ChinaRan0/BlueTeamTools)

工具：
火绒剑

#### windows 入侵排查
##### 注册表
+ 开机启动项
+ 镜像劫持
+ SAM 数据库

##### 计划任务
+ schtasks

##### 进程
+ tasklist

##### 用户
+ net user

##### 服务
##### 网络
+ netstat -ano

##### 日志
##### 异常文件
在线沙箱：
微步： [https://s.threatbook.com/](https://s.threatbook.com/)
freebuf ： [https://sandbox.freebuf.com/detect](https://sandbox.freebuf.com/detect)

在线的杀毒引擎
[https://www.virustotal.com/gui/home/upload](https://www.virustotal.com/gui/home/upload)

webshell在线检测： [https://ti.aliyun.com/#/webshell](https://ti.aliyun.com/#/webshell)
webshell 检测工具： [https://github.com/opensec-cn/chip](https://github.com/opensec-cn/chip)

内存马查杀： [https://github.com/4ra1n/shell-analyzer](https://github.com/4ra1n/shell-analyzer)

#### linux 入侵排查
##### 日志
```perl
lastb
last
w
```

##### 账号
+ 排查 /etc/passwd
+ 排查 /etc/sudoers
+ 排查公钥 `cat /home/*/.ssh/authorized_keys` `cat /root/.ssh/authorized_keys`

##### 历史命令
```bash
history
/root/.bash_history
/root/.zsh_history
/home/*/.bash_histroy
/home/*/.zsh_history
```

##### 网络
```css
netstat -anltup
ss -antup
lsof -i -n
```

##### 进程
```css
ps
top
```

##### 开启自启动服务
```bash
ls -l /etc/rc2.d/
```

##### 计划任务
```swift
crontab -l
/etc/crontab
/var/spool/cron/crontabs/用户名
/var/spool/cron/用户名
```

### 5️⃣ 安全开发
[https://github.com/Tencent/secguide](https://github.com/Tencent/secguide)
