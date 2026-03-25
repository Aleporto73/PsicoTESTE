import React, { useEffect, useState } from 'react';
import { useSession } from './context/SessionContext';
import MilestonesScreen from './components/screens/MilestonesScreen';
import EcoicoSubtestScreen from './components/screens/EcoicoSubtestScreen';
import SubtestesScreen from './components/screens/SubtestesScreen';
import BarreirasScreen from './components/screens/BarreirasScreen';
import TransicaoScreen from './components/screens/TransicaoScreen';
import PEIScreen from './components/screens/PEIScreen';
import PainelCrianca from './components/screens/PainelCrianca';
import ConsolidadoLongitudinal from './components/screens/ConsolidadoLongitudinal';
import PDFReportV3 from './components/reports/PDFReportV3';
import InstrumentSelectorScreen from './components/screens/InstrumentSelectorScreen';
import InstrumentDashboard from './components/screens/InstrumentDashboard';
import MChatRFScreen from './components/screens/MChatRFScreen';
// PortageScreen removido — instrumento não autorizado
import AtaScreen from './components/screens/AtaScreen';
import ABLLSRScreen from './components/screens/ABLLSRScreen';
import ABLLSRLongitudinal from './components/screens/ABLLSRLongitudinal';
import ABCICAScreen from './components/screens/ABCICAScreen';
import CARS2Screen from './components/screens/CARS2Screen';
import MDFBRScreen from './components/screens/MDFBRScreen';
import IDFBRScreen from './components/screens/IDFBRScreen';
// DenverIIScreen removido — instrumento não autorizado

