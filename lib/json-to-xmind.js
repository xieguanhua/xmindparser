const JSZip = require('jszip')
const xmind = require('xmind')
const library = Object.keys(xmind).length ? xmind : window
const {Workbook, Topic, Dumper, Marker, Zipper} = library
const [workbook, marker] = [new Workbook(), new Marker()]
const path = require('path')
const utils = require('./utils');

class parser extends utils {
    async JSONToXmind(res = {}, filePath = path.join(__dirname, '../')) {
        try {
            //任务进度
            const {root = {}} = res
            const {data} = root
            const {text, id} = data || {}
            const sheetTitle = super.guid()
            const zip = new JSZip()
            const topic = new Topic({sheet: workbook.createSheet(sheetTitle, text)})
            //添加优先级
            this.setMarker(topic, data)
            //children数据数组转换
            const list = this.treeShapeToObj(root.children, id)
            //cid记录层次，避免层次不对
            const cidData = {}
            // 手动写入xmind数据
            const addData = (index = 0) => {
                const res = list[index]
                if (!res) return
                const {id, text} = res.data
                topic.on(cidData[res.parentId])
                cidData[id] = topic.add({title: text}).cid()
                this.setMarker(topic, res.data, cidData[id])
                addData(++index)
            }
            addData()
            if (typeof window === 'undefined') {
                const zipper = new Zipper({path: filePath, workbook: workbook, filename: sheetTitle});
                const status = await zipper.save()
                setTimeout(() => process.exit(status ? 0 : 1))
                return Promise.resolve(filePath)
            } else {
                //生成文件夹
                const dumper = new Dumper({workbook})
                const files = dumper.dumping()
                for (const file of files) {
                    zip.file(file.filename, file.value)
                }
                //压缩脑图json数据如果有直接返回
                zip.file(this.kityminder, JSON.stringify(res))
                //压缩成xmind文件
                const blob = await zip.generateAsync({type: 'blob'})
                return Promise.resolve(blob)
            }
        } catch (e) {
            return Promise.reject(e)
        }
    }

    // 树形结构转数组
    treeShapeToObj(child = [], parentId = super.guid()) {
        return child.reduce((arr, res) => {
            const {children, data} = res
            if (!data.id) data.id = super.guid()
            return arr.concat([{data, parentId}], this.treeShapeToObj(children, data.id))
        }, [])
    }

    //设置额外的标记属性，如链接，图片，进度等
    setMarker(topic, data, cid) {
        const {priority, progress, note} = data
        topic.on(cid).marker(marker.priority(priority))
            //任务进度
            .marker(marker.task(this.task[progress - 1]))
            //添加备注
            .note(note)
    }
}

module.exports = parser;
