import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'

import { sessionContext } from 'pages/_app'

export default function useRequireAuth() {
  const session = useContext(sessionContext)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = Boolean(session)
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [router, session])

  return Boolean(session)
}
