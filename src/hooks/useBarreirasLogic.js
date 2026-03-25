import { useState, useMemo } from 'react';

const BARREIRAS_VBMAPP = [
  {
    id: 'bar_01',
    nome: 'Comportamento negativo',
    descricao: 'Respostas como chorar, jogar-se no chão, gritar, bater, jogar objetos.',
    niveis: {
      0: 'Não apresenta comportamentos negativos que dificultam a aprendizagem',
      1: 'Problema ocasional. Em algumas situações chora ou choraminga, mas recupera e volta a atividade realizada.',
      2: 'Problema moderado. Diferentes comportamentos negativos emitidos, não tão graves, mas que ocorrem todos os dias.',
      3: 'Problema persistente. Os comportamentos negativos já se tornam de difícil administração pelo adulto.',
      4: 'Problema grave. Ocorrem várias vezes ao dia e representam perigo para si e para os outros.'
    }
  },
  {
    id: 'bar_02',
    nome: 'Controle instrucional fraco',
    descricao: 'Comportamentos com função de esquivar ou fugir de uma demanda.',
    niveis: {
      0: 'Criança cooperativa',
      1: 'Comportamento desobediente pouco frequente. Em geral é cooperativa, algumas demandas geram desobediência, mas se recupera rapidamente.',
      2: 'Comportamentos desobedientes menores, porém várias vezes ao dia, sendo mais difícil para o adulto manejar.',
      3: 'Os comportamentos tem se tornado mais frequentes e graves, ocorrendo em diferentes contextos.',
      4: 'Problema grave e diário que inclui agressão, destruição de itens caso a demanda não seja removida.'
    }
  },
  {
    id: 'bar_03',
    nome: 'Mando fraco, ausente ou prejudicado',
    descricao: 'A criança tem um repertório de mando reduzido ou inferior quando comparada com as outras habilidades.',
    niveis: {
      0: 'Repertório adequado e proporcional às outras habilidades.',
      1: 'Emite mandos, porém possui uma pontuação bem maior nos outros operantes verbais.',
      2: 'Emite pouquíssimos mandos e restritos aos itens reforçadores.',
      3: 'Os mandos raramente são espontâneos, não correspondem à motivação, ocorrem por meio de comportamento negativo.',
      4: 'A criança não emite nenhum tipo de mando ou emite sem muitas outras habilidades verbais.'
    }
  },
  {
    id: 'bar_04',
    nome: 'Tato fraco, ausente ou prejudicado',
    descricao: 'A criança tem um repertório de tato reduzido, ausente ou inferior quando comparada com as outras habilidades.',
    niveis: {
      0: 'Repertório adequado e proporcional às outras habilidades.',
      1: 'Consegue tatear alguns itens e tem bom repertório de ecoico.',
      2: 'Erros ocorrem com frequência, a criança tenta adivinhar e a emissão fica dependente de dicas.',
      3: 'Repertório inferior ao de outras habilidades verbais, pouco espontâneo, mecânico.',
      4: 'A criança não emite nenhum tipo de tato ou tem um repertório muito limitado.'
    }
  },
  {
    id: 'bar_05',
    nome: 'Imitação motora ausente, fraca ou prejudicada',
    descricao: 'A criança tem um repertório de imitação reduzido ou inferior quando comparado com as outras habilidades.',
    niveis: {
      0: 'Repertório de imitar crescendo e proporcional às outras habilidades.',
      1: 'Imita, porém possui uma pontuação bem maior nas outras áreas.',
      2: 'Possui dificuldade em generalizar, dependente de dicas, imita comportamentos inadequados.',
      3: 'Imitação sempre dependente de dica física ou verbal.',
      4: 'A criança não tem habilidades de imitação e tentativas de ensino anteriores falharam.'
    }
  },
  {
    id: 'bar_06',
    nome: 'Ecoico ausente, fraco ou prejudicado',
    descricao: 'Criança tem um repertório de ecoar ausente ou em excesso (repetição excessiva de sons).',
    niveis: {
      0: 'Repertório de ecoar proporcional às outras habilidades.',
      1: 'Ecoa, porém possui uma pontuação bem maior nas outras áreas.',
      2: 'Habilidades de ecoar estão ficando ainda mais atrasadas quando comparadas às outras.',
      3: 'Não ocorre ecoar espontâneo, aprendizado lento e ensino intensivo ou ocorre em excesso.',
      4: 'A criança não tem habilidades de ecoar, mesmo tendo habilidades de imitação.'
    }
  },
  {
    id: 'bar_07',
    nome: 'VP-MTS fraco, ausente ou prejudicado',
    descricao: 'A criança tem muita dificuldade com tarefas que exigem habilidades de percepção visual, seleção e combinação de itens.',
    niveis: {
      0: 'VP-MTS proporcional às outras habilidades, crescendo e adequado à idade.',
      1: 'Consegue realizar pareamento, mas possui uma pontuação bem maior nas outras áreas.',
      2: 'Apresenta adivinhação, falha em scannear a matriz ou em selecionar o item.',
      3: 'Adquiriu algumas habilidades, mas não proporcionais às outras. Repertório limitado.',
      4: 'A criança não tem habilidades de VP-MTS e/ou já foram realizadas diversas tentativas de ensino.'
    }
  },
  {
    id: 'bar_08',
    nome: 'Responder de ouvinte fraco, ausente ou prejudicado',
    descricao: 'Dificuldade em realizar tarefas que exijam seguir instruções ou demonstra compreensão sobre o que é dito.',
    niveis: {
      0: 'Ouvinte proporcional às outras habilidades, crescendo e adequado à idade.',
      1: 'Demonstra habilidades de ouvinte, mas possui uma pontuação bem maior nas outras áreas.',
      2: 'Não consegue executar alguma resposta necessária para a tarefa.',
      3: 'Exibe comportamentos negativos. Repertório limitado, falha em generalizar.',
      4: 'A criança não tem habilidades de ouvinte e/ou já foram realizadas diversas tentativas de ensino.'
    }
  },
  {
    id: 'bar_09',
    nome: 'Intraverbal ausente, fraco ou prejudicado',
    descricao: 'Um dos repertórios mais comuns de serem prejudicados e mais difíceis de serem ensinados.',
    niveis: {
      0: 'Intraverbal proporcional às outras habilidades, crescendo e adequado à idade.',
      1: 'Demonstra responder Intraverbal, mas possui uma pontuação bem maior nas outras áreas.',
      2: 'Com frequência apresenta erros, adivinha a resposta, dependente de dicas, apresenta ecolalia.',
      3: 'Exibe respostas mecânicas, respostas rapidamente esquecidas, repertório limitado.',
      4: 'A criança não tem habilidades intraverbais e/ou já foram realizadas diversas tentativas de ensino.'
    }
  },
  {
    id: 'bar_10',
    nome: 'Habilidades sociais ausentes, fracas ou prejudicadas',
    descricao: 'Um dos repertórios mais complexos e que está diretamente ligado com outras habilidades/barreiras.',
    niveis: {
      0: 'Habilidades sociais proporcional às outras habilidades, crescendo e adequado à idade.',
      1: 'Ocorre comportamento social, mas possui uma pontuação bem maior nas outras áreas.',
      2: 'Raramente inicia interação social com colega. Emite comportamento socialmente negativo.',
      3: 'Em situação de brincar, geralmente fica sozinha, não costuma compartilhar brinquedos.',
      4: 'A criança TEM habilidades de linguagem, mas evita outras crianças, emite comportamento negativo.'
    }
  },
  {
    id: 'bar_11',
    nome: 'Dependente de dicas',
    descricao: 'Dicas são algumas ajudas (verbais, físicas ou gestuais) para a execução de uma determinada resposta.',
    niveis: {
      0: 'A criança está aprendendo de modo consistente, sem estar dependente do uso de dicas.',
      1: 'São necessárias várias tentativas para o esvanecimento da dica, porém está conseguindo aprender.',
      2: 'Algumas dicas são difíceis de serem retiradas.',
      3: 'O aplicador tem muita dificuldade em retirar a dica, estas ocorrem de modo sutil.',
      4: 'Extremamente difícil de retirar as dicas e a maioria das respostas são vinculadas a dicas.'
    }
  },
  {
    id: 'bar_12',
    nome: 'Resposta de adivinhação',
    descricao: 'A criança pode emitir uma série de respostas que já foram reforçadas em outro momento.',
    niveis: {
      0: 'A criança não emite respostas de adivinhação.',
      1: 'Tenta adivinhar ocasionalmente, diante de novos estímulos, mas após alguns treinos para.',
      2: 'Adivinhação é um problema frequente, principalmente quando novos estímulos são introduzidos.',
      3: 'Adivinhação continua a acontecer, mesmo que com habilidades já "adquiridas".',
      4: 'Adivinhação ocorre com quase todas as tentativas.'
    }
  },
  {
    id: 'bar_13',
    nome: 'Rastreamento comprometido',
    descricao: 'Antes da criança emitir a resposta de selecionar um item, esta deve scannear a matriz.',
    niveis: {
      0: 'A criança geralmente faz uma varredura de matrizes sem erros.',
      1: 'Realiza varredura de matrizes com 6 a 8 itens, mas a partir de 10 itens começa a ter dificuldades.',
      2: 'Geralmente não consegue selecionar um item em uma matriz maior que 5 itens.',
      3: 'A varredura ocorre apenas em uma matriz de dois ou três estímulos.',
      4: 'Criança não faz a varredura, responde antes da varredura ou emite comportamento de fuga.'
    }
  },
  {
    id: 'bar_14',
    nome: 'Discriminação condicional falha',
    descricao: 'A criança não realiza discriminações condicionais de modo equilibrado com suas pontuações.',
    niveis: {
      0: 'A criança realiza discriminações condicionais de modo equilibrado.',
      1: 'A criança precisa de mais esforço em matrizes maiores contendo estímulos semelhantes.',
      2: 'Apresenta dificuldades quando a condição possui múltiplos estímulos verbais.',
      3: 'Falha na maioria das tarefas que exigem discriminação condicional.',
      4: 'Apesar de demonstrar habilidades de discriminação simples, não consegue realizar discriminação condicional.'
    }
  },
  {
    id: 'bar_15',
    nome: 'Falha em generalizar',
    descricao: 'A criança não apresenta generalização em um nível compatível com as suas habilidades.',
    niveis: {
      0: 'A criança apresenta generalização em um nível compatível com as suas habilidades.',
      1: 'Apresenta algum tipo de dificuldades para generalizar (novos estímulos, área específica).',
      2: 'A criança precisa de treinamento formal de generalização na maioria das habilidades.',
      3: 'É necessário fazer um trabalho maior e diversas vezes a criança "esquece" algumas respostas.',
      4: 'A criança não demonstra nenhum tipo de generalização para situações não treinadas.'
    }
  },
  {
    id: 'bar_16',
    nome: 'Operações motivadoras fracas ou atípicas',
    descricao: 'OM podem ser incondicionadas (privação de água, sono) ou condicionadas (privação de um brinquedo).',
    niveis: {
      0: 'A criança apresenta diversas OM apropriadas à idade.',
      1: 'OM ligeiramente diferentes de crianças com desenvolvimento típico.',
      2: 'A criança tem OM fracas para itens comuns ou tem OM fortes para estímulos distintos.',
      3: 'OM atípicas para reforçadores não aprendidos ou OM que enfraquece rapidamente.',
      4: 'Criança apresenta OM muito limitadas, 2 ou 3, sendo essas atípicas.'
    }
  },
  {
    id: 'bar_17',
    nome: 'Custo de resposta enfraquece a OM',
    descricao: 'A criança demonstra interesse pelo item, mas quando deve emitir determinada resposta, perde o interesse.',
    niveis: {
      0: 'A criança em geral não perde o interesse quando demandas razoáveis são exigidas.',
      1: 'OM ligeiramente diferentes de crianças com desenvolvimento típico.',
      2: 'Caso a demanda fique muito alta, a criança perde o interesse algumas vezes.',
      3: 'A criança demonstra muito interesse, mas quando uma exigência alta é colocada, se afasta.',
      4: 'Criança foge da demanda, mesmo que seja para conseguir o mais potente dos reforçadores.'
    }
  },
  {
    id: 'bar_18',
    nome: 'Dependência de reforço',
    descricao: 'A criança apresenta problemas com reforço intermitente, social ou verbal.',
    niveis: {
      0: 'A criança não apresenta problemas com reforço intermitente, social ou verbal.',
      1: 'Prefere itens tangíveis ou comestíveis, embora consiga aceitar reforço social.',
      2: 'A criança fica relutante em não receber os itens preferidos.',
      3: 'É difícil manter o atendimento caso não sejam entregues reforçadores frequentes.',
      4: 'Uma grande quantidade de reforçadores tangíveis é necessária para ensino de uma única habilidade.'
    }
  },
  {
    id: 'bar_19',
    nome: 'Autoestimulação',
    descricao: 'Comportamentos repetitivos que, em geral, se mantém por reforçamento automático.',
    niveis: {
      0: 'A criança não apresenta movimentos de autoestimulação fora do comum.',
      1: 'Se envolve em respostas de autoestimulação, mas que não concorrem com outras atividades.',
      2: 'Emite respostas de autoestimulação que podem competir com outros reforçadores.',
      3: 'Emite respostas de autoestimulação com alta frequência. Costuma parar após repreensões.',
      4: 'Frequentemente se engaja em autoestimulação e os outros reforçadores são fracos.'
    }
  },
  {
    id: 'bar_20',
    nome: 'Dificuldades articulatórias',
    descricao: 'As crianças podem utilizar palavras com a função adequada, porém emitem de modo que não são compreendidas.',
    niveis: {
      0: 'A maioria dos adultos consegue entender o que a criança diz.',
      1: 'Apresenta dificuldade na articulação de algumas palavras, mas a grande maioria entende.',
      2: 'Tem habilidades do nível dois, mas pessoas estranhas tem dificuldade de entender.',
      3: 'Habilidades vocais muito limitadas e demonstra grande variedade de erros de articulação.',
      4: 'A criança pontua em diversas habilidades, mas não fala ou tem fala completamente ininteligível.'
    }
  },
  {
    id: 'bar_21',
    nome: 'Comportamento Obsessivo-Compulsivo',
    descricao: 'Comportamentos obsessivos que podem ocorrer, incluindo comportamentos negativos quando impedida.',
    niveis: {
      0: 'Não demonstra comportamento obsessivo que atrapalhe a aprendizagem.',
      1: 'Obsessões menores, mas que não atrapalham o aprendizado de outras habilidades.',
      2: 'Várias obsessões diferentes e apresenta comportamento negativo moderado quando impedida.',
      3: 'Emite respostas obsessivas diversas e fortes que impedem o aprendizado.',
      4: 'Obsessão bastante consistente e são o foco/ações principais do dia.'
    }
  },
  {
    id: 'bar_22',
    nome: 'Hiperatividade',
    descricao: 'Apresenta uma alta taxa de respostas envolvendo comportamento motor (pular, correr, escalar).',
    niveis: {
      0: 'Não apresenta respostas hiperativas quando comparadas com outras crianças da idade.',
      1: 'Emite comportamento hiperativo ocasional ou perde o foco, mas sem prejuízo ao aprendizado.',
      2: 'Anda pelo ambiente com frequência maior que os colegas. Interfere na aquisição de habilidades.',
      3: 'Adultos tem dificuldade de controlar o comportamento hiperativo.',
      4: 'Constantemente em movimento e o comportamento hiperativo é o foco/ações principais do dia.'
    }
  },
  {
    id: 'bar_23',
    nome: 'Falha em manter o contato visual',
    descricao: 'A criança não realiza contato visual adequado para a idade.',
    niveis: {
      0: 'Realiza contato visual adequado para a idade e atende adequadamente as pessoas.',
      1: 'Não realiza contato visual semelhante aos pares.',
      2: 'A criança não realiza contato visual com frequência ou atenta para o rosto de outras pessoas.',
      3: 'Não realiza nenhum contato visual quando emite mandos e dificilmente realiza em outras circunstâncias.',
      4: 'Quase nunca faz contato visual.'
    }
  },
  {
    id: 'bar_24',
    nome: 'Defesa sensorial',
    descricao: 'Hipersensibilidade a diversos estímulos sensoriais.',
    niveis: {
      0: 'Não apresenta problemas relacionados a estímulos sensoriais.',
      1: 'Apresenta uma sensibilidade a diversos estímulos, o que difere dos pares.',
      2: 'A criança é afetada por estimulação sensorial mas geralmente não interfere nas atividades.',
      3: 'Frequentemente foge de determinados estímulos e fica agitado caso a demanda não seja removida.',
      4: 'Reage a estímulos sensoriais específicos com respostas negativas mais graves.'
    }
  }
];

