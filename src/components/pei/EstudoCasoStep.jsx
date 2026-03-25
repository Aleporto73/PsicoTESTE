import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ESTUDO_CASO_FIELDS } from '../../data/peiSchema';
import usePEICompliance from '../../hooks/usePEICompliance';

/**
 * EstudoCasoStep - Etapa 1 de 4 do Wizard PEI
 *
 * Permite o preenchimento do Estudo de Caso (Art. 11, Decreto 12.773/2025).
 * O Estudo de Caso documenta barreiras, contexto, potencialidades e estratégias.
 *
 * @param {Object} props
 * @param {Object} props.peiPlan - Plano PEI atual
 * @param {Function} props.onUpdate - Callback para atualizar o plano (recebe { estudoCaso: {...} })
 * @param {Object} props.sessionInfo - Informações da sessão VB-MAPP
 */
export default function EstudoCasoStep({ peiPlan, onUpdate, sessionInfo }) {
  // ═══════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════

  const peiCompliance = usePEICompliance(sessionInfo);

  // Estado local para os campos do estudo de caso
  const [estudoCaso, setEstudoCaso] = useState(
    peiPlan?.studioCaso || {
      barreiras_demandas: '',
      contexto_escolar: '',
      potencialidades: '',
      estrategias_acessibilidade: ''
    }
  );

  // Ref para timer de debounce
  const debounceTimers = useRef({});

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Gera o Estudo de Caso automaticamente a partir dos dados VB-MAPP
   */
  const handleGenerateEstudoCaso = useCallback(() => {
    if (!sessionInfo) {
      alert('Dados da sessão VB-MAPP não encontrados.');
      return;
    }

    const scores = sessionInfo.scores_snapshot || {};
    const barreiras = sessionInfo.barreiras || [];
    const lacunas = sessionInfo.lacunas || [];

    const gerado = peiCompliance.generateEstudoCaso(scores, barreiras, lacunas);

    setEstudoCaso(gerado);

    // Atualizar imediatamente
    if (onUpdate) {
      onUpdate({ estudoCaso: gerado });
    }
  }, [sessionInfo, peiCompliance, onUpdate]);

  /**
   * Atualiza um campo do estudo de caso com debounce
   */
  const handleFieldChange = useCallback((fieldKey, value) => {
    // Atualizar estado local imediatamente
    setEstudoCaso(prev => ({
      ...prev,
      [fieldKey]: value
    }));

    // Limpar timer anterior se existir
    if (debounceTimers.current[fieldKey]) {
      clearTimeout(debounceTimers.current[fieldKey]);
    }

    // Definir novo timer com 500ms debounce
    debounceTimers.current[fieldKey] = setTimeout(() => {
      if (onUpdate) {
        onUpdate({
          estudoCaso: {
            ...estudoCaso,
            [fieldKey]: value
          }
        });
      }
    }, 500);
  }, [estudoCaso, onUpdate]);

  /**
   * Calcula quantos campos estão válidos
   */
  const countValidFields = useCallback(() => {
    let valid = 0;
    Object.entries(ESTUDO_CASO_FIELDS).forEach(([key, fieldDef]) => {
      const value = estudoCaso[key] || '';
      if (value.length >= fieldDef.minChars) {
        valid += 1;
      }
    });
    return valid;
  }, [estudoCaso]);

  const validFields = countValidFields();
  const totalFields = Object.keys(ESTUDO_CASO_FIELDS).length;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="estudo-caso-step">
      <style>{getStyles()}</style>

      {/* HEADER */}
      <header className="step-header">
        <div className="header-content">
          <div className="step-badge">Etapa 1 de 4</div>
          <h1>Estudo de Caso</h1>
          <p className="header-subtitle">
            Art. 11, Decreto 12.773/2025
          </p>
        </div>
      </header>

      {/* INFO BANNER */}
      <section className="info-banner">
        <div className="banner-content">
          <span className="banner-icon">ℹ️</span>
          <div className="banner-text">
            <strong>O Estudo de Caso é a base do PEI</strong>
            <p>
              Ele documenta barreiras, contexto escolar, potencialidades e
              estratégias de acessibilidade que orientarão as intervenções.
            </p>
          </div>
        </div>
      </section>

      {/* AUTO-GENERATE BUTTON */}
      <section className="action-section">
        <button
          className="btn-generate"
          onClick={handleGenerateEstudoCaso}
          disabled={!sessionInfo}
          title={!sessionInfo ? 'Dados VB-MAPP não disponíveis' : 'Preencher automaticamente a partir da Avaliação VB-MAPP'}
        >
          <span className="btn-icon">🔄</span>
          Preencher a partir da Avaliação VB-MAPP
        </button>
      </section>

      {/* FORM FIELDS */}
      <section className="form-section">
        <div className="fields-container">
          {Object.entries(ESTUDO_CASO_FIELDS).map(([fieldKey, fieldDef]) => {
            const value = estudoCaso[fieldKey] || '';
            const isValid = value.length >= fieldDef.minChars;
            const charCount = value.length;
            const minChars = fieldDef.minChars;

            return (
              <div key={fieldKey} className="field-group">
                {/* LABEL */}
                <div className="field-header">
                  <label className="field-label">
                    {fieldDef.label}
                  </label>
                  <span className="field-helptext">
                    {fieldDef.helpText}
                  </span>
                </div>

                {/* TEXTAREA */}
                <textarea
                  className={`field-textarea ${isValid ? 'valid' : 'invalid'}`}
                  value={value}
                  onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                  placeholder={fieldDef.placeholder}
                  minLength={minChars}
                />

                {/* CHARACTER COUNTER */}
                <div className="field-footer">
                  <span className={`char-counter ${isValid ? 'valid' : 'invalid'}`}>
                    {charCount}/{minChars}
                    <span className="counter-status">
                      {isValid ? ' ✓' : ' ✗'}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PROGRESS INDICATOR */}
      <section className="progress-section">
        <div className="progress-card">
          <span className="progress-text">
            <strong>{validFields} de {totalFields}</strong> campos preenchidos
          </span>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${(validFields / totalFields) * 100}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Estilos inline para o componente EstudoCasoStep
 * Otimizado para acessibilidade: fontes grandes (min 14px), botões grandes (min 44px)
 */
function getStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

    .estudo-caso-step {
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
    /* INFO BANNER */
    /* ═══════════════════════════════════════════════════════════════ */

    .info-banner {
      background: white;
      border-left: 5px solid #10b981;
      margin: 25px 5%;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      max-width: 1200px;
    }

    .banner-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .banner-icon {
      font-size: 28px;
      flex-shrink: 0;
    }

    .banner-text {
      flex: 1;
      min-width: 0;
    }

    .banner-text strong {
      display: block;
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .banner-text p {
      font-size: 15px;
      color: #4b5563;
      margin: 0;
      line-height: 1.5;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* ACTION SECTION */
    /* ═══════════════════════════════════════════════════════════════ */

    .action-section {
      padding: 0 5%;
      max-width: 1200px;
      margin: 0 auto 30px;
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
    /* FORM SECTION */
    /* ═══════════════════════════════════════════════════════════════ */

    .form-section {
      padding: 0 5%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .fields-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* FIELD GROUP */
    /* ─────────────────────────────────────────────────────────────── */

    .field-group {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .field-group:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .field-header {
      margin-bottom: 12px;
    }

    .field-label {
      display: block;
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 6px;
    }

    .field-helptext {
      display: block;
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
      line-height: 1.4;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* TEXTAREA */
    /* ─────────────────────────────────────────────────────────────── */

    .field-textarea {
      width: 100%;
      min-height: 120px;
      padding: 14px 12px;
      font-size: 15px;
      font-family: 'Nunito', system-ui, sans-serif;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      resize: vertical;
      transition: all 0.2s ease;
      line-height: 1.6;
      color: #1f2937;
    }

    .field-textarea:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .field-textarea.valid {
      border-color: #10b981;
      background: linear-gradient(to bottom, #f0fdf4, white);
    }

    .field-textarea.invalid {
      border-color: #ef4444;
      background: linear-gradient(to bottom, #fef2f2, white);
    }

    .field-textarea::placeholder {
      color: #9ca3af;
    }

    /* ─────────────────────────────────────────────────────────────── */
    /* FIELD FOOTER & COUNTER */
    /* ─────────────────────────────────────────────────────────────── */

    .field-footer {
      margin-top: 8px;
      display: flex;
      justify-content: flex-end;
    }

    .char-counter {
      font-size: 13px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .char-counter.valid {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .char-counter.invalid {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .counter-status {
      margin-left: 4px;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* PROGRESS SECTION */
    /* ═══════════════════════════════════════════════════════════════ */

    .progress-section {
      padding: 30px 5%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .progress-card {
      background: white;
      padding: 24px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-left: 5px solid #f59e0b;
    }

    .progress-text {
      display: block;
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 12px;
    }

    .progress-bar-container {
      width: 100%;
      height: 16px;
      background: #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
      border-radius: 8px;
      transition: width 0.3s ease;
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

      .info-banner {
        margin: 20px 20px;
      }

      .action-section,
      .form-section,
      .progress-section {
        padding-left: 20px;
        padding-right: 20px;
      }

      .fields-container {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .banner-content {
        flex-direction: column;
        gap: 12px;
      }

      .banner-icon {
        font-size: 24px;
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

      .field-label {
        font-size: 15px;
      }

      .field-helptext {
        font-size: 13px;
      }

      .field-textarea {
        font-size: 14px;
        padding: 12px 10px;
        min-height: 100px;
      }

      .btn-generate {
        min-height: 44px;
        font-size: 15px;
      }
    }
  `;
}
