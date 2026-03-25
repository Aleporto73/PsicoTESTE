/*
 * useDenverIILogic — Hook de lógica para o Denver II
 *
 * Gerencia: respostas (score + interpretação), progresso por domínio, navegação, cálculo
 */

import { useState, useMemo, useCallback } from 'react';
import {
  DENVER_DOMAINS,
  DENVER_ITEMS,
  DENVER_TOTAL_ITEMS,
  calculateDenverScores,
} from '../data/instruments/denver_ii';

export default function useDenverIILogic(sessionInfo) {
  // Carregar dados existentes (se houver)
  const existingData = sessionInfo?.instruments?.find?.(i => i.instrument_id === 'denver_ii')?.data;

  // Estado: respostas { [domainId_itemNum]: { score, interpretation } }
  const [responses, setResponses] = useState(existingData?.responses || {});

  // Domínio ativo na navegação
  const [activeDomainIdx, setActiveDomainIdx] = useState(0);

  // Setar escore de um item
  const setItemScore = useCallback((domainId, itemNum, score) => {
    const key = domainId + '_' + itemNum;
    setResponses(prev => ({
      ...prev,
      [key]: { ...prev[key], score },
    }));
  }, []);

  // Setar interpretação de um item
  const setItemInterpretation = useCallback((domainId, itemNum, interpretation) => {
    const key = domainId + '_' + itemNum;
    setResponses(prev => ({
      ...prev,
      [key]: { ...prev[key], interpretation },
    }));
  }, []);

  // Limpar item
  const clearItem = useCallback((domainId, itemNum) => {
    const key = domainId + '_' + itemNum;
    setResponses(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Marcar todos do domínio ativo com o mesmo score
  const markAllDomain = useCallback((domainId, score) => {
    const items = DENVER_ITEMS[domainId];
    setResponses(prev => {
      const next = { ...prev };
      for (const item of items) {
        const key = domainId + '_' + item.num;
        next[key] = { ...next[key], score };
      }
      return next;
    });
  }, []);

  // Progresso por domínio
  const domainProgress = useMemo(() => {
    const result = {};
    for (const domain of DENVER_DOMAINS) {
      const items = DENVER_ITEMS[domain.id];
      let answered = 0;
      for (const item of items) {
        const key = domain.id + '_' + item.num;
        if (responses[key]?.score && responses[key]?.interpretation) {
          answered++;
        }
      }
      result[domain.id] = {
        total: items.length,
        answered,
        percent: items.length > 0 ? Math.round((answered / items.length) * 100) : 0,
      };
    }
    return result;
  }, [responses]);

  // Progresso global
  const globalProgress = useMemo(() => {
    let answered = 0;
    for (const domain of DENVER_DOMAINS) {
      answered += domainProgress[domain.id].answered;
    }
    return {
      total: DENVER_TOTAL_ITEMS,
      answered,
      percent: DENVER_TOTAL_ITEMS > 0 ? Math.round((answered / DENVER_TOTAL_ITEMS) * 100) : 0,
    };
  }, [domainProgress]);

  // Calcular resultados finais
  const scores = useMemo(() => {
    if (globalProgress.answered === 0) return null;
    return calculateDenverScores(responses);
  }, [responses, globalProgress.answered]);

  // Navegação entre domínios
  const goNextDomain = useCallback(() => {
    setActiveDomainIdx(prev => Math.min(prev + 1, DENVER_DOMAINS.length - 1));
  }, []);

  const goPrevDomain = useCallback(() => {
    setActiveDomainIdx(prev => Math.max(prev - 1, 0));
  }, []);

  return {
    responses,
    activeDomainIdx,
    setActiveDomainIdx,
    setItemScore,
    setItemInterpretation,
    clearItem,
    markAllDomain,
    domainProgress,
    globalProgress,
    scores,
    goNextDomain,
    goPrevDomain,
  };
}
