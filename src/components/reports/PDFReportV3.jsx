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