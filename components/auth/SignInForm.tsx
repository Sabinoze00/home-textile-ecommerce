'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Github, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SignInSchema, type SignInData } from '@/lib/validations'

interface SignInFormProps {
  className?: string
  redirectTo?: string
}

export function SignInForm({ className, redirectTo }: SignInFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = redirectTo || searchParams.get('callbackUrl') || '/'

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInData>({
    resolver: zodResolver(SignInSchema),
  })

  const onSubmit = async (data: SignInData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('email', {
        email: data.email,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError('Failed to send magic link. Please try again.')
      } else {
        setError(null)
        // Show success message
        alert('Check your email for a magic link to sign in!')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(provider, { callbackUrl })
    } catch (err) {
      setError('An error occurred during sign in. Please try again.')
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    setIsLoading(true)
    setError(null)

    const email = (document.getElementById('email') as HTMLInputElement)?.value

    if (!email || !z.string().email().safeParse(email).success) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError('Failed to send magic link. Please try again.')
      } else {
        setError(null)
        // Show success message or redirect to check email page
        alert('Check your email for a magic link to sign in!')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('w-full max-w-md space-y-6', className)}>
      {/* OAuth Providers */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn('github')}
          disabled={isLoading}
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Email Magic Link Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          <Mail className="mr-2 h-4 w-4" />
          {isLoading ? 'Sending...' : 'Send magic link'}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link
          href={`/auth/signup${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  )
}
