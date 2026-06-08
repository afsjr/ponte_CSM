'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LucideKeyRound, LucideAlertCircle, LucideCheckCircle, LucideLoader2 } from 'lucide-react'
import Link from 'next/link'

export default function AtualizarSenhaPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // O Supabase Browser Client escuta automaticamente os tokens
    // que vêm via hash fragment (#access_token=...) na URL.
    // Ele dispara o evento PASSWORD_RECOVERY quando detecta um token de recuperação.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ATUALIZAR-SENHA] Auth event:', event, 'Session:', !!session)

      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
        setLoading(false)
      } else if (event === 'SIGNED_IN' && session) {
        // Fallback: se o evento for SIGNED_IN (em vez de PASSWORD_RECOVERY),
        // ainda permitimos a troca de senha se houver sessão.
        setSessionReady(true)
        setLoading(false)
      }
    })

    // Verificar se há erro na URL (query params)
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error_description') || params.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      setLoading(false)
    }

    // Timeout de segurança: se nada acontecer em 4 segundos, parar o loading
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          // Verificar se já tem sessão ativa (caso o evento tenha sido perdido)
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              setSessionReady(true)
            } else {
              setError('Sessão de recuperação não encontrada. Solicite um novo link.')
            }
          })
          return false
        }
        return prev
      })
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('[ATUALIZAR-SENHA] Erro:', error.message)
      setError(error.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    // Redirecionar para a home após 2 segundos
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <LucideKeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Atualizar Senha</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">
            {loading
              ? 'Verificando sessão de recuperação...'
              : success
                ? 'Senha atualizada!'
                : 'Digite sua nova senha abaixo para acessar o sistema.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
            <LucideAlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <Link href="/redefinir-senha" className="text-sm font-medium text-red-600 underline mt-1 inline-block">
                Solicitar novo link
              </Link>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <LucideLoader2 className="text-blue-600 animate-spin" size={32} />
            <p className="text-sm text-gray-500">Processando link de recuperação...</p>
          </div>
        )}

        {success && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
              <LucideCheckCircle size={24} />
            </div>
            <h3 className="text-green-800 font-semibold mb-2">Senha Atualizada!</h3>
            <p className="text-sm text-green-700">
              Redirecionando para o sistema...
            </p>
          </div>
        )}

        {!loading && !success && sessionReady && (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Campo oculto para acessibilidade */}
            <input type="email" name="username" autoComplete="username" className="hidden" tabIndex={-1} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Nova Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors shadow-md shadow-blue-200 mt-2 flex items-center justify-center gap-2"
            >
              {submitting && <LucideLoader2 className="animate-spin" size={18} />}
              {submitting ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
