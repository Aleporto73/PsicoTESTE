import React, { useState, useMemo } from 'react';
import { downloadPDF } from './PDFReport';

/*
  🧒 PAINEL DA CRIANÇA
  
  Requer no HTML:
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
*/

const NOMES_DOMINIOS = {
  'DOM01': 'Mando', 'DOM02': 'Tato', 'DOM03': 'Ouvinte', 'DOM04': 'VP/MTS',
  'DOM05': 'Brincar', 'DOM06': 'Social', 'DOM07': 'Imitação', 'DOM08': 'Ecoico',
  'DOM09': 'Vocal', 'DOM10': 'LRFFC', 'DOM11': 'Intraverbal'
};

export default function PainelCrianca({ crianca, sessaoAtual, historicoSessoes = [], onVoltar }) {
  const [abaAtiva, setAbaAtiva] = useState('atual');

  const dadosProcessados = useMemo(() => {
    const scores = sessaoAtual?.scores_snapshot || {};
    const barreiras = sessaoAtual?.barreiras || [];
    const totalMilestones = Object.keys(scores).length || 154;
    const dominados = Object.values(scores).filter(s => s === 'dominado').length;
    const emergentes = Object.values(scores).filter(s => s === 'emergente').length;

    const dominios = {};
    Object.entries(scores).forEach(([blockId, status]) => {
      const match = blockId.match(/^(DOM\d+)/);
      if (match) {
        const domCode = match[1];
        if (!dominios[domCode]) dominios[domCode] = { total: 0, dominados: 0, emergentes: 0 };
        dominios[domCode].total++;
        if (status === 'dominado') dominios[domCode].dominados++;
        if (status === 'emergente') dominios[domCode].emergentes++;
      }
    });

    return {
      totalMilestones, dominados, emergentes,
      naoObservados: totalMilestones - dominados - emergentes,
      percentDominado: ((dominados / totalMilestones) * 100).toFixed(1),
      dominios,
      barreirasCriticas: barreiras.filter(b => b.pontuacao >= 3).sort((a, b) => b.pontuacao - a.pontuacao),
      milestonesEmergentes: Object.entries(scores).filter(([, s]) => s === 'emergente').map(([b]) => b)
    };
  }, [sessaoAtual]);

  const dadosRadar = useMemo(() => {
    return Object.entries(dadosProcessados.dominios)
      .filter(([c]) => NOMES_DOMINIOS[c])
      .map(([c, d]) => ({
        dominio: NOMES_DOMINIOS[c],
        percentual: d.total > 0 ? Math.round((d.dominados / d.total) * 100) : 0
      }))
      .sort((a, b) => a.dominio.localeCompare(b.dominio));
  }, [dadosProcessados]);

  const dadosLongitudinais = useMemo(() => {
    const todas = [...historicoSessoes];
    if (sessaoAtual && !todas.find(s => s.session_id === sessaoAtual.session_id)) todas.push(sessaoAtual);
    return todas.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).slice(-4).map((s, i) => {
      const sc = s.scores_snapshot || {};
      return {
        avaliacao: `AV${i + 1}`,
        data: new Date(s.created_at).toLocaleDateString('pt-BR'),
        dominados: Object.values(sc).filter(x => x === 'dominado').length,
        total: Object.keys(sc).length || 154
      };
    });
  }, [historicoSessoes, sessaoAtual]);

  const insightsIA = useMemo(() => {
    const ins = [];
    const fortes = dadosRadar.filter(d => d.percentual >= 60);
    if (fortes.length > 0) ins.push({ tipo: 'forca', texto: `Força em ${fortes.map(d => d.dominio).join(', ')} (${fortes[0].percentual}%)` });
    const fracos = dadosRadar.filter(d => d.percentual < 30 && d.percentual > 0);
    if (fracos.length > 0) ins.push({ tipo: 'deficit', texto: `Déficit em ${fracos.slice(0, 3).map(d => d.dominio).join(', ')}` });
    if (dadosProcessados.barreirasCriticas.length > 0) ins.push({ tipo: 'barreira', texto: `Barreira: "${dadosProcessados.barreirasCriticas[0].categoria}" (nível ${dadosProcessados.barreirasCriticas[0].pontuacao})` });
    if (dadosProcessados.emergentes > 0) ins.push({ tipo: 'oportunidade', texto: `${dadosProcessados.emergentes} emergentes - oportunidade!` });
    return ins;
  }, [dadosRadar, dadosProcessados]);

  const GraficoBarras = () => (
    <div className="grafico-barras">
      {dadosRadar.map((item, idx) => (
        <div key={idx} className="barra-item">
          <div className="barra-label">{item.dominio}</div>
          <div className="barra-container">
            <div className="barra-preenchida" style={{
              width: `${item.percentual}%`,
              background: item.percentual >= 60 ? 'linear-gradient(90deg, #10b981, #34d399)' :
                item.percentual >= 30 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                  'linear-gradient(90deg, #ef4444, #f87171)'
            }} />
          </div>
          <div className="barra-valor">{item.percentual}%</div>
        </div>
      ))}
    </div>
  );

  const GraficoEvolucao = () => {
    const max = Math.max(...dadosLongitudinais.map(d => d.dominados), 1);
    return (
      <div className="grafico-evolucao">
        <div className="grafico-linha-container">
          {dadosLongitudinais.map((item, idx) => (
            <div key={idx} className="ponto-container">
              <div className="linha-vertical" style={{ height: `${(item.dominados / max) * 100}%` }}>
                <div className="ponto"><span className="ponto-valor">{item.dominados}</span></div>
              </div>
              <div className="ponto-label">{item.avaliacao}</div>
              <div className="ponto-data">{item.data}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CardPrioridade = ({ tipo, titulo, itens }) => (
    <div className={`card-prioridade ${tipo}`}>
      <h4>{titulo}</h4>
      <ul>{itens.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
    </div>
  );

  return (
    <div className="painel-crianca">
      <style>{getStyles()}</style>

      <header className="header">
        <div className="header-info">
          <div className="avatar">🧒</div>
          <div className="info-texto">
            <h1>{crianca?.nome || sessaoAtual?.child_name || 'Criança'}</h1>
            <p>{crianca?.idade || ''} • Última avaliação: {new Date(sessaoAtual?.created_at || Date.now()).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        {onVoltar && <button className="btn-voltar" onClick={onVoltar}>← Voltar</button>}
      </header>

      <nav className="abas">
        {[['atual', '📊', 'Visão Atual'], ['evolucao', '📈', 'Evolução'], ['plano', '🎯', 'Plano de Ação']].map(([id, icon, txt]) => (
          <button key={id} className={`aba ${abaAtiva === id ? 'ativa' : ''}`} onClick={() => setAbaAtiva(id)}>
            <span className="aba-icon">{icon}</span><span className="aba-texto">{txt}</span>
          </button>
        ))}
      </nav>

      <main className="conteudo">
        {abaAtiva === 'atual' && (
          <div className="aba-conteudo">
            <section className="secao">
              <div className="stat-cards">
                <div className="stat-card verde"><span className="stat-numero">{dadosProcessados.percentDominado}%</span><span className="stat-label">Dominados</span><span className="stat-detalhe">{dadosProcessados.dominados}/{dadosProcessados.totalMilestones}</span></div>
                <div className="stat-card amarelo"><span className="stat-numero">{dadosProcessados.emergentes}</span><span className="stat-label">Emergentes</span></div>
                <div className="stat-card cinza"><span className="stat-numero">{dadosProcessados.naoObservados}</span><span className="stat-label">Não Obs.</span></div>
                <div className="stat-card vermelho"><span className="stat-numero">{dadosProcessados.barreirasCriticas.length}</span><span className="stat-label">Barreiras</span></div>
              </div>
            </section>
            <section className="secao"><h3>📊 Desempenho por Domínio</h3><GraficoBarras /></section>
            {dadosProcessados.barreirasCriticas.length > 0 && (
              <section className="secao"><h3>🔴 Prioridades</h3>
                <div className="prioridades-lista">
                  {dadosProcessados.barreirasCriticas.slice(0, 3).map((b, i) => (
                    <div key={i} className={`prioridade-item nivel-${b.pontuacao}`}>
                      <span className="prioridade-numero">{i + 1}</span>
                      <span className="prioridade-texto">{b.categoria}</span>
                      <span className="prioridade-nivel">Nível {b.pontuacao}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="secao"><h3>💡 Análise</h3>
              <div className="insights-lista">
                {insightsIA.map((ins, i) => (
                  <div key={i} className={`insight-card ${ins.tipo}`}>
                    <span className="insight-icon">{ins.tipo === 'forca' ? '💪' : ins.tipo === 'deficit' ? '⚠️' : ins.tipo === 'barreira' ? '🚧' : '✨'}</span>
                    <p>{ins.texto}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {abaAtiva === 'evolucao' && (
          <div className="aba-conteudo">
            <section className="secao"><h3>📈 Evolução</h3>
              {dadosLongitudinais.length > 1 ? (
                <>
                  <GraficoEvolucao />
                  <div className="tabela-comparativa">
                    <table>
                      <thead><tr><th>AV</th><th>Data</th><th>Dom.</th><th>%</th></tr></thead>
                      <tbody>{dadosLongitudinais.map((it, i) => <tr key={i}><td><strong>{it.avaliacao}</strong></td><td>{it.data}</td><td>{it.dominados}</td><td>{((it.dominados / it.total) * 100).toFixed(1)}%</td></tr>)}</tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="sem-historico"><span className="sem-historico-icon">📅</span><p>Primeira avaliação. Comparativo disponível após próxima.</p></div>
              )}
            </section>
          </div>
        )}

        {abaAtiva === 'plano' && (
          <div className="aba-conteudo">
            <section className="secao"><h3>🎯 Metas</h3>
              <div className="metas-container">
                {dadosProcessados.barreirasCriticas.length > 0 && <CardPrioridade tipo="urgente" titulo="🔴 URGENTE - Barreiras" itens={dadosProcessados.barreirasCriticas.slice(0, 3).map(b => b.categoria)} />}
                {dadosProcessados.emergentes > 0 && <CardPrioridade tipo="proximo" titulo="🟡 PRÓXIMO - Emergentes" itens={dadosProcessados.milestonesEmergentes.slice(0, 5).map(m => { const mt = m.match(/DOM(\d+).*M(\d+)/); return mt ? `${NOMES_DOMINIOS['DOM' + mt[1]] || 'Dom'} ${mt[2]}-M` : m; })} />}
                <CardPrioridade tipo="manter" titulo="🟢 MANTER" itens={['Treino de manutenção', 'Generalizar', 'Celebrar! 🎉']} />
              </div>
            </section>

            <section className="secao documentos"><h3>📄 Gerar Documentos</h3>
              <div className="documentos-grid">
                <button className="documento-card" onClick={() => downloadPDF('tecnico', crianca, sessaoAtual)}>
                  <span className="doc-icon">📋</span>
                  <span className="doc-titulo">Relatório Técnico</span>
                  <span className="doc-desc">Completo, para profissionais. Inclui gráficos e análise detalhada.</span>
                </button>
                <button className="documento-card destaque" onClick={() => downloadPDF('pei', crianca, sessaoAtual)}>
                  <span className="doc-icon">📝</span>
                  <span className="doc-titulo">PEI Completo</span>
                  <span className="doc-desc">Plano com metas SMART, procedimentos e cronograma.</span>
                </button>
                <button className="documento-card" onClick={() => downloadPDF('familia', crianca, sessaoAtual)}>
                  <span className="doc-icon">👨‍👩‍👧</span>
                  <span className="doc-titulo">Resumo Família</span>
                  <span className="doc-desc">Linguagem acolhedora com dicas para casa.</span>
                </button>
              </div>
            </section>

            <section className="secao"><h3>🏠 Dicas para Casa</h3>
              <div className="dicas-lista">
                {['Crie oportunidades de comunicação nas rotinas', 'Celebre cada conquista!', 'Mantenha consistência'].map((d, i) => (
                  <div key={i} className="dica-item"><span className="dica-numero">{i + 1}</span><p>{d}</p></div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-info">VB-MAPP • {sessaoAtual?.session_id?.slice(0, 8) || 'Sessão'}</div>
        <div className="footer-acoes">
          <button className="btn-secundario" onClick={() => window.print()}>🖨️ Imprimir</button>
          <button className="btn-primario" onClick={() => downloadPDF('pei', crianca, sessaoAtual)}>📝 Gerar PEI</button>
        </div>
      </footer>
    </div>
  );
}

function getStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    .painel-crianca { font-family: 'Nunito', sans-serif; background: linear-gradient(135deg, #fef3c7, #fce7f3, #ddd6fe); min-height: 100vh; padding-bottom: 100px; }
    .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 25px 5%; display: flex; justify-content: space-between; align-items: center; }
    .header-info { display: flex; align-items: center; gap: 15px; }
    .avatar { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .info-texto h1 { font-size: 24px; font-weight: 800; margin: 0; }
    .info-texto p { opacity: 0.85; font-size: 13px; margin: 4px 0 0 0; }
    .btn-voltar { background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .abas { display: flex; justify-content: center; gap: 10px; padding: 20px 5%; background: white; }
    .aba { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border: none; background: #f3f4f6; border-radius: 12px; font-weight: 700; color: #6b7280; cursor: pointer; }
    .aba.ativa { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; }
    .conteudo { padding: 20px 5%; }
    .secao { background: white; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .secao h3 { font-size: 16px; font-weight: 800; margin: 0 0 15px 0; }
    .stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
    .stat-card { padding: 16px; border-radius: 12px; text-align: center; }
    .stat-card.verde { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
    .stat-card.amarelo { background: linear-gradient(135deg, #fef3c7, #fde68a); }
    .stat-card.cinza { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
    .stat-card.vermelho { background: linear-gradient(135deg, #fee2e2, #fecaca); }
    .stat-numero { display: block; font-size: 28px; font-weight: 800; }
    .stat-label { display: block; font-size: 12px; font-weight: 700; color: #4b5563; }
    .stat-detalhe { display: block; font-size: 10px; color: #9ca3af; }
    .grafico-barras { display: flex; flex-direction: column; gap: 10px; }
    .barra-item { display: flex; align-items: center; gap: 10px; }
    .barra-label { width: 80px; font-size: 11px; font-weight: 700; text-align: right; }
    .barra-container { flex: 1; height: 20px; background: #f3f4f6; border-radius: 10px; overflow: hidden; }
    .barra-preenchida { height: 100%; border-radius: 10px; }
    .barra-valor { width: 40px; font-size: 12px; font-weight: 800; }
    .prioridades-lista { display: flex; flex-direction: column; gap: 10px; }
    .prioridade-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fef2f2; border-radius: 10px; border-left: 4px solid #ef4444; }
    .prioridade-numero { width: 28px; height: 28px; background: #ef4444; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .prioridade-texto { flex: 1; font-weight: 600; }
    .prioridade-nivel { font-size: 11px; font-weight: 700; color: #ef4444; background: #fee2e2; padding: 4px 8px; border-radius: 6px; }
    .insights-lista { display: flex; flex-direction: column; gap: 10px; }
    .insight-card { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 12px; }
    .insight-card.forca { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .insight-card.deficit { background: #fefce8; border: 1px solid #fef08a; }
    .insight-card.barreira { background: #fef2f2; border: 1px solid #fecaca; }
    .insight-card.oportunidade { background: #faf5ff; border: 1px solid #e9d5ff; }
    .insight-icon { font-size: 24px; }
    .insight-card p { margin: 0; font-size: 14px; }
    .grafico-evolucao { padding: 20px 0; }
    .grafico-linha-container { display: flex; justify-content: space-around; align-items: flex-end; height: 200px; border-bottom: 2px solid #e5e7eb; }
    .ponto-container { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .linha-vertical { width: 4px; background: linear-gradient(to top, #7c3aed, #a855f7); border-radius: 4px; position: relative; min-height: 20px; }
    .ponto { width: 40px; height: 40px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: absolute; top: -20px; left: -18px; }
    .ponto-valor { color: white; font-weight: 800; font-size: 12px; }
    .ponto-label { font-weight: 800; color: #7c3aed; }
    .ponto-data { font-size: 10px; color: #9ca3af; }
    .tabela-comparativa { margin-top: 20px; overflow-x: auto; }
    .tabela-comparativa table { width: 100%; border-collapse: collapse; }
    .tabela-comparativa th, .tabela-comparativa td { padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; }
    .tabela-comparativa th { background: #f9fafb; font-weight: 700; }
    .sem-historico { text-align: center; padding: 40px; color: #6b7280; }
    .sem-historico-icon { font-size: 48px; display: block; margin-bottom: 15px; }
    .metas-container { display: flex; flex-direction: column; gap: 15px; }
    .card-prioridade { padding: 16px; border-radius: 12px; border-left: 4px solid; }
    .card-prioridade.urgente { background: #fef2f2; border-left-color: #ef4444; }
    .card-prioridade.proximo { background: #fffbeb; border-left-color: #f59e0b; }
    .card-prioridade.manter { background: #f0fdf4; border-left-color: #10b981; }
    .card-prioridade h4 { margin: 0 0 10px 0; font-size: 14px; font-weight: 800; }
    .card-prioridade ul { margin: 0; padding-left: 20px; }
    .card-prioridade li { font-size: 13px; color: #4b5563; margin-bottom: 6px; }
    .documentos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .documento-card { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .documento-card:hover { border-color: #7c3aed; transform: translateY(-3px); box-shadow: 0 8px 25px rgba(124, 58, 237, 0.2); }
    .documento-card.destaque { background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-color: #a855f7; }
    .doc-icon { font-size: 36px; display: block; margin-bottom: 12px; }
    .doc-titulo { display: block; font-weight: 800; font-size: 15px; margin-bottom: 8px; color: #1f2937; }
    .doc-desc { display: block; font-size: 11px; color: #6b7280; line-height: 1.4; }
    .dicas-lista { display: flex; flex-direction: column; gap: 12px; }
    .dica-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: #faf5ff; border-radius: 10px; }
    .dica-numero { width: 28px; height: 28px; background: #7c3aed; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
    .dica-item p { margin: 0; font-size: 13px; }
    .footer { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); }
    .footer-info { font-size: 12px; color: #9ca3af; }
    .footer-acoes { display: flex; gap: 10px; }
    .btn-secundario { background: #f3f4f6; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .btn-primario { background: linear-gradient(135deg, #7c3aed, #a855f7); border: none; padding: 10px 24px; border-radius: 10px; font-weight: 700; color: white; cursor: pointer; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); }
    .btn-primario:hover { transform: translateY(-2px); }
    @media (max-width: 600px) { .header { flex-direction: column; text-align: center; gap: 15px; } .aba-texto { display: none; } .stat-cards { grid-template-columns: repeat(2, 1fr); } .documentos-grid { grid-template-columns: 1fr; } .footer { flex-direction: column; gap: 10px; } }
    `;
}