import { applicationDefault, getApp, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { Firestore, getFirestore } from 'firebase-admin/firestore'
import { NextApiRequest, NextApiResponse } from 'next'
import { VocabularyActionType } from '../../models/Vocabulary'

const AUTHORIZATION_HEADER_PATTERN = /^Bearer (?<idToken>.*)$/

export const initializeDefaultApp = () => {
  try {
    getApp()
  } catch (e) {
    initializeApp({
      credential: applicationDefault(),
    })
  }
}
export const getDefaultFirestore = () => {
  const db = getFirestore()
  // TODO: check if db has been initialized
  try {
    db.settings({ ignoreUndefinedProperties: true })
  } catch (e) {
    console.error(e)
  }
  return db
}
export const pushVocabularyRecord = (
  db: Firestore,
  userId: string,
  vocabularyId: string,
  actionType: VocabularyActionType
) =>
  db.collection('vocabularies-records').add({
    user: userId,
    vocabulary: vocabularyId,
    type: actionType,
  })

export const withUserId =
  (
    handler: (
      req: NextApiRequest & { userId: string },
      res: NextApiResponse
    ) => void | Promise<void>
  ) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const authorization = req.headers['authorization']

    if (authorization === undefined) {
      res.status(401).json({
        error: {
          message: 'Unauthorized',
        },
      })
      return
    }

    try {
      const matched = AUTHORIZATION_HEADER_PATTERN.exec(authorization)
      const { idToken } = matched!.groups!
      const { uid } = await getAuth().verifyIdToken(idToken)
      return handler(Object.assign(req, { userId: uid }), res)
    } catch (error) {
      res.status(403).json({
        error: {
          message: 'Forbidden',
          detail: error,
        },
      })
      return
    }
  }
