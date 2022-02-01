export enum PathAuthRequirement {
  Required,
  Prohibited,
}
interface PathConfig {
  authRequirement: PathAuthRequirement
}
export const LOGIN_PATH = '/login'
export const HOME_PATH = '/'
export const VOCABULARY_PATH = '/vocabularies'
export const EXAM_PATH = '/exams'
export const CREATE_EXAM_PATH = '/exams/create'
export const pathConfigs: Map<string, PathConfig> = new Map([
  [LOGIN_PATH, { authRequirement: PathAuthRequirement.Prohibited }],
  [HOME_PATH, { authRequirement: PathAuthRequirement.Required }],
  [VOCABULARY_PATH, { authRequirement: PathAuthRequirement.Required }],
  [EXAM_PATH, { authRequirement: PathAuthRequirement.Required }],
])
export const bottomNavigationConfigs = [
  {
    title: '單字',
    pathname: VOCABULARY_PATH,
    icon: 'tabler:vocabulary',
  },
  {
    title: '測驗',
    pathname: EXAM_PATH,
    icon: 'healthicons:i-exam-qualification-outline',
  },
]
