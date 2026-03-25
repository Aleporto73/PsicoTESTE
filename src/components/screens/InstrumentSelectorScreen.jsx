/*
 * InstrumentSelectorScreen
 *
 * Tela de seleção de instrumento de avaliação.
 * Mostra cards com todos os instrumentos disponíveis do registry.
 */

import React from 'react';
import { listInstruments } from '../../registry/instrumentRegistry';

export default function InstrumentSelectorScreen({ session, onSelectInstrument, onBack }) {
  const instruments = listInstruments();

  // Verificar quais instrumentos já foram aplicados nesta sessão
  const appliedInstruments = (session?.instruments || []).map(i => i.instrument_id);

  return (
    <div className="instrument-selector">
      <style>{`
        .instrument-selector {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .selector-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .selector-header h1 {
          font-size: 1.8rem;
          color: #1e293b;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
        }
        .selector-header p {
          color: #64748b;
          font-size: 1rem;
          margin: 0;
        }
        .child-info {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid #e2e8f0;
        }
        .child-info-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #6366f1;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
        }
        .child-info-text h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
        .child-info-text p { margin: 0; font-size: 0.875rem; color: #64748b; }
        .instruments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .instrument-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.75rem;
          border: 2px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .instrument-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        }
        .instrument-card.applied {
          border-color: #10b981;
          background: #f0fdf4;
        }
        .instrument-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
        .card-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        .card-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }
        .card-fullname {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0 0 0.75rem 0;
          line-height: 1.3;
        }
        .card-description {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }
        .card-meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .meta-tag {
          font-size: 0.75rem;
          padding: 3px 8px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #475569;
          font-weight: 500;
        }
        .meta-tag.applied-tag {
          background: #d1fae5;
          color: #065f46;
          font-weight: 600;
        }
        .back-btn {
          margin-top: 2rem;
          background: #f1f5f9;
          border: none;
          color: #475569;
          padding: 0.7rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .back-btn:hover {
          background: #e2e8f0;
        }
      `}</style>

      <header className="selector-header">
        <h1>Selecione o Instrumento</h1>
        <p>Escolha qual avaliação deseja aplicar</p>
      </header>

      {session && (
        <div className="child-info">
          <div className="child-info-avatar">
            {(session.child_name || '?')[0].toUpperCase()}
          </div>
          <div className="child-info-text">
            <h3>{session.child_name}</h3>
            <p>{session.child_age || 'Idade não informada'}{session.child_age_months ? ` (${session.child_age_months})` : ''} — {new Date(session.date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      )}

      <div className="instruments-grid">
        {instruments.map(inst => {
          const isApplied = appliedInstruments.includes(inst.id);
          return (
            <div
              key={inst.id}
              className={`instrument-card ${isApplied ? 'applied' : ''}`}
              style={{ borderTopColor: inst.color, '--card-color': inst.color }}
              onClick={() => onSelectInstrument(inst.id)}
            >
              <style>{`
                .instrument-card[style*="${inst.color}"]::before {
                  background: ${inst.color};
                }
                .instrument-card[style*="${inst.color}"]:hover {
                  border-color: ${inst.color};
                }
              `}</style>
              <div className="card-icon">{inst.icon}</div>
              <h3 className="card-name">{inst.name}</h3>
              <p className="card-fullname">{inst.fullName}</p>
              <p className="card-description">{inst.description}</p>
              <div className="card-meta">
                <span className="meta-tag">{inst.ageRange}</span>
                <span className="meta-tag">{inst.estimatedTime}</span>
                {inst.supportsPEI && <span className="meta-tag">PEI</span>}
                {isApplied && <span className="meta-tag applied-tag">Aplicado</span>}
              </div>
            </div>
          );
        })}
      </div>

      <button className="back-btn" onClick={onBack}>
        ← Voltar para Sessões
      </button>
    </div>
  );
}
