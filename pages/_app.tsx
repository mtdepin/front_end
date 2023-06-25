import type { AppProps } from 'next/app'
import Layout from "@/components/layout";
import '../styles/globals.css'
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 访问统计
    var _hmt = _hmt || [];
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?b45de93c8cf1d911595b37f3ca80cd25";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
  }, [])
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
