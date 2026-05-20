import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiSave, FiUserPlus } from 'react-icons/fi'
import { invoicesApi } from '../api/invoices'
import axiosInstance from '../api/axios'

export default function CreateInvoice() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 14 days
  })

  // Dynamic array of items
  const [items, setItems] = useState([
    { description: '', quantity: 1, price: 0 }
  ])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data } = await axiosInstance.get('/api/customers')
      setCustomers(data)
    } catch (err) {
      toast.error('Failed to load customers')
    }
  }

  // Quick helper to create a demo customer directly from the form if none exist
  const createDemoCustomer = async () => {
    try {
      const { data } = await axiosInstance.post('/api/customers', {
        name: 'Acme Corp', email: 'billing@acme.com', phone: '555-0199', address: '123 Tech Lane'
      })
      setCustomers([...customers, data])
      setFormData({ ...formData, customerId: data.id })
      toast.success('Demo customer created!')
    } catch (err) {
      toast.error('Failed to create customer')
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0 }])
  
  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.customerId) return toast.error('Please select a customer')
    if (items.some(i => !i.description || i.price <= 0)) {
      return toast.error('All items must have a description and a valid price')
    }

    setLoading(true)
    try {
      await invoicesApi.create({ ...formData, items })
      toast.success('Invoice created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Create New Invoice</h2>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-8">
        {/* Top Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Customer</label>
            <div className="flex gap-2">
              <select
                className="input-field flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {customers.length === 0 && (
                <button type="button" onClick={createDemoCustomer} className="p-2.5 bg-blue-600 rounded-lg hover:bg-blue-500 text-white" title="Create Demo Customer">
                  <FiUserPlus />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Issue Date</label>
            <input type="date" className="input-field w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Due Date</label>
            <input type="date" className="input-field w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
          </div>
        </div>

        {/* Line Items Section */}
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-200">Line Items</h3>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <input type="text" placeholder="Item description" className="input-field flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
              
              <input type="number" min="1" className="input-field w-24 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-center"
                value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
              
              <div className="relative w-32">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input type="number" min="0" step="0.01" className="input-field w-full bg-slate-800 border border-slate-700 rounded-lg p-2 pl-7 text-white"
                  value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} />
              </div>

              <button type="button" onClick={() => removeItem(index)} 
                className={`p-2 rounded-lg transition-colors ${items.length > 1 ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-600 cursor-not-allowed'}`}>
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}

          <button type="button" onClick={addItem} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 mt-2">
            <FiPlus /> Add another item
          </button>
        </div>

        {/* Summary Footer */}
        <div className="flex items-end justify-between pt-6 border-t border-slate-700/50">
          <div className="text-slate-400 text-sm">
            Make sure all details are correct before saving.
          </div>
          <div className="text-right">
            <p className="text-slate-400 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-slate-100">${calculateTotal().toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave />}
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  )
}import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiSave, FiUserPlus } from 'react-icons/fi'
import { invoicesApi } from '../api/invoices'
import axiosInstance from '../api/axios'

export default function CreateInvoice() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 14 days
  })

  // Dynamic array of items
  const [items, setItems] = useState([
    { description: '', quantity: 1, price: 0 }
  ])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data } = await axiosInstance.get('/api/customers')
      setCustomers(data)
    } catch (err) {
      toast.error('Failed to load customers')
    }
  }

  // Quick helper to create a demo customer directly from the form if none exist
  const createDemoCustomer = async () => {
    try {
      const { data } = await axiosInstance.post('/api/customers', {
        name: 'Acme Corp', email: 'billing@acme.com', phone: '555-0199', address: '123 Tech Lane'
      })
      setCustomers([...customers, data])
      setFormData({ ...formData, customerId: data.id })
      toast.success('Demo customer created!')
    } catch (err) {
      toast.error('Failed to create customer')
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0 }])
  
  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.customerId) return toast.error('Please select a customer')
    if (items.some(i => !i.description || i.price <= 0)) {
      return toast.error('All items must have a description and a valid price')
    }

    setLoading(true)
    try {
      await invoicesApi.create({ ...formData, items })
      toast.success('Invoice created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Create New Invoice</h2>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-8">
        {/* Top Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Customer</label>
            <div className="flex gap-2">
              <select
                className="input-field flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {customers.length === 0 && (
                <button type="button" onClick={createDemoCustomer} className="p-2.5 bg-blue-600 rounded-lg hover:bg-blue-500 text-white" title="Create Demo Customer">
                  <FiUserPlus />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Issue Date</label>
            <input type="date" className="input-field w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Due Date</label>
            <input type="date" className="input-field w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
          </div>
        </div>

        {/* Line Items Section */}
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-200">Line Items</h3>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <input type="text" placeholder="Item description" className="input-field flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
              
              <input type="number" min="1" className="input-field w-24 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-center"
                value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
              
              <div className="relative w-32">
                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                <input type="number" min="0" step="0.01" className="input-field w-full bg-slate-800 border border-slate-700 rounded-lg p-2 pl-7 text-white"
                  value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} />
              </div>

              <button type="button" onClick={() => removeItem(index)} 
                className={`p-2 rounded-lg transition-colors ${items.length > 1 ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-600 cursor-not-allowed'}`}>
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}

          <button type="button" onClick={addItem} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 mt-2">
            <FiPlus /> Add another item
          </button>
        </div>

        {/* Summary Footer */}
        <div className="flex items-end justify-between pt-6 border-t border-slate-700/50">
          <div className="text-slate-400 text-sm">
            Make sure all details are correct before saving.
          </div>
          <div className="text-right">
            <p className="text-slate-400 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-slate-100">${calculateTotal().toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave />}
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  )
}