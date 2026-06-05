'use client'

import { useState, useEffect } from 'react'
import { getOcorrencias, createOcorrencia, updateOcorrencia, deleteOcorrencia, getAlunosList } from '@/actions/secretaria'
import { LucidePlus, LucideEdit, LucideTrash2, LucideX, LucideSave, LucideLoader2, LucideFileWarning, LucideAlertTriangle } from 'lucide-react'

type AlunoSimple = {
  id: string;
  nomeCompleto: string;
  cpf: string | null;
}

type Ocorrencia = {
  id: string;
  data: Date;
  titulo: string;
  descricao: string;
  providencia: string | null;
  alunoId: string;
  alunoNome: string;
  cadastradoPorId: string;
  cadastradoPorNome: string;
}

export function OcorrenciaTab() {
  const [items, setItems] = useState<Ocorrencia[]>([])
  const [alunos, setAlunos] = useState<AlunoSimple[]>([])
  const [selectedFilterAlunoId, setSelectedFilterAlunoId] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<{
    id: string;
    alunoId: string;
    data: string;
    titulo: string;
    descricao: string;
    providencia: string;
  }>({
    id: '',
    alunoId: '',
    data: new Date().toISOString().split('T')[0],
    titulo: '',
    descricao: '',
    providencia: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  // Estados para exclusão auditada
  const [deletingItem, setDeletingItem] = useState<Ocorrencia | null>(null)
  const [motivoExclusao, setMotivoExclusao] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadInitialData = async () => {
    setLoading(true)
    const resAlunos = await getAlunosList()
    setAlunos(resAlunos)
    setLoading(false)
  }

  const loadOcorrencias = async (alunoId?: string) => {
    setListLoading(true)
    const res = await getOcorrencias(alunoId || undefined)
    if (res.success && res.data) {
      setItems(res.data as Ocorrencia[])
    }
    setListLoading(false)
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadOcorrencias(selectedFilterAlunoId)
  }, [selectedFilterAlunoId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.alunoId) {
      setError('Selecione um aluno para registrar a ocorrência.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload = {
      alunoId: formData.alunoId,
      data: new Date(formData.data),
      titulo: formData.titulo,
      descricao: formData.descricao,
      providencia: formData.providencia || undefined
    }

    let result;
    if (isEditing && formData.id) {
      result = await updateOcorrencia(formData.id, payload)
    } else {
      result = await createOcorrencia(payload)
    }

    setIsSubmitting(false)

    if (result.success) {
      setShowForm(false)
      loadOcorrencias(selectedFilterAlunoId)
    } else {
      setError(result.error || 'Erro ao salvar ocorrência.')
    }
  }

  const handleEdit = (item: Ocorrencia) => {
    setFormData({
      id: item.id,
      alunoId: item.alunoId,
      data: new Date(item.data).toISOString().split('T')[0],
      titulo: item.titulo,
      descricao: item.descricao,
      providencia: item.providencia || ''
    })
    setIsEditing(true)
    setShowForm(true)
  }

  const handleNew = () => {
    setFormData({
      id: '',
      alunoId: alunos.length > 0 ? alunos[0].id : '',
      data: new Date().toISOString().split('T')[0],
      titulo: '',
      descricao: '',
      providencia: ''
    })
    setIsEditing(false)
    setShowForm(true)
  }

  const handleDeleteClick = (item: Ocorrencia) => {
    setDeletingItem(item)
    setMotivoExclusao('')
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return
    if (!motivoExclusao.trim()) {
      setDeleteError('É obrigatório justificar a exclusão da ocorrência.')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    const res = await deleteOcorrencia(deletingItem.id, motivoExclusao)

    setIsDeleting(false)

    if (res.success) {
      setDeletingItem(null)
      loadOcorrencias(selectedFilterAlunoId)
    } else {
      setDeleteError(res.error || 'Não foi possível excluir esta ocorrência.')
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center text-gray-400">
        <LucideLoader2 size={24} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Ocorrências Disciplinares</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Registre e consulte advertências, suspensões ou eventos pedagógicos relevantes de alunos.</p>
        </div>

        {!showForm && (
          <div className="flex items-center gap-3">
            <select
              value={selectedFilterAlunoId}
              onChange={e => setSelectedFilterAlunoId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm min-w-[200px]"
            >
              <option value="" className="dark:bg-slate-800">Filtrar: Todos os Alunos</option>
              {alunos.map(al => (
                <option key={al.id} value={al.id} className="dark:bg-slate-800">{al.nomeCompleto}</option>
              ))}
            </select>

            <button
              onClick={handleNew}
              disabled={alunos.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-white bg-[var(--color-csm-red)] hover:opacity-90 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
            >
              <LucidePlus size={16} /> Nova Ocorrência
            </button>
          </div>
        )}
      </div>

      {alunos.length === 0 ? (
        <div className="p-8 border border-dashed border-gray-300 dark:border-slate-850 rounded-xl text-center text-slate-500 dark:text-slate-400">
          <LucideAlertTriangle className="mx-auto mb-2 text-slate-400 dark:text-slate-500" size={24} />
          <p>Nenhum Aluno cadastrado ou ativo para registrar ocorrências.</p>
        </div>
      ) : (
        <>
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-slate-800 pb-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <LucideFileWarning size={20} className="text-[var(--color-csm-red)]" />
                  {isEditing ? 'Editar Ocorrência' : 'Registrar Ocorrência'}
                </h4>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350">
                  <LucideX size={20} />
                </button>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-650 dark:text-red-400 rounded-lg text-sm">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aluno *</label>
                  <select
                    required
                    disabled={isEditing}
                    value={formData.alunoId}
                    onChange={e => setFormData({...formData, alunoId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    {alunos.map(al => (
                      <option key={al.id} value={al.id} className="dark:bg-slate-855">{al.nomeCompleto}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data do Evento *</label>
                  <input
                    required
                    type="date"
                    value={formData.data}
                    onChange={e => setFormData({...formData, data: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 text-sm bg-white dark:bg-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título/Infração *</label>
                  <input
                    required
                    type="text"
                    value={formData.titulo}
                    onChange={e => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 text-sm bg-white dark:bg-slate-850"
                    placeholder="Ex: Atraso recorrente, Indisciplina"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição Detalhada do Evento *</label>
                  <textarea
                    required
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 text-sm bg-white dark:bg-slate-850"
                    rows={4}
                    placeholder="Descreva exatamente o que ocorreu durante o evento..."
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Providência Pedagógica / Administrativa Tomada</label>
                  <textarea
                    value={formData.providencia}
                    onChange={e => setFormData({...formData, providencia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-slate-100 text-sm bg-white dark:bg-slate-850"
                    rows={2}
                    placeholder="Ex: Conversa com o aluno, advertência verbal, contato com os pais ou suspensão."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-csm-red)] hover:opacity-95 rounded-lg disabled:opacity-50 transition-opacity"
                >
                  {isSubmitting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideSave size={16} />}
                  Gravar Ocorrência
                </button>
              </div>
            </form>
          )}

          {listLoading ? (
            <div className="py-12 flex justify-center text-slate-400 dark:text-slate-500">
              <LucideLoader2 size={24} className="animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Data</th>
                    <th className="px-6 py-3 font-semibold">Aluno</th>
                    <th className="px-6 py-3 font-semibold">Título</th>
                    <th className="px-6 py-3 font-semibold">Descrição</th>
                    <th className="px-6 py-3 font-semibold">Providência</th>
                    <th className="px-6 py-3 font-semibold">Cadastrado por</th>
                    <th className="px-6 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        Nenhuma ocorrência registrada.
                      </td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(item.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{item.alunoNome}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{item.titulo}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={item.descricao}>
                          {item.descricao}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={item.providencia || ''}>
                          {item.providencia || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.cadastradoPorNome}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-605 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            title="Editar Ocorrência"
                          >
                            <LucideEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-650 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                            title="Excluir Ocorrência"
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

      {/* Modal de confirmação de Exclusão Auditada */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden animate-scale-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirmar Exclusão de Ocorrência</h4>
                <button 
                  onClick={() => setDeletingItem(null)} 
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-350"
                >
                  <LucideX size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-350 mb-4">
                Deseja realmente remover a ocorrência <strong className="text-slate-900 dark:text-white">"{deletingItem.titulo}"</strong> registrada para <strong className="text-slate-900 dark:text-white">{deletingItem.alunoNome}</strong>?
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
                  placeholder="Justifique por que esta ocorrência está sendo apagada..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
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
