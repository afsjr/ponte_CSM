'use client'

import React, { useState, useEffect, useRef } from 'react'
import { searchResponsaveis } from '@/actions/pessoa'
import { LucideSearch, LucideLoader2, LucideUserCheck } from 'lucide-react'

type ResponsavelData = {
  id: string
  nomeCompleto: string
  cpf: string | null
}

export function ResponsavelSelector({ onSelect }: { onSelect: (r: ResponsavelData) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ResponsavelData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fechar dropdown se clicar fora
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        const res = await searchResponsaveis(query)
        if (res.success && res.data) {
          setResults(res.data)
          setIsOpen(true)
        }
        setIsLoading(false)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSelect = (r: ResponsavelData) => {
    onSelect(r)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {isLoading ? <LucideLoader2 size={18} className="animate-spin" /> : <LucideSearch size={18} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar responsável pelo nome ou CPF..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          autoComplete="off"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex flex-col transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <LucideUserCheck size={16} className="text-blue-600" />
                <span className="font-medium text-gray-900">{r.nomeCompleto}</span>
              </div>
              {r.cpf && <span className="text-xs text-gray-500 pl-6">CPF: {r.cpf}</span>}
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md py-3 px-4 text-sm text-gray-500 text-center ring-1 ring-black ring-opacity-5">
          Nenhum responsável encontrado.
        </div>
      )}
    </div>
  )
}
