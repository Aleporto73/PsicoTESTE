import React, { useState, useMemo } from 'react';

/* CATEGORIAS FIXAS DE BARREIRAS (IMUTÁVEIS) */
const CATEGORIAS_BARREIRAS = [
  { id: 'cat_01', nome: 'Comportamento negativo' },
  { id: 'cat_02', nome: 'Controle instrucional fraco' },
  { id: 'cat_03', nome: 'Déficits de habilidades sociais' },
  { id: 'cat_04', nome: 'Déficits de habilidades de brincar' },
  { id: 'cat_05', nome: 'Dependência de dicas' },
  { id: 'cat_06', nome: 'Déficits de generalização' },
  { id: 'cat_07', nome: 'Déficits de motivação' },
  { id: 'cat_08', nome: 'Déficits de respostas de ecoico' },
  { id: 'cat_09', nome: 'Déficits de respostas verbais' },
  { id: 'cat_10', nome: 'Déficits de prontidão para aprender' }
];

const NIVEIS_PONTUACAO = [
  { value: 0, label: '0 - Ausência', description: 'Ausência de barreira' },
  { value: 1, label: '1 - Leve', description: 'Barreira leve' },
  { value: 2, label: '2 - Moderada', description: 'Barreira moderada' },
  { value: 3, label: '3 - Significativa', description: 'Barreira significativa' },
  { value: 4, label: '4 - Grave', description: 'Barreira grave' }
];

/* COMPONENTE: TELA 3 — Barreiras */
export default function BarreirasScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  const [avaliacoes, setAvaliacoes] = useState(() => {
    if (sessionInfo?.barreiras) {
      const initial = {};
      sessionInfo.barreiras.forEach(b => {
        initial[b.categoria_id] = {
          pontuacao: b.pontuacao,
          observacao: b.observacao
        };
      });
      return initial;
    }
    return {};
  });

  // Progresso de avaliação
  const progress = useMemo(() => {
    const total = CATEGORIAS_BARREIRAS.length; // 10
    const avaliadas = Object.values(avaliacoes).filter(av =>
      av.pontuacao !== null && av.pontuacao !== undefined && av.observacao && av.observacao.trim().length >= 10
    ).length;

    const escoreTotal = Object.values(avaliacoes).reduce((sum, av) => {
      return sum + (av.pontuacao !== null && av.pontuacao !== undefined ? av.pontuacao : 0);
    }, 0);

    return {
      total,
      avaliadas,
      pendentes: total - avaliadas,
      percentComplete: ((avaliadas / total) * 100).toFixed(1),
      escoreTotal
    };
  }, [avaliacoes]);

  const canFinalize = progress.avaliadas === progress.total;

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
    if (!canFinalize) {
      alert(`Você precisa avaliar TODAS as ${CATEGORIAS_BARREIRAS.length} categorias. Faltam ${progress.pendentes} categorias.`);
      return;
    }

    // Gerar array de barreiras
    const barreiras = CATEGORIAS_BARREIRAS.map(cat => {
      const av = avaliacoes[cat.id];
      return {
        categoria: cat.nome,
        categoria_id: cat.id,
        pontuacao: av.pontuacao,
        observacao: av.observacao.trim()
      };
    });

    const barreirasData = {
      session_id: sessionInfo.session_id,
      child_name: sessionInfo.child_name,
      date_barreiras: new Date().toISOString(),
      barreiras_completas: true,
      barreiras: barreiras,
      escore_total_barreiras: progress.escoreTotal,
      schema_version: 'vbmapp_barreiras_v1'
    };

    onFinalize(barreirasData);
  };

  const isCategoriaCompleta = (categoriaId) => {
    const av = avaliacoes[categoriaId];
    return av && av.pontuacao !== null && av.pontuacao !== undefined && av.observacao && av.observacao.trim().length >= 10;
  };

  return (
    <div className="barreiras-screen">
      <style>{getBarreirasStyles()}</style>

      {/* HEADER */}
      <header className="barreiras-header">
        <div className="header-content">
          <h1>TELA 3 — Barreiras</h1>
          <p>Avaliação de Barreiras ao Desenvolvimento</p>
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

      {/* PROGRESS SUMMARY */}
      <section className="progress-summary">
        <div className="progress-header">
          <h2>Progresso da Avaliação</h2>
          <div className="progress-indicator">
            <span className="progress-text">
              {progress.avaliadas} / {progress.total} categorias avaliadas ({progress.percentComplete}%)
            </span>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{progress.escoreTotal}</div>
            <div className="stat-label">Escore Total</div>
            <div className="stat-hint">Máximo: 40 pontos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{progress.avaliadas}</div>
            <div className="stat-label">Categorias Avaliadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{progress.pendentes}</div>
            <div className="stat-label">Categorias Pendentes</div>
          </div>
        </div>

        {progress.pendentes > 0 && (
          <div className="validation-alert">
            ⚠️ Faltam {progress.pendentes} categorias para finalizar a avaliação
          </div>
        )}
      </section>

      {/* CATEGORIAS */}
      <div className="categorias-container">
        {CATEGORIAS_BARREIRAS.map((categoria, index) => {
          const av = avaliacoes[categoria.id] || {};
          const isCompleta = isCategoriaCompleta(categoria.id);

          return (
            <article key={categoria.id} className={`categoria-card ${isCompleta ? 'completa' : 'pendente'}`}>
              <div className="categoria-header">
                <div className="categoria-number">#{index + 1}</div>
                <div className="categoria-info">
                  <h3>{categoria.nome}</h3>
                </div>
                {isCompleta && <div className="check-badge">✓</div>}
              </div>

              <div className="avaliacao-form">
                {/* PONTUAÇÃO */}
                <div className="form-group">
                  <label className="form-label">Pontuação (0-4) *</label>
                  <div className="pontuacao-group">
                    {NIVEIS_PONTUACAO.map(nivel => (
                      <label key={nivel.value} className="pontuacao-label" title={nivel.description}>
                        <input
                          type="radio"
                          name={`pontuacao_${categoria.id}`}
                          value={nivel.value}
                          checked={av.pontuacao === nivel.value}
                          onChange={(e) => setAvaliacao(categoria.id, 'pontuacao', parseInt(e.target.value))}
                          disabled={isReadOnly}
                        />
                        <span className={`pontuacao-box nivel-${nivel.value}`}>
                          <span className="nivel-numero">{nivel.value}</span>
                          <span className="nivel-texto">{nivel.label.split(' - ')[1]}</span>
                        </span>
                      </label>
                    ))}
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
                    placeholder="Descreva evidências observadas que justificam a pontuação atribuída..."
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
              </div>
            </article>
          );
        })}
      </div>

      {/* ACTION PANEL */}
      <section className="action-panel">
        <div className="escore-display">
          <span className="escore-label">Escore Total:</span>
          <span className="escore-value">{progress.escoreTotal} / 40</span>
        </div>
        {!isReadOnly && (
          <button
            className={`btn btn-finalize ${canFinalize ? 'enabled' : 'disabled'}`}
            onClick={handleFinalize}
            disabled={!canFinalize}
          >
            ✓ Finalizar Avaliação de Barreiras
          </button>
        )}
        {isReadOnly && (
          <div className="read-only-badge">🔒 MODO VISUALIZAÇÃO</div>
        )}
      </section>
    </div>
  );
}

