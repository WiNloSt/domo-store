import { useEffect, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import { LinkButton } from 'components/LinkButton'
import { supabase } from 'utils/supabaseClient'
import useRequireAuth from 'utils/useRequireAuth'
import classNames from 'classnames'
import { ProductForm } from '../components/ProductForm'

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
 * @property {number} price
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
  const [isEditProductLoading, setIsEditProductLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(/** @type {Product?} */ (null))
  const [errorMessage, setErrorMessage] = useState('')

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

  /**
   *
   * @param {Product} data
   */
  function handleEditProduct(data) {
    setIsEditProductLoading(true)
    supabase
      .from('products')
      .update({
        name: data.name,
        quantity: data.quantity,
        price: data.price,
      })
      .match({
        id: selectedProduct?.id,
      })
      .then(({ data, error }) => {
        setIsEditProductLoading(false)
        if (data) {
          handleAfterEditProduct(data[0])
          setErrorMessage('')
        } else {
          if (
            error?.message === 'duplicate key value violates unique constraint "products_name_key"'
          ) {
            setErrorMessage('Product name needs to be unique.')
          } else {
            setErrorMessage('Cannot edit product.')
          }
        }
      })

    function handleAfterEditProduct(editedProduct) {
      setProducts((products) => {
        const index = products.findIndex((product) => product.id === editedProduct.id)

        return [...products.slice(0, index), editedProduct, ...products.slice(index + 1)]
      })
      setIsEditProductModalOpen(false)
    }
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
              {selectedProduct && (
                <>
                  <Dialog.Title as="h2" className="text-lg font-semibold">
                    Edit {selectedProduct.name}
                  </Dialog.Title>
                  <ProductForm
                    errorMessage={errorMessage}
                    isAdmin={userRole === 'admin'}
                    autoFocusField="quantity"
                    product={selectedProduct}
                    submitLabel="Edit"
                    loading={isEditProductLoading}
                    onSubmit={handleEditProduct}
                    onCancel={() => {
                      setIsEditProductModalOpen(false)
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </Dialog>
      </Transition>
      {userRole === 'admin' && (
        <AddNewProductButton
          onAfterAddProduct={(newProduct) => {
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
 * @property {function}onAfterAddProduct
 *
 * @param {AddNewProductButtonProps} props
 * @returns
 */
function AddNewProductButton({ className, onAfterAddProduct }) {
  const [isOpen, setIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAddProductLoading, setIsAddProductLoading] = useState(false)

  /**
   *
   * @param {Product} data
   */
  function handleAddProduct(data) {
    setIsAddProductLoading(true)
    supabase
      .from('products')
      .insert([
        {
          name: data.name,
          quantity: data.quantity,
          price: data.price,
        },
      ])
      .then(({ data, error }) => {
        setIsAddProductLoading(false)
        if (data) {
          handleAfterAddProduct(data[0])
          setErrorMessage('')
        } else {
          if (
            error?.message === 'duplicate key value violates unique constraint "products_name_key"'
          ) {
            setErrorMessage('Product name needs to be unique.')
          } else {
            setErrorMessage('Cannot create product.')
          }
        }
      })

    function handleAfterAddProduct(newProduct) {
      setIsOpen(false)
      onAfterAddProduct(newProduct)
    }
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
              <Dialog.Title as="h2" className="text-lg font-semibold">
                Add new product
              </Dialog.Title>
              <ProductForm
                errorMessage={errorMessage}
                isAdmin
                autoFocusField="name"
                submitLabel="Add new product"
                loading={isAddProductLoading}
                onSubmit={handleAddProduct}
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
