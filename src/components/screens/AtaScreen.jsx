/*
 * AtaScreen - ATA (Avaliação de Traços Autísticos)
 *
 * 3 estágios:
 * 0) Seletor de versão (Completa / Resumida)
 * 1) Aplicação seção por seção
 * 2) Resultados (scores + gráficos)
 * 3) Relatório AI
 */

import React, { useState, useRef } from 'react';
import useAtaLogic from '../../hooks/useAtaLogic';
import { AtaSectionBarChart, AtaRadarChart, AtaRiskGauge, AtaSectionCards } from '../charts/AtaChart';

export default function AtaScreen({ sessionInfo, onFinalize, onBack, isReadOnly }) {
  const logic = useAtaLogic(sessionInfo, isReadOnly);
  const [stage, setStage] = useState(logic.scores ? 'scoring' : logic.version ? 'application' : 'select');
  const topRef = useRef(null);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ═══════════════════════════════════
  // ESTÁGIO 0: SELETOR DE VERSÃO
  // ═══════════════════════════════════
  if (stage === 'select') {
    return (
      <div style={S.container} ref={topRef}>
        <TopBar childName={sessionInfo?.child_name} stage="select" />

        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧩</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
            ATA - Avaliação de Traços Autísticos
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 32px' }}>
            Selecione a versão do teste que deseja aplicar:
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Card Completa */}
            <div
              onClick={() => { logic.selectVersion('completa'); setStage('application'); }}
              style={S.versionCard}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                ATA Completa
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                ~120 sub-itens comportamentais
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={S.badge}>Sim / Não</span>
                <span style={S.badge}>23 seções</span>
                <span style={S.badge}>~30 min</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '12px', lineHeight: 1.4 }}>
                Avaliação detalhada com checklist de comportamentos observados.
                Ideal para relatórios completos e acompanhamento.
              </p>
            </div>

            {/* Card Resumida */}
            <div
              onClick={() => { logic.selectVersion('resumida'); setStage('application'); }}
              style={S.versionCard}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                ATA Resumida
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                23 perguntas com escala A/B/C
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={S.badge}>A / B / C</span>
                <span style={S.badge}>23 itens</span>
                <span style={S.badge}>~10 min</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '12px', lineHeight: 1.4 }}>
                Triagem rápida com pontuação por intensidade.
                Ideal para avaliação inicial e screening.
              </p>
            </div>
          </div>

          <button onClick={onBack} style={{ ...S.btnSmall, marginTop: '24px' }}>← Voltar</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════
  // ESTÁGIO 2: RESULTADOS
  // ═══════════════════════════════════
  if (stage === 'scoring') {
    const sc = logic.scores;
    if (!sc) { setStage('application'); return null; }

    return (
      <div style={S.container} ref={topRef}>
        <TopBar childName={sessionInfo?.child_name} stage="scoring" version={logic.version} />

        {/* Resultado principal */}
        <AtaRiskGauge totalScore={sc.totalScore} maxPossible={sc.maxPossible} riskInfo={sc.riskInfo} />

        {/* Gráficos */}
        <div style={{ marginTop: '20px' }}>
          <AtaSectionBarChart sectionScores={sc.sectionScores} sections={logic.sections} version={sc.version} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <AtaRadarChart sectionScores={sc.sectionScores} sections={logic.sections} version={sc.version} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <AtaSectionCards sectionScores={sc.sectionScores} sections={logic.sections} version={sc.version} />
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => setStage('application')} style={S.btnSecondary}>← Revisar Aplicação</button>
          <button onClick={() => setStage('report')} style={S.btnPrimary}>Gerar Relatório AI →</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════
  // ESTÁGIO 3: RELATÓRIO AI
  // ═══════════════════════════════════
  if (stage === 'report') {
    return (
      <div style={S.container} ref={topRef}>
        <TopBar childName={sessionInfo?.child_name} stage="report" version={logic.version} />
        <div style={S.doneCard}>
          <div style={{ fontSize: '2rem' }}>📝</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: '8px 0' }}>
            Relatório AI
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Gere o relatório clínico baseado nos resultados da ATA.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => setStage('scoring')} style={S.btnSecondary}>← Ver Resultados</button>
            <button onClick={() => onFinalize && onFinalize()} style={S.btnPrimary}>Finalizar →</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════
  // ESTÁGIO 1: APLICAÇÃO
  // ═══════════════════════════════════
  const section = logic.currentSection;
  const sectionData = logic.currentSectionData;

  // Fim do fluxo
  if (!section && logic.progress.answered > 0) {
    return (
      <div style={S.container} ref={topRef}>
        <TopBar childName={sessionInfo?.child_name} stage="application" version={logic.version} />
        <div style={S.doneCard}>
          <div style={{ fontSize: '2rem' }}>✓</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: '8px 0' }}>
            Aplicação Concluída!
          </div>
          <p style={{ color: '#64748b' }}>
            {logic.progress.answered} de {logic.progress.total} seções respondidas ({logic.version === 'completa' ? 'versão completa' : 'versão resumida'}).
          </p>
          <button onClick={() => { logic.calculateScores(); setStage('scoring'); }} style={S.btnPrimary}>
            Ver Resultados →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.container} ref={topRef}>
      <TopBar childName={sessionInfo?.child_name} stage="application" version={logic.version} />

      {/* ── Info versão ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
            background: logic.version === 'completa' ? '#ede9fe' : '#dbeafe',
            color: logic.version === 'completa' ? '#6d28d9' : '#1d4ed8',
          }}>
            {logic.version === 'completa' ? '📋 Completa' : '⚡ Resumida'}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {logic.progress.answered}/{logic.progress.total} seções
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setStage('select'); }} style={S.btnSmall}>Trocar Versão</button>
          <button onClick={onBack} style={S.btnSmall}>← Sair</button>
        </div>
      </div>

      {/* ── Mapa de seções ── */}
      <SectionMap
        sections={logic.sections}
        currentIndex={logic.sectionIndex}
        isSectionComplete={logic.isSectionComplete}
        onGoTo={(idx) => { logic.goToSection(idx); scrollToTop(); }}
      />

      {/* ── Conteúdo da seção ── */}
      {section && sectionData && (
        <div style={{ marginTop: '12px' }}>
          {/* Cabeçalho seção */}
          <div style={{
            padding: '14px 18px', borderRadius: '12px', marginBottom: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            color: '#fff',
          }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '2px' }}>
              Seção {section.number} de {logic.sections.length}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {section.roman}. {section.label}
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '6px', opacity: 0.9 }}>
              {sectionData.question}
            </div>
          </div>

          {/* Itens */}
          {logic.version === 'completa' ? (
            <CompleteSection
              section={section}
              sectionData={sectionData}
              responses={logic.responses}
              onRespond={logic.setCompleteResponse}
              onAllYes={logic.markAllYes}
              onAllNo={logic.markAllNo}
              isReadOnly={isReadOnly}
            />
          ) : (
            <SummarySection
              section={section}
              sectionData={sectionData}
              responses={logic.responses}
              onRespond={logic.setSummaryResponse}
              isReadOnly={isReadOnly}
            />
          )}

          {/* Navegação */}
          <NavBar
            canPrev={logic.sectionIndex > 0}
            canNext={logic.sectionIndex < logic.sections.length - 1}
            isLast={logic.isLastSection}
            isComplete={logic.isCurrentSectionComplete}
            onPrev={() => { logic.prevSection(); scrollToTop(); }}
            onNext={() => { logic.nextSection(); scrollToTop(); }}
            onCalculate={() => { logic.calculateScores(); setStage('scoring'); scrollToTop(); }}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════
