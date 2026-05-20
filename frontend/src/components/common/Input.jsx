import React, { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  className = '',
  required,
  ...props
}, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`form-input ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  )
})

export default Input