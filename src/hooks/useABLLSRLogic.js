/*
 * useABLLSRLogic - Hook para ABLLS-R
 * Assessment of Basic Language and Learning Skills - Revised
 *
 * 25 domínios, 543 itens, pontuação variável (0 a max_pts por item)
 *
 * Fluxo: Seleção de grupo → Domínio por domínio → Calcular → Resultados
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ABLLS_R_DOMAINS,
  ABLLS_R_DOMAIN_GROUPS,
  calculateABLLSRScores,
  getABLLSRDomainById,
} from '../data/instruments/ablls_r';

export default function useABLLSRLogic(sessionInfo, isReadOnly) {
  // Carregar dados existentes (se houver)
  const existingData = sessionInfo?.instruments?.find?.(i => i.instrument_id === 'ablls_r')?.data
    || sessionInfo?.instruments?.ablls_r || {};

  const [responses, setResponses] = useState(existingData.responses || {});
  const [domainIndex, setDomainIndex] = useState(0);
  const [scores, setScores] = useState(existingData.scores || null);
  const [activeGroupId, setActiveGroupId] = useState(null);

  // ── Domínio atual ──
  const currentDomain = ABLLS_R_DOMAINS[domainIndex] || null;

  // ── Grupos de domínios ──
  const groups = ABLLS_R_DOMAIN_GROUPS;

  // ── Domínios filtrados por grupo ativo (ou todos) ──
  const filteredDomains = useMemo(() => {
    if (!activeGroupId) return ABLLS_R_DOMAINS;
    const group = groups.find(g => g.id === activeGroupId);
    if (!group) return ABLLS_R_DOMAINS;
    return ABLLS_R_DOMAINS.filter(d => group.domains.includes(d.id));
  }, [activeGroupId, groups]);

  // ── Progresso geral ──
  const progress = useMemo(() => {
    let totalItems = 0;
    let answeredItems = 0;
    let completedDomains = 0;

    for (const domain of ABLLS_R_DOMAINS) {
      totalItems += domain.items.length;
      let domainAnswered = 0;
      for (const item of domain.items) {
        const key = `${domain.id}_${item.num}`;
        if (responses[key] !== undefined) {
          answeredItems++;
          domainAnswered++;
        }
      }
      if (domainAnswered === domain.items.length) {
        completedDomains++;
      }
    }

    return {
      totalDomains: ABLLS_R_DOMAINS.length,
      completedDomains,
      totalItems,
      answeredItems,
      percentItems: totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0,
      percentDomains: ABLLS_R_DOMAINS.length > 0 ? Math.round((completedDomains / ABLLS_R_DOMAINS.length) * 100) : 0,
    };
  }, [responses]);

  // ── Progresso por domínio ──
  const getDomainProgress = useCallback((domainId) => {
    const domain = getABLLSRDomainById(domainId);
    if (!domain) return { answered: 0, total: 0, percent: 0, complete: false };

    let answered = 0;
    for (const item of domain.items) {
      const key = `${domainId}_${item.num}`;
      if (responses[key] !== undefined) answered++;
    }

    return {
      answered,
      total: domain.items.length,
      percent: domain.items.length > 0 ? Math.round((answered / domain.items.length) * 100) : 0,
      complete: answered === domain.items.length,
    };
  }, [responses]);

  // ── Progresso por grupo ──
  const getGroupProgress = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return { completed: 0, total: 0, percent: 0 };

    let completed = 0;
    for (const dId of group.domains) {
      const dp = getDomainProgress(dId);
      if (dp.complete) completed++;
    }

    const total = group.domains.length;
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      complete: completed === total,
    };
  }, [groups, getDomainProgress]);

  // ── Responder item ──
  const setItemResponse = useCallback((domainId, itemNum, value) => {
    if (isReadOnly) return;
    const key = `${domainId}_${itemNum}`;
    setResponses(prev => ({ ...prev, [key]: value }));
  }, [isReadOnly]);

  // ── Marcar todos com valor específico no domínio atual ──
  const markAllInDomain = useCallback((value) => {
    if (isReadOnly || !currentDomain) return;
    setResponses(prev => {
      const updated = { ...prev };
      currentDomain.items.forEach(item => {
        updated[`${currentDomain.id}_${item.num}`] = value;
      });
      return updated;
    });
  }, [isReadOnly, currentDomain]);

  // ── Marcar todos com pontuação máxima no domínio atual ──
  const markAllMax = useCallback(() => {
    if (isReadOnly || !currentDomain) return;
    setResponses(prev => {
      const updated = { ...prev };
      currentDomain.items.forEach(item => {
        updated[`${currentDomain.id}_${item.num}`] = item.max_pts;
      });
      return updated;
    });
  }, [isReadOnly, currentDomain]);

  // ── Marcar todos com zero no domínio atual ──
  const markAllZero = useCallback(() => {
    markAllInDomain(0);
  }, [markAllInDomain]);

  // ── Navegação ──
  const goToDomain = useCallback((idx) => {
    setDomainIndex(idx);
  }, []);

  const goToDomainById = useCallback((domainId) => {
    const idx = ABLLS_R_DOMAINS.findIndex(d => d.id === domainId);
    if (idx >= 0) setDomainIndex(idx);
  }, []);

  const nextDomain = useCallback(() => {
    if (domainIndex < ABLLS_R_DOMAINS.length - 1) {
      setDomainIndex(domainIndex + 1);
    }
  }, [domainIndex]);

  const prevDomain = useCallback(() => {
    if (domainIndex > 0) {
      setDomainIndex(domainIndex - 1);
    }
  }, [domainIndex]);

  // ── Calcular scores ──
  const calculateScores = useCallback(() => {
    const result = calculateABLLSRScores(responses);
    setScores(result);
    return result;
  }, [responses]);

  // ── Verificar se domínio está completo ──
  const isDomainComplete = useCallback((domainId) => {
    return getDomainProgress(domainId).complete;
  }, [getDomainProgress]);

  const isCurrentDomainComplete = currentDomain ? isDomainComplete(currentDomain.id) : false;
  const isLastDomain = domainIndex === ABLLS_R_DOMAINS.length - 1;

  return {
    // Estado
    responses,
    domainIndex,
    scores,
    activeGroupId,

    // Dados
    domains: ABLLS_R_DOMAINS,
    groups,
    filteredDomains,
    currentDomain,

    // Progresso
    progress,
    getDomainProgress,
    getGroupProgress,
    isCurrentDomainComplete,
    isLastDomain,
    isDomainComplete,

    // Ações
    setActiveGroupId,
    setItemResponse,
    markAllMax,
    markAllZero,
    goToDomain,
    goToDomainById,
    nextDomain,
    prevDomain,
    calculateScores,
  };
}
