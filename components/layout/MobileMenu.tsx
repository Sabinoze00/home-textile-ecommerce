'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { navigationItems } from './Navigation'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Handle scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Handle focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const drawer = drawerRef.current
      const focusableElements = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement?.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement?.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleTabKey)

      // Focus the first element (close button) after a small delay
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)

      return () => {
        document.removeEventListener('keydown', handleTabKey)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop Overlay - covers only the right 25% */}
      <div
        className="fixed inset-0 left-[75vw] z-40 bg-black/50"
        style={{
          margin: 0,
          padding: 0,
          animation: 'fadeIn 300ms ease-out forwards',
        }}
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div
        ref={drawerRef}
        className="fixed left-0 top-0 z-50 h-screen w-[75vw] bg-white shadow-xl"
        style={{
          animation: 'slideInFromLeft 300ms ease-out forwards',
          margin: 0,
          padding: 0,
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <span className="font-display text-xl font-semibold text-textile-navy">
            Menu
          </span>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex flex-col overflow-y-auto py-4">
          {navigationItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`border-b border-gray-100 px-6 py-4 text-base font-medium transition-colors duration-200 hover:bg-gray-50 ${
                item.highlight
                  ? 'font-semibold text-red-600'
                  : 'text-gray-700 hover:text-textile-navy'
              }`}
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
