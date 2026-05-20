import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import { productsApi } from '../api/products'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import { formatCurrency } from '../utils/formatters'

const schema = z.object({
  name:        z.string().min(2, 'Name required'),
  description: z.string().optional(),
  price:       z.coerce.number().min(0, 'Price must be positive'),
  unit:        z.string().default('item'),
  taxRate:     z.coerce.number().min(0).max(100).default(0),
  sku:         z.string().optional(),
  category:    z.string().optional(),
  status:      z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

function ProductModal({ isOpen, onClose, product, onSubmit, loading }) {
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  React.useEffect(() => {
    if (product) reset(product)
    else reset({ unit: 'item', taxRate: 0, status: 'ACTIVE' })
  }, [product, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'New Product'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Product Name *</label>
            <input
              {...register('name')}
              placeholder="Product or service name"
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="form-label">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Optional description..."
              className="form-input resize-none"
            />
          </div>
          <div>
            <label className="form-label">Price *</label>
            <input
              {...register('price')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={`form-input ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && <p className="form-error">{errors.price.message}</p>}
          </div>
          <div>
            <label className="form-label">Unit</label>
            <input {...register('unit')} placeholder="item, hour, kg..." className="form-input" />
          </div>
          <div>
            <label className="form-label">Tax Rate (%)</label>
            <input
              {...register('taxRate')}
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">SKU</label>
            <input {...register('sku')} placeholder="SKU-001" className="form-input" />
          </div>
          <div>
            <label className="form-label">Category</label>
            <input {...register('category')} placeholder="Electronics, Services..." className="form-input" />
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
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Products() {
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEdit]    = useState(null)
  const queryClient               = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, page }],
    queryFn:  () => productsApi.getAll({ page, size: 10, search }).then((r) => r.data),
    keepPreviousData: true,
  })

  const saveMutation = useMutation({
    mutationFn: (data) => editProduct
      ? productsApi.update(editProduct.id, data)
      : productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(editProduct ? 'Product updated!' : 'Product created!')
      setModalOpen(false)
      setEdit(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save product'),
  })

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
    },
    onError: () => toast.error('Failed to delete product'),
  })

  const products = data?.content || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Products & Services</h2>
          <p className="text-slate-400 text-sm mt-0.5">{data?.totalElements || 0} total items</p>
        </div>
        <Button onClick={() => { setEdit(null); setModalOpen(true) }}>
          <FiPlus size={16} /> Add Product
        </Button>
      </div>

      <div className="glass-card p-4">
        <div className="relative max-w-sm">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search products..."
            className="form-input pl-10"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Product', 'SKU', 'Category', 'Price', 'Tax', 'Unit', 'Status', 'Actions'].map((h) => (
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
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : products.length > 0
              ? products.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-48">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">{p.sku || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{p.category || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{formatCurrency(p.price)}</td>
                    <td className="py-3 px-4 text-slate-400">{p.taxRate}%</td>
                    <td className="py-3 px-4 text-slate-400">{p.unit}</td>
                    <td className="py-3 px-4"><Badge status={p.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEdit(p); setModalOpen(true) }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 
                                     rounded-lg transition-all"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this product?')) deleteMutation.mutate(p.id)
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
                  <td colSpan={8} className="py-14 text-center text-slate-500">
                    No products yet. Add your first product!
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEdit(null) }}
        product={editProduct}
        onSubmit={saveMutation.mutate}
        loading={saveMutation.isPending}
      />
    </div>
  )
}