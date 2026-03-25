/*
 * DOMAIN MAPPING UTILITIES
 *
 * Funções para trabalhar com mapeamento de domínios
 * evitando duplicação de lógica em componentes
 */

import {
  DOMAIN_NAMES,
  DOMAIN_NAMES_EXPANDED,
  DOMAIN_NAMES_PEI,
  TASK_ANALYSIS_DOMAIN_MAP
} from '../data/constants';

/**
 * Obtém o nome curto de um domínio (padrão para exibição)
 * @param {string} domCode - Código do domínio (ex: 'DOM01')
 * @returns {string} Nome do domínio
 */
export const getDomainName = (domCode) => {
  return DOMAIN_NAMES[domCode] || domCode;
};

/**
 * Obtém o nome expandido de um domínio (para relatórios técnicos)
 * @param {string} domCode - Código do domínio (ex: 'DOM01')
 * @returns {string} Nome expandido do domínio
 */
export const getDomainNameExpanded = (domCode) => {
  return DOMAIN_NAMES_EXPANDED[domCode] || domCode;
};

/**
 * Obtém o nome do domínio para PEI (Task Analysis)
 * @param {string} domCode - Código do domínio (ex: 'DOM01')
 * @returns {string} Nome do domínio para PEI
 */
export const getDomainNamePEI = (domCode) => {
  return DOMAIN_NAMES_PEI[domCode] || domCode;
};

/**
 * Obtém a chave correta do Task Analysis baseado no código do domínio
 * @param {string} domCode - Código do domínio (ex: 'DOM01')
 * @returns {string} Chave do Task Analysis Map
 */
export const getTaskAnalysisKey = (domCode) => {
  return TASK_ANALYSIS_DOMAIN_MAP[domCode] || domCode;
};

/**
 * Valida se um código de domínio é válido
 * @param {string} domCode - Código do domínio a validar
 * @returns {boolean} True se o código é válido
 */
export const isValidDomainCode = (domCode) => {
  return domCode in DOMAIN_NAMES;
};

/**
 * Obtém todos os códigos de domínios válidos
 * @returns {array} Array com todos os códigos de domínios
 */
export const getAllDomainCodes = () => {
  return Object.keys(DOMAIN_NAMES);
};

/**
 * Extrai o código de domínio de um blockId
 * Exemplos: 'DOM01-L1-M01' -> 'DOM01'
 *           'DOM05' -> 'DOM05'
 * @param {string} blockId - Identificador do bloco
 * @returns {string|null} Código do domínio ou null se inválido
 */
export const extractDomainCode = (blockId) => {
  const match = blockId.match(/^(DOM\d+)/);
  return match ? match[1] : null;
};

/**
 * Obtém informações estruturadas de um blockId
 * @param {string} blockId - Identificador do bloco (ex: 'DOM01-L1-M05')
 * @returns {object|null} Objeto com {domCode, level, milestone} ou null se inválido
 */
export const parseBlockId = (blockId) => {
  const match = blockId.match(/^(DOM\d+)-L(\d+)-M(\d+)$/);
  if (!match) return null;

  return {
    domCode: match[1],
    level: parseInt(match[2]),
    milestone: parseInt(match[3]),
    blockId: blockId
  };
};

/**
 * Constrói um blockId a partir de seus componentes
 * @param {string} domCode - Código do domínio (ex: 'DOM01')
 * @param {number} level - Nível (1, 2, 3)
 * @param {number} milestone - Número do milestone
 * @returns {string} BlockId formatado (ex: 'DOM01-L1-M05')
 */
export const buildBlockId = (domCode, level, milestone) => {
  if (!isValidDomainCode(domCode)) {
    throw new Error(`Código de domínio inválido: ${domCode}`);
  }
  return `${domCode}-L${level}-M${milestone}`;
};

/**
 * Agrupa blocos por domínio
 * @param {array} blockIds - Array de blockIds
 * @returns {object} Objeto com domínios como chaves e arrays de blocos como valores
 */
export const groupBlocksByDomain = (blockIds) => {
  const grouped = {};

  blockIds.forEach(blockId => {
    const domCode = extractDomainCode(blockId);
    if (domCode) {
      if (!grouped[domCode]) {
        grouped[domCode] = [];
      }
      grouped[domCode].push(blockId);
    }
  });

  return grouped;
};

/**
 * Filtra blocos por domínio
 * @param {array} blockIds - Array de blockIds
 * @param {string} domCode - Código do domínio para filtrar
 * @returns {array} Blocos do domínio especificado
 */
export const filterBlocksByDomain = (blockIds, domCode) => {
  return blockIds.filter(blockId => extractDomainCode(blockId) === domCode);
};

/**
 * Filtra blocos por nível
 * @param {array} blockIds - Array de blockIds
 * @param {number} level - Nível para filtrar
 * @returns {array} Blocos do nível especificado
 */
export const filterBlocksByLevel = (blockIds, level) => {
  return blockIds.filter(blockId => {
    const parsed = parseBlockId(blockId);
    return parsed && parsed.level === level;
  });
};

/**
 * Ordena domínios por código
 * @param {array} domCodes - Array de códigos de domínio
 * @returns {array} Domínios ordenados
 */
export const sortDomainCodes = (domCodes) => {
  return [...domCodes].sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });
};

/**
 * Calcula estatísticas de um domínio baseado em scores
 * @param {string} domCode - Código do domínio
 * @param {object} scores - Objeto com scores_snapshot (blockId -> status)
 * @returns {object} Objeto com estatísticas {total, dominados, emergentes, naoObservados, percentual}
 */
export const calculateDomainStats = (domCode, scores) => {
  const domainBlocks = filterBlocksByDomain(Object.keys(scores), domCode);

  const stats = {
    total: domainBlocks.length,
    dominados: 0,
    emergentes: 0,
    naoObservados: 0
  };

  domainBlocks.forEach(blockId => {
    const status = scores[blockId];
    if (status === 'dominado') stats.dominados++;
    else if (status === 'emergente') stats.emergentes++;
    else stats.naoObservados++;
  });

  stats.percentual = stats.total > 0
    ? Math.round((stats.dominados / stats.total) * 100)
    : 0;

  return stats;
};
