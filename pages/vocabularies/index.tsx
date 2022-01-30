import { Icon } from '@iconify/react'
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react'
import { bottomNavigationConfigs } from '../../configs/path'
import {
  VocabularyRecordDuration,
  VocabularyRecordStatistics,
} from '../../models/Vocabulary'
import { useAuthContext } from '../../providers/Auth'

interface State {
  view: 'table' | 'card'
  duration: VocabularyRecordDuration
  summaries: VocabularyRecordStatistics[]
}

const initialState: State = {
  view: 'table',
  duration: 'weeks',
  summaries: [],
}
const { title } = bottomNavigationConfigs[0]

const Vocabulary: NextPage = () => {
  const {
    actions: { getRecords },
  } = useAuthContext()
  const [{ view, duration, summaries }, setState] = useState<State>(
    () => initialState
  )

  useEffect(() => {
    getRecords(duration)
      .then((aggregate) => {
        setState((s) => ({ ...s, summaries: aggregate }))
      })
      .catch((error) => {
        console.error(error)
      })
  }, [duration, getRecords])

  return (
    <Stack>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
        }}
      >
        <Box>
          <span>最近 1</span>
          <ToggleButtonGroup
            sx={{ ml: 1 }}
            exclusive
            value={duration}
            onChange={(event, newDuration) => {
              setState((s) => ({ ...s, duration: newDuration }))
            }}
          >
            <ToggleButton value="weeks">週</ToggleButton>
            <ToggleButton value="months">月</ToggleButton>
            <ToggleButton value="years">年</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <ToggleButtonGroup
          exclusive
          value={view}
          onChange={(event, newView) => {
            setState((s) => ({ ...s, view: newView }))
          }}
        >
          <ToggleButton value="table">
            <Icon icon="codicon:table" />
          </ToggleButton>
          <ToggleButton value="card">
            <Icon icon="system-uicons:card-view" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box component="pre">{JSON.stringify(summaries, null, 2)}</Box>
    </Stack>
  )
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title,
  },
})

export default Vocabulary
