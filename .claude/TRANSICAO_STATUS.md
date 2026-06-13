# PsicoTESTE — Status da Transição VB-MAPP

Data: 13/06/2026

## Estado

Patch 10C aplicado e build validado.

Commit: `6276dab` — `fix: alinha transicao automatica por faixas oficiais`

Arquivo alterado: `src/hooks/useTransicaoLogic.js`

## Veredito

TRANSIÇÃO CORRIGIDA POR FAIXAS OFICIAIS.

Os itens automáticos 1, 2, 3 e 5 foram reescritos para usar conversão por ranges 1–5 conforme o protocolo VB-MAPP Transição.

A lógica anterior (fórmula linear / percentual / divisão fixa) foi substituída por lookup de faixas exato.

## Itens automáticos — situação atual

| Item | Descrição | Status |
|------|-----------|--------|
| 1 | Pontuação total dos Marcos | Corrigido — lookup por total bruto (0-170) |
| 2 | Pontuação geral das Barreiras | Corrigido — lookup invertido (56-96=1 … 0-10=5) |
| 3 | Barreiras 1 + 2 | Corrigido — lookup invertido (6-7=1 … 0-1=5) |
| 4 | Habilidade de grupo / rotina | Intacto — bate os ranges principais |
| 5 | Comportamento social / brincar | Corrigido — `Math.floor(pontosSocial/2)`, DOM06 apenas |

## Decisões técnicas registradas

- Item 1 usa o total bruto de pontos dos marcos (dominado=1, emergente=0.5), não percentual.
- Item 5 usa exclusivamente DOM06 ("Comportamento Social E Brincar Social"). DOM05 ("Brincar Independente") não entra — já coberto pelo item manual 15.
- Barreiras (itens 2 e 3) permanecem invertidas: maior pontuação de barreira = score menor na Transição.
- `pontosBrincar` (DOM05) permanece acumulado no código mas não é usado — limpeza pode ser feita em patch separado.
- Nenhuma alteração em itens manuais 6–18.
- Nenhuma alteração em PDF, PEI ou `src/data/transicao.js`.

## Pendências abertas

- Validar fluxo completo manualmente (paciente fictício → Marcos → Barreiras → Transição → PDF).
- Revisar possível mismatch de schema da Transição no PDF.
- Decidir o que fazer com `src/data/transicao.js` (pode estar duplicado ou morto).
- Revisar Ecoico futuramente (escopo separado).
