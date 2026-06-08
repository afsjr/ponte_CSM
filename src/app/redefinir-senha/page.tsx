import { sendResetLink } from './actions'
import { LucideGraduationCap, LucideAlertCircle, LucideCheckCircle, LucideArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function RedefinirSenhaPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error as string | undefined;
  const success = searchParams?.success === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
          <LucideArrowLeft size={16} />
          <span>Voltar para o Login</span>
        </Link>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <LucideGraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Digite seu e-mail cadastrado e enviaremos um link para você redefinir sua senha.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
            <LucideAlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
              <LucideCheckCircle size={24} />
            </div>
            <h3 className="text-green-800 font-semibold mb-2">Link Enviado!</h3>
            <p className="text-sm text-green-700">
              Verifique a caixa de entrada do seu e-mail para continuar a redefinição de senha. Lembre-se de checar a caixa de spam.
            </p>
          </div>
        ) : (
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
            
            <button
              formAction={sendResetLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-md shadow-blue-200 mt-2"
            >
              Enviar link de recuperação
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
