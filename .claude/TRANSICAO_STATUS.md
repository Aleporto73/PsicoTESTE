# PsicoTESTE — Status da Transição VB-MAPP

Data: 13/06/2026

## Estado

A Transição foi auditada em modo READ-ONLY.

Nenhum arquivo de código foi alterado.
Nenhum patch de Transição foi aplicado.
Nenhum commit de Transição foi feito.

## Veredito

TRANSIÇÃO DIVERGENTE.

A planilha `AV TRANSIÇÃO` usa soma bruta/referência bruta nos itens automáticos 1 a 5.

O app, em `src/hooks/useTransicaoLogic.js`, usa normalização/inversão nos itens automáticos 1 a 5.

## Itens divergentes

1. Pontuação total dos Marcos
2. Pontuação geral das Barreiras
3. Barreiras 1 + 2
4. Habilidade de grupo / rotina
5. Comportamento social / brincar

## Decisão pendente

Ainda não foi decidido se o app deve:

A) espelhar literalmente a planilha com soma bruta;

ou

B) manter uma lógica interpretativa própria, documentada separadamente.

## Recomendação atual

Não aplicar patch de Transição até decisão explícita do Ale.

Antes de qualquer patch, revisar impacto em:

- sessões antigas;
- PDF;
- tela de Transição;
- interpretação clínica;
- `src/data/transicao.js`, que pode estar duplicado ou morto.

## Pendências abertas

- Decidir regra final da Transição.
- Revisar mismatch de schema da Transição no PDF.
- Decidir o que fazer com `src/data/transicao.js`.
- Fazer smoke test manual completo.
- Revisar Ecoico futuramente.
