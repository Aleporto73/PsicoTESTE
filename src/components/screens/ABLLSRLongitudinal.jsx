/*
 * ABLLSRLongitudinal - Compara\u00e7\u00e3o Longitudinal ABLLS-R (AV1 a AV4)
 *
 * Mostra evolu\u00e7\u00e3o entre avalia\u00e7\u00f5es:
 * - Gr\u00e1fico de evolu\u00e7\u00e3o temporal (total e por grupo)
 * - Tabela comparativa dom\u00ednio a dom\u00ednio
 * - Indicadores de tend\u00eancia (melhora / est\u00e1vel / regress\u00e3o)
 *
 * P\u00fablico: profissionais 50+, design claro e grande
 */

import React, { useMemo, useRef, useEffect } from 'react';
import {
  ABLLS_R_DOMAINS,
  ABLLS_R_DOMAIN_GROUPS,
  getABLLSRPerformanceLevel,
} from '../../data/instruments/ablls_r';

const GROUP_COLORS = {
  habilidades_basicas: { bg: '#ede9fe', color: '#7c3aed', label: 'Hab. B\u00e1sicas' },
  linguagem: { bg: '#dbeafe', color: '#2563eb', label: 'Linguagem' },
  social_rotina: { bg: '#d1fae5', color: '#059669', label: 'Social e Rotina' },
  academico: { bg: '#fef3c7', color: '#d97706', label: 'Acad\u00eamico' },
  autonomia_motor: { bg: '#fce7f3', color: '#db2777', label: 'Autonomia e Motor' },
};

const AV_COLORS = ['#6366f1', '#0891b2', '#059669', '#d97706'];

export default function ABLLSRLongitudinal({ evaluations, childName, onBack }) {
  if (!evaluations || evaluations.length < 2) {
    return (
      <div style={S.container}>
        <div style={S.emptyState}>
          <h2 style={{ color: '#64748b', marginBottom: '8px' }}>Compara\u00e7\u00e3o Longitudinal ABLLS-R</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            S\u00e3o necess\u00e1rias pelo menos <strong>2 avalia\u00e7\u00f5es</strong> para gerar o comparativo.
          </p>
          <p style={{ color: '#94a3b8' }}>
            Atualmente: {evaluations?.length || 0} avalia\u00e7\u00e3o(s) encontrada(s) para <strong>{childName}</strong>.
          </p>
          {onBack && (
            <button onClick={onBack} style={S.btnBack}>\u2190 Voltar</button>
          )}
        </div>
      </div>
    );
  }

  // Extrair scores de cada avalia\u00e7\u00e3o
  const avData = useMemo(() => {
    return evaluations.map(ev => {
      let dateStr = 'Data n\u00e3o dispon\u00edvel';
      try {
        const d = new Date(ev.date);
        if (!isNaN(d.getTime())) dateStr = d.toLocaleDateString('pt-BR');
      } catch { /* keep default */ }
      return {
        label: ev.avLabel,
        date: dateStr,
        scores: ev.instrument?.data?.scores || null,
      };
    });
  }, [evaluations]);

  // Calcular deltas entre \u00faltima e primeira avalia\u00e7\u00e3o
  const first = avData[0]?.scores;
  const last = avData[avData.length - 1]?.scores;

  const globalDelta = last && first ? (last.totalPercent - first.totalPercent) : 0;
  const trend = globalDelta > 2 ? 'melhora' : globalDelta < -2 ? 'regressao' : 'estavel';

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Evolu\u00e7\u00e3o ABLLS-R \u2014 {childName}</h1>
          <p style={S.subtitle}>
            {avData.length} avalia\u00e7\u00f5es: {avData.map(a => `${a.label} (${a.date})`).join(' \u2192 ')}
          </p>
        </div>
        {onBack && <button onClick={onBack} style={S.btnBack}>\u2190 Voltar</button>}
      </div>

      {/* Cards Resumo */}
      <div style={S.cardsRow}>
        <SummaryCard
          label="Primeira Avalia\u00e7\u00e3o"
          value={`${first?.totalPercent?.toFixed(1) || 0}%`}
          sub={`${avData[0]?.label} \u2014 ${avData[0]?.date}`}
          color="#6366f1"
        />
        <SummaryCard
          label="\u00daltima Avalia\u00e7\u00e3o"
          value={`${last?.totalPercent?.toFixed(1) || 0}%`}
          sub={`${avData[avData.length - 1]?.label} \u2014 ${avData[avData.length - 1]?.date}`}
          color="#0891b2"
        />
        <SummaryCard
          label="Evolu\u00e7\u00e3o"
          value={`${globalDelta >= 0 ? '+' : ''}${globalDelta.toFixed(1)}%`}
          sub={trend === 'melhora' ? '\u2197 Melhora' : trend === 'regressao' ? '\u2198 Regress\u00e3o' : '\u2192 Est\u00e1vel'}
          color={trend === 'melhora' ? '#10b981' : trend === 'regressao' ? '#ef4444' : '#f59e0b'}
        />
      </div>

      {/* Gr\u00e1fico de Evolu\u00e7\u00e3o por \u00c1rea */}
      <EvolutionChart avData={avData} />

      {/* Tabela Comparativa por Dom\u00ednio */}
      <DomainComparisonTable avData={avData} />
    </div>
  );
}

