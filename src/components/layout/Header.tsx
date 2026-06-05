import { logout } from '@/app/login/actions'
import { LucideLogOut, LucideUserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 shadow-sm z-10 transition-colors duration-200">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
        <span>Início</span>
        <span>/</span>
        <span className="text-slate-900 dark:text-white">Painel</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <LucideUserCircle size={20} className="text-slate-400 dark:text-slate-500" />
          <span className="font-medium hidden sm:inline-block text-slate-700 dark:text-slate-200">{user?.email}</span>
        </div>
        
        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800"></div>

        <form action={logout}>
          <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
            <LucideLogOut size={16} />
            <span className="hidden sm:inline-block">Sair</span>
          </button>
        </form>
      </div>
    </header>
  )
}
