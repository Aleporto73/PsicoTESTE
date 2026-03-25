/*
 * ATA - Avaliação de Traços Autísticos
 * Instrumento de triagem para TEA (Transtorno do Espectro Autista)
 * 23 eixos comportamentais
 *
 * DUAS VERSÕES:
 * - COMPLETA: Sub-itens Sim/Não por seção (~120 itens)
 * - RESUMIDA: Uma pergunta por seção com A/B/C (23 itens)
 *
 * Ponto de corte: ≥15 = Risco para TEA
 */

export const ATA_SECTIONS = [
  { id: 'interacao_social', number: 1, roman: 'I', label: 'Interação Social' },
  { id: 'ambiente', number: 2, roman: 'II', label: 'Ambiente' },
  { id: 'pessoas_redor', number: 3, roman: 'III', label: 'Pessoas ao Seu Redor' },
  { id: 'resistencia_mudancas', number: 4, roman: 'IV', label: 'Resistência a Mudanças' },
  { id: 'ordem_rigida', number: 5, roman: 'V', label: 'Busca de Uma Ordem Rígida' },
  { id: 'contato_visual', number: 6, roman: 'VI', label: 'Contato Visual' },
  { id: 'mimica_inexpressiva', number: 7, roman: 'VII', label: 'Mímica Inexpressiva' },
  { id: 'disturbios_sono', number: 8, roman: 'VIII', label: 'Distúrbios de Sono' },
  { id: 'alteracao_alimentacao', number: 9, roman: 'IX', label: 'Alteração na Alimentação' },
  { id: 'controle_esfincteres', number: 10, roman: 'X', label: 'Controle dos Esfíncteres' },
  { id: 'exploracao_objetos', number: 11, roman: 'XI', label: 'Exploração dos Objetos' },
  { id: 'uso_inapropriado_objetos', number: 12, roman: 'XII', label: 'Uso Inapropriado dos Objetos' },
  { id: 'atencao', number: 13, roman: 'XIII', label: 'Atenção' },
  { id: 'ausencia_interesse', number: 14, roman: 'XIV', label: 'Ausência de Interesse pela Aprendizagem' },
  { id: 'falta_iniciativa', number: 15, roman: 'XV', label: 'Falta de Iniciativa' },
  { id: 'alteracao_linguagem', number: 16, roman: 'XVI', label: 'Alteração de Linguagem e Comunicação' },
  { id: 'nao_manifesta_habilidades', number: 17, roman: 'XVII', label: 'Não Manifesta Habilidades e Conhecimentos' },
  { id: 'reacoes_frustracao', number: 18, roman: 'XVIII', label: 'Reações Inapropriadas ante a Frustração' },
  { id: 'responsabilidades', number: 19, roman: 'XIX', label: 'Responsabilidades' },
  { id: 'hiperatividade', number: 20, roman: 'XX', label: 'Hiperatividade / Hipoatividade' },
  { id: 'movimentos_estereotipados', number: 21, roman: 'XXI', label: 'Movimentos Estereotipados e Repetitivos' },
  { id: 'ignora_perigo', number: 22, roman: 'XXII', label: 'Ignora o Perigo' },
  { id: 'sintomas_36_meses', number: 23, roman: 'XXIII', label: 'Aparecimento dos Sintomas antes dos 36 meses' },
];

