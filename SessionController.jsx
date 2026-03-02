import React, { useEffect } from 'react';
import MilestonesScreen from './MilestonesScreen';
import EcoicoSubtestScreen from './EcoicoSubtestScreen';
import SubtestesScreen from './SubtestesScreen';
import BarreirasScreen from './BarreirasScreen';
import TransicaoScreen from './TransicaoScreen';
import PEIScreen from './PEIScreen';
import PainelCrianca from './PainelCrianca';  // ✅ NOVO: Painel da Criança
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
    getHistoricoSessoes = () => [],  // ✅ NOVO: Função para buscar histórico
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

    // ✅ HELPER: Verifica se tem lacuna no domínio Ecoico
    function hasEcoicoLacuna(session) {
        if (!session?.lacunas) return false;
        const ecoicoDomains = ['DOM04', 'DOM07'];
        return session.lacunas.some(l => ecoicoDomains.includes(l.domain_id));
    }

    // DEBUG: Monitorar mudanças no estado
    useEffect(() => {
        console.log("🎮 SessionController - Estado COMPLETO:", {
            viewMode,
            selectedSessionId: selectedSession?.session_id,
            selectedSessionFlags: selectedSession ? {
                milestones_completo: selectedSession.milestones_completo,
                ecoico_completo: selectedSession.ecoico_completo,
                tarefas_completas: selectedSession.tarefas_completas,
                barreiras_completas: selectedSession.barreiras_completas,
                transicao_completa: selectedSession.transicao_completa,
                pei_completo: selectedSession.pei_completo,
                sessao_fechada: selectedSession.sessao_fechada,
                lacunasCount: selectedSession.lacunas?.length || 0,
                escoreBarreiras: selectedSession.escore_total_barreiras || 'NÃO DEFINIDO'
            } : null,
            sessionsCount: sessions.length
        });
    }, [viewMode, selectedSession, sessions.length]);

    // ═══════════════════════════════════════════════════════════════
    // 1. LISTA DE SESSÕES (TELA INICIAL)
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
                    .header-content h1 {
                        margin: 0;
                        font-size: 1.8rem;
                        color: #1e293b;
                        font-weight: 800;
                    }
                    .header-content p {
                        margin: 0.2rem 0 0;
                        color: #64748b;
                        font-size: 0.95rem;
                    }
                    .sessions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                    }
                    .session-card {
                        background: #fff;
                        border-radius: 12px;
                        padding: 1.5rem;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                        border-left: 6px solid #6366f1;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .session-card.finalizada {
                        border-left-color: #10b981;
                    }
                    .session-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(0,0,0,0.06);
                    }
                    .session-info-main h3 {
                        margin: 0 0 0.4rem 0;
                        font-size: 1.25rem;
                        color: #1e293b;
                        font-weight: 700;
                    }
                    .session-date {
                        color: #94a3b8;
                        font-size: 0.85rem;
                        font-weight: 500;
                    }
                    .session-details {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        flex: 1;
                        margin-left: 1.5rem;
                    }
                    .session-meta-stats {
                        display: flex;
                        gap: 12px;
                        align-items: center;
                    }
                    .marcos-count {
                        font-size: 0.85rem;
                        color: #64748b;
                        background: #f1f5f9;
                        padding: 4px 10px;
                        border-radius: 6px;
                    }
                    .session-progress-circles {
                        display: flex;
                        gap: 8px;
                    }
                    .progress-circle {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.75rem;
                        font-weight: 700;
                        color: white;
                        cursor: default;
                    }
                    .progress-circle.completed {
                        background: #10b981;
                    }
                    .progress-circle.pending {
                        background: #e2e8f0;
                        color: #94a3b8;
                    }
                    .session-actions {
                        display: flex;
                        gap: 12px;
                        margin-left: 1.5rem;
                    }
                    .btn-outline-indigo {
                        background: transparent;
                        border: 2px solid #6366f1;
                        color: #6366f1;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-outline-indigo:hover {
                        background: #6366f1;
                        color: white;
                    }
                    .btn-outline-purple {
                        background: transparent;
                        border: 2px solid #7c3aed;
                        color: #7c3aed;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-outline-purple:hover {
                        background: #7c3aed;
                        color: white;
                    }
                    .btn-primary-indigo {
                        background: #6366f1;
                        border: 2px solid #6366f1;
                        color: white;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-primary-indigo:hover {
                        background: #4f46e5;
                        border-color: #4f46e5;
                        transform: translateY(-1px);
                    }
                    .btn-primary-green {
                        background: #10b981;
                        border: 2px solid #10b981;
                        color: white;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-primary-green:hover {
                        background: #059669;
                        border-color: #059669;
                    }
                    .ai-pill {
                        background: #ede9fe;
                        color: #7c3aed;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 0.7rem;
                        font-weight: 700;
                    }
                    .eco-pill {
                        background: #e0f2fe;
                        color: #0369a1;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 0.7rem;
                        font-weight: 700;
                    }
                    .finalizada-pill {
                        background: #d1fae5;
                        color: #065f46;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 0.7rem;
                        font-weight: 700;
                    }
                    .empty {
                        text-align: center;
                        padding: 4rem;
                        background: #fff;
                        border-radius: 16px;
                        color: #64748b;
                        border: 2px dashed #e2e8f0;
                    }
                `}</style>

                <header className="header">
                    <div className="header-content">
                        <h1>📋 Sessões de Avaliação</h1>
                        <p>{sessions.length} sessão(ões) registrada(s)</p>
                    </div>
                    <button
                        className="btn btn-primary-indigo"
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
                            <div
                                key={session.session_id}
                                className={`session-card ${session.sessao_fechada ? 'finalizada' : ''}`}
                            >
                                <div className="session-info-main">
                                    <h3>{session.child_name || "Criança sem nome"}</h3>
                                    <span className="session-date">
                                        📅 {new Date(session.date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                <div className="session-details">
                                    <div className="session-meta-stats">
                                        <span className="marcos-count">
                                            📊 {Object.keys(session.scores_snapshot || {}).length} marcos
                                        </span>
                                        {session.ai_report && <span className="ai-pill">🤖 IA</span>}
                                        {session.ecoico_results && <span className="eco-pill">🔊 Ecoico</span>}
                                        {session.sessao_fechada && <span className="finalizada-pill">✓ Finalizada</span>}
                                    </div>

                                    <div className="session-progress-circles">
                                        <div title="Milestones" className={`progress-circle ${session.milestones_completo ? 'completed' : 'pending'}`}>M</div>
                                        {hasEcoicoLacuna(session) && (
                                            <div title="Ecoico" className={`progress-circle ${session.ecoico_completo ? 'completed' : 'pending'}`}>E</div>
                                        )}
                                        <div title="Subtestes" className={`progress-circle ${session.tarefas_completas ? 'completed' : 'pending'}`}>S</div>
                                        <div title="Barreiras" className={`progress-circle ${session.barreiras_completas ? 'completed' : 'pending'}`}>B</div>
                                        <div title="Transição" className={`progress-circle ${session.transicao_completa ? 'completed' : 'pending'}`}>T</div>
                                        <div title="PEI" className={`progress-circle ${session.pei_completo ? 'completed' : 'pending'}`}>P</div>
                                    </div>
                                </div>

                                <div className="session-actions">
                                    {/* Botão Painel da Criança (só aparece se sessão finalizada) */}
                                    {session.sessao_fechada && (
                                        <button
                                            className="btn-outline-purple"
                                            onClick={() => {
                                                console.log("🧒 Abrindo Painel da Criança:", session.session_id);
                                                setSelectedSession(session);
                                                setViewMode('painel_crianca');
                                            }}
                                        >
                                            🧒 Painel
                                        </button>
                                    )}

                                    <button
                                        className="btn-outline-indigo"
                                        onClick={() => {
                                            console.log("📊 Abrindo relatório para:", session.session_id);
                                            setSelectedSession(session);
                                            setViewMode('report');
                                        }}
                                    >
                                        📄 Relatório
                                    </button>

                                    <button
                                        className={session.sessao_fechada ? "btn-primary-green" : "btn-primary-indigo"}
                                        onClick={() => {
                                            console.log("🚀 Abrindo sessão:", session.session_id);
                                            onSelectSession(session);
                                        }}
                                    >
                                        {session.sessao_fechada
                                            ? '👁️ Ver'
                                            : session.milestones_completo
                                                ? '➡️ Continuar'
                                                : '🚀 Iniciar'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. PAINEL DA CRIANÇA (NOVO!)
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'painel_crianca' && selectedSession) {
        console.log("🧒 Exibindo Painel da Criança para:", selectedSession.child_name);

        // Buscar histórico de sessões da mesma criança
        const historicoSessoes = getHistoricoSessoes(selectedSession.child_name);

        return (
            <PainelCrianca
                crianca={{
                    nome: selectedSession.child_name,
                    idade: selectedSession.child_age
                }}
                sessaoAtual={selectedSession}
                historicoSessoes={historicoSessoes}
                onGerarRelatorio={(tipo) => {
                    console.log("📄 Gerando relatório:", tipo);
                    // TODO: Implementar geração de relatório por tipo
                    setViewMode('report');
                }}
                onGerarPEI={() => {
                    console.log("📝 Abrindo PEI");
                    setViewMode('evaluation');
                }}
                onVoltar={onBackToList}
            />
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. MODO TESTE (DRAFT) - Mantido para compatibilidade
    // ═══════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════
    // 4. FLUXO DE AVALIAÇÃO SEQUENCIAL (A LÓGICA MESTRE)
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'evaluation' && selectedSession) {
        console.log("🎯 Modo avaliação ativo para sessão:", selectedSession.session_id);
        console.log("📋 FLAGS DA SESSÃO:", {
            milestones_completo: selectedSession.milestones_completo,
            ecoico_completo: selectedSession.ecoico_completo,
            tarefas_completas: selectedSession.tarefas_completas,
            barreiras_completas: selectedSession.barreiras_completas,
            transicao_completa: selectedSession.transicao_completa,
            pei_completo: selectedSession.pei_completo
        });

        const isReadOnly = !!selectedSession.sessao_fechada;

        // ✅ SESSÃO FINALIZADA → PAINEL DA CRIANÇA
        if (selectedSession.sessao_fechada) {
            console.log("🏁 Sessão finalizada, redirecionando para Painel da Criança");

            const historicoSessoes = getHistoricoSessoes(selectedSession.child_name);

            return (
                <PainelCrianca
                    crianca={{
                        nome: selectedSession.child_name,
                        idade: selectedSession.child_age
                    }}
                    sessaoAtual={selectedSession}
                    historicoSessoes={historicoSessoes}
                    onGerarRelatorio={(tipo) => {
                        console.log("📄 Gerando relatório:", tipo);
                        setViewMode('report');
                    }}
                    onGerarPEI={() => {
                        console.log("📝 Visualizando PEI (readonly)");
                        // Mostra PEI em modo somente leitura
                    }}
                    onVoltar={onBackToList}
                />
            );
        }

        // TELA 1: Milestones
        if (!selectedSession.milestones_completo) {
            console.log("📊 DECISÃO: Indo para MilestonesScreen (milestones_completo = false)");
            return (
                <MilestonesScreen
                    data={data}
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        console.log("✅ MilestonesScreen finalizando:", payload);
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
                    key={selectedSession.session_id}
                />
            );
        }

        // TELA 1.5: Subteste Ecoico (CONDICIONAL)
        const needsEcoico = hasEcoicoLacuna(selectedSession);
        if (needsEcoico && !selectedSession.ecoico_completo) {
            console.log("🔊 DECISÃO: Indo para EcoicoSubtestScreen (lacuna detectada, ecoico_completo = false)");
            return (
                <EcoicoSubtestScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        console.log("✅ EcoicoSubtestScreen finalizado:", payload);
                        onUpdateSession({
                            ecoico_results: payload.ecoico_results,
                            ecoico_summary: payload.summary,
                            ecoico_completo: true
                        });
                    }}
                    onBack={() => {
                        if (window.confirm("Deseja pular o Subteste Ecoico? Você pode aplicá-lo depois.")) {
                            onUpdateSession({ ecoico_completo: true, ecoico_skipped: true });
                        }
                    }}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 2: Subtestes (Tarefas)
        if (!selectedSession.tarefas_completas) {
            console.log("🧪 DECISÃO: Indo para SubtestesScreen (tarefas_completas = false)");
            return (
                <SubtestesScreen
                    key={`subtestes-${selectedSession.session_id}-${selectedSession.active_level || '1'}`}
                    data={data}
                    audience={audience}
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
            console.log("🚧 DECISÃO: Indo para BarreirasScreen (barreiras_completas = false)");
            return (
                <BarreirasScreen
                    sessionInfo={selectedSession}
                    onFinalize={(payload) => {
                        console.log("✅ BarreirasScreen finalizada!");
                        console.log("📦 Payload recebido:", payload);

                        const updateData = {
                            ...payload,
                            barreiras_completas: true
                        };
                        console.log("📤 Enviando para onUpdateSession:", updateData);

                        onUpdateSession(updateData);
                    }}
                    onBack={onBackToList}
                    isReadOnly={isReadOnly}
                />
            );
        }

        // TELA 4: Transição
        if (!selectedSession.transicao_completa) {
            console.log("🔄 DECISÃO: Indo para TransicaoScreen (transicao_completa = false)");
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

        // TELA 5: PEI → Depois vai para Painel da Criança
        console.log("📝 DECISÃO: Indo para PEIScreen (todas as etapas anteriores completas)");
        return (
            <PEIScreen
                sessionInfo={selectedSession}
                onFinalize={(payload) => {
                    console.log("✅ PEIScreen finalizada, payload:", payload);
                    console.log("🧒 Avaliação completa! Indo para Painel da Criança...");

                    onUpdateSession({
                        ...payload,
                        pei_completo: true,
                        sessao_fechada: true
                    });

                    // Após finalizar, vai automaticamente para o Painel da Criança
                    // porque sessao_fechada = true
                }}
                onBack={onBackToList}
                isReadOnly={isReadOnly}
            />
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. RELATÓRIO
    // ═══════════════════════════════════════════════════════════════
    if (viewMode === 'report' && selectedSession) {
        return (
            <div className="report-view">
                <style>{`
                    .report-view {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 2rem;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 2rem;
                        padding: 1rem;
                        background: #fff;
                        border-radius: 12px;
                    }
                    .header-actions {
                        display: flex;
                        gap: 10px;
                    }
                    .btn {
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-secondary {
                        background: #f1f5f9;
                        border: none;
                        color: #475569;
                    }
                    .btn-primary {
                        background: #6366f1;
                        border: none;
                        color: white;
                    }
                    .btn-purple {
                        background: #7c3aed;
                        border: none;
                        color: white;
                    }
                    .report-content {
                        background: #fff;
                        border-radius: 12px;
                        padding: 2rem;
                    }
                `}</style>

                <header className="header no-print">
                    <h1>📄 Relatório VB-MAPP</h1>
                    <div className="header-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={onBackToList}
                        >
                            ← Voltar
                        </button>
                        {selectedSession.sessao_fechada && (
                            <button
                                className="btn btn-purple"
                                onClick={() => setViewMode('painel_crianca')}
                            >
                                🧒 Painel da Criança
                            </button>
                        )}
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
                                lacunas: selectedSession.lacunas,
                                ecoico_results: selectedSession.ecoico_results,
                                ecoico_summary: selectedSession.ecoico_summary
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
                                {selectedSession.ecoico_summary && (
                                    <p><strong>Ecoico:</strong> {selectedSession.ecoico_summary.text}</p>
                                )}
                            </div>

                            {selectedSession.milestones_completo && (
                                <div className="completion-status">
                                    <h3>Progresso da Avaliação</h3>
                                    <div className="progress-badges">
                                        <span className={`badge ${selectedSession.milestones_completo ? 'completed' : ''}`}>Milestones ✓</span>
                                        {hasEcoicoLacuna(selectedSession) && (
                                            <span className={`badge ${selectedSession.ecoico_completo ? 'completed' : ''}`}>Ecoico ✓</span>
                                        )}
                                        <span className={`badge ${selectedSession.tarefas_completas ? 'completed' : ''}`}>Subtestes ✓</span>
                                        <span className={`badge ${selectedSession.barreiras_completas ? 'completed' : ''}`}>Barreiras ✓</span>
                                        <span className={`badge ${selectedSession.transicao_completa ? 'completed' : ''}`}>Transição ✓</span>
                                        <span className={`badge ${selectedSession.pei_completo ? 'completed' : ''}`}>PEI ✓</span>
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
    // 6. VISÃO CONSOLIDADA LONGITUDINAL
    // ═══════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════
    // 7. VIEW PADRÃO
    // ═══════════════════════════════════════════════════════════════
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