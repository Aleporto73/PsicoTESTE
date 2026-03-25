/**
 * VB-MAPP Transition Assessment Data
 *
 * Structure:
 * - 3 main categories
 * - Items 1-5 per category: AUTOMATIC (calculated from Milestones/Barriers)
 * - Items 6+: MANUAL (filled by evaluator)
 *
 * IMPORTANT: Items 1-6 are extremely relevant for transition decision
 */

export const TRANSICAO_ESTRUTURA = {
  categorias: [
    {
      id: 'cat_1',
      numero: 1,
      nome: 'Domínio de linguagem, social, comportamental e independência acadêmica',
      itens: [
        {
          id: 'item_1',
          numero: 1,
          nome: 'Pontuação total dos Marcos e independência acadêmica',
          tipo: 'automatico',
          fonte: 'milestones_total',
          descricao: 'Calculado automaticamente da pontuação de Milestones'
        },
        {
          id: 'item_2',
          numero: 2,
          nome: 'Pontuação geral das Barreiras',
          tipo: 'automatico',
          fonte: 'barreiras_total',
          descricao: 'Calculado automaticamente do escore de Barreiras (invertido: menor = melhor)'
        },
        {
          id: 'item_3',
          numero: 3,
          nome: 'Pontuação das barreiras de comportamento negativo e controle instrucional',
          tipo: 'automatico',
          fonte: 'barreiras_1_2',
          descricao: 'Soma das barreiras 1 (Comportamento negativo) e 2 (Controle instrucional)'
        },
        {
          id: 'item_4',
          numero: 4,
          nome: 'Habilidade de grupo e rotina de sala de aula',
          tipo: 'automatico',
          fonte: 'milestones_rotina_grupo',
          descricao: 'Pontuação do domínio Rotinas de Classe e Habilidades de Grupo'
        },
        {
          id: 'item_5',
          numero: 5,
          nome: 'Comportamento social e Brincar Social',
          tipo: 'automatico',
          fonte: 'milestones_social',
          descricao: 'Pontuação do domínio Comportamento Social e Brincar Social'
        },
        {
          id: 'item_6',
          numero: 6,
          nome: 'Trabalha independente em tarefas acadêmicas',
          tipo: 'manual',
          niveis: [
            '1. Trabalha indep. por 30 segundos com 1 dica de adulto',
            '2. Trabalha indep. por 1 minuto com 1 solicitação de adulto',
            '3. Trabalha indep. por 2 minutos sem solicitação de adulto',
            '4. Trabalha indep. por 5 minutos sem solicitação de adulto',
            '5. Trabalha indep. por 10 minutos sem solicitação de adulto'
          ]
        }
      ]
    },
    {
      id: 'cat_2',
      numero: 2,
      nome: 'Habilidades para aprender',
      itens: [
        {
          id: 'item_7',
          numero: 7,
          nome: 'Generalização de Habilidades',
          tipo: 'manual',
          niveis: [
            '1. Generaliza algumas hab. para pessoas diferentes e ao longo do tempo; mas não é fácil em materiais',
            '2. Generaliza resposta para novos materiais, após treinamento extensivo com múltiplos exemplares',
            '3. Generaliza estímulos espontaneamente no ambiente em 10 ocasiões',
            '4. Generaliza respostas espontâneas em ambiente natural em 10 ocasiões',
            '5. Demonstra generalização de estímulo e resposta na primeira ou segunda tentativa'
          ]
        },
        {
          id: 'item_8',
          numero: 8,
          nome: 'Itens e eventos que funcionam como reforçadores',
          tipo: 'manual',
          niveis: [
            '1. Reforçadores são principalmente comestíveis, líquido e contato físico (motivadores não aprendidos)',
            '2. Reforçadores são tangíveis, sensoriais ou manipulativos',
            '3. Reforçadores são sociais, de lugares ou mediados por colegas',
            '4. Reforçadores são intermitentes, sociais, automáticos e envolvem ampla gama de itens',
            '5. Reforçadores são intermitentes, sociais, adequados à idade, variados e envolvem informações verbais'
          ]
        },
        {
          id: 'item_9',
          numero: 9,
          nome: 'Taxa de aquisição de novas habilidades',
          tipo: 'manual',
          niveis: [
            '1. Requer duas ou mais semanas de treino e centenas de tentativas para adquirir nova habilidade',
            '2. Requer no mínimo uma semana de treino e 100+ tentativas para adquirir nova habilidade',
            '3. Adquire novas habilidades por semana com média de menos de 50 tentativas',
            '4. Adquire novas habilidades por semana com média de menos de 25 tentativas',
            '5. Novas habilidades diárias com média de 5 tentativas ou menos'
          ]
        },
        {
          id: 'item_10',
          numero: 10,
          nome: 'Taxa de retenção de novas habilidades',
          tipo: 'manual',
          niveis: [
            '1. Retém nova hab. por pelo menos 10 minutos após acertá-la em sessão de ensino',
            '2. Retém nova hab. por pelo menos 1 hora após acertá-la em sessão de ensino',
            '3. Retém nova hab. por 24 horas após acertá-la com 5 ou menos tentativas de manutenção',
            '4. Retém hab. adquiridas após 24 horas sem manutenção',
            '5. Retém habilidades por uma semana sem testes de manutenção'
          ]
        },
        {
          id: 'item_11',
          numero: 11,
          nome: 'Aprendizagem em ambiente natural',
          tipo: 'manual',
          niveis: [
            '1. 2 novas hab. motoras no ambiente natural sem ensino intensivo',
            '2. 5 novos mandos ou tatos no ambiente natural sem ensino intensivo',
            '3. Adquire 25 novos mandos ou tatos no ambiente natural sem ensino intensivo',
            '4. Adquire 25 novos intraverbais no ambiente natural sem ensino intensivo',
            '5. Aprende novas habilidades diariamente em ambiente natural ou grupo, sem ensino intensivo'
          ]
        },
        {
          id: 'item_12',
          numero: 12,
          nome: 'Transferência entre operantes verbais sem treino',
          tipo: 'manual',
          niveis: [
            '1. Demonstra transferência ecoica para mando ou tato para 2 respostas com 2 ou menos tentativas',
            '2. Demonstra transferência ecoica para mando ou tato para 5 respostas sem tentativas',
            '3. Demonstra tato para transferência de mando para 10 respostas sem treinamento',
            '4. Demonstra tato para transferência intraverbal para 10 tópicos sem treinamento',
            '5. Demonstra transferência diária, envolvendo classes gramaticais avançadas'
          ]
        }
      ]
    },
    {
      id: 'cat_3',
      numero: 3,
      nome: 'Habilidades de autocuidado, espontaneidade e independência',
      itens: [
        {
          id: 'item_13',
          numero: 13,
          nome: 'Adaptabilidade à mudança',
          tipo: 'manual',
          niveis: [
            '1. Adapta-se a pequenas mudanças com preparação verbal, mas pode demonstrar comportamento negativo',
            '2. Aceita pequenas mudanças, mostra angústia considerável, requer preparação substancial',
            '3. Fica irritado e reclama das mudanças, pode perseverar, mas acaba acompanhando',
            '4. Adapta-se a mudanças rapidamente e sem comportamento negativo',
            '5. A criança lida bem com mudanças na rotina e ignora distrações'
          ]
        },
        {
          id: 'item_14',
          numero: 14,
          nome: 'Comportamento Espontâneo',
          tipo: 'manual',
          niveis: [
            '1. Emite comportamentos espontaneamente, mas maioria das habilidades são solicitadas',
            '2. Emite muitos comportamentos espontâneos, mas são principalmente não-verbais',
            '3. Mandos e tatos espontaneamente várias vezes ao dia',
            '4. Emite espontaneamente mando, tato, comportamento social intraverbal várias vezes ao dia',
            '5. Emite comportamentos espontâneos apropriados na maioria das 16 áreas da Avaliação de Marcos'
          ]
        },
        {
          id: 'item_15',
          numero: 15,
          nome: 'Brincar independente e habilidades de lazer',
          tipo: 'manual',
          niveis: [
            '1. Obtém 3 pontos em brincar independente na Avaliação de Marcos',
            '2. Obtém 5 pontos em brincar independente na Avaliação de Marcos',
            '3. Obtém 8 pontos em brincar independente na Avaliação de Marcos',
            '4. Obtém 11 pontos em brincar independente na Avaliação de Marcos',
            '5. Obtém 14 pontos em brincar independente na Avaliação de Marcos'
          ]
        },
        {
          id: 'item_16',
          numero: 16,
          nome: 'Habilidades Gerais de Autocuidado',
          tipo: 'manual',
          niveis: [
            '1. Sem autoajuda independente, mas não se envolve em comportamentos negativos',
            '2. Requer instruções verbais ou físicas para completar maioria das tarefas de autoajuda',
            '3. Requer principalmente instruções verbais, mas tentará aproximações',
            '4. Inicia algumas tarefas de autoajuda e geralmente tenta aproximações',
            '5. Inicia aproximações para maioria das habilidades e generaliza'
          ]
        },
        {
          id: 'item_17',
          numero: 17,
          nome: 'Habilidades de Higiene',
          tipo: 'manual',
          niveis: [
            '1. Ainda usa fralda, mas demonstra prontidão para treinamento de toalete',
            '2. Treinamento do toalete começou, ocasionalmente urina quando sentado, ainda usa fralda',
            '3. Bexiga treinada durante o dia, tem acidentes ocasionais, precisa de instruções',
            '4. Bexiga e intestino treinados, mas precisa de instruções e assistência',
            '5. Inicia ou pede para usar o banheiro e completa independentemente todas as etapas'
          ]
        },
        {
          id: 'item_18',
          numero: 18,
          nome: 'Habilidades de Alimentação',
          tipo: 'manual',
          niveis: [
            '1. Realiza algumas alimentações independentes, mas requer muitos estímulos físicos',
            '2. Come de forma independente comida com dedos, mas requer arranjo e orientação verbal',
            '3. Pega comida em lancheira, come, mas requer orientação verbal de adulto',
            '4. Usa colher de forma independente, come sem instruções, faz bagunça mínima',
            '5. Obtém alimentos, come e usa utensílios de forma independente'
          ]
        }
      ]
    }
  ]
};

