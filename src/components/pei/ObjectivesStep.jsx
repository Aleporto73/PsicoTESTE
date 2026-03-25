import React, { useState, useCallback, useRef } from 'react';
import { TIME_HORIZONS, METRIC_TYPES } from '../../data/peiSchema';
import { DOMAIN_NAMES_PEI } from '../../data/constants';
import usePEICompliance from '../../hooks/usePEICompliance';

/**
 * ObjectivesStep - Etapa 2 de 4 do Wizard PEI
 *
 * Permite o preenchimento de Objetivos Mensuráveis agrupados por horizonte temporal.
 * Cada objetivo possui domínio, descrição, tipo de métrica, baseline, alvo e critérios.
 *
 * @param {Object} props
 * @param {Object} props.peiPlan - Plano PEI atual
 * @param {Function} props.onUpdate - Callback para atualizar o plano (recebe { objectives: [...] })
 * @param {Object} props.sessionInfo - Informações da sessão VB-MAPP
 */
export default function ObjectivesStep({ peiPlan, onUpdate, sessionInfo }) {
  // ═══════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════

  const peiCompliance = usePEICompliance(sessionInfo);

  // Estado local para objetivos
  const [objectives, setObjectives] = useState(
    peiPlan?.objectives || []
  );

  // Estado para rastrear qual objetivo está sendo editado
  const [editingId, setEditingId] = useState(null);

  // Ref para timers de debounce
  const debounceTimers = useRef({});

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Gera objetivos automaticamente a partir das lacunas identificadas
   */
  const handleGenerateObjectives = useCallback(() => {
    if (!sessionInfo) {
      alert('Dados da sessão VB-MAPP não encontrados.');
      return;
    }

    const lacunas = sessionInfo.lacunas || [];
    const scores = sessionInfo.scores_snapshot || {};
    const barreiras = sessionInfo.barreiras || [];

    const gerados = peiCompliance.generateObjectives(lacunas, scores, barreiras);

    setObjectives(gerados);

    // Atualizar imediatamente
    if (onUpdate) {
      onUpdate({ objectives: gerados });
    }
  }, [sessionInfo, peiCompliance, onUpdate]);

  /**
   * Adiciona um novo objetivo vazio para um horizonte específico
   */
  const handleAddObjective = useCallback((timeHorizon) => {
    const horizonObj = TIME_HORIZONS.find(h => h.value === timeHorizon);
    const newObjective = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      domain: 'DOM01',
      horizon: timeHorizon,
      horizonLabel: horizonObj?.label || timeHorizon,
      description: '',
      metricType: 'percent',
      baseline: 0,
      target: 80,
      successCriteria: '',
      teachingProgram: '',
      createdAt: new Date().toISOString()
    };

    const updated = [...objectives, newObjective];
    setObjectives(updated);

    if (onUpdate) {
      onUpdate({ objectives: updated });
    }

    // Auto-focus na descrição do novo objetivo
    setTimeout(() => {
      const textarea = document.querySelector(
        `[data-objective-id="${newObjective.id}"][data-field="description"]`
      );
      if (textarea) textarea.focus();
    }, 0);
  }, [objectives, onUpdate]);

  /**
   * Atualiza um campo do objetivo com debounce
   */
  const handleUpdateObjective = useCallback((objectiveId, fieldName, value) => {
    // Atualizar estado local imediatamente
    setObjectives(prev =>
      prev.map(obj =>
        obj.id === objectiveId
          ? { ...obj, [fieldName]: value }
          : obj
      )
    );

    // Limpar timer anterior se existir
    if (debounceTimers.current[objectiveId]) {
      clearTimeout(debounceTimers.current[objectiveId]);
    }

    // Definir novo timer com 500ms debounce
    debounceTimers.current[objectiveId] = setTimeout(() => {
      if (onUpdate) {
        onUpdate({ objectives });
      }
    }, 500);
  }, [objectives, onUpdate]);

  /**
   * Deleta um objetivo
   */
  const handleDeleteObjective = useCallback((objectiveId) => {
    if (window.confirm('Tem certeza que deseja deletar este objetivo?')) {
      const updated = objectives.filter(obj => obj.id !== objectiveId);
      setObjectives(updated);

      if (onUpdate) {
        onUpdate({ objectives: updated });
      }
    }
  }, [objectives, onUpdate]);

  /**
   * Conta objetivos por horizonte
   */
  const countByHorizon = useCallback((horizonValue) => {
    return objectives.filter(obj => obj.horizon === horizonValue).length;
  }, [objectives]);

  /**
   * Filtra objetivos por horizonte
   */
  const getObjectivesByHorizon = useCallback((horizonValue) => {
    return objectives.filter(obj => obj.horizon === horizonValue);
  }, [objectives]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  const totalObjectives = objectives.length;

  return (
    <div className="objectives-step">
      <style>{getStyles()}</style>

      {/* HEADER */}
      <header className="step-header">
        <div className="header-content">
          <div className="step-badge">Etapa 2 de 4</div>
          <h1>Objetivos Mensuráveis</h1>
          <p className="header-subtitle">
            Defina objetivos claros, mensuráveis e alcançáveis
          </p>
        </div>
      </header>

      {/* ACTION SECTION */}
      <section className="action-section">
        <button
          className="btn-generate"
          onClick={handleGenerateObjectives}
          disabled={!sessionInfo}
          title={!sessionInfo ? 'Dados VB-MAPP não disponíveis' : 'Gerar objetivos a partir das lacunas identificadas'}
        >
          <span className="btn-icon">✨</span>
          Gerar Objetivos a partir das Lacunas
        </button>
      </section>

      {/* HORIZONS SECTIONS */}
      <section className="horizons-section">
        {TIME_HORIZONS.map(horizon => {
          const horizonObjectives = getObjectivesByHorizon(horizon.value);
          const objectiveCount = horizonObjectives.length;

          return (
            <div key={horizon.value} className="horizon-container">
              {/* HORIZON HEADER */}
              <div className="horizon-header" style={{ borderColor: horizon.color }}>
                <div className="horizon-title-section">
                  <h2 className="horizon-title">
                    {horizon.label}
                  </h2>
                  <span className="horizon-duration">{horizon.duration}</span>
                </div>
                <div className="horizon-counter" style={{ backgroundColor: horizon.color }}>
                  {objectiveCount}
                </div>
              </div>

              {/* OBJECTIVES CARDS */}
              <div className="objectives-list">
                {horizonObjectives.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📌</span>
                    <p>Nenhum objetivo definido para este período</p>
                  </div>
                ) : (
                  horizonObjectives.map((objective, idx) => (
                    <div
                      key={objective.id}
                      className="objective-card"
                      data-objective-id={objective.id}
                    >
                      {/* CARD HEADER */}
                      <div className="card-header">
                        <div className="card-title">
                          <span className="domain-badge" style={{ backgroundColor: horizon.color }}>
                            {objective.domain}
                          </span>
                          <span className="domain-name">
                            {DOMAIN_NAMES_PEI[objective.domain] || objective.domain}
                          </span>
                        </div>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteObjective(objective.id)}
                          title="Deletar objetivo"
                          aria-label="Deletar objetivo"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* DESCRIPTION FIELD */}
                      <div className="form-group">
                        <label className="form-label">Descrição da Habilidade</label>
                        <textarea
                          className="form-textarea"
                          value={objective.description}
                          onChange={(e) =>
                            handleUpdateObjective(objective.id, 'description', e.target.value)
                          }
                          placeholder="Descreva claramente a habilidade a ser desenvolvida..."
                          data-objective-id={objective.id}
                          data-field="description"
                        />
                      </div>

                      {/* DOMAIN & METRIC FIELDS */}
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Domínio</label>
                          <select
                            className="form-select"
                            value={objective.domain}
                            onChange={(e) =>
                              handleUpdateObjective(objective.id, 'domain', e.target.value)
                            }
                          >
                            {Object.entries(DOMAIN_NAMES_PEI).map(([code, name]) => (
                              <option key={code} value={code}>
                                {code} - {name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Tipo de Métrica</label>
                          <select
                            className="form-select"
                            value={objective.metricType}
                            onChange={(e) =>
                              handleUpdateObjective(objective.id, 'metricType', e.target.value)
                            }
                          >
                            {METRIC_TYPES.map(metric => (
                              <option key={metric.value} value={metric.value}>
                                {metric.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* BASELINE & TARGET FIELDS */}
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Linha de Base</label>
                          <input
                            type="number"
                            className="form-input-number"
                            value={objective.baseline}
                            onChange={(e) =>
                              handleUpdateObjective(objective.id, 'baseline', parseInt(e.target.value) || 0)
                            }
                            min="0"
                            placeholder="0"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Meta (Alvo)</label>
                          <input
                            type="number"
                            className="form-input-number"
                            value={objective.target}
                            onChange={(e) =>
                              handleUpdateObjective(objective.id, 'target', parseInt(e.target.value) || 80)
                            }
                            min="0"
                            placeholder="80"
                          />
                        </div>
                      </div>

                      {/* SUCCESS CRITERIA */}
                      <div className="form-group">
                        <label className="form-label">Critérios de Sucesso</label>
                        <textarea
                          className="form-textarea-small"
                          value={objective.successCriteria}
                          onChange={(e) =>
                            handleUpdateObjective(objective.id, 'successCriteria', e.target.value)
                          }
                          placeholder="Descreva como o sucesso será medido (ex: 3 tentativas consecutivas corretas)..."
                        />
                      </div>

                      {/* TEACHING PROGRAM */}
                      <div className="form-group">
                        <label className="form-label">Programa de Ensino</label>
                        <textarea
                          className="form-textarea-small"
                          value={objective.teachingProgram}
                          onChange={(e) =>
                            handleUpdateObjective(objective.id, 'teachingProgram', e.target.value)
                          }
                          placeholder="Descreva a estratégia de intervenção (procedimentos, frequência, materiais)..."
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ADD OBJECTIVE BUTTON */}
              <button
                className="btn-add-objective"
                onClick={() => handleAddObjective(horizon.value)}
                style={{ borderColor: horizon.color }}
              >
                <span className="btn-icon">+</span>
                Adicionar Objetivo
              </button>
            </div>
          );
        })}
      </section>

      {/* SUMMARY COUNTER */}
      <section className="summary-section">
        <div className="summary-card">
          <span className="summary-text">
            <strong>{totalObjectives}</strong> objetivos definidos
          </span>
        </div>
      </section>
    </div>
  );
}

/**
 * Estilos inline para o componente ObjectivesStep
 * Otimizado para acessibilidade: fontes grandes (min 14px), botões grandes (min 44px)
 */
function getStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

    .objectives-step {
      font-family: 'Nunito', system-ui, sans-serif;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
      min-height: 100vh;
      padding-bottom: 50px;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* HEADER */
    /* ═══════════════════════════════════════════════════════════════ */

    .step-header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      padding: 30px 5%;
      box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .step-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.25);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .step-header h1 {
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .header-subtitle {
      font-size: 16px;
      opacity: 0.95;
      margin: 0;
      font-weight: 500;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* ACTION SECTION */
    /* ═══════════════════════════════════════════════════════════════ */

    .action-section {
      padding: 25px 5%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .btn-generate {
      width: 100%;
      min-height: 48px;
      padding: 14px 20px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .btn-generate:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
      transform: translateY(-2px);
    }

    .btn-generate:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-generate:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-icon {
      font-size: 20px;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* HORIZONS SECTION */
    /* ═══════════════════════════════════════════════════════════════ */

    .horizons-section {
      padding: 0 5%;
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
    }

    .horizon-container {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* HORIZON HEADER */
    /* ─────────────────────────────────────────────────────────────── */

    .horizon-header {
      padding: 16px 20px;
      border-left: 5px solid;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .horizon-title-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .horizon-title {
      font-size: 18px;
      font-weight: 800;
      color: #1f2937;
      margin: 0;
    }

    .horizon-duration {
      font-size: 13px;
      color: #6b7280;
      font-weight: 600;
    }

    .horizon-counter {
      min-width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* OBJECTIVES LIST */
    /* ─────────────────────────────────────────────────────────────── */

    .objectives-list {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 80px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;
    }

    .empty-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 8px;
    }

    .empty-state p {
      font-size: 14px;
      margin: 0;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* OBJECTIVE CARD */
    /* ─────────────────────────────────────────────────────────────── */

    .objective-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
    }

    .objective-card:hover {
      background: #ffffff;
      border-color: #d1d5db;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .domain-badge {
      padding: 4px 10px;
      border-radius: 4px;
      color: white;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .domain-name {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }

    .btn-delete {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      opacity: 0.6;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-delete:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* FORM GROUPS */
    /* ─────────────────────────────────────────────────────────────── */

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* TEXTAREA */
    /* ─────────────────────────────────────────────────────────────── */

    .form-textarea,
    .form-textarea-small {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      font-family: 'Nunito', system-ui, sans-serif;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      resize: vertical;
      transition: all 0.2s ease;
      line-height: 1.5;
      color: #1f2937;
    }

    .form-textarea {
      min-height: 80px;
    }

    .form-textarea-small {
      min-height: 60px;
    }

    .form-textarea:focus,
    .form-textarea-small:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-textarea::placeholder,
    .form-textarea-small::placeholder {
      color: #9ca3af;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* SELECT & INPUT */
    /* ─────────────────────────────────────────────────────────────── */

    .form-select,
    .form-input-number {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      font-family: 'Nunito', system-ui, sans-serif;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      transition: all 0.2s ease;
      color: #1f2937;
      background: white;
    }

    .form-select:focus,
    .form-input-number:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M1 4l5 4 5-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      padding-right: 30px;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* ADD OBJECTIVE BUTTON */
    /* ─────────────────────────────────────────────────────────────── */

    .btn-add-objective {
      padding: 12px;
      margin: 0 16px 16px;
      border: 2px dashed;
      background: white;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      color: #374151;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 44px;
    }

    .btn-add-objective:hover {
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* SUMMARY SECTION */
    /* ═══════════════════════════════════════════════════════════════ */

    .summary-section {
      padding: 30px 5%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-left: 5px solid #10b981;
      text-align: center;
    }

    .summary-text {
      display: block;
      font-size: 16px;
      color: #1f2937;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* RESPONSIVE */
    /* ═══════════════════════════════════════════════════════════════ */

    @media (max-width: 768px) {
      .step-header {
        padding: 25px 20px;
      }

      .step-header h1 {
        font-size: 24px;
      }

      .horizons-section {
        grid-template-columns: 1fr;
        gap: 20px;
        padding-left: 20px;
        padding-right: 20px;
      }

      .action-section,
      .summary-section {
        padding-left: 20px;
        padding-right: 20px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .card-header {
        flex-direction: column;
        gap: 8px;
      }

      .card-title {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 480px) {
      .step-header {
        padding: 20px 16px;
      }

      .step-header h1 {
        font-size: 20px;
      }

      .header-subtitle {
        font-size: 14px;
      }

      .form-label {
        font-size: 12px;
      }

      .form-textarea,
      .form-textarea-small,
      .form-select,
      .form-input-number {
        font-size: 14px;
        padding: 10px 10px;
      }

      .form-textarea {
        min-height: 70px;
      }

      .form-textarea-small {
        min-height: 50px;
      }

      .btn-generate,
      .btn-add-objective {
        min-height: 44px;
        font-size: 15px;
      }

      .horizons-section {
        padding-left: 16px;
        padding-right: 16px;
      }

      .action-section,
      .summary-section {
        padding-left: 16px;
        padding-right: 16px;
      }
    }
  `;
}
