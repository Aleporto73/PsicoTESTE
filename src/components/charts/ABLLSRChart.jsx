/*
 * ABLLSRChart - Gráficos para ABLLS-R
 *
 * 2 componentes visuais:
 * - ABLLSRRadarChart: Radar dos 25 domínios agrupados por cor
 * - ABLLSRGroupBars: Barras horizontais comparativas dos 5 grupos
 */

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const GROUP_META = {
  habilidades_basicas: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Hab. Básicas' },
  linguagem: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'Linguagem' },
  social_rotina: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Social/Rotina' },
  academico: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Acadêmico' },
  autonomia_motor: { color: '#ec4899', bg: 'rgba(236,72,153,0.15)', label: 'Autonomia/Motor' },
};

// ═══════════════════════════════════
// RADAR — 25 DOMÍNIOS
// ═══════════════════════════════════
export function ABLLSRRadarChart({ domainScores, domains, groups }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !domainScores) return;
    if (chartRef.current) chartRef.current.destroy();

    // Preparar labels e dados
    const labels = domains.map(d => {
      const name = d.name;
      return name.length > 18 ? name.substring(0, 16) + '…' : name;
    });
    const data = domains.map(d => domainScores[d.id]?.percent || 0);

    // Cor por grupo para cada domínio
    const pointColors = domains.map(d => {
      for (const g of groups) {
        if (g.domains && g.domains.includes(d.id)) {
          return GROUP_META[g.id]?.color || '#94a3b8';
        }
      }
      return '#94a3b8';
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: '% Acertos',
          data,
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8,145,178,0.12)',
          borderWidth: 2.5,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: 5,
          pointHoverRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                const idx = items[0]?.dataIndex;
                return domains[idx]?.name || '';
              },
              label: (item) => `${item.raw}% de acertos`,
            },
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            padding: 10,
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              font: { size: 11 },
              backdropColor: 'transparent',
            },
            pointLabels: {
              font: { size: 12, weight: '600' },
              color: '#475569',
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
            angleLines: { color: 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [domainScores, domains, groups]);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
        Perfil de Habilidades
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
        Visão geral dos 25 domínios — quanto maior a área, melhor o desempenho
      </div>
      {/* Legenda dos grupos */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {groups.map(g => {
          const gm = GROUP_META[g.id];
          if (!gm) return null;
          return (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', background: gm.color,
              }} />
              <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{gm.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// BARRAS COMPARATIVAS DOS 5 GRUPOS
// ═══════════════════════════════════
export function ABLLSRGroupBars({ groupScores, groups }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !groupScores) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = groups.map(g => g.name);
    const data = groups.map(g => groupScores[g.id]?.percent || 0);
    const colors = groups.map(g => GROUP_META[g.id]?.color || '#94a3b8');
    const bgColors = groups.map(g => GROUP_META[g.id]?.bg || 'rgba(0,0,0,0.05)');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '% Acertos',
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 0,
          borderRadius: 8,
          barPercentage: 0.7,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const gs = groupScores[groups[item.dataIndex]?.id];
                return gs ? `${gs.percent}% (${gs.score}/${gs.maxPossible} pts)` : '';
              },
            },
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            padding: 10,
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: {
              callback: (val) => val + '%',
              font: { size: 12 },
            },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          y: {
            ticks: {
              font: { size: 15, weight: '700' },
              color: '#334155',
            },
            grid: { display: false },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [groupScores, groups]);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
        Desempenho por Área
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
        Comparativo entre os 5 blocos de habilidades
      </div>
      <div style={{ height: '320px' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
