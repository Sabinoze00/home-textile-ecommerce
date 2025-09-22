'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn, debounce } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  placeholder?: string
}

interface SearchSuggestion {
  type: 'product' | 'category'
  name: string
  href: string
}

interface SearchResult {
  results: any[]
  suggestions: SearchSuggestion[]
  categories: SearchSuggestion[]
  query: string
  total: number
}

export function SearchBar({
  className = '',
  placeholder = 'Search for bedding, pillows, decor...',
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
    }
    setIsLoading(false)
  }, 300)

  useEffect(() => {
    if (searchTerm) {
      setIsLoading(true)
      debouncedSearch(searchTerm)
    } else {
      setSearchResults(null)
    }
  }, [searchTerm])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchTerm)}`)
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
    setSearchTerm('')
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults(null)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(true)
  }

  const handleInputFocus = () => {
    if (searchTerm || searchResults) {
      setIsOpen(true)
    }
  }

  const allSuggestions = searchResults
    ? [
        ...(searchResults.suggestions || []),
        ...(searchResults.categories || []),
      ]
    : []

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="h-10 w-full border-gray-300 pl-10 pr-10 focus:border-textile-navy focus:ring-textile-navy"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {isOpen && (searchResults || searchTerm) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {searchResults && (
            <>
              {/* Quick Results */}
              {searchResults.results && searchResults.results.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Products
                  </div>
                  {searchResults.results.slice(0, 3).map((product, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleSuggestionClick(`/products/${product.slug}`)
                      }
                      className="flex w-full items-center gap-3 rounded px-2 py-2 text-left hover:bg-gray-50"
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.category.name} • ${product.price}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {allSuggestions.length > 0 && (
                <div className="border-t border-gray-100 p-2">
                  <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Suggestions
                  </div>
                  {allSuggestions.slice(0, 5).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.href)}
                      className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-gray-50"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {suggestion.name}
                      </span>
                      <span className="ml-auto text-xs text-gray-500">
                        {suggestion.type === 'category'
                          ? 'Category'
                          : 'Product'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* View All Results */}
              {searchResults.total > 3 && (
                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={() =>
                      handleSuggestionClick(
                        `/products?q=${encodeURIComponent(searchTerm)}`
                      )
                    }
                    className="w-full rounded px-2 py-2 text-left text-sm font-medium text-textile-navy hover:bg-gray-50"
                  >
                    View all {searchResults.total} results for "{searchTerm}"
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {searchResults && searchResults.total === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="mx-auto mb-2 h-6 w-6 text-gray-400" />
              <div className="text-sm">No results found for "{searchTerm}"</div>
              <div className="mt-1 text-xs">
                Try different keywords or browse our categories
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
