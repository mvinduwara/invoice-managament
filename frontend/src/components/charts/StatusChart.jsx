import React from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts'

// Consistent colors mapping to your dashboard theme
const STATUS_COLORS = {
  Paid: '#22c55e',      // green-500
  Sent: '#3b82f6',      // blue-500
  Draft: '#64748b',     // slate-500
  Overdue: '#ef4444',   // red-500
  Cancelled: '#f97316'  // orange-500
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 text-sm flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.payload.fill }} 
          />
          {data.name}: <span className="font-semibold text-slate-100">{data.value} Invoices</span>
        </p>
      </div>
    )
  }
  return null
}

export default function StatusChart({ data }) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={STATUS_COLORS[entry.name] || '#94a3b8'} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-slate-300 text-xs ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}