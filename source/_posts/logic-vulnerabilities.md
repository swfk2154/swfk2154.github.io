---
title: "逻辑漏洞挖掘实战"
permalink: logic-vulnerabilities/
date: 2026-01-06 16:37:20
categories:
  - 网络安全
  - Web 安全
tags:
  - 逻辑漏洞
  - 越权
  - 渗透测试
img: /medias/featureimages/5.jpg
summary: "支付、验证码、越权、密码找回、抽奖等常见逻辑漏洞的场景、挖掘思路与案例。"
---

<!-- more -->

0x1. 逻辑漏洞

## 业务逻辑漏洞举例
+ 2021年 美团 app 忘记密码
    1. 手机号
    2. 补全身份证 （刚好是出生年月日）
+ 首次充值漏洞
    1. 黑胶vip 首次充值 1.99 元/月
    2. A 手机打开首次充值优惠界面，卡在支付界面，输入密码
    3. B 手机登录网易账号（这时 A 手机可能会被登出），也打开首次充值优惠界面
    4. A 手机支付 、 B 手机也支付， 用了两次首次充值优惠

## 2016年前乌云案例
> 乌云镜像站：[https://wy.zone.ci/](https://wy.zone.ci/)
>

### 1.支付逻辑漏洞
[在线支付逻辑漏洞总结](https://wooyun.kieran.top/#!/drops/47.%E5%9C%A8%E7%BA%BF%E6%94%AF%E4%BB%98%E9%80%BB%E8%BE%91%E6%BC%8F%E6%B4%9E%E6%80%BB%E7%BB%93)

#### 支付过程中可直接修改数据包中的支付金额
+ [必胜客宅急送支付表单伪造金额](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-05503)
+ [肯德基宅急送支付表单伪造金额](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-05444)
+ [新浪微号存在支付绕过漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-05316)
+ [淘宝网某处存在严重支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-07293)
+ [佳域手机官方商城支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-09375)
+ [91分站存在支付绕过](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-08745)
+ [江西移动1元钱买手机漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-08031)
+ [爱拍主站存在严重漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-010614)
+ [再爆苏宁某站点重大漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-010561)
+ [苏宁某站点存在严重漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-010351)
+ [TP-Link官方商城支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-012749)
+ [鲜果网支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-012542)
+ [京东商城购买商品时，可以修改商品金额，并且支付成功](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-012528)
+ [京东团购订单金额可在客户端修改并提交网银支付](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-012189)
+ [网通营业厅客户信息泄露、充值支付价格修改漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-012167)

#### 没有对购买数量进行负数限制
+ [百脑汇商城支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-07997)
+ [m1905电影网存在严重支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-06708)
+ [国美网上商城支付漏洞1元订购Iphone 4S！](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-07471)
+ [又拍网旗下某站存在严重支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-06589)
+ [新蛋中国支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-07738)
+ [拉卡拉商店0元购支付问题](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-011465)
+ [中粮52buy商城的支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-015067)
+ [115网盘存在支付绕过](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-05353)

#### 请求重放
+ [豆丁网购买豆元后可以将豆元倍增](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-05173)
+ [阿里云0元订单，服务器随便买](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2011-03009)

#### 其他参数干扰
+ [新东方逻辑支付漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-019761)

### 2.密码找回逻辑漏洞总结
+   [密码找回逻辑漏洞总结](https://wooyun.kieran.top/#!/drops/494.%E5%AF%86%E7%A0%81%E6%89%BE%E5%9B%9E%E9%80%BB%E8%BE%91%E6%BC%8F%E6%B4%9E%E6%80%BB%E7%BB%93)

#### 用户凭证暴力破解
+ [当当网任意用户密码修改漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-011833)
+ [微信任意用户密码修改漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-011720)

#### 返回凭证（URL/页面泄露）
+ [走秀网秀团任意密码修改缺陷](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-05630)
+ [天天网任意账户密码重置（二）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-058210)
+ [sohu邮箱任意用户密码重置](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-04728)
+ [新浪某站任意用户密码修改（验证码与取回逻辑设计不当）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-085124)

#### 弱 Token & 算法缺陷
+ [奇虎360任意用户密码修改漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-08333)
+ [中兴某网站任意用户密码重置漏洞（经典设计缺陷案例）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-090226)
+ [天天网任意账号密码重置(非暴力温柔修改)](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-094242)
+ [天天网再一次重置任意账号密码(依旧非暴力)](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-095729)

#### 用户凭证有效性/越权修改
+ [OPPO手机重置任意账户密码（3）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-053349)
+ [第二次重置OPPO手机官网任意账户密码（秒改）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-053079)
+ [OPPO修改任意帐号密码](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-020032)
+ [身份通任意密码修改-泄漏大量公民信息](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-012572)
+ [魅族的账号系统内存在漏洞可导致任意账户的密码重置](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-078208)

#### 重新绑定/逻辑覆盖
+ [网易邮箱可直接修改其他用户密码](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-08307)
+ [12308可修改任意用户密码](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-081467)
+ [某彩票设计缺陷可修改任意用户密码](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-092319)
+ [中国工控网任意用户密码重置漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-086726)
+ [中铁快运奇葩方式重置任意用户密码(admin用户演示)](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-088708)
+ [聚美优品任意修改用户密码(非爆破)](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-085843)

#### 服务器验证绕过
+ [携程旅行网任意老板密码修改](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-018263)
+ [AA拼车网之任意密码找回2](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-080278)
+ [四川我要去哪517旅行网重置任意账号密码漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-082582)
+ [某政企使用邮件系统疑似存在通用设计问题](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-088927)
+ [和讯网修改任意用户密码漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-091216)

#### 找回步骤跳过/本地验证可控
+ [OPPO手机同步密码随意修改，短信通讯录随意查看](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-042404)
+ [中国电信某IDC机房信息安全管理系统设计缺陷致使系统沦陷](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-098765)
+ [看我如何重置乐峰网供应商管理系统任意用户密码](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-083035)
+ [oppo重置任意用户密码漏洞(4)](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-069987)
+ [OPPO修改任意帐号密码-3](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-020532)
+ [OPPO修改任意帐号密码-2](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-020425)

#### 其他（注入/绑定缺陷）
+ [上海电信通行证任意密码重置](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-075941)
+ [用友人力资源管理软件（e-HR）另一处SQL注入漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-068060)

### 3.应用程序逻辑错误总结
+   [应用程序逻辑错误总结](https://wooyun.kieran.top/#!/drops/219.%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E9%80%BB%E8%BE%91%E9%94%99%E8%AF%AF%E6%80%BB%E7%BB%93)

#### 欺骗密码找回功能
+ [华为网盘部分用户密码修改](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-054068)

#### 规避交易限制
+ [destoon无限制增加帐号资金](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-050481)
+ [UCloud 另一处严重支付逻辑错误 导致可刷余额](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-048591)

#### 越权缺陷
+ [益云公益广告越权修改漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-051497)

#### cookies和session的问题
+ [益云广告平台任意帐号登录](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-051424)

#### 顺序执行缺陷（强制浏览）
+ [中国教师资格网绕过验证(可遍历全国教师身份信息)](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-050488)
+ [万达某分站逻辑错误可绕过支付直接获得取票密码](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-047677)

#### 时间刷新缺陷
+ [12306自动刷票时间可更改漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-048391)

### 4.我的越权之道
+   [我的越权之道](https://wooyun.kieran.top/#!/drops/107.%E6%88%91%E7%9A%84%E8%B6%8A%E6%9D%83%E4%B9%8B%E9%81%93)

#### 增加数据（Insert）越权
+ [爱拍越权漏洞及设计不合理漏洞大礼包（妹子哭了）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-033542)

#### 删除数据（Delete）越权
+ [百度创意专家某功能平行权限漏洞（可删除他人素材）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-039358)

#### 更改数据（Update）越权
+ [搜狐白社会任意用户信息修改漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-036411)

#### 查询数据（Select）越权
+ [Like团用户信息泄露+越权漏洞（可获取大量用户住址联系信息）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-033748)

#### 链接参数中的越权
+ [虾米网送娃娃漏洞（平行权限漏洞）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-031826)

### 5.验证码安全问题汇总
+   [验证码安全问题汇总](https://wooyun.kieran.top/#!/drops/525.%E9%AA%8C%E8%AF%81%E7%A0%81%E5%AE%89%E5%85%A8%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB)

#### 客户端问题
+ [南开大学信息门户网站设计不当可以爆破用户密码](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-082411)
+ [索尼验证码实现缺陷](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-06634)
+ [某会考报名系统验证码绕过可暴力破解](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-063644)
+ [吉祥航空任意客票遍历](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-086797)
+ [5173验证码可被绕过](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-05151)

#### 服务端逻辑问题（复用与非空）
+ [苏宁易购某系统后台验证码可重复利用](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-093065)
+ [cmseasy后台暴力破解验证码绕过](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-083050)
+ [ecshop后台暴力破解验证码绕过](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-082981)
+ [ecshop绕过验证码暴利破解2](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-025065)
+ [139邮箱图验证码绕过漏洞（可预测案例）](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-025245)

#### 绕过缺陷与“万能验证码”
+ [阿里巴巴某员工登录接口验证码绕过](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-071289)
+ [凡客某处验证码绕过漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-014563)
+ [财付通商户版登录验证码绕过](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-026219)
+ [正方教务管理系统设计错误，可绕过验证码进行暴破](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-021692)
+ [网宿某站SQL注入漏洞及验证码绕过](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2013-020517)
+ [百度空间用户登录绕过验证码验证](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-05095)

#### 验证码强度不足（OCR易识别）
+ [招商银行设计缺陷可被穷举攻击](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-092497)
+ [光大证券交易系统资金账号可被穷举攻击](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2015-092415)

### 6.JS敏感信息泄露
+   [JS敏感信息泄露](https://wooyun.kieran.top/#!/drops/625.JS%E6%95%8F%E6%84%9F%E4%BF%A1%E6%81%AF%E6%B3%84%E9%9C%B2%EF%BC%9A%E4%B8%8D%E5%AE%B9%E5%BF%BD%E8%A7%86%E7%9A%84WEB%E6%BC%8F%E6%B4%9E)

#### JS文件泄露后台管理敏感路径及API
+ [PKAV腾讯专场 - 2. 腾讯产品交流平台的一个js文件泄漏了一个url之后](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2012-013530)

#### 页面内JS泄露 http-only 保护的 Cookie
+ [我是如何窃取到百度受http-only保护的cookie的(3)](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-072951)

#### 页面内JS及AJAX请求泄露用户敏感信息
+ [百度某站设计缺陷2：获取匿名用户手机号漏洞](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-049775)
+ [百度某站一处设计缺陷导致部分用户手机号与邮箱等信息泄漏](https://wy.zone.ci/bug_detail.php?wybug_id=wooyun-2014-049759)

## 业务逻辑漏洞分类脑图

- **身份认证缺陷**：暴力破解、Cookie/Session 伪造、万能密码、密码找回/重置逻辑绕过
- **权限控制（越权）**：水平越权、垂直越权、上下文越权、未授权访问后台接口
- **数据与交易篡改**：商品金额/数量篡改（负数/溢出）、支付状态欺骗、优惠券并发重复领取、充值逻辑漏洞
- **验证码与频率限制**：验证码复用、验证码返回包泄露、万能验证码、短信/邮件接口轰炸与并发利用
- **业务流程绕过**：强行跳转步骤、逆序操作、前端签名绕过、条件竞争（Race Condition）

## 业务逻辑漏洞靶场
burpsuite 靶场

[https://portswigger.net/web-security/all-labs](https://portswigger.net/web-security/all-labs)

### 怎么挖漏洞
全局代理：[https://ip.skk.moe/split-tunnel](https://ip.skk.moe/split-tunnel)

方法1：
补天公益 [https://www.butian.net/Reward/plan/2](https://www.butian.net/Reward/plan/2) -> 得到域名 -> fofa/hunter 信息收集 -> 每个站点点开后使用 findsomethings 找接口/ 点击网站的功能 -> 分别测

方法2：
教育src （全国大学只要是域名为 edu.cn 结尾的都是）-> 确定大学目标 -> fofa/hunter 信息收集 -> 每个站点点开后使用 findsomethings 找接口/ 点击网站的功能 -> 分别测

注意：不要用任何扫描器，信息收集用fofa/hunter
