import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../../api/customers'
import { productsApi } from '../../api/products'
import { formatCurrency, generateInvoiceNumber } from '../../utils/formatters'
import Button from '../common/Button'

const lineItemSchema = z.object({
  productId:   z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity:    z.coerce.number().min(1, 'Min quantity is 1'),
  unitPrice:   z.coerce.number().min(0, 'Price must be positive'),
  discount:    z.coerce.number().min(0).max(100).default(0),
  taxRate:     z.coerce.number().min(0).max(100).default(0),
})

const schema = z.object({
  invoiceNumber: z.string().min(1),
  customerId:    z.string().min(1, 'Please select a customer'),
  issueDate:     z.string().min(1, 'Issue date is required'),
  dueDate:       z.string().min(1, 'Due date is required'),
  status:        z.enum(['DRAFT', 'SENT']).default('DRAFT'),
  notes:         z.string().optional(),
  terms:         z.string().optional(),
  lineItems:     z.array(lineItemSchema).min(1, 'Add at least one line item'),
})

export default function InvoiceForm({ initialData, onSubmit, loading }) {
  const {
    register, control, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      invoiceNumber: generateInvoiceNumber(),
      issueDate:     new Date().toISOString().slice(0, 10),
      dueDate:       new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      status:        'DRAFT',
      lineItems:     [{ description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })
  const lineItems = watch('lineItems')

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll({ size: 1000 }).then((r) => r.data?.content || []),
  })

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => productsApi.getAll({ size: 1000 }).then((r) => r.data?.content || []),
  })

  const handleProductSelect = (index, productId) => {
    const product = products?.find((p) => p.id === productId)
    if (product) {
      setValue(`lineItems.${index}.description`, product.name)
      setValue(`lineItems.${index}.unitPrice`, product.price)
      setValue(`lineItems.${index}.taxRate`, product.taxRate || 0)
    }
  }

  const calcLineTotal = (item) => {
    const base     = (item.quantity || 0) * (item.unitPrice || 0)
    const discount = base * ((item.discount || 0) / 100)
    const tax      = (base - discount) * ((item.taxRate || 0) / 100)
    return base - discount + tax
  }

  const subtotal  = lineItems?.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0) || 0
  const totalDisc = lineItems?.reduce((s, i) => {
    const base = (i.quantity || 0) * (i.unitPrice || 0)
    return s + base * ((i.discount || 0) / 100)
  }, 0) || 0
  const totalTax  = lineItems?.reduce((s, i) => {
    const base = (i.quantity || 0) * (i.unitPrice || 0)
    const disc = base * ((i.discount || 0) / 100)
    return s + (base - disc) * ((i.taxRate || 0) / 100)
  }, 0) || 0
  const grandTotal = subtotal - totalDisc + totalTax

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Fields */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
          Invoice Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Invoice Number <span className="text-red-400">*</span></label>
            <input {...register('invoiceNumber')} className="form-input font-mono" readOnly />
          </div>
          <div>
            <label className="form-label">Issue Date <span className="text-red-400">*</span></label>
            <input {...register('issueDate')} type="date" className="form-input" />
            {errors.issueDate && <p className="form-error">{errors.issueDate.message}</p>}
          </div>
          <div>
            <label className="form-label">Due Date <span className="text-red-400">*</span></label>
            <input {...register('dueDate')} type="date" className="form-input" />
            {errors.dueDate && <p className="form-error">{errors.dueDate.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="form-label">Customer <span className="text-red-400">*</span></label>
            <select
              {...register('customerId')}
              className={`form-input ${errors.customerId ? 'border-red-500' : ''}`}
            >
              <option value="">-- Select a customer --</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.customerId && <p className="form-error">{errors.customerId.message}</p>}
          </div>
          <div>
            <label className="form-label">Status</label>
            <select {...register('status')} className="form-input">
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Line Items
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 })}
          >
            <FiPlus size={14} /> Add Item
          </Button>
        </div>

        {errors.lineItems && typeof errors.lineItems === 'object' && !Array.isArray(errors.lineItems) && (
          <p className="form-error mb-3">{errors.lineItems.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="grid grid-cols-12 gap-3 items-start">
                {/* Product Selector */}
                <div className="col-span-12 sm:col-span-3">
                  <label className="form-label text-xs">Product (optional)</label>
                  <select
                    className="form-input text-sm"
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Select product...</option>
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="col-span-12 sm:col-span-4">
                  <label className="form-label text-xs">Description *</label>
                  <input
                    {...register(`lineItems.${index}.description`)}
                    placeholder="Service or product description"
                    className={`form-input text-sm ${
                      errors.lineItems?.[index]?.description ? 'border-red-500' : ''
                    }`}
                  />
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-1">
                  <label className="form-label text-xs">Qty *</label>
                  <input
                    {...register(`lineItems.${index}.quantity`)}
                    type="number"
                    min="1"
                    className="form-input text-sm"
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-4 sm:col-span-1">
                  <label className="form-label text-xs">Price *</label>
                  <input
                    {...register(`lineItems.${index}.unitPrice`)}
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input text-sm"
                  />
                </div>

                {/* Discount % */}
                <div className="col-span-4 sm:col-span-1">
                  <label className="form-label text-xs">Disc %</label>
                  <input
                    {...register(`lineItems.${index}.discount`)}
                    type="number"
                    min="0"
                    max="100"
                    className="form-input text-sm"
                  />
                </div>

                {/* Tax % */}
                <div className="col-span-5 sm:col-span-1">
                  <label className="form-label text-xs">Tax %</label>
                  <input
                    {...register(`lineItems.${index}.taxRate`)}
                    type="number"
                    min="0"
                    max="100"
                    className="form-input text-sm"
                  />
                </div>

                {/* Total */}
                <div className="col-span-5 sm:col-span-1">
                  <label className="form-label text-xs">Total</label>
                  <div className="form-input text-sm font-semibold text-blue-400 bg-slate-800/50">
                    {formatCurrency(calcLineTotal(lineItems?.[index] || {}))}
                  </div>
                </div>

                {/* Delete */}
                <div className="col-span-2 sm:col-span-1 flex items-end justify-end pb-0.5">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-slate-500 hover:text-red-400 p-2 rounded-lg
                               hover:bg-red-500/10 transition-all disabled:opacity-30
                               disabled:cursor-not-allowed"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-300">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Discounts</span>
              <span className="text-red-400">-{formatCurrency(totalDisc)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Tax</span>
              <span className="text-slate-300">{formatCurrency(totalTax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-slate-700 
                            pt-2 text-slate-100">
              <span>Total</span>
              <span className="text-blue-400">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Additional notes for the customer..."
              className="form-input resize-none"
            />
          </div>
          <div>
            <label className="form-label">Payment Terms</label>
            <textarea
              {...register('terms')}
              rows={3}
              placeholder="Payment terms and conditions..."
              className="form-input resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" size="lg">
          Cancel
        </Button>
        <Button type="submit" size="lg" loading={loading}>
          <FiSave size={16} />
          {initialData ? 'Update Invoice' : 'Save Invoice'}
        </Button>
      </div>
    </form>
  )
}