import React from 'react'

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {any} props.children
 * @param {function} [props.onClick]
 */
export function LinkButton({ className, children, onClick }) {
  function handleClick(e) {
    e.preventDefault()
    onClick?.()
  }
  return (
    <a href="#" onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
