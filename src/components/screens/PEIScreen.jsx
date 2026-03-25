import React, { useState, useCallback } from 'react';
import usePEILogic from '../../hooks/usePEILogic';
import usePEICompliance from '../../hooks/usePEICompliance';
import { createEmptyPEIPlan, validatePlanHealth } from '../../data/peiSchema';
import EstudoCasoStep from '../pei/EstudoCasoStep';
import ObjectivesStep from '../pei/ObjectivesStep';
import ProgramsStep from '../pei/ProgramsStep';
import ValidationStep from '../pei/ValidationStep';

export default function PEIScreen({
  sessionInfo,
  onFinalize,
  onBack,
  isReadOnly = false
}) {
  // ═══════════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════════

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // PEI Plan state - initialize from session or create empty
  const [peiPlan, setPeiPlan] = useState(() => {
    if (sessionInfo?.pei_plan) {
      return sessionInfo.pei_plan;
    }
    return createEmptyPEIPlan();
  });

  // Keep the old usePEILogic hook for backward compatibility (statistics, lacunas)
  const {
    metasSelecionadas,
    expandedMilestones,
    nivelCrianca,
    lacunasPorDominio,
    estatisticas,
    DOMAIN_NAMES_PT,
    toggleMilestone,
    toggleTarefa,
    selecionarTodasTarefas,
    handleFinalize: handleFinalizeLegacy
  } = usePEILogic(sessionInfo, isReadOnly);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Atualiza o plano PEI com dados parciais
   */
  const handleUpdate = useCallback((updates) => {
    setPeiPlan(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Navega para o próximo passo do wizard
   */
  const handleNextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  /**
   * Navega para o passo anterior do wizard
   */
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  /**
   * Salta direto para um passo específico
   */
  const handleGoToStep = useCallback((step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  }, []);

  /**
   * Finaliza o PEI - chamado pelo ValidationStep
   */
  const handleActivatePlan = useCallback((activatedPlan) => {
    // Atualizar sessão com o plano ativado
    const completedPlan = {
      ...activatedPlan,
      status: 'active',
      updatedAt: new Date().toISOString()
    };

    // Chamar onFinalize com o plano completo
    if (onFinalize) {
      onFinalize({
        pei_plan: completedPlan,
        pei_completo: true,
        sessao_fechada: true
      });
    }
  }, [onFinalize]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  const STEPS = [
    { number: 1, label: 'Estudo de Caso' },
    { number: 2, label: 'Objetivos' },
    { number: 3, label: 'Programas' },
    { number: 4, label: 'Validação' }
  ];

  const dominiosComLacunas = Object.values(lacunasPorDominio).filter(d => d.milestones.length > 0);

  return (
    <div className="pei-screen">
      <style>{getStyles()}</style>

      {/* HEADER */}
      <header className="pei-header">
        <div className="header-content">
          <h1>📝 Plano Educacional Individualizado</h1>
          <p>Construção do PEI através do Assistente (Wizard)</p>
          <div className="header-badges">
            <span className="badge-child">
              {sessionInfo?.child_name || 'Criança'}
            </span>
            <span className="badge-level">
              Nível {nivelCrianca}
            </span>
            {isReadOnly && (
              <span className="badge-readonly">🔒 Somente Leitura</span>
            )}
          </div>
        </div>
        <button className="btn-back" onClick={onBack}>
          ← Voltar
        </button>
      </header>

      {/* RESUMO ESTATÍSTICO - Contexto da Avaliação VB-MAPP */}
      <section className="stats-section">
        <h2>📊 Consolidado da Avaliação - Nível {nivelCrianca}</h2>
        <p className="stats-subtitle">Estes dados da avaliação VB-MAPP servem como contexto para o preenchimento do PEI</p>
        <div className="stats-grid">
          <div className="stat-card verde">
            <span className="stat-numero">{estatisticas.percentDominado}%</span>
            <span className="stat-label">Dominados</span>
            <span className="stat-detalhe">{estatisticas.dominados} de {estatisticas.total}</span>
          </div>
          <div className="stat-card amarelo">
            <span className="stat-numero">{estatisticas.emergentes}</span>
            <span className="stat-label">Emergentes</span>
          </div>
          <div className="stat-card cinza">
            <span className="stat-numero">{estatisticas.naoObservados}</span>
            <span className="stat-label">Não Observados</span>
          </div>
          <div className="stat-card roxo">
            <span className="stat-numero">{estatisticas.totalLacunas}</span>
            <span className="stat-label">Lacunas</span>
            <span className="stat-detalhe">{estatisticas.totalTarefas} tarefas disponíveis</span>
          </div>
        </div>
      </section>

      {/* WIZARD PROGRESS BAR */}
      <section className="wizard-progress-section">
        <div className="wizard-progress-bar">
          {STEPS.map((step) => (
            <div key={step.number} className="wizard-progress-container">
              <button
                className={`wizard-step-button ${
                  step.number === currentStep ? 'active' : ''
                } ${step.number < currentStep ? 'completed' : ''}`}
                onClick={() => handleGoToStep(step.number)}
                disabled={isReadOnly}
                title={`Ir para ${step.label}`}
              >
                <span className="step-number">
                  {step.number < currentStep ? '✓' : step.number}
                </span>
              </button>
              <span className="step-label">{step.label}</span>
              {step.number < STEPS.length && <div className="step-connector" />}
            </div>
          ))}
        </div>
        <div className="progress-tracker">
          <span className="progress-text">
            Etapa {currentStep} de {STEPS.length}
          </span>
        </div>
      </section>

      {/* WIZARD STEPS CONTENT */}
      <section className="wizard-content-section">
        {currentStep === 1 && (
          <EstudoCasoStep
            peiPlan={peiPlan}
            onUpdate={handleUpdate}
            sessionInfo={sessionInfo}
          />
        )}

        {currentStep === 2 && (
          <ObjectivesStep
            peiPlan={peiPlan}
            onUpdate={handleUpdate}
            sessionInfo={sessionInfo}
          />
        )}

        {currentStep === 3 && (
          <ProgramsStep
            peiPlan={peiPlan}
            onUpdate={handleUpdate}
            sessionInfo={sessionInfo}
          />
        )}

        {currentStep === 4 && (
          <ValidationStep
            peiPlan={peiPlan}
            onUpdate={handleUpdate}
            onActivate={handleActivatePlan}
            sessionInfo={sessionInfo}
          />
        )}
      </section>

      {/* WIZARD NAVIGATION FOOTER */}
      <footer className="wizard-footer">
        <div className="footer-info">
          <span>Etapa {currentStep} de 4</span>
          <span>•</span>
          <span>PEI Customizado para {sessionInfo?.child_name || 'Criança'}</span>
        </div>
        <div className="footer-actions">
          <button
            className="btn-secundario"
            onClick={handlePreviousStep}
            disabled={currentStep === 1 || isReadOnly}
          >
            ← Anterior
          </button>

          {currentStep < 4 && (
            <button
              className="btn-primario"
              onClick={handleNextStep}
              disabled={isReadOnly}
            >
              Próximo →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════
function getStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

    .pei-screen {
      font-family: 'Nunito', system-ui, sans-serif;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
      min-height: 100vh;
      padding-bottom: 120px;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* HEADER */
    /* ═══════════════════════════════════════════════════════════════ */
    .pei-header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      padding: 25px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3);
    }

    .header-content h1 {
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 5px 0;
    }

    .header-content p {
      opacity: 0.9;
      font-size: 15px;
      margin: 0 0 12px 0;
    }

    .header-badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .header-badges span {
      background: rgba(255,255,255,0.2);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
    }

    .badge-level {
      background: rgba(255,255,255,0.3) !important;
    }

    .badge-readonly {
      background: rgba(239, 68, 68, 0.3) !important;
    }

    .btn-back {
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.3);
      color: white;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 40px;
      font-size: 14px;
    }

    .btn-back:hover {
      background: rgba(255,255,255,0.3);
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* STATS SECTION */
    /* ═══════════════════════════════════════════════════════════════ */
    .stats-section {
      padding: 25px 5%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-section h2 {
      font-size: 18px;
      font-weight: 800;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .stats-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 15px 0;
      font-weight: 500;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }

    .stat-card.verde { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
    .stat-card.amarelo { background: linear-gradient(135deg, #fef3c7, #fde68a); }
    .stat-card.cinza { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
    .stat-card.roxo { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }

    .stat-numero {
      display: block;
      font-size: 28px;
      font-weight: 800;
      color: #1f2937;
    }

    .stat-label {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #4b5563;
      margin-top: 4px;
    }

    .stat-detalhe {
      display: block;
      font-size: 13px;
      color: #6b7280;
      margin-top: 2px;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* WIZARD PROGRESS SECTION */
    /* ═══════════════════════════════════════════════════════════════ */
    .wizard-progress-section {
      padding: 30px 5%;
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .wizard-progress-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0;
      margin-bottom: 20px;
    }

    .wizard-progress-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      flex: 1;
      position: relative;
    }

    .wizard-step-button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 3px solid #e5e7eb;
      background: white;
      color: #6b7280;
      font-weight: 800;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .wizard-step-button:hover:not(:disabled) {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .wizard-step-button.active {
      border-color: #059669;
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }

    .wizard-step-button.completed {
      border-color: #10b981;
      background: #d1fae5;
      color: #059669;
    }

    .wizard-step-button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .step-number {
      display: block;
    }

    .step-label {
      font-size: 13px;
      font-weight: 700;
      color: #374151;
      text-align: center;
      max-width: 80px;
      line-height: 1.2;
    }

    .step-connector {
      position: absolute;
      top: 24px;
      left: 50%;
      width: 100%;
      height: 3px;
      background: #e5e7eb;
      z-index: -1;
    }

    .wizard-progress-container:nth-child(1) .step-connector {
      display: none;
    }

    .progress-tracker {
      text-align: center;
      padding: 12px;
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border-radius: 8px;
    }

    .progress-text {
      font-size: 14px;
      font-weight: 700;
      color: #059669;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* WIZARD CONTENT SECTION */
    /* ═══════════════════════════════════════════════════════════════ */
    .wizard-content-section {
      padding: 0 5%;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 400px;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* FOOTER NAVIGATION */
    /* ═══════════════════════════════════════════════════════════════ */
    .wizard-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 20px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
      z-index: 100;
      max-width: 100%;
    }

    .footer-info {
      display: flex;
      gap: 10px;
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
    }

    .footer-actions {
      display: flex;
      gap: 12px;
    }

    .btn-secundario {
      background: #f3f4f6;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 44px;
    }

    .btn-secundario:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .btn-secundario:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primario {
      background: linear-gradient(135deg, #059669, #10b981);
      border: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
      min-height: 44px;
    }

    .btn-primario:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
    }

    .btn-primario:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ═══════════════════════════════════════════════════════════════ */
    /* RESPONSIVE */
    /* ═══════════════════════════════════════════════════════════════ */
    @media (max-width: 768px) {
      .pei-header {
        flex-direction: column;
        text-align: center;
        gap: 15px;
        padding: 20px;
      }

      .header-content h1 {
        font-size: 22px;
      }

      .header-badges {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .stat-card {
        padding: 16px;
      }

      .stat-numero {
        font-size: 24px;
      }

      .wizard-progress-bar {
        flex-wrap: wrap;
        gap: 15px;
      }

      .wizard-progress-container {
        flex: 0 1 calc(50% - 8px);
      }

      .step-connector {
        display: none !important;
      }

      .wizard-footer {
        flex-direction: column;
        gap: 15px;
        padding: 15px;
      }

      .footer-actions {
        width: 100%;
        gap: 10px;
      }

      .btn-primario, .btn-secundario {
        flex: 1;
        font-size: 13px;
        padding: 10px 16px;
      }
    }

    @media (max-width: 480px) {
      .pei-header {
        padding: 16px;
      }

      .header-content h1 {
        font-size: 20px;
      }

      .header-content p {
        font-size: 13px;
      }

      .stats-section,
      .wizard-progress-section,
      .wizard-content-section {
        padding-left: 16px;
        padding-right: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .wizard-step-button {
        width: 44px;
        height: 44px;
        font-size: 14px;
      }

      .step-label {
        font-size: 12px;
        max-width: 70px;
      }

      .wizard-footer {
        padding: 12px 16px;
      }

      .footer-info {
        font-size: 12px;
        flex-direction: column;
        gap: 4px;
      }

      .footer-actions {
        width: 100%;
      }

      .btn-primario, .btn-secundario {
        flex: 1;
        font-size: 13px;
        padding: 10px 12px;
        min-height: 40px;
      }
    }
  `;
}