// ==========================================
// SUB-COMPONENTES
// ==========================================

function SummaryCard({ label, value, sub, color }) {
  return (
    <div style={{ ...S.card, borderTop: `4px solid ${color}` }}>
      <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: '4px 0', color, fontSize: '1.8rem', fontWeight: 800 }}>{value}</p>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{sub}</p>
    </div>
  );
}

function EvolutionChart({ avData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || avData.length < 2) return;

    let Chart;
    try { Chart = window.Chart; } catch { /* Chart.js indisponível */ }
    if (!Chart) {
      const ctx2d = canvasRef.current.getContext('2d');
      ctx2d.font = '14px sans-serif';
      ctx2d.fillStyle = '#94a3b8';
      ctx2d.textAlign = 'center';
      ctx2d.fillText('Gr\u00e1fico indispon\u00edvel — Chart.js n\u00e3o carregado', canvasRef.current.width / 2, 80);
      return;
    }

    const ctx = canvasRef.current.getContext('2d');

    // Dataset: total + cada grupo
    const datasets = [
      {
        label: 'Total',
        data: avData.map(av => av.scores?.totalPercent || 0),
        borderColor: '#1e293b',
        backgroundColor: 'rgba(30,41,55,0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: '#1e293b',
        tension: 0.3,
      },
    ];

    ABLLS_R_DOMAIN_GROUPS.forEach(group => {
      const gc = GROUP_COLORS[group.id];
      datasets.push({
        label: gc?.label || group.name,
        data: avData.map(av => av.scores?.groupScores?.[group.id]?.percent || 0),
        borderColor: gc?.color || '#94a3b8',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 4,
        pointBackgroundColor: gc?.color || '#94a3b8',
        tension: 0.3,
      });
    });

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: avData.map(av => av.label),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12, weight: '600' }, padding: 16 },
          },
          title: {
            display: true,
            text: 'Evolu\u00e7\u00e3o por \u00c1rea (%)',
            font: { size: 16, weight: '700' },
            color: '#1e293b',
            padding: { bottom: 16 },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { font: { size: 12 }, callback: v => `${v}%` },
            grid: { color: '#f1f5f9' },
          },
          x: {
            ticks: { font: { size: 14, weight: '700' } },
            grid: { display: false },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [avData]);

  return (
    <div style={S.section}>
      <div style={{ height: '350px' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function DomainComparisonTable({ avData }) {
  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>Compara\u00e7\u00e3o por Dom\u00ednio</h2>

      {ABLLS_R_DOMAIN_GROUPS.map(group => {
        const gc = GROUP_COLORS[group.id];
        return (
          <div key={group.id} style={{ marginBottom: '20px' }}>
            {/* Group header */}
            <div style={{
              background: gc?.color || '#64748b',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>{gc?.label || group.name}</span>
              <span>
                {avData.map(av => {
                  const gp = av.scores?.groupScores?.[group.id]?.percent || 0;
                  return `${av.label}: ${gp.toFixed(0)}%`;
                }).join('  |  ')}
              </span>
            </div>

            {/* Table */}
            <table style={S.table}>
              <thead>
                <tr style={S.tableHeaderRow}>
                  <th style={{ ...S.th, textAlign: 'left', width: '35%' }}>Dom\u00ednio</th>
                  {avData.map((av, i) => (
                    <th key={i} style={{ ...S.th, color: AV_COLORS[i] || '#475569' }}>{av.label} ({av.date})</th>
                  ))}
                  <th style={S.th}>Evolu\u00e7\u00e3o</th>
                </tr>
              </thead>
              <tbody>
                {group.domains.map((domainId, idx) => {
                  const domain = ABLLS_R_DOMAINS.find(d => d.id === domainId);
                  if (!domain) return null;

                  const percents = avData.map(av => av.scores?.domainScores?.[domainId]?.percent || 0);
                  const delta = percents.length >= 2 ? percents[percents.length - 1] - percents[0] : 0;
                  const trendIcon = delta > 2 ? '\u2197' : delta < -2 ? '\u2198' : '\u2192';
                  const trendColor = delta > 2 ? '#10b981' : delta < -2 ? '#ef4444' : '#94a3b8';

                  return (
                    <tr key={domainId} style={{ background: idx % 2 === 0 ? '#fafbfc' : 'white' }}>
                      <td style={S.td}>{domain.name}</td>
                      {percents.map((p, i) => {
                        const level = getABLLSRPerformanceLevel(p);
                        return (
                          <td key={i} style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: level.color }}>
                            {p.toFixed(1)}%
                          </td>
                        );
                      })}
                      <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: trendColor, fontSize: '1.1rem' }}>
                        {trendIcon} {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const S = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#1e293b',
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  btnBack: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: 'white',
    color: '#475569',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  cardsRow: {
    display: 'flex',
    gap: '14px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  card: {
    flex: '1 1 200px',
    background: 'white',
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  section: {
    background: 'white',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    margin: '0 0 16px',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  tableHeaderRow: {
    background: '#f1f5f9',
  },
  th: {
    padding: '10px 12px',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#475569',
    textAlign: 'center',
    borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.9rem',
    color: '#334155',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 30px',
    background: 'white',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0',
  },
};
