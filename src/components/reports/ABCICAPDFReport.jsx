/*
  ABC/ICA PDF REPORT - Relatório profissional
  
  Uso:
  import { downloadABCICAPDF } from './ABCICAPDFReport';
  downloadABCICAPDF(crianca, scores, responses);
*/

import {
  ABC_ICA_ITEMS,
  ABC_ICA_SUBSCALES,
  ABC_ICA_CLASSIFICATION,
  ABC_ICA_META,
  getABCICASubscaleById,
} from '../../data/instruments/abc_ica';

// ==========================================
// CONSTANTES
// ==========================================

const CORES = {
  primaria: [225, 29, 72],      // rose-600
  secundaria: [190, 24, 93],    // rose-700
  verde: [16, 185, 129],
  verdeClaro: [209, 250, 229],
  amarelo: [245, 158, 11],
  amareloClaro: [254, 243, 199],
  laranja: [249, 115, 22],
  laranjaClaro: [255, 237, 213],
  vermelho: [239, 68, 68],
  vermelhoClaro: [254, 226, 226],
  cinza: [107, 114, 128],
  cinzaClaro: [243, 244, 246],
  preto: [31, 41, 55],
  branco: [255, 255, 255],
};

const SUB_COLORS = {
  es: [124, 58, 237],   // violet
  re: [37, 99, 235],    // blue
  co: [5, 150, 105],    // emerald
  lg: [217, 119, 6],    // amber
  ps: [219, 39, 119],   // pink
};

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function desenharBarraProgresso(doc, x, y, largura, altura, percentual, corBarra) {
  doc.setFillColor(...CORES.cinzaClaro);
  doc.roundedRect(x, y, largura, altura, 2, 2, 'F');
  if (percentual > 0) {
    const w = Math.min((largura * percentual) / 100, largura);
    doc.setFillColor(...corBarra);
    doc.roundedRect(x, y, w, altura, 2, 2, 'F');
  }
}

function getCorClassificacao(level) {
  switch (level) {
    case 'sem_sinais': return CORES.verde;
    case 'duvidoso': return CORES.amarelo;
    case 'probabilidade_moderada': return CORES.laranja;
    case 'autismo': return CORES.vermelho;
    default: return CORES.cinza;
  }
}

function getCorClassificacaoClara(level) {
  switch (level) {
    case 'sem_sinais': return CORES.verdeClaro;
    case 'duvidoso': return CORES.amareloClaro;
    case 'probabilidade_moderada': return CORES.laranjaClaro;
    case 'autismo': return CORES.vermelhoClaro;
    default: return CORES.cinzaClaro;
  }
}

function trunc(text, max) {
  return text.length > max ? text.substring(0, max - 1) + '...' : text;
}

