CREATE TABLE "aviso_ciente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aviso_id" uuid NOT NULL,
	"responsavel_id" uuid NOT NULL,
	"aluno_id" uuid NOT NULL,
	"ciente_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mural_aviso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"conteudo" text NOT NULL,
	"data_publicacao" timestamp DEFAULT now() NOT NULL,
	"destinatario_tipo" varchar(50) NOT NULL,
	"turma_id" uuid,
	"serie_id" uuid,
	"aluno_id" uuid,
	"criado_por_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vinculo_responsavel_aluno" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"responsavel_id" uuid NOT NULL,
	"aluno_id" uuid NOT NULL,
	"grau_parentesco" varchar(50) NOT NULL,
	"responsavel_financeiro" boolean DEFAULT false NOT NULL,
	"autorizado_retirada" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aviso_ciente" ADD CONSTRAINT "aviso_ciente_aviso_id_mural_aviso_id_fk" FOREIGN KEY ("aviso_id") REFERENCES "public"."mural_aviso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aviso_ciente" ADD CONSTRAINT "aviso_ciente_responsavel_id_pessoa_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aviso_ciente" ADD CONSTRAINT "aviso_ciente_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mural_aviso" ADD CONSTRAINT "mural_aviso_turma_id_turma_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turma"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mural_aviso" ADD CONSTRAINT "mural_aviso_serie_id_serie_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."serie"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mural_aviso" ADD CONSTRAINT "mural_aviso_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mural_aviso" ADD CONSTRAINT "mural_aviso_criado_por_id_pessoa_id_fk" FOREIGN KEY ("criado_por_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinculo_responsavel_aluno" ADD CONSTRAINT "vinculo_responsavel_aluno_responsavel_id_pessoa_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinculo_responsavel_aluno" ADD CONSTRAINT "vinculo_responsavel_aluno_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;