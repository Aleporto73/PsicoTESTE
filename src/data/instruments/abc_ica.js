/*
 * ABC / ICA — Autism Behavior Checklist / Inventário de Comportamentos Autísticos
 * Krug, Arick & Almond (1980) — Versão brasileira: Marteleto & Pedromônico (2005)
 *
 * 57 itens, resposta binária (SIM/NÃO)
 * Cada item tem peso fixo (1-4 pontos quando SIM, 0 quando NÃO)
 * 5 subescalas: ES, RE, CO, LG, PS
 * Pontuação total determina classificação
 */

// ==========================================
// METADATA
// ==========================================

export const ABC_ICA_META = {
  id: 'abc_ica',
  name: 'ABC / ICA',
  fullName: 'Autism Behavior Checklist / Inventário de Comportamentos Autísticos',
  version: 'Marteleto & Pedromônico (2005)',
  totalItems: 57,
  maxScore: 159,
  ageRange: '3+ anos',
  responseType: 'binary', // SIM ou NÃO
  description: 'Checklist de 57 comportamentos atípicos associados ao autismo, organizados em 5 subescalas.',
};

// ==========================================
// SUBESCALAS
// ==========================================

export const ABC_ICA_SUBSCALES = [
  {
    id: 'es',
    name: 'Estímulo Sensorial',
    shortName: 'ES',
    description: 'Respostas a estímulos sensoriais (visuais, auditivos, táteis)',
    color: '#7c3aed',
    bg: '#ede9fe',
    items: [6, 10, 21, 26, 34, 39, 44, 52, 57],
  },
  {
    id: 're',
    name: 'Relacionamento',
    shortName: 'RE',
    description: 'Capacidade de estabelecer e manter relações sociais',
    color: '#2563eb',
    bg: '#dbeafe',
    items: [3, 7, 13, 17, 24, 25, 27, 28, 33, 38, 43, 47],
  },
  {
    id: 'co',
    name: 'Uso do Corpo e Objetos',
    shortName: 'CO',
    description: 'Uso do corpo e manipulação de objetos',
    color: '#059669',
    bg: '#d1fae5',
    items: [1, 5, 9, 12, 16, 22, 30, 35, 40, 51, 53, 54],
  },
  {
    id: 'lg',
    name: 'Linguagem',
    shortName: 'LG',
    description: 'Comunicação verbal e não verbal',
    color: '#d97706',
    bg: '#fef3c7',
    items: [4, 8, 11, 15, 18, 20, 29, 32, 37, 42, 46, 48, 56],
  },
  {
    id: 'ps',
    name: 'Pessoal e Social',
    shortName: 'PS',
    description: 'Desenvolvimento pessoal, social e autocuidado',
    color: '#db2777',
    bg: '#fce7f3',
    items: [2, 14, 19, 23, 31, 36, 41, 45, 49, 50, 55],
  },
];

// ==========================================
// 57 ITENS (extraídos do Excel original)
// ==========================================

