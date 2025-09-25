'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { debounce } from '@/lib/utils'

interface SearchResult {
  id: string | number
  name: string
  slug: string
  shortDescription?: string
  price: number
  originalPrice?: number
  image?: string
  category: {
    name: string
    slug: string
  }
  rating?: number
  isOnSale?: boolean
  isBestseller?: boolean
  isNew?: boolean
  colors?: string[]
}

interface SearchSuggestion {
  type: 'product' | 'category'
  name: string
  href: string
}

interface SearchResponse {
  results: SearchResult[]
  suggestions: SearchSuggestion[]
  categories: SearchSuggestion[]
  query: string
  total: number
}

interface UseSearchOptions {
  debounceMs?: number
  minLength?: number
  maxResults?: number
  enabled?: boolean
}

interface UseSearchReturn {
  query: string
  results: SearchResult[]
  suggestions: SearchSuggestion[]
  categories: SearchSuggestion[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  total: number
  hasResults: boolean
  setQuery: (query: string) => void
  clearSearch: () => void
  search: (query: string) => void
  searchHistory: string[]
  addToHistory: (query: string) => void
  clearHistory: () => void
}

const STORAGE_KEY = 'search-history'
const MAX_HISTORY_ITEMS = 10

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    minLength = 2,
    maxResults = 10,
    enabled = true,
  } = options

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const debouncedSetQuery = useRef(
    debounce((value: string) => setDebouncedQuery(value), debounceMs)
  ).current

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const history = localStorage.getItem(STORAGE_KEY)
        if (history) {
          setSearchHistory(JSON.parse(history))
        }
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }
  }, [])

  // Save search history to localStorage
  const saveHistory = useCallback((history: string[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (error) {
        console.error('Failed to save search history:', error)
      }
    }
  }, [])

  // Update debounced query when query changes
  useEffect(() => {
    debouncedSetQuery(query)
  }, [query, debouncedSetQuery])

  // Search query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async (): Promise<SearchResponse> => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        limit: maxResults.toString(),
      })

      const response = await fetch(`/api/search?${params}`)

      if (!response.ok) {
        throw new Error('Search failed')
      }

      return response.json()
    },
    enabled: enabled && debouncedQuery.length >= minLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })

  const addToHistory = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== searchQuery)
        const newHistory = [searchQuery, ...filtered].slice(
          0,
          MAX_HISTORY_ITEMS
        )
        saveHistory(newHistory)
        return newHistory
      })
    },
    [saveHistory]
  )

  const clearHistory = useCallback(() => {
    setSearchHistory([])
    saveHistory([])
  }, [saveHistory])

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery)
      if (searchQuery.trim()) {
        addToHistory(searchQuery.trim())
      }
    },
    [addToHistory]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
  }, [])

  return {
    query,
    results: data?.results || [],
    suggestions: data?.suggestions || [],
    categories: data?.categories || [],
    isLoading,
    isError,
    error: error as Error | null,
    total: data?.total || 0,
    hasResults: (data?.total || 0) > 0,
    setQuery,
    clearSearch,
    search,
    searchHistory,
    addToHistory,
    clearHistory,
  }
}

// Hook for search suggestions
export function useSearchSuggestions(
  query: string,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async (): Promise<SearchSuggestion[]> => {
      if (!query.trim()) return []

      const params = new URLSearchParams({
        q: query,
        limit: '5',
      })

      const response = await fetch(`/api/search?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      return [...(data.suggestions || []), ...(data.categories || [])]
    },
    enabled: enabled && query.length >= 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for popular searches
export function usePopularSearches() {
  return useQuery({
    queryKey: ['popular-searches'],
    queryFn: async (): Promise<string[]> => {
      // In a real app, this would come from analytics or a dedicated endpoint
      // For now, return some static popular searches
      return [
        'bed sheets',
        'comforter',
        'pillow',
        'duvet cover',
        'throw blanket',
        'bath towels',
        'curtains',
        'decorative pillows',
      ]
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 2 * 60 * 60 * 1000, // 2 hours
  })
}

// Hook for search autocomplete
export function useSearchAutocomplete(
  query: string,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedGetSuggestions = useRef(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      try {
        // In a real app, you might have a dedicated autocomplete endpoint
        // For now, we'll use the search endpoint and extract product names
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`
        )

        if (response.ok) {
          const data = await response.json()
          const productSuggestions = data.results.map(
            (item: SearchResult) => item.name
          )
          const categorySuggestions = data.categories.map(
            (item: SearchSuggestion) => item.name
          )

          setSuggestions([
            ...new Set([...productSuggestions, ...categorySuggestions]),
          ])
        }
      } catch (error) {
        console.error('Autocomplete error:', error)
        setSuggestions([])
      }

      setIsLoading(false)
    }, 200)
  ).current

  useEffect(() => {
    if (enabled && query) {
      setIsLoading(true)
      debouncedGetSuggestions(query)
    } else {
      setSuggestions([])
      setIsLoading(false)
    }
  }, [query, enabled, debouncedGetSuggestions])

  return {
    suggestions,
    isLoading,
  }
}
