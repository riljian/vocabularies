import { Icon } from '@iconify/react'
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { formatRelative } from 'date-fns'
import type { GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useState } from 'react'
import { bottomNavigationConfigs, EXAM_PATH } from '../../configs/path'
import { ExamSessionMode, VocabularyExamSession } from '../../models/Vocabulary'
import { useAuthContext } from '../../providers/Auth'

interface State {
  examSessions: VocabularyExamSession[]
}

const { title } = bottomNavigationConfigs[1]

const Row: FC<{
  session: VocabularyExamSession
  onRestartClick?: (sessionId: string, mode: ExamSessionMode) => void
}> = ({ session, onRestartClick }) => {
  const [{ collapsed }, setState] = useState(() => ({ collapsed: true }))
  const { createdAt, failed, progress, vocabularies, id } = session
  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            onClick={() => setState((s) => ({ ...s, collapsed: !s.collapsed }))}
            size="small"
          >
            {collapsed ? (
              <Icon icon="ic:round-keyboard-arrow-up" />
            ) : (
              <Icon icon="ic:round-keyboard-arrow-down" />
            )}
          </IconButton>
        </TableCell>
        <TableCell>{formatRelative(createdAt, new Date())}</TableCell>
        <TableCell>
          {failed} / {progress} / {vocabularies.length}
        </TableCell>
        <TableCell>
          <Stack spacing={1}>
            <Button
              variant="contained"
              onClick={() => {
                onRestartClick && onRestartClick(id, ExamSessionMode.Practice)
              }}
            >
              重新複習
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                onRestartClick && onRestartClick(id, ExamSessionMode.Exam)
              }}
            >
              重新測驗
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} sx={{ py: 0 }}>
          <Collapse in={!collapsed} timeout="auto" unmountOnExit>
            <Box>{vocabularies.join(', ')}</Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

const Exam: NextPage = () => {
  const { push } = useRouter()
  const {
    actions: { getExamSessions, resetExamSession },
  } = useAuthContext()
  const [{ examSessions }, setState] = useState<State>(() => ({
    examSessions: [],
  }))
  const restartSession = useCallback(
    (sessionId, mode: ExamSessionMode) => {
      resetExamSession(sessionId)
        .then(() =>
          push({ pathname: `${EXAM_PATH}/${sessionId}`, query: { mode } })
        )
        .catch((error) => {
          console.error(error)
        })
    },
    [resetExamSession, push]
  )

  useEffect(() => {
    getExamSessions()
      .then((sessions) => setState((s) => ({ ...s, examSessions: sessions })))
      .catch((error) => {
        console.error(error)
      })
  }, [getExamSessions])

  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        僅顯示近 1 個月內測驗紀錄
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>測驗時間</TableCell>
              <TableCell>
                測驗完成度
                <br />
                遺忘/完成/全部
              </TableCell>
              <TableCell>動作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examSessions.map((session) => (
              <Row
                session={session}
                key={session.id}
                onRestartClick={restartSession}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title,
  },
})

export default Exam