export const ABC_ICA_ITEMS = [
  { num: 1, desc: 'Gira em torno de si por longo período de tempo', weight: 4, subscale: 'co' },
  { num: 2, desc: 'Aprende uma tarefa, mas esquece rapidamente', weight: 2, subscale: 'ps' },
  { num: 3, desc: 'É raro atender estímulo não verbal social/ambiente (expressões, gestos, situações)', weight: 4, subscale: 're' },
  { num: 4, desc: 'Ausência de resposta para solicitações verbais — venha cá; sente-se', weight: 1, subscale: 'lg' },
  { num: 5, desc: 'Usa brinquedos inapropriadamente', weight: 2, subscale: 'co' },
  { num: 6, desc: 'Pobre uso da discriminação visual (fixa uma característica do objeto)', weight: 2, subscale: 'es' },
  { num: 7, desc: 'Ausência do sorriso social', weight: 2, subscale: 're' },
  { num: 8, desc: 'Uso inadequado de pronomes (eu por ele)', weight: 3, subscale: 'lg' },
  { num: 9, desc: 'Insiste em manter certos objetos consigo', weight: 3, subscale: 'co' },
  { num: 10, desc: 'Parece não escutar (suspeita-se de perda de audição)', weight: 3, subscale: 'es' },
  { num: 11, desc: 'Fala monótona e sem ritmo', weight: 4, subscale: 'lg' },
  { num: 12, desc: 'Balança-se por longos períodos de tempo', weight: 4, subscale: 'co' },
  { num: 13, desc: 'Não estende o braço para ser pego (nem o fez quando bebê)', weight: 2, subscale: 're' },
  { num: 14, desc: 'Fortes reações frente a mudanças no ambiente', weight: 3, subscale: 'ps' },
  { num: 15, desc: 'Ausência de atenção ao seu nome quando entre 2 outras crianças', weight: 3, subscale: 'lg' },
  { num: 16, desc: 'Corre interrompendo com giros em torno de si, balanceio de mãos', weight: 4, subscale: 'co' },
  { num: 17, desc: 'Ausência de resposta para expressão facial/sentimento de outros', weight: 3, subscale: 're' },
  { num: 18, desc: 'Raramente usa "sim" ou "eu"', weight: 2, subscale: 'lg' },
  { num: 19, desc: 'Possui habilidade numa área do desenvolvimento', weight: 4, subscale: 'ps' },
  { num: 20, desc: 'Ausência de respostas a solicitações verbais envolvendo o uso de referenciais de espaço', weight: 1, subscale: 'lg' },
  { num: 21, desc: 'Reação de sobressalto a som intenso (suspeita de surdez)', weight: 3, subscale: 'es' },
  { num: 22, desc: 'Balança as mãos', weight: 4, subscale: 'co' },
  { num: 23, desc: 'Intensos acessos de raiva e/ou frequentes "chiliques"', weight: 3, subscale: 'ps' },
  { num: 24, desc: 'Evita ativamente o contato visual', weight: 2, subscale: 're' },
  { num: 25, desc: 'Resiste ao toque / ao ser pego / ao carinho', weight: 4, subscale: 're' },
  { num: 26, desc: 'Não reage a estímulos dolorosos', weight: 3, subscale: 'es' },
  { num: 27, desc: 'Difícil e rígido no colo (ou foi quando bebê)', weight: 3, subscale: 're' },
  { num: 28, desc: 'Flácido quando no colo', weight: 2, subscale: 're' },
  { num: 29, desc: 'Aponta para indicar objeto desejado', weight: 2, subscale: 'lg' },
  { num: 30, desc: 'Anda nas pontas dos pés', weight: 2, subscale: 'co' },
  { num: 31, desc: 'Machuca outros mordendo, batendo, etc.', weight: 2, subscale: 'ps' },
  { num: 32, desc: 'Repete a mesma frase muitas vezes', weight: 3, subscale: 'lg' },
  { num: 33, desc: 'Ausência de imitação de brincadeiras de outras crianças', weight: 3, subscale: 're' },
  { num: 34, desc: 'Ausência de reação do piscar quando luz forte incide em seus olhos', weight: 1, subscale: 'es' },
  { num: 35, desc: 'Machuca-se mordendo, batendo a cabeça, etc.', weight: 2, subscale: 'co' },
  { num: 36, desc: 'Não espera para ser atendido (quer as coisas imediatamente)', weight: 2, subscale: 'ps' },
  { num: 37, desc: 'Não aponta para mais que cinco objetos', weight: 2, subscale: 'lg' },
  { num: 38, desc: 'Dificuldade de fazer amigos', weight: 4, subscale: 're' },
  { num: 39, desc: 'Tapa as orelhas para vários sons', weight: 4, subscale: 'es' },
  { num: 40, desc: 'Gira, bate objetos muitas vezes', weight: 4, subscale: 'co' },
  { num: 41, desc: 'Dificuldade para o treino de toalete', weight: 1, subscale: 'ps' },
  { num: 42, desc: 'Usa de 0 a 5 palavras/dia para indicar necessidades', weight: 1, subscale: 'lg' },
  { num: 43, desc: 'Frequentemente muito ansioso ou medroso', weight: 3, subscale: 're' },
  { num: 44, desc: 'Franze, cobre ou vira os olhos quando em presença de luz natural', weight: 3, subscale: 'es' },
  { num: 45, desc: 'Não se veste sem ajuda', weight: 1, subscale: 'ps' },
  { num: 46, desc: 'Repete constantemente as mesmas palavras e/ou sons', weight: 3, subscale: 'lg' },
  { num: 47, desc: '"Olha através" das pessoas', weight: 4, subscale: 're' },
  { num: 48, desc: 'Repete perguntas e frases ditas por outras pessoas', weight: 4, subscale: 'lg' },
  { num: 49, desc: 'Frequentemente inconsciente dos perigos de situações e do ambiente', weight: 2, subscale: 'ps' },
  { num: 50, desc: 'Prefere manipular e ocupar-se com objetos inanimados', weight: 4, subscale: 'ps' },
  { num: 51, desc: 'Toca, cheira ou lambe objetos do ambiente', weight: 3, subscale: 'co' },
  { num: 52, desc: 'Frequentemente não reage visualmente à presença de novas pessoas', weight: 3, subscale: 'es' },
  { num: 53, desc: 'Repete sequências de comportamentos complicados (cobrir coisas, por ex.)', weight: 4, subscale: 'co' },
  { num: 54, desc: 'Destrutivo com seus brinquedos e coisas da família', weight: 2, subscale: 'co' },
  { num: 55, desc: 'O atraso no desenvolvimento foi identificado antes dos 30 meses', weight: 1, subscale: 'ps' },
  { num: 56, desc: 'Usa mais que 15 e menos que 30 frases diárias para comunicar-se', weight: 3, subscale: 'lg' },
  { num: 57, desc: 'Olha fixamente o ambiente por longos períodos de tempo', weight: 4, subscale: 'es' },
];