/**
 * Calculate automatic item scores from Milestones and Barriers data
 *
 * @param {Object} milestonesData - Milestones scores snapshot { blockId: 'dominado'|'em_progresso'|'nao_iniciado' }
 * @param {Array} barreirasData - Array of barrier objects with pontuacao field
 * @returns {Object} Automatic scores for items 1-5 (0-5 scale)
 */
export function calculateAutoItems(milestonesData, barreirasData) {
  const scores = milestonesData || {};
  const barreiras = barreirasData || [];

  // Count mastered milestones
  let totalDominados = 0;
  let totalMilestones = 0;
  let pontosRotina = 0;
  let pontosSocial = 0;
  let pontosBrincar = 0;

  Object.entries(scores).forEach(([blockId, status]) => {
    totalMilestones++;
    if (status === 'dominado') {
      totalDominados++;

      // Check specific domain by block_id
      if (blockId.includes('DOM11') || blockId.toLowerCase().includes('rotina')) {
        pontosRotina++;
      }
      if (blockId.includes('DOM02') || blockId.toLowerCase().includes('social')) {
        pontosSocial++;
      }
      if (blockId.includes('DOM01') || blockId.toLowerCase().includes('brincar')) {
        pontosBrincar++;
      }
    }
  });

  // Calculate barriers score
  let escoreBarreirasTotal = 0;
  let escoreBarreiras1_2 = 0;

  barreiras.forEach(b => {
    const pont = b.pontuacao || 0;
    escoreBarreirasTotal += pont;

    // Barriers 1 and 2 (Negative behavior and Instructional control)
    if (b.categoria_id === 'bar_01' || b.categoria_id === 'bar_02') {
      escoreBarreiras1_2 += pont;
    }
  });

  // Convert to 0-5 scale for automatic items
  // Item 1: Milestones (percentage converted to 0-5)
  const percentDominados = totalMilestones > 0 ? (totalDominados / totalMilestones) * 100 : 0;
  const item1Score = Math.min(5, Math.max(0, Math.round(percentDominados / 20)));

  // Item 2: Barriers (inverted - lower barrier score = higher points)
  // Max barrier score = 96
  const item2Score = Math.min(5, Math.max(0, Math.round((96 - escoreBarreirasTotal) / 19)));

  // Item 3: Barriers 1 and 2 (inverted)
  // Max = 8
  const item3Score = Math.min(5, Math.max(0, Math.round((8 - escoreBarreiras1_2) / 1.6)));

  // Item 4: Class Routines (max 10 points in VB-MAPP)
  const item4Score = Math.min(5, Math.max(0, Math.round(pontosRotina / 2)));

  // Item 5: Social Behavior (max 15 points in VB-MAPP)
  const item5Score = Math.min(5, Math.max(0, Math.round(pontosSocial / 3)));

  return {
    item_1: item1Score,
    item_2: item2Score,
    item_3: item3Score,
    item_4: item4Score,
    item_5: item5Score,
    // Raw data for display/debugging
    raw: {
      totalDominados,
      totalMilestones,
      percentDominados: parseFloat(percentDominados.toFixed(1)),
      escoreBarreirasTotal,
      escoreBarreiras1_2,
      pontosRotina,
      pontosSocial,
      pontosBrincar
    }
  };
}

