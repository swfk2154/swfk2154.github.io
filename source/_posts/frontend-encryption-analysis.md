---
title: "前端加解密场景下的渗透测试"
permalink: frontend-encryption-analysis/
date: 2026-01-14 01:45:55
categories:
  - 网络安全
  - Web 安全
tags:
  - 前端加解密
  - Burp
  - 加密绕过
img: /medias/featureimages/2.jpg
summary: "当接口参数加密传输时，如何定位前端加密函数、配合 Burp 插件与 RPC 完成改包测试。"
---

<!-- more -->

## 前端加密 和 前端签名
+ 前端使用 **JS**  代码生成的加密信息和签名
+ 作用：前端加密或签名不能防御漏洞，但是可以提高黑客的利用成本 （防重放、 防自动化扫 描工具、防爬虫）

## 前端签名
## 特征
特征：在请求头或请求体中有 **“签名” 同义词的参数，能防止数据包篡改**

## 分析签名逻辑
在**js 中定位 签名逻辑**

1 类似加密 `encrypto` 函数名

发现 Encrypt(word)

2 找参数 是什么

方法1：上下文 分析

`word 是 username=用户输入的用户名&password=用户输入的密码  `

方法2：动态调用 js

得到签名的逻辑是 username=用户输入的用户名&password=用户输入的密码 进行 **HmacSHA256** 加密的结果

## 手动验证签名逻辑
自己生成的签名和抓包抓到的签名一致，说明上一步 “**分析签名逻辑**” 是正确的

## 自动化实现前端签名
### 1 yakit 热加载脚本

```plain
encrypt_singnature = func(packet) {
    // 获取请求体
    body = poc.GetHTTPPacketBody(packet /*type: []byte*/)
    // 获取json对象
    params = json.loads(body)
    // 获取用户输入的用户名
    username = params.username
    // 获取用户输入的密码
    password = params.password

    // 待加密的字符串
    text = f`username=${username}&password=${password}`

    // 密钥
    key = "31323334313233343132333431323334"

    // 进行加密
    singnature_string = codec.EncodeToHex(codec.HmacSha256(f`${codec.DecodeHex(key)~}`, text))

    // 封装新的请求体
    new_body = f`{"signature":"${singnature_string}", "key":"${key}", "username":"${username}", "password":"${password}"}`

    return string(poc.ReplaceBody(packet /*type: []byte*/, new_body /*type: []byte*/, false))
}

beforeRequest = func(req){
    return encrypt_singnature(req)
}
```

`实现签名的自动计算，可以随意的改动数据包，也可以自动爆破  `

###  2 burpsuite autodecoder
#### python开发框架
Django / Flask / FastAPI

Django 适合完整 Web 系统，Flask 适合轻量级服务，FastAPI 更偏高并发 API 和微服务场景

#### 1  编写加解密接口
##### （签名只有加密，没有解密）
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, Response, request
import base64, re
import requests
import json
import hmac
import hashlib
from urllib.parse import quote, urlencode

app = Flask(__name__)

# {
#   "signature": "1",
#   "key": "31323334313233343132333431323334",
#   "username": "admin",
#   "password": "123456"
# }

@app.route('/encode', methods=["POST"])
def encrypt():
    # 获取 post 请求体
    param = request.form.get('dataBody')
    # 获取 post 请求头
    headers = request.form.get('dataHeaders')

    json_data = json.loads(param)
    # 待加密的字符
    text = f'username={json_data["username"]}&password={json_data["password"]}'


    # 使用 HMAC-SHA256 加密 (等效于 CryptoJS.HmacSHA256)
    key_hex = json_data.get('key', '31323334313233343132333431323334')  # 从 json 获取 key
    key_bytes = bytes.fromhex(key_hex)  # 十六进制字符串转为字节
    encrypt_string = hmac.new(key_bytes, text.encode('utf-8'), hashlib.sha256).hexdigest()
    json_data['signature'] = encrypt_string


    return headers.strip() + "\r\n\r\n\r\n\r\n" + json.dumps(json_data)

@app.route('/decode', methods=["POST"])
def decrypt():
    # 获取 post 请求体
    param = request.form.get('dataBody')
    # 获取 post 请求头
    headers = request.form.get('dataHeaders')
    # 返回请求头和请求体
    return headers.strip() + "\r\n\r\n\r\n\r\n" + param

