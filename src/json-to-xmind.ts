import {guid, task, kityMinder,isServer} from "./utils";
import _ from 'lodash';
import JSZip from 'jszip'
import xmind from 'xmind'
import {XmindJson,RootData,TreeShapeToObj,Root} from './types'
const {
    Workbook,
    Topic,
    Marker,
    Zipper,
    Dumper
} = isServer ? require('xmind') : Object.keys(xmind || {}).length ? xmind : window;


export default class parser {
    workBook: any;
    marker: any;

    constructor() {
        this.workBook = new Workbook()
        this.marker = new Marker()
    }

    /**
     * @param {XmindJson} res      json转xmind数据
     * @param {string} outPath     输出路径
     * @param {string} outFileName 输出的文件名
     */
    async JSONToXmind(res: XmindJson, outPath?: string, outFileName: string = guid()) {
        const data = _.get(res, 'root.data') || {}
        const id = _.get(data, 'id')
        const text = _.get(data, 'text')
        const zip = new JSZip()
        const workbook = this.workBook
        const topic = new Topic({sheet: workbook.createSheet(outFileName, text)})
        //设置额外的标记属性，如链接，图片，进度等
        const setMarker = (data: RootData, cid?: string) => {
            const {priority, progress = 0, note} = data || {note:''}
            topic.on(cid).marker(this.marker.priority(priority))
                //任务进度
                .marker(this.marker.task(task[progress - 1]))
                //添加备注
                .note(note)
        }
        //添加优先级
        setMarker(data)
        //children数据数组转换
        const list = this.treeShapeToObj(_.get(res, 'root.children'), id)
        //cid记录层次，避免层次不对
        const cidData: { [key: string]: string } = {}
        list.forEach(res => {
            if (!res) return
            const {id = '', text} = res.data
            topic.on(cidData[res.parentId])
            cidData[id] = topic.add({title: text}).cid().toString()
            setMarker(res.data, cidData[id])
        })
        if (isServer) {
            const path = outPath || './'
            const zipper = new Zipper({path, workbook, filename: outFileName});
            await zipper.save()
            return path
        } else {
            //生成二进制
            const dumper = new Dumper({workbook})
            const files = dumper.dumping()
            for (const file of files) {
                zip.file(file.filename, file.value)
            }
            //压缩脑图json数据如果有直接返回
            zip.file(kityMinder, JSON.stringify(res))
            // //压缩成xmind文件
            return await zip.generateAsync({type: 'blob'})
        }
    }

    // 树形结构转数组
    treeShapeToObj(child: Root[], parentId: string | number = guid()): TreeShapeToObj[] {
        return child.reduce((arr: any, res: Root) => {
            const {children, data} = res
            if (!data.id) data.id = guid()
            return arr.concat([{data, parentId}], this.treeShapeToObj(children, data.id))
        }, [])
    }
}
