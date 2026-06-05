'use client'

import { useActionState } from 'react'
import { login, signup } from '@/lib/actions/auth'
import { LogIn, UserPlus } from 'lucide-react'

type State = { error?: string; success?: string } | undefined

const loginAction = async (_prev: State, formData: FormData) => login(formData)
const signupAction = async (_prev: State, formData: FormData) => signup(formData)

export function LoginForm() {
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, undefined)
  const [signupState, signupFormAction, signupPending] = useActionState(signupAction, undefined)

  const pending = loginPending || signupPending

  return (
    <div className="space-y-6">
      <form action={loginFormAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            placeholder="••••••••"
          />
        </div>

        {loginState?.error && (
          <p className="text-sm text-red-600">{loginState.error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loginPending ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-400">ou</span>
        </div>
      </div>

      <form action={signupFormAction} className="space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="seu@email.com"
          className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />

        {signupState?.error && (
          <p className="text-sm text-red-600">{signupState.error}</p>
        )}
        {signupState?.success && (
          <p className="text-sm text-emerald-600">{signupState.success}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          {signupPending ? 'Criando...' : 'Criar nova conta'}
        </button>
      </form>
    </div>
  )
}
