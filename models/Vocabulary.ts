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
