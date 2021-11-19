import useRequireAuth from 'utils/useRequireAuth'

export default function Home() {
  const isLoggedIn = useRequireAuth()
  if (!isLoggedIn) {
    return null
  }

  return 'Domo store'
}
