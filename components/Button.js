/**
 * @typedef ButtonProps
 * @property {boolean} [disabled]
 * @property {any} [children]
 *
 * @param {ButtonProps} props
 */
export function Button({ disabled, children }) {
  return (
    <button
      disabled={disabled}
      className={`rounded-lg py-2 px-3 
            bg-blue-500 text-white
            outline-none(focus:& focus-visible:&)
            focus:active:(translate-0 bg-blue-500)
            focus-visible:(translate-x-[1px] -translate-y-[1px] bg-blue-600)
            hover:not-disabled:(translate-x-[1px] -translate-y-[1px] bg-blue-600)
            disabled:(opacity-70 cursor-auto)`}>
      {children}
    </button>
  )
}
