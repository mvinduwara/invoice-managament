import { format, parseISO } from 'date-fns'

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0)
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
  } catch {
    return dateString
  }
}

export const getStatusColor = (status) => {
  const colors = {
    DRAFT:     'bg-slate-500/20 text-slate-400 border-slate-500/30',
    SENT:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PAID:      'bg-green-500/20 text-green-400 border-green-500/30',
    OVERDUE:   'bg-red-500/20 text-red-400 border-red-500/30',
    CANCELLED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    PENDING:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    ACTIVE:    'bg-green-500/20 text-green-400 border-green-500/30',
    INACTIVE:  'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

export const generateInvoiceNumber = () => {
  const year  = new Date().getFullYear()
  const rand  = Math.floor(Math.random() * 9000) + 1000
  return `INV-${year}-${rand}`
}
