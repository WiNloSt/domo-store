import React from 'react'
import classNames from 'classnames'

import style from './style.module.css'

const Input = React.forwardRef(
  /**
   * @typedef {import("react").InputHTMLAttributes<HTMLInputElement> & AdditionalInputProps} InputProps
   *
   * @typedef AdditionalInputProps
   * @property {string} [label]
   * @property {boolean} [fluid]
   * @property {keyof import('react').ReactHTML|React.FC} [as='div']
   *
   * @param {InputProps} props
   */
  function Input({ className, as: As = 'div', fluid, label, ...props }, ref) {
    return (
      <As className={className}>
        {label && (
          <label className="block" htmlFor={props.id}>
            {label}:
          </label>
        )}
        <input
          ref={ref}
          className={classNames(
            'mt-1 rounded py-1 px-2 ring(1 gray-400) focus-visible:(ring-2 outline-none)',
            {
              'w-full': fluid,
            },
            style.button
          )}
          {...props}
        />
      </As>
    )
  }
)

export default Input