const NIVEIS_PONTUACAO = [
  { value: 0, label: '0', cor: 'verde' },
  { value: 1, label: '1', cor: 'amarelo-claro' },
  { value: 2, label: '2', cor: 'amarelo' },
  { value: 3, label: '3', cor: 'laranja' },
  { value: 4, label: '4', cor: 'vermelho' }
];

export function useBarreirasLogic(sessionInfo, isReadOnly) {
  const [avaliacoes, setAvaliacoes] = useState(() => {
    if (sessionInfo?.barreiras) {
      const initial = {};
      sessionInfo.barreiras.forEach(b => {
        initial[b.categoria_id] = {
          pontuacao: b.pontuacao,
          observacao: b.observacao
        };
      });
      return initial;
    }
    return {};
  });

  const [expandedCard, setExpandedCard] = useState(null);

  // Progresso de avaliação
  const progress = useMemo(() => {
    const total = BARREIRAS_VBMAPP.length; // 24
    const avaliadas = Object.values(avaliacoes).filter(av =>
      av.pontuacao !== null && av.pontuacao !== undefined
    ).length;

    const escoreTotal = Object.values(avaliacoes).reduce((sum, av) => {
      return sum + (av.pontuacao !== null && av.pontuacao !== undefined ? av.pontuacao : 0);
    }, 0);

    return {
      total,
      avaliadas,
      pendentes: total - avaliadas,
      percentComplete: ((avaliadas / total) * 100).toFixed(1),
      escoreTotal,
      escoreMaximo: total * 4 // 24 * 4 = 96
    };
  }, [avaliacoes]);

  const canFinalize = progress.avaliadas === progress.total;

  const setAvaliacao = (categoriaId, field, value) => {
    if (isReadOnly) return;
    setAvaliacoes(prev => ({
      ...prev,
      [categoriaId]: {
        ...prev[categoriaId],
        [field]: value
      }
    }));
  };

  const handleFinalize = (onFinalize) => {
    if (!canFinalize) {
      alert(`Você precisa avaliar TODAS as ${BARREIRAS_VBMAPP.length} barreiras. Faltam ${progress.pendentes}.`);
      return;
    }

    const barreiras = BARREIRAS_VBMAPP.map(bar => {
      const av = avaliacoes[bar.id] || {};
      return {
        categoria: bar.nome,
        categoria_id: bar.id,
        pontuacao: av.pontuacao,
        observacao: av.observacao?.trim() || ''
      };
    });

    const barreirasData = {
      session_id: sessionInfo.session_id,
      child_name: sessionInfo.child_name,
      date_barreiras: new Date().toISOString(),
      barreiras_completas: true,
      barreiras: barreiras,
      escore_total_barreiras: progress.escoreTotal,
      escore_maximo: progress.escoreMaximo,
      schema_version: 'vbmapp_barreiras_v2'
    };

    onFinalize(barreirasData);
  };

  const isCategoriaCompleta = (categoriaId) => {
    const av = avaliacoes[categoriaId];
    return av && av.pontuacao !== null && av.pontuacao !== undefined;
  };

  return {
    // Data
    avaliacoes,
    expandedCard,
    progress,
    canFinalize,
    // Constants
    BARREIRAS_VBMAPP,
    NIVEIS_PONTUACAO,
    // Setters
    setExpandedCard,
    setAvaliacao,
    // Handlers
    handleFinalize,
    // Utilities
    isCategoriaCompleta
  };
}
