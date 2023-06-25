declare module '*.module.less' {
    const content: { readonly [key: string]: string };
    export default content
}
declare interface Window {
    showDirectoryPicker: any
}

declare interface response {
    status: boolean,
    message: string,
    data?: any,
    [k: string]: any
}

type tipsType = 'error' | 'success' | 'waring'