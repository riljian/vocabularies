import { Typography } from '@mui/material'
import type { GetStaticProps, NextPage } from 'next'
import { bottomNavigationConfigs } from '../../configs/path'

const { title } = bottomNavigationConfigs[1]
const Exam: NextPage = () => {
  return <Typography>{title}</Typography>
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title,
  },
})

export default Exam
