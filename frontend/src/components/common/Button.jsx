import React from 'react'

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  danger:    'bg-red-600/20 hover:bg-red-600 border border-red-600/50 text-red-400 hover:text-white',
  ghost:     'hover:bg-slate-700/50 text-slate-400 hover:text-slate-100',
  success:   'bg-green-600/20 hover:bg-green-600 border border-green-600/50 text-green-400 hover:text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}