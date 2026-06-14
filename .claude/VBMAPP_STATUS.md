# PsicoTESTE — VB-MAPP Status Técnico

Data: 14/06/2026  
Repo: `C:\PsicoTESTE`  
Status: VB-MAPP alinhado com a planilha XLSX base em 160 marcos. Smoke test VB-MAPP/PEI executado; bugs reais em PEI, PDF e persistência local corrigidos. Código crítico **tecnicamente estabilizado para novo smoke / homologação manual** (não homologado clinicamente).

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
- `ebe9272` — `fix: conecta transicao ao PDF VB-MAPP`
- `3d21fda` — `fix: renderiza ecoico no PDF quando disponivel`

### Smoke test VB-MAPP/PEI e fixes finais (junho/2026)

- `b3c2955` — `fix: corrige validacao final do PEI`
- `a7f5a3f` — `fix: normaliza sessoes no PDF do relatorio`
- `5a7d921` — `fix: exibe status do PEI no relatorio`
- `bbf341c` — `fix: corrige campos salvos no PDF do PEI`
- `61599e0` — `fix: protege persistencia local apos hidratacao`
- `e10819e` — `fix: permite excluir objetivos do PEI`
- `9735674` — `fix: melhora rotulos e plurais dos relatorios`

## Tags relevantes

- `psicoteste-vbmapp-auditoria-ok`
- `psicoteste-vbmapp-schema-ok`
- `psicoteste-vbmapp-dom10-m15-ok`
- `psicoteste-vbmapp-160-marcos-ok`

## Decisões técnicas

### DOM08 Ecoico

Permanece fora dos milestones lineares.

Motivo: a planilha trata Ecoico como subteste separado, não como domínio linear dentro da grade principal de marcos.

**Patch PDF Ecoico (commit `3d21fda`):** `PDFReportV3.jsx` passou a renderizar uma seção "Subteste Ecoico" (resumo interpretativo, pontuação total, marco estimado e recomendação) **apenas quando `session.ecoico_summary` existir**. Sem `ecoico_summary`, nada aparece no PDF.

O patch é puramente aditivo / de exibição:

- não reativou o subteste Ecoico — o gatilho continua desativado no fluxo principal;
- não alterou cálculo, PEI, milestones nem lógica clínica;
- leu apenas `session.ecoico_summary`, com fallbacks seguros para campos ausentes;
- build validado após o patch.

### DOM09 Vocal

Foi implementado como domínio linear de Nível 1.

Motivo: a planilha contém 5 itens de Comportamento Vocal Espontâneo na aba `AV MILESTONES`, incluídos no total do Nível 1.

### Task Analysis para DOM09

Não foi criada.

Motivo: a aba `AV TAREFAS` não contém seção de tarefas para Vocal. O app usa fallback seguro quando não há task analysis real.

### Limpeza técnica — `src/data/transicao.js`

Removido o arquivo órfão `src/data/transicao.js` (não importado em `src/`), que duplicava a estrutura da Transição e mantinha `calculateAutoItems` com a lógica antiga (pré-Patch 10C), divergente das faixas oficiais hoje vigentes em `src/hooks/useTransicaoLogic.js`. Sem impacto em runtime; build validado.

## Smoke test VB-MAPP/PEI — bugs reais e fixes finais

O smoke test do fluxo VB-MAPP/PEI revelou **bugs reais** em três frentes — PEI, geração de PDF e persistência local —, todos corrigidos nos commits `b3c2955` … `9735674` (ver "Smoke test VB-MAPP/PEI e fixes finais" na seção de commits). Resumo do que foi encontrado e resolvido:

1. **Validação final do PEI** corrigida (`b3c2955`).
2. **Persistência localStorage protegida** contra overwrite antes da hidratação — o estado persistido podia ser sobrescrito antes da hidratação completa, com risco de perda de dados (`61599e0`).
3. **Status do PEI no relatório** — o relatório agora mostra o status do PEI (`5a7d921`).
4. **PDF branco corrigido** — saída em branco resolvida ao normalizar `allSessions` (`a7f5a3f`).
5. **PDF do PEI Completo lê dados do wizard** — passou a ler `studioCaso` e `orientations` efetivamente salvos pelo wizard (`bbf341c`).
6. **Exclusão de objetivos no wizard PEI** agora persiste corretamente (`e10819e`).
7. **Acabamento visual dos relatórios** — rótulos da seção de Transição humanizados, tipos de métrica do PEI exibidos por extenso e plural automático corrigido (`9735674`). Mudança somente de exibição, sem tocar cálculo, schema, persistência ou lógica clínica.

**Estado atual:** código crítico estabilizado; o build passou em todos os patches; o `git status` estava limpo antes desta documentação.

## Pendências ainda abertas

1. Validar manualmente o fluxo completo:
   - paciente fictício → Marcos → Barreiras → Transição → Lacunas → PEI → PDF.

2. Transição:
   - itens automáticos 1, 2, 3 e 5 corrigidos por faixas oficiais (Patch 10C, commit `6276dab`).
   - PDF conectado: `session.transicao` aninhado criado em `SessionController`; filtros de chave corrigidos em `PDFReportV3` (commit `ebe9272`).
   - pendente: smoke test manual completo; sessões antigas sem `session.transicao` precisam de re-finalização para exibir no PDF.

3. Ecoico:
   - planilha possui 100 estímulos fixos;
   - app ainda não implementa todos e o gatilho continua desativado no fluxo principal;
   - PDF: `PDFReportV3.jsx` já renderiza a seção "Subteste Ecoico" quando `session.ecoico_summary` existir (commit `3d21fda`); sem `ecoico_summary`, nada aparece no PDF;
   - pendente: smoke test manual completo (ver pendência 1); decisão futura sobre reativar ou não o Ecoico no fluxo.

### Pendências futuras não críticas

- Banco real / backend, caso o produto vá além do protótipo local atual.
- Rascunho do PEI com persistência explícita e feedback ao usuário.
- Decisão futura sobre reativar ou não o Ecoico.
- Revisão final de UX e dos textos clínicos.
- Smoke final de homologação com caso realista.

## Veredito atual

VB-MAPP está alinhado com a planilha XLSX base em estrutura principal de marcos: 160/160.

Após o smoke test VB-MAPP/PEI e os fixes finais (`b3c2955` … `9735674`), o código crítico está **tecnicamente estabilizado** — validação do PEI, persistência local e geração de PDF corrigidas, com build passando em todos os patches.

Está pronto para um **novo smoke / homologação manual** com paciente fictício.

**Não está homologado clinicamente.** Não deve ser tratado como homologado para uso clínico real sem o smoke final de homologação com caso realista e as decisões clínicas pendentes acima.
