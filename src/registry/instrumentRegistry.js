/*
 * INSTRUMENT REGISTRY
 *
 * Registro central de todos os instrumentos de avaliação disponíveis.
 * Para adicionar um novo teste, basta registrá-lo aqui seguindo o padrão.
 */

export const instrumentRegistry = {
  vbmapp: {
    id: 'vbmapp',
    name: 'VB-MAPP',
    fullName: 'Verbal Behavior Milestones Assessment and Placement Program',
    description: 'Avaliação completa de marcos verbais com PEI integrado',
    type: 'complex',
    supportsPEI: true,
    ageRange: '0-48 meses',
    stages: ['Milestones', 'Ecoico', 'Subtestes', 'Barreiras', 'Transição', 'PEI'],
    color: '#6366f1',
    icon: '📊',
    estimatedTime: '60-90 min',
  },

  mchat_rf: {
    id: 'mchat_rf',
    name: 'M-CHAT-R/F',
    fullName: 'Modified Checklist for Autism in Toddlers - Revised with Follow-Up',
    description: 'Rastreio de risco para TEA em crianças de 16 a 30 meses',
    type: 'simple',
    supportsPEI: false,
    ageRange: '16-30 meses',
    stages: ['Aplicação', 'Pontuação', 'Relatório'],
    color: '#7c3aed',
    icon: '🧒',
    estimatedTime: '5-10 min',
  },

  ata: {
    id: 'ata',
    name: 'ATA',
    fullName: 'Avaliação de Traços Autísticos',
    description: 'Triagem para TEA com 23 eixos comportamentais (versão completa e resumida)',
    type: 'simple',
    supportsPEI: false,
    ageRange: 'A partir de 2 anos',
    stages: ['Versão', 'Aplicação', 'Resultados', 'Relatório'],
    color: '#f59e0b',
    icon: '🧩',
    estimatedTime: '10-30 min',
  },

  ablls_r: {
    id: 'ablls_r',
    name: 'ABLLS-R',
    fullName: 'Assessment of Basic Language and Learning Skills - Revised',
    description: 'Avaliação de habilidades de linguagem e aprendizado com 25 domínios (543 itens)',
    type: 'simple',
    supportsPEI: false,
    ageRange: '1-12 anos',
    stages: ['Aplicação', 'Pontuação', 'Relatório'],
    color: '#0891b2',
    icon: '📘',
    estimatedTime: '60-120 min',
  },

  abc_ica: {
    id: 'abc_ica',
    name: 'ABC / ICA',
    fullName: 'Autism Behavior Checklist / Inventário de Comportamentos Autísticos',
    description: 'Checklist de 57 comportamentos atípicos em 5 subescalas (Krug, Arick & Almond)',
    type: 'simple',
    supportsPEI: false,
    ageRange: '3+ anos',
    stages: ['Aplicação', 'Pontuação', 'Relatório'],
    color: '#e11d48',
    icon: '🧠',
    estimatedTime: '15-25 min',
  },

  cars2: {
    id: 'cars2',
    name: 'CARS-2',
    fullName: 'Childhood Autism Rating Scale — Second Edition (Standard Form)',
    description: 'Escala de observação com 15 itens para gravidade dos sintomas de TEA (Schopler et al.)',
    type: 'simple',
    supportsPEI: false,
    ageRange: '2+ anos',
    stages: ['Aplicação', 'Pontuação', 'Relatório'],
    color: '#7c3aed',
    icon: '📋',
    estimatedTime: '15-20 min',
  },

  mdf_br: {
    id: 'mdf_br',
    name: 'MDF-BR',
    fullName: 'Matriz de Desenvolvimento Funcional Brasileira',
    description: 'Rastreio funcional breve do desenvolvimento infantil e prontidão escolar (0–72 meses)',
    type: 'simple',
    supportsPEI: false,
    ageRange: '0-72 meses',
    stages: ['Seleção de Faixa', 'Aplicação', 'Resultado'],
    color: '#0d9488',
    icon: '🧒',
    estimatedTime: '15-25 min',
  },

  idf_br: {
    id: 'idf_br',
    name: 'IDF-BR',
    fullName: 'Inventário de Desenvolvimento Funcional Brasileiro',
    description: 'Avaliação funcional profunda do desenvolvimento infantil com mapa de intervenção (parcial v0.1)',
    type: 'simple',
    supportsPEI: false,
    ageRange: '0-72 meses',
    stages: ['Seleção de Faixa', 'Aplicação', 'Resultado'],
    color: '#b45309',
    icon: '📐',
    estimatedTime: '20-40 min',
  },

  // ═══════════════════════════════════════════════════
  // Futuros instrumentos — adicionar aqui:
  // ═══════════════════════════════════════════════════
  // pep_r: { ... },
  // adi_r: { ... },
};

/**
 * Retorna um instrumento pelo ID
 */
export const getInstrument = (instrumentId) => instrumentRegistry[instrumentId] || null;

/**
 * Lista todos os instrumentos registrados
 */
export const listInstruments = () => Object.values(instrumentRegistry);

/**
 * Lista apenas instrumentos simples (sem PEI)
 */
export const listSimpleInstruments = () =>
  Object.values(instrumentRegistry).filter(i => i.type === 'simple');

/**
 * Lista apenas instrumentos complexos (com PEI)
 */
export const listComplexInstruments = () =>
  Object.values(instrumentRegistry).filter(i => i.type === 'complex');

export default instrumentRegistry;
