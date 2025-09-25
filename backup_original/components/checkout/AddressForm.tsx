'use client'

import { Control, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressData } from '@/lib/validations'

interface AddressFormProps {
  control: Control<any>
  namePrefix: string
  errors?: any
  title?: string
}

export function AddressForm({
  control,
  namePrefix,
  errors,
  title,
}: AddressFormProps) {
  const states = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ]

  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'MX', label: 'Mexico' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'AU', label: 'Australia' },
  ]

  const getFieldError = (fieldName: string) => {
    return errors?.[namePrefix]?.[fieldName]
  }

  return (
    <div className="space-y-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}.firstName`}>First Name *</Label>
          <Controller
            name={`${namePrefix}.firstName`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${namePrefix}.firstName`}
                className={getFieldError('firstName') ? 'border-red-500' : ''}
              />
            )}
          />
          {getFieldError('firstName') && (
            <p className="text-sm text-red-500">
              {getFieldError('firstName').message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}.lastName`}>Last Name *</Label>
          <Controller
            name={`${namePrefix}.lastName`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${namePrefix}.lastName`}
                className={getFieldError('lastName') ? 'border-red-500' : ''}
              />
            )}
          />
          {getFieldError('lastName') && (
            <p className="text-sm text-red-500">
              {getFieldError('lastName').message}
            </p>
          )}
        </div>

        {/* Company */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${namePrefix}.company`}>Company (Optional)</Label>
          <Controller
            name={`${namePrefix}.company`}
            control={control}
            render={({ field }) => (
              <Input {...field} id={`${namePrefix}.company`} />
            )}
          />
        </div>

        {/* Street Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${namePrefix}.street`}>Street Address *</Label>
          <Controller
            name={`${namePrefix}.street`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${namePrefix}.street`}
                className={getFieldError('street') ? 'border-red-500' : ''}
              />
            )}
          />
          {getFieldError('street') && (
            <p className="text-sm text-red-500">
              {getFieldError('street').message}
            </p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}.city`}>City *</Label>
          <Controller
            name={`${namePrefix}.city`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${namePrefix}.city`}
                className={getFieldError('city') ? 'border-red-500' : ''}
              />
            )}
          />
          {getFieldError('city') && (
            <p className="text-sm text-red-500">
              {getFieldError('city').message}
            </p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}.state`}>State *</Label>
          <Controller
            name={`${namePrefix}.state`}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className={getFieldError('state') ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {getFieldError('state') && (
            <p className="text-sm text-red-500">
              {getFieldError('state').message}
            </p>
          )}
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}.postalCode`}>Postal Code *</Label>
          <Controller
            name={`${namePrefix}.postalCode`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id={`${namePrefix}.postalCode`}
                className={getFieldError('postalCode') ? 'border-red-500' : ''}
              />
            )}
          />
          {getFieldError('postalCode') && (
            <p className="text-sm text-red-500">
              {getFieldError('postalCode').message}
            </p>
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}.country`}>Country *</Label>
          <Controller
            name={`${namePrefix}.country`}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className={getFieldError('country') ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {getFieldError('country') && (
            <p className="text-sm text-red-500">
              {getFieldError('country').message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${namePrefix}.phone`}>Phone Number (Optional)</Label>
          <Controller
            name={`${namePrefix}.phone`}
            control={control}
            render={({ field }) => (
              <Input {...field} id={`${namePrefix}.phone`} type="tel" />
            )}
          />
        </div>
      </div>
    </div>
  )
}
