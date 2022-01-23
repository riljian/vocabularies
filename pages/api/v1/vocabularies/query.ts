import axios from 'axios'
import { getFirestore } from 'firebase-admin/firestore'
import { groupBy, pick } from 'lodash'
import { NextApiHandler } from 'next'
import { parse } from 'node-html-parser'
import { CAMBRIDGE_DICTIONARY_ORIGIN } from '../../../../internal/configs'
import { initializeDefaultApp } from '../../../../internal/helpers'

initializeDefaultApp()

const db = getFirestore()
db.settings({ ignoreUndefinedProperties: true })

interface SenseRaw {
  pronounce: string
  partOfSpeech: string
  translated: string
  example: string
  translatedExample: string
}
interface SenseResponse {
  translated: string
  example: string
  translatedExample: string
}
interface VocabularyResponse {
  [index: number]: {
    partOfSpeech: string
    pronounce: string
    senses: SenseResponse[]
  }
}

const groupPartOfSpeech = (senses: SenseRaw[]): VocabularyResponse =>
  Object.values(groupBy(senses, 'partOfSpeech')).map((groupedSenses) => ({
    pronounce: groupedSenses[0].pronounce,
    partOfSpeech: groupedSenses[0].partOfSpeech,
    senses: groupedSenses.map((sense) =>
      pick(sense, ['translated', 'example', 'translatedExample'])
    ),
  }))

const handler: NextApiHandler = async (req, res) => {
  const {
    query: { vocabulary },
  } = req

  const vocabularyQuerySnapshot = await db
    .collection('vocabularies-vocabularies')
    .where('value', '==', vocabulary)
    .get()

  if (!vocabularyQuerySnapshot.empty) {
    console.log('Cache hit of vocabulary', vocabulary)
    res.status(200).json({
      data: groupPartOfSpeech(vocabularyQuerySnapshot.docs[0].data().senses),
    })
    return
  }

  const { data, status } = await axios.get(
    `${CAMBRIDGE_DICTIONARY_ORIGIN}/dictionary/english-chinese-traditional/${vocabulary}`
  )

  if (status === 302) {
    res.status(404).json({
      error: {
        message: `Vocabulary not found: ${vocabulary}`,
      },
    })
    return
  }

  const document = parse(data)
  const partOfSpeechWrappers = document.querySelectorAll('.entry-body__el')
  const senseWrappers = partOfSpeechWrappers
    .map((wrapper) =>
      wrapper.querySelectorAll('[data-wl-senseid]').map((ele) => {
        const pronounceFilePath = wrapper.querySelector(
          '.us.dpron-i source[type="audio/mpeg"]'
        )?.attributes.src
        return {
          pronounce: `${CAMBRIDGE_DICTIONARY_ORIGIN}${pronounceFilePath}`,
          partOfSpeech: wrapper.querySelector('.posgram')?.innerText,
          wrapper: ele,
        }
      })
    )
    .flat()
  const senses = senseWrappers.map(({ partOfSpeech, pronounce, wrapper }) => ({
    pronounce,
    partOfSpeech,
    translated: wrapper.querySelector('.def-body > .trans')?.innerText,
    example: wrapper.querySelector('.examp > .deg')?.innerText,
    translatedExample: wrapper.querySelector('.examp > .trans')?.innerText,
  }))
  await db.collection('vocabularies-vocabularies').add({
    senses,
    value: vocabulary,
  })
  console.log('Cache set of vocabulary', vocabulary)
  res.status(200).json({
    data: groupPartOfSpeech(senses as SenseRaw[]),
  })
}

export default handler