// SUB-COMPONENTES
// ═══════════════════════════════════

function TopBar({ childName, stage, version }) {
  const stages = [
    { key: 'select', label: 'Versão' },
    { key: 'application', label: 'Aplicação' },
    { key: 'scoring', label: 'Resultados' },
    { key: 'report', label: 'Relatório' },
  ];

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
            ATA {version === 'completa' ? '(Completa)' : version === 'resumida' ? '(Resumida)' : ''}
          </span>
          {childName && <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '8px' }}>— {childName}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {stages.map(s => (
          <div key={s.key} style={{
            flex: 1, padding: '6px', borderRadius: '8px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600,
            background: stage === s.key ? '#6366f1' : '#f1f5f9',
            color: stage === s.key ? '#fff' : '#94a3b8',
          }}>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionMap({ sections, currentIndex, isSectionComplete, onGoTo }) {
  return (
    <div style={{
      display: 'flex', gap: '3px', flexWrap: 'wrap',
      padding: '10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0',
    }}>
      {sections.map((s, idx) => {
        const complete = isSectionComplete(s.id);
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={s.id}
            onClick={() => onGoTo(idx)}
            title={`${s.roman}. ${s.label}`}
            style={{
              width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700,
              background: isCurrent ? '#6366f1' : complete ? '#22c55e' : '#e2e8f0',
              color: isCurrent || complete ? '#fff' : '#94a3b8',
              border: isCurrent ? '2px solid #4338ca' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {s.number}
          </div>
        );
      })}
    </div>
  );
}

function CompleteSection({ section, sectionData, responses, onRespond, onAllYes, onAllNo, isReadOnly }) {
  return (
    <div>
      {/* Ações rápidas */}
      {!isReadOnly && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button onClick={onAllYes} style={{ ...S.btnSmall, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
            Todos Sim
          </button>
          <button onClick={onAllNo} style={{ ...S.btnSmall, background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' }}>
            Todos Não
          </button>
        </div>
      )}

      {sectionData.items.map((item) => {
        const val = responses[item.id];
        return (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 14px', marginBottom: '6px',
            background: val !== undefined ? (val ? '#fef2f2' : '#f0fdf4') : '#fff',
            borderRadius: '10px', border: `1px solid ${val !== undefined ? (val ? '#fecaca' : '#bbf7d0') : '#e2e8f0'}`,
          }}>
            <div style={{ flex: 1, fontSize: '0.9rem', color: '#334155', lineHeight: 1.4 }}>
              {item.text}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button
                onClick={() => !isReadOnly && onRespond(item.id, true)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                  border: `2px solid ${val === true ? '#ef4444' : '#e2e8f0'}`,
                  background: val === true ? '#ef4444' : '#fff',
                  color: val === true ? '#fff' : '#94a3b8',
                  cursor: isReadOnly ? 'default' : 'pointer',
                }}
              >
                Sim
              </button>
              <button
                onClick={() => !isReadOnly && onRespond(item.id, false)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                  border: `2px solid ${val === false ? '#22c55e' : '#e2e8f0'}`,
                  background: val === false ? '#22c55e' : '#fff',
                  color: val === false ? '#fff' : '#94a3b8',
                  cursor: isReadOnly ? 'default' : 'pointer',
                }}
              >
                Não
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SummarySection({ section, sectionData, responses, onRespond, isReadOnly }) {
  const selected = responses[section.id] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sectionData.options.map((opt) => {
        const isSelected = selected === opt.letter;
        const colors = {
          A: { bg: '#f0fdf4', border: '#22c55e', activeBg: '#22c55e' },
          B: { bg: '#fefce8', border: '#eab308', activeBg: '#eab308' },
          C: { bg: '#fef2f2', border: '#ef4444', activeBg: '#ef4444' },
        };
        const c = colors[opt.letter];

        return (
          <div
            key={opt.letter}
            onClick={() => !isReadOnly && onRespond(section.id, opt.letter)}
            style={{
              padding: '16px 18px', borderRadius: '12px', cursor: isReadOnly ? 'default' : 'pointer',
              background: isSelected ? c.activeBg : '#fff',
              border: `2px solid ${isSelected ? c.activeBg : '#e2e8f0'}`,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800,
                background: isSelected ? 'rgba(255,255,255,0.3)' : c.bg,
                color: isSelected ? '#fff' : c.border,
                border: `2px solid ${isSelected ? 'rgba(255,255,255,0.5)' : c.border}`,
              }}>
                {opt.letter}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.9rem', fontWeight: 600, color: isSelected ? '#fff' : '#334155',
                  lineHeight: 1.4,
                }}>
                  {opt.text}
                </div>
                <div style={{
                  fontSize: '0.75rem', marginTop: '2px',
                  color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                }}>
                  {opt.score === 0 ? 'Ausência' : opt.score === 1 ? 'Presença leve' : 'Presença significativa'} — {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </div>
              {isSelected && (
                <div style={{ fontSize: '1.2rem', color: '#fff' }}>✓</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NavBar({ canPrev, canNext, isLast, isComplete, onPrev, onNext, onCalculate }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginTop: '16px', padding: '14px 0', borderTop: '1px solid #e2e8f0',
    }}>
      <button onClick={onPrev} disabled={!canPrev} style={{ ...S.btnSecondary, opacity: canPrev ? 1 : 0.4 }}>
        ← Anterior
      </button>

      {isLast ? (
        <button onClick={onCalculate} style={S.btnPrimary}>
          Calcular Resultados →
        </button>
      ) : (
        <button onClick={onNext} style={{ ...S.btnPrimary, opacity: 1 }}>
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  versionCard: {
    width: '260px',
    padding: '28px 24px',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    background: '#f1f5f9',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  doneCard: {
    textAlign: 'center',
    padding: '40px 20px',
    background: '#f0fdf4',
    borderRadius: '16px',
    border: '1px solid #bbf7d0',
  },
  btnPrimary: {
    padding: '10px 24px',
    borderRadius: '10px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 20px',
    borderRadius: '10px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSmall: {
    padding: '6px 14px',
    borderRadius: '8px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
