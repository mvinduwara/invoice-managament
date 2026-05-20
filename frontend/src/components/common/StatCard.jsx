import React from 'react'

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue', subtitle }) {
  const colors = {
    blue:   'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    green:  'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
    red:    'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
  }

  return (
    <div className={`glass-card p-6 bg-gradient-to-br border ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} opacity-80`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  )
}