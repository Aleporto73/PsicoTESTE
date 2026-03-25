/*
 * M-CHAT-R/F — Modified Checklist for Autism in Toddlers
 * Versão Revisada com Consulta de Seguimento
 *
 * Referência: Robins, Fein, & Barton, 2009
 * Tradução: Losapio, Siquara, Lampreia, Lázaro, & Pondé
 *
 * Instrumento de rastreio para TEA em crianças de 16-30 meses.
 * NÃO é instrumento diagnóstico.
 */

export const MCHAT_RF_META = {
  instrument_id: 'mchat_rf',
  name: 'M-CHAT-R/F',
  version: '2.0',
  fullName: 'Checklist Modificado para Autismo em Crianças Pequenas: versão revisada e consulta de seguimento',
  description: 'Instrumento de rastreio para risco de TEA em crianças de 16 a 30 meses',
  reference: '© 2009 Robins, Fein, & Barton. Tradução: Losapio, Siquara, Lampreia, Lázaro, & Pondé',
  total_questions: 20,
  age_range: { min_months: 16, max_months: 30 },
};

/**
 * 20 perguntas do M-CHAT-R
 *
 * reverse_scored: true → "Sim" indica RISCO (itens 2, 5, 12)
 * reverse_scored: false → "Não" indica RISCO (demais itens)
 */
