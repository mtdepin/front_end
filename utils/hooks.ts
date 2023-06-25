import { useEffect } from "react"

function useOutClick(ref: React.RefObject<HTMLElement>, cb: () => void) {
    const listen = (e: MouseEvent) => {
        if(!ref.current?.contains(e.target as Node)) {
            cb()
        }
    }
    useEffect(() => {
        document.body.addEventListener('mousedown', listen)
        return () => document.body.removeEventListener('mousedown', listen)
    }, [])
}
export {
    useOutClick
}