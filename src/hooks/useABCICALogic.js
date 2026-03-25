/*
 * useABCICALogic - Hook para ABC/ICA
 * Autism Behavior Checklist / Inventário de Comportamentos Autísticos
 *
 * 57 itens, resposta binária (SIM/NÃO), pesos fixos (1-4)
 * 5 subescalas: ES, RE, CO, LG, PS
 *
 * Fluxo: Subescala por subescala → Calcular → Resultados
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ABC_ICA_ITEMS,
  ABC_ICA_SUBSCALES,
  ABC_ICA_META,
  calculateABCICAScores,
  getABCICASubscaleById,
} from '../data/instruments/abc_ica';

export default function useABCICALogic(sessionInfo, isReadOnly) {
  const existingData = sessionInfo?.instruments?.find?.(i => i.instrument_id === 'abc_ica')?.data
    || sessionInfo?.instruments?.abc_ica || {};

  const [responses, setResponses] = useState(existingData.responses || {});
  const [subscaleIndex, setSubscaleIndex] = useState(0);
  const [scores, setScores] = useState(existingData.scores || null);

  // ── Subescala atual ──
  const currentSubscale = ABC_ICA_SUBSCALES[subscaleIndex] || null;

  // ── Itens da subescala atual ──
  const currentItems = useMemo(() => {
    if (!currentSubscale) return [];
    return ABC_ICA_ITEMS.filter(item => item.subscale === currentSubscale.id);
  }, [currentSubscale]);

  // ── Progresso geral ──
  const progress = useMemo(() => {
    let totalAnswered = 0;
    let completedSubscales = 0;

    for (const sub of ABC_ICA_SUBSCALES) {
      const subItems = ABC_ICA_ITEMS.filter(i => i.subscale === sub.id);
      let subAnswered = 0;
      for (const item of subItems) {
        if (responses[String(item.num)] !== undefined) {
          totalAnswered++;
          subAnswered++;
        }
      }
      if (subAnswered === subItems.length) completedSubscales++;
    }

    return {
      totalSubscales: ABC_ICA_SUBSCALES.length,
      completedSubscales,
      totalItems: ABC_ICA_META.totalItems,
      answeredItems: totalAnswered,
      percentItems: ABC_ICA_META.totalItems > 0
        ? Math.round((totalAnswered / ABC_ICA_META.totalItems) * 100) : 0,
      percentSubscales: ABC_ICA_SUBSCALES.length > 0
        ? Math.round((completedSubscales / ABC_ICA_SUBSCALES.length) * 100) : 0,
    };
  }, [responses]);

  // ── Progresso por subescala ──
  const getSubscaleProgress = useCallback((subscaleId) => {
    const subItems = ABC_ICA_ITEMS.filter(i => i.subscale === subscaleId);
    if (subItems.length === 0) return { answered: 0, total: 0, percent: 0, complete: false };

    let answered = 0;
    for (const item of subItems) {
      if (responses[String(item.num)] !== undefined) answered++;
    }

    return {
      answered,
      total: subItems.length,
      percent: Math.round((answered / subItems.length) * 100),
      complete: answered === subItems.length,
    };
  }, [responses]);

  // ── Responder item ──
  const setItemResponse = useCallback((itemNum, value) => {
    if (isReadOnly) return;
    setResponses(prev => ({ ...prev, [String(itemNum)]: value }));
  }, [isReadOnly]);

  // ── Marcar todos SIM na subescala atual ──
  const markAllYes = useCallback(() => {
    if (isReadOnly || !currentSubscale) return;
    const subItems = ABC_ICA_ITEMS.filter(i => i.subscale === currentSubscale.id);
    setResponses(prev => {
      const updated = { ...prev };
      subItems.forEach(item => { updated[String(item.num)] = true; });
      return updated;
    });
  }, [isReadOnly, currentSubscale]);

  // ── Marcar todos NÃO na subescala atual ──
  const markAllNo = useCallback(() => {
    if (isReadOnly || !currentSubscale) return;
    const subItems = ABC_ICA_ITEMS.filter(i => i.subscale === currentSubscale.id);
    setResponses(prev => {
      const updated = { ...prev };
      subItems.forEach(item => { updated[String(item.num)] = false; });
      return updated;
    });
  }, [isReadOnly, currentSubscale]);

  // ── Navegação ──
  const goToSubscale = useCallback((idx) => {
    setSubscaleIndex(idx);
  }, []);

  const nextSubscale = useCallback(() => {
    if (subscaleIndex < ABC_ICA_SUBSCALES.length - 1) {
      setSubscaleIndex(subscaleIndex + 1);
    }
  }, [subscaleIndex]);

  const prevSubscale = useCallback(() => {
    if (subscaleIndex > 0) {
      setSubscaleIndex(subscaleIndex - 1);
    }
  }, [subscaleIndex]);

  // ── Calcular scores ──
  const calculateScores = useCallback(() => {
    const result = calculateABCICAScores(responses);
    setScores(result);
    return result;
  }, [responses]);

  // ── Verificar se subescala está completa ──
  const isSubscaleComplete = useCallback((subscaleId) => {
    return getSubscaleProgress(subscaleId).complete;
  }, [getSubscaleProgress]);

  const isCurrentSubscaleComplete = currentSubscale ? isSubscaleComplete(currentSubscale.id) : false;
  const isLastSubscale = subscaleIndex === ABC_ICA_SUBSCALES.length - 1;

  return {
    // Estado
    responses,
    subscaleIndex,
    scores,

    // Dados
    subscales: ABC_ICA_SUBSCALES,
    items: ABC_ICA_ITEMS,
    currentSubscale,
    currentItems,
    meta: ABC_ICA_META,

    // Progresso
    progress,
    getSubscaleProgress,
    isCurrentSubscaleComplete,
    isLastSubscale,
    isSubscaleComplete,

    // Ações
    setItemResponse,
    markAllYes,
    markAllNo,
    goToSubscale,
    nextSubscale,
    prevSubscale,
    calculateScores,
  };
}
