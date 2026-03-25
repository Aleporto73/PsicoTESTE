import { useState, useMemo } from 'react';
import { TASK_ANALYSIS_MAP_BY_LEVEL } from '../data/taskAnalysis';

export default function usePEILogic(sessionInfo, isReadOnly = false) {
  // ═══════════════════════════════════════════════════════════════
  // STATE VARIABLES
  // ═══════════════════════════════════════════════════════════════
  const [metasSelecionadas, setMetasSelecionadas] = useState([]);
  const [expandedMilestones, setExpandedMilestones] = useState({});

  // ═══════════════════════════════════════════════════════════════
  // EXTRAIR NÍVEL DA CRIANÇA
  // ═══════════════════════════════════════════════════════════════
  const nivelCrianca = useMemo(() => {
    // Prioridade 1: active_level definido na sessão
    if (sessionInfo?.active_level) {
      return parseInt(sessionInfo.active_level);
    }

    // Prioridade 2: Extrair do nome da criança (ex: "JAmanta Nivel 1")
    const childName = sessionInfo?.child_name || '';
    const match = childName.match(/[Nn]ivel\s*(\d)/i);
    if (match) {
      return parseInt(match[1]);
    }

    // Prioridade 3: Inferir do maior nível com scores
    const scores = sessionInfo?.scores_snapshot || {};
    const scoreKeys = Object.keys(scores);

    if (scoreKeys.some(k => k.includes('-L3-'))) return 3;
    if (scoreKeys.some(k => k.includes('-L2-'))) return 2;
    return 1;
  }, [sessionInfo]);

  // ═══════════════════════════════════════════════════════════════
  // MAPEAMENTO DE DOMÍNIOS
  // Chaves correspondem EXATAMENTE às do TASK_ANALYSIS_MAP_BY_LEVEL
  // ═══════════════════════════════════════════════════════════════

  // Função para obter a chave correta do Task Analysis baseado no domínio e nível
  const getDomainKeyForTaskAnalysis = (domCode, level) => {
    // Mapeamento DOM -> chave do TASK_ANALYSIS_MAP_BY_LEVEL
    const baseMap = {
      'DOM01': 'MANDO',
      'DOM02': 'TATO',
      'DOM03': 'OUVINTE',
      'DOM04': 'HABILIDADES PERCEPTUAIS VISUAIS E PAREAMENTO AO MODELO',
      'DOM05': 'BRINCAR INDEPENDENTE',
      'DOM06': 'COMPORTAMENTO SOCIAL E BRINCAR SOCIAL',
      'DOM07': 'IMITAÇÃO',
      'DOM08': 'COMPORTAMENTO VOCAL ESPONTÂNEO',
      'DOM09': 'COMPORTAMENTO VOCAL ESPONTÂNEO',
      'DOM10': 'RESPOSTA DE OUVINTE POR FUNÇÃO, CARACTERÍSTICA E CLASSE',
      'DOM11': 'INTRAVERBAL',
      'DOM12': 'ROTINAS DE CLASSE E HABILIDADES DE GRUPO',
      'DOM13': 'ESTRUTURA LINGUÍSTICA',
      'DOM14': 'LEITURA',
      'DOM15': 'ESCRITA',
      'DOM16': 'MATEMÁTICA'
    };

    return baseMap[domCode] || domCode;
  };

  // Nomes amigáveis para exibição
  const DOMAIN_NAMES_PT = {
    'DOM01': 'Mando',
    'DOM02': 'Tato',
    'DOM03': 'Ouvinte',
    'DOM04': 'Percepção Visual / MTS',
    'DOM05': 'Brincar Independente',
    'DOM06': 'Social / Brincar Social',
    'DOM07': 'Imitação',
    'DOM08': 'Ecoico',
    'DOM09': 'Vocal Espontâneo',
    'DOM10': 'ROFCC',
    'DOM11': 'Intraverbal',
    'DOM12': 'Rotina de Grupo',
    'DOM13': 'Estrutura Linguística',
    'DOM14': 'Leitura',
    'DOM15': 'Escrita',
    'DOM16': 'Matemática'
  };

  // ═══════════════════════════════════════════════════════════════
  // PROCESSAR LACUNAS DO NÍVEL ATUAL
  // ═══════════════════════════════════════════════════════════════
  const lacunasPorDominio = useMemo(() => {
    const scores = sessionInfo?.scores_snapshot || {};
    const lacunasFromSession = sessionInfo?.lacunas || [];

    // Objeto para agrupar lacunas por domínio
    const porDominio = {};

    // Debug: mostrar chaves disponíveis no TASK_ANALYSIS_MAP
    const taskMapForLevel = TASK_ANALYSIS_MAP_BY_LEVEL[nivelCrianca] || {};
    console.log(`📊 PEI - Nível ${nivelCrianca} - Chaves disponíveis:`, Object.keys(taskMapForLevel));

    // Filtrar lacunas do nível atual
    Object.entries(scores).forEach(([blockId, status]) => {
      // Só entra no PEI: emergente ou nao_observado
      // Nunca entra: dominado, nao_avaliado, ou qualquer outro valor
      if (status !== 'emergente' && status !== 'nao_observado') return;

      // Extrair informações do blockId (ex: DOM01-L1-M01 ou DOM01-L1-M5)
      const match = blockId.match(/^(DOM\d+)-L(\d+)-M(\d+)$/);
      if (!match) return;

      const [, domCode, levelStr, milestoneStr] = match;
      const levelNum = parseInt(levelStr);
      const milestoneNum = parseInt(milestoneStr);

      // ✅ FILTRO CRÍTICO: Só inclui se for do nível da criança
      if (levelNum !== nivelCrianca) return;

      // Buscar Task Analysis para este domínio
      const domainKey = getDomainKeyForTaskAnalysis(domCode, nivelCrianca);
      const taskAnalysis = taskMapForLevel[domainKey] || [];

      // Debug para cada domínio
      if (taskAnalysis.length === 0) {
        console.log(`⚠️ Sem tasks para ${domCode} (chave: "${domainKey}") no nível ${nivelCrianca}`);
      }

      // Filtrar tarefas do milestone específico
      const tarefasDoMilestone = taskAnalysis.filter(task => {
        if (!task.id) return false;
        const taskMilestone = parseInt(task.id.split('-')[0]);
        return taskMilestone === milestoneNum;
      });

      // Criar entrada no domínio se não existir
      if (!porDominio[domCode]) {
        porDominio[domCode] = {
          domainCode: domCode,
          domainName: DOMAIN_NAMES_PT[domCode] || domCode,
          domainKey: domainKey, // Para debug
          milestones: []
        };
      }

      // Buscar texto original da lacuna
      const lacunaOriginal = lacunasFromSession.find(l => l.block_id === blockId);

      // Adicionar milestone com suas tarefas
      porDominio[domCode].milestones.push({
        blockId,
        milestoneNum,
        level: levelNum,
        status,
        textoOriginal: lacunaOriginal?.texto || `${milestoneNum}-M - ${DOMAIN_NAMES_PT[domCode]}`,
        tarefas: tarefasDoMilestone.map(t => ({
          id: t.id,
          texto: t.texto || t.text,
          selecionada: false
        }))
      });
    });

    // Ordenar milestones dentro de cada domínio
    Object.values(porDominio).forEach(domain => {
      domain.milestones.sort((a, b) => a.milestoneNum - b.milestoneNum);
    });

    console.log(`📋 PEI - Domínios com lacunas:`, Object.keys(porDominio));

    return porDominio;
  }, [sessionInfo, nivelCrianca]);

  // ═══════════════════════════════════════════════════════════════
  // ESTATÍSTICAS DO NÍVEL
  // ═══════════════════════════════════════════════════════════════
  const estatisticas = useMemo(() => {
    const scores = sessionInfo?.scores_snapshot || {};

    // Filtrar apenas scores do nível atual
    const scoresDoNivel = Object.entries(scores).filter(([blockId]) => {
      const match = blockId.match(/-L(\d+)-/);
      return match && parseInt(match[1]) === nivelCrianca;
    });

    const total = scoresDoNivel.length;
    const dominados = scoresDoNivel.filter(([, s]) => s === 'dominado').length;
    const emergentes = scoresDoNivel.filter(([, s]) => s === 'emergente').length;
    const naoObservados = scoresDoNivel.filter(([, s]) => s === 'nao_observado').length;

    const totalLacunas = Object.values(lacunasPorDominio).reduce(
      (acc, d) => acc + d.milestones.length, 0
    );

    const totalTarefas = Object.values(lacunasPorDominio).reduce(
      (acc, d) => acc + d.milestones.reduce((a, m) => a + m.tarefas.length, 0), 0
    );

    return {
      total,
      dominados,
      emergentes,
      naoObservados,
      percentDominado: total > 0 ? ((dominados / total) * 100).toFixed(1) : '0.0',
      totalLacunas,
      totalTarefas
    };
  }, [sessionInfo, nivelCrianca, lacunasPorDominio]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════
  const toggleMilestone = (blockId) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const toggleTarefa = (blockId, tarefaId) => {
    if (isReadOnly) return;

    const key = `${blockId}::${tarefaId}`;
    setMetasSelecionadas(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const selecionarTodasTarefas = (blockId, tarefas) => {
    if (isReadOnly) return;

    const keys = tarefas.map(t => `${blockId}::${t.id}`);
    const todasSelecionadas = keys.every(k => metasSelecionadas.includes(k));

    if (todasSelecionadas) {
      setMetasSelecionadas(prev => prev.filter(k => !keys.includes(k)));
    } else {
      setMetasSelecionadas(prev => [...new Set([...prev, ...keys])]);
    }
  };

  const handleFinalize = (onFinalize) => {
    // Preparar metas para o payload
    const metasFormatadas = metasSelecionadas.map(key => {
      const [blockId, tarefaId] = key.split('::');

      // Encontrar a tarefa
      for (const domain of Object.values(lacunasPorDominio)) {
        for (const milestone of domain.milestones) {
          if (milestone.blockId === blockId) {
            const tarefa = milestone.tarefas.find(t => t.id === tarefaId);
            if (tarefa) {
              return {
                blockId,
                tarefaId,
                dominio: domain.domainName,
                milestone: milestone.milestoneNum,
                texto: tarefa.texto,
                nivel: nivelCrianca
              };
            }
          }
        }
      }
      return null;
    }).filter(Boolean);

    const payload = {
      pei_metas: metasFormatadas,
      pei_total_metas: metasFormatadas.length,
      pei_nivel: nivelCrianca,
      pei_timestamp: new Date().toISOString()
    };

    console.log("📝 PEI finalizado:", payload);
    onFinalize(payload);
  };

  // ═══════════════════════════════════════════════════════════════
  // RETURN ALL STATE AND HANDLERS
  // ═══════════════════════════════════════════════════════════════
  return {
    // State
    metasSelecionadas,
    expandedMilestones,

    // Computed values
    nivelCrianca,
    lacunasPorDominio,
    estatisticas,
    DOMAIN_NAMES_PT,

    // Handlers
    toggleMilestone,
    toggleTarefa,
    selecionarTodasTarefas,
    handleFinalize,

    // Utilities
    getDomainKeyForTaskAnalysis
  };
}
