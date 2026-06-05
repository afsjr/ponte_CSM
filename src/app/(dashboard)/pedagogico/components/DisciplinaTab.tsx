'use client'

import { useState, useEffect } from 'react'
import { getDisciplinas, createDisciplina, updateDisciplina } from '@/actions/pedagogico'
import { LucidePlus, LucideEdit, LucideSave, LucideX, LucideLoader2 } from 'lucide-react'

type Disciplina = {
  id: string;
  nome: string;
  sigla: string | null;
  descricao: string | null;
  tipoBase: 'basica' | 'complementar' | 'tecnica' | 'livre';
  formaAvaliacao: 'numerica' | 'conceitual' | 'mista' | 'sem_avaliacao';
}

export function DisciplinaTab() {
  const [items, setItems] = useState<Disciplina[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<{ id: string, nome: string, sigla: string, descricao: string, tipoBase: 'basica' | 'complementar' | 'tecnica' | 'livre', formaAvaliacao: 'numerica' | 'conceitual' | 'mista' | 'sem_avaliacao' }>({ 
    id: '', nome: '', sigla: '', descricao: '', tipoBase: 'basica', formaAvaliacao: 'numerica' 
  })
  const [isEditing, setIsEditing] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const res = await getDisciplinas()
    if (res.success && res.data) {
      setItems(res.data as Disciplina[])
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
      sigla: formData.sigla || undefined,
      descricao: formData.descricao || undefined,
      tipoBase: formData.tipoBase,
      formaAvaliacao: formData.formaAvaliacao,
    }

    let result;
    if (isEditing && formData.id) {
      result = await updateDisciplina(formData.id, payload)
    } else {
      result = await createDisciplina(payload)
    }

    setIsSubmitting(false)

    if (result.success) {
      setShowForm(false)
      loadData()
    } else {
      setError(result.error || 'Erro ao salvar.')
    }
  }

  const handleEdit = (item: Disciplina) => {
    setFormData({
      id: item.id,
      nome: item.nome,
      sigla: item.sigla || '',
      descricao: item.descricao || '',
      tipoBase: item.tipoBase || 'basica',
      formaAvaliacao: item.formaAvaliacao || 'numerica'
    })
    setIsEditing(true)
    setShowForm(true)
  }

  const handleNew = () => {
    setFormData({ id: '', nome: '', sigla: '', descricao: '', tipoBase: 'basica', formaAvaliacao: 'numerica' })
    setIsEditing(false)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Disciplinas</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie o catálogo de disciplinas oferecidas.</p>
        </div>
        {!showForm && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <LucidePlus size={16} /> Nova Disciplina
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">{isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}</h4>
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
                placeholder="Ex: Matemática"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sigla</label>
              <input
                type="text"
                value={formData.sigla}
                onChange={e => setFormData({...formData, sigla: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none uppercase"
                placeholder="Ex: MAT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Base</label>
              <select
                value={formData.tipoBase}
                onChange={e => setFormData({...formData, tipoBase: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white"
              >
                <option value="basica">Base Comum</option>
                <option value="complementar">Complementar</option>
                <option value="tecnica">Técnica / Profissionalizante</option>
                <option value="livre">Livre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Forma de Avaliação</label>
              <select
                value={formData.formaAvaliacao}
                onChange={e => setFormData({...formData, formaAvaliacao: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white"
              >
                <option value="numerica">Numérica (0 a 10)</option>
                <option value="conceitual">Conceitual (A, B, C...)</option>
                <option value="mista">Mista</option>
                <option value="sem_avaliacao">Sem Avaliação</option>
              </select>
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
                <th className="px-6 py-3 font-semibold">Sigla</th>
                <th className="px-6 py-3 font-semibold">Base</th>
                <th className="px-6 py-3 font-semibold">Avaliação</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma disciplina cadastrada.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.nome}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.sigla || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 capitalize">{item.tipoBase.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 capitalize">{item.formaAvaliacao.replace('_', ' ')}</td>
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
