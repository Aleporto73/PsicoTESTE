import React, { useState, useMemo } from 'react';
import { TASK_ANALYSIS_MAP_BY_LEVEL } from '../../data/taskAnalysis';

/* 
  COMPONENTE: TELA 2 — Validação Funcional (Subtestes / Task Analysis)
  
  🎯 REGRA PRINCIPAL: 
  - Mostrar APENAS as tarefas dos marcos marcados como EMERGENTE ou NÃO OBSERVADO
  - Se marco M05 está emergente → mostrar tarefas 5-a, 5-b, 5-c, 5-d, 5-e
  - Se marco M02 está emergente → mostrar tarefas 2-a, 2-b, 2-c...
  
  VERSÃO 2.0 - Filtro por marco específico
*/
export default function SubtestesScreen({ data, sessionInfo, onFinalize, onBack, isReadOnly }) {
  // ✅ ESTADO DE VALIDAÇÕES CLÍNICAS
  const [validacoes, setValidacoes] = useState(() => {
    if (sessionInfo?.lacunas_validadas) {
      const initial = {};
      sessionInfo.lacunas_validadas.forEach(l => {
        initial[l.sub_item_id || l.block_id] = {
          status_validacao: l.status_validacao,
          observacao: l.observacao
        };
      });
      return initial;
    }
    return {};
  });

  // ✅ DETERMINAR NÍVEL ATIVO
  const activeLevelTag = useMemo(() => {
    const levelStr = String(sessionInfo?.active_level || sessionInfo?.level || '1');
    return `${levelStr}-M`;
  }, [sessionInfo]);

  // ✅ FILTRAGEM INTELIGENTE: APENAS TAREFAS DOS MARCOS EMERGENTES/NÃO OBSERVADOS
  const allTaskItems = useMemo(() => {
    const allDomains = data?.domains || [];
    const expandedResults = [];
    const scoresSnapshot = sessionInfo?.scores_snapshot || {};

    const levelNum = parseInt(sessionInfo?.active_level || sessionInfo?.level || '1');
    const levelMap = TASK_ANALYSIS_MAP_BY_LEVEL[levelNum] || {};

    console.log('📊 SubtestesScreen v2 - scores_snapshot:', scoresSnapshot);
    console.log('📊 SubtestesScreen v2 - levelNum:', levelNum);

    allDomains.forEach(domain => {
      const domainKey = domain.domain_name.toUpperCase();
      const allTasksForDomain = levelMap[domainKey] || [];

      // Percorrer cada bloco do domínio
      (domain.blocks || []).forEach(block => {
        const blockId = block.block_id;
        const status = scoresSnapshot[blockId];

        // Verificar se pertence ao nível atual
        const blockLevel = block.level;
        const blockLevelNum = parseInt(blockLevel?.replace('-M', '') || '0');

        if (blockLevelNum !== levelNum) {
          return; // Pular blocos de outros níveis
        }

        // 🎯 FILTRO: Apenas EMERGENTE ou NÃO OBSERVADO
        const isEmergente = status === 'emergente';
        const isNaoObservado = !status || status === 'não_avaliado' || status === 'não_observado';

        // Ignorar itens DOMINADOS
        if (status === 'dominado') {
          return;
        }

        if (isEmergente || isNaoObservado) {
          // Extrair o número do milestone do block_id (ex: DOM01-L1-M05 → 5)
          const milestoneMatch = blockId.match(/M(\d+)$/);
          const milestoneNum = milestoneMatch ? parseInt(milestoneMatch[1]) : null;

          console.log(`🔍 Marco ${blockId} - Status: ${status || 'sem status'} - Milestone: ${milestoneNum}`);

          if (milestoneNum && allTasksForDomain.length > 0) {
            // 🎯 FILTRAR apenas as tarefas que começam com o número do milestone
            // Ex: milestone 5 → tarefas "5-a", "5-b", "5-c", etc.
            const tasksForThisMilestone = allTasksForDomain.filter(task => {
              const taskMilestone = parseInt(task.id.split('-')[0]);
              return taskMilestone === milestoneNum;
            });

            console.log(`   → Encontradas ${tasksForThisMilestone.length} tarefas para M${milestoneNum}`);

            if (tasksForThisMilestone.length > 0) {
              tasksForThisMilestone.forEach(task => {
                expandedResults.push({
                  block_id: blockId,
                  domain_name: domain.domain_name,
                  level_label: block.level,
                  milestone_text: block.texto_profissional || block.text || block.milestone,
                  sub_item_id: `${blockId}-${task.id}`,
                  sub_item_label: task.id,
                  texto: task.texto || task.text,
                  original_status: status || 'não_avaliado'
                });
              });
            } else {
              // Milestone sem tarefas específicas - criar item genérico
              expandedResults.push({
                block_id: blockId,
                domain_name: domain.domain_name,
                level_label: block.level,
                milestone_text: block.texto_profissional || block.text || block.milestone,
                sub_item_id: blockId,
                sub_item_label: 'Validação',
                texto: block.texto_profissional || block.text || "Validar este marco do repertório.",
                original_status: status || 'não_avaliado'
              });
            }
          } else if (allTasksForDomain.length === 0) {
            // Domínio sem Task Analysis - criar item genérico
            expandedResults.push({
              block_id: blockId,
              domain_name: domain.domain_name,
              level_label: block.level,
              milestone_text: block.texto_profissional || block.text || block.milestone,
              sub_item_id: blockId,
              sub_item_label: 'Validação',
              texto: block.texto_profissional || block.text || "Este domínio não possui Task Analysis neste nível.",
              original_status: status || 'não_avaliado'
            });
          }
        }
      });
    });

    console.log(`✅ SubtestesScreen v2 - Total de itens filtrados: ${expandedResults.length}`);
    return expandedResults;
  }, [data, sessionInfo]);

  // ✅ CÁLCULO DE PROGRESSO
  const progress = useMemo(() => {
    const total = allTaskItems.length;
    const validados = allTaskItems.filter(item => {
      const v = validacoes[item.sub_item_id];
      return v && v.status_validacao && v.observacao && v.observacao.trim().length >= 10;
    }).length;

    return {
      total,
      validados,
      percent: total > 0 ? ((validados / total) * 100).toFixed(0) : 0
    };
  }, [validacoes, allTaskItems]);

  const canFinalize = progress.validados === progress.total && progress.total > 0;

  const setValidacao = (id, field, value) => {
    if (isReadOnly) return;
    setValidacoes(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleFinalize = () => {
    if (progress.total === 0) {
      const payload = {
        session_id: sessionInfo.session_id,
        active_level: activeLevelTag.replace('-M', ''),
        validação_funcional: [],
        finalizado_em: new Date().toISOString(),
        schema_version: 'task_analysis_v2',
        nota: 'Nenhum item emergente ou não observado para validar'
      };
      onFinalize(payload);
      return;
    }

    if (!canFinalize) {
      alert(`Validação incompleta! Faltam ${progress.total - progress.validados} itens com observação mínima de 10 caracteres.`);
      return;
    }

    const payload = {
      session_id: sessionInfo.session_id,
      active_level: activeLevelTag.replace('-M', ''),
      validação_funcional: allTaskItems.map(item => ({
        ...item,
        validacao: validacoes[item.sub_item_id]
      })),
      finalizado_em: new Date().toISOString(),
      schema_version: 'task_analysis_v2'
    };

    console.log('🚀 Finalizando SubtestesScreen com payload:', payload);
    onFinalize(payload);
  };

  return (
    <div className="subtestes-screen">
      <style>{getSubtestesStyles()}</style>

      {/* HEADER */}
      <header className="subtestes-header">
        <div className="header-content">
          <h1>TELA 2 — Subtestes / Task Analysis</h1>
          <p>Confirmação detalhada de repertório</p>
          <div className="session-info-badge">
            <strong>{sessionInfo.child_name}</strong> • Nível {activeLevelTag.replace('-M', '')}
          </div>
        </div>
        <button className="btn-back-simple" onClick={onBack}>← Voltar</button>
      </header>

      <div className="container">
        {/* CONTADOR */}
        <section className="progress-bar-area">
          <div className="progress-info">
            <span className="denominador">{progress.validados} / {progress.total} ITENS VALIDADOS</span>
            <span className="percentual">{progress.percent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
          {progress.total === 0 && (
            <p className="empty-notice">
              ✓ Nenhum item Emergente ou Não Observado encontrado. Todos os marcos estão dominados!
            </p>
          )}
        </section>

        {/* LISTA DE CARDS */}
        <div className="blocks-list">
          {allTaskItems.length === 0 ? (
            <div className="empty-state">
              <h3>🎉 Excelente!</h3>
              <p>Não há itens pendentes para validação neste nível.</p>
              <p>Todos os marcos foram marcados como <strong>Dominado</strong> na Tela 1.</p>
            </div>
          ) : (
            allTaskItems.map(item => {
              const val = validacoes[item.sub_item_id] || {};
              const isFilled = val.status_validacao && (val.observacao || '').trim().length >= 10;
              const refStatus = item.original_status || 'não_avaliado';

              return (
                <article key={item.sub_item_id} className={`clinical-card ${isFilled ? 'filled' : ''}`}>
                  <div className="card-header">
                    <span className="block-identity">
                      {item.domain_name.toUpperCase()} — {item.level_label} ({item.sub_item_label})
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="milestone-ref">
                      Ref. Milestone: <span className={`ref-badge ${refStatus.replace(' ', '_')}`}>
                        {refStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="clinical-text">{item.texto}</p>

                    <div className="validation-inputs">
                      <label className="input-label">Validação Funcional *</label>
                      <div className="radio-group-industrial">
                        {[
                          { v: 'confirmado', l: 'Confirmado', c: 'success' },
                          { v: 'parcial', l: 'Parcial', c: 'warning' },
                          { v: 'nao', l: 'Não Confir.', c: 'danger' }
                        ].map(opt => (
                          <button
                            key={opt.v}
                            className={`industrial-btn ${val.status_validacao === opt.v ? `active ${opt.c}` : ''}`}
                            onClick={() => setValidacao(item.sub_item_id, 'status_validacao', opt.v)}
                            disabled={isReadOnly}
                          >
                            {opt.l}
                          </button>
                        ))}
                      </div>

                      <label className="input-label">Evidência Clínica (Observação) *</label>
                      <textarea
                        className="industrial-textarea"
                        placeholder="Descreva a evidência clínica observada..."
                        value={val.observacao || ''}
                        onChange={e => setValidacao(item.sub_item_id, 'observacao', e.target.value)}
                        disabled={isReadOnly}
                        rows={2}
                      />
                      <div className="char-count">{(val.observacao || '').length} / 10</div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="action-footer">
        <button className="btn-outline-industrial" onClick={onBack}>← Milestones</button>
        {!isReadOnly && (
          <button
            className={`btn-finalize-industrial ${(canFinalize || progress.total === 0) ? 'pulse' : 'disabled'}`}
            onClick={handleFinalize}
            disabled={!(canFinalize || progress.total === 0)}
          >
            {progress.total === 0 ? '→ Próxima Tela' : '✓ Finalizar Validação'}
          </button>
        )}
      </footer>
    </div>
  );
}

function getSubtestesStyles() {
  return `
    .subtestes-screen {
      background: #f8fafc;
      min-height: 100vh;
      padding-bottom: 120px;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .subtestes-header {
      background: #1e293b;
      color: white;
      padding: 30px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 { font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
    .header-content p { opacity: 0.6; font-size: 14px; margin: 5px 0 0 0; }
    .session-info-badge { background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 6px; font-size: 14px; margin-top: 10px; display: inline-block; }
    
    .btn-back-simple { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; }

    .container { max-width: 1000px; margin: 0 auto; padding: 30px 20px; }

    .progress-bar-area { background: white; padding: 20px; border-radius: 12px; border: 2px solid #e2e8f0; margin-bottom: 40px; }
    .progress-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 700; font-size: 14px; color: #475569; }
    .progress-track { background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; }
    .progress-fill { background: #4f46e5; height: 100%; transition: width 0.4s ease; }
    
    .empty-notice {
      margin-top: 15px;
      padding: 10px;
      background: #dcfce7;
      border-radius: 8px;
      color: #166534;
      font-size: 14px;
      text-align: center;
    }

    .blocks-list { display: flex; flex-direction: column; gap: 25px; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      border: 2px dashed #e2e8f0;
    }
    .empty-state h3 { font-size: 28px; margin-bottom: 10px; }
    .empty-state p { color: #64748b; font-size: 15px; margin: 5px 0; }

    .clinical-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s;
    }

    .clinical-card.filled { border-color: #10b981; }

    .card-header { background: #f8fafc; padding: 12px 20px; border-bottom: 1px solid #e2e8f0; }
    .block-identity { font-size: 14px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; }

    .card-body { padding: 20px; }

    .milestone-ref { font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
    .ref-badge { padding: 2px 8px; border-radius: 4px; font-size: 13px; text-transform: uppercase; font-weight: 700; }
    .ref-badge.dominado { background: #dcfce7; color: #166534; }
    .ref-badge.emergente { background: #fef3c7; color: #92400e; }
    .ref-badge.não_avaliado, .ref-badge.não_observado { background: #f1f5f9; color: #64748b; }

    .clinical-text { font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 25px; }

    .validation-inputs { border-top: 1px dashed #e2e8f0; padding-top: 20px; }
    .input-label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 12px; text-transform: uppercase; }

    .radio-group-industrial { display: flex; gap: 10px; margin-bottom: 20px; }
    .industrial-btn {
      flex: 1;
      padding: 10px;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .industrial-btn:hover:not(:disabled) { border-color: #94a3b8; }
    .industrial-btn.active.success { background: #dcfce7; border-color: #10b981; color: #166534; }
    .industrial-btn.active.warning { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
    .industrial-btn.active.danger { background: #fee2e2; border-color: #ef4444; color: #991b1b; }

    .industrial-textarea {
      width: 100%;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      min-height: 70px;
      box-sizing: border-box;
    }

    .industrial-textarea:focus { outline: none; border-color: #4f46e5; }

    .char-count { text-align: right; font-size: 13px; color: #94a3b8; margin-top: 4px; }

    .action-footer {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: white; padding: 20px 5%;
      border-top: 2px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
      z-index: 1000;
    }

    .btn-outline-industrial { 
      background: transparent; 
      border: 2px solid #e2e8f0; 
      padding: 12px 30px; 
      border-radius: 10px; 
      font-weight: 700; 
      color: #475569; 
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-outline-industrial:hover { border-color: #94a3b8; }
    
    .btn-finalize-industrial { 
      background: #4f46e5; 
      color: white; 
      border: none; 
      padding: 12px 40px; 
      border-radius: 10px; 
      font-weight: 700; 
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-finalize-industrial:hover:not(:disabled) { background: #4338ca; }
    .btn-finalize-industrial.disabled { background: #cbd5e1; cursor: not-allowed; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.85; } 100% { opacity: 1; } }
    .pulse { animation: pulse 2s infinite; }

    @media (max-width: 600px) {
      .radio-group-industrial { flex-direction: column; }
      .subtestes-header { flex-direction: column; gap: 15px; text-align: center; }
      .btn-back-simple { align-self: center; }
    }
  `;
}