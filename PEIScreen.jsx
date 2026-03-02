import React, { useState, useMemo } from 'react';
import { TASK_ANALYSIS_MAP_BY_LEVEL } from './taskAnalysisData';

/*
  📝 PEI SCREEN - CORRIGIDO v2
  
  Funcionalidades:
  1. Filtra lacunas pelo nível ativo (active_level da sessão)
  2. Usa textos detalhados do Task Analysis (não genéricos)
  3. Permite selecionar tarefas específicas para o PEI
  4. Agrupa por domínio para melhor organização
  
  CORREÇÃO: Mapeamento de domínios alinhado com TASK_ANALYSIS_MAP_BY_LEVEL
*/

export default function PEIScreen({
  sessionInfo,
  onFinalize,
  onBack,
  isReadOnly = false
}) {
  // Estado para metas selecionadas
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
  // MAPEAMENTO DE DOMÍNIOS - CORRIGIDO
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
      // Só processa se não for dominado
      if (status === 'dominado') return;

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

  const handleFinalize = () => {
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
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  const dominiosComLacunas = Object.values(lacunasPorDominio).filter(d => d.milestones.length > 0);

  return (
    <div className="pei-screen">
      <style>{getStyles()}</style>

      {/* HEADER */}
      <header className="pei-header">
        <div className="header-content">
          <h1>📝 Plano Educacional Individualizado</h1>
          <p>Seleção de Metas para Intervenção (Tela 5/5)</p>
          <div className="header-badges">
            <span className="badge-child">
              {sessionInfo?.child_name || 'Criança'}
            </span>
            <span className="badge-level">
              Nível {nivelCrianca}
            </span>
            {isReadOnly && (
              <span className="badge-readonly">🔒 Somente Leitura</span>
            )}
          </div>
        </div>
        <button className="btn-back" onClick={onBack}>
          ← Voltar
        </button>
      </header>

      {/* RESUMO ESTATÍSTICO */}
      <section className="stats-section">
        <h2>📊 Consolidado - Nível {nivelCrianca}</h2>
        <div className="stats-grid">
          <div className="stat-card verde">
            <span className="stat-numero">{estatisticas.percentDominado}%</span>
            <span className="stat-label">Dominados</span>
            <span className="stat-detalhe">{estatisticas.dominados} de {estatisticas.total}</span>
          </div>
          <div className="stat-card amarelo">
            <span className="stat-numero">{estatisticas.emergentes}</span>
            <span className="stat-label">Emergentes</span>
          </div>
          <div className="stat-card cinza">
            <span className="stat-numero">{estatisticas.naoObservados}</span>
            <span className="stat-label">Não Observados</span>
          </div>
          <div className="stat-card roxo">
            <span className="stat-numero">{estatisticas.totalLacunas}</span>
            <span className="stat-label">Lacunas</span>
            <span className="stat-detalhe">{estatisticas.totalTarefas} tarefas disponíveis</span>
          </div>
        </div>
      </section>

      {/* SELEÇÃO DE METAS */}
      <section className="metas-section">
        <div className="metas-header">
          <h2>📋 Lacunas do Nível {nivelCrianca} ({estatisticas.totalLacunas} milestones)</h2>
          <div className="metas-counter">
            <span className="counter-numero">{metasSelecionadas.length}</span>
            <span className="counter-label">metas selecionadas</span>
          </div>
        </div>

        {dominiosComLacunas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎉</span>
            <h3>Parabéns!</h3>
            <p>Não há lacunas identificadas no Nível {nivelCrianca}.</p>
            <p>A criança dominou todas as habilidades deste nível!</p>
          </div>
        ) : (
          <div className="dominios-lista">
            {dominiosComLacunas.map(domain => (
              <div key={domain.domainCode} className="dominio-card">
                <div className="dominio-header">
                  <h3>
                    <span className="dominio-icon">📁</span>
                    {domain.domainName}
                  </h3>
                  <span className="dominio-count">
                    {domain.milestones.length} lacuna{domain.milestones.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="milestones-lista">
                  {domain.milestones.map(milestone => {
                    const isExpanded = expandedMilestones[milestone.blockId];
                    const tarefasSelecionadas = milestone.tarefas.filter(t =>
                      metasSelecionadas.includes(`${milestone.blockId}::${t.id}`)
                    ).length;

                    return (
                      <div key={milestone.blockId} className="milestone-item">
                        <div
                          className="milestone-header"
                          onClick={() => toggleMilestone(milestone.blockId)}
                        >
                          <div className="milestone-info">
                            <span className={`milestone-status ${milestone.status}`}>
                              {milestone.status === 'emergente' ? '◐' : '○'}
                            </span>
                            <span className="milestone-id">{milestone.milestoneNum}-M</span>
                            <span className="milestone-texto">{milestone.textoOriginal}</span>
                          </div>
                          <div className="milestone-actions">
                            {milestone.tarefas.length > 0 && (
                              <span className="tarefas-badge">
                                {tarefasSelecionadas}/{milestone.tarefas.length}
                              </span>
                            )}
                            <span className="expand-icon">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>

                        {isExpanded && milestone.tarefas.length > 0 && (
                          <div className="tarefas-lista">
                            <div className="tarefas-header">
                              <span>Análise de Tarefas:</span>
                              <button
                                className="btn-selecionar-todas"
                                onClick={() => selecionarTodasTarefas(milestone.blockId, milestone.tarefas)}
                                disabled={isReadOnly}
                              >
                                {milestone.tarefas.every(t =>
                                  metasSelecionadas.includes(`${milestone.blockId}::${t.id}`)
                                ) ? '✓ Desmarcar todas' : '☐ Selecionar todas'}
                              </button>
                            </div>

                            {milestone.tarefas.map(tarefa => {
                              const isSelected = metasSelecionadas.includes(`${milestone.blockId}::${tarefa.id}`);

                              return (
                                <div
                                  key={tarefa.id}
                                  className={`tarefa-item ${isSelected ? 'selecionada' : ''}`}
                                  onClick={() => toggleTarefa(milestone.blockId, tarefa.id)}
                                >
                                  <span className="tarefa-checkbox">
                                    {isSelected ? '☑' : '☐'}
                                  </span>
                                  <span className="tarefa-id">[{tarefa.id}]</span>
                                  <span className="tarefa-texto">{tarefa.texto}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {isExpanded && milestone.tarefas.length === 0 && (
                          <div className="sem-tarefas">
                            <em>Análise de tarefas não disponível para este milestone.</em>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER COM AÇÕES */}
      <footer className="pei-footer">
        <div className="footer-info">
          <span>Nível {nivelCrianca}</span>
          <span>•</span>
          <span>{metasSelecionadas.length} metas selecionadas</span>
        </div>
        <div className="footer-actions">
          <button className="btn-secundario" onClick={onBack}>
            ← Voltar
          </button>
          <button
            className="btn-primario"
            onClick={handleFinalize}
            disabled={isReadOnly}
          >
            ✅ Finalizar Avaliação
          </button>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════
function getStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

    .pei-screen {
      font-family: 'Nunito', system-ui, sans-serif;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
      min-height: 100vh;
      padding-bottom: 100px;
    }

    /* HEADER */
    .pei-header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      padding: 25px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3);
    }

    .header-content h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 5px 0;
    }

    .header-content p {
      opacity: 0.9;
      font-size: 14px;
      margin: 0 0 12px 0;
    }

    .header-badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .header-badges span {
      background: rgba(255,255,255,0.2);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }

    .badge-level {
      background: rgba(255,255,255,0.3) !important;
    }

    .badge-readonly {
      background: rgba(239, 68, 68, 0.3) !important;
    }

    .btn-back {
      background: rgba(255,255,255,0.2);
      border: 2px solid rgba(255,255,255,0.3);
      color: white;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: rgba(255,255,255,0.3);
    }

    /* STATS SECTION */
    .stats-section {
      padding: 25px 5%;
    }

    .stats-section h2 {
      font-size: 18px;
      font-weight: 800;
      color: #1f2937;
      margin: 0 0 15px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }

    .stat-card.verde { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
    .stat-card.amarelo { background: linear-gradient(135deg, #fef3c7, #fde68a); }
    .stat-card.cinza { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
    .stat-card.roxo { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }

    .stat-numero {
      display: block;
      font-size: 28px;
      font-weight: 800;
      color: #1f2937;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #4b5563;
      margin-top: 4px;
    }

    .stat-detalhe {
      display: block;
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }

    /* METAS SECTION */
    .metas-section {
      padding: 0 5% 25px;
    }

    .metas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .metas-header h2 {
      font-size: 18px;
      font-weight: 800;
      color: #1f2937;
      margin: 0;
    }

    .metas-counter {
      background: #059669;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .counter-numero {
      font-size: 20px;
      font-weight: 800;
    }

    .counter-label {
      font-size: 12px;
    }

    /* EMPTY STATE */
    .empty-state {
      background: white;
      border-radius: 16px;
      padding: 60px 40px;
      text-align: center;
      border: 2px dashed #a7f3d0;
    }

    .empty-icon {
      font-size: 64px;
      display: block;
      margin-bottom: 15px;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
      color: #059669;
      font-size: 24px;
    }

    .empty-state p {
      margin: 5px 0;
      color: #6b7280;
    }

    /* DOMÍNIOS LISTA */
    .dominios-lista {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .dominio-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    .dominio-header {
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #d1fae5;
    }

    .dominio-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: #065f46;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .dominio-icon {
      font-size: 20px;
    }

    .dominio-count {
      background: #059669;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }

    /* MILESTONES LISTA */
    .milestones-lista {
      padding: 10px;
    }

    .milestone-item {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      margin-bottom: 10px;
      overflow: hidden;
      transition: all 0.2s;
    }

    .milestone-item:hover {
      border-color: #10b981;
    }

    .milestone-header {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      background: #f9fafb;
      transition: background 0.2s;
    }

    .milestone-header:hover {
      background: #f0fdf4;
    }

    .milestone-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .milestone-status {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 800;
    }

    .milestone-status.emergente {
      background: #fef3c7;
      color: #92400e;
      border: 2px solid #fde68a;
    }

    .milestone-status.nao_observado {
      background: #f3f4f6;
      color: #6b7280;
      border: 2px solid #e5e7eb;
    }

    .milestone-id {
      background: #1f2937;
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      font-family: monospace;
    }

    .milestone-texto {
      font-size: 14px;
      color: #374151;
      flex: 1;
    }

    .milestone-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tarefas-badge {
      background: #059669;
      color: white;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
    }

    .expand-icon {
      color: #9ca3af;
      font-size: 12px;
    }

    /* TAREFAS LISTA */
    .tarefas-lista {
      padding: 15px;
      background: #f9fafb;
      border-top: 2px solid #e5e7eb;
    }

    .tarefas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 12px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
    }

    .btn-selecionar-todas {
      background: #e0f2fe;
      border: 1px solid #7dd3fc;
      color: #0369a1;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-selecionar-todas:hover:not(:disabled) {
      background: #bae6fd;
    }

    .btn-selecionar-todas:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tarefa-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
    }

    .tarefa-item:hover {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .tarefa-item.selecionada {
      background: #d1fae5;
      border-color: #10b981;
    }

    .tarefa-checkbox {
      font-size: 18px;
      color: #10b981;
      flex-shrink: 0;
    }

    .tarefa-id {
      background: #e0e7ff;
      color: #4338ca;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .tarefa-texto {
      font-size: 13px;
      color: #374151;
      line-height: 1.4;
    }

    .sem-tarefas {
      padding: 15px;
      background: #f9fafb;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
    }

    /* FOOTER */
    .pei-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 15px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
      z-index: 100;
    }

    .footer-info {
      display: flex;
      gap: 10px;
      font-size: 13px;
      color: #6b7280;
    }

    .footer-actions {
      display: flex;
      gap: 12px;
    }

    .btn-secundario {
      background: #f3f4f6;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secundario:hover {
      background: #e5e7eb;
    }

    .btn-primario {
      background: linear-gradient(135deg, #059669, #10b981);
      border: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
    }

    .btn-primario:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
    }

    .btn-primario:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .pei-header {
        flex-direction: column;
        text-align: center;
        gap: 15px;
      }

      .header-badges {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .metas-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .milestone-info {
        flex-wrap: wrap;
      }

      .milestone-texto {
        width: 100%;
        margin-top: 8px;
      }

      .pei-footer {
        flex-direction: column;
        gap: 15px;
      }

      .footer-actions {
        width: 100%;
      }

      .btn-primario, .btn-secundario {
        flex: 1;
      }
    }
  `;
}