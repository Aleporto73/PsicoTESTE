/*
 * DENVER II — Teste de Triagem do Desenvolvimento
 *
 * Referência: Frankenburg, W.K. et al. (1992).
 * The Denver II: A Major Revision and Restandardization of the Denver Developmental Screening Test.
 * Pediatrics, 89(1), 91-97.
 *
 * 4 domínios, 105 itens, faixa etária 0-6 anos
 * Escores: Passou, Falhou, Recusou, S.O (Sem Oportunidade)
 * Interpretação: Normal, Avançado, Cautela, Atraso, N.A (Não Aplicável)
 */

// ═══════════════════════════════════════════════════
// OPÇÕES DE ESCORE
// ═══════════════════════════════════════════════════
export const DENVER_SCORE_OPTIONS = [
  { value: 'passou', label: 'Passou', short: 'P', color: '#10b981', bgColor: '#d1fae5', description: 'A criança realizou a tarefa com sucesso' },
  { value: 'falhou', label: 'Falhou', short: 'F', color: '#ef4444', bgColor: '#fee2e2', description: 'A criança não conseguiu realizar a tarefa' },
  { value: 'recusou', label: 'Recusou', short: 'R', color: '#f59e0b', bgColor: '#fef3c7', description: 'A criança recusou-se a tentar' },
  { value: 'so', label: 'S.O', short: 'SO', color: '#6366f1', bgColor: '#e0e7ff', description: 'Sem Oportunidade — não houve chance de avaliar' },
];

export const DENVER_INTERPRETATION_OPTIONS = [
  { value: 'normal', label: 'Normal', short: 'N', color: '#10b981', bgColor: '#d1fae5' },
  { value: 'avancado', label: 'Avançado', short: 'Av', color: '#3b82f6', bgColor: '#dbeafe' },
  { value: 'cautela', label: 'Cautela', short: 'C', color: '#f59e0b', bgColor: '#fef3c7' },
  { value: 'atraso', label: 'Atraso', short: 'At', color: '#ef4444', bgColor: '#fee2e2' },
  { value: 'na', label: 'N.A', short: 'NA', color: '#94a3b8', bgColor: '#f1f5f9' },
];

// ═══════════════════════════════════════════════════
// DOMÍNIOS
// ═══════════════════════════════════════════════════
export const DENVER_DOMAINS = [
  { id: 'pessoal_social', name: 'Pessoal-Social', short: 'PS', color: '#6366f1', icon: '👤' },
  { id: 'motor_fino', name: 'Motor Fino-Adaptativo', short: 'MF', color: '#0891b2', icon: '✋' },
  { id: 'linguagem', name: 'Linguagem', short: 'LG', color: '#7c3aed', icon: '💬' },
  { id: 'motor_grosso', name: 'Motor Grosso', short: 'MG', color: '#e11d48', icon: '🏃' },
];

