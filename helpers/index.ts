import { groupBy, pick } from 'lodash'
import { PartOfSpeech, SenseRaw } from '../models/Vocabulary'

export const groupPartOfSpeech = (senses: SenseRaw[]): PartOfSpeech[] =>
  Object.values(groupBy(senses, 'partOfSpeech')).map((groupedSenses) => ({
    pronounce: groupedSenses[0].pronounce,
    partOfSpeech: groupedSenses[0].partOfSpeech,
    senses: groupedSenses.map((sense) =>
      pick(sense, ['translated', 'example', 'translatedExample'])
    ),
  }))
