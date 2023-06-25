const WT = require('webtorrent')
// const FsChunck = require('fs-access-chunk-store')
const IdbChunck = require('idb-chunk-store')
const rtcconfig = {
  iceServers: [
    { urls: ["stun:stun.qq.com:3478", "stun:stun.minisipserver.com:3478", "stun:stun.miwifi.com:3478"] },
  ],
  sdpSemantics: 'unified-plan',
  bundlePolicy: 'max-bundle',
  iceCandidatePoolsize: 1
}
// console.log(WebTorrent.WEBRTC_SUPPORT)
class WebTorrent {
  client = null
  trackerList = ['']
  torrent = null
  constructor(opts?) {
    this.client = new WT({
      tracker: {
        announce: opts?.trackers || this.trackerList,
        rtcConfig: {
          ...rtcconfig
        }
      }
    })
    if (opts?.trackers) this.trackerList = opts.trackers
    this.client.on('warning', (msg: string) => console.warn(msg))
    this.client.on('error', (msg: string) => console.error(msg))
  }
  async getStoreType(fileSize: number) {
    if (!window.indexedDB) {
      return 'memory'
    } else if (typeof navigator?.storage?.estimate === 'function') {
      const storage = await navigator.storage.estimate()
      if (fileSize > (storage.quota - storage.usage + 100000000) || fileSize <= 1000000000) { // 100M空闲, 1G
        return 'memory'
      } else {
        return 'idb'
      }
    }
  }
  add(id: string, cb: (torrent) => void) {
    const opts = {
      announce: this.trackerList,
      destroyStoreOnDestroy: true
    }
    if (window.indexedDB) opts['store'] = IdbChunck
    this.torrent = this.client.add(id, opts, cb)
    // 防止一来就下载
    const onReady = () => {
      cleanListener()
      this.torrent.deselect(0, this.torrent.pieces.length - 1, 0)
    }
    const cleanListener = () => {
      this.torrent.off('ready', onReady)
    }
    this.torrent.on('ready', onReady)
  }
  async seed(files: File[], cb: (torrent) => void) {
    let allFileSize = 0
    if (files.length === 1) {
      allFileSize = files[0].size
    } else {
      files.forEach((file) => allFileSize += file.size)
    }
    const storeType = await this.getStoreType(allFileSize)
    const opts = {
      announce: this.trackerList,
      destroyStoreOnDestroy: true,
      storeCacheSlots: storeType === 'memory' ? 0 : 20
    }
    if (storeType === 'idb') opts['store'] = IdbChunck
    this.torrent = this.client.seed(files, opts, cb)
  }
}

export default WebTorrent