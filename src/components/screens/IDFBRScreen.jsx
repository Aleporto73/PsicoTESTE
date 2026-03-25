/*
 * IDFBRScreen — Tela principal IDF-BR v0.1 (Partial)
 *
 * SEPARADO do MDF-BR. Lógica própria.
 * 3 estágios:
 * 1. Seleção de Faixa (band)
 * 2. Aplicação: itens por domínio com S/P/N/NA
 * 3. Resultado: scores por domínio + plano de intervenção
 */

import React, { useState } from 'react';
import useIDFBRLogic from '../../hooks/useIDFBRLogic';

export default function IDFBRScreen({ sessionInfo, onFinalize, onBack, isReadOnly = false }) {
  const logic = useIDFBRLogic(sessionInfo, isReadOnly);
  const [stage, setStage] = useState(
    isReadOnly && logic.existingData ? 'result' :
    logic.selectedBand ? 'application' : 'band'
  );
  const [expandedItem, setExpandedItem] = useState(null);
  const [showInterventions, setShowInterventions] = useState(false);

  const childAgeMonths = sessionInfo?.child_age_total_months || null;

  const domainColors = {
    LIN: '#0d9488',
    SOC: '#7c3aed',
    COG: '#2563eb',
    MOT: '#d97706',
    AVD: '#be185d',
  };

  // ════════════════════════════════════════════
  // STAGE 1: BAND SELECTION
  // ════════════════════════════════════════════
  if (stage === 'band') {
    return (
      <div className="idf-screen">
        <style>{getStyles()}</style>
        <header className="idf-header">
          <button className="idf-btn-back" onClick={onBack}>← Voltar</button>
          <div>
            <h1>IDF-BR <span className="idf-version">v0.1</span></h1>
            <p>Inventário de Desenvolvimento Funcional Brasileiro</p>
          </div>
        </header>

        <div className="idf-band-section">
          <h2>Selecione a Faixa Etária</h2>
          <p className="idf-subtitle">
            {childAgeMonths
              ? `Idade registrada: ${childAgeMonths} meses.`
              : 'Selecione a faixa para avaliação.'}
            {' '}Pacote parcial v0.1 — faixas disponíveis abaixo.
          </p>

          <div className="idf-band-grid">
            {logic.bands.map(band => {
              const itemCount = logic.meta.domains.length; // at least 5 per band, but F2 has more
              const items = logic.meta.total_items; // approximate
              const isRecommended = childAgeMonths && band.code === (() => {
                if (childAgeMonths <= 12) return 'F1';
                if (childAgeMonths <= 24) return 'F2';
                if (childAgeMonths <= 48) return 'F4';
                if (childAgeMonths <= 60) return 'F5';
                return 'F6';
              })();

              return (
                <button
                  key={band.code}
                  className={`idf-band-card ${isRecommended ? 'recommended' : ''}`}
                  onClick={() => {
                    logic.setSelectedBand(band.code);
                    logic.selectBandByAge(0); // just reset responses
                    logic.setSelectedBand(band.code);
                    setStage('application');
                  }}
                >
                  <span className="idf-band-code">{band.code}</span>
                  <span className="idf-band-label">{band.label}</span>
                  {isRecommended && <span className="idf-band-badge">Sugerido</span>}
                </button>
              );
            })}
          </div>

          <div className="idf-partial-notice">
            <strong>Pacote parcial v0.1</strong> — Faixa F3 (24–36m) será disponibilizada em versão futura.
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // STAGE 2: APPLICATION
  // ════════════════════════════════════════════
  if (stage === 'application') {
    const currentBand = logic.bands.find(b => b.code === logic.selectedBand);

    return (
      <div className="idf-screen">
        <style>{getStyles()}</style>
        <header className="idf-header">
          <button className="idf-btn-back" onClick={() => setStage('band')}>← Faixa</button>
          <div>
            <h1>IDF-BR — {currentBand?.label || logic.selectedBand}</h1>
            <p>{logic.progress.answered}/{logic.progress.total} itens respondidos</p>
          </div>
          <div className="idf-header-actions">
            <div className="idf-progress-mini">
              <div className="idf-progress-bar-mini">
                <div className="idf-progress-fill-mini" style={{ width: `${logic.progress.percent}%` }} />
              </div>
              <span>{logic.progress.percent}%</span>
            </div>
          </div>
        </header>

        <div className="idf-items-container">
          {logic.currentItems.map((item) => {
            const currentScore = logic.responses[item.item_id];
            const isAnswered = currentScore && ['S', 'P', 'N', 'NA'].includes(currentScore);
            const isExpanded = expandedItem === item.item_id;
            const color = domainColors[item.domain_code] || '#64748b';

            return (
              <div
                key={item.item_id}
                className={`idf-item-card ${isAnswered ? 'answered' : ''}`}
                style={{ borderLeftColor: color }}
              >
                <div className="idf-item-header">
                  <div className="idf-item-meta">
                    <span className="idf-domain-badge" style={{ background: `${color}15`, color, borderColor: `${color}40` }}>
                      {item.domain_code}
                    </span>
                    <span className="idf-domain-label">{item.domain_label}</span>
                    <span className="idf-item-id">{item.item_id}</span>
                  </div>
                  {isAnswered && <span className="idf-answered-check">✓</span>}
                </div>

                <p className="idf-item-text">{item.item_text_authored}</p>

                <div className="idf-collection-mode">
                  <span>{item.collection_mode === 'mixed' ? '👁 Observação + Relato' :
                    item.collection_mode === 'direct_observation' ? '👁 Observação direta' :
                    '💬 Relato do cuidador'}</span>
                </div>

                <button
                  className="idf-expand-btn"
                  onClick={() => setExpandedItem(isExpanded ? null : item.item_id)}
                >
                  {isExpanded ? 'Ocultar rubricas ▲' : 'Ver rubricas ▼'}
                </button>

                {isExpanded && (
                  <div className="idf-rubrics">
                    <div className="idf-rubric-row s"><span className="idf-rubric-code">S</span><p>{item.score_S_text}</p></div>
                    <div className="idf-rubric-row p"><span className="idf-rubric-code">P</span><p>{item.score_P_text}</p></div>
                    <div className="idf-rubric-row n"><span className="idf-rubric-code">N</span><p>{item.score_N_text}</p></div>
                    <div className="idf-rubric-row na"><span className="idf-rubric-code">NA</span><p>{item.score_NA_text}</p></div>
                  </div>
                )}

                <div className="idf-score-buttons">
                  {['S', 'P', 'N', 'NA'].map(code => (
                    <button
                      key={code}
                      className={`idf-score-btn ${code.toLowerCase()} ${currentScore === code ? 'active' : ''}`}
                      onClick={() => logic.handleScoreChange(item.item_id, code)}
                      disabled={isReadOnly}
                    >
                      <span className="idf-score-code">{code}</span>
                      <span className="idf-score-meaning">
                        {code === 'S' ? 'Presente' : code === 'P' ? 'Parcial' : code === 'N' ? 'Ausente' : 'N/A'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="idf-footer">
          <button className="idf-btn-secondary" onClick={() => setStage('band')}>Trocar Faixa</button>
          <button
            className={`idf-btn-primary ${logic.progress.answered >= 3 ? '' : 'disabled'}`}
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
  // STAGE 3: RESULT + INTERVENTIONS
  // ════════════════════════════════════════════
  if (stage === 'result') {
    const r = logic.result;
    const currentBand = logic.bands.find(b => b.code === logic.selectedBand);

    return (
      <div className="idf-screen">
        <style>{getStyles()}</style>
        <header className="idf-header">
          <button className="idf-btn-back" onClick={() => setStage('application')}>← Itens</button>
          <div>
            <h1>Resultado — IDF-BR</h1>
            <p>Faixa {currentBand?.label} | {r?.instrument_version}</p>
          </div>
        </header>

        {r && (
          <div className="idf-result-container">
            {/* Summary Card */}
            <div className="idf-summary-card">
              <div className="idf-summary-main">
                <div className="idf-pct-display">
                  <span className="idf-pct-value">{r.total_percentage.toFixed(1)}%</span>
                  <span className="idf-pct-label">Funcionalidade Global</span>
                </div>
                <div className="idf-summary-stats">
                  <div className="idf-stat">
                    <span className="idf-stat-value">{r.total_valid}</span>
                    <span className="idf-stat-label">Itens válidos</span>
                  </div>
                  <div className="idf-stat">
                    <span className="idf-stat-value">{r.na_count}</span>
                    <span className="idf-stat-label">NA (excluídos)</span>
                  </div>
                  <div className="idf-stat">
                    <span className="idf-stat-value">{r.items_n.length}</span>
                    <span className="idf-stat-label">Ausentes (N)</span>
                  </div>
                  <div className="idf-stat">
                    <span className="idf-stat-value">{r.items_p.length}</span>
                    <span className="idf-stat-label">Parciais (P)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Domain Scores */}
            <div className="idf-domains-result">
              <h3>Scores por Domínio</h3>
              <div className="idf-domain-grid">
                {r.dominios.map(d => {
                  const color = domainColors[d.code] || '#64748b';
                  const pct = d.percentage !== null ? d.percentage : 0;
                  return (
                    <div key={d.code} className="idf-domain-result-card">
                      <div className="idf-domain-result-header">
                        <span className="idf-domain-code" style={{ color }}>{d.code}</span>
                        <span className="idf-domain-pct" style={{ color: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {d.percentage !== null ? `${d.percentage}%` : 'N/A'}
                        </span>
                      </div>
                      <span className="idf-domain-name">{d.label}</span>
                      <div className="idf-domain-bar">
                        <div className="idf-domain-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div className="idf-domain-detail">
                        <span>{d.valid_count} válido(s)</span>
                        {d.na_count > 0 && <span>{d.na_count} NA</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intervention Plan */}
            {r.intervention_plan.length > 0 && (
              <div className="idf-interventions-section">
                <div className="idf-interventions-header">
                  <h3>Plano de Intervenção ({r.intervention_plan.length} ações)</h3>
                  <button
                    className="idf-btn-toggle"
                    onClick={() => setShowInterventions(!showInterventions)}
                  >
                    {showInterventions ? 'Ocultar ▲' : 'Expandir ▼'}
                  </button>
                </div>

                {showInterventions && (
                  <div className="idf-interventions-list">
                    {r.intervention_plan.map((ip, i) => (
                      <div key={i} className={`idf-intervention-card ${ip.score_code.toLowerCase()}`}>
                        <div className="idf-intervention-header">
                          <span className={`idf-intervention-score ${ip.score_code.toLowerCase()}`}>
                            {ip.score_code}
                          </span>
                          <span className="idf-intervention-domain" style={{ color: domainColors[ip.domain_code] }}>
                            {ip.domain_code}
                          </span>
                          <span className="idf-intervention-type">{ip.plan_type}</span>
                          <span className={`idf-intervention-priority ${ip.priority}`}>
                            {ip.priority === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                        <p className="idf-intervention-action">{ip.recommended_action}</p>
                        <p className="idf-intervention-target">Alvo: {ip.target_area}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {!isReadOnly && (
              <footer className="idf-result-footer">
                <button className="idf-btn-secondary" onClick={() => setStage('application')}>
                  Revisar Respostas
                </button>
                <button
                  className="idf-btn-primary"
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
    .idf-screen {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 20px 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      min-height: 100vh;
    }

    .idf-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px 0;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .idf-header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #1e293b; }
    .idf-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .idf-version { font-size: 14px; font-weight: 500; color: #b45309; background: #fef3c7; padding: 2px 8px; border-radius: 6px; }
    .idf-header-actions { margin-left: auto; }

    .idf-btn-back {
      background: #f1f5f9; border: 2px solid #e2e8f0; color: #475569;
      padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    }
    .idf-btn-back:hover { background: #e2e8f0; }

    /* BAND SELECTION */
    .idf-band-section { text-align: center; padding: 20px 0; }
    .idf-band-section h2 { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 10px; }
    .idf-subtitle { color: #64748b; font-size: 16px; margin: 0 0 30px; }

    .idf-band-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px; max-width: 720px; margin: 0 auto;
    }

    .idf-band-card {
      background: white; border: 2px solid #e2e8f0; border-radius: 14px;
      padding: 24px 16px; cursor: pointer; transition: all 0.25s;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      position: relative;
    }
    .idf-band-card:hover { border-color: #b45309; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(180, 83, 9, 0.12); }
    .idf-band-card.recommended { border-color: #b45309; background: #fffbeb; }
    .idf-band-code { font-size: 28px; font-weight: 800; color: #b45309; }
    .idf-band-label { font-size: 14px; color: #64748b; font-weight: 500; }
    .idf-band-badge {
      position: absolute; top: -10px; right: -10px; background: #b45309; color: white;
      font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
    }

    .idf-partial-notice {
      margin-top: 30px; padding: 16px 24px; background: #fef3c7;
      border-radius: 12px; border: 1px solid #fde68a; color: #92400e; font-size: 14px;
      max-width: 720px; margin-left: auto; margin-right: auto;
    }

    /* APPLICATION */
    .idf-items-container { display: flex; flex-direction: column; gap: 20px; margin-bottom: 100px; }

    .idf-item-card {
      background: white; border: 2px solid #e2e8f0; border-left: 5px solid #e2e8f0;
      border-radius: 14px; padding: 24px; transition: all 0.25s;
    }
    .idf-item-card.answered { border-color: #d1fae5; border-left-color: inherit; }

    .idf-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .idf-item-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

    .idf-domain-badge {
      padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
      border: 1.5px solid; letter-spacing: 0.5px;
    }
    .idf-domain-label { font-size: 14px; color: #475569; font-weight: 600; }
    .idf-item-id { font-size: 11px; color: #94a3b8; font-family: monospace; }
    .idf-answered-check {
      width: 28px; height: 28px; border-radius: 50%; background: #d1fae5; color: #065f46;
      display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;
    }

    .idf-item-text { color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 10px; }

    .idf-collection-mode {
      margin-bottom: 10px; font-size: 12px; color: #64748b;
    }

    .idf-expand-btn {
      background: none; border: none; color: #b45309; font-size: 13px; font-weight: 600;
      cursor: pointer; padding: 0; margin-bottom: 14px;
    }
    .idf-expand-btn:hover { text-decoration: underline; }

    .idf-rubrics {
      background: #f8fafc; border-radius: 10px; padding: 16px; margin-bottom: 16px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .idf-rubric-row { display: flex; gap: 12px; align-items: flex-start; padding: 8px; border-radius: 8px; }
    .idf-rubric-row.s { background: #f0fdf4; }
    .idf-rubric-row.p { background: #fffbeb; }
    .idf-rubric-row.n { background: #fff1f2; }
    .idf-rubric-row.na { background: #f1f5f9; }
    .idf-rubric-code {
      width: 32px; height: 28px; border-radius: 6px; display: flex; align-items: center;
      justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0;
      background: white; border: 1px solid #e2e8f0;
    }
    .idf-rubric-row p { margin: 0; font-size: 13px; color: #475569; line-height: 1.5; }

    /* SCORE BUTTONS */
    .idf-score-buttons { display: flex; gap: 8px; flex-wrap: wrap; }

    .idf-score-btn {
      flex: 1; min-width: 80px; padding: 14px 8px; border: 2px solid #e2e8f0;
      background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .idf-score-btn:hover:not(:disabled) { transform: translateY(-2px); }

    .idf-score-btn.active.s { background: #d1fae5; border-color: #10b981; color: #065f46; }
    .idf-score-btn.active.p { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
    .idf-score-btn.active.n { background: #fee2e2; border-color: #ef4444; color: #991b1b; }
    .idf-score-btn.active.na { background: #f1f5f9; border-color: #94a3b8; color: #475569; }

    .idf-score-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .idf-score-code { font-size: 20px; font-weight: 800; }
    .idf-score-meaning { font-size: 11px; font-weight: 600; }

    /* PROGRESS MINI */
    .idf-progress-mini { display: flex; align-items: center; gap: 10px; }
    .idf-progress-bar-mini { width: 120px; height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
    .idf-progress-fill-mini { height: 100%; background: #b45309; border-radius: 10px; transition: width 0.3s; }
    .idf-progress-mini span { font-size: 13px; font-weight: 700; color: #b45309; }

    /* FOOTER */
    .idf-footer {
      position: fixed; bottom: 0; left: 0; right: 0; background: white;
      border-top: 2px solid #e2e8f0; padding: 16px 24px;
      display: flex; justify-content: center; gap: 16px; z-index: 100;
    }

    .idf-btn-primary {
      background: #b45309; color: white; border: none; padding: 14px 32px;
      border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .idf-btn-primary:hover:not(:disabled) { background: #92400e; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(180, 83, 9, 0.25); }
    .idf-btn-primary.disabled { background: #94a3b8; cursor: not-allowed; }

    .idf-btn-secondary {
      background: #f1f5f9; color: #475569; border: 2px solid #e2e8f0;
      padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .idf-btn-secondary:hover { background: #e2e8f0; }

    /* RESULT */
    .idf-result-container { display: flex; flex-direction: column; gap: 24px; }

    .idf-summary-card {
      background: white; padding: 32px; border-radius: 16px; border: 2px solid #e2e8f0;
    }
    .idf-summary-main { display: flex; align-items: center; gap: 30px; flex-wrap: wrap; }
    .idf-pct-display { display: flex; flex-direction: column; align-items: center; }
    .idf-pct-value { font-size: 48px; font-weight: 800; color: #b45309; line-height: 1; }
    .idf-pct-label { font-size: 14px; font-weight: 600; color: #64748b; margin-top: 4px; }

    .idf-summary-stats { display: flex; gap: 20px; flex-wrap: wrap; }
    .idf-stat { display: flex; flex-direction: column; align-items: center; padding: 12px 20px; background: #f8fafc; border-radius: 10px; }
    .idf-stat-value { font-size: 24px; font-weight: 800; color: #1e293b; }
    .idf-stat-label { font-size: 12px; color: #64748b; font-weight: 500; }

    /* DOMAIN RESULTS */
    .idf-domains-result { background: white; padding: 28px; border-radius: 16px; border: 2px solid #e2e8f0; }
    .idf-domains-result h3 { margin: 0 0 20px; font-size: 20px; font-weight: 700; color: #1e293b; }
    .idf-domain-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
    .idf-domain-result-card { background: #f8fafc; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 6px; }
    .idf-domain-result-header { display: flex; justify-content: space-between; align-items: center; }
    .idf-domain-code { font-size: 13px; font-weight: 700; }
    .idf-domain-pct { font-size: 24px; font-weight: 800; }
    .idf-domain-name { font-size: 12px; color: #64748b; font-weight: 500; }
    .idf-domain-bar { height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin-top: 4px; }
    .idf-domain-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }
    .idf-domain-detail { display: flex; gap: 10px; font-size: 11px; color: #94a3b8; }
    .idf-domain-weight { font-size: 11px; color: #94a3b8; font-weight: 600; }

    /* INTERVENTIONS */
    .idf-interventions-section { background: white; padding: 28px; border-radius: 16px; border: 2px solid #e2e8f0; }
    .idf-interventions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .idf-interventions-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #1e293b; }

    .idf-btn-toggle {
      background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569;
      padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .idf-btn-toggle:hover { background: #e2e8f0; }

    .idf-interventions-list { display: flex; flex-direction: column; gap: 12px; }

    .idf-intervention-card {
      padding: 18px; border-radius: 12px; border-left: 4px solid;
    }
    .idf-intervention-card.n { background: #fef2f2; border-left-color: #ef4444; }
    .idf-intervention-card.p { background: #fffbeb; border-left-color: #f59e0b; }

    .idf-intervention-header { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
    .idf-intervention-score {
      font-size: 12px; font-weight: 800; padding: 2px 10px; border-radius: 6px; background: white;
    }
    .idf-intervention-score.n { color: #991b1b; border: 1px solid #fecaca; }
    .idf-intervention-score.p { color: #92400e; border: 1px solid #fde68a; }
    .idf-intervention-domain { font-size: 13px; font-weight: 700; }
    .idf-intervention-type { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }
    .idf-intervention-priority { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .idf-intervention-priority.medium { background: #fef3c7; color: #92400e; }
    .idf-intervention-priority.low { background: #f1f5f9; color: #64748b; }

    .idf-intervention-action { margin: 0 0 4px; font-size: 14px; color: #334155; line-height: 1.5; }
    .idf-intervention-target { margin: 0; font-size: 12px; color: #64748b; font-style: italic; }

    .idf-result-footer { display: flex; justify-content: center; gap: 16px; padding: 20px 0; }

    @media (max-width: 640px) {
      .idf-band-grid { grid-template-columns: repeat(2, 1fr); }
      .idf-score-buttons { flex-wrap: wrap; }
      .idf-summary-main { flex-direction: column; text-align: center; }
      .idf-domain-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `;
}
