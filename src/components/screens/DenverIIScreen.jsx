/*
 * DenverIIScreen — Tela principal do Denver II
 *
 * 2 estágios: Aplicação → Resultados
 * UX para profissionais 50+: botões grandes, cores claras, texto descritivo
 */

import React, { useState } from 'react';
import useDenverIILogic from '../../hooks/useDenverIILogic';
import {
  DENVER_DOMAINS,
  DENVER_ITEMS,
  DENVER_SCORE_OPTIONS,
  DENVER_INTERPRETATION_OPTIONS,
} from '../../data/instruments/denver_ii';
import { DenverRadarChart, DenverDomainBars } from '../charts/DenverIIChart';
import { downloadDenverPDF } from '../reports/DenverIIPDFReport';

const ACCENT = '#059669'; // emerald

export default function DenverIIScreen({ sessionInfo, onFinalize, onBack }) {
  const logic = useDenverIILogic(sessionInfo);
  const [stage, setStage] = useState('application'); // application | results

  const crianca = {
    name: sessionInfo?.child_name || 'Criança',
    age: sessionInfo?.child_age || '',
  };

  // ═══════════════════════════════════════════════════
  // ESTÁGIO 1: APLICAÇÃO
  // ═══════════════════════════════════════════════════
  if (stage === 'application') {
    const activeDomain = DENVER_DOMAINS[logic.activeDomainIdx];
    const items = DENVER_ITEMS[activeDomain.id];
    const progress = logic.domainProgress[activeDomain.id];

    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

        {/* HEADER */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem 1.5rem', marginBottom: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
              {'Denver II'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              {crianca.name} {crianca.age ? ' — ' + crianca.age : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{'Progresso global'}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: ACCENT }}>{logic.globalProgress.percent + '%'}</div>
            </div>
            <button onClick={onBack} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
              {'Voltar'}
            </button>
          </div>
        </div>

        {/* BARRA DE PROGRESSO GLOBAL */}
        <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
          <div style={{ width: logic.globalProgress.percent + '%', height: '100%', background: ACCENT, borderRadius: '8px', transition: 'width 0.3s' }} />
        </div>

        {/* TABS DE DOMÍNIO */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {DENVER_DOMAINS.map((d, idx) => {
            const dp = logic.domainProgress[d.id];
            const isActive = idx === logic.activeDomainIdx;
            return (
              <button key={d.id} onClick={() => logic.setActiveDomainIdx(idx)} style={{
                flex: '1 1 auto', minWidth: '140px', padding: '0.8rem 0.6rem', border: isActive ? '3px solid ' + d.color : '2px solid #e2e8f0',
                borderRadius: '12px', background: isActive ? d.color + '10' : '#fff', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '1.4rem' }}>{d.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? d.color : '#475569' }}>{d.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{dp.answered + '/' + dp.total}</span>
                <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: dp.percent + '%', height: '100%', background: d.color, borderRadius: '4px' }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* TÍTULO DO DOMÍNIO ATIVO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: activeDomain.color }}>
            {activeDomain.icon + ' ' + activeDomain.name + ' (' + progress.answered + '/' + progress.total + ')'}
          </div>
        </div>

        {/* ITENS DO DOMÍNIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => {
            const key = activeDomain.id + '_' + item.num;
            const resp = logic.responses[key] || {};
            const isComplete = resp.score && resp.interpretation;

            return (
              <div key={key} style={{
                background: '#fff', borderRadius: '14px', padding: '1rem 1.2rem',
                border: isComplete ? '2px solid ' + ACCENT : '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                {/* Item header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' }}>
                  <div>
                    <span style={{ fontWeight: 800, color: activeDomain.color, marginRight: '8px', fontSize: '1rem' }}>
                      {item.num + '.'}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                      {item.skill}
                    </span>
                  </div>
                  {isComplete && (
                    <button onClick={() => logic.clearItem(activeDomain.id, item.num)} style={{
                      padding: '2px 8px', background: '#fee2e2', border: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600,
                    }}>{'Limpar'}</button>
                  )}
                </div>

                {/* Faixa etária */}
                {item.age && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.6rem', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                    {'Idade: ' + item.age}
                  </div>
                )}

                {/* Escore */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>{'Escore:'}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DENVER_SCORE_OPTIONS.map(opt => {
                      const isSelected = resp.score === opt.value;
                      return (
                        <button key={opt.value} onClick={() => logic.setItemScore(activeDomain.id, item.num, opt.value)} style={{
                          padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                          fontSize: '0.9rem', minWidth: '90px', transition: 'all 0.15s',
                          border: isSelected ? '3px solid ' + opt.color : '2px solid #e2e8f0',
                          background: isSelected ? opt.bgColor : '#fff',
                          color: isSelected ? opt.color : '#64748b',
                        }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interpretação */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>{'Interpretação:'}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DENVER_INTERPRETATION_OPTIONS.map(opt => {
                      const isSelected = resp.interpretation === opt.value;
                      return (
                        <button key={opt.value} onClick={() => logic.setItemInterpretation(activeDomain.id, item.num, opt.value)} style={{
                          padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                          fontSize: '0.9rem', minWidth: '80px', transition: 'all 0.15s',
                          border: isSelected ? '3px solid ' + opt.color : '2px solid #e2e8f0',
                          background: isSelected ? opt.bgColor : '#fff',
                          color: isSelected ? opt.color : '#64748b',
                        }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* NAVEGAÇÃO ENTRE DOMÍNIOS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '12px' }}>
          <button onClick={logic.goPrevDomain} disabled={logic.activeDomainIdx === 0} style={{
            padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
            cursor: logic.activeDomainIdx === 0 ? 'not-allowed' : 'pointer',
            background: logic.activeDomainIdx === 0 ? '#e2e8f0' : '#fff',
            border: '2px solid #e2e8f0', color: '#475569', opacity: logic.activeDomainIdx === 0 ? 0.5 : 1,
          }}>
            {'← Domínio Anterior'}
          </button>

          {logic.activeDomainIdx < DENVER_DOMAINS.length - 1 ? (
            <button onClick={logic.goNextDomain} style={{
              padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', background: activeDomain.color, border: 'none', color: '#fff',
            }}>
              {'Próximo Domínio →'}
            </button>
          ) : (
            <button onClick={() => setStage('results')} disabled={logic.globalProgress.answered === 0} style={{
              padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
              cursor: logic.globalProgress.answered === 0 ? 'not-allowed' : 'pointer',
              background: logic.globalProgress.answered === 0 ? '#94a3b8' : ACCENT,
              border: 'none', color: '#fff',
            }}>
              {'Ver Resultados ✓'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // ESTÁGIO 2: RESULTADOS
  // ═══════════════════════════════════════════════════
  const scores = logic.scores;
  if (!scores) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>{'Nenhuma resposta registrada.'}</p>
        <button onClick={() => setStage('application')} style={{ padding: '0.6rem 1.2rem', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          {'Voltar à Aplicação'}
        </button>
      </div>
    );
  }

  const classif = scores.classification;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

      {/* HEADER RESULTADOS */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem 1.5rem', marginBottom: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
            {'Denver II — Resultados'}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            {crianca.name} {crianca.age ? ' — ' + crianca.age : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setStage('application')} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
            {'← Editar'}
          </button>
          <button onClick={() => {
            downloadDenverPDF(crianca, scores, logic.responses);
          }} style={{ padding: '0.5rem 1rem', background: '#7c3aed', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#fff' }}>
            {'Baixar PDF'}
          </button>
        </div>
      </div>

      {/* CLASSIFICAÇÃO GLOBAL */}
      <div style={{
        background: classif.bgColor, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.2rem',
        border: '3px solid ' + classif.color, textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: classif.color, marginBottom: '4px' }}>
          {'Classificação Global'}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: classif.color }}>
          {classif.label}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '4px' }}>
          {classif.description}
        </div>
      </div>

      {/* CARDS RESUMO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '1.2rem' }}>
        {[
          { label: 'Respondidos', value: scores.totalAnswered + '/' + scores.totalItems, color: ACCENT },
          { label: 'Avançados', value: scores.summary.avancados, color: '#3b82f6' },
          { label: 'Normais', value: scores.summary.normais, color: '#10b981' },
          { label: 'Cautelas', value: scores.summary.cautelas, color: '#f59e0b' },
          { label: 'Atrasos', value: scores.summary.atrasos, color: '#ef4444' },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '14px', padding: '1rem', textAlign: 'center',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* RESUMO POR DOMÍNIO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        {DENVER_DOMAINS.map(domain => {
          const dr = scores.domainResults[domain.id];
          return (
            <div key={domain.id} style={{
              background: '#fff', borderRadius: '14px', padding: '1rem',
              border: '1px solid #e2e8f0', borderLeft: '5px solid ' + domain.color,
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: domain.color, marginBottom: '8px' }}>
                {domain.icon + ' ' + domain.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b' }}>{'Respondidos:'}</span>
                <span style={{ fontWeight: 700 }}>{dr.answered + '/' + dr.total}</span>
                <span style={{ color: '#3b82f6' }}>{'Avançado:'}</span>
                <span style={{ fontWeight: 700, color: '#3b82f6' }}>{dr.interpretation.avancado}</span>
                <span style={{ color: '#10b981' }}>{'Normal:'}</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{dr.interpretation.normal}</span>
                <span style={{ color: '#f59e0b' }}>{'Cautela:'}</span>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>{dr.interpretation.cautela}</span>
                <span style={{ color: '#ef4444' }}>{'Atraso:'}</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>{dr.interpretation.atraso}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* GRÁFICOS */}
      <DenverRadarChart domainResults={scores.domainResults} />
      <div style={{ height: '16px' }} />
      <DenverDomainBars domainResults={scores.domainResults} />

      {/* TABELA DETALHADA POR DOMÍNIO */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>
          {'Detalhamento por Domínio'}
        </div>
        {DENVER_DOMAINS.map(domain => {
          const items = DENVER_ITEMS[domain.id];
          return (
            <div key={domain.id} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: domain.color, marginBottom: '8px' }}>
                {domain.icon + ' ' + domain.name}
              </div>
              <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>{'#'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>{'Habilidade'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>{'Idade'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>{'Escore'}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>{'Interpretação'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const key = domain.id + '_' + item.num;
                      const resp = logic.responses[key] || {};
                      const scoreOpt = DENVER_SCORE_OPTIONS.find(o => o.value === resp.score);
                      const interpOpt = DENVER_INTERPRETATION_OPTIONS.find(o => o.value === resp.interpretation);
                      return (
                        <tr key={key} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: domain.color }}>{item.num}</td>
                          <td style={{ padding: '8px 12px', color: '#1e293b', fontWeight: 600 }}>{item.skill}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.85rem' }}>{item.age || '—'}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {scoreOpt ? (
                              <span style={{ padding: '3px 10px', borderRadius: '6px', background: scoreOpt.bgColor, color: scoreOpt.color, fontWeight: 700, fontSize: '0.85rem' }}>
                                {scoreOpt.label}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {interpOpt ? (
                              <span style={{ padding: '3px 10px', borderRadius: '6px', background: interpOpt.bgColor, color: interpOpt.color, fontWeight: 700, fontSize: '0.85rem' }}>
                                {interpOpt.label}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* AÇÕES FINAIS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '2rem', marginBottom: '2rem' }}>
        <button onClick={() => setStage('application')} style={{
          padding: '0.8rem 1.5rem', background: '#f1f5f9', border: '2px solid #e2e8f0',
          borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', color: '#475569',
        }}>
          {'← Editar Respostas'}
        </button>
        <button onClick={() => {
          downloadDenverPDF(crianca, scores, logic.responses);
        }} style={{
          padding: '0.8rem 1.5rem', background: '#7c3aed', border: 'none',
          borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', color: '#fff',
        }}>
          {'Baixar PDF'}
        </button>
        <button onClick={() => {
          onFinalize({
            scores,
            responses: logic.responses,
          });
        }} style={{
          padding: '0.8rem 1.5rem', background: ACCENT, border: 'none',
          borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', color: '#fff',
        }}>
          {'Finalizar Instrumento ✓'}
        </button>
      </div>
    </div>
  );
}
