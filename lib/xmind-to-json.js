const utils = require('./utils');
const convert = require('xml-js')
const format = require('xml-formatter')
const JSZip = require('jszip')
const path = require('path')

class parser extends utils {
    //读取图片文件信息
    async getImageInfo(res, v) {
        const file = await res.file(v).async('base64')
        const base64 = `data:image/${(path.extname(v) || 'png').replace(/\./g, '')};base64,` + file
        if (typeof window === 'object') {
            const img = new Image()
            img.src = base64
            // 加载完成执行
            img.onload = () => {
                let {width, height} = img
                const maxWith = 200
                if (width > maxWith) {
                    const scale = maxWith / width
                    width = width * scale
                    height = height * scale
                }
                return Promise.resolve({width, height, base64, name: v})
            }
            img.onerror = () => {
                return Promise.resolve({base64, name: v})
            }
        }
        return {base64, name: v}
    }

    // 素组递归格式化
    toKityJSON(data = [], imgFiles) {
        const list = data.attached || (Array.isArray(data) ? data : data.title ? [data] : [])
        return list.map((v) => {
            const {topic} = v || {}
            return this.rootFormData((topic || v), imgFiles)
        })
    }

    //xmind 转 json需要的数据格式
    rootFormData(data, imgFiles) {
        const {title = '', notes = {plain: {content: ''}}, image = {src: ''}, 'xhtml:img': xmlInfo, markers = [], 'marker-refs': markerRefs = {}} = data || {}
        let {children} = data || {}
        // 百度脑图xml转json的children属性
        const {topics = {}} = children || {}
        const {topic} = topics || {}
        if (Array.isArray(topics)) {
            children = topics
        } else if (Array.isArray(topic)) {
            children = topic
        } else if (Array.isArray(data)) {
            children = data
        }
        const text = title[super.objMatchingkey(title, 'text')] || title
        //图片
        const imageAttr = (xmlInfo || {})['_attributes'] || {}
        const src = imageAttr['xhtml:src']
        let imageSize = {
            width: imageAttr['svg:width'],
            height: imageAttr['svg:height']
        }
        const imageData = imgFiles[path.basename(src || image.src)] || {}
        const imageBase = imageData.base64
        if (imageBase && (!imageSize.width || !imageSize.height)) {
            imageSize = {
                width: imageData.width,
                height: imageData.height
            }
        }
        //标记属性
        let priority, progress
        const markerList = markerRefs['marker-ref'] || markers
        markerList.forEach(v => {
            const attr = v['_attributes'] || v
            const markerId = attr['markerId'] || attr['marker-id']
            if (markerId.indexOf('priority') >= 0) {
                const num = Number(markerId.replace(/[^0-9]/ig, ''))
                if (!isNaN(num)) priority = num
            } else if (markerId.indexOf('task') >= 0) {
                const index = this.task.findIndex(r => markerId.split('-').pop() === r)
                progress = index + 1
            }
        })
        const params = {
            children: this.toKityJSON(topic || children, imgFiles),
            data: {
                text,
                priority,
                progress,
                note: notes.plain.content,
                image: imageBase,
                imageSize
            }
        }
        return params
    }

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
                //获取解压包的图片列表
                const imglist = Object.keys(files).filter(v => this.imgRegex.test(path.basename(v)))
                let imgListBase = await Promise.all(imglist.map(v => this.getImageInfo(res, v)))
                const imgFiles = {}
                imgListBase.forEach(v => {
                    imgFiles[path.basename(v.name)] = v
                })
                //读取content.json 或者 content.xml 转换成脑图数据
                const xmindData = {
                    template: 'default',
                    theme: 'fresh-blue',
                    root: {data: {text: ''}, children: []}
                }
                let content
                if (!isJsonFile) {
                    //xml转json
                    const json = JSON.parse(convert.xml2json(format(fileVal, {
                        collapseContent: true
                    }), {
                        compact: true,
                        spaces: 4
                    }))
                    content = json['xmap-content'].sheet.topic
                } else {
                    content = (JSON.parse(fileVal).shift() || {rootTopic: {}}).rootTopic
                }

                xmindData.root = {
                    ...xmindData.root,
                    //格式化为kityminder文件格式
                    ...this.rootFormData(content, imgFiles)
                }
                return Promise.resolve(xmindData)
            }
        } catch (e) {
            return Promise.reject(e)
        }
    }
}

module.exports = parser;
