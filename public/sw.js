self.addEventListener('install', () => {
    // Skip old wroker
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    // Can be used without refreshing after successful registration
    // We can avoid this step by using iframe to download, but we still need to add for prevent accidents
    event.waitUntil(self.clients.claim())
})

const urlMap = new Map()

self.onmessage = (event) => {
    const { alive } = event.data
    if (alive) return
    const { downloadUrl, size, fileName, header } = event.data
    const port = event.ports[0]
    urlMap.set(downloadUrl, { port, size, fileName, header })
}

self.onfetch = (event) => {
    const url = event.request.url
    if (urlMap.get(url)) {
        const { port, size, fileName, header } = urlMap.get(url)
        urlMap.delete(url)
        // Make filename RFC5987 compatible
        const filename = encodeURIComponent(fileName).replace(/['()]/g, escape).replace(/\*/g, '%2A')
        const responseHeaders = new Headers({
            'Content-Type': 'application/octet-stream; charset=utf-8',
            'Content-Length': size,
            'Content-Disposition': "attachment;filename*=UTF-8''" + filename,
            'Content-Security-Policy': "default-src 'none'",
            'X-Content-Security-Policy': "default-src 'none'",
            'X-WebKit-CSP': "default-src 'none'",
            'X-XSS-Protection': '1; mode=block',
        })
        if (header) {
            for (let k in header) {
                responseHeaders.set(k, header[k])
            }
        }
        const readableStream = new ReadableStream({
            start(controller) {
                port.onmessage = ({ data }) => {
                    try {
                        if (data === 'end') {
                            return controller.close()
                        }
                        if (data === 'abort') {
                            controller.error('Cancel Download')
                            return
                        }
                        controller.enqueue(data)
                    } catch (e) {
                        port.postMessage({ abort: true })
                    }
                }
            },
            cancel(reason) {
                port.postMessage({ abort: true })
            }
        })
        event.respondWith(new Response(readableStream, { headers: responseHeaders }))
    }
    if (url.endsWith('alive')) {
        event.respondWith(new Response('alive'))
    }
}