// ═══════════════════════════════════════════
// VERSÃO COMPLETA - Sub-itens Sim/Não
// ═══════════════════════════════════════════
export const ATA_COMPLETE_ITEMS = {
  interacao_social: {
    question: '1. Durante interações sociais, a criança mantém contato visual adequado?',
    items: [
      { id: '1_1', text: 'Não sorri' },
      { id: '1_2', text: 'Ausência de aproximações espontâneas' },
      { id: '1_3', text: 'Não busca companhia' },
      { id: '1_4', text: 'Busca constantemente seu cantinho (esconderijo)' },
      { id: '1_5', text: 'Evita pessoas' },
      { id: '1_6', text: 'É incapaz de manter um intercâmbio social (conversa com trocas, pergunta e resposta)' },
      { id: '1_7', text: 'Isolamento intenso' },
    ],
  },
  ambiente: {
    question: '2. Como a criança reage a mudanças na rotina diária ou ambiente?',
    items: [
      { id: '2_1', text: 'Não responde às solicitações' },
      { id: '2_2', text: 'Mudança repentina de humor' },
      { id: '2_3', text: 'Mantém-se indiferente, sem expressão' },
      { id: '2_4', text: 'Risos compulsivos' },
      { id: '2_5', text: 'Birra e raiva frequente' },
      { id: '2_6', text: 'Excitação motora ou verbal (ir de um lugar a outro, falar sem parar)' },
    ],
  },
  pessoas_redor: {
    question: '3. A criança mostra preferência por interações com adultos ou crianças?',
    items: [
      { id: '3_1', text: 'Utiliza-se do adulto como um objeto (por exemplo, levando a mão do adulto até o interruptor, para acender a luz)' },
      { id: '3_2', text: 'O adulto lhe serve como apoio para conseguir o que deseja (por exemplo, faz a perna do adulto de ponte para o carrinho passar)' },
      { id: '3_3', text: 'O adulto é essencialmente um meio para suprir uma necessidade (por exemplo, a aproximação tem o objetivo principal de pedir coisas)' },
      { id: '3_4', text: 'Se o adulto não responde às suas demandas, atua interferindo na conduta desse adulto (por exemplo, desliga a TV que o adulto esteja assistindo, ameaça quebrar algo, joga coisas no adulto, toma coisas da mão do adulto como pirraça)' },
    ],
  },
  resistencia_mudancas: {
    question: '4. Como a criança reage a mudanças na rotina diária ou ambiente?',
    items: [
      { id: '4_1', text: 'Insistente em manter a rotina (por exemplo, prefere fazer sempre o mesmo passeio ou comer sempre a mesma coisa)' },
      { id: '4_2', text: 'Grande relutância em aceitar fatos que alteram sua rotina, tais como mudanças de atividade, horário ou mobília' },
      { id: '4_3', text: 'Apresenta resistência a mudanças, persistindo na mesma resposta ou atividade (por exemplo, brincar sempre do mesmo jeito)' },
    ],
  },
  ordem_rigida: {
    question: '5. A criança se incomoda com mudanças na organização de objetos ou atividades?',
    items: [
      { id: '5_1', text: 'Ordenação dos objetos de acordo com critérios próprios e pré-estabelecidos' },
      { id: '5_2', text: 'Prende-se a uma ordenação espacial (cada coisa tem um lugar próprio rígido para ficar)' },
      { id: '5_3', text: 'Prende-se a uma sequência temporal (por exemplo, só pode por a meia depois da blusa)' },
      { id: '5_4', text: 'Prende-se a uma correspondência pessoa-lugar (por exemplo, a mesma pessoa precisa sentar sempre no mesmo lugar)' },
    ],
  },
  contato_visual: {
    question: '6. Durante interações sociais, a criança mantém contato visual adequado?',
    items: [
      { id: '6_1', text: 'Desvia o olhar, não olhando nos olhos ou olhando sempre rapidamente' },
      { id: '6_2', text: 'Olha para outra direção quando é chamado' },
      { id: '6_3', text: 'Expressão do olhar vazio e sem vida (sem expressão de emoções, indiferente)' },
      { id: '6_4', text: 'Quando segue os estímulos com os olhos, somente o faz de maneira intermitente (não contínua, ou seja, com pausas)' },
      { id: '6_5', text: 'Fixa os objetos com um olhar periférico, não central (olhar de lado, com a cabeça um pouco virada e não de frente)' },
      { id: '6_6', text: 'Dá a sensação de que não olha' },
    ],
  },
  mimica_inexpressiva: {
    question: '7. A expressão facial da criança é limitada ou pouco variada?',
    items: [
      { id: '7_1', text: 'Se fala, não utiliza a expressão facial, gestual ou vocal com a frequência esperada' },
      { id: '7_2', text: 'Não mostra uma reação antecipatória (como um \'suspense\' pelo que vai acontecer)' },
      { id: '7_3', text: 'Não expressa através da mímica ou olhar aquilo que quer ou o que sente' },
      { id: '7_4', text: 'Imobilidade facial' },
    ],
  },
  disturbios_sono: {
    question: '8. A criança apresenta dificuldades para dormir ou manter um horário regular de sono?',
    items: [
      { id: '8_1', text: 'Não quer ir dormir (relutância frequente, choro, birra, resistência intensa prolongada)' },
      { id: '8_2', text: 'Levanta-se muito cedo' },
      { id: '8_3', text: 'Sono irregular (em intervalos)' },
      { id: '8_4', text: 'Troca o dia pela noite' },
      { id: '8_5', text: 'Dorme poucas horas' },
    ],
  },
  alteracao_alimentacao: {
    question: '9. Há aversão ou seletividade alimentar significativa?',
    items: [
      { id: '9_1', text: 'Seletividade alimentar rígida (ex.: come o mesmo tipo de alimento sempre)' },
      { id: '9_2', text: 'Come outras coisas além de alimentos (papel, insetos)' },
      { id: '9_3', text: 'Quando pequeno, não mastigava' },
      { id: '9_4', text: 'Apresenta uma atividade ruminante (fica um tempo longo com a comida na boca, de um lado para o outro, antes de engolir)' },
      { id: '9_5', text: 'Vômitos' },
      { id: '9_6', text: 'Come grosseiramente, esparrama a comida ou a atira' },
      { id: '9_7', text: 'Rituais (por exemplo, esfarelar alimentos antes da ingestão)' },
      { id: '9_8', text: 'Ausência de paladar (falta de sensibilidade gustativa)' },
    ],
  },
  controle_esfincteres: {
    question: '10. Controle dos Esfíncteres',
    items: [
      { id: '10_1', text: 'Medo de sentar-se no vaso sanitário' },
      { id: '10_2', text: 'Utiliza os esfíncteres para manipular o adulto (por exemplo, ameaça fazer xixi no local errado de propósito)' },
      { id: '10_3', text: 'Utiliza os esfíncteres como estimulação corporal, para obtenção de prazer' },
      { id: '10_4', text: 'Tem controle diurno, porém o noturno é tardio ou ausente' },
    ],
  },
  exploracao_objetos: {
    question: '11. Exploração dos Objetos (Apalpar, Chupar)',
    items: [
      { id: '11_1', text: 'Morde e engole objetos não alimentares' },
      { id: '11_2', text: 'Chupa e coloca as coisas na boca' },
      { id: '11_3', text: 'Cheira tudo' },
      { id: '11_4', text: 'Apalpa tudo, examina as superfícies com os dedos de forma minuciosa' },
    ],
  },
  uso_inapropriado_objetos: {
    question: '12. Uso Inapropriado dos Objetos',
    items: [
      { id: '12_1', text: 'Ignora os objetos ou mostra um interesse momentâneo' },
      { id: '12_2', text: 'Pega, golpeia ou simplesmente os atira no chão' },
      { id: '12_3', text: 'Conduta atípica com os objetos (segura indiferentemente nas mãos ou gira)' },
      { id: '12_4', text: 'Carrega insistentemente consigo determinado objeto' },
      { id: '12_5', text: 'Se interessa somente por uma parte do objeto ou do brinquedo' },
      { id: '12_6', text: 'Coleciona objetos estranhos' },
      { id: '12_7', text: 'Utiliza os objetos de forma particular (pouco usual) e inadequada' },
    ],
  },
  atencao: {
    question: '13. A criança mantém foco e atenção em atividades específicas?',
    items: [
      { id: '13_1', text: 'Quando realiza uma atividade, fixa a atenção por curto espaço de tempo ou é incapaz de fixá-la' },
      { id: '13_2', text: 'Age como se fosse surdo' },
      { id: '13_3', text: 'Tempo de latência de resposta aumentado, entende as instruções com dificuldade' },
      { id: '13_4', text: 'Resposta retardada' },
      { id: '13_5', text: 'Muitas vezes dá a sensação de ausência' },
    ],
  },
  ausencia_interesse: {
    question: '14. Mostra falta de interesse ou motivação para aprender ou participar de atividades educativas?',
    items: [
      { id: '14_1', text: 'Não quer aprender' },
      { id: '14_2', text: 'Cansa-se muito depressa, ainda que de atividade que goste' },
      { id: '14_3', text: 'Esquece rapidamente' },
      { id: '14_4', text: 'Insiste em ser ajudado, ainda que saiba fazer' },
      { id: '14_5', text: 'Insiste constantemente em mudar de atividade' },
    ],
  },
  falta_iniciativa: {
    question: '15. A criança demonstra iniciativa para iniciar interações ou atividades?',
    items: [
      { id: '15_1', text: 'É incapaz de ter iniciativa própria' },
      { id: '15_2', text: 'Busca a comodidade' },
      { id: '15_3', text: 'Passividade, falta de interesse' },
      { id: '15_4', text: 'Lentidão' },
      { id: '15_5', text: 'Prefere que outro faça o trabalho para ele' },
    ],
  },
  alteracao_linguagem: {
    question: '16. A criança apresenta atraso ou alterações na linguagem verbal?',
    items: [
      { id: '16_1', text: 'Mutismo' },
      { id: '16_2', text: 'Estereotipias vocais (fazer sempre os mesmos sons)' },
      { id: '16_3', text: 'Entonação incorreta' },
      { id: '16_4', text: 'Ecolalia imediata e/ou retardada (repetir palavras ou falas que acabou de ouvir, imediatamente ou algum tempo depois)' },
      { id: '16_5', text: 'Repetição de palavras ou frases que podem (ou não) ter valor comunicativo' },
      { id: '16_6', text: 'Emite sons estereotipados quando está agitado e em outras ocasiões, sem nenhuma razão aparente' },
      { id: '16_7', text: 'Não se comunica por gestos' },
      { id: '16_8', text: 'As interações com o adulto nunca são um diálogo' },
    ],
  },
  nao_manifesta_habilidades: {
    question: '17. Demonstrou ausência de habilidades ou conhecimentos esperados para idade?',
    items: [
      { id: '17_1', text: 'Ainda que saiba fazer uma coisa, não a realiza porque não quer, mesmo que solicitado' },
      { id: '17_2', text: 'Não demonstra o que sabe, até ter uma necessidade primária ou um interesse específico' },
      { id: '17_3', text: 'Aprende coisas, porém somente as demonstra em determinados lugares e com determinadas pessoas' },
      { id: '17_4', text: 'Às vezes, surpreende por suas habilidades inesperadas' },
    ],
  },
  reacoes_frustracao: {
    question: '18. Como a criança reage quando enfrenta frustrações ou contratempos?',
    items: [
      { id: '18_1', text: 'Reações de desagrado intenso caso seja esquecida alguma coisa' },
      { id: '18_2', text: 'Reações de desagrado intenso caso seja interrompida alguma atividade que goste' },
      { id: '18_3', text: 'Desgostoso quando os desejos e as expectativas não se cumprem' },
      { id: '18_4', text: 'Reações de birra' },
    ],
  },
  responsabilidades: {
    question: '19. A criança demonstra responsabilidade ou autonomia em atividades diárias?',
    items: [
      { id: '19_1', text: 'Não assume nenhuma responsabilidade, por menor que seja' },
      { id: '19_2', text: 'Para chegar a fazer alguma coisa, há que se repetir muitas vezes ou elevar o tom de voz' },
    ],
  },
  hiperatividade: {
    question: '20. A criança apresenta níveis de atividade fora do comum com comportamentos sem propósito claro (muito ativa ou pouco ativa)?',
    items: [
      { id: '20_1', text: 'A criança está constantemente em movimento' },
      { id: '20_2', text: 'Mesmo estimulada, não se move' },
      { id: '20_3', text: 'Barulhento, a maioria das coisas que faz geram ruído/barulho' },
      { id: '20_4', text: 'Vai de um lugar a outro, sem parar' },
      { id: '20_5', text: 'Fica pulando (saltando) no mesmo lugar' },
      { id: '20_6', text: 'Não se move nunca do lugar onde está sentado' },
    ],
  },
  movimentos_estereotipados: {
    question: '21. A criança exibe comportamentos motores estereotipados ou repetitivos (por exemplo, balançar as mãos, bater os pés)?',
    items: [
      { id: '21_1', text: 'Balança-se' },
      { id: '21_2', text: 'Olha e brinca com as mãos e os dedos' },
      { id: '21_3', text: 'Tapa os olhos e as orelhas' },
      { id: '21_4', text: 'Dá pontapés' },
      { id: '21_5', text: 'Faz caretas e movimentos estranhos com a face' },
      { id: '21_6', text: 'Fica rodopiando ou rodando objetos' },
      { id: '21_7', text: 'Caminha na ponta dos pés ou saltando, arrasta os pés, anda fazendo movimentos estranhos' },
      { id: '21_8', text: 'Torce o corpo, mantém uma postura desequilibrada, posições estranhas, pernas dobradas, cabeça recolhida aos pés, extensões violentas do corpo' },
    ],
  },
  ignora_perigo: {
    question: '22. A criança demonstra consciência do perigo em situações cotidianas?',
    items: [
      { id: '22_1', text: 'Não se dá conta do perigo' },
      { id: '22_2', text: 'Sobe em todos os lugares' },
      { id: '22_3', text: 'Parece insensível à dor' },
    ],
  },
  sintomas_36_meses: {
    question: '23. Houve relato ou observação de sintomas característicos do TEA antes dos 36 meses de idade?',
    items: [
      { id: '23_1', text: 'Houve relato ou observação de sintomas característicos do TEA antes dos 36 meses de idade' },
    ],
  },
};