export default function SessionController({
    data = {},
    includeGraphs = true,
    includePEI = false,
    templateVersion = 'v3',
}) {
    const {
        sessions,
        selectedSession,
        setSelectedSession,
        viewMode,
        setViewMode,
        updateSession,
        backToList,
        selectSession,
        startNewEvaluation,
        getHistoricoSessoes,
        getInstrumentHistory,
        currentInstrument,
        selectInstrument,
        completeInstrument,
    } = useSession();

    const [showPDFPreview, setShowPDFPreview] = useState(false);

    // Helper: Verifica se tem lacuna no domínio Ecoico (DOM08)
    function hasEcoicoLacuna(session) {
        if (!session?.lacunas) return false;
        return session.lacunas.some(l => l.domain_id === 'DOM08');
    }

    // Debug desabilitado em produção
    // useEffect(() => {
    //     console.log("SessionController - Estado:", { viewMode, currentInstrument, selectedSessionId: selectedSession?.session_id });
    // }, [viewMode, selectedSession, currentInstrument]);

    // ═══════════════════════════════════════════════════════════════
    // 0. SELETOR DE INSTRUMENTOS
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'instrument_selector' && selectedSession) {
        return (
            <InstrumentSelectorScreen
                session={selectedSession}
                onSelectInstrument={(instrumentId) => selectInstrument(instrumentId)}
                onBack={backToList}
            />
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 0.5 DASHBOARD DE INSTRUMENTOS
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'instrument_dashboard' && selectedSession) {
        return (
            <InstrumentDashboard
                session={selectedSession}
                onAddInstrument={() => setViewMode('instrument_selector')}
                onViewInstrument={(instrumentId, idx) => {
                    if (instrumentId === 'vbmapp') {
                        selectInstrument('vbmapp');
                    } else {
                        selectInstrument(instrumentId);
                    }
                }}
                onViewReport={(instrumentId, idx) => {
                    setViewMode('report');
                }}
                onViewLongitudinal={(instrumentId) => {
                    if (instrumentId === 'ablls_r') {
                        setViewMode('ablls_r_longitudinal');
                    }
                }}
                onBack={backToList}
            />
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 0.55 LONGITUDINAL ABLLS-R (AV1-AV4)
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'ablls_r_longitudinal' && selectedSession) {
        const ablsHistory = getInstrumentHistory(selectedSession.child_name, 'ablls_r');
        return (
            <ABLLSRLongitudinal
                evaluations={ablsHistory}
                childName={selectedSession.child_name}
                onBack={() => setViewMode('instrument_dashboard')}
            />
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 0.6 AVALIAÇÃO DE INSTRUMENTO SIMPLES (M-CHAT, etc.)
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'instrument_evaluation' && selectedSession && currentInstrument) {
        if (currentInstrument === 'mchat_rf') {
            return (
                <MChatRFScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        completeInstrument('mchat_rf', payload);
                    }}
                    onBack={() => setViewMode('instrument_selector')}
                    isReadOnly={false}
                />
            );
        }

        if (currentInstrument === 'ata') {
            return (
                <AtaScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        completeInstrument('ata', payload);
                    }}
                    onBack={() => setViewMode('instrument_selector')}
                    isReadOnly={false}
                />
            );
        }

        if (currentInstrument === 'ablls_r') {
            return (
                <ABLLSRScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        completeInstrument('ablls_r', payload);
                    }}
                    onBack={() => setViewMode('instrument_selector')}
                    isReadOnly={false}
                />
            );
        }

        if (currentInstrument === 'abc_ica') {
            return (
                <ABCICAScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        completeInstrument('abc_ica', payload);
                    }}
                    onBack={() => setViewMode('instrument_selector')}
                    isReadOnly={false}
                />
            );
        }

        if (currentInstrument === 'cars2') {
            return (
                <CARS2Screen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        completeInstrument('cars2', payload);
                    }}
                    onBack={() => setViewMode('instrument_selector')}
                    isReadOnly={false}
                />
            );
        }

        if (currentInstrument === 'mdf_br') {
            return (
                <MDFBRScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        completeInstrument('mdf_br', payload);
                    }}
                    onBack={() => setViewMode('instrument_selector')}
                    isReadOnly={false}
                />
            );
        }

        if (currentInstrument === 'idf_br') {
            return (
                <IDFBRScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        completeInstrument('idf_br', payload);
                    }}
                    onBack={() => setViewMode('instrument_selector')}
                    isReadOnly={false}
                />
            );
        }

        // Fallback
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Instrumento "{currentInstrument}" ainda não implementado</h2>
                <button onClick={() => setViewMode('instrument_selector')} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Voltar ao Seletor
                </button>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 1. LISTA DE SESSÕES
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'sessions') {
        return (
            <div className="sessions-view">
                <style>{`
                    .sessions-view {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 2rem;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 2.5rem;
                        background: #fff;
                        padding: 1.5rem 2rem;
                        border-radius: 16px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    }
                    .header-content h1 { margin: 0; font-size: 1.8rem; color: #1e293b; font-weight: 800; }
                    .header-content p { margin: 0.2rem 0 0; color: #64748b; font-size: 0.95rem; }
                    .sessions-list { display: flex; flex-direction: column; gap: 20px; }
                    .session-card {
                        background: #fff; border-radius: 12px; padding: 1.5rem;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                        border-left: 6px solid #6366f1;
                        display: flex; justify-content: space-between; align-items: center;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .session-card.finalizada { border-left-color: #10b981; }
                    .session-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
                    .session-info-main h3 { margin: 0 0 0.4rem 0; font-size: 1.25rem; color: #1e293b; font-weight: 700; }
                    .session-date { color: #94a3b8; font-size: 0.85rem; font-weight: 500; }
                    .session-details { display: flex; flex-direction: column; gap: 12px; flex: 1; margin-left: 1.5rem; }
                    .session-meta-stats { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
                    .marcos-count { font-size: 0.875rem; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }
                    .session-progress-circles { display: flex; gap: 8px; }
                    .progress-circle {
                        width: 36px; height: 36px; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 0.875rem; font-weight: 700; color: white; cursor: default;
                    }
                    .progress-circle.completed { background: #10b981; }
                    .progress-circle.pending { background: #e2e8f0; color: #94a3b8; }
                    .session-actions { display: flex; gap: 12px; margin-left: 1.5rem; }
                    .btn-outline-indigo {
                        background: transparent; border: 2px solid #6366f1; color: #6366f1;
                        padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                    }
                    .btn-outline-indigo:hover { background: #6366f1; color: white; }
                    .btn-outline-purple {
                        background: transparent; border: 2px solid #7c3aed; color: #7c3aed;
                        padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                    }
                    .btn-outline-purple:hover { background: #7c3aed; color: white; }
                    .btn-primary-indigo {
                        background: #6366f1; border: 2px solid #6366f1; color: white;
                        padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                    }
                    .btn-primary-indigo:hover { background: #4f46e5; border-color: #4f46e5; transform: translateY(-1px); }
                    .btn-primary-green {
                        background: #10b981; border: 2px solid #10b981; color: white;
                        padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                    }
                    .btn-primary-green:hover { background: #059669; border-color: #059669; }
                    .ai-pill { background: #ede9fe; color: #7c3aed; padding: 2px 8px; border-radius: 4px; font-size: 0.8125rem; font-weight: 700; }
                    .eco-pill { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 0.8125rem; font-weight: 700; }
                    .finalizada-pill { background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 4px; font-size: 0.8125rem; font-weight: 700; }
                    .instrument-pill { background: #faf5ff; color: #7c3aed; padding: 2px 8px; border-radius: 4px; font-size: 0.8125rem; font-weight: 700; }
                    .empty { text-align: center; padding: 4rem; background: #fff; border-radius: 16px; color: #64748b; border: 2px dashed #e2e8f0; }
                `}</style>

                <header className="header">
                    <div className="header-content">
                        <h1>PsicoTestes — Avaliações</h1>
                        <p>{sessions.length} sessão(ões) registrada(s)</p>
                    </div>
                    <button className="btn btn-primary-indigo" onClick={startNewEvaluation}>
                        + Nova Avaliação
                    </button>
                </header>

                <div className="sessions-list">
                    {sessions.length === 0 ? (
                        <div className="empty">
                            <p>Nenhuma sessão registrada ainda</p>
                            <p>Clique em "Nova Avaliação" para começar</p>
                        </div>
                    ) : (
                        sessions.map(session => {
                            const instrumentCount = (session.instruments || []).length;
                            return (
                            <div key={session.session_id} className={`session-card ${session.sessao_fechada ? 'finalizada' : ''}`}>
                                <div className="session-info-main">
                                    <h3>{session.child_name || "Criança sem nome"}</h3>
                                    <span className="session-date">
                                        {new Date(session.date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div className="session-details">
                                    <div className="session-meta-stats">
                                        {Object.keys(session.scores_snapshot || {}).length > 0 && (
                                            <span className="marcos-count">VB-MAPP: {Object.keys(session.scores_snapshot).length} marcos</span>
                                        )}
                                        {instrumentCount > 0 && (
                                            <span className="instrument-pill">{instrumentCount} instrumento(s)</span>
                                        )}
                                        {session.ai_report && <span className="ai-pill">IA</span>}
                                        {session.ecoico_results && <span className="eco-pill">Ecoico</span>}
                                        {session.sessao_fechada && <span className="finalizada-pill">Finalizada</span>}
                                    </div>
                                    <div className="session-progress-circles">
                                        {/* VB-MAPP progress (se iniciado) */}
                                        {(session.milestones_completo || Object.keys(session.scores_snapshot || {}).length > 0) && (
                                            <>
                                                <div title="Milestones" className={`progress-circle ${session.milestones_completo ? 'completed' : 'pending'}`}>M</div>
                                                {hasEcoicoLacuna(session) && (
                                                    <div title="Ecoico" className={`progress-circle ${session.ecoico_completo ? 'completed' : 'pending'}`}>E</div>
                                                )}
                                                <div title="Subtestes" className={`progress-circle ${session.tarefas_completas ? 'completed' : 'pending'}`}>S</div>
                                                <div title="Barreiras" className={`progress-circle ${session.barreiras_completas ? 'completed' : 'pending'}`}>B</div>
                                                <div title="Transição" className={`progress-circle ${session.transicao_completa ? 'completed' : 'pending'}`}>T</div>
                                                <div title="PEI" className={`progress-circle ${session.pei_completo ? 'completed' : 'pending'}`}>P</div>
                                            </>
                                        )}
                                        {/* Instrumentos simples */}
                                        {(session.instruments || []).map((inst, idx) => (
                                            <div
                                                key={`${inst.instrument_id}-${idx}`}
                                                title={inst.instrument_id.toUpperCase()}
                                                className={`progress-circle ${inst.status === 'completed' ? 'completed' : 'pending'}`}
                                                style={inst.status === 'completed' ? { background: '#7c3aed' } : {}}
                                            >
                                                {inst.instrument_id === 'mchat_rf' ? 'MC' : inst.instrument_id === 'abc_ica' ? 'AB' : inst.instrument_id === 'cars2' ? 'CA' : inst.instrument_id.substring(0, 2).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="session-actions">
                                    {session.sessao_fechada && (
                                        <button className="btn-outline-purple" onClick={() => { setSelectedSession(session); setViewMode('painel_crianca'); }}>
                                            Painel
                                        </button>
                                    )}
                                    <button className="btn-outline-indigo" onClick={() => { setSelectedSession(session); setViewMode('report'); }}>
                                        Relatório
                                    </button>
                                    <button
                                        className={session.sessao_fechada ? "btn-primary-green" : "btn-primary-indigo"}
                                        onClick={() => selectSession(session)}
                                    >
                                        {session.sessao_fechada ? 'Ver' : session.milestones_completo ? 'Continuar' : 'Abrir'}
                                    </button>
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. PAINEL DA CRIANÇA
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'painel_crianca' && selectedSession) {
        const historicoSessoes = getHistoricoSessoes(selectedSession.child_name);
        return (
            <PainelCrianca
                crianca={{ nome: selectedSession.child_name, idade: selectedSession.child_age }}
                sessaoAtual={selectedSession}
                historicoSessoes={historicoSessoes}
                onGerarRelatorio={() => setViewMode('report')}
                onGerarPEI={() => setViewMode('evaluation')}
                onVoltar={backToList}
            />
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. FLUXO DE AVALIAÇÃO VB-MAPP (INALTERADO)
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'evaluation' && selectedSession) {
        const isReadOnly = !!selectedSession.sessao_fechada;

        // SESSÃO FINALIZADA → PAINEL DA CRIANÇA
        if (selectedSession.sessao_fechada) {
            const historicoSessoes = getHistoricoSessoes(selectedSession.child_name);
            return (
                <PainelCrianca
                    crianca={{ nome: selectedSession.child_name, idade: selectedSession.child_age }}
                    sessaoAtual={selectedSession}
                    historicoSessoes={historicoSessoes}
                    onGerarRelatorio={() => setViewMode('report')}
                    onGerarPEI={() => {}}
                    onVoltar={backToList}
                />
            );
        }

        // TELA 1: Milestones
        if (!selectedSession.milestones_completo) {
            return (
                <MilestonesScreen
                    data={data}
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => updateSession({ ...payload, milestones_completo: true })}
                    onBack={() => setViewMode('instrument_selector')}
                    isReadOnly={isReadOnly}
                    key={selectedSession.session_id}
                />
            );
        }

        // TELA 1.5: Subteste Ecoico (CONDICIONAL)
        const needsEcoico = hasEcoicoLacuna(selectedSession);
        if (needsEcoico && !selectedSession.ecoico_completo) {
            return (
                <EcoicoSubtestScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => updateSession({
                        ecoico_results: payload.ecoico_results,
                        ecoico_summary: payload.summary,
                        ecoico_completo: true
                    })}
                    onBack={() => {
                        if (window.confirm("Deseja pular o Subteste Ecoico? Você pode aplicá-lo depois.")) {
                            updateSession({ ecoico_completo: true, ecoico_skipped: true });
                        }
                    }}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 2: Subtestes (Tarefas)
        if (!selectedSession.tarefas_completas) {
            return (
                <SubtestesScreen
                    key={`subtestes-${selectedSession.session_id}-${selectedSession.active_level || '1'}`}
                    data={data}
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => updateSession({ ...payload, tarefas_completas: true })}
                    onBack={backToList}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 3: Barreiras
        if (!selectedSession.barreiras_completas) {
            return (
                <BarreirasScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => updateSession({ ...payload, barreiras_completas: true })}
                    onBack={backToList}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 4: Transição
        if (!selectedSession.transicao_completa) {
            return (
                <TransicaoScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => updateSession({ ...payload, transicao_completa: true })}
                    onBack={backToList}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 5: PEI
        return (
            <PEIScreen
                sessionInfo={selectedSession}
                onFinalize={(payload) => updateSession({ ...payload, pei_completo: true, sessao_fechada: true })}
                onBack={backToList}
                isReadOnly={isReadOnly}
            />
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. RELATÓRIO
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'report' && selectedSession) {
        return (
            <div className="report-view">
                <style>{`
                    .report-view { max-width: 1200px; margin: 0 auto; padding: 2rem; }
                    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem; background: #fff; border-radius: 12px; }
                    .header-actions { display: flex; gap: 10px; }
                    .btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                    .btn-secondary { background: #f1f5f9; border: none; color: #475569; }
                    .btn-primary { background: #6366f1; border: none; color: white; }
                    .btn-purple { background: #7c3aed; border: none; color: white; }
                    .report-content { background: #fff; border-radius: 12px; padding: 2rem; }
                `}</style>

                <header className="header no-print">
                    <h1>Relatório</h1>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={backToList}>← Voltar</button>
                        {selectedSession.sessao_fechada && (
                            <button className="btn btn-purple" onClick={() => setViewMode('painel_crianca')}>Painel da Criança</button>
                        )}
                        {(selectedSession.instruments || []).length > 0 && (
                            <button className="btn btn-purple" onClick={() => setViewMode('instrument_dashboard')}>Dashboard</button>
                        )}
                        <button className="btn btn-primary" onClick={() => setShowPDFPreview(!showPDFPreview)}>
                            {showPDFPreview ? 'Ver Dados' : 'Ver PDF'}
                        </button>
                    </div>
                </header>

                <div className="report-content">
                    {showPDFPreview ? (
                        <PDFReportV3
                            child={{ id: selectedSession.child_id, name: selectedSession.child_name, age: selectedSession.child_age }}
                            session={{
                                date: selectedSession.date,
                                scores: selectedSession.scores_snapshot,
                                lacunas: selectedSession.lacunas,
                                ecoico_results: selectedSession.ecoico_results,
                                ecoico_summary: selectedSession.ecoico_summary
                            }}
                            domains={data.domains || []}
                            includeGraphs={includeGraphs}
                            includePEI={includePEI}
                            allSessions={sessions.filter(s => s.child_name === selectedSession.child_name)}
                        />
                    ) : (
                        <section className="report-section">
                            <h2>Resumo da Avaliação</h2>
                            <div className="report-meta">
                                <p><strong>Criança:</strong> {selectedSession.child_name}</p>
                                <p><strong>Data:</strong> {new Date(selectedSession.date).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Marcos avaliados:</strong> {Object.keys(selectedSession.scores_snapshot || {}).length}</p>
                                <p><strong>Lacunas identificadas:</strong> {selectedSession.lacunas?.length || 0}</p>
                                {selectedSession.ecoico_summary && (
                                    <p><strong>Ecoico:</strong> {selectedSession.ecoico_summary.text}</p>
                                )}
                                {(selectedSession.instruments || []).length > 0 && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                        <p><strong>Instrumentos aplicados:</strong></p>
                                        {selectedSession.instruments.map((inst, idx) => (
                                            <p key={idx} style={{ marginLeft: '1rem' }}>
                                                — {inst.instrument_id.toUpperCase()}: {inst.status === 'completed' ? 'Concluído' : 'Em andamento'}
                                                {inst.instrument_id === 'mchat_rf' && inst.data?.scores && (
                                                    <span> (Score: {inst.data.scores.raw_score}/20 — {inst.data.scores.risk_level})</span>
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedSession.milestones_completo && (
                                <div className="completion-status">
                                    <h3>Progresso VB-MAPP</h3>
                                    <div className="progress-badges">
                                        <span className={`badge ${selectedSession.milestones_completo ? 'completed' : ''}`}>Milestones</span>
                                        {hasEcoicoLacuna(selectedSession) && (
                                            <span className={`badge ${selectedSession.ecoico_completo ? 'completed' : ''}`}>Ecoico</span>
                                        )}
                                        <span className={`badge ${selectedSession.tarefas_completas ? 'completed' : ''}`}>Subtestes</span>
                                        <span className={`badge ${selectedSession.barreiras_completas ? 'completed' : ''}`}>Barreiras</span>
                                        <span className={`badge ${selectedSession.transicao_completa ? 'completed' : ''}`}>Transição</span>
                                        <span className={`badge ${selectedSession.pei_completo ? 'completed' : ''}`}>PEI</span>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. CONSOLIDADO LONGITUDINAL
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'consolidado_longitudinal') {
        return (
            <ConsolidadoLongitudinal
                sessions={sessions}
                childName={selectedSession?.child_name || ''}
                data={data}
                onBack={backToList}
            />
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VIEW PADRÃO
    // ═══════════════════════════════════════════════════════════════
    return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h1>PsicoTestes</h1>
            <p>Nenhuma view ativa no momento.</p>
            <button onClick={backToList} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Voltar para Sessões
            </button>
        </div>
    );
}
