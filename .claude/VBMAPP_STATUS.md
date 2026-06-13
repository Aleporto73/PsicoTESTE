# PsicoTESTE — VB-MAPP Status Técnico

Data: 13/06/2026  
Repo: `C:\PsicoTESTE`  
Status: VB-MAPP alinhado com a planilha XLSX base em 160 marcos.

## Fonte de validação

Planilha base usada:

`C:\Users\evera\OneDrive\Desktop\VBMAPP-PEI.xlsx`

Abas auditadas:

- AV MILESTONES
- SUBTESTE ECOICO
- AV TAREFAS
- AV BARREIRAS
- AV TRANSIÇÃO
- PEI
- CONSOLIDADO

## Estado final dos marcos

O app agora possui 160 marcos VB-MAPP, alinhados com a planilha base.

Correções aplicadas:

1. Proteção contra re-migração DOM.
2. Adição do marco ausente `DOM10-L3-M15`.
3. Adição do domínio `DOM09 — Comportamento Vocal Espontâneo`, com 5 marcos de Nível 1.
4. Atualização de totais para 160 marcos.
5. Preservação do Ecoico como subteste separado.
6. Pontuação ponderada de marcos: `dominado = 1`, `emergente = 0.5`, `nao_observado = 0`, `NA/desconhecido = excluído do denominador`.
7. Emergente continua gerando lacuna e pode alimentar PEI como alvo de intervenção.
8. Não replicar o valor `5` da planilha Excel; o `5` representava limitação de formatação, não regra clínica.
9. Barreiras relevantes no PEI/conformidade passam a usar pontuação `>= 2` (inclui barreiras 2, 3 e 4, conforme planilha); barreiras de pontuação 2 não são chamadas de críticas e o texto passou para "Barreiras Relevantes Identificadas". Metas principais do PEI não foram alteradas.

## Commits relevantes

- `c93e878` — `fix: protege schema estrutural contra remigracao DOM`
- `61f6765` — `fix: adiciona marco DOM10-L3-M15 conforme planilha`
- `28d70f8` — `feat: adiciona DOM09 Vocal conforme planilha`
- `95da011` — `fix: pontua emergente como meio ponto`
- `7d620a2` — `fix: considera barreiras relevantes no PEI`
- `6276dab` — `fix: alinha transicao automatica por faixas oficiais`

## Tags relevantes

- `psicoteste-vbmapp-auditoria-ok`
- `psicoteste-vbmapp-schema-ok`
- `psicoteste-vbmapp-dom10-m15-ok`
- `psicoteste-vbmapp-160-marcos-ok`

## Decisões técnicas

### DOM08 Ecoico

Permanece fora dos milestones lineares.

Motivo: a planilha trata Ecoico como subteste separado, não como domínio linear dentro da grade principal de marcos.

### DOM09 Vocal

Foi implementado como domínio linear de Nível 1.

Motivo: a planilha contém 5 itens de Comportamento Vocal Espontâneo na aba `AV MILESTONES`, incluídos no total do Nível 1.

### Task Analysis para DOM09

Não foi criada.

Motivo: a aba `AV TAREFAS` não contém seção de tarefas para Vocal. O app usa fallback seguro quando não há task analysis real.

## Pendências ainda abertas

1. Validar manualmente o fluxo completo:
   - paciente fictício → Marcos → Barreiras → Transição → Lacunas → PEI → PDF.

2. Transição:
   - itens automáticos 1, 2, 3 e 5 corrigidos por faixas oficiais (Patch 10C, commit `6276dab`).
   - pendente: validação manual do fluxo completo e revisão de possível mismatch no PDF.

3. Ecoico:
   - planilha possui 100 estímulos fixos;
   - app ainda não implementa todos e o gatilho está desativado.

## Veredito atual

VB-MAPP está alinhado com a planilha XLSX base em estrutura principal de marcos: 160/160.

Está pronto para teste interno técnico com paciente fictício.

Ainda não deve ser tratado como homologado para uso clínico real sem validação manual e decisões clínicas pendentes.
