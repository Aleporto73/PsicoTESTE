import React, { useMemo } from 'react';

/**
 * COMPONENTE: ConsolidadoLongitudinal
 * Exibe a comparação temporal (V1-V4) das avaliações de uma mesma criança.
 */
export default function ConsolidadoLongitudinal({ sessions, childName, data, onBack }) {
    // 1. Filtrar e Ordernar Sessões da Criança
    const childSessions = useMemo(() => {
        return sessions
            .filter(s => s.child_name === childName && s.milestones_completo)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 4); // Limitar a V1-V4 como solicitado
    }, [sessions, childName]);

    // 2. Mapeamento de Pontuação para Cálculos
    const mapScoreValue = (status) => {
        if (status === 'dominado') return 1;
        if (status === 'emergente') return 0.5;
        return 0;
    };

    // 3. Processar Dados Longitudinalmente
    const longitudinalData = useMemo(() => {
        return childSessions.map((session, index) => {
            const scores = session.scores_snapshot || {};
            const values = Object.values(scores);
            const avaliados = values.filter(v => v !== 'nao_avaliado');

            const dominados = avaliados.filter(v => v === 'dominado').length;
            const emergentes = avaliados.filter(v => v === 'emergente').length;
            const scoreTotal = avaliados.reduce((acc, v) => acc + mapScoreValue(v), 0);
            const percentTotal = avaliados.length > 0
                ? ((scoreTotal / avaliados.length) * 100).toFixed(1)
                : '0.0';

            // Dados por Domínio
            const byDomain = data.domains.map(domain => {
                const dScores = domain.blocks
                    .map(b => scores[b.block_id])
                    .filter(v => v && v !== 'nao_avaliado');
                const dTotal = dScores.reduce((acc, v) => acc + mapScoreValue(v), 0);
                return {
                    id: domain.domain_id,
                    name: domain.domain_name,
                    percent: dScores.length > 0
                        ? ((dTotal / dScores.length) * 100).toFixed(1)
                        : '0.0'
                };
            });

            return {
                version: `V${index + 1}`,
                date: new Date(session.date).toLocaleDateString('pt-BR'),
                percentTotal,
                scoreTotal,
                dominados,
                emergentes,
                byDomain
            };
        });
    }, [childSessions, data]);

    // 4. Determinar Tendência
    const getTrend = (currentIndex) => {
        if (currentIndex === 0) return { label: 'Início', color: '#64748b' };

        const current = parseFloat(longitudinalData[currentIndex].percentTotal);
        const previous = parseFloat(longitudinalData[currentIndex - 1].percentTotal);
        const diff = current - previous;

        if (diff > 2) return { label: 'Evolução', color: '#10b981', icon: '↗️' };
        if (diff < -2) return { label: 'Regressão Pontual', color: '#ef4444', icon: '↘️' };
        return { label: 'Estável', color: '#3b82f6', icon: '→' };
    };

    if (childSessions.length === 0) {
        return (
            <div className="longitudinal-empty">
                <p>Nenhuma sessão finalizada encontrada para {childName}.</p>
                <button className="btn" onClick={onBack}>Voltar</button>
            </div>
        );
    }

    return (
        <div className="longitudinal-container">
            <style>{getStyles()}</style>

            <header className="longitudinal-header">
                <div>
                    <h1>Relatório Longitudinal — VB-MAPP</h1>
                    <p>Histórico de Acompanhamento: <strong>{childName}</strong></p>
                </div>
                <button className="btn btn-secondary" onClick={onBack}>← Voltar</button>
            </header>

            {/* 1. VISÃO GERAL (GRÁFICO PROGRESSO TOTAL) */}
            <section className="long-section">
                <h2>📈 Evolução Geral de Marcos (%)</h2>
                <div className="summary-chart-container">
                    {longitudinalData.map((v, i) => (
                        <div key={v.version} className="summary-chart-bar-wrap">
                            <div className="bar-label">{v.version}</div>
                            <div className="bar-track">
                                <div
                                    className="bar-fill"
                                    style={{ height: `${v.percentTotal}%` }}
                                >
                                    <span className="bar-value">{v.percentTotal}%</span>
                                </div>
                            </div>
                            <div className="bar-date">{v.date}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. CONSOLIDADO POR DOMÍNIO */}
            <section className="long-section">
                <h2>📊 Comparativo por Domínio</h2>
                <div className="domain-comparison-grid">
                    {data.domains.map(domain => {
                        return (
                            <div key={domain.domain_id} className="domain-long-card">
                                <h3>{domain.domain_name}</h3>
                                <div className="domain-bars">
                                    {longitudinalData.map(v => {
                                        const dData = v.byDomain.find(d => d.id === domain.domain_id);
                                        return (
                                            <div key={v.version} className="mini-bar-wrap" title={`${v.version}: ${dData.percent}%`}>
                                                <div className="mini-bar-fill" style={{ width: `${dData.percent}%` }}></div>
                                                <span className="mini-bar-label">{v.version}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 3. LINHA DO TEMPO E TENDÊNCIAS */}
            <section className="long-section">
                <h2>🕒 Linha do Tempo e Tendências</h2>
                <div className="timeline-table">
                    <div className="timeline-header">
                        <span>Versão</span>
                        <span>Data</span>
                        <span>Progresso Total</span>
                        <span>Indicador</span>
                    </div>
                    {longitudinalData.map((v, i) => {
                        const trend = getTrend(i);
                        return (
                            <div key={v.version} className="timeline-row">
                                <span className="v-tag">{v.version}</span>
                                <span>{v.date}</span>
                                <span className="p-val">{v.percentTotal}%</span>
                                <span className="t-status" style={{ color: trend.color }}>
                                    {trend.icon} {trend.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 4. EVOLUÇÃO DE MARCOS INDIVIDUAIS (MAPA DE CALOR) */}
            <section className="long-section">
                <h2>🔘 Detalhamento de Marcos (V1 → V4)</h2>
                <div className="milestone-evolution-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Marcos (ID)</th>
                                {longitudinalData.map(v => <th key={v.version}>{v.version}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.domains.map(domain => (
                                <React.Fragment key={domain.domain_id}>
                                    <tr className="domain-separator">
                                        <td colSpan={longitudinalData.length + 1}>{domain.domain_name}</td>
                                    </tr>
                                    {domain.blocks.map(block => (
                                        <tr key={block.block_id}>
                                            <td className="m-id">{block.block_id}</td>
                                            {childSessions.map(session => {
                                                const score = session.scores_snapshot[block.block_id];
                                                const statusClass = score === 'dominado' ? 'cell-full' : (score === 'emergente' ? 'cell-half' : 'cell-empty');
                                                return (
                                                    <td key={session.session_id} className={`m-cell ${statusClass}`}>
                                                        <div className="indicator-dot"></div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function getStyles() {
    return `
        .longitudinal-container { max-width: 1400px; margin: 0 auto; color: #1e293b; padding: 2rem 1rem; }
        .longitudinal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; background: #fff; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .longitudinal-header h1 { font-size: 1.75rem; color: #0f172a; margin-bottom: 0.25rem; }
        .longitudinal-header p { color: #64748b; font-size: 1.1rem; }

        .long-section { background: #fff; border-radius: 16px; padding: 2.5rem; margin-bottom: 2.5rem; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .long-section h2 { font-size: 1.4rem; color: #1e293b; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; border-left: 5px solid #3b82f6; padding-left: 1rem; }

        /* Summary Chart */
        .summary-chart-container { display: flex; gap: 4rem; justify-content: center; height: 350px; align-items: flex-end; padding: 2rem; background: #f8fafc; border-radius: 12px; }
        .summary-chart-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; height: 100%; }
        .bar-label { font-weight: 800; color: #3b82f6; font-size: 1.2rem; }
        .bar-track { width: 80px; height: 100%; background: #e2e8f0; border-radius: 12px; display: flex; align-items: flex-end; overflow: hidden; }
        .bar-fill { width: 100%; background: linear-gradient(to top, #3b82f6, #60a5fa); transition: height 1s ease-out; position: relative; }
        .bar-value { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); font-weight: 800; font-size: 0.875rem; color: #1e293b; width: 60px; text-align: center; }
        .bar-date { color: #94a3b8; font-size: 0.875rem; font-weight: 500; }

        /* Domain Comparison */
        .domain-comparison-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .domain-long-card { padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
        .domain-long-card h3 { font-size: 1rem; color: #334155; margin-bottom: 1.25rem; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem; }
        .domain-bars { display: flex; flex-direction: column; gap: 0.75rem; }
        .mini-bar-wrap { position: relative; height: 24px; background: #e2e8f0; border-radius: 6px; overflow: hidden; display: flex; align-items: center; }
        .mini-bar-fill { height: 100%; background: #3b82f6; border-radius: 6px; transition: width 0.8s; }
        .mini-bar-label { position: absolute; left: 0.5rem; font-size: 0.8125rem; font-weight: 800; color: #1e293b; background: rgba(255,255,255,0.6); padding: 0 4px; border-radius: 4px; }

        /* Timeline Table */
        .timeline-table { display: flex; flex-direction: column; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .timeline-header { display: grid; grid-template-columns: 1fr 2fr 2fr 2fr; padding: 1.25rem; background: #f8fafc; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
        .timeline-row { display: grid; grid-template-columns: 1fr 2fr 2fr 2fr; padding: 1.25rem; align-items: center; border-bottom: 1px solid #f1f5f9; }
        .v-tag { background: #3b82f6; color: white; width: fit-content; padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 800; font-size: 0.875rem; }
        .p-val { font-weight: 700; color: #0f172a; }
        .t-status { font-weight: 700; font-size: 0.875rem; }

        /* Individual Milestone Evolution */
        .milestone-evolution-table { overflow-x: auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 1rem; background: #f8fafc; text-align: left; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
        td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; }
        .domain-separator { background: #eff6ff; }
        .domain-separator td { font-weight: 800; color: #1d4ed8; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .m-id { font-family: monospace; font-weight: 600; color: #64748b; font-size: 0.875rem; }
        .m-cell { text-align: center; }
        .indicator-dot { width: 16px; height: 16px; border-radius: 50%; display: inline-block; background: #e2e8f0; border: 2px solid transparent; }
        .cell-full .indicator-dot { background: #10b981; box-shadow: 0 0 5px rgba(16, 185, 129, 0.4); }
        .cell-half .indicator-dot { background: #f59e0b; box-shadow: 0 0 5px rgba(245, 158, 11, 0.4); }
        .cell-empty .indicator-dot { background: #cbd5e1; }

        @media (max-width: 768px) {
            .summary-chart-container { gap: 1rem; height: 250px; }
            .bar-track { width: 50px; }
            .domain-comparison-grid { grid-template-columns: 1fr; }
        }
    `;
}
