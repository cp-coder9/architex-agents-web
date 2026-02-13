import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import ChatBubble from '../components/ChatBubble'
import { useRouter } from 'next/router'
import { AuthProvider } from '../contexts/AuthContext'

const noLayoutPages = ['/login', '/register']

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const showLayout = !noLayoutPages.includes(router.pathname)

  return (
    <AuthProvider>
      {!showLayout ? (
        <>
          <Component {...pageProps} />
          <ChatBubble />
        </>
      ) : (
        <Layout>
          <Component {...pageProps} />
          <ChatBubble />
        </Layout>
      )}
    </AuthProvider>
  )
}
