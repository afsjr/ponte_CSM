import { getPessoas } from '@/actions/pessoa'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { LucideUserPlus, LucidePencil } from 'lucide-react'
import Link from 'next/link'

const PAPEL_LABELS: Record<string, { label: string; color: string }> = {
  aluno:       { label: 'Aluno',       color: 'bg-blue-100 text-blue-700' },
  funcionario: { label: 'Funcionário', color: 'bg-purple-100 text-purple-700' },
  responsavel: { label: 'Responsável', color: 'bg-amber-100 text-amber-700' },
  interessado: { label: 'Interessado', color: 'bg-teal-100 text-teal-700' },
}

export default async function PessoasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const search = typeof params.q === 'string' ? params.q : undefined
  const activeTab = typeof params.tab === 'string' ? params.tab : 'aluno'

  const { success, data, metadata, error } = await getPessoas({ page, limit: 15, search, tipo: activeTab })

  if (!success) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl">
        Erro ao carregar pessoas: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pessoas</h1>
          <p className="text-gray-500">Gestão de alunos, funcionários e responsáveis.</p>
        </div>
        <Link 
          href={`/cadastros/pessoas/novo?tipo=${activeTab}`} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <LucideUserPlus size={18} />
          Nova Pessoa
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'aluno', label: 'Alunos' },
            { id: 'responsavel', label: 'Responsáveis' },
            { id: 'funcionario', label: 'Funcionários' },
            { id: 'interessado', label: 'Interessados' },
          ].map(tab => (
            <Link
              key={tab.id}
              href={`/cadastros/pessoas?tab=${tab.id}`}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-b border-gray-200">
          <SearchInput placeholder="Buscar por nome ou CPF..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Nome Completo</th>
                <th className="px-6 py-3 font-semibold">CPF</th>
                <th className="px-6 py-3 font-semibold">Papel</th>
                <th className="px-6 py-3 font-semibold">Situação</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((p) => {
                  const papelInfo = PAPEL_LABELS[p.tipo ?? '']
                  return (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {p.nomeCompleto}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {p.cpf || '—'}
                      </td>
                      <td className="px-6 py-4">
                        {papelInfo ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${papelInfo.color}`}>
                            {papelInfo.label}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.situacao === 'ativo'       ? 'bg-green-100 text-green-700' :
                          p.situacao === 'inativo'     ? 'bg-gray-100 text-gray-700' :
                          p.situacao === 'transferido' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(p.situacao ?? 'ativo').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/cadastros/pessoas/${p.id}/editar`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar pessoa"
                        >
                          <LucidePencil size={13} />
                          Editar
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma pessoa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {metadata && metadata.totalPages > 0 && (
          <Pagination 
            currentPage={metadata.page} 
            totalPages={metadata.totalPages} 
          />
        )}
      </div>
    </div>
  )
}
