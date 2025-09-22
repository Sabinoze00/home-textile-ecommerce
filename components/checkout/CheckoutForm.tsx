'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckoutSchema, type CheckoutData } from '@/lib/validations'
import { AddressForm } from './AddressForm'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CheckoutFormProps {
  onSubmit: (data: CheckoutData) => void
  isSubmitting: boolean
}

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutData>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      sameAsShipping: true,
    },
  })

  const shippingAddress = watch('shippingAddress')

  const handleFormSubmit = (data: CheckoutData) => {
    onSubmit(data)
  }

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked)
    setValue('sameAsShipping', checked)

    // If checked, copy shipping to billing
    if (checked && shippingAddress) {
      setValue('billingAddress', shippingAddress)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Shipping Address */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Shipping Address
        </h2>
        <AddressForm
          control={control}
          namePrefix="shippingAddress"
          errors={errors}
        />
      </div>

      {/* Billing Address */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Billing Address
          </h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsShipping"
              checked={sameAsShipping}
              onCheckedChange={handleSameAsShippingChange}
            />
            <Label htmlFor="sameAsShipping" className="text-sm">
              Same as shipping address
            </Label>
          </div>
        </div>

        {!sameAsShipping && (
          <AddressForm
            control={control}
            namePrefix="billingAddress"
            errors={errors}
          />
        )}
      </div>

      {/* Order Notes */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Order Notes (Optional)
        </h2>
        <div className="space-y-2">
          <Label htmlFor="notes">Special instructions or delivery notes</Label>
          <Textarea
            id="notes"
            placeholder="Any special instructions for your order..."
            {...register('notes')}
            rows={4}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </Button>

        <p className="mt-4 text-center text-xs text-gray-500">
          By placing this order, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </div>
    </form>
  )
}
