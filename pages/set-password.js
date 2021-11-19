import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { supabase } from 'utils/supabaseClient'
import { Button } from 'components/Button'

import Input from 'components/Input'

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
  const [loading, setLoading] = useState(false)
  /**
   *
   * @param {SetPasswordForm} data
   */
  function onSubmit(data) {
    setLoading(true)
    supabase.auth.update({ password: data.password }).then(({ error }) => {
      setLoading(false)
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
        <Input
          label="Password"
          id="password"
          {...register('password', {
            required: 'Password is required.',
            minLength: { value: 8, message: 'Password must be at least 8 characters long.' },
          })}
          type="password"
        />
        <ErrorMessage error={errors.password} />
        <Input
          className="mt-2"
          label="Confirm password"
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
          <Button disabled={loading}>Set password</Button>
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
