'use client'

import { useState, useEffect } from 'react'
import { 
  getSeries, 
  getDisciplinas, 
  getGradeCurricular, 
  createGradeCurricular, 
  deleteGradeCurricular 
} from '@/actions/pedagogico'
import { LucidePlus, LucideTrash2, LucideLoader2, LucideX, LucideSave, LucideInfo } from 'lucide-react'

type Serie = {
  id: string;
  nome: string;
  nivelEnsinoId: string;
}

type Disciplina = {
  id: string;
  nome: string;
  sigla: string | null;
  tipoBase: 'basica' | 'complementar' | 'tecnica' | 'livre';
}

type GradeItem = {
  id: string;
  serieId: string;
  disciplinaId: string;
  cargaHorariaSemanal: number;
  aulasPorSemana: number;
  disciplinaNome: string;
  disciplinaSigla: string | null;
  tipoBase: 'basica' | 'complementar' | 'tecnica' | 'livre';
  formaAvaliacao: 'numerica' | 'conceitual' | 'mista' | 'sem_avaliacao';
}

export function GradeCurricularTab() {
  const [series, setSeries] = useState<Serie[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [selectedSerieId, setSelectedSerieId] = useState<string>('')
  const [gradeItems, setGradeItems] = useState<GradeItem[]>([])
  
  const [loading, setLoading] = useState(true)
  const [gradeLoading, setGradeLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form de inclusão na grade
  const [addFormData, setAddFormData] = useState({
    disciplinaId: '',
    cargaHorariaSemanal: 2,
    aulasPorSemana: 2
  })

  // Exclusão auditada
  const [deletingItem, setDeletingItem] = useState<GradeItem | null>(null)
  const [motivoExclusao, setMotivoExclusao] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Carrega as Séries e Disciplinas iniciais
  const loadInitialData = async () => {
    setLoading(true)
    const [resSeries, resDisciplinas] = await Promise.all([
      getSeries(),
      getDisciplinas()
    ])

    if (resSeries.success && resSeries.data) {
      setSeries(resSeries.data as Serie[])
      if (resSeries.data.length > 0) {
        setSelectedSerieId(resSeries.data[0].id)
      }
    }
    if (resDisciplinas.success && resDisciplinas.data) {
      setDisciplinas(resDisciplinas.data as Disciplina[])
    }
    setLoading(false)
  }

  // Carrega a Grade da série selecionada
  const loadGradeData = async (serieId: string) => {
    if (!serieId) return
    setGradeLoading(true)
    const res = await getGradeCurricular(serieId)
    if (res.success && res.data) {
      setGradeItems(res.data as GradeItem[])
    }
    setGradeLoading(false)
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedSerieId) {
      loadGradeData(selectedSerieId)
    }
  }, [selectedSerieId])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addFormData.disciplinaId) {
      setError('Selecione uma disciplina para adicionar.')
      return
    }

    // Verifica se a disciplina já está na grade
    const exists = gradeItems.some(item => item.disciplinaId === addFormData.disciplinaId)
    if (exists) {
      setError('Esta disciplina já está vinculada à grade desta série.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await createGradeCurricular({
      serieId: selectedSerieId,
      disciplinaId: addFormData.disciplinaId,
      cargaHorariaSemanal: Number(addFormData.cargaHorariaSemanal),
      aulasPorSemana: Number(addFormData.aulasPorSemana)
    })

    setIsSubmitting(false)

    if (res.success) {
      setShowAddModal(false)
      loadGradeData(selectedSerieId)
    } else {
      setError(res.error || 'Erro ao adicionar disciplina à grade.')
    }
  }

  const handleOpenAdd = () => {
    setAddFormData({
      disciplinaId: disciplinas[0]?.id || '',
      cargaHorariaSemanal: 2,
      aulasPorSemana: 2
    })
    setError(null)
    setShowAddModal(true)
  }

  const handleDeleteClick = (item: GradeItem) => {
    setDeletingItem(item)
    setMotivoExclusao('')
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return
    if (!motivoExclusao.trim()) {
      setDeleteError('É obrigatório informar o motivo da exclusão.')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    const res = await deleteGradeCurricular(deletingItem.id, motivoExclusao)

    setIsDeleting(false)

    if (res.success) {
      setDeletingItem(null)
      loadGradeData(selectedSerieId)
    } else {
      setDeleteError(res.error || 'Erro ao remover a disciplina da grade.')
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Grades Curriculares</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Defina o conjunto de disciplinas vinculadas permanentemente a cada série.</p>
        </div>
        
        {series.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Série:</label>
            <select
              value={selectedSerieId}
              onChange={e => setSelectedSerieId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white text-sm min-w-[200px]"
            >
              {series.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              <LucidePlus size={16} /> Adicionar Disciplina
            </button>
          </div>
        )}
      </div>

      {series.length === 0 ? (
        <div className="p-8 border border-dashed border-gray-300 dark:border-slate-800 rounded-xl text-center text-slate-500 dark:text-slate-400">
          <LucideInfo className="mx-auto mb-2 text-slate-400 dark:text-slate-500" size={24} />
          <p>Nenhuma Série cadastrada no Módulo Pedagógico. Cadastre primeiro uma Série.</p>
        </div>
      ) : (
        <>
          {gradeLoading ? (
            <div className="py-12 flex justify-center text-slate-400 dark:text-slate-500">
              <LucideLoader2 size={24} className="animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Disciplina</th>
                    <th className="px-6 py-3 font-semibold">Sigla</th>
                    <th className="px-6 py-3 font-semibold">Base</th>
                    <th className="px-6 py-3 font-semibold">Carga Horária Semanal</th>
                    <th className="px-6 py-3 font-semibold">Aulas por Semana</th>
                    <th className="px-6 py-3 font-semibold">Forma Avaliação</th>
                    <th className="px-6 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {gradeItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        Nenhuma disciplina vinculada a esta série.
                      </td>
                    </tr>
                  ) : (
                    gradeItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.disciplinaNome}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.disciplinaSigla || '-'}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 capitalize">{item.tipoBase}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.cargaHorariaSemanal} horas</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.aulasPorSemana} aulas</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 capitalize">{item.formaAvaliacao.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                            title="Remover da Grade"
                          >
                            <LucideTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal para adicionar disciplina à Grade */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden animate-scale-in">
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Adicionar Disciplina à Grade</h4>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <LucideX size={20} />
                </button>
              </div>

              {error && <div className="p-3 bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Disciplina *</label>
                <select
                  required
                  value={addFormData.disciplinaId}
                  onChange={e => setAddFormData({...addFormData, disciplinaId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white text-sm"
                >
                  {disciplinas.length === 0 ? (
                    <option value="">Nenhuma disciplina disponível</option>
                  ) : (
                    disciplinas.map(d => (
                      <option key={d.id} value={d.id}>{d.nome} {d.sigla ? `(${d.sigla})` : ''}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Horas por Semana *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={addFormData.cargaHorariaSemanal}
                    onChange={e => setAddFormData({...addFormData, cargaHorariaSemanal: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aulas por Semana *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={addFormData.aulasPorSemana}
                    onChange={e => setAddFormData({...addFormData, aulasPorSemana: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideSave size={16} />}
                  Vincular à Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de exclusão auditada de item de Grade */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirmar Remoção da Grade</h4>
                <button 
                  onClick={() => setDeletingItem(null)} 
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <LucideX size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Você tem certeza de que deseja remover a disciplina <strong className="text-slate-900 dark:text-white">{deletingItem.disciplinaNome}</strong> da grade desta série?
                Esta operação é permanente e requer uma justificativa de alteração curricular.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {deleteError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo da Alteração Curricular *</label>
                <textarea
                  required
                  value={motivoExclusao}
                  onChange={e => setMotivoExclusao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none text-sm"
                  rows={3}
                  placeholder="Justifique a remoção da disciplina da grade..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideTrash2 size={16} />}
                  Confirmar Remoção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

