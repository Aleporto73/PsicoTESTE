/*
  CARS-2 PDF REPORT - Relat\u00f3rio profissional

  Uso:
  import { downloadCARS2PDF } from './CARS2PDFReport';
  downloadCARS2PDF(crianca, scores, responses);
*/

import {
  CARS2_ITEMS,
  CARS2_CLASSIFICATION,
  CARS2_META,
  getScoreSeverity,
} from '../../data/instruments/cars2';

// ==========================================
// CONSTANTES
// ==========================================

const CORES = {
  primaria: [124, 58, 237],      // violet-600
  secundaria: [109, 40, 217],    // violet-700
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

// ==========================================
// FUN\u00c7\u00d5ES AUXILIARES
// ==========================================

function desenharBarraProgresso(doc, x, y, largura, altura, valor, max, corBarra) {
  doc.setFillColor(...CORES.cinzaClaro);
  doc.roundedRect(x, y, largura, altura, 2, 2, 'F');
  if (valor > 0) {
    const pct = Math.min(valor / max, 1);
    const w = Math.max(largura * pct, 2);
    doc.setFillColor(...corBarra);
    doc.roundedRect(x, y, w, altura, 2, 2, 'F');
  }
}

function getCorNivel(score) {
  if (score <= 1.5) return CORES.verde;
  if (score <= 2.5) return CORES.amarelo;
  if (score <= 3.5) return CORES.laranja;
  return CORES.vermelho;
}

function getCorClassificacao(level) {
  switch (level) {
    case 'minimo': return CORES.verde;
    case 'leve_moderado': return CORES.amarelo;
    case 'grave': return CORES.vermelho;
    default: return CORES.cinza;
  }
}

function getCorClassificacaoClara(level) {
  switch (level) {
    case 'minimo': return CORES.verdeClaro;
    case 'leve_moderado': return CORES.amareloClaro;
    case 'grave': return CORES.vermelhoClaro;
    default: return CORES.cinzaClaro;
  }
}

function trunc(text, max) {
  return text.length > max ? text.substring(0, max - 1) + '...' : text;
}

// Mini radar 15 itens
function desenharMiniRadar(doc, cx, cy, raio, itemScores) {
  const n = CARS2_ITEMS.length;
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
    const item = CARS2_ITEMS[i];
    const ss = itemScores[String(item.num)];
    const pct = ss ? (ss.score / 4) : 0;
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
    const item = CARS2_ITEMS[i];
    const ss = itemScores[String(item.num)];
    const cor = ss ? getCorNivel(ss.score) : CORES.cinza;
    doc.setFillColor(...cor);
    doc.circle(dataPoints[i].x, dataPoints[i].y, 1, 'F');
  }

  // Labels
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const lx = cx + (raio + 7) * Math.cos(angle);
    const ly = cy + (raio + 7) * Math.sin(angle);
    const item = CARS2_ITEMS[i];
    const ss = itemScores[String(item.num)];
    const score = ss ? ss.score : '-';

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    const cor = ss ? getCorNivel(ss.score) : CORES.cinza;
    doc.setTextColor(...cor);

    const align = Math.cos(angle) < -0.1 ? 'right' : Math.cos(angle) > 0.1 ? 'left' : 'center';
    doc.text(`${item.num}:${score}`, lx, ly + 1, { align });
  }
}

// ==========================================
// GERADOR DO RELAT\u00d3RIO
// ==========================================

