'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, UserPlus, Users, Search } from 'lucide-react'
import { vincularResponsavel, getVinculosAluno, removerVinculo, getResponsaveisList } from '@/actions/responsavel'
import { getAlunosList } from '@/actions/secretaria'

export function VinculosTab() {
  const [alunos, setAlunos] = useState<any[]>([])
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('')
  const [vinculos, setVinculos] = useState<any[]>([])
  const [responsaveis, setResponsaveis] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [loadingVinculos, setLoadingVinculos] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [deleteId, setDeleteId] = useState('')
  const [justificativa, setJustificativa] = useState('')

  const [formData, setFormData] = useState({
    responsavelId: '',
    grauParentesco: 'Mãe',
    responsavelFinanceiro: false,
    autorizadoRetirada: true
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedAlunoId) {
      loadVinculos()
    } else {
      setVinculos([])
    }
  }, [selectedAlunoId])

  async function loadInitialData() {
    setLoading(true)
    const [alRes, respRes] = await Promise.all([
      getAlunosList(),
      getResponsaveisList()
    ])
    setAlunos(alRes || [])
    setResponsaveis(respRes || [])
    
    if (alRes && alRes.length > 0) {
      setSelectedAlunoId(alRes[0].id)
    }
    setLoading(false)
  }

  async function loadVinculos() {
    setLoadingVinculos(true)
    try {
      const res = await getVinculosAluno(selectedAlunoId)
      if (res.success && res.data) {
        setVinculos(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingVinculos(false)
    }
  }

  function handleNew() {
    setFormData({
      responsavelId: responsaveis[0]?.id || '',
      grauParentesco: 'Mãe',
      responsavelFinanceiro: false,
      autorizadoRetirada: true
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.responsavelId) {
      alert('Selecione um responsável!')
      return
    }
    setIsSaving(true)
    
    try {
      const res = await vincularResponsavel({
        ...formData,
        alunoId: selectedAlunoId
      })
      if (res.success) {
        setIsModalOpen(false)
        loadVinculos()
      } else {
        alert(res.error || 'Erro ao vincular responsável')
      }
    } catch (err) {
      console.error(err)
      alert('Erro inesperado ao vincular responsável')
    } finally {
      setIsSaving(false)
    }
  }

  function confirmDelete(id: string) {
    setDeleteId(id)
    setJustificativa('')
    setIsDeleteModalOpen(true)
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!justificativa.trim()) {
      alert('Digite uma justificativa para auditoria!')
      return
    }
    
    try {
      const res = await removerVinculo(deleteId, justificativa)
      if (res.success) {
        setIsDeleteModalOpen(false)
        loadVinculos()
      } else {
        alert(res.error || 'Erro ao remover vínculo')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao processar remoção')
    }
  }

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Vínculos de Responsáveis</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Associe pais, mães e tutores legais aos respectivos alunos</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-csm-red)]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Seleção de Aluno */}
          <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800 space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Selecione o Aluno</label>
            <select
              value={selectedAlunoId}
              onChange={(e) => setSelectedAlunoId(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[var(--color-csm-red)] focus:outline-none text-sm"
            >
              <option value="" className="dark:bg-slate-800">Selecione...</option>
              {alunos.map(a => (
                <option key={a.id} value={a.id} className="dark:bg-slate-800">{a.nomeCompleto} (CPF: {a.cpf || 'N/A'})</option>
              ))}
            </select>

            {selectedAluno && (
              <div className="p-3 bg-white dark:bg-slate-950 rounded-md border border-gray-150 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div><span className="font-bold text-slate-800 dark:text-slate-205">Nome: </span>{selectedAluno.nomeCompleto}</div>
                <div><span className="font-bold text-slate-800 dark:text-slate-205">CPF: </span>{selectedAluno.cpf || 'Não cadastrado'}</div>
              </div>
            )}
          </div>

          {/* Coluna 2 e 3: Listagem de Vínculos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Responsáveis Vinculados a {selectedAluno?.nomeCompleto || '...'}
              </h4>
              
              {selectedAlunoId && (
                <button
                  onClick={handleNew}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-xs font-semibold"
                >
                  <Plus size={16} />
                  Vincular Responsável
                </button>
              )}
            </div>

            {loadingVinculos ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-csm-red)]"></div></div>
            ) : vinculos.length > 0 ? (
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Responsável</th>
                      <th className="px-6 py-3 text-left">Parentesco</th>
                      <th className="px-6 py-3 text-center">Financeiro</th>
                      <th className="px-6 py-3 text-center">Retirada</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
                    {vinculos.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-slate-850/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{v.nomeResponsavel}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">CPF: {v.cpfResponsavel || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {v.grauParentesco}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            v.responsavelFinanceiro ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300'
                          }`}>
                            {v.responsavelFinanceiro ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            v.autorizadoRetirada ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300'
                          }`}>
                            {v.autorizadoRetirada ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => confirmDelete(v.id)}
                            className="text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-slate-900/30 rounded-lg border border-dashed border-gray-300 dark:border-slate-800 py-12 text-center text-slate-500 dark:text-slate-400">
                <Users className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
                Nenhum responsável vinculado a este aluno.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Criar Vínculo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-600" />
              Vincular Responsável
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione o Responsável</label>
                <select 
                  required
                  value={formData.responsavelId}
                  onChange={e => setFormData({...formData, responsavelId: e.target.value})}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                >
                  <option value="" className="dark:bg-slate-850">Selecione...</option>
                  {responsaveis.map(r => (
                    <option key={r.id} value={r.id} className="dark:bg-slate-850">{r.nomeCompleto} (CPF: {r.cpf || 'N/A'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grau de Parentesco</label>
                <select 
                  required
                  value={formData.grauParentesco}
                  onChange={e => setFormData({...formData, grauParentesco: e.target.value})}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 text-sm"
                >
                  <option value="Mãe" className="dark:bg-slate-850">Mãe</option>
                  <option value="Pai" className="dark:bg-slate-850">Pai</option>
                  <option value="Tutor Legal" className="dark:bg-slate-850">Tutor Legal</option>
                  <option value="Avó" className="dark:bg-slate-850">Avó</option>
                  <option value="Avô" className="dark:bg-slate-850">Avô</option>
                  <option value="Tia" className="dark:bg-slate-850">Tia</option>
                  <option value="Tio" className="dark:bg-slate-850">Tio</option>
                  <option value="Padrasto" className="dark:bg-slate-850">Padrasto</option>
                  <option value="Madrasta" className="dark:bg-slate-850">Madrasta</option>
                  <option value="Outro" className="dark:bg-slate-850">Outro</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.responsavelFinanceiro}
                    onChange={e => setFormData({...formData, responsavelFinanceiro: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Responsável Financeiro</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autorizadoRetirada}
                    onChange={e => setFormData({...formData, autorizadoRetirada: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Autorizado a Retirar do Colégio</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 rounded-md transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-sm disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Exclusão Auditada */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Remover Vínculo Familiar</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Por motivos de segurança e integridade de dados, a remoção física de relacionamentos exige uma justificativa de auditoria.
            </p>
            
            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Justificativa da Remoção</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Vínculo cadastrado incorretamente para o aluno errado."
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 focus:ring-1 focus:ring-red-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 rounded-md transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-750 rounded-md transition-colors text-sm"
                >
                  Confirmar Remoção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
