import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabaseClient'

export default function Login() {
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

  const router = useRouter()

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
        }

        setCredentialError('Incorrect email or password.')
      })
  }

  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  return (
    <div className="h-screen bg-gray-70 grid place-items-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ErrorMessage error={credentialError && { message: credentialError }} />
        <label className="block" htmlFor="email">
          Email:
        </label>
        <input
          className="mt-1 rounded py-1 px-2 ring(1 gray-400) focus-visible:(ring-2 outline-none)"
          id="email"
          {...register('email', {
            required: 'Email is required.',
          })}
          type="email"
        />
        <ErrorMessage error={errors.email} />
        <label className="block mt-2" htmlFor="password">
          password:
        </label>
        <input
          className="mt-1 rounded py-1 px-2 ring(1 gray-400) focus-visible:(ring-2 outline-none)"
          id="password"
          {...register('password', {
            required: 'Password is required.',
          })}
          type="password"
        />
        <ErrorMessage error={errors.password} />
        <div className="mt-4">
          <button
            disabled={loading}
            className={`rounded-lg py-2 px-3 
            bg-blue-500 text-white
            outline-none(focus:& focus-visible:&)
            focus:active:(translate-0 bg-blue-500)
            focus-visible:(translate-x-[1px] -translate-y-[1px] bg-blue-600)
            hover:(translate-x-[1px] -translate-y-[1px] bg-blue-600)`}>
            Login
          </button>
        </div>
      </form>
    </div>
  )
}

function ErrorMessage({ error }) {
  if (error) {
    return (
      <div className="mt-1 text-red-500 whitespace-nowrap w-0">
        <em>{error.message}</em>
      </div>
    )
  }

  return null
}
