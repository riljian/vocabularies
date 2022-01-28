import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { FC } from 'react'
import Vocabulary from '../models/Vocabulary'
import Audio from './Audio'

interface Props {
  vocabulary: Vocabulary
}

const VocabularySearchResult: FC<Props> = ({ vocabulary }) => {
  const { partOfSpeeches } = vocabulary
  return (
    <Stack spacing={2}>
      {partOfSpeeches!.map(({ partOfSpeech, senses, pronounce }) => {
        return (
          <Card key={partOfSpeech}>
            <CardHeader
              title={partOfSpeech}
              action={<Audio src={pronounce} />}
            />
            <CardContent>
              <List>
                {senses.map(({ translated, example, translatedExample }) => (
                  <ListItem key={translated} disableGutters disablePadding>
                    <ListItemText
                      primary={translated}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {example}
                          </Typography>
                          {` - ${translatedExample}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )
      })}
    </Stack>
  )
}

export default VocabularySearchResult