if __name__ == '__main__':
    app.debug = True  # 设置调试模式，生产模式的时候要关掉debug
    app.run(host="0.0.0.0", port="8888")
```

#### 2  运行加解密接口
（安装：`pip  install  flask`）

#### 3  使用 autodecoder 插件测试接口是否可以

#### 4  设置 autodecoder 插件

#### 5  在burpsuite Repeater 中测试

这时签名会自动替换，但是在 burpsuite Repeater 中无法看到实时替换，需要到 burpsuite logger 日志中才能看到

#### 6  burpsuite 爆破

⚠️  flask 接口是 python 写的，性能比较低，如果爆破速度过快，可能导致 flask 无法及时处 理，故需要降低爆破线程

### 3 jsrpc
#### 1 运⾏服务端
`window_amd64.exe`

#### 2 注⼊客户端
浏览器开发者⼯具 ，控制台中执⾏

```python
var rpc_client_id, Hlclient = function (wsURL) {
    this.wsURL = wsURL;
    this.handlers = {
        _execjs: function (resolve, param) {
            try {
                var fn = new Function('return (async () => { ' + param + ' })()');
                var result = fn();
                if (result && typeof result.then === 'function') {
                    result.then(function(res) {
                        resolve(res !== undefined ? res : "执行成功(无返回值)");
                    }).catch(function(err) {
                        resolve("执行错误: " + (err.message || err));
                    });
                } else {
                    resolve(result !== undefined ? result : "执行成功(无返回值)");
                }
            } catch (err) {
                resolve("语法错误: " + (err.message || err));
            }
        }
    };
    this.socket = undefined;
    if (!wsURL) {
        throw new Error('wsURL can not be empty!!')
    }
    this.connect()
}
Hlclient.prototype.connect = function () {
    if (this.wsURL.indexOf("clientId=") === -1 && rpc_client_id) {
        this.wsURL += "&clientId=" + rpc_client_id
    }
    console.log('begin of connect to wsURL: ' + this.wsURL);
    var _this = this;
    try {
        this.socket = new WebSocket(this.wsURL);
        this.socket.onmessage = function (e) {
            _this.handlerRequest(e.data)
        }
    } catch (e) {
        console.log("connection failed,reconnect after 10s");
        setTimeout(function () {
            _this.connect()
        }, 10000)
    }
    this.socket.onclose = function () {
        console.log('rpc已关闭');
        setTimeout(function () {
            _this.connect()
        }, 10000)
    }
    this.socket.addEventListener('open', (event) => {
        console.log("rpc连接成功");
        this._reportActions();
    });
    this.socket.addEventListener('error', (event) => {
        console.error('rpc连接出错,请检查是否打开服务端:', event.error);
    })
};
Hlclient.prototype.send = function (msg) {
    this.socket.send(msg)
}
Hlclient.prototype.regAction = function (func_name, func) {
    if (typeof func_name !== 'string') {
        throw new Error("an func_name must be string");
    }
    if (typeof func !== 'function') {
        throw new Error("must be function");
    }
    console.log("register func_name: " + func_name);
    this.handlers[func_name] = func;
    this._reportActions();
    return true
}
Hlclient.prototype._reportActions = function () {
    var actions = Object.keys(this.handlers);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send(JSON.stringify({
            "action": "_registerActions",
            "message_id": "",
            "response_data": JSON.stringify(actions)
        }));
    }
}
Hlclient.prototype.handlerRequest = function (requestJson) {
    var _this = this;
    try {
        var result = JSON.parse(requestJson)
    } catch (error) {
        console.log("请求信息解析错误", requestJson);
        return
    }
    if (result["registerId"]) {
        rpc_client_id = result['registerId']
        return
    }
    if (!result['action'] || !result["message_id"]) {
        console.warn('没有方法或者消息id,不处理');
        return
    }
    var action = result["action"], message_id = result["message_id"]
    var theHandler = this.handlers[action];
    if (!theHandler) {
        this.sendResult(action, message_id, 'action没找到');
        return
    }
    try {
        if (!result["param"]) {
            const async_result = theHandler(function (response) {
                _this.sendResult(action, message_id, response);
            })
            if (async_result && typeof async_result.then === "function") {
                async_result.catch(e => {
                    _this.sendResult(action, message_id, "" + e);
                });
            }
            return
        }
        var param = result["param"]
        try {
            param = JSON.parse(param)
        } catch (e) {
        }
        theHandler(function (response) {
            _this.sendResult(action, message_id, response);
        }, param)
    } catch (e) {
        console.log("error: " + e);
        _this.sendResult(action, message_id, "" + e);
    }
}
Hlclient.prototype.sendResult = function (action, message_id, e) {
    if (typeof e === 'object' && e !== null) {
        try {
            e = JSON.stringify(e)
        } catch (v) {
            console.log(v)
        }
    }
    this.send(JSON.stringify({"action": action, "message_id": message_id, "response_data": e}));
}
```

#### 3 客户端连接服务器
浏览器开发者⼯具 ，控制台中执⾏

`var demo = new Hlclient("ws://127.0.0.1:12080/ws?group=zzz&name=kls");`

#### 4 注册⼀个加密⽅法
浏览器开发者⼯具 ，控制台中执⾏

`window.enc = Object(Encrypt)`

⚠ Encrypt 是加密函数的名字，需要根据实际⽹站替换

```python
demo.regAction("hi", function (resolve,param) {
res = enc(param['word'])
resolve(res);
})
```

#### 5 调⽤ jsrpc ⾃动加解密
`http://127.0.0.1:12080/go?group=zzz&action=hi&param={"word":"username%3Da%26password%3Db"}`

