import { Icon } from '@iconify/react'
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
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

type SortDirection = 'asc' | 'desc'
interface State
  extends Pick<
    ComponentProps<typeof VocabularySummaryTable>,
    'selectedVocabularies'
  > {
  view: 'table' | 'card'
  duration: VocabularyRecordDuration
  summaries: VocabularyRecordStatistics[]
  sortDirection: SortDirection
  orderBy: keyof VocabularyRecordStatistics
}

const initialState: State = {
  view: 'table',
  duration: 'weeks',
  summaries: [],
  orderBy: 'lastQueriedAt',
  sortDirection: 'desc',
  selectedVocabularies: [],
}
const sortDirectionOptions: { label: string; value: SortDirection }[] = [
  { label: '遞增', value: 'asc' },
  { label: '遞減', value: 'desc' },
]
const durationOptions: { label: string; value: VocabularyRecordDuration }[] = [
  { label: '週', value: 'weeks' },
  { label: '月', value: 'months' },
  { label: '年', value: 'years' },
]
const orderByOptions: {
  label: string
  value: keyof VocabularyRecordStatistics
}[] = [
  { label: '單字', value: 'vocabulary' },
  { label: '查詢次數', value: 'queriedTimes' },
  { label: '最後查詢時間', value: 'lastQueriedAt' },
  { label: '遺忘次數', value: 'failedTimes' },
  { label: '最後遺忘時間', value: 'lastFailedAt' },
]
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
        }}
      >
        <Box>
          <span>最近 1</span>
          <ToggleButtonGroup
            sx={{ ml: 1 }}
            size="small"
            exclusive
            value={duration}
            onChange={(event, newDuration) => {
              if (newDuration !== null) {
                setState((s) => ({ ...s, duration: newDuration }))
              }
            }}
          >
            {durationOptions.map(({ label, value }) => (
              <ToggleButton key={label} value={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <ToggleButtonGroup
          exclusive
          size="small"
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
      <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 1, mt: 1 }}>
        <span>依</span>
        <FormControl size="small">
          <Select
            value={orderBy}
            onChange={(event) => {
              setState((s) => ({
                ...s,
                orderBy: event.target.value as keyof VocabularyRecordStatistics,
              }))
            }}
          >
            {orderByOptions.map(({ value, label }) => (
              <MenuItem key={label} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={sortDirection}
          onChange={(event, newDirection) => {
            if (newDirection !== null) {
              setState((s) => ({ ...s, sortDirection: newDirection }))
            }
          }}
        >
          {sortDirectionOptions.map(({ value, label }) => (
            <ToggleButton key={label} value={value}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <span>排序</span>
      </Box>
      <VocabularySummaryTable
        summaries={orderedSummaries}
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
