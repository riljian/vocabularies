import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Switch,
} from '@mui/material'
import { FC, useEffect, useRef, useState } from 'react'
import Slide, { Settings } from 'react-slick'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import useExamSession from '../hooks/useExamSession'
import Audio from './Audio'

interface Props {
  interactive?: boolean
  slideIndex: number
  vocabularies: ReturnType<typeof useExamSession>['state']['vocabularies']
  onForgotClick?: (vocabularyId: string) => void
  onRememberedClick?: (vocabularyId: string) => void
}

const settings: Settings = {
  dots: false,
  draggable: false,
  swipe: false,
  infinite: false,
  autoplay: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
}
const VocabularyExamCarousel: FC<Props> = ({
  interactive = true,
  vocabularies,
  onForgotClick,
  onRememberedClick,
  slideIndex,
}) => {
  const [{ collapsed }, setState] = useState(() => ({ collapsed: true }))
  const slideRef = useRef<Slide>(null)

  useEffect(() => {
    setState((s) => ({ ...s, collapsed: true }))
    if (slideRef.current && slideIndex > 0) {
      slideRef.current.slickGoTo(slideIndex)
    }
  }, [slideIndex])

  if (!interactive) {
    return (
      <Slide {...settings} ref={slideRef}>
        {vocabularies.map(({ id, value }) => (
          <Box key={id} sx={{ p: 2 }}>
            <Card>
              <CardHeader title={value} />
            </Card>
          </Box>
        ))}
      </Slide>
    )
  }

  return (
    <Slide {...settings} ref={slideRef}>
      {vocabularies.map(({ id, value, partOfSpeeches }) => (
        <Box key={id} sx={{ p: 2 }}>
          <Card>
            <CardHeader title={value} />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={collapsed}
                    onChange={(event) => {
                      setState((s) => ({
                        ...s,
                        collapsed: event.target.checked,
                      }))
                    }}
                  />
                }
                label="隱藏答案"
              />
              <Collapse in={!collapsed}>
                <List
                  sx={{
                    '& ul': { padding: 0 },
                    maxHeight: '50vh',
                    overflow: 'auto',
                  }}
                  subheader={<li />}
                >
                  {partOfSpeeches!.map(
                    ({ partOfSpeech, senses, pronounce }) => (
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
                    )
                  )}
                </List>
              </Collapse>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  onForgotClick && onForgotClick(id)
                }}
              >
                忘記了
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  onRememberedClick && onRememberedClick(id)
                }}
              >
                還記得
              </Button>
            </CardActions>
          </Card>
        </Box>
      ))}
    </Slide>
  )
}

export default VocabularyExamCarousel
