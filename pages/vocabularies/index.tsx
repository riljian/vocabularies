import { Icon } from '@iconify/react'
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { orderBy as lodashOrderBy } from 'lodash'
import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { ComponentProps, useEffect, useMemo, useState } from 'react'
import VocabularySummaryTable from '../../components/VocabularySummaryTable'
import { bottomNavigationConfigs } from '../../configs/path'
import {
  VocabularyRecordDuration,
  VocabularyRecordStatistics,
} from '../../models/Vocabulary'
import { useAuthContext } from '../../providers/Auth'

interface State
  extends Pick<
    ComponentProps<typeof VocabularySummaryTable>,
    'sortDirection' | 'orderBy' | 'selectedVocabularies'
  > {
  view: 'table' | 'card'
  duration: VocabularyRecordDuration
  summaries: VocabularyRecordStatistics[]
}

const initialState: State = {
  view: 'table',
  duration: 'weeks',
  summaries: [],
  orderBy: 'lastQueriedAt',
  sortDirection: 'desc',
  selectedVocabularies: [],
}
const { title } = bottomNavigationConfigs[0]

const Vocabulary: NextPage = () => {
  const {
    actions: { getRecords },
  } = useAuthContext()
  const [
    { view, duration, summaries, selectedVocabularies, sortDirection, orderBy },
    setState,
  ] = useState<State>(() => initialState)
  const orderedSummaries = useMemo(() => {
    if (orderBy === 'vocabulary') {
      return lodashOrderBy(summaries, ['vocabulary.value'], [sortDirection!])
    }
    return lodashOrderBy(summaries, [orderBy], [sortDirection!])
  }, [summaries, sortDirection, orderBy])

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
      <VocabularySummaryTable
        summaries={orderedSummaries}
        sortDirection={sortDirection}
        orderBy={orderBy}
        onOrderChange={(changedOrderBy, changedDirection) => {
          setState((s) => ({
            ...s,
            orderBy: changedOrderBy,
            sortDirection: changedDirection,
          }))
        }}
        selectedVocabularies={selectedVocabularies}
        onSelectedChange={(changedValue) => {
          setState((s) => ({ ...s, selectedVocabularies: changedValue }))
        }}
      />
    </Stack>
  )
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title,
  },
})

export default Vocabulary
