'use client'

import { useState, useRef, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'
import { AdminProductTableRow } from '@/types'
import {
  MoreHorizontal,
  Copy,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  FolderOpen,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ProductTableProps {
  products: AdminProductTableRow[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onPageChange: (page: number) => void
  onRefresh: () => void
  onSortingChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

const columnHelper = createColumnHelper<AdminProductTableRow>()

export function ProductTable({
  products,
  loading,
  pagination,
  onPageChange,
  onRefresh,
  onSortingChange,
}: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [editingCell, setEditingCell] = useState<{
    id: string
    field: string
  } | null>(null)
  const [tempValues, setTempValues] = useState<{ [key: string]: any }>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  // Handle sorting changes
  useEffect(() => {
    if (sorting.length > 0 && onSortingChange) {
      const sort = sorting[0]
      onSortingChange(sort.id, sort.desc ? 'desc' : 'asc')
    }
  }, [sorting, onSortingChange])

  const startEditing = (
    productId: string,
    field: string,
    currentValue: any
  ) => {
    setEditingCell({ id: productId, field })
    setTempValues({ [productId]: { [field]: currentValue } })
  }

  const cancelEditing = () => {
    setEditingCell(null)
    setTempValues({})
  }

  const saveEdit = async (productId: string, field: string, value: any) => {
    try {
      // Map status field to inStock for API compatibility
      const updateData: any = { id: productId }
      if (field === 'status') {
        updateData.inStock = value === 'active'
      } else {
        updateData[field] = value
      }

      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update product')
      }

      onRefresh()
      setEditingCell(null)
      setTempValues({})
    } catch (error) {
      console.error('Error updating product:', error)
      alert(error instanceof Error ? error.message : 'Failed to update product')
    }
  }

  const handleKeyPress = (
    e: React.KeyboardEvent,
    productId: string,
    field: string
  ) => {
    if (e.key === 'Enter') {
      const value = tempValues[productId]?.[field]
      if (value !== undefined) {
        saveEdit(productId, field, value)
      }
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  const updateTempValue = (productId: string, field: string, value: any) => {
    setTempValues(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }))
  }

  const columns = [
    // Selection column
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 40,
    }),

    // Product Image & Name
    columnHelper.accessor('name', {
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {row.original.image ? (
              <Image
                src={row.original.image}
                alt={row.original.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                <span className="text-xs text-gray-400">No Image</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-900">
              {row.original.name}
            </p>
            <p className="truncate text-sm text-gray-500">{row.original.sku}</p>
          </div>
        </div>
      ),
      size: 300,
    }),

    // Category
    columnHelper.accessor('category', {
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {getValue()}
        </span>
      ),
      size: 120,
    }),

    // Price
    columnHelper.accessor('price', {
      header: 'Price',
      cell: ({ getValue, row }) => {
        const productId = row.original.id
        const isEditing =
          editingCell?.id === productId && editingCell?.field === 'price'
        const currentValue = getValue()
        const tempValue = tempValues[productId]?.price

        if (isEditing) {
          return (
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              min="0"
              className="w-20 rounded border border-blue-500 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={tempValue ?? currentValue}
              onChange={e =>
                updateTempValue(
                  productId,
                  'price',
                  parseFloat(e.target.value) || 0
                )
              }
              onKeyDown={e => handleKeyPress(e, productId, 'price')}
              onBlur={() => {
                const value = tempValues[productId]?.price
                if (value !== undefined && value !== currentValue) {
                  saveEdit(productId, 'price', value)
                } else {
                  cancelEditing()
                }
              }}
            />
          )
        }

        return (
          <span
            className="cursor-pointer rounded px-2 py-1 font-medium text-gray-900 hover:bg-gray-100"
            onClick={() => startEditing(productId, 'price', currentValue)}
            title="Click to edit"
          >
            ${currentValue.toFixed(2)}
          </span>
        )
      },
      size: 100,
    }),

    // Stock
    columnHelper.accessor('stockQuantity', {
      header: 'Stock',
      cell: ({ getValue, row }) => {
        const productId = row.original.id
        const isEditing =
          editingCell?.id === productId &&
          editingCell?.field === 'stockQuantity'
        const currentValue = getValue()
        const tempValue = tempValues[productId]?.stockQuantity
        const stock = isEditing ? (tempValue ?? currentValue) : currentValue
        const isLowStock = stock < 10

        if (isEditing) {
          return (
            <input
              ref={inputRef}
              type="number"
              min="0"
              className="w-16 rounded border border-blue-500 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={tempValue ?? currentValue}
              onChange={e =>
                updateTempValue(
                  productId,
                  'stockQuantity',
                  parseInt(e.target.value) || 0
                )
              }
              onKeyDown={e => handleKeyPress(e, productId, 'stockQuantity')}
              onBlur={() => {
                const value = tempValues[productId]?.stockQuantity
                if (value !== undefined && value !== currentValue) {
                  saveEdit(productId, 'stockQuantity', value)
                } else {
                  cancelEditing()
                }
              }}
            />
          )
        }

        return (
          <div
            className="flex cursor-pointer items-center rounded px-2 py-1 hover:bg-gray-100"
            onClick={() =>
              startEditing(productId, 'stockQuantity', currentValue)
            }
            title="Click to edit"
          >
            <span
              className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}
            >
              {stock}
            </span>
            {isLowStock && (
              <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                Low
              </span>
            )}
          </div>
        )
      },
      size: 120,
    }),

    // Status
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue, row }) => {
        const productId = row.original.id
        const isEditing =
          editingCell?.id === productId && editingCell?.field === 'status'
        const currentValue = getValue()
        const tempValue = tempValues[productId]?.status
        const status = isEditing ? (tempValue ?? currentValue) : currentValue

        if (isEditing) {
          return (
            <select
              ref={inputRef as any}
              className="rounded border border-blue-500 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={tempValue ?? currentValue}
              onChange={e => {
                const newStatus = e.target.value as 'active' | 'inactive'
                updateTempValue(productId, 'status', newStatus)
              }}
              onKeyDown={e => handleKeyPress(e, productId, 'status')}
              onBlur={() => {
                const value = tempValues[productId]?.status
                if (value !== undefined && value !== currentValue) {
                  saveEdit(productId, 'status', value)
                } else {
                  cancelEditing()
                }
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )
        }

        return (
          <span
            className={`inline-flex cursor-pointer items-center rounded-full px-2.5 py-0.5 text-xs font-medium hover:opacity-80 ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => startEditing(productId, 'status', currentValue)}
            title="Click to edit"
          >
            {status === 'active' ? 'Active' : 'Inactive'}
          </span>
        )
      },
      size: 100,
    }),

    // Created Date
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500">
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
      size: 120,
    }),

    // Actions
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleProductStatus(row.original)}
          >
            {row.original.status === 'active' ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Toggle dropdown menu
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {/* Dropdown menu would go here */}
          </div>
        </div>
      ),
      size: 120,
    }),
  ]

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
  })

  const toggleProductStatus = async (product: AdminProductTableRow) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active'

      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product.id,
          inStock: newStatus === 'active',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update product status')
      }

      onRefresh()
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

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

  const handleBulkCategoryChange = async () => {
    if (selectedProductIds.length === 0 || !selectedCategory) return

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedProductIds,
          action: 'changeCategory',
          data: {
            categoryId: selectedCategory,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to change category')
      }

      setRowSelection({})
      setShowCategoryModal(false)
      setSelectedCategory('')
      onRefresh()
    } catch (error) {
      console.error('Error changing category:', error)
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedProductIds.length === 0) return

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'duplicate',
          productIds: selectedProductIds,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to duplicate products')
      }

      setRowSelection({})
      onRefresh()
    } catch (error) {
      console.error('Error duplicating products:', error)
    }
  }

  const selectedProductIds = table
    .getSelectedRowModel()
    .flatRows.map(row => row.original.id)

  const handleBulkAction = async (action: string) => {
    if (selectedProductIds.length === 0) return

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: selectedProductIds,
          action,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to perform bulk action')
      }

      // Reset selection after action
      setRowSelection({})
      onRefresh()
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/6 rounded bg-gray-200"></div>
                </div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
                <div className="h-4 w-12 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Bulk Actions */}
      {selectedProductIds.length > 0 && (
        <div className="border-b border-gray-200 bg-blue-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedProductIds.length} item
              {selectedProductIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('activate')}
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('deactivate')}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCategoryModal(true)
                  fetchCategories()
                }}
                className="flex items-center"
              >
                <FolderOpen className="mr-1 h-4 w-4" />
                Change Category
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDuplicate}
                className="flex items-center"
              >
                <Copy className="mr-1 h-4 w-4" />
                Duplicate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-1 ${
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <div className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No products found
          </h3>
          <p className="mb-6 text-gray-500">
            Get started by adding your first product to the catalog.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      )}

      {/* Category Change Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Change Category
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setSelectedCategory('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="mb-3 text-sm text-gray-600">
                Change category for {selectedProductIds.length} selected product
                {selectedProductIds.length > 1 ? 's' : ''}
              </p>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategoryModal(false)
                  setSelectedCategory('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkCategoryChange}
                disabled={!selectedCategory}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Change Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
