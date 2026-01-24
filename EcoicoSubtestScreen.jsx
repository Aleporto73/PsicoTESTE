import React, { useState, useEffect, useMemo } from 'react';
import {
    ECOICO_META,
    ECOICO_STRUCTURE,
    ECOICO_UI_DISCLAIMER,
    initEcoicoSession,
    recordEcoicoAttempt,
    finalizeEcoicoGroup,
    setQualitativeDecision,
    finalizeEcoicoSession
} from './subtests/ecoicoSubtest';

export default function EcoicoSubtestScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
    const [session, setSession] = useState(() => initEcoicoSession(sessionInfo || {}));
    const [currentGroupId, setCurrentGroupId] = useState(1);
    const [notes, setNotes] = useState('');

    // Sincronizar se o sessionInfo mudar externamente (ex: carregar rascunho)
    useEffect(() => {
        if (sessionInfo?.ecoico_data) {
            setSession(sessionInfo.ecoico_data);
        }
    }, [sessionInfo]);

    const currentGroup = session.results.find(r => r.group_id === currentGroupId);
    const currentGroupDef = ECOICO_STRUCTURE.groups.find(g => g.group_id === currentGroupId);

    const handleAttempt = (isCorrect) => {
        if (isReadOnly || currentGroup.completed) return;
        setSession(prev => recordEcoicoAttempt(prev, currentGroupId, isCorrect));
    };

    const handleFinalizeGroup = () => {
        if (isReadOnly || currentGroup.completed) return;

        if (!currentGroupDef.qualitative_only && currentGroup.attempts < currentGroupDef.min_trials) {
            if (!confirm(`O mínimo sugerido para este grupo é ${currentGroupDef.min_trials} tentativas. Deseja finalizar assim mesmo?`)) {
                return;
            }
        }

        setSession(prev => finalizeEcoicoGroup(prev, currentGroupId, notes));
        setNotes('');
    };

    const handleQualitativeDecision = (passed) => {
        if (isReadOnly || currentGroup.completed) return;
        setSession(prev => setQualitativeDecision(prev, currentGroupId, passed, notes));
        setNotes('');
    };

    const handleFinalizeSession = () => {
        if (isReadOnly) return;

        const incomplete = session.results.filter(r => !r.completed);
        if (incomplete.length > 0) {
            if (!confirm(`Existem ${incomplete.length} grupos não finalizados. Deseja encerrar o subteste agora?`)) {
                return;
            }
        }

        const finalState = finalizeEcoicoSession(session);
        setSession(finalState);
        if (onFinalize) {
            onFinalize(finalState);
        }
    };

    const progressPercent = useMemo(() => {
        if (currentGroupDef.qualitative_only) return 0;
        return Math.min(100, (currentGroup.attempts / currentGroupDef.min_trials) * 100);
    }, [currentGroup, currentGroupDef]);

    if (session.finished_at) {
        return (
            <div className="ecoico-screen">
                <style>{getEcoicoStyles()}</style>
                <header className="ecoico-header">
                    <div className="header-content">
                        <h1>Relatório de Desempenho Ecoico</h1>
                        <p>Avaliação Finalizada em {new Date(session.finished_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={onBack}>Voltar</button>
                </header>

                <main className="ecoico-main">
                    <section className="summary-card">
                        <div className="summary-main">
                            <h2>{session.summary.interpretation}</h2>
                            <span className={`clinical-badge ${session.summary.clinical_flag}`}>
                                {session.summary.clinical_flag === 'ecoico_funcional' ? '✅ FUNCIONAL' : '⚠️ LIMITADO'}
                            </span>
                        </div>
                        <div className="recommendation">
                            <h3>Recomendação Clínica:</h3>
                            <p>{session.summary.recommendation}</p>
                        </div>
                    </section>

                    <section className="results-detailed">
                        <h3>Detalhes por Grupo:</h3>
                        <div className="results-grid">
                            {session.results.map(r => {
                                const def = ECOICO_STRUCTURE.groups.find(g => g.group_id === r.group_id);
                                return (
                                    <div key={r.group_id} className={`result-item ${r.passed ? 'passed' : 'failed'}`}>
                                        <div className="result-header">
                                            <strong>{def.label}</strong>
                                            <span>{r.passed ? 'Atingido' : 'Não Atingido'}</span>
                                        </div>
                                        {!def.qualitative_only && (
                                            <div className="result-stats">
                                                <span>{r.correct}/{r.attempts} acertos</span>
                                                <span>{r.attempts > 0 ? ((r.correct / r.attempts) * 100).toFixed(0) : 0}%</span>
                                            </div>
                                        )}
                                        {r.notes && <p className="result-notes">"{r.notes}"</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="ecoico-screen">
            <style>{getEcoicoStyles()}</style>

            <header className="ecoico-header">
                <div className="header-content">
                    <div className="breadcrumb">VB-MAPP Subtests > {ECOICO_META.name}</div>
                    <h1>{session.child_name || 'Criança'}</h1>
                    <p>{ECOICO_META.description}</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={onBack}>Sair</button>
                    <button className="btn btn-success" onClick={handleFinalizeSession}>Finalizar Subteste</button>
                </div>
            </header>

            <div className="disclaimer-alert">
                <span className="icon">ℹ️</span>
                <p>{ECOICO_UI_DISCLAIMER}</p>
            </div>

            <main className="ecoico-grid">
                <nav className="group-nav">
                    {ECOICO_STRUCTURE.groups.map(g => {
                        const result = session.results.find(r => r.group_id === g.group_id);
                        const isExpected = session.ui_priority?.expected_groups.includes(g.group_id);
                        const isEmerging = session.ui_priority?.emerging_groups.includes(g.group_id);

                        // Determinar se o grupo é clicável (já completado ou é o selecionado agora)
                        const isClickable = result.completed || g.group_id === currentGroupId;
                        const isFuture = !result.completed && g.group_id > currentGroupId;

                        return (
                            <button
                                key={g.group_id}
                                className={`nav-item ${currentGroupId === g.group_id ? 'active' : ''} ${result.completed ? 'completed' : ''} ${!isClickable ? 'disabled' : ''}`}
                                onClick={() => isClickable && setCurrentGroupId(g.group_id)}
                                disabled={!isClickable}
                                title={!isClickable ? 'Finalize o grupo atual para avançar.' : ''}
                            >
                                <div className="nav-info">
                                    <span className="group-label">Grupo {g.group_id}</span>
                                    <span className="group-name">{g.label}</span>
                                </div>
                                <div className="nav-status">
                                    {isExpected && <span className="priority-badge expected">Sugerido</span>}
                                    {isEmerging && <span className="priority-badge emerging">Emergente</span>}
                                    {result.completed && (result.passed ? '✅' : '❌')}
                                    {isFuture && <span className="lock-icon">🔒</span>}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                <section className="group-content">
                    <div className="group-header">
                        <h2>{currentGroupDef.label}</h2>
                        <p className="pattern">Padrão esperado: <strong>{currentGroupDef.pattern}</strong></p>
                    </div>

                    {currentGroup.completed ? (
                        <div className="completed-state">
                            <div className={`status-box ${currentGroup.passed ? 'passed' : 'failed'}`}>
                                <h3>Grupo Finalizado</h3>
                                <p>{currentGroup.passed ? 'Atingiu o critério de proficiência.' : 'Não atingiu o critério de proficiência.'}</p>
                                <div className="final-score">
                                    {currentGroupDef.qualitative_only ? (
                                        currentGroup.passed ? 'Aprovado na análise prosódica' : 'Necessita suporte na prosódia'
                                    ) : (
                                        `${currentGroup.correct} acertos em ${currentGroup.attempts} tentativas (${((currentGroup.correct / currentGroup.attempts) * 100).toFixed(0)}%)`
                                    )}
                                </div>
                            </div>

                            {/* Ajuste 2: Só mostrar botão de avançar se passou */}
                            {currentGroup.passed && currentGroupId < 5 && (
                                <button className="btn btn-outline" onClick={() => setCurrentGroupId(prev => Math.min(5, prev + 1))}>
                                    Próximo Grupo ⮕
                                </button>
                            )}

                            {!currentGroup.passed && (
                                <div className="stop-alert">
                                    ⚠️ O critério de proficiência não foi atingido.
                                    A avaliação deste subteste geralmente é interrompida aqui conforme protocolo VB-MAPP.
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {!currentGroupDef.qualitative_only && (
                                <div className="recording-area">
                                    <div className="progress-container">
                                        <div className="progress-info">
                                            <span>Tentativas: <strong>{currentGroup.attempts}</strong> (mín. {currentGroupDef.min_trials})</span>
                                            <span>Acertos: <strong>{currentGroup.correct}</strong> (meta: {currentGroupDef.reference_threshold * 100}%)</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        <button className="btn-record incorrect" onClick={() => handleAttempt(false)}>
                                            <span className="large-icon">✕</span>
                                            <span>Incorreto</span>
                                        </button>
                                        <button className="btn-record correct" onClick={() => handleAttempt(true)}>
                                            <span className="large-icon">✓</span>
                                            <span>Correto</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentGroupDef.qualitative_only && (
                                <div className="qualitative-area">
                                    <p className="description">Avalie o ritmo, entonação e ênfase vocal da criança durante as repetições.</p>
                                    <div className="action-buttons">
                                        <button className="btn-record incorrect" onClick={() => handleQualitativeDecision(false)}>
                                            <span className="large-icon">⚠️</span>
                                            <span>Apresenta Dificuldade</span>
                                        </button>
                                        <button className="btn-record correct" onClick={() => handleQualitativeDecision(true)}>
                                            <span className="large-icon">✨</span>
                                            <span>Prosódia Adequada</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="notes-area">
                                <textarea
                                    placeholder="Observações clínicas sobre este grupo..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                                {!currentGroupDef.qualitative_only && (
                                    <button className="btn btn-primary" onClick={handleFinalizeGroup}>Finalizar Grupo</button>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

function getEcoicoStyles() {
    return `
    .ecoico-screen {
      background: #f4f7fa;
      min-height: 100vh;
      color: #334155;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .ecoico-header {
      background: white;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      sticky: top;
      z-index: 10;
    }

    .ecoico-header h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0.25rem 0;
    }

    .ecoico-header .breadcrumb {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .disclaimer-alert {
      margin: 1.5rem 2rem 0;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      display: flex;
      gap: 0.75rem;
      align-items: center;
      color: #1d4ed8;
      font-size: 0.875rem;
    }

    .ecoico-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 2rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .group-nav {
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .nav-item {
      padding: 1.25rem;
      border: none;
      background: none;
      border-bottom: 1px solid #f1f5f9;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }

    .nav-item:hover { background: #f8fafc; }
    .nav-item.active { background: #f1f5f9; border-left: 4px solid #3b82f6; }
    .nav-item.completed { opacity: 0.8; }

    .nav-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .group-label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
    .group-name { font-weight: 700; color: #334155; }

    .priority-badge { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 4px; }
    .priority-badge.expected { background: #dcfce7; color: #166534; }
    .priority-badge.emerging { background: #fef9c3; color: #854d0e; }

    .group-content {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .group-header { margin-bottom: 2.5rem; }
    .group-header h2 { font-size: 2rem; font-weight: 800; color: #0f172a; }
    .pattern { color: #64748b; margin-top: 0.5rem; font-size: 1.1rem; }

    .progress-container { margin-bottom: 2rem; }
    .progress-info { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.9rem; }
    .progress-bar-bg { background: #f1f5f9; height: 10px; border-radius: 5px; overflow: hidden; }
    .progress-bar-fill { background: #3b82f6; height: 100%; transition: width 0.3s ease; }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .btn-record {
      height: 120px;
      border-radius: 12px;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.2s;
    }

    .btn-record:active { transform: scale(0.98); }
    .btn-record.correct { background: #10b981; color: white; box-shadow: 0 4px 0 #059669; }
    .btn-record.incorrect { background: #f43f5e; color: white; box-shadow: 0 4px 0 #e11d48; }
    .large-icon { font-size: 2.5rem; font-weight: 700; }

    .notes-area { display: flex; flex-direction: column; gap: 1rem; }
    .notes-area textarea {
      width: 100%;
      height: 120px;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      resize: none;
      font-family: inherit;
    }

    .summary-card {
        background: white;
        padding: 2.5rem;
        border-radius: 16px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
        border: 1px solid #e2e8f0;
    }

    .summary-main { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .summary-main h2 { color: #0f172a; font-size: 1.75rem; flex: 1; }
    .clinical-badge { padding: 0.5rem 1rem; border-radius: 999px; font-weight: 800; font-size: 0.8rem; }
    .clinical-badge.ecoico_funcional { background: #dcfce7; color: #166534; }
    .clinical-badge.ecoico_limitado { background: #fee2e2; color: #991b1b; }

    .recommendation { background: #f8fafc; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #3b82f6; }
    .recommendation h3 { font-size: 0.9rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
    .recommendation p { font-size: 1.1rem; color: #334155; line-height: 1.5; }

    .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
    .result-item { padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; background: white; }
    .result-item.passed { border-left: 4px solid #10b981; }
    .result-item.failed { border-left: 4px solid #f43f5e; }
    .result-header { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .result-stats { font-size: 1.2rem; font-weight: 800; color: #1e293b; display: flex; gap: 1rem; }
    .result-notes { margin-top: 0.75rem; font-size: 0.85rem; color: #64748b; font-style: italic; }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-success { background: #10b981; color: white; }
    .nav-item.disabled { 
      cursor: not-allowed; 
      opacity: 0.5; 
      filter: grayscale(1);
    }
    .lock-icon { font-size: 0.8rem; margin-left: 0.5rem; }

    .stop-alert {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: #fff7ed;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      color: #92400e;
      font-size: 0.9rem;
      line-height: 1.4;
      text-align: center;
    }

    .status-box { padding: 2rem; border-radius: 12px; text-align: center; margin-bottom: 1.5rem; }
    .status-box.passed { background: #f0fdf4; color: #166534; }
    .status-box.failed { background: #fff1f2; color: #9f1239; }
    .final-score { font-size: 1.5rem; font-weight: 900; margin-top: 1rem; }
  `;
}
