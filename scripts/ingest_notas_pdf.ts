import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');
import { db } from '../src/db';
import { 
  turma, disciplina, pessoa, matricula, periodoAvaliativo, avaliacao, nota, anoLetivo, pessoaClassificacao 
} from '../src/db/schema';
import { eq, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function processPdf(filePath: string) {
  console.log(`\nProcessando arquivo: ${filePath}`);
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  
  const lines = data.text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
  
  let currentTurmaNome = '';
  let currentTurmaId = '';
  let currentAnoLetivoId = '';
  let currentDisciplinaNome = '';
  let currentDisciplinaId = '';
  let currentPeriodoId = '';
  let currentAvaliacaoIds: string[] = [];
  let anoValue = new Date().getFullYear();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Turma and Ano Letivo
    // Ex: Turma:2º Ano - 2026Curso: Fundamental 1º à 9º Ano 1º BimestreAno Letivo:2026
    if (line.includes('Turma:') && line.includes('Ano Letivo:')) {
      const turmaMatch = line.match(/Turma:(.+?)Curso:/);
      const anoMatch = line.match(/Ano Letivo:(\d{4})/);
      
      if (turmaMatch && anoMatch) {
        const newTurmaNome = turmaMatch[1].trim();
        const newAnoLetivo = parseInt(anoMatch[1].trim());
        
        if (newTurmaNome !== currentTurmaNome || anoValue !== newAnoLetivo) {
          currentTurmaNome = newTurmaNome;
          anoValue = newAnoLetivo;
          
          // Get AnoLetivo
          const anoLetivos = await db.select().from(anoLetivo).where(eq(anoLetivo.ano, anoValue));
          if (anoLetivos.length > 0) {
            currentAnoLetivoId = anoLetivos[0].id;
          } else {
            const [newAno] = await db.insert(anoLetivo).values({
              ano: anoValue,
              dataInicio: new Date(`${anoValue}-02-01`),
              dataFim: new Date(`${anoValue}-12-15`),
              ativo: true
            }).returning();
            currentAnoLetivoId = newAno.id;
          }

          // Get Periodo Avaliativo "1º Bimestre"
          const periodos = await db.select().from(periodoAvaliativo)
            .where(and(
              eq(periodoAvaliativo.anoLetivoId, currentAnoLetivoId),
              eq(periodoAvaliativo.numero, 1)
            ));
          if (periodos.length > 0) {
            currentPeriodoId = periodos[0].id;
          } else {
            const [newPeriodo] = await db.insert(periodoAvaliativo).values({
              anoLetivoId: currentAnoLetivoId,
              nome: '1º Bimestre',
              numero: 1,
              dataInicio: new Date(`${anoValue}-02-01`),
              dataFim: new Date(`${anoValue}-04-30`),
              tipo: 'bimestre'
            }).returning();
            currentPeriodoId = newPeriodo.id;
          }

          // Get Turma
          const turmas = await db.select().from(turma)
            .where(and(
              eq(turma.nome, `Turma: ${currentTurmaNome}`),
              eq(turma.anoLetivoId, currentAnoLetivoId)
            ));
          if (turmas.length > 0) {
            currentTurmaId = turmas[0].id;
          } else {
            console.error(`❌ Turma não encontrada: ${currentTurmaNome}`);
            currentTurmaId = '';
          }
        }
      }
    }

    // Detect Disciplina
    // Ex: Disciplina:ArtesProfessor:Selma
    if (line.includes('Disciplina:')) {
      const discMatch = line.match(/Disciplina:(.+?)Professor:/);
      if (discMatch) {
        const newDisciplinaNome = discMatch[1].trim();
        if (newDisciplinaNome !== currentDisciplinaNome) {
          currentDisciplinaNome = newDisciplinaNome;
          
          // Get Disciplina
          const disciplinas = await db.select().from(disciplina)
            .where(eq(disciplina.nome, currentDisciplinaNome));
            
          if (disciplinas.length > 0) {
            currentDisciplinaId = disciplinas[0].id;
          } else {
            // Create if not exists to not block ingestion
            const [newDisc] = await db.insert(disciplina).values({
              nome: currentDisciplinaNome,
              tipoBase: 'basica',
              formaAvaliacao: 'numerica'
            }).returning();
            currentDisciplinaId = newDisc.id;
          }

          // Ensure 3 Avaliacoes exist for this Turma+Disciplina+Periodo
          if (currentTurmaId && currentDisciplinaId && currentPeriodoId) {
            currentAvaliacaoIds = [];
            const titles = ['Nota 1', 'Nota 2', 'Nota 3'];
            for (const title of titles) {
              const avaliacoes = await db.select().from(avaliacao)
                .where(and(
                  eq(avaliacao.turmaId, currentTurmaId),
                  eq(avaliacao.disciplinaId, currentDisciplinaId),
                  eq(avaliacao.periodoAvaliativoId, currentPeriodoId),
                  eq(avaliacao.descricao, title)
                ));
                
              if (avaliacoes.length > 0) {
                currentAvaliacaoIds.push(avaliacoes[0].id);
              } else {
                const [newAv] = await db.insert(avaliacao).values({
                  turmaId: currentTurmaId,
                  disciplinaId: currentDisciplinaId,
                  periodoAvaliativoId: currentPeriodoId,
                  descricao: title,
                  valorMaximo: 1000,
                  peso: 1,
                  dataAplicacao: new Date(`${anoValue}-04-30`),
                  tipo: 'prova'
                }).returning();
                currentAvaliacaoIds.push(newAv.id);
              }
            }
          }
        }
      }
    }

    // Detect Student Row
    // Starts with number, then matricula, then name
    // Ex: 11766CAIO LUCENA DA FONSECA 8,010,010,09,5
    // Note: Name might wrap to next line, and grades might be on next line.
    const studentMatch = line.match(/^(\d{1,2})(\d{4,})([A-ZÀ-Ÿa-z].*)$/);
    if (studentMatch && currentTurmaId && currentAvaliacaoIds.length === 3) {
      const numeroMatriculaStr = studentMatch[2];
      let rowData = line;
      
      let lookAhead = 1;
      while (i + lookAhead < lines.length) {
        const nextLine = lines[i + lookAhead];
        if (nextLine.match(/^(\d{1,2})(\d{4,})([A-ZÀ-Ÿa-z].*)/) || nextLine.startsWith('Média de notas')) {
          break;
        }
        rowData += nextLine;
        lookAhead++;
      }

      // Extract all sequences of \d,\d or \d\d,\d
      const gradesMatch = rowData.match(/(\d{1,2},\d{1})/g);
      if (gradesMatch && gradesMatch.length >= 3) {
        // Find matricula
        const matriculasList = await db.select().from(matricula)
          .where(eq(matricula.numeroMatricula, numeroMatriculaStr));
          
        if (matriculasList.length > 0) {
          const matriculaId = matriculasList[0].id;
          
          for (let g = 0; g < 3; g++) {
            const gradeStr = gradesMatch[g];
            const finalGrade = Math.round(parseFloat(gradeStr.replace(',', '.')) * 100);
            const avaliacaoId = currentAvaliacaoIds[g];

            // Check if nota already exists
            const notas = await db.select().from(nota)
              .where(and(
                eq(nota.matriculaId, matriculaId),
                eq(nota.avaliacaoId, avaliacaoId)
              ));
              
            if (notas.length === 0) {
              const admins = await db.select().from(pessoa)
                .innerJoin(pessoaClassificacao, eq(pessoa.id, pessoaClassificacao.pessoaId))
                .where(eq(pessoaClassificacao.tipo, 'funcionario'))
                .limit(1);
                
              const lancadaPorId = admins.length > 0 ? admins[0].pessoa.id : matriculasList[0].alunoId;

              await db.insert(nota).values({
                avaliacaoId: avaliacaoId,
                matriculaId: matriculaId,
                valor: finalGrade,
                lancadaPorId: lancadaPorId,
                observacao: 'Importado de PDF'
              });
              console.log(`✅ Nota parcial ${g+1} salva: Matrícula ${numeroMatriculaStr} | Turma: ${currentTurmaNome} | Disc: ${currentDisciplinaNome} | Nota: ${gradeStr}`);
            }
          }
        } else {
          console.error(`❌ Matrícula não encontrada: ${numeroMatriculaStr}`);
        }
      }
    }
  }
}

async function run() {
  // Excluir as avaliações "Média Prevista 1º Bimestre" que foram importadas equivocadamente antes
  const avsParaExcluir = await db.select().from(avaliacao).where(eq(avaliacao.descricao, 'Média Prevista 1º Bimestre'));
  for (const av of avsParaExcluir) {
    await db.delete(nota).where(eq(nota.avaliacaoId, av.id));
    await db.delete(avaliacao).where(eq(avaliacao.id, av.id));
  }
  console.log(`🧹 Limpadas ${avsParaExcluir.length} avaliações antigas ("Média Prevista")...`);
  const files = ['docs/notas2ano.pdf', 'docs/notas6ano.pdf'];
  for (const file of files) {
    if (fs.existsSync(file)) {
      await processPdf(file);
    } else {
      console.error(`Arquivo não encontrado: ${file}`);
    }
  }
  console.log('\nProcesso de importação finalizado.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
