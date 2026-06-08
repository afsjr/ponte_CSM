'use client'

import { useState, useEffect } from 'react'
import { getTurmas, getAlunosMatriculadosTurma } from '@/actions/pedagogico'
import { LucideLoader2, LucideSearch, LucideFileText } from 'lucide-react'
import { BoletimAlunoModal } from './BoletimAlunoModal'

export function BoletimTab() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('')
  
  const [alunos, setAlunos] = useState<any[]>([])
  const [loadingAlunos, setLoadingAlunos] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedAluno, setSelectedAluno] = useState<any | null>(null)

  useEffect(() => {
    loadTurmas()
  }, [])

  useEffect(() => {
    if (selectedTurmaId) {
      loadAlunos(selectedTurmaId)
    } else {
      setAlunos([])
    }
  }, [selectedTurmaId])

  const loadTurmas = async () => {
    const res = await getTurmas()
    if (res.success && res.data) {
      setTurmas(res.data)
    }
  }

  const loadAlunos = async (turmaId: string) => {
    setLoadingAlunos(true)
    const res = await getAlunosMatriculadosTurma(turmaId)
    if (res.success && res.data) {
      setAlunos(res.data)
    } else {
      setAlunos([])
    }
    setLoadingAlunos(false)
  }

  const filteredAlunos = alunos.filter(a => 
    a.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.numeroMatricula.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedTurma = turmas.find(t => t.id === selectedTurmaId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Consulta de Boletins e Notas</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selecione uma turma para listar os alunos e visualizar seus boletins de notas.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Turma</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-white"
              value={selectedTurmaId}
              onChange={e => setSelectedTurmaId(e.target.value)}
            >
              <option value="">Selecione uma turma...</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.salaNome})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Buscar Aluno</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nome ou Matrícula..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={!selectedTurmaId}
              />
              <LucideSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Alunos */}
      {selectedTurmaId && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {loadingAlunos ? (
            <div className="flex justify-center p-12">
              <LucideLoader2 className="animate-spin text-blue-600 h-8 w-8" />
            </div>
          ) : filteredAlunos.length === 0 ? (
            <div className="text-center p-12 text-slate-500 dark:text-slate-400">
              Nenhum aluno encontrado nesta turma.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matrícula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nome do Estudante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAlunos.map(aluno => (
                  <tr key={aluno.matriculaId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {aluno.numeroMatricula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                      {aluno.nomeCompleto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${aluno.status === 'ativo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {aluno.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedAluno(aluno)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md transition-colors font-medium text-sm border border-blue-200 dark:border-blue-800"
                      >
                        <LucideFileText size={16} />
                        Ver Boletim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selectedAluno && selectedTurma && (
        <BoletimAlunoModal 
          aluno={selectedAluno} 
          turma={selectedTurma} 
          onClose={() => setSelectedAluno(null)} 
        />
      )}
    </div>
  )
}
