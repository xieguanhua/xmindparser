import convert from 'xml-js'
import format from 'xml-formatter'
import JSZip from 'jszip'
import path from 'path-browserify'
import {fileName, getFileBody, imgRegex, isServer, kityMinder, matchKey} from './utils'
import {FileType, ImageDataType, ImageItem, XmindJson, ZipFileType} from './types'
import _ from 'lodash';

export default class parser {

    // 素组递归格式化
    toKityJSON(data = [], imgFiles) {
       /* const list = data.attached || (Array.isArray(data) ? data : data.title ? [data] : [])
        return list.map((v) => {
            const {topic} = v || {}
            return this.rootFormData((topic || v), imgFiles)
        })*/
    }

    //xmind 转 json需要的数据格式
    rootFormData(data, imgFiles) {
        /*const {
            title = '',
            notes = {plain: {content: ''}},
            image = {src: ''},
            'xhtml:img': xmlInfo,
            markers = [],
            'marker-refs': markerRefs = {}
        } = data || {}
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
        return params*/
    }

    // 获取图片细腻些
    async getImageData(files: ZipFileType, zipRes: JSZip): Promise<ImageDataType> {
        const imgList: ImageItem[] = await Promise.all(Object.keys(files).map(async (v: string): Promise<ImageItem> => {
            if (imgRegex.test(path.basename(v))) {
                const file: string = await zipRes.file(v)?.async('base64') || ''
                const base64: string = `data:image/${(path.extname(v) || 'png').replace(/\./g, '')};base64,` + file
                //图片百度xmind图片限制200大小
                if (!isServer) {
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
                    img.onerror = () => Promise.resolve({base64, name: v})
                }
                return {base64, name: v}
            } else {
                return null
            }
        }))
        return imgList.reduce((data: ImageDataType, item: ImageItem) => {
            if (item) data[path.basename(item.name)] = item
            return data
        }, {})
    }

    async xmindToJSON(data: FileType) {
        try {
            const buffer = typeof data === 'string' ? await getFileBody(data) : data
            const zip: JSZip = new JSZip()
            //xmind解压
            const zipRes: JSZip = await zip.loadAsync(buffer, {optimizedBinaryString: true})
            const {files} = zipRes
            //查找xmind content json或xml文件
            const keys: string = matchKey(files, `${fileName}.json`) || matchKey(files, fileName) || ''
            //查找是否存在kityminder.json文件
            const kityminderFile: JSZip.JSZipObject = files[kityMinder]
            const file: JSZip.JSZipObject = kityminderFile || files[keys]
            if (!file) {
                return Promise.reject(new Error('文件解析失败'));
            }
            const fileVal: string = await zipRes.file(file.name)?.async('string') || ""
            if (kityminderFile) {
                return fileVal
            } else {
                //获取解压包的图片列表
                const imgFiles: ImageDataType = await this.getImageData(files, zipRes)
                //读取content.json 或者 content.xml 转换成脑图数据
                const xmindData: XmindJson = {
                    template: 'default',
                    theme: 'fresh-blue',
                    root: {data: {text: ''}, children: []}
                }

                const getContent = () => {
                    if (path.extname(keys).indexOf('json') >= 0) {
                        return _.get(JSON.parse(fileVal).shift(), 'rootTopic')
                    } else {
                        //xml转json
                        const json = JSON.parse(convert.xml2json(format(fileVal, {
                            collapseContent: true
                        }), {
                            compact: true,
                            spaces: 4
                        }))
                        return _.get(JSON.parse(json), 'xmap-content.sheet.topic')
                    }
                }
                const content = getContent() || {}
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
