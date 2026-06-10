import { signup } from './actions'
import { LucideUserPlus, LucideAlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function SignupPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <LucideUserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Conta</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Crie sua conta para acessar os recursos do sistema.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
            <LucideAlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nomeCompleto">
              Nome Completo
            </label>
            <input
              id="nomeCompleto"
              name="nomeCompleto"
              type="text"
              required
              placeholder="Seu nome completo"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cpf">
              CPF
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              required
              placeholder="000.000.000-00"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
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
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
          
          <button
            formAction={signup}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-md shadow-blue-200 mt-2"
          >
            Criar Conta
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          <Link
            href="/login"
            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Já tem uma conta? Faça login
          </Link>
        </form>
      </div>
    </div>
  )
}
