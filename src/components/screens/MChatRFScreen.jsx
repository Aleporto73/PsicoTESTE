/*
 * MChatRFScreen - Tela principal do M-CHAT-R/F
 *
 * Três estágios:
 * 1. Aplicação: 20 perguntas Sim/Não
 * 2. Pontuação: Score automático + gráficos + follow-up opcional
 * 3. Relatório: Relatório interpretativo gerado por IA
 */

import React, { useState } from 'react';
import useMChatRFLogic from '../../hooks/useMChatRFLogic';
import { MCHAT_RF_META } from '../../data/instruments/mChatRF';
import { RiskGauge, CategoryChart, ItemsOverview } from '../charts/MChatRFChart';

export default function MChatRFScreen({ sessionInfo, onFinalize, onBack, isReadOnly = false }) {
  const logic = useMChatRFLogic(sessionInfo, isReadOnly);
  const [stage, setStage] = useState(isReadOnly ? 'scoring' : 'application');
  const [showFollowup, setShowFollowup] = useState(false);

  // ═══════════════════════════════════════════
  // ESTÁGIO 1: APLICAÇÃO (20 perguntas)
  // ═══════════════════════════════════════════
  if (stage === 'application') {
    return (
      <div className="mchat-screen">
        <style>{getStyles()}</style>
        <header className="mchat-header">
          <div className="header-top">
            <button className="btn-back" onClick={onBack}>← Voltar</button>
            <div className="header-title">
              <h1>{MCHAT_RF_META.name}</h1>
              <p>{MCHAT_RF_META.description}</p>
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${logic.progress.percent}%` }} />
            </div>
            <span className="progress-text">{logic.progress.answered}/20 respondidas ({logic.progress.percent}%)</span>
          </div>
        </header>

        <div className="mchat-instructions">
          <p>Por favor, responda as questões abaixo sobre o seu filho. Pense em como ele geralmente se comporta. Se você viu o seu filho apresentar o comportamento descrito poucas vezes, ou seja, se não for um comportamento frequente, então responda <strong>não</strong>.</p>
        </div>

        <div className="questions-list">
          {logic.questions.map(q => (
            <div key={q.number} className={`question-card ${logic.responses[`q${q.number}`] ? 'answered' : ''}`}>
              <div className="question-number">{q.number}</div>
              <div className="question-content">
                <p className="question-text">{q.question}</p>
                {q.example && <p className="question-example">{q.example}</p>}
              </div>
              <div className="answer-buttons">
                <button
                  className={`answer-btn sim ${logic.responses[`q${q.number}`] === 'sim' ? 'selected' : ''}`}
                  onClick={() => logic.handleResponseChange(q.number, 'sim')}
                  disabled={isReadOnly}
                >
                  Sim
                </button>
                <button
                  className={`answer-btn nao ${logic.responses[`q${q.number}`] === 'não' ? 'selected' : ''}`}
                  onClick={() => logic.handleResponseChange(q.number, 'não')}
                  disabled={isReadOnly}
                >
                  Não
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="mchat-footer">
          <button className="btn-secondary" onClick={onBack}>Cancelar</button>
          <button
            className="btn-primary"
            onClick={() => {
              logic.handleCalculateScores();
              setStage('scoring');
            }}
            disabled={!logic.progress.isComplete}
          >
            {logic.progress.isComplete ? 'Ver Pontuação →' : `Faltam ${20 - logic.progress.answered} respostas`}
          </button>
        </footer>

        <div className="mchat-copyright">
          © 2009 Diana Robins, Deborah Fein, &amp; Marianne Barton
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // ESTÁGIO 2: PONTUAÇÃO + GRÁFICOS + FOLLOW-UP
  // ═══════════════════════════════════════════
  if (stage === 'scoring') {
    const scores = logic.scores || logic.handleCalculateScores();

    return (
      <div className="mchat-screen">
        <style>{getStyles()}</style>
        <header className="mchat-header">
          <div className="header-top">
            <button className="btn-back" onClick={() => setStage('application')}>← Voltar</button>
            <div className="header-title">
              <h1>Resultado M-CHAT-R/F</h1>
              <p>Pontuação calculada automaticamente</p>
            </div>
          </div>
        </header>

        <div className="scoring-grid">
          {/* Gauge de risco */}
          <RiskGauge
            riskLevel={logic.finalScores?.followup_risk_level || scores.risk_level}
            riskColor={scores.risk_color}
            score={logic.finalScores?.followup_score ?? scores.raw_score}
            total={20}
          />

          {/* Visão geral dos itens */}
          <ItemsOverview scores={scores} questions={logic.questions} />

          {/* Gráfico por categorias */}
          <div className="chart-full">
            <CategoryChart categorySummary={logic.categorySummary} />
          </div>
        </div>

        {/* Descrição do risco */}
        <div className="risk-description" style={{ borderLeftColor: scores.risk_color }}>
          <h3>Classificação: {logic.finalScores?.followup_risk_level || scores.risk_level}</h3>
          <p>{logic.finalScores?.followup_description || scores.risk_description}</p>
        </div>

        {/* Follow-up (se risco médio) */}
        {scores.needs_followup && (
          <div className="followup-section">
            <div className="followup-header">
              <h3>Consulta de Seguimento (Follow-up)</h3>
              <p>O score indica risco médio. Aplique o follow-up nos itens que falharam para refinar o resultado.</p>
              {!showFollowup && (
                <button className="btn-followup" onClick={() => setShowFollowup(true)}>
                  Aplicar Follow-up
                </button>
              )}
            </div>

            {showFollowup && (
              <div className="followup-items">
                {scores.failed_items.map(itemNum => {
                  const q = logic.questions.find(q => q.number === itemNum);
                  if (!q) return null;
                  return (
                    <div key={itemNum} className="followup-item">
                      <p className="followup-question">
                        <strong>Item {itemNum}:</strong> {q.question}
                      </p>
                      <div className="followup-buttons">
                        <button
                          className={`followup-btn passed ${logic.followupResponses[`item_${itemNum}`] === 'passed' ? 'selected' : ''}`}
                          onClick={() => logic.handleFollowupChange(itemNum, 'passed')}
                        >
                          Passou
                        </button>
                        <button
                          className={`followup-btn failed ${logic.followupResponses[`item_${itemNum}`] === 'failed' ? 'selected' : ''}`}
                          onClick={() => logic.handleFollowupChange(itemNum, 'failed')}
                        >
                          Falhou
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button
                  className="btn-primary"
                  onClick={() => logic.handleCalculateFollowUp()}
                  style={{ marginTop: '1rem' }}
                >
                  Recalcular com Follow-up
                </button>
              </div>
            )}
          </div>
        )}

        <footer className="mchat-footer">
          <button className="btn-secondary" onClick={() => setStage('application')}>← Voltar</button>
          <button
            className="btn-primary btn-ai"
            onClick={async () => {
              await logic.handleGenerateReport(sessionInfo?.child_age);
              setStage('report');
            }}
            disabled={logic.loading}
          >
            {logic.loading ? 'Gerando relatório...' : 'Gerar Relatório com IA →'}
          </button>
        </footer>

        <div className="mchat-copyright">
          © 2009 Diana Robins, Deborah Fein, &amp; Marianne Barton
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // ESTÁGIO 3: RELATÓRIO IA
  // ═══════════════════════════════════════════
  if (stage === 'report') {
    return (
      <div className="mchat-screen">
        <style>{getStyles()}</style>
        <header className="mchat-header">
          <div className="header-top">
            <button className="btn-back" onClick={() => setStage('scoring')}>← Voltar</button>
            <div className="header-title">
              <h1>Relatório Interpretativo</h1>
              <p>Gerado por IA com base nos dados reais da avaliação</p>
            </div>
          </div>
        </header>

        <div className="report-container">
          {logic.error ? (
            <div className="report-error">
              <p>Erro ao gerar relatório: {logic.error}</p>
              <button className="btn-primary" onClick={() => logic.handleGenerateReport(sessionInfo?.child_age)}>
                Tentar Novamente
              </button>
            </div>
          ) : logic.report ? (
            <div className="report-content">
              <div className="report-badge">
                <span className="badge-ai">Relatório gerado por IA</span>
                <span className="badge-instrument">{MCHAT_RF_META.name}</span>
              </div>
              <div className="report-text">
                {logic.report.split('\n').map((paragraph, idx) => (
                  paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
                ))}
              </div>
              <div className="report-disclaimer">
                <p><strong>Nota:</strong> Este relatório foi gerado automaticamente com base nos dados da avaliação. O {MCHAT_RF_META.name} é um instrumento de rastreio e NÃO constitui diagnóstico clínico.</p>
                <p className="ref">{MCHAT_RF_META.reference}</p>
              </div>
            </div>
          ) : (
            <div className="report-loading">
              <div className="spinner" />
              <p>Gerando relatório interpretativo...</p>
            </div>
          )}
        </div>

        <footer className="mchat-footer">
          <button className="btn-secondary" onClick={() => setStage('scoring')}>← Voltar</button>
          <button
            className="btn-primary btn-finalize"
            onClick={() => {
              const payload = logic.getPayload();
              onFinalize(payload);
            }}
            disabled={!logic.report}
          >
            Finalizar M-CHAT-R/F
          </button>
        </footer>

        <div className="mchat-copyright">
          © 2009 Diana Robins, Deborah Fein, &amp; Marianne Barton
        </div>
      </div>
    );
  }

  return null;
}

function getStyles() {
  return `
    .mchat-screen {
      max-width: 900px;
      margin: 0 auto;
      padding: 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .mchat-header {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    }
    .header-top {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .header-title h1 { margin: 0; font-size: 1.5rem; color: #1e293b; font-weight: 800; }
    .header-title p { margin: 0.2rem 0 0; color: #64748b; font-size: 0.875rem; }
    .btn-back {
      background: #f1f5f9;
      border: none;
      color: #475569;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.85rem;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .btn-back:hover { background: #e2e8f0; }
    .progress-container { display: flex; align-items: center; gap: 1rem; }
    .progress-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #7c3aed; border-radius: 4px; transition: width 0.3s; }
    .progress-text { font-size: 0.8rem; color: #64748b; white-space: nowrap; font-weight: 500; }
    .mchat-instructions {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      color: #6b21a8;
      line-height: 1.6;
    }
    .questions-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .question-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border: 2px solid #e2e8f0;
      transition: all 0.2s;
    }
    .question-card.answered { border-color: #c4b5fd; background: #faf5ff; }
    .question-number {
      min-width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #7c3aed;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .question-content { flex: 1; }
    .question-text { margin: 0; font-size: 0.95rem; color: #1e293b; line-height: 1.5; font-weight: 500; }
    .question-example { margin: 0.4rem 0 0; font-size: 0.8rem; color: #7c3aed; font-style: italic; }
    .answer-buttons { display: flex; gap: 8px; align-self: center; }
    .answer-btn {
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      background: #fff;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 60px;
    }
    .answer-btn.sim:hover, .answer-btn.sim.selected { background: #10b981; color: white; border-color: #10b981; }
    .answer-btn.nao:hover, .answer-btn.nao.selected { background: #ef4444; color: white; border-color: #ef4444; }
    .mchat-footer {
      display: flex;
      justify-content: space-between;
      padding: 1.5rem 0;
      margin-top: 1rem;
    }
    .btn-secondary {
      background: #f1f5f9;
      border: none;
      color: #475569;
      padding: 0.7rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-primary {
      background: #7c3aed;
      border: none;
      color: white;
      padding: 0.7rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: #6d28d9; transform: translateY(-1px); }
    .btn-primary:disabled { background: #c4b5fd; cursor: not-allowed; transform: none; }
    .btn-ai { background: #6366f1; }
    .btn-ai:hover { background: #4f46e5; }
    .btn-finalize { background: #10b981; }
    .btn-finalize:hover { background: #059669; }

    /* Scoring stage */
    .scoring-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .chart-full { grid-column: 1 / -1; }
    .risk-description {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      border-left: 5px solid;
      margin-bottom: 1.5rem;
    }
    .risk-description h3 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #1e293b; }
    .risk-description p { margin: 0; color: #475569; line-height: 1.6; }

    /* Follow-up */
    .followup-section {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .followup-header h3 { margin: 0 0 0.5rem; color: #92400e; font-size: 1.1rem; }
    .followup-header p { margin: 0 0 1rem; color: #a16207; font-size: 0.9rem; }
    .btn-followup {
      background: #f59e0b;
      border: none;
      color: white;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-followup:hover { background: #d97706; }
    .followup-items { margin-top: 1rem; }
    .followup-item {
      background: #fff;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border: 1px solid #fde68a;
    }
    .followup-question { margin: 0 0 0.75rem; font-size: 0.9rem; color: #1e293b; line-height: 1.5; }
    .followup-buttons { display: flex; gap: 8px; }
    .followup-btn {
      padding: 0.45rem 1rem;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      background: #fff;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .followup-btn.passed.selected { background: #10b981; color: white; border-color: #10b981; }
    .followup-btn.failed.selected { background: #ef4444; color: white; border-color: #ef4444; }

    /* Report stage */
    .report-container {
      background: #fff;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
      margin-bottom: 1.5rem;
    }
    .report-badge { display: flex; gap: 8px; margin-bottom: 1.5rem; }
    .badge-ai {
      background: #ede9fe;
      color: #7c3aed;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .badge-instrument {
      background: #f1f5f9;
      color: #475569;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .report-text p {
      color: #334155;
      line-height: 1.8;
      font-size: 0.95rem;
      margin: 0 0 1rem;
    }
    .report-disclaimer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      font-size: 0.8rem;
      color: #94a3b8;
      line-height: 1.5;
    }
    .report-disclaimer .ref { font-style: italic; margin-top: 0.5rem; }
    .report-error {
      text-align: center;
      padding: 2rem;
      color: #ef4444;
    }
    .report-loading {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top-color: #7c3aed;
      border-radius: 50%;
      margin: 0 auto 1rem;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Copyright */
    .mchat-copyright {
      text-align: center;
      padding: 1rem 0 0.5rem;
      font-size: 0.75rem;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      margin-top: 0.5rem;
    }

    @media (max-width: 640px) {
      .scoring-grid { grid-template-columns: 1fr; }
      .question-card { flex-direction: column; }
      .answer-buttons { align-self: stretch; }
      .answer-btn { flex: 1; }
    }
  `;
}
