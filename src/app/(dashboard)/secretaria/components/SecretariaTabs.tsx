'use client'

import { useState } from 'react'
import { Calendar, UserCheck, FileText, AlertTriangle, Award, Megaphone, Users } from 'lucide-react'
import { AnoLetivoTab } from './AnoLetivoTab'
import { MatriculaTab } from './MatriculaTab'
import { DocumentosTab } from './DocumentosTab'
import { OcorrenciaTab } from './OcorrenciaTab'
import { HistoricoTab } from './HistoricoTab'
import { AvisosTab } from './AvisosTab'
import { VinculosTab } from './VinculosTab'

export function SecretariaTabs() {
  const [activeTab, setActiveTab] = useState('ano_letivo')

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
      {/* Abas */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto bg-gray-50/50 dark:bg-slate-850/50">
        <button
          type="button"
          onClick={() => setActiveTab('ano_letivo')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'ano_letivo' 
              ? 'border-[var(--color-csm-red)] text-[var(--color-csm-red)] bg-white dark:bg-slate-900' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-gray-305 dark:hover:border-slate-705'
          }`}
        >
          <Calendar size={18} />
          Ano Letivo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matriculas')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'matriculas' 
              ? 'border-[var(--color-csm-red)] text-[var(--color-csm-red)] bg-white dark:bg-slate-900' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-gray-350 dark:hover:border-slate-750'
          }`}
        >
          <UserCheck size={18} />
          Matrículas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documentos')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'documentos' 
              ? 'border-[var(--color-csm-red)] text-[var(--color-csm-red)] bg-white dark:bg-slate-900' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-gray-350 dark:hover:border-slate-750'
          }`}
        >
          <FileText size={18} />
          Emissão de Documentos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ocorrencias')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'ocorrencias' 
              ? 'border-[var(--color-csm-red)] text-[var(--color-csm-red)] bg-white dark:bg-slate-900' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-gray-350 dark:hover:border-slate-750'
          }`}
        >
          <AlertTriangle size={18} />
          Ocorrências
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('historico')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'historico' 
              ? 'border-[var(--color-csm-red)] text-[var(--color-csm-red)] bg-white dark:bg-slate-900' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-gray-350 dark:hover:border-slate-750'
          }`}
        >
          <Award size={18} />
          Histórico Escolar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('avisos')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'avisos' 
              ? 'border-[var(--color-csm-red)] text-[var(--color-csm-red)] bg-white dark:bg-slate-900' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-gray-350 dark:hover:border-slate-750'
          }`}
        >
          <Megaphone size={18} />
          Mural de Avisos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vinculos')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'vinculos' 
              ? 'border-[var(--color-csm-red)] text-[var(--color-csm-red)] bg-white dark:bg-slate-900' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-gray-350 dark:hover:border-slate-750'
          }`}
        >
          <Users size={18} />
          Vínculos Familiares
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'ano_letivo' && <AnoLetivoTab />}
        {activeTab === 'matriculas' && <MatriculaTab />}
        {activeTab === 'documentos' && <DocumentosTab />}
        {activeTab === 'ocorrencias' && <OcorrenciaTab />}
        {activeTab === 'historico' && <HistoricoTab />}
        {activeTab === 'avisos' && <AvisosTab />}
        {activeTab === 'vinculos' && <VinculosTab />}
      </div>
    </div>
  )
}
