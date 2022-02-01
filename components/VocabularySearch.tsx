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
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Field, Form, Formik } from 'formik'
import { FC, useState } from 'react'
import * as yup from 'yup'
import Vocabulary from '../models/Vocabulary'
import { useAuthContext } from '../providers/Auth'
import VocabularySearchResult from './VocabularySearchResult'

interface Props {
  triggerSx?: FabProps['sx']
}

const validationSchema = yup.object({
  vocabulary: yup.string().default('').required(),
})
const initialState: State = {
  open: false,
  result: null,
  initialValues: validationSchema.getDefault(),
}

interface State {
  open: boolean
  result: Vocabulary | null
  initialValues: yup.InferType<typeof validationSchema>
}

const vocabularySearchDialogTitleId = 'vocabulary-search-dialog-title'
const VocabularySearch: FC<Props> = ({ triggerSx }) => {
  const theme = useTheme()
  const {
    actions: { query },
  } = useAuthContext()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [{ open, result, initialValues }, setState] = useState<State>(
    () => initialState
  )
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
        onTransitionEnd={() => {
          if (!open) {
            setState(initialState)
          }
        }}
        aria-labelledby={vocabularySearchDialogTitleId}
      >
        <Formik
          enableReinitialize
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={(values) => {
            setState((s) => ({ ...s, result: null }))
            return query(values.vocabulary)
              .then((data) => {
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
                    autoCapitalize="false"
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
                ) : result ? (
                  <VocabularySearchResult vocabulary={result} />
                ) : (
                  <Typography>無搜尋結果</Typography>
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
