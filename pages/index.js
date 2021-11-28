import { useEffect, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import { LinkButton } from 'components/LinkButton'
import { supabase } from 'utils/supabaseClient'
import { useRequireAuth, useIsAdmin } from 'utils/authHooks'
import classNames from 'classnames'
import { ProductForm } from '../components/ProductForm'

export default function Home() {
  const { isLoggedIn } = useRequireAuth()
  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      <h1 className="text-xl font-semibold">Products</h1>
      <Products className="mt-2" />
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
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [isEditProductLoading, setIsEditProductLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(/** @type {Product?} */ (null))
  const [errorMessage, setErrorMessage] = useState('')

  const { session } = useRequireAuth()
  const isAdmin = useIsAdmin()

  useEffect(() => {
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

  /**
   *
   * @param {Product} productToBeDeleted
   */
  function handleDeleteProduct(productToBeDeleted) {
    supabase
      .from('products')
      .delete()
      .match({ id: productToBeDeleted.id })
      .then(({ error }) => {
        if (!error) {
          setProducts((products) => {
            return products.filter((product) => product.id !== productToBeDeleted.id)
          })
        }
      })
  }

  return (
    <>
      <table className={classNames('w-full', className)}>
        <thead>
          <tr>
            <th className="pb-2 px-2 font-semibold whitespace-nowrap">Name</th>
            <th className="pb-2 px-2 font-semibold whitespace-nowrap">Price (฿)</th>
            <th className="pb-2 px-2 font-semibold whitespace-nowrap">Quantity</th>
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
                <td className="px-3 py-2 border border-gray-400 text-right">{product.price}</td>
                <td className="px-3 py-2 border border-gray-400 text-right">{product.quantity}</td>
                {isAdmin && (
                  <td
                    className="px-3 py-2 bg-white cursor-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}>
                    <span
                      className="sm:opacity-0 hover:opacity-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Are you sure you want to delete "${product.name}"`)) {
                          handleDeleteProduct(product)
                        }
                      }}>
                      ❌
                    </span>
                  </td>
                )}
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
            <div className="z-0 bg-white rounded-xl max-w-2xl w-full p-6 border shadow-lg">
              {selectedProduct && (
                <>
                  <Dialog.Title as="h2" className="text-lg font-semibold">
                    Edit {selectedProduct.name}
                  </Dialog.Title>
                  <ProductForm
                    errorMessage={errorMessage}
                    isAdmin={Boolean(isAdmin)}
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
      {isAdmin && (
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
            <div className="z-0 bg-white rounded-xl max-w-2xl w-full p-6 border shadow-lg">
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
