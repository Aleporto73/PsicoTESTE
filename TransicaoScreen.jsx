import React, { useState, useMemo } from 'react';

/*
  VB-MAPP ANÁLISE DE TRANSIÇÃO - 18 ITENS OFICIAIS
  
  Estrutura:
  - 3 Categorias principais
  - Itens 1-5 de cada categoria: AUTOMÁTICOS (calculados dos Milestones/Barreiras)
  - Item 6 em diante: MANUAIS (preenchidos pelo avaliador)
  
  IMPORTANTE: Itens 1-6 são extremamente relevantes para decisão de transição
*/

const TRANSICAO_ESTRUTURA = {
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
            '1. Reforçadores são principalmente comestíveis, líquidos e contato físico (motivadores não aprendidos)',
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

/* COMPONENTE: TELA 4 — Análise de Transição (18 itens oficiais VB-MAPP) */
export default function TransicaoScreen({ sessionInfo, milestonesData, barreirasData, onFinalize, onBack, isReadOnly }) {

  // Estado para itens manuais
  const [avaliacoes, setAvaliacoes] = useState(() => {
    if (sessionInfo?.transicao) {
      return sessionInfo.transicao.itens_manuais || {};
    }
    return {};
  });

  // Calcular valores automáticos baseados em Milestones e Barreiras
  const valoresAutomaticos = useMemo(() => {
    const scores = milestonesData?.scores_snapshot || sessionInfo?.scores_snapshot || {};
    const barreiras = barreirasData?.barreiras || sessionInfo?.barreiras || [];

    // Contar milestones dominados
    let totalDominados = 0;
    let totalMilestones = 0;
    let pontosRotina = 0;
    let pontosSocial = 0;
    let pontosBrincar = 0;

    Object.entries(scores).forEach(([blockId, status]) => {
      totalMilestones++;
      if (status === 'dominado') {
        totalDominados++;

        // Verificar domínio específico pelo block_id
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

    // Calcular escore de barreiras
    let escoreBarreirasTotal = 0;
    let escoreBarreiras1_2 = 0;

    barreiras.forEach(b => {
      const pont = b.pontuacao || 0;
      escoreBarreirasTotal += pont;

      // Barreiras 1 e 2 (Comportamento negativo e Controle instrucional)
      if (b.categoria_id === 'bar_01' || b.categoria_id === 'bar_02') {
        escoreBarreiras1_2 += pont;
      }
    });

    // Converter para escala de 0-5 para os itens automáticos
    // Item 1: Milestones (percentual convertido para 1-5)
    const percentDominados = totalMilestones > 0 ? (totalDominados / totalMilestones) * 100 : 0;
    const item1Score = Math.min(5, Math.max(0, Math.round(percentDominados / 20)));

    // Item 2: Barreiras (invertido - menor escore de barreiras = maior pontuação)
    // Escore máximo de barreiras = 96, então invertemos
    const item2Score = Math.min(5, Math.max(0, Math.round((96 - escoreBarreirasTotal) / 19)));

    // Item 3: Barreiras 1 e 2 (invertido)
    // Máximo = 8, então invertemos
    const item3Score = Math.min(5, Math.max(0, Math.round((8 - escoreBarreiras1_2) / 1.6)));

    // Item 4: Rotinas de Classe (máximo 10 pontos no VB-MAPP)
    const item4Score = Math.min(5, Math.max(0, Math.round(pontosRotina / 2)));

    // Item 5: Comportamento Social (máximo 15 pontos no VB-MAPP)
    const item5Score = Math.min(5, Math.max(0, Math.round(pontosSocial / 3)));

    return {
      item_1: item1Score,
      item_2: item2Score,
      item_3: item3Score,
      item_4: item4Score,
      item_5: item5Score,
      // Dados brutos para exibição
      raw: {
        totalDominados,
        totalMilestones,
        percentDominados: percentDominados.toFixed(1),
        escoreBarreirasTotal,
        escoreBarreiras1_2,
        pontosRotina,
        pontosSocial,
        pontosBrincar
      }
    };
  }, [milestonesData, barreirasData, sessionInfo]);

  // Calcular escores por categoria e total
  const escores = useMemo(() => {
    const categorias = {};
    let totalGeral = 0;

    TRANSICAO_ESTRUTURA.categorias.forEach(cat => {
      let escoreCat = 0;
      let automaticosCat = 0;
      let manuaisCat = 0;

      cat.itens.forEach(item => {
        if (item.tipo === 'automatico') {
          const valor = valoresAutomaticos[item.id] || 0;
          escoreCat += valor;
          automaticosCat += valor;
        } else {
          const valor = avaliacoes[item.id]?.pontuacao || 0;
          escoreCat += valor;
          manuaisCat += valor;
        }
      });

      categorias[cat.id] = {
        total: escoreCat,
        automaticos: automaticosCat,
        manuais: manuaisCat
      };
      totalGeral += escoreCat;
    });

    return { categorias, totalGeral };
  }, [avaliacoes, valoresAutomaticos]);

  // Verificar se todos os itens manuais foram preenchidos
  const itensManuais = TRANSICAO_ESTRUTURA.categorias.flatMap(c =>
    c.itens.filter(i => i.tipo === 'manual')
  );

  const manuaisPreenchidos = itensManuais.filter(item =>
    avaliacoes[item.id]?.pontuacao !== undefined && avaliacoes[item.id]?.pontuacao !== null
  ).length;

  const canFinalize = manuaisPreenchidos === itensManuais.length;

  const setAvaliacao = (itemId, field, value) => {
    if (isReadOnly) return;
    setAvaliacoes(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleFinalize = () => {
    if (!canFinalize) {
      alert(`Preencha todos os ${itensManuais.length} itens manuais. Faltam ${itensManuais.length - manuaisPreenchidos}.`);
      return;
    }

    const transicaoData = {
      session_id: sessionInfo.session_id,
      child_name: sessionInfo.child_name,
      date_transicao: new Date().toISOString(),
      transicao_completa: true,
      valores_automaticos: valoresAutomaticos,
      itens_manuais: avaliacoes,
      escores_por_categoria: escores.categorias,
      escore_total_transicao: escores.totalGeral,
      schema_version: 'vbmapp_transicao_v2'
    };

    onFinalize(transicaoData);
  };

  return (
    <div className="transicao-screen">
      <style>{getTransicaoStyles()}</style>

      {/* HEADER */}
      <header className="transicao-header">
        <div className="header-content">
          <h1>TELA 4 — Análise de Transição</h1>
          <p>VB-MAPP Transition Assessment (18 itens)</p>
          <div className="session-info">
            <strong>{sessionInfo.child_name}</strong> • {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        {onBack && (
          <button className="btn-back" onClick={onBack}>← Voltar</button>
        )}
      </header>

      {/* RESUMO DOS DADOS */}
      <section className="dados-resumo">
        <h2>📊 Dados Consolidados (Base para Cálculos Automáticos)</h2>
        <div className="dados-grid">
          <div className="dado-card">
            <span className="dado-valor">{valoresAutomaticos.raw.percentDominados}%</span>
            <span className="dado-label">Milestones Dominados</span>
            <span className="dado-detalhe">{valoresAutomaticos.raw.totalDominados} de {valoresAutomaticos.raw.totalMilestones}</span>
          </div>
          <div className="dado-card">
            <span className="dado-valor">{valoresAutomaticos.raw.escoreBarreirasTotal}</span>
            <span className="dado-label">Escore Barreiras</span>
            <span className="dado-detalhe">máx: 96 (menor = melhor)</span>
          </div>
          <div className="dado-card">
            <span className="dado-valor">{valoresAutomaticos.raw.escoreBarreiras1_2}</span>
            <span className="dado-label">Barreiras 1+2</span>
            <span className="dado-detalhe">Comp. Negativo + Controle</span>
          </div>
          <div className="dado-card">
            <span className="dado-valor">{valoresAutomaticos.raw.pontosSocial}</span>
            <span className="dado-label">Social</span>
            <span className="dado-detalhe">Pontos dominados</span>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <div className="categorias-container">
        {TRANSICAO_ESTRUTURA.categorias.map(categoria => {
          const escoreCat = escores.categorias[categoria.id];

          return (
            <section key={categoria.id} className="categoria-section">
              <div className="categoria-header">
                <div className="categoria-numero">Categoria {categoria.numero}</div>
                <h3>{categoria.nome}</h3>
                <div className="categoria-escore">
                  <span className="escore-total">{escoreCat.total}</span>
                  <span className="escore-detalhe">
                    (Auto: {escoreCat.automaticos} + Manual: {escoreCat.manuais})
                  </span>
                </div>
              </div>

              <div className="itens-list">
                {categoria.itens.map(item => {
                  const isAuto = item.tipo === 'automatico';
                  const valorAuto = valoresAutomaticos[item.id];
                  const valorManual = avaliacoes[item.id]?.pontuacao;
                  const valor = isAuto ? valorAuto : valorManual;

                  return (
                    <div key={item.id} className={`item-card ${isAuto ? 'automatico' : 'manual'}`}>
                      <div className="item-header">
                        <span className="item-numero">{item.numero}</span>
                        <span className="item-nome">{item.nome}</span>
                        <span className={`item-tipo-badge ${isAuto ? 'auto' : 'manual'}`}>
                          {isAuto ? '⚡ Auto' : '✏️ Manual'}
                        </span>
                      </div>

                      {isAuto ? (
                        <div className="item-automatico">
                          <div className="auto-valor">
                            <span className="valor-numero">{valor || 0}</span>
                            <span className="valor-label">pontos</span>
                          </div>
                          <p className="auto-descricao">{item.descricao}</p>
                        </div>
                      ) : (
                        <div className="item-manual">
                          <div className="niveis-grid">
                            {item.niveis.map((nivel, idx) => {
                              const pontos = idx + 1;
                              const isSelected = valorManual === pontos;

                              return (
                                <label
                                  key={idx}
                                  className={`nivel-option ${isSelected ? 'selected' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={`item_${item.id}`}
                                    value={pontos}
                                    checked={isSelected}
                                    onChange={() => setAvaliacao(item.id, 'pontuacao', pontos)}
                                    disabled={isReadOnly}
                                  />
                                  <span className="nivel-numero">{pontos}</span>
                                  <span className="nivel-texto">{nivel}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* FOOTER */}
      <footer className="action-footer">
        <div className="footer-info">
          <div className="escore-display">
            <span className="escore-label">Escore Total:</span>
            <span className="escore-value">{escores.totalGeral}</span>
          </div>
          <div className="progresso-manual">
            {manuaisPreenchidos} / {itensManuais.length} itens manuais
          </div>
        </div>
        {!isReadOnly && (
          <button
            className={`btn-finalize ${canFinalize ? 'enabled' : 'disabled'}`}
            onClick={handleFinalize}
            disabled={!canFinalize}
          >
            {canFinalize ? '✓ Finalizar Transição' : `Faltam ${itensManuais.length - manuaisPreenchidos} itens`}
          </button>
        )}
      </footer>
    </div>
  );
}

function getTransicaoStyles() {
  return `
    .transicao-screen {
      background: #f0fdf4;
      min-height: 100vh;
      padding-bottom: 100px;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .transicao-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 25px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .header-content h1 { font-size: 22px; margin: 0; font-weight: 800; }
    .header-content p { opacity: 0.8; font-size: 13px; margin: 4px 0 0 0; }
    .session-info { 
      background: rgba(255,255,255,0.15); 
      padding: 4px 12px; 
      border-radius: 6px; 
      font-size: 12px; 
      margin-top: 8px;
      display: inline-block;
    }

    .btn-back {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .dados-resumo {
      background: white;
      margin: 20px 5%;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .dados-resumo h2 {
      font-size: 14px;
      color: #059669;
      margin: 0 0 15px 0;
      font-weight: 700;
    }

    .dados-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .dado-card {
      background: #ecfdf5;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
    }

    .dado-valor { display: block; font-size: 24px; font-weight: 800; color: #059669; }
    .dado-label { display: block; font-size: 11px; color: #047857; font-weight: 600; margin-top: 4px; }
    .dado-detalhe { display: block; font-size: 10px; color: #6b7280; margin-top: 2px; }

    .categorias-container {
      padding: 0 5%;
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .categoria-section {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .categoria-header {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      padding: 15px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    .categoria-numero {
      background: #059669;
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }

    .categoria-header h3 {
      flex: 1;
      font-size: 14px;
      font-weight: 700;
      color: #047857;
      margin: 0;
      min-width: 200px;
    }

    .categoria-escore {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .escore-total {
      font-size: 24px;
      font-weight: 800;
      color: #059669;
    }

    .escore-detalhe {
      font-size: 11px;
      color: #6b7280;
    }

    .itens-list {
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-card {
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }

    .item-card.automatico { border-color: #a7f3d0; background: #f0fdf4; }
    .item-card.manual { border-color: #fde68a; background: #fffbeb; }

    .item-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      background: rgba(255,255,255,0.5);
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .item-numero {
      background: #059669;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .item-nome {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
    }

    .item-tipo-badge {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .item-tipo-badge.auto { background: #d1fae5; color: #047857; }
    .item-tipo-badge.manual { background: #fef3c7; color: #92400e; }

    .item-automatico {
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .auto-valor {
      background: white;
      padding: 10px 15px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #10b981;
    }

    .valor-numero { display: block; font-size: 24px; font-weight: 800; color: #059669; }
    .valor-label { display: block; font-size: 10px; color: #6b7280; }

    .auto-descricao {
      flex: 1;
      font-size: 12px;
      color: #6b7280;
      margin: 0;
      line-height: 1.4;
    }

    .item-manual {
      padding: 15px;
    }

    .niveis-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nivel-option {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }

    .nivel-option:hover { border-color: #10b981; background: #f0fdf4; }
    .nivel-option.selected { border-color: #10b981; background: #d1fae5; }

    .nivel-option input { display: none; }

    .nivel-numero {
      background: #e5e7eb;
      color: #374151;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .nivel-option.selected .nivel-numero {
      background: #10b981;
      color: white;
    }

    .nivel-texto {
      font-size: 12px;
      color: #374151;
      line-height: 1.4;
    }

    .action-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 15px 5%;
      border-top: 2px solid #d1fae5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
      z-index: 1000;
      flex-wrap: wrap;
      gap: 10px;
    }

    .footer-info {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .escore-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .escore-label { font-size: 14px; color: #6b7280; font-weight: 600; }
    .escore-value { font-size: 24px; font-weight: 800; color: #059669; }

    .progresso-manual {
      font-size: 12px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 4px 10px;
      border-radius: 4px;
    }

    .btn-finalize {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-finalize:hover:not(:disabled) { background: #059669; }
    .btn-finalize.disabled { background: #d1d5db; cursor: not-allowed; }

    @media (max-width: 600px) {
      .transicao-header { flex-direction: column; text-align: center; }
      .categoria-header { flex-direction: column; text-align: center; }
      .item-automatico { flex-direction: column; text-align: center; }
      .action-footer { flex-direction: column; }
    }
  `;
}