import { useEffect, useState } from 'react'

import { supabase } from 'utils/supabaseClient'
import useRequireAuth from 'utils/useRequireAuth'

export default function Home() {
  const isLoggedIn = useRequireAuth()
  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="w-full max-w-md mx-auto my-4">
      <div className="mx-3">
        <h1 className="text-xl bold">Products</h1>
        <Products className="mt-2" />
      </div>
    </div>
  )
}

/**
 * @typedef ProductsProps
 * @property {string} [className]
 *
 * @param {ProductsProps} props
 * @returns
 */
function Products({ className }) {
  /**
   * @typedef Product
   * @property {string} id
   * @property {string} name
   * @property {number} quantity
   */
  const [products, setProducts] = useState(/** @type {Product[]} */ ([]))

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
  }, [])

  if (products.length < 1) {
    return <>loading...</>
  }

  return (
    <table className={className}>
      <tr>
        <th className="pb-2">Name</th>
        <th className="pb-2">Quantity</th>
      </tr>
      {products.map((product) => {
        return (
          <tr key={product.id}>
            <td className="px-3 py-2 border border-gray-400">{product.name}</td>
            <td className="px-3 py-2 border border-gray-400">{product.quantity}</td>
          </tr>
        )
      })}
    </table>
  )
}
