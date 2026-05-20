import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiPlus, FiEdit2, FiTrash2, FiSend,
  FiSearch, FiFilter, FiDownload
} from 'react-icons/fi'
import { invoicesApi } from '../api/invoices'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function Invoices() {
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [page, setPage]         = useState(0)
  const queryClient             = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', { search, status, page }],
    queryFn: () => invoicesApi.getAll({
      page, size: 10, search, status: status || undefined,
      sort: 'createdAt,desc',
    }).then((r) => r.data),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: invoicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice deleted')
    },
    onError: () => toast.error('Failed to delete invoice'),
  })

  const sendMutation = useMutation({
    mutationFn: invoicesApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice sent to customer!')
    },
    onError: () => toast.error('Failed to send invoice'),
  })

  const handleDownload = async (id, invoiceNumber) => {
    try {
      const response = await invoicesApi.download(id)
      const url      = window.URL.createObjectURL(new Blob([response.data]))
      const link     = document.createElement('a')
      link.href      = url
      link.setAttribute('download', `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Invoice downloaded!')
    } catch {
      toast.error('Failed to download PDF')
    }
  }

  const invoices = data?.content || []
  const totalPages = data?.totalPages || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Invoices</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {data?.totalElements || 0} total invoices
          </p>
        </div>
        <Link to="/invoices/new">
          <Button><FiPlus size={16} /> New Invoice</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-64">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search invoices..."
              className="form-input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter size={16} className="text-slate-400" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0) }}
              className="form-input w-40"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Invoice #', 'Customer', 'Issue Date', 'Due Date', 'Amount', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-400 
                             uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : invoices.length > 0
              ? invoices.map((inv) => (
                  <tr key={inv.id} className="table-row">
                    <td className="py-3 px-4 font-mono text-blue-400 text-xs font-medium">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{inv.customer?.name}</div>
                      <div className="text-xs text-slate-500">{inv.customer?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(inv.issueDate)}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-4"><Badge status={inv.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link to={`/invoices/${inv.id}/edit`}>
                          <button className="p-1.5 text-slate-400 hover:text-blue-400 
                                             hover:bg-blue-500/10 rounded-lg transition-all"
                                  title="Edit">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => sendMutation.mutate(inv.id)}
                            className="p-1.5 text-slate-400 hover:text-green-400 
                                       hover:bg-green-500/10 rounded-lg transition-all"
                            title="Send invoice"
                          >
                            <FiSend size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                          className="p-1.5 text-slate-400 hover:text-purple-400 
                                     hover:bg-purple-500/10 rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <FiDownload size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this invoice?')) {
                              deleteMutation.mutate(inv.id)
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 
                                     hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <p className="text-lg mb-2">No invoices found</p>
                    <Link to="/invoices/new" className="text-blue-400 hover:text-blue-300 text-sm">
                      Create your first invoice
                    </Link>
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-400">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}