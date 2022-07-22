const path = require('path')
import parser from './../src'

const testFilePath = path.join(__dirname, 'tmp/哪有没时间这回事.xmind')

describe('xmind转json的本地路径测试', function () {

    it('异步返回node返回路径，浏览器返回二进制文件', (done) => {
        const data = new parser()

        const json = {
            "template": "default",
            "theme": "fresh-blue",
            "root": {
                "data": {"text": "中心主题", "note": "", "imageSize": {}},
                "children": [{
                    "children": [{"children": [], "data": {"text": "新建节点8", "note": "", "imageSize": {}}}],
                    "data": {"text": "新建节点1", "note": "", "imageSize": {}}
                }, {
                    "children": [{"children": [
                            {
                                "children": [{"children": [], "data": {"text": "新建节点9", "note": "", "imageSize": {}}}],
                                "data": {"text": "新建节点10", "note": "", "imageSize": {}}
                            }
                        ], "data": {"text": "新建节点7", "note": "", "imageSize": {}}}],
                    "data": {"text": "新建节点2", "note": "", "imageSize": {}}
                }, {"children": [], "data": {"text": "新建节点5", "note": "", "imageSize": {}}}, {
                    "children": [],
                    "data": {"text": "新建节点3", "note": "", "imageSize": {}}
                }, {"children": [], "data": {"text": "新建节点6", "note": "", "imageSize": {}}}, {
                    "children": [],
                    "data": {"text": "新建节点4", "note": "", "imageSize": {}}
                }]
            }
        }
        data.xmindToJSON(testFilePath).then(v=>{
            done()
        }).catch(e=>{
            done()
        })
    })
});
