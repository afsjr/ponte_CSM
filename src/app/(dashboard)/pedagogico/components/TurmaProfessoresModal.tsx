'use client'

import { useState, useEffect } from 'react'
import { LucideX, LucidePlus, LucideTrash2, LucideLoader2 } from 'lucide-react'
import { getProfessoresTurma, alocarProfessorTurma, removerProfessorTurma, getTodosProfessores, getDisciplinas } from '@/actions/pedagogico'

type TurmaProfessoresModalProps = {
  turma: { id: string; nome: string }
  onClose: () => void
}

type Alocacao = {
  id: string
  turmaId: string
  titular: boolean | null
  disciplina: { id: string; nome: string }
  professor: { id: string; nomeCompleto: string }
}

export function TurmaProfessoresModal({ turma, onClose }: TurmaProfessoresModalProps) {
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([])
  const [professores, setProfessores] = useState<{ id: string; nomeCompleto: string }[]>([])
  const [disciplinas, setDisciplinas] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ professorId: '', disciplinaId: '', titular: true })

  const loadData = async () => {
    setLoading(true)
    const [resAloc, resProf, resDisc] = await Promise.all([
      getProfessoresTurma(turma.id),
      getTodosProfessores(),
      getDisciplinas()
    ])

    if (resAloc.success && resAloc.data) setAlocacoes(resAloc.data as Alocacao[])
    if (resProf.success && resProf.data) setProfessores(resProf.data)
    if (resDisc.success && resDisc.data) setDisciplinas(resDisc.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.professorId || !form.disciplinaId) {
      setError('Selecione o professor e a disciplina.')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await alocarProfessorTurma({
      turmaId: turma.id,
      funcionarioId: form.professorId,
      disciplinaId: form.disciplinaId,
      titular: form.titular
    })

    setSubmitting(false)

    if (result.success) {
      setForm({ professorId: '', disciplinaId: '', titular: true })
      loadData()
    } else {
      setError(result.error || 'Erro ao alocar professor.')
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Deseja remover este professor da turma?')) return

    const result = await removerProfessorTurma(id)
    if (result.success) {
      loadData()
    } else {
      setError(result.error || 'Erro ao remover alocação.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Professores da Turma</h3>
            <p className="text-sm text-gray-500">{turma.nome}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <LucideX size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          {/* Form to add */}
          <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Professor *</label>
              <select
                required
                value={form.professorId}
                onChange={e => setForm({ ...form, professorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="" disabled>Selecione</option>
                {professores.map(p => (
                  <option key={p.id} value={p.id}>{p.nomeCompleto}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Disciplina *</label>
              <select
                required
                value={form.disciplinaId}
                onChange={e => setForm({ ...form, disciplinaId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="" disabled>Selecione</option>
                {disciplinas.map(d => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="titular"
                checked={form.titular}
                onChange={e => setForm({ ...form, titular: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="titular" className="text-xs text-gray-700">Titular</label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              {submitting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucidePlus size={16} />}
              Alocar
            </button>
          </form>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LucideLoader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : alocacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
              Nenhum professor alocado nesta turma.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-2 font-medium">Professor</th>
                  <th className="pb-2 font-medium">Disciplina</th>
                  <th className="pb-2 font-medium">Titular</th>
                  <th className="pb-2 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alocacoes.map(aloc => (
                  <tr key={aloc.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{aloc.professor.nomeCompleto}</td>
                    <td className="py-3 text-gray-600">{aloc.disciplina.nome}</td>
                    <td className="py-3">
                      {aloc.titular ? (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-blue-100 text-blue-700">Titular</span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-gray-100 text-gray-600">Substituto</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRemove(aloc.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        title="Remover"
                      >
                        <LucideTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
