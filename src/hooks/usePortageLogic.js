/*
 * usePortageLogic - Lógica INTELIGENTE do Guia Portage
 *
 * CONCEITO:
 * - AUTOMÁTICO (padrão): Abre SOMENTE na faixa etária da criança.
 *   Maria 3a3m → aplica apenas faixa 3-4 anos, em cada uma das 5 áreas.
 * - MANUAL: O avaliador pode ligar outras faixas para aplicar também.
 * - Gráficos mostram APENAS as faixas que foram efetivamente aplicadas.
 * - Fluxo linear: área por área, só nas faixas ativas.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  PORTAGE_AREAS,
  PORTAGE_AGE_RANGES,
  PORTAGE_ITEMS,
  PORTAGE_EXPECTED_SCORES,
  calculatePortageScores,
  getPortageRiskLevel,
} from '../data/instruments/portage';
import { generateInstrumentReport } from '../utils/aiReport';

function getChildRangeId(ageInYears) {
  if (!ageInYears || ageInYears < 0) return '0_1';
  if (ageInYears < 1) return '0_1';
  if (ageInYears < 2) return '1_2';
  if (ageInYears < 3) return '2_3';
  if (ageInYears < 4) return '3_4';
  if (ageInYears < 5) return '4_5';
  return '5_6';
}

export function toArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return Object.values(obj).sort((a, b) => parseInt(a.number) - parseInt(b.number));
}

export default function usePortageLogic(sessionInfo, isReadOnly = false) {
  const existingData = sessionInfo?.instruments?.find(i => i.instrument_id === 'portage')?.data;
  const childAge = sessionInfo?.child_age ? parseFloat(sessionInfo.child_age) : null;
  const childRangeId = getChildRangeId(childAge);

  // ═══════════════════════════════════════════
  // ESTADO
  // ═══════════════════════════════════════════
  const [responses, setResponses] = useState(existingData?.responses || {});
  const [scores, setScores] = useState(existingData?.scores || null);
  const [report, setReport] = useState(existingData?.report || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flowIndex, setFlowIndex] = useState(0);

  // Modo: 'auto' (só faixa da idade) ou 'manual' (avaliador escolhe faixas)
  const [mode, setMode] = useState('auto');

  // Faixas ativas manualmente (quando mode === 'manual')
  // Por padrão, começa com a faixa da criança ativa
  const [manualRanges, setManualRanges] = useState(() => {
    const initial = {};
    PORTAGE_AGE_RANGES.forEach(r => {
      initial[r.id] = r.id === childRangeId;
    });
    return initial;
  });

  // ═══════════════════════════════════════════
  // FAIXAS ATIVAS (depende do modo)
  // ═══════════════════════════════════════════
  const activeRanges = useMemo(() => {
    if (mode === 'auto') {
      return [childRangeId];
    }
    // Manual: retorna faixas que o avaliador ligou
    return PORTAGE_AGE_RANGES
      .filter(r => manualRanges[r.id])
      .map(r => r.id);
  }, [mode, childRangeId, manualRanges]);

  // Toggle uma faixa no modo manual
  const toggleManualRange = useCallback((rangeId) => {
    setManualRanges(prev => ({
      ...prev,
      [rangeId]: !prev[rangeId],
    }));
  }, []);

  // Trocar modo
  const toggleMode = useCallback(() => {
    setMode(prev => {
      if (prev === 'auto') {
        // Ao trocar para manual, garante a faixa da criança ativa
        setManualRanges(old => ({ ...old, [childRangeId]: true }));
        return 'manual';
      }
      return 'auto';
    });
    setFlowIndex(0);
  }, [childRangeId]);

  // ═══════════════════════════════════════════
  // FLUXO LINEAR (área por área, só faixas ativas)
  // ═══════════════════════════════════════════
  const flowSteps = useMemo(() => {
    const steps = [];
    const areaIds = Object.keys(PORTAGE_AREAS);

    areaIds.forEach(areaId => {
      activeRanges.forEach(rangeId => {
        const items = toArray(PORTAGE_ITEMS[areaId]?.[rangeId]);
        if (items.length > 0) {
          steps.push({ areaId, rangeId, itemCount: items.length });
        }
      });
    });

    return steps;
  }, [activeRanges]);

  const currentStep = flowSteps[flowIndex] || null;

  // ═══════════════════════════════════════════
  // PROGRESSO (só faixas ativas)
  // ═══════════════════════════════════════════
  const progress = useMemo(() => {
    let totalItems = 0;
    let answered = 0;
    const byArea = {};

    Object.entries(PORTAGE_ITEMS).forEach(([areaId, ranges]) => {
      let areaTotal = 0;
      let areaAnswered = 0;

      activeRanges.forEach(rangeId => {
        const items = toArray(ranges[rangeId]);
        items.forEach(item => {
          totalItems++;
          areaTotal++;
          const key = `${areaId}_${rangeId}_${item.number}`;
          if (responses[key]) {
            answered++;
            areaAnswered++;
          }
        });
      });

      byArea[areaId] = {
        total: areaTotal,
        answered: areaAnswered,
        percent: areaTotal > 0 ? Math.round((areaAnswered / areaTotal) * 100) : 0,
        isComplete: areaAnswered === areaTotal && areaTotal > 0,
      };
    });

    return {
      totalItems,
      answered,
      percent: totalItems > 0 ? Math.round((answered / totalItems) * 100) : 0,
      isComplete: answered === totalItems && totalItems > 0,
      byArea,
      totalSteps: flowSteps.length,
      currentStepIndex: flowIndex,
    };
  }, [responses, activeRanges, flowSteps, flowIndex]);

  // ═══════════════════════════════════════════
  // AÇÕES
  // ═══════════════════════════════════════════

  const handleResponseChange = useCallback((areaId, ageRangeId, itemNumber, answer) => {
    if (isReadOnly) return;
    const key = `${areaId}_${ageRangeId}_${itemNumber}`;
    setResponses(prev => ({ ...prev, [key]: answer }));
    setScores(null);
  }, [isReadOnly]);

  const handleNextStep = useCallback(() => {
    if (flowIndex < flowSteps.length - 1) {
      setFlowIndex(prev => prev + 1);
      return true;
    }
    return false;
  }, [flowIndex, flowSteps.length]);

  const handlePrevStep = useCallback(() => {
    if (flowIndex > 0) {
      setFlowIndex(prev => prev - 1);
      return true;
    }
    return false;
  }, [flowIndex]);

  const goToStep = useCallback((index) => {
    if (index >= 0 && index < flowSteps.length) setFlowIndex(index);
  }, [flowSteps.length]);

  const isCurrentStepComplete = useMemo(() => {
    if (!currentStep) return false;
    const items = toArray(PORTAGE_ITEMS[currentStep.areaId]?.[currentStep.rangeId]);
    return items.every(item => {
      const key = `${currentStep.areaId}_${currentStep.rangeId}_${item.number}`;
      return !!responses[key];
    });
  }, [currentStep, responses]);

  // Calcular scores (filtra apenas faixas ativas)
  const handleCalculateScores = useCallback(() => {
    // Calcula score normal (usa todas as respostas dadas)
    const calculated = calculatePortageScores(responses);

    // Mas marca quais faixas estavam ativas para filtrar gráficos
    calculated.activeRanges = [...activeRanges];

    // Recalcular summary filtrando só faixas ativas
    const filteredSummary = Object.entries(PORTAGE_AREAS).map(([areaId, area]) => {
      const areaData = calculated.byArea[areaId];
      let filteredScore = 0;
      let filteredExpected = 0;
      let filteredMonths = 0;

      activeRanges.forEach(rangeId => {
        const rangeData = areaData?.byRange?.[rangeId];
        if (rangeData) {
          filteredScore += rangeData.score;
          filteredExpected += rangeData.expected;
          const expected = PORTAGE_EXPECTED_SCORES[areaId]?.[rangeId] || 0;
          if (expected > 0) {
            filteredMonths += (rangeData.score / expected) * 12;
          }
        }
      });

      const devAge = filteredMonths / 12;
      return {
        area: areaId,
        name: area.name,
        totalScore: filteredScore,
        totalExpected: filteredExpected,
        percent: filteredExpected > 0 ? (filteredScore / filteredExpected) * 100 : 0,
        developmentalAge: devAge,
      };
    });

    const avgDevAge = filteredSummary.reduce((sum, s) => sum + s.developmentalAge, 0) / filteredSummary.length;

    calculated.filteredSummary = filteredSummary;
    calculated.filteredDevAge = avgDevAge;

    setScores(calculated);
    return calculated;
  }, [responses, activeRanges]);

  // Relatório IA
  const handleGenerateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentScores = scores || handleCalculateScores();

      const reportData = {
        child_age: childAge,
        overall_developmental_age: currentScores.filteredDevAge || currentScores.overallDevelopmentalAge,
        summary: currentScores.filteredSummary || currentScores.summary,
        byArea: currentScores.byArea,
        chronological_age: childAge,
        active_ranges: activeRanges,
      };

      const generated = await generateInstrumentReport('portage', reportData);
      setReport(generated);
      return generated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [scores, handleCalculateScores, childAge, activeRanges]);

  // Payload
  const getPayload = useCallback(() => {
    const currentScores = scores || calculatePortageScores(responses);
    return { responses, scores: currentScores, report, activeRanges };
  }, [responses, scores, report, activeRanges]);

  return {
    areas: PORTAGE_AREAS,
    ageRanges: PORTAGE_AGE_RANGES,
    items: PORTAGE_ITEMS,
    expectedScores: PORTAGE_EXPECTED_SCORES,
    childAge,
    childRangeId,
    // Modo auto/manual
    mode,
    toggleMode,
    activeRanges,
    manualRanges,
    toggleManualRange,
    // Fluxo
    flowSteps,
    flowIndex,
    currentStep,
    isCurrentStepComplete,
    // Estado
    responses,
    scores,
    report,
    progress,
    loading,
    error,
    // Ações
    handleResponseChange,
    handleNextStep,
    handlePrevStep,
    goToStep,
    handleCalculateScores,
    handleGenerateReport,
    getPayload,
    getPortageRiskLevel,
    toArray,
  };
}
