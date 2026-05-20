import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiGrid, FiFileText, FiUsers, FiPackage,
  FiDollarSign, FiBarChart2, FiLogOut, FiZap
} from 'react-icons/fi'
import useAuth from '../../hooks/useAuth'

const navItems = [
  { path: '/dashboard', icon: FiGrid,       label: 'Dashboard'  },
  { path: '/invoices',  icon: FiFileText,   label: 'Invoices'   },
  { path: '/customers', icon: FiUsers,      label: 'Customers'  },
  { path: '/products',  icon: FiPackage,    label: 'Products'   },
  { path: '/payments',  icon: FiDollarSign, label: 'Payments'   },
  { path: '/reports',   icon: FiBarChart2,  label: 'Reports'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 
                       flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-800">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <FiZap size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-100 text-lg">InvoiceFlow</span>
          <p className="text-xs text-slate-500">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
               transition-all duration-200 
               ${isActive
                 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                 : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
               }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center 
                            justify-center text-white text-sm font-semibold">
              {user.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-slate-400 hover:text-red-400 hover:bg-red-500/10 
                     transition-all duration-200 w-full"
        >
          <FiLogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}