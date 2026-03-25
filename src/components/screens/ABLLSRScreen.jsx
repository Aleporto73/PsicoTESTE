/*
 * ABLLSRScreen - ABLLS-R
 * Assessment of Basic Language and Learning Skills - Revised
 *
 * DESIGN: Público 50+, superior à planilha Excel
 * - Botões grandes, fontes legíveis, feedback visual claro
 * - Interpretação inteligente dos resultados
 * - Alertas para domínios críticos
 * - Fluxo guiado sem ambiguidade
 *
 * 25 domínios, 543 itens, pontuação variável (0 a max_pts)
 */

import React, { useState, useMemo } from 'react';
import useABLLSRLogic from '../../hooks/useABLLSRLogic';
import { getABLLSRPerformanceLevel } from '../../data/instruments/ablls_r';
import { ABLLSRRadarChart, ABLLSRGroupBars } from '../charts/ABLLSRChart';
import { downloadABLLSRPDF } from '../reports/ABLLSRPDFReport';

const GROUP_COLORS = {
  habilidades_basicas: { bg: '#ede9fe', color: '#7c3aed', accent: '#8b5cf6', label: 'Habilidades Básicas' },
  linguagem: { bg: '#dbeafe', color: '#2563eb', accent: '#3b82f6', label: 'Linguagem' },
  social_rotina: { bg: '#d1fae5', color: '#059669', accent: '#10b981', label: 'Social e Rotina' },
  academico: { bg: '#fef3c7', color: '#d97706', accent: '#f59e0b', label: 'Acadêmico' },
  autonomia_motor: { bg: '#fce7f3', color: '#db2777', accent: '#ec4899', label: 'Autonomia e Motor' },
};

const PERF_EMOJI = {
  avancado: '🟢',
  proficiente: '🔵',
  em_desenvolvimento: '🟡',
  inicial: '🟠',
  nao_demonstrado: '🔴',
};

