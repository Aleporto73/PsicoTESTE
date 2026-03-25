/*
 * ABCICAChart - Gráficos para ABC/ICA
 *
 * 2 componentes:
 * - ABCICARadarChart: Radar pentagonal das 5 subescalas
 * - ABCICASubscaleBars: Barras horizontais por subescala
 */

import React, { useEffect, useRef } from 'react';
import { ABC_ICA_SUBSCALES } from '../../data/instruments/abc_ica';

// ===================================
// RADAR PENTAGONAL — 5 SUBESCALAS
// ===================================
export function ABCICARadarChart({ subscaleScores }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !subscaleScores) return;
    if (chartRef.current) chartRef.current.destroy();

    let Chart;
    try { Chart = window.Chart; } catch { /* fallback */ }
    if (!Chart) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Gráfico indisponível — Chart.js não carregado', canvasRef.current.width / 2, 100);
      return;
    }

    const labels = ABC_ICA_SUBSCALES.map(s => `${s.shortName} - ${s.name}`);
    const data = ABC_ICA_SUBSCALES.map(s => subscaleScores[s.id]?.percent || 0);
    const colors = ABC_ICA_SUBSCALES.map(s => s.color);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: '% Pontuação',
          data,
          borderColor: '#e11d48',
          backgroundColor: 'rgba(225,29,72,0.12)',
          borderWidth: 2.5,
          pointBackgroundColor: colors,
          pointBorderColor: colors,
          pointRadius: 6,
          pointHoverRadius: 9,
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
                const sub = ABC_ICA_SUBSCALES[idx];
                return sub ? `${sub.shortName} - ${sub.name}` : '';
              },
              label: (item) => {
                const idx = item.dataIndex;
                const sub = ABC_ICA_SUBSCALES[idx];
                const ss = subscaleScores[sub?.id];
                return ss ? `${ss.score}/${ss.maxPossible} (${ss.percent}%)` : '';
              },
            },
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            padding: 12,
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
              callback: (v) => v + '%',
            },
            pointLabels: {
              font: { size: 13, weight: '700' },
              color: '#334155',
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
            angleLines: { color: 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [subscaleScores]);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
        Perfil por Subescala
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
        Visão geral das 5 subescalas — quanto maior a área, mais comportamentos atípicos observados
      </div>
      {/* Legenda */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {ABC_ICA_SUBSCALES.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
              {s.shortName} - {s.name}
            </span>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// ===================================
// BARRAS HORIZONTAIS — 5 SUBESCALAS
// ===================================
export function ABCICASubscaleBars({ subscaleScores }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !subscaleScores) return;
    if (chartRef.current) chartRef.current.destroy();

    let Chart;
    try { Chart = window.Chart; } catch { /* fallback */ }
    if (!Chart) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Gráfico indisponível', canvasRef.current.width / 2, 80);
      return;
    }

    const labels = ABC_ICA_SUBSCALES.map(s => `${s.shortName} - ${s.name}`);
    const data = ABC_ICA_SUBSCALES.map(s => subscaleScores[s.id]?.percent || 0);
    const colors = ABC_ICA_SUBSCALES.map(s => s.color);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '% Pontuação',
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
                const sub = ABC_ICA_SUBSCALES[item.dataIndex];
                const ss = subscaleScores[sub?.id];
                return ss ? `${ss.score}/${ss.maxPossible} (${ss.percent}%)` : '';
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
              font: { size: 14, weight: '700' },
              color: '#334155',
            },
            grid: { display: false },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [subscaleScores]);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
        Pontuação por Subescala
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
        Comparativo entre as 5 áreas avaliadas
      </div>
      <div style={{ height: '300px' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