// ═══════════════════════════════════════════════════
// ITENS POR DOMÍNIO
// ═══════════════════════════════════════════════════
export const DENVER_ITEMS = {
  pessoal_social: [
    { num: 1, age: '', skill: 'Olha a face' },
    { num: 2, age: '2,1 sem a 1,5 meses', skill: 'Sorri em resposta' },
    { num: 3, age: '2,6 sem a 2,1 meses', skill: 'Sorri espontaneamente' },
    { num: 4, age: '3,4 sem a 4,0 meses', skill: 'Olha a própria mão' },
    { num: 5, age: '4,1 a 5,9 meses', skill: 'Esforça para pegar brinquedo' },
    { num: 6, age: '4,8 a 6,5 meses', skill: 'Alimenta-se sozinha' },
    { num: 7, age: '7,1 a 11,4 meses', skill: 'Bate palminhas' },
    { num: 8, age: '7,2 a 12,9 meses', skill: 'Indica desejo' },
    { num: 9, age: '6,7 a 14,0 meses', skill: 'Dá tchau' },
    { num: 10, age: '9,5 a 15,7 meses', skill: 'Joga bola com o examinador' },
    { num: 11, age: '10,1 a 16,0 meses', skill: 'Imita trabalhos caseiros' },
    { num: 12, age: '8,8 a 17,1 meses', skill: 'Bebe de um copo' },
    { num: 13, age: '12,6 a 17,3 meses', skill: 'Ajuda em casa' },
    { num: 14, age: '12,8 a 19,9 meses', skill: 'Usa colher/garfo' },
    { num: 15, age: '13,3 a 23,9 meses', skill: 'Remove roupas' },
    { num: 16, age: '14,8 meses a 2,0 anos', skill: 'Alimenta boneca' },
    { num: 17, age: '20,5 meses a 2,5 anos', skill: 'Põe roupa' },
    { num: 18, age: '16,1 meses a 2,7 anos', skill: 'Escova os dentes com ajuda' },
    { num: 19, age: '19,2 meses a 3,1 anos', skill: 'Lava e seca as mãos' },
    { num: 20, age: '2,2 a 3,1 anos', skill: 'Nomeia amigo' },
    { num: 21, age: '2,3 a 3,4 anos', skill: 'Veste camiseta' },
    { num: 22, age: '3,0 a 4,5 anos', skill: 'Veste sem ajuda' },
    { num: 23, age: '2,7 a 4,9 anos', skill: 'Joga jogos de mesa ou cartas' },
    { num: 24, age: '2,6 a 5,0 anos', skill: 'Escova os dentes, sem ajuda' },
    { num: 25, age: '3,0 a 5,1 anos', skill: 'Prepara lanche simples' },
  ],
  motor_fino: [
    { num: 1, age: '1,7 sem a 1,3 meses', skill: 'Segue até linha média' },
    { num: 2, age: '2,7 sem a 2,8 meses', skill: 'Segue passando pela linha média' },
    { num: 3, age: '2,6 a 3,9 meses', skill: 'Agarra chocalho' },
    { num: 4, age: '2,2 a 4,0 meses', skill: 'Mãos juntas' },
    { num: 5, age: '2,2 a 4,5 meses', skill: 'Segue 180°' },
    { num: 6, age: '2,8 a 5,2 meses', skill: 'Olha uva-passa' },
    { num: 7, age: '4,3 a 5,6 meses', skill: 'Alcança' },
    { num: 8, age: '4,9 a 7,2 meses', skill: 'Procura pompom' },
    { num: 9, age: '5,7 a 7,3 meses', skill: 'Agarra uva-passa' },
    { num: 10, age: '5,1 a 7,7 meses', skill: 'Transfere cubo' },
    { num: 11, age: '5,7 a 9,1 meses', skill: 'Pega dois cubos' },
    { num: 12, age: '7,2 a 10,2 meses', skill: 'Agarra com polegar-dedos' },
    { num: 13, age: '6,7 a 19,0 meses', skill: 'Bate dois cubos' },
    { num: 14, age: '9,8 a 13,8 meses', skill: 'Coloca cubo na xícara' },
    { num: 15, age: '11,7 a 16,3 meses', skill: 'Rabisca' },
    { num: 16, age: '12,8 a 19,4 meses', skill: 'Derrama uva-passa, com demonstração' },
    { num: 17, age: '13,5 meses a 3,5 anos', skill: 'Torre de cubos (2, 4, 6, 8)' },
    { num: 18, age: '2,1 a 3,2 anos', skill: 'Imita linha vertical' },
    { num: 19, age: '2,5 a 3,6 anos', skill: 'Movimenta o polegar' },
    { num: 20, age: '3,1 a 4,0 anos', skill: 'Copia O' },
    { num: 21, age: '3,3 a 5,6 anos', skill: 'Desenha pessoa (3 partes, 6 partes)' },
    { num: 22, age: '3,3 a 4,7 anos', skill: 'Copia +' },
    { num: 23, age: '2,9 a 5,3 anos', skill: 'Indica linha maior' },
    { num: 24, age: '4,7 a 6,1 anos', skill: 'Copia quadrado' },
    { num: 25, age: '4,0 a 5,4 anos', skill: 'Copia quadrado com demonstração' },
  ],
  linguagem: [
    { num: 1, age: '', skill: 'Responde ao sino' },
    { num: 2, age: '3,3 semanas', skill: 'Vocaliza' },
    { num: 3, age: '2,7 sem a 2,7 meses', skill: '"OOO" / "AAH"' },
    { num: 4, age: '1,3 a 3,1 meses', skill: 'Ri' },
    { num: 5, age: '1,2 a 4,3 meses', skill: 'Grita' },
    { num: 6, age: '2,8 a 5,6 meses', skill: 'Volta-se ao barulho' },
    { num: 7, age: '3,6 a 6,6 meses', skill: 'Volta-se ao chamado' },
    { num: 8, age: '4,7 a 7,5 meses', skill: 'Vocaliza sílabas' },
    { num: 9, age: '3,0 a 8,8 meses', skill: 'Imita sons' },
    { num: 10, age: '5,7 a 9,1 meses', skill: 'Papa e mama não específicos' },
    { num: 11, age: '5,8 a 10,1 meses', skill: 'Combina sílabas' },
    { num: 12, age: '5,7 a 12,1 meses', skill: 'Tagarelar' },
    { num: 13, age: '6,9 a 13,3 meses', skill: 'Papa/mama específicos' },
    { num: 14, age: '9,7 a 21,4 meses', skill: 'Uma, 2, 3, 6 palavras' },
    { num: 15, age: '17,3 meses a 2,5 anos', skill: 'Aponta figuras (2, 4)' },
    { num: 16, age: '17,2 meses a 2,1 anos', skill: 'Combina palavras' },
    { num: 17, age: '18,3 meses a 2,9 anos', skill: 'Nomeia figuras (1, 4)' },
    { num: 18, age: '18,5 meses a 2,4 anos', skill: 'Partes do corpo (6)' },
    { num: 19, age: '17,2 meses a 2,9 anos', skill: 'Fala metade compreensível / totalmente compreensível' },
    { num: 20, age: '23,5 meses a 4,2 anos', skill: 'Conhece ações (2, 4)' },
    { num: 21, age: '2,5 a 5,3 anos', skill: 'Conhece adjetivos (2, 3)' },
    { num: 22, age: '2,4 a 4,8 anos', skill: 'Nomeia cores (1, 4)' },
    { num: 23, age: '2,6 a 4,1 anos', skill: 'Uso de objetos (2, 3)' },
    { num: 24, age: '2,8 a 3,9 anos', skill: 'Conta 1 bloco' },
    { num: 25, age: '2,7 a 4,7 anos', skill: 'Compreende 4 preposições' },
    { num: 26, age: '2,7 a 6,1 anos', skill: 'Define palavras (5, 7)' },
    { num: 27, age: '4,1 a 5,4 anos', skill: 'Conta 5 blocos' },
    { num: 28, age: '3,6 a 5,7 anos', skill: 'Opostos (2)' },
  ],
  motor_grosso: [
    { num: 1, age: '', skill: 'Movimentos simétricos' },
    { num: 2, age: '', skill: 'Levanta a cabeça' },
    { num: 3, age: '3,7 sem a 2,7 meses', skill: 'Sustenta cabeça a 45°' },
    { num: 4, age: '1,5 a 3,6 meses', skill: 'Sustenta cabeça a 90°' },
    { num: 5, age: '1,6 a 3,7 meses', skill: 'Sentado — cabeça estável' },
    { num: 6, age: '1,7 a 4,4 meses', skill: 'Suporta peso nas pernas' },
    { num: 7, age: '2,6 a 4,6 meses', skill: 'Sustenta tronco, com apoio dos braços' },
    { num: 8, age: '2,1 a 5,4 meses', skill: 'Rola' },
    { num: 9, age: '2,8 a 6,2 meses', skill: 'Puxado para sentar, sem queda da cabeça' },
    { num: 10, age: '5,4 a 6,8 meses', skill: 'Senta sem apoio' },
    { num: 11, age: '6,5 a 8,5 meses', skill: 'Fica de pé apoiado' },
    { num: 12, age: '7,8 a 9,7 meses', skill: 'Puxa para ficar de pé' },
    { num: 13, age: '7,6 a 9,9 meses', skill: 'Passa para sentado' },
    { num: 14, age: '9,4 a 11,6 meses', skill: 'Fica de pé (2 segundos)' },
    { num: 15, age: '10,4 a 13,7 meses', skill: 'Fica de pé sozinho' },
    { num: 16, age: '11,0 a 14,6 meses', skill: 'Curva-se e retorna' },
    { num: 17, age: '11,1 a 14,9 meses', skill: 'Anda bem' },
    { num: 18, age: '12,3 a 16,6 meses', skill: 'Anda para trás' },
    { num: 19, age: '13,8 a 19,9 meses', skill: 'Corre' },
    { num: 20, age: '14,1 a 21,6 meses', skill: 'Sobe degraus' },
    { num: 21, age: '15,9 a 23,2 meses', skill: 'Chuta bola para frente' },
    { num: 22, age: '21,4 meses a 2,4 anos', skill: 'Pula' },
    { num: 23, age: '17,1 meses a 2,9 anos', skill: 'Joga bola de cima para baixo' },
    { num: 24, age: '2,4 a 3,2 anos', skill: 'Salto amplo' },
    { num: 25, age: '2,3 a 5,9 anos', skill: 'Equilibra-se em cada pé (1-6 segundos)' },
    { num: 26, age: '3,2 a 4,2 anos', skill: 'Pula com um pé só' },
    { num: 27, age: '4,0 a 5,7 anos', skill: 'Marcha calcanhar-pé' },
  ],
};