export default function ABLLSRScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  const logic = useABLLSRLogic(sessionInfo, isReadOnly);
  const [stage, setStage] = useState(logic.scores ? 'scoring' : 'application');
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ═══════════════════════════════════
  // ESTÁGIO 2: RESULTADOS COM INTERPRETAÇÃO
  // ═══════════════════════════════════
  if (stage === 'scoring') {
    const sc = logic.scores;
    if (!sc) { setStage('application'); return null; }

    return (
      <div style={S.container}>
        <TopBar childName={sessionInfo?.child_name} stage="scoring" progress={logic.progress} />

        {/* Score Total */}
        <TotalScoreCard sc={sc} />

        {/* Interpretação Inteligente */}
        <SmartInterpretation sc={sc} groups={logic.groups} domains={logic.domains} />

        {/* Gráficos — empilhados verticalmente para melhor visualização */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '18px' }}>
          <ABLLSRRadarChart
            domainScores={sc.domainScores}
            domains={logic.domains}
            groups={logic.groups}
          />
          <ABLLSRGroupBars
            groupScores={sc.groupScores}
            groups={logic.groups}
          />
        </div>

        {/* Scores por Grupo */}
        {logic.groups.map(group => (
          <GroupScoreCard
            key={group.id}
            group={group}
            groupScore={sc.groupScores?.[group.id]}
            domainScores={sc.domainScores}
            domains={logic.domains}
          />
        ))}

        {/* Ações */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => { setStage('application'); scrollToTop(); }} style={S.btnSecondary}>
            ← Revisar Aplicação
          </button>
          <button onClick={() => {
            try {
              downloadABLLSRPDF(sessionInfo, sc, logic.domains, logic.groups);
            } catch (e) {
              console.error('Erro ao gerar PDF:', e);
              alert('Erro ao gerar PDF. Verifique se a biblioteca jsPDF está carregada.');
            }
          }} style={{ ...S.btnPrimary, background: '#0891b2', fontSize: '1rem', padding: '14px 28px' }}>
            📄 Baixar Relatório PDF
          </button>
          <button onClick={() => {
            if (onFinalize) {
              onFinalize({
                instrument_id: 'ablls_r',
                responses: logic.responses,
                scores: sc,
                completedAt: new Date().toISOString(),
              });
            }
          }} style={{ ...S.btnPrimary, background: '#059669' }}>
            Finalizar ABLLS-R →
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════
  // ESTÁGIO 1: APLICAÇÃO
  // ═══════════════════════════════════
  const domain = logic.currentDomain;

  return (
    <div style={S.container}>
      <TopBar childName={sessionInfo?.child_name} stage="application" progress={logic.progress} />

      {/* ── Info + Sair ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '12px', flexWrap: 'wrap', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700,
            background: '#ecfeff', color: '#0891b2',
          }}>
            📘 ABLLS-R
          </span>
          <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 600 }}>
            {logic.progress.answeredItems} de {logic.progress.totalItems} itens
          </span>
        </div>
        <button onClick={onBack} style={{ ...S.btnSmall, fontSize: '0.9rem', padding: '8px 18px' }}>
          ← Voltar
        </button>
      </div>

      {/* ── Seletor de Grupos ── */}
      <GroupSelector
        groups={logic.groups}
        activeGroupId={logic.activeGroupId}
        onSelectGroup={(gId) => {
          logic.setActiveGroupId(gId === logic.activeGroupId ? null : gId);
        }}
        getGroupProgress={logic.getGroupProgress}
      />

      {/* ── Mapa de Domínios ── */}
      <DomainMap
        domains={logic.activeGroupId ? logic.filteredDomains : logic.domains}
        currentDomainId={domain?.id}
        getDomainProgress={logic.getDomainProgress}
        onGoTo={(dId) => { logic.goToDomainById(dId); scrollToTop(); }}
        groups={logic.groups}
      />

      {/* ── Conteúdo do Domínio ── */}
      {domain && (
        <div style={{ marginTop: '14px' }}>
          <DomainHeader
            domain={domain}
            domainIndex={logic.domainIndex}
            totalDomains={logic.domains.length}
            domainProgress={logic.getDomainProgress(domain.id)}
            groups={logic.groups}
          />

          {/* Ações rápidas */}
          {!isReadOnly && (
            <div style={{ display: 'flex', gap: '10px', margin: '12px 0', flexWrap: 'wrap' }}>
              <button onClick={logic.markAllMax} style={{
                ...S.btnSmall, background: '#dcfce7', color: '#15803d',
                border: '2px solid #86efac', fontSize: '0.9rem', padding: '8px 18px',
              }}>
                Pontuar Tudo no Máximo
              </button>
              <button onClick={logic.markAllZero} style={{
                ...S.btnSmall, background: '#fee2e2', color: '#b91c1c',
                border: '2px solid #fca5a5', fontSize: '0.9rem', padding: '8px 18px',
              }}>
                Zerar Tudo
              </button>
            </div>
          )}

          {/* Itens do domínio */}
          <div style={{ marginTop: '10px' }}>
            {domain.items.map((item) => (
              <ItemRow
                key={`${domain.id}_${item.num}`}
                domainId={domain.id}
                item={item}
                value={logic.responses[`${domain.id}_${item.num}`]}
                onScore={logic.setItemResponse}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>

          {/* Navegação */}
          <NavBar
            canPrev={logic.domainIndex > 0}
            isLast={logic.isLastDomain}
            onPrev={() => { logic.prevDomain(); scrollToTop(); }}
            onNext={() => { logic.nextDomain(); scrollToTop(); }}
            onCalculate={() => { logic.calculateScores(); setStage('scoring'); scrollToTop(); }}
            progress={logic.progress}
            domainProgress={logic.getDomainProgress(domain.id)}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COMPONENTES DE RESULTADOS
// ═══════════════════════════════════════════════════

function TotalScoreCard({ sc }) {
  const perf = getABLLSRPerformanceLevel(sc.totalPercent);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${perf.color}dd 0%, ${perf.color}99 100%)`,
      borderRadius: '18px', padding: '28px', color: '#fff', textAlign: 'center', marginBottom: '20px',
      boxShadow: `0 8px 30px ${perf.color}40`,
    }}>
      <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '4px' }}>Pontuação Total ABLLS-R</div>
      <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1 }}>
        {sc.totalScore}
        <span style={{ fontSize: '1.2rem', opacity: 0.7 }}> / {sc.maxPossible}</span>
      </div>
      <div style={{
        display: 'inline-block', marginTop: '10px',
        padding: '6px 20px', borderRadius: '20px',
        background: 'rgba(255,255,255,0.25)', fontSize: '1.1rem', fontWeight: 700,
      }}>
        {perf.label} — {sc.totalPercent}%
      </div>
      <div style={{
        marginTop: '16px', height: '10px', background: 'rgba(255,255,255,0.2)',
        borderRadius: '5px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${sc.totalPercent}%`,
          background: '#fff', borderRadius: '5px', transition: 'width 0.6s ease-out',
        }} />
      </div>
      <div style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
        {sc.itemsAnswered} de {sc.totalItems} itens avaliados
      </div>
    </div>
  );
}

function SmartInterpretation({ sc, groups, domains }) {
  // Identificar domínios críticos (< 40%) e fortes (>= 80%)
  const critical = [];
  const strong = [];
  const developing = [];

  for (const [dId, ds] of Object.entries(sc.domainScores || {})) {
    const domain = domains.find(d => d.id === dId);
    if (!domain || ds.answered === 0) continue;
    if (ds.percent < 40) critical.push({ ...ds, name: domain.name, id: dId });
    else if (ds.percent >= 80) strong.push({ ...ds, name: domain.name, id: dId });
    else developing.push({ ...ds, name: domain.name, id: dId });
  }

  critical.sort((a, b) => a.percent - b.percent);
  developing.sort((a, b) => a.percent - b.percent);

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '20px',
      marginBottom: '18px', border: '2px solid #e0f2fe',
    }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0c4a6e', marginBottom: '14px' }}>
        Análise dos Resultados
      </div>

      {/* Áreas Críticas */}
      {critical.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
          }}>
            <span style={{
              padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
              background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca',
            }}>
              Atenção Prioritária
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {critical.length} {critical.length === 1 ? 'domínio precisa' : 'domínios precisam'} de intervenção
            </span>
          </div>
          {critical.map(d => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', marginBottom: '4px',
              background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca',
            }}>
              <span style={{ fontSize: '1.1rem' }}>🔴</span>
              <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600, color: '#991b1b' }}>{d.name}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b91c1c' }}>{d.percent}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Áreas em Desenvolvimento */}
      {developing.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
          }}>
            <span style={{
              padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
              background: '#fefce8', color: '#a16207', border: '1px solid #fde68a',
            }}>
              Em Desenvolvimento
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {developing.length} {developing.length === 1 ? 'domínio' : 'domínios'} entre 40% e 79%
            </span>
          </div>
          {developing.map(d => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 14px', marginBottom: '3px',
              background: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a',
            }}>
              <span style={{ fontSize: '1rem' }}>🟡</span>
              <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, color: '#92400e' }}>{d.name}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a16207' }}>{d.percent}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Áreas Fortes */}
      {strong.length > 0 && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
          }}>
            <span style={{
              padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
              background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
            }}>
              Pontos Fortes
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {strong.length} {strong.length === 1 ? 'domínio' : 'domínios'} acima de 80%
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#166534', lineHeight: 1.6 }}>
            {strong.map(d => d.name).join(', ')}
          </div>
        </div>
      )}

      {/* Resumo rápido */}
      {critical.length === 0 && developing.length === 0 && (
        <div style={{
          padding: '16px', background: '#f0fdf4', borderRadius: '12px',
          textAlign: 'center', border: '1px solid #bbf7d0',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🟢</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#166534' }}>
            Todos os domínios acima de 80%
          </div>
          <div style={{ fontSize: '0.9rem', color: '#15803d', marginTop: '4px' }}>
            Desempenho avançado em todas as áreas avaliadas.
          </div>
        </div>
      )}
    </div>
  );
}