// Mini radar pentagonal (5 subescalas)
function desenharMiniRadar(doc, cx, cy, raio, subscaleScores) {
  const n = ABC_ICA_SUBSCALES.length;
  if (n < 3) return;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  // Grid
  for (let level = 0.25; level <= 1; level += 0.25) {
    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(0.2);
    const r = raio * level;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      doc.line(pts[i].x, pts[i].y, pts[next].x, pts[next].y);
    }
  }

  // Axes
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    doc.setDrawColor(200, 200, 205);
    doc.setLineWidth(0.15);
    doc.line(cx, cy, cx + raio * Math.cos(angle), cy + raio * Math.sin(angle));
  }

  // Data polygon
  const dataPoints = [];
  for (let i = 0; i < n; i++) {
    const sub = ABC_ICA_SUBSCALES[i];
    const ss = subscaleScores[sub.id];
    const pct = ss ? (ss.percent || 0) / 100 : 0;
    const angle = startAngle + i * angleStep;
    const r = raio * Math.max(pct, 0.03);
    dataPoints.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }

  // Fill
  doc.setFillColor(...CORES.primaria);
  doc.setGState(new doc.GState({ opacity: 0.2 }));
  for (let i = 1; i < n - 1; i++) {
    doc.triangle(
      dataPoints[0].x, dataPoints[0].y,
      dataPoints[i].x, dataPoints[i].y,
      dataPoints[i + 1].x, dataPoints[i + 1].y,
      'F'
    );
  }
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Outline
  doc.setDrawColor(...CORES.primaria);
  doc.setLineWidth(0.6);
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    doc.line(dataPoints[i].x, dataPoints[i].y, dataPoints[next].x, dataPoints[next].y);
  }

  // Points
  for (let i = 0; i < n; i++) {
    const sub = ABC_ICA_SUBSCALES[i];
    doc.setFillColor(...(SUB_COLORS[sub.id] || CORES.cinza));
    doc.circle(dataPoints[i].x, dataPoints[i].y, 1.2, 'F');
  }

  // Labels
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const lx = cx + (raio + 8) * Math.cos(angle);
    const ly = cy + (raio + 8) * Math.sin(angle);
    const sub = ABC_ICA_SUBSCALES[i];
    const ss = subscaleScores[sub.id];
    const pct = ss ? ss.percent.toFixed(0) : '0';
    const cor = SUB_COLORS[sub.id] || CORES.cinza;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cor);

    const align = Math.cos(angle) < -0.1 ? 'right' : Math.cos(angle) > 0.1 ? 'left' : 'center';
    doc.text(`${sub.shortName} ${pct}%`, lx, ly + 1, { align });
  }
}

// ==========================================
// GERADOR DO RELATÓRIO
// ==========================================

