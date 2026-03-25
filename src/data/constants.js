/*
 * CONSTANTES CENTRALIZADAS - Single Source of Truth
 *
 * Este arquivo consolida todas as constantes duplicadas encontradas
 * nos componentes PainelCrianca, PEIScreen, PDFReport e App.
 *
 * Benefícios:
 * - Evita duplicação de código
 * - Facilita manutenção e atualizações
 * - Garante consistência em toda a aplicação
 */

// ═══════════════════════════════════════════════════════════════
// DOMAIN NAMES (DOM01-DOM16)
// Nomes em português para exibição nos gráficos e relatórios
// ═══════════════════════════════════════════════════════════════
export const DOMAIN_NAMES = {
  'DOM01': 'Mando',
  'DOM02': 'Tato',
  'DOM03': 'Ouvinte',
  'DOM04': 'VP/MTS',
  'DOM05': 'Brincar',
  'DOM06': 'Social',
  'DOM07': 'Imitação',
  'DOM08': 'Ecoico',
  'DOM09': 'Vocal',
  'DOM10': 'LRFFC',
  'DOM11': 'Intraverbal',
  'DOM12': 'Rotinas de Classe',
  'DOM13': 'Estrutura Linguística',
  'DOM14': 'Leitura',
  'DOM15': 'Escrita',
  'DOM16': 'Matemática'
};

// ═══════════════════════════════════════════════════════════════
// DOMAIN NAMES EXPANDIDAS (para PDFReport)
// Nomes mais descritivos para relatórios técnicos
// ═══════════════════════════════════════════════════════════════
export const DOMAIN_NAMES_EXPANDED = {
  'DOM01': 'Mando',
  'DOM02': 'Tato',
  'DOM03': 'Ouvinte',
  'DOM04': 'Percepção Visual e Pareamento',
  'DOM05': 'Brincar Independente',
  'DOM06': 'Comportamento Social',
  'DOM07': 'Imitação',
  'DOM08': 'Ecoico',
  'DOM09': 'Vocal Espontâneo',
  'DOM10': 'LRFFC (Ouvinte por Função)',
  'DOM11': 'Intraverbal',
  'DOM12': 'Rotinas de Grupo',
  'DOM13': 'Estrutura Linguística',
  'DOM14': 'Leitura',
  'DOM15': 'Escrita',
  'DOM16': 'Matemática'
};

// ═══════════════════════════════════════════════════════════════
// DOMAIN NAMES PARA PEI (Task Analysis)
// Nomes descritivos usados no PEI Screen
// ═══════════════════════════════════════════════════════════════
export const DOMAIN_NAMES_PEI = {
  'DOM01': 'Mando',
  'DOM02': 'Tato',
  'DOM03': 'Ouvinte',
  'DOM04': 'Percepção Visual / MTS',
  'DOM05': 'Brincar Independente',
  'DOM06': 'Social / Brincar Social',
  'DOM07': 'Imitação',
  'DOM08': 'Ecoico',
  'DOM09': 'Vocal Espontâneo',
  'DOM10': 'ROFCC',
  'DOM11': 'Intraverbal',
  'DOM12': 'Rotina de Grupo',
  'DOM13': 'Estrutura Linguística',
  'DOM14': 'Leitura',
  'DOM15': 'Escrita',
  'DOM16': 'Matemática'
};

// ═══════════════════════════════════════════════════════════════
// TASK ANALYSIS DOMAIN MAPPING
// Mapeamento entre códigos DOM e chaves do TASK_ANALYSIS_MAP_BY_LEVEL
// ═══════════════════════════════════════════════════════════════
export const TASK_ANALYSIS_DOMAIN_MAP = {
  'DOM01': 'MANDO',
  'DOM02': 'TATO',
  'DOM03': 'OUVINTE',
  'DOM04': 'HABILIDADES PERCEPTUAIS VISUAIS E PAREAMENTO AO MODELO',
  'DOM05': 'BRINCAR INDEPENDENTE',
  'DOM06': 'COMPORTAMENTO SOCIAL E BRINCAR SOCIAL',
  'DOM07': 'IMITAÇÃO',
  'DOM08': 'COMPORTAMENTO VOCAL ESPONTÂNEO',
  'DOM09': 'COMPORTAMENTO VOCAL ESPONTÂNEO',
  'DOM10': 'RESPOSTA DE OUVINTE POR FUNÇÃO, CARACTERÍSTICA E CLASSE',
  'DOM11': 'INTRAVERBAL',
  'DOM12': 'ROTINAS DE CLASSE E HABILIDADES DE GRUPO',
  'DOM13': 'ESTRUTURA LINGUÍSTICA',
  'DOM14': 'LEITURA',
  'DOM15': 'ESCRITA',
  'DOM16': 'MATEMÁTICA'
};