⚠ group 要和上⽂⼀致

⚠ action 要和上⽂⼀致

⚠ param 的值是 {"word":"待加密、待签名的内容"}

`{"word":"username=a&password=b"}`

响应中的 data 字段，即为签名或加密结果

#### 6 jsprc 和 burpsuite 联⽤
##### 1️⃣ 编写 autodecoder 插件脚本并运⾏
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, Response, request
import base64, re
import requests
import json
import hmac
import hashlib
from urllib.parse import quote, urlencode

app = Flask(__name__)

jsrpc_url = "http://127.0.0.1:12080/go"

@app.route('/encode', methods=["POST"])
def encrypt():
    # 获取 post 请求体
    param = request.form.get('dataBody')
    # 获取 post 请求头
    headers = request.form.get('dataHeaders')

    json_data = json.loads(param)

    # 待加密的字符
    text = f'username={json_data["username"]}&password={json_data["password"]}'
    print(text)
    # 拼接jsrpc url的参数
    jsrpc_params = {
        "group": "zzz",
        "action": "hi",
        "param": json.dumps({"word":text})
    }
    # 发送jsrpc 请求
    result_body = requests.post(url=jsrpc_url, data=jsrpc_params)
    # 从结果中提取 data，就是 signature 字符串
    result_json = json.loads(result_body.text)
    signature_string = result_json['data']

    json_data['signature'] = signature_string

    # print(json.dumps(json_data))

    return headers.strip() + "\r\n\r\n\r\n\r\n" + json.dumps(json_data)

@app.route('/decode', methods=["POST"])
def decrypt():
    # 获取 post 请求体
    param = request.form.get('dataBody')
    # 获取 post 请求头
    headers = request.form.get('dataHeaders')
    # 返回请求头和请求体
    return headers.strip() + "\r\n\r\n\r\n\r\n" + param

if __name__ == '__main__':
    app.debug = True  # 设置调试模式，生产模式的时候要关掉debug
    app.run(host="0.0.0.0", port="8888")
```

##### 2️⃣ 设置 autodecoder 插件
设置加密接⼝为 [http://127.0.0.1:8888/encode](http://127.0.0.1:8888/encode)

##### 3️⃣ 测试接⼝

##### 4️⃣ 启⽤ autodecoder

##### 5️⃣ 测试 Repeater 或 Intruder

## 前端加密

## 特征
用户传入的参数被加密了，黑客如果想要测试漏洞，就需要预先完成加解密的过程

## 分析加解密逻辑
### 静态分析

### 动态调试

### 手动验证签名逻辑
#### 手动实现解密

#### 手动实现加密

Raw 是按原始可读格式展示数据，适合分析 HTTP 请求和参数；
Hex 是按字节的十六进制形式展示，适合分析二进制、加密或编码后的数据。

## 自动化实现前端加密
### 1 yakit 热加载脚本
```plain
encryptData = (packet) => {

    // 从请求包里获取 key 和 iv
    key = codec.DecodeHex("31323334313233343132333431323334")~ /* 加密密钥 */
    iv = codec.DecodeHex("d5884e15f4f29728bbc254786189dd10")~ /* 初始化向量 */

    // 待加密的字符 整个body {"username":"a","password":"b"}
    body = poc.GetHTTPPacketBody(packet /*type: []byte*/)

    // 对整个 body 进行aes 加密
    aes_crypted_string = codec.AESCBCEncryptWithPKCS7Padding(key, body, iv)~
    // aes 加密后还需要 base64 编码
    base64_encoded_string = codec.EncodeBase64(aes_crypted_string)

    // 整合新的请求体
    new_body = f`{"data":"${base64_encoded_string}","key":"${codec.EncodeToHex(key)}","iv":"${codec.EncodeToHex(iv)}"}`

    // 用新的请求体替换原本的请求体
    return string(poc.ReplaceBody(packet /*type: []byte*/, new_body ,false /*type: bool*/))
}

