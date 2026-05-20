import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiPlus, FiTrash2, FiSearch, FiMail, FiPhone } from 'react-icons/fi'
import toast from 'react-hot-toast'
import axiosInstance from '../api/axios'

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' })

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: () => axiosInstance.get('/api/customers').then(res => res.data),
  })

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post('/api/customers', newCustomer)
      toast.success('Customer added successfully!')
      setIsModalOpen(false)
      setNewCustomer({ name: '', email: '', phone: '', address: '' })
      refetch()
    } catch (err) {
      toast.error('Failed to add customer')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-100">Customers</h2>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors w-fit">
          <FiPlus /> Add Customer
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="relative w-full md:w-64 mb-6">
          <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-10 text-slate-400">Loading customers...</div>
          ) : filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors">
              <h3 className="font-bold text-lg text-slate-100">{customer.name}</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p className="flex items-center gap-2"><FiMail className="text-blue-400"/> {customer.email}</p>
                <p className="flex items-center gap-2"><FiPhone className="text-blue-400"/> {customer.phone || 'N/A'}</p>
                <p className="truncate">📍 {customer.address || 'No address provided'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <input required placeholder="Company / Name" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" 
                     value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              <input required type="email" placeholder="Email Address" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" 
                     value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
              <input placeholder="Phone Number" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" 
                     value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              <textarea placeholder="Billing Address" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" 
                     value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}