'use client'

import React, { useState, useEffect } from 'react'
import { LucideAward, LucidePlus, LucideTrash2, LucideLoader2, LucideSave, LucideInfo } from 'lucide-react'
import { useDiario } from './DiarioContext'
import { 
  getAvaliacoesPorTurmaPeriodo, 
  getNotasDaTurma, 
  criarAvaliacao, 
  removerAvaliacao, 
  salvarNotas 
} from '@/actions/diario'

export function NotasPanel() {
  const {
    selectedTurma,
    selectedDisciplina,
    selectedDocente,
    selectedPeriodo,
    setSelectedPeriodo,
    periodos,
    estudantes,
    disciplinaAtiva,
    showToast
  } = useDiario()

  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [notas, setNotas] = useState<Map<string, string | number>>(new Map())
  const [studentStats, setStudentStats] = useState<Record<string, any>>({})
  
  const [novaAvaliacaoModal, setNovaAvaliacaoModal] = useState(false)
  const [newAvTitle, setNewAvTitle] = useState('')
  const [newAvDate, setNewAvDate] = useState('')
  const [newAvWeight, setNewAvWeight] = useState(1)
  const [isCreatingAv, setIsCreatingAv] = useState(false)
  const [isSavingNotas, setIsSavingNotas] = useState(false)

  const isConceitual = disciplinaAtiva?.formaAvaliacao === 'conceitual'

  useEffect(() => {
    if (!selectedTurma || !selectedDisciplina || !selectedPeriodo) return

    async function loadNotas() {
      try {
        const resAvs = await getAvaliacoesPorTurmaPeriodo(selectedTurma, selectedDisciplina, selectedPeriodo)
        if (resAvs.success && resAvs.data) {
          setAvaliacoes(resAvs.data)
        } else {
          setAvaliacoes([])
        }

        const resNotas = await getNotasDaTurma(selectedTurma, selectedDisciplina, selectedPeriodo)
        if (resNotas.success && resNotas.data) {
          const m = new Map<string, string | number>()
          resNotas.data.forEach((n: any) => {
            const key = `${n.matriculaId}-${n.avaliacaoId}`
            m.set(key, isConceitual ? (n.observacao || '') : n.valor)
          })
          setNotas(m)
        } else {
          setNotas(new Map())
        }

        // Fetch Stats (Médias, Frequência, Status)
        // Dynamically imported
        const { getTurmaMediaEStatus } = await import('@/actions/diario')
        const statsRes = await getTurmaMediaEStatus(selectedTurma, selectedDisciplina)
        if (statsRes.success && statsRes.data) {
          setStudentStats(statsRes.data)
        } else {
          setStudentStats({})
        }

      } catch (error) {
        console.error('Erro ao buscar avaliações/notas', error)
      }
    }

    loadNotas()
  }, [selectedTurma, selectedDisciplina, selectedPeriodo, isConceitual])

  async function handleCreateAvaliacao(e: React.FormEvent) {
    e.preventDefault()
    if (!newAvTitle || !newAvDate) return

    setIsCreatingAv(true)
    try {
      const res = await criarAvaliacao({
        turmaId: selectedTurma,
        disciplinaId: selectedDisciplina,
        periodoAvaliativoId: selectedPeriodo,
        titulo: newAvTitle,
        dataAvaliacao: new Date(newAvDate),
        peso: Number(newAvWeight)
      })

      if (res.success) {
        showToast('Avaliação criada com sucesso!')
        setNovaAvaliacaoModal(false)
        setNewAvTitle('')
        setNewAvWeight(1)
        
        // Reload
        const resAvs = await getAvaliacoesPorTurmaPeriodo(selectedTurma, selectedDisciplina, selectedPeriodo)
        if (resAvs.success && resAvs.data) setAvaliacoes(resAvs.data)
      } else {
        showToast(res.error || 'Erro ao criar avaliação.', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Erro inesperado', 'error')
    } finally {
      setIsCreatingAv(false)
    }
  }

  async function handleDeleteAvaliacao(id: string) {
    if (!confirm('Deseja realmente excluir esta avaliação e TODAS as notas atreladas a ela?')) return
    try {
      const res = await removerAvaliacao(id)
      if (res.success) {
        showToast('Avaliação removida com sucesso!')
        setAvaliacoes(prev => prev.filter(a => a.id !== id))
        
        // Remove from map
        const newMap = new Map(notas)
        for (const key of newMap.keys()) {
          if (key.endsWith(`-${id}`)) {
            newMap.delete(key)
          }
        }
        setNotas(newMap)
      } else {
        showToast(res.error || 'Erro ao excluir.', 'error')
      }
    } catch (error) {
      showToast('Erro inesperado ao excluir.', 'error')
    }
  }

  const handleNotaChange = (matriculaId: string, avaliacaoId: string, val: string) => {
    setNotas(prev => {
      const nm = new Map(prev)
      const key = `${matriculaId}-${avaliacaoId}`
      if (val === '') {
        nm.delete(key)
      } else {
        if (isConceitual) {
          nm.set(key, val.toUpperCase())
        } else {
          nm.set(key, Number(val))
        }
      }
      return nm
    })
  }

  async function handleSalvarNotas() {
    setIsSavingNotas(true)
    try {
      const notasArray: any[] = []
      for (const [key, val] of notas.entries()) {
        const [matriculaId, avaliacaoId] = key.split('-')
        notasArray.push({
          matriculaId,
          avaliacaoId,
          valorNumerico: !isConceitual ? val : null,
          valorConceitual: isConceitual ? val : null
        })
      }

      const res = await salvarNotas(
        selectedTurma,
        selectedDisciplina,
        selectedDocente,
        notasArray
      )

      if (res.success) {
        showToast('Notas salvas com sucesso!')
      } else {
        showToast(res.error || 'Erro ao salvar notas.', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Erro inesperado.', 'error')
    } finally {
      setIsSavingNotas(false)
    }
  }

  if (disciplinaAtiva?.formaAvaliacao === 'nenhuma') {
    return (
      <div className="py-12 text-center bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
        <LucideAward size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">Avaliação Desativada</h4>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 text-sm">
          A disciplina <strong>{disciplinaAtiva.nome}</strong> está configurada para não possuir avaliação de notas, segundo as configurações curriculares.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-2">
          <LucideAward className="text-emerald-600 dark:text-emerald-400" size={22} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Lançamento de Notas</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-655 dark:text-slate-350">Período Avaliativo:</label>
            <select
              value={selectedPeriodo}
              onChange={e => setSelectedPeriodo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            >
              <option value="" className="dark:bg-slate-800">Selecione o período...</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id} className="dark:bg-slate-800">{p.nome}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setNovaAvaliacaoModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            <LucidePlus size={16} />
            Nova Avaliação
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-sm text-emerald-800 dark:text-emerald-350 font-medium">
        <LucideInfo size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div>
          Formato de Avaliação: 
          <strong> {isConceitual ? 'Conceitual (Ex: A, B, C, D, F)' : 'Numérica (Ex: 0 a 10)'}</strong>. 
          Use esta aba para criar as avaliações do período e registrar a nota de cada estudante.
        </div>
      </div>

      {avaliacoes.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/30">
          Nenhuma avaliação cadastrada neste período para esta disciplina.
          <br />Clique no botão "Nova Avaliação" para começar.
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-305">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-slate-800 z-10 w-64">
                  Aluno
                </th>
                {avaliacoes.map(av => (
                  <th key={av.id} className="px-4 py-3 text-center min-w-[120px]">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">{av.titulo}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        Peso: {av.peso}
                      </div>
                      <button 
                        onClick={() => handleDeleteAvaliacao(av.id)}
                        title="Excluir Avaliação"
                        className="text-red-400 dark:text-red-400 hover:text-red-650 dark:hover:text-red-300 mt-1"
                      >
                        <LucideTrash2 size={12} />
                      </button>
                    </div>
                  </th>
                ))}
                {!isConceitual && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-350 uppercase tracking-wider bg-gray-50/80 dark:bg-slate-800/80">
                    Resultado
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-150 dark:divide-slate-850">
              {estudantes.map(est => {
                const stat = studentStats[est.matriculaId]
                return (
                <tr key={est.matriculaId} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-gray-100 dark:border-slate-800 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate" title={est.nomeCompleto}>
                      {est.nomeCompleto}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                      <span>Mat: {est.numeroMatricula}</span>
                      {stat && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          stat.freqPercentage < 75 
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-350' 
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}>
                          Freq: {stat.freqPercentage}%
                        </span>
                      )}
                    </div>
                  </td>
                  {avaliacoes.map(av => {
                    const val = notas.get(`${est.matriculaId}-${av.id}`) || ''
                    return (
                      <td key={`${est.matriculaId}-${av.id}`} className="px-4 py-3 text-center">
                        {isConceitual ? (
                          <textarea
                            value={val}
                            onChange={(e) => handleNotaChange(est.matriculaId, av.id, e.target.value)}
                            className="w-full min-w-[200px] h-16 px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 resize-y"
                            placeholder="Insira as observações/impressões conceituais..."
                          />
                        ) : (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={val}
                            onChange={(e) => handleNotaChange(est.matriculaId, av.id, e.target.value)}
                            className="w-20 px-2 py-1.5 text-center text-sm font-bold border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-700 dark:text-emerald-450 bg-white dark:bg-slate-800"
                            placeholder="-"
                          />
                        )}
                      </td>
                    )
                  })}
                  {!isConceitual && (
                    <td className="px-4 py-3 text-center bg-gray-50/50 dark:bg-slate-800/40 border-l border-gray-100 dark:border-slate-800">
                      {stat ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {stat.mediaFinal?.toFixed(1)}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            stat.status.includes('Aprovado') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-350' :
                            stat.status.includes('Recuperação') ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-355' :
                            'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-350'
                          }`}>
                            {stat.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-550 text-xs">-</span>
                      )}
                    </td>
                  )}
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {avaliacoes.length > 0 && (
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleSalvarNotas}
            disabled={isSavingNotas}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm"
          >
            {isSavingNotas ? (
              <>
                <LucideLoader2 size={18} className="animate-spin" />
                Salvando Notas...
              </>
            ) : (
              <>
                <LucideSave size={18} />
                Salvar Todas as Notas
              </>
            )}
          </button>
        </div>
      )}

      {/* MODAL NOVA AVALIAÇÃO */}
      {novaAvaliacaoModal && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Cadastrar Avaliação</h3>
              <button 
                onClick={() => setNovaAvaliacaoModal(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateAvaliacao} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Título da Avaliação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prova Bimestral, Trabalho Prático..."
                  value={newAvTitle}
                  onChange={e => setNewAvTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newAvDate}
                    onChange={e => setNewAvDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Peso</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newAvWeight}
                    onChange={e => setNewAvWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNovaAvaliacaoModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAv}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isCreatingAv ? <LucideLoader2 size={16} className="animate-spin" /> : <LucidePlus size={16} />}
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

