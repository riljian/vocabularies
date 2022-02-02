import { Icon } from '@iconify/react'
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { find, findIndex } from 'lodash'
import type { GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { EXAM_PATH } from '../../configs/path'
import { ExamSessionMode } from '../../models/Vocabulary'
import { useAuthContext } from '../../providers/Auth'

interface Candidate {
  id?: string
  value: string
  loading: boolean
}
interface State {
  vocabularyCandidates: Candidate[]
  inputValue: string
}

const CreateExam: NextPage = () => {
  const { push } = useRouter()
  const {
    actions: { query, createExam, createExamSession },
  } = useAuthContext()
  const requestsRef = useRef<Set<string>>(new Set())
  const [{ vocabularyCandidates, inputValue }, setState] = useState<State>(
    () => ({
      inputValue: '',
      vocabularyCandidates: [],
    })
  )
  const { addable, submittable, submittableVocabularyIds } = useMemo(() => {
    const submittableVocabularyIds = vocabularyCandidates
      .filter(({ id }) => !!id)
      .map(({ id }) => id!)
    return {
      submittableVocabularyIds,
      addable:
        inputValue.length > 0 &&
        !vocabularyCandidates.some(({ value }) => value === inputValue),
      submittable:
        submittableVocabularyIds.length > 0 &&
        !vocabularyCandidates.some(({ loading }) => loading),
    }
  }, [vocabularyCandidates, inputValue])
  const startExam = useCallback(
    (mode) => {
      createExam(submittableVocabularyIds)
        .then((examId) => createExamSession(examId))
        .then((examSessionId) =>
          push({ pathname: `${EXAM_PATH}/${examSessionId}`, query: { mode } })
        )
        .catch((error) => {
          console.error(error)
        })
    },
    [createExam, createExamSession, submittableVocabularyIds, push]
  )

  useEffect(() => {
    const { current: request } = requestsRef
    vocabularyCandidates
      .filter(({ loading, value }) => loading && !request.has(value))
      .forEach(({ value: targetValue }) => {
        request.add(targetValue)
        const getNewStateFactory = (payload: any) => (s: State) => {
          const { vocabularyCandidates } = s
          const index = findIndex(
            vocabularyCandidates,
            ({ value }) => value === targetValue
          )
          if (index === -1) {
            return s
          }
          const newCandidates = [...vocabularyCandidates]
          newCandidates.splice(index, 1, {
            value: targetValue,
            ...payload,
          })
          return {
            ...s,
            vocabularyCandidates: newCandidates,
          }
        }
        query(targetValue)
          .then(({ id }) => {
            setState(getNewStateFactory({ id, loading: false }))
          })
          .catch(() => {
            setState(getNewStateFactory({ loading: false }))
          })
      })
  }, [vocabularyCandidates, query])

  return (
    <Stack spacing={1}>
      <Box
        component="form"
        sx={{ display: 'flex', columnGap: 1 }}
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          if (
            !find(vocabularyCandidates, ({ value }) => value === inputValue)
          ) {
            setState((s) => ({
              ...s,
              vocabularyCandidates: [
                { value: inputValue, loading: true },
                ...s.vocabularyCandidates,
              ],
            }))
          }
          setState((s) => ({ ...s, inputValue: '' }))
        }}
      >
        <TextField
          variant="standard"
          label="Vocabulary"
          autoCapitalize="false"
          autoFocus
          fullWidth
          value={inputValue}
          onChange={(event) => {
            setState((s) => ({ ...s, inputValue: event.target.value }))
          }}
        />
        <IconButton type="submit" color="primary" disabled={!addable}>
          <Icon icon="clarity:add-text-line" />
        </IconButton>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>單字</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>移除</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vocabularyCandidates.map(({ id, value, loading }) => (
              <TableRow key={value}>
                <TableCell>{value}</TableCell>
                <TableCell>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : id ? (
                    <Box
                      component="span"
                      sx={{ color: (theme) => theme.palette.success.main }}
                    >
                      <Icon icon="ic:round-check-circle" />
                    </Box>
                  ) : (
                    <Box
                      component="span"
                      sx={{ color: (theme) => theme.palette.error.main }}
                    >
                      <Icon icon="ic:round-cancel" />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    type="button"
                    color="error"
                    size="small"
                    onClick={() => {
                      setState(({ vocabularyCandidates, ...restState }) => ({
                        ...restState,
                        vocabularyCandidates: vocabularyCandidates.filter(
                          ({ value: cmpValue }) => cmpValue !== value
                        ),
                      }))
                    }}
                  >
                    <Icon icon="ic:round-playlist-remove" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          variant="contained"
          disabled={!submittable}
          onClick={() => startExam(ExamSessionMode.Practice)}
        >
          開始複習
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={!submittable}
          onClick={() => startExam(ExamSessionMode.Exam)}
        >
          開始測驗
        </Button>
      </Stack>
    </Stack>
  )
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title: '新增測驗',
  },
})

export default CreateExam
