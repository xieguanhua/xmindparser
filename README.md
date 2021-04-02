xmindparser
=========

一个简单的javascript模块，用于Xmind 双向格式转换

安装
============
使用（[npm](http://npmjs.org)）源安装，npm install xmindparser

可用脚本
============
### `npm run test`

运行测试程序.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

快速开始
============
### `xmind转json`
 ```javascript
 const xmindparser = require('xmindparser');
let parser = new xmindparser()
//xmind转脑图 json 支持二进制文件或url和本地目录
const fileOrPath = 'test.xmind' 
 parser.xmindToJSON(fileOrPath).then(json => {
     console.log(json)
})
```
### `json转xmind`
 ```javascript
 const xmindparser = require('xmindparser');
let parser = new xmindparser()
const json = {
    "template": "default",
    "theme": "fresh-blue",
    "root": {
        "data": {"text": "中心主题", "note": "", "imageSize": {}},
        "children": [{
            "children": [{"children": [], "data": {"text": "新建节点", "note": "", "imageSize": {}}}],
            "data": {"text": "新建节点", "note": "", "imageSize": {}}
        }, {
            "children": [{"children": [], "data": {"text": "新建节点", "note": "", "imageSize": {}}}],
            "data": {"text": "新建节点", "note": "", "imageSize": {}}
        }, {"children": [], "data": {"text": "新建节点", "note": "", "imageSize": {}}}, {
            "children": [],
            "data": {"text": "新建节点", "note": "", "imageSize": {}}
        }, {"children": [], "data": {"text": "新建节点", "note": "", "imageSize": {}}}, {
            "children": [],
            "data": {"text": "新建节点", "note": "", "imageSize": {}}
        }]
    }
}

//脑图 json转xmind 浏览器返回blob node返回pathurl
const fileOrPath = 'test.xmind' 
parser.JSONToXmind(json,outputPath).then(data => {
     console.log(data)
 })
```
### Methods
#### .xmindToJSON(params) 
| Name | Type | Default | Required |
|:---- |:----:|:-------:|:--------:|
| params | （path,url,buffer,blob） | `-` | Y |
#### .JSONToXmind(json,outputPath) 
| Name | Type | Default | Required |
|:---- |:----:|:-------:|:--------:|
| json | （object） | `-` | Y |
| outputPath | string | `path.join(__dirname, '../')` | node:Y |
