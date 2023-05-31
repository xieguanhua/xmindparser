import JSZip from 'jszip'
export interface ImageSize {
    width?: number,
    height?: number
}

export interface RootData {
    text?: string,
    note?: string,
    imageSize?: ImageSize,
    id?: string,
    priority?: string,
    progress?: number
}

export interface Root {
    data: RootData,
    children: Root[]
}

export interface XmindJson {
    root: Root
    template: string
    theme: string
}

export interface TreeShapeToObj {
    data: RootData
    parentId: string
}



export type FileType = string | Blob | Uint8Array | ArrayBuffer | NodeJS.ReadableStream

export interface imageBase {
    /**
     * The size of Input.Group specifies the size of the included Input fields. Available: large default small
     * @default ''
     * @type string
     */
    base64: string
    width?:number
    height?:number
    name: string
}

export type ImageItem = imageBase|null
export type ImageDataType =  { [key:string]:imageBase }

export type ZipFileType = { [key: string]: any }
export type Constructor<T = Record<string, any>> = new (...args: any[]) => T;

