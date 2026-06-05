CREATE TABLE "aee_prontuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"diagnostico" text,
	"medicacoes_em_uso" text,
	"aspectos_positivos" text,
	"dificuldades" text,
	"adaptacoes_atividades" text,
	"relatorios_texto" text,
	"horario_atendimento" varchar(255) DEFAULT 'Segunda a Sexta, das 7:30h às 12:00h',
	"feedback_reunioes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "aee_prontuario_aluno_id_unique" UNIQUE("aluno_id")
);
--> statement-breakpoint
CREATE TABLE "dados_aluno" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid NOT NULL,
	"numero_matricula" varchar(50),
	"ra" varchar(50),
	"codigo_barras" varchar(100),
	"login_portal" varchar(100),
	"senha_portal_hash" varchar(255),
	"cartao_catraca" varchar(100),
	"permitir_biblioteca" boolean DEFAULT true NOT NULL,
	"turma_atual_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dados_aluno_pessoa_id_unique" UNIQUE("pessoa_id")
);
--> statement-breakpoint
CREATE TABLE "dados_funcionario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid NOT NULL,
	"cargo" varchar(100),
	"departamento" varchar(100),
	"data_admissao" timestamp,
	"data_demissao" timestamp,
	"salario" integer,
	"carga_horaria" integer,
	"registro_profissional" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dados_funcionario_pessoa_id_unique" UNIQUE("pessoa_id")
);
--> statement-breakpoint
ALTER TABLE "aee_prontuario" ADD CONSTRAINT "aee_prontuario_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dados_aluno" ADD CONSTRAINT "dados_aluno_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dados_aluno" ADD CONSTRAINT "dados_aluno_turma_atual_id_turma_id_fk" FOREIGN KEY ("turma_atual_id") REFERENCES "public"."turma"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dados_funcionario" ADD CONSTRAINT "dados_funcionario_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;