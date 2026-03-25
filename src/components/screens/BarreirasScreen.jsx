import React from 'react';
import { useBarreirasLogic } from '../../hooks/useBarreirasLogic';

/* COMPONENTE: TELA 3 — Barreiras (24 itens oficiais VB-MAPP) */
export default function BarreirasScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  const {
    avaliacoes,
    expandedCard,
    progress,
    canFinalize,
    BARREIRAS_VBMAPP,
    NIVEIS_PONTUACAO,
    setExpandedCard,
    setAvaliacao,
    handleFinalize,
    isCategoriaCompleta
  } = useBarreirasLogic(sessionInfo, isReadOnly);

  return (
    <div className="barreiras-screen">
      <style>{getBarreirasStyles()}</style>

      {/* HEADER */}
      <header className="barreiras-header">
        <div className="header-content">
          <h1>TELA 3 — Avaliação de Barreiras</h1>
          <p>VB-MAPP Barriers Assessment (24 itens)</p>
          <div className="session-info">
            <strong>{sessionInfo.child_name}</strong> • {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        {onBack && (
          <button className="btn-back" onClick={onBack}>← Voltar</button>
        )}
      </header>

      {/* PROGRESS SUMMARY */}
      <section className="progress-summary">
        <div className="progress-header">
          <div className="progress-text">
            <span className="progress-count">{progress.avaliadas} / {progress.total}</span>
            <span className="progress-label">barreiras avaliadas</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress.percentComplete}%` }} />
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-value">{progress.escoreTotal}</span>
            <span className="stat-label">Escore Total</span>
            <span className="stat-max">máx: {progress.escoreMaximo}</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{progress.avaliadas}</span>
            <span className="stat-label">Avaliadas</span>
          </div>
          <div className="stat-box warning">
            <span className="stat-value">{progress.pendentes}</span>
            <span className="stat-label">Pendentes</span>
          </div>
        </div>
      </section>

      {/* LISTA DE BARREIRAS */}
      <div className="barreiras-list">
        {BARREIRAS_VBMAPP.map((barreira, index) => {
          const av = avaliacoes[barreira.id] || {};
          const isCompleta = isCategoriaCompleta(barreira.id);
          const isExpanded = expandedCard === barreira.id;

          return (
            <article
              key={barreira.id}
              className={`barreira-card ${isCompleta ? 'completa' : 'pendente'} ${isExpanded ? 'expanded' : ''}`}
            >
              <div
                className="card-header"
                onClick={() => setExpandedCard(isExpanded ? null : barreira.id)}
              >
                <div className="card-number">#{index + 1}</div>
                <div className="card-title">
                  <h3>{barreira.nome}</h3>
                  <p className="card-desc">{barreira.descricao}</p>
                </div>
                <div className="card-status">
                  {isCompleta ? (
                    <span className={`score-badge nivel-${av.pontuacao}`}>{av.pontuacao}</span>
                  ) : (
                    <span className="pending-badge">?</span>
                  )}
                </div>
                <div className="expand-icon">{isExpanded ? '▲' : '▼'}</div>
              </div>

              {isExpanded && (
                <div className="card-body">
                  {/* OPÇÕES DE PONTUAÇÃO */}
                  <div className="pontuacao-grid">
                    {NIVEIS_PONTUACAO.map(nivel => (
                      <label
                        key={nivel.value}
                        className={`pontuacao-option ${av.pontuacao === nivel.value ? 'selected' : ''} nivel-${nivel.value}`}
                      >
                        <input
                          type="radio"
                          name={`pont_${barreira.id}`}
                          value={nivel.value}
                          checked={av.pontuacao === nivel.value}
                          onChange={() => setAvaliacao(barreira.id, 'pontuacao', nivel.value)}
                          disabled={isReadOnly}
                        />
                        <div className="option-content">
                          <span className="option-number">{nivel.value}</span>
                          <span className="option-text">{barreira.niveis[nivel.value]}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* OBSERVAÇÃO OPCIONAL */}
                  <div className="observacao-section">
                    <label className="obs-label">Observação (opcional)</label>
                    <textarea
                      className="obs-textarea"
                      placeholder="Anotações adicionais sobre esta barreira..."
                      value={av.observacao || ''}
                      onChange={(e) => setAvaliacao(barreira.id, 'observacao', e.target.value)}
                      disabled={isReadOnly}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* FOOTER FIXO */}
      <footer className="action-footer">
        <div className="escore-display">
          <span className="escore-label">Escore:</span>
          <span className="escore-value">{progress.escoreTotal} / {progress.escoreMaximo}</span>
        </div>
        {!isReadOnly && (
          <button
            className={`btn-finalize ${canFinalize ? 'enabled' : 'disabled'}`}
            onClick={() => handleFinalize(onFinalize)}
            disabled={!canFinalize}
          >
            {canFinalize ? '✓ Finalizar Barreiras' : `Faltam ${progress.pendentes} itens`}
          </button>
        )}
      </footer>
    </div>
  );
}

function getBarreirasStyles() {
  return `
    .barreiras-screen {
      background: #fdf2f8;
      min-height: 100vh;
      padding-bottom: 100px;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .barreiras-header {
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
      color: white;
      padding: 25px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .header-content h1 { font-size: 22px; margin: 0; font-weight: 800; }
    .header-content p { opacity: 0.8; font-size: 13px; margin: 4px 0 0 0; }
    .session-info {
      background: rgba(255,255,255,0.15);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 14px;
      margin-top: 8px;
      display: inline-block;
    }

    .btn-back {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .progress-summary {
      background: white;
      margin: 20px 5%;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .progress-header {
      margin-bottom: 15px;
    }

    .progress-text {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;
    }

    .progress-count { font-size: 24px; font-weight: 800; color: #db2777; }
    .progress-label { font-size: 14px; color: #6b7280; }

    .progress-bar-container {
      width: 100%;
      height: 8px;
      background: #fce7f3;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #ec4899, #db2777);
      transition: width 0.3s ease;
    }

    .stats-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .stat-box {
      flex: 1;
      min-width: 100px;
      background: #fdf2f8;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-box.warning { background: #fef3c7; }

    .stat-value { display: block; font-size: 24px; font-weight: 800; color: #db2777; }
    .stat-label { display: block; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
    .stat-max { display: block; font-size: 13px; color: #9ca3af; }

    .barreiras-list {
      padding: 0 5%;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .barreira-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #fce7f3;
      transition: all 0.2s;
    }

    .barreira-card.completa { border-color: #10b981; }
    .barreira-card.pendente { border-color: #f59e0b; }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      cursor: pointer;
      background: #fefefe;
    }

    .card-header:hover { background: #fdf2f8; }

    .card-number {
      background: #ec4899;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 12px;
      flex-shrink: 0;
    }

    .card-title { flex: 1; }
    .card-title h3 { font-size: 14px; font-weight: 700; color: #1f2937; margin: 0 0 2px 0; }
    .card-desc { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.3; }

    .score-badge, .pending-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
    }

    .pending-badge { background: #fef3c7; color: #92400e; }
    
    .score-badge.nivel-0 { background: #d1fae5; color: #065f46; }
    .score-badge.nivel-1 { background: #fef9c3; color: #713f12; }
    .score-badge.nivel-2 { background: #fed7aa; color: #9a3412; }
    .score-badge.nivel-3 { background: #fdba74; color: #9a3412; }
    .score-badge.nivel-4 { background: #fecaca; color: #991b1b; }

    .expand-icon { color: #9ca3af; font-size: 13px; }

    .card-body {
      padding: 15px;
      border-top: 1px solid #f3f4f6;
      background: #fefefe;
    }

    .pontuacao-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pontuacao-option {
      cursor: pointer;
    }

    .pontuacao-option input { display: none; }

    .option-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .pontuacao-option:hover .option-content { border-color: #ec4899; background: #fdf2f8; }
    .pontuacao-option.selected .option-content { border-color: #ec4899; background: #fce7f3; }

    .option-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      flex-shrink: 0;
    }

    .nivel-0 .option-number { background: #d1fae5; color: #065f46; }
    .nivel-1 .option-number { background: #fef9c3; color: #713f12; }
    .nivel-2 .option-number { background: #fed7aa; color: #9a3412; }
    .nivel-3 .option-number { background: #fdba74; color: #9a3412; }
    .nivel-4 .option-number { background: #fecaca; color: #991b1b; }

    .option-text { font-size: 14px; color: #374151; line-height: 1.4; }

    .observacao-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px dashed #e5e7eb;
    }

    .obs-label { display: block; font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 8px; }
    
    .obs-textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
    }

    .obs-textarea:focus { outline: none; border-color: #ec4899; }

    .action-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 15px 5%;
      border-top: 2px solid #fce7f3;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
      z-index: 1000;
    }

    .escore-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .escore-label { font-size: 14px; color: #6b7280; font-weight: 600; }
    .escore-value { font-size: 20px; font-weight: 800; color: #db2777; }

    .btn-finalize {
      background: #ec4899;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-finalize:hover:not(:disabled) { background: #db2777; }
    .btn-finalize.disabled { background: #d1d5db; cursor: not-allowed; }

    @media (max-width: 600px) {
      .barreiras-header { flex-direction: column; text-align: center; }
      .stats-row { flex-direction: column; }
      .action-footer { flex-direction: column; gap: 10px; }
    }
  `;
}