function gerarRelatorioCARS2(crianca, scores, responses) {
  if (!window.jspdf) {
    throw new Error('Biblioteca jsPDF n\u00e3o carregada. Verifique a conex\u00e3o com a internet.');
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 0;
  const ml = 15;
  const pw = 210;
  const cw = pw - ml * 2;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkSpace = (needed) => { if (y + needed > 275) addPage(); };

  const childName = crianca?.nome || crianca?.child_name || 'N\u00e3o informado';
  const childAge = crianca?.idade || crianca?.child_age || 'N\u00e3o informada';
  const classif = scores.classification;
  const corClassif = getCorClassificacao(classif.level);

  // ========== P\u00c1GINA 1 - CAPA ==========
  doc.setFillColor(...CORES.primaria);
  doc.rect(0, 0, pw, 55, 'F');

  doc.setTextColor(...CORES.branco);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RELAT\u00d3RIO CARS-2', pw / 2, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Childhood Autism Rating Scale \u2014 Second Edition (Standard Form)', pw / 2, 30, { align: 'center' });
  doc.text('Schopler, Van Bourgondien, Wellman & Love (2010)', pw / 2, 38, { align: 'center' });

  doc.setFontSize(8);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} \u00e0s ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, pw / 2, 48, { align: 'center' });

  y = 65;

  // Box identifica\u00e7\u00e3o
  doc.setFillColor(...CORES.cinzaClaro);
  doc.roundedRect(ml, y, cw, 26, 3, 3, 'F');
  doc.setTextColor(...CORES.preto);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICA\u00c7\u00c3O', ml + 8, y + 9);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Crian\u00e7a: ${childName}`, ml + 8, y + 17);
  doc.text(`Idade: ${childAge}`, ml + 8, y + 23);
  doc.text(`Itens respondidos: ${scores.totalAnswered}/${scores.totalItems}`, ml + 105, y + 17);
  doc.text('Instrumento: CARS-2 ST (15 itens, escala 1-4)', ml + 105, y + 23);

  y += 34;

  // -- 4 Cards Resumo --
  const cardW = (cw - 15) / 4;
  const cardsData = [
    { valor: String(scores.totalScore), label: 'Escore Bruto', sub: `de ${scores.maxPossible}`, cor: CORES.primaria },
    { valor: String(scores.tScore), label: 'T-Escore', sub: '', cor: [37, 99, 235] },
    { valor: String(scores.percentile), label: 'Percentil', sub: '', cor: [5, 150, 105] },
    { valor: `${scores.totalAnswered}/${scores.totalItems}`, label: 'Respondidos', sub: '', cor: [100, 116, 139] },
  ];

  cardsData.forEach((c, i) => {
    const cx = ml + (i * (cardW + 5));
    doc.setFillColor(...c.cor);
    doc.roundedRect(cx, y, cardW, 26, 3, 3, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(c.valor, cx + cardW / 2, y + 10, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(c.label, cx + cardW / 2, y + 18, { align: 'center' });
    if (c.sub) {
      doc.setFontSize(7);
      doc.text(c.sub, cx + cardW / 2, y + 23, { align: 'center' });
    }
  });

  y += 33;

  // -- Classifica\u00e7\u00e3o Global --
  doc.setFillColor(...corClassif);
  doc.roundedRect(ml, y, cw, 14, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`CLASSIFICA\u00c7\u00c3O: ${classif.label.toUpperCase()} (Score: ${scores.totalScore})`, pw / 2, y + 9, { align: 'center' });
  y += 18;

  // -- Faixas de refer\u00eancia --
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CORES.preto);
  doc.text('Faixas de refer\u00eancia:', ml, y + 4);
  let fx = ml + 38;
  CARS2_CLASSIFICATION.forEach(cl => {
    const cor = getCorClassificacao(cl.level);
    doc.setFillColor(...cor);
    doc.roundedRect(fx, y, 42, 6, 1.5, 1.5, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cl.min}-${cl.max}`, fx + 2, y + 4.5);
    fx += 44;
  });
  y += 12;

  // -- Mini Radar (esquerda) + Itens (direita) --
  const radarCx = ml + 38;
  const radarCy = y + 38;
  const radarR = 30;

  try {
    desenharMiniRadar(doc, radarCx, radarCy, radarR, scores.itemScores);
  } catch (e) {
    doc.setFontSize(8);
    doc.setTextColor(...CORES.cinza);
    doc.text('(Radar indispon\u00edvel)', radarCx - 12, radarCy);
  }

  // Itens resumo (ao lado do radar)
  const subX = ml + 85;
  doc.setTextColor(...CORES.preto);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PONTUA\u00c7\u00c3O POR ITEM', subX, y + 2);

  let sy = y + 8;
  CARS2_ITEMS.forEach(item => {
    const ss = scores.itemScores[String(item.num)];
    const score = ss ? ss.score : 0;
    const cor = getCorNivel(score);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cor);
    doc.text(`${item.num}.`, subX, sy + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.preto);
    doc.text(trunc(item.name, 28), subX + 6, sy + 4);

    desenharBarraProgresso(doc, subX + 55, sy, 30, 4, score, 4, cor);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cor);
    doc.text(String(score), subX + 88, sy + 4);

    sy += 6.5;
  });

  y = Math.max(radarCy + radarR + 15, sy + 5);

  // ========== DETALHAMENTO POR ITEM ==========
  checkSpace(20);
  doc.setFillColor(...CORES.secundaria);
  doc.roundedRect(ml, y, cw, 12, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALHAMENTO POR ITEM', pw / 2, y + 8, { align: 'center' });
  y += 16;

  // Table header
  doc.setFillColor(235, 235, 240);
  doc.rect(ml, y, cw, 7, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CORES.cinza);
  doc.text('N\u00ba', ml + 3, y + 5);
  doc.text('Subescala', ml + 12, y + 5);
  doc.text('Nota', ml + 130, y + 5);
  doc.text('Gravidade', ml + 145, y + 5);
  y += 9;

  CARS2_ITEMS.forEach((item, idx) => {
    checkSpace(8);
    if (idx % 2 === 0) {
      doc.setFillColor(248, 248, 252);
      doc.rect(ml, y - 2, cw, 7, 'F');
    }

    const val = responses[String(item.num)];
    const hasVal = val !== undefined && val !== null;
    const cor = hasVal ? getCorNivel(val) : CORES.cinza;
    const sev = hasVal ? getScoreSeverity(val) : null;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CORES.preto);
    doc.text(String(item.num), ml + 3, y + 3);

    doc.setFont('helvetica', 'normal');
    doc.text(trunc(item.name, 50), ml + 12, y + 3);

    if (hasVal) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...cor);
      doc.text(String(val), ml + 133, y + 3);

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(sev.label, ml + 145, y + 3);
    } else {
      doc.setTextColor(200, 200, 210);
      doc.text('\u2014', ml + 133, y + 3);
      doc.text('\u2014', ml + 150, y + 3);
    }

    y += 7;
  });

  y += 5;

  // ========== INTERPRETA\u00c7\u00c3O ==========
  checkSpace(60);

  doc.setFillColor(...CORES.primaria);
  doc.roundedRect(ml, y, cw, 12, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INTERPRETA\u00c7\u00c3O E ORIENTA\u00c7\u00d5ES', pw / 2, y + 8, { align: 'center' });
  y += 16;

  // Resultado
  doc.setFillColor(...getCorClassificacaoClara(classif.level));
  doc.roundedRect(ml, y, cw, 20, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...corClassif);
  doc.text(`Resultado: ${classif.label}`, ml + 6, y + 6);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...CORES.preto);
  doc.text(`Escore bruto: ${scores.totalScore} | T-Escore: ${scores.tScore} | Percentil: ${scores.percentile}`, ml + 6, y + 13);
  y += 26;

  // \u00c1reas cr\u00edticas
  const criticos = CARS2_ITEMS.filter(i => {
    const s = scores.itemScores[String(i.num)];
    return s && s.score >= 3;
  });
  if (criticos.length > 0) {
    checkSpace(16);
    doc.setFillColor(...CORES.vermelhoClaro);
    doc.roundedRect(ml, y, cw, 4 + criticos.length * 5, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CORES.vermelho);
    doc.text(`\u00c1reas cr\u00edticas (${criticos.length}):`, ml + 5, y + 5);
    let cy = y + 10;
    criticos.forEach(item => {
      const s = scores.itemScores[String(item.num)];
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.preto);
      doc.text(`\u2022 ${item.name} (nota ${s.score})`, ml + 8, cy);
      cy += 5;
    });
    y = cy + 4;
  }

  // Orienta\u00e7\u00f5es
  checkSpace(40);
  const orientacoes = [
    'A CARS-2 \u00e9 um instrumento de avalia\u00e7\u00e3o da gravidade dos sintomas, baseado em observa\u00e7\u00e3o direta. N\u00e3o substitui diagn\u00f3stico cl\u00ednico.',
    'Escores mais altos indicam maior gravidade dos sintomas. Itens com nota >= 3 representam \u00e1reas de comprometimento significativo.',
    'O T-Escore e Percentil permitem comparar o resultado com a amostra normativa. T >= 37 sugere presen\u00e7a de sintomas consistentes com TEA.',
    'Resultados devem ser integrados com hist\u00f3rico do desenvolvimento, observa\u00e7\u00e3o cl\u00ednica e outros instrumentos de avalia\u00e7\u00e3o.',
    'Recomenda-se que a aplica\u00e7\u00e3o seja realizada por profissional treinado, preferencialmente ap\u00f3s observa\u00e7\u00e3o direta da crian\u00e7a.',
  ];

  orientacoes.forEach(txt => {
    checkSpace(12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.preto);
    const lines = doc.splitTextToSize(`\u2022 ${txt}`, cw - 12);
    lines.forEach(line => {
      doc.text(line, ml + 6, y);
      y += 5;
    });
    y += 2;
  });

  // ========== RODAP\u00c9 EM CADA P\u00c1GINA ==========
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.cinza);
    doc.text(
      `PsicoTESTE - CARS-2 - ${childName} - ${new Date().toLocaleDateString('pt-BR')}`,
      ml, 290
    );
    doc.text(`P\u00e1gina ${i} de ${totalPages}`, pw - ml, 290, { align: 'right' });
  }

  return doc;
}

// ==========================================
// EXPORTA\u00c7\u00c3O
// ==========================================

export function downloadCARS2PDF(crianca, scores, responses) {
  const doc = gerarRelatorioCARS2(crianca, scores, responses);
  const name = (crianca?.nome || crianca?.child_name || 'cars2').replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`${name}_CARS-2_${dateStr}.pdf`);
}

export default downloadCARS2PDF;
