import { LucideShieldAlert, LucideLogOut } from 'lucide-react'
import { logout } from '../login/actions'

export default function AcessoBloqueadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-inner">
            <LucideShieldAlert size={40} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
        
        <p className="text-gray-600 mb-6">
          Seu acesso ao sistema interno foi bloqueado.
        </p>
        
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-lg text-left mb-8 border border-red-100">
          <strong>Por que estou vendo isso?</strong>
          <p className="mt-2">
            O seu vínculo atual com a instituição não permite o acesso a esta área. Isso geralmente ocorre quando:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Você solicitou transferência;</li>
            <li>Seu contrato foi encerrado;</li>
            <li>Seu acesso foi temporariamente suspenso.</li>
          </ul>
          <p className="mt-4 text-xs">Em caso de dúvidas, por favor, entre em contato com a Secretaria.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <form>
            <button
              formAction={logout}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LucideLogOut size={18} />
              Sair da Conta
            </button>
          </form>

          <a 
            href="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            Tentar Novamente
          </a>
        </div>
      </div>
    </div>
  )
}
