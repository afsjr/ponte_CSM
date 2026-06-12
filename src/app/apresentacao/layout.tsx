import React from 'react'
import Link from 'next/link'
import { LucideGraduationCap, LucideChevronLeft } from 'lucide-react'

export default function ApresentacaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header Institucional */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo do Colégio - Escudo Estilizado CSM */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-csm-red)] to-red-700 shadow-md shadow-red-500/20 border border-[var(--color-csm-yellow)] overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h100v100H0z" fill="currentColor"/>
              </svg>
              <LucideGraduationCap className="text-white relative z-10 w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight block">PONTE CSM</span>
              <span className="text-[10px] text-[var(--color-csm-yellow)] dark:text-yellow-400 font-bold uppercase tracking-wider block -mt-1">Educação Básica</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <LucideChevronLeft size={16} />
              Voltar ao Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer Institucional */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">Ponte CSM</span>
            <span>&bull;</span>
            <span>Plataforma de Treinamento Escolar &copy; {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Link href="/login" className="hover:text-[var(--color-csm-red)] transition-colors">Acessar o Sistema</Link>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <a href="#" className="hover:text-[var(--color-csm-red)] transition-colors">Suporte Técnico</a>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <a href="#" className="hover:text-[var(--color-csm-red)] transition-colors">Políticas de Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
