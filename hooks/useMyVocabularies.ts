import { User } from '@firebase/auth'
import {
  addDoc,
  collection,
  doc as firestoreDoc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
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
  VocabularyExamSession,
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
    createExam: (vocabularies: string[]) => Promise<string>
    createExamSession: (examId: string) => Promise<string>
    resetExamSession: (sessionId: string) => Promise<void>
    getExamSessions: () => Promise<VocabularyExamSession[]>
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
        resetExamSession: reject,
        getExamSessions: reject,
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
      getExamSessions: async () => {
        const db = getFirestore()
        const sessionQuery = query(
          collection(db, 'vocabularies-exam-sessions'),
          where('owner', '==', me.uid),
          where('createdAt', '>=', sub(new Date(), { months: 1 })),
          orderBy('createdAt', 'desc')
        )
        const sessionDocs = await getDocs(sessionQuery)
        const uniqueExams = new Set()
        const uniqueVocabularies = new Set()
        const sessions: Omit<VocabularyExamSession, 'failed'>[] = []
        sessionDocs.forEach((sessionDoc) => {
          const data = sessionDoc.data() as { createdAt: Timestamp } & Omit<
            VocabularyExamSession,
            'failed' | 'createdAt'
          >
          if (!uniqueExams.has(data.exam)) {
            sessions.push({
              ...data,
              id: sessionDoc.id,
              createdAt: data.createdAt.toDate(),
            })
            uniqueExams.add(data.exam)
            data.vocabularies.forEach((v: string) => uniqueVocabularies.add(v))
          }
        })
        if (sessions.length === 0) {
          return []
        }
        const recordQuery = query(
          collection(db, 'vocabularies-records'),
          where(
            'examSession',
            'in',
            sessions.map(({ id }) => id)
          ),
          where('type', '==', VocabularyActionType.Fail)
        )
        const recordDocs = await getDocs(recordQuery)
        const recordSummary = new Map()
        recordDocs.forEach((recordDoc) => {
          const { examSession } = recordDoc.data()
          const count = recordSummary.get(examSession)
          recordSummary.set(examSession, count ? count + 1 : 1)
        })
        const vocabularyQuery = query(
          collection(db, 'vocabularies-vocabularies'),
          where(documentId(), 'in', Array.from(uniqueVocabularies.values()))
        )
        const vocabularyDocs = await getDocs(vocabularyQuery)
        const vocabularySummary = new Map()
        vocabularyDocs.forEach((vocabularyDoc) => {
          const { value } = vocabularyDoc.data()
          vocabularySummary.set(vocabularyDoc.id, value)
        })
        return sessions.map(({ id, vocabularies, ...restProps }) => ({
          ...restProps,
          id,
          failed: recordSummary.get(id) || 0,
          vocabularies: vocabularies.map((v) => vocabularySummary.get(v)),
        }))
      },
      createExam: async (vocabularies) => {
        const db = getFirestore()
        const doc = await addDoc(collection(db, 'vocabularies-exams'), {
          vocabularies,
          createdAt: serverTimestamp(),
        })
        return doc.id
      },
      createExamSession: async (examId) => {
        const db = getFirestore()
        const { vocabularies } = (
          await getDoc(firestoreDoc(db, `vocabularies-exams/${examId}`))
        ).data()!
        const doc = await addDoc(collection(db, 'vocabularies-exam-sessions'), {
          exam: examId,
          vocabularies: shuffle(vocabularies),
          owner: me.uid,
          progress: 0,
          createdAt: serverTimestamp(),
        })
        return doc.id
      },
      resetExamSession: async (sessionsId) => {
        await updateDoc(
          firestoreDoc(
            getFirestore(),
            `vocabularies-exam-sessions/${sessionsId}`
          ),
          {
            progress: 0,
            createdAt: serverTimestamp(),
          }
        )
      },
    }
  }, [me])
  return { actions }
}

export default useMyVocabularies
