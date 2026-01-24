import React, { useState, useMemo } from 'react';

/* COMPONENTE: TELA 2 — Subtestes / Análise de Tarefas */
export default function SubtestesScreen({ lacunas, sessionInfo, onFinalize, onBack, isReadOnly }) {
  const [validacoes, setValidacoes] = useState(() => {
    if (sessionInfo?.lacunas_validadas) {
      const initial = {};
      sessionInfo.lacunas_validadas.forEach(l => {
        initial[l.block_id] = {
          tipo_subteste: l.tipo_subteste,
          status_validacao: l.status_validacao,
          observacao: l.observacao
        };
      });
      return initial;
    }
    return {};
  });

  // Progresso de validação
  const progress = useMemo(() => {
    const total = lacunas.length;
    const validadas = Object.values(validacoes).filter(v =>
      v.tipo_subteste && v.status_validacao && v.observacao && v.observacao.trim().length >= 10
    ).length;

    return {
      total,
      validadas,
      pendentes: total - validadas,
      percentComplete: total > 0 ? ((validadas / total) * 100).toFixed(1) : 0
    };
  }, [validacoes, lacunas]);

  const canFinalize = progress.validadas === progress.total && progress.total > 0;

  const setValidacao = (blockId, field, value) => {
    if (isReadOnly) return;
    setValidacoes(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        [field]: value
      }
    }));
  };

  const handleFinalize = () => {
    if (!canFinalize) {
      alert(`Você precisa validar TODAS as ${lacunas.length} lacunas. Faltam ${progress.pendentes} lacunas.`);
      return;
    }

    // Gerar lacunas_validadas
    const lacunasValidadas = lacunas.map(lacuna => {
      const val = validacoes[lacuna.block_id];
      return {
        block_id: lacuna.block_id,
        domain_name: lacuna.domain_name,
        level: lacuna.level,
        texto: lacuna.texto,
        status_original: lacuna.status,
        tipo_subteste: val.tipo_subteste,
        status_validacao: val.status_validacao,
        observacao: val.observacao.trim()
      };
    });

    const subtestesData = {
      session_id: sessionInfo.session_id,
      child_name: sessionInfo.child_name,
      date_milestones: sessionInfo.date,
      date_subtestes: new Date().toISOString(),
      tarefas_completas: true,
      lacunas_validadas: lacunasValidadas,
      schema_version: 'vbmapp_subtestes_v1'
    };

    onFinalize(subtestesData);
  };

  const isLacunaCompleta = (blockId) => {
    const val = validacoes[blockId];
    return val && val.tipo_subteste && val.status_validacao && val.observacao && val.observacao.trim().length >= 10;
  };

  if (lacunas.length === 0) {
    return (
      <div className="subtestes-screen">
        <style>{getSubtestesStyles()}</style>
        <header className="subtestes-header">
          <div className="header-content">
            <h1>TELA 2 — Subtestes / Análise de Tarefas</h1>
            <p>Nenhuma lacuna para validar</p>
          </div>
          {onBack && (
            <button className="btn btn-back" onClick={onBack}>
              ← Voltar
            </button>
          )}
        </header>
        <div className="empty-state">
          <p>😊 Nenhuma lacuna foi identificada na avaliação de Milestones.</p>
          <p>Todas as habilidades estão dominadas!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subtestes-screen">
      <style>{getSubtestesStyles()}</style>

      {/* HEADER */}
      <header className="subtestes-header">
        <div className="header-content">
          <h1>TELA 2 — Subtestes / Análise de Tarefas</h1>
          <p>Validação Funcional das Lacunas</p>
          <div className="session-info">
            <strong>{sessionInfo.child_name}</strong> - Avaliado em {new Date(sessionInfo.date).toLocaleDateString('pt-BR')}
          </div>
        </div>
        {onBack && (
          <button className="btn btn-back" onClick={onBack}>
            ← Voltar
          </button>
        )}
      </header>

      {/* PROGRESS SUMMARY */}
      <section className="progress-summary">
        <div className="progress-header">
          <h2>Progresso de Validação</h2>
          <div className="progress-indicator">
            <span className="progress-text">
              {progress.validadas} / {progress.total} lacunas validadas ({progress.percentComplete}%)
            </span>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {progress.pendentes > 0 && (
          <div className="validation-alert">
            ⚠️ Faltam {progress.pendentes} lacunas para validar
          </div>
        )}
      </section>

      {/* LACUNAS */}
      <div className="lacunas-container">
        {lacunas.map((lacuna, index) => {
          const val = validacoes[lacuna.block_id] || {};
          const isCompleta = isLacunaCompleta(lacuna.block_id);

          return (
            <article key={lacuna.block_id} className={`lacuna-card ${isCompleta ? 'completa' : 'pendente'}`}>
              <div className="lacuna-header">
                <div className="lacuna-number">#{index + 1}</div>
                <div className="lacuna-info">
                  <div className="lacuna-domain">
                    <span className="domain-badge">{lacuna.domain_name}</span>
                    <span className="level-badge">{lacuna.level}</span>
                  </div>
                  <div className="lacuna-status">
                    Status original: <span className={`status-badge status-${lacuna.status}`}>
                      {lacuna.status === 'emergente' ? 'Emergente' : 'Não Observado'}
                    </span>
                  </div>
                </div>
                {isCompleta && <div className="check-badge">✓</div>}
              </div>

              <div className="lacuna-text">
                <strong>Habilidade:</strong> {lacuna.texto}
              </div>

              <div className="validation-form">
                {/* TIPO DE SUBTESTE */}
                <div className="form-group">
                  <label className="form-label">Tipo de Subteste *</label>
                  <div className="radio-group">
                    {[
                      { value: 'ecoico', label: 'Ecoico', icon: '🗣️' },
                      { value: 'motor', label: 'Motor', icon: '🤸' },
                      { value: 'visual', label: 'Visual', icon: '👁️' },
                      { value: 'verbal', label: 'Verbal', icon: '💬' },
                      { value: 'funcional', label: 'Funcional', icon: '🎯' }
                    ].map(tipo => (
                      <label key={tipo.value} className="radio-label">
                        <input
                          type="radio"
                          name={`tipo_${lacuna.block_id}`}
                          value={tipo.value}
                          checked={val.tipo_subteste === tipo.value}
                          onChange={(e) => setValidacao(lacuna.block_id, 'tipo_subteste', e.target.value)}
                          disabled={isReadOnly}
                        />
                        <span className="radio-text">{tipo.icon} {tipo.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* STATUS DE VALIDAÇÃO */}
                <div className="form-group">
                  <label className="form-label">Status de Validação *</label>
                  <div className="radio-group">
                    {[
                      { value: 'confirmado', label: 'Confirmado', color: 'success' },
                      { value: 'parcialmente_confirmado', label: 'Parcialmente Confirmado', color: 'warning' },
                      { value: 'nao_confirmado', label: 'Não Confirmado', color: 'neutral' }
                    ].map(status => (
                      <label key={status.value} className="radio-label">
                        <input
                          type="radio"
                          name={`status_${lacuna.block_id}`}
                          value={status.value}
                          checked={val.status_validacao === status.value}
                          onChange={(e) => setValidacao(lacuna.block_id, 'status_validacao', e.target.value)}
                          disabled={isReadOnly}
                        />
                        <span className={`radio-text status-${status.color}`}>
                          {status.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* OBSERVAÇÃO */}
                <div className="form-group">
                  <label className="form-label">
                    Observação *
                    <span className="char-count">
                      {(val.observacao || '').length} caracteres (mínimo 10)
                    </span>
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Descreva brevemente a evidência observada durante a validação funcional..."
                    value={val.observacao || ''}
                    onChange={(e) => setValidacao(lacuna.block_id, 'observacao', e.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                  />
                  {val.observacao && val.observacao.trim().length > 0 && val.observacao.trim().length < 10 && (
                    <div className="field-error">
                      Observação deve ter no mínimo 10 caracteres
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ACTION PANEL */}
      <section className="action-panel">
        {!isReadOnly && (
          <button
            className={`btn btn-finalize ${canFinalize ? 'enabled' : 'disabled'}`}
            onClick={handleFinalize}
            disabled={!canFinalize}
          >
            ✓ Finalizar Validação
          </button>
        )}
        {isReadOnly && (
          <div className="read-only-badge">🔒 MODO VISUALIZAÇÃO</div>
        )}
      </section>
    </div>
  );
}

function getSubtestesStyles() {
  return `
    .subtestes-screen {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .subtestes-header {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .subtestes-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .subtestes-header p {
      opacity: 0.95;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .session-info {
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.15);
      border-radius: 6px;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .progress-summary {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 1px solid #e5e7eb;
    }

    .progress-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #111827;
    }

    .progress-indicator {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .progress-text {
      font-size: 1rem;
      font-weight: 600;
      color: #4b5563;
    }

    .progress-bar-container {
      width: 100%;
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
      transition: width 0.3s ease;
      border-radius: 6px;
    }

    .validation-alert {
      margin-top: 1rem;
      padding: 1rem;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      color: #92400e;
      font-weight: 600;
    }

    .lacunas-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .lacuna-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .lacuna-card.pendente {
      border-color: #f59e0b;
    }

    .lacuna-card.completa {
      border-color: #8b5cf6;
      background: #faf5ff;
    }

    .lacuna-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: flex-start;
    }

    .lacuna-number {
      background: #8b5cf6;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .lacuna-info {
      flex: 1;
    }

    .lacuna-domain {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .domain-badge {
      background: #ddd6fe;
      color: #5b21b6;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .level-badge {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .lacuna-status {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .status-emergente {
      background: #fef3c7;
      color: #92400e;
    }

    .status-nao_observado {
      background: #f3f4f6;
      color: #374151;
    }

    .check-badge {
      background: #8b5cf6;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .lacuna-text {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      line-height: 1.6;
      color: #111827;
    }

    .validation-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-label {
      font-weight: 600;
      color: #374151;
      font-size: 0.95rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .char-count {
      font-size: 0.75rem;
      color: #9ca3af;
      font-weight: 400;
    }

    .radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }

    .radio-label:hover {
      background: #f9fafb;
      border-color: #8b5cf6;
    }

    .radio-label input[type="radio"] {
      cursor: pointer;
    }

    .radio-label input[type="radio"]:checked + .radio-text {
      font-weight: 700;
    }

    .radio-label:has(input:checked) {
      border-color: #8b5cf6;
      background: #faf5ff;
    }

    .radio-text {
      font-size: 0.9rem;
      color: #374151;
    }

    .radio-text.status-success {
      color: #065f46;
    }

    .radio-text.status-warning {
      color: #92400e;
    }

    .radio-text.status-neutral {
      color: #374151;
    }

    .form-textarea {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    .field-error {
      color: #dc2626;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .action-panel {
      position: sticky;
      bottom: 0;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid #8b5cf6;
      box-shadow: 0 -4px 6px rgba(0,0,0,0.1);
      display: flex;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
      color: #6b7280;
      white-space: nowrap;
    }

    .btn:hover:not(:disabled) {
      background: #f9fafb;
      transform: translateY(-1px);
    }

    .btn-back {
      background: white;
      color: #8b5cf6;
      border-color: white;
    }

    .btn-finalize {
      background: #8b5cf6;
      color: white;
      border-color: #8b5cf6;
      font-size: 1.1rem;
      padding: 1rem 3rem;
    }

    .btn-finalize.enabled:hover {
      background: #7c3aed;
    }

    .btn-finalize.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #9ca3af;
      border-color: #9ca3af;
    }

    .empty-state {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      text-align: center;
      border: 2px dashed #e5e7eb;
    }

    .empty-state p {
      font-size: 1.1rem;
      color: #6b7280;
      margin: 0.5rem 0;
    }

      @media (max-width: 768px) {
        .lacuna-header {
          flex-direction: column;
        }

        .radio-group {
          flex-direction: column;
        }

        .radio-label {
          width: 100%;
        }
      }

      .read-only-badge {
        background: #faf5ff;
        color: #7c3aed;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-weight: 800;
        border: 2px solid #ddd6fe;
      }
    `;
}
