'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
  className?: string
  showRemoveButton?: boolean
  compact?: boolean
}

export function CartItem({
  item,
  className,
  showRemoveButton = true,
  compact = false,
}: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, newQuantity)
    }
  }

  const productUrl = `/products/${item.product.slug}`
  const primaryImage = item.product.images?.[0]
  const variantImage = item.variant?.image
  const displayImage =
    variantImage || primaryImage?.url || '/placeholder-image.jpg'

  return (
    <div
      className={cn(
        'flex gap-4 py-4',
        !compact && 'border-b border-gray-200 last:border-b-0',
        className
      )}
    >
      {/* Product Image */}
      <Link href={productUrl} className="flex-shrink-0">
        <div
          className={cn(
            'relative overflow-hidden rounded-lg bg-gray-100',
            compact ? 'h-16 w-16' : 'h-20 w-20'
          )}
        >
          <Image
            src={displayImage}
            alt={item.product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={productUrl} className="block">
            <h3
              className={cn(
                'font-medium text-gray-900 hover:text-gray-700',
                compact ? 'text-sm' : 'text-base'
              )}
            >
              {item.product.name}
            </h3>
          </Link>

          {item.variant && (
            <p
              className={cn(
                'text-gray-500',
                compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'
              )}
            >
              {item.variant.name}: {item.variant.value}
            </p>
          )}

          {!compact && item.product.sku && (
            <p className="mt-1 text-xs text-gray-400">
              SKU: {item.variant?.sku || item.product.sku}
            </p>
          )}
        </div>

        {/* Price and Controls */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <span
              className={cn(
                'font-semibold text-gray-900',
                compact ? 'text-sm' : 'text-base'
              )}
            >
              ${item.price.toFixed(2)}
            </span>
            {item.quantity > 1 && (
              <span
                className={cn(
                  'ml-2 text-gray-500',
                  compact ? 'text-xs' : 'text-sm'
                )}
              >
                (${(item.price * item.quantity).toFixed(2)} total)
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-md border border-gray-300">
              <Button
                variant="ghost"
                size={compact ? 'sm' : 'default'}
                className={cn(
                  'h-8 w-8 p-0 hover:bg-gray-100',
                  compact && 'h-6 w-6'
                )}
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className={cn('h-3 w-3', compact && 'h-2.5 w-2.5')} />
              </Button>

              <span
                className={cn(
                  'min-w-[2rem] px-2 text-center font-medium',
                  compact ? 'text-xs' : 'text-sm'
                )}
              >
                {item.quantity}
              </span>

              <Button
                variant="ghost"
                size={compact ? 'sm' : 'default'}
                className={cn(
                  'h-8 w-8 p-0 hover:bg-gray-100',
                  compact && 'h-6 w-6'
                )}
                onClick={() => handleQuantityChange(item.quantity + 1)}
              >
                <Plus className={cn('h-3 w-3', compact && 'h-2.5 w-2.5')} />
              </Button>
            </div>

            {showRemoveButton && (
              <Button
                variant="ghost"
                size={compact ? 'sm' : 'default'}
                className={cn(
                  'h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700',
                  compact && 'h-6 w-6'
                )}
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className={cn('h-3 w-3', compact && 'h-2.5 w-2.5')} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
