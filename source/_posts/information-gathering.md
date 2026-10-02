---
title: "渗透测试信息收集方法论"
permalink: information-gathering/
date: 2025-11-26 01:15:23
categories:
  - 网络安全
  - Web 安全
tags:
  - 信息收集
  - 子域名
  - 指纹识别
img: /medias/featureimages/9.jpg
summary: "域名、子域名、端口、指纹、敏感信息等维度的收集工具与思路，以及企业信息与社工库入口。"
---

<!-- more -->

## 渗透测试分类
## 黑盒测试
没有后端代码 ，根据网站的业务逻辑，挖掘后端漏洞

## 白盒测试
有后端代码，根据后端代码的算法，进行调试，分析是否存在安全漏洞 （代码审计）

## 灰盒测试
有一定的后端代码 或服务器信息，如 甲方预先给你提供了 网站的后台密码、VPN、数据库密码

## 信息收集
渗透测试的关键

### 分类
#### 主动信息收集
直接与目标进行 交互的信息收集方法

#### 被动信息收集
不与目标直接交互，使用第三方平台、第三方网站进行信息收集

信息收集能力：

1 长亭法人是谁？ 创始人是谁？创始人毕业于哪个大学？创始人故乡是哪？

2  微博公司名字是什么？微博总部地址在哪？

### 1 域名信息收集
#### 1 主域名 信息收集
##### 1 ICP 备案收集
（只针对境内网站）

