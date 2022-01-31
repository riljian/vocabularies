import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { head } from 'lodash'
import { nanoid } from 'nanoid'
import { FC, useMemo } from 'react'
import { VocabularyRecordStatistics } from '../models/Vocabulary'

interface Props {
  summaries: VocabularyRecordStatistics[]
}
interface Cell {
  rowSpan?: number
  content: JSX.Element | string
}
interface SenseRow {
  id: string
  cells: Cell[]
}

const transformSummariesToSenseRows = (
  summaries: VocabularyRecordStatistics[]
): SenseRow[] => {
  const result: SenseRow[] = []
  for (const summary of summaries) {
    const { partOfSpeeches, value, id } = summary.vocabulary
    const vocabularyResult: SenseRow[] = []
    for (const partOfSpeechWrapper of partOfSpeeches) {
      const { senses, partOfSpeech } = partOfSpeechWrapper
      for (const sense of senses) {
        const { translated } = sense
        vocabularyResult.unshift({
          id: nanoid(),
          cells: [{ content: translated }],
        })
      }
      vocabularyResult[0].cells.unshift({
        rowSpan: senses.length,
        content: partOfSpeech,
      })
    }
    const firstVocabularyRow = head(vocabularyResult)!
    firstVocabularyRow.cells.unshift({
      rowSpan: vocabularyResult.length,
      content: value,
    })
    result.push(...vocabularyResult)
  }
  return result
}

const VocabularySummaryTable: FC<Props> = ({ summaries }) => {
  const senseRows = useMemo(
    () => transformSummariesToSenseRows(summaries),
    [summaries]
  )
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>單字</TableCell>
            <TableCell>詞性</TableCell>
            <TableCell>翻譯</TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ td: { verticalAlign: 'top' } }}>
          {senseRows.map(({ id, cells }) => {
            return (
              <TableRow key={id}>
                {cells.map(({ content, rowSpan }, index) => (
                  <TableCell rowSpan={rowSpan} key={`${id}-${index}`}>
                    {content}
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
