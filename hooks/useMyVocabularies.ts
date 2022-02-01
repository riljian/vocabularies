import { User } from '@firebase/auth'
import {
  addDoc,
  collection,
  doc as firestoreDoc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  query,
  QuerySnapshot,
  serverTimestamp,
  where,
} from '@firebase/firestore'
import axios from 'axios'
import { sub } from 'date-fns'
import { shuffle } from 'lodash'
import { useMemo } from 'react'
import { groupPartOfSpeech } from '../helpers'
import {
  PartOfSpeech,
  VocabularyActionType,
  VocabularyRecord,
  VocabularyRecordDuration,
  VocabularyRecordStatistics,
} from '../models/Vocabulary'

export enum ExamSessionMode {
  Practice,
  Exam,
}
interface Export {
  actions: {
    query: (
      vocabulary: string
    ) => Promise<{ id: string; partOfSpeeches: PartOfSpeech[] }>
    getRecords: (
      duration: VocabularyRecordDuration
    ) => Promise<VocabularyRecordStatistics[]>
    createExam: (vocabularies: string[]) => Promise<string>
    createExamSession: (
      examId: string,
      mode: ExamSessionMode
    ) => Promise<string>
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
        createExam: reject,
        createExamSession: reject,
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
        if (aggregated.size === 0) {
          return []
        }
        const vocabularyQuery = query(
          collection(db, 'vocabularies-vocabularies'),
          where(documentId(), 'in', Array.from(aggregated.keys()))
        )
        const vocabularyDocs = await getDocs(vocabularyQuery)
        vocabularyDocs.forEach((vocabularyDoc) => {
          const id = vocabularyDoc.id
          const aggregatedValue = aggregated.get(id)
          const { value, senses } = vocabularyDoc.data()
          aggregatedValue.vocabulary = {
            value,
            partOfSpeeches: groupPartOfSpeech(senses),
            id: aggregatedValue.vocabulary.id,
          }
          aggregated.set(id, aggregatedValue)
        })
        return Array.from(aggregated.values())
      },
      createExam: async (vocabularies) => {
        const db = getFirestore()
        const doc = await addDoc(collection(db, 'vocabularies-exams'), {
          vocabularies,
          createdAt: serverTimestamp(),
        })
        return doc.id
      },
      createExamSession: async (examId, examSessionMode) => {
        const db = getFirestore()
        const { vocabularies } = (
          await getDoc(firestoreDoc(db, `vocabularies-exams/${examId}`))
        ).data()!
        const doc = await addDoc(collection(db, 'vocabularies-exam-sessions'), {
          exam: examId,
          vocabularies: shuffle(vocabularies),
          mode: examSessionMode,
          owner: me.uid,
          progress: 0,
          createdAt: serverTimestamp(),
        })
        return doc.id
      },
    }
  }, [me])
  return { actions }
}

export default useMyVocabularies
