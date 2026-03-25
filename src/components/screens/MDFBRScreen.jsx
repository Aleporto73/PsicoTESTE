/*
 * MDFBRScreen — Tela principal MDF-BR v1.0
 *
 * 3 estágios:
 * 1. Seleção de Faixa (checkpoint) baseado na idade da criança
 * 2. Aplicação: 5 itens (1 por domínio) com score 0–3 + NULL
 * 3. Resultado: IFG, status de risco, red flags, snapshot
 */

import React, { useState, useMemo } from 'react';
import useMDFBRLogic from '../../hooks/useMDFBRLogic';
import { MDF_BR_SCORE_LABELS } from '../../data/instruments/mdf_br';

export default function MDFBRScreen({ sessionInfo, onFinalize, onBack, isReadOnly = false }) {
  const logic = useMDFBRLogic(sessionInfo, isReadOnly);
  const [stage, setStage] = useState(
    isReadOnly && logic.existingData ? 'result' :
    logic.selectedCheckpoint ? 'application' : 'checkpoint'
  );
  const [expandedItem, setExpandedItem] = useState(null);

  // Derive child age from session
  const childAgeMonths = sessionInfo?.child_age_total_months || null;

  // ════════════════════════════════════════════
  // STAGE 1: CHECKPOINT SELECTION
  // ════════════════════════════════════════════
  if (stage === 'checkpoint') {
    return (
      <div className="mdf-screen">
        <style>{getStyles()}</style>
        <header className="mdf-header">
          <button className="mdf-btn-back" onClick={onBack}>← Voltar</button>
          <div>
            <h1>MDF-BR</h1>
            <p>Matriz de Desenvolvimento Funcional Brasileira</p>
          </div>
        </header>

        <div className="mdf-checkpoint-section">
          <h2>Selecione a Faixa Etária</h2>
          <p className="mdf-subtitle">
            {childAgeMonths
              ? `Idade registrada: ${childAgeMonths} meses. Selecione o checkpoint mais adequado.`
              : 'Selecione o checkpoint de desenvolvimento para avaliação.'}
          </p>

          <div className="mdf-checkpoint-grid">
            {logic.checkpoints.map(cp => {
              const isRecommended = childAgeMonths && cp === logic.meta.checkpoints.reduce((best, c) =>
                c <= childAgeMonths ? c : best, logic.meta.checkpoints[0]);
              return (
                <button
                  key={cp}
                  className={`mdf-checkpoint-card ${isRecommended ? 'recommended' : ''}`}
                  onClick={() => {
                    logic.setSelectedCheckpoint(cp);
                    logic.selectCheckpointByAge(cp);
                    setStage('application');
                  }}
                >
                  <span className="mdf-cp-months">{cp}</span>
                  <span className="mdf-cp-label">meses</span>
                  {isRecommended && <span className="mdf-cp-badge">Sugerido</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // STAGE 2: APPLICATION (5 items)
  // ════════════════════════════════════════════
  if (stage === 'application') {
    const domainColors = {
      COM: '#0d9488',
      SOC: '#7c3aed',
      COG: '#2563eb',
      MOT: '#d97706',
      REGAVD: '#be185d',
    };

    return (
      <div className="mdf-screen">
        <style>{getStyles()}</style>
        <header className="mdf-header">
          <button className="mdf-btn-back" onClick={() => setStage('checkpoint')}>← Faixa</button>
          <div>
            <h1>MDF-BR — {logic.selectedCheckpoint} meses</h1>
            <p>{logic.progress.answered}/{logic.progress.total} itens respondidos</p>
          </div>
          <div className="mdf-header-actions">
            <div className="mdf-progress-mini">
              <div className="mdf-progress-bar-mini">
                <div className="mdf-progress-fill-mini" style={{ width: `${logic.progress.percent}%` }} />
              </div>
              <span>{logic.progress.percent}%</span>
            </div>
          </div>
        </header>

        <div className="mdf-items-container">
          {logic.currentItems.map((item, idx) => {
            const currentScore = logic.responses[item.item_id];
            const isAnswered = currentScore !== undefined && currentScore !== null && currentScore !== '';
            const isExpanded = expandedItem === item.item_id;
            const color = domainColors[item.domain_code] || '#64748b';
            const domainLabel = logic.domains.find(d => d.code === item.domain_code)?.label || item.domain_code;

            return (
              <div
                key={item.item_id}
                className={`mdf-item-card ${isAnswered ? 'answered' : ''}`}
                style={{ borderLeftColor: color }}
              >
                <div className="mdf-item-header">
                  <div className="mdf-item-meta">
                    <span className="mdf-domain-badge" style={{ background: `${color}15`, color, borderColor: `${color}40` }}>
                      {item.domain_code}
                    </span>
                    <span className="mdf-domain-label">{domainLabel}</span>
                    {item.red_flag_type !== 'NONE' && (
                      <span className={`mdf-flag-badge ${item.red_flag_type.toLowerCase()}`}>
                        {item.red_flag_type === 'HARD' ? '⚠ HARD' : '⚡ SOFT'}
                      </span>
                    )}
                  </div>
                  {isAnswered && (
                    <span className="mdf-answered-check">✓</span>
                  )}
                </div>

                <p className="mdf-anchor-text">{item.anchor_text}</p>

                <button
                  className="mdf-expand-btn"
                  onClick={() => setExpandedItem(isExpanded ? null : item.item_id)}
                >
                  {isExpanded ? 'Ocultar descritores ▲' : 'Ver descritores ▼'}
                </button>

                {isExpanded && (
                  <div className="mdf-descriptors">
                    {[0, 1, 2, 3].map(s => (
                      <div key={s} className="mdf-descriptor-row">
                        <span className="mdf-descriptor-score">{s}</span>
                        <p className="mdf-descriptor-text">{item[`score_${s}`]}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mdf-score-buttons">
                  {[0, 1, 2, 3].map(s => (
                    <button
                      key={s}
                      className={`mdf-score-btn ${currentScore === s ? 'active' : ''} score-${s}`}
                      onClick={() => logic.handleScoreChange(item.item_id, s)}
                      disabled={isReadOnly}
                    >
                      <span className="mdf-score-num">{s}</span>
                      <span className="mdf-score-label">
                        {s === 0 ? 'Ausente' : s === 1 ? 'Dependente' : s === 2 ? 'Emergente' : 'Funcional'}
                      </span>
                    </button>
                  ))}
                  <button
                    className={`mdf-score-btn null-btn ${currentScore === null || currentScore === 'NULL' ? 'active' : ''}`}
                    onClick={() => logic.handleScoreChange(item.item_id, null)}
                    disabled={isReadOnly}
                  >
                    <span className="mdf-score-num">—</span>
                    <span className="mdf-score-label">NULL</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="mdf-footer">
          <button className="mdf-btn-secondary" onClick={() => setStage('checkpoint')}>Trocar Faixa</button>
          <button
            className={`mdf-btn-primary ${logic.progress.answered >= 3 ? '' : 'disabled'}`}
            disabled={logic.progress.answered < 3}
            onClick={() => setStage('result')}
          >
            Ver Resultado ({logic.progress.answered}/{logic.progress.total})
          </button>
        </footer>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // STAGE 3: RESULT
  // ════════════════════════════════════════════
  if (stage === 'result') {
    const r = logic.result;

    const statusColors = {
      BAIXO_RISCO: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0', label: 'Baixo Risco' },
      ATENCAO: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'Atenção' },
      ALTO_RISCO: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca', label: 'Alto Risco' },
      INCONCLUSIVO: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', label: 'Inconclusivo' },
    };

    const statusStyle = r ? statusColors[r.status_risco] || statusColors.INCONCLUSIVO : statusColors.INCONCLUSIVO;

    return (
      <div className="mdf-screen">
        <style>{getStyles()}</style>
        <header className="mdf-header">
          <button className="mdf-btn-back" onClick={() => setStage('application')}>← Itens</button>
          <div>
            <h1>Resultado — MDF-BR</h1>
            <p>Checkpoint: {logic.selectedCheckpoint} meses | Engine {r?.engine_version}</p>
          </div>
        </header>

        {r && (
          <div className="mdf-result-container">
            {/* Status Card */}
            <div className="mdf-status-card" style={{ background: statusStyle.bg, borderColor: statusStyle.border }}>
              <div className="mdf-status-main">
                <div className="mdf-ifg-display">
                  <span className="mdf-ifg-value">{r.ifg_total.toFixed(1)}</span>
                  <span className="mdf-ifg-label">IFG</span>
                </div>
                <div className="mdf-status-info">
                  <span className="mdf-status-badge" style={{ background: statusStyle.color, color: 'white' }}>
                    {statusStyle.label}
                  </span>
                  {r.hard_red_flag && <span className="mdf-red-flag-tag hard">HARD RED FLAG</span>}
                  {r.soft_red_flag && !r.hard_red_flag && <span className="mdf-red-flag-tag soft">SOFT RED FLAG</span>}
                  {r.is_inconclusivo && (
                    <span className="mdf-inconclusivo-reason">
                      {r.missing_items_count} itens sem resposta (NULL) — resultado inconclusivo
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Domain Scores */}
            <div className="mdf-domains-result">
              <h3>Scores por Domínio</h3>
              <div className="mdf-domain-grid">
                {r.dominios.map(d => {
                  const pct = d.score !== null ? (d.score / 3) * 100 : 0;
                  const domainColor =
                    d.score === null ? '#94a3b8' :
                    d.score === 3 ? '#10b981' :
                    d.score === 2 ? '#f59e0b' :
                    d.score === 1 ? '#f97316' : '#ef4444';
                  return (
                    <div key={d.code} className="mdf-domain-result-card">
                      <div className="mdf-domain-result-header">
                        <span className="mdf-domain-code">{d.code}</span>
                        <span className="mdf-domain-score" style={{ color: domainColor }}>
                          {d.score !== null ? d.score : 'NULL'}
                        </span>
                      </div>
                      <span className="mdf-domain-name">{d.label}</span>
                      <div className="mdf-domain-bar">
                        <div className="mdf-domain-bar-fill" style={{ width: `${pct}%`, background: domainColor }} />
                      </div>
                      <span className="mdf-domain-weight">Peso: {d.weight}x</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Red Flags Detail */}
            {r.red_flag_details.length > 0 && (
              <div className="mdf-flags-section">
                <h3>Red Flags Ativadas</h3>
                {r.red_flag_details.map((rf, i) => (
                  <div key={i} className={`mdf-flag-card ${rf.type.toLowerCase()}`}>
                    <span className="mdf-flag-type">{rf.type}</span>
                    <span className="mdf-flag-domain">{rf.domain}</span>
                    <p className="mdf-flag-note">{rf.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Items with score 0 */}
            {r.itens_zerados.length > 0 && (
              <div className="mdf-zeros-section">
                <h3>Itens Zerados (score = 0)</h3>
                <div className="mdf-zeros-list">
                  {r.itens_zerados.map(id => (
                    <span key={id} className="mdf-zero-tag">{id}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {!isReadOnly && (
              <footer className="mdf-result-footer">
                <button className="mdf-btn-secondary" onClick={() => setStage('application')}>
                  Revisar Respostas
                </button>
                <button
                  className="mdf-btn-primary"
                  onClick={() => {
                    const payload = logic.buildFinalizePayload();
                    if (payload && onFinalize) onFinalize(payload);
                  }}
                >
                  Concluir Avaliação
                </button>
              </footer>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════
function getStyles() {
  return `
    .mdf-screen {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 20px 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      min-height: 100vh;
    }

    .mdf-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px 0;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .mdf-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .mdf-header p {
      margin: 4px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .mdf-header-actions {
      margin-left: auto;
    }

    .mdf-btn-back {
      background: #f1f5f9;
      border: 2px solid #e2e8f0;
      color: #475569;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .mdf-btn-back:hover {
      background: #e2e8f0;
    }

    /* CHECKPOINT SELECTION */
    .mdf-checkpoint-section {
      text-align: center;
      padding: 20px 0;
    }

    .mdf-checkpoint-section h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 10px;
    }

    .mdf-subtitle {
      color: #64748b;
      font-size: 16px;
      margin: 0 0 30px;
    }

    .mdf-checkpoint-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 16px;
      max-width: 720px;
      margin: 0 auto;
    }

    .mdf-checkpoint-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px 16px;
      cursor: pointer;
      transition: all 0.25s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      position: relative;
    }

    .mdf-checkpoint-card:hover {
      border-color: #0d9488;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(13, 148, 136, 0.12);
    }

    .mdf-checkpoint-card.recommended {
      border-color: #0d9488;
      background: #f0fdfa;
    }

    .mdf-cp-months {
      font-size: 32px;
      font-weight: 800;
      color: #0d9488;
    }

    .mdf-cp-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .mdf-cp-badge {
      position: absolute;
      top: -10px;
      right: -10px;
      background: #0d9488;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
    }

    /* APPLICATION */
    .mdf-items-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 100px;
    }

    .mdf-item-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-left: 5px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px;
      transition: all 0.25s;
    }

    .mdf-item-card.answered {
      border-color: #d1fae5;
      border-left-color: inherit;
    }

    .mdf-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .mdf-item-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .mdf-domain-badge {
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      border: 1.5px solid;
      letter-spacing: 0.5px;
    }

    .mdf-domain-label {
      font-size: 14px;
      color: #475569;
      font-weight: 600;
    }

    .mdf-flag-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .mdf-flag-badge.hard {
      background: #fee2e2;
      color: #991b1b;
    }

    .mdf-flag-badge.soft {
      background: #fef3c7;
      color: #92400e;
    }

    .mdf-answered-check {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #d1fae5;
      color: #065f46;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
    }

    .mdf-anchor-text {
      color: #334155;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 14px;
    }

    .mdf-expand-btn {
      background: none;
      border: none;
      color: #6366f1;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      margin-bottom: 14px;
    }

    .mdf-expand-btn:hover {
      text-decoration: underline;
    }

    .mdf-descriptors {
      background: #f8fafc;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .mdf-descriptor-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .mdf-descriptor-score {
      background: #e2e8f0;
      color: #475569;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .mdf-descriptor-text {
      margin: 0;
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
    }

    .mdf-score-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mdf-score-btn {
      flex: 1;
      min-width: 80px;
      padding: 12px 8px;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .mdf-score-btn:hover:not(:disabled) {
      background: #f8fafc;
      transform: translateY(-2px);
    }

    .mdf-score-btn.active.score-0 {
      background: #fee2e2;
      border-color: #ef4444;
      color: #991b1b;
    }

    .mdf-score-btn.active.score-1 {
      background: #ffedd5;
      border-color: #f97316;
      color: #9a3412;
    }

    .mdf-score-btn.active.score-2 {
      background: #fef3c7;
      border-color: #f59e0b;
      color: #92400e;
    }

    .mdf-score-btn.active.score-3 {
      background: #d1fae5;
      border-color: #10b981;
      color: #065f46;
    }

    .mdf-score-btn.null-btn.active {
      background: #f1f5f9;
      border-color: #94a3b8;
      color: #475569;
    }

    .mdf-score-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .mdf-score-num {
      font-size: 18px;
      font-weight: 800;
    }

    .mdf-score-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* PROGRESS MINI */
    .mdf-progress-mini {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .mdf-progress-bar-mini {
      width: 120px;
      height: 8px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }

    .mdf-progress-fill-mini {
      height: 100%;
      background: #0d9488;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .mdf-progress-mini span {
      font-size: 13px;
      font-weight: 700;
      color: #0d9488;
    }

    /* FOOTER */
    .mdf-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 2px solid #e2e8f0;
      padding: 16px 24px;
      display: flex;
      justify-content: center;
      gap: 16px;
      z-index: 100;
    }

    .mdf-btn-primary {
      background: #0d9488;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mdf-btn-primary:hover:not(:disabled) {
      background: #0f766e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
    }

    .mdf-btn-primary.disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    .mdf-btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 2px solid #e2e8f0;
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mdf-btn-secondary:hover {
      background: #e2e8f0;
    }

    /* RESULT */
    .mdf-result-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .mdf-status-card {
      padding: 32px;
      border-radius: 16px;
      border: 2px solid;
    }

    .mdf-status-main {
      display: flex;
      align-items: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    .mdf-ifg-display {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .mdf-ifg-value {
      font-size: 52px;
      font-weight: 800;
      line-height: 1;
      color: inherit;
    }

    .mdf-ifg-label {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }

    .mdf-status-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .mdf-status-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.5px;
      width: fit-content;
    }

    .mdf-red-flag-tag {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      width: fit-content;
    }

    .mdf-red-flag-tag.hard {
      background: #fee2e2;
      color: #991b1b;
    }

    .mdf-red-flag-tag.soft {
      background: #fef3c7;
      color: #92400e;
    }

    .mdf-inconclusivo-reason {
      font-size: 14px;
      color: #475569;
      font-weight: 500;
    }

    /* DOMAIN RESULTS */
    .mdf-domains-result {
      background: white;
      padding: 28px;
      border-radius: 16px;
      border: 2px solid #e2e8f0;
    }

    .mdf-domains-result h3 {
      margin: 0 0 20px;
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }

    .mdf-domain-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
    }

    .mdf-domain-result-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .mdf-domain-result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mdf-domain-code {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
    }

    .mdf-domain-score {
      font-size: 24px;
      font-weight: 800;
    }

    .mdf-domain-name {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .mdf-domain-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 4px;
    }

    .mdf-domain-bar-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.5s ease;
    }

    .mdf-domain-weight {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
    }

    /* RED FLAGS SECTION */
    .mdf-flags-section {
      background: white;
      padding: 28px;
      border-radius: 16px;
      border: 2px solid #e2e8f0;
    }

    .mdf-flags-section h3 {
      margin: 0 0 16px;
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }

    .mdf-flag-card {
      padding: 16px;
      border-radius: 10px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .mdf-flag-card.hard {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .mdf-flag-card.soft {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }

    .mdf-flag-type {
      font-size: 12px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 6px;
      background: white;
      flex-shrink: 0;
    }

    .mdf-flag-domain {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
    }

    .mdf-flag-note {
      margin: 0;
      font-size: 14px;
      color: #475569;
      width: 100%;
    }

    /* ZEROS SECTION */
    .mdf-zeros-section {
      background: white;
      padding: 28px;
      border-radius: 16px;
      border: 2px solid #e2e8f0;
    }

    .mdf-zeros-section h3 {
      margin: 0 0 16px;
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }

    .mdf-zeros-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mdf-zero-tag {
      background: #fee2e2;
      color: #991b1b;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      font-family: 'SF Mono', monospace;
    }

    /* RESULT FOOTER */
    .mdf-result-footer {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 20px 0;
    }

    /* RESPONSIVE */
    @media (max-width: 640px) {
      .mdf-checkpoint-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .mdf-score-buttons {
        flex-wrap: wrap;
      }

      .mdf-score-btn {
        min-width: 60px;
      }

      .mdf-status-main {
        flex-direction: column;
        text-align: center;
      }

      .mdf-domain-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;
}
