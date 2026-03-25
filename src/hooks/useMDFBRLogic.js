/*
 * useMDFBRLogic — Motor paramétrico MDF-BR v1.0
 *
 * IFG = (soma(score_valido * peso) / soma(max_score * peso)) * 100
 * NULL sai do numerador E do denominador
 * Inconclusivo: >= 2 NULL na mesma avaliação/faixa
 * Red flags: HARD → mín ALTO_RISCO, SOFT → sobe 1 nível
 *
 * engine_version = "v1.0"
 */

import { useState, useCallback, useMemo } from 'react';
import {
  MDF_BR_META,
  MDF_BR_ITEMS,
  MDF_BR_WEIGHT_PROFILES,
  MDF_BR_CHECKPOINT_WEIGHTS,
  getItemsByCheckpoint,
  getCheckpointForAge,
  getWeightProfile,
} from '../data/instruments/mdf_br';

const ENGINE_VERSION = 'v1.0';
const MAX_SCORE = 3;

// Risk status levels (ordered)
const RISK_LEVELS = ['BAIXO_RISCO', 'ATENCAO', 'ALTO_RISCO'];

function riskIndex(status) {
  return RISK_LEVELS.indexOf(status);
}

function raiseRisk(currentStatus, levels = 1) {
  const idx = riskIndex(currentStatus);
  const newIdx = Math.min(idx + levels, RISK_LEVELS.length - 1);
  return RISK_LEVELS[newIdx];
}

/**
 * Core engine: compute IFG and status for a set of responses at a given checkpoint
 */
export function computeMDFResult(checkpoint, responses) {
  const items = getItemsByCheckpoint(checkpoint);
  const weights = getWeightProfile(checkpoint);
  const profileCode = MDF_BR_CHECKPOINT_WEIGHTS[checkpoint];

  // Count NULLs
  let nullCount = 0;
  const validResponses = [];
  const itensZerados = [];
  const domainScores = {};

  for (const item of items) {
    const resp = responses[item.item_id];
    const score = resp === null || resp === undefined || resp === 'NULL' ? null : Number(resp);

    domainScores[item.domain_code] = { score, item_id: item.item_id };

    if (score === null) {
      nullCount++;
    } else {
      validResponses.push({ item, score });
      if (score === 0) {
        itensZerados.push(item.item_id);
      }
    }
  }

  // Check inconclusivo
  const isInconclusivo = nullCount >= 2;

  // Compute IFG (only valid scores)
  let numerator = 0;
  let denominator = 0;

  for (const { item, score } of validResponses) {
    const w = weights[item.domain_code] || 1.0;
    numerator += score * w;
    denominator += MAX_SCORE * w;
  }

  const ifgTotal = denominator > 0 ? (numerator / denominator) * 100 : 0;

  // Base status from IFG
  let statusBase;
  if (ifgTotal >= 80) statusBase = 'BAIXO_RISCO';
  else if (ifgTotal >= 60) statusBase = 'ATENCAO';
  else statusBase = 'ALTO_RISCO';

  // Red flags
  let hasHardRedFlag = false;
  let hasSoftRedFlag = false;
  const redFlagDetails = [];

  for (const { item, score } of validResponses) {
    if (item.red_flag_type === 'NONE') continue;
    if (item.red_flag_trigger === 'SCORE_EQ_0' && score === 0) {
      redFlagDetails.push({
        item_id: item.item_id,
        domain: item.domain_code,
        type: item.red_flag_type,
        note: item.red_flag_note,
      });
      if (item.red_flag_type === 'HARD') hasHardRedFlag = true;
      if (item.red_flag_type === 'SOFT') hasSoftRedFlag = true;
    }
  }

  // Final status with hierarchy: inconclusivo → IFG → HARD → SOFT
  let statusRisco;
  if (isInconclusivo) {
    statusRisco = 'INCONCLUSIVO';
  } else {
    statusRisco = statusBase;
    // HARD red flag → minimum ALTO_RISCO
    if (hasHardRedFlag && riskIndex(statusRisco) < riskIndex('ALTO_RISCO')) {
      statusRisco = 'ALTO_RISCO';
    }
    // SOFT red flag → raise 1 level
    if (hasSoftRedFlag && !hasHardRedFlag) {
      statusRisco = raiseRisk(statusRisco, 1);
    }
  }

  // Build domain results
  const dominios = MDF_BR_META.domains.map(d => ({
    code: d.code,
    label: d.label,
    score: domainScores[d.code]?.score ?? null,
    weight: weights[d.code],
  }));

  return {
    engine_version: ENGINE_VERSION,
    checkpoint,
    weight_profile: profileCode,
    ifg_total: Math.round(ifgTotal * 100) / 100,
    status_base: statusBase,
    status_risco: statusRisco,
    hard_red_flag: hasHardRedFlag,
    soft_red_flag: hasSoftRedFlag,
    red_flag_details: redFlagDetails,
    missing_items_count: nullCount,
    itens_zerados: itensZerados,
    dominios,
    is_inconclusivo: isInconclusivo,
    reason_code: isInconclusivo ? `NULL_COUNT_${nullCount}_GE_2` : null,
  };
}

