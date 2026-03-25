/*
 * useAtaLogic - Hook para ATA (Avaliação de Traços Autísticos)
 *
 * Suporta dois modos:
 * - 'completa': Sub-itens Sim/Não (~120 itens)
 * - 'resumida': A/B/C por seção (23 itens)
 *
 * Fluxo: Seletor de versão → Aplicação seção por seção → Calcular → Resultados
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ATA_SECTIONS,
  ATA_COMPLETE_ITEMS,
  ATA_SUMMARY_ITEMS,
  calculateAtaCompleteScores,
  calculateAtaSummaryScores,
  getAtaRiskLevel,
} from '../data/instruments/ata';

export default function useAtaLogic(sessionInfo, isReadOnly) {
  // Try loading existing data
  const existingData = sessionInfo?.instruments?.find?.(i => i.instrument_id === 'ata')?.data
    || sessionInfo?.instruments?.ata || {};

  const [version, setVersion] = useState(existingData.version || null);
  const [responses, setResponses] = useState(existingData.responses || {});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [scores, setScores] = useState(existingData.scores || null);

  // ── Selecionar versão ──
  const selectVersion = useCallback((v) => {
    setVersion(v);
    setResponses({});
    setSectionIndex(0);
    setScores(null);
  }, []);

  // ── Seção atual ──
  const currentSection = ATA_SECTIONS[sectionIndex] || null;

  // ── Dados da seção atual conforme versão ──
  const currentSectionData = useMemo(() => {
    if (!currentSection || !version) return null;
    if (version === 'completa') return ATA_COMPLETE_ITEMS[currentSection.id];
    return ATA_SUMMARY_ITEMS[currentSection.id];
  }, [currentSection, version]);

  // ── Progresso ──
  const progress = useMemo(() => {
    const total = ATA_SECTIONS.length;
    let answered = 0;

    if (version === 'completa') {
      for (const section of ATA_SECTIONS) {
        const data = ATA_COMPLETE_ITEMS[section.id];
        if (!data) continue;
        const allAnswered = data.items.every(item => responses[item.id] !== undefined);
        if (allAnswered) answered++;
      }
    } else if (version === 'resumida') {
      for (const section of ATA_SECTIONS) {
        if (responses[section.id]) answered++;
      }
    }

    return { total, answered, percent: Math.round((answered / total) * 100) };
  }, [version, responses]);

  // ── Responder item (completa) ──
  const setCompleteResponse = useCallback((itemId, value) => {
    if (isReadOnly) return;
    setResponses(prev => ({ ...prev, [itemId]: value }));
  }, [isReadOnly]);

  // ── Responder seção (resumida) ──
  const setSummaryResponse = useCallback((sectionId, letter) => {
    if (isReadOnly) return;
    setResponses(prev => ({ ...prev, [sectionId]: letter }));
  }, [isReadOnly]);

  // ── Marcar todos Sim na seção atual (completa) ──
  const markAllYes = useCallback(() => {
    if (isReadOnly || version !== 'completa' || !currentSection) return;
    const data = ATA_COMPLETE_ITEMS[currentSection.id];
    if (!data) return;
    setResponses(prev => {
      const updated = { ...prev };
      data.items.forEach(item => { updated[item.id] = true; });
      return updated;
    });
  }, [isReadOnly, version, currentSection]);

  // ── Marcar todos Não na seção atual (completa) ──
  const markAllNo = useCallback(() => {
    if (isReadOnly || version !== 'completa' || !currentSection) return;
    const data = ATA_COMPLETE_ITEMS[currentSection.id];
    if (!data) return;
    setResponses(prev => {
      const updated = { ...prev };
      data.items.forEach(item => { updated[item.id] = false; });
      return updated;
    });
  }, [isReadOnly, version, currentSection]);

  // ── Navegação ──
  const goToSection = useCallback((idx) => {
    setSectionIndex(idx);
  }, []);

  const nextSection = useCallback(() => {
    if (sectionIndex < ATA_SECTIONS.length - 1) {
      setSectionIndex(sectionIndex + 1);
    }
  }, [sectionIndex]);

  const prevSection = useCallback(() => {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
    }
  }, [sectionIndex]);

  // ── Calcular scores ──
  const calculateScores = useCallback(() => {
    let result;
    if (version === 'completa') {
      result = calculateAtaCompleteScores(responses);
    } else {
      result = calculateAtaSummaryScores(responses);
    }
    result.version = version;
    result.riskInfo = getAtaRiskLevel(result.totalScore);
    setScores(result);
    return result;
  }, [version, responses]);

  // ── Verificar se seção está completa ──
  const isSectionComplete = useCallback((sectionId) => {
    if (version === 'completa') {
      const data = ATA_COMPLETE_ITEMS[sectionId];
      if (!data) return false;
      return data.items.every(item => responses[item.id] !== undefined);
    }
    return !!responses[sectionId];
  }, [version, responses]);

  const isCurrentSectionComplete = currentSection ? isSectionComplete(currentSection.id) : false;
  const isLastSection = sectionIndex === ATA_SECTIONS.length - 1;

  return {
    version,
    responses,
    sectionIndex,
    scores,
    sections: ATA_SECTIONS,
    currentSection,
    currentSectionData,
    completeItems: ATA_COMPLETE_ITEMS,
    summaryItems: ATA_SUMMARY_ITEMS,
    progress,
    isCurrentSectionComplete,
    isLastSection,
    selectVersion,
    setCompleteResponse,
    setSummaryResponse,
    markAllYes,
    markAllNo,
    goToSection,
    nextSection,
    prevSection,
    calculateScores,
    isSectionComplete,
  };
}
