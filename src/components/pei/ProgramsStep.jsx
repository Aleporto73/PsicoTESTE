import React, { useState, useEffect } from 'react';
import {
  TEACHING_PROCEDURES,
  RESOURCE_CATEGORIES,
  DECREE_ORIENTATIONS
} from '../../data/peiSchema';
import usePEICompliance from '../../hooks/usePEICompliance';

export default function ProgramsStep({
  peiPlan,
  onUpdate,
  sessionInfo
}) {
  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  const [selectedProcedures, setSelectedProcedures] = useState(
    peiPlan?.selected_procedures || []
  );
  const [orientations, setOrientations] = useState(
    peiPlan?.orientations || {
      sala_comum: '',
      aee: '',
      colaborativas: '',
      intersetoriais: ''
    }
  );
  const [selectedResources, setSelectedResources] = useState(
    peiPlan?.resources || {
      humanos: [],
      materiais: [],
      tecnologicos: [],
      ambientais: [],
      outros: ''
    }
  );
  const [charCounts, setCharCounts] = useState({
    sala_comum: orientations.sala_comum?.length || 0,
    aee: orientations.aee?.length || 0,
    colaborativas: orientations.colaborativas?.length || 0,
    intersetoriais: orientations.intersetoriais?.length || 0
  });

  const { generateAdaptations } = usePEICompliance(sessionInfo);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleProcedureToggle = (procedureId) => {
    setSelectedProcedures(prev =>
      prev.includes(procedureId)
        ? prev.filter(id => id !== procedureId)
        : [...prev, procedureId]
    );
  };

  const handleOrientationChange = (field, value) => {
    const newOrientations = { ...orientations, [field]: value };
    setOrientations(newOrientations);
    setCharCounts(prev => ({
      ...prev,
      [field]: value.length
    }));

    // Auto-save with debounce
    debounceAutoSave({ orientations: newOrientations });
  };

  const handleResourceToggle = (category, resource) => {
    setSelectedResources(prev => {
      const currentResources = prev[category] || [];
      const isSelected = currentResources.includes(resource);

      return {
        ...prev,
        [category]: isSelected
          ? currentResources.filter(r => r !== resource)
          : [...currentResources, resource]
      };
    });
  };

  const handleOtherResourcesChange = (value) => {
    setSelectedResources(prev => ({
      ...prev,
      outros: value
    }));
  };

  const handleFillSuggestions = async () => {
    // Generate suggestions from session data
    const barreiras = sessionInfo?.barreiras || [];
    const objectives = peiPlan?.objectives || [];

    const suggestions = generateAdaptations(barreiras, objectives);

    const newOrientations = {
      sala_comum: suggestions.classroomAdaptations || orientations.sala_comum,
      aee: suggestions.aeeGuidelines || orientations.aee,
      colaborativas: suggestions.colaborativas || orientations.colaborativas,
      intersetoriais: suggestions.intersetoriais || orientations.intersetoriais
    };

    setOrientations(newOrientations);
    setCharCounts({
      sala_comum: newOrientations.sala_comum.length,
      aee: newOrientations.aee.length,
      colaborativas: newOrientations.colaborativas.length,
      intersetoriais: newOrientations.intersetoriais.length
    });

    debounceAutoSave({ orientations: newOrientations });
  };

  // Auto-save with debounce
  const [debounceTimer, setDebounceTimer] = useState(null);
  const debounceAutoSave = (updates) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onUpdate({
        selected_procedures: selectedProcedures,
        orientations: updates.orientations || orientations,
        resources: selectedResources
      });
    }, 1000);

    setDebounceTimer(timer);
  };

  // Save on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      onUpdate({
        selected_procedures: selectedProcedures,
        orientations,
        resources: selectedResources
      });
    };
  }, [selectedProcedures, orientations, selectedResources, debounceTimer]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="programs-step">
      <style>{getStyles()}</style>

      {/* HEADER */}
      <header className="step-header">
        <div className="header-content">
          <h1>Etapa 3 de 4 — Programas e Adaptações</h1>
          <p>Selecione os procedimentos de ensino e defina orientações por contexto</p>
        </div>
      </header>

      <main className="step-main">
        {/* SECTION 1: PROCEDIMENTOS DE ENSINO */}
        <section className="section teaching-procedures">
          <h2>Procedimentos de Ensino</h2>
          <p className="section-help">Selecione quais procedimentos serão utilizados neste plano</p>

          <div className="procedures-grid">
            {TEACHING_PROCEDURES.map(procedure => (
              <div
                key={procedure.id}
                className={`procedure-card ${
                  selectedProcedures.includes(procedure.id) ? 'selected' : ''
                }`}
                onClick={() => handleProcedureToggle(procedure.id)}
              >
                <div className="procedure-checkbox">
                  {selectedProcedures.includes(procedure.id) ? '☑' : '☐'}
                </div>
                <div className="procedure-content">
                  <h3>{procedure.name}</h3>
                  <p className="description">{procedure.description}</p>
                  <p className="indication">
                    <strong>Indicado para:</strong> {procedure.indication}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: ORIENTAÇÕES POR CONTEXTO */}
        <section className="section orientations">
          <h2>Orientações por Contexto (Art. 12 §2)</h2>
          <p className="section-help">
            Defina como o plano será implementado em cada contexto educacional
          </p>

          <div className="orientations-container">
            {Object.entries(DECREE_ORIENTATIONS).map(([key, label]) => (
              <div key={key} className="orientation-field">
                <div className="field-header">
                  <label>{label}</label>
                  <span className="char-counter">
                    {charCounts[key] || 0} caracteres
                    {charCounts[key] < 30 && (
                      <span className="char-warning"> (mínimo 30)</span>
                    )}
                  </span>
                </div>

                <textarea
                  value={orientations[key] || ''}
                  onChange={(e) => handleOrientationChange(key, e.target.value)}
                  placeholder={getOrientationPlaceholder(key)}
                  className={charCounts[key] < 30 ? 'incomplete' : ''}
                  rows="6"
                />

                <p className="field-help">{getOrientationHelp(key)}</p>
              </div>
            ))}
          </div>

          <button
            className="btn-suggestions"
            onClick={handleFillSuggestions}
            title="Gera sugestões automáticas baseadas nos dados da avaliação"
          >
            💡 Preencher Sugestões
          </button>
        </section>

        {/* SECTION 3: RECURSOS NECESSÁRIOS */}
        <section className="section resources">
          <h2>Recursos Necessários</h2>
          <p className="section-help">Selecione os recursos que serão utilizados</p>

          <div className="resources-categories">
            {RESOURCE_CATEGORIES.map(category => (
              <div key={category.id} className="resource-category">
                <h3>{category.label}</h3>
                <div className="resource-list">
                  {category.examples.map(resource => (
                    <label key={resource} className="resource-item">
                      <input
                        type="checkbox"
                        checked={
                          (selectedResources[category.id] || []).includes(resource)
                        }
                        onChange={(e) =>
                          handleResourceToggle(category.id, resource)
                        }
                      />
                      <span>{resource}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="other-resources">
            <label>Outros recursos (especifique)</label>
            <textarea
              value={selectedResources.outros || ''}
              onChange={(e) => handleOtherResourcesChange(e.target.value)}
              placeholder="Liste aqui outros recursos não mencionados acima..."
              rows="4"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getOrientationPlaceholder(key) {
  const placeholders = {
    sala_comum: 'Descreva como o professor regente deve implementar este plano na sala de aula comum...',
    aee: 'Descreva como o professor do AEE deve trabalhar os objetivos deste plano...',
    colaborativas: 'Descreva como será o trabalho colaborativo entre professores e especialistas...',
    intersetoriais: 'Descreva a articulação necessária com saúde, assistência social e outros setores...'
  };
  return placeholders[key] || '';
}

function getOrientationHelp(key) {
  const helps = {
    sala_comum: 'Orientações para o professor regente implementar adaptações e estratégias',
    aee: 'Orientações específicas para o Atendimento Educacional Especializado',
    colaborativas: 'Como será o trabalho colaborativo entre diferentes profissionais',
    intersetoriais: 'Articulação com serviços de saúde, assistência social e outros'
  };
  return helps[key] || '';
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════

function getStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

    .programs-step {
      font-family: 'Nunito', system-ui, sans-serif;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
      min-height: 100vh;
      padding-bottom: 60px;
    }

    /* HEADER */
    .step-header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      color: white;
      padding: 30px 5%;
      box-shadow: 0 4px 20px rgba(8, 145, 178, 0.3);
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .header-content p {
      font-size: 16px;
      opacity: 0.95;
      margin: 0;
    }

    /* MAIN CONTENT */
    .step-main {
      padding: 30px 5%;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* SECTIONS */
    .section {
      background: white;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-left: 5px solid #0891b2;
    }

    .section h2 {
      font-size: 22px;
      font-weight: 800;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .section-help {
      font-size: 15px;
      color: #6b7280;
      margin: 0 0 25px 0;
    }

    /* TEACHING PROCEDURES */
    .procedures-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .procedure-card {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      gap: 15px;
      background: #fafafa;
    }

    .procedure-card:hover {
      border-color: #0891b2;
      background: #f0f9ff;
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.15);
    }

    .procedure-card.selected {
      border-color: #0891b2;
      background: #ecf8ff;
      box-shadow: 0 4px 16px rgba(8, 145, 178, 0.2);
    }

    .procedure-checkbox {
      font-size: 28px;
      flex-shrink: 0;
      color: #0891b2;
      line-height: 1;
    }

    .procedure-content h3 {
      font-size: 17px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .procedure-content .description {
      font-size: 15px;
      color: #4b5563;
      margin: 0 0 10px 0;
      line-height: 1.5;
    }

    .procedure-content .indication {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      line-height: 1.5;
    }

    .procedure-content strong {
      color: #1f2937;
    }

    /* ORIENTATIONS */
    .orientations-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 25px;
      margin-bottom: 25px;
    }

    .orientation-field {
      display: flex;
      flex-direction: column;
    }

    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .field-header label {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
    }

    .char-counter {
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
    }

    .char-warning {
      color: #dc2626;
      font-weight: 700;
    }

    .orientation-field textarea {
      font-size: 15px;
      padding: 15px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-family: 'Nunito', system-ui, sans-serif;
      resize: vertical;
      transition: all 0.3s;
      line-height: 1.6;
    }

    .orientation-field textarea:focus {
      outline: none;
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
    }

    .orientation-field textarea.incomplete {
      border-color: #fca5a5;
      background: #fef2f2;
    }

    .field-help {
      font-size: 13px;
      color: #6b7280;
      margin-top: 8px;
      font-style: italic;
    }

    .btn-suggestions {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 16px 28px;
      font-size: 16px;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 20px;
      min-height: 48px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .btn-suggestions:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }

    .btn-suggestions:active {
      transform: translateY(0);
    }

    /* RESOURCES */
    .resources-categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .resource-category {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
    }

    .resource-category h3 {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 15px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #d1d5db;
    }

    .resource-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .resource-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      color: #374151;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .resource-item:hover {
      background: rgba(8, 145, 178, 0.1);
    }

    .resource-item input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #0891b2;
    }

    .other-resources {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
    }

    .other-resources label {
      display: block;
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 12px;
    }

    .other-resources textarea {
      font-size: 15px;
      padding: 15px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-family: 'Nunito', system-ui, sans-serif;
      resize: vertical;
      transition: all 0.3s;
      width: 100%;
      box-sizing: border-box;
      line-height: 1.6;
    }

    .other-resources textarea:focus {
      outline: none;
      border-color: #0891b2;
      box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .step-header {
        padding: 25px 5%;
      }

      .header-content h1 {
        font-size: 24px;
      }

      .header-content p {
        font-size: 14px;
      }

      .step-main {
        padding: 20px 5%;
      }

      .section {
        padding: 20px;
        margin-bottom: 20px;
      }

      .procedures-grid {
        grid-template-columns: 1fr;
      }

      .orientations-container {
        grid-template-columns: 1fr;
      }

      .resources-categories {
        grid-template-columns: 1fr;
      }
    }
  `;
}