function getBarreirasStyles() {
  return `
    .barreiras-screen {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .barreiras-header {
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
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

    .barreiras-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .barreiras-header p {
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

    .progress-summary {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 1px solid #e5e7eb;
    }

    .progress-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #111827;
    }

    .progress-indicator {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .progress-text {
      font-size: 1rem;
      font-weight: 600;
      color: #4b5563;
    }

    .progress-bar-container {
      width: 100%;
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%);
      transition: width 0.3s ease;
      border-radius: 6px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-card {
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.5rem;
      color: #be185d;
    }

    .stat-label {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: #831843;
    }

    .stat-hint {
      font-size: 0.75rem;
      color: #9f1239;
      opacity: 0.8;
    }

    .validation-alert {
      margin-top: 1rem;
      padding: 1rem;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      color: #92400e;
      font-weight: 600;
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
      transition: all 0.2s;
    }

    .categoria-card.pendente {
      border-color: #f59e0b;
    }

    .categoria-card.completa {
      border-color: #ec4899;
      background: #fdf2f8;
    }

    .categoria-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
    }

    .categoria-number {
      background: #ec4899;
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
      margin: 0;
    }

    .check-badge {
      background: #ec4899;
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

    .avaliacao-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

    .pontuacao-group {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .pontuacao-label {
      cursor: pointer;
      flex: 1;
      min-width: 100px;
    }

    .pontuacao-label input[type="radio"] {
      display: none;
    }

    .pontuacao-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
      background: white;
    }

    .pontuacao-label:hover .pontuacao-box {
      border-color: #ec4899;
      background: #fdf2f8;
    }

    .pontuacao-label input:checked + .pontuacao-box {
      border-color: #ec4899;
      background: #fce7f3;
    }

    .nivel-numero {
      font-size: 1.5rem;
      font-weight: 700;
      color: #be185d;
    }

    .nivel-texto {
      font-size: 0.875rem;
      font-weight: 600;
      color: #831843;
      text-align: center;
    }

    .pontuacao-box.nivel-0 {
      border-color: #10b981;
    }

    .pontuacao-label input:checked + .pontuacao-box.nivel-0 {
      background: #d1fae5;
      border-color: #10b981;
    }

    .pontuacao-box.nivel-0 .nivel-numero {
      color: #065f46;
    }

    .pontuacao-box.nivel-4 {
      border-color: #dc2626;
    }

    .pontuacao-label input:checked + .pontuacao-box.nivel-4 {
      background: #fee2e2;
      border-color: #dc2626;
    }

    .pontuacao-box.nivel-4 .nivel-numero {
      color: #991b1b;
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
      border-color: #ec4899;
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
      border: 2px solid #ec4899;
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
      background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
      border-radius: 8px;
    }

    .escore-label {
      font-weight: 600;
      color: #831843;
      font-size: 1rem;
    }

    .escore-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #be185d;
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
      color: #ec4899;
      border-color: white;
    }

    .btn-finalize {
      background: #ec4899;
      color: white;
      border-color: #ec4899;
      font-size: 1.1rem;
      padding: 1rem 2rem;
    }

    .btn-finalize.enabled:hover {
      background: #db2777;
    }

    .btn-finalize.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #9ca3af;
      border-color: #9ca3af;
    }

      @media (max-width: 768px) {
        .pontuacao-group {
          flex-direction: column;
        }

        .pontuacao-label {
          width: 100%;
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
        background: #fdf2f8;
        color: #db2777;
        padding: 0.75rem 2.5rem;
        border-radius: 8px;
        font-weight: 800;
        border: 2px solid #f9a8d4;
      }
    `;
}
