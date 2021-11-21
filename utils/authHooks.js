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

export function useRequireAdmin() {
  const isAdmin = useIsAdmin()
  const router = useRouter()

  useEffect(() => {
    // isAdmin can be null while the API is loading.
    if (isAdmin === false) {
      router.push('/')
    }
  }, [isAdmin, router])
}

/**
 * @returns {boolean?}
 */
export function useIsAdmin() {
  const { isAdmin } = useContext(sessionContext)
  return isAdmin
}
