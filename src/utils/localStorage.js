/*
 * LOCALSTORAGE UTILITIES
 *
 * Funções centralizadas para operações com localStorage
 * Evita duplicação de código de persistência em toda a aplicação
 */

import { STORAGE_KEY } from '../data/constants';

/**
 * Carrega todas as sessões do localStorage
 * @returns {array} Array de sessões ou array vazio se nenhuma encontrada
 */
export const loadSessions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Erro ao carregar sessões:', error);
    return [];
  }
};

/**
 * Salva sessões no localStorage
 * @param {array} sessions - Array de sessões para salvar
 * @returns {boolean} True se salvou com sucesso, false caso contrário
 */
export const saveSessions = (sessions) => {
  try {
    if (!Array.isArray(sessions)) {
      console.warn('saveSessions: sessions não é um array válido');
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch (error) {
    console.error('Erro ao salvar sessões:', error);
    return false;
  }
};

/**
 * Obtém uma sessão específica pelo ID
 * @param {string} sessionId - ID da sessão a buscar
 * @returns {object|null} Objeto da sessão ou null se não encontrada
 */
export const getSessionById = (sessionId) => {
  const sessions = loadSessions();
  return sessions.find(s => s.session_id === sessionId) || null;
};

/**
 * Obtém todas as sessões de uma criança específica
 * @param {string} childName - Nome da criança
 * @returns {array} Array de sessões da criança
 */
export const getSessionsByChild = (childName) => {
  const sessions = loadSessions();
  return sessions.filter(s => s.child_name === childName);
};

/**
 * Atualiza uma sessão específica no localStorage
 * @param {string} sessionId - ID da sessão a atualizar
 * @param {object} updates - Objeto com campos a atualizar
 * @returns {boolean} True se atualizou com sucesso, false caso contrário
 */
export const updateSession = (sessionId, updates) => {
  try {
    const sessions = loadSessions();
    const updatedSessions = sessions.map(s =>
      s.session_id === sessionId
        ? {
          ...s,
          ...updates,
          lastUpdated: new Date().toISOString()
        }
        : s
    );

    // Se a sessão não foi encontrada, não salva
    if (sessions.length === updatedSessions.length) {
      return saveSessions(updatedSessions);
    }

    return false;
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return false;
  }
};

/**
 * Adiciona uma nova sessão ao localStorage
 * @param {object} session - Objeto da sessão a adicionar
 * @returns {boolean} True se adicionou com sucesso, false caso contrário
 */
export const addSession = (session) => {
  try {
    if (!session || !session.session_id) {
      console.warn('addSession: sessão sem ID válido');
      return false;
    }

    const sessions = loadSessions();

    // Verifica se já existe uma sessão com este ID
    if (sessions.some(s => s.session_id === session.session_id)) {
      console.warn('addSession: sessão com este ID já existe');
      return false;
    }

    const newSession = {
      ...session,
      lastUpdated: new Date().toISOString()
    };

    return saveSessions([newSession, ...sessions]);
  } catch (error) {
    console.error('Erro ao adicionar sessão:', error);
    return false;
  }
};

/**
 * Remove uma sessão do localStorage
 * @param {string} sessionId - ID da sessão a remover
 * @returns {boolean} True se removeu com sucesso, false caso contrário
 */
export const removeSession = (sessionId) => {
  try {
    const sessions = loadSessions();
    const filtered = sessions.filter(s => s.session_id !== sessionId);

    if (filtered.length === sessions.length) {
      console.warn('removeSession: sessão não encontrada');
      return false;
    }

    return saveSessions(filtered);
  } catch (error) {
    console.error('Erro ao remover sessão:', error);
    return false;
  }
};

/**
 * Remove todas as sessões de uma criança específica
 * @param {string} childName - Nome da criança
 * @returns {boolean} True se removeu com sucesso, false caso contrário
 */
export const removeSessionsByChild = (childName) => {
  try {
    const sessions = loadSessions();
    const filtered = sessions.filter(s => s.child_name !== childName);

    if (filtered.length === sessions.length) {
      console.warn('removeSessionsByChild: nenhuma sessão encontrada para esta criança');
      return false;
    }

    return saveSessions(filtered);
  } catch (error) {
    console.error('Erro ao remover sessões da criança:', error);
    return false;
  }
};

/**
 * Limpa todas as sessões do localStorage
 * CUIDADO: Esta ação não pode ser desfeita
 * @returns {boolean} True se limpou com sucesso
 */
export const clearAllSessions = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar sessões:', error);
    return false;
  }
};

/**
 * Exporta todas as sessões como JSON para backup/download
 * @returns {string} String JSON das sessões
 */
export const exportSessionsToJSON = () => {
  try {
    const sessions = loadSessions();
    return JSON.stringify(sessions, null, 2);
  } catch (error) {
    console.error('Erro ao exportar sessões:', error);
    return '';
  }
};

/**
 * Importa sessões de um JSON (para restore de backup)
 * @param {string} jsonString - String JSON com as sessões
 * @param {boolean} merge - Se true, mescla com sessões existentes; se false, substitui
 * @returns {boolean} True se importou com sucesso, false caso contrário
 */
export const importSessionsFromJSON = (jsonString, merge = true) => {
  try {
    const importedSessions = JSON.parse(jsonString);

    if (!Array.isArray(importedSessions)) {
      console.warn('importSessionsFromJSON: JSON não contém um array válido');
      return false;
    }

    if (merge) {
      const existing = loadSessions();
      // Remove duplicatas por session_id
      const existingIds = new Set(existing.map(s => s.session_id));
      const newSessions = importedSessions.filter(s => !existingIds.has(s.session_id));
      return saveSessions([...existing, ...newSessions]);
    } else {
      return saveSessions(importedSessions);
    }
  } catch (error) {
    console.error('Erro ao importar sessões:', error);
    return false;
  }
};

/**
 * Obtém estatísticas gerais sobre as sessões
 * @returns {object} Objeto com estatísticas {totalSessions, totalChildren, sessionsPerChild}
 */
export const getSessionsStats = () => {
  const sessions = loadSessions();
  const childrenSet = new Set(sessions.map(s => s.child_name));

  return {
    totalSessions: sessions.length,
    totalChildren: childrenSet.size,
    sessionsPerChild: Array.from(childrenSet).reduce((acc, childName) => {
      acc[childName] = sessions.filter(s => s.child_name === childName).length;
      return acc;
    }, {}),
    oldestSession: sessions.length > 0
      ? new Date(sessions[sessions.length - 1].created_at)
      : null,
    newestSession: sessions.length > 0
      ? new Date(sessions[0].created_at)
      : null
  };
};

/**
 * Valida se uma sessão tem todos os campos obrigatórios
 * @param {object} session - Sessão a validar
 * @returns {boolean} True se a sessão é válida
 */
export const isValidSession = (session) => {
  return (
    session &&
    typeof session === 'object' &&
    session.session_id &&
    session.child_name &&
    session.created_at &&
    typeof session.scores_snapshot === 'object'
  );
};
