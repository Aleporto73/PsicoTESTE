/*
  ABLLS-R PDF REPORT - GERADOR DE RELATÓRIO PROFISSIONAL
  v2 - Corrigido: encoding, espaço em branco, grupos, nomes, mini-gráficos

  Uso:
  import { downloadABLLSRPDF } from './ABLLSRPDFReport';
  downloadABLLSRPDF(crianca, scores, domains, groups);
*/

import {
  ABLLS_R_DOMAINS,
  ABLLS_R_DOMAIN_GROUPS,
  ABLLS_R_META,
  getABLLSRPerformanceLevel,
} from '../../data/instruments/ablls_r';

// ==========================================
// CONSTANTES
// ==========================================

const CORES = {
  primaria: [8, 145, 178],
  secundaria: [6, 182, 212],
  verde: [16, 185, 129],
  verdeClaro: [209, 250, 229],
  amarelo: [245, 158, 11],
  amareloClaro: [254, 243, 199],
  vermelho: [239, 68, 68],
  vermelhoClaro: [254, 226, 226],
  azul: [59, 130, 246],
  roxo: [124, 58, 237],
  rosa: [219, 39, 119],
  cinza: [107, 114, 128],
  cinzaClaro: [243, 244, 246],
  preto: [31, 41, 55],
  branco: [255, 255, 255],
};

const GROUP_COLORS = {
  habilidades_basicas: { rgb: [124, 58, 237], label: 'Hab. B\u00e1sicas' },
  linguagem: { rgb: [37, 99, 235], label: 'Linguagem' },
  social_rotina: { rgb: [5, 150, 105], label: 'Social e Rotina' },
  academico: { rgb: [217, 119, 6], label: 'Acad\u00eamico' },
  autonomia_motor: { rgb: [219, 39, 119], label: 'Autonomia e Motor' },
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

function getCorPorPercentual(p) {
  if (p >= 80) return CORES.verde;
  if (p >= 60) return CORES.azul;
  if (p >= 40) return CORES.amarelo;
  if (p >= 20) return CORES.vermelho;
  return CORES.cinza;
}

function getLevelLabel(p) {
  return getABLLSRPerformanceLevel(p).label;
}

function getGroupColor(gId) {
  return GROUP_COLORS[gId]?.rgb || CORES.cinza;
}

function trunc(text, max) {
  return text.length > max ? text.substring(0, max - 1) + '...' : text;
}

// Mini radar pentagonal desenhado com jsPDF
function desenharMiniRadar(doc, cx, cy, raio, groups, scores) {
  const n = groups.length;
  if (n < 3) return;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // topo

  // Grid circles
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
    const gs = scores.groupScores?.[groups[i].id];
    const pct = gs ? (gs.percent || 0) / 100 : 0;
    const angle = startAngle + i * angleStep;
    const r = raio * Math.max(pct, 0.03);
    dataPoints.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }

  // Fill polygon
  doc.setFillColor(8, 145, 178);
  doc.setGState(new doc.GState({ opacity: 0.25 }));
  const xArr = dataPoints.map(p => p.x);
  const yArr = dataPoints.map(p => p.y);
  // Draw filled polygon using triangle fan
  for (let i = 1; i < n - 1; i++) {
    doc.triangle(
      xArr[0], yArr[0],
      xArr[i], yArr[i],
      xArr[i + 1], yArr[i + 1],
      'F'
    );
  }
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Outline polygon
  doc.setDrawColor(8, 145, 178);
  doc.setLineWidth(0.6);
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    doc.line(dataPoints[i].x, dataPoints[i].y, dataPoints[next].x, dataPoints[next].y);
  }

  // Data points
  for (let i = 0; i < n; i++) {
    const cor = getGroupColor(groups[i].id);
    doc.setFillColor(...cor);
    doc.circle(dataPoints[i].x, dataPoints[i].y, 1.2, 'F');
  }

  // Labels
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const lx = cx + (raio + 8) * Math.cos(angle);
    const ly = cy + (raio + 8) * Math.sin(angle);
    const gs = scores.groupScores?.[groups[i].id];
    const pct = gs ? gs.percent.toFixed(0) : '0';
    const label = GROUP_COLORS[groups[i].id]?.label || groups[i].name;
    const cor = getGroupColor(groups[i].id);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cor);

    const align = Math.cos(angle) < -0.1 ? 'right' : Math.cos(angle) > 0.1 ? 'left' : 'center';
    doc.text(`${label} ${pct}%`, lx, ly + 1, { align });
  }
}

