import React from 'react';
import { TASK_ANALYSIS_MAP } from '../../data/taskAnalysis';
import { useMilestoneLogic } from '../../hooks/useMilestoneLogic';

export default function MilestonesScreen({
  data,
  onFinalize,
  onBack,
  isReadOnly,
  sessionInfo
}) {
  // Use the custom hook for all business logic
  const logic = useMilestoneLogic(sessionInfo, data);

  // Handle readOnly mode - disable score setting if needed
  const setBlockScore = (blockId, value) => {
    if (isReadOnly) return;
    logic.setBlockScore(blockId, value);
  };

  // Handle finalize with readOnly check
  const handleFinalize = async () => {
    if (isReadOnly) return;
    await logic.handleFinalize(onFinalize);
  };

  // Handle level closing with readOnly check
  const handleCloseLevel = (levelId) => {
    if (isReadOnly) return;
    logic.handleCloseLevel(levelId);
  };

  // ✅ RENDERIZAÇÃO CONDICIONAL - SEM DADOS
  if (logic.domains.length === 0) {
    return (
      <div className="milestones-screen">
        <style>{getMilestonesStyles()}</style>

        <header className="milestones-header">
          <div className="header-content">
            <h1>VB-MAPP — Milestones</h1>
            <p>Avaliação de Marcos do Desenvolvimento</p>
          </div>
          <button className="btn btn-back" onClick={onBack}>
            ← Voltar
          </button>
        </header>

        <div className="no-data-state">
          <div className="no-data-icon">📋</div>
          <h2>Dados do VB-MAPP não encontrados</h2>
          <p>O arquivo de dados com os 154 blocos do VB-MAPP não está carregado.</p>
          <div className="no-data-actions">
            <button className="btn btn-primary" onClick={onBack}>
              Voltar para Sessões
            </button>
          </div>
          <div className="debug-info">
            <small>
              Debug: Data prop = {data ? "Presente" : "Ausente"} |
              Domínios: {logic.domains.length} |
              Session ID: {sessionInfo?.session_id || "Nova"}
            </small>
          </div>
        </div>
      </div>
    );
  }

  // ✅ RENDERIZAÇÃO PRINCIPAL
  return (
    <div className="milestones-screen">
      <style>{getMilestonesStyles()}</style>

      {/* HEADER */}
      <header className="milestones-header">
        <div className="header-content">
          <h1>VB-MAPP — Milestones</h1>
          <p>Avaliação de Marcos do Desenvolvimento (Tela 1/5)</p>
          <div className="session-meta">
            <span className="session-id">
              Sessão: <strong>{sessionInfo?.session_id?.substring(0, 12) || 'NOVA'}</strong>
            </span>
            {sessionInfo?.child_name && (
              <span className="session-child">
                Criança: <strong>{sessionInfo.child_name}</strong>
              </span>
            )}
            <span className="session-progress">
              Progresso: <strong>{logic.progress.context.percent}%</strong>
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Voltar para Lista
          </button>
          {isReadOnly && (
            <div className="read-only-badge">
              🔒 Somente Leitura
            </div>
          )}
        </div>
      </header>

      {/* PAINEL DE CONTROLE */}
      <section className="control-panel">
        <div className="control-group">
          <label htmlFor="childName">Nome da Criança *</label>
          <input
            id="childName"
            type="text"
            placeholder="Digite o nome da criança (mínimo 3 caracteres)..."
            value={logic.childName}
            onChange={e => logic.setChildName(e.target.value)}
            className="child-input"
            disabled={isReadOnly}
            maxLength={100}
          />
          <div className="input-hint">
            {logic.childName.trim().length < 3 ? (
              <span className="hint-warning">⚠️ Mínimo 3 caracteres</span>
            ) : (
              <span className="hint-success">✓ Nome válido</span>
            )}
          </div>
        </div>

        <div className="control-group">
          <label>Modo de Visualização</label>
          <div className="audience-toggle">
            <button
              className={`btn toggle-btn ${logic.audience === 'professional' ? 'active' : ''}`}
              onClick={() => logic.setAudience('professional')}
              disabled={isReadOnly}
            >
              <span className="toggle-icon">👨‍⚕️</span>
              <span className="toggle-text">Profissional</span>
            </button>
            <button
              className={`btn toggle-btn ${logic.audience === 'caregiver' ? 'active' : ''}`}
              onClick={() => logic.setAudience('caregiver')}
              disabled={isReadOnly}
            >
              <span className="toggle-icon">👨‍👩‍👧</span>
              <span className="toggle-text">Responsáveis</span>
            </button>
          </div>
        </div>

        {!isReadOnly && (
          <div className="control-group finalize-control">
            <button
              className={`btn btn-finalize ${logic.canFinalize ? 'enabled' : 'disabled'} ${logic.loading ? 'loading' : ''}`}
              onClick={handleFinalize}
              disabled={!logic.canFinalize || logic.loading}
              title={logic.canFinalize ?
                "Clique para finalizar e ir para Subtestes" :
                "Preencha todos os blocos e o nome para finalizar"}
            >
              {logic.loading ? (
                <>
                  <span className="spinner"></span>
                  Processando...
                </>
              ) : logic.canFinalize ? (
                <>
                  <span className="finalize-icon">🚀</span>
                  Finalizar e Ir para Subtestes
                </>
              ) : (
                <>
                  <span className="finalize-icon">⏳</span>
                  {logic.progress.global.evaluated}/{logic.progress.totalBlocks} avaliados
                </>
              )}
            </button>

            {!logic.canFinalize && logic.progress.filled > 0 && (
              <div className="completion-hint">
                ⚠️ Faltam <strong>{logic.progress.totalBlocks - logic.progress.filled}</strong> blocos
              </div>
            )}
          </div>
        )}
      </section>

      {/* RESUMO DE PROGRESSO (RELATIVO AO NÍVEL) */}
      <section className="progress-summary">
        <div className="summary-header">
          <h2>Progresso — {logic.progress.context.name}</h2>
          <div className="progress-badge">
            {logic.progress.context.percent}% completo
          </div>
        </div>

        <div className="progress-visual">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${logic.progress.context.percent}%` }}
              title={`${logic.progress.filled} de ${logic.progress.totalBlocks} blocos`}
            ></div>
          </div>
          <div className="progress-stats">
            <div className="stat-item stat-dominado" title="Itens com nota (Dominado/Emergente)">
              <div className="stat-value">{logic.progress.context.evaluated}</div>
              <div className="stat-label">Avaliados</div>
            </div>
            <div className="stat-item stat-nao-observado" title="Itens marcados como não observados">
              <div className="stat-value">{logic.progress.context.notObserved}</div>
              <div className="stat-label">Não Obs.</div>
            </div>
            <div className="stat-item stat-total" title="Itens sem nota no nível atual">
              <div className="stat-value">{logic.progress.totalBlocks - (logic.progress.context.evaluated + logic.progress.context.notObserved)}</div>
              <div className="stat-label">Pendentes</div>
            </div>
            <div className="stat-item stat-total-context" title="Total de itens no contexto atual">
              <div className="stat-value">{logic.progress.totalBlocks}</div>
              <div className="stat-label">Total do Nível</div>
            </div>
          </div>
        </div>

        {logic.progress.filled > 0 && (
          <div className="lacunas-preview">
            <h3>Prévia das Lacunas</h3>
            <p>
              <strong>{logic.generateLacunas().length} lacunas</strong> identificadas
              (serão validadas na próxima tela - Subtestes)
            </p>
          </div>
        )}
      </section>

      {/* FILTRO DE NÍVEL */}
      <section className="level-filter-bar">
        <div className="filter-label">
          <span className="filter-icon">🔍</span>
          Filtrar por Nível:
        </div>
        <div className="filter-options">
          {['Todos', 'Nível 1', 'Nível 2', 'Nível 3'].map(level => (
            <button
              key={level}
              className={`btn filter-btn ${logic.levelFilter === level ? 'active' : ''}`}
              onClick={() => logic.setLevelFilter(level)}
            >
              {level}
            </button>
          ))}
        </div>

        {logic.levelFilter !== 'Todos' && (
          <div className="phase-actions">
            <div className="phase-counter">
              Progresso do {logic.levelFilter}: <strong>{logic.progress.context.evaluated}/{logic.progress.totalBlocks}</strong>
            </div>
            {!isReadOnly && logic.progress.context.evaluated < logic.progress.totalBlocks && (
              <button
                className="btn btn-close-phase"
                onClick={() => handleCloseLevel(logic.levelFilter.split(' ')[1])}
                title="Encerrar esta fase e marcar itens restantes como não observados"
              >
                <span className="icon">🔒</span>
                Encerrar {logic.levelFilter}
              </button>
            )}
            {logic.auditLog[`nivel_${logic.levelFilter.split(' ')[1]}`] && (
              <span className="phase-badge-closed">✓ Fase Encerrada</span>
            )}
          </div>
        )}
      </section>

      {/* LISTA DE DOMÍNIOS E BLOCOS */}
      <div className="domains-container">
        {logic.filteredDomains.map(domain => {
          const domainBlocks = domain.blocks || [];
          const domainScores = domainBlocks
            .map(block => logic.scores[block.block_id])
            .filter(Boolean);

          const domainDominado = domainScores.filter(s => s === 'dominado').length;
          const domainPercent = domainBlocks.length > 0
            ? ((domainScores.length / domainBlocks.length) * 100).toFixed(1)
            : '0.0';

          return (
            <div key={domain.domain_id} className="domain-section">
              <div className="domain-header">
                <div className="domain-title">
                  <span className="domain-id">{domain.domain_id}</span>
                  <h3>{domain.domain_name}</h3>
                </div>

                <div className="domain-stats">
                  <div className="domain-stat">
                    <span className="stat-label">Preenchidos:</span>
                    <span className="stat-value">{domainScores.length}/{domainBlocks.length}</span>
                  </div>
                  <div className="domain-stat">
                    <span className="stat-label">Dominados:</span>
                    <span className="stat-value">{domainDominado}</span>
                  </div>
                  <div className="domain-stat">
                    <span className="stat-label">Progresso:</span>
                    <span className="stat-value">{domainPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="blocks-grid">
                {domainBlocks
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(block => {
                    const currentScore = logic.scores[block.block_id];
                    const text = logic.audience === 'professional'
                      ? block.texto_profissional
                      : block.texto_responsavel;

                    // ✅ LÓGICA: Só mostra botão de tarefas se NÃO for Dominado
                    const hasTasks = !!TASK_ANALYSIS_MAP[block.block_id];
                    const showTasks = hasTasks && currentScore && currentScore !== 'dominado';

                    return (
                      <div
                        key={block.block_id}
                        className={`block-card ${currentScore ? 'filled' : 'empty'} ${currentScore || ''}`}
                      >
                        <div className="block-header">
                          <div className="block-meta">
                            <span className="block-id">{block.block_id}</span>
                            <span className="block-level">{block.level || 'N/A'}</span>
                            {showTasks && (
                              <button className="btn-task-trigger" onClick={() => logic.setActiveTaskBlock(block.block_id)}>
                                📋 Tarefas
                              </button>
                            )}
                          </div>
                          <div className="block-status">
                            {currentScore ? (
                              <span className={`status-badge ${currentScore}`}>
                                {currentScore === 'dominado' ? '✓' :
                                  currentScore === 'emergente' ? '◐' : '○'}
                              </span>
                            ) : (
                              <span className="status-badge empty">?</span>
                            )}
                          </div>
                        </div>

                        <div className="block-content">
                          <p className="block-text">{text}</p>
                        </div>

                        <div className="block-actions">
                          <button
                            className={`score-btn ${currentScore === 'dominado' ? 'active' : ''}`}
                            onClick={() => setBlockScore(block.block_id, 'dominado')}
                            disabled={isReadOnly}
                            title="Marcar como Dominado"
                          >
                            <span className="score-icon">✓</span>
                            <span className="score-text">Dominado</span>
                          </button>

                          <button
                            className={`score-btn ${currentScore === 'emergente' ? 'active' : ''}`}
                            onClick={() => setBlockScore(block.block_id, 'emergente')}
                            disabled={isReadOnly}
                            title="Marcar como Emergente"
                          >
                            <span className="score-icon">◐</span>
                            <span className="score-text">Emergente</span>
                          </button>

                          <button
                            className={`score-btn ${currentScore === 'nao_observado' ? 'active' : ''}`}
                            onClick={() => setBlockScore(block.block_id, 'nao_observado')}
                            disabled={isReadOnly}
                            title="Marcar como Não Observado"
                          >
                            <span className="score-icon">○</span>
                            <span className="score-text">Não Obs.</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ GAVETA LATERAL INTEGRADA */}
      {logic.activeTaskBlock && (
        <div className="task-drawer-overlay" onClick={() => logic.setActiveTaskBlock(null)}>
          <div className="task-drawer" onClick={e => e.stopPropagation()}>
            <header className="drawer-header">
              <div>
                <h2>Análise de Tarefas</h2>
                <p>O que falta no marco: <strong>{logic.activeTaskBlock}</strong></p>
              </div>
              <button className="close-btn" onClick={() => logic.setActiveTaskBlock(null)}>×</button>
            </header>
            <div className="drawer-body">
              {TASK_ANALYSIS_MAP[logic.activeTaskBlock]?.map((task, idx) => (
                <div key={idx} className="task-row">
                  <span className="task-badge">{task.id}</span>
                  <p className="task-description">{task.text || task.texto}</p>
                </div>
              ))}
            </div>
            <footer className="drawer-footer">
              <button className="btn-close-drawer" onClick={() => logic.setActiveTaskBlock(null)}>Entendi</button>
            </footer>
          </div>
        </div>
      )}

      {/* RODAPÉ/DEBUG */}
      <footer className="milestones-footer">
        <div className="footer-content">
          <div className="session-info">
            <small>
              <strong>Sessão:</strong> {sessionInfo?.session_id || 'Nova'} |
              <strong> Criança:</strong> {logic.childName || 'Não definido'} |
              <strong> Blocos:</strong> {logic.progress.filled}/{logic.progress.totalBlocks} |
              <strong> Lacunas:</strong> {logic.generateLacunas().length}
            </small>
          </div>

          <div className="footer-actions">
            <button
              className="btn btn-outline"
              onClick={() => {
                console.log("🔍 Debug - Estado atual:", {
                  scores: logic.scores,
                  progress: logic.progress,
                  domainsCount: logic.domains.length,
                  childName: logic.childName
                });
                alert("📋 Dados de debug exibidos no console");
              }}
            >
              Debug
            </button>

            <button
              className="btn btn-outline"
              onClick={onBack}
            >
              Cancelar
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ✅ ESTILOS COMPLETOS COM GAVETA LATERAL
function getMilestonesStyles() {
  return `
    /* CONTAINER PRINCIPAL */
    .milestones-screen {
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 20px 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* HEADER */
    .milestones-header {
      background: white;
      color: #1e293b;
      padding: 28px 32px;
      border-radius: 16px;
      margin: 20px 0 30px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 20px;
      position: relative;
      overflow: hidden;
    }

    .milestones-header::before {
      content: '';
      display: none;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .header-content p {
      margin: 0 0 15px 0;
      color: #64748b;
      font-size: 16px;
      font-weight: 500;
    }

    .session-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-top: 15px;
    }

    .session-meta span {
      background: #f1f5f9;
      color: #475569;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }

    .session-meta strong {
      font-weight: 700;
      margin-left: 4px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 2px solid #e2e8f0;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e2e8f0;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.06);
    }

    .read-only-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      border: 2px solid #fde68a;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* PAINEL DE CONTROLE */
    .control-panel {
      background: white;
      padding: 28px 32px;
      border-radius: 16px;
      margin-bottom: 30px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 30px;
      align-items: end;
    }

    @media (max-width: 1100px) {
      .control-panel {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .control-group label {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .child-input {
      padding: 14px 18px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 500;
      transition: all 0.2s;
      min-width: 300px;
    }

    .child-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .child-input:disabled {
      background: #f8fafc;
      cursor: not-allowed;
    }

    .input-hint {
      font-size: 13px;
      margin-top: 4px;
    }

    .hint-warning {
      color: #dc2626;
      font-weight: 500;
    }

    .hint-success {
      color: #059669;
      font-weight: 500;
    }

    .audience-toggle {
      display: flex;
      gap: 10px;
    }

    .toggle-btn {
      background: #f1f5f9;
      color: #64748b;
      border: 2px solid #e2e8f0;
      padding: 12px 20px;
      min-width: 150px;
    }

    .toggle-btn.active {
      background: #4f46e5;
      color: white;
      border-color: #4f46e5;
    }

    .toggle-btn:hover:not(.active):not(:disabled) {
      background: #e2e8f0;
    }

    .toggle-icon {
      font-size: 18px;
      margin-right: 8px;
    }

    .finalize-control {
      align-items: stretch;
    }

    .btn-finalize {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      font-size: 16px;
      font-weight: 700;
      padding: 16px 32px;
      border: none;
      min-width: 280px;
      position: relative;
      overflow: hidden;
    }

    .btn-finalize.enabled:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
    }

    .btn-finalize.disabled {
      background: #94a3b8;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .btn-finalize.logic.loading {
      opacity: 0.8;
      cursor: wait;
    }

    .finalize-icon {
      font-size: 18px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .completion-hint {
      margin-top: 10px;
      padding: 10px 15px;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 6px;
      color: #92400e;
      font-size: 14px;
      font-weight: 500;
    }

    /* RESUMO DE PROGRESSO */
    .progress-summary {
      background: white;
      padding: 28px 32px;
      border-radius: 16px;
      margin-bottom: 30px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .summary-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .progress-badge {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    .progress-visual {
      margin-bottom: 25px;
    }

    .progress-bar {
      height: 16px;
      background: #f1f5f9;
      border-radius: 10px;
      margin-bottom: 25px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
      border-radius: 10px;
      transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
    }

    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.4) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .progress-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-item {
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      transition: transform 0.2s;
    }

    .stat-item:hover {
      transform: translateY(-5px);
    }

    .stat-dominado { background: #d1fae5; border: 2px solid #a7f3d0; }
    .stat-emergente { background: #fef3c7; border: 2px solid #fde68a; }
    .stat-nao-observado { background: #fff1f2; border: 2px solid #fecdd3; }
    .stat-total { background: #e0f2fe; border: 2px solid #bae6fd; }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 8px;
      color: #1e293b;
    }

    .stat-label {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .lacunas-preview {
      margin-top: 25px;
      padding: 20px;
      background: #f0f9ff;
      border-radius: 12px;
      border-left: 5px solid #3b82f6;
    }

    .lacunas-preview h3 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 18px;
    }

    .lacunas-preview p {
      margin: 0;
      color: #475569;
      font-size: 15px;
    }

    /* DOMÍNIOS E BLOCOS */
    .domains-container {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .domain-section {
      background: white;
      padding: 30px;
      border-radius: 16px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
      transition: all 0.3s;
    }

    .domain-section:hover {
      border-color: #c7d2fe;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }

    .domain-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f1f5f9;
      flex-wrap: wrap;
      gap: 20px;
    }

    .domain-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .domain-id {
      background: #ede9fe;
      color: #6d28d9;
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 800;
      border: 2px solid #ddd6fe;
    }

    .domain-title h3 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: #1e293b;
    }

    .domain-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .domain-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 20px;
      background: #f8fafc;
      border-radius: 10px;
      min-width: 120px;
    }

    .domain-stat .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .domain-stat .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .blocks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }

    @media (max-width: 768px) {
      .blocks-grid {
        grid-template-columns: 1fr;
      }
    }

    .block-card {
      background: #f8fafc;
      padding: 24px;
      border-radius: 14px;
      border: 2px solid #e2e8f0;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .block-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    }

    .block-card.filled.dominado {
      border-color: #86efac;
      background: #f0fdf4;
    }

    .block-card.filled.emergente {
      border-color: #fde68a;
      background: #fffbeb;
    }

    .block-card.filled.nao_observado {
      border-color: #fda4af;
      background: #fff1f2;
    }

    .block-card.dominado {
      border-color: #10b981;
    }

    .block-card.emergente {
      border-color: #f59e0b;
    }

    .block-card.nao_observado {
      border-color: #fb7185;
    }

    .block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }

    .block-meta {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .block-id {
      background: #f1f5f9;
      color: #64748b;
      padding: 6px 12px;
      border-radius: 8px;
      font-family: 'SF Mono', 'Courier New', monospace;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      border: 1px solid #e2e8f0;
    }

    .block-level {
      background: #e0f2fe;
      color: #0369a1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    
    .btn-task-trigger {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 11px;
      cursor: pointer;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    
    .btn-task-trigger:hover {
      background: #dbeafe;
      transform: translateY(-1px);
    }

    .block-status {
      display: flex;
      align-items: center;
    }

    .status-badge {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
    }

    .status-badge.dominado {
      background: #d1fae5;
      color: #065f46;
      border: 2px solid #a7f3d0;
    }

    .status-badge.emergente {
      background: #fef3c7;
      color: #92400e;
      border: 2px solid #fde68a;
    }

    .status-badge.nao_observado {
      background: #fff1f2;
      color: #9f1239;
      border: 2px solid #fecdd3;
    }

    .status-badge.empty {
      background: #f1f5f9;
      color: #64748b;
      border: 2px dashed #cbd5e1;
    }

    .block-content {
      margin-bottom: 20px;
    }

    .block-text {
      margin: 0;
      color: #334155;
      line-height: 1.7;
      font-size: 15px;
      min-height: 60px;
    }

    .block-actions {
      display: flex;
      gap: 10px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
    }

    .score-btn {
      flex: 1;
      padding: 14px;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .score-btn:hover:not(:disabled) {
      background: #f8fafc;
      transform: translateY(-2px);
      border-color: #cbd5e1;
    }

    .score-btn.active {
      font-weight: 800;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .score-btn:nth-child(1).active {
      background: #d1fae5;
      border-color: #10b981;
      color: #065f46;
    }

    .score-btn:nth-child(2).active {
      background: #fef3c7;
      border-color: #f59e0b;
      color: #92400e;
    }

    .score-btn:nth-child(3).active {
      background: #fff1f2;
      border-color: #fb7185;
      color: #9f1239;
    }

    .score-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .score-icon {
      font-size: 20px;
      font-weight: 700;
    }

    .score-text {
      font-size: 13px;
    }

    /* ✅ GAVETA LATERAL */
    .task-drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      justify-content: flex-end;
    }

    .task-drawer {
      width: 480px;
      height: 100%;
      background: white;
      box-shadow: -10px 0 30px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-header {
      padding: 30px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .drawer-header h2 {
      margin: 0 0 8px 0;
      color: #1e293b;
      font-size: 22px;
    }
    
    .drawer-header p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
    
    .close-btn {
      background: #f1f5f9;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 24px;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .close-btn:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    .drawer-body {
      padding: 25px;
      overflow-y: auto;
      flex: 1;
    }
    
    .task-row {
      display: flex;
      gap: 15px;
      padding: 15px;
      border-bottom: 1px solid #f8fafc;
      align-items: flex-start;
    }
    
    .task-badge {
      background: #e0e7ff;
      color: #4338ca;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 11px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .task-description {
      margin: 0;
      color: #334155;
      font-size: 14px;
      line-height: 1.5;
      flex: 1;
    }

    .drawer-footer {
      padding: 20px 30px;
      border-top: 1px solid #f1f5f9;
    }
    
    .btn-close-drawer {
      width: 100%;
      background: #4f46e5;
      color: white;
      padding: 14px;
      border-radius: 10px;
      border: none;
      font-weight: bold;
      cursor: pointer;
      font-size: 15px;
      transition: all 0.2s;
    }
    
    .btn-close-drawer:hover {
      background: #4338ca;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }

    /* ESTADO SEM DADOS */
    .no-data-state {
      text-align: center;
      padding: 80px 40px;
      background: white;
      border-radius: 20px;
      border: 3px dashed #e2e8f0;
      margin: 40px 0;
    }

    .no-data-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-data-state h2 {
      margin: 0 0 15px 0;
      color: #64748b;
      font-size: 28px;
    }

    .no-data-state p {
      margin: 0 0 30px 0;
      color: #94a3b8;
      font-size: 16px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 14px 28px;
      font-size: 16px;
      font-weight: 600;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
    }

    /* RODAPÉ */
    .milestones-footer {
      margin-top: 40px;
      padding-top: 25px;
      border-top: 2px solid #e2e8f0;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .session-info small {
      color: #64748b;
      font-size: 13px;
    }

    .session-info strong {
      color: #475569;
      margin: 0 4px;
    }

    .footer-actions {
      display: flex;
      gap: 12px;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid #e2e8f0;
      color: #64748b;
    }

    .btn-outline:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    /* DEBUG INFO */
    .debug-info {
      margin-top: 15px;
      padding: 12px 16px;
      background: #f1f5f9;
      border-radius: 8px;
      font-family: 'SF Mono', 'Courier New', monospace;
      font-size: 12px;
      color: #475569;
      text-align: center;
    }

    /* FILTRO DE NÍVEL */
    .level-filter-bar {
      background: white;
      padding: 20px 32px;
      border-radius: 16px;
      margin-bottom: 30px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-icon {
      font-size: 18px;
    }

    .filter-options {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: #f1f5f9;
      color: #64748b;
      border: 2px solid #e2e8f0;
      padding: 10px 24px;
      min-width: 100px;
    }

    .filter-btn:hover {
      background: #e2e8f0;
      border-color: #cbd5e1;
    }

    .filter-btn.active {
      background: #4f46e5;
      color: white;
      border-color: #4f46e5;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
    }

    .phase-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 20px;
      background: #f8fafc;
      padding: 8px 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .phase-counter {
      font-size: 14px;
      color: #475569;
    }

    .phase-counter strong {
      color: #4f46e5;
      font-size: 16px;
    }

    .btn-close-phase {
      background: #fff;
      border: 2px solid #ef4444;
      color: #ef4444;
      padding: 6px 14px;
      font-size: 13px;
      border-radius: 8px;
      font-weight: 700;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-close-phase:hover {
      background: #ef4444;
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
    }

    .phase-badge-closed {
      background: #d1fae5;
      color: #065f46;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid #a7f3d0;
    }

    /* RESPONSIVIDADE */
    @media (max-width: 768px) {
      .milestones-screen {
        padding: 0 15px 30px;
      }

      .milestones-header {
        padding: 20px;
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .header-content h1 {
        font-size: 26px;
      }

      .session-meta {
        justify-content: center;
      }

      .header-actions {
        justify-content: center;
        flex-wrap: wrap;
      }

      .control-panel {
        padding: 20px;
      }

      .child-input {
        min-width: 100%;
      }

      .toggle-btn {
        min-width: 120px;
      }

      .btn-finalize {
        min-width: 100%;
      }

      .progress-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .domain-header {
        flex-direction: column;
        align-items: stretch;
      }

      .domain-title {
        justify-content: center;
      }

      .domain-stats {
        justify-content: center;
      }
      
      .task-drawer {
        width: 100%;
      }
      
      .level-filter-bar {
        padding: 20px;
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      
      .phase-actions {
        margin-left: 0;
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        text-align: center;
        gap: 10px;
      }

      .footer-content {
        flex-direction: column;
        text-align: center;
      }
    }

    /* ANIMAÇÕES */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .domain-section {
      animation: fadeIn 0.5s ease-out;
    }

    .block-card {
      animation: fadeIn 0.3s ease-out;
    }
  `;
}