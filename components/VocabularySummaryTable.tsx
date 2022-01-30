import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TableSortLabelProps,
} from '@mui/material'
import { formatRelative } from 'date-fns'
import { FC } from 'react'
import { VocabularyRecordStatistics } from '../models/Vocabulary'

interface Props {
  summaries: VocabularyRecordStatistics[]
  sortDirection: TableSortLabelProps['direction']
  orderBy: keyof VocabularyRecordStatistics
  onOrderChange?: (
    changedOrderBy: keyof VocabularyRecordStatistics,
    changedDirection: TableSortLabelProps['direction']
  ) => void
  selectedVocabularies: string[]
  onSelectedChange?: (changedValue: string[]) => void
}
interface Column {
  label: string
  key: keyof VocabularyRecordStatistics
  renderer?: (
    value: any,
    context: VocabularyRecordStatistics
  ) => JSX.Element | string
}

const columns: Column[] = [
  {
    label: '單字',
    key: 'vocabulary',
    renderer: (vocabulary) => vocabulary.value,
  },
  {
    label: '遺忘',
    key: 'failedTimes',
  },
  {
    label: '查詢時間',
    key: 'lastQueriedAt',
    renderer: (value) => formatRelative(value, new Date()),
  },
]

const VocabularySummaryTable: FC<Props> = ({
  summaries,
  sortDirection,
  orderBy,
  onOrderChange,
  selectedVocabularies,
  onSelectedChange,
}) => {
  const numSelected = selectedVocabularies.length
  const rowCount = summaries.length
  return (
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={numSelected === rowCount && rowCount > 0}
                onChange={(event) => {
                  const { checked } = event.target
                  onSelectedChange &&
                    onSelectedChange(
                      checked
                        ? summaries.map(({ vocabulary: { id } }) => id)
                        : []
                    )
                }}
              />
            </TableCell>
            {columns.map(({ label, key }) => {
              const isActive = orderBy === key
              const defaultDirection = key === 'vocabulary' ? 'asc' : 'desc'
              const direction = isActive ? sortDirection : defaultDirection
              const oppositeDirection = direction === 'asc' ? 'desc' : 'asc'
              return (
                <TableCell key={label}>
                  <TableSortLabel
                    active={isActive}
                    direction={direction}
                    onClick={() => {
                      onOrderChange &&
                        onOrderChange(
                          key,
                          isActive ? oppositeDirection : direction
                        )
                    }}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              )
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {summaries.map((summary) => {
            const vocabularyId = summary.vocabulary.id
            return (
              <TableRow key={vocabularyId}>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={selectedVocabularies.includes(vocabularyId)}
                    onChange={(event) => {
                      const { checked } = event.target
                      onSelectedChange &&
                        onSelectedChange(
                          checked
                            ? [...selectedVocabularies, vocabularyId]
                            : selectedVocabularies.filter(
                                (id) => id !== vocabularyId
                              )
                        )
                    }}
                  />
                </TableCell>
                {columns.map(({ label, key, renderer }) => (
                  <TableCell key={label}>
                    {renderer ? renderer(summary[key], summary) : summary[key]}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default VocabularySummaryTable
