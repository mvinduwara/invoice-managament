import React from 'react'
import { useLocation } from 'react-router-dom'
import { FiBell, FiSearch, FiPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/invoices':  'Invoices',
  '/customers': 'Customers',
  '/products':  'Products',
  '/payments':  'Payments',
  '/reports':   'Reports',
}

export default function Navbar() {
  const location = useLocation()
  const { user } = useAuth()
  const title = pageTitles[location.pathname] || 'InvoiceFlow'

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 
                        flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Create Invoice */}
        <Link to="/invoices/new">
          <button className="btn-primary text-sm py-2 px-4">
            <FiPlus size={16} />
            New Invoice
          </button>
        </Link>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-100 
                            hover:bg-slate-700/50 rounded-lg transition-all duration-200">
          <FiBell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}