beforeRequest = func(req){
    return encryptData(req)
}
```

### 2 burpsuite autodecoder ⾃定义接⼝
#### 1 编写 flask 接口
```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, Response, request
import base64, re
import requests
import json
import hmac
import hashlib
from urllib.parse import quote, urlencode
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes

app = Flask(__name__)

# {
#   "data": "VTDf5mBldXCiZNR0ObuJc9AwHKCuO5/Ze5+GGvZRPDw=",
#   "key": "31323334313233343132333431323334",
#   "iv": "d1023d90ad9216c6e29b324a3992c53f"
# }

@app.route('/encode', methods=["POST"])
def encrypt():
    # 获取 post 请求体  {"username":"a","password":"b"}
    param = request.form.get('dataBody')

    # 获取 post 请求头
    headers = request.form.get('dataHeaders')

    # 提取 json 中字段和值
    json_data = json.loads(param)

    # 提取字段并拼接成字符串
    result = f'{{"username":"{json_data["username"]}","password":"{json_data["password"]}"}}'
    # 使用 AES CBC 加密 (等效于 CryptoJS.AES.encrypt)

    # 随机生成 16 字节的 key 和 iv
    key_bytes = get_random_bytes(16)
    iv_bytes = get_random_bytes(16)

    padded_data = pad(result.encode('utf-8'), AES.block_size)
    # aes 加密和 base64 编码
    encrypt_string = base64.b64encode(AES.new(key_bytes, AES.MODE_CBC, iv_bytes).encrypt(padded_data)).decode('utf-8')

    # 重构新的请求体
    json_data['data'] = encrypt_string
    json_data['key'] = key_bytes.hex()
    json_data['iv'] = iv_bytes.hex()

    del json_data['username']
    del json_data['password']

    # 返回新的请求体
    return headers.strip() + "\r\n\r\n\r\n\r\n" + json.dumps(json_data)

@app.route('/decode', methods=["POST"])
def decrypt():
    # 获取 post 请求体
    param = request.form.get('dataBody')
    # 获取 post 请求头
    headers = request.form.get('dataHeaders')
    # 返回请求头和请求体
    return headers.strip() + "\r\n\r\n\r\n\r\n" + param

if __name__ == '__main__':
    app.debug = True  # 设置调试模式，生产模式的时候要关掉debug
    app.run(host="0.0.0.0", port="8888")
```

#### 2 测试接口是否可用

测试加密：请求体要是 明文

如果能正常加密，说明接口正常

#### 3 启用替换
#### 4 Repeater 即可生效

#### 5 intruder 爆破

###  3 burpsuite autodecoder ⾃带算法加解密
#### 1 设置自带算法加解密
⚠️key 和 iv 都是 base64

`"data":\s*"(\{.*?\})"`

（⚠ 正则可以使⽤⼤模型编写）

```python
{
"data":"{"username":"admin","password":"123"}",
"key":"31323334313233343132333431323334",
"iv":"d1023d90ad9216c6e29b324a3992c53f"
}

