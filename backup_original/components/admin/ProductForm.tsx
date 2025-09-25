'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AdminProductSchema, type AdminProductData } from '@/lib/validations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  product?: AdminProductData & { id?: string }
  mode?: 'create' | 'edit'
}

export function ProductForm({
  open,
  onOpenChange,
  onSuccess,
  product,
  mode = 'create',
}: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<
    { url: string; alt: string; isPrimary?: boolean }[]
  >(product?.images || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AdminProductData>({
    resolver: zodResolver(AdminProductSchema),
    defaultValues: product || {
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: 0,
      originalPrice: 0,
      sku: '',
      stockQuantity: 0,
      categoryId: '',
      tags: [],
      isFeatured: false,
      isOnSale: false,
      isNew: false,
      isBestseller: false,
      inStock: true,
      images: [],
    },
  })

  const name = watch('name')

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', slug)
    }
  }, [name, mode, setValue])

  // Update images in form when images state changes
  useEffect(() => {
    setValue('images', images)
  }, [images, setValue])

  useEffect(() => {
    if (open) {
      fetchCategories()
      if (product) {
        reset(product)
        setImages(product.images || [])
      }
    }
  }, [open, product, reset])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (response.ok && data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const addImage = () => {
    setImages([...images, { url: '', alt: '', isPrimary: images.length === 0 }])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // If we removed the primary image, make the first image primary
    if (newImages.length > 0 && images[index]?.isPrimary) {
      newImages[0].isPrimary = true
    }
    setImages(newImages)
  }

  const updateImage = (index: number, field: 'url' | 'alt', value: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    setImages(newImages)
  }

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    setImages(newImages)
  }

  const onSubmit = async (data: AdminProductData) => {
    try {
      setLoading(true)

      const formData = {
        ...data,
        images: images.filter(img => img.url.trim()),
        tags: data.tags || [],
      }

      const url =
        mode === 'edit' && product?.id
          ? '/api/admin/products'
          : '/api/admin/products'

      const method = mode === 'edit' ? 'PUT' : 'POST'
      const payload =
        mode === 'edit' && product?.id
          ? { id: product.id, ...formData }
          : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${mode} product`)
      }

      onSuccess()
      onOpenChange(false)
      reset()
      setImages([])
    } catch (error) {
      console.error(
        `Error ${mode === 'edit' ? 'updating' : 'creating'} product:`,
        error
      )
      alert(
        error instanceof Error ? error.message : `Failed to ${mode} product`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the product information below.'
              : 'Fill in the details to create a new product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="product-slug"
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                {...register('shortDescription')}
                placeholder="Brief product summary"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('originalPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Inventory</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="PRODUCT-001"
                />
                {errors.sku && (
                  <p className="text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  {...register('stockQuantity', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select onValueChange={value => setValue('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          {/* Product Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Options</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStock"
                  {...register('inStock')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register('isFeatured')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOnSale"
                  {...register('isOnSale')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isOnSale">On Sale</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isNew"
                  {...register('isNew')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isNew">New</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBestseller"
                  {...register('isBestseller')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isBestseller">Bestseller</Label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Product Images</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImage}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </div>

            <div className="space-y-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md border p-3"
                >
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <Input
                      placeholder="Image URL"
                      value={image.url}
                      onChange={e => updateImage(index, 'url', e.target.value)}
                    />
                    <Input
                      placeholder="Alt text"
                      value={image.alt}
                      onChange={e => updateImage(index, 'alt', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`rounded px-2 py-1 text-xs ${
                        image.isPrimary
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {image.isPrimary ? 'Primary' : 'Set Primary'}
                    </button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'edit' ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
