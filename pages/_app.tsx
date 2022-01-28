import { CacheProvider, EmotionCache } from '@emotion/react'
import { getApp, initializeApp } from '@firebase/app'
import { CssBaseline, ThemeProvider } from '@mui/material'
import NextApp, { AppContext, AppProps as NextAppProps } from 'next/app'
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
  firebaseConfig,
}: AppProps) {
  const { withoutLayout = false, ...restPageProps } = pageProps
  try {
    getApp()
  } catch (e) {
    initializeApp(firebaseConfig)
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

App.getInitialProps = async (context: AppContext) => {
  return {
    ...(await NextApp.getInitialProps(context)),
    firebaseConfig: JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!),
  }
}

export default App
