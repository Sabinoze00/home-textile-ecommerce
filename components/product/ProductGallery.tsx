'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
  className?: string
  selectedVariantImage?: string
}

export function ProductGallery({
  images,
  productName,
  className,
  selectedVariantImage,
}: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const mainImageRef = useRef<HTMLDivElement>(null)

  // Use variant image if selected, otherwise use the images array
  const displayImages = selectedVariantImage
    ? [
        {
          id: 'variant',
          url: selectedVariantImage,
          alt: productName,
          isPrimary: true,
          sortOrder: 0,
        },
        ...images,
      ]
    : images

  const selectedImage = displayImages[selectedImageIndex]

  useEffect(() => {
    return () => {
      // ensure cleanup on unmount
      document.body.style.overflow = 'auto'
    }
  }, [])

  // Return early if no image is available
  if (!selectedImage) {
    return (
      <div className={cn('flex h-96 items-center justify-center rounded-lg bg-gray-100', className)}>
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  const nextImage = () => {
    setSelectedImageIndex(prev =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setSelectedImageIndex(prev =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return

    const rect = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
  }

  const openZoom = () => {
    setIsZoomOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeZoom = () => {
    setIsZoomOpen(false)
    document.body.style.overflow = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeZoom()
    } else if (e.key === 'ArrowLeft') {
      prevImage()
    } else if (e.key === 'ArrowRight') {
      nextImage()
    }
  }

  if (!displayImages || displayImages.length === 0) {
    return (
      <div
        className={cn(
          'flex aspect-square items-center justify-center rounded-lg bg-gray-200',
          className
        )}
      >
        <span className="text-gray-400">No images available</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div className="group relative">
        <div
          ref={mainImageRef}
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-gray-100"
          onMouseMove={handleMouseMove}
          onClick={openZoom}
        >
          <Image
            src={selectedImage.url}
            alt={selectedImage.alt || productName}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          {/* Zoom indicator */}
          <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="rounded-full bg-black/70 p-2 text-white">
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>

          {/* Navigation arrows for mobile */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 md:hidden"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 md:hidden"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
            {selectedImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
          {displayImages.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-md border-2 transition-all duration-200',
                selectedImageIndex === index
                  ? 'border-textile-navy ring-2 ring-textile-navy ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400'
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 25vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeZoom}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeZoom}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close zoom"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation buttons */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Zoomed image */}
          <div className="relative m-8 max-h-full max-w-full">
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt || productName}
              width={1200}
              height={1200}
              className="max-h-full max-w-full object-contain"
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />
          </div>

          {/* Image info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-white">
            <span className="text-sm">
              {selectedImageIndex + 1} of {displayImages.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
