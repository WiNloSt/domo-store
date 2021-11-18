import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import 'twind/shim'

import { supabase } from 'utils/supabaseClient'
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Domo store</title>
        <meta name="description" content="Domo store stock management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SupabaseAuthRedirection />
      <Nav />
      <Component {...pageProps} />
    </>
  )
}

function SupabaseAuthRedirection() {
  const [session, setSession] = useState(
    /** @type {import('@supabase/gotrue-js').Session?} */ (supabase.auth.session())
  )

  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = Boolean(session)
    if (!isLoggedIn && router.pathname != '/login') {
      router.push('/login')
    }
  }, [router, session])

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return null
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
            <Link href="/login">Sign in</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

/**
 * @param {object} props
 * @param {any} props.children
 * @param {function} [props.onClick]
 */
function LinkButton({ children, onClick }) {
  function handleClick(e) {
    e.preventDefault()
    onClick?.()
  }
  return (
    <a href="#" onClick={handleClick}>
      {children}
    </a>
  )
}
