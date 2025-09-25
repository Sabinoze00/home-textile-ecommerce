'use client'

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  onClick?: () => void
  loading?: boolean
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
  },
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'blue',
  onClick,
  loading = false,
}: MetricCardProps) {
  const colors = colorConfig[color]

  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            <div className={`h-10 w-10 ${colors.bg} rounded-lg`}></div>
          </div>
          <div className="mb-2 h-8 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-600">
            {title}
          </CardTitle>
          <div
            className={`h-10 w-10 ${colors.bg} ${colors.border} flex items-center justify-center rounded-lg border`}
          >
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        </div>

        <div className="mb-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>

        {change !== undefined && (
          <div className="flex items-center">
            {getTrendIcon()}
            <span className={`ml-1 text-sm font-medium ${getTrendColor()}`}>
              {change > 0 ? '+' : ''}
              {change.toFixed(1)}%
            </span>
            <span className="ml-2 text-sm text-gray-500">vs last month</span>
          </div>
        )}

        {/* Additional context or description */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            Updated {new Date().toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}