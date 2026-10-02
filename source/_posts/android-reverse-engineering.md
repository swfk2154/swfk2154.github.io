---
title: "安卓逆向学习笔记"
permalink: android-reverse-engineering/
date: 2026-01-11 23:00:00
categories:
  - 网络安全
  - 移动安全
tags:
  - 安卓逆向
  - Frida
  - 脱壳
img: /medias/featureimages/14.jpg
summary: "APK 结构、反编译工具链、Frida 动态调试与 Log 插桩，以及去广告、VIP 分析的实战记录。"
---

<!-- more -->

---

## 第一部分：APK 结构与基础

### Apk结构
 apk全称Android Package，它相当于一个压缩文件，只要在电脑上将apk后缀改为rar即可解压

| 文件 | 注释 |
| --- | --- |
| assets目录 | 存放APK的静态资源文件，比如视频、音频、图片等 |
| lib目录 | armeabi-v7a基本通用所有android设备，arm64-v8a只适用于64位的android设备，x86常见用于android模拟器，其目录下的.so文件是c或c++编译的动态链接库文件 |
| META-INF目录 | 保存应用的签名信息，签名信息可以验证APK文件的完整性，相当于APK的身份证（验证文件是否又被修改） |
| res目录 | res目录存放资源文件，包括图片、字符串等，APK的脸蛋由他的layout文件设计 |
| AndroidManifest.xml文件 | APK的应用清单信息，它描述了应用的名字、版本、权限、引用的库文件等信息 |
| classes.dex文件 | classes.dex是java源码编译后生成的java字节码文件，APK运行的主要逻辑 |
| resources.arsc文件 | resources.arsc是编译后的二进制资源文件，它是一个映射表，映射着资源和id，通过R文件中的id就可以找到对应的资源 |

### 双开及原理
 双开：简单来说，就是手机同时运行两个或多个相同的应用，例如同时运行两个微信

| 原理 | 解释 |
| --- | --- |
| 修改包名 | 让手机系统认为这是2个APP，这样的话就能生成2个数据存储路径，此时的多开就等于你打开了两个互不干扰的APP |
| 修改Framework | 对于有系统修改权限的厂商，可以修改Framework来实现双开的目的，例如：小米自带多开 |
| 通过虚拟化技术实现 | 虚拟Framework层、虚拟文件系统、模拟Android对组件的管理、虚拟应用进程管理 等一整套虚拟技术，将APK复制一份到虚拟空间中运行，例如：平行空间 |
| 以插件机制运行 | 利用反射替换，动态代{过}{滤}理，hook了系统的大部分与system—server进程通讯的函数，以此作为“欺上瞒下”的目的，欺骗系统“以为”只有一个apk在运行，瞒过插件让其“认为”自己已经安装。例如：VirtualApp |

### 汉化APK
 汉化：使用专门的工具对外文版的软件资源进行读取、翻译、修改、回写等一系列处理，使软件的菜单、对话框、提示等用户界面显示为中文，而程序的内核和功能保持不变，这个过程即为软件汉化

**基本上字符串都是在arsc里，建议一键汉化，然后再润色。**

**少量没汉化到的字符串参考视频中的方法定位去逐个汉化**

#### **流程图**
 这里还需要注意的是，如果要直装应用，那就应该先签名安装，看看是否有签名校验导致的闪退

### 初识AndroidManifest.xml
 AndroidManifest.xml文件是整个应用程序的信息描述文件，定义了应用程序中包含的Activity,Service,Content provider和BroadcastReceiver组件信息。每个应用程序在根目录下必须包含一个AndroidManifest.xml文件，且文件名不能修改。它描述了package中暴露的组件，他们各自的实现类，各种能被处理的数据和启动位置。

| 属性 | 定义 |
| --- | --- |
| versionCode | 版本号，主要用来更新，例如:12 |
| versionName | 版本名，给用户看的，例如:1.2 |
| package | 包名，例如：com.zj.52pj.demo |
| uses-permission android:name="" | 应用权限，例如：android.permission.INTERNET 代表网络权限 |
| android:label="@string/app_name" | 应用名称 |
| android:icon="@mipmap/ic_launcher" | 应用图标路径 |
| android:debuggable="true" | 应用是否开启debug权限 |

---

