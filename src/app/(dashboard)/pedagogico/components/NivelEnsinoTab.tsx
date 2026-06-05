'use client'

import { useState, useEffect } from 'react'
import { getNiveisEnsino, createNivelEnsino, updateNivelEnsino } from '@/actions/pedagogico'
import { LucidePlus, LucideEdit, LucideSave, LucideX, LucideLoader2 } from 'lucide-react'

type NivelEnsino = {
  id: string;
  nome: string;
  descricao: string | null;
  ordemExibicao: number | null;
}

export function NivelEnsinoTab() {
  const [items, setItems] = useState<NivelEnsino[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({ id: '', nome: '', descricao: '', ordemExibicao: 0 })
  const [isEditing, setIsEditing] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const res = await getNiveisEnsino()
    if (res.success && res.data) {
      setItems(res.data)
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
      descricao: formData.descricao || undefined,
      ordemExibicao: Number(formData.ordemExibicao)
    }

    let result;
    if (isEditing && formData.id) {
      result = await updateNivelEnsino(formData.id, payload)
    } else {
      result = await createNivelEnsino(payload)
    }

    setIsSubmitting(false)

    if (result.success) {
      setShowForm(false)
      loadData()
    } else {
      setError(result.error || 'Erro ao salvar.')
    }
  }

  const handleEdit = (item: NivelEnsino) => {
    setFormData({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao || '',
      ordemExibicao: item.ordemExibicao || 0
    })
    setIsEditing(true)
    setShowForm(true)
  }

  const handleNew = () => {
    setFormData({ id: '', nome: '', descricao: '', ordemExibicao: items.length + 1 })
    setIsEditing(false)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Níveis de Ensino</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie os níveis de ensino (Ex: Ensino Fundamental, Técnico).</p>
        </div>
        {!showForm && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <LucidePlus size={16} /> Novo Nível
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">{isEditing ? 'Editar Nível' : 'Novo Nível'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              <LucideX size={20} />
            </button>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/50">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
              <input
                required
                type="text"
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
                placeholder="Ex: Ensino Fundamental I"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={e => setFormData({...formData, descricao: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ordem de Exibição</label>
              <input
                type="number"
                value={formData.ordemExibicao}
                onChange={e => setFormData({...formData, ordemExibicao: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
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
                <th className="px-6 py-3 font-semibold">Descrição</th>
                <th className="px-6 py-3 font-semibold">Ordem</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhum nível de ensino cadastrado.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.nome}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.descricao || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.ordemExibicao}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Editar"
                      >
                        <LucideEdit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
