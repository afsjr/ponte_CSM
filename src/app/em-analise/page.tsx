import { LucideClock, LucideLogOut } from 'lucide-react'
import { logout } from '../login/actions'

export default function EmAnalisePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shadow-inner">
            <LucideClock size={40} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Conta em Análise</h1>
        
        <p className="text-gray-600 mb-6">
          Recebemos o seu cadastro com sucesso. No momento, sua conta encontra-se na situação <strong>inativa</strong> e aguarda aprovação da secretaria.
        </p>
        
        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg text-left mb-8 border border-blue-100">
          <strong>O que acontece agora?</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>A administração revisará seus dados.</li>
            <li>Caso aprovado, o seu acesso ao sistema será liberado automaticamente.</li>
            <li>Se necessário, a escola entrará em contato.</li>
          </ul>
        </div>
        
        <form>
          <button
            formAction={logout}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LucideLogOut size={18} />
            Sair e voltar ao Login
          </button>
        </form>
      </div>
    </div>
  )
}
