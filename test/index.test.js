const xmindParser = require('../');
const path = require('path')
const expect = require('chai').expect;
const fs = require('fs')
const testFilePath = path.join(__dirname, 'tmp/test.xmind')

let parser = new xmindParser()

const xmindToJSON=(data)=>{
    it('异步返回kityminder（脑图）的json格式', (done) => {
        parser.xmindToJSON(data).then(res => {
            expect(res).to.be.an('object');
            done();
        }).catch(e => {
            done(e);
        })
    })
}

describe('xmind转json的本地路径测试', function () {
    xmindToJSON(testFilePath)
});
describe('xmind转json的网络路径测试', function () {
    xmindToJSON('http://beta.file.neobai.com/previews/1377465659176390656.xmind')
});
describe('xmind转json的 二进制文件', function () {
    const file = fs.readFileSync(testFilePath)
    xmindToJSON(file)
});


describe('kityminder JOSN格式转xmind', function () {
    const nodePath = path.join(__dirname, 'tmp') //node保存目录
    it('异步返回node返回路径，浏览器返回二进制文件', (done) => {
        parser.JSONToXmind({
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
        }, nodePath).then(res => {
            expect(res).to.be.an('string');
            // expect(res).to.be.an('string');
            done();
        }).catch(e => {
            done(e);
        })


    })
});