function gerarRelatorioABCICA(crianca, scores, responses) {
  if (!window.jspdf) {
    throw new Error('Biblioteca jsPDF não carregada. Verifique a conexão com a internet.');
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 0;
  const ml = 15;
  const pw = 210;
  const cw = pw - ml * 2;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkSpace = (needed) => { if (y + needed > 275) addPage(); };

  const childName = crianca?.nome || crianca?.child_name || 'Não informado';
  const childAge = crianca?.idade || crianca?.child_age || 'Não informada';
  const classif = scores.classification;
  const corClassif = getCorClassificacao(classif.level);

  // ========== PÁGINA 1 - CAPA ==========
  doc.setFillColor(...CORES.primaria);
  doc.rect(0, 0, pw, 55, 'F');

  doc.setTextColor(...CORES.branco);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO ABC / ICA', pw / 2, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Autism Behavior Checklist / Inventário de Comportamentos Autísticos', pw / 2, 30, { align: 'center' });
  doc.text('Krug, Arick & Almond (1980) — Versão brasileira: Marteleto & Pedromônico (2005)', pw / 2, 38, { align: 'center' });

  doc.setFontSize(8);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, pw / 2, 48, { align: 'center' });

  y = 65;

  // Box identificação
  doc.setFillColor(...CORES.cinzaClaro);
  doc.roundedRect(ml, y, cw, 26, 3, 3, 'F');
  doc.setTextColor(...CORES.preto);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICAÇÃO', ml + 8, y + 9);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Criança: ${childName}`, ml + 8, y + 17);
  doc.text(`Idade: ${childAge}`, ml + 8, y + 23);
  doc.text(`Itens respondidos: ${scores.totalAnswered}/${scores.totalItems}`, ml + 105, y + 17);
  doc.text(`Instrumento: ABC/ICA (57 itens, 5 subescalas)`, ml + 105, y + 23);

  y += 34;

  // -- 3 Cards Resumo --
  const cardW = (cw - 10) / 3;
  const cards = [
    { valor: `${scores.totalScore}/${scores.maxPossible}`, label: 'Pontuação', sub: `${scores.totalPercent}%`, cor: CORES.primaria },
    { valor: `${scores.totalAnswered}/${scores.totalItems}`, label: 'Respondidos', sub: '', cor: [100, 116, 139] },
    { valor: classif.label.split(' ').slice(0, 2).join(' '), label: 'Classificação', sub: `Score ${scores.totalScore}`, cor: corClassif },
  ];

  cards.forEach((c, i) => {
    const cx = ml + (i * (cardW + 5));
    doc.setFillColor(...c.cor);
    doc.roundedRect(cx, y, cardW, 26, 3, 3, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(c.valor, cx + cardW / 2, y + 10, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(c.label, cx + cardW / 2, y + 18, { align: 'center' });
    if (c.sub) {
      doc.setFontSize(7);
      doc.text(c.sub, cx + cardW / 2, y + 23, { align: 'center' });
    }
  });

  y += 33;

  // -- Classificação Global --
  doc.setFillColor(...corClassif);
  doc.roundedRect(ml, y, cw, 14, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`CLASSIFICAÇÃO: ${classif.label.toUpperCase()} (Score: ${scores.totalScore})`, pw / 2, y + 9, { align: 'center' });
  y += 18;

  // -- Faixas de referência --
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CORES.preto);
  doc.text('Faixas de referência:', ml, y + 4);
  let fx = ml + 38;
  ABC_ICA_CLASSIFICATION.forEach(cl => {
    const cor = getCorClassificacao(cl.level);
    doc.setFillColor(...cor);
    doc.roundedRect(fx, y, 38, 6, 1.5, 1.5, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    const maxLabel = cl.max === 999 ? '+' : cl.max;
    doc.text(`${cl.min}-${maxLabel}`, fx + 2, y + 4.5);
    fx += 40;
  });
  y += 12;

  // -- Mini Radar (esquerda) + Subescalas (direita) --
  const radarCx = ml + 38;
  const radarCy = y + 30;
  const radarR = 24;

  try {
    desenharMiniRadar(doc, radarCx, radarCy, radarR, scores.subscaleScores);
  } catch (e) {
    doc.setFontSize(8);
    doc.setTextColor(...CORES.cinza);
    doc.text('(Radar indisponível)', radarCx - 12, radarCy);
  }

  // Subescalas (ao lado do radar)
  const subX = ml + 85;
  doc.setTextColor(...CORES.preto);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PONTUAÇÃO POR SUBESCALA', subX, y + 2);

  let sy = y + 9;
  ABC_ICA_SUBSCALES.forEach(sub => {
    const ss = scores.subscaleScores[sub.id];
    if (!ss) return;
    const cor = SUB_COLORS[sub.id] || CORES.cinza;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cor);
    doc.text(`${sub.shortName} - ${sub.name}`, subX, sy + 4);

    desenharBarraProgresso(doc, subX + 42, sy, 45, 5, ss.percent, cor);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CORES.preto);
    doc.text(`${ss.percent.toFixed(1)}%`, subX + 90, sy + 4);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.cinza);
    doc.text(`${ss.score}/${ss.maxPossible}`, subX + 103, sy + 4);

    sy += 11;
  });

  y = Math.max(radarCy + radarR + 12, sy + 5);

  // ========== DETALHAMENTO POR SUBESCALA ==========
  y += 3;
  checkSpace(20);
  doc.setFillColor(...CORES.secundaria);
  doc.roundedRect(ml, y, cw, 12, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALHAMENTO POR SUBESCALA', pw / 2, y + 8, { align: 'center' });
  y += 18;

  ABC_ICA_SUBSCALES.forEach(sub => {
    const ss = scores.subscaleScores[sub.id];
    if (!ss) return;
    const cor = SUB_COLORS[sub.id] || CORES.cinza;
    const subItems = ABC_ICA_ITEMS.filter(i => i.subscale === sub.id);

    checkSpace(18 + subItems.length * 6.5);

    // Header da subescala
    doc.setFillColor(...cor);
    doc.roundedRect(ml, y, cw, 10, 3, 3, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${sub.shortName} — ${sub.name}`, ml + 6, y + 7);
    doc.text(`${ss.score}/${ss.maxPossible} (${ss.percent.toFixed(1)}%)`, pw - ml - 6, y + 7, { align: 'right' });
    y += 13;

    // Table header
    doc.setFillColor(235, 235, 240);
    doc.rect(ml, y, cw, 6.5, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CORES.cinza);
    doc.text('Nº', ml + 3, y + 4.5);
    doc.text('Comportamento', ml + 12, y + 4.5);
    doc.text('Peso', ml + 130, y + 4.5);
    doc.text('Resp.', ml + 145, y + 4.5);
    doc.text('Pts', ml + 163, y + 4.5);
    y += 8;

    subItems.forEach((item, idx) => {
      checkSpace(7);
      if (idx % 2 === 0) {
        doc.setFillColor(248, 248, 252);
        doc.rect(ml, y - 2, cw, 6.5, 'F');
      }

      const val = responses[String(item.num)];
      const pts = val === true ? item.weight : 0;

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.preto);
      doc.text(String(item.num), ml + 3, y + 3);
      doc.text(trunc(item.desc, 58), ml + 12, y + 3);

      doc.setTextColor(...CORES.cinza);
      doc.text(String(item.weight), ml + 133, y + 3);

      if (val === true) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...cor);
        doc.text('SIM', ml + 145, y + 3);
        doc.text(String(pts), ml + 165, y + 3);
      } else if (val === false) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 190);
        doc.text('NÃO', ml + 145, y + 3);
        doc.text('0', ml + 165, y + 3);
      } else {
        doc.setTextColor(200, 200, 210);
        doc.text('—', ml + 148, y + 3);
        doc.text('—', ml + 165, y + 3);
      }

      y += 6.5;
    });

    y += 6;
  });

  // ========== INTERPRETAÇÃO ==========
  y += 3;
  checkSpace(50);

  doc.setFillColor(...CORES.primaria);
  doc.roundedRect(ml, y, cw, 12, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INTERPRETAÇÃO E ORIENTAÇÕES', pw / 2, y + 8, { align: 'center' });
  y += 16;

  // Resultado
  doc.setFillColor(...getCorClassificacaoClara(classif.level));
  doc.roundedRect(ml, y, cw, 16, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...corClassif);
  doc.text(`Resultado: ${classif.label}`, ml + 6, y + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...CORES.preto);
  doc.text(`Pontuação total: ${scores.totalScore} pontos (de ${scores.maxPossible} possíveis) — ${scores.totalPercent}%`, ml + 6, y + 13);
  y += 22;

  // Orientações
  const orientacoes = [
    'O ABC/ICA é um instrumento de rastreamento, não de diagnóstico. Resultados elevados indicam necessidade de avaliação clínica aprofundada.',
    'A pontuação reflete a frequência e intensidade de comportamentos atípicos observados. Quanto maior o score, maior a convergência com o perfil autístico.',
    'Subescalas com pontuação elevada indicam áreas de maior comprometimento que devem ser priorizadas na intervenção.',
    'Recomenda-se reaplicar o instrumento periodicamente para monitorar a evolução ao longo do tratamento.',
    'Resultados devem ser interpretados em conjunto com observação clínica, histórico do desenvolvimento e outros instrumentos de avaliação.',
  ];

  orientacoes.forEach(txt => {
    checkSpace(12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.preto);
    const lines = doc.splitTextToSize(`• ${txt}`, cw - 12);
    lines.forEach(line => {
      doc.text(line, ml + 6, y);
      y += 5;
    });
    y += 2;
  });

  // ========== RODAPÉ EM CADA PÁGINA ==========
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.cinza);
    doc.text(
      `PsicoTESTE - ABC/ICA - ${childName} - ${new Date().toLocaleDateString('pt-BR')}`,
      ml, 290
    );
    doc.text(`Página ${i} de ${totalPages}`, pw - ml, 290, { align: 'right' });
  }

  return doc;
}

// ==========================================
// EXPORTAÇÃO
// ==========================================

export function downloadABCICAPDF(crianca, scores, responses) {
  const doc = gerarRelatorioABCICA(crianca, scores, responses);
  const name = (crianca?.nome || crianca?.child_name || 'abc-ica').replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`${name}_ABC-ICA_${dateStr}.pdf`);
}

export default downloadABCICAPDF;
