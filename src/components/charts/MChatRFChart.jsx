/*
 * MChatRFChart - Gráficos do M-CHAT-R/F
 *
 * Exibe gráficos de resultado: barras por categoria e indicador de risco.
 */

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export function RiskGauge({ riskLevel, riskColor, score, total = 20 }) {
  const percent = Math.round((score / total) * 100);

  return (
    <div className="risk-gauge">
      <style>{`
        .risk-gauge {
          text-align: center;
          padding: 1.5rem;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .gauge-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 8px solid;
          position: relative;
        }
        .gauge-score {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
        }
        .gauge-total {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-top: 2px;
        }
        .gauge-label {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0.5rem 0 0.25rem;
        }
        .gauge-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          margin-top: 1rem;
          overflow: hidden;
        }
        .gauge-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .gauge-scale {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 0.7rem;
          color: #94a3b8;
        }
      `}</style>
      <div className="gauge-circle" style={{ borderColor: riskColor }}>
        <span className="gauge-score" style={{ color: riskColor }}>{score}</span>
        <span className="gauge-total">de {total}</span>
      </div>
      <p className="gauge-label" style={{ color: riskColor }}>{riskLevel}</p>
      <div className="gauge-bar">
        <div
          className="gauge-bar-fill"
          style={{ width: `${percent}%`, background: riskColor }}
        />
      </div>
      <div className="gauge-scale">
        <span>0 (Baixo)</span>
        <span>10</span>
        <span>20 (Elevado)</span>
      </div>
    </div>
  );
}

export function CategoryChart({ categorySummary }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !categorySummary || categorySummary.length === 0) return;

    // Filtrar categorias que têm pelo menos 1 item
    const data = categorySummary.filter(c => c.total > 0);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(c => c.name),
        datasets: [
          {
            label: 'Passou',
            data: data.map(c => c.passed),
            backgroundColor: '#10b981',
            borderRadius: 4,
          },
          {
            label: 'Falhou',
            data: data.map(c => c.failed),
            backgroundColor: '#ef4444',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 12, weight: '600' } },
          },
          title: {
            display: true,
            text: 'Resultado por Categoria',
            font: { size: 14, weight: '700' },
            color: '#1e293b',
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45 },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [categorySummary]);

  return (
    <div className="category-chart" style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    }}>
      <div style={{ height: '300px' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}

export function ItemsOverview({ scores, questions }) {
  if (!scores) return null;

  return (
    <div className="items-overview">
      <style>{`
        .items-overview {
          background: #fff;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .items-overview h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          color: #1e293b;
          font-weight: 700;
        }
        .items-grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 6px;
        }
        .item-dot {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          cursor: default;
        }
        .item-dot.passed { background: #10b981; }
        .item-dot.failed { background: #ef4444; }
      `}</style>
      <h3>Visão Geral dos 20 Itens</h3>
      <div className="items-grid">
        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => {
          const failed = scores.failed_items.includes(num);
          return (
            <div
              key={num}
              className={`item-dot ${failed ? 'failed' : 'passed'}`}
              title={`Item ${num}: ${failed ? 'Falhou' : 'Passou'}`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default { RiskGauge, CategoryChart, ItemsOverview };
