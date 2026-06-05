'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, UserCheck, Search } from 'lucide-react'
import { getMatriculas, createMatricula, updateMatricula, getAlunosList, getAnosLetivos } from '@/actions/secretaria'
import { getTurmas } from '@/actions/pedagogico'

export function MatriculaTab() {
  const [matriculas, setMatriculas] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [anosLetivos, setAnosLetivos] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    id: '',
    alunoId: '',
    turmaId: '',
    anoLetivoId: '',
    numeroMatricula: '',
    dataMatricula: new Date().toISOString().split('T')[0],
    status: 'ativo' as any,
    dataSaida: '',
    motivoSaida: '' as any
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [matRes, alRes, turRes, anoRes] = await Promise.all([
      getMatriculas(),
      getAlunosList(),
      getTurmas(),
      getAnosLetivos()
    ])
    
    setMatriculas(matRes)
    setAlunos(alRes)
    if (turRes.success) setTurmas(turRes.data || [])
    setAnosLetivos(anoRes)
    setLoading(false)
  }

  function handleNew() {
    setFormData({
      id: '',
      alunoId: '',
      turmaId: '',
      anoLetivoId: '',
      numeroMatricula: `MAT${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`,
      dataMatricula: new Date().toISOString().split('T')[0],
      status: 'ativo',
      dataSaida: '',
      motivoSaida: ''
    })
    setIsModalOpen(true)
  }

  function handleEdit(mat: any) {
    setFormData({
      id: mat.id,
      alunoId: '', // Fields that can't be changed won't be mapped
      turmaId: '', // if we only want to update status
      anoLetivoId: '',
      numeroMatricula: mat.numeroMatricula,
      dataMatricula: new Date(mat.dataMatricula).toISOString().split('T')[0],
      status: mat.status,
      dataSaida: mat.dataSaida ? new Date(mat.dataSaida).toISOString().split('T')[0] : '',
      motivoSaida: mat.motivoSaida || ''
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      if (formData.id) {
        await updateMatricula(formData.id, {
          status: formData.status,
          dataSaida: formData.dataSaida ? new Date(formData.dataSaida) : null,
          motivoSaida: formData.motivoSaida || null
        })
      } else {
        await createMatricula({
          alunoId: formData.alunoId,
          turmaId: formData.turmaId,
          anoLetivoId: formData.anoLetivoId,
          numeroMatricula: formData.numeroMatricula,
          dataMatricula: new Date(formData.dataMatricula),
          status: formData.status
        })
      }
      
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar matrícula")
    } finally {
      setIsSaving(false)
    }
  }

  const filteredMatriculas = matriculas.filter(m => 
    m.alunoNome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.numeroMatricula.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors: any = {
    'ativo': 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
    'trancado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300',
    'cancelado': 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    'concluido': 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    'transferido': 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Matrículas</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Vincule alunos às turmas e anos letivos</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar aluno ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md leading-5 bg-white dark:bg-slate-800 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 dark:text-slate-100 text-sm"
            />
          </div>
          <button 
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={20} />
            Nova Matrícula
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Matrícula</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Aluno</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Turma / Ano</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {filteredMatriculas.map((mat) => (
                <tr key={mat.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                    {mat.numeroMatricula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{mat.alunoNome}</div>
                    <div className="text-slate-500 dark:text-slate-400">CPF: {mat.alunoCpf || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-slate-900 dark:text-slate-100">{mat.turmaNome} ({mat.serieNome})</div>
                    <div className="text-slate-500 dark:text-slate-400">Ano: {mat.ano}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${statusColors[mat.status]}`}>
                      {mat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(mat)} className="text-blue-605 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors">
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMatriculas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma matrícula encontrada.
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
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-blue-600 dark:text-blue-400" />
              {formData.id ? 'Atualizar Status da Matrícula' : 'Nova Matrícula'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!formData.id && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aluno *</label>
                      <select 
                        required
                        value={formData.alunoId}
                        onChange={e => setFormData({...formData, alunoId: e.target.value})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 outline-none text-sm" 
                      >
                        <option value="" className="dark:bg-slate-850">Selecione um aluno...</option>
                        {alunos.map(a => (
                          <option key={a.id} value={a.id} className="dark:bg-slate-855">{a.nomeCompleto} - CPF: {a.cpf || 'N/A'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Turma *</label>
                      <select 
                        required
                        value={formData.turmaId}
                        onChange={e => setFormData({...formData, turmaId: e.target.value})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 outline-none text-sm" 
                      >
                        <option value="" className="dark:bg-slate-850">Selecione a turma...</option>
                        {turmas.map(t => (
                          <option key={t.id} value={t.id} className="dark:bg-slate-855">{t.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ano Letivo *</label>
                      <select 
                        required
                        value={formData.anoLetivoId}
                        onChange={e => setFormData({...formData, anoLetivoId: e.target.value})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 outline-none text-sm" 
                      >
                        <option value="" className="dark:bg-slate-850">Selecione...</option>
                        {anosLetivos.filter(a => a.ativo).map(a => (
                          <option key={a.id} value={a.id} className="dark:bg-slate-855">{a.ano}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nº Matrícula *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.numeroMatricula}
                        onChange={e => setFormData({...formData, numeroMatricula: e.target.value})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 outline-none text-sm cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Matrícula *</label>
                      <input 
                        type="date" 
                        required
                        value={formData.dataMatricula}
                        onChange={e => setFormData({...formData, dataMatricula: e.target.value})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 outline-none text-sm" 
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.id && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-md border border-gray-200 dark:border-slate-750 mb-4 text-sm">
                  <p className="text-slate-700 dark:text-slate-300">Editando matrícula: <span className="font-semibold text-slate-900 dark:text-white">{formData.numeroMatricula}</span></p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status *</label>
                  <select 
                    required
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-855 outline-none text-sm" 
                  >
                    <option value="ativo">Ativo</option>
                    <option value="trancado">Trancado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="concluido">Concluído</option>
                    <option value="transferido">Transferido</option>
                  </select>
                </div>
                
                {(formData.status !== 'ativo') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Saída *</label>
                      <input 
                        type="date" 
                        required
                        value={formData.dataSaida}
                        onChange={e => setFormData({...formData, dataSaida: e.target.value})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo *</label>
                      <select 
                        required
                        value={formData.motivoSaida}
                        onChange={e => setFormData({...formData, motivoSaida: e.target.value as any})}
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-855 outline-none text-sm" 
                      >
                        <option value="">Selecione...</option>
                        <option value="desistencia">Desistência</option>
                        <option value="inadimplencia">Inadimplência</option>
                        <option value="transferencia">Transferência</option>
                        <option value="conclusao">Conclusão</option>
                        <option value="expulsao">Expulsão</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors text-sm border border-gray-300 dark:border-slate-700 font-medium"
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
