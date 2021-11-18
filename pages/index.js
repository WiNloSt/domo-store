import { supabase } from 'utils/supabaseClient'

export default function Home() {
  const isLoggedIn = Boolean(supabase.auth.session())
  if (!isLoggedIn) {
    return null
  }

  return 'Domo store'
}
