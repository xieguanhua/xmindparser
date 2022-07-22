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
    base64: string
    name: string
}