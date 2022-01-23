import { getAuth, GoogleAuthProvider } from '@firebase/auth'
import { useEffect, useRef } from 'react'

const FirebaseUI = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('firebaseui').then(({ auth: { AuthUI } }) => {
      const authUI = AuthUI.getInstance() || new AuthUI(getAuth())
      authUI.start(containerRef.current!, {
        signInOptions: [GoogleAuthProvider.PROVIDER_ID],
      })
    })
  }, [])

  return <div ref={containerRef} />
}

export default FirebaseUI
