import React, { useEffect, useRef, useState } from 'react';
import { FileText, Printer, Calendar, Clock } from 'lucide-react';
import Chart from 'chart.js/auto';

export default function PDFReport({
    session,
    sessionAnalysis,
    includeGraphs,
    includePEI,
    reportMode
}) {
    const domainChartRef = useRef(null);
    const overallChartRef = useRef(null);
    const [chartsReady, setChartsReady] = useState(false);

    // Gerar gráficos quando componente montar
    useEffect(() => {
        if (!includeGraphs || !sessionAnalysis) return;

        // Gráfico 1: Por Domínio
        const domainCanvas = domainChartRef.current;
        if (domainCanvas) {
            const ctx = domainCanvas.getContext('2d');

            const labels = Object.values(sessionAnalysis.byDomain).map(d => d.name);
            const dominated = Object.values(sessionAnalysis.byDomain).map(d =>
                ((d.dominado / d.total) * 100).toFixed(0)
            );
            const emergent = Object.values(sessionAnalysis.byDomain).map(d =>
                ((d.emergente / d.total) * 100).toFixed(0)
            );
            const notObserved = Object.values(sessionAnalysis.byDomain).map(d =>
                ((d.nao_observado / d.total) * 100).toFixed(0)
            );

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        { label: 'Dominado', data: dominated, backgroundColor: '#2ecc71' },
                        { label: 'Emergente', data: emergent, backgroundColor: '#f1c40f' },
                        { label: 'Não Observado', data: notObserved, backgroundColor: '#bdc3c7' }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: false,
                    animation: false,
                    scales: {
                        x: { min: 0, max: 100, ticks: { callback: v => v + '%' } }
                    },
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: { enabled: false }
                    }
                }
            });
        }

        // Gráfico 2: Distribuição Geral
        const overallCanvas = overallChartRef.current;
        if (overallCanvas) {
            const ctx = overallCanvas.getContext('2d');

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Dominado', 'Emergente', 'Não Observado'],
                    datasets: [{
                        data: [
                            sessionAnalysis.percDominado,
                            sessionAnalysis.percEmergente,
                            sessionAnalysis.percNaoObservado
                        ],
                        backgroundColor: ['#2ecc71', '#f1c40f', '#bdc3c7']
                    }]
                },
                options: {
                    responsive: false,
                    animation: false,
                    scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%' } } },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } }
                }
            });
        }

        setChartsReady(true);
    }, [includeGraphs, sessionAnalysis]);

    if (!session || !sessionAnalysis) return null;

    return (
        <div className="flex justify-center px-4 print:px-0">
            <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full p-10 md:p-12 print:p-8 relative">

                {/* CABEÇALHO OFICIAL */}
                <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
                            Relatório Funcional de<br />Acompanhamento
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">
                            Documento de apoio à prática profissional
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            PsicoTestes VB-MAPP
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                            {new Date().toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                </div>

                {/* IDENTIFICAÇÃO DO APRENDENTE */}
                <div className="bg-gray-50 rounded-lg p-6 mb-10 border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-900 font-bold text-xl">
                                {session.child_name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Aprendente</div>
                            <div className="text-xl font-bold text-gray-900">{session.child_name}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-gray-400 uppercase">Data da Avaliação</div>
                        <div className="text-xl font-bold text-gray-900">
                            {new Date(session.date).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                </div>

                {/* RESUMO DESCRITIVO */}
                <section className="mb-10 break-inside-avoid">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Resumo Descritivo
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                        {session.ai_report && (
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                    🤖 Gerado com IA
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(session.ai_report.generated_at).toLocaleString('pt-BR')}
                                </span>
                            </div>
                        )}
                        <p className="text-sm text-gray-800 leading-relaxed text-justify">
                            {session.ai_report ? session.ai_report.text : (
                                sessionAnalysis.percDominado > 50
                                    ? 'A criança demonstra predomínio de repertórios dominados, indicando aquisição consolidada das habilidades avaliadas.'
                                    : sessionAnalysis.percEmergente > 40
                                        ? 'A criança apresenta perfil emergente, com habilidades em desenvolvimento que requerem prática continuada.'
                                        : sessionAnalysis.percNaoObservado > 50
                                            ? 'Observa-se ausência significativa de repertórios nas áreas avaliadas, sugerindo necessidade de intervenção intensiva.'
                                            : 'A criança apresenta perfil misto, com repertórios em diferentes estágios de desenvolvimento.'
                            )}
                        </p>
                    </div>
                </section>

                {/* ESTATÍSTICAS GERAIS */}
                <section className="mb-10 break-inside-avoid">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Distribuição dos Repertórios
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-green-800">
                                {sessionAnalysis.percDominado}%
                            </div>
                            <div className="text-xs font-semibold text-green-700 uppercase mt-1">
                                Dominados
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {sessionAnalysis.dominados} blocos
                            </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-yellow-800">
                                {sessionAnalysis.percEmergente}%
                            </div>
                            <div className="text-xs font-semibold text-yellow-700 uppercase mt-1">
                                Emergentes
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {sessionAnalysis.emergentes} blocos
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-gray-700">
                                {sessionAnalysis.percNaoObservado}%
                            </div>
                            <div className="text-xs font-semibold text-gray-600 uppercase mt-1">
                                Não Observados
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {sessionAnalysis.nao_observados} blocos
                            </div>
                        </div>
                    </div>
                </section>

                {/* GRÁFICOS (CONDICIONAIS) */}
                {includeGraphs && (
                    <section className="mb-10 break-inside-avoid">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Resumo Visual do Desempenho
                        </h3>

                        <div className="mb-8">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Desempenho por Domínio
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <canvas
                                    ref={domainChartRef}
                                    width="700"
                                    height="420"
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Distribuição Geral
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <canvas
                                    ref={overallChartRef}
                                    width="600"
                                    height="320"
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* PEI (OPCIONAL) */}
                {includePEI && (
                    <section className="mt-10 pt-8 border-t-2 border-gray-200 break-before-page">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Plano Educacional Individualizado (PEI)
                        </h3>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                            <p className="text-sm text-gray-700 italic">
                                [Área reservada para objetivos, metas e estratégias definidas pelo profissional responsável]
                            </p>
                        </div>
                    </section>
                )}

                {/* ASSINATURA */}
                <div className="mt-16 pt-8 border-t border-gray-300 break-inside-avoid">
                    <div className="flex justify-between items-end">
                        <div className="text-center">
                            <div className="h-px w-48 bg-gray-800 mb-2"></div>
                            <p className="font-bold text-sm text-gray-900">Responsável pelo registro</p>
                            <p className="text-xs text-gray-500">Profissional aplicador</p>
                        </div>
                        <div className="text-xs text-gray-300 uppercase tracking-widest">
                            VB-MAPP v{session.schema_version}
                        </div>
                    </div>
                </div>

                {/* RODAPÉ ÉTICO (OBRIGATÓRIO) */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center leading-relaxed">
                    <p className="mb-2">
                        <strong>Instrumento:</strong> VB-MAPP (Verbal Behavior Milestones Assessment and Placement Program)
                    </p>
                    <p className="mb-2">
                        <strong>Schema:</strong> {session.schema_version} | <strong>App:</strong> v{session.app_version}
                    </p>
                    <p className="text-gray-600 font-medium mt-4">
                        Este documento tem caráter descritivo e funcional, destinado ao acompanhamento
                        do desenvolvimento e à organização da prática profissional.
                        Não constitui diagnóstico clínico nem substitui avaliações formais
                        realizadas por profissionais habilitados.
                    </p>
                </div>

            </div>
        </div>
    );
}