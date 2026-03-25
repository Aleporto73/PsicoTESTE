/*
 * PortageChart - Gráficos para o Guia Portage
 *
 * Componentes:
 * - DevelopmentalAgeChart: Gráfico de barras comparando idade cronológica vs desenvolvimento por área
 * - AreaBreakdownChart: Gráfico de % acertos por faixa etária dentro de uma área
 * - OverallRadar: Visão geral radar das 5 áreas
 */

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { PORTAGE_AREAS } from '../../data/instruments/portage';

/**
 * Gráfico de barras: Idade Cronológica vs Idade de Desenvolvimento por área
 */
export function DevelopmentalAgeChart({ summary, chronologicalAge }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !summary) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = summary.map(s => s.name);
    const devAges = summary.map(s => s.developmentalAge);
    const chronoLine = summary.map(() => chronologicalAge || 0);

    // Cores das áreas
    const areaColors = summary.map(s => {
      const area = PORTAGE_AREAS[s.area];
      return area ? area.color : '#6366f1';
    });

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Idade de Desenvolvimento (anos)',
            data: devAges,
            backgroundColor: areaColors.map(c => c + 'CC'),
            borderColor: areaColors,
            borderWidth: 2,
            borderRadius: 6,
          },
          ...(chronologicalAge ? [{
            label: 'Idade Cronológica (anos)',
            data: chronoLine,
            type: 'line',
            borderColor: '#ef4444',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
          }] : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Idade de Desenvolvimento por Área',
            font: { size: 16, weight: 'bold' },
            color: '#1e293b',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(6, (chronologicalAge || 0) + 1),
            title: { display: true, text: 'Anos' },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [summary, chronologicalAge]);

  return (
    <div style={{ position: 'relative', height: '350px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

/**
 * Gráfico stacked horizontal: % acertos por faixa etária dentro de uma área
 */
export function AreaBreakdownChart({ areaData, areaName }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !areaData) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const rangeLabels = Object.keys(areaData.byRange).map(r => {
      const parts = r.split('_');
      return `${parts[0]}-${parts[1]} anos`;
    });

    const percents = Object.values(areaData.byRange).map(r => Math.round(r.percent));
    const remaining = percents.map(p => 100 - p);

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: rangeLabels,
        datasets: [
          {
            label: '% Acertos',
            data: percents,
            backgroundColor: '#3b82f6CC',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: '% Restante',
            data: remaining,
            backgroundColor: '#e2e8f0',
            borderColor: '#cbd5e1',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: areaName,
            font: { size: 14, weight: 'bold' },
            color: '#1e293b',
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 0) return `Acertos: ${ctx.raw}%`;
                return '';
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            max: 100,
            ticks: { callback: (v) => v + '%' },
          },
          y: { stacked: true },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [areaData, areaName]);

  return (
    <div style={{ position: 'relative', height: '220px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

/**
 * Gráfico radar: Visão geral das 5 áreas
 */
export function OverallRadarChart({ summary }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !summary) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = summary.map(s => s.name);
    const percents = summary.map(s => Math.round(s.percent));
    const areaColors = summary.map(s => {
      const area = PORTAGE_AREAS[s.area];
      return area ? area.color : '#6366f1';
    });

    chartInstance.current = new Chart(chartRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: '% Acertos Total',
          data: percents,
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderColor: '#6366f1',
          borderWidth: 2,
          pointBackgroundColor: areaColors,
          pointBorderColor: areaColors,
          pointRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Perfil de Desenvolvimento',
            font: { size: 16, weight: 'bold' },
            color: '#1e293b',
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: (v) => v + '%',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [summary]);

  return (
    <div style={{ position: 'relative', height: '350px', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
}

/**
 * Card de resumo com indicador de risco por área
 */
export function AreaSummaryCards({ summary, chronologicalAge, getPortageRiskLevel }) {
  const riskColors = {
    adequado: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8', label: 'Adequado' },
    'atenção': { bg: '#fef3c7', border: '#f59e0b', text: '#b45309', label: 'Atenção' },
    atraso: { bg: '#ffe4e6', border: '#f43f5e', text: '#be123c', label: 'Atraso' },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
      {summary.map(s => {
        const risk = chronologicalAge
          ? getPortageRiskLevel(s.developmentalAge, chronologicalAge)
          : null;
        const riskStyle = risk ? riskColors[risk] : null;
        const area = PORTAGE_AREAS[s.area];

        return (
          <div key={s.area} style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            borderLeft: `4px solid ${area?.color || '#6366f1'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>{s.name}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
              {s.developmentalAge.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>anos</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              {s.totalScore}/{s.totalExpected} itens ({Math.round(s.percent)}%)
            </div>
            {riskStyle && (
              <div style={{
                marginTop: '8px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-block',
                background: riskStyle.bg,
                color: riskStyle.text,
                border: `1px solid ${riskStyle.border}`,
              }}>
                {riskStyle.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default { DevelopmentalAgeChart, AreaBreakdownChart, OverallRadarChart, AreaSummaryCards };
