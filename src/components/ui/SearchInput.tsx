'use client'

import { LucideSearch } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export function SearchInput({ placeholder = 'Buscar...' }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const initialSearch = searchParams.get('q') || ''
  const [term, setTerm] = useState(initialSearch)

  useEffect(() => {
    // Evita loop se o termo atual na URL já for igual ao termo do input
    const currentQ = searchParams.get('q') || ''
    if (term === currentQ) return

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set('q', term)
      } else {
        params.delete('q')
      }
      params.delete('page') // Reset page on new search
      
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    }, 500) // 500ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [term, pathname, router, searchParams])

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <LucideSearch size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      {isPending && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