写一个提取 data 字段({"username":"admin","password":"123"})的正则表达式
```

key：`MTIzNDEyMzQxMjM0MTIzNA==`

iv：`Xfjqfp48US7O2JClhSqRpQ==`，`"data":\s*"(.*?})",`

+ 1 填写base64 编码后的key 和 iv
+ 2 分别测试加解密
+ 3 添加为请求包加解密方式，添加为响应包解密方式
+ 4 粘贴明文的请求体
+ 5 找大模型写正则表达式，并测试正则是否可用

#### 2 开启自带算法加解密

#### 3 repeater 测试成功
#### 4 intruder 测试成功

## 前端加密的SQL注⼊
### 1 静态分析 与 动态调试加密逻辑
#### 静态分析 js

#### 动态调试 js

### 2 验证逻辑

### 3 编写热加载 脚本
```python
encryptData = (packet) => {

    // 从请求包里获取 key 和 iv
    key = codec.DecodeHex("ad74c4ef3fee0006a131dae0091719e9")~ /* 加密密钥 */
    iv = codec.DecodeHex("e06d2d01491cf8ec88772d0b8b2e5734")~ /* 初始化向量 */

    // 待加密的字符 整个body {"username":"a","password":"b"}
    body = poc.GetHTTPPacketBody(packet /*type: []byte*/)

    // 对整个 body 进行aes 加密
    aes_crypted_string = codec.AESCBCEncryptWithPKCS7Padding(key, body, iv)~
    // aes 加密后还需要 base64 编码
    base64_encoded_string = codec.EncodeBase64(aes_crypted_string)

    // 整合新的请求体
    new_body = f`{"message":"${base64_encoded_string}","key":"${codec.EncodeToHex(key)}","iv":"${codec.EncodeToHex(iv)}"}`

    // 用新的请求体替换原本的请求体
    return string(poc.ReplaceBody(packet /*type: []byte*/, new_body ,false /*type: bool*/))
}

decryptData = (packet) => {
    // 获取响应体
    body = poc.GetHTTPPacketBody(packet /*type: []byte*/)
    // 获取响应体中的json
    body_json = json.loads(body)

    // 从响应体中获取 key
    key = codec.DecodeHex(body_json.key)~
    // 从响应体中获取 iv
    iv = codec.DecodeHex(body_json.iv)~

    // 从响应体中获取 待解密的字符串
    message = body_json.message

    // 编写解密逻辑
    // 先 base64 解码
    base64_decoded_string = codec.DecodeBase64(message)~
    // 再 aes 解密
    aes_decrypted_string = codec.AESCBCDecryptWithPKCS7Padding(key /*type: []byte*/, base64_decoded_string, iv /*type: []byte*/)~

    // 构造新的响应体
    new_body = f'${aes_decrypted_string}'

    // 替换原本的响应体为新的响应体
    return string(poc.ReplaceBody(packet /*type: []byte*/, new_body /*type: []byte*/, false /*type: bool*/))

}
beforeRequest = func(req){
    return encryptData(req)
}

afterRequest = func(rsp){
    return decryptData(rsp)
}

```

```python
encryptAES = (packet) => {
    body = poc.GetHTTPPacketBody(packet)
    // 生成随机key和iv
    key =  randstr(32)
    iv = randstr(32)
    // 加密数据
    data = codec.AESCBCEncrypt(key /*type: []byte*/, body, iv /*type: []byte*/)~
    data = codec.EncodeBase64(data)
    // 获取key和iv的hex值
    hexKey = codec.EncodeToHex(key)
    hexIV = codec.EncodeToHex(iv)
    // 构造新的body
    body = f`{"key": "${hexKey}","iv": "${hexIV}","message": "${data}"}`

    return poc.ReplaceBody(packet, body, false)
}

decryptAES = (packet) => {
    body = poc.GetHTTPPacketBody(packet)
    body = json.loads(body)
    key = codec.DecodeHex(body.key)~
    iv = codec.DecodeHex(body.iv)~
    data = codec.DecodeBase64(body.message)~
    data = codec.AESCBCDecrypt(key, data, iv)~
    return poc.ReplaceBody(packet, data, false)
}

beforeRequest = func(req){
    return encryptAES(req)
}
afterRequest = func(rsp){
    return decryptAES(rsp)
}

```

### 4 测试

### 5 和 sqlmap 联⽤
sqlmap 是不能实现⾃动加解密，所以⽆法检测前端加密的 sql 注⼊

sqlmap + 热加载 : sqlmap 连接 yakit 代理，实现⾃动加解密 ，这⾥yakit 充当中间⼈，进⾏⾃动 加密请求、⾃动解密响应

⚠ sqlmap 发给 yakit 热加载的必须是明⽂信息

`python sqlmap.py -r 1.txt --batch --dbms sqlite --proxy=socks5://127.0.0.1:8083 --tables`
