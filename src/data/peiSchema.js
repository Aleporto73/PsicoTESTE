/**
 * Schema e constantes para PEI (Plano Educacional Individualizado)
 * Conformidade com Decreto Brasileiro 12.773/2025
 * @module data/peiSchema
 */

/**
 * Estados possíveis de um Plano Educacional Individualizado
 * Define a máquina de estados para transições de status
 * @type {Object<string, string>}
 */
export const PLAN_STATUS = {
  draft: 'draft',           // Rascunho inicial
  incomplete: 'incomplete', // Preenchimento em andamento
  valid: 'valid',           // Pronto para ativação
  active: 'active',         // Plano em vigência
  review: 'review',         // Sob revisão/atualização
  expired: 'expired'        // Expirado
};

/**
 * Campos obrigatórios do Estudo de Caso
 * Cada campo deve ter mínimo de 30 caracteres preenchidos
 * @type {Object<string, Object>}
 */
export const ESTUDO_CASO_FIELDS = {
  barreiras_demandas: {
    key: 'barreiras_demandas',
    label: 'Barreiras e Demandas',
    helpText: 'O que impede a participação e aprendizagem hoje?',
    placeholder: 'Descreva os obstáculos que o aluno enfrenta na aprendizagem e participação escolar...',
    minChars: 30
  },
  contexto_escolar: {
    key: 'contexto_escolar',
    label: 'Análise do Contexto Escolar',
    helpText: 'Como o ambiente, rotinas e demandas da escola impactam o aluno?',
    placeholder: 'Analise o contexto escolar considerando ambiente físico, rotinas, demandas e dinâmica da turma...',
    minChars: 30
  },
  potencialidades: {
    key: 'potencialidades',
    label: 'Potencialidades',
    helpText: 'Quais são os pontos fortes e o que já funciona bem?',
    placeholder: 'Identifique habilidades, interesses, forças e o que já está funcionando bem para o aluno...',
    minChars: 30
  },
  estrategias_acessibilidade: {
    key: 'estrategias_acessibilidade',
    label: 'Estratégias de Acessibilidade',
    helpText: 'O que será feito na prática para remover barreiras?',
    placeholder: 'Descreva as ações, adaptações e recursos específicos que serão implementados...',
    minChars: 30
  }
};

/**
 * Tipos de métricas para avaliação de objetivos
 * Define como o progresso será medido
 * @type {Array<{value: string, label: string}>}
 */
export const METRIC_TYPES = [
  {
    value: 'percent',
    label: 'Porcentagem de acerto'
  },
  {
    value: 'count',
    label: 'Número de respostas corretas'
  },
  {
    value: 'frequency',
    label: 'Frequência (vezes por semana)'
  },
  {
    value: 'time',
    label: 'Tempo para completar'
  },
  {
    value: 'rubric',
    label: 'Escala qualitativa (1-4)'
  }
];

/**
 * Horizontes temporais para objetivos
 * Define prazos e cores para visualização
 * @type {Array<{value: string, label: string, duration: string, color: string}>}
 */
export const TIME_HORIZONS = [
  {
    value: 'curto',
    label: 'Curto Prazo',
    duration: '4 semanas',
    color: '#ef4444'
  },
  {
    value: 'medio',
    label: 'Médio Prazo',
    duration: '8-12 semanas',
    color: '#f59e0b'
  },
  {
    value: 'longo',
    label: 'Longo Prazo',
    duration: '6 meses',
    color: '#10b981'
  }
];

/**
 * Procedimentos de ensino padronizados (baseado em ABA)
 * Métodos evidenciados para ensino estruturado
 * @type {Array<{id: string, name: string, description: string, indication: string}>}
 */
export const TEACHING_PROCEDURES = [
  {
    id: 'dtt',
    name: 'Discrete Trial Training (DTT)',
    description: 'Ensino em tentativas discretas com estímulo, resposta e consequência claramente separados',
    indication: 'Para habilidades básicas, requisitos pré-acadêmicos e comportamento focado'
  },
  {
    id: 'net',
    name: 'Natural Environment Teaching (NET)',
    description: 'Ensino que ocorre durante atividades naturais e rotineiras em ambiente real',
    indication: 'Para generalização, motivação intrínseca e habilidades funcionais'
  },
  {
    id: 'modelagem',
    name: 'Modelagem',
    description: 'Apresentação de modelo comportamental correto para imitação pelo aluno',
    indication: 'Para desenvolvimento de novas habilidades motoras, sociais e académicas'
  },
  {
    id: 'encadeamento',
    name: 'Encadeamento (Chaining)',
    description: 'Decomposição de habilidade complexa em passos sequenciais ensinados individualmente',
    indication: 'Para rotinas multi-passo, tarefas complexas e sequências comportamentais'
  },
  {
    id: 'transferencia_controle',
    name: 'Transferência de Controle de Estímulo',
    description: 'Transição gradual do controle do estímulo discriminativo para estímulos naturais',
    indication: 'Para manutenção, generalização e independência em respostas aprendidas'
  }
];

