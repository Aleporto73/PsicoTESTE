import { useState, useMemo, useEffect } from 'react';
import { TASK_ANALYSIS_MAP } from '../data/taskAnalysis';

export function useMilestoneLogic(sessionInfo, data) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [childName, setChildName] = useState('');
  const [scores, setScores] = useState({});
  const [audience, setAudience] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [auditLog, setAuditLog] = useState({});
  const [activeTaskBlock, setActiveTaskBlock] = useState(null);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    console.log("🔄 MilestonesScreen - Carregando sessão:", {
      sessionId: sessionInfo?.session_id,
      childName: sessionInfo?.child_name,
      scoresCount: Object.keys(sessionInfo?.scores_snapshot || {}).length,
      isReadOnly: sessionInfo?.isReadOnly
    });

    // Reset para nova sessão
    if (sessionInfo?.session_id) {
      setChildName(sessionInfo?.child_name || '');
      setScores(sessionInfo?.scores_snapshot || {});
    }

    return () => {
      console.log("🧹 MilestonesScreen - Cleanup");
    };
  }, [sessionInfo]);

  // ============================================
  // DATA EXTRACTION
  // ============================================

  const domains = data?.domains || [];
  const totalBlocks = domains.reduce((total, domain) =>
    total + (domain.blocks?.length || 0), 0
  );

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const progress = useMemo(() => {
    const isLevelFiltered = levelFilter !== 'Todos';
    const targetLevel = isLevelFiltered ? levelFilter.split(' ')[1] : null;

    // Identificar blocos do contexto atual
    let currentContextBlocks = [];
    domains.forEach(d => {
      d.blocks?.forEach(b => {
        if (!isLevelFiltered || (b.level && b.level.startsWith(targetLevel))) {
          currentContextBlocks.push(b);
        }
      });
    });

    const totalInContext = currentContextBlocks.length;
    const scoresInContext = currentContextBlocks.map(b => scores[b.block_id]).filter(Boolean);

    const evaluated = scoresInContext.filter(v => v === 'dominado' || v === 'emergente').length;
    const notObserved = scoresInContext.filter(v => v === 'nao_observado').length;
    const filled = scoresInContext.length;
    const pending = totalInContext - filled;

    const percentComplete = totalInContext > 0
      ? ((filled / totalInContext) * 100).toFixed(1)
      : '0.0';

    // Stats Globais (sempre para o payload)
    const globalScores = Object.values(scores);
    const globalEvaluated = globalScores.filter(v => v === 'dominado' || v === 'emergente').length;

    return {
      totalBlocks: totalInContext,
      filled,
      isLevelFiltered,
      context: {
        name: levelFilter,
        evaluated,
        notObserved,
        pending,
        percent: percentComplete
      },
      global: {
        total: totalBlocks,
        evaluated: globalEvaluated,
        percent: ((globalScores.length / totalBlocks) * 100).toFixed(1)
      }
    };
  }, [scores, totalBlocks, levelFilter, domains]);

  const filteredDomains = useMemo(() => {
    if (levelFilter === 'Todos') return domains;

    const targetLevel = levelFilter.split(' ')[1]; // "1", "2" ou "3"

    return domains
      .map(domain => ({
        ...domain,
        blocks: domain.blocks?.filter(block =>
          block.level && block.level.startsWith(targetLevel)
        ) || []
      }))
      .filter(domain => domain.blocks.length > 0);
  }, [domains, levelFilter]);

  const canFinalize = useMemo(() => {
    const validName = childName.trim().length >= 3;
    const hasAnyScore = Object.keys(scores).length > 0;

    return validName && hasAnyScore;
  }, [childName, scores]);

  // ============================================
  // BUSINESS LOGIC - SCORE MANAGEMENT
  // ============================================

  const setBlockScore = (blockId, value) => {
    setScores(prev => {
      const newScores = { ...prev, [blockId]: value };
      console.log(`🎯 Score atualizado: ${blockId} = ${value}`);
      return newScores;
    });
  };

  // ============================================
  // BUSINESS LOGIC - LACUNAS GENERATION
  // ============================================

  const generateLacunas = () => {
    const lacunas = [];

    domains.forEach(domain => {
      domain.blocks?.forEach(block => {
        const status = scores[block.block_id];
        if (status === 'emergente' || status === 'nao_observado') {
          lacunas.push({
            block_id: block.block_id,
            domain_id: domain.domain_id,
            domain_name: domain.domain_name,
            level: block.level || 'N/A',
            status: status,
            texto: audience === 'professional'
              ? block.texto_profissional
              : block.texto_responsavel,
            order: block.order || 0,
            // Metadados para filtro na próxima tela
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Ordenar por domínio e nível
    lacunas.sort((a, b) => {
      if (a.domain_id !== b.domain_id) return a.domain_id.localeCompare(b.domain_id);
      if (a.order !== b.order) return a.order - b.order;
      return a.block_id.localeCompare(b.block_id);
    });

    console.log("🔍 Lacunas geradas:", lacunas.length, "itens");
    return lacunas;
  };

  // ============================================
  // BUSINESS LOGIC - LEVEL MANAGEMENT
  // ============================================

  const handleCloseLevel = (levelId) => {
    const confirmClose = window.confirm(`Deseja encerrar o Nível ${levelId}? Todos os itens vazios desta fase serão marcados como 'Não Observado'.`);
    if (!confirmClose) return;

    setScores(prev => {
      const newScores = { ...prev };
      domains.forEach(d => {
        d.blocks?.forEach(b => {
          if (b.level && b.level.startsWith(levelId) && !newScores[b.block_id]) {
            newScores[b.block_id] = 'nao_observado';
          }
        });
      });
      return newScores;
    });

    setAuditLog(prev => ({
      ...prev,
      [`nivel_${levelId}`]: {
        action: 'level_closed',
        timestamp: new Date().toISOString(),
        user: sessionInfo?.user_name || 'Profissional'
      }
    }));

    console.log(`🔒 Nível ${levelId} encerrado manualmente.`);
  };

  // ============================================
  // BUSINESS LOGIC - FINALIZATION
  // ============================================

  const handleFinalize = async (onFinalize) => {
    if (!canFinalize) {
      if (childName.trim().length < 3) {
        alert('⚠️ Por favor, digite o nome da criança (mínimo 3 caracteres).');
        return;
      }
      alert('⚠️ Por favor, preencha pelo menos um item para finalizar.');
      return;
    }

    setLoading(true);
    console.log("🚀 Iniciando finalização da MilestonesScreen...");

    try {
      // ✅ AUTOMAÇÃO FINAL: Preencher TUDO que sobrou como 'não observado'
      const finalScores = { ...scores };
      let autoFilledCount = 0;

      domains.forEach(d => {
        d.blocks?.forEach(b => {
          if (!finalScores[b.block_id]) {
            finalScores[b.block_id] = 'nao_observado';
            autoFilledCount++;
          }
        });
      });

      // Gerar lacunas com os scores finais
      const lacunas = [];
      domains.forEach(domain => {
        domain.blocks?.forEach(block => {
          const status = finalScores[block.block_id];
          if (status === 'emergente' || status === 'nao_observado') {
            lacunas.push({
              block_id: block.block_id,
              domain_id: domain.domain_id,
              domain_name: domain.domain_name,
              level: block.level || 'N/A',
              status: status,
              texto: audience === 'professional' ? block.texto_profissional : block.texto_responsavel,
              order: block.order || 0,
              timestamp: new Date().toISOString()
            });
          }
        });
      });

      // Calcular estatísticas por domínio (usando finalScores)
      const domainStats = {};
      domains.forEach(domain => {
        const domainScores = domain.blocks
          ?.map(block => finalScores[block.block_id])
          ?.filter(Boolean) || [];

        if (domainScores.length > 0) {
          domainStats[domain.domain_id] = {
            domain_name: domain.domain_name,
            total_blocks: domain.blocks?.length || 0,
            filled: domainScores.length,
            dominado: domainScores.filter(s => s === 'dominado').length,
            emergente: domainScores.filter(s => s === 'emergente').length,
            nao_observado: domainScores.filter(s => s === 'nao_observado').length,
            percent_dominado: ((domainScores.filter(s => s === 'dominado').length / domainScores.length) * 100).toFixed(1)
          };
        }
      });

      // Determinar nível ativo clínico se estiver em 'Todos'
      let derivedLevel = levelFilter === 'Todos' ? null : levelFilter.split(' ')[1];
      if (!derivedLevel) {
        // Fallback: Maior nível com pelo menos um item preenchido
        const scoresKeys = Object.keys(finalScores);
        if (scoresKeys.some(k => k.includes('-L3-'))) derivedLevel = '3';
        else if (scoresKeys.some(k => k.includes('-L2-'))) derivedLevel = '2';
        else derivedLevel = '1';
      }

      const finalPayload = {
        child_name: childName.trim(),
        scores_snapshot: finalScores,
        lacunas: lacunas,
        active_level: derivedLevel,
        percentuais: {
          geral: {
            dominado: ((Object.values(finalScores).filter(v => v === 'dominado').length / totalBlocks) * 100).toFixed(1),
            emergente: ((Object.values(finalScores).filter(v => v === 'emergente').length / totalBlocks) * 100).toFixed(1),
            nao_observado: ((Object.values(finalScores).filter(v => v === 'nao_observado').length / totalBlocks) * 100).toFixed(1)
          },
          por_dominio: domainStats
        },
        audit_log: {
          ...auditLog,
          global_closure: {
            action: 'finalized',
            timestamp: new Date().toISOString(),
            user: sessionInfo?.user_name || 'Profissional',
            auto_filled: autoFilledCount
          }
        },
        last_updated: new Date().toISOString(),
        assessment_duration: Math.round((Date.now() - new Date(sessionInfo?.date || Date.now()).getTime()) / 60000),
        progress_summary: {
          total_blocks: totalBlocks,
          filled_blocks: totalBlocks, // Agora é sempre total pois preenchemos o que falta
          lacunas_count: lacunas.length,
          completion_percentage: '100.0'
        },
        milestones_completo: true, // ✅ CHAVE PARA O ECOICO FUNCIONAR
      };

      onFinalize(finalPayload);

      setTimeout(() => {
        alert(`✅ Avaliação encerrada!\n\n• ${autoFilledCount} itens automáticos (não observados)\n• ${lacunas.length} lacunas identificadas`);
      }, 100);

    } catch (error) {
      console.error("❌ Erro ao finalizar milestones:", error);
      alert("❌ Ocorreu um erro ao finalizar a avaliação.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RETURN OBJECT
  // ============================================

  return {
    // State
    childName,
    setChildName,
    scores,
    setScores,
    audience,
    setAudience,
    loading,
    setLoading,
    levelFilter,
    setLevelFilter,
    auditLog,
    setAuditLog,
    activeTaskBlock,
    setActiveTaskBlock,

    // Data
    domains,
    totalBlocks,
    filteredDomains,

    // Computed
    progress,
    canFinalize,

    // Methods
    setBlockScore,
    generateLacunas,
    handleCloseLevel,
    handleFinalize
  };
}
