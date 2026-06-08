import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./index";
import { sql } from "drizzle-orm";
import {
  anoLetivo,
  nivelEnsino,
  serie,
  turma,
  disciplina,
  periodoAvaliativo
} from "./schema";

async function main() {
  console.log("Iniciando Seed Pedagógico Base...");

  // 1. Limpeza Cascata
  console.log("Limpando tabelas...");
  await db.execute(sql`TRUNCATE TABLE ano_letivo CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE nivel_ensino CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE disciplina CASCADE;`);
  
  // 2. Ano Letivo 2026
  console.log("Inserindo Ano Letivo 2026...");
  const [ano2026] = await db.insert(anoLetivo).values({
    ano: 2026,
    dataInicio: new Date('2026-02-01'),
    dataFim: new Date('2026-12-15'),
    ativo: true
  }).returning();

  // 3. Período Avaliativo
  await db.insert(periodoAvaliativo).values({
    anoLetivoId: ano2026.id,
    nome: '1º Bimestre',
    numero: 1,
    tipo: 'bimestre',
    dataInicio: new Date('2026-02-01'),
    dataFim: new Date('2026-04-15')
  });

  // 4. Níveis de Ensino
  console.log("Inserindo Níveis de Ensino...");
  const niveis = await db.insert(nivelEnsino).values([
    { nome: 'Educação Infantil', ehInfantil: true, ordemExibicao: 1 },
    { nome: 'Ensino Fundamental I', ehInfantil: false, ordemExibicao: 2 },
    { nome: 'Ensino Fundamental II', ehInfantil: false, ordemExibicao: 3 },
    { nome: 'Ensino Técnico', ehInfantil: false, ordemExibicao: 4 }
  ]).returning();
  
  const [infantil, fund1, fund2, tecnico] = niveis;

  // 5. Séries
  console.log("Inserindo Séries...");
  const series = await db.insert(serie).values([
    { nivelEnsinoId: infantil.id, nome: 'Infantil 03', ordemExibicao: 1 },
    { nivelEnsinoId: infantil.id, nome: 'Infantil 04', ordemExibicao: 2 },
    { nivelEnsinoId: infantil.id, nome: 'Infantil 05', ordemExibicao: 3 },
    
    { nivelEnsinoId: fund1.id, nome: '1º Ano', ordemExibicao: 4 },
    { nivelEnsinoId: fund1.id, nome: '2º Ano', ordemExibicao: 5 },
    { nivelEnsinoId: fund1.id, nome: '3º Ano', ordemExibicao: 6 },
    { nivelEnsinoId: fund1.id, nome: '4º Ano', ordemExibicao: 7 },
    { nivelEnsinoId: fund1.id, nome: '5º Ano', ordemExibicao: 8 },
    
    { nivelEnsinoId: fund2.id, nome: '6º Ano', ordemExibicao: 9 },
    { nivelEnsinoId: fund2.id, nome: '7º Ano', ordemExibicao: 10 },
    { nivelEnsinoId: fund2.id, nome: '8º Ano', ordemExibicao: 11 },
    { nivelEnsinoId: fund2.id, nome: '9º Ano', ordemExibicao: 12 },
    
    { nivelEnsinoId: tecnico.id, nome: 'Módulo Técnico Enfermagem', ordemExibicao: 13 }
  ]).returning();

  // Helper map for series
  const serieMap = series.reduce((acc, s) => {
    acc[s.nome] = s.id;
    return acc;
  }, {} as Record<string, string>);

  // 6. Disciplinas
  console.log("Inserindo Disciplinas...");
  await db.insert(disciplina).values([
    { nome: 'Artes', sigla: 'ART', tipoBase: 'basica', formaAvaliacao: 'numerica' },
    { nome: 'Ciências', sigla: 'CIE', tipoBase: 'basica', formaAvaliacao: 'numerica' },
    { nome: 'Educação Física EF', sigla: 'EDF', tipoBase: 'basica', formaAvaliacao: 'numerica' },
    { nome: 'Geografia', sigla: 'GEO', tipoBase: 'basica', formaAvaliacao: 'numerica' },
    { nome: 'História', sigla: 'HIS', tipoBase: 'basica', formaAvaliacao: 'numerica' },
    { nome: 'Inglês', sigla: 'ING', tipoBase: 'basica', formaAvaliacao: 'numerica' },
    { nome: 'Matemática- EF', sigla: 'MAT', tipoBase: 'basica', formaAvaliacao: 'numerica' },
    { nome: 'Português EF(1° ao 9° ano)', sigla: 'POR', tipoBase: 'basica', formaAvaliacao: 'numerica' }
  ]);

  // 7. Turmas
  console.log("Inserindo Turmas...");
  await db.insert(turma).values([
    { anoLetivoId: ano2026.id, serieId: serieMap['Infantil 03'], nome: 'Infantil 03/ 2026', turno: 'manha' },
    { anoLetivoId: ano2026.id, serieId: serieMap['Infantil 04'], nome: 'Infantil 04 /2026', turno: 'manha' },
    { anoLetivoId: ano2026.id, serieId: serieMap['Infantil 05'], nome: 'Infantil 05/ 2026', turno: 'manha' },
    
    { anoLetivoId: ano2026.id, serieId: serieMap['1º Ano'], nome: 'Turma: 1º Ano - 2026', turno: 'manha' },
    { anoLetivoId: ano2026.id, serieId: serieMap['2º Ano'], nome: 'Turma: 2º Ano - 2026', turno: 'manha' },
    { anoLetivoId: ano2026.id, serieId: serieMap['3º Ano'], nome: 'Turma: 3º AN0 - 2026', turno: 'manha' }, // Respeitando a nomenclatura (AN0) do XLS
    { anoLetivoId: ano2026.id, serieId: serieMap['4º Ano'], nome: 'Turma: 4º Ano - 2026', turno: 'manha' },
    { anoLetivoId: ano2026.id, serieId: serieMap['5º Ano'], nome: 'Turma: 5º Ano - 2026', turno: 'manha' },
    
    { anoLetivoId: ano2026.id, serieId: serieMap['6º Ano'], nome: 'Turma: 6º Ano - 2026', turno: 'manha' },
    { anoLetivoId: ano2026.id, serieId: serieMap['7º Ano'], nome: 'Turma: 7º Ano - 2026', turno: 'manha' },
    { anoLetivoId: ano2026.id, serieId: serieMap['8º Ano'], nome: 'Turma: 8º Ano - 2026', turno: 'manha' },
    { anoLetivoId: ano2026.id, serieId: serieMap['9º Ano'], nome: 'Turma: 9º Ano - 2026', turno: 'manha' },
    
    { anoLetivoId: ano2026.id, serieId: serieMap['Módulo Técnico Enfermagem'], nome: 'Enfermagem 2026 /2027 Noite', turno: 'noite' },
    { anoLetivoId: ano2026.id, serieId: serieMap['Módulo Técnico Enfermagem'], nome: 'Enfermagem - SABADO 2026-2027', turno: 'integral' }
  ]);

  console.log("Seed Pedagógico Base finalizado com sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao rodar seed:", err);
  process.exit(1);
});
