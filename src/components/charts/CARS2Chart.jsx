/*
 * CARS2Chart - Gráficos para CARS-2
 *
 * 2 componentes:
 * - CARS2RadarChart: Radar dos 15 itens
 * - CARS2ItemBars: Barras horizontais por item
 */

import React, { useEffect, useRef } from 'react';
import { CARS2_ITEMS } from '../../data/instruments/cars2';

// ===================================
// RADAR — 15 ITENS
// ===================================
export function CARS2RadarChart({ itemScores }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !itemScores) return;
    if (chartRef.current) chartRef.current.destroy();

    const Chart = window.Chart;
    if (!Chart) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Gráfico indisponível — Chart.js não carregado', canvasRef.current.width / 2, 100);
      return;
    }

    const labels = CARS2_ITEMS.map(i => {
      const short = i.name.length > 20 ? i.name.substring(0, 20) + '...' : i.name;
      return i.num + '. ' + short;
    });
    const data = CARS2_ITEMS.map(i => itemScores[String(i.num)]?.score || 0);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Pontuação',
          data,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124,58,237,0.12)',
          borderWidth: 2.5,
          pointBackgroundColor: data.map(v => getColor(v)),
          pointBorderColor: data.map(v => getColor(v)),
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
                const item = CARS2_ITEMS[idx];
                return item ? item.name : '';
              },
              label: (item) => 'Nota: ' + item.raw + ' / 4',
            },
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            padding: 12,
          },
        },
        scales: {
          r: {
            min: 0,
            max: 4,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
              backdropColor: 'transparent',
            },
            pointLabels: {
              font: { size: 11, weight: '600' },
              color: '#334155',
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
            angleLines: { color: 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [itemScores]);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
        {'Perfil por Subescala'}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
        {'Visão geral dos 15 itens — quanto maior a área, maior a gravidade dos sintomas'}
      </div>
      <div style={{ maxWidth: '550px', margin: '0 auto' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// ===================================
// BARRAS HORIZONTAIS — 15 ITENS
// ===================================
export function CARS2ItemBars({ itemScores }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !itemScores) return;
    if (chartRef.current) chartRef.current.destroy();

    const Chart = window.Chart;
    if (!Chart) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Gráfico indisponível', canvasRef.current.width / 2, 80);
      return;
    }

    const labels = CARS2_ITEMS.map(i => i.num + '. ' + i.name);
    const data = CARS2_ITEMS.map(i => itemScores[String(i.num)]?.score || 0);
    const colors = data.map(v => getColor(v));

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Pontuação',
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 0,
          borderRadius: 6,
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
              label: (item) => 'Nota: ' + item.raw + ' / 4',
            },
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            padding: 10,
          },
        },
        scales: {
          x: {
            min: 0,
            max: 4,
            ticks: {
              stepSize: 1,
              font: { size: 12 },
            },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          y: {
            ticks: {
              font: { size: 12, weight: '600' },
              color: '#334155',
            },
            grid: { display: false },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [itemScores]);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
        {'Pontuação por Subescala'}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
        {'Comparação visual dos 15 itens avaliados'}
      </div>
      <div style={{ height: '500px' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// ===================================
// HELPER
// ===================================
function getColor(score) {
  if (score <= 1.5) return '#10b981';
  if (score <= 2.5) return '#f59e0b';
  if (score <= 3.5) return '#f97316';
  return '#ef4444';
}
