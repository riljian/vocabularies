import { Icon } from '@iconify/react'
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from '../../components/Link'
import VocabularyExamCarousel from '../../components/VocabularyExamCarousel'
import { EXAM_HISTORY_PATH } from '../../configs/path'
import useExamSession from '../../hooks/useExamSession'
import { ExamSessionMode } from '../../models/Vocabulary'
import { useAuthContext } from '../../providers/Auth'

const ExamSession: NextPage = () => {
  const {
    query: { mode: modeQuery, examSessionId },
  } = useRouter()
  const {
    state: { me },
  } = useAuthContext()
  const {
    state: { vocabularies, progress, owner },
    actions: { goToNext },
  } = useExamSession(me!, examSessionId as string)
  const isCompleted = progress === vocabularies.length
  const mode = Number(modeQuery) as ExamSessionMode

  return (
    <Stack>
      <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.floor((progress * 100) / vocabularies.length)}
          />
        </Box>
        <Box>
          <Typography variant="body2">
            {progress} / {vocabularies.length}
          </Typography>
        </Box>
      </Stack>
      {isCompleted ? (
        <Stack
          sx={{
            alignItems: 'center',
            color: (theme) => theme.palette.success.main,
            fontSize: '40px',
            mt: 3,
          }}
        >
          <Icon icon="ant-design:file-done-outlined" />
          <Typography variant="h5">完成了</Typography>
          <Button component={Link} href={EXAM_HISTORY_PATH}>
            回測驗紀錄
          </Button>
        </Stack>
      ) : (
        <VocabularyExamCarousel
          interactive={mode === ExamSessionMode.Practice || owner !== me!.uid}
          slideIndex={progress}
          vocabularies={vocabularies}
          onForgotClick={(id) => {
            goToNext(id, false).catch((error) => {
              console.error(error)
            })
          }}
          onRememberedClick={(id) => {
            goToNext(id, true).catch((error) => {
              console.error(error)
            })
          }}
        />
      )}
    </Stack>
  )
}

export const getServerSideProps: GetServerSideProps = async () => ({
  props: {
    title: '測驗中',
  },
})

export default ExamSession
