const fs = require('fs')
const request = require('request')
module.exports= class {
    //判断文件是否存在
    getStat(path) {
        return new Promise((resolve) => {
            if (fs.stat) {
                fs.stat(path, (err, stats) => {
                    resolve(err ? false : stats)
                })
            } else {
                resolve(false);
            }
        })
    }

    //读取本地文件
    readFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, '', (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data);
                }
            })
        })
    }

    //文件请求
    requestFile(url) {
        return new Promise((resolve, reject) => {
            request({
                method: 'get',
                url,
                pool: false,
                strictSSL: false,
                rejectUnauthorized: false,
                encoding: null //  if you expect binary data
            }, (error, res, body) => {
                const {statusCode} = res
                if (!(statusCode === 200 || statusCode === 206)) {
                    reject('url路径不存在')
                } else if (error) {
                    reject(error)
                }
                resolve(body)
            })
        })
    }

    //文件读取
    async getFileBody(path) {
        try {
            let isExists = await this.getStat(path)
            if (isExists) {
                //本地文件读取
                if (isExists.isDirectory()) {
                    return Promise.reject(Error("读取文件失败，目录是文件夹"));
                } else {
                    let data = await this.readFile(path)
                    return Promise.resolve(data)
                }
            } else {
                const data = await this.requestFile(path)
                return Promise.resolve(data)
            }
        } catch (e) {
            return Promise.reject(e)
        }
    }
}
