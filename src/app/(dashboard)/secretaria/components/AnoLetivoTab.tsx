'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react'
import { getAnosLetivos, createAnoLetivo, updateAnoLetivo } from '@/actions/secretaria'

export function AnoLetivoTab() {
  const [anos, setAnos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ id: '', ano: new Date().getFullYear(), dataInicio: '', dataFim: '', ativo: true })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const data = await getAnosLetivos()
    setAnos(data)
    setLoading(false)
  }

  function handleEdit(ano: any) {
    setFormData({
      id: ano.id,
      ano: ano.ano,
      dataInicio: new Date(ano.dataInicio).toISOString().split('T')[0],
      dataFim: new Date(ano.dataFim).toISOString().split('T')[0],
      ativo: ano.ativo
    })
    setIsModalOpen(true)
  }

  function handleNew() {
    setFormData({ id: '', ano: new Date().getFullYear(), dataInicio: '', dataFim: '', ativo: true })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const payload = {
        ano: Number(formData.ano),
        dataInicio: new Date(formData.dataInicio),
        dataFim: new Date(formData.dataFim),
        ativo: formData.ativo
      }

      if (formData.id) {
        await updateAnoLetivo(formData.id, payload)
      } else {
        await createAnoLetivo(payload)
      }
      
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar ano letivo")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Anos Letivos</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie os anos letivos e períodos da instituição</p>
        </div>
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-605 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Ano Letivo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Ano</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Data Início</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Data Fim</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {anos.map((ano) => (
                <tr key={ano.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">{ano.ano}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {new Date(ano.dataInicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {new Date(ano.dataFim).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ano.ativo ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300">
                        <CheckCircle2 size={14} className="mr-1" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300">
                        <XCircle size={14} className="mr-1" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(ano)} className="text-blue-605 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors">
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {anos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhum ano letivo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {formData.id ? 'Editar Ano Letivo' : 'Novo Ano Letivo'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ano *</label>
                <input 
                  type="number" 
                  required
                  value={formData.ano}
                  onChange={e => setFormData({...formData, ano: Number(e.target.value)})}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none text-sm" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.dataInicio}
                    onChange={e => setFormData({...formData, dataInicio: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Fim *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.dataFim}
                    onChange={e => setFormData({...formData, dataFim: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none text-sm" 
                  />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input
                  id="ativo"
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-slate-700 rounded"
                />
                <label htmlFor="ativo" className="ml-2 block text-sm text-slate-900 dark:text-slate-100 font-medium select-none">
                  Ano Letivo Ativo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-750 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors text-sm border border-gray-300 dark:border-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
