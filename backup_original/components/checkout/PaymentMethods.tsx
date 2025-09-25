'use client'

import { useState } from 'react'
import { CreditCard, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentProviderKey } from '@/types'

interface PaymentMethodsProps {
  selectedMethod: PaymentProviderKey | null
  onMethodSelect: (method: PaymentProviderKey) => void
  disabled?: boolean
}

export function PaymentMethods({
  selectedMethod,
  onMethodSelect,
  disabled = false,
}: PaymentMethodsProps) {
  const paymentMethods = [
    {
      id: 'stripe' as PaymentProviderKey,
      name: 'Credit/Debit Card',
      description: 'Pay securely with Visa, Mastercard, American Express',
      icon: CreditCard,
      acceptedCards: ['visa', 'mastercard', 'amex', 'discover'],
    },
    {
      id: 'paypal' as PaymentProviderKey,
      name: 'PayPal',
      description: 'Pay with your PayPal account or card',
      icon: DollarSign,
      acceptedCards: [],
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>

      <div className="space-y-3">
        {paymentMethods.map(method => {
          const IconComponent = method.icon
          const isSelected = selectedMethod === method.id

          return (
            <div
              key={method.id}
              className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={() => !disabled && onMethodSelect(method.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.id}
                    checked={isSelected}
                    onChange={() => onMethodSelect(method.id)}
                    disabled={disabled}
                    className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    {method.description}
                  </p>

                  {method.acceptedCards.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Accepted:</span>
                      <div className="flex space-x-1">
                        {method.acceptedCards.map(card => (
                          <div
                            key={card}
                            className="flex h-5 w-8 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600"
                          >
                            {card === 'visa' && 'VISA'}
                            {card === 'mastercard' && 'MC'}
                            {card === 'amex' && 'AMEX'}
                            {card === 'discover' && 'DISC'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {method.id === 'paypal' && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex h-6 w-16 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
                        PayPal
                      </div>
                      <span className="text-xs text-gray-500">
                        Secure payments powered by PayPal
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="absolute right-2 top-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <div className="flex items-center space-x-2">
          <svg
            className="h-4 w-4 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-gray-700">
            Your payment information is secured with 256-bit SSL encryption
          </span>
        </div>
      </div>
    </div>
  )
}
