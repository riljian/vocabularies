import { User } from '@firebase/auth'
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
} from '@firebase/firestore'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { groupPartOfSpeech } from '../helpers'
import Vocabulary from '../models/Vocabulary'

type VocabularyWithValue = Vocabulary & { value: string }
interface State {
  vocabularies: VocabularyWithValue[]
  progress: number
  owner: string | null
}
interface Export {
  state: State
  actions: {
    goToNext: (vocabularyId: string, passed: boolean) => Promise<void>
  }
}

const useExamSession = (me: User, sessionId: string): Export => {
  const [state, setState] = useState<State>(() => ({
    vocabularies: [],
    progress: 0,
    owner: null,
  }))
  const goToNext = useCallback<Export['actions']['goToNext']>(
    async (vocabularyId, passed) => {
      const idToken = await me.getIdToken(true)
      await axios.post(
        '/api/v1/vocabularies/examSessionNextStep',
        {
          sessionId,
          vocabularyId,
          passed,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      )
    },
    [sessionId, me]
  )

  useEffect(() => {
    const loadSession = async (id: string) => {
      const db = getFirestore()
      const { vocabularies: vocabularyIds, owner } = (
        await getDoc(doc(db, `vocabularies-exam-sessions/${id}`))
      ).data()!
      const vocabularyDocs = await getDocs(
        query(
          collection(db, 'vocabularies-vocabularies'),
          where(documentId(), 'in', vocabularyIds)
        )
      )
      const vocabularyMap: Map<string, VocabularyWithValue> = new Map()
      vocabularyDocs.forEach((vocabularyDoc) => {
        const { value, senses } = vocabularyDoc.data()
        vocabularyMap.set(vocabularyDoc.id, {
          value,
          id: vocabularyDoc.id,
          partOfSpeeches: groupPartOfSpeech(senses),
        })
      })
      setState((s) => ({
        ...s,
        vocabularies: vocabularyIds.map((id: string) => vocabularyMap.get(id)),
        owner,
      }))
    }
    loadSession(sessionId).catch((error) => {
      console.error(error)
    })
  }, [sessionId])

  useEffect(
    () =>
      onSnapshot(
        doc(getFirestore(), `vocabularies-exam-sessions/${sessionId}`),
        (doc) => {
          const { progress } = doc.data()!
          setState((s) => ({ ...s, progress }))
        }
      ),
    [sessionId]
  )

  return {
    state,
    actions: {
      goToNext,
    },
  }
}

export default useExamSession
