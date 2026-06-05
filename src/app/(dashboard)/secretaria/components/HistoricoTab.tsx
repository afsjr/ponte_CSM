'use client'

import { useState, useEffect } from 'react'
import { 
  getHistoricoAluno, 
  consolidarHistorico, 
  deleteHistorico, 
  getAlunosList, 
  getAnosLetivos 
} from '@/actions/secretaria'
import { getSeries, getDisciplinas } from '@/actions/pedagogico'
import { 
  LucidePlus, 
  LucideTrash2, 
  LucideX, 
  LucideSave, 
  LucideLoader2, 
  LucideGraduationCap, 
  LucideChevronDown, 
  LucideChevronUp, 
  LucideInfo, 
  LucideBookOpen 
} from 'lucide-react'

type AlunoSimple = {
  id: string;
  nomeCompleto: string;
  cpf: string | null;
}

type AnoLetivo = {
  id: string;
  ano: number;
}

type Serie = {
  id: string;
  nome: string;
}

type Disciplina = {
  id: string;
  nome: string;
}

type DisciplinaNotaInput = {
  disciplinaId: string;
  disciplinaNome: string;
  mediaFinal: number;
  frequencia: number;
  cargaHoraria: number;
}

type Historico = {
  id: string;
  alunoId: string;
  anoLetivoId: string;
  ano: number;
  serieId: string;
  serieNome: string;
  mediaFinal: number;
  frequenciaFinal: number;
  resultado: string;
  disciplinasNotas: Array<{
    disciplinaId: string;
    disciplinaNome: string;
    mediaFinal: number;
    frequencia: number;
    cargaHoraria: number;
  }>;
  observacoes: string | null;
}

