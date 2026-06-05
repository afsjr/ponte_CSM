import { login } from './actions'
import { LucideGraduationCap } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <LucideGraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CSM | Gestão Escolar</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Acesse o portal da Secretaria, Corpo Docente ou Administração.
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
          <button
            formAction={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-md shadow-blue-200 mt-2"
          >
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  )
}