// ═══════════════════════════════════════════
// VERSÃO RESUMIDA - A/B/C por seção
// ═══════════════════════════════════════════
export const ATA_SUMMARY_ITEMS = {
  interacao_social: {
    question: '1. Durante interações sociais, a criança mantém contato visual adequado?',
    options: [
      { letter: 'A', score: 0, text: 'Sim, mantém contato visual adequado.' },
      { letter: 'B', score: 1, text: 'Às vezes, mostra limitações no contato visual.' },
      { letter: 'C', score: 2, text: 'Evita contato visual durante interações sociais.' },
    ],
  },
  ambiente: {
    question: '2. Como a criança reage a mudanças na rotina diária ou ambiente?',
    options: [
      { letter: 'A', score: 0, text: 'Adapta-se bem a mudanças.' },
      { letter: 'B', score: 1, text: 'Demonstrou alguma resistência ou rigidez frente a mudanças.' },
      { letter: 'C', score: 2, text: 'Mostra forte resistência ou dificuldade em lidar com mudanças.' },
    ],
  },
  pessoas_redor: {
    question: '3. A criança mostra preferência por interações com adultos ou crianças?',
    options: [
      { letter: 'A', score: 0, text: 'Sem preferência clara por interações com adultos ou crianças.' },
      { letter: 'B', score: 1, text: 'Preferência por interações com adultos ou crianças específicas.' },
      { letter: 'C', score: 2, text: 'Demonstrou preferência consistente por interações com adultos ou crianças.' },
    ],
  },
  resistencia_mudancas: {
    question: '4. Como a criança reage a mudanças na rotina diária ou ambiente?',
    options: [
      { letter: 'A', score: 0, text: 'Adapta-se bem a mudanças.' },
      { letter: 'B', score: 1, text: 'Demonstrou alguma resistência ou rigidez frente a mudanças.' },
      { letter: 'C', score: 2, text: 'Mostra forte resistência ou dificuldade em lidar com mudanças.' },
    ],
  },
  ordem_rigida: {
    question: '5. A criança se incomoda com mudanças na organização de objetos ou atividades?',
    options: [
      { letter: 'A', score: 0, text: 'Flexibilidade na organização de objetos ou atividades.' },
      { letter: 'B', score: 1, text: 'Alguma preferência por ordem ou rotina específica.' },
      { letter: 'C', score: 2, text: 'Forte necessidade de manter ordem rígida e resistência a mudanças.' },
    ],
  },
  contato_visual: {
    question: '6. Durante interações sociais, a criança mantém contato visual adequado?',
    options: [
      { letter: 'A', score: 0, text: 'Sim, mantém contato visual adequado.' },
      { letter: 'B', score: 1, text: 'Às vezes, mostra limitações no contato visual.' },
      { letter: 'C', score: 2, text: 'Evita contato visual durante interações sociais.' },
    ],
  },
  mimica_inexpressiva: {
    question: '7. A expressão facial da criança é limitada ou pouco variada?',
    options: [
      { letter: 'A', score: 0, text: 'Expressão facial variada e adequada.' },
      { letter: 'B', score: 1, text: 'Expressão facial limitada em variedade.' },
      { letter: 'C', score: 2, text: 'Expressão facial muito limitada ou inexpressiva.' },
    ],
  },
  disturbios_sono: {
    question: '8. A criança apresenta dificuldades para dormir ou manter um horário regular de sono?',
    options: [
      { letter: 'A', score: 0, text: 'Rotina de sono adequada e regular.' },
      { letter: 'B', score: 1, text: 'Alguma dificuldade ocasional em dormir ou manter rotina de sono.' },
      { letter: 'C', score: 2, text: 'Dificuldades significativas em dormir ou manter horário regular de sono.' },
    ],
  },
  alteracao_alimentacao: {
    question: '9. Há aversão ou seletividade alimentar significativa?',
    options: [
      { letter: 'A', score: 0, text: 'Aceitação adequada de uma variedade de alimentos.' },
      { letter: 'B', score: 1, text: 'Alguma aversão ou seletividade alimentar evidente.' },
      { letter: 'C', score: 2, text: 'Aversão significativa ou seletividade alimentar que impacta a nutrição.' },
    ],
  },
  controle_esfincteres: {
    question: '10. Controle dos Esfíncteres',
    options: [
      { letter: 'A', score: 0, text: 'Controle adequado dos esfíncteres para a idade.' },
      { letter: 'B', score: 1, text: 'Alguma dificuldade ou irregularidade no controle dos esfíncteres.' },
      { letter: 'C', score: 2, text: 'Dificuldades significativas no controle dos esfíncteres.' },
    ],
  },
  exploracao_objetos: {
    question: '11. Durante a exploração de objetos, a criança apresenta comportamentos peculiares ou repetitivos?',
    options: [
      { letter: 'A', score: 0, text: 'Explora objetos de forma típica e variada.' },
      { letter: 'B', score: 1, text: 'Demonstrou alguns comportamentos peculiares ao explorar objetos.' },
      { letter: 'C', score: 2, text: 'Exibe comportamentos muito peculiares ou repetitivos ao explorar objetos.' },
    ],
  },
  uso_inapropriado_objetos: {
    question: '12. A criança utiliza objetos de maneiras não convencionais ou inapropriadas?',
    options: [
      { letter: 'A', score: 0, text: 'Uso típico e funcional dos objetos.' },
      { letter: 'B', score: 1, text: 'Demonstrou algumas formas de uso inapropriado de objetos.' },
      { letter: 'C', score: 2, text: 'Uso consistente e significativamente inapropriado dos objetos.' },
    ],
  },
  atencao: {
    question: '13. A criança mantém foco e atenção em atividades específicas?',
    options: [
      { letter: 'A', score: 0, text: 'Mantém atenção adequada e flexível.' },
      { letter: 'B', score: 1, text: 'Demonstrou dificuldades em manter atenção em atividades.' },
      { letter: 'C', score: 2, text: 'Atenção muito limitada ou seletiva em atividades.' },
    ],
  },
  ausencia_interesse: {
    question: '14. Mostra falta de interesse ou motivação para aprender ou participar de atividades educativas?',
    options: [
      { letter: 'A', score: 0, text: 'Demonstrou interesse e motivação adequados para aprender.' },
      { letter: 'B', score: 1, text: 'Demonstrou falta ocasional de interesse em atividades educativas.' },
      { letter: 'C', score: 2, text: 'Ausência significativa de interesse ou motivação para aprender.' },
    ],
  },
  falta_iniciativa: {
    question: '15. A criança demonstra iniciativa para iniciar interações ou atividades?',
    options: [
      { letter: 'A', score: 0, text: 'Demonstrou iniciativa adequada para iniciar interações ou atividades.' },
      { letter: 'B', score: 1, text: 'Demonstrou falta ocasional de iniciativa em iniciar interações ou atividades.' },
      { letter: 'C', score: 2, text: 'Ausência significativa de iniciativa em iniciar interações ou atividades.' },
    ],
  },
  alteracao_linguagem: {
    question: '16. A criança apresenta atraso ou alterações na linguagem verbal?',
    options: [
      { letter: 'A', score: 0, text: 'Desenvolvimento típico da linguagem verbal.' },
      { letter: 'B', score: 1, text: 'Atraso leve ou algumas alterações na linguagem verbal.' },
      { letter: 'C', score: 2, text: 'Atraso significativo ou alterações marcantes na linguagem verbal.' },
    ],
  },
  nao_manifesta_habilidades: {
    question: '17. Demonstrou ausência de habilidades ou conhecimentos esperados para idade?',
    options: [
      { letter: 'A', score: 0, text: 'Manifestou habilidades e conhecimentos adequados para idade.' },
      { letter: 'B', score: 1, text: 'Algumas ausências ou deficiências em habilidades e conhecimentos esperados.' },
      { letter: 'C', score: 2, text: 'Ausência significativa ou marcante de habilidades e conhecimentos esperados.' },
    ],
  },
  reacoes_frustracao: {
    question: '18. Como a criança reage quando enfrenta frustrações ou contratempos?',
    options: [
      { letter: 'A', score: 0, text: 'Reações adequadas e proporcionais diante de frustrações.' },
      { letter: 'B', score: 1, text: 'Algumas reações desproporcionais ou inadequadas diante de frustrações.' },
      { letter: 'C', score: 2, text: 'Reações intensas e inapropriadas diante de frustrações.' },
    ],
  },
  responsabilidades: {
    question: '19. A criança demonstra responsabilidade ou autonomia em atividades diárias?',
    options: [
      { letter: 'A', score: 0, text: 'Demonstrou responsabilidade adequada em atividades diárias.' },
      { letter: 'B', score: 1, text: 'Alguma dificuldade ou dependência em atividades diárias.' },
      { letter: 'C', score: 2, text: 'Ausência significativa de responsabilidade ou autonomia em atividades diárias.' },
    ],
  },
  hiperatividade: {
    question: '20. A criança apresenta níveis de atividade fora do comum (muito ativa ou pouco ativa)?',
    options: [
      { letter: 'A', score: 0, text: 'Níveis típicos de atividade para a idade.' },
      { letter: 'B', score: 1, text: 'Demonstrou níveis moderadamente alterados de atividade.' },
      { letter: 'C', score: 2, text: 'Níveis significativamente alterados de atividade (hiperatividade ou hipoatividade).' },
    ],
  },
  movimentos_estereotipados: {
    question: '21. A criança exibe comportamentos motores estereotipados ou repetitivos (por exemplo, balançar as mãos, bater os pés)?',
    options: [
      { letter: 'A', score: 0, text: 'Ausência de comportamentos motores estereotipados ou repetitivos.' },
      { letter: 'B', score: 1, text: 'Demonstrou alguns comportamentos motores estereotipados ou repetitivos.' },
      { letter: 'C', score: 2, text: 'Exibe comportamentos motores estereotipados ou repetitivos de forma pronunciada.' },
    ],
  },
  ignora_perigo: {
    question: '22. A criança demonstra consciência do perigo em situações cotidianas?',
    options: [
      { letter: 'A', score: 0, text: 'Demonstra consciência apropriada do perigo em situações cotidianas.' },
      { letter: 'B', score: 1, text: 'Alguma falta de consciência ou avaliação inadequada do perigo.' },
      { letter: 'C', score: 2, text: 'Ignora consistentemente o perigo em situações cotidianas.' },
    ],
  },
  sintomas_36_meses: {
    question: '23. Houve relato ou observação de sintomas característicos do TEA antes dos 36 meses de idade?',
    options: [
      { letter: 'A', score: 0, text: 'Não há relato ou observação de sintomas antes dos 36 meses.' },
      { letter: 'B', score: 1, text: 'Alguns relatos ou observações sugestivos de sintomas antes dos 36 meses.' },
      { letter: 'C', score: 2, text: 'Sintomas claramente identificáveis antes dos 36 meses de idade.' },
    ],
  },
};

