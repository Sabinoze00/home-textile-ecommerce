'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function Collapsible({
  title,
  children,
  defaultOpen = false,
  className,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn('border-b border-gray-200', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 text-left font-display text-[20px] font-bold text-gray-900 transition-colors hover:text-textile-navy"
      >
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-3 text-[14px] leading-relaxed text-gray-600">
          <div className="text-[14px]">{children}</div>
        </div>
      )}
    </div>
  )
}
