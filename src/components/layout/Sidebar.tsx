import Link from 'next/link'
import { 
  LucideLayoutDashboard, 
  LucideUsers, 
  LucideGraduationCap, 
  LucideFileText, 
  LucideSettings,
  LucideBrain,
  LucideHelpCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/auth/rbac'

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const permissions = await getUserPermissions(user?.id || '', user?.email);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-xl border-r-4 border-[var(--color-csm-red)]">
      <div className="h-16 flex items-center px-6 bg-slate-950 font-bold text-white text-lg tracking-wide border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-csm-red)] p-1.5 rounded-lg shadow-sm border border-[var(--color-csm-yellow)]">
            <LucideGraduationCap size={20} className="text-white" />
          </div>
          <span>PONTE CSM</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="flex flex-col gap-1 px-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-[var(--color-csm-red)] hover:opacity-90 transition-opacity">
            <LucideLayoutDashboard size={18} />
            <span className="font-medium">Painel Inicial</span>
          </Link>
          
          {(permissions.canAccessCadastros || permissions.canAccessSecretaria || permissions.canAccessPedagogico) && (
            <div className="mt-4 mb-1 text-xs font-semibold text-slate-500 uppercase px-3">
              Administração
            </div>
          )}
          
          {permissions.canAccessCadastros && (
            <Link href="/cadastros/pessoas" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-[var(--color-csm-yellow)] transition-colors">
              <LucideUsers size={18} />
              <span className="font-medium">Cadastros</span>
            </Link>
          )}
          
          {permissions.canAccessPedagogico && (
            <Link href="/pedagogico" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-[var(--color-csm-yellow)] transition-colors">
              <LucideGraduationCap size={18} />
              <span className="font-medium">Pedagógico</span>
            </Link>
          )}
          
          {permissions.canAccessSecretaria && (
            <Link href="/secretaria" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-[var(--color-csm-yellow)] transition-colors">
              <LucideFileText size={18} />
              <span className="font-medium">Secretaria</span>
            </Link>
          )}
          
          {permissions.canAccessAee && (
            <>
              <div className="mt-4 mb-1 text-xs font-semibold text-slate-500 uppercase px-3">
                Inclusão e Acessibilidade
              </div>
              <Link href="/aee" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-[var(--color-csm-green)] transition-colors">
                <LucideBrain size={18} />
                <span className="font-medium">AEE</span>
              </Link>
            </>
          )}
          
          {permissions.canAccessConfiguracoes && (
            <>
              <div className="mt-4 mb-1 text-xs font-semibold text-slate-500 uppercase px-3">
                Sistema
              </div>
              <Link href="/configuracoes" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <LucideSettings size={18} />
                <span className="font-medium">Configurações</span>
              </Link>
            </>
          )}

          <div className="mt-4 mb-1 text-xs font-semibold text-slate-500 uppercase px-3">
            Treinamento
          </div>
          <Link href="/apresentacao" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-[var(--color-csm-yellow)] transition-colors">
            <LucideHelpCircle size={18} />
            <span className="font-medium">Guias de Perfis</span>
          </Link>
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Colégio Santa Mônica &copy; 2026
      </div>
    </aside>
  )
}
