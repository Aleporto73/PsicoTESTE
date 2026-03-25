/*
 * CARS-2 ST — Childhood Autism Rating Scale, Second Edition (Standard Form)
 * Schopler, Van Bourgondien, Wellman & Love (2010)
 * Versão brasileira: Pereira, Riesgo & Wagner (2008)
 *
 * 15 itens, pontuação 1-4 (com meios: 1, 1.5, 2, 2.5, 3, 3.5, 4)
 * Total: 15-60 pontos
 * Classificação por escore bruto + tabela T-Escore/Percentil
 */

// ==========================================
// METADATA
// ==========================================

export const CARS2_META = {
  id: 'cars2',
  name: 'CARS-2',
  fullName: 'Childhood Autism Rating Scale — Second Edition (Standard Form)',
  version: 'Schopler, Van Bourgondien, Wellman & Love (2010)',
  totalItems: 15,
  minScore: 15,
  maxScore: 60,
  ageRange: '2+ anos',
  responseType: 'likert_half', // 1, 1.5, 2, 2.5, 3, 3.5, 4
  description: 'Escala de observação comportamental com 15 itens para avaliação da gravidade dos sintomas do TEA.',
};

// ==========================================
// OPÇÕES DE PONTUAÇÃO
// ==========================================

export const CARS2_SCORE_OPTIONS = [
  { value: 1,   label: '1',   desc: 'Comportamento apropriado para a idade' },
  { value: 1.5, label: '1.5', desc: 'Intermediário (1-2)' },
  { value: 2,   label: '2',   desc: 'Levemente anormal' },
  { value: 2.5, label: '2.5', desc: 'Intermediário (2-3)' },
  { value: 3,   label: '3',   desc: 'Moderadamente anormal' },
  { value: 3.5, label: '3.5', desc: 'Intermediário (3-4)' },
  { value: 4,   label: '4',   desc: 'Gravemente anormal' },
];

// ==========================================
// 15 ITENS
// ==========================================

export const CARS2_ITEMS = [
  {
    num: 1,
    name: 'Compreensão Social-Emocional',
    desc: 'Capacidade de compreender e responder a estímulos sociais e emocionais do ambiente.',
  },
  {
    num: 2,
    name: 'Expressão Emocional e Regulação das Emoções',
    desc: 'Tipo, frequência e grau de expressão emocional e capacidade de regular as próprias emoções.',
  },
  {
    num: 3,
    name: 'Relacionamento com Pessoas',
    desc: 'Interesse e interação com as pessoas no ambiente, incluindo iniciativas sociais.',
  },
  {
    num: 4,
    name: 'Uso do Corpo',
    desc: 'Coordenação e adequação dos movimentos corporais, incluindo estereotipias motoras.',
  },
  {
    num: 5,
    name: 'Uso de Objetos nas Brincadeiras',
    desc: 'Interesse e uso de brinquedos e outros objetos, incluindo brincadeira simbólica.',
  },
  {
    num: 6,
    name: 'Adaptação a Mudanças / Interesses Restritos',
    desc: 'Capacidade de adaptar-se a mudanças de rotina e presença de interesses restritos ou repetitivos.',
  },
  {
    num: 7,
    name: 'Resposta Visual',
    desc: 'Padrões de uso do olhar, contato visual e resposta a estímulos visuais.',
  },
  {
    num: 8,
    name: 'Resposta Auditiva',
    desc: 'Respostas a sons e estímulos auditivos, incluindo hiper ou hiporreatividade.',
  },
  {
    num: 9,
    name: 'Resposta a Sabor, Cheiro e Toque',
    desc: 'Respostas a estímulos gustativos, olfativos e táteis, incluindo sensibilidades sensoriais.',
  },
  {
    num: 10,
    name: 'Medo ou Ansiedade',
    desc: 'Presença de medos incomuns, ansiedade excessiva ou ausência de medo apropriado.',
  },
  {
    num: 11,
    name: 'Comunicação Verbal',
    desc: 'Nível e qualidade da comunicação verbal, incluindo ecolalia e peculiaridades de fala.',
  },
  {
    num: 12,
    name: 'Comunicação Não-Verbal',
    desc: 'Uso e compreensão de gestos, expressões faciais e linguagem corporal.',
  },
  {
    num: 13,
    name: 'Integração de Pensamento / Cognição',
    desc: 'Habilidades de pensamento abstrato, criatividade e integração de informações.',
  },
  {
    num: 14,
    name: 'Nível e Consistência da Resposta Intelectual',
    desc: 'Nível geral de inteligência e consistência do funcionamento intelectual entre áreas.',
  },
  {
    num: 15,
    name: 'Impressões Gerais',
    desc: 'Impressão clínica geral sobre o grau de autismo observado.',
  },
];

// ==========================================
// CLASSIFICAÇÃO POR ESCORE BRUTO
// ==========================================

