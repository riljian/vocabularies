import { User } from '@firebase/auth'
import axios from 'axios'
import { useMemo } from 'react'
import { PartOfSpeech } from '../models/Vocabulary'

interface Export {
  actions: {
    query: (
      vocabulary: string
    ) => Promise<{ id: string; partOfSpeeches: PartOfSpeech[] }>
  }
}

const useMyVocabularies = (me: User | null): Export => {
  const actions = useMemo<Export['actions']>(() => {
    if (me === null) {
      return {
        query: () => Promise.reject('User not logged in'),
      }
    }
    return {
      query: async (vocabulary) => {
        const idToken = await me.getIdToken()
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
    }
  }, [me])
  return { actions }
}

export default useMyVocabularies
