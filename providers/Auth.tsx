import { getAuth, onAuthStateChanged, User } from '@firebase/auth'
import { useRouter } from 'next/router'
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  HOME_PATH,
  LOGIN_PATH,
  PathAuthRequirement,
  pathConfigs,
} from '../configs/path'

export enum AuthStatus {
  Loading,
  Unsigned,
  Signed,
}
interface State {
  me: null | User
  status: AuthStatus
}
interface Context {
  state: State
  actions: {
    signOut: () => Promise<void>
  }
}

const initialState: State = { me: null, status: AuthStatus.Loading }
const AuthContext = createContext<Context>({
  state: initialState,
  actions: {
    signOut: () => Promise.reject(),
  },
})

const AuthProvider: FC = ({ children }) => {
  const router = useRouter()
  const [state, setState] = useState<State>(() => initialState)
  const authRef = useRef(getAuth())
  const { status: authStatus } = state
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
    onAuthStateChanged(authRef.current, (user) => {
      setState((s) => ({
        ...s,
        me: user,
        status: user ? AuthStatus.Signed : AuthStatus.Unsigned,
      }))
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
          signOut: async () => {
            await authRef.current.signOut()
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
