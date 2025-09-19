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
  selectedVariantImage
}: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const mainImageRef = useRef<HTMLDivElement>(null)

  // Use variant image if selected, otherwise use the images array
  const displayImages = selectedVariantImage
    ? [{ id: 'variant', url: selectedVariantImage, alt: productName, isPrimary: true, sortOrder: 0 }, ...images]
    : images

  const selectedImage = displayImages[selectedImageIndex]

  useEffect(() => {
    return () => {
      // ensure cleanup on unmount
      document.body.style.overflow = 'auto'
    }
  }, [])

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
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
      <div className={cn('aspect-square bg-gray-200 rounded-lg flex items-center justify-center', className)}>
        <span className="text-gray-400">No images available</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div className="relative group">
        <div
          ref={mainImageRef}
          className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in"
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
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/70 text-white p-2 rounded-full">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>

          {/* Navigation arrows for mobile */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:hidden"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:hidden"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {selectedImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
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
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeZoom}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeZoom}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation buttons */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Zoomed image */}
          <div className="relative max-w-full max-h-full m-8">
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt || productName}
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />
          </div>

          {/* Image info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
            <span className="text-sm">
              {selectedImageIndex + 1} of {displayImages.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}