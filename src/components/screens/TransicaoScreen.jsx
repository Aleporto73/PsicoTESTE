import React from 'react';
import { useTransicaoLogic } from '../../hooks/useTransicaoLogic';

/* COMPONENTE: TELA 4 — Análise de Transição (18 itens oficiais VB-MAPP) */
export default function TransicaoScreen({ sessionInfo, milestonesData, barreirasData, onFinalize, onBack, isReadOnly }) {
  const {
    avaliacoes,
    valoresAutomaticos,
    escores,
    canFinalize,
    manuaisPreenchidos,
    itensManuais,
    TRANSICAO_ESTRUTURA,
    setAvaliacao,
    handleFinalize
  } = useTransicaoLogic(sessionInfo, milestonesData, barreirasData, isReadOnly);

  return (
    <div className="transicao-screen">
      <style>{getTransicaoStyles()}</style>

      {/* HEADER */}
      <header className="transicao-header">
        <div className="header-content">
          <h1>TELA 4 — Análise de Transição</h1>
          <p>VB-MAPP Transition Assessment (18 itens)</p>
          <div className="session-info">
            <strong>{sessionInfo.child_name}</strong> • {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        {onBack && (
          <button className="btn-back" onClick={onBack}>← Voltar</button>
        )}
      </header>

      {/* RESUMO DOS DADOS */}
      <section className="dados-resumo">
        <h2>📊 Dados Consolidados (Base para Cálculos Automáticos)</h2>
        <div className="dados-grid">
          <div className="dado-card">
            <span className="dado-valor">{valoresAutomaticos.raw.percentDominados}%</span>
            <span className="dado-label">Milestones Dominados</span>
            <span className="dado-detalhe">{valoresAutomaticos.raw.totalDominados} de {valoresAutomaticos.raw.totalMilestones}</span>
          </div>
          <div className="dado-card">
            <span className="dado-valor">{valoresAutomaticos.raw.escoreBarreirasTotal}</span>
            <span className="dado-label">Escore Barreiras</span>
            <span className="dado-detalhe">máx: 96 (menor = melhor)</span>
          </div>
          <div className="dado-card">
            <span className="dado-valor">{valoresAutomaticos.raw.escoreBarreiras1_2}</span>
            <span className="dado-label">Barreiras 1+2</span>
            <span className="dado-detalhe">Comp. Negativo + Controle</span>
          </div>
          <div className="dado-card">
            <span className="dado-valor">{valoresAutomaticos.raw.pontosSocial}</span>
            <span className="dado-label">Social</span>
            <span className="dado-detalhe">Pontos dominados</span>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <div className="categorias-container">
        {TRANSICAO_ESTRUTURA.categorias.map(categoria => {
          const escoreCat = escores.categorias[categoria.id];

          return (
            <section key={categoria.id} className="categoria-section">
              <div className="categoria-header">
                <div className="categoria-numero">Categoria {categoria.numero}</div>
                <h3>{categoria.nome}</h3>
                <div className="categoria-escore">
                  <span className="escore-total">{escoreCat.total}</span>
                  <span className="escore-detalhe">
                    (Auto: {escoreCat.automaticos} + Manual: {escoreCat.manuais})
                  </span>
                </div>
              </div>

              <div className="itens-list">
                {categoria.itens.map(item => {
                  const isAuto = item.tipo === 'automatico';
                  const valorAuto = valoresAutomaticos[item.id];
                  const valorManual = avaliacoes[item.id]?.pontuacao;
                  const valor = isAuto ? valorAuto : valorManual;

                  return (
                    <div key={item.id} className={`item-card ${isAuto ? 'automatico' : 'manual'}`}>
                      <div className="item-header">
                        <span className="item-numero">{item.numero}</span>
                        <span className="item-nome">{item.nome}</span>
                        <span className={`item-tipo-badge ${isAuto ? 'auto' : 'manual'}`}>
                          {isAuto ? '⚡ Auto' : '✏️ Manual'}
                        </span>
                      </div>

                      {isAuto ? (
                        <div className="item-automatico">
                          <div className="auto-valor">
                            <span className="valor-numero">{valor || 0}</span>
                            <span className="valor-label">pontos</span>
                          </div>
                          <p className="auto-descricao">{item.descricao}</p>
                        </div>
                      ) : (
                        <div className="item-manual">
                          <div className="niveis-grid">
                            {item.niveis.map((nivel, idx) => {
                              const pontos = idx + 1;
                              const isSelected = valorManual === pontos;

                              return (
                                <label
                                  key={idx}
                                  className={`nivel-option ${isSelected ? 'selected' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={`item_${item.id}`}
                                    value={pontos}
                                    checked={isSelected}
                                    onChange={() => setAvaliacao(item.id, 'pontuacao', pontos)}
                                    disabled={isReadOnly}
                                  />
                                  <span className="nivel-numero">{pontos}</span>
                                  <span className="nivel-texto">{nivel}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* FOOTER */}
      <footer className="action-footer">
        <div className="footer-info">
          <div className="escore-display">
            <span className="escore-label">Escore Total:</span>
            <span className="escore-value">{escores.totalGeral}</span>
          </div>
          <div className="progresso-manual">
            {manuaisPreenchidos} / {itensManuais.length} itens manuais
          </div>
        </div>
        {!isReadOnly && (
          <button
            className={`btn-finalize ${canFinalize ? 'enabled' : 'disabled'}`}
            onClick={() => handleFinalize(onFinalize)}
            disabled={!canFinalize}
          >
            {canFinalize ? '✓ Finalizar Transição' : `Faltam ${itensManuais.length - manuaisPreenchidos} itens`}
          </button>
        )}
      </footer>
    </div>
  );
}

function getTransicaoStyles() {
  return `
    .transicao-screen {
      background: #f0fdf4;
      min-height: 100vh;
      padding-bottom: 100px;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .transicao-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
      font-size: 12px;
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

    .dados-resumo {
      background: white;
      margin: 20px 5%;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .dados-resumo h2 {
      font-size: 14px;
      color: #059669;
      margin: 0 0 15px 0;
      font-weight: 700;
    }

    .dados-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .dado-card {
      background: #ecfdf5;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
    }

    .dado-valor { display: block; font-size: 24px; font-weight: 800; color: #059669; }
    .dado-label { display: block; font-size: 14px; color: #047857; font-weight: 600; margin-top: 4px; }
    .dado-detalhe { display: block; font-size: 13px; color: #6b7280; margin-top: 2px; }

    .categorias-container {
      padding: 0 5%;
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .categoria-section {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .categoria-header {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      padding: 15px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    .categoria-numero {
      background: #059669;
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
    }

    .categoria-header h3 {
      flex: 1;
      font-size: 14px;
      font-weight: 700;
      color: #047857;
      margin: 0;
      min-width: 200px;
    }

    .categoria-escore {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .escore-total {
      font-size: 24px;
      font-weight: 800;
      color: #059669;
    }

    .escore-detalhe {
      font-size: 13px;
      color: #6b7280;
    }

    .itens-list {
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-card {
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }

    .item-card.automatico { border-color: #a7f3d0; background: #f0fdf4; }
    .item-card.manual { border-color: #fde68a; background: #fffbeb; }

    .item-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      background: rgba(255,255,255,0.5);
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .item-numero {
      background: #059669;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .item-nome {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .item-tipo-badge {
      font-size: 13px;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .item-tipo-badge.auto { background: #d1fae5; color: #047857; }
    .item-tipo-badge.manual { background: #fef3c7; color: #92400e; }

    .item-automatico {
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .auto-valor {
      background: white;
      padding: 10px 15px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #10b981;
    }

    .valor-numero { display: block; font-size: 24px; font-weight: 800; color: #059669; }
    .valor-label { display: block; font-size: 13px; color: #6b7280; }

    .auto-descricao {
      flex: 1;
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      line-height: 1.4;
    }

    .item-manual {
      padding: 15px;
    }

    .niveis-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nivel-option {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }

    .nivel-option:hover { border-color: #10b981; background: #f0fdf4; }
    .nivel-option.selected { border-color: #10b981; background: #d1fae5; }

    .nivel-option input { display: none; }

    .nivel-numero {
      background: #e5e7eb;
      color: #374151;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .nivel-option.selected .nivel-numero {
      background: #10b981;
      color: white;
    }

    .nivel-texto {
      font-size: 14px;
      color: #374151;
      line-height: 1.4;
    }

    .action-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 15px 5%;
      border-top: 2px solid #d1fae5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
      z-index: 1000;
      flex-wrap: wrap;
      gap: 10px;
    }

    .footer-info {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .escore-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .escore-label { font-size: 14px; color: #6b7280; font-weight: 600; }
    .escore-value { font-size: 24px; font-weight: 800; color: #059669; }

    .progresso-manual {
      font-size: 14px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 4px 10px;
      border-radius: 4px;
    }

    .btn-finalize {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-finalize:hover:not(:disabled) { background: #059669; }
    .btn-finalize.disabled { background: #d1d5db; cursor: not-allowed; }

    @media (max-width: 600px) {
      .transicao-header { flex-direction: column; text-align: center; }
      .categoria-header { flex-direction: column; text-align: center; }
      .item-automatico { flex-direction: column; text-align: center; }
      .action-footer { flex-direction: column; }
    }
  `;
}
