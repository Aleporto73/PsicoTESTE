/*
 * useCARS2Logic - Hook para CARS-2 ST
 * Childhood Autism Rating Scale, Second Edition (Standard Form)
 *
 * 15 itens, pontua\u00e7\u00e3o 1-4 (com meios 0.5)
 * Fluxo: Item por item (tela \u00fanica com scroll) \u2192 Calcular \u2192 Resultados
 */

import { useState, useCallback, useMemo } from 'react';
import {
  CARS2_ITEMS,
  CARS2_META,
  CARS2_SCORE_OPTIONS,
  calculateCARS2Scores,
} from '../data/instruments/cars2';

export default function useCARS2Logic(sessionInfo, isReadOnly) {
  const existingData = sessionInfo?.instruments?.find?.(i => i.instrument_id === 'cars2')?.data
    || sessionInfo?.instruments?.cars2 || {};

  const [responses, setResponses] = useState(existingData.responses || {});
  const [scores, setScores] = useState(existingData.scores || null);

  // \u2500\u2500 Progresso geral \u2500\u2500
  const progress = useMemo(() => {
    let answered = 0;
    for (const item of CARS2_ITEMS) {
      if (responses[String(item.num)] !== undefined && responses[String(item.num)] !== null) {
        answered++;
      }
    }
    return {
      totalItems: CARS2_META.totalItems,
      answeredItems: answered,
      percent: CARS2_META.totalItems > 0
        ? Math.round((answered / CARS2_META.totalItems) * 100) : 0,
      isComplete: answered === CARS2_META.totalItems,
    };
  }, [responses]);

  // \u2500\u2500 Responder item \u2500\u2500
  const setItemResponse = useCallback((itemNum, value) => {
    if (isReadOnly) return;
    setResponses(prev => ({ ...prev, [String(itemNum)]: value }));
  }, [isReadOnly]);

  // \u2500\u2500 Limpar resposta de um item \u2500\u2500
  const clearItemResponse = useCallback((itemNum) => {
    if (isReadOnly) return;
    setResponses(prev => {
      const updated = { ...prev };
      delete updated[String(itemNum)];
      return updated;
    });
  }, [isReadOnly]);

  // \u2500\u2500 Marcar todos com um valor \u2500\u2500
  const markAll = useCallback((value) => {
    if (isReadOnly) return;
    setResponses(() => {
      const updated = {};
      CARS2_ITEMS.forEach(item => { updated[String(item.num)] = value; });
      return updated;
    });
  }, [isReadOnly]);

  // \u2500\u2500 Calcular scores \u2500\u2500
  const calculateScoresAction = useCallback(() => {
    const result = calculateCARS2Scores(responses);
    setScores(result);
    return result;
  }, [responses]);

  return {
    // Estado
    responses,
    scores,

    // Dados
    items: CARS2_ITEMS,
    scoreOptions: CARS2_SCORE_OPTIONS,
    meta: CARS2_META,

    // Progresso
    progress,

    // A\u00e7\u00f5es
    setItemResponse,
    clearItemResponse,
    markAll,
    calculateScores: calculateScoresAction,
  };
}