// ═══════════════════════════════════════════
// FUNÇÕES DE CÁLCULO
// ═══════════════════════════════════════════

/**
 * Calcula scores da versão COMPLETA
 * responses = { '1_1': true/false, '1_2': true/false, ... }
 * Cada Sim = 1 ponto por seção (soma dos sub-itens marcados Sim)
 */
export function calculateAtaCompleteScores(responses) {
  const sectionScores = {};
  let totalScore = 0;

  for (const section of ATA_SECTIONS) {
    const sectionData = ATA_COMPLETE_ITEMS[section.id];
    if (!sectionData) continue;

    let sectionTotal = 0;
    const itemCount = sectionData.items.length;
    let answered = 0;

    for (const item of sectionData.items) {
      if (responses[item.id] !== undefined) {
        answered++;
        if (responses[item.id] === true) {
          sectionTotal++;
        }
      }
    }

    sectionScores[section.id] = {
      score: sectionTotal,
      maxPossible: itemCount,
      answered,
      percent: itemCount > 0 ? Math.round((sectionTotal / itemCount) * 100) : 0,
    };
    totalScore += sectionTotal;
  }

  return {
    sectionScores,
    totalScore,
    maxPossible: 46, // referência da resumida, mas completa pode ir mais alto
    risk: totalScore >= 15 ? 'risco' : 'sem_risco',
    riskLabel: totalScore >= 15 ? 'Risco para TEA' : 'Sem Risco para o TEA',
  };
}

/**
 * Calcula scores da versão RESUMIDA
 * responses = { 'interacao_social': 'A'|'B'|'C', ... }
 */
export function calculateAtaSummaryScores(responses) {
  const sectionScores = {};
  let totalScore = 0;

  for (const section of ATA_SECTIONS) {
    const sectionData = ATA_SUMMARY_ITEMS[section.id];
    if (!sectionData) continue;

    const selected = responses[section.id];
    const option = selected ? sectionData.options.find(o => o.letter === selected) : null;
    const score = option ? option.score : 0;

    sectionScores[section.id] = {
      score,
      letter: selected || null,
      answered: !!selected,
    };
    totalScore += score;
  }

  return {
    sectionScores,
    totalScore,
    maxPossible: 46,
    risk: totalScore >= 15 ? 'risco' : 'sem_risco',
    riskLabel: totalScore >= 15 ? 'Risco para TEA' : 'Sem Risco para o TEA',
  };
}

/**
 * Classificação de risco
 */
export function getAtaRiskLevel(totalScore) {
  if (totalScore >= 15) return { level: 'risco', label: 'Risco para TEA', color: '#ef4444' };
  return { level: 'sem_risco', label: 'Sem Risco para o TEA', color: '#22c55e' };
}