/**
 * Categorias de recursos que podem ser utilizados
 * Organiza recursos por tipo para planejamento
 * @type {Array<{id: string, label: string, examples: Array<string>}>}
 */
export const RESOURCE_CATEGORIES = [
  {
    id: 'humanos',
    label: 'Recursos Humanos',
    examples: [
      'Professor especializado',
      'Auxiliar/Monitor',
      'Tradutor Libras',
      'Intérprete',
      'Psicólogo',
      'Fonoaudiólogo',
      'Terapeuta Ocupacional'
    ]
  },
  {
    id: 'materiais',
    label: 'Recursos Materiais',
    examples: [
      'Livros adaptados',
      'Lápis grosso',
      'Pranchas de comunicação',
      'Lupas',
      'Cadernos grandes',
      'Materiais táteis'
    ]
  },
  {
    id: 'tecnologicos',
    label: 'Recursos Tecnológicos',
    examples: [
      'Software educativo',
      'Tablet com aplicativos',
      'Computador com acesso adaptado',
      'Leitor de tela',
      'Teclado adaptado',
      'Mouse alternativo',
      'Comunicador dinâmico'
    ]
  },
  {
    id: 'ambientais',
    label: 'Recursos Ambientais',
    examples: [
      'Aula em sala menor',
      'Espaço calmo para trabalho',
      'Mobiliário adaptado',
      'Iluminação especial',
      'Reorganização do layout',
      'Área de descanso'
    ]
  }
];

/**
 * Áreas de orientação do PEI conforme Decreto 12.773/2025, Art. 12 §2
 * O PEI deve orientar ações em todas estas áreas
 * @type {Object<string, string>}
 */
export const DECREE_ORIENTATIONS = {
  sala_comum: 'Sala de Aula Comum',
  aee: 'Atendimento Educacional Especializado',
  colaborativas: 'Atividades Colaborativas',
  intersetoriais: 'Ações Intersetoriais'
};

/**
 * Mapeamento de barreiras para estratégias de acessibilidade
 * Utilizado para auto-preenchimento de sugestões de estratégias
 * Baseado em 24 barreiras VB-MAPP
 * @type {Object<string, Array<string>>}
 */