// ==========================================
// CLASSIFICAÇÃO POR PONTUAÇÃO TOTAL
// ==========================================

export const ABC_ICA_CLASSIFICATION = [
  { min: 0, max: 46, level: 'sem_sinais', label: 'Sem sinais de autismo', color: '#10b981', bg: '#d1fae5' },
  { min: 47, max: 53, level: 'duvidoso', label: 'Diagnóstico duvidoso', color: '#f59e0b', bg: '#fef3c7' },
  { min: 54, max: 67, level: 'probabilidade_moderada', label: 'Probabilidade moderada de autismo', color: '#f97316', bg: '#ffedd5' },
  { min: 68, max: 999, level: 'autismo', label: 'Alta probabilidade de TEA', color: '#ef4444', bg: '#fee2e2' },
];

// ==========================================
// FUNÇÕES DE CÁLCULO
// ==========================================

export function calculateABCICAScores(responses) {
  // responses: { "1": true/false, "2": true/false, ... } (true = SIM)
  const subscaleScores = {};
  let totalScore = 0;
  let totalAnswered = 0;

  // Inicializar subescalas
  for (const sub of ABC_ICA_SUBSCALES) {
    subscaleScores[sub.id] = { score: 0, maxPossible: 0, answered: 0, total: sub.items.length };
  }

  // Calcular scores
  for (const item of ABC_ICA_ITEMS) {
    subscaleScores[item.subscale].maxPossible += item.weight;

    const key = String(item.num);
    if (responses[key] !== undefined) {
      totalAnswered++;
      subscaleScores[item.subscale].answered++;
      if (responses[key] === true) {
        totalScore += item.weight;
        subscaleScores[item.subscale].score += item.weight;
      }
    }
  }

  // Percentuais por subescala
  for (const sub of ABC_ICA_SUBSCALES) {
    const ss = subscaleScores[sub.id];
    ss.percent = ss.maxPossible > 0 ? Math.round((ss.score / ss.maxPossible) * 100 * 100) / 100 : 0;
  }

  // Classificação
  const classification = getABCICAClassification(totalScore);

  return {
    totalScore,
    maxPossible: ABC_ICA_META.maxScore,
    totalPercent: Math.round((totalScore / ABC_ICA_META.maxScore) * 100 * 100) / 100,
    totalAnswered,
    totalItems: ABC_ICA_META.totalItems,
    subscaleScores,
    classification,
  };
}

export function getABCICAClassification(score) {
  for (const c of ABC_ICA_CLASSIFICATION) {
    if (score >= c.min && score <= c.max) return c;
  }
  return ABC_ICA_CLASSIFICATION[0];
}

export function getABCICAItemByNum(num) {
  return ABC_ICA_ITEMS.find(i => i.num === num) || null;
}

export function getABCICASubscaleById(id) {
  return ABC_ICA_SUBSCALES.find(s => s.id === id) || null;
}
