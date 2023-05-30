export * from './utils'
import {Constructor} from './types'
import xmindToJSON from './json-to-xmind'
import JSONToXmind from './xmind-to-json'


function copyProperties(target: object, source: object) {
    for (const key of Reflect.ownKeys(source)) {
        // 这些属性会影响继承的基类，避开不继承
        if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            const desc = Object.getOwnPropertyDescriptor(source, key) as object;
            Object.defineProperty(target, key, desc);
        }
    }
}

function Mixin<T extends Constructor[]>(...mixins: T) {
    class Mix {
        public constructor(data: any) {
            for (const mixin of mixins) {
                copyProperties(this, new mixin(data)); // 拷贝实例属性
            }
        }
    }

    for (const mixin of mixins) {
        copyProperties(Mix, mixin); // 拷贝静态属性
        copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
    }
    return Mix;
}

const parse: Constructor = Mixin(xmindToJSON, JSONToXmind)
export default parse