/**
 * Build snapshot for persistence (immutable after conclude)
 */
export function buildSnapshot(checkpoint, responses, result) {
  return {
    engine_version: ENGINE_VERSION,
    checkpoint,
    weight_profile: result.weight_profile,
    weights_used: getWeightProfile(checkpoint),
    responses: { ...responses },
    result: { ...result },
    missing_items_count: result.missing_items_count,
    reason_code: result.reason_code,
    concluded_at: new Date().toISOString(),
  };
}

/**
 * React hook for MDF-BR screen logic
 */
export default function useMDFBRLogic(sessionInfo, isReadOnly = false) {
  // Load existing data if present
  const existingData = sessionInfo?.instruments?.find(i => i.instrument_id === 'mdf_br');
  const existingResponses = existingData?.responses || {};
  const existingCheckpoint = existingData?.checkpoint || null;

  const [selectedCheckpoint, setSelectedCheckpoint] = useState(existingCheckpoint);
  const [responses, setResponses] = useState(existingResponses);

  // Items for selected checkpoint
  const currentItems = useMemo(() => {
    if (!selectedCheckpoint) return [];
    return getItemsByCheckpoint(selectedCheckpoint);
  }, [selectedCheckpoint]);

  // Handle score change
  const handleScoreChange = useCallback((itemId, score) => {
    if (isReadOnly) return;
    setResponses(prev => ({
      ...prev,
      [itemId]: score,
    }));
  }, [isReadOnly]);

  // Progress tracking
  const progress = useMemo(() => {
    const total = currentItems.length;
    const answered = currentItems.filter(item => {
      const r = responses[item.item_id];
      return r !== undefined && r !== null && r !== '';
    }).length;
    return {
      total,
      answered,
      percent: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  }, [currentItems, responses]);

  // Compute result
  const result = useMemo(() => {
    if (!selectedCheckpoint || progress.answered === 0) return null;
    return computeMDFResult(selectedCheckpoint, responses);
  }, [selectedCheckpoint, responses, progress.answered]);

  // Select checkpoint based on child age
  const selectCheckpointByAge = useCallback((ageMonths) => {
    const cp = getCheckpointForAge(ageMonths);
    setSelectedCheckpoint(cp);
    setResponses({});
  }, []);

  // Build finalize payload
  const buildFinalizePayload = useCallback(() => {
    if (!selectedCheckpoint || !result) return null;
    const snapshot = buildSnapshot(selectedCheckpoint, responses, result);
    return {
      instrument_id: 'mdf_br',
      checkpoint: selectedCheckpoint,
      responses: { ...responses },
      result: { ...result },
      snapshot_motor: snapshot,
      completed_at: new Date().toISOString(),
    };
  }, [selectedCheckpoint, responses, result]);

  return {
    // State
    selectedCheckpoint,
    setSelectedCheckpoint,
    responses,
    currentItems,
    progress,
    result,

    // Actions
    handleScoreChange,
    selectCheckpointByAge,
    buildFinalizePayload,

    // Data
    meta: MDF_BR_META,
    checkpoints: MDF_BR_META.checkpoints,
    domains: MDF_BR_META.domains,
    existingData,
  };
}