// Total de itens
export const DENVER_TOTAL_ITEMS = Object.values(DENVER_ITEMS).reduce((sum, items) => sum + items.length, 0);

// ═══════════════════════════════════════════════════
// CLASSIFICAÇÃO GLOBAL
// ═══════════════════════════════════════════════════
export const DENVER_CLASSIFICATIONS = [
  { id: 'normal', label: 'Normal', color: '#10b981', bgColor: '#d1fae5',
    description: 'Nenhum Atraso e no máximo 1 Cautela' },
  { id: 'suspeito', label: 'Suspeito', color: '#f59e0b', bgColor: '#fef3c7',
    description: '2 ou mais Cautelas e/ou 1 ou mais Atrasos' },
  { id: 'nao_testavel', label: 'Não Testável', color: '#ef4444', bgColor: '#fee2e2',
    description: 'Recusa em 1 ou mais itens com a linha da idade completamente à esquerda da barra do item' },
];

// ═══════════════════════════════════════════════════
// FUNÇÕES DE CÁLCULO
// ═══════════════════════════════════════════════════

/**
 * Calcula os resultados do Denver II
 * @param {Object} responses - { [domainId_itemNum]: { score: 'passou'|'falhou'|'recusou'|'so', interpretation: 'normal'|'avancado'|'cautela'|'atraso'|'na' } }
 * @returns {Object} resultados completos
 */
