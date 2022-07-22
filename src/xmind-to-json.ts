import convert from 'xml-js'
import format from 'xml-formatter'
import JSZip from 'jszip'
import path from 'path-browserify'
import {getFileBody, matchKey, kityMinder, fileName, imgRegex} from './utils'
import {FileType, imageBase, XmindJson} from './types'
import _ from 'lodash';

export default class parser {
    async xmindToJSON(data: FileType) {
        try {
            const buffer = typeof data === 'string' ? await getFileBody(data) : data
            const zip = new JSZip()
            //xmind解压
            const res = await zip.loadAsync(buffer, {optimizedBinaryString: true})
            const {files} = res
            //查找xmind content json或xml文件
            const keys = matchKey(files, `${fileName}.json`) || matchKey(files, fileName) || ''
            //查找是否存在kityminder.json文件
            const kityminderFile = files[kityMinder]
            const file = kityminderFile || files[keys]
            if (!file) {
                return Promise.reject(new Error('文件解析失败'));
            }
            const fileVal = await res.file(file.name)?.async('string') || ""
            if (kityminderFile) {
                return fileVal
            } else {
                //获取解压包的图片列表
                const imgList = Object.keys(files).filter(v => imgRegex.test(path.basename(v)))
                const imgListBase = await Promise.all(imgList.map(async (v: string): Promise<imageBase> => {
                    const file = await res.file(v)?.async('base64')
                    const base64 = `data:image/${(path.extname(v) || 'png').replace(/\./g, '')};base64,` + file
                    return {base64, name: v}
                }))
                const imgFiles = imgListBase.reduce((data: { [key: string]: imageBase }, item: imageBase) => {
                    data[path.basename(item.name)] = item
                    return data
                }, {})

                /*  //读取content.json 或者 content.xml 转换成脑图数据
                  const xmindData: XmindJson = {
                      template: 'default',
                      theme: 'fresh-blue',
                      root: {data: {text: ''}, children: []}
                  }*/

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

                console.log(content)

            }

        } catch (e) {
            return Promise.reject(e)
        }
    }
}
