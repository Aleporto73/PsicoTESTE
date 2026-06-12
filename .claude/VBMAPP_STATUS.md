# PsicoTESTE — VB-MAPP Status Técnico

Data: 12/06/2026  
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

## Commits relevantes

- `c93e878` — `fix: protege schema estrutural contra remigracao DOM`
- `61f6765` — `fix: adiciona marco DOM10-L3-M15 conforme planilha`
- `28d70f8` — `feat: adiciona DOM09 Vocal conforme planilha`

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

## Pendências antes de uso clínico real

1. Validar manualmente fluxo completo:
   - paciente fictício;
   - Marcos;
   - Barreiras;
   - Transição;
   - Lacunas;
   - PEI;
   - PDF.

2. Decidir regra de `emergente`:
   - planilha soma `0,5`;
   - app trata como lacuna e pode computar como 0 em alguns cálculos.

3. Revisar Transição:
   - planilha usa somas brutas em itens automáticos;
   - app usa normalização/inversão em alguns pontos.

4. Revisar limiar de barreiras no PEI:
   - planilha puxa barreiras 2–4;
   - app usa críticas >= 3.

5. Ecoico:
   - planilha possui 100 estímulos fixos;
   - app ainda não implementa todos os estímulos da planilha.

## Veredito atual

VB-MAPP está alinhado com a planilha XLSX base em estrutura principal de marcos: 160/160.

Está pronto para teste interno técnico com paciente fictício.

Ainda não deve ser tratado como homologado para uso clínico real sem validação manual e decisões clínicas pendentes.
