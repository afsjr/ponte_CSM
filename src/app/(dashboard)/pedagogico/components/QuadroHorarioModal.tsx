'use client'

import { useState, useEffect } from 'react'
import { LucideX, LucidePlus, LucideTrash2, LucideLoader2 } from 'lucide-react'
import { getDisciplinas, createQuadroHorario, getQuadroHorarioTurma, removeQuadroHorario } from '@/actions/pedagogico'

type QuadroHorarioModalProps = {
  turma: { id: string; nome: string }
  onClose: () => void
}

type QuadroHorario = {
  id: string
  disciplinaId: string
  diaSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo'
  quantidadeAulas: number
  disciplinaNome: string
}

export function QuadroHorarioModal({ turma, onClose }: QuadroHorarioModalProps) {
  const [quadros, setQuadros] = useState<QuadroHorario[]>([])
  const [disciplinas, setDisciplinas] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<{
    disciplinaId: string;
    diaSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo' | '';
    quantidadeAulas: number;
  }>({ disciplinaId: '', diaSemana: '', quantidadeAulas: 1 })

  const loadData = async () => {
    setLoading(true)
    const [resQuadros, resDisc] = await Promise.all([
      getQuadroHorarioTurma(turma.id),
      getDisciplinas()
    ])

    if (resQuadros.success && resQuadros.data) setQuadros(resQuadros.data as QuadroHorario[])
    if (resDisc.success && resDisc.data) setDisciplinas(resDisc.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.disciplinaId || !form.diaSemana || form.quantidadeAulas <= 0) {
      setError('Preencha todos os campos corretamente.')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await createQuadroHorario({
      turmaId: turma.id,
      disciplinaId: form.disciplinaId,
      diaSemana: form.diaSemana as any,
      quantidadeAulas: form.quantidadeAulas
    })

    setSubmitting(false)

    if (result.success) {
      setForm({ disciplinaId: '', diaSemana: '', quantidadeAulas: 1 })
      loadData()
    } else {
      setError(result.error || 'Erro ao adicionar ao quadro de horário.')
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Deseja remover este item do quadro de horário?')) return

    const result = await removeQuadroHorario(id)
    if (result.success) {
      loadData()
    } else {
      setError(result.error || 'Erro ao remover item do quadro.')
    }
  }

  const diaSemanaMap: Record<string, string> = {
    'segunda': 'Segunda-feira',
    'terca': 'Terça-feira',
    'quarta': 'Quarta-feira',
    'quinta': 'Quinta-feira',
    'sexta': 'Sexta-feira',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quadro de Horário</h3>
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
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Dia da Semana *</label>
              <select
                required
                value={form.diaSemana}
                onChange={e => setForm({ ...form, diaSemana: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="" disabled>Selecione</option>
                {Object.entries(diaSemanaMap).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            <div className="w-[100px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Qtd. Aulas *</label>
              <input
                required
                type="number"
                min="1"
                value={form.quantidadeAulas}
                onChange={e => setForm({ ...form, quantidadeAulas: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium h-[38px]"
            >
              {submitting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucidePlus size={16} />}
              Adicionar
            </button>
          </form>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LucideLoader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : quadros.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
              Quadro de horário vazio para esta turma.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-2 font-medium">Dia da Semana</th>
                  <th className="pb-2 font-medium">Disciplina</th>
                  <th className="pb-2 font-medium">Qtd. Aulas</th>
                  <th className="pb-2 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quadros.sort((a, b) => {
                  const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
                  return dias.indexOf(a.diaSemana) - dias.indexOf(b.diaSemana)
                }).map(quadro => (
                  <tr key={quadro.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{diaSemanaMap[quadro.diaSemana]}</td>
                    <td className="py-3 text-gray-600">{quadro.disciplinaNome}</td>
                    <td className="py-3 text-gray-600">{quadro.quantidadeAulas}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRemove(quadro.id)}
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
