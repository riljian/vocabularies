import { NextApiRequest, NextApiResponse } from 'next'
import {
  getDefaultFirestore,
  initializeDefaultApp,
  withUserId,
} from '../../../../internal/helpers'

initializeDefaultApp()
const db = getDefaultFirestore()

const handler = async (
  req: NextApiRequest & { userId: string },
  res: NextApiResponse
) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  const { userId } = req
  const userDocRef = db.doc(`vocabularies-users/${userId}`)
  const userDocSnapshot = await userDocRef.get()
  if (userDocSnapshot.exists) {
    res.status(200).json({
      data: userDocSnapshot.data(),
    })
    return
  }
  const initialUserData = {}
  await userDocRef.set(initialUserData)
  res.status(200).json({ data: initialUserData })
}

export default withUserId(handler)
