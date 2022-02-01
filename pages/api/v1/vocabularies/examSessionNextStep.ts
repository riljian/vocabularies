import { NextApiRequest, NextApiResponse } from 'next'
import {
  getDefaultFirestore,
  initializeDefaultApp,
  pushVocabularyRecord,
  withUserId,
} from '../../../../internal/helpers'
import { VocabularyActionType } from '../../../../models/Vocabulary'

initializeDefaultApp()

const db = getDefaultFirestore()

const handler = async (
  req: NextApiRequest & { userId: string },
  res: NextApiResponse
) => {
  const { method, body: data } = req
  if (method !== 'POST') {
    res.status(405).end()
    return
  }
  const { sessionId, passed, vocabularyId } = data
  const sessionDocRef = db.doc(`vocabularies-exam-sessions/${sessionId}`)
  const { owner, vocabularies } = (await sessionDocRef.get()).data()!
  await pushVocabularyRecord(
    db,
    owner,
    vocabularyId,
    passed ? VocabularyActionType.Pass : VocabularyActionType.Fail,
    sessionId
  )
  await sessionDocRef.update({
    progress: vocabularies.indexOf(vocabularyId) + 1,
  })
  res.status(201).end()
}

export default withUserId(handler)
