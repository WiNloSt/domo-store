import React from 'react'
import classNames from 'classnames'

const Input = React.forwardRef(
  /**
   * @typedef {import("react").InputHTMLAttributes<HTMLInputElement> & AdditionalInputProps} InputProps
   *
   * @typedef AdditionalInputProps
   * @property {string} [label]
   * @property {boolean} [fluid]
   *
   * @param {InputProps} props
   */
  function Input({ className, fluid, label, ...props }, ref) {
    return (
      <div className={className}>
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
            }
          )}
          {...props}
        />
      </div>
    )
  }
)

export default Input
