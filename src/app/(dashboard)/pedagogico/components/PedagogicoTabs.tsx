'use client'

import { useState } from 'react'
import { LucideGraduationCap, LucideLayers, LucideUsers, LucideBook, LucideHome, LucideListCollapse, LucideFileText } from 'lucide-react'
import { NivelEnsinoTab } from './NivelEnsinoTab'
import { SerieTab } from './SerieTab'
import { TurmaTab } from './TurmaTab'
import { DisciplinaTab } from './DisciplinaTab'
import { DiarioClasseTab } from './DiarioClasseTab'
import { SalaTab } from './SalaTab'
import { GradeCurricularTab } from './GradeCurricularTab'
import { BoletimTab } from './BoletimTab'
import { PlanilhaNotasTab } from './PlanilhaNotasTab'
import { CalendarioPedagogicoTab } from './CalendarioPedagogicoTab'

export function PedagogicoTabs() {
  const [activeTab, setActiveTab] = useState('niveis')

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
      {/* Abas */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto bg-gray-50/50 dark:bg-slate-900/50">
        <button
          type="button"
          onClick={() => setActiveTab('niveis')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'niveis' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideLayers size={18} />
          Níveis de Ensino
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('series')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'series' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideGraduationCap size={18} />
          Séries
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('grade_curricular')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'grade_curricular' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideListCollapse size={18} />
          Grades Curriculares
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('turmas')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'turmas' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideUsers size={18} />
          Turmas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('salas')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'salas' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideHome size={18} />
          Salas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('disciplinas')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'disciplinas' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideBook size={18} />
          Disciplinas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('diario')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'diario' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideBook size={18} />
          Diário de Classe
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('boletins')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'boletins' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideFileText size={18} />
          Boletins Individuais
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('planilha_notas')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'planilha_notas' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideListCollapse size={18} />
          Planilha de Coordenação (Notas)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calendario')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'calendario' 
              ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400 dark:border-blue-500' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LucideListCollapse size={18} />
          Calendário Pedagógico
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'niveis' && <NivelEnsinoTab />}
        {activeTab === 'series' && <SerieTab />}
        {activeTab === 'grade_curricular' && <GradeCurricularTab />}
        {activeTab === 'turmas' && <TurmaTab />}
        {activeTab === 'salas' && <SalaTab />}
        {activeTab === 'disciplinas' && <DisciplinaTab />}
        {activeTab === 'diario' && <DiarioClasseTab />}
        {activeTab === 'boletins' && <BoletimTab />}
        {activeTab === 'planilha_notas' && <PlanilhaNotasTab />}
        {activeTab === 'calendario' && <CalendarioPedagogicoTab />}
      </div>
    </div>
  )
}

