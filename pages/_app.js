import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import 'twind/shim'
import { supabase } from 'utils/supabaseClient'

import { LinkButton } from 'components/LinkButton'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Domo store</title>
        <meta name="description" content="Domo store stock management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SupabaseAuthRedirection>
        <Nav />
        <Component {...pageProps} />
      </SupabaseAuthRedirection>
    </>
  )
}

export const sessionContext = React.createContext(
  /** @type {import('@supabase/gotrue-js').Session?} */ (null)
)

function SupabaseAuthRedirection({ children }) {
  const [session, setSession] = useState(
    /** @type {import('@supabase/gotrue-js').Session?} */ (supabase.auth.session())
  )

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return <sessionContext.Provider value={session}>{children}</sessionContext.Provider>
}

function Nav() {
  const isLoggedIn = Boolean(supabase.auth.session())

  function handleSignOut() {
    supabase.auth.signOut()
  }

  return (
    <nav>
      <ul className="list-none flex space-x-4 py-4 px-20 bg-gray-500 text-white">
        {isLoggedIn ? (
          <li className="ml-auto">
            <LinkButton onClick={handleSignOut}>Sign out</LinkButton>
          </li>
        ) : (
          <li className="ml-auto">
            <Link href="/login">
              <a className="hover:underline">Sign in</a>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
