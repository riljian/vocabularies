import { getAuth, onAuthStateChanged, User } from '@firebase/auth'
import { doc, getDoc, getFirestore } from '@firebase/firestore'
import axios from 'axios'
import { useRouter } from 'next/router'
import { createContext, FC, useContext, useEffect, useState } from 'react'
import {
  HOME_PATH,
  LOGIN_PATH,
  PathAuthRequirement,
  pathConfigs,
} from '../configs/path'
import useMyVocabularies from '../hooks/useMyVocabularies'

export enum AuthStatus {
  Loading,
  Unsigned,
  Signed,
}
interface State {
  me: null | User
  status: AuthStatus
  meta: any
}
interface Context {
  state: State
  actions: {
    signOut: () => Promise<void>
  } & ReturnType<typeof useMyVocabularies>['actions']
}

const initialState: State = { me: null, status: AuthStatus.Loading, meta: null }
const AuthContext = createContext<Context>({
  state: initialState,
  actions: {
    signOut: () => Promise.reject(),
    query: () => Promise.reject(),
    getRecords: () => Promise.reject(),
    createExam: () => Promise.reject(),
    createExamSession: () => Promise.reject(),
  },
})

const AuthProvider: FC = ({ children }) => {
  const router = useRouter()
  const [state, setState] = useState<State>(() => initialState)
  const { status: authStatus, me } = state
  const { actions: vocabularyActions } = useMyVocabularies(me)
  const { authRequirement } = pathConfigs.get(router.pathname) || {
    authRequirement: PathAuthRequirement.Required,
  }
  const shouldGoToLogin =
    authRequirement === PathAuthRequirement.Required &&
    authStatus === AuthStatus.Unsigned
  const shouldGoToPrevState =
    authRequirement === PathAuthRequirement.Prohibited &&
    authStatus === AuthStatus.Signed

  useEffect(() => {
    const auth = getAuth()
    const getUserMeta = async (user: User) => {
      const userDocSnapshot = await getDoc(
        doc(getFirestore(), `vocabularies-users/${user.uid}`)
      )
      if (userDocSnapshot.exists()) {
        return userDocSnapshot.data()
      } else {
        const idToken = await user.getIdToken(true)
        const {
          data: { data: userMeta },
        } = await axios.post('/api/v1/users/signUp', undefined, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        return userMeta
      }
    }
    return onAuthStateChanged(auth, (user) => {
      if (user === null) {
        setState((s) => ({
          ...s,
          me: null,
          meta: null,
          status: AuthStatus.Unsigned,
        }))
      } else {
        getUserMeta(user)
          .then((meta) => {
            setState((s) => ({
              ...s,
              meta,
              me: user,
              status: user ? AuthStatus.Signed : AuthStatus.Unsigned,
            }))
          })
          .catch((error) => {
            console.error(error)
          })
      }
    })
  }, [])
  useEffect(() => {
    const { push, query, pathname } = router
    const redirect = async () => {
      if (shouldGoToLogin) {
        await push({
          pathname: LOGIN_PATH,
          query: {
            state: btoa(JSON.stringify({ pathname, query })),
          },
        })
      } else if (shouldGoToPrevState) {
        if (query.state) {
          await push(JSON.parse(atob(query.state as string)))
        } else {
          await push(HOME_PATH)
        }
      }
    }
    redirect().catch((error) => {
      console.error(error)
    })
  }, [shouldGoToLogin, shouldGoToPrevState, router])

  if (authStatus === AuthStatus.Loading) {
    return <div>Loading...</div>
  } else if (shouldGoToLogin || shouldGoToPrevState) {
    return <div>Redirecting...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        actions: {
          ...vocabularyActions,
          signOut: async () => {
            await getAuth().signOut()
            window.location.pathname = LOGIN_PATH
          },
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
export default AuthProvider
