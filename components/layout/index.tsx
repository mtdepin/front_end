import Head from "next/head"
import Image from "next/image"
import UserIcon from '@/public/images/userIcon.svg'
import FastIcon from '@/public/images/fastIcon.svg'
import SafeIcon from '@/public/images/safeIcon.svg'
import EasyIcon from '@/public/images/easyIcon.svg'
import logo from '@/public/images/logo.png'
import logoblue from '@/public/images/logoblue.png'
import { cloneElement, useEffect, useState } from "react"
import base64 from 'base-64'
import Link from "next/link"
import classNames from "classnames"
import s from './index.module.less'
import { getCookie, removeCookie, request, setCookie } from "@/utils"
import { message, Tips } from "../message"
import Drawer from "../drawer"
const { success, error } = message()
const nav = [
    { path: '/', title: '首页' },
    { path: '/upgradeUser', title: '升级账户' }
]
const phoneReg = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
let timer
export default function Layout(props) {
    const { children } = props
    const [user, setUser] = useState<string>()
    const [islogin, setLogin] = useState<boolean>(false)
    const [navActive, setNav] = useState<string>('/')
    const [phone, setPhone] = useState<string>('')
    const [code, setCode] = useState<string>('')
    const [time, setTime] = useState<number>(0)
    const [tips, setTips] = useState<any>({ show: false })
    const [show, setShow] = useState<boolean>(false)
    useEffect(() => {
        const user = getCookie('UID') ? base64.decode(getCookie('UID')).split(';')[0] : ''
        request.get('/user/checkToken').then((res: response) => {
            setLogin(res.status)
            if (res.status) {
                setUser(user)
            }
        })
    }, [])
    const inputChange = (e, type: 'phone' | 'code') => {
        if (type === 'code') setCode(e.target.value)
        if (type === 'phone') setPhone(e.target.value)
        setTips({ show: false })
    }
    const getCode = () => {
        if (time > 0) return
        if (!phoneReg.test(phone.trim())) {
            setTips({ show: true, txt: '请输入正确的手机号', type: 'error' })
        } else {
            request.get('/user/loginCaptcha', { phone }).then((res: response) => {
                if (res.status) {
                    setTips({ show: true, txt: '验证码已发送', type: 'success' })
                    setTime(60)
                    timer = setInterval(() => {
                        setTime((pre) => {
                            const t = pre - 1
                            if (t >= 0) {
                                return t
                            } else {
                                clearInterval(timer)
                                return 0
                            }
                        })
                    }, 1000)
                } else {
                    clearInterval(timer)
                    setTips({ show: true, txt: res.message, type: 'error' })
                }
            })
        }
    }
    const login = () => {
        if (!phone || !code || (phone && !phoneReg.test(phone.trim()))) {
            setTips({ show: true, txt: '手机号不存在或验证码错误', type: 'error' })
        } else {
            const user = phone, captCha = code, time = new Date().toDateString()
            request.post('/user/login', { phone, captCha }).then((res: response) => {
                if (res.status) {
                    setTips({ show: true, txt: '登录成功', type: 'success' })
                    setCookie('AUTHORID', res.data.token)
                    setCookie('UID', base64.encode(user + ';' + time))
                    setTimeout(() => {
                        setUser(user)
                        setShow(false)
                        setLogin(true)
                    }, 1500);
                } else {
                    setLogin(false)
                    setTips({ show: true, txt: '手机号不存在或验证码错误', type: 'error' })
                }
            })
        }
    }
    const keyLogin = (e) => {
        if (e.keyCode === 13) login()
    }
    const logout = () => {
        request.post('/user/logout', { phone: user }).then((res: response) => {
            if (res.status) {
                removeCookie('AUTHORID')
                removeCookie('UID')
                setUser('')
                setLogin(false)
                success('退出成功')
            } else {
                error(res.message)
            }
        })
    }
    const drawerClose = () => {
        setShow(false)
        setTips({ show: false })
    }
    const goHome = () => {
        if(window.location.hash !== '' || window.location.pathname !== '/') window.location.href = '/'
        setNav('/')
    }
    return (
        <>
            <Head>
                <title>中星大文件传输</title>
                <meta name="description" content="大文件传输，p2p文件分享" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className='flex justify-around md:justify-between px-0 md:px-16 bg-head h-72px items-center w-full top-0 sticky z-50'>
                <div className='cursor-pointer' onClick={goHome}>
                    <Image alt='logo' src={logo} width={110} height={32}></Image>
                </div>
                <div className="flex justify-center items-center text-[0.875rem] text-center text-white h-full">
                    {nav.map((item, index) => {
                        if (item.path === '/') {
                            return <button key={index} className={classNames('px-4 h-full hover:bg-white hover:bg-opacity-5', { 'bg-opacity-5 bg-white': item.path === navActive })} onClick={goHome}>{item.title}</button>
                        } else {
                            return (
                                <Link href={item.path} key={index}>
                                    <button className={classNames('px-4 h-full hover:bg-white hover:bg-opacity-5', { 'bg-opacity-5 bg-white': item.path === navActive })} onClick={() => setNav(item.path)}>{item.title}</button>
                                </Link>
                            )
                        }
                    })}
                    {
                        !islogin ? <button className='text-[0.875rem] text-center rounded-3xl text-white mx-6 px-6 py-1 bg-button' onClick={() => setShow(true)}>登录</button> :
                            <div className={classNames('text-white relative pl-8 pr-2 w-[7.5rem]', s.info)}>
                                <span className='cursor-pointer inline-block py-3'>{user.substr(0, 3) + '****' + user.substr(7, 4)}</span>
                                <span className={classNames('absolute cursor-pointer top-1/2 ml-2 -mt-1', s.arrow)}>
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g id="dk-icon">
                                            <path id="dk-icon_2" fillRule="evenodd" clipRule="evenodd" d="M7.65853 5.45896C7.46994 5.64755 7.16419 5.64756 6.97559 5.45896L4.09767 2.59014L1.02444 5.66336C0.835851 5.85195 0.530097 5.85196 0.341497 5.66336C0.152896 5.47476 0.152905 5.169 0.341493 4.98042L3.75619 1.56572C3.94478 1.37713 4.25053 1.37712 4.43913 1.56573L7.65853 4.77602C7.84713 4.96462 7.84712 5.27037 7.65853 5.45896Z" fill="white" />
                                        </g>
                                    </svg>
                                </span>
                                <div className={classNames('absolute bg-white rounded-lg text-black text-[0.875rem] w-44 py-2 left-0 justify-center items-center', s.card)}>
                                    <UserIcon />
                                    <span className='font-pf-bold font-bold'>{user}</span>
                                    <span className='font-pf-bold font-bold'>免费版</span>
                                    <span className='text-txt-grey'>到期时间：永久</span>
                                    <button className='text-white bg-content py-1 px-8 rounded-2xl mb-1 mt-2'>升级账户</button>
                                    <button className='bg-black text-txt-grey bg-opacity-10 py-1 px-8 rounded-2xl my-1' onClick={logout}>退出登录</button>
                                    <button className='text-button my-1'>查看会员权限</button>
                                </div>
                            </div>
                    }
                </div>
            </div>
            {cloneElement(children, { islogin })}
            {
                !islogin && <Drawer closeIcon={'fork'} width={560} onClose={drawerClose} visiable={show}>
                    <div className="px-20 pt-[10rem] text-white">
                        <div className="flex items-center">
                            <span className="text-[2.5rem] font-pf-bold mr-4">欢迎使用</span>
                            <Image alt="logo" src={logoblue} />
                        </div>
                        <div className="mt-20">
                            <span className="inline-block text-[1.25rem] font-pf-med pb-4 border-b-2 border-button">账号登录</span>
                            <div className='rounded-3xl px-4 py-2 flex border border-white border-opacity-20 items-center mt-8'>
                                <span>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g id="zh-icon">
                                            <path id="zh-icon_2" fillRule="evenodd" clipRule="evenodd" d="M13 5C13 6.63974 12.2107 8.09512 10.9913 9.00692C13.8399 9.35336 15.9982 11.0072 16 13.9208V14.2763C16 16 13.1419 16 9.83093 16H6.16907C2.72345 16 0 16 0 14.2763V13.9208C0 11.0066 2.15897 9.35269 5.00846 9.0067C3.7892 8.09489 3 6.63961 3 5C3 2.23858 5.23858 0 8 0C10.7614 0 13 2.23858 13 5ZM6 11C5.44772 11 5 11.4477 5 12C5 12.5523 5.44772 13 6 13H10C10.5523 13 11 12.5523 11 12C11 11.4477 10.5523 11 10 11H6Z" fill="white" />
                                        </g>
                                    </svg>
                                </span>
                                <input placeholder={'请输入手机号'} onChange={(e) => inputChange(e, 'phone')} type={'text'} className='bg-transparent outline-0 px-2 w-full'></input>
                            </div>
                            <div className='flex mt-6'>
                                <div className='rounded-3xl py-2 px-4 flex flex-1 items-center border border-white border-opacity-20'>
                                    <span>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g id="yzm-icon">
                                                <path id="yzm-icon_2" fillRule="evenodd" clipRule="evenodd" d="M15.5806 2.85389C15.8327 2.94497 15.9903 3.1575 15.9903 3.40038C15.9903 3.41394 15.9909 3.44455 15.9918 3.49066C16.0068 4.27032 16.1073 9.48328 14.8871 11.7192C13.5948 14.1176 8.4257 15.9089 8.20506 15.9696C8.11051 16 8.04747 16 7.98443 16C7.88987 16 7.82683 16 7.76379 15.9696C7.54316 15.9089 2.37401 14.148 1.08172 11.7192C-0.107623 9.51384 -0.00670229 4.30949 0.00854852 3.52302C0.00946434 3.4758 0.0100712 3.4445 0.0100712 3.43074C0.0415904 3.18786 0.199186 2.97533 0.419821 2.88425L7.79531 0.0303605C7.85835 0 7.92139 0 8.01595 0C8.01804 0 8.02011 0 8.02217 1.31176e-05C8.14408 0.000788949 8.2657 0.0474508 15.5806 2.85389ZM4 6C4 5.44772 4.44772 5 5 5H8H11C11.5523 5 12 5.44772 12 6C12 6.55228 11.5523 7 11 7H9V12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12L7 7H5C4.44772 7 4 6.55228 4 6Z" fill="white" />
                                            </g>
                                        </svg>
                                    </span>
                                    <input onKeyDown={keyLogin} placeholder={'请输入验证码'} onChange={(e) => inputChange(e, 'code')} type={'text'} className='bg-transparent outline-0 px-2 w-full'></input>
                                </div>
                                <button onClick={getCode} className={classNames('px-3 py-2 rounded-3xl border border-white border-opacity-20 ml-4', { 'cursor-not-allowed': time > 0 })}>
                                    获取验证码
                                    {
                                        time > 0 && <span className='pl-1 text-white text-opacity-20'>{`(${time})`}</span>
                                    }
                                </button>
                            </div>
                            <Tips type={tips.type as tipsType} text={tips.txt} visiable={tips.show} className='absolute ml-5 mt-1'></Tips>
                            <div onClick={login} className='cursor-pointer rounded-3xl text-center bg-button mt-8 py-2 text-[1rem]'>立即登录</div>
                        </div>
                        <div className="flex mt-20">
                            <div className="flex flex-col justify-center items-center p-3 rounded-xl bg-white bg-opacity-5">
                                <FastIcon />
                                <span className="font-pf-bold my-1">快速</span>
                                <span className="font-pf-med text-[0.875rem] text-opacity-40 text-white">安全高速传输</span>
                            </div>
                            <div className="flex flex-col justify-center items-center p-3 rounded-xl bg-white bg-opacity-5 mx-8">
                                <SafeIcon />
                                <span className="font-pf-bold my-1">安全</span>
                                <span className="font-pf-med text-[0.875rem] text-opacity-40 text-white">到期自动销毁</span>
                            </div>
                            <div className="flex flex-col justify-center items-center p-3 rounded-xl bg-white bg-opacity-5">
                                <EasyIcon />
                                <span className="font-pf-bold my-1">便捷</span>
                                <span className="font-pf-med text-[0.875rem] text-opacity-40 text-white">无需安装应用</span>
                            </div>
                        </div>
                    </div>
                </Drawer>
            }
            <footer className='text-[0.875rem] h-12 w-full flex flex-col sm:flex-row sm:justify-between px-1 sm:px-6 md:px-14 items-center text-white bg-head'>
                <span>© 2018-2022 mty.wang 版权所有</span>
                <span>浙ICP备2023000883号-2 浙公网安备 33011002016128号</span>
            </footer>
        </>
    )
}