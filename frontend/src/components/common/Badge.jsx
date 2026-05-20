import React from 'react'
import { getStatusColor } from '../../utils/formatters'

export default function Badge({ status, label }) {
  return (
    <span className={`badge border ${getStatusColor(status)}`}>
      {label || status}
    </span>
  )
}