export const BARRIER_STRATEGY_MAP = {
  // Barreiras de Comunicação
  'sem_verbal_expressivo': [
    'Implementar sistema alternativo de comunicação (PECS, Libras)',
    'Usar aplicativo de comunicação dinâmica',
    'Ensinar aproximações de fala com ABA',
    'Providenciar prancheta de comunicação'
  ],
  'dificuldade_compreensao': [
    'Simplificar linguagem e usar frases curtas',
    'Acompanhar instruções verbais com gestos/imagens',
    'Aumentar tempo para processamento',
    'Usar material visual (pictogramas, fotografias)'
  ],
  'pobreza_vocabulario': [
    'Ensino explícito de vocabulário novo',
    'Usar contexto natural para expansão de fala',
    'Atividades de naming através de NET',
    'Criar banco de palavras-chave por área'
  ],
  'dificuldade_pragmatica': [
    'Ensinar turnos de conversa em contexto controlado',
    'Praticar intenção comunicativa através de DTT',
    'Usar histórias sociais para contexto',
    'Generalizar habilidades em diferentes ambientes'
  ],

  // Barreiras de Aprendizagem Motora
  'atraso_motor_grosso': [
    'Reforço positivo para tentativas de movimento',
    'Modificar atividades com adaptações posturais',
    'Encadeamento para sequências motoras complexas',
    'Consultar Terapeuta Ocupacional/Fisioterapeuta'
  ],
  'atraso_motor_fino': [
    'Fornecer lápis e materiais adaptados (grossos)',
    'Quebrar tarefas em passos menores',
    'Treinar pega de lápis com modelagem',
    'Usar tecnologia adaptada (mouse, teclado)'
  ],
  'baixo_tono_muscular': [
    'Posicionamento adequado (almofadas, apoios)',
    'Atividades que fortaleçam musculatura',
    'Pausas para movimento durante aula',
    'Encaminhar para avaliação fisioterápica'
  ],
  'desorganizacao_motora': [
    'Estruturar sequências de movimento passo a passo',
    'Usar pistas visuais para orientação espacial',
    'Praticar em ambiente com menos distrações',
    'Encadeamento com dicas físicas graduais'
  ],

  // Barreiras Comportamentais
  'desatencao': [
    'Aumentar tempo de trabalho gradualmente',
    'Usar intervalo entre tentativas adequado',
    'Incluir quebra-cabeça/movimento antes de atividade',
    'Reforço frequente para comportamento atento'
  ],
  'impulsividade': [
    'Ensinar espera entre estímulo e resposta',
    'Usar sinais de pausa/espera visualmente',
    'Estruturar ambientes com menos demandas simultâneas',
    'DTT com intervalo controlado entre tentativas'
  ],
  'agressividade': [
    'Identificar função do comportamento (motivador)',
    'Ensinar habilidade alternativa (comunicação)',
    'Modificar ambiente para reduzir gatilhos',
    'Reforçar comportamentos incompatíveis'
  ],
  'autoestimulacao_excessiva': [
    'Permitir estímulação em momentos apropriados',
    'Oferecer alternativa sensorial similar',
    'Reduzir gradualmente com transferência controle',
    'Usar como reforçador para comportamentos-alvo'
  ],
  'resistencia_mudanca': [
    'Preparação (avisos prévios sobre transição)',
    'Usar rotina visual e previsibilidade',
    'Estruturar mudanças gradualmente',
    'Oferecer escolhas dentro de limites'
  ],
  'nao_compliance': [
    'Verificar se instrução é clara e possível',
    'Usar reforço imediato para obediência',
    'Oferecer oportunidades de escolha',
    'Reduzir demandas enquanto trabalha compliance'
  ],

  // Barreiras Acadêmicas
  'dificuldade_leitura': [
    'Usar método de ensino estruturado (fônico)',
    'Acompanhar com apoio visual/pictográfico',
    'Adaptar tamanho de fonte e espaçamento',
    'Fornecer leitor de tela ou audiolivro'
  ],
  'dificuldade_escrita': [
    'Usar teclado ou tablet para produção textual',
    'Ensinar cópia com modelo visual presente',
    'Permitir respostas verbais ou via desenho',
    'Adaptar demandas de volume de escrita'
  ],
  'dificuldade_calculo': [
    'Usar material concreto (blocos, discos)',
    'Ensinar estratégias de contagem com suporte',
    'Usar calculadora ou software adaptado',
    'Iniciar com números menores e sequenciar'
  ],
  'atraso_academico_geral': [
    'Currículum funcional adaptado ao nível do aluno',
    'Ensino intensivo em habilidades pré-acadêmicas',
    'Aumentar frequência e intensidade de instrução',
    'Trabalho colaborativo escola-família'
  ],

  // Barreiras Sociais e de Participação
  'isolamento_social': [
    'Estruturar atividades colaborativas supervisionadas',
    'Ensinar habilidades sociais específicas',
    'Facilitar parcerias com colegas sem deficiência',
    'Reforçar iniciativas de interação social'
  ],
  'dificuldade_participacao_grupo': [
    'Reduzir tamanho do grupo inicial',
    'Treinar habilidades antes em ambiente seguro',
    'Usar apoiador para facilitar participação',
    'Incluir preferências do aluno na atividade'
  ],
  'comorbidade_fobia_social': [
    'Dessensibilização gradual a ambientes sociais',
    'Técnica de modelagem com pares',
    'Trabalhar ansiedade com relaxamento',
    'Encaminhar para apoio psicológico'
  ],
  'dificuldade_regulacao_emocional': [
    'Ensinar técnicas de autorregulação (respiração)',
    'Identificar sinais de escalada comportamental',
    'Ter espaço calmo para descanso/recuperação',
    'Comunicação com pais para consistência'
  ]
};

/**
 * Cria um novo plano PEI vazio com estrutura completa
 * Todos os campos inicializados com valores padrão
 * @returns {Object} Objeto do plano PEI vazio
 */
