import { useEffect, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import { LinkButton } from 'components/LinkButton'
import { supabase } from 'utils/supabaseClient'
import useRequireAuth from 'utils/useRequireAuth'
import { useForm } from 'react-hook-form'
import Input from 'components/Input'
import { ErrorMessage } from 'components/ErrorMessage'
import { Button } from 'components/Button'
import classNames from 'classnames'

export default function Home() {
  const { isLoggedIn } = useRequireAuth()
  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="mx-3">
        <h1 className="text-xl font-bold">Products</h1>
        <Products className="mt-2" />
      </div>
    </div>
  )
}

/**
 * @typedef Product
 * @property {string} id
 * @property {string} name
 * @property {number} quantity
 */

/**
 * @typedef ProductsProps
 * @property {string} [className]
 *
 * @param {ProductsProps} props
 * @returns
 */
function Products({ className }) {
  const [products, setProducts] = useState(/** @type {Product[]} */ ([]))
  const [userRole, setUserRole] = useState(/** @type {'admin'|'cashier'|null} */ (null))
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(/** @type {Product?} */ (null))

  const { session } = useRequireAuth()

  useEffect(() => {
    supabase
      .from('users_roles')
      .select('role')
      .match({ user: session?.user?.id })
      .single()
      .then(({ data }) => {
        if (data) {
          setUserRole(data.role)
        }
      })

    supabase
      .from('products')
      .select()
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setProducts(data)
        }
      })
  }, [session?.user?.id])

  if (products.length < 1) {
    return <>loading...</>
  }
  function handleProductEdited(editedProduct) {
    setProducts((products) => {
      const index = products.findIndex((product) => product.id === editedProduct.id)

      return [...products.slice(0, index), editedProduct, ...products.slice(index + 1)]
    })
    setIsEditProductModalOpen(false)
  }

  return (
    <>
      <table className={classNames('w-full', className)}>
        <thead>
          <tr>
            <th className="pb-2">Name</th>
            <th className="pb-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            return (
              <tr
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product)
                  setIsEditProductModalOpen(true)
                }}
                className="cursor-pointer hover:bg-gray-100">
                <td className="px-3 py-2 border border-gray-400">{product.name}</td>
                <td className="px-3 py-2 border border-gray-400">{product.quantity}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Transition
        as={Fragment}
        show={isEditProductModalOpen}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0">
        <Dialog
          onClose={() => setIsEditProductModalOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto">
          <Dialog.Overlay className="z-0 fixed inset-0" />
          <div className="min-h-screen grid place-items-center">
            <div className="z-0 bg-white rounded-xl max-w-md w-full p-6 border shadow-lg">
              <EditProductForm
                product={selectedProduct}
                onProductEdited={handleProductEdited}
                onCancel={() => {
                  setIsEditProductModalOpen(false)
                }}
              />
            </div>
          </div>
        </Dialog>
      </Transition>
      {userRole === 'admin' && (
        <AddNewProductButton
          onNewProductAdded={(newProduct) => {
            setProducts((products) => {
              return [newProduct, ...products]
            })
          }}
          className="mt-2 inline-block"
        />
      )}
    </>
  )
}

/**
 * @typedef AddNewProductButtonProps
 * @property {string} [className]
 * @property {function}onNewProductAdded
 *
 * @param {AddNewProductButtonProps} props
 * @returns
 */
function AddNewProductButton({ className, onNewProductAdded }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleNewProductAdded(newProduct) {
    setIsOpen(false)
    onNewProductAdded(newProduct)
  }

  return (
    <>
      <LinkButton
        className={className}
        style={{
          textDecorationThickness: 1,
        }}
        onClick={() => {
          setIsOpen(true)
        }}>
        <span className="text-2xl font-bold">+</span> Add new Product
      </LinkButton>
      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0">
        <Dialog onClose={() => setIsOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
          <Dialog.Overlay className="z-0 fixed inset-0" />
          <div className="min-h-screen grid place-items-center">
            <div className="z-0 bg-white rounded-xl max-w-md w-full p-6 border shadow-lg">
              <AddNewProductForm
                onNewProductAdded={handleNewProductAdded}
                onCancel={() => {
                  setIsOpen(false)
                }}
              />
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

function AddNewProductForm({ onNewProductAdded, onCancel }) {
  /**
   * @typedef AddNewProductForm
   * @property {string} productName
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm({
    defaultValues: /** @type {AddNewProductForm} */ ({}),
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFocus('productName')
  }, [setFocus])

  function onSubmit(data) {
    setLoading(true)
    supabase
      .from('products')
      .insert([
        {
          name: data.productName,
          quantity: 0,
        },
      ])
      .then(({ data }) => {
        setLoading(false)
        if (data) {
          onNewProductAdded(data[0])
        }
      })
  }

  return (
    <div>
      <Dialog.Title as="h2" className="text-lg font-semibold">
        Add new product
      </Dialog.Title>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full mt-2">
        <Input
          fluid
          label="Product name"
          id="productName"
          {...register('productName', {
            required: 'Product name is required.',
          })}
        />
        <ErrorMessage error={errors.productName} />
        <div className="mt-4 inline-block">
          <Button disabled={loading}>Add new product</Button>
        </div>
        <LinkButton className="ml-4" onClick={onCancel}>
          Cancel
        </LinkButton>
      </form>
    </div>
  )
}

/**
 * @typedef EditProductFormProps
 * @property {Product?} product
 * @property {function} onProductEdited
 * @property {function} onCancel
 *
 * @param {EditProductFormProps} props
 */
function EditProductForm({ product, onProductEdited, onCancel }) {
  /**
   * @typedef EditProductForm
   * @property {string} name
   * @property {number} quantity
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
    getValues,
  } = useForm({
    defaultValues: /** @type {EditProductForm} */ ({
      name: product?.name,
      quantity: product?.quantity,
    }),
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFocus('quantity')
  }, [setFocus])

  function onSubmit(data) {
    setLoading(true)
    supabase
      .from('products')
      .update({
        name: data?.name,
        quantity: data?.quantity,
      })
      .match({
        id: product?.id,
      })
      .then(({ data }) => {
        setLoading(false)
        if (data) {
          onProductEdited(data[0])
        }
      })
  }

  return (
    <div>
      <Dialog.Title as="h2" className="text-lg font-semibold">
        Edit {product?.name}
      </Dialog.Title>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full mt-2">
        <Input
          label="Name"
          id="name"
          {...register('name', {
            required: 'Product name is required.',
          })}
        />
        <ErrorMessage error={errors.name} />
        <div className="mt-2">
          <Input
            as={Fragment}
            label="Quantity"
            autoComplete="off"
            id="quantity"
            type="number"
            {...register('quantity', {
              valueAsNumber: true,
              validate: (quantity) => quantity >= 0 || 'Quantity must equan or more than 0.',
            })}
          />
          <Button
            type="button"
            className="text-2xl px-4 py-1 ml-1"
            basic
            onClick={() => {
              setValue('quantity', getValues('quantity') - 1)
            }}>
            -
          </Button>
          <Button
            type="button"
            className="text-2xl px-4 py-1 ml-1"
            basic
            onClick={() => {
              setValue('quantity', getValues('quantity') + 1)
            }}>
            +
          </Button>
        </div>
        <ErrorMessage error={errors.quantity} />
        <div className="mt-4 inline-block">
          <Button disabled={loading}>Edit</Button>
        </div>
        <LinkButton className="ml-4" onClick={onCancel}>
          Cancel
        </LinkButton>
      </form>
    </div>
  )
}
