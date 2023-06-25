import classNames from "classnames"
import { ReactElement, useMemo } from "react"
import Image from "next/image"
import { render } from 'react-dom'
type messageNode = {
    type: 'success' | 'error' | 'waring',
    message: string | ReactElement
}
type messageParams = {
    delay?: number,
    onClose?: () => void,
    message: string | ReactElement
}

const waringIcon = (
    <span>
        <svg width="14" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Group 85">
                <circle id="Ellipse 75" cx="7.29297" cy="7" r="4.375" fill="white" />
                <path id="Vector" d="M7.29297 0C3.43597 0 0.292969 3.143 0.292969 7C0.292969 10.857 3.43597 14 7.29297 14C11.15 14 14.293 10.857 14.293 7C14.293 3.143 11.15 0 7.29297 0ZM6.41797 4.6375C6.41797 4.3505 6.23009 3.23746 7.28009 3.23746C8.33009 3.23746 8.16713 4.3505 8.16713 4.6375L7.80526 8.1375C7.80526 8.4245 7.56726 8.6625 7.28026 8.6625C6.99326 8.6625 6.75526 8.4245 6.75526 8.1375L6.41797 4.6375ZM7.92426 10.5035C7.88926 10.5945 7.84026 10.6645 7.77726 10.7345C7.70726 10.7975 7.63026 10.8465 7.54626 10.8815C7.46226 10.9165 7.37126 10.9375 7.28026 10.9375C7.18926 10.9375 7.09826 10.9165 7.01426 10.8815C6.93026 10.8465 6.85326 10.7975 6.78326 10.7345C6.72026 10.6645 6.67126 10.5945 6.63626 10.5035C6.60126 10.4195 6.58026 10.3285 6.58026 10.2375C6.58026 10.1465 6.60126 10.0555 6.63626 9.9715C6.67126 9.8875 6.72026 9.8105 6.78326 9.7405C6.85326 9.6775 6.93026 9.6285 7.01426 9.5935C7.18226 9.5235 7.37826 9.5235 7.54626 9.5935C7.63026 9.6285 7.70726 9.6775 7.77726 9.7405C7.84026 9.8105 7.88926 9.8875 7.92426 9.9715C7.95926 10.0555 7.98026 10.1465 7.98026 10.2375C7.98026 10.3285 7.95926 10.4195 7.92426 10.5035Z" fill="#F59E0B" />
            </g>
        </svg>
    </span>
)
const successIcon = (
    <span>
        <svg width="14" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Group 94">
                <circle id="Ellipse 76" cx="7.29297" cy="7" r="7" fill="#10B981" />
                <g id="Union">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.7812 4.57583C10.5135 4.30806 10.0793 4.30806 9.81157 4.57583L6.41786 7.96954L4.96346 6.51514C4.6957 6.24737 4.26156 6.24737 3.99379 6.51514C3.72603 6.78291 3.72603 7.21704 3.99379 7.48481L5.92146 9.41248C5.92521 9.41641 5.92902 9.42031 5.93289 9.42418C6.08511 9.57639 6.29109 9.64208 6.48971 9.62123C6.64057 9.60545 6.78719 9.53976 6.9028 9.42415C6.90628 9.42067 6.90972 9.41716 6.91311 9.41362L10.7812 5.5455C11.049 5.27773 11.049 4.84359 10.7812 4.57583Z" fill="white" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.7812 4.57583C10.5135 4.30806 10.0793 4.30806 9.81157 4.57583L6.41786 7.96954L4.96346 6.51514C4.6957 6.24737 4.26156 6.24737 3.99379 6.51514C3.72603 6.78291 3.72603 7.21704 3.99379 7.48481L5.92146 9.41248C5.92521 9.41641 5.92902 9.42031 5.93289 9.42418C6.08511 9.57639 6.29109 9.64208 6.48971 9.62123C6.64057 9.60545 6.78719 9.53976 6.9028 9.42415C6.90628 9.42067 6.90972 9.41716 6.91311 9.41362L10.7812 5.5455C11.049 5.27773 11.049 4.84359 10.7812 4.57583Z" fill="white" />
                </g>
            </g>
        </svg>
    </span>
)
const errorIcon = (
    <span>
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Group 99">
                <g id="Group 99_2">
                    <ellipse id="Ellipse 77" cx="7.29297" cy="7" rx="7" ry="7" transform="rotate(90 7.29297 7)" fill="#EF4444" />
                    <g id="Rectangle 227">
                        <rect x="9.49316" y="3.7002" width="1.55554" height="7.77769" rx="0.77777" transform="rotate(45 9.49316 3.7002)" fill="white" />
                        <rect x="9.49316" y="3.7002" width="1.55554" height="7.77769" rx="0.77777" transform="rotate(45 9.49316 3.7002)" fill="white" />
                    </g>
                    <g id="Rectangle 228">
                        <rect x="10.5928" y="9.19995" width="1.55554" height="7.77769" rx="0.77777" transform="rotate(135 10.5928 9.19995)" fill="white" />
                        <rect x="10.5928" y="9.19995" width="1.55554" height="7.77769" rx="0.77777" transform="rotate(135 10.5928 9.19995)" fill="white" />
                    </g>
                </g>
            </g>
        </svg>
    </span>
)
function message() {
    const nodes = []
    let root
    const createMessageNode = (params: messageNode) => {
        const { type, message } = params
        const Node = (props) => {
            const { className, style } = props
            return (
                <div style={style} className={classNames('relative flex justify-center items-center bg-content rounded-2xl px-4 py-1', { 'text-success': type === 'success' }, { 'text-error': type === 'error' }, { 'text-waring': type === 'waring' }, className)}>
                    {type === 'success' ? successIcon : type === 'waring' ? waringIcon : errorIcon}
                    <span className='ml-2 text-[0.875rem]'>
                        {message}
                    </span>
                </div>
            )
        }
        return Node
    }
    const renderMessage = () => {
        if (!root) {
            root = document.createElement('div')
            root.className = 'fixed z-max top-20 left-1/2 cursor-pointer -translate-x-1/2'
            document.body.appendChild(root)
        }
        const reactElement = nodes.map((Node, index) => {
            let top = null
            if (index !== 0) top = `${index / 2}rem`
            return <Node key={index} style={{ top }} />
        })
        render(reactElement, root)
    }
    const timeOutRemoveNode = (node, delay, onClose?: () => void) => {
        let timer = setTimeout(() => {
            const index = nodes.findIndex((nodeItme) => nodeItme === node)
            nodes.splice(index, 1)
            renderMessage()
            if (onClose) onClose()
            timer = null
        }, delay)
    }
    const renderWithType = (type: 'success' | 'error' | 'waring') => {
        return (params: string | messageParams) => {
            const nodeParams: messageNode = { type, message: '' }
            if (typeof params === 'string') {
                nodeParams.message = params
            } else {
                nodeParams.message = params.message
            }
            const { delay = 2000, onClose } = params as messageParams
            const node = createMessageNode(nodeParams)
            nodes.push(node)
            renderMessage()
            timeOutRemoveNode(node, delay, onClose)
        }
    }
    return {
        success: renderWithType('success'),
        error: renderWithType('error'),
        waring: renderWithType('waring')
    }
}
type tipsProps = {
    text: string,
    type: tipsType,
    visiable: boolean,
    iconSrc?: any,
    space?: number,
    className?: string
}
function Tips(props: tipsProps) {
    const Icon = useMemo(() => {
        if (props.iconSrc) return <Image alt="icon" src={props.iconSrc}></Image>
        switch (props.type) {
            case 'error':
                return errorIcon
            case 'success':
                return successIcon
            case 'waring':
                return waringIcon
        }
    }, [props.iconSrc, props.type])
    return (
        <>
            {props.visiable ?
                <span className={classNames('flex items-center text-[0.875rem]', { 'text-success': props.type === 'success' }, { 'text-error': props.type === 'error' }, { 'text-waring': props.type === 'waring' }, props.className)}>
                    {Icon}
                    <span style={{ marginLeft: props.space }} className='ml-2'>{props.text}</span>
                </span>
                : null
            }
        </>
    )
}

export {
    message,
    Tips
}