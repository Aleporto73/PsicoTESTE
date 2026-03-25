/*
 * useIDFBRLogic — Hook de lógica do IDF-BR v0.1
 *
 * SEPARADO do MDF-BR — lógica própria.
 * Scoring: S=1.0, P=0.5, N=0.0, NA=null
 * NA NUNCA é tratado como zero.
 * Intervenções mapeadas separadamente (N e P geram plano).
 */

import { useState, useCallback, useMemo } from 'react';
import {
  IDF_BR_META,
  IDF_BR_ITEMS,
  IDF_BR_INTERVENTION_MAP,
  getItemsByBand,
  getInterventions,
  getBandForAge,
} from '../data/instruments/idf_br';

const SCORE_VALUES = { S: 1.0, P: 0.5, N: 0.0, NA: null };

/**
 * Compute domain and total scores for a band
 */
export function computeIDFResult(bandCode, responses) {
  const items = getItemsByBand(bandCode);
  const domainResults = {};
  let totalValid = 0;
  let totalScore = 0;
  let naCount = 0;
  const interventionPlan = [];

  // Init domains
  for (const d of IDF_BR_META.domains) {
    domainResults[d.code] = { code: d.code, label: d.label, items: [], validCount: 0, totalScore: 0, naCount: 0 };
  }

  for (const item of items) {
    const scoreCode = responses[item.item_id];
    const scoreValue = scoreCode ? SCORE_VALUES[scoreCode] : undefined;
    const dr = domainResults[item.domain_code];

    const itemResult = {
      item_id: item.item_id,
      score_code: scoreCode || null,
      score_value: scoreValue !== undefined ? scoreValue : null,
    };
    dr.items.push(itemResult);

    if (scoreCode === 'NA' || !scoreCode) {
      naCount++;
      dr.naCount++;
    } else {
      const val = SCORE_VALUES[scoreCode];
      totalValid++;
      totalScore += val;
      dr.validCount++;
      dr.totalScore += val;
    }

    // Collect interventions for N and P
    if (scoreCode === 'N' || scoreCode === 'P') {
      const maps = getInterventions(item.item_id, scoreCode);
      maps.forEach(m => interventionPlan.push({
        ...m,
        item_text: item.item_text_authored,
        domain_code: item.domain_code,
        band_code: item.band_code,
      }));
    }
  }

  // Compute domain percentages
  const dominios = IDF_BR_META.domains.map(d => {
    const dr = domainResults[d.code];
    const maxPossible = dr.validCount * 1.0; // max is 1.0 per item
    const pct = maxPossible > 0 ? (dr.totalScore / maxPossible) * 100 : null;
    return {
      code: d.code,
      label: d.label,
      total_score: dr.totalScore,
      valid_count: dr.validCount,
      na_count: dr.naCount,
      percentage: pct !== null ? Math.round(pct * 10) / 10 : null,
      items: dr.items,
    };
  });

  // Total percentage
  const maxPossible = totalValid * 1.0;
  const totalPct = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

  return {
    instrument_version: IDF_BR_META.version,
    band_code: bandCode,
    total_score: Math.round(totalScore * 10) / 10,
    total_valid: totalValid,
    total_items: items.length,
    na_count: naCount,
    total_percentage: Math.round(totalPct * 10) / 10,
    dominios,
    intervention_plan: interventionPlan,
    items_n: items.filter(i => responses[i.item_id] === 'N').map(i => i.item_id),
    items_p: items.filter(i => responses[i.item_id] === 'P').map(i => i.item_id),
    concluded_at: new Date().toISOString(),
  };
}

/**
 * React hook
 */
export default function useIDFBRLogic(sessionInfo, isReadOnly = false) {
  const existingData = sessionInfo?.instruments?.find(i => i.instrument_id === 'idf_br');
  const existingResponses = existingData?.responses || {};
  const existingBand = existingData?.band_code || null;

  const [selectedBand, setSelectedBand] = useState(existingBand);
  const [responses, setResponses] = useState(existingResponses);

  const currentItems = useMemo(() => {
    if (!selectedBand) return [];
    return getItemsByBand(selectedBand);
  }, [selectedBand]);

  const handleScoreChange = useCallback((itemId, scoreCode) => {
    if (isReadOnly) return;
    setResponses(prev => ({ ...prev, [itemId]: scoreCode }));
  }, [isReadOnly]);

  const progress = useMemo(() => {
    const total = currentItems.length;
    const answered = currentItems.filter(item => {
      const r = responses[item.item_id];
      return r && ['S', 'P', 'N', 'NA'].includes(r);
    }).length;
    return { total, answered, percent: total > 0 ? Math.round((answered / total) * 100) : 0 };
  }, [currentItems, responses]);

  const result = useMemo(() => {
    if (!selectedBand || progress.answered === 0) return null;
    return computeIDFResult(selectedBand, responses);
  }, [selectedBand, responses, progress.answered]);

  const selectBandByAge = useCallback((ageMonths) => {
    const band = getBandForAge(ageMonths);
    setSelectedBand(band);
    setResponses({});
  }, []);

  const buildFinalizePayload = useCallback(() => {
    if (!selectedBand || !result) return null;
    return {
      instrument_id: 'idf_br',
      band_code: selectedBand,
      responses: { ...responses },
      result: { ...result },
      completed_at: new Date().toISOString(),
    };
  }, [selectedBand, responses, result]);

  return {
    selectedBand,
    setSelectedBand,
    responses,
    currentItems,
    progress,
    result,
    handleScoreChange,
    selectBandByAge,
    buildFinalizePayload,
    meta: IDF_BR_META,
    bands: IDF_BR_META.bands,
    domains: IDF_BR_META.domains,
    existingData,
  };
}
