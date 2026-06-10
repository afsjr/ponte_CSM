import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { pessoa } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getUserPermissions } from '@/lib/auth/rbac'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const permissions = await getUserPermissions(user.id, user.email);

    // O admin master pode ignorar a restrição de situação para conseguir desbloquear os outros
    const isDevMaster = user.email?.toLowerCase() === 'adelinosantos.fs@gmail.com' || (process.env.NODE_ENV === 'development' && !user.email?.includes('comum'));

    if (!isDevMaster) {
      const [p] = await db.select({ situacao: pessoa.situacao }).from(pessoa).where(eq(pessoa.id, user.id));
      if (p) {
        if (p.situacao === 'inativo') {
          redirect('/em-analise')
        } else if (p.situacao !== 'ativo') {
          redirect('/acesso-bloqueado')
        }
      }

      if (!permissions.isFuncionario) {
        // Futuramente aqui pode redirecionar para /portal-aluno, etc.
        redirect('/acesso-bloqueado')
      }
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