export const CARS2_CLASSIFICATION = [
  {
    min: 15, max: 29.5,
    level: 'minimo',
    label: 'Sintomas mínimos ou inexistentes de TEA',
    color: '#10b981', bg: '#d1fae5',
  },
  {
    min: 30, max: 36.5,
    level: 'leve_moderado',
    label: 'Sintomas leves a moderados de TEA',
    color: '#f59e0b', bg: '#fef3c7',
  },
  {
    min: 37, max: 60,
    level: 'grave',
    label: 'Sintomas graves de TEA',
    color: '#ef4444', bg: '#fee2e2',
  },
];

// ==========================================
// TABELA T-ESCORE / PERCENTIL
// ==========================================

export const CARS2_NORM_TABLE = [
  { raw: 1, t: '<20', pct: '<1' },
  { raw: 1.5, t: '<20', pct: '<1' },
  { raw: 2, t: '<20', pct: '<1' },
  { raw: 2.5, t: '<20', pct: '<1' },
  { raw: 3, t: '<20', pct: '<1' },
  { raw: 3.5, t: '<20', pct: '<1' },
  { raw: 4, t: '<20', pct: '<1' },
  { raw: 4.5, t: '<20', pct: '<1' },
  { raw: 5, t: '<20', pct: '<1' },
  { raw: 5.5, t: '<20', pct: '<1' },
  { raw: 6, t: '<20', pct: '<1' },
  { raw: 6.5, t: '<20', pct: '<1' },
  { raw: 7, t: '<20', pct: '<1' },
  { raw: 7.5, t: '<20', pct: '<1' },
  { raw: 8, t: '<20', pct: '<1' },
  { raw: 8.5, t: '<20', pct: '<1' },
  { raw: 9, t: '<20', pct: '<1' },
  { raw: 9.5, t: '<20', pct: '<1' },
  { raw: 10, t: '<20', pct: '<1' },
  { raw: 10.5, t: '<20', pct: '<1' },
  { raw: 11, t: '<20', pct: '<1' },
  { raw: 11.5, t: '<20', pct: '<1' },
  { raw: 12, t: '<20', pct: '<1' },
  { raw: 12.5, t: '<20', pct: '<1' },
  { raw: 13, t: '<20', pct: '<1' },
  { raw: 13.5, t: '<20', pct: '<1' },
  { raw: 14, t: '<20', pct: '<1' },
  { raw: 14.5, t: '<20', pct: '<1' },
  { raw: 15, t: '<20', pct: '<1' },
  { raw: 15.5, t: '<20', pct: '<1' },
  { raw: 16, t: '<20', pct: '<1' },
  { raw: 16.5, t: '<20', pct: '<1' },
  { raw: 17, t: '<20', pct: '<1' },
  { raw: 17.5, t: '<20', pct: '<1' },
  { raw: 18, t: '<20', pct: '<1' },
  { raw: 18.5, t: '24', pct: '<1' },
  { raw: 19, t: '26', pct: '<1' },
  { raw: 19.5, t: '27', pct: '<1' },
  { raw: 20, t: '28', pct: '1' },
  { raw: 20.5, t: '29', pct: '1' },
  { raw: 21, t: '30', pct: '2' },
  { raw: 21.5, t: '31', pct: '3' },
  { raw: 22, t: '32', pct: '4' },
  { raw: 22.5, t: '32', pct: '4' },
  { raw: 23, t: '33', pct: '5' },
  { raw: 23.5, t: '34', pct: '6' },
  { raw: 24, t: '35', pct: '7' },
  { raw: 24.5, t: '36', pct: '8' },
  { raw: 25, t: '37', pct: '10' },
  { raw: 25.5, t: '37', pct: '10' },
  { raw: 26, t: '38', pct: '12' },
  { raw: 26.5, t: '39', pct: '14' },
  { raw: 27, t: '40', pct: '16' },
  { raw: 27.5, t: '41', pct: '19' },
  { raw: 28, t: '42', pct: '21' },
  { raw: 28.5, t: '43', pct: '24' },
  { raw: 29, t: '43', pct: '24' },
  { raw: 29.5, t: '44', pct: '28' },
  { raw: 30, t: '45', pct: '31' },
  { raw: 30.5, t: '46', pct: '33' },
  { raw: 31, t: '46', pct: '33' },
  { raw: 31.5, t: '47', pct: '38' },
  { raw: 32, t: '48', pct: '42' },
  { raw: 32.5, t: '49', pct: '46' },
  { raw: 33, t: '50', pct: '50' },
  { raw: 33.5, t: '50', pct: '50' },
  { raw: 34, t: '51', pct: '54' },
  { raw: 34.5, t: '51', pct: '54' },
  { raw: 35, t: '52', pct: '58' },
  { raw: 35.5, t: '53', pct: '62' },
  { raw: 36, t: '54', pct: '65' },
  { raw: 36.5, t: '54', pct: '65' },
  { raw: 37, t: '55', pct: '69' },
  { raw: 37.5, t: '56', pct: '72' },
  { raw: 38, t: '57', pct: '76' },
  { raw: 38.5, t: '58', pct: '79' },
  { raw: 39, t: '58', pct: '79' },
  { raw: 39.5, t: '59', pct: '82' },
  { raw: 40, t: '59', pct: '82' },
  { raw: 40.5, t: '60', pct: '84' },
  { raw: 41, t: '61', pct: '86' },
  { raw: 41.5, t: '62', pct: '88' },
  { raw: 42, t: '62', pct: '88' },
  { raw: 42.5, t: '63', pct: '90' },
  { raw: 43, t: '63', pct: '90' },
  { raw: 43.5, t: '64', pct: '92' },
  { raw: 44, t: '65', pct: '93' },
  { raw: 44.5, t: '65', pct: '93' },
  { raw: 45, t: '66', pct: '95' },
  { raw: 45.5, t: '67', pct: '96' },
  { raw: 46, t: '68', pct: '96' },
  { raw: 46.5, t: '69', pct: '97' },
  { raw: 47, t: '70', pct: '>97' },
  { raw: 47.5, t: '>70', pct: '>97' },
  { raw: 48, t: '>70', pct: '>97' },
  { raw: 48.5, t: '>70', pct: '>97' },
  { raw: 49, t: '>70', pct: '>97' },
  { raw: 49.5, t: '>70', pct: '>97' },
  { raw: 50, t: '>70', pct: '>97' },
  { raw: 50.5, t: '>70', pct: '>97' },
  { raw: 51, t: '>70', pct: '>97' },
  { raw: 51.5, t: '>70', pct: '>97' },
  { raw: 52, t: '>70', pct: '>97' },
  { raw: 52.5, t: '>70', pct: '>97' },
  { raw: 53, t: '>70', pct: '>97' },
  { raw: 53.5, t: '>70', pct: '>97' },
  { raw: 54, t: '>70', pct: '>97' },
  { raw: 54.5, t: '>70', pct: '>97' },
  { raw: 55, t: '>70', pct: '>97' },
  { raw: 55.5, t: '>70', pct: '>97' },
  { raw: 56, t: '>70', pct: '>97' },
  { raw: 56.5, t: '>70', pct: '>97' },
  { raw: 57, t: '>70', pct: '>97' },
  { raw: 57.5, t: '>70', pct: '>97' },
  { raw: 58, t: '>70', pct: '>97' },
  { raw: 58.5, t: '>70', pct: '>97' },
  { raw: 59, t: '>70', pct: '>97' },
  { raw: 59.5, t: '>70', pct: '>97' },
  { raw: 60, t: '>70', pct: '>97' },
];

