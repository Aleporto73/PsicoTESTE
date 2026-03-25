import { useCallback } from 'react';
import { DOMAIN_NAMES_EXPANDED, BARRIERS_NAMES } from '../data/constants';
import {
  ESTUDO_CASO_FIELDS,
  TIME_HORIZONS,
  METRIC_TYPES,
  BARRIER_STRATEGY_MAP,
  createEmptyPEIPlan,
  validatePlanHealth
} from '../data/peiSchema';

/**
 * React Hook para Conformidade com PEI - Decreto Brasileiro 12.773/2025
 * Auto-gera conteúdo PEI a partir de dados de avaliação VB-MAPP
 *
 * @param {Object} sessionInfo - Objeto da sessão com dados VB-MAPP
 * @returns {Object} Funções para geração e validação de planos PEI
 */
export default function usePEICompliance(sessionInfo) {
  // ═══════════════════════════════════════════════════════════════
  // HELPER: Calcular percentuais por domínio
  // ═══════════════════════════════════════════════════════════════
  const calculateDomainStats = useCallback((scores) => {
    const domainStats = {};

    // Inicializar estatísticas para todos os 16 domínios
    for (let i = 1; i <= 16; i++) {
      const domCode = `DOM${i.toString().padStart(2, '0')}`;
      domainStats[domCode] = {
        dominado: 0,
        emergente: 0,
        nao_observado: 0,
        total: 0,
        percentDominado: 0
      };
    }

    // Contar scores por domínio
    Object.entries(scores || {}).forEach(([blockId, status]) => {
      const match = blockId.match(/^(DOM\d+)-/);
      if (!match) return;

      const domCode = match[1];
      if (!domainStats[domCode]) {
        domainStats[domCode] = {
          dominado: 0,
          emergente: 0,
          nao_observado: 0,
          total: 0,
          percentDominado: 0
        };
      }

      // Incrementar contagem
      if (status === 'dominado') {
        domainStats[domCode].dominado += 1;
      } else if (status === 'emergente') {
        domainStats[domCode].emergente += 1;
      } else if (status === 'nao_observado') {
        domainStats[domCode].nao_observado += 1;
      }

      domainStats[domCode].total += 1;
    });

    // Calcular percentuais
    Object.entries(domainStats).forEach(([domCode, stats]) => {
      if (stats.total > 0) {
        stats.percentDominado = (stats.dominado / stats.total) * 100;
      }
    });

    return domainStats;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 1. GERAR ESTUDO DE CASO
  // ═══════════════════════════════════════════════════════════════

  const generateEstudoCaso = useCallback((scores, barreiras = [], lacunas = []) => {
    const domainStats = calculateDomainStats(scores);

    // Calcular estatísticas gerais
    const allScores = Object.values(domainStats);
    const totalMilestones = allScores.reduce((sum, d) => sum + d.total, 0);
    const totalDominados = allScores.reduce((sum, d) => sum + d.dominado, 0);
    const totalEmergentes = allScores.reduce((sum, d) => sum + d.emergente, 0);
    const percentDominados = totalMilestones > 0 ? ((totalDominados / totalMilestones) * 100).toFixed(1) : '0.0';
    const percentEmergentes = totalMilestones > 0 ? ((totalEmergentes / totalMilestones) * 100).toFixed(1) : '0.0';

    // Identificar domínios fracos (< 50% dominados)
    const weakDomains = Object.entries(domainStats)
      .filter(([, stats]) => stats.percentDominado < 50 && stats.total > 0)
      .map(([domCode]) => DOMAIN_NAMES_EXPANDED[domCode] || domCode)
      .sort();

    // Identificar domínios fortes (>= 75% dominados)
    const strongDomains = Object.entries(domainStats)
      .filter(([, stats]) => stats.percentDominado >= 75 && stats.total > 0)
      .map(([domCode]) => DOMAIN_NAMES_EXPANDED[domCode] || domCode)
      .sort();

    // Barreiras críticas (pontuação >= 3)
    const criticalBarriers = (barreiras || [])
      .filter(b => b.pontuacao >= 3)
      .map(b => b.nome)
      .sort();

    // ─────────────────────────────────────────────────────────
    // CAMPO: Barreiras e Demandas
    // ─────────────────────────────────────────────────────────
    let barreirasDemandas = '';
    barreirasDemandas += `Estatísticas Gerais: ${totalDominados} habilidades dominadas (${percentDominados}%), ${totalEmergentes} emergentes (${percentEmergentes}%).\n\n`;

    if (criticalBarriers.length > 0) {
      barreirasDemandas += `Barreiras Críticas Identificadas: ${criticalBarriers.join(', ')}.\n\n`;
    }

    if (weakDomains.length > 0) {
      barreirasDemandas += `Domínios com menor desempenho: ${weakDomains.join(', ')}.\n\n`;
    }

    barreirasDemandas += `A avaliação VB-MAPP indica necessidade de intervenção intensiva em habilidades fundamentais. O aluno apresenta lacunas na sequência de aprendizagem que demandam programação comportamental estruturada com reforçamento frequente.`;

    // ─────────────────────────────────────────────────────────
    // CAMPO: Contexto Escolar
    // ─────────────────────────────────────────────────────────
    // Usuario deve preencher manualmente - retornar vazio
    const contextoEscolar = '';

    // ─────────────────────────────────────────────────────────
    // CAMPO: Potencialidades
    // ─────────────────────────────────────────────────────────
    let potencialidades = '';

    if (strongDomains.length > 0) {
      potencialidades += `Domínios com desempenho forte: ${strongDomains.join(', ')}.\n\n`;
    }

    potencialidades += `Total de ${totalDominados} habilidades já dominadas, constituindo base sólida para continuidade do processo educacional. Emergência de ${totalEmergentes} habilidades indica capacidade de aprendizagem e plasticidade comportamental. `;
    potencialidades += `As habilidades emergentes representam oportunidades para consolidação através de reforçamento contínuo e ambiente estruturado.`;

    // ─────────────────────────────────────────────────────────
    // CAMPO: Estratégias de Acessibilidade
    // ─────────────────────────────────────────────────────────
    let estrategiasAcessibilidade = '';

    // Mapear barreiras críticas para estratégias
    if (criticalBarriers.length > 0) {
      estrategiasAcessibilidade += `Estratégias para Barreiras Identificadas:\n`;

      criticalBarriers.slice(0, 3).forEach(barrierName => {
        // Tentar encontrar chave correspondente no BARRIER_STRATEGY_MAP
        const strategies = Object.entries(BARRIER_STRATEGY_MAP)
          .find(([, strats]) => Array.isArray(strats) && strats.length > 0)?.[1] || [];

        if (strategies.length > 0) {
          estrategiasAcessibilidade += `\n• ${barrierName}:\n`;
          strategies.slice(0, 2).forEach(strategy => {
            estrategiasAcessibilidade += `  - ${strategy}\n`;
          });
        }
      });

      estrategiasAcessibilidade += '\n';
    }

    estrategiasAcessibilidade += `Recomendações Gerais de Acessibilidade:\n`;
    estrategiasAcessibilidade += `- Implementar ambiente estruturado com rotinas visuais e previsíveis\n`;
    estrategiasAcessibilidade += `- Utilizar Discrete Trial Training (DTT) para habilidades básicas\n`;
    estrategiasAcessibilidade += `- Aplicar Natural Environment Teaching (NET) para generalização\n`;
    estrategiasAcessibilidade += `- Reforçamento imediato e frequente de comportamentos-alvo\n`;
    estrategiasAcessibilidade += `- Adaptações materiais conforme necessidades específicas do aluno`;

    return {
      barreiras_demandas: barreirasDemandas,
      contexto_escolar: contextoEscolar,
      potencialidades: potencialidades,
      estrategias_acessibilidade: estrategiasAcessibilidade
    };
  }, [calculateDomainStats]);

  // ═══════════════════════════════════════════════════════════════
  // 2. GERAR OBJETIVOS
  // ═══════════════════════════════════════════════════════════════

  const generateObjectives = useCallback((lacunas = [], scores = {}, barreiras = []) => {
    const objectives = [];

    // Validar lacunas
    if (!Array.isArray(lacunas) || lacunas.length === 0) {
      return objectives;
    }

    // Separar lacunas por time horizon
    // Assumir ordem de prioridade: primeiras são curto prazo
    const curtoLacunas = lacunas.slice(0, Math.min(3, lacunas.length));
    const medioLacunas = lacunas.slice(3, Math.min(6, lacunas.length));
    const longoLacunas = lacunas.slice(6, Math.min(8, lacunas.length));

    // Helper para criar objetivo
    const createObjective = (lacuna, timeHorizon, index) => {
      const horizonObj = TIME_HORIZONS.find(h => h.value === timeHorizon);

      return {
        id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        domain: lacuna.domain_id || lacuna.block_id?.split('-')[0] || 'DOM01',
        horizon: timeHorizon,
        horizonLabel: horizonObj?.label || timeHorizon,
        description: lacuna.texto || `Desenvolver habilidade em ${lacuna.domain_id}`,
        metricType: 'percent',
        baseline: 0,
        target: 80,
        successCriteria: `Aluno demonstrará ${timeHorizon === 'curto' ? '50%' : timeHorizon === 'medio' ? '70%' : '80%'} de acerto na habilidade-alvo em 3 oportunidades consecutivas`,
        teachingProgram: '',
        createdAt: new Date().toISOString()
      };
    };

    // Curto prazo (4 semanas)
    curtoLacunas.forEach((lacuna, idx) => {
      objectives.push(createObjective(lacuna, 'curto', idx));
    });

    // Médio prazo (8-12 semanas)
    medioLacunas.forEach((lacuna, idx) => {
      objectives.push(createObjective(lacuna, 'medio', idx));
    });

    // Longo prazo (6 meses)
    longoLacunas.forEach((lacuna, idx) => {
      objectives.push(createObjective(lacuna, 'longo', idx));
    });

    return objectives;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 3. GERAR ADAPTAÇÕES
  // ═══════════════════════════════════════════════════════════════

  const generateAdaptations = useCallback((barreiras = [], objectives = []) => {
    const adaptations = {};

    // Barreiras críticas (pontuação >= 3)
    const criticalBarriers = (barreiras || [])
      .filter(b => b.pontuacao >= 3)
      .map(b => b.nome)
      .sort();

    // ─────────────────────────────────────────────────────────
    // Adaptações Metodológicas
    // ─────────────────────────────────────────────────────────
    let classroomAdaptations = '';
    classroomAdaptations += 'Abordagem Baseada em ABA:\n';
    classroomAdaptations += '- Discrete Trial Training (DTT) para aquisição de habilidades discretas\n';
    classroomAdaptations += '- Natural Environment Teaching (NET) para generalização em contextos naturais\n';
    classroomAdaptations += '- Reforçamento diferencial positivo frequente\n';
    classroomAdaptations += '- Análise funcional de comportamentos-problema\n';
    classroomAdaptations += '- Dados contínuos para monitoramento de progresso';

    // ─────────────────────────────────────────────────────────
    // Orientações AEE (Atendimento Educacional Especializado)
    // ─────────────────────────────────────────────────────────
    let aeeGuidelines = '';
    aeeGuidelines += 'O AEE deve focar em:\n';
    aeeGuidelines += '- Reforço de habilidades-alvo identificadas no PEI\n';
    aeeGuidelines += '- Trabalho com alteração de variáveis (estímulo, resposta, reforço)\n';
    aeeGuidelines += '- Programação de generalização para sala comum\n';
    aeeGuidelines += '- Sistemas aumentativos/alternativos de comunicação se necessário\n';
    aeeGuidelines += '- Frequência: mínimo 2-3x por semana em sessões estruturadas';

    // ─────────────────────────────────────────────────────────
    // Atividades Colaborativas
    // ─────────────────────────────────────────────────────────
    let colaborativas = '';
    colaborativas += 'Trabalho colaborativo deve envolver:\n';
    colaborativas += '- Planejamento conjunto escola-AEE semanal\n';
    colaborativas += '- Compartilhamento de dados e progresso\n';
    colaborativas += '- Treinamento de auxiliares e professores em procedimentos ABA\n';
    colaborativas += '- Práticas consistentes entre ambientes\n';
    colaborativas += '- Reuniões de monitoramento a cada 2-4 semanas';

    // ─────────────────────────────────────────────────────────
    // Ações Intersetoriais
    // ─────────────────────────────────────────────────────────
    let intersetoriais = '';
    intersetoriais += 'Quando necessário, articulação com:\n';
    intersetoriais += '- Serviços de Saúde: avaliação fonoaudiológica, psicológica ou neurológica\n';
    intersetoriais += '- Assistência Social: apoio familiar e socioeconômico\n';
    intersetoriais += '- Programas de Capacitação: treinamento de cuidadores\n';
    intersetoriais += '- Equipe Multidisciplinar: alinhamento de intervenções\n';
    intersetoriais += '- Comunicação regular com responsáveis sobre implementação';

    // ─────────────────────────────────────────────────────────
    // Recursos Necessários
    // ─────────────────────────────────────────────────────────
    const resourcesNeeded = [
      'Profissional especializado em ABA (supervisor)',
      'Auxiliar/Monitor treinado em procedimentos comportamentais',
      'Materiais de reforçamento (visuais, sensoriais)',
      'Sistema de coleta de dados (planilhas ou app de registro)'
    ];

    if (objectives && objectives.length > 0) {
      // Adicionar recursos baseado em objetivos
      const hasLiteracyGoals = objectives.some(o =>
        o.domain?.includes('14') || o.domain?.includes('15') || o.description?.toLowerCase().includes('leit')
      );

      if (hasLiteracyGoals) {
        resourcesNeeded.push('Materiais de leitura adaptados');
        resourcesNeeded.push('Software de suporte à leitura');
      }
    }

    return {
      classroomAdaptations,
      aeeGuidelines,
      colaborativas,
      intersetoriais,
      resourcesNeeded
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 4. INICIALIZAR PLANO PEI COMPLETO
  // ═══════════════════════════════════════════════════════════════

  const initializePEIPlan = useCallback((sessionData) => {
    // Validar dados de entrada
    if (!sessionData) {
      console.error('Session data is required');
      return null;
    }

    // Extrair dados da sessão
    const scores = sessionData.scores_snapshot || {};
    const lacunas = sessionData.lacunas || [];
    const barreiras = sessionData.barreiras || [];
    const childName = sessionData.child_name || 'Aluno';
    const childAge = sessionData.child_age || null;

    // Criar plano vazio
    const peiPlan = createEmptyPEIPlan();

    // Preencher identificação
    peiPlan.studentId = sessionData.id || null;
    peiPlan.studentName = childName;
    peiPlan.studentBirthDate = childAge ? new Date(childAge).toISOString().split('T')[0] : null;

    // Gerar conteúdo
    const estudoCaso = generateEstudoCaso(scores, barreiras, lacunas);
    const objectives = generateObjectives(lacunas, scores, barreiras);
    const adaptationsData = generateAdaptations(barreiras, objectives);

    // Preencher estudo de caso
    peiPlan.studioCaso = {
      barreiras_demandas: estudoCaso.barreiras_demandas,
      contexto_escolar: estudoCaso.contexto_escolar,
      potencialidades: estudoCaso.potencialidades,
      estrategias_acessibilidade: estudoCaso.estrategias_acessibilidade
    };

    // Preencher objetivos
    peiPlan.objectives = objectives;

    // Preencher adaptações
    peiPlan.adaptations = {
      metodologicas: adaptationsData.classroomAdaptations,
      curriculares: '',
      materiais: 'Conforme especificado nas estratégias de acessibilidade',
      avaliacoes: 'Avaliação contínua com coleta diária de dados e revisão semanal',
      tempo: 'Estrutura temporal mantém ritmo próprio do aluno com pausas estratégicas',
      espaciais: 'Ambiente estruturado com áreas delimitadas e visuais de organização'
    };

    // Preencher orientações (Decreto 12.773/2025)
    peiPlan.orientations = {
      sala_comum: adaptationsData.classroomAdaptations,
      aee: adaptationsData.aeeGuidelines,
      colaborativas: adaptationsData.colaborativas,
      intersetoriais: adaptationsData.intersetoriais
    };

    // Preencher recursos sugeridos
    peiPlan.resources.humanos = [adaptationsData.resourcesNeeded[0], adaptationsData.resourcesNeeded[1]];
    peiPlan.resources.materiais = [adaptationsData.resourcesNeeded[2]];
    peiPlan.resources.tecnologicos = [adaptationsData.resourcesNeeded[3]];

    // Definir status como rascunho
    peiPlan.status = 'draft';

    return peiPlan;
  }, [generateEstudoCaso, generateObjectives, generateAdaptations]);

  // ═══════════════════════════════════════════════════════════════
  // RETORNAR TODAS AS FUNÇÕES
  // ═══════════════════════════════════════════════════════════════

  return {
    generateEstudoCaso,
    generateObjectives,
    generateAdaptations,
    initializePEIPlan,
    validatePlanHealth,
    calculateDomainStats
  };
}