// ==========================================
// RELATÓRIO TÉCNICO ABLLS-R
// ==========================================

function gerarRelatorioABLLSR(crianca, scores, domains, groups) {
  if (!window.jspdf) {
    throw new Error('Biblioteca jsPDF n\u00e3o carregada. Verifique a conex\u00e3o com a internet.');
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 0;
  const ml = 15; // marginLeft
  const pw = 210; // pageWidth
  const cw = pw - ml * 2; // contentWidth

  const addPage = () => { doc.addPage(); y = 20; };
  const checkSpace = (needed) => { if (y + needed > 275) addPage(); };

  const childName = crianca?.nome || crianca?.child_name || 'N\u00e3o informado';
  const childAge = crianca?.idade || crianca?.child_age || 'N\u00e3o informada';

  // ========== PAGINA 1 - CAPA ==========
  doc.setFillColor(...CORES.primaria);
  doc.rect(0, 0, pw, 55, 'F');

  doc.setTextColor(...CORES.branco);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RELAT\u00d3RIO ABLLS-R', pw / 2, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Assessment of Basic Language and Learning Skills - Revised', pw / 2, 33, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} \u00e0s ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, pw / 2, 46, { align: 'center' });

  y = 65;

  // Box identificacao
  doc.setFillColor(...CORES.cinzaClaro);
  doc.roundedRect(ml, y, cw, 30, 3, 3, 'F');

  doc.setTextColor(...CORES.preto);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICA\u00c7\u00c3O', ml + 8, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Crian\u00e7a: ${childName}`, ml + 8, y + 19);
  doc.text(`Idade: ${childAge}`, ml + 8, y + 26);
  doc.text(`Itens respondidos: ${scores.itemsAnswered}/${scores.totalItems}`, ml + 105, y + 19);
  doc.text(`Instrumento: ABLLS-R (25 dom\u00ednios)`, ml + 105, y + 26);

  y += 38;

  // -- 4 Cards Resumo (mais compactos) --
  const cardW = (cw - 15) / 4;
  const cards = [
    { valor: `${scores.totalPercent}%`, label: 'Desempenho', sub: 'Global', cor: getCorPorPercentual(scores.totalPercent) },
    { valor: `${scores.totalScore}/${scores.maxPossible}`, label: 'Pontua\u00e7\u00e3o', sub: '', cor: CORES.primaria },
    { valor: getDomainsCritical(scores).length.toString(), label: 'Cr\u00edticos', sub: '< 20%', cor: CORES.vermelho },
    { valor: getDomainsStrong(scores).length.toString(), label: 'Fortes', sub: '>= 60%', cor: CORES.verde },
  ];

  cards.forEach((c, i) => {
    const cx = ml + (i * (cardW + 5));
    doc.setFillColor(...c.cor);
    doc.roundedRect(cx, y, cardW, 28, 3, 3, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(c.valor, cx + cardW / 2, y + 11, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(c.label, cx + cardW / 2, y + 19, { align: 'center' });
    if (c.sub) {
      doc.setFontSize(7);
      doc.text(c.sub, cx + cardW / 2, y + 25, { align: 'center' });
    }
  });

  y += 35;

  // -- Classificacao Global --
  const globalLevel = getABLLSRPerformanceLevel(scores.totalPercent);
  doc.setFillColor(...getCorPorPercentual(scores.totalPercent));
  doc.roundedRect(ml, y, cw, 12, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Classifica\u00e7\u00e3o Global: ${globalLevel.label.toUpperCase()} (${scores.totalPercent}%)`, pw / 2, y + 8, { align: 'center' });
  y += 18;

  // -- Mini Radar por Area (lado esquerdo) + Desempenho por Area (lado direito) --
  const radarCx = ml + 42;
  const radarCy = y + 32;
  const radarR = 25;

  // Desenhar mini radar
  try {
    desenharMiniRadar(doc, radarCx, radarCy, radarR, groups, scores);
  } catch (e) {
    // Fallback se GState nao disponivel - texto simples
    doc.setFontSize(8);
    doc.setTextColor(...CORES.cinza);
    doc.text('(Radar indispon\u00edvel)', radarCx - 12, radarCy);
  }

  // Desempenho por Area (ao lado do radar)
  const areaX = ml + 88;
  doc.setTextColor(...CORES.preto);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DESEMPENHO POR \u00c1REA', areaX, y + 2);

  let ay = y + 9;
  groups.forEach(group => {
    const gs = scores.groupScores?.[group.id];
    if (!gs) return;
    const pct = gs.percent || 0;
    const cor = getGroupColor(group.id);
    const label = GROUP_COLORS[group.id]?.label || group.name;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cor);
    doc.text(trunc(label, 22), areaX, ay + 4);

    desenharBarraProgresso(doc, areaX + 42, ay, 50, 5, pct, cor);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CORES.preto);
    doc.text(`${pct.toFixed(1)}%`, areaX + 95, ay + 4);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.cinza);
    doc.text(`${gs.score}/${gs.maxPossible}`, areaX + 108, ay + 4);

    ay += 11;
  });

  y = Math.max(radarCy + radarR + 12, ay + 5);

  // ========== DESEMPENHO POR DOMINIO (25 dominios) ==========
  checkSpace(20);
  doc.setTextColor(...CORES.preto);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DESEMPENHO POR DOM\u00cdNIO (25 dom\u00ednios)', ml, y);
  y += 8;

  // Legenda (sem caracteres especiais)
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  const legs = [
    { label: '>=80% Avan\u00e7ado', cor: CORES.verde },
    { label: '>=60% Proficiente', cor: CORES.azul },
    { label: '>=40% Em Desenv.', cor: CORES.amarelo },
    { label: '>=20% Inicial', cor: CORES.vermelho },
    { label: '<20% N\u00e3o Dem.', cor: CORES.cinza },
  ];
  let lx = ml;
  legs.forEach(l => {
    doc.setFillColor(...l.cor);
    doc.rect(lx, y, 3.5, 3.5, 'F');
    doc.setTextColor(...CORES.cinza);
    doc.text(l.label, lx + 5, y + 3);
    lx += 35;
  });
  y += 8;

  domains.forEach(domain => {
    checkSpace(10);
    const ds = scores.domainScores?.[domain.id];
    if (!ds) return;
    const pct = ds.percent || 0;
    const cor = getCorPorPercentual(pct);

    const parentGroup = groups.find(g => g.domains.includes(domain.id));
    const gCor = parentGroup ? getGroupColor(parentGroup.id) : CORES.cinza;

    // Group dot
    doc.setFillColor(...gCor);
    doc.circle(ml + 2, y + 2.5, 1.5, 'F');

    // Domain name (mais espaco: 38 chars)
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.preto);
    doc.text(trunc(domain.name, 38), ml + 6, y + 4);

    // Progress bar
    const bx = ml + 72;
    const bw = 75;
    desenharBarraProgresso(doc, bx, y + 0.5, bw, 4.5, pct, cor);

    // Percentage
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cor);
    doc.text(`${pct.toFixed(1)}%`, bx + bw + 3, y + 4);

    // Score
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.cinza);
    doc.text(`${ds.score}/${ds.maxPossible}`, bx + bw + 18, y + 4);

    y += 8.5;
  });

  // ========== ANALISE (MESMO FLUXO, SEM PAGE BREAK FORCADO) ==========
  y += 5;
  checkSpace(30);

  doc.setFillColor(...CORES.primaria);
  doc.roundedRect(ml, y, cw, 12, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('AN\u00c1LISE E INTERPRETA\u00c7\u00c3O', pw / 2, y + 8, { align: 'center' });
  y += 18;

  // -- Criticos --
  const criticos = getDomainsCritical(scores);
  checkSpace(20);
  doc.setFillColor(...CORES.vermelho);
  doc.roundedRect(ml, y, cw, 10, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`DOM\u00cdNIOS CR\u00cdTICOS (< 20%) \u2014 ${criticos.length} identificado(s)`, ml + 6, y + 7);
  y += 13;

  if (criticos.length > 0) {
    doc.setFillColor(...CORES.vermelhoClaro);
    doc.roundedRect(ml, y, cw, criticos.length * 8 + 2, 2, 2, 'F');
    criticos.forEach(d => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.vermelho);
      doc.text(`  - ${d.name}`, ml + 4, y + 5);
      doc.setTextColor(...CORES.cinza);
      doc.text(`${d.score}/${d.maxPossible} (${d.percent.toFixed(1)}%)`, ml + 105, y + 5);
      y += 8;
    });
    y += 4;
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...CORES.cinza);
    doc.text('Nenhum dom\u00ednio nesta faixa.', ml + 6, y + 3);
    y += 8;
  }

  // -- Em Desenvolvimento --
  const emDesenv = getDomainsInDev(scores);
  checkSpace(20);
  doc.setFillColor(...CORES.amarelo);
  doc.roundedRect(ml, y, cw, 10, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`EM DESENVOLVIMENTO (20-59%) \u2014 ${emDesenv.length} dom\u00ednio(s)`, ml + 6, y + 7);
  y += 13;

  if (emDesenv.length > 0) {
    doc.setFillColor(...CORES.amareloClaro);
    doc.roundedRect(ml, y, cw, emDesenv.length * 8 + 2, 2, 2, 'F');
    emDesenv.forEach(d => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.preto);
      doc.text(`  - ${d.name}`, ml + 4, y + 5);
      doc.setTextColor(...CORES.cinza);
      doc.text(`${d.score}/${d.maxPossible} (${d.percent.toFixed(1)}%)`, ml + 105, y + 5);
      y += 8;
    });
    y += 4;
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...CORES.cinza);
    doc.text('Nenhum dom\u00ednio nesta faixa.', ml + 6, y + 3);
    y += 8;
  }

  // -- Fortes --
  const fortes = getDomainsStrong(scores);
  checkSpace(20);
  doc.setFillColor(...CORES.verde);
  doc.roundedRect(ml, y, cw, 10, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`DOM\u00cdNIOS FORTES (>= 60%) \u2014 ${fortes.length} dom\u00ednio(s)`, ml + 6, y + 7);
  y += 13;

  if (fortes.length > 0) {
    // Renderizar em colunas de 2 para economizar espaco quando muitos
    const colWidth = (cw - 8) / 2;
    let col = 0;
    let rowY = y;
    doc.setFillColor(...CORES.verdeClaro);
    const rowsNeeded = Math.ceil(fortes.length / 2);
    doc.roundedRect(ml, y, cw, rowsNeeded * 8 + 2, 2, 2, 'F');

    fortes.forEach((d, idx) => {
      col = idx % 2;
      if (col === 0 && idx > 0) rowY += 8;

      const colX = ml + 4 + col * colWidth;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.verde);
      doc.text(`- ${trunc(d.name, 22)}`, colX, rowY + 5);
      doc.setTextColor(...CORES.cinza);
      doc.text(`${d.percent.toFixed(0)}%`, colX + colWidth - 12, rowY + 5);
    });
    y = rowY + 12;
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...CORES.cinza);
    doc.text('Nenhum dom\u00ednio nesta faixa.', ml + 6, y + 3);
    y += 8;
  }

  // -- Recomendacoes (FLUXO CONTINUO, sem page break forcado) --
  y += 4;
  checkSpace(50);
  doc.setFillColor(...CORES.azul);
  doc.roundedRect(ml, y, cw, 10, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMENDA\u00c7\u00d5ES GERAIS', ml + 6, y + 7);
  y += 14;

  const recs = [
    'Priorizar interven\u00e7\u00e3o nos dom\u00ednios classificados como Cr\u00edticos e Inicial.',
    'Manter est\u00edmulo nos dom\u00ednios Em Desenvolvimento para consolidar habilidades emergentes.',
    'Acompanhar evolu\u00e7\u00e3o com reaplica\u00e7\u00f5es peri\u00f3dicas (AV2, AV3, AV4) para medir progresso.',
    'Integrar objetivos do ABLLS-R ao plano educacional individualizado (PEI).',
    'Utilizar comparativo longitudinal para ajustar metas e estrat\u00e9gias de ensino.',
  ];

  recs.forEach(rec => {
    checkSpace(10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.preto);
    const lines = doc.splitTextToSize(`- ${rec}`, cw - 12);
    lines.forEach(line => {
      doc.text(line, ml + 6, y);
      y += 5.5;
    });
    y += 1.5;
  });

  // ========== DETALHAMENTO POR AREA ==========
  y += 5;
  checkSpace(30);

  doc.setFillColor(...CORES.secundaria);
  doc.roundedRect(ml, y, cw, 12, 3, 3, 'F');
  doc.setTextColor(...CORES.branco);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALHAMENTO POR \u00c1REA', pw / 2, y + 8, { align: 'center' });
  y += 18;

  groups.forEach(group => {
    const gs = scores.groupScores?.[group.id];
    if (!gs) return;
    const gColor = getGroupColor(group.id);
    const gLabel = GROUP_COLORS[group.id]?.label || group.name;
    const gPct = gs.percent || 0;
    const gLevel = getLevelLabel(gPct);

    checkSpace(20 + group.domains.length * 9);

    // Group header
    doc.setFillColor(...gColor);
    doc.roundedRect(ml, y, cw, 11, 3, 3, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(gLabel, ml + 6, y + 7);
    doc.text(`${gPct.toFixed(1)}% - ${gLevel} - ${gs.score}/${gs.maxPossible} pts`, pw - ml - 6, y + 7, { align: 'right' });
    y += 14;

    // Table header
    doc.setFillColor(235, 235, 240);
    doc.rect(ml, y, cw, 7, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CORES.cinza);
    doc.text('Dom\u00ednio', ml + 4, y + 5);
    doc.text('Pontua\u00e7\u00e3o', ml + 95, y + 5);
    doc.text('%', ml + 130, y + 5);
    doc.text('N\u00edvel', ml + 145, y + 5);
    y += 9;

    group.domains.forEach((domainId, idx) => {
      checkSpace(9);
      const domain = domains.find(d => d.id === domainId);
      const ds = scores.domainScores?.[domainId];
      if (!domain || !ds) return;

      if (idx % 2 === 0) {
        doc.setFillColor(248, 248, 252);
        doc.rect(ml, y - 2, cw, 8, 'F');
      }

      const pct = ds.percent || 0;
      const cor = getCorPorPercentual(pct);
      const level = getLevelLabel(pct);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.preto);
      doc.text(trunc(domain.name, 40), ml + 4, y + 3);

      doc.text(`${ds.score}/${ds.maxPossible}`, ml + 95, y + 3);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...cor);
      doc.text(`${pct.toFixed(1)}%`, ml + 130, y + 3);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.cinza);
      doc.text(level, ml + 145, y + 3);

      y += 8.5;
    });

    y += 6;
  });

  // ========== RODAPE EM CADA PAGINA ==========
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.cinza);
    doc.text(
      `PsicoTESTE - ABLLS-R - ${childName} - ${new Date().toLocaleDateString('pt-BR')}`,
      ml, 290
    );
    doc.text(`P\u00e1gina ${i} de ${totalPages}`, pw - ml, 290, { align: 'right' });
  }

  return doc;
}

// ==========================================
// HELPERS
// ==========================================

function getDomainsCritical(sc) {
  return getDomainsFiltered(sc, p => p < 20);
}

function getDomainsInDev(sc) {
  return getDomainsFiltered(sc, p => p >= 20 && p < 60);
}

function getDomainsStrong(sc) {
  return getDomainsFiltered(sc, p => p >= 60);
}

function getDomainsFiltered(sc, filter) {
  const result = [];
  for (const d of ABLLS_R_DOMAINS) {
    const ds = sc.domainScores?.[d.id];
    if (ds && filter(ds.percent || 0)) {
      result.push({ id: d.id, name: d.name, score: ds.score, maxPossible: ds.maxPossible, percent: ds.percent || 0 });
    }
  }
  return result.sort((a, b) => a.percent - b.percent);
}

// ==========================================
// EXPORTACAO
// ==========================================

export function downloadABLLSRPDF(crianca, scores, domains, groups) {
  const doc = gerarRelatorioABLLSR(crianca, scores, domains, groups);
  const name = (crianca?.nome || crianca?.child_name || 'ablls-r').replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`${name}_ABLLS-R_${dateStr}.pdf`);
}

export default downloadABLLSRPDF;
