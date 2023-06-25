// fetch
const ErrorStatus: any = {
    500: '服务器发生错误。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
}
type methodType = 'GET' | 'POST'
type optionType = {
    method: methodType,
    headers: {
        'Content-type'?: string | null,
        'token'?: string | null,
        [k: string]: string
    },
    body?: string | FormData
}
class Request {
    private get baseUrl(): string {
        return '/api'
    }
    private get exclude(): string[] {
        return ['/user/login', '/user/loginCaptcha', '/file/download']
    }
    private getFullURLAndOption(method: methodType, url: string, data?: Record<string | number, any> | FormData) {
        const option: optionType = {
            method,
            headers: {
                'Content-type': 'application/json; charset=utf-8'
            }
        }
        if (!this.exclude.includes(url)) {
            option.headers.token = getCookie('AUTHORID') || ''
            option.headers['user'] = getCookie('UID') || ''
        }
        if (url === '/user/checkToken') option.headers['Authorization'] = 'Basic dHJhY2tlcjoxMjM0NTY='
        let fullURL = this.baseUrl + url
        if (method === 'GET' && data) fullURL += '?' + Object.keys(data).reduce((pre, n) => String(pre) + n + '=' + data[n] + '&', '').slice(0, -1)
        if (method === 'POST') {
            if(Object.prototype.toString.call(data) === '[object Object]') {
                option.body = JSON.stringify(data)
            }else {
                delete option.headers["Content-type"]
                option.body = data as FormData
            }
        }
        return this.originalFetch(fullURL, option)
    }
    private originalFetch(url: string, option: any): Promise<any> {
        return fetch(url, option).then((res: any) => {
            if (res.status === 401) {
                return Promise.resolve({ status: false, message: '未授权' } as response)
            } else if (res.status >= 500) {
                return Promise.resolve({ status: false, message: ErrorStatus[res.status] || '请求后台出错啦！' } as response)
            } else {
                const contentType = res.headers.get('Content-Type')
                if (!contentType) {
                    return res
                } else if (contentType.indexOf('application/json') !== -1) {
                    return Promise.resolve(res.json() as response)
                } else {
                    return Promise.resolve(res.blob() as response)
                }
            }
        }).catch((err) => {
            console.log(err)
        })
    }
    get(url: string, data?: Record<string | number, string>) {
        return this.getFullURLAndOption('GET', url, data)
    }
    post(url: string, data: Record<string | number, any> | FormData) {
        return this.getFullURLAndOption('POST', url, data)
    }
}
// 复制
const copy = (val: string) => {
    const input = document.createElement('input')
    input.value = val
    input.style.height = '0px'
    document.body.appendChild(input)
    input.select()
    const res = document.execCommand('copy')
    document.body.removeChild(input)
    return res
}
// 下载
function downloadFile(name: string, data: any) {
    if (!['[object String]', '[object Blob]'].includes(Object.prototype.toString.call(data))) {
        throw new Error('Two parameters are required, one is a fileName(String) and the other is a String or Blob')
    }
    const isBlob = Object.prototype.toString.call(data) === '[object Blob]'
    const url = isBlob ? URL.createObjectURL(data) : data
    const a = document.createElement('a')
    a.download = name
    a.href = url
    a.click()
    URL.revokeObjectURL(url)
}
// 文件大小转化
function fileSize(size: number) {
    switch (true) {
        case size < 1024:
            return size + 'B'
        case size >= 1024 && size < Math.pow(1024, 2):
            return (size / 1024).toFixed(2) + 'KB'
        case size >= Math.pow(1024, 2) && size < Math.pow(1024, 3):
            return (size / Math.pow(1024, 2)).toFixed(2) + 'M'
        case size >= Math.pow(1024, 3):
            return (size / Math.pow(1024, 3)).toFixed(2) + 'G'
    }
}

// 节流
function throttle(cb: Function, delay?: number) {
    let time = 0
    const delayTime = delay || 300
    return (arg?: any) => {
        const t = new Date().getTime()
        if (t - time >= delayTime) {
            cb(arg)
            time = t
        }
    }
}
// cookie 
function setCookie(name: string, val: string, d?: number) {
    let cok = `${name}=${val};`
    if (d !== undefined) {
        const date = new Date(), expiresDate = date.getDate() + d
        date.setDate(expiresDate)
        cok = cok + `expires=${date.toUTCString()};`
    }
    document.cookie = cok
}

function getCookie(name: string) {
    if (!document.cookie) return null
    const str = document.cookie, arr = str.split(';')
    let res: string | null = null
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].trim().split('=')[0] === name) {
            res = arr[i].trim().split('=')[1]
            break
        }
    }
    return res
}

function removeCookie(name: string) {
    setCookie(name, '', -1)
}

// 常见文件类型
const fileTypeJson = {
    "txt": "txt",
    "jpg": "image",
    "png": "image",
    "svg": "image",
    "webp": "image",
    "psd": "image",
    "jpeg": "image",
    "gif": "image",
    "bmp": "image",
    "tiff": "image",
    "mp3": "audio",
    "wma": "audio",
    "rmvb": "audio",
    "cda": "audio",
    "wmv": "video",
    "mp4": "video",
    "avi": "video",
    "mpeg": "video",
    "mpg": "video",
    "mov": "video",
    "rm": "video",
    "ram": "video",
    "pdf": "pdf",
    "ppt": "ppt",
    "zip": "zip",
    "rar": "zip",
    "7z": "zip",
    "gz": "zip",
    "tgz": "zip",
    "doc": "word",
    "docx": "word",
    "wps": "word",
    "wpt": "word",
    "dotm": "word",
    "docm": "word",
    "dot": "word",
    "dotx": "word",
    "xls": "excel",
    "xlsx": "excel",
    "xlsm": "excel",
    "xltx": "excel",
    "xltm": "excel",
    "xlt": "excel",
}

export {
    copy,
    downloadFile,
    fileSize,
    throttle,
    setCookie,
    getCookie,
    removeCookie,
    fileTypeJson
}
export const request = new Request()