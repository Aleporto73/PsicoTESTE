# PsicoTESTE — Notas de Sessão

**Data:** 03/03/2026
**Autor:** Claude + Alexandre

---

## DIRETRIZ DE DESIGN — PRINCÍPIO FUNDAMENTAL

> **"Somos um sistema muito mais inteligente que uma planilha."**
> — Alexandre, 03/03/2026

A planilha Excel é apenas a BASE de dados validada. O PsicoTESTE deve SUPERAR a planilha em todos os sentidos:

### Público-alvo: profissionais 50+
- Interface clara, botões grandes, feedback visual imediato
- Sem jargão técnico desnecessário — linguagem acessível
- Fluxo guiado passo a passo (não pode se perder)
- Fontes legíveis, contraste alto, áreas de toque generosas

### O que a planilha NÃO faz e nós FAZEMOS:
- Interpretação automática dos resultados (não só números, mas o que significam)
- Alertas visuais para domínios críticos (vermelho/amarelo/verde)
- Sugestões inteligentes baseadas nos dados (quais áreas priorizar)
- Gráficos comparativos entre avaliações com destaque de evolução
- Relatórios narrativos gerados por IA com linguagem clínica
- UX responsiva (funciona no tablet durante sessão)
- Validação em tempo real (não deixa erros passarem)
- Salvamento automático (nunca perde dados)

### Regra de ouro:
Cada tela deve responder: **"O que eu faço agora?"** — sem ambiguidade.
O profissional não deve precisar pensar em como usar a ferramenta, apenas no paciente.

---

## Estrutura do Projeto

- App React + Vite com Tailwind CSS
- Arquitetura modular: registry → screen → hook → data
- SessionContext gerencia estado global (sessões, instrumentos, navegação)
- SessionController.jsx é o roteador principal de telas
- Chart.js e jsPDF carregados via CDN (não npm)

### Instrumentos
1. **VB-MAPP** — instrumento complexo (Milestones, Ecoico, Subtestes, Barreiras, Transição, PEI)
2. **M-CHAT-R/F** — rastreio TEA, 20 perguntas
3. **ATA** — traços autísticos, 23 eixos
4. **ABLLS-R** — 25 domínios, 543 itens, 1485 pts máximos ✅ COMPLETO
5. **ABC/ICA** — 57 itens binários, 5 subescalas, 159 pts máximos ✅ COMPLETO
6. **CARS-2** — 15 itens, escala 1-4 (com meios), T-Escore/Percentil ✅ COMPLETO

7. **MDF-BR** — Matriz de Desenvolvimento Funcional Brasileira v1.0 ✅ COMPLETO
   - 60 itens, 5 domínios, 12 checkpoints (0–72m)
   - Motor paramétrico com pesos por faixa (W_EARLY, W_1836, W_48, W_6072)
   - IFG, red flags (HARD/SOFT/NONE), inconclusivo (>=2 NULL), snapshot imutável

8. **IDF-BR** — Inventário de Desenvolvimento Funcional Brasileiro v0.1 (PARCIAL) ✅ IMPLEMENTADO
   - 40 itens base + 80 mapeamentos de intervenção
   - 5 domínios: LIN, SOC, COG, MOT, AVD (diferentes do MDF-BR!)
   - 5 faixas: F1(0-12m), F2(12-24m), F4(36-48m), F5(48-60m), F6(60-72m)
   - Scoring: S=1.0, P=0.5, N=0.0, NA=null (NA NUNCA zero)
   - Plano de intervenção automático para N e P
   - Separado do MDF-BR — lógica própria

### Instrumentos REMOVIDOS (não autorizados — 20/03/2026)
- ~~Guia Portage~~ — removido do registry e SessionController
- ~~Denver II~~ — removido do registry e SessionController
- Arquivos mantidos em src/ para referência, mas desconectados do app

