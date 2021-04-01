const utils = require('./utils');
const convert = require('xml-js')
const format = require('xml-formatter')
const JSZip = require('jszip')
const path = require('path')

class parser extends utils {
    async xmindToJSON(data) {
        try {
            if (typeof data === 'string') {
                const readFile = require('./readFile');
                data = await new readFile().getFileBody(data)
            }
            const zip = new JSZip()
            //xmind解压
            const res = await zip.loadAsync(data, {optimizedBinaryString: true})
            const {files} = res
            //查找xmind content json或xml文件
            const keys = super.objMatchingkey(files, `${this.fileName}.json`) || super.objMatchingkey(files, this.fileName)
            const isJsonFile = path.extname(keys).indexOf('json') >= 0
            //查找是否存在kityminder.json文件
            const kityminderFile = files[this.kityminder]
            const file = kityminderFile || files[keys]
            if (!file) {
                return Promise.reject(new Error('文件解析失败'))
            }
            const fileVal = await res.file(file.name).async('string')
            //如果存在kityminder.json文件直接返回
            if (kityminderFile) {
                return Promise.resolve(fileVal)
            } else {


            }
        } catch (e) {
            console.log(e, 600)
            return Promise.reject(e)
        }
    }
}

module.exports = parser;
