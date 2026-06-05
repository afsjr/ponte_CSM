'use client'

import React, { useState, useEffect } from 'react'
import { LucideCalendar, LucideInfo, LucideUserCheck, LucideUserX, LucideLoader2, LucideSave } from 'lucide-react'
import { useDiario } from './DiarioContext'
import { getDiarioClassePorFiltro, getFrequenciasDiario, salvarChamada } from '@/actions/diario'

export function FrequenciaPanel() {
  const {
    selectedTurma,
    selectedDisciplina,
    selectedDate,
    setSelectedDate,
    selectedDocente,
    estudantes,
    aulasSugeridas,
    disciplinaAtiva,
    showToast
  } = useDiario()

  const [diarioId, setDiarioId] = useState<string | null>(null)
  const [conteudoMinistrado, setConteudoMinistrado] = useState('')
  const [observacoesDiario, setObservacoesDiario] = useState('')
  const [aulasDadas, setAulasDadas] = useState(1)
  const [frequencias, setFrequencias] = useState<Record<string, { presente: boolean; justificativa: string }>>({})
  const [studentStats, setStudentStats] = useState<Record<string, any>>({})
  const [isSavingChamada, setIsSavingChamada] = useState(false)

  // Load Diary and Attendance
  useEffect(() => {
    if (!selectedTurma || !selectedDisciplina || !selectedDate) return

    async function loadDiaryAndAttendance() {
      try {
        const resDiario = await getDiarioClassePorFiltro(selectedTurma, selectedDisciplina, new Date(selectedDate))
        
        if (resDiario.success && resDiario.data) {
          const diario = resDiario.data
          setDiarioId(diario.id)
          setConteudoMinistrado(diario.conteudoMinistrado)
          setObservacoesDiario(diario.observacoes || '')
          setAulasDadas(diario.aulasDadas)

          const resFreq = await getFrequenciasDiario(diario.id)
          if (resFreq.success && resFreq.data) {
            const initialFreqs: Record<string, { presente: boolean; justificativa: string }> = {}
            estudantes.forEach(est => {
              const registro = resFreq.data.find((f: any) => f.matriculaId === est.matriculaId)
              initialFreqs[est.matriculaId] = {
                presente: registro ? registro.presente : true,
                justificativa: registro ? (registro.justificativa || '') : ''
              }
            })
            setFrequencias(initialFreqs)
          }
        } else {
          setDiarioId(null)
          setConteudoMinistrado('')
          setObservacoesDiario('')
          setAulasDadas(aulasSugeridas || 1)

          const initialFreqs: Record<string, { presente: boolean; justificativa: string }> = {}
          estudantes.forEach(est => {
            initialFreqs[est.matriculaId] = { presente: true, justificativa: '' }
          })
          setFrequencias(initialFreqs)
        }

        // Fetch overall stats
        const { getTurmaMediaEStatus } = await import('@/actions/diario')
        const statsRes = await getTurmaMediaEStatus(selectedTurma, selectedDisciplina)
        if (statsRes.success && statsRes.data) {
          setStudentStats(statsRes.data)
        } else {
          setStudentStats({})
        }

      } catch (error) {
        console.error('Erro ao buscar diário/frequência:', error)
      }
    }

    loadDiaryAndAttendance()
  }, [selectedTurma, selectedDisciplina, selectedDate, estudantes, aulasSugeridas])

  const getDiaSemanaLabel = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T12:00:00')
    const dayIndex = date.getDay()
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    return dias[dayIndex]
  }

  async function handleSalvarChamada(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTurma || !selectedDisciplina || !selectedDocente) {
      showToast('Selecione uma turma, disciplina e docente para salvar.', 'error')
      return
    }

    if (!conteudoMinistrado.trim()) {
      showToast('Por favor, informe o conteúdo ministrado.', 'error')
      return
    }

    setIsSavingChamada(true)
    try {
      const diarioData = {
        id: diarioId || undefined,
        turmaId: selectedTurma,
        disciplinaId: selectedDisciplina,
        docenteId: selectedDocente,
        data: new Date(selectedDate),
        conteudoMinistrado,
        observacoes: observacoesDiario || undefined,
        aulasDadas: Number(aulasDadas)
      }

      const freqsArray = estudantes.map(est => {
        const f = frequencias[est.matriculaId] || { presente: true, justificativa: '' }
        return {
          matriculaId: est.matriculaId,
          presente: f.presente,
          justificativa: f.presente ? undefined : f.justificativa
        }
      })

      const res = await salvarChamada(diarioData, freqsArray)
      if (res.success) {
        setDiarioId(res.diarioId || null)
        showToast('Diário de Classe e Frequência salvos com sucesso!')
      } else {
        showToast(res.error || 'Erro ao salvar chamada.', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Erro inesperado.', 'error')
    } finally {
      setIsSavingChamada(false)
    }
  }

  const togglePresenca = (matriculaId: string) => {
    setFrequencias(prev => {
      const current = prev[matriculaId] || { presente: true, justificativa: '' }
      return {
        ...prev,
        [matriculaId]: {
          presente: !current.presente,
          justificativa: !current.presente ? '' : current.justificativa
        }
      }
    })
  }

  const setJustificativa = (matriculaId: string, text: string) => {
    setFrequencias(prev => {
      const current = prev[matriculaId] || { presente: true, justificativa: '' }
      return {
        ...prev,
        [matriculaId]: {
          ...current,
          justificativa: text
        }
      }
    })
  }

  const marcardTodosPresentes = () => {
    const updated: Record<string, { presente: boolean; justificativa: string }> = {}
    estudantes.forEach(est => {
      updated[est.matriculaId] = { presente: true, justificativa: '' }
    })
    setFrequencias(updated)
    showToast('Todos os alunos marcados como presente!')
  }

  return (
    <form onSubmit={handleSalvarChamada} className="space-y-6">
      <div className="flex flex-wrap justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-2">
          <LucideCalendar className="text-blue-600 dark:text-blue-400" size={22} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Diário e Lista de Presenças</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-650 dark:text-slate-300 whitespace-nowrap">Data da Aula:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
        <LucideInfo size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div>
          <span>Dia da semana: <strong className="text-slate-900 dark:text-slate-100">{getDiaSemanaLabel(selectedDate)}</strong>. </span>
          {aulasSugeridas ? (
            <span>A turma possui <strong className="text-slate-900 dark:text-slate-100">{aulasSugeridas} aulas</strong> de {disciplinaAtiva?.nome} cadastradas no quadro de horários para este dia.</span>
          ) : (
            <span className="text-amber-750 dark:text-amber-400 font-medium">Não há aulas de {disciplinaAtiva?.nome} no quadro de horários para este dia de semana.</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Quantidade de Aulas</label>
          <input
            type="number"
            min={1}
            max={10}
            required
            value={aulasDadas}
            onChange={e => setAulasDadas(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 font-medium text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Conteúdo Ministrado</label>
          <textarea
            required
            rows={2}
            placeholder="Descreva o conteúdo abordado na aula de hoje..."
            value={conteudoMinistrado}
            onChange={e => setConteudoMinistrado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm resize-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Observações Gerais (Opcional)</label>
        <textarea
          rows={1}
          placeholder="Anotações sobre a turma, ocorrências, etc..."
          value={observacoesDiario}
          onChange={e => setObservacoesDiario(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm resize-none"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-800 pt-6">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Lista de Chamada</h4>
          <button
            type="button"
            onClick={marcardTodosPresentes}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
          >
            <LucideUserCheck size={16} />
            Marcar todos como Presente
          </button>
        </div>

        {estudantes.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/30">
            Nenhum aluno ativo matriculado nesta turma.
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead className="bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Matrícula</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Frequência</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Justificativa de Ausência</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-150 dark:divide-slate-800/80">
                {estudantes.map(est => {
                  const freq = frequencias[est.matriculaId] || { presente: true, justificativa: '' }
                  return (
                    <tr key={est.matriculaId} className={`hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors ${!freq.presente ? 'bg-red-50/20 dark:bg-red-950/15' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">{est.nomeCompleto}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{est.numeroMatricula}</div>
                        {studentStats[est.matriculaId] && (
                          <div className={`mt-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            studentStats[est.matriculaId].freqPercentage < 75 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}>
                            Freq Global: {studentStats[est.matriculaId].freqPercentage}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => togglePresenca(est.matriculaId)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            freq.presente
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-950/50 dark:text-green-300 dark:hover:bg-green-900/50'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-350 dark:hover:bg-red-900/50'
                          }`}
                        >
                          {freq.presente ? (
                            <>
                              <LucideUserCheck size={14} />
                              Presente
                            </>
                          ) : (
                            <>
                              <LucideUserX size={14} />
                              Falta
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {!freq.presente ? (
                          <input
                            type="text"
                            placeholder="Justificativa da falta..."
                            value={freq.justificativa}
                            onChange={e => setJustificativa(est.matriculaId, e.target.value)}
                            className="w-full px-3 py-1 text-sm border border-red-200 dark:border-red-900/50 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-550 italic">Aluno presente</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={isSavingChamada}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm"
        >
          {isSavingChamada ? (
            <>
              <LucideLoader2 size={18} className="animate-spin" />
              Salvando Chamada...
            </>
          ) : (
            <>
              <LucideSave size={18} />
              Salvar Diário e Frequência
            </>
          )}
        </button>
      </div>
    </form>
  )
}
