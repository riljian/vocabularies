import {
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
} from '@mui/material'
import { formatRelative } from 'date-fns'
import { FC } from 'react'
import Slide, { Settings } from 'react-slick'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import { VocabularyRecordStatistics } from '../models/Vocabulary'
import Audio from './Audio'

interface Props {
  summaries: VocabularyRecordStatistics[]
}

const RedundantArrow = () => null
const settings: Settings = {
  dots: false,
  infinite: true,
  autoplay: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  nextArrow: <RedundantArrow />,
  prevArrow: <RedundantArrow />,
}
const VocabularySummaryCarousel: FC<Props> = ({ summaries }) => {
  return (
    <Slide {...settings}>
      {summaries.map(
        ({ vocabulary: { id, value, partOfSpeeches }, lastQueriedAt }) => (
          <Box key={id} sx={{ p: 2 }}>
            <Card>
              <CardHeader
                title={value}
                subheader={`最後查詢時間: ${formatRelative(
                  lastQueriedAt!,
                  new Date()
                )}`}
              />
              <CardContent>
                <List
                  sx={{
                    '& ul': { padding: 0 },
                    maxHeight: '50vh',
                    overflow: 'auto',
                  }}
                  subheader={<li />}
                >
                  {partOfSpeeches.map(({ partOfSpeech, senses, pronounce }) => (
                    <li key={partOfSpeech}>
                      <ul>
                        <ListSubheader>
                          {partOfSpeech}
                          <Audio src={pronounce} />
                        </ListSubheader>
                        {senses.map(
                          (
                            { translated, example, translatedExample },
                            index
                          ) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={translated}
                                secondary={`${example} - ${translatedExample}`}
                              />
                            </ListItem>
                          )
                        )}
                      </ul>
                    </li>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        )
      )}
    </Slide>
  )
}

export default VocabularySummaryCarousel
