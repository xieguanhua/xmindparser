module.exports = class {
    fileName = 'content';
    kityminder = 'naotu.json'
    imgRegex = /\.(png|jpe?g|gif)/i
    //唯一id
    guid() {
        const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    }
    // 对象模糊匹配key值
    objMatchingkey(obj={}, key) {
        return Object.keys(obj).find((v) => v.indexOf(key) >= 0)
    }
}
