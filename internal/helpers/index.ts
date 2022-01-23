import { applicationDefault, getApp, initializeApp } from 'firebase-admin/app'

export const initializeDefaultApp = () => {
  try {
    getApp()
  } catch (e) {
    initializeApp({
      credential: applicationDefault(),
    })
  }
}
