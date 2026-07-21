# Guia de Teste e Onboarding: Módulos Financeiro e RH

> Identificador: `001-modulos-financeiro-rh`
> Data: `2026-07-20`

## 1. Pré-requisitos
- Aplicação rodando localmente via `npm run dev`.
- Usuário administrativo logado no sistema.

## 2. Passo a Passo de Teste do Módulo Financeiro
1. Acesse o menu `/financeiro` no painel principal.
2. Na aba "Contas a Pagar/Receber", clique em "Novo Lançamento".
3. Cadastre uma despesa de R$ 1.500,00 associada ao centro de custo "Ensino Técnico" com vencimento nos próximos 5 dias.
4. Navegue para a aba "Calendário": verifique se a conta é destacada em amarelo no calendário.
5. Na aba "DRE": selecione o filtro "Ensino Técnico" e confirme se a despesa é contabilizada no resultado líquido.
6. Retorne para Contas a Pagar e efetue a baixa do lançamento.

## 3. Passo a Passo de Teste do Módulo de RH
1. Acesse o menu `/rh` no painel principal.
2. Selecione um colaborador/professor já cadastrado.
3. Na aba "Dossiê", atualize o cargo e os dados bancários do funcionário.
4. Na aba "Férias", registre a programação de 30 dias de férias para o próximo período aquisitivo.
5. Na aba "Ocorrências", cadastre um elogio ou gratificação e confirme o registro imutável na timeline do colaborador.
6. Na aba "Folha de Pagamento", exporte a listagem de conferência e certifique-se de que os proventos correspondem aos dados do dossiê.
