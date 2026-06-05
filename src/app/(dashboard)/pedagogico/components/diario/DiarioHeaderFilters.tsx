'use client'

import React from 'react'
import { LucideAlertTriangle, LucideInfo, LucideCalendar } from 'lucide-react'
import { useDiario } from './DiarioContext'

export function DiarioHeaderFilters() {
  const {
    turmas,
    selectedTurma,
    setSelectedTurma,
    allDisciplinas,
    selectedDisciplina,
    setSelectedDisciplina,
    allProfessores,
    selectedDocente,
    setSelectedDocente,
    professoresAlocados,
    handleDisciplinaChange,
    disciplinaAtiva,
    matchingSchedule,
  } = useDiario()

  return (
    <>
      {/* Barra de Filtro Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-xl p-6">
        
        {/* Seletor de Turma */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Turma</label>
          <select
            value={selectedTurma}
            onChange={e => setSelectedTurma(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-all text-sm"
          >
            <option value="" className="dark:bg-slate-800">Selecione a Turma...</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id} className="dark:bg-slate-800">{t.nome}</option>
            ))}
          </select>
        </div>

        {/* Seletor de Disciplina (dinâmico ou fallback) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Matéria / Disciplina</label>
          {selectedTurma ? (
            professoresAlocados.length > 0 ? (
              <select
                value={selectedDisciplina}
                onChange={e => handleDisciplinaChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-all text-sm"
              >
                <option value="" className="dark:bg-slate-800">Selecione a Disciplina...</option>
                {professoresAlocados.map(p => (
                  <option key={p.disciplina.id} value={p.disciplina.id} className="dark:bg-slate-800">
                    {p.disciplina.nome} ({p.professor.nomeCompleto})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-col gap-2">
                <select
                  value={selectedDisciplina}
                  onChange={e => setSelectedDisciplina(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-900/50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm text-sm"
                >
                  <option value="" className="dark:bg-slate-800">Selecione uma disciplina livre...</option>
                  {allDisciplinas.map(d => (
                    <option key={d.id} value={d.id} className="dark:bg-slate-800">{d.nome}</option>
                  ))}
                </select>
                <span className="text-[10px] text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                  <LucideAlertTriangle size={12} /> Nenhuma alocação docente nesta turma.
                </span>
              </div>
            )
          ) : (
            <select disabled className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-950 text-slate-400 dark:text-slate-650 cursor-not-allowed text-sm">
              <option>Selecione uma turma primeiro</option>
            </select>
          )}
        </div>

        {/* Seletor de Docente (se disciplina for livre ou fallback) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Professor Responsável</label>
          {selectedTurma && !professoresAlocados.find(p => p.disciplina.id === selectedDisciplina) ? (
            <select
              value={selectedDocente}
              onChange={e => setSelectedDocente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-all text-sm"
            >
              <option value="" className="dark:bg-slate-800">Selecione o Professor...</option>
              {allProfessores.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-slate-800">{p.nomeCompleto}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              readOnly
              disabled
              value={
                professoresAlocados.find(p => p.disciplina.id === selectedDisciplina)?.professor.nomeCompleto ||
                'Professor Alocado Automaticamente'
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium shadow-sm text-sm"
            />
          )}
        </div>
      </div>

      {/* Dados Curriculares da Disciplina */}
      {selectedDisciplina && disciplinaAtiva && (
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl px-6 py-4 flex flex-wrap gap-6 items-center justify-between text-sm text-blue-900 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <LucideInfo size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-950 dark:text-blue-200">Dados Curriculares:</span>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-medium uppercase">
              {disciplinaAtiva.tipoBase === 'basica' ? 'BNCC (Base Comum)' : 'Parte Complementar'}
            </span>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-medium uppercase">
              Avaliação: {disciplinaAtiva.formaAvaliacao === 'numerica' ? 'Numérica (0 - 10)' : 
                          disciplinaAtiva.formaAvaliacao === 'conceitual' ? 'Conceitual (A - D)' : 'Sem Avaliação'}
            </span>
          </div>
          {matchingSchedule && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/40 rounded-lg px-3 py-1 font-medium">
              <LucideCalendar size={14} />
              Horário de Hoje: {matchingSchedule.quantidadeAulas} {matchingSchedule.quantidadeAulas > 1 ? 'aulas' : 'aula'}
            </div>
          )}
        </div>
      )}
    </>
  )
}
