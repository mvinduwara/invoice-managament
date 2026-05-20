import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiArrowLeft } from 'react-icons/fi'
import InvoiceForm from '../components/invoice/InvoiceForm'
import { invoicesApi } from '../api/invoices'

export default function CreateInvoice() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const queryClient    = useQueryClient()
  const isEditing      = Boolean(id)

  const { data: invoice, isLoading: loadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn:  () => invoicesApi.getById(id).then((r) => r.data),
    enabled:  isEditing,
  })

  const mutation = useMutation({
    mutationFn: (data) => isEditing
      ? invoicesApi.update(id, data).then((r) => r.data)
      : invoicesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
      toast.success(isEditing ? 'Invoice updated!' : 'Invoice created!')
      navigate('/invoices')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong')
    },
  })

  if (isEditing && loadingInvoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent 
                        rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/invoices')}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 
                     rounded-lg transition-all"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {isEditing ? 'Edit Invoice' : 'New Invoice'}
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {isEditing ? `Editing invoice #${invoice?.invoiceNumber}` : 'Create a new invoice'}
          </p>
        </div>
      </div>

      <InvoiceForm
        initialData={invoice}
        onSubmit={mutation.mutate}
        loading={mutation.isPending}
      />
    </div>
  )
}