const xmindParser = require('../');
const path = require('path')
let parser = new xmindParser()
parser.xmindToJSON(path.join(__dirname,'./../test.xmind'))



// parser.xmindToJSON('http://beta.file.neobai.com/previews/1377465659176390656.xmind')


// parser.createXmindFile(path.join(__dirname,'./../test.xmind'))