### Padrão de inclusão de instrumentos
1. `src/registry/instrumentRegistry.js` — registrar metadata
2. `src/SessionController.jsx` — import + bloco if
3. Criar: `src/data/instruments/[nome].js` + `src/hooks/use[Nome]Logic.js` + `src/components/screens/[Nome]Screen.jsx`

---

## ABLLS-R — Status Completo (Fases 1-5)

### Fase 1 — Dados e Estrutura ✅
- `src/data/instruments/ablls_r.js` (974 linhas) — 25 domínios, 543 itens
- `src/hooks/useABLLSRLogic.js` — navegação, progresso, cálculo
- `src/components/screens/ABLLSRScreen.jsx` — 2 estágios (Aplicação → Resultados)
- Registry + rota SessionController

### Fase 2 — UX Inteligente + Gráficos ✅
- Botões 44px, fontes grandes, cores por nível de desempenho
- Interpretação automática (críticos/em desenvolvimento/fortes)
- ABLLSRRadarChart (25 domínios) + ABLLSRGroupBars (5 áreas)
- Charts empilhados verticalmente (não lado a lado)

### Fase 3 — Relatório PDF ✅
- `src/components/reports/ABLLSRPDFReport.jsx`
- jsPDF via CDN (`window.jspdf`)
- Capa + 4 cards resumo + radar pentagonal + barras por área
- Análise (Críticos/Em Desenvolvimento/Fortes em 2 colunas + Recomendações)
- Detalhamento por Área (tabelas)
- Rodapé com paginação
- Todas acentuações corretas via Unicode escapes (\u00e7, \u00e3, etc.)
- ≥ substituído por >= (incompatível com Helvetica do jsPDF)

### Fase 4 — Suporte Longitudinal (AV1-AV4) ✅
- `getInstrumentHistory` no SessionContext — busca cross-session
- `src/components/screens/ABLLSRLongitudinal.jsx` — comparativo
  - Cards resumo (primeira AV, última AV, delta)
  - Gráfico de linha temporal por área (Chart.js)
  - Tabela domínio a domínio com tendência (↗ Melhora / → Estável / ↘ Regressão)
- Botão "Evolução" no InstrumentDashboard
- Rota `ablls_r_longitudinal` no SessionController

