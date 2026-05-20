import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi'
import { customersApi } from '../api/customers'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { formatDate } from '../utils/formatters'

const schema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Valid email required'),
  phone:   z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city:    z.string().optional(),
  country: z.string().optional(),
  status:  z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

function CustomerModal({ isOpen, onClose, customer, onSubmit, loading }) {
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: customer || { status: 'ACTIVE' } })

  React.useEffect(() => {
    if (customer) reset(customer)
    else reset({ status: 'ACTIVE' })
  }, [customer, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'New Customer'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input
              {...register('name')}
              placeholder="John Doe"
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input
              {...register('email')}
              type="email"
              placeholder="john@company.com"
              className={`form-input ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input {...register('phone')} placeholder="+1 555 000 0000" className="form-input" />
          </div>
          <div>
            <label className="form-label">Company</label>
            <input {...register('company')} placeholder="Company Ltd." className="form-input" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Address</label>
            <input {...register('address')} placeholder="123 Main St" className="form-input" />
          </div>
          <div>
            <label className="form-label">City</label>
            <input {...register('city')} placeholder="New York" className="form-input" />
          </div>
          <div>
            <label className="form-label">Country</label>
            <input {...register('country')} placeholder="USA" className="form-input" />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select {...register('status')} className="form-input">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {customer ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Customers() {
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(0)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editCustomer, setEdit]     = useState(null)
  const queryClient                 = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, page }],
    queryFn:  () => customersApi.getAll({ page, size: 10, search, sort: 'name,asc' })
                                .then((r) => r.data),
    keepPreviousData: true,
  })

  const saveMutation = useMutation({
    mutationFn: (data) => editCustomer
      ? customersApi.update(editCustomer.id, data)
      : customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success(editCustomer ? 'Customer updated!' : 'Customer created!')
      setModalOpen(false)
      setEdit(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save customer'),
  })

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer deleted')
    },
    onError: () => toast.error('Failed to delete customer'),
  })

  const customers = data?.content || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Customers</h2>
          <p className="text-slate-400 text-sm mt-0.5">{data?.totalElements || 0} total customers</p>
        </div>
        <Button onClick={() => { setEdit(null); setModalOpen(true) }}>
          <FiPlus size={16} /> Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative max-w-sm">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search customers..."
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Customer', 'Contact', 'Company', 'Location', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : customers.length > 0
              ? customers.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center 
                                        justify-center text-blue-400 text-sm font-semibold">
                          {c.name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <span className="font-medium text-slate-200">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 text-sm">{c.email}</div>
                      {c.phone && <div className="text-slate-500 text-xs">{c.phone}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{c.company || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {[c.city, c.country].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="py-3 px-4"><Badge status={c.status} /></td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(c.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEdit(c); setModalOpen(true) }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 
                                     rounded-lg transition-all"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this customer?')) deleteMutation.mutate(c.id)
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 
                                     rounded-lg transition-all"
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
                    No customers yet. Add your first customer!
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEdit(null) }}
        customer={editCustomer}
        onSubmit={saveMutation.mutate}
        loading={saveMutation.isPending}
      />
    </div>
  )
}