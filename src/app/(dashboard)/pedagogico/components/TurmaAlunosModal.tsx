'use client'

import { useState, useEffect } from 'react'
import { LucideX, LucideLoader2 } from 'lucide-react'
import { getAlunosDaTurma } from '@/actions/secretaria'

export function TurmaAlunosModal({ 
  turma, 
  onClose 
}: { 
  turma: { id: string; nome: string }; 
  onClose: () => void 
}) {
  const [alunos, setAlunos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const res = await getAlunosDaTurma(turma.id)
    if (res.success && res.data) {
      setAlunos(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [turma.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alunos Matriculados</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Turma: {turma.nome}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <LucideX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LucideLoader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Total de Alunos</span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-200">{alunos.length}</span>
              </div>

              {alunos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                  Nenhum aluno matriculado nesta turma.
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Matrícula</th>
                        <th className="px-4 py-3 font-medium">Nome do Aluno</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {alunos.map(aluno => (
                        <tr key={aluno.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{aluno.numeroMatricula}</td>
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-medium">{aluno.nomeCompleto}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              aluno.status === 'ativo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {aluno.status === 'ativo' ? 'Ativo' : aluno.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
