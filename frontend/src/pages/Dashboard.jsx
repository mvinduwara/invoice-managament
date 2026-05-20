import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  FiFileText, FiDollarSign, FiUsers,
  FiAlertCircle, FiArrowRight
} from 'react-icons/fi'
import StatCard from '../components/common/StatCard'
import RevenueChart from '../components/charts/RevenueChart'
import StatusChart from '../components/charts/StatusChart'
import Badge from '../components/common/Badge'
import { invoicesApi } from '../api/invoices'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: () => invoicesApi.getStats().then((r) => r.data),
    refetchInterval: 60000,
  })

  const { data: recentInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: () => invoicesApi.getAll({ page: 0, size: 5, sort: 'createdAt,desc' })
                              .then((r) => r.data),
  })

  // Fallback demo data for charts
  const revenueData = stats?.monthlyRevenue || [
    { month: 'Jan', revenue: 12000 }, { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 15000 }, { month: 'Apr', revenue: 24000 },
    { month: 'May', revenue: 21000 }, { month: 'Jun', revenue: 28000 },
    { month: 'Jul', revenue: 32000 }, { month: 'Aug', revenue: 27000 },
    { month: 'Sep', revenue: 35000 }, { month: 'Oct', revenue: 41000 },
    { month: 'Nov', revenue: 38000 }, { month: 'Dec', revenue: 45000 },
  ]

  const statusData = stats?.statusBreakdown || [
    { name: 'Paid',      value: 45 },
    { name: 'Sent',      value: 23 },
    { name: 'Draft',     value: 18 },
    { name: 'Overdue',   value: 10 },
    { name: 'Cancelled', value: 4 },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={statsLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
          icon={FiDollarSign}
          color="blue"
          trend={12.5}
          subtitle="All time"
        />
        <StatCard
          title="Total Invoices"
          value={statsLoading ? '...' : stats?.totalInvoices || 0}
          icon={FiFileText}
          color="purple"
          trend={8.2}
          subtitle="All statuses"
        />
        <StatCard
          title="Active Customers"
          value={statsLoading ? '...' : stats?.totalCustomers || 0}
          icon={FiUsers}
          color="green"
          trend={3.1}
          subtitle="Unique clients"
        />
        <StatCard
          title="Overdue"
          value={statsLoading ? '...' : formatCurrency(stats?.overdueAmount || 0)}
          icon={FiAlertCircle}
          color="red"
          subtitle="Requires attention"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart — 2/3 width */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-100">Revenue Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly revenue for current year</p>
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>

        {/* Status Breakdown — 1/3 width */}
        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-100">Invoice Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution by status</p>
          </div>
          <StatusChart data={statusData} />
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h3 className="font-semibold text-slate-100">Recent Invoices</h3>
          <Link
            to="/invoices"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 
                       transition-colors"
          >
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Invoice #', 'Customer', 'Amount', 'Due Date', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-6 text-xs font-semibold 
                               text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoicesLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-700/30">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="py-3 px-6">
                          <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : recentInvoices?.content?.map((inv) => (
                    <tr key={inv.id} className="table-row">
                      <td className="py-3 px-6 font-mono text-blue-400 text-xs font-medium">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-6 text-slate-300">
                        {inv.customer?.name || '-'}
                      </td>
                      <td className="py-3 px-6 font-semibold text-slate-100">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-6 text-slate-400">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3 px-6">
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No invoices yet. Create your first invoice!
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}