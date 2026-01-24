import React, { useState, useMemo } from 'react';

/* CATEGORIAS FIXAS DE TRANSIÇÃO (IMUTÁVEIS) */
const CATEGORIAS_TRANSICAO = [
  {
    id: 'cat_01',
    nome: 'Domínio de linguagem, social, comportamental e independência acadêmica',
    itens_manuais: 3  // Itens 6, 7, 8
  },
  {
    id: 'cat_02',
    nome: 'Habilidades para aprender',
    itens_manuais: 3  // Itens 6, 7, 8
  },
  {
    id: 'cat_03',
    nome: 'Habilidades de autocuidado, espontaneidade e independência',
    itens_manuais: 3  // Itens 6, 7, 8
  }
];

/* COMPONENTE: TELA 4 — Análise de Transição */
export default function TransicaoScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  const [avaliacoes, setAvaliacoes] = useState(() => {
    if (sessionInfo?.transicao?.categorias) {
      const initial = {};
      sessionInfo.transicao.categorias.forEach(c => {
        // Para restaurar os itens manuais, precisamos dos detalhes originais
        // Mas as categorias salvas no transicaoData simplificam isso.
        // Na implementação anterior salvaremos os itens_manuais detalhados na sessão.
        // Vou assumir que sessionInfo contém o estado das avaliações brutas para restauração se disponíveis.
        if (sessionInfo.avaliacoes_transicao_raw) {
          initial[c.categoria_id] = sessionInfo.avaliacoes_transicao_raw[c.categoria_id];
        } else {
          // Fallback se não houver raw data salvo
          initial[c.categoria_id] = { observacao: c.observacao };
        }
      });
      return initial;
    }
    return {};
  });

  // Calcular itens automáticos 1-5 com base nos dados anteriores
  const itensAutomaticos = useMemo(() => {
    const percentuais = sessionInfo.percentuais?.geral || { dominado: 0, emergente: 0, nao_observado: 0 };
    const escoreBarreiras = sessionInfo.escore_total_barreiras || 0;
    const lacunas = sessionInfo.lacunas || [];

    // Função auxiliar para converter percentual em pontuação 0-5
    const percentualParaPontos = (percentual) => {
      if (percentual >= 90) return 5;
      if (percentual >= 75) return 4;
      if (percentual >= 60) return 3;
      if (percentual >= 40) return 2;
      if (percentual >= 20) return 1;
      return 0;
    };

    // Função auxiliar para inverter barreiras (quanto menos barreira, melhor)
    const barreirasParaPontos = (escore, max = 40) => {
      const percentual = ((max - escore) / max) * 100;
      return percentualParaPontos(percentual);
    };

    return {
      cat_01: [
        percentualParaPontos(percentuais.dominado),  // Item 1: Domínio geral
        Math.min(5, Math.floor(5 - (lacunas.length / 30))),  // Item 2: Lacunas
        barreirasParaPontos(escoreBarreiras),  // Item 3: Barreiras
        percentualParaPontos(percentuais.dominado * 0.9),  // Item 4: Ajuste
        Math.min(5, Math.floor((percentuais.dominado + (100 - (escoreBarreiras / 40 * 100))) / 40))  // Item 5: Média
      ],
      cat_02: [
        percentualParaPontos(percentuais.dominado * 0.95),  // Item 1
        Math.max(0, 5 - Math.floor(escoreBarreiras / 8)),  // Item 2
        percentualParaPontos(percentuais.dominado * 0.85),  // Item 3
        Math.min(5, Math.floor(5 - (lacunas.length / 35))),  // Item 4
        barreirasParaPontos(escoreBarreiras, 40)  // Item 5
      ],
      cat_03: [
        percentualParaPontos(percentuais.dominado * 0.8),  // Item 1
        Math.max(0, Math.min(5, Math.floor(percentuais.dominado / 20))),  // Item 2
        percentualParaPontos((100 - percentuais.nao_observado)),  // Item 3
        barreirasParaPontos(escoreBarreiras, 40),  // Item 4
        Math.min(5, Math.floor(percentuais.dominado / 18))  // Item 5
      ]
    };
  }, [sessionInfo]);

  // Calcular escores
  const calculos = useMemo(() => {
    const escoresPorCategoria = CATEGORIAS_TRANSICAO.map(cat => {
      const automaticos = itensAutomaticos[cat.id] || [0, 0, 0, 0, 0];
      const somaAutomaticos = automaticos.reduce((sum, val) => sum + val, 0);

      const av = avaliacoes[cat.id] || {};
      const manuais = [];
      for (let i = 0; i < cat.itens_manuais; i++) {
        manuais.push(av[`item_${6 + i}`] ?? null);
      }
      const somaManuais = manuais.reduce((sum, val) => sum + (val !== null ? val : 0), 0);
      const manuaisCompletos = manuais.every(v => v !== null && v !== undefined);

      return {
        categoria_id: cat.id,
        nome: cat.nome,
        escore_automatico: somaAutomaticos,
        escore_manual: somaManuais,
        escore_total: somaAutomaticos + somaManuais,
        observacao: av.observacao || '',
        manuais_completos: manuaisCompletos,
        observacao_completa: av.observacao && av.observacao.trim().length >= 10
      };
    });

    const todasCompletas = escoresPorCategoria.every(c => c.manuais_completos && c.observacao_completa);
    const escoreTotal = escoresPorCategoria.reduce((sum, c) => sum + c.escore_total, 0);

    return {
      escoresPorCategoria,
      todasCompletas,
      escoreTotal
    };
  }, [avaliacoes, itensAutomaticos]);

  const setAvaliacao = (categoriaId, field, value) => {
    if (isReadOnly) return;
    setAvaliacoes(prev => ({
      ...prev,
      [categoriaId]: {
        ...prev[categoriaId],
        [field]: value
      }
    }));
  };

  const handleFinalize = () => {
    if (!calculos.todasCompletas) {
      alert('Você precisa completar TODAS as categorias (itens manuais + observação).');
      return;
    }

    const transicaoData = {
      session_id: sessionInfo.session_id,
      child_name: sessionInfo.child_name,
      date_transicao: new Date().toISOString(),
      transicao_completa: true,
      transicao: {
        categorias: calculos.escoresPorCategoria.map(c => ({
          nome: c.nome,
          categoria_id: c.categoria_id,
          escore: c.escore_total,
          observacao: c.observacao.trim()
        })),
        escore_total: calculos.escoreTotal
      },
      avaliacoes_transicao_raw: avaliacoes, // Salvar dados brutos para restauração
      schema_version: 'vbmapp_transicao_v1'
    };

    onFinalize(transicaoData);
  };

  return (
    <div className="transicao-screen">
      <style>{getTransicaoStyles()}</style>

      {/* HEADER */}
      <header className="transicao-header">
        <div className="header-content">
          <h1>TELA 4 — Análise de Transição</h1>
          <p>Avaliação de Prontidão para Transição Educacional</p>
          <div className="session-info">
            <strong>{sessionInfo.child_name}</strong> - Avaliado em {new Date(sessionInfo.date).toLocaleDateString('pt-BR')}
          </div>
        </div>
        {onBack && (
          <button className="btn btn-back" onClick={onBack}>
            ← Voltar
          </button>
        )}
      </header>

      {/* INFO CONSOLIDADA */}
      <section className="info-panel">
        <h2>Dados Consolidados</h2>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-label">Milestones Dominados</div>
            <div className="info-value">{sessionInfo.percentuais?.geral?.dominado?.toFixed(1) || 0}%</div>
          </div>
          <div className="info-card">
            <div className="info-label">Lacunas Identificadas</div>
            <div className="info-value">{sessionInfo.lacunas?.length || 0}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Escore de Barreiras</div>
            <div className="info-value">{sessionInfo.escore_total_barreiras || 0} / 40</div>
          </div>
          <div className="info-card">
            <div className="info-label">Escore de Transição</div>
            <div className="info-value">{calculos.escoreTotal}</div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <div className="categorias-container">
        {CATEGORIAS_TRANSICAO.map((categoria, catIndex) => {
          const calc = calculos.escoresPorCategoria[catIndex];
          const av = avaliacoes[categoria.id] || {};
          const automaticos = itensAutomaticos[categoria.id];
          const isCompleta = calc.manuais_completos && calc.observacao_completa;

          return (
            <article key={categoria.id} className={`categoria-card ${isCompleta ? 'completa' : 'pendente'}`}>
              <div className="categoria-header">
                <div className="categoria-number">#{catIndex + 1}</div>
                <div className="categoria-info">
                  <h3>{categoria.nome}</h3>
                  <div className="escore-categoria">
                    Escore: {calc.escore_total} pontos
                    <span className="escore-detail">
                      (Automático: {calc.escore_automatico} + Manual: {calc.escore_manual})
                    </span>
                  </div>
                </div>
                {isCompleta && <div className="check-badge">✓</div>}
              </div>

              {/* ITENS AUTOMÁTICOS */}
              <div className="itens-automaticos">
                <h4>Itens Automáticos (1-5)</h4>
                <div className="itens-grid">
                  {automaticos.map((pontos, idx) => (
                    <div key={idx} className="item-automatico">
                      <span className="item-label">Item {idx + 1}</span>
                      <span className="item-pontos">{pontos}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ITENS MANUAIS */}
              <div className="itens-manuais">
                <h4>Itens Manuais (6-{5 + categoria.itens_manuais}) *</h4>
                <div className="manuais-grid">
                  {Array.from({ length: categoria.itens_manuais }).map((_, idx) => {
                    const itemKey = `item_${6 + idx}`;
                    const valor = av[itemKey];

                    return (
                      <div key={itemKey} className="manual-item">
                        <label className="manual-label">Item {6 + idx}:</label>
                        <div className="pontuacao-select">
                          {[0, 1, 2, 3, 4, 5].map(pontos => (
                            <label key={pontos} className="radio-pontuacao">
                              <input
                                type="radio"
                                name={`${categoria.id}_${itemKey}`}
                                value={pontos}
                                checked={valor === pontos}
                                onChange={() => setAvaliacao(categoria.id, itemKey, pontos)}
                                disabled={isReadOnly}
                              />
                              <span className="radio-box">{pontos}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OBSERVAÇÃO */}
              <div className="form-group">
                <label className="form-label">
                  Observação *
                  <span className="char-count">
                    {(av.observacao || '').length} caracteres (mínimo 10)
                  </span>
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Descreva evidências e considerações sobre esta categoria de transição..."
                  value={av.observacao || ''}
                  onChange={(e) => setAvaliacao(categoria.id, 'observacao', e.target.value)}
                  rows={3}
                  disabled={isReadOnly}
                />
                {av.observacao && av.observacao.trim().length > 0 && av.observacao.trim().length < 10 && (
                  <div className="field-error">
                    Observação deve ter no mínimo 10 caracteres
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ACTION PANEL */}
      <section className="action-panel">
        <div className="escore-display">
          <span className="escore-label">Escore Total de Transição:</span>
          <span className="escore-value">{calculos.escoreTotal}</span>
        </div>
        {!isReadOnly && (
          <button
            className={`btn btn-finalize ${calculos.todasCompletas ? 'enabled' : 'disabled'}`}
            onClick={handleFinalize}
            disabled={!calculos.todasCompletas}
          >
            ✓ Finalizar Análise de Transição
          </button>
        )}
        {isReadOnly && (
          <div className="read-only-badge">🔒 MODO VISUALIZAÇÃO</div>
        )}
      </section>
    </div>
  );
}

function getTransicaoStyles() {
  return `
    .transicao-screen {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .transicao-header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .transicao-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .transicao-header p {
      opacity: 0.95;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .session-info {
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.15);
      border-radius: 6px;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .info-panel {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 1px solid #e5e7eb;
    }

    .info-panel h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #111827;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-card {
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      background: linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%);
    }

    .info-label {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #4338ca;
    }

    .info-value {
      font-size: 2rem;
      font-weight: 700;
      color: #3730a3;
    }

    .categorias-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .categoria-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .categoria-card.pendente {
      border-color: #f59e0b;
    }

    .categoria-card.completa {
      border-color: #6366f1;
      background: #eef2ff;
    }

    .categoria-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: flex-start;
    }

    .categoria-number {
      background: #6366f1;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1.25rem;
      min-width: 60px;
      text-align: center;
    }

    .categoria-info {
      flex: 1;
    }

    .categoria-info h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }

    .escore-categoria {
      font-size: 1rem;
      font-weight: 600;
      color: #4338ca;
      margin-top: 0.5rem;
    }

    .escore-detail {
      font-size: 0.875rem;
      color: #6366f1;
      margin-left: 0.5rem;
    }

    .check-badge {
      background: #6366f1;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .itens-automaticos {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border-left: 4px solid #6366f1;
    }

    .itens-automaticos h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1rem;
    }

    .itens-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 1rem;
    }

    .item-automatico {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: white;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    .item-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
    }

    .item-pontos {
      font-size: 1.5rem;
      font-weight: 700;
      color: #4338ca;
    }

    .itens-manuais {
      margin-bottom: 1.5rem;
    }

    .itens-manuais h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1rem;
    }

    .manuais-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .manual-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .manual-label {
      font-weight: 600;
      color: #374151;
      min-width: 80px;
    }

    .pontuacao-select {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .radio-pontuacao input {
      display: none;
    }

    .radio-box {
      display: inline-block;
      padding: 0.5rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
      color: #374151;
      min-width: 40px;
      text-align: center;
    }

    .radio-pontuacao:hover .radio-box {
      border-color: #6366f1;
      background: #eef2ff;
    }

    .radio-pontuacao input:checked + .radio-box {
      border-color: #6366f1;
      background: #6366f1;
      color: white;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-label {
      font-weight: 600;
      color: #374151;
      font-size: 0.95rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .char-count {
      font-size: 0.75rem;
      color: #9ca3af;
      font-weight: 400;
    }

    .form-textarea {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #6366f1;
    }

    .field-error {
      color: #dc2626;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .action-panel {
      position: sticky;
      bottom: 0;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid #6366f1;
      box-shadow: 0 -4px 6px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .escore-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%);
      border-radius: 8px;
    }

    .escore-label {
      font-weight: 600;
      color: #4338ca;
      font-size: 1rem;
    }

    .escore-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3730a3;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
      color: #6b7280;
      white-space: nowrap;
    }

    .btn:hover:not(:disabled) {
      background: #f9fafb;
      transform: translateY(-1px);
    }

    .btn-back {
      background: white;
      color: #6366f1;
      border-color: white;
    }

    .btn-finalize {
      background: #6366f1;
      color: white;
      border-color: #6366f1;
      font-size: 1.1rem;
      padding: 1rem 2rem;
    }

    .btn-finalize.enabled:hover {
      background: #4f46e5;
    }

    .btn-finalize.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #9ca3af;
      border-color: #9ca3af;
    }

      @media (max-width: 768px) {
        .manual-item {
          flex-direction: column;
          align-items: flex-start;
        }

        .action-panel {
          flex-direction: column;
          align-items: stretch;
        }

        .escore-display {
          justify-content: center;
        }
      }

      .read-only-badge {
        background: #eef2ff;
        color: #4338ca;
        padding: 0.75rem 2.5rem;
        border-radius: 8px;
        font-weight: 800;
        border: 2px solid #c7d2fe;
      }
    `;
}
