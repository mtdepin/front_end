import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import ArrowIcon from '@/public/images/drawerArrowIcon.svg'
import ForkIcon from '@/public/images/drawerForkIcon.svg'
type drawerProps = {
    visiable: boolean,
    onClose: () => void,
    children: JSX.Element | JSX.Element[],
    placement?: 'left' | 'right',
    width?: number,
    className?: string | null,
    closeIcon?: 'fork' | 'arrow'
}
export default function Drawer(props: drawerProps) {
    const { children, onClose, visiable, placement = 'right', width = 640, className, closeIcon = 'fork' } = props
    const [forceUpdate, setUpdate] = useState<boolean>(false)
    const container = useRef<HTMLElement>()
    const currentVisiable = useRef<boolean>(visiable)
    const isRender = useRef<boolean>(visiable)
    const MemoStyle = useMemo(() => {
        const style: any = {
            top: 0,
            bottom: 0,
            width: 0,
            height: '100%'
        }
        if (placement === 'right') style.right = 0
        if (placement === 'left') style.left = 0
        if (visiable) style.width = width
        return style
    }, [placement, visiable])
    useEffect(() => {
        container.current = document.body
        if (visiable) setUpdate(!forceUpdate)
    }, [])
    useEffect(() => {
        if (visiable) {
            if(document.body.scrollHeight > window.innerHeight || document.body.scrollHeight > document.documentElement.clientHeight)
            container.current.className = 'overflow-hidden w-less-scroll'
        } else {
            container.current.removeAttribute('class')
        }
    }, [visiable])
    const drawer = () => {
        const html = (
            <div>
                <div className={classNames('fixed top-0 left-0 bottom-0 right-0 w-full h-full bg-black bg-opacity-50 z-50', { 'hidden': !visiable })} onClick={onClose}></div>
                <div style={MemoStyle} className={classNames('fixed z-50 bg-head transition-all', className)} onClick={(e) => e.stopPropagation()}>
                    <div className={classNames('absolute -translate-x-1/2 top-[4.5rem] cursor-pointer z-20', { 'hidden': !visiable })} onClick={onClose}>{closeIcon === 'arrow' ? <ArrowIcon /> : <ForkIcon />}</div>
                    <div className={classNames('relative z-10', { 'hidden': !visiable })}>
                        {children}
                    </div>
                </div>
            </div>
        )
        if (isRender.current || currentVisiable.current !== visiable) {
            isRender.current = true
            currentVisiable.current = visiable
            return html
        }
    }
    return container.current && createPortal(drawer(), container.current)
}