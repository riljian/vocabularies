import { Button, Stack } from '@mui/material'
import type { GetStaticProps, NextPage } from 'next'
import Link from '../../components/Link'
import { bottomNavigationConfigs, CREATE_EXAM_PATH } from '../../configs/path'

const { title } = bottomNavigationConfigs[1]
const Exam: NextPage = () => {
  return (
    <Stack spacing={1}>
      <Button variant="contained" component={Link} href={CREATE_EXAM_PATH}>
        新增測驗
      </Button>
    </Stack>
  )
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title,
  },
})

export default Exam
