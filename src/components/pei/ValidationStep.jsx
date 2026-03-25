import React, { useState, useMemo } from 'react';
import { validatePlanHealth, PLAN_STATUS } from '../../data/peiSchema';

export default function ValidationStep({
  peiPlan,
  onUpdate,
  onActivate,
  sessionInfo
}) {
  // ═══════════════════════════════════════════════════════════════
  // STATE & VALIDATION
  // ═══════════════════════════════════════════════════════════════
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const validation = useMemo(() => {
    return validatePlanHealth(peiPlan);
  }, [peiPlan]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const updatedPlan = {
        ...peiPlan,
        status: PLAN_STATUS.draft,
        updatedAt: new Date().toISOString()
      };
      onUpdate(updatedPlan);
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!validation.canActivate) {
      console.warn('Plano não pode ser ativado neste momento');
      return;
    }

    setIsActivating(true);
    try {
      const now = new Date();
      const reviewDate = new Date(now);
      reviewDate.setMonth(reviewDate.getMonth() + 6);

      const activatedPlan = {
        ...peiPlan,
        status: PLAN_STATUS.active,
        activated_at: now.toISOString(),
        review_date: reviewDate.toISOString(),
        updatedAt: now.toISOString()
      };

      onActivate(activatedPlan);
    } catch (error) {
      console.error('Erro ao ativar plano:', error);
    } finally {
      setIsActivating(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════

  const getProgressBarColor = (percentage) => {
    if (percentage < 40) return '#ef4444';
    if (percentage < 70) return '#f59e0b';
    return '#10b981';
  };

  const getStatusIcon = (isValid) => {
    return isValid ? '🟢' : '🔴';
  };

  const countObjectivesByHorizon = () => {
    const objectives = peiPlan?.objectives || [];
    return {
      curto: objectives.filter(o => o.horizon === 'curto').length,
      medio: objectives.filter(o => o.horizon === 'medio').length,
      longo: objectives.filter(o => o.horizon === 'longo').length,
      total: objectives.length
    };
  };

  const countOrientationsCompleted = () => {
    const orientations = peiPlan?.orientations || {};
    return Object.values(orientations).filter(v => v && v.trim().length > 0).length;
  };

  const countResourcesDefined = () => {
    const resources = peiPlan?.resources || {};
    return Object.values(resources).some(arr => Array.isArray(arr) && arr.length > 0);
  };

  const objectiveCounts = countObjectivesByHorizon();
  const orientationsCount = countOrientationsCompleted();
  const resourcesDefined = countResourcesDefined();

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return '—';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="validation-step">
      <style>{getStyles()}</style>

      {/* HEADER */}
      <header className="step-header">
        <div className="header-content">
          <h1>Etapa 4 de 4 — Validação do Plano</h1>
          <p>Revisão final e ativação do Plano Educacional Individualizado</p>
        </div>
      </header>

      <main className="step-main">
        {/* PLAN HEALTH DASHBOARD */}
        <section className="section plan-health">
          <h2>📊 Saúde do Plano</h2>

          {/* PROGRESS BAR */}
          <div className="progress-container">
            <div className="progress-info">
              <span className="progress-label">Preenchimento do Plano</span>
              <span className="progress-value">{validation.completionPct}%</span>
            </div>
            <div className="progress-bar-wrapper">
              <div
                className="progress-bar"
                style={{
                  width: `${validation.completionPct}%`,
                  backgroundColor: getProgressBarColor(validation.completionPct)
                }}
              />
            </div>
          </div>

          {/* VALIDATION CHECKLIST */}
          <div className="validation-checklist">
            {/* Estudo de Caso */}
            <div className="checklist-item">
              <span className="icon">
                {validation.errors.some(e => e.includes('Barreiras')) ? '🔴' : '🟢'}
              </span>
              <div className="item-content">
                <h3>Estudo de Caso</h3>
                <div className="sub-items">
                  <div className="sub-item">
                    <span className="sub-icon">
                      {(peiPlan?.studioCaso?.barreiras_demandas || '').length >= 30 ? '✓' : '✗'}
                    </span>
                    <span>Barreiras e Demandas: {(peiPlan?.studioCaso?.barreiras_demandas || '').length} caracteres</span>
                  </div>
                  <div className="sub-item">
                    <span className="sub-icon">
                      {(peiPlan?.studioCaso?.contexto_escolar || '').length >= 30 ? '✓' : '✗'}
                    </span>
                    <span>Contexto Escolar: {(peiPlan?.studioCaso?.contexto_escolar || '').length} caracteres</span>
                  </div>
                  <div className="sub-item">
                    <span className="sub-icon">
                      {(peiPlan?.studioCaso?.potencialidades || '').length >= 30 ? '✓' : '✗'}
                    </span>
                    <span>Potencialidades: {(peiPlan?.studioCaso?.potencialidades || '').length} caracteres</span>
                  </div>
                  <div className="sub-item">
                    <span className="sub-icon">
                      {(peiPlan?.studioCaso?.estrategias_acessibilidade || '').length >= 30 ? '✓' : '✗'}
                    </span>
                    <span>Estratégias: {(peiPlan?.studioCaso?.estrategias_acessibilidade || '').length} caracteres</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Objetivos */}
            <div className="checklist-item">
              <span className="icon">
                {objectiveCounts.total >= 1 ? '🟢' : '🔴'}
              </span>
              <div className="item-content">
                <h3>Objetivos Mensuráveis</h3>
                <div className="sub-items">
                  <div className="sub-item">
                    <span className="sub-icon">
                      {objectiveCounts.total >= 1 ? '✓' : '✗'}
                    </span>
                    <span>{objectiveCounts.total} objetivo(s) definido(s) (mínimo 1)</span>
                  </div>
                  <div className="sub-item">
                    <span>
                      <strong>Curto Prazo:</strong> {objectiveCounts.curto} | <strong>Médio:</strong> {objectiveCounts.medio} | <strong>Longo:</strong> {objectiveCounts.longo}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Programas e Adaptações */}
            <div className="checklist-item">
              <span className="icon">
                {(peiPlan?.selected_procedures?.length || 0) > 0 && orientationsCount >= 2 ? '🟢' : '🔴'}
              </span>
              <div className="item-content">
                <h3>Programas e Adaptações</h3>
                <div className="sub-items">
                  <div className="sub-item">
                    <span className="sub-icon">
                      {(peiPlan?.selected_procedures?.length || 0) > 0 ? '✓' : '✗'}
                    </span>
                    <span>{peiPlan?.selected_procedures?.length || 0} procedimento(s) selecionado(s)</span>
                  </div>
                  <div className="sub-item">
                    <span className="sub-icon">
                      {orientationsCount >= 2 ? '✓' : '✗'}
                    </span>
                    <span>Orientações preenchidas: {orientationsCount}/4</span>
                  </div>
                  <div className="sub-item">
                    <span className="sub-icon">
                      {resourcesDefined ? '✓' : '✗'}
                    </span>
                    <span>Recursos definidos: {resourcesDefined ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ERROR MESSAGES */}
        {validation.errors.length > 0 && (
          <section className="section errors-section">
            <h2 className="section-title-errors">⚠️ Erros Críticos</h2>
            <div className="messages-list">
              {validation.errors.map((error, idx) => (
                <div key={idx} className="error-message">
                  <span className="error-icon">🔴</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WARNING MESSAGES */}
        {validation.warnings.length > 0 && (
          <section className="section warnings-section">
            <h2 className="section-title-warnings">⚡ Avisos</h2>
            <div className="messages-list">
              {validation.warnings.map((warning, idx) => (
                <div key={idx} className="warning-message">
                  <span className="warning-icon">🟡</span>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PLAN SUMMARY PREVIEW */}
        <section className="section plan-summary">
          <h2>📋 Resumo do Plano</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Nome da Criança</span>
              <span className="value">{peiPlan?.studentName || '—'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Idade</span>
              <span className="value">{calculateAge(peiPlan?.studentBirthDate)} anos</span>
            </div>
            <div className="summary-item">
              <span className="label">Série/Ano</span>
              <span className="value">{peiPlan?.grade || '—'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Data de Criação</span>
              <span className="value">{formatDate(peiPlan?.createdAt)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Data de Revisão (previsão)</span>
              <span className="value">
                {new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Status</span>
              <span className="value status-badge">{getStatusBadge(peiPlan?.status || PLAN_STATUS.draft)}</span>
            </div>
          </div>

          <div className="decree-compliance">
            <span className="compliance-icon">✓</span>
            <span>
              Este PEI atende aos requisitos do <strong>Decreto Brasileiro 12.773/2025</strong>
            </span>
          </div>
        </section>
      </main>

      {/* ACTION BUTTONS */}
      <footer className="step-footer">
        <button
          className="btn-draft"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? '⏳ Salvando...' : '💾 Salvar como Rascunho'}
        </button>
        <button
          className={`btn-activate ${!validation.canActivate ? 'disabled' : ''}`}
          onClick={handleActivate}
          disabled={!validation.canActivate || isActivating}
          title={
            !validation.canActivate
              ? 'Complete todos os campos obrigatórios para ativar o plano'
              : 'Clique para ativar este plano'
          }
        >
          {isActivating ? '⏳ Ativando...' : '✅ Ativar Plano'}
        </button>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getStatusBadge(status) {
  const badges = {
    draft: '📝 Rascunho',
    incomplete: '⏳ Incompleto',
    valid: '✓ Válido',
    active: '🟢 Ativo',
    review: '🔄 Em Revisão',
    expired: '⏱️ Expirado'
  };
  return badges[status] || status;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════

function getStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

    .validation-step {
      font-family: 'Nunito', system-ui, sans-serif;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
      min-height: 100vh;
      padding-bottom: 120px;
    }

    /* HEADER */
    .step-header {
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      color: white;
      padding: 30px 5%;
      box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .header-content p {
      font-size: 16px;
      opacity: 0.95;
      margin: 0;
    }

    /* MAIN CONTENT */
    .step-main {
      padding: 30px 5%;
      max-width: 1000px;
      margin: 0 auto;
    }

    /* SECTIONS */
    .section {
      background: white;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-left: 5px solid #7c3aed;
    }

    .section h2 {
      font-size: 22px;
      font-weight: 800;
      color: #1f2937;
      margin: 0 0 25px 0;
    }

    /* PLAN HEALTH */
    .plan-health {
      border-left-color: #7c3aed;
    }

    .progress-container {
      margin-bottom: 30px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .progress-label {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
    }

    .progress-value {
      font-size: 24px;
      font-weight: 800;
      color: #7c3aed;
    }

    .progress-bar-wrapper {
      width: 100%;
      height: 28px;
      background: #f3f4f6;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
    }

    .progress-bar {
      height: 100%;
      border-radius: 14px;
      transition: all 0.4s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* VALIDATION CHECKLIST */
    .validation-checklist {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .checklist-item {
      display: flex;
      gap: 18px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      transition: all 0.3s;
    }

    .checklist-item:hover {
      border-color: #d1d5db;
      background: #fafbfc;
    }

    .checklist-item .icon {
      font-size: 32px;
      flex-shrink: 0;
      line-height: 1;
    }

    .item-content {
      flex: 1;
    }

    .item-content h3 {
      font-size: 17px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 12px 0;
    }

    .sub-items {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sub-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      color: #374151;
    }

    .sub-icon {
      font-size: 18px;
      color: #10b981;
      font-weight: 600;
    }

    .sub-item:has(.sub-icon:contains("✗")) {
      color: #6b7280;
    }

    /* ERROR MESSAGES */
    .errors-section {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .section-title-errors {
      color: #dc2626 !important;
    }

    .error-message {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px;
      background: white;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
      font-size: 15px;
      color: #dc2626;
      line-height: 1.5;
    }

    .error-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    /* WARNING MESSAGES */
    .warnings-section {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .section-title-warnings {
      color: #d97706 !important;
    }

    .warning-message {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px;
      background: white;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      font-size: 15px;
      color: #d97706;
      line-height: 1.5;
    }

    .warning-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* PLAN SUMMARY */
    .plan-summary {
      border-left-color: #0891b2;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .summary-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .summary-item .label {
      font-size: 13px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-item .value {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
    }

    .status-badge {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      width: fit-content;
    }

    .decree-compliance {
      background: linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%);
      border: 2px solid #6ee7b7;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 15px;
      color: #047857;
      line-height: 1.6;
    }

    .compliance-icon {
      font-size: 32px;
      flex-shrink: 0;
    }

    .decree-compliance strong {
      color: #065f46;
      font-weight: 700;
    }

    /* FOOTER */
    .step-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 2px solid #e5e7eb;
      padding: 20px 5%;
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
      z-index: 100;
    }

    .btn-draft,
    .btn-activate {
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-draft {
      background: #e5e7eb;
      color: #1f2937;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }

    .btn-draft:hover:not(:disabled) {
      background: #d1d5db;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    }

    .btn-activate {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-activate:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }

    .btn-activate:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-activate.disabled,
    .btn-draft:disabled,
    .btn-activate:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .step-header {
        padding: 25px 5%;
      }

      .header-content h1 {
        font-size: 24px;
      }

      .header-content p {
        font-size: 14px;
      }

      .step-main {
        padding: 20px 5%;
      }

      .section {
        padding: 20px;
        margin-bottom: 20px;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .step-footer {
        padding: 15px 5%;
        flex-wrap: wrap;
        gap: 10px;
      }

      .btn-draft,
      .btn-activate {
        flex: 1;
        min-width: 150px;
      }
    }
  `;
}
