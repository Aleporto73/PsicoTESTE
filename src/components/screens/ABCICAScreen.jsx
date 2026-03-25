/*
 * ABCICAScreen - ABC/ICA (Autism Behavior Checklist)
 *
 * 2 estagios:
 * 1) Aplicacao - subescala por subescala, SIM/NAO binario
 * 2) Resultados - scores, graficos, classificacao
 *
 * Publico: profissionais 50+, design claro e grande
 */

import React, { useState, useRef } from 'react';
import useABCICALogic from '../../hooks/useABCICALogic';
import { ABC_ICA_ITEMS, ABC_ICA_SUBSCALES, ABC_ICA_CLASSIFICATION } from '../../data/instruments/abc_ica';
import { ABCICARadarChart, ABCICASubscaleBars } from '../charts/ABCICAChart';
import { downloadABCICAPDF } from '../reports/ABCICAPDFReport';

export default function ABCICAScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  const logic = useABCICALogic(sessionInfo, isReadOnly);
  const [stage, setStage] = useState(logic.scores ? 'results' : 'application');
  const topRef = useRef(null);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ===================================
  // ESTAGIO 1: APLICACAO
  // ===================================
  if (stage === 'application') {
    const sub = logic.currentSubscale;
    const items = logic.currentItems;
    const prog = logic.getSubscaleProgress(sub?.id);

    return (
      <div style={S.container} ref={topRef}>
        <TopBar
          childName={sessionInfo?.child_name}
          progress={logic.progress}
          onBack={onBack}
        />

        <SubscaleNav
          subscales={logic.subscales}
          currentIndex={logic.subscaleIndex}
          getProgress={logic.getSubscaleProgress}
          onSelect={(idx) => { logic.goToSubscale(idx); scrollToTop(); }}
        />

        {sub && (
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <div>
                <h2 style={S.sectionTitle}>
                  <span style={{ ...S.subscaleBadge, background: sub.color, color: 'white' }}>
                    {sub.shortName}
                  </span>
                  {sub.name}
                </h2>
                <p style={S.sectionDesc}>{sub.description}</p>
              </div>
              <div style={S.sectionMeta}>
                <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                  {prog.answered}/{prog.total} respondidos
                </span>
                <ProgressBar percent={prog.percent} color={sub.color} />
              </div>
            </div>

            {!isReadOnly && (
              <div style={S.quickActions}>
                <button onClick={logic.markAllYes} style={{ ...S.btnQuick, background: '#dcfce7', color: '#166534' }}>
                  {'Todos SIM'}
                </button>
                <button onClick={logic.markAllNo} style={{ ...S.btnQuick, background: '#fee2e2', color: '#991b1b' }}>
                  {'Todos NÃO'}
                </button>
              </div>
            )}

            <div style={S.itemsList}>
              {items.map(item => {
                const val = logic.responses[String(item.num)];
                const answered = val !== undefined;
                return (
                  <div key={item.num} style={{
                    ...S.itemCard,
                    borderLeft: `4px solid ${answered ? (val ? sub.color : '#cbd5e1') : '#e2e8f0'}`,
                    background: answered ? (val ? sub.bg : '#f8fafc') : 'white',
                  }}>
                    <div style={S.itemInfo}>
                      <span style={S.itemNum}>{item.num}</span>
                      <span style={S.itemDesc}>{item.desc}</span>
                      <span style={S.itemWeight} title="Peso do item">
                        {item.weight}pt{item.weight > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={S.itemActions}>
                      <button
                        onClick={() => logic.setItemResponse(item.num, true)}
                        disabled={isReadOnly}
                        style={{
                          ...S.btnAnswer,
                          background: val === true ? sub.color : '#f1f5f9',
                          color: val === true ? 'white' : '#64748b',
                          fontWeight: val === true ? 800 : 600,
                        }}
                      >
                        SIM
                      </button>
                      <button
                        onClick={() => logic.setItemResponse(item.num, false)}
                        disabled={isReadOnly}
                        style={{
                          ...S.btnAnswer,
                          background: val === false ? '#475569' : '#f1f5f9',
                          color: val === false ? 'white' : '#64748b',
                          fontWeight: val === false ? 800 : 600,
                        }}
                      >
                        {'NÃO'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={S.navRow}>
              <button
                onClick={() => { logic.prevSubscale(); scrollToTop(); }}
                disabled={logic.subscaleIndex === 0}
                style={{ ...S.btnNav, opacity: logic.subscaleIndex === 0 ? 0.4 : 1 }}
              >
                {'← Anterior'}
              </button>

              {logic.isLastSubscale ? (
                <button
                  onClick={() => {
                    const result = logic.calculateScores();
                    setStage('results');
                    scrollToTop();
                  }}
                  style={{ ...S.btnNav, background: '#10b981', color: 'white', border: 'none' }}
                >
                  Calcular Resultados
                </button>
              ) : (
                <button
                  onClick={() => { logic.nextSubscale(); scrollToTop(); }}
                  style={{ ...S.btnNav, background: sub.color, color: 'white', border: 'none' }}
                >
                  {'Próxima →'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================================
  // ESTAGIO 2: RESULTADOS
  // ===================================
  if (stage === 'results' && logic.scores) {
    return (
      <div style={S.container} ref={topRef}>
        <TopBar
          childName={sessionInfo?.child_name}
          progress={logic.progress}
          onBack={() => setStage('application')}
          backLabel={'← Voltar à Aplicação'}
        />

        <ClassificationCard scores={logic.scores} />

        <div style={S.subscaleCardsRow}>
          {ABC_ICA_SUBSCALES.map(sub => {
            const ss = logic.scores.subscaleScores[sub.id];
            return (
              <div key={sub.id} style={{ ...S.subscaleCard, borderTop: `4px solid ${sub.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                    {sub.shortName} {' — '} {sub.name}
                  </span>
                  <span style={{ fontWeight: 800, color: sub.color, fontSize: '1.2rem' }}>
                    {ss.score}/{ss.maxPossible}
                  </span>
                </div>
                <ProgressBar percent={ss.percent} color={sub.color} />
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {ss.answered}/{ss.total} itens respondidos {' — '} {ss.percent}%
                </p>
              </div>
            );
          })}
        </div>

        {/* Radar pentagonal */}
        <div style={{ marginBottom: '16px' }}>
          <ABCICARadarChart subscaleScores={logic.scores.subscaleScores} />
        </div>

        {/* Barras horizontais */}
        <div style={{ marginBottom: '16px' }}>
          <ABCICASubscaleBars subscaleScores={logic.scores.subscaleScores} />
        </div>

        <DetailTable scores={logic.scores} responses={logic.responses} />

        <div style={{ ...S.navRow, marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setStage('application')} style={S.btnNav}>
            {'← Editar Respostas'}
          </button>
          <button
            onClick={() => {
              try {
                downloadABCICAPDF(
                  { nome: sessionInfo?.child_name, idade: sessionInfo?.child_age },
                  logic.scores,
                  logic.responses
                );
              } catch (e) {
                alert('Erro ao gerar PDF: ' + e.message);
              }
            }}
            style={{ ...S.btnNav, background: '#e11d48', color: 'white', border: 'none' }}
          >
            Baixar PDF
          </button>
          <button
            onClick={() => {
              onFinalize({
                responses: logic.responses,
                scores: logic.scores,
              });
            }}
            style={{ ...S.btnNav, background: '#6366f1', color: 'white', border: 'none' }}
          >
            Finalizar e Salvar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p>Carregando ABC/ICA...</p>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTES
// ==========================================

function TopBar({ childName, progress, onBack, backLabel }) {
  return (
    <div style={S.topBar}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
          ABC / ICA
        </h1>
        <p style={{ margin: '2px 0 0', color: '#475569', fontSize: '0.9rem' }}>
          {childName || 'Criança'} {' — '} {progress.answeredItems}/{progress.totalItems} itens ({progress.percentItems}%)
        </p>
      </div>
      {onBack && (
        <button onClick={onBack} style={S.btnBack}>
          {backLabel || '← Voltar'}
        </button>
      )}
    </div>
  );
}

function SubscaleNav({ subscales, currentIndex, getProgress, onSelect }) {
  return (
    <div style={S.navStrip}>
      {subscales.map((sub, idx) => {
        const prog = getProgress(sub.id);
        const isCurrent = idx === currentIndex;
        return (
          <button
            key={sub.id}
            onClick={() => onSelect(idx)}
            style={{
              ...S.navPill,
              background: isCurrent ? sub.color : prog.complete ? sub.bg : '#f1f5f9',
              color: isCurrent ? 'white' : prog.complete ? sub.color : '#64748b',
              fontWeight: isCurrent ? 800 : 600,
              border: isCurrent ? `2px solid ${sub.color}` : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: '0.8rem' }}>{sub.shortName}</span>
            {prog.complete && !isCurrent && <span style={{ fontSize: '0.7rem' }}>{' ✓'}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ProgressBar({ percent, color }) {
  return (
    <div style={S.progressTrack}>
      <div style={{ ...S.progressFill, width: `${percent}%`, background: color }} />
    </div>
  );
}

function ClassificationCard({ scores }) {
  const c = scores.classification;
  return (
    <div style={{ ...S.classCard, borderLeft: `6px solid ${c.color}`, background: c.bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>{'Pontuação Total'}</p>
          <p style={{ margin: '4px 0', fontSize: '2.2rem', fontWeight: 900, color: c.color }}>
            {scores.totalScore} / {scores.maxPossible}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            {scores.totalPercent}% {'da pontuação máxima'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>{'Classificação'}</p>
          <p style={{
            margin: '4px 0 0',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: c.color,
            padding: '6px 16px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '10px',
          }}>
            {c.label}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {ABC_ICA_CLASSIFICATION.map(cl => (
          <span key={cl.level} style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: cl.level === c.level ? 800 : 500,
            background: cl.level === c.level ? cl.color : '#f1f5f9',
            color: cl.level === c.level ? 'white' : '#64748b',
          }}>
            {cl.min}-{cl.max === 999 ? '+' : cl.max}: {cl.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailTable({ scores, responses }) {
  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>Detalhamento por Item</h2>
      {ABC_ICA_SUBSCALES.map(sub => {
        const ss = scores.subscaleScores[sub.id];
        const subItems = ABC_ICA_ITEMS.filter(i => i.subscale === sub.id);
        return (
          <div key={sub.id} style={{ marginBottom: '16px' }}>
            <div style={{
              background: sub.color,
              color: 'white',
              padding: '8px 14px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>{sub.shortName} {' — '} {sub.name}</span>
              <span>{ss.score}/{ss.maxPossible} ({ss.percent}%)</span>
            </div>
            <table style={S.table}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ ...S.th, width: '50px' }}>{'Nº'}</th>
                  <th style={{ ...S.th, textAlign: 'left' }}>Comportamento</th>
                  <th style={{ ...S.th, width: '60px' }}>Peso</th>
                  <th style={{ ...S.th, width: '80px' }}>Resposta</th>
                  <th style={{ ...S.th, width: '60px' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {subItems.map((item, idx) => {
                  const val = responses[String(item.num)];
                  const pts = val === true ? item.weight : 0;
                  return (
                    <tr key={item.num} style={{ background: idx % 2 === 0 ? '#fafbfc' : 'white' }}>
                      <td style={{ ...S.td, textAlign: 'center', fontWeight: 700 }}>{item.num}</td>
                      <td style={S.td}>{item.desc}</td>
                      <td style={{ ...S.td, textAlign: 'center', color: '#64748b' }}>{item.weight}</td>
                      <td style={{
                        ...S.td,
                        textAlign: 'center',
                        fontWeight: 700,
                        color: val === true ? sub.color : val === false ? '#94a3b8' : '#cbd5e1',
                      }}>
                        {val === true ? 'SIM' : val === false ? 'NÃO' : '—'}
                      </td>
                      <td style={{
                        ...S.td,
                        textAlign: 'center',
                        fontWeight: 700,
                        color: pts > 0 ? sub.color : '#cbd5e1',
                      }}>
                        {pts}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const S = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    background: 'white',
    padding: '14px 20px',
    borderRadius: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  btnBack: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: 'white',
    color: '#475569',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  navStrip: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
    padding: '12px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  navPill: {
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    border: 'none',
    transition: 'all 0.2s',
  },
  section: {
    background: 'white',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: {
    margin: '0 0 4px',
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionDesc: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9rem',
  },
  sectionMeta: {
    textAlign: 'right',
    minWidth: '140px',
  },
  subscaleBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  quickActions: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
  },
  btnQuick: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  itemCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '10px',
    transition: 'all 0.15s',
    gap: '12px',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  itemNum: {
    fontWeight: 800,
    color: '#475569',
    fontSize: '0.9rem',
    minWidth: '28px',
  },
  itemDesc: {
    fontSize: '0.95rem',
    color: '#334155',
    lineHeight: 1.4,
    flex: 1,
  },
  itemWeight: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    background: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  itemActions: {
    display: 'flex',
    gap: '8px',
  },
  btnAnswer: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    minWidth: '64px',
    transition: 'all 0.15s',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '16px',
  },
  btnNav: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: 'white',
    color: '#475569',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    marginTop: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  classCard: {
    padding: '20px 24px',
    borderRadius: '14px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  subscaleCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  subscaleCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    padding: '10px 12px',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#475569',
    textAlign: 'center',
    borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.9rem',
    color: '#334155',
  },
};
