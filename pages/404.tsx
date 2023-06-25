import bg404 from '@/public/images/404bg.png'
import Image from 'next/image'
import s from './index.module.less'
export default function Error () {
    const back = () => {
        history.back()
    }
    return (
        <section className={'flex justify-center items-center w-full h-screen-120 min-h-[55.5rem] bg-content text-white'}>
            <div className='flex flex-col justify-center items-center font-pf-med mr-6 mt-9'>
                <span className='text-[1.875rem]'>功能开发中<span className={s.load}></span></span>
                <p className='mt-10 mb-20 leading-8 text-center'>
                    <p>fly file 希望给您带来更好的文件传输体验</p>
                    <p>升级内容正在开发中，敬请期待！</p>
                </p>
                <button className='bg-button text-[1.25rem] rounded-3xl py-2 px-8' onClick={back}>返回上一页</button>
            </div>
            <Image src={bg404} alt="background image"></Image>
        </section>
    )
}