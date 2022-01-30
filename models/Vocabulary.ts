import { Timestamp } from '@firebase/firestore'

interface Sense {
  translated: string
  example: string
  translatedExample: string
}
export interface PartOfSpeech {
  partOfSpeech: string
  pronounce: string
  senses: Sense[]
}
export enum VocabularyActionType {
  Query,
  Fail,
  Pass,
}
export interface VocabularyRecord {
  user: string
  vocabulary: string
  createdAt: Timestamp
  type: VocabularyActionType
}
export interface VocabularyRecordStatistics {
  vocabulary: {
    id: string
    value: string
  }
  queriedTimes: number
  failedTimes: number
  lastQueriedAt: Date | null
  lastFailedAt: Date | null
}
export type VocabularyRecordDuration = 'weeks' | 'months' | 'years'

export default class Vocabulary {
  id: string
  partOfSpeeches?: PartOfSpeech[]

  constructor(id: string) {
    this.id = id
  }

  static loadFromQuery = (data: {
    id: string
    partOfSpeeches: PartOfSpeech[]
  }) => {
    const { id, partOfSpeeches } = data
    const vocabulary = new Vocabulary(id)
    vocabulary.partOfSpeeches = partOfSpeeches
    return vocabulary
  }
}
