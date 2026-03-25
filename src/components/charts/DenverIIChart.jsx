/*
 * DenverIIChart — Gráficos para Denver II
 *
 * 2 componentes:
 * - DenverRadarChart: Radar dos 4 domínios (interpretações)
 * - DenverDomainBars: Barras empilhadas por domínio
 */

import React, { useEffect, useRef } from 'react';
import { DENVER_DOMAINS } from '../../data/instruments/denver_ii';

// ===================================
// RADAR — 4 DOMÍNIOS (% Normal+Avançado)
// ===================================
export function DenverRadarChart({ domainResults }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !domainResults) return;
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

    const labels = DENVER_DOMAINS.map(d => d.name);
    const data = DENVER_DOMAINS.map(d => {
      const dr = domainResults[d.id];
      if (!dr || dr.answered === 0) return 0;
      const positives = (dr.interpretation.normal || 0) + (dr.interpretation.avancado || 0);
      return Math.round((positives / dr.answered) * 100);
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: '% Normal + Avançado',
          data,
          borderColor: '#059669',
          backgroundColor: 'rgba(5,150,105,0.12)',
          borderWidth: 2.5,
          pointBackgroundColor: DENVER_DOMAINS.map(d => d.color),
          pointBorderColor: DENVER_DOMAINS.map(d => d.color),
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
              label: (item) => item.raw + '% Normal/Avançado',
            },
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            padding: 12,
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 25,
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
  }, [domainResults]);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
        {'Perfil de Desenvolvimento'}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
        {'Porcentagem de itens Normal + Avançado por domínio'}
      </div>
      <div style={{ maxWidth: '450px', margin: '0 auto' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// ===================================
// BARRAS EMPILHADAS — 4 DOMÍNIOS
// ===================================
export function DenverDomainBars({ domainResults }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !domainResults) return;
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

    const labels = DENVER_DOMAINS.map(d => d.name);

    const datasets = [
      {
        label: 'Avançado',
        data: DENVER_DOMAINS.map(d => domainResults[d.id]?.interpretation.avancado || 0),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
      {
        label: 'Normal',
        data: DENVER_DOMAINS.map(d => domainResults[d.id]?.interpretation.normal || 0),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Cautela',
        data: DENVER_DOMAINS.map(d => domainResults[d.id]?.interpretation.cautela || 0),
        backgroundColor: '#f59e0b',
        borderRadius: 4,
      },
      {
        label: 'Atraso',
        data: DENVER_DOMAINS.map(d => domainResults[d.id]?.interpretation.atraso || 0),
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
      {
        label: 'N.A',
        data: DENVER_DOMAINS.map(d => domainResults[d.id]?.interpretation.na || 0),
        backgroundColor: '#cbd5e1',
        borderRadius: 4,
      },
    ];

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { font: { size: 12, weight: '600' }, padding: 16 },
          },
          tooltip: {
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            padding: 10,
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { font: { size: 12, weight: '600' }, color: '#334155' },
            grid: { display: false },
          },
          y: {
            stacked: true,
            ticks: { font: { size: 12 }, stepSize: 5 },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [domainResults]);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
        {'Distribuição por Domínio'}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
        {'Contagem de itens por interpretação em cada domínio'}
      </div>
      <div style={{ height: '350px' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
