import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiPlus, FiDownload, FiCheckCircle, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { invoicesApi } from '../api/invoices'
import { formatCurrency, formatDate } from '../utils/formatters'
import Badge from '../components/common/Badge'

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.getAll().then((res) => res.data),
  })

  const filteredInvoices = invoices?.filter((inv) => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (inv.customer?.name && inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleDownload = async (id, invoiceNumber) => {
    try {
      const toastId = toast.loading('Generating PDF...')
      const response = await invoicesApi.download(id)
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Download complete!', { id: toastId })
    } catch (error) {
      toast.error('Failed to download PDF')
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      await invoicesApi.markPaid(id)
      toast.success('Invoice marked as paid!')
      refetch() 
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-100">Invoices</h2>
        <Link
          to="/invoices/create"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors w-fit"
        >
          <FiPlus /> Create Invoice
        </Link>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg w-fit border border-slate-700/50">
            {['All', 'Sent', 'Paid', 'Overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Invoice</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Issue Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-blue-400 font-medium">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{inv.customer?.name}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(inv.issueDate)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3 px-4">
                      <Badge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <FiDownload size={16} />
                        </button>
                        
                        {inv.status !== 'Paid' && (
                          <button 
                            onClick={() => handleMarkPaid(inv.id)}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <FiCheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}