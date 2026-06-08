import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/db";
import { sql } from "drizzle-orm";
import { pessoa, pessoaClassificacao, endereco, contato, dadosAluno, vinculoResponsavelAluno, matricula, turma, anoLetivo } from "../src/db/schema";
import * as xlsx from "xlsx";

async function main() {
  console.log("Iniciando Ingestão de Dados (XLS)...");

  // 1. Limpar tabela pessoa CASCADE (Isso apaga todos os dados mockados, incluindo AEE)
  console.log("Limpando dados mockados (TRUNCATE pessoa CASCADE)...");
  await db.execute(sql`TRUNCATE TABLE pessoa CASCADE;`);

  // 2. Obter Ano Letivo 2026
  const anoResult = await db.select().from(anoLetivo).where(sql`ano = 2026`);
  const anoId = anoResult[0]?.id;
  if (!anoId) throw new Error("Ano Letivo 2026 não encontrado!");

  // 3. Mapear turmas do banco
  const turmasDb = await db.select().from(turma);
  const turmaMap = new Map<string, string>(); // nome -> id
  turmasDb.forEach(t => {
    const normalized = t.nome.replace(/Turma:\s*/i, "").trim().replace(/\s+/g, " ");
    turmaMap.set(normalized, t.id);
  });

  // 4. Ler o Excel
  console.log("Lendo arquivo Excel...");
  const wb = xlsx.readFile("docs/b11c329e-28b8-4216-a6d9-1c3401bc8999111616697.xls");
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<any[]>(ws, { header: 1 });

  let currentTurmaId: string | null = null;
  const respMap = new Map<string, string>(); // cpf or name -> pessoa_id
  
  let alunosInseridos = 0;
  let responsaveisInseridos = 0;
  const matriculasVistas = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    if (firstCell.startsWith("Turma:")) {
      const nomeTurma = firstCell.replace(/Turma:\s*/i, "").trim().replace(/\s+/g, " ");
      currentTurmaId = turmaMap.get(nomeTurma) || null;
      if (!currentTurmaId) {
        console.warn(`Aviso: Turma '${nomeTurma}' não encontrada no banco. Alunos desta turma pularão matrícula.`);
      }
      continue;
    }

    if (firstCell === "Nome" || firstCell === "Data Nascimento") {
      continue; // Pular cabeçalhos
    }

    const row1 = rows[i];
    const alunoNome = String(row1[0] || "").trim();
    
    // Ignorar linhas vazias, undefined ou separadores do Excel (___) ANTES de incrementar o i
    if (!alunoNome || alunoNome === "undefined" || /^[_\-\s.]+$/.test(alunoNome)) continue;

    if (i + 1 >= rows.length) break;
    const row2 = rows[i + 1];
    i++; // Pula a linha 2 no loop principal, pois já estamos lendo ela

    // -- Extrair dados da Linha 1
    const matriculaNum = String(row1[1] || "").trim();
    const respNome = String(row1[2] || "").trim();
    const respCpf = String(row1[3] || "").trim();
    const respEmail = String(row1[4] || "").trim();
    
    // Endereço
    const bairro = String(row1[7] || "").trim();
    const cep = String(row1[8] || "").trim();
    const cidade = String(row1[10] || "").trim();
    const logradouro = String(row1[11] || "").trim();
    const numero = String(row1[12] || "").trim();
    
    // -- Extrair dados da Linha 2
    const alunoDataNasc = String(row2[0] || "").trim(); // DD/MM/YYYY
    const foneResp1 = String(row2[1] || "").trim();
    const foneResp2 = String(row2[2] || "").trim();
    const uf = String(row2[3] || "").trim();
    const respRg = String(row2[4] || "").trim();
    const parentesco1 = String(row2[5] || "").trim();
    const parentesco2 = String(row2[6] || "").trim();

    // Ignorar linhas vazias, undefined ou separadores do Excel (___)
    // Foi movido para cima para evitar bug de pular linha da turma
    // Gerenciar Matrícula Única
    let finalMatricula = (matriculaNum && matriculaNum !== "undefined") ? String(matriculaNum).trim() : `MAT-${Date.now()}-${i}`;
    if (matriculasVistas.has(finalMatricula)) {
      finalMatricula = `${finalMatricula}-DUP-${i}`;
    }
    matriculasVistas.add(finalMatricula);

    // -- Identificar qual responsável usar (já lidos respCpf e respNome)
    
    const respKey = respCpf ? respCpf : respNome;
    let respId: string | null = null;

    if (respKey) {
      respId = respMap.get(respKey) || null;
    }

    if (!respId && respNome && respNome !== "undefined") {
      // Inserir Responsável
      const [newResp] = await db.insert(pessoa).values({
        nomeCompleto: respNome,
        cpf: (respCpf && respCpf !== "undefined") ? respCpf : null,
        rg: null,
      }).returning({ id: pessoa.id });
      respId = newResp.id;
      respMap.set(respKey, respId);
      responsaveisInseridos++;

      // Classificar como responsável
      await db.insert(pessoaClassificacao).values({ pessoaId: respId, tipo: 'responsavel' });

      // Inserir Endereço do Responsável
      if ((logradouro && logradouro !== "undefined") || (bairro && bairro !== "undefined")) {
        const formatedCep = (cep && cep !== "undefined") ? String(cep).replace(/\./g, "").substring(0, 9) : "00000-000";
        await db.insert(endereco).values({
          pessoaId: respId,
          logradouro: (logradouro && logradouro !== "undefined") ? logradouro : "Não informado",
          numero: (numero && numero !== "undefined") ? String(numero) : "S/N",
          bairro: (bairro && bairro !== "undefined") ? bairro : "Não informado",
          cidade: (cidade && cidade !== "undefined") ? cidade : "Não informado",
          uf: (uf && uf !== "undefined") ? uf : "PE",
          cep: formatedCep
        });
      }

      // Inserir Contatos do Responsável
      if (foneResp1 && foneResp1 !== "undefined") {
        await db.insert(contato).values({
          pessoaId: respId,
          tipo: "celular",
          valor: String(foneResp1)
        });
      }
      if (foneResp2 && foneResp2 !== "undefined") {
        await db.insert(contato).values({
          pessoaId: respId,
          tipo: "celular",
          valor: String(foneResp2)
        });
      }
      if (respEmail && respEmail !== "undefined" && String(respEmail).includes("@")) {
        await db.insert(contato).values({
          pessoaId: respId,
          tipo: "email",
          valor: String(respEmail)
        });
      }
    }

    // -- Processar Aluno
    let dataNascimentoDb: Date | null = null;
    if (alunoDataNasc && alunoDataNasc !== "undefined" && String(alunoDataNasc).includes("/")) {
      const parts = String(alunoDataNasc).split("/");
      if (parts.length === 3) {
        const year = parseInt(parts[2], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[0], 10);
        dataNascimentoDb = new Date(year, month, day);
      }
    }

    const [newAluno] = await db.insert(pessoa).values({
      nomeCompleto: alunoNome,
      dataNascimento: dataNascimentoDb,
    }).returning({ id: pessoa.id });
    alunosInseridos++;

    // Classificar como aluno
    await db.insert(pessoaClassificacao).values({ pessoaId: newAluno.id, tipo: 'aluno' });

    // -- Dados Aluno
    await db.insert(dadosAluno).values({
      pessoaId: newAluno.id,
      numeroMatricula: finalMatricula,
      senhaPortalHash: "mudar123" // Conforme combinado
    });

    // -- Vínculo Aluno-Responsável
    if (respId) {
      await db.insert(vinculoResponsavelAluno).values({
        alunoId: newAluno.id,
        responsavelId: respId,
        grauParentesco: (parentesco1 && parentesco1 !== "undefined") ? parentesco1 : ((parentesco2 && parentesco2 !== "undefined") ? parentesco2 : "Responsável")
      });
    }

    // -- Matrícula Oficial na Turma
    if (currentTurmaId) {
      await db.insert(matricula).values({
        alunoId: newAluno.id,
        turmaId: currentTurmaId,
        anoLetivoId: anoId,
        numeroMatricula: finalMatricula,
        status: "ativo"
      });
    }
  }

  console.log(`\n=========================================`);
  console.log(`✅ INGESTÃO FINALIZADA COM SUCESSO!`);
  console.log(`👨‍👩‍👧‍👦 Responsáveis Inseridos: ${responsaveisInseridos}`);
  console.log(`🎓 Alunos Inseridos e Matriculados: ${alunosInseridos}`);
  console.log(`=========================================\n`);
  process.exit(0);
}

main().catch(err => {
  console.error("ERRO FATAL DURANTE INGESTÃO:", err);
  process.exit(1);
});
