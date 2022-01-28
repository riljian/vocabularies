import { Typography } from '@mui/material'
import type { NextPage } from 'next'
import { GetStaticProps } from 'next'

const Home: NextPage = () => {
  return <Typography>Home</Typography>
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title: '首頁',
  },
})

export default Home
