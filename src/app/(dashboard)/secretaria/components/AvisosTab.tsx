'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Megaphone, CheckCircle2, UserCheck, X } from 'lucide-react'
import { createAviso, getAvisosAdmin, deleteAviso, getAvisoEstatisticas } from '@/actions/responsavel'
import { getTurmas, getSeries } from '@/actions/pedagogico'
import { getAlunosList } from '@/actions/secretaria'

export function AvisosTab() {
  const [avisos, setAvisos] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedAviso, setSelectedAviso] = useState<any>(null)
  const [cientes, setCientes] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(false)
  
  const [deleteId, setDeleteId] = useState('')
  const [justificativa, setJustificativa] = useState('')

  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    destinatarioTipo: 'geral' as 'geral' | 'turma' | 'serie' | 'individual',
    turmaId: '',
    serieId: '',
    alunoId: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [avRes, turRes, serRes, alRes] = await Promise.all([
      getAvisosAdmin(),
      getTurmas(),
      getSeries(),
      getAlunosList()
    ])
    
    if (avRes.success) setAvisos(avRes.data || [])
    if (turRes.success) setTurmas(turRes.data || [])
    if (serRes.success) setSeries(serRes.data || [])
    setAlunos(alRes || [])
    setLoading(false)
  }

  function handleNew() {
    setFormData({
      titulo: '',
      conteudo: '',
      destinatarioTipo: 'geral',
      turmaId: '',
      serieId: '',
      alunoId: ''
    })
    setIsCreateModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await createAviso(formData)
      if (res.success) {
        setIsCreateModalOpen(false)
        loadData()
      } else {
        alert(res.error || 'Erro ao criar comunicado')
      }
    } catch (err) {
      console.error(err)
      alert('Erro inesperado ao criar comunicado')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleShowStats(aviso: any) {
    setSelectedAviso(aviso)
    setIsStatsModalOpen(true)
    setStatsLoading(true)
    try {
      const res = await getAvisoEstatisticas(aviso.id)
      if (res.success) {
        setCientes(res.data || [])
      } else {
        alert(res.error || 'Erro ao buscar estatísticas')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStatsLoading(false)
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
      const res = await deleteAviso(deleteId, justificativa)
      if (res.success) {
        setIsDeleteModalOpen(false)
        loadData()
      } else {
        alert(res.error || 'Erro ao excluir aviso')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao processar exclusão')
    }
  }

  const destinatarioLabels: any = {
    geral: 'Todos (Geral)',
    turma: 'Turma Específica',
    serie: 'Série Específica',
    individual: 'Aluno Individual'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Mural de Avisos</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Publique comunicados e acompanhe a ciência dos responsáveis</p>
        </div>
        
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-csm-red)] hover:opacity-90 text-white rounded-md transition-colors"
        >
          <Plus size={20} />
          Novo Comunicado
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-csm-red)]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {avisos.map((aviso) => (
            <div key={aviso.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Megaphone size={18} className="text-[var(--color-csm-red)]" />
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-full">
                    {destinatarioLabels[aviso.destinatarioTipo]}
                  </span>
                  {aviso.destinatarioTipo === 'turma' && (
                    <span className="text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">{aviso.turmaNome}</span>
                  )}
                  {aviso.destinatarioTipo === 'serie' && (
                    <span className="text-xs bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">{aviso.serieNome}</span>
                  )}
                  {aviso.destinatarioTipo === 'individual' && (
                    <span className="text-xs bg-orange-50 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">Aluno: {aviso.alunoNome}</span>
                  )}
                </div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{aviso.titulo}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{aviso.conteudo}</p>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  Publicado em {new Date(aviso.dataPublicacao).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })} por {aviso.criadoPorNome}
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t border-gray-100 dark:border-slate-800 md:border-t-0 pt-3 md:pt-0">
                <button
                  onClick={() => handleShowStats(aviso)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                >
                  <CheckCircle2 size={16} />
                  Ver Leituras
                </button>
                <button
                  onClick={() => confirmDelete(aviso.id)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {avisos.length === 0 && (
            <div className="bg-gray-50 dark:bg-slate-900/30 rounded-lg border border-dashed border-gray-300 dark:border-slate-800 py-12 text-center text-slate-500 dark:text-slate-400">
              <Megaphone className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
              Nenhum comunicado publicado no mural.
            </div>
          )}
        </div>
      )}

      {/* Modal Criar Aviso */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Megaphone size={20} className="text-[var(--color-csm-red)]" />
              Publicar Comunicado
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título do Comunicado</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Reunião de Pais e Mestres"
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 focus:ring-1 focus:ring-[var(--color-csm-red)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conteúdo do Comunicado</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Digite aqui o texto do aviso. Suporta emojis (Ex: 🎒🚌📚). Links e imagens são bloqueados por segurança."
                  value={formData.conteudo}
                  onChange={e => setFormData({...formData, conteudo: e.target.value})}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 focus:ring-1 focus:ring-[var(--color-csm-red)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Destinatários</label>
                <select 
                  required
                  value={formData.destinatarioTipo}
                  onChange={e => setFormData({...formData, destinatarioTipo: e.target.value as any, turmaId: '', serieId: '', alunoId: ''})}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850"
                >
                  <option value="geral" className="dark:bg-slate-850">Todos (Geral)</option>
                  <option value="turma" className="dark:bg-slate-850">Por Turma</option>
                  <option value="serie" className="dark:bg-slate-850">Por Série</option>
                  <option value="individual" className="dark:bg-slate-850">Por Aluno Individual</option>
                </select>
              </div>

              {formData.destinatarioTipo === 'turma' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione a Turma</label>
                  <select 
                    required
                    value={formData.turmaId}
                    onChange={e => setFormData({...formData, turmaId: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850"
                  >
                    <option value="" className="dark:bg-slate-850">Selecione...</option>
                    {turmas.map(t => (
                      <option key={t.id} value={t.id} className="dark:bg-slate-850">{t.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.destinatarioTipo === 'serie' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione a Série</label>
                  <select 
                    required
                    value={formData.serieId}
                    onChange={e => setFormData({...formData, serieId: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850"
                  >
                    <option value="" className="dark:bg-slate-850">Selecione...</option>
                    {series.map(s => (
                      <option key={s.id} value={s.id} className="dark:bg-slate-850">{s.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.destinatarioTipo === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione o Aluno</label>
                  <select 
                    required
                    value={formData.alunoId}
                    onChange={e => setFormData({...formData, alunoId: e.target.value})}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850"
                  >
                    <option value="" className="dark:bg-slate-850">Selecione...</option>
                    {alunos.map(a => (
                      <option key={a.id} value={a.id} className="dark:bg-slate-850">{a.nomeCompleto} (CPF: {a.cpf || 'N/A'})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 text-white bg-[var(--color-csm-red)] hover:opacity-90 rounded-md transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Estatísticas de Ciência */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col border border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <UserCheck size={20} className="text-green-600" />
                  Ciência de Responsáveis
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Acompanhe quem confirmou leitura do comunicado</p>
              </div>
              <button 
                onClick={() => setIsStatsModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-950 p-3 rounded-md border border-gray-150 dark:border-slate-855 mb-4 text-sm">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Comunicado: </span>
              <span className="text-slate-700 dark:text-slate-300">{selectedAviso?.titulo}</span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[200px] border border-gray-100 dark:border-slate-800 rounded-md">
              {statsLoading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-csm-red)]"></div></div>
              ) : cientes.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {cientes.map((c) => (
                    <div key={c.id} className="p-3 text-sm flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-slate-850/50">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{c.responsavelNome}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Filho(a): {c.alunoNome}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium">
                          ✔ Ciente
                        </span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Date(c.cienteEm).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Nenhum responsável marcou ciente ainda.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800 mt-4">
              <button 
                onClick={() => setIsStatsModalOpen(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 rounded-md transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exclusão Auditada */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Excluir Comunicado</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Por motivos de segurança e integridade de dados, a exclusão física exige uma justificativa de auditoria.
            </p>
            
            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Justificativa da Exclusão</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Comunicado duplicado ou com erro de digitação."
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Excluir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
