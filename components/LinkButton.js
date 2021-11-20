import React from 'react'
import classNames from 'classnames'

/**
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').CSSProperties} [props.style]
 * @param {any} props.children
 * @param {function} [props.onClick]
 */
export function LinkButton({ className, style, children, onClick }) {
  function handleClick(e) {
    e.preventDefault()
    onClick?.()
  }
  return (
    <a
      href="#"
      onClick={handleClick}
      className={classNames('hover:underline', className)}
      style={style}>
      {children}
    </a>
  )
}
