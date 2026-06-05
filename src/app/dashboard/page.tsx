import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <h1 className="text-lg font-semibold text-zinc-900">Gestão Escolar</h1>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-medium text-zinc-900">Bem-vindo</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {user.email}
          </p>
        </div>
      </main>
    </div>
  )
}
