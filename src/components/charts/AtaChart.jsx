/*
 * AtaChart - Componentes de gráficos para ATA
 *
 * 4 componentes:
 * - AtaRiskGauge: Indicador visual de risco (gauge/card)
 * - AtaSectionBarChart: Barras horizontais por seção
 * - AtaRadarChart: Radar das 23 seções
 * - AtaSectionCards: Cards resumo por seção
 */

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// ═══════════════════════════════════
// GAUGE DE RISCO
// ═══════════════════════════════════
export function AtaRiskGauge({ totalScore, maxPossible, riskInfo }) {
  const percent = Math.round((totalScore / maxPossible) * 100);

  return (
    <div style={{
      padding: '24px', borderRadius: '16px', textAlign: 'center',
      background: riskInfo.level === 'risco'
        ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      border: `2px solid ${riskInfo.color}`,
    }}>
      <div style={{ fontSize: '3rem', fontWeight: 900, color: riskInfo.color }}>
        {totalScore}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 8px' }}>
        de {maxPossible} pontos ({percent}%)
      </div>
      <div style={{
        display: 'inline-block', padding: '8px 20px', borderRadius: '20px',
        background: riskInfo.color, color: '#fff', fontSize: '1rem', fontWeight: 800,
      }}>
        {riskInfo.label}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
        Ponto de corte: ≥ 15 pontos = Risco para TEA
      </div>

      {/* Barra de progresso */}
      <div style={{
        marginTop: '16px', height: '12px', borderRadius: '6px', background: '#e2e8f0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '6px',
          width: `${Math.min(percent, 100)}%`,
          background: riskInfo.color,
          transition: 'width 0.5s',
        }} />
        {/* Marcador ponto de corte */}
        <div style={{
          position: 'absolute', top: '-4px', bottom: '-4px',
          left: `${(15 / maxPossible) * 100}%`,
          width: '2px', background: '#1e293b',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>0</span>
        <span style={{ fontSize: '0.7rem', color: '#1e293b', fontWeight: 700 }}>15 (corte)</span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{maxPossible}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// BARRAS POR SEÇÃO
// ═══════════════════════════════════
export function AtaSectionBarChart({ sectionScores, sections, version }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !sectionScores) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = sections.map(s => `${s.roman}. ${s.label}`);
    const data = sections.map(s => {
      const sc = sectionScores[s.id];
      if (!sc) return 0;
      return sc.score;
    });

    const maxVal = version === 'resumida' ? 2 : Math.max(...data, 1);

    const colors = data.map(d => {
      if (version === 'resumida') {
        if (d === 0) return '#22c55e';
        if (d === 1) return '#eab308';
        return '#ef4444';
      }
      return d > 0 ? '#f97316' : '#22c55e';
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius: 6,
          barThickness: 18,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            max: maxVal,
            ticks: { stepSize: 1 },
            grid: { color: '#f1f5f9' },
          },
          y: {
            ticks: { font: { size: 10 } },
            grid: { display: false },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [sectionScores, sections, version]);

  return (
    <div style={{
      padding: '16px', borderRadius: '12px', background: '#fff',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
        Pontuação por Seção
      </div>
      <div style={{ height: `${sections.length * 32 + 40}px` }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// RADAR
// ═══════════════════════════════════
export function AtaRadarChart({ sectionScores, sections, version }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !sectionScores) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = sections.map(s => s.roman);
    const data = sections.map(s => {
      const sc = sectionScores[s.id];
      if (!sc) return 0;
      if (version === 'resumida') return sc.score;
      return sc.percent || 0;
    });

    const maxVal = version === 'resumida' ? 2 : 100;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: version === 'resumida' ? 'Intensidade (0-2)' : '% Marcados',
          data,
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderColor: '#6366f1',
          borderWidth: 2,
          pointBackgroundColor: '#6366f1',
          pointRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: true, position: 'bottom' } },
        scales: {
          r: {
            max: maxVal,
            min: 0,
            ticks: { stepSize: version === 'resumida' ? 1 : 25, font: { size: 9 } },
            pointLabels: { font: { size: 10, weight: 'bold' } },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [sectionScores, sections, version]);

  return (
    <div style={{
      padding: '16px', borderRadius: '12px', background: '#fff',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
        Perfil de Traços Autísticos
      </div>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// CARDS POR SEÇÃO
// ═══════════════════════════════════
export function AtaSectionCards({ sectionScores, sections, version }) {
  return (
    <div style={{
      padding: '16px', borderRadius: '12px', background: '#fff',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
        Detalhamento por Seção
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
        {sections.map(s => {
          const sc = sectionScores[s.id];
          if (!sc) return null;

          let color, label;
          if (version === 'resumida') {
            if (sc.score === 0) { color = '#22c55e'; label = `A (${sc.score})`; }
            else if (sc.score === 1) { color = '#eab308'; label = `B (${sc.score})`; }
            else { color = '#ef4444'; label = `C (${sc.score})`; }
          } else {
            color = sc.score > 0 ? '#f97316' : '#22c55e';
            label = `${sc.score}/${sc.maxPossible}`;
          }

          return (
            <div key={s.id} style={{
              padding: '10px 12px', borderRadius: '10px',
              borderLeft: `4px solid ${color}`, background: '#f8fafc',
            }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                {s.roman}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', lineHeight: 1.3, margin: '2px 0' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
