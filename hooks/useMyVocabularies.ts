import { User } from '@firebase/auth'
import {
  collection,
  documentId,
  getDocs,
  getFirestore,
  query,
  QuerySnapshot,
  where,
} from '@firebase/firestore'
import axios from 'axios'
import { sub } from 'date-fns'
import { useMemo } from 'react'
import {
  PartOfSpeech,
  VocabularyActionType,
  VocabularyRecord,
  VocabularyRecordDuration,
  VocabularyRecordStatistics,
} from '../models/Vocabulary'

interface Export {
  actions: {
    query: (
      vocabulary: string
    ) => Promise<{ id: string; partOfSpeeches: PartOfSpeech[] }>
    getRecords: (
      duration: VocabularyRecordDuration
    ) => Promise<VocabularyRecordStatistics[]>
  }
}

const aggregateRecords = (snapshot: QuerySnapshot) => {
  const aggregated = new Map()
  snapshot.forEach((doc) => {
    const {
      vocabulary,
      createdAt: createdAtRaw,
      type,
    } = doc.data() as VocabularyRecord
    const createdAt = createdAtRaw.toDate()
    const prev = aggregated.get(vocabulary)
    if (type === VocabularyActionType.Query) {
      aggregated.set(
        vocabulary,
        prev
          ? {
              ...prev,
              queriedTimes: prev.queriedTimes + 1,
              lastQueriedAt: createdAt,
            }
          : {
              vocabulary: {
                id: vocabulary,
              },
              queriedTimes: 1,
              lastQueriedAt: createdAt,
              failedTimes: 0,
              lastFailedAt: null,
            }
      )
    } else if (type === VocabularyActionType.Fail) {
      aggregated.set(
        vocabulary,
        prev
          ? {
              ...prev,
              failedTimes: prev.failedTimes + 1,
              lastFailedAt: createdAt,
            }
          : {
              vocabulary: {
                id: vocabulary,
              },
              queriedTimes: 0,
              lastQueriedAt: null,
              failedTimes: 1,
              lastFailedAt: createdAt,
            }
      )
    }
  })
  return aggregated
}

const useMyVocabularies = (me: User | null): Export => {
  const actions = useMemo<Export['actions']>(() => {
    if (me === null) {
      const reject = () => Promise.reject('User not logged in')
      return {
        query: reject,
        getRecords: reject,
      }
    }
    return {
      query: async (vocabulary) => {
        const idToken = await me.getIdToken(true)
        const {
          data: { data },
        } = await axios.get('/api/v1/vocabularies/query', {
          params: { vocabulary },
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        return data
      },
      getRecords: async (duration) => {
        const db = getFirestore()
        const recordQuery = query(
          collection(db, 'vocabularies-records'),
          where('user', '==', me.uid),
          where('createdAt', '>=', sub(new Date(), { [duration]: 1 }))
        )
        const aggregated = aggregateRecords(await getDocs(recordQuery))
        const vocabularyQuery = query(
          collection(db, 'vocabularies-vocabularies'),
          where(documentId(), 'in', Array.from(aggregated.keys()))
        )
        const vocabularyDocs = await getDocs(vocabularyQuery)
        vocabularyDocs.forEach((vocabularyDoc) => {
          const id = vocabularyDoc.id
          const aggregatedValue = aggregated.get(id)
          aggregatedValue.vocabulary.value = vocabularyDoc.data().value
          aggregated.set(id, aggregatedValue)
        })
        return Array.from(aggregated.values())
      },
    }
  }, [me])
  return { actions }
}

export default useMyVocabularies
