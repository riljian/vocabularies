import { Icon } from '@iconify/react'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  FabProps,
  IconButton,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import axios from 'axios'
import { Field, Form, Formik } from 'formik'
import { FC, useState } from 'react'
import * as yup from 'yup'
import Vocabulary from '../models/Vocabulary'
import VocabularySearchResult from './VocabularySearchResult'

interface Props {
  triggerSx?: FabProps['sx']
}

const validationSchema = yup.object({
  vocabulary: yup.string().default('').required(),
})

interface State {
  open: boolean
  result: Vocabulary | null
  initialValues: yup.InferType<typeof validationSchema>
}

const vocabularySearchDialogTitleId = 'vocabulary-search-dialog-title'
const VocabularySearch: FC<Props> = ({ triggerSx }) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [{ open, result, initialValues }, setState] = useState<State>(() => ({
    open: false,
    result: null,
    initialValues: validationSchema.getDefault(),
  }))
  return (
    <>
      <Fab
        color="primary"
        sx={triggerSx}
        onClick={() => {
          setState((s) => ({ ...s, open: true }))
        }}
      >
        <Icon icon="bx:bx-search-alt" />
      </Fab>
      <Dialog
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        open={open}
        onClose={() => {
          setState((s) => ({ ...s, open: false }))
        }}
        aria-labelledby={vocabularySearchDialogTitleId}
      >
        <Formik
          enableReinitialize
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={(values) => {
            const { vocabulary } = values
            setState((s) => ({ ...s, result: null }))
            return axios
              .get('/api/v1/vocabularies/query', {
                params: {
                  vocabulary,
                },
              })
              .then(({ data: { data } }) => {
                setState((s) => ({
                  ...s,
                  initialValues: values,
                  result: Vocabulary.loadFromQuery(data),
                }))
              })
              .catch((error) => {
                console.error(error)
              })
          }}
        >
          {({ isValid, isSubmitting, dirty }) => (
            <>
              <DialogTitle id={vocabularySearchDialogTitleId}>
                <Box component={Form} sx={{ display: 'flex', columnGap: 1 }}>
                  <Field
                    name="vocabulary"
                    as={TextField}
                    variant="standard"
                    label="Search"
                    autoFocus
                    sx={{
                      flex: '1 0 auto',
                    }}
                  />
                  <IconButton
                    type="submit"
                    disabled={!dirty || !isValid || isSubmitting}
                    color="primary"
                  >
                    <Icon icon="carbon:send-filled" />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                {isSubmitting ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  result && <VocabularySearchResult vocabulary={result} />
                )}
              </DialogContent>
            </>
          )}
        </Formik>
      </Dialog>
    </>
  )
}

export default VocabularySearch
