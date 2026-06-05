'use client'

import React from 'react'
import { LucideLoader2, LucideCheckCircle2, LucideAlertCircle, LucideInfo } from 'lucide-react'
import { DiarioProvider, useDiario } from './diario/DiarioContext'
import { DiarioHeaderFilters } from './diario/DiarioHeaderFilters'
import { FrequenciaPanel } from './diario/FrequenciaPanel'
import { NotasPanel } from './diario/NotasPanel'

function DiarioClasseContent() {
  const { 
    loading, 
    loadingContext,
    activeView, 
    setActiveView, 
    selectedTurma,
    selectedDisciplina,
    toast 
  } = useDiario()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-blue-600 dark:text-blue-400">
        <LucideLoader2 size={40} className="animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando Diário de Classe...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 fade-in duration-200 ${
          toast.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900/50' 
            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900/50'
        }`}>
          {toast.type === 'success' ? <LucideCheckCircle2 size={18} className="text-green-600 dark:text-green-400" /> : <LucideAlertCircle size={18} className="text-red-600 dark:text-red-400" />}
          {toast.message}
        </div>
      )}

      {/* Header Filters */}
      <DiarioHeaderFilters />

      {/* Main Content Area */}
      {selectedTurma && selectedDisciplina ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col relative">
          
          {loadingContext && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
              <LucideLoader2 size={32} className="text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          )}

          <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40">
            <button
              className={`flex-1 py-3.5 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeView === 'frequencia' 
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 shadow-[0_-2px_0_0_inset_#2563eb] dark:shadow-[0_-2px_0_0_inset_#3b82f6]' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-850'
              }`}
              onClick={() => setActiveView('frequencia')}
            >
              Frequência e Chamada
            </button>
            <button
              className={`flex-1 py-3.5 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeView === 'notas' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 shadow-[0_-2px_0_0_inset_#059669] dark:shadow-[0_-2px_0_0_inset_#10b981]' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-850'
              }`}
              onClick={() => setActiveView('notas')}
            >
              Avaliações e Notas
            </button>
          </div>

          <div className="p-6">
            {activeView === 'frequencia' ? <FrequenciaPanel /> : <NotasPanel />}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-slate-900/50 border border-dashed border-gray-300 dark:border-slate-800 rounded-xl py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700 mb-4">
            <LucideInfo size={28} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-slate-800 dark:text-slate-200 font-bold text-lg">Nenhuma Disciplina Selecionada</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md">
            Selecione uma turma e a disciplina correspondente no painel acima para abrir o Diário de Classe.
          </p>
        </div>
      )}
    </div>
  )
}

export function DiarioClasseTab() {
  return (
    <DiarioProvider>
      <DiarioClasseContent />
    </DiarioProvider>
  )
}