export const MCHAT_RF_QUESTIONS = [
  {
    number: 1,
    question: 'Se você apontar para algum objeto no quarto, o seu filho olha para este objeto?',
    example: 'POR EXEMPLO, se você apontar para um brinquedo ou animal, o seu filho olha para o brinquedo ou para o animal?',
    reverse_scored: false,
    category: 'atencao_compartilhada',
  },
  {
    number: 2,
    question: 'Alguma vez você se perguntou se o seu filho pode ser surdo?',
    example: null,
    reverse_scored: true, // SIM = risco
    category: 'resposta_social',
  },
  {
    number: 3,
    question: 'O seu filho brinca de faz de contas?',
    example: 'POR EXEMPLO, faz de conta que bebe em um copo vazio, faz de conta que fala ao telefone, faz de conta que dá comida a uma boneca ou a um bichinho de pelúcia?',
    reverse_scored: false,
    category: 'brincadeira',
  },
  {
    number: 4,
    question: 'O seu filho gosta de subir nas coisas?',
    example: 'POR EXEMPLO, móveis, brinquedos em parques ou escadas?',
    reverse_scored: false,
    category: 'comportamento_motor',
  },
  {
    number: 5,
    question: 'O seu filho faz movimentos estranhos com os dedos perto dos olhos?',
    example: 'POR EXEMPLO, mexe os dedos em frente aos olhos e fica olhando para os mesmos?',
    reverse_scored: true, // SIM = risco
    category: 'comportamento_repetitivo',
  },
  {
    number: 6,
    question: 'O seu filho aponta com o dedo para pedir algo ou para conseguir ajuda?',
    example: 'POR EXEMPLO, aponta para um biscoito ou brinquedo fora do alcance dele?',
    reverse_scored: false,
    category: 'comunicacao',
  },
  {
    number: 7,
    question: 'O seu filho aponta com o dedo para mostrar algo interessante para você?',
    example: 'POR EXEMPLO, aponta para um avião no céu ou um caminhão grande na rua?',
    reverse_scored: false,
    category: 'atencao_compartilhada',
  },
  {
    number: 8,
    question: 'O seu filho se interessa por outras crianças?',
    example: 'POR EXEMPLO, seu filho olha para outras crianças, sorri para elas ou se aproxima delas?',
    reverse_scored: false,
    category: 'interacao_social',
  },
  {
    number: 9,
    question: 'O seu filho traz coisas para mostrar para você ou as segura para que você as veja — não para conseguir ajuda, mas apenas para compartilhar?',
    example: 'POR EXEMPLO, para mostrar uma flor, um bichinho de pelúcia ou um caminhão de brinquedo?',
    reverse_scored: false,
    category: 'atencao_compartilhada',
  },
  {
    number: 10,
    question: 'O seu filho responde quando você o chama pelo nome?',
    example: 'POR EXEMPLO, ele olha para você, fala ou emite algum som, ou para o que está fazendo quando você o chama pelo nome?',
    reverse_scored: false,
    category: 'resposta_social',
  },
  {
    number: 11,
    question: 'Quando você sorri para o seu filho, ele sorri de volta para você?',
    example: null,
    reverse_scored: false,
    category: 'reciprocidade_social',
  },
  {
    number: 12,
    question: 'O seu filho fica muito incomodado com barulhos do dia a dia?',
    example: 'POR EXEMPLO, seu filho grita ou chora ao ouvir barulhos como os de liquidificador ou de música alta?',
    reverse_scored: true, // SIM = risco
    category: 'sensorial',
  },
  {
    number: 13,
    question: 'O seu filho anda?',
    example: null,
    reverse_scored: false,
    category: 'comportamento_motor',
  },
  {
    number: 14,
    question: 'O seu filho olha nos seus olhos quando você está falando ou brincando com ele/ela, ou vestindo a roupa dele/dela?',
    example: null,
    reverse_scored: false,
    category: 'contato_visual',
  },
  {
    number: 15,
    question: 'O seu filho tenta imitar o que você faz?',
    example: 'POR EXEMPLO, quando você dá tchau, ele repete o que você faz? bate palmas, ou joga um beijo?',
    reverse_scored: false,
    category: 'imitacao',
  },
  {
    number: 16,
    question: 'Quando você vira a cabeça para olhar para alguma coisa, o seu filho olha ao redor para ver o que você está olhando?',
    example: null,
    reverse_scored: false,
    category: 'atencao_compartilhada',
  },
  {
    number: 17,
    question: 'O seu filho tenta fazer você olhar para ele/ela?',
    example: 'POR EXEMPLO, o seu filho olha para você para ser elogiado/aplaudido, ou diz: "olha mãe!" ou "óh mamãe!"?',
    reverse_scored: false,
    category: 'atencao_compartilhada',
  },
  {
    number: 18,
    question: 'O seu filho compreende quando você pede para ele/ela fazer alguma coisa?',
    example: 'POR EXEMPLO, se você não apontar, o seu filho entende quando você pede: "coloca o copo na mesa" ou "liga a televisão"?',
    reverse_scored: false,
    category: 'compreensao',
  },
  {
    number: 19,
    question: 'Quando acontece algo novo, o seu filho olha para o seu rosto para ver como você se sente sobre o que aconteceu?',
    example: 'POR EXEMPLO, se ele/ela ouve um barulho estranho ou engraçado, ou vê um brinquedo novo, será que ele/ela olharia para seu rosto?',
    reverse_scored: false,
    category: 'referencia_social',
  },
  {
    number: 20,
    question: 'O seu filho gosta de atividades de movimento?',
    example: 'POR EXEMPLO, ser balançado ou pular em seus joelhos?',
    reverse_scored: false,
    category: 'comportamento_motor',
  },
];

/**
 * Categorias de itens do M-CHAT-R/F
 */
export const MCHAT_CATEGORIES = {
  atencao_compartilhada: { name: 'Atenção Compartilhada', items: [1, 7, 9, 16, 17] },
  resposta_social: { name: 'Resposta Social', items: [2, 10] },
  reciprocidade_social: { name: 'Reciprocidade Social', items: [11] },
  interacao_social: { name: 'Interação Social', items: [8] },
  comunicacao: { name: 'Comunicação', items: [6] },
  brincadeira: { name: 'Brincadeira Simbólica', items: [3] },
  imitacao: { name: 'Imitação', items: [15] },
  contato_visual: { name: 'Contato Visual', items: [14] },
  compreensao: { name: 'Compreensão', items: [18] },
  referencia_social: { name: 'Referência Social', items: [19] },
  comportamento_motor: { name: 'Comportamento Motor', items: [4, 13, 20] },
  comportamento_repetitivo: { name: 'Comportamento Repetitivo', items: [5] },
  sensorial: { name: 'Sensorial', items: [12] },
};

/**
 * Configuração de pontuação
 */