function GroupScoreCard({ group, groupScore, domainScores, domains }) {
  const gc = GROUP_COLORS[group.id] || GROUP_COLORS.habilidades_basicas;
  if (!groupScore) return null;
  const perf = getABLLSRPerformanceLevel(groupScore.percent);

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '18px',
      marginBottom: '14px', border: `2px solid ${gc.bg}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '5px 12px', borderRadius: '8px', fontSize: '0.85rem',
            fontWeight: 700, background: gc.bg, color: gc.color,
          }}>
            {group.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1rem' }}>{PERF_EMOJI[perf.level]}</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: gc.color }}>
            {groupScore.percent}%
          </span>
        </div>
      </div>

      {group.domains.map(dId => {
        const ds = domainScores?.[dId];
        if (!ds) return null;
        const domain = domains.find(d => d.id === dId);
        const dPerf = getABLLSRPerformanceLevel(ds.percent);

        return (
          <div key={dId} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem' }}>{PERF_EMOJI[dPerf.level]}</span>
                <span style={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>{domain?.name}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                {ds.score}/{ds.maxPossible}
              </span>
            </div>
            <div style={{
              height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${ds.percent}%`,
                background: dPerf.color, borderRadius: '4px', transition: 'width 0.4s ease-out',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COMPONENTES DE APLICAÇÃO
// ═══════════════════════════════════════════════════

function TopBar({ childName, stage, progress }) {
  const stages = [
    { key: 'application', label: 'Aplicação' },
    { key: 'scoring', label: 'Resultados' },
  ];

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>ABLLS-R</span>
          {childName && (
            <span style={{ fontSize: '0.95rem', color: '#475569', marginLeft: '10px', fontWeight: 600 }}>
              — {childName}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
          {progress.completedDomains}/{progress.totalDomains} domínios completos
        </span>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {stages.map(s => (
          <div key={s.key} style={{
            flex: 1, padding: '8px', borderRadius: '10px', textAlign: 'center',
            fontSize: '0.9rem', fontWeight: 700,
            background: stage === s.key ? '#0891b2' : '#f1f5f9',
            color: stage === s.key ? '#fff' : '#94a3b8',
          }}>
            {s.label}
          </div>
        ))}
      </div>
      {/* Barra de progresso geral */}
      <div style={{
        marginTop: '8px', height: '6px', background: '#f1f5f9',
        borderRadius: '3px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${progress.percentItems}%`,
          background: '#0891b2', borderRadius: '3px', transition: 'width 0.3s',
        }} />
      </div>
    </div>
  );
}

function GroupSelector({ groups, activeGroupId, onSelectGroup, getGroupProgress }) {
  return (
    <div style={{
      display: 'flex', gap: '8px', flexWrap: 'wrap',
      marginBottom: '12px',
    }}>
      {groups.map(group => {
        const gc = GROUP_COLORS[group.id] || GROUP_COLORS.habilidades_basicas;
        const isActive = activeGroupId === group.id;
        const gp = getGroupProgress(group.id);

        return (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            style={{
              padding: '8px 16px', borderRadius: '10px',
              fontSize: '0.85rem', fontWeight: 700,
              background: isActive ? gc.accent : gc.bg,
              color: isActive ? '#fff' : gc.color,
              border: `2px solid ${isActive ? gc.accent : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {group.name}
            <span style={{
              marginLeft: '6px', fontSize: '0.75rem',
              opacity: 0.85,
              background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
              padding: '2px 6px', borderRadius: '6px',
            }}>
              {gp.completed}/{gp.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DomainMap({ domains, currentDomainId, getDomainProgress, onGoTo, groups }) {
  const getDomainGroup = (domainId) => {
    for (const g of groups) {
      if (g.domains && g.domains.includes(domainId)) return g.id;
    }
    return null;
  };

  return (
    <div style={{
      display: 'flex', gap: '4px', flexWrap: 'wrap',
      padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0',
    }}>
      {domains.map((d) => {
        const dp = getDomainProgress(d.id);
        const isCurrent = d.id === currentDomainId;
        const groupId = getDomainGroup(d.id);
        const gc = GROUP_COLORS[groupId] || GROUP_COLORS.habilidades_basicas;

        return (
          <div
            key={d.id}
            onClick={() => onGoTo(d.id)}
            title={`${d.name} — ${dp.answered}/${dp.total} itens`}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', fontWeight: 700,
              background: isCurrent ? '#0891b2' : dp.complete ? gc.accent : dp.answered > 0 ? gc.bg : '#e2e8f0',
              color: isCurrent || dp.complete ? '#fff' : dp.answered > 0 ? gc.color : '#94a3b8',
              border: isCurrent ? '3px solid #0e7490' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {d.name.substring(0, 2).toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}

function DomainHeader({ domain, domainIndex, totalDomains, domainProgress, groups }) {
  const groupId = groups.find(g => g.domains && g.domains.includes(domain.id))?.id;
  const gc = GROUP_COLORS[groupId] || GROUP_COLORS.habilidades_basicas;

  return (
    <div style={{
      padding: '18px 20px', borderRadius: '14px',
      background: `linear-gradient(135deg, ${gc.accent} 0%, ${gc.color} 100%)`,
      color: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
          Domínio {domainIndex + 1} de {totalDomains}
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: '6px',
          background: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 700,
        }}>
          {domainProgress.answered}/{domainProgress.total}
        </div>
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '6px' }}>
        {domain.name}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.9rem', opacity: 0.9 }}>
        <span>{domain.items.length} itens</span>
        <span>Máximo: {domain.max_total} pts</span>
      </div>
      {/* Barra de progresso */}
      <div style={{
        marginTop: '10px', height: '6px', background: 'rgba(255,255,255,0.2)',
        borderRadius: '3px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${domainProgress.percent}%`,
          background: '#fff', borderRadius: '3px', transition: 'width 0.3s',
        }} />
      </div>
    </div>
  );
}

function ItemRow({ domainId, item, value, onScore, isReadOnly }) {
  const hasValue = value !== undefined;

  // Cor do score: 0 = vermelho, max = verde, meio = amarelo
  const getScoreColor = (score, maxPts) => {
    if (score === 0) return { bg: '#fef2f2', border: '#ef4444', text: '#fff', fill: '#ef4444' };
    if (score === maxPts) return { bg: '#f0fdf4', border: '#22c55e', text: '#fff', fill: '#22c55e' };
    return { bg: '#fefce8', border: '#eab308', text: '#fff', fill: '#eab308' };
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px', marginBottom: '6px',
      background: hasValue ? '#f8fffe' : '#fff',
      borderRadius: '12px',
      border: `2px solid ${hasValue ? '#a7f3d0' : '#e2e8f0'}`,
      transition: 'all 0.2s',
    }}>
      {/* Número do item */}
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem', fontWeight: 800,
        background: hasValue ? '#0891b2' : '#f1f5f9',
        color: hasValue ? '#fff' : '#94a3b8',
        flexShrink: 0,
      }}>
        {item.num}
      </div>

      {/* Descrição */}
      <div style={{ flex: 1, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>
        {item.desc}
      </div>

      {/* Bot\u00f5es de pontua\u00e7\u00e3o */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {Array.from({ length: item.max_pts + 1 }, (_, i) => i).map(score => {
          const isSelected = value === score;
          const sc = isSelected ? getScoreColor(score, item.max_pts) : null;

          return (
            <button
              key={score}
              onClick={() => !isReadOnly && onScore(domainId, item.num, score)}
              style={{
                width: '44px', height: '44px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800,
                border: `2px solid ${isSelected ? sc.fill : '#d1d5db'}`,
                background: isSelected ? sc.fill : '#fff',
                color: isSelected ? '#fff' : '#6b7280',
                cursor: isReadOnly ? 'default' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: isSelected ? `0 2px 8px ${sc.fill}40` : 'none',
              }}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavBar({ canPrev, isLast, onPrev, onNext, onCalculate, progress, domainProgress }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginTop: '18px', padding: '16px 0', borderTop: '2px solid #e2e8f0',
    }}>
      <button onClick={onPrev} disabled={!canPrev} style={{
        ...S.btnSecondary, opacity: canPrev ? 1 : 0.3,
        fontSize: '0.95rem', padding: '12px 22px',
      }}>
        ← Anterior
      </button>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
          {domainProgress.answered}/{domainProgress.total} neste dom\u00ednio
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          {progress.percentItems}% total
        </div>
      </div>

      {isLast ? (
        <button onClick={onCalculate} style={{
          ...S.btnPrimary, background: '#059669',
          fontSize: '0.95rem', padding: '12px 22px',
        }}>
          Ver Resultados →
        </button>
      ) : (
        <button onClick={onNext} style={{
          ...S.btnPrimary, fontSize: '0.95rem', padding: '12px 22px',
        }}>
          Próximo →
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════
// ESTILOS
// ═══════════════════════════════════
const S = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '18px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  btnPrimary: {
    padding: '12px 26px',
    borderRadius: '12px',
    background: '#0891b2',
    color: '#fff',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSecondary: {
    padding: '12px 22px',
    borderRadius: '12px',
    background: '#f1f5f9',
    color: '#475569',
    border: '2px solid #e2e8f0',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSmall: {
    padding: '8px 16px',
    borderRadius: '10px',
    background: '#f1f5f9',
    color: '#475569',
    border: '2px solid #e2e8f0',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
