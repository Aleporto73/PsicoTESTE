/*
 * CARS2Screen - CARS-2 ST (Childhood Autism Rating Scale)
 *
 * 2 estagios:
 * 1) Aplicacao - 15 itens, cada um com opcoes descritivas
 * 2) Resultados - scores, T-escore, percentil, graficos, classificacao
 *
 * Publico: profissionais 50+, design claro, opcoes com texto descritivo
 */

import React, { useState } from 'react';
import useCARS2Logic from '../../hooks/useCARS2Logic';
import { CARS2_ITEMS, CARS2_SCORE_OPTIONS, CARS2_CLASSIFICATION } from '../../data/instruments/cars2';
import { CARS2RadarChart, CARS2ItemBars } from '../charts/CARS2Chart';
import { downloadCARS2PDF } from '../reports/CARS2PDFReport';

const ACCENT = '#7c3aed';

export default function CARS2Screen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  const logic = useCARS2Logic(sessionInfo, isReadOnly);
  const [stage, setStage] = useState(logic.scores ? 'results' : 'application');
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ===================================
  // ESTAGIO 1: APLICACAO
  // ===================================
  if (stage === 'application') {
    return (
      <div style={S.container}>
        <TopBar
          childName={sessionInfo?.child_name}
          progress={logic.progress}
          onBack={onBack}
        />

        {/* Barra de progresso global */}
        <div style={S.progressSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
              {'Progresso: ' + logic.progress.answeredItems + '/' + logic.progress.totalItems + ' itens'}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: ACCENT }}>
              {logic.progress.percent + '%'}
            </span>
          </div>
          <ProgressBar percent={logic.progress.percent} color={ACCENT} />
        </div>

        {/* Lista de itens com opcoes descritivas */}
        <div style={S.section}>
          <div style={S.itemsList}>
            {CARS2_ITEMS.map(item => {
              const val = logic.responses[String(item.num)];
              const answered = val !== undefined && val !== null;
              return (
                <div key={item.num} style={{
                  ...S.itemCard,
                  borderLeft: answered ? '5px solid ' + getSeverityColor(val) : '5px solid #e2e8f0',
                  background: answered ? getSeverityBg(val) : 'white',
                }}>
                  {/* Cabecalho do item */}
                  <div style={S.itemHeader}>
                    <span style={S.itemNum}>{item.num}</span>
                    <div style={{ flex: 1 }}>
                      <span style={S.itemName}>{item.name}</span>
                      <p style={S.itemDesc}>{item.desc}</p>
                    </div>
                    {answered && (
                      <span style={{
                        fontSize: '1.2rem', fontWeight: 800, color: getSeverityColor(val),
                        background: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: '8px',
                      }}>
                        {val}
                      </span>
                    )}
                  </div>

                  {/* Opcoes com texto descritivo - layout vertical */}
                  <div style={S.optionsList}>
                    {CARS2_SCORE_OPTIONS.map(opt => {
                      const isSelected = val === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => logic.setItemResponse(item.num, opt.value)}
                          disabled={isReadOnly}
                          style={{
                            ...S.btnOption,
                            background: isSelected ? getSeverityColor(opt.value) : '#f8fafc',
                            color: isSelected ? 'white' : '#475569',
                            fontWeight: isSelected ? 800 : 600,
                            border: isSelected
                              ? '2px solid ' + getSeverityColor(opt.value)
                              : '2px solid #e2e8f0',
                            boxShadow: isSelected ? '0 2px 8px ' + getSeverityColor(opt.value) + '40' : 'none',
                          }}
                        >
                          <span style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            minWidth: '32px',
                            textAlign: 'center',
                          }}>
                            {opt.label}
                          </span>
                          <span style={{ fontSize: '0.9rem', flex: 1 }}>
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={S.navRow}>
            <button onClick={onBack} style={S.btnNav}>
              {'← Voltar'}
            </button>
            <button
              onClick={() => {
                logic.calculateScores();
                setStage('results');
                scrollToTop();
              }}
              disabled={logic.progress.answeredItems === 0}
              style={{
                ...S.btnNav,
                background: logic.progress.isComplete ? '#10b981' : ACCENT,
                color: 'white',
                border: 'none',
                opacity: logic.progress.answeredItems === 0 ? 0.5 : 1,
              }}
            >
              {logic.progress.isComplete
                ? 'Calcular Resultados'
                : 'Calcular (' + logic.progress.answeredItems + '/' + logic.progress.totalItems + ')'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================================
  // ESTAGIO 2: RESULTADOS
  // ===================================
  if (stage === 'results' && logic.scores) {
    const sc = logic.scores;
    return (
      <div style={S.container}>
        <TopBar
          childName={sessionInfo?.child_name}
          progress={logic.progress}
          onBack={() => setStage('application')}
          backLabel={'← Voltar à Aplicação'}
        />

        {/* Card principal: classificacao */}
        <ClassificationCard scores={sc} />

        {/* Cards resumo: T-Escore + Percentil */}
        <div style={S.summaryRow}>
          <div style={{ ...S.summaryCard, borderTop: '4px solid ' + ACCENT }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{'T-Escore'}</span>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: ACCENT }}>{sc.tScore}</span>
          </div>
          <div style={{ ...S.summaryCard, borderTop: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{'Percentil'}</span>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb' }}>{sc.percentile}</span>
          </div>
          <div style={{ ...S.summaryCard, borderTop: '4px solid #059669' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{'Itens Respondidos'}</span>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#059669' }}>
              {sc.totalAnswered + '/' + sc.totalItems}
            </span>
          </div>
        </div>

        {/* Perfil por item */}
        <ItemProfileCards scores={sc} />

        {/* Radar 15 itens */}
        <div style={{ marginBottom: '16px' }}>
          <CARS2RadarChart itemScores={sc.itemScores} />
        </div>

        {/* Barras horizontais */}
        <div style={{ marginBottom: '16px' }}>
          <CARS2ItemBars itemScores={sc.itemScores} />
        </div>

        {/* Tabela detalhada */}
        <DetailTable scores={sc} responses={logic.responses} />

        <div style={{ ...S.navRow, marginTop: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setStage('application')} style={S.btnNav}>
            {'← Editar Respostas'}
          </button>
          <button
            onClick={() => {
              try {
                downloadCARS2PDF(
                  { nome: sessionInfo?.child_name, idade: sessionInfo?.child_age },
                  sc,
                  logic.responses
                );
              } catch (e) {
                alert('Erro ao gerar PDF: ' + e.message);
              }
            }}
            style={{ ...S.btnNav, background: ACCENT, color: 'white', border: 'none' }}
          >
            {'Baixar PDF'}
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
            {'Finalizar e Salvar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p>{'Carregando CARS-2...'}</p>
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

function getSeverityColor(score) {
  if (score <= 1.5) return '#10b981';
  if (score <= 2.5) return '#f59e0b';
  if (score <= 3.5) return '#f97316';
  return '#ef4444';
}

function getSeverityBg(score) {
  if (score <= 1.5) return '#f0fdf4';
  if (score <= 2.5) return '#fffbeb';
  if (score <= 3.5) return '#fff7ed';
  return '#fef2f2';
}

function getSeverityLabel(score) {
  if (score <= 1.5) return 'Apropriado';
  if (score <= 2.5) return 'Leve';
  if (score <= 3.5) return 'Moderado';
  return 'Grave';
}

// ==========================================
// SUB-COMPONENTES
// ==========================================

function TopBar({ childName, progress, onBack, backLabel }) {
  return (
    <div style={S.topBar}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
          {'CARS-2'}
        </h1>
        <p style={{ margin: '2px 0 0', color: '#475569', fontSize: '0.9rem' }}>
          {(childName || 'Criança') + ' — ' + progress.answeredItems + '/' + progress.totalItems + ' itens (' + progress.percent + '%)'}
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

function ProgressBar({ percent, color }) {
  return (
    <div style={S.progressTrack}>
      <div style={{ ...S.progressFill, width: percent + '%', background: color }} />
    </div>
  );
}

function ClassificationCard({ scores }) {
  const c = scores.classification;
  return (
    <div style={{ ...S.classCard, borderLeft: '6px solid ' + c.color, background: c.bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>{'Pontuação Total'}</p>
          <p style={{ margin: '4px 0', fontSize: '2.2rem', fontWeight: 900, color: c.color }}>
            {scores.totalScore + ' / ' + scores.maxPossible}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            {'Mínimo: ' + scores.minPossible + ' | Máximo: ' + scores.maxPossible}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>{'Classificação'}</p>
          <p style={{
            margin: '4px 0 0',
            fontSize: '1.1rem',
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
        {CARS2_CLASSIFICATION.map(cl => (
          <span key={cl.level} style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: cl.level === c.level ? 800 : 500,
            background: cl.level === c.level ? cl.color : '#f1f5f9',
            color: cl.level === c.level ? 'white' : '#64748b',
          }}>
            {cl.min + '-' + cl.max + ': ' + cl.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ItemProfileCards({ scores }) {
  const items = CARS2_ITEMS;
  const criticals = items.filter(i => {
    const s = scores.itemScores[String(i.num)];
    return s && s.score >= 3;
  });
  const mild = items.filter(i => {
    const s = scores.itemScores[String(i.num)];
    return s && s.score >= 2 && s.score < 3;
  });
  const normal = items.filter(i => {
    const s = scores.itemScores[String(i.num)];
    return s && s.score < 2;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '16px' }}>
      {criticals.length > 0 && (
        <div style={{ ...S.profileCard, borderTop: '4px solid #ef4444' }}>
          <p style={{ margin: 0, fontWeight: 800, color: '#ef4444', fontSize: '1rem' }}>
            {'Áreas Críticas (' + criticals.length + ')'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            {criticals.map(i => i.name).join(', ')}
          </p>
        </div>
      )}
      {mild.length > 0 && (
        <div style={{ ...S.profileCard, borderTop: '4px solid #f59e0b' }}>
          <p style={{ margin: 0, fontWeight: 800, color: '#f59e0b', fontSize: '1rem' }}>
            {'Atenção (' + mild.length + ')'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            {mild.map(i => i.name).join(', ')}
          </p>
        </div>
      )}
      {normal.length > 0 && (
        <div style={{ ...S.profileCard, borderTop: '4px solid #10b981' }}>
          <p style={{ margin: 0, fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>
            {'Adequados (' + normal.length + ')'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            {normal.map(i => i.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailTable({ scores, responses }) {
  return (
    <div style={S.section}>
      <h2 style={{ margin: '0 0 14px', fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
        {'Detalhamento por Item'}
      </h2>
      <table style={S.table}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ ...S.th, width: '40px' }}>{'Nº'}</th>
            <th style={{ ...S.th, textAlign: 'left' }}>{'Subescala'}</th>
            <th style={{ ...S.th, width: '70px' }}>{'Nota'}</th>
            <th style={{ ...S.th, width: '140px' }}>{'Gravidade'}</th>
          </tr>
        </thead>
        <tbody>
          {CARS2_ITEMS.map((item, idx) => {
            const val = responses[String(item.num)];
            const hasVal = val !== undefined && val !== null;
            return (
              <tr key={item.num} style={{ background: idx % 2 === 0 ? '#fafbfc' : 'white' }}>
                <td style={{ ...S.td, textAlign: 'center', fontWeight: 700 }}>{item.num}</td>
                <td style={S.td}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                </td>
                <td style={{
                  ...S.td,
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: hasVal ? getSeverityColor(val) : '#cbd5e1',
                }}>
                  {hasVal ? val : '—'}
                </td>
                <td style={{
                  ...S.td,
                  textAlign: 'center',
                  fontWeight: 600,
                  color: hasVal ? getSeverityColor(val) : '#cbd5e1',
                }}>
                  {hasVal ? (
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: getSeverityBg(val),
                      fontSize: '0.85rem',
                    }}>
                      {getSeverityLabel(val)}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
  progressSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '14px 20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  progressTrack: {
    width: '100%',
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  section: {
    background: 'white',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '16px',
  },
  itemCard: {
    padding: '18px',
    borderRadius: '14px',
    transition: 'all 0.15s',
    border: '1px solid #e2e8f0',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  itemNum: {
    fontWeight: 800,
    color: ACCENT,
    fontSize: '1.2rem',
    minWidth: '32px',
    paddingTop: '2px',
  },
  itemName: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  itemDesc: {
    margin: '4px 0 0',
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: 1.4,
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginLeft: '44px',
  },
  btnOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.15s',
    textAlign: 'left',
    width: '100%',
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
  classCard: {
    padding: '20px 24px',
    borderRadius: '14px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileCard: {
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
