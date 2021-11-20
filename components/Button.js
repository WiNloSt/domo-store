import classNames from 'classnames'
/**
 * @typedef {import("react").ButtonHTMLAttributes<HTMLButtonElement> & AdditionalButtonProps} ButtonProps
 *
 * @typedef AdditionalButtonProps
 * @property {boolean} [disabled]
 * @property {boolean} [basic]
 * @property {string} [className]
 * @property {any} [children]
 *
 * @param {ButtonProps} props
 */
export function Button({ disabled, basic, className, children, ...props }) {
  return (
    <button
      disabled={disabled}
      className={classNames(
        `rounded-lg py-2 px-3 
            bg-blue-500 text-white
            outline-none(focus:& focus-visible:&)
            focus:active:(!translate-0 bg-blue-500)
            focus-visible:(translate-x-[1px] -translate-y-[1px] bg-blue-600)
            hover:not-disabled:(translate-x-[1px] -translate-y-[1px] bg-blue-600)
          disabled:(opacity-70 cursor-auto)`,
        {
          'bg-gray-300 text-black focus:active:bg-gray-300 focus-visible:bg-gray-400 hover:not-disabled:bg-gray-400':
            basic,
        },
        className
      )}
      {...props}>
      {children}
    </button>
  )
}
