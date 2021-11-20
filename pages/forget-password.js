import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'

import { supabase } from 'utils/supabaseClient'
import { Button } from 'components/Button'
import Input from 'components/Input'
import { LinkButton } from 'components/LinkButton'
import { ErrorMessage } from '../components/ErrorMessage'

export default function ForgetPassword() {
  /**
   * @typedef ForgetPasswordForm
   * @property {string} email
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm({
    defaultValues: /** @type {ForgetPasswordForm} */ ({}),
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  /**
   *
   * @param {ForgetPasswordForm} data
   */
  function onSubmit(data) {
    setLoading(true)
    supabase.auth.api.resetPasswordForEmail(data.email).then(({ error }) => {
      setLoading(false)
      if (!error) {
        setMessage(
          'An email with an instruction to reset your password is sent to your email address.'
        )
      } else {
        if (error?.status === 404) {
          setMessage('There is no user with this email.')
        } else {
          setMessage('Failed to reset your password.')
        }
      }
    })
  }

  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  const router = useRouter()

  return (
    <div className="h-full grid place-items-center">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full">
        <em>{message}</em>
        <Input
          label="Email"
          id="email"
          {...register('email', {
            required: 'Email is required.',
          })}
          type="email"
        />
        <ErrorMessage error={errors.email} />
        <div className="mt-4">
          <Button disabled={loading}>Set password</Button>
        </div>
        <div className="mt-2">
          <LinkButton
            onClick={() => {
              router.back()
            }}>
            Cancel
          </LinkButton>
        </div>
      </form>
    </div>
  )
}