### Fase 5 — Polish ✅
- **Null checks**: jsPDF carregamento, Chart.js fallback visual, divisão por zero
- **Ortografia**: "Permitirque" → "Permitir que", "Observara" → "Observar a"
- **Console.logs**: debug do SessionController comentado
- **UX 50+**: botões score 44px, gap 8px, fontes tabela 0.9rem, contraste melhorado (#64748b → #475569)
- **Inconsistências**: getGroupProgress agora retorna `complete` field, protegido contra arrays vazios
- **PDF**: fallback visual quando radar falha, validação de window.jspdf
- **Datas**: validação try/catch no Longitudinal para datas inválidas

---

## Arquivos ABLLS-R

| Arquivo | Tipo |
|---------|------|
| `src/data/instruments/ablls_r.js` | Dados (25 domínios, 543 itens) |
| `src/hooks/useABLLSRLogic.js` | Hook de lógica |
| `src/components/screens/ABLLSRScreen.jsx` | Tela principal |
| `src/components/charts/ABLLSRChart.jsx` | Gráficos (Radar + Barras) |
| `src/components/reports/ABLLSRPDFReport.jsx` | Gerador PDF |
| `src/components/screens/ABLLSRLongitudinal.jsx` | Comparativo AV1-AV4 |
| `src/components/screens/InstrumentDashboard.jsx` | Dashboard (editado) |
| `src/context/SessionContext.jsx` | Context (editado - getInstrumentHistory) |
| `src/SessionController.jsx` | Roteador (editado) |
| `src/registry/instrumentRegistry.js` | Registry (editado) |

---

## ABC/ICA — Status

### Fase 1 — Dados, Hook, Tela e Integração ✅
- `src/data/instruments/abc_ica.js` — 57 itens, pesos, 5 subescalas, classificação, funções de cálculo
- `src/hooks/useABCICALogic.js` — navegação por subescala, progresso, respostas, cálculo
- `src/components/screens/ABCICAScreen.jsx` — 2 estágios (Aplicação → Resultados)
  - Aplicação: subescala por subescala, botões SIM/NÃO, "Todos SIM/NÃO"
  - Resultados: card classificação, cards por subescala, gráfico barras, tabela detalhada
- Registry + rota SessionController
- Build limpo ✅

### Estrutura do instrumento
- 57 itens com resposta binária (SIM = peso, NÃO = 0)
- Pesos fixos por item (1-4 pontos)
- 5 subescalas: ES (Sensorial), RE (Relacionamento), CO (Corpo/Objetos), LG (Linguagem), PS (Pessoal/Social)
- Classificação: 0-46 sem sinais, 47-53 duvidoso, 54-67 moderado, 68+ autismo
- Dados extraídos das fórmulas SUM e VLOOKUP do Excel original

### Fase 2 — Gráficos + Relatório PDF ✅
- `src/components/charts/ABCICAChart.jsx` — Radar pentagonal + barras horizontais (Chart.js via CDN)
- `src/components/reports/ABCICAPDFReport.jsx` — PDF completo com jsPDF:
  - Capa rose (cor #e11d48) + identificação + 3 cards resumo
  - Classificação global com faixas de referência coloridas
  - Mini radar pentagonal (5 subescalas) + barras de progresso
  - Detalhamento por subescala (tabela item a item com SIM/NÃO/peso/pts)
  - Interpretação e orientações clínicas
  - Rodapé com paginação
- Tela de resultados integrada: radar + barras + tabela + botão "Baixar PDF"
- Build limpo ✅

### Status: ✅ COMPLETO
- Instrumento de aplicação única (rastreio comportamental, não longitudinal)
- Ref: Krug, Arick & Almond (1980); Tradução: Marteleto & Pedromônico (2005)

### Arquivos ABC/ICA

| Arquivo | Tipo |
|---------|------|
| `src/data/instruments/abc_ica.js` | Dados (57 itens, 5 subescalas) |
| `src/hooks/useABCICALogic.js` | Hook de lógica |
| `src/components/screens/ABCICAScreen.jsx` | Tela principal |
| `src/components/charts/ABCICAChart.jsx` | Gráficos (Radar + Barras) |
| `src/components/reports/ABCICAPDFReport.jsx` | Gerador PDF |
| `src/SessionController.jsx` | Roteador (editado) |
| `src/registry/instrumentRegistry.js` | Registry (editado) |

---

## CARS-2 — Status

### Fase 1 — Dados, Hook, Tela, Gráficos, PDF e Integração ✅
- `src/data/instruments/cars2.js` — 15 itens, tabela T-Escore/Percentil completa (120 entradas), 3 classificações
- `src/hooks/useCARS2Logic.js` — progresso, respostas (escala 1-4 com meios), cálculo
- `src/components/screens/CARS2Screen.jsx` — 2 estágios (Aplicação → Resultados)
  - Aplicação: 15 itens em lista única, 7 botões de score por item (1, 1.5, 2, 2.5, 3, 3.5, 4)
  - Resultados: classificação, T-Escore, Percentil, cards áreas críticas/atenção/adequadas, radar, barras, tabela
- `src/components/charts/CARS2Chart.jsx` — Radar 15 itens + barras horizontais (Chart.js via CDN)
- `src/components/reports/CARS2PDFReport.jsx` — PDF completo com jsPDF:
  - Capa violet (#7c3aed) + identificação + 4 cards resumo (Escore, T-Escore, Percentil, Respondidos)
  - Classificação global com faixas de referência coloridas
  - Mini radar 15 itens + barras de progresso por item
  - Detalhamento por item (tabela com nota e gravidade)
  - Áreas críticas + Interpretação e orientações clínicas
  - Rodapé com paginação
- Registry + rota SessionController
- Build limpo ✅

### Correções pós-implementação ✅
- **Unicode**: todos os textos convertidos de escapes `\u00e7` para UTF-8 direto (ç, ã, é)
- **Layout 50+**: opções de score redesenhadas — formato vertical com texto descritivo completo por opção (não só números). Sem necessidade de decorar escala.
- **Chart.js CDN**: adicionado no index.html (faltava, causava "Gráfico indisponível")
- **ABC/ICA**: label "Criança considerada com autismo" → "Alta probabilidade de TEA"

### Status: ✅ COMPLETO
- Instrumento de aplicação única (observação comportamental, não longitudinal)
- Ref: Schopler, Van Bourgondien, Wellman & Love (2010)

### Arquivos CARS-2

| Arquivo | Tipo |
|---------|------|
| `src/data/instruments/cars2.js` | Dados (15 itens, tabela normativa) |
| `src/hooks/useCARS2Logic.js` | Hook de lógica |
| `src/components/screens/CARS2Screen.jsx` | Tela principal |
| `src/components/charts/CARS2Chart.jsx` | Gráficos (Radar + Barras) |
| `src/components/reports/CARS2PDFReport.jsx` | Gerador PDF |
| `src/SessionController.jsx` | Roteador (editado) |
| `src/registry/instrumentRegistry.js` | Registry (editado) |

---

## Denver II — Status

### Fase 1 — Dados, Hook, Tela, Gráficos, PDF e Integração ✅
- `src/data/instruments/denver_ii.js` — 4 domínios, 105 itens, escores + interpretações
  - Pessoal-Social: 25 itens
  - Motor Fino-Adaptativo: 25 itens
  - Linguagem: 28 itens
  - Motor Grosso: 27 itens
- `src/hooks/useDenverIILogic.js` — respostas (score + interpretação), progresso, navegação por domínio
- `src/components/screens/DenverIIScreen.jsx` — 2 estágios (Aplicação → Resultados)
  - Aplicação: navegação por domínio (tabs), cada item com botões Escore (Passou/Falhou/Recusou/S.O) + Interpretação (Normal/Avançado/Cautela/Atraso/N.A)
  - Resultados: classificação global (Normal/Suspeito/Não Testável), cards resumo, resumo por domínio, gráficos, tabela detalhada
- `src/components/charts/DenverIIChart.jsx` — Radar 4 domínios (% Normal+Avançado) + barras empilhadas (Chart.js via CDN)
- `src/components/reports/DenverIIPDFReport.jsx` — PDF completo com jsPDF:
  - Capa emerald (#059669) + identificação + classificação global
  - 4 cards resumo + resumo por domínio
  - Mini radar 4 domínios + barras por interpretação
  - Detalhamento completo item a item (1 página por domínio)
  - Interpretação e orientações clínicas
  - Rodapé com paginação
- Registry + rota SessionController
- Build limpo ✅

### Estrutura do instrumento
- 4 domínios, 105 itens total
- Score por item: Passou, Falhou, Recusou, S.O (Sem Oportunidade)
- Interpretação por item: Normal, Avançado, Cautela, Atraso, N.A (Não Aplicável)
- Classificação global:
  - Normal: nenhum Atraso e no máximo 1 Cautela
  - Suspeito: 2+ Cautelas e/ou 1+ Atrasos
  - Não Testável: recusa em itens com linha da idade à esquerda
- Cor accent: #059669 (emerald)

### Status: ✅ COMPLETO
- Instrumento de aplicação única (triagem do desenvolvimento, não longitudinal)
- Ref: Frankenburg, W.K. et al. (1992). Pediatrics, 89(1), 91-97.

### Arquivos Denver II

| Arquivo | Tipo |
|---------|------|
| `src/data/instruments/denver_ii.js` | Dados (4 domínios, 105 itens) |
| `src/hooks/useDenverIILogic.js` | Hook de lógica |
| `src/components/screens/DenverIIScreen.jsx` | Tela principal |
| `src/components/charts/DenverIIChart.jsx` | Gráficos (Radar + Barras Empilhadas) |
| `src/components/reports/DenverIIPDFReport.jsx` | Gerador PDF |
| `src/SessionController.jsx` | Roteador (editado) |
| `src/registry/instrumentRegistry.js` | Registry (editado) |

---

## MDF-BR — Status

### Fase 1 — Dados, Engine, Tela e Integração ✅
- `src/data/instruments/mdf_br.js` — 60 itens seed, 5 domínios, 12 checkpoints, pesos, red flags
- `src/hooks/useMDFBRLogic.js` — motor paramétrico v1.0 (IFG, inconclusivo, HARD/SOFT flags, snapshot)
- `src/components/screens/MDFBRScreen.jsx` — 3 estágios (Checkpoint → Aplicação → Resultado)
  - Checkpoint: grid visual com 12 faixas etárias, sugestão automática pela idade
  - Aplicação: 5 itens por faixa com score 0–3 + NULL, descritores expandíveis, cores por domínio
  - Resultado: IFG card, status de risco, scores por domínio com barras, red flags, itens zerados
- Registry + rota SessionController
- Engine validado com caso de referência (API example: 24m, COM=0 → IFG=71.43, ALTO_RISCO via HARD flag)
- Build limpo ✅

### Especificação congelada (NÃO alterar sem autorização)
- 5 domínios fixos: COM, SOC, COG, MOT, REGAVD
- 60 itens totais (1 por domínio por checkpoint)
- Input: 0, 1, 2, 3, NULL (NÃO binário)
- NULL sai de numerador E denominador
- Inconclusivo: >= 2 NULL na avaliação
- Red flags: HARD → mín ALTO_RISCO, SOFT → sobe 1 nível
- Pesos: W_EARLY(all 1), W_1836(COM/SOC=2), W_48(COG=2), W_6072(COG/REGAVD=2)
- engine_version = "v1.0"

### Arquivos MDF-BR

| Arquivo | Tipo |
|---------|------|
| `src/data/instruments/mdf_br.js` | Dados (60 itens, 5 domínios, pesos) |
| `src/hooks/useMDFBRLogic.js` | Motor paramétrico + hook |
| `src/components/screens/MDFBRScreen.jsx` | Tela principal (3 estágios) |
| `src/SessionController.jsx` | Roteador (editado) |
| `src/registry/instrumentRegistry.js` | Registry (editado) |

### Pendente para futuro
- Relatório PDF (jsPDF)
- Gráficos (Chart.js radar/barras)
- Suporte longitudinal (comparativo entre faixas/avaliações)
- Integração Supabase (backend, auth, RLS)

---

## IDF-BR — Status

### Fase 1 — Dados, Engine, Tela e Integração ✅
- `src/data/instruments/idf_br.js` — 40 itens + 80 mapeamentos de intervenção, gerados de TSV seed oficial
- `src/hooks/useIDFBRLogic.js` — engine de scoring v0.1 (S/P/N/NA, domínios, intervenções)
- `src/components/screens/IDFBRScreen.jsx` — 3 estágios (Faixa → Aplicação → Resultado)
  - Faixa: grid com 5 faixas disponíveis (F3 ausente no v0.1), aviso de versão parcial
  - Aplicação: itens com botões S/P/N/NA, modo de coleta, rubricas expandíveis com cores
  - Resultado: % funcionalidade global, scores por domínio com barras, plano de intervenção expandível
- Registry + rota SessionController
- Engine validado com 3 casos: all-S (100%), mixed N/P/S/NA (correto), NA-not-zero (NA excluído do denominador)
- Build limpo ✅

### Especificação congelada v0.1 (NÃO alterar sem autorização)
- 5 domínios: LIN, SOC, COG, MOT, AVD (DIFERENTES do MDF-BR!)
- 40 itens parciais em 5 faixas: F1(0-12m, 5), F2(12-24m, 15), F4(36-48m, 5), F5(48-60m, 10), F6(60-72m, 5)
- F3 (24-36m) ausente — previsto para lotes futuros
- Scoring: S=1.0, P=0.5, N=0.0, NA=null
- NA NUNCA é tratado como zero — excluído de numerador E denominador
- Intervenções: 80 mapeamentos (N e P geram plano automático)
- Cada item possui: collection_mode, observation_context, 4 textos de score, bncc_codes, evidence_level
- Gerado de TSV seed — fidelidade exata ao pacote original

### Separação MDF-BR × IDF-BR
- Lógica 100% separada — nenhum import cruzado
- Domínios diferentes (MDF: COM/SOC/COG/MOT/REGAVD vs IDF: LIN/SOC/COG/MOT/AVD)
- Scoring diferente (MDF: 0-3+NULL vs IDF: S/P/N/NA)
- Engines diferentes (MDF: IFG paramétrico com pesos vs IDF: percentual simples)
- Cores diferentes (MDF: teal #0d9488 vs IDF: amber #b45309)

### Arquivos IDF-BR

| Arquivo | Tipo |
|---------|------|
| `src/data/instruments/idf_br.js` | Dados (40 itens, 80 intervenções) |
| `src/hooks/useIDFBRLogic.js` | Engine de scoring + hook |
| `src/components/screens/IDFBRScreen.jsx` | Tela principal (3 estágios) |
| `src/SessionController.jsx` | Roteador (editado) |
| `src/registry/instrumentRegistry.js` | Registry (editado) |

### ⚠️ REFATORAÇÃO PENDENTE — IDF-BR v0.1 será REFEITO (20/03/2026)
O seed atual (40 itens + 80 intervenções) contém 5 erros críticos identificados na revisão:
1. **Bands agrupadas demais** ("0-12m") — usar cortes exatos do CDC (ex: `12m`, `18m`)
2. **source_raw_text com paráfrase** — deve ser cópia bruta da fonte oficial (inglês CDC), não paráfrase. Tradução vai no `item_text_authored`
3. **score_NA_value como string vazia** (`""`) — deve ser `null` (sem aspas). String vazia crasha o denominador dinâmico
4. **Itens com "OU" juntando 2 habilidades** — um comportamento por item, sempre. Ambiguidade trava o avaliador
5. **Intervenções genéricas** — deve nomear protocolo ABA/PEI específico, não frases motivacionais

**Decisão**: Arquitetura do código (hook, engine, screen, registry) está sólida e será MANTIDA. Apenas o `idf_br.js` (seed de dados) será substituído quando o pacote corrigido estiver pronto. Template de referência para novos itens:
- `band_code`: corte exato CDC (ex: "12m")
- `source_raw_text`: texto bruto original da fonte
- `item_text_authored`: tradução/adaptação clínica
- `score_NA_value`: null (não string vazia)
- 1 comportamento por item (sem "OU")
- Intervenção com nome do protocolo real

### Pendente para futuro
- **PRIORITÁRIO**: Novo seed IDF-BR corrigido (Alê trará pronto e verificado)
- Relatório PDF (jsPDF)
- Gráficos (Chart.js radar/barras por domínio)
- Faixa F3 (24-36m) — aguardando lotes futuros
- Lotes adicionais de itens e intervenções
- Integração Supabase (backend, auth, RLS)

---

## Decisões Técnicas Importantes

- **jsPDF**: suporta acentos nativamente (ç, ã, é) — NÃO remover acentos. Usar Unicode escapes em strings hardcoded.
- **≥**: NÃO funciona no Helvetica do jsPDF. Usar `>=` como alternativa.
- **Chart.js**: carregado via CDN, usar `window.Chart`. Sempre verificar existência antes de usar.
- **Groups**: campo `domains` (array de IDs), NÃO `domain_ids`.
- **Vestimenta**: pertence ao grupo `autonomia_motor`, NÃO `academico`.
- **AV1-AV4**: sessões filtradas por child_name + instrument_id, ordenadas por data, max 4.
