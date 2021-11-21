import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'

import { sessionContext } from 'pages/_app'

/**
 * @typedef ReturnValue
 * @property {boolean} isLoggedIn
 * @property {import('@supabase/supabase-js').Session?} session
 *
 * @returns {ReturnValue}
 */
export function useRequireAuth() {
  const { session } = useContext(sessionContext)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = Boolean(session)
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [router, session])

  return {
    isLoggedIn: Boolean(session),
    session,
  }
}

/**
 * @returns {boolean?}
 */
export function useIsAdmin() {
  const { isAdmin } = useContext(sessionContext)
  return isAdmin
}
