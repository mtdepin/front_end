import Image from "next/image";
import ShareIcon from '@/public/images/shareIcon.svg'
import CreateQrcodeIcon from '@/public/images/createQrcodeIcon.svg'
import UploadSuccessIcon from '@/public/images/uploadSuccessIcon.svg'
import UploadFailIcon from '@/public/images/uploadFailIcon.svg'
import FileSelectIcon from '@/public/images/fileSelectIcon.svg'
import FolderSelectIcon from '@/public/images/folderSelectIcon.svg'
import createLink from '@/public/images/createLink.png'
import getLink from '@/public/images/getLink.png'
import FileIcon from '@/public/images/fileIcon.svg'
import FileLoadedIcon from '@/public/images/fileLoadedIcon.svg'
import FileLoadFailIcon from '@/public/images/fileLoadFailIcon.svg'
import FileLoadingIcon from '@/public/images/fileLoadingIcon.svg'
import ZIpIcon from '@/public/images/zipIcon.svg'
import PptIcon from '@/public/images/pptIcon.svg'
import VideoIcon from '@/public/images/videoIcon.svg'
import AudioIcon from '@/public/images/audioIcon.svg'
import PdfIcon from '@/public/images/pdfIcon.svg'
import TxtIcon from '@/public/images/txtIcon.svg'
import ExcelIcon from '@/public/images/excelIcon.svg'
import WordIcon from '@/public/images/wordIcon.svg'
import ImageIcon from '@/public/images/imageIcon.svg'
import LoadIcon from '@/public/images/loadIcon.svg'
import TaskIcon from '@/public/images/taskIcon.svg'
import s from './index.module.less'
import classNames from "classnames";
import { useState, useRef, useEffect, BaseSyntheticEvent } from 'react';
import type { SyntheticEvent } from 'react'
import WebTorrent from '@/utils/webTorrent';
import { message } from "@/components/message";
import { QRCodeCanvas } from "qrcode.react";
import { copy, fileSize, throttle, downloadFile, fileTypeJson, request } from "@/utils";
import { useOutClick } from "@/utils/hooks";
import { keepAlive, registerWorker, streamSaver } from "@/utils/streamSaver";
import nodeToweb from 'readable-stream-node-to-web'
import Drawer from "@/components/drawer";
import getZipStream from "@/utils/zipStream";
const { success, error, waring } = message()
export default function Home(props) {
    const selectFileRef = useRef<HTMLInputElement>()
    const uploadTypeRef = useRef()
    const client = useRef(new WebTorrent())
    const [forceUpdate, setUpdate] = useState<boolean>(false)
    const [fileID, setID] = useState<string>('')
    const [linkhref, setLink] = useState<string>('')
    const [action, setAction] = useState<'seed' | 'upload' | 'download'>()
    const [isGetFile, setIsGetFile] = useState<boolean>(false)
    const [showDrawer, setShowDrawer] = useState<boolean>(false)
    const [showTaskNode, setShowTaskNode] = useState<boolean>(false)
    const [taskMessage, setTaskMessage] = useState<{ message: string, loading?: boolean, speed?: number }>({ message: ''})
    const [torrent, setTorrent] = useState<any>({})
    useOutClick(uploadTypeRef, () => setIsGetFile(false))
    useEffect(() => {
        if (window.location.hash.slice(1).trim()) setAction('download')
        window.addEventListener('hashchange', hashChange)
        return () => window.removeEventListener('hashchange', hashChange)
    }, [])
    const hashChange = () => {
        if (window.location.hash.slice(1).trim()) {
            setAction('download')
            setUpdate(!forceUpdate)
            setShowDrawer(false)
            setShowTaskNode(false)
        } else {
            setAction(null)
        }
    }
    const prevent = (e: SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }
    // select file or floder
    const selectFile = (type: 'file' | 'folder') => {
        selectFileRef.current.removeAttribute('webkitdirectory')
        selectFileRef.current.removeAttribute('multiple')
        if (type === 'file') selectFileRef.current.setAttribute('multiple', 'multiple')
        if (type === 'folder') selectFileRef.current.setAttribute('webkitdirectory', 'webkitdirectory')
        selectFileRef.current.click()
    }
    const fileChange = (e: BaseSyntheticEvent) => {
        const files = e.target.files
        const arr = []
        for (let i = 0; i < files.length; i++) {
            if (files[i].webkitRelativePath) {
                files[i].fullPath = files[i].webkitRelativePath
            } else {
                files[i].fullPath = `download/${files[i].name}` //让webtorrent解析出来的file带path方便下载
            }
            arr.push(files[i])
        }
        setIsGetFile(false)
        seedFile(arr)
    }
    // seed
    const seedFile = async (file: File[]) => {
        setAction('seed')
        setShowDrawer(true)
        console.time('create link')
        client.current.seed(file, (tor: any) => {
            console.timeEnd('create link')
            let size = 0
            for (let i = 0; i < file.length; i++) {
                size += file[i].size
            }
            const params = {
                fileHash: tor.infoHash,
                fileSize: size,
                pieceSize: tor.pieceLength,
                pieceCount: tor.pieces.length
            }
            request.post('/file/upload', params).then((res: response) => {
                if(res.status) {
                    const { fileID } = res.data
                    setAction('upload')
                    setID(fileID)
                    setLink(window.location.origin + '/#' + fileID)
                    setTorrent(tor)
                } else {
                    error(res.message)
                    setAction(null)
                    setShowDrawer(false)
                }
            })
        })
    }
    // drag file or floder
    const drop = (e: any) => {
        prevent(e)
        const files = [], dataTransfer = e.dataTransfer.items
        let len = files.length
        const getFiles = (items) => {
            for (let item of items) {
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry()
                    getFilesFromEntry(entry)
                }
            }
        }
        const getFilesFromEntry = (entry) => {
            if (entry.isFile) {
                entry.file((file) => {
                    file.fullPath = entry.fullPath
                    files.push(file)
                })
            } else {
                const reader = entry.createReader()
                reader.readEntries((entrys) => entrys.forEach((entry) => getFilesFromEntry(entry)), (err) => console.log(err))
            }
        }
        const checkGetAll = () => {
            const timer = setInterval(() => {
                if (len < files.length) {
                    len = files.length
                } else if (len === files.length) {
                    clearInterval(timer)
                    const time = setTimeout(() => {
                        clearTimeout(time)
                        if (len < files.length) {
                            checkGetAll()
                        } else {
                            seedFile(files)
                        }
                    }, 100)
                }
            }, 100)
        }
        getFiles(dataTransfer)
        checkGetAll()
    }
    const drawerClose = () => {
        setShowDrawer(false)
        setShowTaskNode(true)
    }
    // close float node
    const taskNodeClose = () => {
        setShowDrawer(true)
        setShowTaskNode(false)
    }
    // float message
    const setTaskInfo = (message: string, loading?: boolean, speed?: number) => {
        setTaskMessage({ message, loading, speed })
    }
    return (
        <section className={'flex flex-col sm:flex-row justify-center items-center w-full h-screen-120 min-h-[43.75rem] bg-content'}>
            <div className={classNames("w-full sm:flex-[8] h-full", s.ad)}></div>
            {
                action === 'download' ? <GetFileFromPeers update={forceUpdate} client={client} /> :
                    <div className={classNames("w-full sm:flex-[5] h-full text-white", s.right)} onDrop={drop} onDragOver={prevent}>
                        <div className="ml-20">
                            <span className="block font-pf-bold text-[2rem] sm:mt-[10rem]">安全，高效率文件分享</span>
                            <span className="block font-pf-bold text-[6.25rem] sm:mt-[1.5rem]">FLY FILE</span>
                            <span className="block font-pf-med sm:mt-[1.5rem] w-[27.5rem]">fly file让你能以端到端加密和自动过期链接的方式分享文件。专业、高速、安全、便捷，极致的用户体验，保证用户安全高速传输。</span>
                            <div ref={uploadTypeRef} className="inline-block text-center relative">
                                <input ref={selectFileRef} className="hidden" type={'file'} onChange={fileChange}></input>
                                <button className={classNames('text-[1.875rem] font-pf-med py-3 px-6 mt-[3.75rem]', s.selectfile)} onClick={() => setIsGetFile(!isGetFile)}>发送文件/文件夹 +</button>
                                <div className={classNames("absolute w-1/2 bg-head left-1/2 -translate-x-1/2 rounded-b-lg", { 'hidden': !isGetFile })}>
                                    <button className="block my-1 py-2 w-full hover:bg-white hover:bg-opacity-20" onClick={() => selectFile('file')}>
                                        <FileSelectIcon className='inline align-text-top mr-2' />
                                        <span>选择文件</span>
                                    </button>
                                    <button className="block my-1 py-2 w-full hover:bg-white hover:bg-opacity-20" onClick={() => selectFile('folder')}>
                                        <FolderSelectIcon className='inline align-text-top mr-2' />
                                        <span>选择文件夹</span>
                                    </button>
                                </div>
                                <span className="block font-pf-med mt-[2rem]">或将文件/文件夹拖到这里</span>
                                <span className="block font-pf-med text-opacity-50 text-white mt-3">文件最大可达10GB</span>
                            </div>
                        </div>
                    </div>
            }
            <Drawer visiable={showDrawer} closeIcon={'arrow'} onClose={drawerClose}>
                {action === 'seed' && <CreateLinkDOM setTask={setTaskInfo} />}
                {action === 'upload' && <DoneSeedFiles fileID={fileID} link={linkhref} torrent={torrent} setTask={setTaskInfo} />}
            </Drawer>
            {action !== 'download' && <FloatNode visiable={showTaskNode} onClose={taskNodeClose} taskMessage={taskMessage} />}
        </section>
    )
}
// seeding
type CreateLinkDOMProps = {
    setTask: (message: string, loading?: boolean, speed?: number) => void,
}
function CreateLinkDOM(props: CreateLinkDOMProps) {
    const { setTask } = props
    useEffect(() => {
        setTask('生成链接中', true)
    }, [])
    return (
        <div className="text-white flex flex-col justify-center items-center mt-32">
            <p className="text-[2.25rem] font-pf-bold mb-32">文件链接生成中，请耐心等候！</p>
            <Image alt="create link icon" src={createLink}></Image>
            <button className='mt-6 text-[1.25rem] bg-button rounded-3xl px-8 py-1'>
                生成链接中
                <span className={s.load}></span>
            </button>
        </div>
    )
}
// seeded
type seededFilesProps = {
    setTask: (message: string, loading?: boolean, speed?: number) => void,
    torrent: any,
    fileID: string,
    link: string
}
function DoneSeedFiles(props: seededFilesProps) {
    const { fileID, torrent, link, setTask } = props
    const [hour, setHour] = useState<string>('24h')
    const [count, setCount] = useState<number>(100)
    const [speed, setSpeed] = useState<number>(0)
    const [progress, setProgress] = useState<number>(0)
    const [showQr, setShowQr] = useState<boolean>(false)
    const [uploadNode, setNode] = useState<number>(0)
    const [uploadState, setUploadState] = useState<'success' | 'failed' | 'uploading'>('uploading')
    useEffect(() => {
        postTorrentMessage()
        window.addEventListener('beforeunload', beforeLeave)
        torrent.on('upload', listenSpeed)
        setTask('文件上传中', true)
        return () => window.removeEventListener('beforeunload', beforeLeave)
    }, [])
    const listenSpeed = throttle(() => {
        setSpeed(torrent.uploadSpeed)
        setTask('文件上传中', true, torrent.uploadSpeed)
    }, 800)
    const uploadFailed = () => {
        window.removeEventListener('beforeunload', beforeLeave)
        torrent.off('upload', listenSpeed)
        setUploadState('failed')
        setTask('文件上传失败')
    }
    // post torrent file to server
    const postTorrentMessage = () => {
        const ws = new WebSocket(`wss://www.flyfile.cc/file/progress?fileID=${fileID}`)
        let progress = 0
        ws.onerror = () => {
            console.error('WebSocket connect failed')
            uploadFailed()
        }
        ws.onclose = () => {
            console.log('wss close')
            if (progress !== 10000) {
                console.error('WebSocket closed abnormal')
                uploadFailed()
            }
        }
        ws.onmessage = (e) => {
            progress = Number(JSON.parse(e.data).progress)
            const ratio = Math.floor(progress) / 100
            setProgress(ratio)
            setNode(Number(JSON.parse(e.data).count) || 0)
            if (progress === 10000) {
                torrent.off('upload', listenSpeed)
                setTask('文件上传完成')
                window.removeEventListener('beforeunload', beforeLeave)
                setTimeout(() => {
                    setUploadState('success')
                }, 800)
            }
        }
    }
    const beforeLeave = (e) => {
        e.preventDefault()
        e.returnValue = 'back'
    }
    const expireAction = (e: any, type: 'hour' | 'count') => {
        if (type === 'count') setCount(e.target.value)
        if (type === 'hour') setHour(e.target.value)
    }
    const share = () => {
        const res = copy(link)
        res ? success('复制成功') : error('复制失败')
    }
    const uploading = (
        <div className='relative w-full'>
            <div className="flex justify-between items-center w-full mb-3">
                <span className='text-[1.25rem] font-pf-med'>
                    <span>正在向{uploadNode}个节点上传</span>
                    <span className={s.load}></span>
                </span>
                <span className="text-[0.875rem]">{fileSize(speed) + '/s'}</span>
            </div>
            <div className='relative w-full bg-white bg-opacity-20 rounded-2xl h-4 overflow-hidden text-[0.75rem] text-center'>
                <span className="absolute leading-4 z-10">{progress}%</span>
                <div className='absolute h-full bg-button rounded-2xl transition-all' style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
    const uploadSuccess = (
        <span className='mt-6 relative flex flex-col justify-center items-center'>
            <UploadSuccessIcon />
            <span className='mt-2 text-[1.25rem]'>
                已上传并加密
            </span>
        </span>
    )
    const uploadError = (
        <span className='mt-6 flex flex-col justify-center items-center'>
            <UploadFailIcon />
            <span className='text-[1.25rem] mt-2'>上传失败</span>
        </span>
    )
    return (
        <div className='flex flex-col justify-center items-center text-white px-16 pt-32'>
            <p className='text-[2rem] font-pf-bold'>文件链接已生成，立刻去分享吧！</p>
            <div className='rounded-3xl border border-white border-opacity-20 px-6 py-2 mt-16 w-full'>
                <input readOnly value={link} className='bg-transparent outline-0 w-full font-pf-bold' />
            </div>
            <div className='rounded-3xl border border-white border-opacity-20 px-6 py-2 mt-6 w-full text-center'>
                <span>链接将在</span>
                <select value={hour} onChange={(e) => expireAction(e, 'hour')} className='bg-white bg-opacity-10 sm:px-2 rounded-2xl border-transparent sm:mx-3 py-[2px]'>
                    <option className='bg-head' value={'24h'}>24小时</option>
                    <option className='bg-head' value={'12h'}>12小时</option>
                    <option className='bg-head' value={'6h'}>6小时</option>
                    <option className='bg-head' value={'2h'}>2小时</option>
                    <option className='bg-head' value={'1h'}>1小时</option>
                </select>
                <span>或</span>
                <select value={count} onChange={(e) => expireAction(e, 'count')} className='bg-white bg-opacity-10 sm:px-2 rounded-2xl border-transparent sm:mx-3 py-[2px]'>
                    <option className='bg-head' value={1}>1次下载</option>
                    <option className='bg-head' value={5}>5次下载</option>
                    <option className='bg-head' value={10}>10次下载</option>
                    <option className='bg-head' value={20}>20次下载</option>
                    <option className='bg-head' value={50}>50次下载</option>
                    <option className='bg-head' value={100}>100次下载</option>
                </select>
                <span>后过期</span>
            </div>
            <div className='mt-6 flex justify-between w-full'>
                <button onClick={share} className='flex justify-center items-center px-6 py-2 rounded-3xl bg-opacity-20 bg-white hover:bg-button w-[45%]'>
                    <ShareIcon />
                    <span className='inline-block ml-2'>
                        分享链接
                    </span>
                </button>
                <button onClick={() => setShowQr(true)} className='flex justify-center items-center px-6 py-2 rounded-3xl bg-opacity-20 bg-white hover:bg-button w-[45%]'>
                    <CreateQrcodeIcon />
                    <span className='inline-block ml-2'>
                        生成二维码
                    </span>
                </button>
            </div>
            <div className={classNames('rounded bg-button mt-10 cursor-pointer transition-all', { 'h-0 mt-0': !showQr }, {'p-2': showQr})} onClick={() => setShowQr(false)}>
                <QRCodeCanvas className='transition-all' size={showQr ? 150 : 0} value={link}></QRCodeCanvas>
            </div>
            <span className='w-full h-px my-10 bg-white bg-opacity-20'></span>
            {uploadState === 'uploading' && uploading}
            {uploadState === 'success' && uploadSuccess}
            {uploadState === 'failed' && uploadError}
        </div>
    )
}
// float
type taskProps = {
    visiable: boolean,
    onClose: () => void,
    taskMessage: { message: string, loading?: boolean, speed?: number }
}
function FloatNode(props: taskProps) {
    const { visiable, onClose, taskMessage } = props
    return (
        visiable && <div className="fixed top-[8rem] right-20 flex justify-center items-center cursor-pointer" onClick={onClose}>
            <span className="absolute left-0 -translate-x-full z-10 ml-[1.75rem]">
                <TaskIcon />
            </span>
            <span className={classNames("relative leading-[0.9375rem] text-[0.75rem] flex flex-col justify-center items-center text-button bg-white pl-8 pr-3 py-[2px] rounded-3xl", {'border border-button': !taskMessage.loading})}>
                <span className={classNames({ 'leading-8': !taskMessage.speed })}>{taskMessage.message}</span>
                <span className="scale-[0.9]">{taskMessage.speed && fileSize(taskMessage.speed) + '/s'}</span>
                {taskMessage.loading && <span className={s.note}></span>}
            </span>
        </div>
    )
}
// reslove link
function ResolveLinkDOM(props) {
    const { linkError } = props
    return (
        <div className={classNames("w-full sm:flex-[5] h-full text-white", s.right)}>
            <div className="pl-10 pr-[11.25rem] py-10 w-full h-full">
                <div className="bg-head rounded-xl px-10 pt-10 h-full">
                    <p className="text-[1.5rem] font-pf-bold">接收文件</p>
                    <div className="text-white flex flex-col justify-center items-center">
                        <span className="mt-[8.5rem]">
                            <Image alt="create link icon" src={getLink}></Image>
                        </span>
                        <button className='mt-6 text-[1.25rem] bg-button rounded-3xl px-8 py-1'>
                            {!linkError && '正在链接请稍后'}
                            {linkError && '链接过期或不存在'}
                            {!linkError && <span className={s.load}></span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
// get files from peers
type GetFileFromPeersProps = {
    client: any,
    update: boolean
}
const icon = {
    "pdf": () => <PdfIcon />,
    "image": () => <ImageIcon />,
    "zip": () => <ZIpIcon />,
    "ppt": () => <PptIcon />,
    "video": () => <VideoIcon />,
    "audio": () => <AudioIcon />,
    "txt": () => <TxtIcon />,
    "excel": () => <ExcelIcon />,
    "word": () => <WordIcon />
}
const loadList = []
function GetFileFromPeers(props: GetFileFromPeersProps) {
    const { client, update } = props
    const [totalFileSize, setTotalSize] = useState<number>(0)
    const [allFiles, setAllFiles] = useState<any[]>([])
    const [filesState, setFilesState] = useState<any>({})
    const [downloadingAll, setDownloadAll] = useState<boolean>(false)
    const [speed, setSpeed] = useState<number>(0)
    const [node, setNode] = useState<number>(0)
    const [linkError, setError] = useState<boolean>(false)
    const torrentRef = useRef<any>()
    const [downloadAllRate, setDownloadAllRate] = useState<number>(0)
    useEffect(() => {
        getFiles()
        let timer
        registerWorker('sw.js', '/').then((sw) => {
            if (sw) {
                sw.postMessage({ alive: true })
                timer = keepAlive(sw, '/')
            }
        })
        return () => clearInterval(timer)
    }, [update])
    // torrent add files
    const getFiles = () => {
        const fileID = window.location.hash.slice(1).trim()
        if(fileID) {
            request.get('/file/download', {fileID}).then((res: response) => {
                if(res.status) {
                    const { fileHash, count = 0 } = res.data
                    console.time('get files')
                    client.current.add(fileHash, (tor) => {
                        console.timeEnd('get files')
                        const list = [], json: any = {}
                        let allSize = 0
                        tor.files.forEach((file) => {
                            list.push(file)
                            json[file.name] = { status: null }
                            allSize += file.length
                        })
                        torrentRef.current = tor
                        setFilesState(json)
                        setAllFiles(list)
                        setTotalSize(allSize)
                        setNode(count)
                    })
                } else {
                    setError(true)
                }
            })
        }
    }
    const listenSpeed = throttle(() => {
        if(torrentRef.current) setSpeed(Math.floor(torrentRef.current.downloadSpeed * 100) / 100)
    }, 800)
    const share = () => {
        const res = copy(location.href)
        res ? success('复制成功') : error('复制失败')
    }
    const downloadAlone = (file, cb?: (l: number) => void): Promise<{ done: boolean }> => {
        return new Promise(async (reslove) => {
            const name = file.name
            const { writeStream, useBlob } = await streamSaver(file.length, name, cb)
            if (useBlob) {
                file.getBlob((error, blob) => {
                    waring('浏览器版本过低或不兼容,建议切换或升级浏览器！')
                    if (error) {
                        console.error(error)
                        reslove({ done: false })
                    } else {
                        downloadFile(name, blob)
                        reslove({ done: true })
                    }
                })
            } else {
                const stream = file.createReadStream()
                const writer = writeStream.getWriter()
                stream.on('data', (data) => writer.write(data)).on('end', () => {
                    writer.close()
                    reslove({ done: true })
                }).on('error', () => reslove({ done: false }))
            }
        })
    }
    const itemDownload = async (file) => {
        if (downloadingAll) return waring('正在下载全部文件！')
        const name = file.name
        if (filesState[name].status === 'loading') return waring('正在下载该文件！')
        setFilesState((pre) => { return { ...pre, [name]: { status: 'loading' } } })
        loadList.push(name)
        const lt = new Date().getTime()
        const getSpeed = throttle((l: number) => {
            setFilesState((pre) => { return { ...pre, [name]: { status: 'loading', loaded: l } } })
        }, 800)
        const { done } = await downloadAlone(file, getSpeed)
        const dt = new Date().getTime()
        if (!done) {
            error('文件下载失败')
            setFilesState((pre) => { return { ...pre, [name]: { status: 'failed' } } })
            loadList.splice(loadList.indexOf(name, 1))
        } else {
            if (dt - lt < 1000) {
                setTimeout(() => {
                    setFilesState((pre) => { return { ...pre, [name]: { status: 'success' } } })
                }, 1200);
            } else {
                setFilesState((pre) => { return { ...pre, [name]: { status: 'success' } } })
            }
            loadList.splice(loadList.indexOf(name, 1))
        }
    }
    const progress = (l: number) => {
        const rate = Math.floor((l / totalFileSize) * 100)
        setDownloadAllRate(rate)
    }
    const downloadAll = async () => {
        if (downloadingAll) return waring('正在下载中！')
        setDownloadAll(true)
        torrentRef.current && torrentRef.current.on('download', listenSpeed)
        if (allFiles.length === 1) {
            const { done } = await downloadAlone(allFiles[0], progress) as any
            if (!done) error('文件下载失败')
        } else {
            const closeCallBack = () => {
                setTimeout(() => {
                    torrentRef.current && torrentRef.current.off('download', listenSpeed)
                    setDownloadAll(false)
                    setDownloadAllRate(0)
                    setSpeed(0)
                }, 1200);
            }
            const name = allFiles[0].path.split('/')[0]
            const { useBlob, writeStream} = await streamSaver(totalFileSize, `${name}.zip`, progress, closeCallBack)
            const streamArr = allFiles.map((file) => { 
                return { path: file.path, stream: nodeToweb(file.createReadStream())  }
            })
            const zipStream = getZipStream(streamArr)
            if(useBlob) {

            } else {
                zipStream.pipeTo(writeStream)
            }
        }
    }
    return (
        <>
            {allFiles.length === 0 ? <ResolveLinkDOM linkError={linkError} /> :
                <div className={classNames("w-full sm:flex-[5] h-full text-white", s.right)}>
                    <div className="pl-10 pr-[11.25rem] py-10 w-full h-full">
                        <div className="bg-head rounded-xl px-10 pt-10 pb-6 h-full">
                            <p className="text-[1.5rem] font-pf-bold">接收文件</p>
                            <div className='my-6 flex justify-between w-full'>
                                <button onClick={share} className='flex justify-center items-center px-6 py-2 rounded-3xl bg-opacity-20 bg-white hover:bg-button w-[45%]'>
                                    <ShareIcon />
                                    <span className='inline-block ml-2'>
                                        复制链接
                                    </span>
                                </button>
                                <button className='flex justify-center items-center px-6 py-2 rounded-3xl bg-opacity-20 bg-white hover:bg-button w-[45%]' onClick={downloadAll}>
                                    <span className='flex justify-center items-center'>
                                        {downloadingAll ?
                                            <>
                                                <FileLoadingIcon className='animate-spin' />
                                                <span className='ml-2'>正在下载</span>
                                            </>
                                            :
                                            <>
                                                <LoadIcon className='hidden md:inline' />
                                                <span className='ml-2'>全部下载</span>
                                            </>
                                        }
                                    </span>
                                </button>
                            </div>
                            <div className="border-t-2 border-b-2 border-white border-opacity-20 py-3 text-[0.875rem]">
                                <div className="flex justify-between items-center">
                                    <span>
                                        <span>{allFiles.length}个文件</span>
                                        <span className="border-l-2 border-r-2 px-2 mx-2">{fileSize(totalFileSize)}</span>
                                        <span>24h后过期</span>
                                    </span>
                                    <span>
                                        <span>下载节点数：{node}</span>
                                        {speed > 0 && <span className="border-l-2 ml-2 pl-2">{fileSize(speed) + '/s'}</span>}
                                    </span>
                                </div>
                                {
                                    downloadingAll &&
                                    <div className="flex justify-center items-center w-full mt-3">
                                        <span>下载总进度</span>
                                        <div className="bg-white bg-opacity-10 rounded-2xl h-4 flex-1 mx-3 text-center relative">
                                            <span className="absolute z-10 h-full leading-4">{downloadAllRate + '%'}</span>
                                            <div className="absolute rounded-2xl bg-button h-full transition-all" style={{ width: `${downloadAllRate}%` }}></div>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="overflow-x-hidden h-[70%] mt-3">
                                <ul className='h-full overflow-x-hidden overflow-y-scroll w-over-scroll'>
                                    {
                                        allFiles.map((file, index) => {
                                            const name = file.name, { status } = filesState[name], { loaded } = filesState[name]
                                            const type = fileTypeJson[name.split('.').pop()]
                                            const Icon = icon[type] || (() => <FileIcon />)
                                            return (
                                                <li onClick={() => itemDownload(file)} key={index} className='flex justify-between items-center border-b-2 border-white border-opacity-20 p-2 cursor-pointer hover:bg-white hover:bg-opacity-20'>
                                                    <span className='flex justify-center items-center'>
                                                        {Icon()}
                                                        <span className='pl-2 flex flex-col'>
                                                            <span title={name} className='overflow-hidden text-ellipsis max-w-[15.5rem] whitespace-nowrap'>{name}</span>
                                                            <span className="text-[0.875rem] leading-[0.875rem] flex item-center">
                                                                {
                                                                    status === 'loading' && loaded !== file.length && loaded > 0 &&
                                                                    <>
                                                                        <span>
                                                                            {fileSize(loaded)}
                                                                        </span>
                                                                        <span className="mx-1">/</span>
                                                                    </>
                                                                }
                                                                <span>
                                                                    {fileSize(file.length)}
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                    <span>
                                                        {
                                                            status !== null ? (status === 'loading' ? <FileLoadingIcon className='animate-spin' /> : (status === 'success' ? <FileLoadedIcon /> : <FileLoadFailIcon />)) : null
                                                        }
                                                    </span>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}