export function HistoricoTab() {
  const [alunos, setAlunos] = useState<AlunoSimple[]>([])
  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [selectedAlunoId, setSelectedAlunoId] = useState('')
  const [historicos, setHistoricos] = useState<Historico[]>([])
  
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Controle de Accordion (ano expandido no histórico)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // State do Form
  const [formData, setFormData] = useState({
    anoLetivoId: '',
    serieId: '',
    mediaFinal: 7.0,
    frequenciaFinal: 85.0,
    resultado: 'aprovado',
    observacoes: ''
  })
  
  // Listagem local de disciplinas/notas no modal
  const [disciplinasNotasForm, setDisciplinasNotasForm] = useState<DisciplinaNotaInput[]>([])
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState('')
  const [notaInput, setNotaInput] = useState(7.0)
  const [freqInput, setFreqInput] = useState(90.0)
  const [cargaHorariaInput, setCargaHorariaInput] = useState(80)

  // Exclusão auditada
  const [deletingItem, setDeletingItem] = useState<Historico | null>(null)
  const [motivoExclusao, setMotivoExclusao] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadInitialData = async () => {
    setLoading(true)
    const [resAlunos, resAnos, resSeries, resDisciplinas] = await Promise.all([
      getAlunosList(),
      getAnosLetivos(),
      getSeries(),
      getDisciplinas()
    ])

    setAlunos(resAlunos)
    setAnosLetivos(resAnos as any[])
    if (resSeries.success && resSeries.data) setSeries(resSeries.data)
    if (resDisciplinas.success && resDisciplinas.data) setDisciplinas(resDisciplinas.data as any[])
    
    setLoading(false)
  }

  const loadHistoricos = async (alunoId: string) => {
    if (!alunoId) {
      setHistoricos([])
      return
    }
    setListLoading(true)
    const res = await getHistoricoAluno(alunoId)
    if (res.success && res.data) {
      setHistoricos(res.data as Historico[])
      // Expandir o mais recente por padrão
      if (res.data.length > 0) {
        setExpandedId(res.data[0].id)
      } else {
        setExpandedId(null)
      }
    }
    setListLoading(false)
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadHistoricos(selectedAlunoId)
  }, [selectedAlunoId])

  const handleAddDisciplina = () => {
    if (!selectedDisciplinaId) return
    
    const disc = disciplinas.find(d => d.id === selectedDisciplinaId)
    if (!disc) return

    // Evita duplicado
    if (disciplinasNotasForm.some(item => item.disciplinaId === selectedDisciplinaId)) {
      alert('Esta disciplina já foi adicionada.')
      return
    }

    const newItem: DisciplinaNotaInput = {
      disciplinaId: selectedDisciplinaId,
      disciplinaNome: disc.nome,
      mediaFinal: Number(notaInput),
      frequencia: Number(freqInput),
      cargaHoraria: Number(cargaHorariaInput)
    }

    setDisciplinasNotasForm([...disciplinasNotasForm, newItem])
    
    // Reseta inputs rápidos
    setNotaInput(7.0)
    setFreqInput(90.0)
  }

  const handleRemoveDisciplina = (id: string) => {
    setDisciplinasNotasForm(disciplinasNotasForm.filter(item => item.disciplinaId !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlunoId) {
      setError('Selecione um aluno primeiro.')
      return
    }
    if (!formData.anoLetivoId || !formData.serieId) {
      setError('Preencha o Ano Letivo e a Série correspondente.')
      return
    }
    if (disciplinasNotasForm.length === 0) {
      setError('Adicione pelo menos uma disciplina com nota à lista curricular.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload = {
      alunoId: selectedAlunoId,
      anoLetivoId: formData.anoLetivoId,
      serieId: formData.serieId,
      mediaFinal: Number(formData.mediaFinal),
      frequenciaFinal: Number(formData.frequenciaFinal),
      resultado: formData.resultado,
      observacoes: formData.observacoes,
      disciplinasNotas: disciplinasNotasForm
    }

    const res = await consolidarHistorico(payload)

    setIsSubmitting(false)

    if (res.success) {
      setShowForm(false)
      loadHistoricos(selectedAlunoId)
    } else {
      setError(res.error || 'Erro ao consolidar histórico.')
    }
  }

  const handleNew = () => {
    setFormData({
      anoLetivoId: anosLetivos.length > 0 ? anosLetivos[0].id : '',
      serieId: series.length > 0 ? series[0].id : '',
      mediaFinal: 7.0,
      frequenciaFinal: 85.0,
      resultado: 'aprovado',
      observacoes: ''
    })
    setDisciplinasNotasForm([])
    setSelectedDisciplinaId(disciplinas[0]?.id || '')
    setNotaInput(7.0)
    setFreqInput(90.0)
    setCargaHorariaInput(80)
    setError(null)
    setShowForm(true)
  }

  const handleDeleteClick = (item: Historico) => {
    setDeletingItem(item)
    setMotivoExclusao('')
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return
    if (!motivoExclusao.trim()) {
      setDeleteError('A justificativa é obrigatória para excluir históricos consolidados.')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    const res = await deleteHistorico(deletingItem.id, motivoExclusao)

    setIsDeleting(false)

    if (res.success) {
      setDeletingItem(null)
      loadHistoricos(selectedAlunoId)
    } else {
      setDeleteError(res.error || 'Não foi possível excluir o histórico consolidado.')
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center text-slate-400 dark:text-slate-500">
        <LucideLoader2 size={24} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Histórico Escolar</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Consolide notas anuais e consulte o histórico oficial dos alunos.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Aluno:</label>
          <select
            value={selectedAlunoId}
            onChange={e => setSelectedAlunoId(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm min-w-[240px]"
          >
            <option value="" className="dark:bg-slate-800">Selecione um Aluno...</option>
            {alunos.map(al => (
              <option key={al.id} value={al.id} className="dark:bg-slate-800">{al.nomeCompleto}</option>
            ))}
          </select>

          {selectedAlunoId && !showForm && (
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 text-white bg-[var(--color-csm-red)] hover:opacity-90 rounded-lg text-sm font-medium transition-opacity"
            >
              <LucidePlus size={16} /> Consolidar Ano
            </button>
          )}
        </div>
      </div>

      {!selectedAlunoId ? (
        <div className="p-8 border border-dashed border-gray-300 dark:border-slate-800 rounded-xl text-center text-slate-500 dark:text-slate-400">
          <LucideGraduationCap className="mx-auto mb-2 text-slate-400 dark:text-slate-500" size={28} />
          <p>Selecione um aluno acima para visualizar e gerenciar seu histórico escolar consolidado.</p>
        </div>
      ) : (
        <>
          {listLoading ? (
            <div className="py-12 flex justify-center text-slate-400 dark:text-slate-500">
              <LucideLoader2 size={24} className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {historicos.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl text-center text-slate-500 dark:text-slate-400 bg-gray-50/30 dark:bg-slate-900/30">
                  <LucideInfo className="mx-auto mb-2 text-slate-400 dark:text-slate-500" size={24} />
                  <p>Este aluno não possui nenhum ano consolidado no histórico escolar.</p>
                </div>
              ) : (
                historicos.map(item => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div key={item.id} className="border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
                      {/* Cabeçalho do Card (Ano letivo e status) */}
                      <div 
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/40 select-none bg-gray-50/20 dark:bg-slate-800/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-[var(--color-csm-red)] dark:text-red-400 flex items-center justify-center">
                            <LucideGraduationCap size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-850 dark:text-slate-100 text-base">{item.ano} - {item.serieNome}</h4>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>Média Geral: <strong className="text-slate-950 dark:text-slate-200">{item.mediaFinal.toFixed(2)}</strong></span>
                              <span>Frequência: <strong className="text-slate-950 dark:text-slate-200">{item.frequenciaFinal.toFixed(1)}%</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.resultado === 'aprovado' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/50">Aprovado</span>
                          )}
                          {item.resultado === 'reprovado' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50">Reprovado</span>
                          )}
                          {item.resultado !== 'aprovado' && item.resultado !== 'reprovado' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 capitalize">{item.resultado}</span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(item);
                            }}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Excluir Consolidação"
                          >
                            <LucideTrash2 size={16} />
                          </button>
                          
                          {isExpanded ? <LucideChevronUp size={20} className="text-slate-400 dark:text-slate-500" /> : <LucideChevronDown size={20} className="text-slate-400 dark:text-slate-500" />}
                        </div>
                      </div>

                      {/* Corpo do Acordeão */}
                      {isExpanded && (
                        <div className="border-t border-gray-150 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/40 space-y-4 animate-slide-down">
                          <h5 className="font-semibold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-2">
                            <LucideBookOpen size={16} className="text-slate-400 dark:text-slate-500" />
                            Grade de Disciplinas e Notas do Ano
                          </h5>
                          
                          <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50/50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-305 font-semibold">
                                <tr>
                                  <th className="px-5 py-3 font-semibold">Disciplina</th>
                                  <th className="px-5 py-3 font-semibold">Média Final</th>
                                  <th className="px-5 py-3 font-semibold">Frequência</th>
                                  <th className="px-5 py-3 font-semibold">Carga Horária</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-705 dark:text-slate-300">
                                {item.disciplinasNotas.map((disc, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/20">
                                    <td className="px-5 py-3.5 font-medium text-slate-850 dark:text-slate-200">{disc.disciplinaNome}</td>
                                    <td className="px-5 py-3.5">{disc.mediaFinal.toFixed(2)}</td>
                                    <td className="px-5 py-3.5">{disc.frequencia}%</td>
                                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{disc.cargaHoraria} horas</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {item.observacoes && (
                            <div className="p-4 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg text-sm">
                              <h6 className="font-semibold text-slate-705 dark:text-slate-205 mb-1">Observações da Coordenação:</h6>
                              <p className="text-slate-600 dark:text-slate-400 italic font-medium">"{item.observacoes}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Modal para Consolidação Manual do Ano */}
      {showForm && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden my-8 animate-scale-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-slate-800">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <LucideGraduationCap size={22} className="text-[var(--color-csm-red)]" />
                Consolidação Anual de Histórico
              </h4>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="text-slate-400 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350"
              >
                <LucideX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && <div className="p-3 bg-red-50 dark:bg-red-950/45 border border-red-105 dark:border-red-900/50 text-red-650 dark:text-red-400 rounded-lg text-sm">{error}</div>}

              {/* Informações Gerais do Ano */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 dark:bg-slate-850/30 p-4 border border-gray-200 dark:border-slate-800 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Ano Letivo *</label>
                  <select
                    required
                    value={formData.anoLetivoId}
                    onChange={e => setFormData({...formData, anoLetivoId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                  >
                    {anosLetivos.map(a => (
                      <option key={a.id} value={a.id} className="dark:bg-slate-855">{a.ano}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Série *</label>
                  <select
                    required
                    value={formData.serieId}
                    onChange={e => setFormData({...formData, serieId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                  >
                    {series.map(s => (
                      <option key={s.id} value={s.id} className="dark:bg-slate-855">{s.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Resultado Final *</label>
                  <select
                    required
                    value={formData.resultado}
                    onChange={e => setFormData({...formData, resultado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-855 text-sm capitalize"
                  >
                    <option value="aprovado" className="dark:bg-slate-855">Aprovado</option>
                    <option value="reprovado" className="dark:bg-slate-855">Reprovado</option>
                    <option value="transferido" className="dark:bg-slate-855">Transferido</option>
                    <option value="desistente" className="dark:bg-slate-855">Desistente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Média Geral do Ano *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.mediaFinal}
                    onChange={e => setFormData({...formData, mediaFinal: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Frequência Geral (%) *</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.frequenciaFinal}
                    onChange={e => setFormData({...formData, frequenciaFinal: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                  />
                </div>
              </div>

              {/* Lançamento Rápido de Disciplina e Nota */}
              <div className="space-y-3">
                <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Lançamento de Disciplinas na Grade Anual</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-gray-50/20 dark:bg-slate-850/10 border border-gray-200 dark:border-slate-800 p-4 rounded-xl">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-700 dark:text-slate-350 mb-1">Disciplina</label>
                    <select
                      value={selectedDisciplinaId}
                      onChange={e => setSelectedDisciplinaId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 text-sm"
                    >
                      {disciplinas.map(d => (
                        <option key={d.id} value={d.id} className="dark:bg-slate-850">{d.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-350 mb-1">Média Final</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={notaInput}
                      onChange={e => setNotaInput(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-350 mb-1">Freq. (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={freqInput}
                      onChange={e => setFreqInput(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 dark:text-slate-350 mb-1">Carga Horária (h)</label>
                    <input
                      type="number"
                      min="10"
                      max="400"
                      value={cargaHorariaInput}
                      onChange={e => setCargaHorariaInput(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddDisciplina}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-800 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
                    >
                      <LucidePlus size={14} /> Adicionar à Tabela
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabela de Disciplinas Adicionadas */}
              {disciplinasNotasForm.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      <tr>
                        <th className="px-4 py-2 font-medium">Disciplina</th>
                        <th className="px-4 py-2 font-medium">Nota Final</th>
                        <th className="px-4 py-2 font-medium">Frequência</th>
                        <th className="px-4 py-2 font-medium">Carga Horária</th>
                        <th className="px-4 py-2 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {disciplinasNotasForm.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-2 font-semibold text-slate-850 dark:text-slate-200">{item.disciplinaNome}</td>
                          <td className="px-4 py-2">{item.mediaFinal.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.frequencia}%</td>
                          <td className="px-4 py-2">{item.cargaHoraria}h</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveDisciplina(item.disciplinaId)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações da Consolidação</label>
                <textarea
                  value={formData.observacoes}
                  onChange={e => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                  rows={2}
                  placeholder="Ex: Aluno cumpriu todas as atividades e obteve excelente rendimento."
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-205 dark:hover:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-700 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-csm-red)] hover:opacity-95 rounded-lg disabled:opacity-50 transition-opacity"
                >
                  {isSubmitting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideSave size={16} />}
                  Salvar Histórico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de exclusão auditada de Histórico */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-150 dark:border-slate-800 pb-2">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirmar Exclusão de Histórico</h4>
                <button 
                  onClick={() => setDeletingItem(null)} 
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350"
                >
                  <LucideX size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-350 mb-4">
                Você tem certeza de que deseja excluir permanentemente o histórico consolidado de <strong className="text-slate-900 dark:text-white">{deletingItem.ano} - {deletingItem.serieNome}</strong>?
                Esta operação requer uma justificativa de auditoria.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {deleteError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Justificativa de Exclusão *</label>
                <textarea
                  required
                  value={motivoExclusao}
                  onChange={e => setMotivoExclusao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                  rows={3}
                  placeholder="Justifique por que esta consolidação anual está sendo apagada..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-205 dark:hover:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-700 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-650 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideTrash2 size={16} />}
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
