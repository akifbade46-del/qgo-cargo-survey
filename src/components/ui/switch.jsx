import { forwardRef } from 'react'

export const Switch = forwardRef(({ className = '', checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors focus:outline-none focus:ring-2 focus:ring-qgo-blue focus:ring-offset-2
        ${checked ? 'bg-qgo-blue' : 'bg-gray-200'}
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
})

Switch.displayName = 'Switch'
