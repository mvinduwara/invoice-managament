import React, { useState } from 'react'
import { FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'
import axiosInstance from '../api/axios'

export default function Settings() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.put('/api/settings', formData)
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Company Settings</h2>
      
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Invoice Branding</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Business Name</label>
              <input 
                type="text" 
                placeholder="e.g. Manilka Tech Solutions" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                value={formData.businessName}
                onChange={e => setFormData({...formData, businessName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Business Address</label>
              <textarea 
                rows="3"
                placeholder="123 Tech Lane&#10;Colombo, Sri Lanka" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                value={formData.businessAddress}
                onChange={e => setFormData({...formData, businessAddress: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2">
            <FiSave /> Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}