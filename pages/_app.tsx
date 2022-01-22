import { CacheProvider, EmotionCache } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import type { AppProps as NextAppProps } from 'next/app'
import Head from 'next/head'
import theme from '../configs/theme'
import { createEmotionCache } from '../helpers/theme'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface EmotionAppProps extends NextAppProps {
  emotionCache?: EmotionCache
}

function App({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: EmotionAppProps) {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{pageProps.title}</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}

export default App
