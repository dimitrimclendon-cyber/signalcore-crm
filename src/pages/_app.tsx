import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Sidebar from '@/components/Sidebar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex min-h-screen bg-navy-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
