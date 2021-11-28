import { useEffect, Fragment } from 'react'
import { LinkButton } from 'components/LinkButton'
import { useForm } from 'react-hook-form'
import Input from 'components/Input'
import { ErrorMessage } from 'components/ErrorMessage'
import { Button } from 'components/Button'

/** @typedef {import('pages').Product} Product */

/**
 * @typedef ProductForm
 * @property {string} name
 * @property {number} quantity
 * @property {number} price
 */

/**
 * @typedef ProductFormProps
 * @property {Product} [product]
 * @property {string} submitLabel
 * @property {string} [errorMessage]
 * @property {keyof ProductForm} autoFocusField
 * @property {boolean} loading
 * @property {import('react-hook-form').SubmitHandler<Product>} onSubmit
 * @property {function} onCancel
 * @property {boolean} [isAdmin]
 *
 * @param {ProductFormProps} props
 */
export function ProductForm({
  product,
  errorMessage,
  autoFocusField,
  submitLabel,
  loading,
  onSubmit,
  onCancel,
  isAdmin,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
    getValues,
    watch,
  } = useForm({
    defaultValues: /** @type {ProductForm} */ ({
      name: product?.name,
      quantity: product?.quantity || 0,
      price: product?.price || 0,
    }),
  })

  useEffect(() => {
    setFocus(autoFocusField)
  }, [autoFocusField, setFocus])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-2">
      {errorMessage && <ErrorMessage error={{ message: errorMessage }} />}
      <Input
        fluid
        disabled={!isAdmin}
        label="Name"
        id="name"
        {...register('name', {
          required: 'Product name is required.',
        })}
      />
      <ErrorMessage error={errors.name} />
      <Input
        disabled={!isAdmin}
        className="mt-2"
        fluid
        label="Price"
        autoComplete="off"
        id="price"
        type="number"
        {...register('price', {
          valueAsNumber: true,
          validate: (price) => price >= 0 || 'Price must equal or more than 0.',
        })}
      />
      <ErrorMessage error={errors.price} />
      <div className="mt-2">
        <label className="inline-block" htmlFor="quantity">
          Quantity:
        </label>
        {product && watch('quantity') !== product.quantity && (
          <span className="ml-2 italic text-gray-700">{`(${
            watch('quantity') - product.quantity
          })`}</span>
        )}

        <div className="flex items-baseline">
          <Input
            as={Fragment}
            autoComplete="off"
            id="quantity"
            type="number"
            {...register('quantity', {
              valueAsNumber: true,
              validate: {
                positive: (quantity) => quantity >= 0 || 'Quantity must equal or more than 0.',
                cannotIncrement: (quantity) => {
                  if (!isAdmin && product) {
                    return (
                      quantity <= product.quantity ||
                      'Cannot increse quantity. Please contact an admin to do that for you.'
                    )
                  }
                  return true
                },
              },
            })}
          />
          <Button
            disabled={watch('quantity') <= 0}
            type="button"
            className="text-2xl px-4 py-1 ml-1"
            basic
            onClick={() => {
              setValue('quantity', getValues('quantity') - 1)
            }}>
            -
          </Button>
          <Button
            disabled={!isAdmin && watch('quantity') >= (product?.quantity || NaN)}
            type="button"
            className="text-2xl px-4 py-1 ml-1"
            basic
            onClick={() => {
              setValue('quantity', getValues('quantity') + 1)
            }}>
            +
          </Button>
        </div>
      </div>
      <ErrorMessage error={errors.quantity} />
      <div className="mt-4 inline-block">
        <Button disabled={loading}>{submitLabel}</Button>
      </div>
      <LinkButton className="ml-4" onClick={onCancel}>
        Cancel
      </LinkButton>
    </form>
  )
}
