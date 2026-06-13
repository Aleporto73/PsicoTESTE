import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const PDFReportV3 = ({
    child,
    session,
    domains,
    includeGraphs = true,
    includePEI = false,
    reportMode = 'complete',
    allSessions = [] // Para gráfico de evolução temporal
}) => {
    const chartEvolutionRef = useRef(null);
    const chartDomainRef = useRef(null);
    const chartHeatmapRef = useRef(null);

    const chartEvolutionInstance = useRef(null);
    const chartDomainInstance = useRef(null);
    const chartHeatmapInstance = useRef(null);

    // Calcular estatísticas gerais
    const calculateStats = () => {
        let totalApplied = 0;
        let totalAchieved = 0;

        domains.forEach(domain => {
            domain.blocks.forEach(block => {
                if (session.scores[block.block_id]) {
                    totalApplied++;
                    if (session.scores[block.block_id] === 'dominado') {
                        totalAchieved++;
                    }
                }
            });
        });

        const percentage = totalApplied > 0 ? Math.round((totalAchieved / totalApplied) * 100) : 0;

        return { totalApplied, totalAchieved, percentage };
    };

    // Calcular estatísticas por domínio
    const calculateDomainStats = () => {
        return domains.map(domain => {
            let applied = 0;
            let achieved = 0;

            domain.blocks.forEach(block => {
                if (session.scores[block.block_id]) {
                    applied++;
                    if (session.scores[block.block_id] === 'dominado') {
                        achieved++;
                    }
                }
            });

            const percentage = applied > 0 ? Math.round((achieved / applied) * 100) : 0;

            return {
                domain_id: domain.domain_id,
                name: domain.domain_name,
                applied,
                achieved,
                percentage
            };
        }).filter(d => d.applied > 0) // Só domínios com marcos aplicados
            .sort((a, b) => a.percentage - b.percentage); // Ordem crescente (prioridade)
    };

    // Calcular evolução temporal
    const calculateEvolution = () => {
        if (!allSessions || allSessions.length === 0) return null;

        return allSessions.map(sess => {
            let applied = 0;
            let achieved = 0;

            domains.forEach(domain => {
                domain.blocks.forEach(block => {
                    if (sess.scores[block.block_id]) {
                        applied++;
                        if (sess.scores[block.block_id] === 'dominado') {
                            achieved++;
                        }
                    }
                });
            });

            return {
                date: new Date(sess.date).toLocaleDateString('pt-BR'),
                percentage: applied > 0 ? Math.round((achieved / applied) * 100) : 0
            };
        });
    };

    // Gerar PEI Automático
    const generateAutomaticPEI = () => {
        const domainStats = calculateDomainStats();

        // Selecionar domínios prioritários (< 75%)
        const priorityDomains = domainStats
            .filter(d => d.percentage < 75)
            .slice(0, 3); // Máx 3 domínios

        if (priorityDomains.length === 0) {
            return {
                message: "Desempenho geral acima de 75% em todos os domínios aplicados. Considere avaliação de novos marcos ou manutenção dos já dominados."
            };
        }

        // Para cada domínio prioritário, pegar até 3 marcos não dominados
        const objectives = priorityDomains.map(domainStat => {
            const domain = domains.find(d => d.domain_id === domainStat.domain_id);

            const nonMasteredBlocks = domain.blocks
                .filter(block => {
                    const score = session.scores[block.block_id];
                    return score && score !== 'dominado';
                })
                .slice(0, 3); // Máx 3 marcos por domínio

            return {
                domain_name: domain.domain_name,
                percentage: domainStat.percentage,
                blocks: nonMasteredBlocks.map(block => ({
                    block_id: block.block_id,
                    texto: block.texto_profissional
                }))
            };
        });

        return { objectives };
    };

    const stats = calculateStats();
    const domainStats = calculateDomainStats();
    const evolutionData = calculateEvolution();
    const peiData = includePEI ? generateAutomaticPEI() : null;

    // Gráfico A - Evolução Temporal
    useEffect(() => {
        if (!includeGraphs || !evolutionData || evolutionData.length < 2) return;

        if (chartEvolutionInstance.current) {
            chartEvolutionInstance.current.destroy();
        }

        if (evolutionData.length === 1) {
            // Apenas 1 sessão - não criar gráfico
            return;
        }

        const ctx = chartEvolutionRef.current?.getContext('2d');
        if (!ctx) return;

        chartEvolutionInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: evolutionData.map(d => d.date),
                datasets: [{
                    label: 'Desempenho Geral (%)',
                    data: evolutionData.map(d => d.percentage),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Evolução do Desempenho ao Longo das Sessões',
                        font: { size: 14, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });

        return () => {
            if (chartEvolutionInstance.current) {
                chartEvolutionInstance.current.destroy();
            }
        };
    }, [includeGraphs, evolutionData]);

    // Gráfico B - Distribuição por Domínio
    useEffect(() => {
        if (!includeGraphs || domainStats.length === 0) return;

        if (chartDomainInstance.current) {
            chartDomainInstance.current.destroy();
        }

        const ctx = chartDomainRef.current?.getContext('2d');
        if (!ctx) return;

        chartDomainInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: domainStats.map(d => d.name),
                datasets: [{
                    label: 'Desempenho por Domínio',
                    data: domainStats.map(d => d.percentage),
                    backgroundColor: domainStats.map(d => {
                        if (d.percentage < 50) return '#f56565'; // Vermelho (prioridade)
                        if (d.percentage < 75) return '#ed8936'; // Laranja (consolidação)
                        return '#48bb78'; // Verde (manutenção)
                    })
                }]
            },
            options: {
                indexAxis: 'y', // Barras horizontais
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Distribuição do Desempenho por Domínio',
                        font: { size: 14, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const stat = domainStats[context.dataIndex];
                                return `${context.parsed.x}% (${stat.achieved}/${stat.applied} marcos)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });

        return () => {
            if (chartDomainInstance.current) {
                chartDomainInstance.current.destroy();
            }
        };
    }, [includeGraphs, domainStats]);

    return (
        <div className="pdf-report-v3" style={{
            maxWidth: '210mm',
            margin: '0 auto',
            padding: '20mm',
            fontFamily: 'Georgia, serif',
            backgroundColor: 'white',
            minHeight: '297mm'
        }}>
            {/* Cabeçalho */}
            <div style={{
                borderBottom: '3px solid #667eea',
                paddingBottom: '20px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    flexShrink: 0
                }}>
                    {child.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '28px',
                        color: '#2d3748',
                        fontWeight: 'bold'
                    }}>
                        Relatório de Avaliação VB-MAPP
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: '#718096', fontSize: '16px' }}>
                        {child.name} • {new Date(session.date).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </div>

            {/* Micro-legenda 1 */}
            <div style={{
                backgroundColor: '#f7fafc',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                borderLeft: '4px solid #667eea'
            }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#4a5568', lineHeight: '1.6' }}>
                    <strong>Nota:</strong> Este relatório apresenta uma leitura funcional do desempenho observado durante a sessão de avaliação, não representando diagnóstico clínico.
                </p>
            </div>

            {/* Visão Geral com Cards */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                    fontSize: '20px',
                    color: '#2d3748',
                    marginBottom: '16px',
                    fontWeight: 'bold'
                }}>
                    Visão Geral da Sessão
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#f7fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '2px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                            {stats.percentage}%
                        </div>
                        <div style={{ fontSize: '14px', color: '#718096' }}>
                            Desempenho Geral
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#f7fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '2px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#48bb78', marginBottom: '8px' }}>
                            {stats.totalAchieved}
                        </div>
                        <div style={{ fontSize: '14px', color: '#718096' }}>
                            Marcos Dominados
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#f7fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '2px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4299e1', marginBottom: '8px' }}>
                            {stats.totalApplied}
                        </div>
                        <div style={{ fontSize: '14px', color: '#718096' }}>
                            Marcos Aplicados
                        </div>
                    </div>
                </div>
            </div>

            {/* Micro-legenda 2 */}
            <div style={{
                backgroundColor: '#fffaf0',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                borderLeft: '4px solid #ed8936'
            }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#744210', lineHeight: '1.6' }}>
                    Os percentuais apresentados refletem apenas os marcos aplicados na sessão atual, não o repertório total da criança.
                </p>
            </div>

            {/* Gráfico A - Evolução Temporal */}
            {includeGraphs && evolutionData && evolutionData.length > 1 && (
                <div style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
                    <canvas ref={chartEvolutionRef} style={{ maxHeight: '300px' }}></canvas>
                    <div style={{
                        backgroundColor: '#f7fafc',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginTop: '12px',
                        borderLeft: '4px solid #667eea'
                    }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#4a5568', lineHeight: '1.6' }}>
                            <strong>Sobre o gráfico:</strong> Representa a evolução do percentual de marcos dominados em relação aos marcos aplicados em cada sessão. Caráter orientativo para acompanhamento longitudinal.
                        </p>
                    </div>
                </div>
            )}

            {includeGraphs && evolutionData && evolutionData.length === 1 && (
                <div style={{
                    backgroundColor: '#edf2f7',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '32px',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>
                        📊 Gráfico de evolução disponível a partir da segunda sessão de avaliação.
                    </p>
                </div>
            )}

            {/* Gráfico B - Distribuição por Domínio */}
            {includeGraphs && domainStats.length > 0 && (
                <div style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
                    <canvas ref={chartDomainRef} style={{ maxHeight: '400px' }}></canvas>
                    <div style={{
                        backgroundColor: '#f7fafc',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginTop: '12px',
                        borderLeft: '4px solid #667eea'
                    }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#4a5568', lineHeight: '1.6' }}>
                            <strong>Interpretação:</strong> Domínios com menor percentual (vermelho/laranja) indicam áreas prioritárias para intervenção. Verde indica consolidação.
                        </p>
                    </div>
                </div>
            )}

            {/* Detalhamento por Domínio (Modo Completo) */}
            {reportMode === 'complete' && (
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        color: '#2d3748',
                        marginBottom: '20px',
                        fontWeight: 'bold',
                        pageBreakBefore: 'always'
                    }}>
                        Detalhamento por Domínio
                    </h2>

                    {domains.map(domain => {
                        const appliedBlocks = domain.blocks.filter(b => session.scores[b.block_id]);
                        if (appliedBlocks.length === 0) return null;

                        return (
                            <div key={domain.domain_id} style={{
                                marginBottom: '28px',
                                pageBreakInside: 'avoid'
                            }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    color: '#667eea',
                                    marginBottom: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {domain.domain_name}
                                </h3>

                                <div style={{
                                    display: 'grid',
                                    gap: '8px'
                                }}>
                                    {appliedBlocks.map(block => {
                                        const score = session.scores[block.block_id];
                                        const bgColor = score === 'dominado' ? '#c6f6d5' :
                                            score === 'emergente' ? '#feebc8' : '#fed7d7';
                                        const textColor = score === 'dominado' ? '#22543d' :
                                            score === 'emergente' ? '#744210' : '#742a2a';

                                        return (
                                            <div key={block.block_id} style={{
                                                backgroundColor: bgColor,
                                                padding: '10px 14px',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                color: textColor,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ flex: 1 }}>
                                                    <strong>{block.block_id}</strong> - {block.texto_profissional}
                                                </span>
                                                <span style={{
                                                    marginLeft: '12px',
                                                    fontWeight: 'bold',
                                                    textTransform: 'capitalize',
                                                    fontSize: '12px'
                                                }}>
                                                    {score}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* PEI Automático */}
            {includePEI && peiData && (
                <div style={{
                    marginBottom: '32px',
                    pageBreakBefore: 'always'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        color: '#2d3748',
                        marginBottom: '16px',
                        fontWeight: 'bold'
                    }}>
                        Sugestões para Plano Educacional Individualizado (PEI)
                    </h2>

                    {/* Micro-legenda 3 */}
                    <div style={{
                        backgroundColor: '#fffaf0',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        borderLeft: '4px solid #ed8936'
                    }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#744210', lineHeight: '1.6' }}>
                            <strong>Importante:</strong> As sugestões abaixo possuem caráter orientativo e não substituem a análise clínica individualizada do profissional responsável.
                        </p>
                    </div>

                    {peiData.message ? (
                        <div style={{
                            backgroundColor: '#c6f6d5',
                            padding: '20px',
                            borderRadius: '12px',
                            color: '#22543d'
                        }}>
                            <p style={{ margin: 0, fontSize: '14px' }}>
                                ✅ {peiData.message}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {peiData.objectives.map((obj, idx) => (
                                <div key={idx} style={{
                                    backgroundColor: '#f7fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '16px',
                                    border: '2px solid #e2e8f0'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px'
                                    }}>
                                        <h3 style={{
                                            fontSize: '16px',
                                            color: '#2d3748',
                                            margin: 0,
                                            fontWeight: 'bold'
                                        }}>
                                            {obj.domain_name}
                                        </h3>
                                        <span style={{
                                            backgroundColor: obj.percentage < 50 ? '#fed7d7' : '#feebc8',
                                            color: obj.percentage < 50 ? '#742a2a' : '#744210',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: 'bold'
                                        }}>
                                            {obj.percentage}% dominado
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.8' }}>
                                        <p style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                                            Objetivos prioritários:
                                        </p>
                                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                            {obj.blocks.map(block => (
                                                <li key={block.block_id} style={{ marginBottom: '8px' }}>
                                                    <strong>{block.block_id}</strong>: {block.texto}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Micro-legenda 4 */}
                    <div style={{
                        backgroundColor: '#f7fafc',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginTop: '20px',
                        borderLeft: '4px solid #667eea'
                    }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#4a5568', lineHeight: '1.6' }}>
                            A seleção automática priorizou domínios com desempenho inferior a 75% e marcos ainda não dominados, seguindo ordem sequencial do protocolo VB-MAPP.
                        </p>
                    </div>
                </div>
            )}

            {/* Avaliação de Barreiras */}
            {session.barreiras && session.barreiras.length > 0 && (
                <div style={{ marginBottom: '32px', pageBreakBefore: 'always' }}>
                    <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '16px', fontWeight: 'bold' }}>
                        Avaliação de Barreiras
                    </h2>
                    <div style={{ backgroundColor: '#fffaf0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ed8936', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#744210' }}>
                            <strong>Resumo Geral:</strong> {session.barreiras.filter(b => b.pontuacao >= 3).length} barreiras críticas identificadas (pontuação ≥ 3).
                        </p>
                    </div>
                    {session.barreiras.filter(b => b.pontuacao >= 3).map((barreira, idx) => (
                        <div key={idx} style={{ backgroundColor: '#fefefe', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', pageBreakInside: 'avoid' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '15px' }}>
                                    {barreira.nome || barreira.categoria || barreira.label || barreira.title || "Barreira não identificada"}
                                </span>
                                <span style={{ backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                                    Pontuação: {barreira.pontuacao}
                                </span>
                            </div>
                            {barreira.observacao && (
                                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#4a5568', fontStyle: 'italic' }}>
                                    Obs: {barreira.observacao}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Avaliação de Transição */}
            {session.transicao && (
                <div style={{ marginBottom: '32px', pageBreakBefore: 'always' }}>
                    <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '16px', fontWeight: 'bold' }}>
                        Avaliação de Transição
                    </h2>
                    <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '2px solid #bbf7d0', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', color: '#065f46', margin: 0, fontWeight: 'bold' }}>Escore Total de Transição</h3>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#047857' }}>
                                {session.transicao.escores?.totalGeral || session.transicao.escoreTotal || session.transicao.total || 0}
                            </span>
                        </div>
                    </div>
                    
                    {session.transicao.escores?.categorias && (
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', color: '#2d3748', marginBottom: '12px', fontWeight: 'bold' }}>Escores por Categoria</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                {Object.values(session.transicao.escores.categorias).map((cat, idx) => (
                                    <div key={idx} style={{ backgroundColor: '#fefefe', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '14px' }}>
                                            Categoria {cat.numero || (idx + 1)}
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#4a5568' }}>{cat.nome || 'Categoria de Transição'}</span>
                                        <span style={{ color: '#047857', fontSize: '16px', fontWeight: 'bold' }}>
                                            Total: {cat.total}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {session.transicao.valoresAutomaticos && Object.keys(session.transicao.valoresAutomaticos).filter(k => k.startsWith('item_') && parseInt(k.replace('item_', '')) <= 5).length > 0 && (
                        <div style={{ backgroundColor: '#fefefe', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', pageBreakInside: 'avoid' }}>
                            <h3 style={{ fontSize: '15px', color: '#2d3748', marginBottom: '12px', fontWeight: 'bold' }}>Itens Automáticos (1-5)</h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>
                                {Object.entries(session.transicao.valoresAutomaticos).filter(([k,v]) => k.startsWith('item_') && parseInt(k.replace('item_', '')) <= 5).map(([k, v]) => (
                                    <li key={k}><strong>{k}</strong>: {v} pontos</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {session.transicao.avaliacoes && Object.keys(session.transicao.avaliacoes).filter(k => k.startsWith('item_') && parseInt(k.replace('item_', '')) >= 6).length > 0 && (
                        <div style={{ backgroundColor: '#fefefe', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', pageBreakInside: 'avoid' }}>
                            <h3 style={{ fontSize: '15px', color: '#2d3748', marginBottom: '12px', fontWeight: 'bold' }}>Itens Manuais (6-18)</h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>
                                {Object.entries(session.transicao.avaliacoes).filter(([k,v]) => k.startsWith('item_') && parseInt(k.replace('item_', '')) >= 6).map(([k, v]) => (
                                    <li key={k}><strong>{k}</strong>: {v.pontuacao !== undefined ? v.pontuacao : v} pontos</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Subteste Ecoico (condicional — só renderiza se houver resumo) */}
            {session.ecoico_summary && (() => {
                const eco = session.ecoico_summary;
                const interpretText = eco.text || 'Resumo interpretativo não disponível.';
                const totalPoints = eco.total_points ?? '—';
                const milestone = eco.milestone || '—';
                const recommendation = eco.recommendation || '';

                return (
                    <div style={{ marginBottom: '32px', pageBreakBefore: 'always' }}>
                        <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '16px', fontWeight: 'bold' }}>
                            Subteste Ecoico
                        </h2>

                        {/* Resumo interpretativo */}
                        <div style={{ backgroundColor: '#f7fafc', padding: '20px', borderRadius: '12px', border: '2px solid #e2e8f0', marginBottom: '16px' }}>
                            <p style={{ margin: 0, fontSize: '15px', color: '#2d3748', lineHeight: '1.6' }}>
                                {interpretText}
                            </p>
                        </div>

                        {/* Cards: pontuação total e marco estimado */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ backgroundColor: '#f7fafc', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #e2e8f0' }}>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                                    {totalPoints}
                                </div>
                                <div style={{ fontSize: '14px', color: '#718096' }}>
                                    Pontuação Total
                                </div>
                            </div>
                            <div style={{ backgroundColor: '#f7fafc', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #e2e8f0' }}>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#48bb78', marginBottom: '8px' }}>
                                    {milestone}
                                </div>
                                <div style={{ fontSize: '14px', color: '#718096' }}>
                                    Marco Estimado
                                </div>
                            </div>
                        </div>

                        {/* Recomendação (só se existir) */}
                        {recommendation && (
                            <div style={{ backgroundColor: '#fffaf0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ed8936', marginBottom: '16px' }}>
                                <p style={{ margin: 0, fontSize: '14px', color: '#744210', lineHeight: '1.6' }}>
                                    <strong>Recomendação:</strong> {recommendation}
                                </p>
                            </div>
                        )}

                        {/* Nota orientativa */}
                        <div style={{ backgroundColor: '#f7fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: '#4a5568', lineHeight: '1.6' }}>
                                <strong>Sobre o subteste:</strong> O Ecoico é avaliado como subteste complementar de repetição verbal funcional, com caráter orientativo e sem compor o percentual geral de marcos.
                            </p>
                        </div>
                    </div>
                );
            })()}

            {/* Resultados MDF-BR / IDF-BR se existirem */}
            {session.instruments?.find(i => i.instrument_id === 'mdf_br')?.data?.result && (() => {
                const r = session.instruments.find(i => i.instrument_id === 'mdf_br').data.result;
                return (
                    <div style={{ marginBottom: '32px', pageBreakBefore: 'always' }}>
                        <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '16px', fontWeight: 'bold' }}>
                            Resultado MDF-BR
                        </h2>
                        <div style={{ backgroundColor: '#f7fafc', padding: '20px', borderRadius: '12px', border: '2px solid #e2e8f0', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '16px', color: '#2d3748', margin: 0, fontWeight: 'bold' }}>Índice de Funcionalidade Global (IFG)</h3>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>{Number(r.ifg_total).toFixed(1)}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}><strong>Status de Risco:</strong> {r.status_risco}</p>
                            {r.red_flag_details && r.red_flag_details.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#e53e3e' }}>Red Flags:</p>
                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4a5568' }}>
                                        {r.red_flag_details.map((rf, idx) => (
                                            <li key={idx}><strong>{rf.domain}:</strong> {rf.note}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {session.instruments?.find(i => i.instrument_id === 'idf_br')?.data?.result && (() => {
                const r = session.instruments.find(i => i.instrument_id === 'idf_br').data.result;
                return (
                    <div style={{ marginBottom: '32px', pageBreakBefore: 'always' }}>
                        <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '16px', fontWeight: 'bold' }}>
                            Resultado IDF-BR
                        </h2>
                        <div style={{ backgroundColor: '#f7fafc', padding: '20px', borderRadius: '12px', border: '2px solid #e2e8f0', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '16px', color: '#2d3748', margin: 0, fontWeight: 'bold' }}>Funcionalidade Geral</h3>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>{r.total_percentage}%</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}><strong>Score Total:</strong> {r.total_score} / {r.total_valid}</p>
                        </div>
                        
                        {r.intervention_plan && r.intervention_plan.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '18px', color: '#2d3748', marginBottom: '12px', fontWeight: 'bold' }}>
                                    Plano de Intervenção ({r.intervention_plan.length} ações recomendadas)
                                </h3>
                                {r.intervention_plan.map((ip, idx) => (
                                    <div key={idx} style={{ backgroundColor: '#fffaf0', padding: '16px', borderRadius: '12px', border: '1px solid #fbd38d', marginBottom: '12px', pageBreakInside: 'avoid' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#dd6b20', fontSize: '14px' }}>Domínio {ip.domain_code}</span>
                                            <span style={{ fontSize: '12px', backgroundColor: '#feebc8', color: '#c05621', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                {ip.priority === 'medium' ? 'Prioridade Média' : 'Prioridade Baixa'}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#2d3748', fontWeight: 'bold' }}>{ip.recommended_action}</p>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}><strong>Alvo:</strong> {ip.target_area}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Rodapé Ético */}
            <div style={{
                borderTop: '2px solid #e2e8f0',
                paddingTop: '20px',
                marginTop: '40px',
                pageBreakInside: 'avoid'
            }}>
                <div style={{
                    backgroundColor: '#fef5e7',
                    padding: '16px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f39c12'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#744210',
                        lineHeight: '1.6'
                    }}>
                        <strong>⚠️ Declaração Ética:</strong> Este documento não possui valor diagnóstico e destina-se exclusivamente ao registro do desempenho observado durante sessão de avaliação comportamental. A interpretação dos resultados deve ser realizada por profissional habilitado, considerando o contexto clínico completo da criança.
                    </p>
                </div>

                <p style={{
                    textAlign: 'center',
                    color: '#a0aec0',
                    fontSize: '11px',
                    marginTop: '20px',
                    marginBottom: 0
                }}>
                    Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} • VB-MAPP System V3
                </p>
            </div>
        </div>
    );
};

export default PDFReportV3;