export const MCHAT_SCORING = {
  reverse_items: [2, 5, 12],
  risk_thresholds: {
    low: { min: 0, max: 2, label: 'Baixo Risco', color: '#10b981', description: 'Se a criança tem menos de 24 meses, reavaliar após o segundo aniversário.' },
    medium: { min: 3, max: 7, label: 'Risco Médio', color: '#f59e0b', description: 'Aplicar a consulta de seguimento (M-CHAT-R/F) para obter informações adicionais.' },
    high: { min: 8, max: 20, label: 'Risco Elevado', color: '#ef4444', description: 'Encaminhar imediatamente para avaliação diagnóstica e intervenção precoce.' },
  },
};

/**
 * Calcula o score do M-CHAT-R
 *
 * Regra: Para todos os itens, "NÃO" indica risco, EXCETO itens 2, 5 e 12 onde "SIM" indica risco.
 *
 * @param {object} responses - { q1: 'sim', q2: 'não', ... }
 * @returns {object} { raw_score, risk_level, risk_info, failed_items, passed_items, needs_followup }
 */
export const calculateMChatScore = (responses) => {
  let failedCount = 0;
  const failedItems = [];
  const passedItems = [];

  MCHAT_RF_QUESTIONS.forEach(q => {
    const response = responses[`q${q.number}`];
    if (!response) return;

    const isFailed = q.reverse_scored
      ? response === 'sim'    // Itens 2, 5, 12: SIM = falhou
      : response === 'não';   // Demais: NÃO = falhou

    if (isFailed) {
      failedCount++;
      failedItems.push(q.number);
    } else {
      passedItems.push(q.number);
    }
  });

  // Determinar nível de risco
  let riskKey = 'low';
  if (failedCount >= 8) riskKey = 'high';
  else if (failedCount >= 3) riskKey = 'medium';

  const riskInfo = MCHAT_SCORING.risk_thresholds[riskKey];

  return {
    raw_score: failedCount,
    risk_level: riskInfo.label,
    risk_key: riskKey,
    risk_color: riskInfo.color,
    risk_description: riskInfo.description,
    failed_items: failedItems,
    passed_items: passedItems,
    needs_followup: riskKey === 'medium',
    total_answered: Object.keys(responses).length,
  };
};

/**
 * Calcula score final após follow-up
 *
 * @param {object} initialScores - Score inicial do M-CHAT-R
 * @param {object} followupResults - { item_2: 'passed'|'failed', item_5: 'passed'|'failed', ... }
 * @returns {object} Score final atualizado
 */
export const calculateFollowUpScore = (initialScores, followupResults) => {
  if (!followupResults || Object.keys(followupResults).length === 0) {
    return initialScores;
  }

  // Itens que passaram no follow-up são removidos dos falhados
  const updatedFailedItems = initialScores.failed_items.filter(itemNum => {
    const followupKey = `item_${itemNum}`;
    if (followupResults[followupKey] === 'passed') {
      return false; // Remove do falhados
    }
    return true; // Mantém como falhado
  });

  const updatedScore = updatedFailedItems.length;

  let riskKey = 'low';
  if (updatedScore >= 2) riskKey = 'medium'; // No follow-up: ≥2 = positivo para triagem
  // Se score 0-1 após follow-up = triagem negativa

  const riskInfo = MCHAT_SCORING.risk_thresholds[riskKey] || MCHAT_SCORING.risk_thresholds.low;

  return {
    ...initialScores,
    followup_applied: true,
    followup_score: updatedScore,
    followup_risk_level: updatedScore >= 2 ? 'Triagem Positiva' : 'Triagem Negativa',
    followup_risk_key: riskKey,
    followup_failed_items: updatedFailedItems,
    followup_description: updatedScore >= 2
      ? 'A criança foi rastreada positivamente no M-CHAT-R/F. É altamente recomendado o encaminhamento para avaliação diagnóstica e intervenção precoce.'
      : 'A triagem foi negativa. Nenhuma outra avaliação será necessária, exceto se a evolução clínica indicar risco de TEA.',
  };
};

export default MCHAT_RF_META;
