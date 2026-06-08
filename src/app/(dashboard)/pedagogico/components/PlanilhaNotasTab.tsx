'use client'

import { useState, useEffect } from 'react'
import { getTurmas, getDisciplinas } from '@/actions/pedagogico'
import { getAnosLetivos } from '@/actions/secretaria'
import { getPlanilhaNotasTurma, upsertNotasBoletim } from '@/actions/coordenacao'
import { LucideLoader2, LucideSave, LucideCheckCircle } from 'lucide-react'

export function PlanilhaNotasTab() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [anosLetivos, setAnosLetivos] = useState<any[]>([])
  const [disciplinas, setDisciplinas] = useState<any[]>([])
  
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('')
  const [selectedAnoId, setSelectedAnoId] = useState<string>('')
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>('')
  
  const [planilha, setPlanilha] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Estado local para edicao rapida (draft)
  const [draftNotas, setDraftNotas] = useState<Record<string, { t1: string, t2: string, t3: string }>>({})
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedTurmaId && selectedAnoId && selectedDisciplinaId) {
      loadPlanilha()
    } else {
      setPlanilha([])
    }
  }, [selectedTurmaId, selectedAnoId, selectedDisciplinaId])

  const loadInitialData = async () => {
    const [resTurmas, resAnos, resDisc] = await Promise.all([
      getTurmas(),
      getAnosLetivos(),
      getDisciplinas()
    ])
    
    if (resTurmas.success) setTurmas(resTurmas.data || [])
    if (resAnos && Array.isArray(resAnos)) setAnosLetivos(resAnos)
    if (resDisc.success) setDisciplinas(resDisc.data || [])
    
    // Auto-select first ano
    if (resAnos && Array.isArray(resAnos) && resAnos.length > 0) {
      setSelectedAnoId(resAnos[0].id)
    }
  }

  const loadPlanilha = async () => {
    setLoading(true)
    setDraftNotas({})
    const res = await getPlanilhaNotasTurma(selectedTurmaId, selectedAnoId)
    if (res.success && res.data) {
      setPlanilha(res.data)
      
      // Inicializar drafts
      const newDrafts: any = {}
      res.data.forEach(aluno => {
        // Encontrar a nota da disciplina selecionada
        const notaDisc = aluno.notas.find((n: any) => n.disciplinaId === selectedDisciplinaId)
        newDrafts[aluno.id] = {
          t1: notaDisc && notaDisc.trimestre1 != null ? (notaDisc.trimestre1 / 100).toFixed(2) : '',
          t2: notaDisc && notaDisc.trimestre2 != null ? (notaDisc.trimestre2 / 100).toFixed(2) : '',
          t3: notaDisc && notaDisc.trimestre3 != null ? (notaDisc.trimestre3 / 100).toFixed(2) : '',
        }
      })
      setDraftNotas(newDrafts)
    }
    setLoading(false)
  }

  const handleNotaChange = (alunoId: string, trimestre: 't1' | 't2' | 't3', val: string) => {
    // Permitir apenas números e ponto
    const validVal = val.replace(/[^0-9.]/g, '')
    setDraftNotas(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [trimestre]: validVal
      }
    }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    setSuccessMsg(false)
    
    try {
      const promises = Object.entries(draftNotas).map(([alunoId, notas]) => {
        const t1 = notas.t1 ? Math.round(parseFloat(notas.t1) * 100) : null
        const t2 = notas.t2 ? Math.round(parseFloat(notas.t2) * 100) : null
        const t3 = notas.t3 ? Math.round(parseFloat(notas.t3) * 100) : null
        
        return upsertNotasBoletim({
          alunoId,
          anoLetivoId: selectedAnoId,
          disciplinaId: selectedDisciplinaId,
          trimestre1: t1,
          trimestre2: t2,
          trimestre3: t3
        })
      })

      await Promise.all(promises)
      
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
      
      // Reload para atualizar médias
      loadPlanilha()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar as notas')
    } finally {
      setSaving(false)
    }
  }

  // Função para calcular prévia da média arredondada
  const calcularPreviaMedia = (t1: string, t2: string, t3: string) => {
    if (!t1 || !t2 || !t3) return '-'
    const n1 = parseFloat(t1) || 0
    const n2 = parseFloat(t2) || 0
    const n3 = parseFloat(t3) || 0
    const media = (n1 + n2 + n3) / 3
    return media.toFixed(2) // Arredondamento visual
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Planilha de Notas (Coordenação)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Lançamento e edição em lote das notas trimestrais por turma e disciplina.
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ano Letivo</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
              value={selectedAnoId}
              onChange={e => setSelectedAnoId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {anosLetivos.map(a => (
                <option key={a.id} value={a.id}>{a.ano}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Turma</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
              value={selectedTurmaId}
              onChange={e => setSelectedTurmaId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Disciplina</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
              value={selectedDisciplinaId}
              onChange={e => setSelectedDisciplinaId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {disciplinas.map(d => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedTurmaId && selectedDisciplinaId && selectedAnoId && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden flex flex-col">
          
          {/* Toolbar da Tabela */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Alunos: {planilha.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {successMsg && (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium animate-in fade-in">
                  <LucideCheckCircle size={16} /> Salvo!
                </span>
              )}
              <button 
                onClick={handleSaveAll}
                disabled={saving || loading || planilha.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {saving ? <LucideLoader2 className="animate-spin" size={16} /> : <LucideSave size={16} />}
                Salvar Planilha
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-12">
                <LucideLoader2 className="animate-spin text-blue-600 h-8 w-8" />
              </div>
            ) : planilha.length === 0 ? (
              <div className="text-center p-12 text-slate-500">Nenhum aluno ativo nesta turma.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-16">Nº</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Aluno</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-24">1º Trimestre</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-24">2º Trimestre</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-24">3º Trimestre</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider w-24 bg-blue-50/50 dark:bg-blue-900/20">Média Final</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {planilha.map((aluno, index) => {
                    const drafts = draftNotas[aluno.id] || { t1: '', t2: '', t3: '' }
                    const prevMedia = calcularPreviaMedia(drafts.t1, drafts.t2, drafts.t3)
                    const notaDb = aluno.notas.find((n: any) => n.disciplinaId === selectedDisciplinaId)
                    const mediaFinalDb = notaDb && notaDb.mediaFinal != null ? (notaDb.mediaFinal / 100).toFixed(2) : prevMedia
                    
                    const isAprovado = parseFloat(mediaFinalDb as string) >= 6.0
                    
                    return (
                      <tr key={aluno.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">{index + 1}</td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-white">
                          {aluno.nomeCompleto}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input 
                            type="text" 
                            className="w-16 px-2 py-1 text-center border border-slate-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700"
                            placeholder="0.00"
                            value={drafts.t1}
                            onChange={e => handleNotaChange(aluno.id, 't1', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input 
                            type="text" 
                            className="w-16 px-2 py-1 text-center border border-slate-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700"
                            placeholder="0.00"
                            value={drafts.t2}
                            onChange={e => handleNotaChange(aluno.id, 't2', e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input 
                            type="text" 
                            className="w-16 px-2 py-1 text-center border border-slate-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700"
                            placeholder="0.00"
                            value={drafts.t3}
                            onChange={e => handleNotaChange(aluno.id, 't3', e.target.value)}
                          />
                        </td>
                        <td className={`px-4 py-2 text-center font-bold text-base bg-blue-50/20 dark:bg-blue-900/10 ${mediaFinalDb !== '-' ? (isAprovado ? 'text-green-600' : 'text-red-600') : 'text-slate-400'}`}>
                          {mediaFinalDb}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