/**
 * Calculate category scores from automatic and manual items
 *
 * @param {Object} automaticScores - Result from calculateAutoItems()
 * @param {Object} manualEvaluations - Manual item evaluations { itemId: { pontuacao: number } }
 * @returns {Object} Category scores and total score
 */
export function calculateCategoryScores(automaticScores, manualEvaluations) {
  const escores = {};
  let totalGeral = 0;

  TRANSICAO_ESTRUTURA.categorias.forEach(cat => {
    let escoreCat = 0;
    let automaticosCat = 0;
    let manuaisCat = 0;

    cat.itens.forEach(item => {
      if (item.tipo === 'automatico') {
        const valor = automaticScores[item.id] || 0;
        escoreCat += valor;
        automaticosCat += valor;
      } else {
        const valor = manualEvaluations[item.id]?.pontuacao || 0;
        escoreCat += valor;
        manuaisCat += valor;
      }
    });

    escores[cat.id] = {
      total: escoreCat,
      automaticos: automaticosCat,
      manuais: manuaisCat
    };
    totalGeral += escoreCat;
  });

  return { categorias: escores, totalGeral };
}

/**
 * Check if all manual items have been filled
 *
 * @param {Object} manualEvaluations - Manual item evaluations
 * @returns {Object} { complete: boolean, filled: number, total: number }
 */
export function checkManualItemsCompletion(manualEvaluations) {
  const itensManuais = TRANSICAO_ESTRUTURA.categorias.flatMap(c =>
    c.itens.filter(i => i.tipo === 'manual')
  );

  const manuaisPreenchidos = itensManuais.filter(item =>
    manualEvaluations[item.id]?.pontuacao !== undefined && manualEvaluations[item.id]?.pontuacao !== null
  ).length;

  return {
    complete: manuaisPreenchidos === itensManuais.length,
    filled: manuaisPreenchidos,
    total: itensManuais.length
  };
}
