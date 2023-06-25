import { WritableStream } from 'web-streams-polyfill/ponyfill'
async function registerWorker(url: string, scope: string): Promise<ServiceWorker | null> {
    const swReg = await navigator.serviceWorker.getRegistration(scope).then(() => swReg || navigator.serviceWorker.register(url, { scope })).catch(() => null)
    if(!swReg) return null
    const swRegTmp = swReg.installing || swReg.waiting
    if (swReg.active) {
        return swReg.active
    } else {
        return new Promise(resolve => {
            const fn = () => {
                if (swRegTmp.state === 'activated') {
                    swRegTmp.removeEventListener('statechange', fn)
                    resolve(swReg.active)
                }
            }
            swRegTmp.addEventListener('statechange', fn)
        })
    }
}
type saverType = {
    writeStream: WritableStream | null,
    useBlob: boolean
}
async function streamSaver(size: number, fileName: string, speedCallBack?: (...args) => void, closeCallBack?: () => void): Promise<saverType> {
    const G: any = window
    if (!!G.WebKitPoint || !G.ReadableStream || !('serviceWorker' in navigator)) return { writeStream: null, useBlob: true }
    const makeIframeDowload = (url: string) => {
        const iframe = document.createElement('iframe')
        iframe.hidden = true
        iframe.src = url
        document.body.appendChild(iframe)
        return iframe
    }
    const sw = await registerWorker('sw.js', '/')
    if (!sw || !G.Response) return { writeStream: null, useBlob: true }
    const filename = encodeURIComponent(fileName.replace(/\//g, ':')).replace(/['()]/g, escape).replace(/\*/g, '%2A')
    const downloadUrl = location.origin + '/' + String(Math.random()).slice(2) + '/' + filename
    let { port1, port2 } = new MessageChannel()
    const header = fileName.endsWith('.zip') ? {'Content-Type': 'application/zip'} : null
    const writableStream = G.WritableStream || WritableStream
    sw.postMessage({ downloadUrl, size, fileName, header}, [port2])
    let loadByte = 0
    const writeStream = new writableStream({
        start(control:WritableStreamDefaultController) {
            port1.onmessage = (e) => {
                const { abort } = e.data
                if(abort) {
                    closeCallBack && closeCallBack()
                    control.error('Cancel Download')
                }
            }
        },
        write(chunk) {
            if (!(chunk instanceof Uint8Array)) {
                throw new TypeError('Can only write Uint8Arrays')
            }
            port1.postMessage(chunk)
            loadByte += chunk.length
            if(speedCallBack) speedCallBack(loadByte)
        },
        close() {
            port1.postMessage('end')
            document.body.removeChild(iframe)
            if(closeCallBack) closeCallBack()
        },
        abort() {
            port1.postMessage('abort')
            port1.onmessage = null
            port1.close()
            port2.close()
            port1 = null
            port2 = null
            document.body.removeChild(iframe)
        }
    })
    const iframe = makeIframeDowload(downloadUrl)
    return { writeStream, useBlob: false }
}
function keepAlive(sw: ServiceWorker | null, scope: string) {
    const url = location.origin + scope + 'alive'
    const timer = setInterval(() => {
        if (sw) {
            sw.postMessage({ alive: true })
        } else {
            fetch(url).then((res: Response) => {
                if (!res.ok) clearInterval(timer)
            })
        }
    }, 10000)
    return timer
}
export {
    registerWorker,
    streamSaver,
    keepAlive
}