import React, { useState, useMemo, useEffect } from 'react';

export default function MilestonesScreen({
  data,
  onFinalize,
  onBack,
  isReadOnly,
  sessionInfo
}) {
  // Estados
  const [childName, setChildName] = useState('');
  const [scores, setScores] = useState({});
  const [audience, setAudience] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState('Todos');

  // ✅ CARREGAMENTO AUTOMÁTICO da sessão
  useEffect(() => {
    console.log("🔄 MilestonesScreen - Carregando sessão:", {
      sessionId: sessionInfo?.session_id,
      childName: sessionInfo?.child_name,
      scoresCount: Object.keys(sessionInfo?.scores_snapshot || {}).length,
      isReadOnly
    });

    // Reset para nova sessão
    if (sessionInfo?.session_id) {
      setChildName(sessionInfo?.child_name || '');
      setScores(sessionInfo?.scores_snapshot || {});
    }

    return () => {
      console.log("🧹 MilestonesScreen - Cleanup");
    };
  }, [sessionInfo, isReadOnly]);

  // ✅ DADOS REAIS do VB-MAPP
  const domains = data?.domains || [];
  const totalBlocks = domains.reduce((total, domain) =>
    total + (domain.blocks?.length || 0), 0
  );

  // ✅ CÁLCULO DE PROGRESSO (otimizado)
  const progress = useMemo(() => {
    const values = Object.values(scores);
    const filled = values.length;
    const dominado = values.filter(v => v === 'dominado').length;
    const emergente = values.filter(v => v === 'emergente').length;
    const naoObservado = values.filter(v => v === 'nao_observado').length;

    const percentComplete = totalBlocks > 0
      ? ((filled / totalBlocks) * 100).toFixed(1)
      : '0.0';

    return {
      totalBlocks,
      filled,
      dominado,
      emergente,
      naoObservado,
      percentComplete,
      percentDominado: filled > 0 ? ((dominado / filled) * 100).toFixed(1) : '0.0',
      percentEmergente: filled > 0 ? ((emergente / filled) * 100).toFixed(1) : '0.0',
      percentNaoObservado: filled > 0 ? ((naoObservado / filled) * 100).toFixed(1) : '0.0'
    };
  }, [scores, totalBlocks]);

  // ✅ FILTRO DE NÍVEL (Visual apenas)
  const filteredDomains = useMemo(() => {
    if (levelFilter === 'Todos') return domains;

    const targetLevel = levelFilter.split(' ')[1]; // "1", "2" ou "3"

    return domains
      .map(domain => ({
        ...domain,
        blocks: domain.blocks?.filter(block =>
          block.level && block.level.startsWith(targetLevel)
        ) || []
      }))
      .filter(domain => domain.blocks.length > 0);
  }, [domains, levelFilter]);

  // ✅ GERAÇÃO DE LACUNAS (para SubtestesScreen)
  const generateLacunas = () => {
    const lacunas = [];

    domains.forEach(domain => {
      domain.blocks?.forEach(block => {
        const status = scores[block.block_id];
        if (status === 'emergente' || status === 'nao_observado') {
          lacunas.push({
            block_id: block.block_id,
            domain_id: domain.domain_id,
            domain_name: domain.domain_name,
            level: block.level || 'N/A',
            status: status,
            texto: audience === 'professional'
              ? block.texto_profissional
              : block.texto_responsavel,
            order: block.order || 0,
            // Metadados para filtro na próxima tela
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Ordenar por domínio e nível
    lacunas.sort((a, b) => {
      if (a.domain_id !== b.domain_id) return a.domain_id.localeCompare(b.domain_id);
      if (a.order !== b.order) return a.order - b.order;
      return a.block_id.localeCompare(b.block_id);
    });

    console.log("🔍 Lacunas geradas:", lacunas.length, "itens");
    return lacunas;
  };

  // ✅ FUNÇÃO PARA ALTERAR SCORE
  const setBlockScore = (blockId, value) => {
    if (isReadOnly) return;

    setScores(prev => {
      const newScores = { ...prev, [blockId]: value };
      console.log(`🎯 Score atualizado: ${blockId} = ${value}`);
      return newScores;
    });
  };

  // ✅ VALIDAÇÃO PARA FINALIZAR
  const canFinalize = useMemo(() => {
    const validName = childName.trim().length >= 3;
    const allBlocksFilled = progress.filled === progress.totalBlocks;
    const hasData = progress.totalBlocks > 0;

    return validName && allBlocksFilled && hasData;
  }, [childName, progress]);

  // ✅ FUNÇÃO PRINCIPAL: FINALIZAR MILESTONES
  const handleFinalize = async () => {
    if (!canFinalize) {
      if (childName.trim().length < 3) {
        alert('⚠️ Por favor, digite o nome da criança (mínimo 3 caracteres).');
        return;
      }
      if (progress.filled < progress.totalBlocks) {
        alert(`⏳ Você precisa avaliar TODOS os ${progress.totalBlocks} blocos.\nFaltam ${progress.totalBlocks - progress.filled} blocos.`);
        return;
      }
      return;
    }

    setLoading(true);
    console.log("🚀 Iniciando finalização da MilestonesScreen...");

    try {
      // Gerar lacunas para a próxima tela (Subtestes)
      const lacunas = generateLacunas();

      // Calcular estatísticas por domínio
      const domainStats = {};
      domains.forEach(domain => {
        const domainScores = domain.blocks
          ?.map(block => scores[block.block_id])
          ?.filter(Boolean) || [];

        if (domainScores.length > 0) {
          domainStats[domain.domain_id] = {
            domain_name: domain.domain_name,
            total_blocks: domain.blocks?.length || 0,
            filled: domainScores.length,
            dominado: domainScores.filter(s => s === 'dominado').length,
            emergente: domainScores.filter(s => s === 'emergente').length,
            nao_observado: domainScores.filter(s => s === 'nao_observado').length,
            percent_dominado: ((domainScores.filter(s => s === 'dominado').length / domainScores.length) * 100).toFixed(1)
          };
        }
      });

      // ✅ PAYLOAD COMPLETO para SessionController
      const finalPayload = {
        // Dados da criança
        child_name: childName.trim(),

        // Snapshots dos dados
        scores_snapshot: { ...scores },
        lacunas: lacunas,

        // Estatísticas
        percentuais: {
          geral: {
            dominado: progress.percentDominado,
            emergente: progress.percentEmergente,
            nao_observado: progress.percentNaoObservado,
            total_preenchido: progress.percentComplete
          },
          por_dominio: domainStats
        },

        // Metadados
        last_updated: new Date().toISOString(),
        assessment_duration: Math.round((Date.now() - new Date(sessionInfo?.date || Date.now()).getTime()) / 60000), // minutos

        // Progresso
        progress_summary: {
          total_blocks: progress.totalBlocks,
          filled_blocks: progress.filled,
          lacunas_count: lacunas.length,
          completion_percentage: progress.percentComplete
        }
      };

      console.log("📤 MilestonesScreen - Payload enviado:", {
        lacunasCount: lacunas.length,
        scoresCount: Object.keys(scores).length,
        childName: childName.trim(),
        hasDomainStats: Object.keys(domainStats).length > 0
      });

      // Enviar para SessionController
      onFinalize(finalPayload);

      // Feedback visual
      setTimeout(() => {
        alert(`✅ Milestones finalizados com sucesso!\n\n• ${progress.filled} blocos avaliados\n• ${lacunas.length} lacunas identificadas\n\nAvançando para Subtestes...`);
      }, 100);

    } catch (error) {
      console.error("❌ Erro ao finalizar milestones:", error);
      alert("❌ Ocorreu um erro ao finalizar a avaliação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ RENDERIZAÇÃO CONDICIONAL - SEM DADOS
  if (domains.length === 0) {
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
              Domínios: {domains.length} |
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
              Progresso: <strong>{progress.percentComplete}%</strong>
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
            value={childName}
            onChange={e => setChildName(e.target.value)}
            className="child-input"
            disabled={isReadOnly}
            maxLength={100}
          />
          <div className="input-hint">
            {childName.trim().length < 3 ? (
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
              className={`btn toggle-btn ${audience === 'professional' ? 'active' : ''}`}
              onClick={() => setAudience('professional')}
              disabled={isReadOnly}
            >
              <span className="toggle-icon">👨‍⚕️</span>
              <span className="toggle-text">Profissional</span>
            </button>
            <button
              className={`btn toggle-btn ${audience === 'caregiver' ? 'active' : ''}`}
              onClick={() => setAudience('caregiver')}
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
              className={`btn btn-finalize ${canFinalize ? 'enabled' : 'disabled'} ${loading ? 'loading' : ''}`}
              onClick={handleFinalize}
              disabled={!canFinalize || loading}
              title={canFinalize ?
                "Clique para finalizar e ir para Subtestes" :
                "Preencha todos os blocos e o nome para finalizar"}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processando...
                </>
              ) : canFinalize ? (
                <>
                  <span className="finalize-icon">🚀</span>
                  Finalizar e Ir para Subtestes
                </>
              ) : (
                <>
                  <span className="finalize-icon">⏳</span>
                  {progress.filled}/{progress.totalBlocks} blocos
                </>
              )}
            </button>

            {!canFinalize && progress.filled > 0 && (
              <div className="completion-hint">
                ⚠️ Faltam <strong>{progress.totalBlocks - progress.filled}</strong> blocos
              </div>
            )}
          </div>
        )}
      </section>

      {/* RESUMO DE PROGRESSO */}
      <section className="progress-summary">
        <div className="summary-header">
          <h2>Progresso da Avaliação</h2>
          <div className="progress-badge">
            {progress.percentComplete}% completo
          </div>
        </div>

        <div className="progress-visual">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.percentComplete}%` }}
              title={`${progress.filled} de ${progress.totalBlocks} blocos`}
            ></div>
          </div>
          <div className="progress-stats">
            <div className="stat-item stat-dominado">
              <div className="stat-value">{progress.dominado}</div>
              <div className="stat-label">Dominado</div>
              <div className="stat-percent">{progress.percentDominado}%</div>
            </div>
            <div className="stat-item stat-emergente">
              <div className="stat-value">{progress.emergente}</div>
              <div className="stat-label">Emergente</div>
              <div className="stat-percent">{progress.percentEmergente}%</div>
            </div>
            <div className="stat-item stat-nao-observado">
              <div className="stat-value">{progress.naoObservado}</div>
              <div className="stat-label">Não Obs.</div>
              <div className="stat-percent">{progress.percentNaoObservado}%</div>
            </div>
            <div className="stat-item stat-total">
              <div className="stat-value">{progress.filled}/{progress.totalBlocks}</div>
              <div className="stat-label">Total</div>
              <div className="stat-percent">{progress.percentComplete}%</div>
            </div>
          </div>
        </div>

        {progress.filled > 0 && (
          <div className="lacunas-preview">
            <h3>Prévia das Lacunas</h3>
            <p>
              <strong>{generateLacunas().length} lacunas</strong> identificadas
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
              className={`btn filter-btn ${levelFilter === level ? 'active' : ''}`}
              onClick={() => setLevelFilter(level)}
            >
              {level}
            </button>
          ))}
        </div>
        {levelFilter !== 'Todos' && (
          <div className="filter-info">
            Mostrando apenas itens do <strong>{levelFilter}</strong>
          </div>
        )}
      </section>

      {/* LISTA DE DOMÍNIOS E BLOCOS */}
      <div className="domains-container">
        {filteredDomains.map(domain => {
          const domainBlocks = domain.blocks || [];
          const domainScores = domainBlocks
            .map(block => scores[block.block_id])
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
                    const currentScore = scores[block.block_id];
                    const text = audience === 'professional'
                      ? block.texto_profissional
                      : block.texto_responsavel;

                    return (
                      <div
                        key={block.block_id}
                        className={`block-card ${currentScore ? 'filled' : 'empty'} ${currentScore || ''}`}
                      >
                        <div className="block-header">
                          <div className="block-meta">
                            <span className="block-id">{block.block_id}</span>
                            <span className="block-level">{block.level || 'N/A'}</span>
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

      {/* RODAPÉ/DEBUG */}
      <footer className="milestones-footer">
        <div className="footer-content">
          <div className="session-info">
            <small>
              <strong>Sessão:</strong> {sessionInfo?.session_id || 'Nova'} |
              <strong> Criança:</strong> {childName || 'Não definido'} |
              <strong> Blocos:</strong> {progress.filled}/{progress.totalBlocks} |
              <strong> Lacunas:</strong> {generateLacunas().length}
            </small>
          </div>

          <div className="footer-actions">
            <button
              className="btn btn-outline"
              onClick={() => {
                console.log("🔍 Debug - Estado atual:", {
                  scores,
                  progress,
                  domainsCount: domains.length,
                  childName
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

// ✅ ESTILOS COMPLETOS OTIMIZADOS
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
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 28px 32px;
      border-radius: 16px;
      margin: 20px 0 30px;
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.2);
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
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .header-content p {
      margin: 0 0 15px 0;
      opacity: 0.95;
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
      background: rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      backdrop-filter: blur(10px);
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
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .read-only-badge {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
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

    .btn-finalize.loading {
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
    .stat-nao-observado { background: #f3f4f6; border: 2px solid #e5e7eb; }
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

    .stat-percent {
      font-size: 18px;
      font-weight: 700;
      color: #334155;
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
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
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
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      border-color: #c7d2fe;
    }

    .block-card.filled {
      border-color: #a7f3d0;
      background: #f0fdf4;
    }

    .block-card.dominado {
      border-color: #10b981;
    }

    .block-card.emergente {
      border-color: #f59e0b;
    }

    .block-card.nao_observado {
      border-color: #94a3b8;
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
      background: #1e293b;
      color: white;
      padding: 6px 12px;
      border-radius: 8px;
      font-family: 'SF Mono', 'Courier New', monospace;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
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
      background: #f3f4f6;
      color: #374151;
      border: 2px solid #e5e7eb;
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
      background: #f3f4f6;
      border-color: #94a3b8;
      color: #374151;
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

    .filter-info {
      margin-left: auto;
      font-size: 14px;
      color: #64748b;
      background: #f8fafc;
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    @media (max-width: 768px) {
      .level-filter-bar {
        padding: 20px;
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      
      .filter-info {
        margin-left: 0;
        width: 100%;
        text-align: center;
      }
    }
  `;
}