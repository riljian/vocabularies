export enum PathAuthRequirement {
  Required,
  Prohibited,
}
interface PathConfig {
  authRequirement: PathAuthRequirement
}
export const LOGIN_PATH = '/login'
export const HOME_PATH = '/'
export const pathConfigs: Map<string, PathConfig> = new Map([
  [LOGIN_PATH, { authRequirement: PathAuthRequirement.Prohibited }],
  [HOME_PATH, { authRequirement: PathAuthRequirement.Required }],
])
