import { LucideSettings, LucideCalendar, LucideBuilding, LucideShield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-slate-100 p-2 rounded-lg text-slate-700">
            <LucideSettings size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        </div>
        <p className="text-gray-500">
          Gerencie os parâmetros do sistema, anos letivos e regras gerais da instituição.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-700">
            <LucideCalendar size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Ano Letivo</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configuração de semestres, bimestres e calendários acadêmicos.
          </p>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Gerenciar calendários &rarr;
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-700">
            <LucideBuilding size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Dados da Instituição</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Informações do Colégio Santa Mônica, CNPJ, endereço e contatos oficiais.
          </p>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Atualizar dados &rarr;
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-slate-700">
            <LucideShield size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Permissões e Acessos</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Gerenciamento de papéis, perfis de acesso e logs de segurança.
          </p>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            Ver regras &rarr;
          </button>
        </div>
      </div>
      
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center mt-4">
        <p className="text-slate-500 text-sm">
          O módulo completo de configurações será disponibilizado em breve. Por enquanto, utilize este painel para visualizar o estado dos parâmetros.
        </p>
      </div>
    </div>
  )
}