// ==========================================
// FUNÇÕES DE CÁLCULO
// ==========================================

export function calculateCARS2Scores(responses) {
  // responses: { "1": 2.5, "2": 3, ... } (valor numérico 1-4)
  let totalScore = 0;
  let totalAnswered = 0;
  const itemScores = {};

  for (const item of CARS2_ITEMS) {
    const key = String(item.num);
    const val = responses[key];
    if (val !== undefined && val !== null) {
      totalAnswered++;
      totalScore += val;
      itemScores[key] = {
        score: val,
        severity: getScoreSeverity(val),
      };
    }
  }

  // Arredondar para evitar imprecisão de float
  totalScore = Math.round(totalScore * 10) / 10;

  const classification = getCARS2Classification(totalScore);
  const norm = getCARS2Norm(totalScore);

  return {
    totalScore,
    maxPossible: CARS2_META.maxScore,
    minPossible: CARS2_META.minScore,
    totalAnswered,
    totalItems: CARS2_META.totalItems,
    totalPercent: Math.round(((totalScore - 15) / (60 - 15)) * 100 * 100) / 100,
    itemScores,
    classification,
    tScore: norm?.t || '--',
    percentile: norm?.pct || '--',
  };
}

export function getCARS2Classification(score) {
  for (const c of CARS2_CLASSIFICATION) {
    if (score >= c.min && score <= c.max) return c;
  }
  return CARS2_CLASSIFICATION[0];
}

export function getCARS2Norm(rawScore) {
  const exact = CARS2_NORM_TABLE.find(r => r.raw === rawScore);
  if (exact) return exact;
  const rounded = Math.round(rawScore * 2) / 2;
  return CARS2_NORM_TABLE.find(r => r.raw === rounded) || null;
}

export function getScoreSeverity(score) {
  if (score <= 1.5) return { level: 'normal', label: 'Apropriado', color: '#10b981' };
  if (score <= 2.5) return { level: 'leve', label: 'Levemente anormal', color: '#f59e0b' };
  if (score <= 3.5) return { level: 'moderado', label: 'Moderadamente anormal', color: '#f97316' };
  return { level: 'grave', label: 'Gravemente anormal', color: '#ef4444' };
}

export function getCARS2ItemByNum(num) {
  return CARS2_ITEMS.find(i => i.num === num) || null;
}