export function createEmptyPEIPlan() {
  return {
    // Identificação
    id: null,
    studentId: null,
    studentName: '',
    studentBirthDate: null,
    grade: '',
    schoolYear: new Date().getFullYear(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // Status
    status: PLAN_STATUS.draft,
    startDate: null,
    endDate: null,

    // Equipe
    team: {
      coordinator: null,
      coordinatorRole: '',
      teachers: [],
      specialists: [],
      familyRepresentatives: []
    },

    // Estudo de Caso (obrigatório)
    studioCaso: {
      barreiras_demandas: '',
      contexto_escolar: '',
      potencialidades: '',
      estrategias_acessibilidade: ''
    },

    // Objetivos e métricas
    objectives: [],

    // Adaptações (Decreto 12.773/2025)
    adaptations: {
      metodologicas: '',
      curriculares: '',
      materiais: '',
      avaliacoes: '',
      tempo: '',
      espaciais: ''
    },

    // Recursos
    resources: {
      humanos: [],
      materiais: [],
      tecnologicos: [],
      ambientais: []
    },

    // Orientações por área (Art. 12 §2)
    orientations: {
      sala_comum: '',
      aee: '',
      colaborativas: '',
      intersetoriais: ''
    },

    // Acompanhamento
    monitoring: {
      frequency: 'bimestral',
      responsavel: null,
      observations: []
    },

    // Documentação
    documents: [],
    notes: ''
  };
}

/**
 * Valida a saúde/completude de um plano PEI
 * Verifica campos obrigatórios e retorna diagnóstico detalhado
 * @param {Object} peiPlan - Plano PEI a validar
 * @returns {Object} Objeto com validação completa
 * @returns {boolean} returns.isValid - Se o plano é válido
 * @returns {boolean} returns.canActivate - Se pode ser ativado
 * @returns {Array<string>} returns.errors - Erros críticos encontrados
 * @returns {Array<string>} returns.warnings - Avisos não-críticos
 * @returns {number} returns.completionPct - Percentual de preenchimento (0-100)
 */
export function validatePlanHealth(peiPlan) {
  const errors = [];
  const warnings = [];
  let completionScore = 0;
  const maxScore = 100;

  // Validar estudo de caso (obrigatório)
  const casestudyFields = Object.keys(ESTUDO_CASO_FIELDS);
  let caseStudyComplete = 0;

  casestudyFields.forEach(fieldKey => {
    const fieldDef = ESTUDO_CASO_FIELDS[fieldKey];
    const fieldValue = peiPlan.studioCaso?.[fieldKey] || '';

    if (fieldValue.length < fieldDef.minChars) {
      errors.push(
        `Campo obrigatório "${fieldDef.label}" precisa de pelo menos ${fieldDef.minChars} caracteres ` +
        `(atual: ${fieldValue.length})`
      );
    } else {
      caseStudyComplete += 1;
    }
  });

  completionScore += (caseStudyComplete / casestudyFields.length) * 25;

  // Validar objetivos
  if (!peiPlan.objectives || peiPlan.objectives.length === 0) {
    errors.push('Plano deve ter pelo menos 1 objetivo definido');
  } else {
    completionScore += 25;

    // Validar que cada objetivo tem métricas
    let objectivesWithMetrics = 0;
    peiPlan.objectives.forEach((objective, idx) => {
      if (!objective.metrics || objective.metrics.length === 0) {
        warnings.push(
          `Objetivo ${idx + 1} "${objective.description}" não possui métricas de avaliação`
        );
      } else {
        objectivesWithMetrics += 1;
      }
    });

    if (objectivesWithMetrics === peiPlan.objectives.length) {
      completionScore += 10;
    }
  }

  // Validar adaptações
  const adaptationFields = Object.keys(peiPlan.adaptations || {});
  let adaptationsComplete = 0;

  adaptationFields.forEach(fieldKey => {
    const fieldValue = peiPlan.adaptations[fieldKey] || '';
    if (fieldValue && fieldValue.trim().length > 0) {
      adaptationsComplete += 1;
    }
  });

  if (adaptationsComplete === 0) {
    warnings.push('Nenhuma adaptação foi especificada');
  } else {
    completionScore += (adaptationsComplete / adaptationFields.length) * 20;
  }

  // Validar recursos
  const resourcesConfigured = Object.values(peiPlan.resources || {}).some(arr =>
    Array.isArray(arr) && arr.length > 0
  );

  if (!resourcesConfigured) {
    warnings.push('Nenhum recurso foi configurado para o plano');
  } else {
    completionScore += 10;
  }

  // Validar orientações (Decreto 12.773/2025)
  const orientationFields = Object.keys(DECREE_ORIENTATIONS);
  let orientationsComplete = 0;

  orientationFields.forEach(fieldKey => {
    const fieldValue = peiPlan.orientations?.[fieldKey] || '';
    if (fieldValue && fieldValue.trim().length > 0) {
      orientationsComplete += 1;
    }
  });

  if (orientationsComplete < orientationFields.length) {
    warnings.push(
      `${orientationFields.length - orientationsComplete} ` +
      `área(s) de orientação (Decreto Art. 12 §2) não preenchida(s)`
    );
  } else {
    completionScore += 10;
  }

  // Normalizar score para 0-100
  const completionPct = Math.min(Math.round(completionScore), 100);

  // Determinar se é válido
  const isValid = errors.length === 0;

  // Pode ativar se válido E tem pelo menos adaptações
  const canActivate = isValid && adaptationsComplete > 0 && orientationsComplete === orientationFields.length;

  return {
    isValid,
    canActivate,
    errors,
    warnings,
    completionPct
  };
}
