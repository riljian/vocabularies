import { CacheProvider, EmotionCache } from '@emotion/react'
import { getApp, initializeApp } from '@firebase/app'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AppProps as NextAppProps } from 'next/app'
import Head from 'next/head'
import Layout from '../components/Layout'
import theme from '../configs/theme'
import { createEmotionCache } from '../helpers/theme'
import AuthProvider from '../providers/Auth'

interface AppProps extends NextAppProps {
  emotionCache?: EmotionCache
  firebaseConfig?: any
}

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

function App({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: AppProps) {
  const { withoutLayout = false, ...restPageProps } = pageProps
  try {
    getApp()
  } catch (e) {
    initializeApp(
      JSON.parse(
        Buffer.from(
          process.env.NEXT_PUBLIC_FIREBASE_CONFIG!,
          'base64'
        ).toString()
      )
    )
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{restPageProps.title}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {withoutLayout ? (
            <Component {...restPageProps} />
          ) : (
            <Layout>
              <Component {...restPageProps} />
            </Layout>
          )}
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default App
