'use client'

import { useState, useEffect } from 'react'
import { getSalas, createSala, updateSala, deleteSala } from '@/actions/pedagogico'
import { LucidePlus, LucideEdit, LucideSave, LucideX, LucideLoader2, LucideTrash2 } from 'lucide-react'

type Sala = {
  id: string;
  nome: string;
  capacidade: number;
  localizacao: string | null;
  observacoes: string | null;
}

export function SalaTab() {
  const [items, setItems] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<{ id: string; nome: string; capacidade: number; localizacao: string; observacoes: string }>({
    id: '', nome: '', capacidade: 30, localizacao: '', observacoes: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  // Estados para exclusão auditada
  const [deletingItem, setDeletingItem] = useState<Sala | null>(null)
  const [motivoExclusao, setMotivoExclusao] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const res = await getSalas()
    if (res.success && res.data) {
      setItems(res.data as Sala[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const payload = {
      nome: formData.nome,
      capacidade: Number(formData.capacidade),
      localizacao: formData.localizacao || undefined,
      observacoes: formData.observacoes || undefined,
    }

    let result;
    if (isEditing && formData.id) {
      result = await updateSala(formData.id, payload)
    } else {
      result = await createSala(payload)
    }

    setIsSubmitting(false)

    if (result.success) {
      setShowForm(false)
      loadData()
    } else {
      setError(result.error || 'Erro ao salvar.')
    }
  }

  const handleEdit = (item: Sala) => {
    setFormData({
      id: item.id,
      nome: item.nome,
      capacidade: item.capacidade,
      localizacao: item.localizacao || '',
      observacoes: item.observacoes || ''
    })
    setIsEditing(true)
    setShowForm(true)
  }

  const handleNew = () => {
    setFormData({ id: '', nome: '', capacidade: 30, localizacao: '', observacoes: '' })
    setIsEditing(false)
    setShowForm(true)
  }

  const handleDeleteClick = (item: Sala) => {
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

    const res = await deleteSala(deletingItem.id, motivoExclusao)

    setIsDeleting(false)

    if (res.success) {
      setDeletingItem(null)
      loadData()
    } else {
      setDeleteError(res.error || 'Não foi possível excluir esta sala.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Salas de Aula</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cadastre e gerencie as salas físicas da instituição.</p>
        </div>
        {!showForm && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <LucidePlus size={16} /> Nova Sala
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">{isEditing ? 'Editar Sala' : 'Nova Sala'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              <LucideX size={20} />
            </button>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/50">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome/Identificador *</label>
              <input
                required
                type="text"
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
                placeholder="Ex: Sala 102, Auditório"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacidade Máxima de Alunos *</label>
              <input
                required
                type="number"
                min={1}
                value={formData.capacidade}
                onChange={e => setFormData({...formData, capacidade: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
                placeholder="Ex: 30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Localização física</label>
              <input
                type="text"
                value={formData.localizacao}
                onChange={e => setFormData({...formData, localizacao: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
                placeholder="Ex: Prédio B, 2º Andar"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={e => setFormData({...formData, observacoes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
                rows={2}
                placeholder="Ex: Contém smart TV e ar condicionado funcionando."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
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
              Salvar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400 dark:text-slate-500">
          <LucideLoader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 font-semibold">Nome</th>
                <th className="px-6 py-3 font-semibold">Capacidade</th>
                <th className="px-6 py-3 font-semibold">Localização</th>
                <th className="px-6 py-3 font-semibold">Observações</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma sala cadastrada.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.nome}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.capacidade} alunos</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.localizacao || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">{item.observacoes || '-'}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Editar"
                      >
                        <LucideEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        title="Excluir"
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

      {/* Modal de Exclusão Auditada */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirmar Exclusão</h4>
                <button 
                  onClick={() => setDeletingItem(null)} 
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <LucideX size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Você tem certeza de que deseja excluir a sala <strong className="text-slate-900 dark:text-white">{deletingItem.nome}</strong>?
                Esta operação é permanente e requer uma justificativa.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/50">
                  {deleteError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo da Exclusão *</label>
                <textarea
                  required
                  value={motivoExclusao}
                  onChange={e => setMotivoExclusao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none text-sm"
                  rows={3}
                  placeholder="Justifique a exclusão desta sala..."
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
                  Excluir Permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
