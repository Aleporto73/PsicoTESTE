import React, { useState } from 'react';

/* COMPONENTE: TELA 5 — PEI (Plano Educacional Individualizado) */
export default function PEIScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  // Inicializar com áreas da sessão ou 1 área vazia
  const [areas, setAreas] = useState(() => {
    if (sessionInfo?.pei?.areas) {
      return sessionInfo.pei.areas.map((a, idx) => ({
        area_id: `area_${idx}_${Date.now()}`,
        area: a.area,
        objetivo_geral: a.objetivo_geral,
        metas: a.metas.map(m => ({ meta: m.meta, criterio_sucesso: m.criterio_sucesso })),
        estrategias: a.estrategias,
        responsavel: a.responsavel,
        data_revisao: a.data_revisao
      }));
    }
    return [
      {
        area_id: Date.now().toString(),
        area: '',
        objetivo_geral: '',
        metas: [{ meta: '', criterio_sucesso: '' }],
        estrategias: '',
        responsavel: '',
        data_revisao: ''
      }
    ];
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Adicionar nova área
  const adicionarArea = () => {
    setAreas([...areas, {
      area_id: Date.now().toString(),
      area: '',
      objetivo_geral: '',
      metas: [{ meta: '', criterio_sucesso: '' }],
      estrategias: '',
      responsavel: '',
      data_revisao: ''
    }]);
  };

  // Remover área
  const removerArea = (areaId) => {
    if (areas.length === 1) {
      alert('É necessário ter pelo menos uma área no PEI.');
      return;
    }
    if (confirm('Deseja realmente remover esta área?')) {
      setAreas(areas.filter(a => a.area_id !== areaId));
    }
  };

  // Atualizar campo da área
  const atualizarArea = (areaId, campo, valor) => {
    if (isReadOnly) return;
    setAreas(areas.map(a =>
      a.area_id === areaId ? { ...a, [campo]: valor } : a
    ));
  };

  // Adicionar meta
  const adicionarMeta = (areaId) => {
    setAreas(areas.map(a =>
      a.area_id === areaId
        ? { ...a, metas: [...a.metas, { meta: '', criterio_sucesso: '' }] }
        : a
    ));
  };

  // Remover meta
  const removerMeta = (areaId, metaIndex) => {
    setAreas(areas.map(a => {
      if (a.area_id === areaId) {
        if (a.metas.length === 1) {
          alert('É necessário ter pelo menos uma meta por área.');
          return a;
        }
        return { ...a, metas: a.metas.filter((_, i) => i !== metaIndex) };
      }
      return a;
    }));
  };

  // Atualizar meta
  const atualizarMeta = (areaId, metaIndex, campo, valor) => {
    if (isReadOnly) return;
    setAreas(areas.map(a =>
      a.area_id === areaId
        ? {
          ...a,
          metas: a.metas.map((m, i) =>
            i === metaIndex ? { ...m, [campo]: valor } : m
          )
        }
        : a
    ));
  };

  // Validar PEI
  const validarPEI = () => {
    const novosErros = {};
    let valido = true;

    areas.forEach((area, index) => {
      const areaErros = {};

      // Validar área
      if (!area.area || area.area.trim().length < 3) {
        areaErros.area = 'Área deve ter pelo menos 3 caracteres';
        valido = false;
      }

      // Validar objetivo geral
      if (!area.objetivo_geral || area.objetivo_geral.trim().length < 20) {
        areaErros.objetivo_geral = 'Objetivo geral deve ter pelo menos 20 caracteres';
        valido = false;
      }

      // Validar metas
      area.metas.forEach((meta, metaIndex) => {
        if (!meta.meta || meta.meta.trim().length < 5) {
          areaErros[`meta_${metaIndex}`] = 'Meta deve ter pelo menos 5 caracteres';
          valido = false;
        }
        if (!meta.criterio_sucesso || meta.criterio_sucesso.trim().length < 5) {
          areaErros[`criterio_${metaIndex}`] = 'Critério de sucesso deve ter pelo menos 5 caracteres';
          valido = false;
        }
      });

      // Validar estratégias
      if (!area.estrategias || area.estrategias.trim().length < 20) {
        areaErros.estrategias = 'Estratégias devem ter pelo menos 20 caracteres';
        valido = false;
      }

      // Validar responsável
      if (!area.responsavel || area.responsavel.trim().length < 3) {
        areaErros.responsavel = 'Responsável deve ter pelo menos 3 caracteres';
        valido = false;
      }

      // Validar data de revisão
      if (!area.data_revisao) {
        areaErros.data_revisao = 'Data de revisão é obrigatória';
        valido = false;
      } else {
        const dataRevisao = new Date(area.data_revisao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataRevisao < hoje) {
          areaErros.data_revisao = 'Data de revisão deve ser futura';
          valido = false;
        }
      }

      if (Object.keys(areaErros).length > 0) {
        novosErros[`area_${index}`] = areaErros;
      }
    });

    setErrors(novosErros);
    return valido;
  };

  // Tentar finalizar
  const tentarFinalizar = () => {
    if (validarPEI()) {
      setShowConfirmModal(true);
    } else {
      alert('Por favor, corrija os erros destacados antes de finalizar o PEI.');
    }
  };

  // Confirmar e finalizar
  const confirmarFinalizar = () => {
    const peiData = {
      session_id: sessionInfo.session_id,
      child_name: sessionInfo.child_name,
      date_pei: new Date().toISOString(),
      pei_completo: true,
      pei: {
        areas: areas.map(a => ({
          area: a.area.trim(),
          objetivo_geral: a.objetivo_geral.trim(),
          metas: a.metas.map(m => ({
            meta: m.meta.trim(),
            criterio_sucesso: m.criterio_sucesso.trim()
          })),
          estrategias: a.estrategias.trim(),
          responsavel: a.responsavel.trim(),
          data_revisao: a.data_revisao
        }))
      },
      schema_version: 'vbmapp_pei_v1'
    };

    onFinalize(peiData);
  };

  return (
    <div className="pei-screen">
      <style>{getPEIStyles()}</style>

      {/* HEADER */}
      <header className="pei-header">
        <div className="header-content">
          <h1>TELA 5 — PEI</h1>
          <p>Plano Educacional Individualizado</p>
          <div className="session-info">
            <strong>{sessionInfo.child_name}</strong>
          </div>
        </div>
        {onBack && (
          <button className="btn btn-back" onClick={onBack}>
            ← Voltar
          </button>
        )}
      </header>

      {/* DADOS CONSOLIDADOS */}
      <section className="dados-consolidados">
        <h2>📊 Dados Consolidados</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Milestones Dominados:</span>
            <span className="info-value">{sessionInfo.percentuais?.geral?.dominado?.toFixed(1) || 0}%</span>
          </div>
          <div className="info-item">
            <span className="info-label">Lacunas Identificadas:</span>
            <span className="info-value">{sessionInfo.lacunas?.length || 0}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Escore de Barreiras:</span>
            <span className="info-value">{sessionInfo.escore_total_barreiras || 0} / 40</span>
          </div>
          <div className="info-item">
            <span className="info-label">Escore de Transição:</span>
            <span className="info-value">{sessionInfo.transicao?.escore_total || 0}</span>
          </div>
        </div>
      </section>

      {/* ÁREAS DO PEI */}
      <div className="areas-container">
        {areas.map((area, areaIndex) => {
          const areaErros = errors[`area_${areaIndex}`] || {};

          return (
            <article key={area.area_id} className="area-card">
              <div className="area-header">
                <h3>Área {areaIndex + 1}</h3>
                {areas.length > 1 && !isReadOnly && (
                  <button
                    className="btn btn-remove-small"
                    onClick={() => removerArea(area.area_id)}
                    title="Remover área"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* ÁREA / DOMÍNIO */}
              <div className="form-group">
                <label className="form-label">Área / Domínio *</label>
                <input
                  type="text"
                  className={`form-input ${areaErros.area ? 'error' : ''}`}
                  placeholder="Ex: Comunicação Expressiva, Habilidades Sociais, Independência..."
                  value={area.area}
                  onChange={(e) => atualizarArea(area.area_id, 'area', e.target.value)}
                  disabled={isReadOnly}
                />
                {areaErros.area && <div className="field-error">{areaErros.area}</div>}
              </div>

              {/* OBJETIVO GERAL */}
              <div className="form-group">
                <label className="form-label">Objetivo Geral *</label>
                <textarea
                  className={`form-textarea ${areaErros.objetivo_geral ? 'error' : ''}`}
                  placeholder="Descreva o objetivo geral desta área de intervenção..."
                  value={area.objetivo_geral}
                  onChange={(e) => atualizarArea(area.area_id, 'objetivo_geral', e.target.value)}
                  rows={3}
                  disabled={isReadOnly}
                />
                {areaErros.objetivo_geral && <div className="field-error">{areaErros.objetivo_geral}</div>}
              </div>

              {/* METAS ESPECÍFICAS */}
              <div className="metas-section">
                <h4>Metas Específicas *</h4>
                {area.metas.map((meta, metaIndex) => (
                  <div key={metaIndex} className="meta-row">
                    <div className="meta-number">Meta {metaIndex + 1}</div>
                    <div className="meta-fields">
                      <div className="form-group">
                        <label className="form-label-small">Meta *</label>
                        <input
                          type="text"
                          className={`form-input ${areaErros[`meta_${metaIndex}`] ? 'error' : ''}`}
                          placeholder="Descreva a meta específica..."
                          value={meta.meta}
                          onChange={(e) => atualizarMeta(area.area_id, metaIndex, 'meta', e.target.value)}
                          disabled={isReadOnly}
                        />
                        {areaErros[`meta_${metaIndex}`] && (
                          <div className="field-error">{areaErros[`meta_${metaIndex}`]}</div>
                        )}
                      </div>
                      <div className="form-group">
                        <label className="form-label-small">Critério de Sucesso *</label>
                        <input
                          type="text"
                          className={`form-input ${areaErros[`criterio_${metaIndex}`] ? 'error' : ''}`}
                          placeholder="Ex: 80% de acertos em 3 sessões consecutivas..."
                          value={meta.criterio_sucesso}
                          onChange={(e) => atualizarMeta(area.area_id, metaIndex, 'criterio_sucesso', e.target.value)}
                          disabled={isReadOnly}
                        />
                        {areaErros[`criterio_${metaIndex}`] && (
                          <div className="field-error">{areaErros[`criterio_${metaIndex}`]}</div>
                        )}
                      </div>
                    </div>
                    {area.metas.length > 1 && !isReadOnly && (
                      <button
                        className="btn btn-remove-small"
                        onClick={() => removerMeta(area.area_id, metaIndex)}
                        title="Remover meta"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (
                  <button
                    className="btn btn-add"
                    onClick={() => adicionarMeta(area.area_id)}
                  >
                    + Adicionar Meta
                  </button>
                )}
              </div>

              {/* ESTRATÉGIAS / PROCEDIMENTOS */}
              <div className="form-group">
                <label className="form-label">Estratégias / Procedimentos *</label>
                <textarea
                  className={`form-textarea ${areaErros.estrategias ? 'error' : ''}`}
                  placeholder="Descreva as estratégias e procedimentos que serão utilizados..."
                  value={area.estrategias}
                  onChange={(e) => atualizarArea(area.area_id, 'estrategias', e.target.value)}
                  rows={4}
                  disabled={isReadOnly}
                />
                {areaErros.estrategias && <div className="field-error">{areaErros.estrategias}</div>}
              </div>

              {/* RESPONSÁVEL E DATA */}
              <div className="info-row">
                <div className="form-group">
                  <label className="form-label">Responsável *</label>
                  <input
                    type="text"
                    className={`form-input ${areaErros.responsavel ? 'error' : ''}`}
                    placeholder="Nome do profissional responsável"
                    value={area.responsavel}
                    onChange={(e) => atualizarArea(area.area_id, 'responsavel', e.target.value)}
                    disabled={isReadOnly}
                  />
                  {areaErros.responsavel && <div className="field-error">{areaErros.responsavel}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Data de Revisão *</label>
                  <input
                    type="date"
                    className={`form-input ${areaErros.data_revisao ? 'error' : ''}`}
                    value={area.data_revisao}
                    onChange={(e) => atualizarArea(area.area_id, 'data_revisao', e.target.value)}
                    disabled={isReadOnly}
                  />
                  {areaErros.data_revisao && <div className="field-error">{areaErros.data_revisao}</div>}
                </div>
              </div>
            </article>
          );
        })}

        {!isReadOnly && (
          <button className="btn btn-add-area" onClick={adicionarArea}>
            + Adicionar Nova Área de Intervenção
          </button>
        )}
      </div>

      {/* ACTION PANEL */}
      <section className="action-panel">
        {!isReadOnly && (
          <button
            className="btn btn-finalize"
            onClick={tentarFinalizar}
          >
            ✓ Finalizar PEI
          </button>
        )}
        {isReadOnly && (
          <div className="read-only-badge">🔒 MODO VISUALIZAÇÃO</div>
        )}
      </section>

      {/* MODAL DE CONFIRMAÇÃO */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Finalização do PEI</h3>
            <p>Você revisou todas as informações do Plano Educacional Individualizado?</p>
            <p><strong>Total de áreas:</strong> {areas.length}</p>
            <p><strong>Total de metas:</strong> {areas.reduce((sum, a) => sum + a.metas.length, 0)}</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={confirmarFinalizar}>
                Confirmar e Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPEIStyles() {
  return `
    .pei-screen {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .pei-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

    .pei-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .pei-header p {
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

    .dados-consolidados {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border: 1px solid #e5e7eb;
    }

    .dados-consolidados h2 {
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

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .info-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .info-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #10b981;
    }

    .areas-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .area-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      border: 2px solid #10b981;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .area-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #d1fae5;
    }

    .area-header h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #059669;
      margin: 0;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .form-label-small {
      display: block;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #10b981;
    }

    .form-input.error {
      border-color: #dc2626;
    }

    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
      transition: border-color 0.2s;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #10b981;
    }

    .form-textarea.error {
      border-color: #dc2626;
    }

    .field-error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      font-weight: 500;
    }

    .metas-section {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .metas-section h4 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #374151;
      margin-bottom: 1rem;
    }

    .meta-row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .meta-number {
      background: #10b981;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 700;
      white-space: nowrap;
      align-self: flex-start;
    }

    .meta-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .btn:hover {
      background: #f9fafb;
      transform: translateY(-1px);
    }

    .btn-back {
      background: white;
      color: #10b981;
      border-color: white;
    }

    .btn-add {
      background: #10b981;
      color: white;
      border-color: #10b981;
      width: 100%;
    }

    .btn-add:hover {
      background: #059669;
    }

    .btn-add-area {
      background: #10b981;
      color: white;
      border-color: #10b981;
      font-size: 1.1rem;
      padding: 1rem 2rem;
      width: 100%;
    }

    .btn-add-area:hover {
      background: #059669;
    }

    .btn-remove-small {
      background: #dc2626;
      color: white;
      border-color: #dc2626;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      min-width: 40px;
    }

    .btn-remove-small:hover {
      background: #b91c1c;
    }

    .btn-finalize {
      background: #10b981;
      color: white;
      border-color: #10b981;
      font-size: 1.1rem;
      padding: 1rem 3rem;
    }

    .btn-finalize:hover {
      background: #059669;
    }

    .action-panel {
      position: sticky;
      bottom: 0;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid #10b981;
      box-shadow: 0 -4px 6px rgba(0,0,0,0.1);
      display: flex;
      justify-content: center;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .modal-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 1rem;
    }

    .modal-content p {
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      justify-content: flex-end;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
      border-color: #6b7280;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-primary {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }

    .btn-primary:hover {
      background: #059669;
    }

      @media (max-width: 768px) {
        .info-row {
          grid-template-columns: 1fr;
        }

        .meta-row {
          flex-direction: column;
        }
      }

      .read-only-badge {
        background: #ecfdf5;
        color: #059669;
        padding: 0.75rem 3rem;
        border-radius: 8px;
        font-weight: 800;
        border: 2px solid #6ee7b7;
      }
    `;
}
