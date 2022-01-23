import { getAuth, onAuthStateChanged, User } from '@firebase/auth'
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

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
  const [state, setState] = useState<State>(() => initialState)
  const authRef = useRef(getAuth())

  useEffect(() => {
    onAuthStateChanged(authRef.current, (user) => {
      setState((s) => ({
        ...s,
        me: user,
        status: user ? AuthStatus.Signed : AuthStatus.Unsigned,
      }))
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        state,
        actions: {
          signOut: () => authRef.current.signOut(),
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
export default AuthProvider
