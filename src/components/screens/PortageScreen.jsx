/*
 * PortageScreen - Guia Portage de Educação Pré-Escolar
 *
 * INTELIGENTE:
 * - AUTOMÁTICO: Criança de 3a3m → abre direto na faixa 3-4 anos
 * - MANUAL: Toggle para escolher outras faixas
 * - Gráficos só mostram faixas aplicadas
 * - Fluxo linear área por área
 */

import React, { useState, useRef } from 'react';
import usePortageLogic, { toArray } from '../../hooks/usePortageLogic';
import {
  DevelopmentalAgeChart,
  AreaBreakdownChart,
  OverallRadarChart,
  AreaSummaryCards,
} from '../charts/PortageChart';

export default function PortageScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  const logic = usePortageLogic(sessionInfo, isReadOnly);
  const [stage, setStage] = useState(logic.scores ? 'scoring' : 'application');
  const topRef = useRef(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ═════════════════════════════
  // ESTÁGIO 1: APLICAÇÃO
  // ═════════════════════════════
  if (stage === 'application') {
    const step = logic.currentStep;
    const area = step ? logic.areas[step.areaId] : null;
    const range = step ? logic.ageRanges.find(r => r.id === step.rangeId) : null;
    const items = step ? toArray(logic.items[step.areaId]?.[step.rangeId]) : [];

    // Fim do fluxo
    if (!step && logic.progress.answered > 0) {
      return (
        <div style={S.container} ref={topRef}>
          <TopBar childName={sessionInfo?.child_name} childAge={logic.childAge} stage="application" />
          <div style={S.doneCard}>
            <div style={{ fontSize: '2rem' }}>✓</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: '8px 0' }}>
              Aplicação Concluída!
            </div>
            <p style={{ color: '#64748b' }}>
              {logic.progress.answered} itens respondidos em {logic.activeRanges.length} faixa(s).
            </p>
            <button onClick={() => { logic.handleCalculateScores(); setStage('scoring'); }} style={S.btnPrimary}>
              Ver Resultados →
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={S.container} ref={topRef}>
        <TopBar childName={sessionInfo?.child_name} childAge={logic.childAge} stage="application" />

        {/* ── PAINEL DE CONTROLE ── */}
        <div style={S.controlPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                Idade: <strong>{logic.childAge ? `${logic.childAge} anos` : '?'}</strong>
                {' → Faixa: '}
                <strong style={{ color: '#6366f1' }}>
                  {logic.childRangeId.replace('_', '-')} anos
                </strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Seletor Auto/Manual - botões segmentados */}
              <div style={{
                display: 'flex',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '2px solid #6366f1',
                background: '#f1f5f9',
              }}>
                <button
                  onClick={() => logic.mode !== 'auto' && logic.toggleMode()}
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: logic.mode === 'auto' ? '#6366f1' : 'transparent',
                    color: logic.mode === 'auto' ? '#fff' : '#64748b',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🎯 Automático
                </button>
                <button
                  onClick={() => logic.mode !== 'manual' && logic.toggleMode()}
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    borderLeft: '2px solid #6366f1',
                    cursor: 'pointer',
                    background: logic.mode === 'manual' ? '#6366f1' : 'transparent',
                    color: logic.mode === 'manual' ? '#fff' : '#64748b',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ✏️ Manual
                </button>
              </div>
              <button onClick={onBack} style={S.btnSmall}>← Sair</button>
            </div>
          </div>

          {/* Seletor de faixas (só aparece no modo manual) */}
          {logic.mode === 'manual' && (
            <div style={{ marginTop: '12px', padding: '10px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, marginBottom: '8px' }}>
                Selecione as faixas etárias a aplicar:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {logic.ageRanges.map(r => {
                  const isActive = logic.manualRanges[r.id];
                  const isChildRange = r.id === logic.childRangeId;
                  return (
                    <button
                      key={r.id}
                      onClick={() => logic.toggleManualRange(r.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: `2px solid ${isActive ? '#6366f1' : '#e2e8f0'}`,
                        background: isActive ? '#6366f1' : '#fff',
                        color: isActive ? '#fff' : '#64748b',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      {r.label}
                      {isChildRange && <span style={{ marginLeft: '4px', fontSize: '0.65rem' }}>★</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── MAPA DE PROGRESSO ── */}
        {logic.flowSteps.length > 0 && (
          <StepMap
            steps={logic.flowSteps}
            currentIndex={logic.flowIndex}
            areas={logic.areas}
            responses={logic.responses}
            items={logic.items}
            onGoToStep={(idx) => { logic.goToStep(idx); scrollToTop(); }}
          />
        )}

        {/* ── FORMULÁRIO DO PASSO ATUAL ── */}
        {step && area && range && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ ...S.sectionHeader, borderLeft: `5px solid ${area.color}` }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Passo {logic.flowIndex + 1} de {logic.flowSteps.length}
                </div>
                <h2 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                  {area.name}
                </h2>
                <div style={{ fontSize: '0.9rem', color: area.color, fontWeight: 600, marginTop: '2px' }}>
                  {range.label} · {items.length} itens
                </div>
              </div>
              {!isReadOnly && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => markAll(items, step.areaId, step.rangeId, 'sim', logic.handleResponseChange)} style={S.btnQuick}>
                    Todos Sim
                  </button>
                  <button onClick={() => markRest(items, step.areaId, step.rangeId, 'na', logic.responses, logic.handleResponseChange)} style={S.btnQuick}>
                    Restantes NA
                  </button>
                </div>
              )}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {items.map(item => {
                const key = `${step.areaId}_${step.rangeId}_${item.number}`;
                const value = logic.responses[key];
                return (
                  <ItemRow
                    key={key}
                    item={item}
                    value={value}
                    areaColor={area.color}
                    isReadOnly={isReadOnly}
                    onChange={(answer) => logic.handleResponseChange(step.areaId, step.rangeId, item.number, answer)}
                  />
                );
              })}
            </div>

            {/* Navegação */}
            <NavBar
              flowIndex={logic.flowIndex}
              totalSteps={logic.flowSteps.length}
              answeredInStep={items.filter(i => !!logic.responses[`${step.areaId}_${step.rangeId}_${i.number}`]).length}
              totalInStep={items.length}
              onPrev={() => { logic.handlePrevStep(); scrollToTop(); }}
              onNext={() => {
                const ok = logic.handleNextStep();
                if (!ok) { logic.handleCalculateScores(); setStage('scoring'); }
                scrollToTop();
              }}
              onCalculate={() => { logic.handleCalculateScores(); setStage('scoring'); }}
              totalAnswered={logic.progress.answered}
            />
          </div>
        )}

        {/* Sem passos (nenhuma faixa ativa no manual) */}
        {logic.flowSteps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p>Nenhuma faixa etária selecionada.</p>
            <p style={{ fontSize: '0.85rem' }}>
              {logic.mode === 'auto' ? 'Verifique a idade da criança.' : 'Selecione pelo menos uma faixa acima.'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════════
  // ESTÁGIO 2: PONTUAÇÃO
  // ═════════════════════════════
  if (stage === 'scoring') {
    const cs = logic.scores || logic.handleCalculateScores();
    const summary = cs.filteredSummary || cs.summary;
    const devAge = cs.filteredDevAge ?? cs.overallDevelopmentalAge;
    const appliedRanges = cs.activeRanges || logic.activeRanges;

    // Filtrar byArea para gráficos — só mostrar faixas aplicadas
    const filteredByArea = {};
    Object.entries(cs.byArea).forEach(([areaId, areaData]) => {
      filteredByArea[areaId] = {
        ...areaData,
        byRange: {},
      };
      appliedRanges.forEach(rangeId => {
        if (areaData.byRange[rangeId]) {
          filteredByArea[areaId].byRange[rangeId] = areaData.byRange[rangeId];
        }
      });
    });

    return (
      <div style={S.container} ref={topRef}>
        <TopBar childName={sessionInfo?.child_name} childAge={logic.childAge} stage="scoring" />

        {/* Resultado geral */}
        <div style={S.overallCard}>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Idade de Desenvolvimento</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#1e293b' }}>
            {devAge.toFixed(2)}
            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}> anos</span>
          </div>
          {logic.childAge && (
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px' }}>
              Idade cronológica: <strong>{logic.childAge} anos</strong>
              {' · '}
              {(() => {
                const risk = logic.getPortageRiskLevel(devAge, logic.childAge);
                const c = { adequado: '#3b82f6', 'atenção': '#f59e0b', atraso: '#f43f5e' };
                const l = { adequado: 'Adequado', 'atenção': 'Atenção', atraso: 'Atraso' };
                return <span style={{ color: c[risk], fontWeight: 700 }}>{l[risk]}</span>;
              })()}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>
            Faixas avaliadas: {appliedRanges.map(r => r.replace('_', '-')).join(', ')} anos
          </div>
        </div>

        {/* Cards por área */}
        <div style={{ margin: '1.5rem 0' }}>
          <AreaSummaryCards
            summary={summary}
            chronologicalAge={logic.childAge}
            getPortageRiskLevel={logic.getPortageRiskLevel}
          />
        </div>

        {/* Gráficos */}
        <div style={S.chartsGrid}>
          <div style={S.chartCard}>
            <DevelopmentalAgeChart summary={summary} chronologicalAge={logic.childAge} />
          </div>
          <div style={S.chartCard}>
            <OverallRadarChart summary={summary} />
          </div>
        </div>

        {/* Detalhamento (só faixas aplicadas) */}
        <h3 style={{ margin: '1.5rem 0 1rem', color: '#1e293b', fontWeight: 700 }}>Detalhamento por Área</h3>
        <div style={S.chartsGrid}>
          {summary.map(s => (
            <div key={s.area} style={S.chartCard}>
              <AreaBreakdownChart areaData={filteredByArea[s.area]} areaName={s.name} />
            </div>
          ))}
        </div>

        {/* Botões */}
        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setStage('application')} style={S.btnSecondary}>← Aplicação</button>
          <button onClick={() => setStage('report')} style={S.btnPrimary}>Relatório →</button>
        </div>
      </div>
    );
  }

  // ═════════════════════════════
  // ESTÁGIO 3: RELATÓRIO
  // ═════════════════════════════
  if (stage === 'report') {
    return (
      <div style={S.container} ref={topRef}>
        <TopBar childName={sessionInfo?.child_name} childAge={logic.childAge} stage="report" />

        {!logic.report && !logic.loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Gerar relatório interpretativo via IA.</p>
            <button onClick={() => logic.handleGenerateReport()} style={S.btnPrimary}>
              Gerar Relatório com IA
            </button>
          </div>
        )}

        {logic.loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={S.spinner} />
            <p style={{ color: '#64748b', marginTop: '1rem' }}>Gerando relatório...</p>
          </div>
        )}

        {logic.error && (
          <div style={S.errorBox}>
            <strong>Erro:</strong> {logic.error}
            <button onClick={() => logic.handleGenerateReport()} style={{ ...S.btnSmall, marginTop: '8px' }}>
              Tentar novamente
            </button>
          </div>
        )}

        {logic.report && (
          <div style={S.reportBox}>
            <h3 style={{ margin: '0 0 1rem', color: '#1e293b' }}>Relatório Interpretativo</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#374151' }}>{logic.report}</div>
            <div style={S.disclaimer}>
              Relatório gerado por IA como apoio descritivo. Não constitui diagnóstico clínico.
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setStage('scoring')} style={S.btnSecondary}>← Pontuação</button>
          <button onClick={() => { if (onFinalize) onFinalize(logic.getPayload()); }} style={S.btnFinalize}>
            ✓ Finalizar Avaliação
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function markAll(items, areaId, rangeId, value, onChange) {
  items.forEach(item => onChange(areaId, rangeId, item.number, value));
}
function markRest(items, areaId, rangeId, value, responses, onChange) {
  items.forEach(item => {
    const key = `${areaId}_${rangeId}_${item.number}`;
    if (!responses[key]) onChange(areaId, rangeId, item.number, value);
  });
}

// ═══════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════

function TopBar({ childName, childAge, stage }) {
  const labels = { application: 'Aplicação', scoring: 'Pontuação', report: 'Relatório' };
  const icons = { application: '📋', scoring: '📊', report: '📄' };
  return (
    <div style={S.header}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>Guia Portage</h1>
        <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
          {childName}{childAge ? ` · ${childAge} anos` : ''}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {['application', 'scoring', 'report'].map(s => (
          <span key={s} style={{
            padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
            background: stage === s ? '#6366f1' : '#f1f5f9',
            color: stage === s ? '#fff' : '#94a3b8',
          }}>
            {icons[s]} {labels[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepMap({ steps, currentIndex, areas, responses, items, onGoToStep }) {
  // Agrupar por área
  const groups = {};
  steps.forEach((step, idx) => {
    if (!groups[step.areaId]) groups[step.areaId] = [];
    groups[step.areaId].push({ ...step, idx });
  });

  return (
    <div style={S.stepMap}>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>MAPA DE APLICAÇÃO</div>
      {Object.entries(groups).map(([areaId, areaSteps]) => {
        const area = areas[areaId];
        return (
          <div key={areaId} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: area.color, minWidth: '28px' }}>
              {area.name.substring(0, 3)}
            </span>
            {areaSteps.map(step => {
              const stepItems = toArray(items[step.areaId]?.[step.rangeId]);
              const answered = stepItems.filter(i => !!responses[`${step.areaId}_${step.rangeId}_${i.number}`]).length;
              const complete = answered === stepItems.length && stepItems.length > 0;
              const isCurrent = step.idx === currentIndex;
              const parts = step.rangeId.split('_');

              return (
                <div
                  key={step.idx}
                  onClick={() => onGoToStep(step.idx)}
                  title={`${area.name} ${parts[0]}-${parts[1]} anos (${answered}/${stepItems.length})`}
                  style={{
                    width: '40px', height: '26px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                    border: isCurrent ? `2px solid ${area.color}` : '2px solid transparent',
                    background: complete ? area.color : answered > 0 ? `${area.color}30` : '#f1f5f9',
                    color: complete ? '#fff' : isCurrent ? area.color : '#94a3b8',
                    transition: 'all 0.2s',
                  }}
                >
                  {parts[0]}-{parts[1]}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function ItemRow({ item, value, areaColor, isReadOnly, onChange }) {
  const opts = [
    { v: 'sim', l: 'Sim', c: '#3b82f6', bg: '#dbeafe' },
    { v: 'nao', l: 'Não', c: '#f43f5e', bg: '#ffe4e6' },
    { v: 'as_vezes', l: 'Às vezes', c: '#f59e0b', bg: '#fef3c7' },
    { v: 'na', l: 'NA', c: '#94a3b8', bg: '#f1f5f9' },
  ];

  return (
    <div style={{ ...S.itemCard, borderLeft: `3px solid ${value ? areaColor : '#e2e8f0'}`, background: value ? '#fafbff' : '#fff' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.85rem', marginRight: '6px' }}>{item.number}</span>
        <span style={{ color: '#374151', fontSize: '0.9rem' }}>{item.text}</span>
      </div>
      <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
        {opts.map(o => (
          <button
            key={o.v}
            onClick={() => !isReadOnly && onChange(o.v)}
            disabled={isReadOnly}
            style={{
              padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
              border: `2px solid ${value === o.v ? o.c : '#e2e8f0'}`,
              background: value === o.v ? o.bg : '#fff',
              color: value === o.v ? o.c : '#94a3b8',
              cursor: isReadOnly ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavBar({ flowIndex, totalSteps, answeredInStep, totalInStep, onPrev, onNext, onCalculate, totalAnswered }) {
  const allDone = answeredInStep === totalInStep;
  const isLast = flowIndex === totalSteps - 1;

  return (
    <div style={S.navBar}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
        <span style={{ color: '#64748b' }}>
          {answeredInStep}/{totalInStep} itens
          {allDone && <span style={{ color: '#3b82f6', fontWeight: 700, marginLeft: '6px' }}>✓</span>}
        </span>
        <span style={{ color: '#6366f1', fontWeight: 600 }}>Passo {flowIndex + 1}/{totalSteps}</span>
      </div>
      <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '12px' }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          background: allDone ? '#3b82f6' : '#6366f1',
          width: `${totalInStep > 0 ? (answeredInStep / totalInStep) * 100 : 0}%`,
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {flowIndex > 0 && <button onClick={onPrev} style={S.btnSecondary}>← Anterior</button>}
        <button onClick={onNext} style={{ ...S.btnPrimary, opacity: allDone ? 1 : 0.7 }}>
          {isLast ? '✓ Concluir Aplicação' : 'Próximo →'}
        </button>
        {totalAnswered > 0 && (
          <button onClick={onCalculate} style={S.btnCalc}>Calcular Agora</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════

const S = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1.5rem 2rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' },
  controlPanel: { background: '#fff', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', marginBottom: '12px' },
  stepMap: { background: '#fff', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  sectionHeader: { background: '#fff', padding: '1.2rem 1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' },
  itemCard: { borderRadius: '8px', padding: '10px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  navBar: { marginTop: '1.5rem', padding: '1.2rem 1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  doneCard: { textAlign: 'center', background: '#fff', borderRadius: '16px', padding: '3rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '2rem' },
  overallCard: { textAlign: 'center', background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', marginBottom: '1rem' },
  chartCard: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' },
  reportBox: { background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' },
  errorBox: { background: '#ffe4e6', border: '1px solid #f43f5e', borderRadius: '8px', padding: '1rem', color: '#be123c', textAlign: 'center' },
  disclaimer: { marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' },
  btnPrimary: { padding: '0.6rem 1.8rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' },
  btnFinalize: { padding: '0.6rem 1.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' },
  btnSecondary: { padding: '0.5rem 1.2rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  btnCalc: { padding: '0.5rem 1.2rem', background: '#ede9fe', color: '#6366f1', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  btnSmall: { padding: '4px 10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  btnQuick: { padding: '4px 10px', background: '#ede9fe', color: '#6366f1', border: 'none', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
};
