import React, { useEffect } from 'react';
import MilestonesScreen from './MilestonesScreen';
import SubtestesScreen from './SubtestesScreen';
import BarreirasScreen from './BarreirasScreen';
import TransicaoScreen from './TransicaoScreen';
import PEIScreen from './PEIScreen';
import ConsolidadoLongitudinal from './ConsolidadoLongitudinal';
import PDFReport from './PDFReport';
import PDFReportV3 from './PDFReportV3';

export default function SessionController({
    viewMode = 'sessions',
    setViewMode = () => { },
    sessions = [],
    selectedSession = null,
    setSelectedSession = () => { },
    data = {},
    onStartNewEvaluation = () => { },
    onUpdateSession = () => { },
    onBackToList = () => { },
    onSelectSession = () => { },
    sessionAnalysis = null,
    generateAIReport = () => { },
    generatingAI = false,
    includeGraphs = true,
    setIncludeGraphs = () => { },
    includePEI = false,
    setIncludePEI = () => { },
    showPDFPreview = false,
    setShowPDFPreview = () => { },
    templateVersion = 'v3',
    setTemplateVersion = () => { },
    reportMode = 'professional',
    getReportText = () => '',
    childName = '',
    setChildName = () => { },
    finalizeSession = () => { },
    scores = {},
    setBlockScore = () => { },
    resetFilters = () => { },
    filteredDomains = [],
    stats = {},
    progress = {},
    audience = 'professional',
    setAudience = () => { },
    levelFilter = 'ALL',
    setLevelFilter = () => { },
    domainFilter = 'ALL',
    setDomainFilter = () => { },
    search = '',
    setSearch = () => { }
}) {

    // DEBUG: Monitorar mudanças no estado
    useEffect(() => {
        console.log("🎮 SessionController - Estado:", {
            viewMode,
            selectedSessionId: selectedSession?.session_id,
            selectedSessionFlags: selectedSession ? {
                milestones_completo: selectedSession.milestones_completo,
                tarefas_completas: selectedSession.tarefas_completas,
                barreiras_completas: selectedSession.barreiras_completas,
                transicao_completa: selectedSession.transicao_completa,
                pei_completo: selectedSession.pei_completo,
                sessao_fechada: selectedSession.sessao_fechada,
                lacunasCount: selectedSession.lacunas?.length || 0
            } : null,
            sessionsCount: sessions.length
        });
    }, [viewMode, selectedSession, sessions.length]);

    // 1. LISTA DE SESSÕES (TELA INICIAL)
    if (viewMode === 'sessions') {
        return (
            <div className="sessions-view">
                <header className="header">
                    <div className="header-content">
                        <h1>📋 Sessões de Avaliação</h1>
                        <p>{sessions.length} sessão(ões) registrada(s)</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            console.log("🎯 Iniciando nova avaliação");
                            onStartNewEvaluation();
                        }}
                    >
                        ➕ Nova Avaliação
                    </button>
                </header>

                <div className="sessions-list">
                    {sessions.length === 0 ? (
                        <div className="empty">
                            <p>Nenhuma sessão finalizada ainda</p>
                            <p className="small-text">Clique em "Nova Avaliação" para começar</p>
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div key={session.session_id} className="session-card">
                                <div className="session-header">
                                    <h3>{session.child_name || "Criança sem nome"}</h3>
                                    <span className="session-date">
                                        {new Date(session.date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                <div className="session-stats">
                                    <span>
                                        {Object.keys(session.scores_snapshot || {}).length} marcos avaliados
                                    </span>
                                    {session.ai_report && <span className="ai-badge">🤖 IA</span>}
                                </div>

                                <div className="session-progress-badges">
                                    <span
                                        title="Milestones"
                                        className={`badge ${session.milestones_completo ? 'completed' : 'pending'}`}
                                    >
                                        M
                                    </span>
                                    <span
                                        title="Subtestes"
                                        className={`badge ${session.tarefas_completas ? 'completed' : 'pending'}`}
                                    >
                                        S
                                    </span>
                                    <span
                                        title="Barreiras"
                                        className={`badge ${session.barreiras_completas ? 'completed' : 'pending'}`}
                                    >
                                        B
                                    </span>
                                    <span
                                        title="Transição"
                                        className={`badge ${session.transicao_completa ? 'completed' : 'pending'}`}
                                    >
                                        T
                                    </span>
                                    <span
                                        title="PEI"
                                        className={`badge ${session.pei_completo ? 'completed' : 'pending'}`}
                                    >
                                        P
                                    </span>
                                </div>

                                <div className="session-actions">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            console.log("📊 Abrindo relatório para:", session.session_id);
                                            setSelectedSession(session);
                                            setViewMode('report');
                                        }}
                                    >
                                        📊 Relatório
                                    </button>

                                    <button
                                        className="btn btn-success"
                                        onClick={() => {
                                            console.log("🚀 Continuando avaliação:", session.session_id);
                                            onSelectSession(session);
                                        }}
                                    >
                                        {session.sessao_fechada
                                            ? '👁️ Visualizar'
                                            : session.milestones_completo
                                                ? '➡️ Continuar'
                                                : '🚀 Iniciar/Continuar'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // 2. MODO TESTE (DRAFT) - Mantido para compatibilidade
    if (viewMode === 'test') {
        return (
            <div className="test-view">
                <header className="header">
                    <div className="header-content">
                        <h1>PsicoTestes — VB-MAPP</h1>
                        <p>Registro de Marcos e Avaliação Inicial</p>
                    </div>
                    <div className="header-stats">
                        <div className="stat">
                            <span className="stat-value">{stats.totalBlocks || 0}</span>
                            <span className="stat-label">Blocos</span>
                        </div>
                        <div className="stat stat-success">
                            <span className="stat-value">{progress.dominado || 0}</span>
                            <span className="stat-label">Dominados</span>
                        </div>
                    </div>
                </header>

                <section className="session-panel">
                    <input
                        type="text"
                        placeholder="Nome da criança..."
                        value={childName}
                        onChange={e => setChildName(e.target.value)}
                        className="child-input"
                    />
                    <button className="btn btn-success" onClick={finalizeSession}>
                        ✓ Finalizar Sessão
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setViewMode('sessions')}
                    >
                        📋 Ver Sessões
                    </button>
                </section>

                <section className="controls">
                    <div className="control-group">
                        <label>Nível:</label>
                        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
                            <option value="ALL">Todos os níveis</option>
                            <option value="1-M">Nível 1</option>
                            <option value="2-M">Nível 2</option>
                            <option value="3-M">Nível 3</option>
                        </select>
                    </div>
                    <div className="control-group control-search">
                        <label>Buscar:</label>
                        <input
                            type="text"
                            placeholder="Digite..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </section>

                <div className="domains">
                    {filteredDomains.map(domain => (
                        <section key={domain.domain_id} className="domain">
                            <h2 className="domain-title">{domain.domain_name}</h2>
                            <div className="blocks">
                                {domain.blocks.map(block => (
                                    <article key={block.block_id} className="block">
                                        <p className="block-text">
                                            {audience === 'professional'
                                                ? block.texto_profissional
                                                : block.texto_responsavel}
                                        </p>
                                        <div className="block-score">
                                            <button
                                                className={`score-btn ${scores[block.block_id] === 'dominado' ? 'active dominated' : ''}`}
                                                onClick={() => setBlockScore(block.block_id, 'dominado')}
                                            >
                                                ✓ Dominado
                                            </button>
                                            <button
                                                className={`score-btn ${scores[block.block_id] === 'emergente' ? 'active emergent' : ''}`}
                                                onClick={() => setBlockScore(block.block_id, 'emergente')}
                                            >
                                                ◐ Emergente
                                            </button>
                                            <button
                                                className={`score-btn ${scores[block.block_id] === 'nao_observado' ? 'active neutral' : ''}`}
                                                onClick={() => setBlockScore(block.block_id, 'nao_observado')}
                                            >
                                                ○ Não Obs.
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        );
    }

    // 3. FLUXO DE AVALIAÇÃO SEQUENCIAL (A LÓGICA MESTRE)
    if (viewMode === 'evaluation' && selectedSession) {
        console.log("🎯 Modo avaliação ativo para sessão:", selectedSession.session_id);

        const isReadOnly = !!selectedSession.sessao_fechada;

        // Verifica se sessão está finalizada
        if (selectedSession.sessao_fechada) {
            console.log("🏁 Sessão finalizada, mostrando consolidado");
            return <ConsolidadoFinalView session={selectedSession} onBack={onBackToList} />;
        }

        // TELA 1: Milestones
        if (!selectedSession.milestones_completo) {
            console.log("📊 Indo para MilestonesScreen, sessão:", {
                id: selectedSession.session_id,
                child_name: selectedSession.child_name,
                scoresCount: Object.keys(selectedSession.scores_snapshot || {}).length
            });

            return (
                <MilestonesScreen
                    data={data}
                    sessionInfo={selectedSession}  // ✅ Passando a sessão correta
                    onFinalize={(payload) => {
                        console.log("✅ MilestonesScreen finalizando:", payload);
                        // Garante que milestones_completo seja true
                        onUpdateSession({
                            ...payload,
                            milestones_completo: true
                        });
                    }}
                    onBack={() => {
                        console.log("← Voltando para lista de sessões");
                        setViewMode('sessions');
                    }}
                    isReadOnly={isReadOnly}
                    key={selectedSession.session_id} // ✅ FORÇA RE-RENDER AO MUDAR SESSÃO
                />
            );
        }

        // TELA 2: Subtestes (Tarefas)
        if (!selectedSession.tarefas_completas) {
            console.log("🧪 Indo para SubtestesScreen com lacunas:", selectedSession.lacunas?.length || 0);
            return (
                <SubtestesScreen
                    lacunas={selectedSession.lacunas || []}
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        console.log("✅ SubtestesScreen finalizada, payload:", payload);
                        onUpdateSession({
                            ...payload,
                            tarefas_completas: true
                        });
                    }}
                    onBack={onBackToList}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 3: Barreiras
        if (!selectedSession.barreiras_completas) {
            console.log("🚧 Indo para BarreirasScreen");
            return (
                <BarreirasScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        console.log("✅ BarreirasScreen finalizada, payload:", payload);
                        onUpdateSession({
                            ...payload,
                            barreiras_completas: true
                        });
                    }}
                    onBack={onBackToList}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 4: Transição
        if (!selectedSession.transicao_completa) {
            console.log("🔄 Indo para TransicaoScreen");
            return (
                <TransicaoScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        console.log("✅ TransicaoScreen finalizada, payload:", payload);
                        onUpdateSession({
                            ...payload,
                            transicao_completa: true
                        });
                    }}
                    onBack={onBackToList}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 5: PEI
        console.log("📝 Indo para PEIScreen");
        return (
            <PEIScreen
                sessionInfo={selectedSession}
                onFinalize={(payload) => {
                    console.log("✅ PEIScreen finalizada, payload:", payload);
                    onUpdateSession({
                        ...payload,
                        pei_completo: true,
                        sessao_fechada: true
                    });
                }}
                onBack={onBackToList}
                isReadOnly={isReadOnly}
            />
        );
    }

    // 4. RELATÓRIO E OUTRAS VIEWS
    if (viewMode === 'report' && selectedSession) {
        return (
            <div className="report-view">
                <header className="header no-print">
                    <h1>📄 Relatório VB-MAPP</h1>
                    <div className="header-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={onBackToList}
                        >
                            ← Voltar para Sessões
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowPDFPreview(!showPDFPreview)}
                        >
                            {showPDFPreview ? '📊 Ver Dados' : '📄 Ver PDF'}
                        </button>
                    </div>
                </header>

                <div className="report-content">
                    {showPDFPreview ? (
                        <PDFReportV3
                            child={{
                                id: selectedSession.child_id,
                                name: selectedSession.child_name,
                                age: selectedSession.child_age
                            }}
                            session={{
                                date: selectedSession.date,
                                scores: selectedSession.scores_snapshot,
                                lacunas: selectedSession.lacunas
                            }}
                            domains={data.domains || []}
                            includeGraphs={includeGraphs}
                            includePEI={includePEI}
                            allSessions={sessions.filter(s =>
                                s.child_name === selectedSession.child_name
                            )}
                        />
                    ) : (
                        <section className="report-section">
                            <h2>Resumo da Avaliação</h2>
                            <div className="report-meta">
                                <p><strong>Criança:</strong> {selectedSession.child_name}</p>
                                <p><strong>Data:</strong> {new Date(selectedSession.date).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Marcos avaliados:</strong> {Object.keys(selectedSession.scores_snapshot || {}).length}</p>
                                <p><strong>Lacunas identificadas:</strong> {selectedSession.lacunas?.length || 0}</p>
                            </div>

                            {selectedSession.milestones_completo && (
                                <div className="completion-status">
                                    <h3>Progresso da Avaliação</h3>
                                    <div className="progress-badges">
                                        <span className={`badge ${selectedSession.milestones_completo ? 'completed' : ''}`}>Milestones ✓</span>
                                        <span className={`badge ${selectedSession.tarefas_completas ? 'completed' : ''}`}>Subtestes ✓</span>
                                        <span className={`badge ${selectedSession.barreiras_completas ? 'completed' : ''}`}>Barreiras ✓</span>
                                        <span className={`badge ${selectedSession.transicao_completa ? 'completed' : ''}`}>Transição ✓</span>
                                        <span className={`badge ${selectedSession.pei_completo ? 'completed' : ''}`}>PEI ✓</span>
                                    </div>
                                </div>
                            )}

                            {getReportText && typeof getReportText === 'function' && (
                                <p className="report-text">{getReportText()}</p>
                            )}
                        </section>
                    )}
                </div>
            </div>
        );
    }

    // 5. VISÃO CONSOLIDADA LONGITUDINAL
    if (viewMode === 'consolidado_longitudinal') {
        return (
            <ConsolidadoLongitudinal
                sessions={sessions}
                childName={childName}
                data={data}
                onBack={onBackToList}
            />
        );
    }

    // 6. VIEW PADRÃO (caso nenhuma condição seja atendida)
    return (
        <div className="default-view">
            <h1>PsicoTestes VB-MAPP</h1>
            <p>Nenhuma view ativa no momento.</p>
            <button
                className="btn btn-primary"
                onClick={onBackToList}
            >
                Voltar para Sessões
            </button>
        </div>
    );
}

// COMPONENTE INTERNO: ConsolidadoFinalView
function ConsolidadoFinalView({ session, onBack }) {
    return (
        <div className="consolidado-container">
            <style>{`
                .consolidado-container { 
                    max-width: 800px; 
                    margin: 3rem auto; 
                    padding: 3rem; 
                    background: #fff; 
                    border-radius: 16px; 
                    border: 1px solid #e2e8f0; 
                    text-align: center; 
                }
                .alert-closed { 
                    background: #f0fff4; 
                    color: #22543d; 
                    padding: 2rem; 
                    border-radius: 8px; 
                    margin-bottom: 2rem; 
                    font-weight: 600; 
                }
                .btn-exit { 
                    padding: 1rem 2rem; 
                    background: #1a202c; 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 1rem;
                    transition: background 0.3s;
                }
                .btn-exit:hover {
                    background: #2d3748;
                }
            `}</style>

            <h1>Avaliação Finalizada ✓</h1>

            <div className="alert-closed">
                <h3>Sessão Concluída</h3>
                <p>
                    A avaliação de <strong>{session.child_name || "Criança"}</strong> foi concluída
                    e os dados estão protegidos.
                </p>
                <p className="small-text">
                    A sessão agora é somente leitura para preservar a integridade dos dados.
                </p>
            </div>

            <div className="session-summary">
                <h4>Resumo da Sessão:</h4>
                <p><strong>Data:</strong> {new Date(session.date).toLocaleDateString('pt-BR')}</p>
                <p><strong>Marcos avaliados:</strong> {Object.keys(session.scores_snapshot || {}).length}</p>
                <p><strong>Lacunas identificadas:</strong> {session.lacunas?.length || 0}</p>
            </div>

            <button className="btn-exit" onClick={onBack}>
                ← Voltar para Lista de Sessões
            </button>
        </div>
    );
}