const xmindParser = require('../');
const path = require('path')
let parser = new xmindParser()
parser.xmindToJSON(path.join(__dirname,'./../test1.xmind')).then(v=>{
    // console.log(JSON.stringify(v))
})


// parser.xmindToJSON('http://beta.file.neobai.com/previews/1377465659176390656.xmind')


// parser.createXmindFile(path.join(__dirname,'./../test.xmind'))
