import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import CreateInvoice from './pages/CreateInvoice'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Payments from './pages/Payments'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/"                  element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"         element={<Dashboard />} />
              <Route path="/invoices"          element={<Invoices />} />
              <Route path="/invoices/new"      element={<CreateInvoice />} />
              <Route path="/invoices/:id/edit" element={<CreateInvoice />} />
              <Route path="/customers"         element={<Customers />} />
              <Route path="/products"          element={<Products />} />
              <Route path="/payments"          element={<Payments />} />
              <Route path="/reports"           element={<Reports />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}