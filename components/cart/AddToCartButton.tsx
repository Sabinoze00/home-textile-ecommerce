'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Plus } from 'lucide-react'
import { Product, ProductVariant } from '@/types'
import { useCart } from '@/hooks/use-cart'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps
  extends Omit<ButtonProps, 'onClick' | 'variant'> {
  product: Product
  productVariant?: ProductVariant
  quantity?: number
  showIcon?: boolean
  successText?: string
  onAddToCart?: (
    product: Product,
    variant?: ProductVariant,
    quantity?: number
  ) => void
  variant?: ButtonProps['variant']
}

export function AddToCartButton({
  product,
  productVariant,
  quantity = 1,
  showIcon = true,
  successText = 'Added!',
  onAddToCart,
  children,
  className,
  variant: buttonVariant = 'default',
  size = 'default',
  disabled,
  ...props
}: AddToCartButtonProps) {
  const { addItem, getItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isOutOfStock =
    !product.inStock || (productVariant && productVariant.inStock === false)
  const existingItem = getItem(
    product.id.toString(),
    productVariant?.id.toString()
  )
  const isDisabled = disabled || isOutOfStock || isAdding

  const handleAddToCart = async () => {
    if (isDisabled) return

    setIsAdding(true)

    try {
      // Call custom onAddToCart if provided
      if (onAddToCart) {
        onAddToCart(product, productVariant, quantity)
      } else {
        addItem(product, productVariant, quantity)
      }

      // Show success state
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      console.error('Error adding item to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const getButtonText = () => {
    if (isOutOfStock) return 'Out of Stock'
    if (isAdding) return 'Adding...'
    if (justAdded) return successText
    if (existingItem) return 'Update Cart'
    return children || 'Add to Cart'
  }

  const getButtonIcon = () => {
    if (!showIcon) return null
    if (justAdded) return <Check className="h-4 w-4" />
    if (existingItem) return <Plus className="h-4 w-4" />
    return <ShoppingCart className="h-4 w-4" />
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      variant={isOutOfStock ? 'outline' : justAdded ? 'default' : buttonVariant}
      size={size}
      className={cn(
        'transition-all duration-200',
        justAdded && 'bg-green-600 hover:bg-green-700',
        isOutOfStock && 'cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    >
      {showIcon && getButtonIcon() && (
        <span className="mr-2">{getButtonIcon()}</span>
      )}
      {getButtonText()}
    </Button>
  )
}

// Variant for icon-only button (useful for product cards)
interface AddToCartIconButtonProps
  extends Omit<AddToCartButtonProps, 'children' | 'showIcon'> {
  tooltipText?: string
}

export function AddToCartIconButton({
  product,
  productVariant,
  quantity = 1,
  onAddToCart,
  className,
  size = 'icon',
  ...props
}: AddToCartIconButtonProps) {
  return (
    <AddToCartButton
      product={product}
      productVariant={productVariant}
      quantity={quantity}
      onAddToCart={onAddToCart}
      showIcon={false}
      size={size}
      className={cn('aspect-square', className)}
      {...props}
    >
      <ShoppingCart className="h-4 w-4" />
    </AddToCartButton>
  )
}

// Variant with quantity selector
interface AddToCartWithQuantityProps
  extends Omit<AddToCartButtonProps, 'quantity'> {
  defaultQuantity?: number
  maxQuantity?: number
  showQuantitySelector?: boolean
}

export function AddToCartWithQuantity({
  product,
  productVariant,
  defaultQuantity = 1,
  maxQuantity = 10,
  showQuantitySelector = true,
  onAddToCart,
  className,
  ...props
}: AddToCartWithQuantityProps) {
  const [quantity, setQuantity] = useState(defaultQuantity)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {showQuantitySelector && (
        <div className="flex items-center rounded-md border border-gray-300">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Plus className="h-3 w-3 rotate-45" />
          </Button>
          <span className="min-w-[2rem] px-2 text-center text-sm font-medium">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}

      <AddToCartButton
        product={product}
        productVariant={productVariant}
        quantity={quantity}
        onAddToCart={onAddToCart}
        className="flex-1"
        {...props}
      />
    </div>
  )
}