// ═══════════════════════════════════════════════════════════════
// STATUS COLORS
// Cores usadas para representar status de scores
// ═══════════════════════════════════════════════════════════════
export const STATUS_COLORS = {
  dominado: '#10b981',          // Verde
  emergente: '#f59e0b',          // Amarelo
  nao_observado: '#e2e8f0',      // Cinza claro
  // Variações para gradientes (RGB format)
  dominado_rgb: [16, 185, 129],
  emergente_rgb: [245, 158, 11],
  nao_observado_rgb: [226, 232, 240]
};

// ═══════════════════════════════════════════════════════════════
// COLOR PALETTE (Paleta de cores completa para PDFs)
// ═══════════════════════════════════════════════════════════════
export const COLOR_PALETTE = {
  primary: [124, 58, 237],        // Roxo principal
  secondary: [168, 85, 247],      // Roxo secundário
  green: [16, 185, 129],          // Verde
  green_light: [167, 243, 208],   // Verde claro
  yellow: [245, 158, 11],         // Amarelo
  yellow_light: [253, 230, 138],  // Amarelo claro
  red: [239, 68, 68],             // Vermelho
  red_light: [254, 202, 202],     // Vermelho claro
  blue: [59, 130, 246],           // Azul
  gray: [107, 114, 128],          // Cinza
  gray_light: [243, 244, 246],    // Cinza claro
  black: [31, 41, 55],            // Preto
  white: [255, 255, 255]          // Branco
};

// ═══════════════════════════════════════════════════════════════
// SCORE STATUS
// Valores de status para scores
// ═══════════════════════════════════════════════════════════════
export const SCORE_STATUS = {
  DOMINADO: 'dominado',
  EMERGENTE: 'emergente',
  NAO_OBSERVADO: 'nao_observado'
};

// ═══════════════════════════════════════════════════════════════
// LOCALSTORAGE KEYS
// Chaves para armazenamento local
// ═══════════════════════════════════════════════════════════════
export const STORAGE_KEY = 'vbmapp_sessions';

// ═══════════════════════════════════════════════════════════════
// BARRIERS NAMES
// Lista de possíveis barreiras encontradas em PDFReport
// ═══════════════════════════════════════════════════════════════
export const BARRIERS_NAMES = [
  'Comportamento negativo',
  'Controle instrucional fraco',
  'Mando fraco ou ausente',
  'Tato fraco ou ausente',
  'Imitação motora fraca',
  'Ecoico ausente ou fraco',
  'VP-MTS fraco',
  'Responder de ouvinte fraco',
  'Intraverbal ausente ou fraco',
  'Habilidades sociais fracas',
  'Dependente de dicas',
  'Resposta de adivinhação',
  'Rastreamento comprometido',
  'Discriminação condicional falha',
  'Falha em generalizar',
  'OMs fracas ou atípicas',
  'Custo de resposta enfraquece OM',
  'Dependência de reforço',
  'Autoestimulação',
  'Dificuldades articulatórias',
  'Comportamento obsessivo-compulsivo',
  'Hiperatividade',
  'Falha em manter contato visual',
  'Defesa sensorial'
];

// ═══════════════════════════════════════════════════════════════
// CONSTANTS FOR DEFAULTS
// Valores padrão usados na aplicação
// ═══════════════════════════════════════════════════════════════
export const DEFAULTS = {
  TOTAL_MILESTONES: 154,
  MAX_BARRIER_SCORE: 4,
  MAX_TOTAL_BARRIERS: 96,
  PEI_VALIDITY_MONTHS: 6,
  VBMAPP_RECHECK_MONTHS: 3,
  PERFORMANCE_THRESHOLD_HIGH: 60,    // >= 60% = forte
  PERFORMANCE_THRESHOLD_MEDIUM: 30   // 30-60% = médio
};