export function calculateDenverScores(responses) {
  const domainResults = {};
  let totalItems = 0;
  let totalAnswered = 0;
  let totalCautelas = 0;
  let totalAtrasos = 0;
  let totalAvancados = 0;
  let totalNormais = 0;
  let totalNA = 0;

  // Por domínio
  for (const domain of DENVER_DOMAINS) {
    const items = DENVER_ITEMS[domain.id];
    const counts = {
      score: { passou: 0, falhou: 0, recusou: 0, so: 0 },
      interpretation: { normal: 0, avancado: 0, cautela: 0, atraso: 0, na: 0 },
      total: items.length,
      answered: 0,
    };

    for (const item of items) {
      const key = domain.id + '_' + item.num;
      const resp = responses[key];
      totalItems++;

      if (resp && resp.score) {
        counts.answered++;
        totalAnswered++;
        counts.score[resp.score] = (counts.score[resp.score] || 0) + 1;
      }
      if (resp && resp.interpretation) {
        counts.interpretation[resp.interpretation] = (counts.interpretation[resp.interpretation] || 0) + 1;

        if (resp.interpretation === 'cautela') totalCautelas++;
        if (resp.interpretation === 'atraso') totalAtrasos++;
        if (resp.interpretation === 'avancado') totalAvancados++;
        if (resp.interpretation === 'normal') totalNormais++;
        if (resp.interpretation === 'na') totalNA++;
      }
    }

    domainResults[domain.id] = counts;
  }

  // Classificação global
  let classification;
  if (totalAtrasos >= 1 || totalCautelas >= 2) {
    classification = DENVER_CLASSIFICATIONS[1]; // Suspeito
  } else {
    classification = DENVER_CLASSIFICATIONS[0]; // Normal
  }

  return {
    domainResults,
    totalItems,
    totalAnswered,
    summary: {
      cautelas: totalCautelas,
      atrasos: totalAtrasos,
      avancados: totalAvancados,
      normais: totalNormais,
      na: totalNA,
    },
    classification,
  };
}

/**
 * Retorna cor da interpretação
 */
export function getInterpretationColor(interpretation) {
  const opt = DENVER_INTERPRETATION_OPTIONS.find(o => o.value === interpretation);
  return opt ? opt.color : '#94a3b8';
}

/**
 * Retorna cor do escore
 */
export function getScoreColor(score) {
  const opt = DENVER_SCORE_OPTIONS.find(o => o.value === score);
  return opt ? opt.color : '#94a3b8';
}
