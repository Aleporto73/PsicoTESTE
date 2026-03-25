/*
 * useMChatRFLogic - Hook de lógica do M-CHAT-R/F
 *
 * Gerencia estado e lógica de:
 * - Respostas às 20 perguntas
 * - Cálculo automático de score
 * - Respostas do follow-up
 * - Geração de relatório por IA
 */

import { useState, useCallback, useMemo } from 'react';
import {
  MCHAT_RF_QUESTIONS,
  MCHAT_CATEGORIES,
  calculateMChatScore,
  calculateFollowUpScore,
} from '../data/instruments/mChatRF';
import { generateInstrumentReport } from '../utils/aiReport';

export default function useMChatRFLogic(sessionInfo, isReadOnly = false) {
  // Recuperar dados existentes da sessão (para modo leitura)
  const existingData = sessionInfo?.instruments?.find(i => i.instrument_id === 'mchat_rf')?.data;

  const [responses, setResponses] = useState(existingData?.responses || {});
  const [scores, setScores] = useState(existingData?.scores || null);
  const [followupResponses, setFollowupResponses] = useState(existingData?.followup_results || {});
  const [finalScores, setFinalScores] = useState(existingData?.final_scores || null);
  const [report, setReport] = useState(existingData?.report || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Progresso de preenchimento
  const progress = useMemo(() => {
    const answered = Object.keys(responses).length;
    return {
      answered,
      total: 20,
      percent: Math.round((answered / 20) * 100),
      isComplete: answered === 20,
    };
  }, [responses]);

  // Responder uma pergunta
  const handleResponseChange = useCallback((questionNumber, answer) => {
    if (isReadOnly) return;
    setResponses(prev => ({
      ...prev,
      [`q${questionNumber}`]: answer,
    }));
    // Limpar scores quando muda resposta (precisa recalcular)
    setScores(null);
    setFinalScores(null);
  }, [isReadOnly]);

  // Calcular score automático
  const handleCalculateScores = useCallback(() => {
    const calculated = calculateMChatScore(responses);
    setScores(calculated);
    return calculated;
  }, [responses]);

  // Responder follow-up
  const handleFollowupChange = useCallback((itemNumber, result) => {
    if (isReadOnly) return;
    setFollowupResponses(prev => ({
      ...prev,
      [`item_${itemNumber}`]: result,
    }));
  }, [isReadOnly]);

  // Calcular score final com follow-up
  const handleCalculateFollowUp = useCallback(() => {
    if (!scores) return null;
    const final = calculateFollowUpScore(scores, followupResponses);
    setFinalScores(final);
    return final;
  }, [scores, followupResponses]);

  // Resumo por categorias (para gráficos)
  const categorySummary = useMemo(() => {
    if (!scores) return [];
    return Object.entries(MCHAT_CATEGORIES).map(([key, cat]) => {
      const failedInCategory = cat.items.filter(i => scores.failed_items.includes(i));
      return {
        id: key,
        name: cat.name,
        total: cat.items.length,
        failed: failedInCategory.length,
        passed: cat.items.length - failedInCategory.length,
        items: cat.items,
        failedItems: failedInCategory,
        percentFailed: Math.round((failedInCategory.length / cat.items.length) * 100),
      };
    }).sort((a, b) => b.percentFailed - a.percentFailed);
  }, [scores]);

  // Gerar relatório IA
  const handleGenerateReport = useCallback(async (childAge) => {
    setLoading(true);
    setError(null);
    try {
      const currentScores = finalScores || scores || handleCalculateScores();

      // Montar resumo de categorias para o prompt
      const categoriesSummary = categorySummary
        .filter(c => c.failed > 0)
        .map(c => `- ${c.name}: ${c.failed}/${c.total} itens falhados`)
        .join('\n');

      const reportData = {
        raw_score: currentScores.raw_score,
        risk_level: currentScores.followup_applied
          ? currentScores.followup_risk_level
          : currentScores.risk_level,
        failed_items: currentScores.followup_applied
          ? currentScores.followup_failed_items
          : currentScores.failed_items,
        followup_applied: currentScores.followup_applied || false,
        followup_score: currentScores.followup_score,
        followup_risk_level: currentScores.followup_risk_level,
        categories_summary: categoriesSummary,
        child_age: childAge,
      };

      const generated = await generateInstrumentReport('mchat_rf', reportData);
      setReport(generated);
      return generated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [scores, finalScores, categorySummary, handleCalculateScores]);

  // Finalizar e retornar todos os dados
  const getPayload = useCallback(() => {
    const currentScores = finalScores || scores;
    return {
      responses,
      scores: currentScores,
      followup_results: followupResponses,
      final_scores: finalScores,
      report,
      categories: categorySummary,
    };
  }, [responses, scores, followupResponses, finalScores, report, categorySummary]);

  return {
    // Dados
    questions: MCHAT_RF_QUESTIONS,
    categories: MCHAT_CATEGORIES,
    responses,
    scores,
    followupResponses,
    finalScores,
    report,
    progress,
    categorySummary,
    loading,
    error,
    // Ações
    handleResponseChange,
    handleCalculateScores,
    handleFollowupChange,
    handleCalculateFollowUp,
    handleGenerateReport,
    getPayload,
  };
}
