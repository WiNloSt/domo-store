import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabaseClient'
import { Button } from 'components/Button'

export default function SetPassword() {
  /**
   * @typedef SetPasswordForm
   * @property {string} password
   * @property {string} confirmPassword
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setFocus,
  } = useForm({
    defaultValues: /** @type {SetPasswordForm} */ ({}),
  })

  const router = useRouter()
  /**
   *
   * @param {SetPasswordForm} data
   */
  function onSubmit(data) {
    supabase.auth.update({ password: data.password }).then(({ error }) => {
      if (!error) {
        router.push('/')
      }
    })
  }

  useEffect(() => {
    setFocus('password')
  }, [setFocus])

  return (
    <div className="h-screen bg-gray-70 grid place-items-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block" htmlFor="password">
          Password:
        </label>
        <input
          className="mt-1 rounded py-1 px-2 ring(1 gray-400) focus-visible:(ring-2 outline-none)"
          id="password"
          {...register('password', {
            required: 'Password is required.',
            minLength: { value: 8, message: 'Password must be at least 8 characters long.' },
          })}
          type="password"
        />
        <ErrorMessage error={errors.password} />
        <label className="block mt-2" htmlFor="confirmPassword">
          Confirm password:
        </label>
        <input
          className="mt-1 rounded py-1 px-2 ring(1 gray-400) focus-visible:(ring-2 outline-none)"
          id="confirmPassword"
          {...register('confirmPassword', {
            validate: (confirmedPassword) => {
              const password = watch('password')
              if (password) {
                return confirmedPassword === password || 'Password not matched.'
              }
            },
          })}
          type="password"
        />
        <ErrorMessage error={errors.confirmPassword} />
        <div className="mt-4">
          <Button>Set password</Button>
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
