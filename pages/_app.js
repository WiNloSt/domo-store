import React, { useEffect, useState } from 'react'
import Head from 'next/head'

import { supabase } from 'utils/supabaseClient'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Domo store</title>
        <meta name="description" content="Domo store stock management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SupabaseAuthRedirection />
      <Component {...pageProps} />
    </>
  )
}

function SupabaseAuthRedirection() {
  const [session, setSession] = useState(
    /** @type {import('@supabase/gotrue-js').Session?} */ (null)
  )

  useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return null
}
