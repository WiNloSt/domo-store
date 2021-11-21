import React, { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import 'twind/shim'
import { supabase } from 'utils/supabaseClient'

import { LinkButton } from 'components/LinkButton'
import './_app.style.css'
import { useIsAdmin } from 'utils/authHooks'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Domo store</title>
        <meta name="description" content="Domo store stock management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SupabaseAuthRedirection>
        <div className="min-h-full flex flex-col">
          <Nav />
          <div className="flex-1 h-0 mx-4">
            <Component {...pageProps} />
          </div>
        </div>
      </SupabaseAuthRedirection>
    </>
  )
}

export const sessionContext = React.createContext(
  /** @type {{session: import('@supabase/gotrue-js').Session?, isAdmin: boolean?}} */ ({
    session: null,
    isAdmin: null,
  })
)

function SupabaseAuthRedirection({ children }) {
  const [session, setSession] = useState(
    /** @type {import('@supabase/gotrue-js').Session?} */ (supabase.auth.session())
  )
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (session) {
      supabase
        .from('users_roles')
        .select('role')
        .match({ user: session?.user?.id })
        .single()
        .then(({ data }) => {
          if (data) {
            setUserRole(data.role)
          }
        })
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      if (data) {
        data.unsubscribe()
      }
    }
  }, [session])

  const contextValue = useMemo(() => {
    return {
      session,
      isAdmin: userRole && userRole === 'admin',
    }
  }, [session, userRole])

  return <sessionContext.Provider value={contextValue}>{children}</sessionContext.Provider>
}

function Nav() {
  const isLoggedIn = Boolean(supabase.auth.session())
  const isAdmin = useIsAdmin()

  function handleSignOut() {
    supabase.auth.signOut()
  }

  return (
    <nav>
      <ul className="list-none flex space-x-4 py-4 px-4 sm:px-20 bg-gray-500 text-white">
        <Link href="/">
          <a className="hover:underline">Products</a>
        </Link>
        {isAdmin && (
          <Link href="/audit-logs">
            <a className="hover:underline">Audit logs</a>
          </Link>
        )}
        {isLoggedIn ? (
          <li className="!ml-auto">
            <LinkButton onClick={handleSignOut}>Sign out</LinkButton>
          </li>
        ) : (
          <li className="!ml-auto">
            <Link href="/login">
              <a className="hover:underline">Sign in</a>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
