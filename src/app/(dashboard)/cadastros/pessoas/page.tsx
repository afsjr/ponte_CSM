import { getPessoas } from '@/actions/pessoa'
import { SearchInput } from '@/components/ui/SearchInput'
import { Pagination } from '@/components/ui/Pagination'
import { LucideUserPlus, LucideMoreVertical } from 'lucide-react'
import Link from 'next/link'

export default async function PessoasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const search = typeof params.q === 'string' ? params.q : undefined

  const { success, data, metadata, error } = await getPessoas({ page, limit: 10, search })

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
          href="/cadastros/pessoas/novo" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <LucideUserPlus size={18} />
          Nova Pessoa
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <SearchInput placeholder="Buscar por nome ou CPF..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Nome Completo</th>
                <th className="px-6 py-3 font-semibold">CPF</th>
                <th className="px-6 py-3 font-semibold">Situação</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((pessoa) => (
                  <tr key={pessoa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {pessoa.nomeCompleto}
                    </td>
                    <td className="px-6 py-4">
                      {pessoa.cpf || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pessoa.situacao === 'ativo' ? 'bg-green-100 text-green-700' : 
                        pessoa.situacao === 'inativo' ? 'bg-gray-100 text-gray-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {pessoa.situacao.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <LucideMoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
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
