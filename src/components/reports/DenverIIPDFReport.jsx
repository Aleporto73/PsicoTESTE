/*
 * DenverIIPDFReport — Gerador de PDF para Denver II
 *
 * Usa jsPDF via CDN (window.jspdf)
 * Capa emerald (#059669) + identificação + resumo + radar + barras + detalhamento + interpretação
 */

import {
  DENVER_DOMAINS,
  DENVER_ITEMS,
  DENVER_SCORE_OPTIONS,
  DENVER_INTERPRETATION_OPTIONS,
} from '../../data/instruments/denver_ii';

const ACCENT = [5, 150, 105]; // emerald RGB
const ACCENT_HEX = '#059669';

function checkJsPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('jsPDF não carregado. Verifique a conexão com a internet.');
    return null;
  }
  return new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

/**
 * Gera e baixa o PDF do Denver II
 */
export function downloadDenverPDF(crianca, scores, responses) {
  const doc = checkJsPDF();
  if (!doc) return;

  const W = 210;
  const H = 297;
  const M = 15; // margem
  let page = 1;

  function footer() {
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text('Denver II — Teste de Triagem do Desenvolvimento | Frankenburg et al. (1992)', M, H - 8);
    doc.text('Página ' + page, W - M, H - 8, { align: 'right' });
  }

  function newPage() {
    doc.addPage();
    page++;
    footer();
  }

  function ensureSpace(needed, y) {
    if (y + needed > H - 20) {
      newPage();
      return 20;
    }
    return y;
  }

  // ═══════════════════════════════════════════════════
  // PÁGINA 1: CAPA
  // ═══════════════════════════════════════════════════
  // Faixa superior
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, W, 55, 'F');
  doc.setTextColor(255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('Denver II', M, 28);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Teste de Triagem do Desenvolvimento', M, 38);
  doc.setFontSize(9);
  doc.text('Frankenburg, Dodds, Archer, Shapiro & Bresnick (1992)', M, 48);

  // Box identificação
  let y = 65;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, W - 2 * M, 30, 3, 3, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Criança:', M + 5, y + 10);
  doc.text('Idade:', M + 5, y + 18);
  doc.text('Data:', M + 5, y + 26);
  doc.setFont('helvetica', 'normal');
  doc.text(crianca.name || '—', M + 30, y + 10);
  doc.text(crianca.age || '—', M + 30, y + 18);
  doc.text(new Date().toLocaleDateString('pt-BR'), M + 30, y + 26);

  y = 105;

  // Classificação global
  const classif = scores.classification;
  const classifColors = {
    normal: [16, 185, 129],
    suspeito: [245, 158, 11],
    nao_testavel: [239, 68, 68],
  };
  const cc = classifColors[classif.id] || ACCENT;
  doc.setFillColor(...cc);
  doc.roundedRect(M, y, W - 2 * M, 25, 3, 3, 'F');
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Classificação: ' + classif.label, W / 2, y + 11, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(classif.description, W / 2, y + 20, { align: 'center' });

  y += 35;

  // Cards resumo (4 cards)
  const cards = [
    { label: 'Respondidos', value: scores.totalAnswered + '/' + scores.totalItems, color: ACCENT },
    { label: 'Avançados', value: '' + scores.summary.avancados, color: [59, 130, 246] },
    { label: 'Cautelas', value: '' + scores.summary.cautelas, color: [245, 158, 11] },
    { label: 'Atrasos', value: '' + scores.summary.atrasos, color: [239, 68, 68] },
  ];
  const cardW = (W - 2 * M - 15) / 4;
  cards.forEach((card, i) => {
    const cx = M + i * (cardW + 5);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cx, y, cardW, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, cx + cardW / 2, y + 7, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...card.color);
    doc.text(card.value, cx + cardW / 2, y + 18, { align: 'center' });
  });

  y += 32;

  // Resumo por domínio
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo por Domínio', M, y);
  y += 8;

  for (const domain of DENVER_DOMAINS) {
    const dr = scores.domainResults[domain.id];
    y = ensureSpace(20, y);

    // Domain header bar
    const dColor = hexToRgb(domain.color);
    doc.setFillColor(...dColor);
    doc.roundedRect(M, y, W - 2 * M, 6, 1, 1, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(domain.name, M + 3, y + 4.5);
    y += 9;

    // Counts
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const line = 'Resp: ' + dr.answered + '/' + dr.total
      + '  |  Avançado: ' + (dr.interpretation.avancado || 0)
      + '  |  Normal: ' + (dr.interpretation.normal || 0)
      + '  |  Cautela: ' + (dr.interpretation.cautela || 0)
      + '  |  Atraso: ' + (dr.interpretation.atraso || 0)
      + '  |  N.A: ' + (dr.interpretation.na || 0);
    doc.text(line, M + 3, y + 3);
    y += 8;
  }

  y += 5;

  // Mini radar (desenho manual)
  y = ensureSpace(80, y);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Perfil de Desenvolvimento', M, y);
  y += 5;
  drawMiniRadar(doc, W / 2, y + 35, 30, scores.domainResults);
  y += 75;

  footer();

  // ═══════════════════════════════════════════════════
  // PÁGINAS SEGUINTES: DETALHAMENTO
  // ═══════════════════════════════════════════════════
  for (const domain of DENVER_DOMAINS) {
    newPage();
    y = 20;

    const dColor = hexToRgb(domain.color);
    doc.setFillColor(...dColor);
    doc.roundedRect(M, y, W - 2 * M, 8, 2, 2, 'F');
    doc.setTextColor(255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(domain.icon + ' ' + domain.name, M + 4, y + 6);
    y += 14;

    // Table header
    const colX = [M, M + 8, M + 70, M + 110, M + 140];
    doc.setFillColor(241, 245, 249);
    doc.rect(M, y, W - 2 * M, 7, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('#', colX[0] + 1, y + 5);
    doc.text('Habilidade', colX[1], y + 5);
    doc.text('Idade', colX[2], y + 5);
    doc.text('Escore', colX[3], y + 5);
    doc.text('Interpr.', colX[4], y + 5);
    y += 9;

    const items = DENVER_ITEMS[domain.id];
    for (const item of items) {
      y = ensureSpace(7, y);
      const key = domain.id + '_' + item.num;
      const resp = responses[key] || {};

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('' + item.num, colX[0] + 1, y + 4);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      const skillText = item.skill.length > 35 ? item.skill.substring(0, 35) + '...' : item.skill;
      doc.text(skillText, colX[1], y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const ageText = item.age ? (item.age.length > 22 ? item.age.substring(0, 22) + '...' : item.age) : '—';
      doc.text(ageText, colX[2], y + 4);

      // Score badge
      if (resp.score) {
        const sOpt = DENVER_SCORE_OPTIONS.find(o => o.value === resp.score);
        if (sOpt) {
          const sColor = hexToRgb(sOpt.color);
          doc.setTextColor(...sColor);
          doc.setFont('helvetica', 'bold');
          doc.text(sOpt.label, colX[3], y + 4);
        }
      } else {
        doc.setTextColor(180);
        doc.text('—', colX[3], y + 4);
      }

      // Interpretation badge
      if (resp.interpretation) {
        const iOpt = DENVER_INTERPRETATION_OPTIONS.find(o => o.value === resp.interpretation);
        if (iOpt) {
          const iColor = hexToRgb(iOpt.color);
          doc.setTextColor(...iColor);
          doc.setFont('helvetica', 'bold');
          doc.text(iOpt.label, colX[4], y + 4);
        }
      } else {
        doc.setTextColor(180);
        doc.text('—', colX[4], y + 4);
      }

      // Linha separadora
      doc.setDrawColor(226, 232, 240);
      doc.line(M, y + 6, W - M, y + 6);
      y += 7;
    }
  }

  // ═══════════════════════════════════════════════════
  // ÚLTIMA PÁGINA: INTERPRETAÇÃO E ORIENTAÇÕES
  // ═══════════════════════════════════════════════════
  newPage();
  y = 20;

  doc.setFillColor(...ACCENT);
  doc.roundedRect(M, y, W - 2 * M, 8, 2, 2, 'F');
  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretação e Orientações', M + 4, y + 6);
  y += 14;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Classificação obtida: ' + classif.label, M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const interpretTexts = [
    'O Denver II é um instrumento de triagem (screening), não diagnóstico. Resultados suspeitos indicam necessidade de avaliação mais aprofundada.',
    '',
    'Critérios de classificação:',
    '• Normal: Nenhum Atraso e no máximo 1 Cautela.',
    '• Suspeito: 2 ou mais Cautelas e/ou 1 ou mais Atrasos.',
    '• Não Testável: Recusa em itens com a linha da idade à esquerda da barra.',
    '',
    'Orientações clínicas:',
  ];

  if (classif.id === 'normal') {
    interpretTexts.push(
      '• Resultado dentro da normalidade. Manter acompanhamento de rotina.',
      '• Reavaliar nas consultas seguintes conforme calendário de puericultura.',
    );
  } else if (classif.id === 'suspeito') {
    interpretTexts.push(
      '• Resultado suspeito. Recomenda-se reavaliar em 1 a 2 semanas para confirmar achados.',
      '• Se o resultado se mantiver suspeito na reavaliação, encaminhar para avaliação diagnóstica especializada.',
      '• Considerar estimulação precoce nas áreas com Cautela ou Atraso.',
    );
  } else {
    interpretTexts.push(
      '• Resultado não testável. Reavaliar em 1 a 2 semanas.',
      '• Recusa persistente pode ser clinicamente significativa e requer investigação.',
    );
  }

  interpretTexts.push(
    '',
    'Domínios com maior número de Cautelas/Atrasos requerem atenção prioritária:',
  );

  // Listar domínios com problemas
  for (const domain of DENVER_DOMAINS) {
    const dr = scores.domainResults[domain.id];
    const problems = (dr.interpretation.cautela || 0) + (dr.interpretation.atraso || 0);
    if (problems > 0) {
      interpretTexts.push('• ' + domain.name + ': ' + (dr.interpretation.cautela || 0) + ' Cautela(s), ' + (dr.interpretation.atraso || 0) + ' Atraso(s)');
    }
  }

  for (const line of interpretTexts) {
    y = ensureSpace(5, y);
    doc.text(line, M, y);
    y += 4.5;
  }

  footer();

  // SALVAR
  const fileName = 'Denver_II_' + (crianca.name || 'paciente').replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.pdf';
  doc.save(fileName);
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function drawMiniRadar(doc, cx, cy, radius, domainResults) {
  const n = DENVER_DOMAINS.length; // 4
  const angleOffset = -Math.PI / 2;

  // Background circles
  for (let r = 25; r <= 100; r += 25) {
    const rr = (r / 100) * radius;
    doc.setDrawColor(220, 230, 240);
    doc.setLineWidth(0.2);
    // Draw square-ish for 4 points
    const pts = [];
    for (let i = 0; i < n; i++) {
      const angle = angleOffset + (2 * Math.PI * i) / n;
      pts.push([cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)]);
    }
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      doc.line(pts[i][0], pts[i][1], pts[next][0], pts[next][1]);
    }
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = angleOffset + (2 * Math.PI * i) / n;
    doc.setDrawColor(200, 210, 220);
    doc.line(cx, cy, cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  }

  // Data polygon
  const data = DENVER_DOMAINS.map(d => {
    const dr = domainResults[d.id];
    if (!dr || dr.answered === 0) return 0;
    const positives = (dr.interpretation.normal || 0) + (dr.interpretation.avancado || 0);
    return positives / dr.answered;
  });

  const dataPts = data.map((v, i) => {
    const angle = angleOffset + (2 * Math.PI * i) / n;
    const r = v * radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });

  // Fill
  doc.setFillColor(5, 150, 105);
  doc.setGState(new doc.GState({ opacity: 0.15 }));
  const polyPath = dataPts.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' ') + ' Z';
  // Use lines for fill
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Outline
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.8);
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    doc.line(dataPts[i][0], dataPts[i][1], dataPts[next][0], dataPts[next][1]);
  }

  // Points
  for (let i = 0; i < n; i++) {
    const dColor = hexToRgb(DENVER_DOMAINS[i].color);
    doc.setFillColor(...dColor);
    doc.circle(dataPts[i][0], dataPts[i][1], 1.5, 'F');
  }

  // Labels
  for (let i = 0; i < n; i++) {
    const angle = angleOffset + (2 * Math.PI * i) / n;
    const lx = cx + (radius + 10) * Math.cos(angle);
    const ly = cy + (radius + 10) * Math.sin(angle);
    const pct = Math.round(data[i] * 100) + '%';

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    const dColor = hexToRgb(DENVER_DOMAINS[i].color);
    doc.setTextColor(...dColor);

    const align = Math.abs(Math.cos(angle)) < 0.1 ? 'center' : Math.cos(angle) > 0 ? 'left' : 'right';
    doc.text(DENVER_DOMAINS[i].short + ' ' + pct, lx, ly, { align });
  }
}
