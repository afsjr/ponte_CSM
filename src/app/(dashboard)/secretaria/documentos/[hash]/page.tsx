import { getDocumentoByHash } from '@/actions/secretaria'
import { notFound } from 'next/navigation'
import { LucidePrinter } from 'lucide-react'

export default async function DocumentoPrintPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const documento = await getDocumentoByHash(hash)

  if (!documento) {
    notFound()
  }

  // TODO: Identificar se o aluno é do Técnico ou Básica baseado na turma. 
  // Para MVP (Fase 1), usaremos o logo da Básica como padrão.
  const logoSrc = '/logo-csm-basica.png'

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      
      {/* Print Controls (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-end print:hidden">
        <button 
          id="btn-print"
          className="flex items-center gap-2 bg-[var(--color-csm-red)] text-white px-4 py-2 rounded-lg hover:opacity-90 shadow"
        >
          <LucidePrinter size={20} />
          Imprimir Documento
        </button>
      </div>

      {/* A4 Document Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none print:w-full print:m-0 min-h-[1050px] relative p-12 text-black font-sans border border-gray-200 print:border-none">
        
        {/* Header */}
        <header className="flex flex-col items-center border-b-2 border-[var(--color-csm-red)] pb-6 mb-10">
          {/* Logo - O usuário deve colocar as imagens na pasta public/ */}
          <img 
            src={logoSrc} 
            alt="Logo Colégio Santa Mônica" 
            className="h-24 object-contain mb-4"
          />
          <h1 className="text-xl font-bold uppercase text-center mt-2">Colégio Santa Mônica</h1>
          <p className="text-sm text-center">Educação Infantil e Ensino Fundamental</p>
          <p className="text-sm text-center">CNPJ: 00.000.000/0001-00</p>
        </header>

        {/* Body */}
        <main className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-10 uppercase">{documento.titulo}</h2>
          
          <div className="text-justify leading-relaxed text-lg space-y-6">
            {documento.tipo === 'declaracao_matricula' && (
              <p>
                Declaramos para os devidos fins que o(a) aluno(a) <strong>{documento.alunoNome}</strong>, 
                portador(a) do CPF <strong>{documento.alunoCpf}</strong>, encontra-se devidamente matriculado(a) 
                e frequentando regularmente as aulas neste estabelecimento de ensino no ano letivo vigente.
              </p>
            )}
            
            {(documento.tipo === 'boletim' || documento.tipo === 'historico_escolar') && (
              <p>
                Apresentamos o {documento.titulo} do(a) aluno(a) <strong>{documento.alunoNome}</strong>.
                <em> (Tabelas de notas devem ser incluídas na Fase 2 da integração pedagógica).</em>
              </p>
            )}

            {documento.tipo.includes('declaracao') && documento.tipo !== 'declaracao_matricula' && (
              <p>
                Declaramos para os devidos fins o presente {documento.titulo} referente ao aluno(a) <strong>{documento.alunoNome}</strong>.
              </p>
            )}

            <p>
              Por ser verdade, firmamos a presente declaração.
            </p>
          </div>

          <div className="mt-20 flex flex-col items-center">
            <div className="w-64 border-t border-black mb-2"></div>
            <p className="font-medium text-center">Secretaria Escolar</p>
            <p className="text-sm text-center">Colégio Santa Mônica</p>
          </div>
        </main>

        {/* Footer (Hash Verification) */}
        <footer className="absolute bottom-12 left-12 right-12 border-t border-gray-300 pt-4 text-xs text-center text-gray-500">
          <p>Este documento foi gerado eletronicamente em <strong>{new Date(documento.geradoEm).toLocaleString('pt-BR')}</strong> por <strong>{documento.geradoPorNome}</strong>.</p>
          <p className="mt-1">
            Código de Autenticidade: <strong className="font-mono">{documento.hashVerificacao}</strong>
          </p>
          <p>
            Valide a autenticidade deste documento no portal da instituição usando o código acima.
          </p>
        </footer>
      </div>
      
      {/* Script para o botão de impressão */}
      <script dangerouslySetInnerHTML={{__html: `
        document.querySelector('#btn-print')?.addEventListener('click', function() {
          window.print();
        });
      `}} />
    </div>
  )
}
