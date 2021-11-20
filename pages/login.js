import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { supabase } from 'utils/supabaseClient'
import { Button } from 'components/Button'
import Input from 'components/Input'
import { ErrorMessage } from 'components/ErrorMessage'

export default function Login() {
  const router = useRouter()
  const isLoggedIn = Boolean(supabase.auth.session())
  if (isLoggedIn) {
    router.push('/')
  }
  /**
   * @typedef LoginForm
   * @property {string} email
   * @property {string} password
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm({
    defaultValues: /** @type {LoginForm} */ ({}),
  })

  const [credentialError, setCredentialError] = useState('')
  const [loading, setLoading] = useState(false)
  /**
   *
   * @param {LoginForm} data
   */
  function onSubmit(data) {
    setLoading(true)
    supabase.auth
      .signIn({
        email: data.email,
        password: data.password,
      })
      .then(({ error }) => {
        setLoading(false)
        if (!error) {
          router.push('/')
        } else {
          setCredentialError('Incorrect email or password.')
        }
      })
  }

  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  return (
    <div className="h-full grid place-items-center">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full">
        <ErrorMessage error={credentialError && { message: credentialError }} />
        <Input
          label="Email"
          id="email"
          {...register('email', {
            required: 'Email is required.',
          })}
          type="email"
        />
        <ErrorMessage error={errors.email} />
        <Input
          className="mt-2"
          label="Password"
          id="password"
          autoComplete="current-password"
          {...register('password', {
            required: 'Password is required.',
          })}
          type="password"
        />
        <ErrorMessage error={errors.password} />
        <div className="mt-4">
          <Button disabled={loading}>Log in</Button>
        </div>
        <Link href="/forget-password">
          <a className="inline-block mt-2 hover:underline">Forget password?</a>
        </Link>
      </form>
    </div>
  )
}
