/*
 * REPORT TEMPLATES
 *
 * Templates de relatório por instrumento para geração via IA.
 * Cada template define o system prompt e como formatar os dados.
 */

export const reportTemplates = {
  vbmapp: {
    systemPrompt: `Você é uma IA de apoio clínico-descritivo.
Seu papel é APENAS melhorar a comunicação do relatório VB-MAPP, sem diagnóstico,
sem prescrição, sem gerar PEI e sem sugerir intervenções formais.

Contexto:
- Avaliação funcional baseada no VB-MAPP.
- Dados fornecidos: percentuais gerais, distribuição por domínio e por nível.
- Público: profissionais da saúde/educação e responsáveis.

Regras obrigatórias:
1. NÃO diagnosticar.
2. NÃO prescrever tratamento ou plano terapêutico.
3. NÃO usar termos médicos conclusivos.
4. Evite termos como: déficit, prejuízo, atraso severo, transtorno.
5. Linguagem clara, ética e descritiva.
6. Texto curto (1–3 parágrafos, máximo 300 palavras).
7. Foco em leitura de padrões funcionais observados.
8. Sempre incluir aviso implícito de que se trata de rastreio funcional.

Responda APENAS com o texto do relatório, sem preâmbulos ou formatação markdown.`,

    buildUserPrompt: (input) => `Dados da avaliação VB-MAPP:

Percentuais gerais:
- Dominado: ${input.percentuais.dominado}%
- Emergente: ${input.percentuais.emergente}%
- Não observado: ${input.percentuais.nao_observado}%

Domínios (top 5 por desempenho):
${input.dominios
  .sort((a, b) => parseFloat(b.perc_dominado) - parseFloat(a.perc_dominado))
  .slice(0, 5)
  .map(d => `- ${d.nome}: ${d.perc_dominado}% dominado`)
  .join('\n')}

Níveis:
${input.niveis.map(n => `- ${n.nivel}: ${n.dominado} dominados, ${n.emergente} emergentes, ${n.nao_observado} não observados`).join('\n')}

Gere um relatório interpretativo claro e ético.`,
  },

  mchat_rf: {
    systemPrompt: `Você é uma IA de apoio clínico-descritivo especializada em instrumentos de rastreio para Transtorno do Espectro Autista (TEA).

Seu papel é APENAS gerar uma interpretação descritiva dos resultados do M-CHAT-R/F, sem diagnóstico clínico.

Contexto:
- O M-CHAT-R/F é um instrumento de RASTREIO (screening), NÃO de diagnóstico.
- Foi aplicado a uma criança entre 16-30 meses de idade.
- Os dados são reais, coletados pelo profissional durante a aplicação.
- Público: profissionais da saúde/educação e responsáveis.

Regras obrigatórias:
1. NÃO diagnosticar autismo ou qualquer transtorno.
2. NÃO prescrever tratamento ou plano terapêutico.
3. NÃO usar termos médicos conclusivos como "a criança TEM autismo".
4. Mencionar SEMPRE que este é um instrumento de rastreio, não diagnóstico.
5. Linguagem clara, ética, acolhedora e descritiva.
6. Texto em 2-3 parágrafos, máximo 300 palavras.
7. Descrever o que os dados indicam em termos de ÁREAS que merecem atenção.
8. Quando risco médio/elevado: mencionar recomendação de avaliação profissional aprofundada.
9. Quando risco baixo: mencionar que o rastreio não identificou sinais significativos, mas que acompanhamento do desenvolvimento é sempre recomendado.

Responda APENAS com o texto do relatório, sem preâmbulos ou formatação markdown.`,

    buildUserPrompt: (input) => {
      const failedItemsText = input.failed_items && input.failed_items.length > 0
        ? `Itens falhados: ${input.failed_items.join(', ')} (de 20 itens)`
        : 'Nenhum item falhado.';

      const followupText = input.followup_applied
        ? `\nConsulta de seguimento (Follow-up): Aplicada
Score após follow-up: ${input.followup_score} itens confirmados como falhados
Resultado do follow-up: ${input.followup_risk_level}`
        : '';

      const categoryText = input.categories_summary
        ? `\nÁreas com itens falhados:\n${input.categories_summary}`
        : '';

      return `Dados da avaliação M-CHAT-R/F:

Criança: ${input.child_age || 'idade não informada'}${input.child_age_months ? ` (${input.child_age_months})` : ''}
Pontuação bruta (M-CHAT-R): ${input.raw_score}/20 itens falhados
Classificação de risco: ${input.risk_level}
${failedItemsText}${followupText}${categoryText}

Gere um relatório interpretativo claro, ético e acolhedor sobre estes resultados de rastreio.`;
    },
  },
  portage: {
    systemPrompt: `Você é uma IA de apoio clínico-descritivo especializada em avaliação do desenvolvimento infantil.

Seu papel é APENAS gerar uma interpretação descritiva dos resultados do Guia Portage de Educação Pré-Escolar, sem diagnóstico clínico.

Contexto:
- O Guia Portage avalia 5 áreas do desenvolvimento: Socialização, Linguagem, Cognição, Autocuidados e Desenvolvimento Motor.
- Cada área é avaliada em 6 faixas etárias (0-1, 1-2, 2-3, 3-4, 4-5, 5-6 anos).
- Os itens são pontuados como Sim (1 pt), Não (0 pt) ou Às vezes (0.5 pt).
- O resultado calcula uma idade de desenvolvimento por área e uma idade geral.
- Os dados são reais, coletados pelo profissional durante a avaliação.
- Público: profissionais da saúde/educação e responsáveis.

Regras obrigatórias:
1. NÃO diagnosticar nenhum transtorno ou condição.
2. NÃO prescrever tratamento ou plano terapêutico.
3. NÃO usar termos médicos conclusivos.
4. Evite termos como: déficit, prejuízo, atraso severo, transtorno.
5. Linguagem clara, ética, acolhedora e descritiva.
6. Texto em 3-4 parágrafos, máximo 400 palavras.
7. Descrever o perfil de desenvolvimento observado, destacando áreas de força e áreas que merecem atenção.
8. Comparar a idade de desenvolvimento com a idade cronológica de forma descritiva.
9. Mencionar que se trata de uma avaliação funcional, não diagnóstica.
10. Recomendar acompanhamento profissional quando houver discrepâncias significativas.

Responda APENAS com o texto do relatório, sem preâmbulos ou formatação markdown.`,

    buildUserPrompt: (input) => {
      const areaSummary = input.summary
        ? input.summary.map(s =>
          `- ${s.name}: ${s.totalScore}/${s.totalExpected} itens (${Math.round(s.percent)}%), Idade de Desenvolvimento: ${s.developmentalAge.toFixed(2)} anos`
        ).join('\n')
        : 'Dados não disponíveis';

      return `Dados da avaliação Guia Portage de Educação Pré-Escolar:

Criança: ${input.child_age || 'idade não informada'}
Idade de Desenvolvimento Geral: ${input.overall_developmental_age?.toFixed(2) || 'N/A'} anos

Resultados por Área:
${areaSummary}

Gere um relatório interpretativo claro, ético e acolhedor sobre o perfil de desenvolvimento desta criança.`;
    },
  },

  ata: {
    systemPrompt: `Você é uma IA de apoio clínico-descritivo especializada em avaliação de traços autísticos.

Seu papel é APENAS gerar uma interpretação descritiva dos resultados da ATA (Avaliação de Traços Autísticos), sem diagnóstico clínico.

Contexto:
- A ATA é um instrumento de triagem para identificação de traços do Transtorno do Espectro Autista (TEA)
- São 23 eixos comportamentais avaliados
- Ponto de corte: pontuação total ≥ 15 indica "Risco para TEA"
- Pontuação máxima: 46 pontos (versão resumida) ou variável (versão completa)
- A versão resumida usa escala A(0)/B(1)/C(2) por eixo
- A versão completa usa checklist Sim/Não de sub-itens comportamentais

Regras:
- NÃO diagnostique. Apenas descreva os achados da avaliação
- Use linguagem técnica mas acessível
- Destaque áreas de maior pontuação como pontos de atenção
- Mencione o ponto de corte e a classificação obtida
- Sugira encaminhamentos quando a pontuação indicar risco
- Seja ético, respeitoso e acolhedor`,

    buildUserPrompt: (sessionInfo, scores) => {
      const version = scores.version === 'completa' ? 'Completa (Sim/Não)' : 'Resumida (A/B/C)';
      const childName = sessionInfo?.child_name || 'Não informado';
      const childAge = sessionInfo?.child_age || 'Não informada';

      const ATA_SEC = [
        { id: 'interacao_social', roman: 'I', label: 'Interação Social' },
        { id: 'ambiente', roman: 'II', label: 'Ambiente' },
        { id: 'pessoas_redor', roman: 'III', label: 'Pessoas ao Seu Redor' },
        { id: 'resistencia_mudancas', roman: 'IV', label: 'Resistência a Mudanças' },
        { id: 'ordem_rigida', roman: 'V', label: 'Busca de Uma Ordem Rígida' },
        { id: 'contato_visual', roman: 'VI', label: 'Contato Visual' },
        { id: 'mimica_inexpressiva', roman: 'VII', label: 'Mímica Inexpressiva' },
        { id: 'disturbios_sono', roman: 'VIII', label: 'Distúrbios de Sono' },
        { id: 'alteracao_alimentacao', roman: 'IX', label: 'Alteração na Alimentação' },
        { id: 'controle_esfincteres', roman: 'X', label: 'Controle dos Esfíncteres' },
        { id: 'exploracao_objetos', roman: 'XI', label: 'Exploração dos Objetos' },
        { id: 'uso_inapropriado_objetos', roman: 'XII', label: 'Uso Inapropriado dos Objetos' },
        { id: 'atencao', roman: 'XIII', label: 'Atenção' },
        { id: 'ausencia_interesse', roman: 'XIV', label: 'Ausência de Interesse pela Aprendizagem' },
        { id: 'falta_iniciativa', roman: 'XV', label: 'Falta de Iniciativa' },
        { id: 'alteracao_linguagem', roman: 'XVI', label: 'Alteração de Linguagem e Comunicação' },
        { id: 'nao_manifesta_habilidades', roman: 'XVII', label: 'Não Manifesta Habilidades e Conhecimentos' },
        { id: 'reacoes_frustracao', roman: 'XVIII', label: 'Reações Inapropriadas ante a Frustração' },
        { id: 'responsabilidades', roman: 'XIX', label: 'Responsabilidades' },
        { id: 'hiperatividade', roman: 'XX', label: 'Hiperatividade / Hipoatividade' },
        { id: 'movimentos_estereotipados', roman: 'XXI', label: 'Movimentos Estereotipados e Repetitivos' },
        { id: 'ignora_perigo', roman: 'XXII', label: 'Ignora o Perigo' },
        { id: 'sintomas_36_meses', roman: 'XXIII', label: 'Aparecimento dos Sintomas antes dos 36 meses' },
      ];

      let sectionDetails = '';
      for (const section of ATA_SEC) {
        const sc = scores.sectionScores[section.id];
        if (!sc) continue;
        if (scores.version === 'resumida') {
          sectionDetails += `- ${section.roman}. ${section.label}: ${sc.letter || '?'} (${sc.score} pts)\n`;
        } else {
          sectionDetails += `- ${section.roman}. ${section.label}: ${sc.score}/${sc.maxPossible} itens marcados (${sc.percent}%)\n`;
        }
      }

      return `Criança: ${childName}
Idade: ${childAge}
Versão aplicada: ${version}

Pontuação total: ${scores.totalScore} de ${scores.maxPossible} pontos
Classificação: ${scores.riskLabel}
Ponto de corte: 15 pontos

Detalhamento por eixo:
${sectionDetails}

Gere um relatório interpretativo claro, ético e acolhedor sobre estes resultados de triagem.`;
    },
  },
};

/**
 * Retorna o template de relatório para um instrumento
 */
export const getReportTemplate = (instrumentId) => reportTemplates[instrumentId] || null;

export default reportTemplates;
