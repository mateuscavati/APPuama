-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "posicao_equipe" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_aprovado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carro" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER,
    "entre_eixo" DECIMAL(10,3) NOT NULL,
    "distancia_rodas" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "carro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balanceamento" (
    "id" SERIAL NOT NULL,
    "carro_id" INTEGER NOT NULL,
    "data_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "peso_piloto" DECIMAL(10,2),
    "peso_roda_dianteira_e" DECIMAL(10,2) NOT NULL,
    "peso_roda_dianteira_d" DECIMAL(10,2) NOT NULL,
    "peso_roda_traseira_e" DECIMAL(10,2) NOT NULL,
    "peso_roda_traseira_d" DECIMAL(10,2) NOT NULL,
    "dist_dianteira_traseira" DECIMAL(5,2),
    "dist_esquerda_direita" DECIMAL(5,2),
    "dist_diagonal" DECIMAL(5,2),
    "peso_total_carro" DECIMAL(10,2),

    CONSTRAINT "balanceamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teste_report" (
    "id" SERIAL NOT NULL,
    "carro_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "balanceamento_id" INTEGER,
    "piloto_nome" TEXT,
    "tipo_sessao" TEXT,
    "data_teste" DATE,
    "hora_inicio" TIME(0),
    "hora_fim" TIME(0),
    "tempo_total" TEXT,
    "distancia_percorrida" DECIMAL(10,2),
    "erros_mecanicos" INTEGER NOT NULL DEFAULT 0,
    "erros_humanos" INTEGER NOT NULL DEFAULT 0,
    "observacoes_piloto" TEXT,
    "pressao_de_antes" DECIMAL(4,2),
    "pressao_de_depois" DECIMAL(4,2),
    "desgaste_de_antes" DECIMAL(4,2),
    "desgaste_de_depois" DECIMAL(4,2),
    "tamanho_mola_de" DECIMAL(5,2),
    "tamanho_mola_dd" DECIMAL(5,2),
    "tamanho_mola_te" DECIMAL(5,2),
    "tamanho_mola_td" DECIMAL(5,2),

    CONSTRAINT "teste_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist" (
    "id" SERIAL NOT NULL,
    "area" TEXT NOT NULL,
    "descricao_item" TEXT NOT NULL,

    CONSTRAINT "checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_checklist_item" (
    "report_id" INTEGER NOT NULL,
    "checklist_item_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "report_checklist_item_pkey" PRIMARY KEY ("report_id","checklist_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_matricula_key" ON "usuario"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_area_descricao_item_key" ON "checklist"("area", "descricao_item");

-- AddForeignKey
ALTER TABLE "balanceamento" ADD CONSTRAINT "balanceamento_carro_id_fkey" FOREIGN KEY ("carro_id") REFERENCES "carro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teste_report" ADD CONSTRAINT "teste_report_carro_id_fkey" FOREIGN KEY ("carro_id") REFERENCES "carro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teste_report" ADD CONSTRAINT "teste_report_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teste_report" ADD CONSTRAINT "teste_report_balanceamento_id_fkey" FOREIGN KEY ("balanceamento_id") REFERENCES "balanceamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_checklist_item" ADD CONSTRAINT "report_checklist_item_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "teste_report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_checklist_item" ADD CONSTRAINT "report_checklist_item_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
