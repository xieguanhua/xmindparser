import fs from 'fs'
import axios from 'axios'

export type Utils = Promise<Buffer>

/**
 * The node environment
 * node环境
 */
export const isClient = (typeof process === 'object' &&
    typeof require === 'function' &&
    typeof global === 'object')

/**
 * Default xmind decompressed file name
 * 默认xmind解压后的文件名
 */
export const fileName = 'content'

/**
 * Kityminder. json file is added by default
 * 默认添加百度脑图kityminder.json文件
 */
export const kityMinder = 'kityminder.json'

/**
 * A regular picture
 * 图片正则
 */
export const imgRegex = /\.(png|jpe?g|gif)/i

/**
 * Task Progress type
 * 任务进度类型
 */
export const task = ['start', 'oct', 'quarter', '3oct', 'half', '5oct', '3quar', '7oct', 'done', 'pause']

/**
 * Get guid
 * 生成唯一guid
 */
export const guid = (): string => {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}
/**
 * Object fuzzy matching key value
 * 对象模糊匹配key值
 */
export const matchKey = (obj: { [key: string]: any } = {}, key: string): string | undefined => {
    return Object.keys(obj).find((v) => v.indexOf(key) >= 0)
}

/**
 * Check whether the file exists
 * 判断文件是否存在
 * @param {string} path  file path
 * @return boolean
 */
export const fileIsExists = (path: string): boolean => {
    try {
        return !fs.statSync(path).isDirectory()
    } catch (e) {
        return false
    }
}

/**
 * Reading local files
 * 读取本地文件
 * @param {string} path file path
 * @return Utils
 */
export const readFile = async (path: string): Utils => {
    try {
        return fs.readFileSync(path)
    } catch (e) {
        return Promise.reject(e)
    }
}
/**
 * Reading network files
 * 读取网络文件
 * @param {string} url network url
 * @return Utils
 */
export const requestFile = async (url: string): Utils => {
    try {
        const res = await axios.get(url, {responseType: 'arraybuffer'})
        return res.data
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 * File to read
 * 读取文件
 * @param {string} path network url or file path(网络url或本地文件)
 * @return Utils
 */
export const getFileBody = async (path: string): Utils => {
    try {
        if (fileIsExists(path)) {
            return await readFile(path)
        } else {
            return await requestFile(path)
        }
    } catch (e) {
        return Promise.reject(e)
    }
}