## 第二部分：动态调试与 Log 插桩

### 什么是动态调试
 动态调试是指自带的调试器跟踪自己软件的运行，可以在调试的过程中知道参数或者局部变量的值以及履清代码运行的先后顺序。多用于爆破注册码(CTF必备技能)

### 动态调试步骤
#### 修改debug权限
 方法一:在AndroidManifest.xml里添加可调试权限

```python
android:debuggable="true"
```

 方法二：XappDebug模块hook对应的app

[https://github.com/Palatis/XAppDebug](https://github.com/Palatis/XAppDebug)

 方法三：Magisk命令(重启失效)

```python
1.  adb shell #adb进入命令行模式

2.  su #切换至超级用户

3.  magisk resetprop ro.debuggable 1

4.  stop;start; #一定要通过该方式重启
```

 方法四:刷入MagiskHide Props Config模块(永久有效)

 一般来说，在4选项中如果有ro.debuggable那就直接修改
没有的话就选5

 修改ro.debuggable的值为1

#### 端口转发以及开启adb权限
版本号点击七次开启开发者模式并开启adb调试权限

夜神模拟器：adb connect 127.0.0.1:62001

#### 下段点
 ctrl+b下断点

#### debug模式启动
```python
adb shell am start -D -n com.zj.wuaipojie/.ui.MainActivity
```

adb shell am start -D -n
adb shell am start -D -n 包名/类名
am start -n 表示启动一个activity
am start -D 表示将应用设置为可调试模式

#### Jeb附加调试进程
激活jeb

在线python运行

[https://tool.lu/pyc/](https://tool.lu/pyc/)

 算号代码：

```python
#https://bbs.pediy.com/
#!/usr/bin/env python
import os, sys, struct, time, binascii, hashlib

RC4_Key2= 'Eg\xa2\x99_\x83\xf1\x10'

def rc4(Key, inData):
    Buf = ""
    S = range(256)
    K = (map(lambda x:ord(x), Key) * (256 / len(Key) + 1))[:256]
    j = 0
    for i in range(256):
        j = (S[i] + K[i] + j) % 256
        S[i], S[j] = S[j], S[i]
    i, j = 0, 0
    for x in range(len(inData)):
        i = (i + 1) % 256
        j = (j + S[i]) % 256
        S[i], S[j] = S[j], S[i]
        Buf += chr(S[(S[j] + S[i]) % 256] ^ ord(inData[x]))
    return Buf

def Long2Int(longdata):
    lo = longdata & 0xFFFFFFFF
    hi = (longdata >> 32) & 0x7FFFFFFF
    return hi, lo

def KeygenSN(LicenseSerial, MachineID):
    mhi, mlo = Long2Int(MachineID)
    lhi, llo = Long2Int(LicenseSerial)
    hi_Key = (mhi - lhi + 0x55667788) & 0x7FFFFFFF
    lo_Key = (mlo + llo + 0x11223344) & 0xFFFFFFFF
    Z0, = struct.unpack('<Q', struct.pack('<LL', lo_Key, hi_Key))
    Z1 = int(time.time()) ^ 0x56739ACD
    s = sum(map(lambda x:int(x, 16), "%x" % Z1)) % 10
    return "%dZ%d%d" % (Z0, Z1, s)

def ParsePost(buf):
    Info = struct.unpack('<3L2Q4LQ3L', buf[:0x40])
    flag, CRC, UserSerial, LicenseSerial, MachineID, build_type, \
          Ver_Major, Ver_Minor, Ver_Buildid, Ver_Timestamp, \
          TimeOffset, Kclass, Random2 = Info
    SysInfoData = buf[0x40:]
    assert CRC == binascii.crc32(buf[8:]) & 0xFFFFFFFF
    return Info, SysInfoData

def DecodeRc4Str(buf):
    buf = buf.decode('hex')
    i, s = ParsePost(rc4(buf[:8] + RC4_Key2, buf[8:]))
    return i, s

def GetJebLicenseKey():
    licdata = ""
    if licdata:
        i, MachineID = DecodeRc4Str(licdata)
        SN = KeygenSN(i[3], i[4])
        print "JEB License Key:", SN
        return SN

GetJebLicenseKey()
raw_input("Enter to Exit...")

```

 快捷键：
^F6进入方法
F6跳过方法
F7从方法中跳出来
R运行到光标处

flag{54uZ5q2XDAUM}

### Log插桩
定义：Log插桩指的是反编译APK文件时，在对应的smali文件里，添加相应的smali代码，将程序中的关键信息，以log日志的形式进行输出。

调用命令

```python
invoke-static {对应寄存器}, Lcom/mtools/LogUtils;->v(Ljava/lang/Object;)V
```

---

## 第三部分：去除广告

### 广告类型
 启动广告     弹窗&更新广告   横幅广告

### 安卓四大组件
| 组件 | 描述 |
| --- | --- |
| Activity(活动) | 在应用中的一个Activity可以用来表示一个界面，意思可以理解为“活动”，即一个活动开始，代表 Activity组件启动，活动结束，代表一个Activity的生命周期结束。一个Android应用必须通过Activity来运行和启动，Activity的生命周期交给系统统一管理。 |
| Service(服务) | Service它可以在后台执行长时间运行操作而没有用户界面的应用组件，不依赖任何用户界面，例如后台播放音乐，后台下载文件等。 |
| Broadcast Receiver(广播接收器) | 一个用于接收广播信息，并做出对应处理的组件。比如我们常见的系统广播：通知时区改变、电量低、用户改变了语言选项等。 |
| Content Provider(内容提供者) | 作为应用程序之间唯一的共享数据的途径，Content Provider主要的功能就是存储并检索数据以及向其他应用程序提供访问数据的接口。Android内置的许多数据都是使用Content Provider形式，供开发者调用的（如视频，音频，图片，通讯录等） |

#### activity的切换
```python
        <!---声明实现应用部分可视化界面的 Activity，必须使用 AndroidManifest 中的 <activity> 元素表示所有 Activity。系统不会识别和运行任何未进行声明的Activity。----->
        <activity
            android:label="@string/app_name"
            android:name="com.zj.wuaipojie.ui.MainActivity"
            android:exported="true">  <!--当前Activity是否可以被另一个Application的组件启动：true允许被启动；false不允许被启动-->
            <!---指明这个activity可以以什么样的意图(intent)启动--->
            <intent-filter>
                <!--表示activity作为一个什么动作启动，android.intent.action.MAIN表示作为主activity启动--->
                <action
                    android:name="android.intent.action.MAIN" />
                <!--这是action元素的额外类别信息，android.intent.category.LAUNCHER表示这个activity为当前应用程序优先级最高的Activity-->
                <category
                    android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <activity
            android:name="com.zj.wuaipojie.ui.ChallengeFirst" />
        <activity
            android:name="com.zj.wuaipojie.ui.ChallengeFifth"
            android:exported="true" />
        <activity
            android:name="com.zj.wuaipojie.ui.ChallengeFourth"
            android:exported="true" />
        <activity
            android:name="com.zj.wuaipojie.ui.ChallengeThird"
            android:exported="false" />
        <activity
            android:name="com.zj.wuaipojie.ui.ChallengeSecond"
            android:exported="false" />
        <activity
            android:name="com.zj.wuaipojie.ui.AdActivity" />
```

启动广告流程：
启动Activity->广告Activity->主页Activity

修改方法：
1.修改加载时间
2.Acitivity切换定位，修改Intent的Activity类名

```python
        switch (position) {
            case 0:
                Intent intent = new Intent();
                intent.setClass(it.getContext(), ChallengeFirst.class);
                it.getContext().startActivity(intent);
                return;
            case 1:
                Intent intent2 = new Intent();
                intent2.setClass(it.getContext(), ChallengeSecond.class);
                it.getContext().startActivity(intent2);
                return;
            case 2:
                Intent intent3 = new Intent();  //new一个Intent，
                intent3.setClass(it.getContext(), AdActivity.class);  //传入要切换的Acitivity的类名
                it.getContext().startActivity(intent3);  //启动对应的Activity
                return;
            case 3:
                Intent intent4 = new Intent();
                intent4.setClass(it.getContext(), ChallengeFourth.class);
                it.getContext().startActivity(intent4);
                return;
            default:
                return;
        }

```

### Activity生命周期
| 函数名称 | 描述 |
| --- | --- |
| onCreate() | 一个Activity启动后第一个被调用的函数，常用来在此方法中进行Activity的一些初始化操作。例如创建View，绑定数据，注册监听，加载参数等。 |
| onStart() | 当Activity显示在屏幕上时，此方法被调用但此时还无法进行与用户的交互操作。 |
| onResume() | 这个方法在onStart()之后调用，也就是在Activity准备好与用户进行交互的时候调用，此时的Activity一定位于Activity栈顶，处于运行状态。 |
| onPause() | 这个方法是在系统准备去启动或者恢复另外一个Activity的时候调用，通常在这个方法中执行一些释放资源的方法，以及保存一些关键数据。 |
| onStop() | 这个方法是在Activity完全不可见的时候调用的。 |
| onDestroy() | 这个方法在Activity销毁之前调用，之后Activity的状态为销毁状态。 |
| onRestart() | 当Activity从停止stop状态恢进入start状态时调用状态。 |

### 弹窗定位&堆栈分析
 修改方法：
1.修改xml中的versiocode
2.Hook弹窗(推荐算法助手开启弹窗定位)
3.修改dex弹窗代码
4.抓包修改响应体(也可以路由器拦截)

### 布局优化
 1.开发者助手抓布局
2.MT管理器xml搜索定位
3.修改xml代码

`android:visibility="gone"`

---

## 第四部分：实战：VIP 功能分析

### 什么是JVM、Dalvik、ART
 JVM是JAVA虚拟机，运行JAVA字节码程序
Dalvik是Google专门为Android设计的一个虚拟机，Dalvik有专属的文件执行格式dex(Dalvik executable)
Art(Android Runtime)相当于Dalvik的升级版，本质与Dalvik无异

### smali及其语法
 smali是Dalvik的寄存器语言，smali代码是dex反编译而来的。

 关键字

| 名称 | 注释 |
| --- | --- |
| .class | 类名 |
| .super | 父类名，继承的上级类名名称 |
| .source | 源名 |
| .field | 变量 |
| .method | 方法名 |
| .register | 寄存器 |
| .end method | 方法名的结束 |
| public | 公有 |
| protected | 半公开，只有同一家人才能用 |
| private | 私有，只能自己使用 |
| .parameter | 方法参数 |
| .prologue | 方法开始 |
| .line xxx | 位于第xxx行 |

 数据类型对应

| smali类型 | java类型 | 注释 |
| --- | --- | --- |
| V | void | 无返回值 |
| Z | boolean | 布尔值类型，返回0或1 |
| B | byte | 字节类型，返回字节 |
| S | short | 短整数类型，返回数字 |
| C | char | 字符类型，返回字符 |
| I | int | 整数类型，返回数字 |
| J | long （64位 需要2个寄存器存储） | 长整数类型，返回数字 |
| F | float | 单浮点类型，返回数字 |
| D | double （64位 需要2个寄存器存储） | 双浮点类型，返回数字 |
| string | String | 文本类型，返回字符串 |
| Lxxx/xxx/xxx | object | 对象类型，返回对象 |

 常用指令

| 关键字 | 注释 |
| --- | --- |
| const | 重写整数属性，真假属性内容，只能是数字类型 |
| const-string | 重写字符串内容 |
| const-wide | 重写长整数类型，多用于修改到期时间。 |
| return | 返回指令 |
| if-eq | 全称equal(a=b)，比较寄存器ab内容，相同则跳 |
| if-ne | 全称not equal(a!=b)，ab内容不相同则跳 |
| if-eqz | 全称equal zero(a=0)，z即是0的标记，a等于0则跳 |
| if-nez | 全称not equal zero(a!=0)，a不等于0则跳 |
| if-ge | 全称greater equal(a>=b)，a大于或等于则跳 |
| if-le | 全称little equal(a<=b)，a小于或等于则跳 |
| goto | 强制跳到指定位置 |
| switch | 分支跳转，一般会有多个分支线，并根据指令跳转到适当位置 |
| iget | 获取寄存器数据 |

 其余指令可用语法工具查询

 定位方法：搜索弹窗关键字、抓取按钮id

 例子：

```python
//一个私有、静态、不可变的方法   方法名
.method private static final onCreate$lambda-2(Lkotlin/jvm/internal/Ref$IntRef;Lcom/zj/wuaipojie/ui/ChallengeSecond;Landroid/widget/ImageView;Landroid/widget/ImageView;Landroid/widget/ImageView;Landroid/view/View;)Z //(这里面是方法的参数)这里是方法返回值类型，表示布尔值类型，返回假或真
    .registers 7  //寄存器数量

    .line 33  //代码所在的行数
    iget p0, p0, Lkotlin/jvm/internal/Ref$IntRef;->element:I  //读取p0(第一个参数，参考寄存器知识)中element的值赋值给p0

    const/4 p5, 0x1  //p5赋值1

    const/16 v0, 0xa //v0赋值10，在16进制里a表示10

    if-ge p0, v0, :cond_15  //判断p0的值是否大于或等于v0的值(即p0的值是否大于或等于10)，如果大于或等于则跳转到:cond_15

    .line 34  //以下是常见的Toast弹窗代码
    check-cast p1, Landroid/content/Context; //检查Context对象引用

    const-string p0, "请先获取10个硬币哦" //弹窗文本信息，把""里的字符串数据赋值给p0

    check-cast p0, Ljava/lang/CharSequence; //检查CharSequence对象引用

    invoke-static {p1, p0, p5}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    //将弹窗文本、显示时间等信息传给p1

    move-result-object p0  //结果传递给p0

    invoke-virtual {p0}, Landroid/widget/Toast;->show()V  //当看到这个Toast;->show你就应该反应过来这里是弹窗代码

    goto :goto_31  //跳转到:goto_31

    :cond_15 //跳转的一个地址

    invoke-virtual {p1}, Lcom/zj/wuaipojie/ui/ChallengeSecond;->isvip()Z  //判断isvip方法的返回值是否为真(即结果是否为1)

    move-result p0  //结果赋值给p0

    if-eqz p0, :cond_43 //如果结果为0则跳转cond_43地址

    const p0, 0x7f0d0018  //在arsc中的id索引，这个值可以进行查询

    .line 37
    invoke-virtual {p2, p0}, Landroid/widget/ImageView;->setImageResource(I)V //设置图片资源

    const p0, 0x7f0d0008

    .line 38
    invoke-virtual {p3, p0}, Landroid/widget/ImageView;->setImageResource(I)V

    const p0, 0x7f0d000a

    .line 39
    invoke-virtual {p4, p0}, Landroid/widget/ImageView;->setImageResource(I)V

    .line 40
    sget-object p0, Lcom/zj/wuaipojie/util/SPUtils;->INSTANCE:Lcom/zj/wuaipojie/util/SPUtils;

    check-cast p1, Landroid/content/Context;

    const/4 p2, 0x2 //p2赋值2

    const-string p3, "level" //sp的索引

    invoke-virtual {p0, p1, p3, p2}, Lcom/zj/wuaipojie/util/SPUtils;->saveInt(Landroid/content/Context;Ljava/lang/String;I)V //写入数据

    goto :goto_50 //跳转地址

    :cond_43

    check-cast p1, Landroid/content/Context;

    const-string p0, "\u8bf7\u5148\u5145\u503c\u5927\u4f1a\u5458\u54e6\uff01" //请先充值大会员哦！

    check-cast p0, Ljava/lang/CharSequence;

    invoke-static {p1, p0, p5}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p0

    invoke-virtual {p0}, Landroid/widget/Toast;->show()V

    :goto_50
    return p5  //返回p5的值
.end method //方法结束

//判断是否是大会员的方法
.method public final isvip()Z
    .registers 2

    const/4 v0, 0x0 //v0赋值0

    return v0 //返回v0的值

.end method

```

 修改方法：修改判断、强制跳转、修改寄存器的值

### 寄存器
 在smali里的所有操作都必须经过寄存器来进行:本地寄存器用v开头数字结尾的符号来表示，如v0、 v1、v2。 参数寄存器则使用p开头数字结尾的符号来表示，如p0、p1、p2。特别注意的是，p0不一定是函数中的第一个参数，在非static函数中，p0代指“this"，p1表示函数的第一个 参数，p2代表函数中的第二个参数。而在static函数中p0才对应第一个参数(因为Java的static方法中没有this方法）

 通过修改 Smali 分支指令（if → goto / 注释）来绕过客户端校验，实现逻辑短路的逆向破解手段
