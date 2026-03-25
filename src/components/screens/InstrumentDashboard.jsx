/*
 * InstrumentDashboard
 *
 * Visão geral dos instrumentos aplicados para uma criança/sessão.
 * Mostra status de cada instrumento, scores resumidos e links para relatórios.
 */

import React from 'react';
import { getInstrument } from '../../registry/instrumentRegistry';

export default function InstrumentDashboard({
  session,
  onAddInstrument,
  onViewInstrument,
  onViewReport,
  onViewLongitudinal,
  onBack,
}) {
  const appliedInstruments = session?.instruments || [];

  const getScoreSummary = (inst) => {
    if (inst.instrument_id === 'vbmapp') {
      const total = Object.keys(inst.data?.scores_snapshot || {}).length;
      return `${total} marcos avaliados`;
    }
    if (inst.instrument_id === 'ablls_r') {
      const scores = inst.data?.scores;
      if (scores) {
        return `${scores.totalPercent?.toFixed(1)}% — ${scores.totalScore}/${scores.maxPossible} pts`;
      }
      return 'Conclu\u00eddo';
    }
    if (inst.instrument_id === 'mchat_rf') {
      const scores = inst.data?.scores || inst.data?.final_scores;
      if (scores) {
        return `Score: ${scores.raw_score}/20 — ${scores.risk_level || scores.followup_risk_level || ''}`;
      }
      return 'Em andamento';
    }
    return 'Concluído';
  };

  const getStatusColor = (inst) => {
    if (inst.status === 'completed') return '#10b981';
    if (inst.status === 'in_progress') return '#f59e0b';
    return '#94a3b8';
  };

  const getStatusLabel = (status) => {
    if (status === 'completed') return 'Concluído';
    if (status === 'in_progress') return 'Em andamento';
    return 'Pendente';
  };

  return (
    <div className="instrument-dashboard">
      <style>{`
        .instrument-dashboard {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: #fff;
          padding: 1.5rem 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .dash-header-left h1 {
          margin: 0;
          font-size: 1.6rem;
          color: #1e293b;
          font-weight: 800;
        }
        .dash-header-left p {
          margin: 0.25rem 0 0;
          color: #64748b;
          font-size: 0.9rem;
        }
        .dash-header-actions {
          display: flex;
          gap: 10px;
        }
        .btn-add {
          background: #6366f1;
          color: white;
          border: none;
          padding: 0.7rem 1.3rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .btn-add:hover { background: #4f46e5; transform: translateY(-1px); }
        .btn-back {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 0.7rem 1.3rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .btn-back:hover { background: #e2e8f0; }
        .instruments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .inst-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.2s;
          border-left: 5px solid;
        }
        .inst-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
        }
        .inst-icon {
          font-size: 2rem;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #f8fafc;
        }
        .inst-info { flex: 1; }
        .inst-info h3 { margin: 0 0 0.25rem; font-size: 1.15rem; color: #1e293b; font-weight: 700; }
        .inst-info .inst-score { color: #475569; font-size: 0.875rem; margin: 0; }
        .inst-info .inst-date { color: #94a3b8; font-size: 0.8rem; margin: 0.25rem 0 0; }
        .inst-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }
        .inst-actions {
          display: flex;
          gap: 8px;
        }
        .inst-actions button {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 2px solid;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
        }
        .inst-actions .btn-view { border-color: #6366f1; color: #6366f1; }
        .inst-actions .btn-view:hover { background: #6366f1; color: white; }
        .inst-actions .btn-report { border-color: #7c3aed; color: #7c3aed; }
        .inst-actions .btn-report:hover { background: #7c3aed; color: white; }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #fff;
          border-radius: 16px;
          border: 2px dashed #e2e8f0;
        }
        .empty-state h3 { color: #64748b; font-weight: 600; }
        .empty-state p { color: #94a3b8; }
      `}</style>

      <header className="dash-header">
        <div className="dash-header-left">
          <h1>{session?.child_name || 'Criança'}</h1>
          <p>{appliedInstruments.length} instrumento(s) aplicado(s) — {new Date(session?.date).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="dash-header-actions">
          <button className="btn-back" onClick={onBack}>← Voltar</button>
          <button className="btn-add" onClick={onAddInstrument}>+ Novo Instrumento</button>
        </div>
      </header>

      <div className="instruments-list">
        {appliedInstruments.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum instrumento aplicado ainda</h3>
            <p>Clique em "+ Novo Instrumento" para começar uma avaliação</p>
          </div>
        ) : (
          appliedInstruments.map((inst, idx) => {
            const meta = getInstrument(inst.instrument_id);
            if (!meta) return null;
            return (
              <div
                key={`${inst.instrument_id}-${idx}`}
                className="inst-card"
                style={{ borderLeftColor: meta.color }}
              >
                <div className="inst-icon">{meta.icon}</div>
                <div className="inst-info">
                  <h3>{meta.name}</h3>
                  <p className="inst-score">{getScoreSummary(inst)}</p>
                  {inst.completed_at && (
                    <p className="inst-date">Concluído em {new Date(inst.completed_at).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
                <span className="inst-status" style={{ background: getStatusColor(inst) }}>
                  {getStatusLabel(inst.status)}
                </span>
                <div className="inst-actions">
                  <button className="btn-view" onClick={() => onViewInstrument(inst.instrument_id, idx)}>
                    Ver
                  </button>
                  {inst.instrument_id === 'ablls_r' && onViewLongitudinal && (
                    <button className="btn-report" onClick={() => onViewLongitudinal('ablls_r')}>
                      Evolu\u00e7\u00e3o
                    </button>
                  )}
                  {inst.data?.report && (
                    <button className="btn-report" onClick={() => onViewReport(inst.instrument_id, idx)}>
                      Relat\u00f3rio
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
