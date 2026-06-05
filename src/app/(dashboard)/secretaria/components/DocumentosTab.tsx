'use client'

import { useState, useEffect } from 'react'
import { getAlunosList, getDocumentosGerados, createDocumentoGerado } from '@/actions/secretaria'
import { LucideFileText, LucideLoader2, LucideCheckCircle, LucidePrinter } from 'lucide-react'

export function DocumentosTab() {
  const [alunos, setAlunos] = useState<{id: string, nomeCompleto: string, cpf: string | null}[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro', texto: string } | null>(null)

  // Form State
  const [selectedAlunoId, setSelectedAlunoId] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('declaracao_matricula')
  const [titulo, setTitulo] = useState('Declaração de Matrícula')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [alunosData, docsData] = await Promise.all([
        getAlunosList(),
        getDocumentosGerados()
      ])
      setAlunos(alunosData)
      setDocumentos(docsData)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleTipoChange = (val: string) => {
    setSelectedTipo(val)
    if (val === 'declaracao_matricula') setTitulo('Declaração de Matrícula')
    if (val === 'boletim') setTitulo('Boletim Escolar')
    if (val === 'historico_escolar') setTitulo('Histórico Escolar')
    if (val === 'declaracao_transferencia') setTitulo('Declaração de Transferência')
    if (val === 'declaracao_conclusao') setTitulo('Declaração de Conclusão')
  }

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlunoId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um aluno.' })
      return
    }

    setSubmitting(true)
    setMensagem(null)
    try {
      // O geradoPorId virá do auth backend, porém na action precisamos passar (simularemos passar o próprio aluno id só para typescript n chiar se n tiver user, mas a action usa o getUser)
      // Como a server action `createDocumentoGerado` exige geradoPorId, teremos que ajustar lá ou passar um dummy e ignorar.
      // Vou atualizar a server action logo a seguir.
      
      const res = await createDocumentoGerado({
        pessoaId: selectedAlunoId,
        tipo: selectedTipo as any,
        titulo: titulo,
        urlArquivo: '', // Será gerada dinamicamente pelo hash
      })

      if (res.success && res.documento) {
        setMensagem({ tipo: 'sucesso', texto: 'Documento gerado com sucesso!' })
        // Atualiza a lista
        const docsData = await getDocumentosGerados()
        setDocumentos(docsData)
        // Redireciona para visualização
        window.open(`/secretaria/documentos/${res.documento.hashVerificacao}`, '_blank')
      } else {
        setMensagem({ tipo: 'erro', texto: res.error || 'Erro ao gerar documento' })
      }
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><LucideLoader2 className="animate-spin text-slate-400 dark:text-slate-500" size={32} /></div>
  }

  return (
    <div className="space-y-8">
      {mensagem && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${mensagem.tipo === 'sucesso' ? 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300'}`}>
          {mensagem.tipo === 'sucesso' ? <LucideCheckCircle size={20} /> : <LucideLoader2 size={20} />}
          <span className="font-medium">{mensagem.texto}</span>
        </div>
      )}

      {/* Formulário de Emissão */}
      <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <LucideFileText size={20} className="text-[var(--color-csm-red)]" />
          Emitir Novo Documento
        </h3>
        <form onSubmit={handleGerar} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aluno</label>
            <select
              value={selectedAlunoId}
              onChange={(e) => setSelectedAlunoId(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--color-csm-red)] focus:border-transparent outline-none text-slate-900 dark:text-slate-100"
              required
            >
              <option value="" className="dark:bg-slate-800">Selecione um aluno...</option>
              {alunos.map(al => (
                <option key={al.id} value={al.id} className="dark:bg-slate-800">{al.nomeCompleto} - {al.cpf || 'Sem CPF'}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Documento</label>
            <select
              value={selectedTipo}
              onChange={(e) => handleTipoChange(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--color-csm-red)] focus:border-transparent outline-none text-slate-900 dark:text-slate-100"
              required
            >
              <option value="declaracao_matricula" className="dark:bg-slate-800">Declaração de Matrícula</option>
              <option value="boletim" className="dark:bg-slate-800">Boletim Escolar</option>
              <option value="historico_escolar" className="dark:bg-slate-800">Histórico Escolar</option>
              <option value="declaracao_transferencia" className="dark:bg-slate-800">Declaração de Transferência</option>
              <option value="declaracao_conclusao" className="dark:bg-slate-800">Declaração de Conclusão</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-csm-red)] hover:bg-red-700 text-white font-medium p-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? <LucideLoader2 size={18} className="animate-spin" /> : <LucidePrinter size={18} />}
              Gerar Documento
            </button>
          </div>
        </form>
      </div>

      {/* Histórico de Emissões */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Histórico de Emissões</h3>
          
          <button 
            type="button" 
            onClick={async () => {
              setSubmitting(true);
              const { runSeedMock } = await import('@/actions/seed');
              const res = await runSeedMock();
              if (res.success) {
                setMensagem({ tipo: 'sucesso', texto: res.message || 'Seed gerado com sucesso' });
                const [alunosData, docsData] = await Promise.all([getAlunosList(), getDocumentosGerados()]);
                setAlunos(alunosData);
                setDocumentos(docsData);
              } else {
                setMensagem({ tipo: 'erro', texto: res.error || 'Erro no seed' });
              }
              setSubmitting(false);
            }}
            disabled={submitting}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-gray-200 dark:border-slate-700"
          >
            <LucideFileText size={14} />
            {submitting ? 'Gerando...' : 'Gerar Dados de Teste (Mock)'}
          </button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Documento</th>
                <th className="p-4">Aluno</th>
                <th className="p-4">Data de Emissão</th>
                <th className="p-4">Emitido Por</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {documentos.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Nenhum documento emitido.</td></tr>
              ) : (
                documentos.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{doc.titulo}</td>
                    <td className="p-4">{doc.alunoNome}</td>
                    <td className="p-4">{new Date(doc.geradoEm).toLocaleString('pt-BR')}</td>
                    <td className="p-4">{doc.geradoPorNome}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => window.open(`/secretaria/documentos/${doc.hashVerificacao}`, '_blank')}
                        className="text-[var(--color-csm-red)] hover:opacity-85 font-medium text-sm flex items-center justify-center gap-1 w-full"
                      >
                        <LucidePrinter size={16} />
                        Reimprimir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