ICP备案：ICP备案是中国对在中国境内提供互联网信息服务的单位或个人进行登记备案的管理制度。所有在中国大陆架设的网站，包括APP和小程序，都需要进行ICP备案，才能正常访问。未完成备案的网站将无法解析和访问。

 ICP备案查询：  [https://www.beianx.cn/search](https://www.beianx.cn/search)

1  通过主域名找公司名

2  通过公司名找其他主域名

##### 2 whois 信息
######  whois：
###### 是一种用于查询域名注册信息的协议和服务。
通过 WHOIS 查询，可以获取域名的注册人信息、联系方式、注册商、注册和到期日期、域名服务器等公开数据。

 站长之家：  [https://whois.chinaz.com/](https://whois.chinaz.com/)

```plain
whois   baidu.com
```

##### 3 域名 权重
**域名权重**：**衡量一个网站在搜索引擎中的综合排名实力的指标，用于预测其在搜索结果中的排名能力**

SEO：Search Engine Optimization（搜索引擎优化）的英文缩写，它是一种数字营销做法， 旨在提高网站在搜索引擎（如谷歌、百度等）自然（非付费）搜索结果页面中的可见性和排名

权重越高，相同类型漏洞的危害越大

[https://www.aizhan.com/cha](https://www.aizhan.com/cha)

##### 4 whois 反向查询(境外)
（常用于境外网站 ）

通过域名的注册人信息，查询相同注册人的其他域名

[https://www.ggcx.com/](https://www.ggcx.com/)

##### 5 IP 地址反向查询域名
应用场景：一个IP可能有多个网站，同一个IP的不同站点称为"旁站"

DNS 默认是已知域名，查询 IP

DNS 已知IP ，查询域名：DNS需要预先配置了 PTR 解析记录，才能够通过IP反向找到域名 (一 般域名不会配置 PTR 记录)

1 ：PTR 记录

2： 第三方网站查询（不准）

[https://dns.aizhan.com/](https://dns.aizhan.com/)

#### 2 子域名 信息收集
主域名：baidu.com

子域名：www.baidu.com 、news.baidu.com、abc.news.baidu.com

##### 1 爆破子域名
子域名字典: [https://github.com/TheKingOfDuck/fuzzDicts/blob/master/subdomainDicts/main.txt](https://github.com/TheKingOfDuck/fuzzDicts/blob/master/subdomainDicts/main.txt)

工具：[https://github.com/knownsec/ksubdomain](https://github.com/knownsec/ksubdomain)

 [https://github.com/euphrat1ca/LayerDomainFinder](https://github.com/euphrat1ca/LayerDomainFinder)

##### 2 证书透明度查询
[https://crt.sh/](https://crt.sh/)

证书透明度查询的结果不准，因为企业有很多域名并不会做域名解析，或提供网站服务

##### 3 搜索引擎
寻找baidu子域名

```plain
site:baidu.com
site:.edu.cn
```

寻找清华大学子域名

```plain
site:tsinghua.edu.cn
```

寻找中国大学及教育机构子域名

```plain
site:.edu.cn
```

##### 4 网络空间 测绘平台
使用此类工具，主要是看帮助手册 :  [https://fofa.info/](https://fofa.info/)

```plain
domain="tsinghua.edu.cn"
```

 其他语法

```plain
domain="tsinghua.edu.cn" && body="后台"
```

hunter  :  [https://hunter.qianxin.com/](https://hunter.qianxin.com/)

360 quake  ：  [https://quake.360.net/quake/#/index](https://quake.360.net/quake/#/index)

zoomeye  ：[https://www.zoomeye.ai/](https://www.zoomeye.ai/)

零零信安  ：[https://0.zone/](https://0.zone/)

shodan：  [https://www.shodan.io/](https://www.shodan.io/)

##### 5 自动化工具 oneforall
**注意：** 运行python一般都会使用虚拟环境

[https://github.com/shmilylty/OneForAll](https://github.com/shmilylty/OneForAll)

安装 （注意 python 版本 不要 太高）

```plain
git clone https://github.com/shmilylty/OneForAll.git
cd OneForAll
pip install -r requirements.txt
```

**注意：** requirements.txt 是python的依赖模块，一般在运行python之前，都需要安装 pip install -r requirements.txt

使用

查看 oneforall 的帮助信息

```plain
python oneforall.py
```

```plain
python oneforall.py --target 主域名 run
```

配置

```plain
config/api.py 配置付费接口,比如 fofa、hunter 等测绘平台接口
config/settings.py 设置,是否开启爆破、是否开启递归、是否使用代理等
config/default.py 默认配置,比如端口范围
```

### 2 IP信息收集
#### 1 域名解析为 IP 地址
```plain
nslookup www.baidu.com
```

#### 2 CDN 判断
##### 1 nslookup
 使用CDN的网站：

```plain
出现多个ip地址
有cname特征
```

##### 2 多地ping
不同的地方ping同一个网站，ip解析结果不同，且具有地理趋向，可以判断网站使用了CDN服务

#### 3 CDN 绕过
绕过cdn，找到服务器真实ip地址

#####  1 DNS 历史解析
如： 有域名 www.xxx.com ， 2024年开设网站时，没有cdn服务，2025年才购买cdn服 务。 只需找到 2024年 www.xxx.com 解析记录，即可找到真实IP

[https://securitytrails.com/](https://securitytrails.com/)

#####  2 子域名的DNS 记录

#####  3 DNS 配置缺陷

#####  4 国外 ping
有些CDN只能在国内提供服务，如果从国外ping域名，得到的即为 域名的真实 ip 地址 （已淘汰，现在cdn都有海外节点）

#####  5 原始邮件头
邮件收发使用的是 SMTP 协议，不能使用cdn服务，如果一个公司的网站服务刚好和邮件服务在同一个服务器上，就可能造成真实 ip 泄露  （已淘汰：现在的公司会直接购买 阿里云、腾讯云提供的邮件收发服务，原始邮件头看到的是 阿里云或腾讯云随机分配的ip地址，没有用）

#####  6 网站敏感信息泄露
`phpinfo SERVER_ADDR 可能会泄露服务器的真实地址  `

#####  7 扫描全网
[https://github.com/superfish9/hackcdn](https://github.com/superfish9/hackcdn)

#### 4 C 段查询
（网站没有使用cdn，才可以进行C段查询）

假设 www.xxx.com 的ip是 150.165.96.0/24 ，那么 150.165.96.0/24 一个网段，很可能存在其他ip 地址也属于同一个公司  （已淘汰， 云服务一般不会连续分配公网ip）

C段查询一般针对内网扫描：[https://github.com/lcvvvv/kscan](https://github.com/lcvvvv/kscan)

防火绒杀毒：（设置文件夹信任区）

[https://github.com/shadow1ng/fscan](https://github.com/shadow1ng/fscan)

[https://gobysec.net/](https://gobysec.net/)

#### 5 端口扫描
kscan、 fscan、 goby 都能进行端口扫描

windows nmap 安装：  [https://nmap.org/dist/nmap-7.98-setup.exe](https://nmap.org/dist/nmap-7.98-setup.exe)

##### 1  默认扫描
```plain
nmap 192.168.2.111
nmap 192.168.2.0/24
```

##### 2  TCP 快速扫描
```plain
nmap -sT -T4 192.168.2.111
nmap -sT -T4 192.168.2.111/24
-sT : TCP 端口扫描
-T4 ：速度，0-5 ，0最慢，5最快
```

##### 3  指定端口扫描
```plain
nmap -sT -T4 -p445 192.168.2.111
-p445 只扫描445端口

扫描全端口
nmap -sT -T4 -p0-65535 192.168.2.111
nmap -sT -T4 -p- 192.168.2.111
```

##### 4  禁用ICMP，直接扫描
###### nmap默认情况下，
###### 扫描前需要是否能ping通，
###### 如果ping不通，
就忽略了

```plain
nmap -sT -T4 -Pn 192.168.2.111
-Pn 扫描前不用ping，直接开扫(nmap默认情况下，扫描前需要是否能ping通，如果ping不通，
就忽略了)
```

##### 5  扫描服务版本
```plain
nmap -sT -T4 -Pn -sV 192.168.2.131
-sV 扫描详细的服务版本（不准）
```

##### 6  扫描操作系统版本
```plain
nmap -O 192.168.2.111
-O 扫描操作系统版本
```

##### 7  不进行端口扫描，直接Ping探测
```plain
nmap -sn 192.168.2.0/24
nmap -sn -PE 192.168.2.0/24
-sn 不扫描端口，直接进行存活探测
-PE 进行ping扫描
```

##### 8  UDP端口扫描
```plain
nmap -sU -p5900 192.168.2.111
-sU 扫描UDP端口
```

##### 9  半开扫描
```plain
nmap -sS -T4 192.168.2.111
-sS TCP半开扫描，只进行 SYN 握手
```

##### 10  半开扫描 ACK
```plain
nmap -sA -T4 192.168.2.111
-sA TCP ACK 扫描
```

##### 11  NSE 脚本
```plain
nmap 拓展脚本
nmap 拓展脚本是 nse 脚本，nse 脚本涵盖漏洞扫描、敏感信息探测等功能
```

调用脚本

```plain
nmap -sU -p137 --script=nbstat.nse 192.168.2.0/24
```

##### 12  扫描结果
```plain
open 打开
filtered 未知，可能是被防火墙拦截
closed 关闭
```

### 3 网站信息收集
#### 1 指纹信息
##### 收集指纹的作用
攻击网站和服务一般都是使用历史漏洞，如 目标有1000 个网站，快速的判断 1000个网站中，有哪些网站是 thinkphp 框架写的，如有 就可以尝试**thinkphp** 的历史漏洞进行攻击

#### 什么是指纹
1 网站使用了什么**编程语言**：前端（vue、flutter、react）、后端（php、java、python、go、asp.net）

2 网站 **web 服务器中间件** ：tomcat、apache、nginx、jboss、weblogic、iis、caddy、tengine、

东方通、宝兰德

3 网站使用了什么**操作系统**：Linux、Windows

4 网站使用了 什么**后端开发框架**：springboot、spring mvc、struts2、django、flask、fastapi、gin、thinkphp

5 网站使用了什么**CMS系统**（内容管理系统）：discuz、wordpress、drupal、joomla、织梦cms

6 网站使用了什么 **开发组件、开发库**：搜索引擎（Elasticsearch、solr）、JSON解析引擎（fastjson、jackson）、安全框架（Spring Security、Apache shiro）、日志记录（log4j2、logback）、数据库连接池（c3p0、Alibaba Druid）、ORM框架（mybatis、hibernate）、富文本编辑器（FCKeditor、Kindeditor、ueditor）

7 网站使用了什么**dbms（数据库管理引擎）**：mysql、mssql、postgresql

8 网站使用了什么**waf （web 应用防火墙）**：雷池、安全狗、云锁、G01、宝塔、云WAF

9 网站使用了什么 **OA (办公自动化)**：（泛微、通达、用友、金碟、致远、金和、禅道、蓝凌）

#### ELK日志管理与分析技术栈
是一个由三个开源项目组成的日志管理与分析技术栈的简称，这三个项目分别是：

Elasticsearch

Logstash

Kibana

##### 自动化工具
工具好不好用，在于指纹库的丰富度

工作时，可能项目会有成千上万个网站，需要自动化批量进行指纹信息识别

指纹库：  [https://github.com/0x727/FingerprintHub](https://github.com/0x727/FingerprintHub)

工具：

[https://github.com/lcvvvv/kscan](https://github.com/lcvvvv/kscan)

[https://github.com/emo-crab/observer_ward](https://github.com/emo-crab/observer_ward)

[https://github.com/P1-Team/AlliN](https://github.com/P1-Team/AlliN)

其他工具：

[https://github.com/EdgeSecurityTeam/EHole](https://github.com/EdgeSecurityTeam/EHole)

[https://github.com/chaitin/xapp](https://github.com/chaitin/xapp)

 **浏览器插件  ：**

**wappalyzer**

⚠ wappalyzer 经常会被缓存影响，需要手动清除缓存

**雪瞳**

[https://github.com/SickleSec/SnowEyes](https://github.com/SickleSec/SnowEyes)

下载:

chrome打开开发者模式

把 SnowEyes-v0.2.7.6-patch.zip 直接拖到chrome中即可完成安装

#### 2 目录探测
为了发现网站的目录、页面、接口、敏感文件泄露

##### 1 目录爆破
字典：

[https://github.com/TheKingOfDuck/fuzzDicts/tree/master/directoryDicts](https://github.com/TheKingOfDuck/fuzzDicts/tree/master/directoryDicts)

工具：  dirsearch

[https://github.com/maurosoria/dirsearch](https://github.com/maurosoria/dirsearch)

⚠️ ：运行python，一般会使用虚拟环境（conda），记得安装 python的依赖

 (`pip install -r requirements.txt` )

```plain
python dirsearch.py -u "http://testphp.vulnweb.com/"
```

 burp 插件  :  RouteVulScan

[https://github.com/F6JO/RouteVulScan](https://github.com/F6JO/RouteVulScan)

怎么使用：

确保 dashboard扫描打开

打开 RouteVulScan

只要是burpsuite抓包的网站，都会被自动丢进 RouteVulScan进行扫描

##### 2 常见信息泄露
###### 1 备份文件泄露
开发者可能会在网站的目录中留下 .zip .tar .tar.gz 等文件格式的备份信息，可能 泄露源代码 或其 他敏感信息

如果真实项目中，通过信息泄露拿到了别人服务器后端源代码，应该做什么？ ⚠️ ： 找敏感信息 （比如数据库密码， 一般数据库密码都在网站的配置文件中 [config 、 conf]）

###### 2  git 泄露
开发者比较习惯把自己的代码上传到 github、 gitlab、gitea 中，如果开发者部署生产环境时，忘记删除当前目录中的 .git 文件，就可能造成 git 泄露，可能会产生后端源代码泄露

发现git泄露后，需要使用工具尝试换源后端服务器源代码

###### 3  敏感接口泄露
###### springboot actuator 接口泄露：

######  /actuator/env 泄露JVM环境变量和配置属性

###### /actuator/heapdump 下载jvm转储文件（heapdump可以看到 /actuator/env中星号的明文）
```plain
java -jar JDumpSpider-1.1-SNAPSHOT-full.jar D:\Download\heapdump
```

###### 4  API文档泄露
[https://swagger.org.cn/tools/swagger-ui/](https://swagger.org.cn/tools/swagger-ui/)

swagger-ui.html 泄露接口文档，属于低危漏洞。是否能够行成高危、严重漏洞，主要靠泄露的 api 是否有漏洞

##### 3  爬虫
爬虫就是burpsuite模拟点击，记录能够点击到的所有的页面

结果：sitemap

##### 4  JS 提取信息
前后端分离的网站中，js 中会留下很多后端的 api 接口信息，提取出 api 可以进一步继续渗透测试

**浏览器插件 findsomething**

收集到的  PATH （接口），需要猜想接口的功能，并逐一测试是否有漏洞

**浏览器插件 雪瞳**

#### 3  网站敏感信息提取
比如网站响应很多时候，会携带身份证号、手机号、密码、密钥等敏感信息

##### 1 burpsuite 插件 Hae：自动标记敏感信息
[https://github.com/gh0stkey/HaE](https://github.com/gh0stkey/HaE)

##### 2 谷歌黑客语法
```plain
site 站点 site:baidu.com
intext 正文搜索 intext:身份证号
inurl 在url中搜索 inurl:news.php
intitle 在标题中搜索 intitle:后台管理
filetype 文件类型 filetype:pdf

黑客语法大全：https://www.exploit-db.com/google-hacking-database
```

找清华大学的后台管理页面

```plain
site:tsinghua.edu.cn intitle:后台
```

找中国哪些大学可能会泄露学生的身份证号表格文件

```plain
site:edu.cn intext:身份证号 filetype:xls
```

找世界上哪些网站有git泄露

```plain
intext:"index of" ".git"
```

##### 3 github 搜索语法
 企业的开发可能会把自己的源代码放到github仓库中，如果上传时，开发者忘记去除敏感信息， 就会造成大量的密钥泄露

 信息泄露搜索语法大全：

[https://book.hacktricks.wiki/](https://book.hacktricks.wiki/)

 举例：白嫖openai api接口，github上一定有安全意识非常差的开发者，直接把自己的openai api 接口密钥放到github中

 搜索语法：

```plain
OPENAI_API_KEY="sk
```

 检测接口是否可用：

 curl   --location '   https://api.openai.com/v1/models'   \   --header   'Authorization:  Bearer  sk-xxxxxxxx（示例密钥已脱敏）'

#####  4  网站历史页面
  [https://web.archive.org/](https://web.archive.org/)

####  4  企业信息收集
##### 1  企业基本信息
 法人、供应链、子公司/分公司、公司人数、知识产权

 爱企查：  [https://www.aiqicha.com/](https://www.aiqicha.com/?)

 企查查：  [https://www.qcc.com/](https://www.qcc.com/)

##### 2  移动资产
 公司有哪些app、小程序、公众号

 小程序  :  微信 "搜一搜"  ;   知识产权、经营状况

APP

七麦数据

[https://www.qimai.cn/](https://www.qimai.cn/)

公 众 号  :  微信搜一搜  ;  搜狗搜索
