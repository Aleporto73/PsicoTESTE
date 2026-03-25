import React from 'react';

/*
  📄 PDF REPORT - GERADOR DE RELATÓRIOS PROFISSIONAIS
  
  3 Tipos de Relatório:
  1. Relatório Técnico - Para profissionais
  2. PEI Completo - Plano Educacional Individualizado
  3. Resumo para Família - Linguagem acolhedora
  
  Uso:
  import { downloadPDF } from './PDFReport';
  downloadPDF('tecnico', crianca, sessao);
  downloadPDF('pei', crianca, sessao);
  downloadPDF('familia', crianca, sessao);
*/

// ==========================================
// CONSTANTES
// ==========================================

const CORES = {
    primaria: [124, 58, 237],
    secundaria: [168, 85, 247],
    verde: [16, 185, 129],
    verdeClaro: [167, 243, 208],
    amarelo: [245, 158, 11],
    amareloClaro: [253, 230, 138],
    vermelho: [239, 68, 68],
    vermelhoClaro: [254, 202, 202],
    azul: [59, 130, 246],
    cinza: [107, 114, 128],
    cinzaClaro: [243, 244, 246],
    preto: [31, 41, 55],
    branco: [255, 255, 255]
};

const NOMES_DOMINIOS = {
    'DOM01': 'Mando',
    'DOM02': 'Tato',
    'DOM03': 'Ouvinte',
    'DOM04': 'Percepção Visual e Pareamento',
    'DOM05': 'Brincar Independente',
    'DOM06': 'Comportamento Social',
    'DOM07': 'Imitação',
    'DOM08': 'Ecoico',
    'DOM09': 'Vocal Espontâneo',
    'DOM10': 'LRFFC (Ouvinte por Função)',
    'DOM11': 'Intraverbal',
    'DOM12': 'Rotinas de Grupo',
    'DOM13': 'Estrutura Linguística',
    'DOM14': 'Leitura',
    'DOM15': 'Escrita',
    'DOM16': 'Matemática'
};

const NOMES_BARREIRAS = [
    'Comportamento negativo',
    'Controle instrucional fraco',
    'Mando fraco ou ausente',
    'Tato fraco ou ausente',
    'Imitação motora fraca',
    'Ecoico ausente ou fraco',
    'VP-MTS fraco',
    'Responder de ouvinte fraco',
    'Intraverbal ausente ou fraco',
    'Habilidades sociais fracas',
    'Dependente de dicas',
    'Resposta de adivinhação',
    'Rastreamento comprometido',
    'Discriminação condicional falha',
    'Falha em generalizar',
    'OMs fracas ou atípicas',
    'Custo de resposta enfraquece OM',
    'Dependência de reforço',
    'Autoestimulação',
    'Dificuldades articulatórias',
    'Comportamento obsessivo-compulsivo',
    'Hiperatividade',
    'Falha em manter contato visual',
    'Defesa sensorial'
];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function getNomeDominio(codigo) {
    return NOMES_DOMINIOS[codigo] || codigo;
}

function processarDadosSessao(sessao) {
    const scores = sessao?.scores_snapshot || {};
    const barreiras = sessao?.barreiras || [];

    const totalMilestones = Object.keys(scores).length || 154;
    const dominados = Object.values(scores).filter(s => s === 'dominado').length;
    const emergentes = Object.values(scores).filter(s => s === 'emergente').length;
    const naoObservados = totalMilestones - dominados - emergentes;

    // Processar por domínio
    const dominios = {};
    Object.entries(scores).forEach(([blockId, status]) => {
        const match = blockId.match(/^(DOM\d+)/);
        if (match) {
            const domCode = match[1];
            if (!dominios[domCode]) {
                dominios[domCode] = {
                    codigo: domCode,
                    nome: getNomeDominio(domCode),
                    total: 0,
                    dominados: 0,
                    emergentes: 0,
                    naoObservados: 0,
                    milestones: []
                };
            }
            dominios[domCode].total++;
            if (status === 'dominado') dominios[domCode].dominados++;
            else if (status === 'emergente') {
                dominios[domCode].emergentes++;
                dominios[domCode].milestones.push(blockId);
            }
            else dominios[domCode].naoObservados++;
        }
    });

    // Barreiras com nomes
    const barreirasProcessadas = barreiras.map((b, idx) => ({
        ...b,
        nome: b.categoria || NOMES_BARREIRAS[idx] || `Barreira ${idx + 1}`
    }));

    const barreirasCriticas = barreirasProcessadas
        .filter(b => b.pontuacao >= 3)
        .sort((a, b) => b.pontuacao - a.pontuacao);

    return {
        totalMilestones,
        dominados,
        emergentes,
        naoObservados,
        percentDominado: totalMilestones > 0 ? ((dominados / totalMilestones) * 100).toFixed(1) : '0',
        dominios: Object.values(dominios).sort((a, b) => a.codigo.localeCompare(b.codigo)),
        barreiras: barreirasProcessadas,
        barreirasCriticas,
        escoreBarreiras: sessao?.escore_total_barreiras || barreiras.reduce((acc, b) => acc + (b.pontuacao || 0), 0),
        nivelAtivo: sessao?.active_level || '1'
    };
}

function desenharBarraProgresso(doc, x, y, largura, altura, percentual, corBarra) {
    doc.setFillColor(...CORES.cinzaClaro);
    doc.roundedRect(x, y, largura, altura, 2, 2, 'F');

    if (percentual > 0) {
        const larguraPreenchida = (largura * percentual) / 100;
        doc.setFillColor(...corBarra);
        doc.roundedRect(x, y, larguraPreenchida, altura, 2, 2, 'F');
    }
}

function getCorPorPercentual(percentual) {
    if (percentual >= 60) return CORES.verde;
    if (percentual >= 30) return CORES.amarelo;
    return CORES.vermelho;
}

// ==========================================
// 1. RELATÓRIO TÉCNICO
// ==========================================

function gerarRelatorioTecnico(crianca, sessao) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dados = processarDadosSessao(sessao);

    let y = 0;
    const marginLeft = 15;
    const marginRight = 15;
    const pageWidth = 210;
    const contentWidth = pageWidth - marginLeft - marginRight;

    const addPage = () => { doc.addPage(); y = 20; };
    const checkSpace = (needed) => { if (y + needed > 280) addPage(); };

    // ========== PÁGINA 1 - CAPA ==========
    doc.setFillColor(...CORES.primaria);
    doc.rect(0, 0, pageWidth, 60, 'F');

    doc.setTextColor(...CORES.branco);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO TÉCNICO', pageWidth / 2, 25, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('VB-MAPP - Avaliação de Marcos do Comportamento Verbal', pageWidth / 2, 38, { align: 'center' });

    doc.setFontSize(11);
    doc.text(`Data: ${new Date(sessao?.created_at || Date.now()).toLocaleDateString('pt-BR')}`, pageWidth / 2, 52, { align: 'center' });

    y = 75;

    // Box identificação
    doc.setFillColor(...CORES.cinzaClaro);
    doc.roundedRect(marginLeft, y, contentWidth, 45, 3, 3, 'F');

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('IDENTIFICAÇÃO', marginLeft + 10, y + 12);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${crianca?.nome || sessao?.child_name || 'Não informado'}`, marginLeft + 10, y + 24);
    doc.text(`Idade: ${crianca?.idade || sessao?.child_age || 'Não informada'}`, marginLeft + 10, y + 32);
    doc.text(`Nível Avaliado: ${dados.nivelAtivo}`, marginLeft + 100, y + 24);
    doc.text(`Sessão: ${sessao?.session_id?.slice(0, 12) || 'N/A'}`, marginLeft + 100, y + 32);

    y += 60;

    // Cards resumo
    const cardWidth = (contentWidth - 15) / 4;
    const cards = [
        { valor: dados.percentDominado + '%', label: 'Dominados', sublabel: `${dados.dominados}/${dados.totalMilestones}`, cor: CORES.verde },
        { valor: dados.emergentes.toString(), label: 'Emergentes', sublabel: 'Próximos', cor: CORES.amarelo },
        { valor: dados.naoObservados.toString(), label: 'Não Obs.', sublabel: '', cor: CORES.cinza },
        { valor: dados.barreirasCriticas.length.toString(), label: 'Barreiras', sublabel: 'Críticas', cor: CORES.vermelho }
    ];

    cards.forEach((card, idx) => {
        const cardX = marginLeft + (idx * (cardWidth + 5));
        doc.setFillColor(...card.cor);
        doc.roundedRect(cardX, y, cardWidth, 35, 3, 3, 'F');

        doc.setTextColor(...CORES.branco);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(card.valor, cardX + cardWidth / 2, y + 14, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(card.label, cardX + cardWidth / 2, y + 24, { align: 'center' });

        if (card.sublabel) {
            doc.setFontSize(7);
            doc.text(card.sublabel, cardX + cardWidth / 2, y + 31, { align: 'center' });
        }
    });

    y += 50;

    // ========== GRÁFICO POR DOMÍNIO ==========
    doc.setTextColor(...CORES.preto);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DESEMPENHO POR DOMÍNIO', marginLeft, y);
    y += 10;

    dados.dominios.forEach((dom) => {
        checkSpace(12);
        const percentual = dom.total > 0 ? Math.round((dom.dominados / dom.total) * 100) : 0;
        const cor = getCorPorPercentual(percentual);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...CORES.preto);
        const nomeExibido = dom.nome.length > 25 ? dom.nome.substring(0, 25) + '...' : dom.nome;
        doc.text(nomeExibido, marginLeft, y + 5);

        const barraX = marginLeft + 55;
        const barraLargura = 100;
        desenharBarraProgresso(doc, barraX, y, barraLargura, 6, percentual, cor);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${percentual}%`, barraX + barraLargura + 5, y + 5);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...CORES.cinza);
        doc.text(`${dom.dominados}/${dom.total}`, barraX + barraLargura + 20, y + 5);

        y += 10;
    });

    y += 10;

    // ========== PÁGINA 2 - BARREIRAS ==========
    addPage();

    doc.setFillColor(...CORES.vermelho);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BARREIRAS IDENTIFICADAS', pageWidth / 2, 10, { align: 'center' });

    y = 25;

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(11);
    doc.text(`Escore Total de Barreiras: ${dados.escoreBarreiras} / 96`, marginLeft, y);
    y += 15;

    // Tabela barreiras
    doc.setFillColor(...CORES.primaria);
    doc.rect(marginLeft, y, contentWidth, 8, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#', marginLeft + 5, y + 6);
    doc.text('Barreira', marginLeft + 15, y + 6);
    doc.text('Nível', marginLeft + 140, y + 6);
    doc.text('Status', marginLeft + 160, y + 6);
    y += 10;

    dados.barreiras.forEach((barreira, idx) => {
        checkSpace(8);

        if (idx % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(marginLeft, y - 4, contentWidth, 8, 'F');
        }

        doc.setTextColor(...CORES.preto);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`${idx + 1}`, marginLeft + 5, y + 2);
        doc.text(barreira.nome.substring(0, 50), marginLeft + 15, y + 2);

        const nivel = barreira.pontuacao || 0;
        const corNivel = nivel >= 3 ? CORES.vermelho : nivel >= 2 ? CORES.amarelo : CORES.verde;
        doc.setTextColor(...corNivel);
        doc.setFont('helvetica', 'bold');
        doc.text(`${nivel}/4`, marginLeft + 143, y + 2);

        const status = nivel >= 3 ? 'Crítico' : nivel >= 2 ? 'Atenção' : 'OK';
        doc.text(status, marginLeft + 160, y + 2);

        y += 8;
    });

    y += 15;

    // Barreiras críticas
    if (dados.barreirasCriticas.length > 0) {
        checkSpace(50);

        doc.setFillColor(...CORES.vermelhoClaro);
        doc.roundedRect(marginLeft, y, contentWidth, 8 + (dados.barreirasCriticas.length * 8), 3, 3, 'F');

        doc.setTextColor(...CORES.vermelho);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('BARREIRAS CRÍTICAS - PRIORIDADE DE INTERVENÇÃO', marginLeft + 5, y + 6);
        y += 12;

        dados.barreirasCriticas.forEach((barreira, idx) => {
            doc.setTextColor(...CORES.preto);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`${idx + 1}. ${barreira.nome} (Nível ${barreira.pontuacao})`, marginLeft + 10, y);
            y += 8;
        });
    }

    // ========== PÁGINA 3 - ANÁLISE ==========
    addPage();

    doc.setFillColor(...CORES.azul);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISE CLÍNICA E RECOMENDAÇÕES', pageWidth / 2, 10, { align: 'center' });

    y = 25;

    // Forças
    const dominiosFortes = dados.dominios.filter(d => d.total > 0 && (d.dominados / d.total) >= 0.6);
    if (dominiosFortes.length > 0) {
        doc.setFillColor(...CORES.verdeClaro);
        doc.roundedRect(marginLeft, y, contentWidth, 25, 3, 3, 'F');

        doc.setTextColor(...CORES.verde);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('[+] ÁREAS DE FORÇA', marginLeft + 5, y + 8);

        doc.setTextColor(...CORES.preto);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const textosFortes = dominiosFortes.map(d => `${d.nome} (${Math.round((d.dominados / d.total) * 100)}%)`).join(', ');
        const linhasFortes = doc.splitTextToSize(textosFortes, contentWidth - 15);
        doc.text(linhasFortes, marginLeft + 5, y + 16);

        y += 30;
    }

    // Déficits
    const dominiosFracos = dados.dominios.filter(d => d.total > 0 && (d.dominados / d.total) < 0.3);
    if (dominiosFracos.length > 0) {
        doc.setFillColor(...CORES.vermelhoClaro);
        doc.roundedRect(marginLeft, y, contentWidth, 25, 3, 3, 'F');

        doc.setTextColor(...CORES.vermelho);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('[!] ÁREAS DE DÉFICIT', marginLeft + 5, y + 8);

        doc.setTextColor(...CORES.preto);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const textosFracos = dominiosFracos.map(d => `${d.nome} (${Math.round((d.dominados / d.total) * 100)}%)`).join(', ');
        const linhasFracos = doc.splitTextToSize(textosFracos, contentWidth - 15);
        doc.text(linhasFracos, marginLeft + 5, y + 16);

        y += 30;
    }

    // Emergentes
    if (dados.emergentes > 0) {
        doc.setFillColor(...CORES.amareloClaro);
        doc.roundedRect(marginLeft, y, contentWidth, 25, 3, 3, 'F');

        doc.setTextColor(180, 120, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('[~] HABILIDADES EMERGENTES', marginLeft + 5, y + 8);

        doc.setTextColor(...CORES.preto);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${dados.emergentes} habilidades próximas a serem dominadas. Oportunidade de progresso rápido.`, marginLeft + 5, y + 16);

        y += 30;
    }

    // Recomendações
    y += 10;
    doc.setTextColor(...CORES.preto);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMENDAÇÕES', marginLeft, y);
    y += 10;

    const recomendacoes = [
        'Priorizar intervenção nas barreiras críticas identificadas antes de avançar em novos milestones.',
        'Focar nos milestones emergentes para consolidação - estes oferecem ganhos rápidos.',
        'Manter programa de manutenção para habilidades já dominadas, prevenindo regressão.',
        'Implementar generalização sistemática: diferentes pessoas, ambientes e materiais.',
        'Reavaliação VB-MAPP recomendada em 3-6 meses para monitoramento de progresso.'
    ];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    recomendacoes.forEach((rec) => {
        checkSpace(15);
        doc.setFillColor(...CORES.primaria);
        doc.circle(marginLeft + 3, y + 2, 2, 'F');
        const linhasRec = doc.splitTextToSize(rec, contentWidth - 15);
        doc.text(linhasRec, marginLeft + 10, y + 4);
        y += linhasRec.length * 5 + 5;
    });

    // Rodapé todas páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...CORES.cinzaClaro);
        doc.line(marginLeft, 285, pageWidth - marginRight, 285);
        doc.setFontSize(8);
        doc.setTextColor(...CORES.cinza);
        doc.text('VB-MAPP - Relatório Técnico', marginLeft, 292);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, 292, { align: 'right' });
        doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 292, { align: 'center' });
    }

    return doc;
}

// ==========================================
// 2. PEI COMPLETO
// ==========================================

function gerarPEICompleto(crianca, sessao) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dados = processarDadosSessao(sessao);

    let y = 0;
    const marginLeft = 15;
    const marginRight = 15;
    const pageWidth = 210;
    const contentWidth = pageWidth - marginLeft - marginRight;

    const addPage = () => { doc.addPage(); y = 20; };
    const checkSpace = (needed) => { if (y + needed > 275) addPage(); };

    // ========== CAPA ==========
    doc.setFillColor(...CORES.verde);
    doc.rect(0, 0, pageWidth, 70, 'F');

    doc.setTextColor(...CORES.branco);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('PLANO EDUCACIONAL', pageWidth / 2, 25, { align: 'center' });
    doc.text('INDIVIDUALIZADO', pageWidth / 2, 38, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('PEI - Baseado na Avaliação VB-MAPP', pageWidth / 2, 52, { align: 'center' });

    y = 85;

    // Box informações
    doc.setFillColor(...CORES.cinzaClaro);
    doc.roundedRect(marginLeft, y, contentWidth, 50, 3, 3, 'F');

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO ALUNO', marginLeft + 10, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${crianca?.nome || sessao?.child_name || 'Não informado'}`, marginLeft + 10, y + 24);
    doc.text(`Idade: ${crianca?.idade || sessao?.child_age || 'Não informada'}`, marginLeft + 10, y + 32);
    doc.text(`Nível VB-MAPP: ${dados.nivelAtivo}`, marginLeft + 10, y + 40);

    doc.text(`Data de Elaboração: ${new Date().toLocaleDateString('pt-BR')}`, marginLeft + 100, y + 24);
    doc.text('Vigência: 6 meses', marginLeft + 100, y + 32);
    const vigenciaFim = new Date();
    vigenciaFim.setMonth(vigenciaFim.getMonth() + 6);
    doc.text(`Revisão: ${vigenciaFim.toLocaleDateString('pt-BR')}`, marginLeft + 100, y + 40);

    y += 65;

    // Perfil
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFIL ATUAL DO DESENVOLVIMENTO', marginLeft, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Milestones Dominados: ${dados.dominados} de ${dados.totalMilestones} (${dados.percentDominado}%)`, marginLeft + 5, y); y += 7;
    doc.text(`• Habilidades Emergentes: ${dados.emergentes}`, marginLeft + 5, y); y += 7;
    doc.text(`• Barreiras Críticas: ${dados.barreirasCriticas.length}`, marginLeft + 5, y); y += 7;
    doc.text(`• Escore de Barreiras: ${dados.escoreBarreiras}/96`, marginLeft + 5, y);

    y += 20;

    // ========== METAS ==========
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('METAS PRIORITÁRIAS', marginLeft, y);
    y += 12;

    // Meta 1: Barreiras
    if (dados.barreirasCriticas.length > 0) {
        checkSpace(50);
        doc.setFillColor(...CORES.vermelhoClaro);
        doc.roundedRect(marginLeft, y, contentWidth, 45, 3, 3, 'F');
        doc.setDrawColor(...CORES.vermelho);
        doc.roundedRect(marginLeft, y, contentWidth, 45, 3, 3, 'S');

        doc.setTextColor(...CORES.vermelho);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('META 1: REDUÇÃO DE BARREIRAS (PRIORIDADE MÁXIMA)', marginLeft + 5, y + 10);

        doc.setTextColor(...CORES.preto);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Foco: ${dados.barreirasCriticas[0].nome}`, marginLeft + 5, y + 20);
        doc.text(`Objetivo: Reduzir nível de ${dados.barreirasCriticas[0].pontuacao} para 2 ou menos`, marginLeft + 5, y + 27);
        doc.text('Prazo: 8 semanas', marginLeft + 5, y + 34);
        doc.text('Critério: Pontuação <= 2 em 3 avaliações consecutivas', marginLeft + 5, y + 41);

        y += 52;
    }

    // Meta 2: Emergentes
    if (dados.emergentes > 0) {
        checkSpace(50);
        doc.setFillColor(...CORES.amareloClaro);
        doc.roundedRect(marginLeft, y, contentWidth, 45, 3, 3, 'F');
        doc.setDrawColor(...CORES.amarelo);
        doc.roundedRect(marginLeft, y, contentWidth, 45, 3, 3, 'S');

        doc.setTextColor(180, 120, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('META 2: CONSOLIDAR HABILIDADES EMERGENTES', marginLeft + 5, y + 10);

        doc.setTextColor(...CORES.preto);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Quantidade: ${Math.min(dados.emergentes, 5)} habilidades`, marginLeft + 5, y + 20);
        doc.text('Objetivo: Transformar emergentes em dominados', marginLeft + 5, y + 27);
        doc.text('Prazo: 12 semanas', marginLeft + 5, y + 34);
        doc.text('Critério: 80% de acerto em 3 sessões consecutivas sem dica', marginLeft + 5, y + 41);

        y += 52;
    }

    // Meta 3: Novas habilidades
    checkSpace(50);
    doc.setFillColor(...CORES.verdeClaro);
    doc.roundedRect(marginLeft, y, contentWidth, 45, 3, 3, 'F');
    doc.setDrawColor(...CORES.verde);
    doc.roundedRect(marginLeft, y, contentWidth, 45, 3, 3, 'S');

    doc.setTextColor(...CORES.verde);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('META 3: AQUISIÇÃO DE NOVAS HABILIDADES', marginLeft + 5, y + 10);

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Objetivo: Adquirir 5-10 novos milestones do nível atual', marginLeft + 5, y + 20);
    doc.text('Foco: Domínios com maior déficit identificado', marginLeft + 5, y + 27);
    doc.text('Prazo: 24 semanas', marginLeft + 5, y + 34);
    doc.text('Critério: Generalização em 2+ contextos diferentes', marginLeft + 5, y + 41);

    y += 55;

    // ========== DECRETO 12.773/2025 SECTIONS (SEMPRE presente) ==========
    const hasPeiPlan = sessao?.pei_plan && sessao.pei_plan.status !== 'draft';

    // ========== SEÇÃO 1: ESTUDO DE CASO ==========
    addPage();

    doc.setFillColor(...CORES.azul);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTUDO DE CASO', pageWidth / 2, 10, { align: 'center' });

    y = 20;
    doc.setTextColor(...CORES.cinza);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Art. 11, Decreto 12.773/2025 - O PEI deve ser elaborado a partir do Estudo de Caso', marginLeft, y);
    y += 10;

    if (hasPeiPlan) {
        const estudoCaso = sessao.pei_plan.estudoCaso || {};
        const secoes = [
            { titulo: 'Barreiras e Demandas', chave: 'barreiras_demandas' },
            { titulo: 'Contexto Escolar', chave: 'contexto_escolar' },
            { titulo: 'Potencialidades', chave: 'potencialidades' },
            { titulo: 'Estratégias de Acessibilidade', chave: 'estrategias_acessibilidade' }
        ];

        secoes.forEach((secao) => {
            checkSpace(30);
            doc.setTextColor(...CORES.preto);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(secao.titulo, marginLeft, y);
            y += 7;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const texto = estudoCaso[secao.chave] || 'Não preenchido';
            const linhas = doc.splitTextToSize(texto, contentWidth);
            doc.text(linhas, marginLeft + 5, y);
            y += linhas.length * 5 + 8;
        });
    } else {
        doc.setTextColor(...CORES.cinza);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Pendente: Preencher o Estudo de Caso no Wizard do PEI para conformidade com o decreto.', marginLeft, y);
        y += 7;
        doc.text('Campos obrigatórios: Barreiras e Demandas, Contexto Escolar, Potencialidades, Estratégias de Acessibilidade.', marginLeft, y);
        y += 15;
    }

    // ========== SEÇÃO 2: OBJETIVOS MENSURÁVEIS ==========
    addPage();

    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBJETIVOS MENSURÁVEIS', pageWidth / 2, 10, { align: 'center' });

    y = 20;

    if (hasPeiPlan) {
        const objectives = sessao.pei_plan.objectives || [];
        if (objectives.length > 0) {
            const horizonsObj = {};
            objectives.forEach((obj) => {
                const h = obj.horizon || 'curto';
                if (!horizonsObj[h]) horizonsObj[h] = [];
                horizonsObj[h].push(obj);
            });

            const horizonOrder = ['curto', 'medio', 'longo'];
            const horizonNames = { curto: 'CURTO PRAZO (até 3 meses)', medio: 'MÉDIO PRAZO (3-6 meses)', longo: 'LONGO PRAZO (6+ meses)' };
            const horizonColors = { curto: [16, 185, 129], medio: [245, 158, 11], longo: [59, 130, 246] };

            horizonOrder.forEach((horizon) => {
                if (horizonsObj[horizon]) {
                    checkSpace(30);
                    doc.setFillColor(...horizonColors[horizon]);
                    doc.rect(marginLeft, y, contentWidth, 10, 'F');
                    doc.setTextColor(...CORES.branco);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.text(horizonNames[horizon], marginLeft + 5, y + 7);
                    y += 12;

                    horizonsObj[horizon].forEach((obj) => {
                        checkSpace(25);
                        doc.setTextColor(...CORES.preto);
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`Domínio: ${obj.domain || 'N/A'}`, marginLeft + 5, y);
                        y += 5;

                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'normal');
                        const descLinhas = doc.splitTextToSize(`Descrição: ${obj.description || ''}`, contentWidth - 10);
                        doc.text(descLinhas, marginLeft + 5, y);
                        y += descLinhas.length * 4;

                        doc.text(`Métrica: ${obj.metricType || 'N/A'}`, marginLeft + 5, y);
                        y += 4;
                        doc.text(`Base: ${obj.baseline || 'N/A'} | Meta: ${obj.target || 'N/A'}`, marginLeft + 5, y);
                        y += 4;
                        doc.text(`Critério: ${obj.successCriteria || 'N/A'}`, marginLeft + 5, y);
                        y += 6;
                    });

                    y += 5;
                }
            });
        } else {
            doc.setTextColor(...CORES.cinza);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Nenhum objetivo mensurável cadastrado.', marginLeft, y);
            y += 10;
        }
    } else {
        doc.setTextColor(...CORES.cinza);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Pendente: Definir objetivos mensuráveis no Wizard do PEI (curto, médio e longo prazo).', marginLeft, y);
        y += 15;
    }

    // ========== SEÇÃO 3: ORIENTAÇÕES ==========
    addPage();

    doc.setFillColor(147, 112, 219);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ORIENTAÇÕES - Art. 12 §2', pageWidth / 2, 10, { align: 'center' });

    y = 20;
    doc.setTextColor(...CORES.cinza);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('O PEI deve orientar: (I) sala comum, (II) AEE, (III) atividades colaborativas, (IV) ações intersetoriais', marginLeft, y);
    y += 10;

    if (hasPeiPlan) {
        const orientacoes = sessao.pei_plan.adaptationGuidelines?.orientations || {};
        const orientacaoSecoes = [
            { titulo: 'I - Sala de Aula Comum', chave: 'sala_comum' },
            { titulo: 'II - AEE (Atendimento Educacional Especializado)', chave: 'aee' },
            { titulo: 'III - Atividades Colaborativas', chave: 'colaborativas' },
            { titulo: 'IV - Ações Intersetoriais', chave: 'intersetoriais' }
        ];

        orientacaoSecoes.forEach((sec) => {
            checkSpace(30);
            doc.setTextColor(...CORES.preto);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(sec.titulo, marginLeft, y);
            y += 7;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const texto = orientacoes[sec.chave] || 'Não preenchido';
            const linhas = doc.splitTextToSize(texto, contentWidth);
            doc.text(linhas, marginLeft + 5, y);
            y += linhas.length * 5 + 8;
        });
    } else {
        doc.setTextColor(...CORES.cinza);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Pendente: Preencher as orientações no Wizard do PEI.', marginLeft, y);
        y += 15;
    }

    // ========== PÁGINA 2/3 - PROCEDIMENTOS ==========
    addPage();

    doc.setFillColor(...CORES.primaria);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(...CORES.branco);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROCEDIMENTOS DE ENSINO', pageWidth / 2, 10, { align: 'center' });

    y = 25;

    const procedimentos = [
        { nome: 'DTT - Ensino por Tentativas Discretas', descricao: 'Instrução estruturada com estímulo, resposta e consequência claramente definidos.', quando: 'Aquisição inicial de habilidades novas' },
        { nome: 'NET - Ensino em Ambiente Natural', descricao: 'Aproveitamento de motivação natural da criança em contextos do dia a dia.', quando: 'Generalização e manutenção de habilidades' },
        { nome: 'Modelagem', descricao: 'Reforçamento de aproximações sucessivas do comportamento alvo.', quando: 'Habilidades complexas ou comportamentos novos' },
        { nome: 'Encadeamento', descricao: 'Ensino de sequências comportamentais passo a passo.', quando: 'Rotinas e habilidades de autocuidado' },
        { nome: 'Transferência de Controle', descricao: 'Transferência gradual entre operantes verbais.', quando: 'Desenvolvimento de linguagem funcional' }
    ];

    procedimentos.forEach((proc) => {
        checkSpace(30);
        doc.setFillColor(...CORES.cinzaClaro);
        doc.roundedRect(marginLeft, y, contentWidth, 25, 2, 2, 'F');

        doc.setTextColor(...CORES.primaria);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(proc.nome, marginLeft + 5, y + 8);

        doc.setTextColor(...CORES.preto);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(proc.descricao, marginLeft + 5, y + 15);

        doc.setTextColor(...CORES.cinza);
        doc.text(`Indicação: ${proc.quando}`, marginLeft + 5, y + 21);

        y += 28;
    });

    y += 10;

    // Cronograma
    doc.setTextColor(...CORES.preto);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CRONOGRAMA DE ACOMPANHAMENTO', marginLeft, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('• Revisão de dados: Semanal', marginLeft + 5, y); y += 7;
    doc.text('• Reunião de equipe: Quinzenal', marginLeft + 5, y); y += 7;
    doc.text('• Avaliação de progresso: Mensal', marginLeft + 5, y); y += 7;
    doc.text('• Reavaliação VB-MAPP: A cada 3-6 meses', marginLeft + 5, y);

    y += 25;

    // ========== CONFORMIDADE LEGAL (SEMPRE presente) ==========
    checkSpace(50);
    doc.setFillColor(...CORES.verdeClaro);
    doc.roundedRect(marginLeft, y, contentWidth, 45, 3, 3, 'F');

    doc.setTextColor(...CORES.verde);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFORMIDADE LEGAL', marginLeft + 5, y + 8);

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este PEI foi elaborado em conformidade com o Decreto nº 12.773/2025', marginLeft + 5, y + 14);
    doc.text('Baseado no Estudo de Caso conforme Art. 11 §2', marginLeft + 5, y + 19);
    doc.text('Orienta sala comum, AEE, atividades colaborativas e ações intersetoriais conforme Art. 12 §2', marginLeft + 5, y + 24);
    doc.text('Art. 14 §2: Não é exigido diagnóstico médico para atendimento profissional especializado', marginLeft + 5, y + 29);

    if (sessao?.pei_plan?.review_date) {
        const reviewDate = new Date(sessao.pei_plan.review_date).toLocaleDateString('pt-BR');
        doc.text(`Data de Revisão Prevista: ${reviewDate}`, marginLeft + 5, y + 34);
    } else {
        doc.setTextColor(...CORES.cinza);
        doc.text(`Status: ${hasPeiPlan ? 'Plano ativo' : 'Pendente - preencher Wizard do PEI'}`, marginLeft + 5, y + 34);
    }

    y += 50;

    // Assinaturas
    checkSpace(40);
    doc.setDrawColor(...CORES.preto);
    doc.line(marginLeft, y, marginLeft + 70, y);
    doc.line(marginLeft + 110, y, pageWidth - marginRight, y);

    y += 5;
    doc.setFontSize(9);
    doc.text('Profissional Responsável', marginLeft, y);
    doc.text('Responsável pelo Aluno', marginLeft + 110, y);

    // Rodapé
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...CORES.cinzaClaro);
        doc.line(marginLeft, 285, pageWidth - marginRight, 285);
        doc.setFontSize(8);
        doc.setTextColor(...CORES.cinza);
        doc.text('PEI - Plano Educacional Individualizado', marginLeft, 292);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, 292, { align: 'right' });
    }

    return doc;
}

// ==========================================
// 3. RESUMO PARA FAMÍLIA
// ==========================================

function gerarResumoFamilia(crianca, sessao) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dados = processarDadosSessao(sessao);

    let y = 0;
    const marginLeft = 15;
    const marginRight = 15;
    const pageWidth = 210;
    const contentWidth = pageWidth - marginLeft - marginRight;

    const checkSpace = (needed) => { if (y + needed > 275) { doc.addPage(); y = 20; } };

    // ========== CAPA ==========
    doc.setFillColor(250, 245, 255);
    doc.rect(0, 0, pageWidth, 65, 'F');

    doc.setFillColor(...CORES.primaria);
    doc.roundedRect(marginLeft, 15, contentWidth, 40, 5, 5, 'F');

    doc.setTextColor(...CORES.branco);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório para a Família', pageWidth / 2, 32, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const nomeExibido = crianca?.nome || sessao?.child_name || 'seu filho(a)';
    doc.text(`Acompanhamento de ${nomeExibido}`, pageWidth / 2, 45, { align: 'center' });

    y = 75;

    // Mensagem abertura
    doc.setTextColor(...CORES.preto);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const mensagem = `Olá! Este relatório foi preparado com muito carinho para compartilhar como está o desenvolvimento de ${nomeExibido}. Celebramos juntos cada conquista e trabalhamos em equipe para alcançar novos objetivos!`;
    const linhasMensagem = doc.splitTextToSize(mensagem, contentWidth);
    doc.text(linhasMensagem, marginLeft, y);
    y += linhasMensagem.length * 6 + 15;

    // ========== CONQUISTAS ==========
    doc.setFillColor(...CORES.verdeClaro);
    doc.roundedRect(marginLeft, y, contentWidth, 12, 3, 3, 'F');

    doc.setTextColor(...CORES.verde);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('O que ' + nomeExibido + ' já consegue fazer!', marginLeft + 5, y + 8);
    y += 18;

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const dominiosComConquistas = dados.dominios.filter(d => d.dominados > 0).slice(0, 6);

    if (dominiosComConquistas.length > 0) {
        dominiosComConquistas.forEach((dom) => {
            checkSpace(10);
            doc.setFillColor(...CORES.verde);
            doc.circle(marginLeft + 4, y + 2, 2, 'F');
            doc.text(`${dom.nome}: ${dom.dominados} habilidades dominadas!`, marginLeft + 12, y + 4);
            y += 9;
        });

        y += 5;
        doc.setFillColor(...CORES.verdeClaro);
        doc.roundedRect(marginLeft + 20, y, contentWidth - 40, 15, 3, 3, 'F');
        doc.setTextColor(...CORES.verde);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: ${dados.dominados} habilidades conquistadas!`, pageWidth / 2, y + 10, { align: 'center' });
        y += 22;
    } else {
        doc.text('Estamos começando a jornada! Em breve teremos muitas conquistas.', marginLeft, y);
        y += 15;
    }

    // ========== TRABALHANDO ==========
    checkSpace(50);
    doc.setFillColor(...CORES.amareloClaro);
    doc.roundedRect(marginLeft, y, contentWidth, 12, 3, 3, 'F');

    doc.setTextColor(180, 120, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('O que estamos trabalhando agora', marginLeft + 5, y + 8);
    y += 18;

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (dados.emergentes > 0) {
        doc.text(`Temos ${dados.emergentes} habilidades que estão quase prontas!`, marginLeft, y);
        y += 7;
        doc.text(`${nomeExibido} já demonstra essas capacidades às vezes.`, marginLeft, y);
        y += 12;

        const dominiosEmergentes = dados.dominios.filter(d => d.emergentes > 0).slice(0, 3);
        if (dominiosEmergentes.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Áreas em foco:', marginLeft, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            dominiosEmergentes.forEach((dom) => {
                doc.text(`• ${dom.nome}`, marginLeft + 10, y);
                y += 6;
            });
        }
    } else {
        doc.text('Estamos iniciando o trabalho em novas habilidades!', marginLeft, y);
    }

    y += 15;

    // ========== DICAS ==========
    checkSpace(80);
    doc.setFillColor(250, 245, 255);
    doc.roundedRect(marginLeft, y, contentWidth, 12, 3, 3, 'F');

    doc.setTextColor(...CORES.primaria);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Como vocês podem ajudar em casa', marginLeft + 5, y + 8);
    y += 18;

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const dicas = [
        'Crie momentos de brincadeira onde ' + nomeExibido + ' precise pedir o que quer.',
        'Nomeie objetos e ações durante as atividades do dia a dia.',
        'Comemore cada tentativa, mesmo que não seja perfeita!',
        'Mantenha uma rotina consistente - a previsibilidade ajuda.',
        'Tenha paciência - cada criança tem seu próprio ritmo.'
    ];

    dicas.forEach((dica, idx) => {
        checkSpace(15);
        doc.setFillColor(...CORES.primaria);
        doc.circle(marginLeft + 4, y + 2, 3, 'F');
        doc.setTextColor(...CORES.branco);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`${idx + 1}`, marginLeft + 2.5, y + 4);

        doc.setTextColor(...CORES.preto);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const linhasDica = doc.splitTextToSize(dica, contentWidth - 20);
        doc.text(linhasDica, marginLeft + 12, y + 4);
        y += linhasDica.length * 5 + 6;
    });

    y += 10;

    // ========== PARABÉNS ==========
    checkSpace(45);
    doc.setFillColor(...CORES.verdeClaro);
    doc.roundedRect(marginLeft, y, contentWidth, 35, 5, 5, 'F');

    doc.setTextColor(...CORES.verde);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Parabéns pelas conquistas!', pageWidth / 2, y + 12, { align: 'center' });

    doc.setTextColor(...CORES.preto);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${nomeExibido} já dominou ${dados.dominados} habilidades!`, pageWidth / 2, y + 22, { align: 'center' });
    doc.text('Cada pequeno passo é uma grande vitória!', pageWidth / 2, y + 30, { align: 'center' });

    // Rodapé
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...CORES.cinzaClaro);
        doc.line(marginLeft, 285, pageWidth - marginRight, 285);
        doc.setFontSize(8);
        doc.setTextColor(...CORES.cinza);
        doc.text('Relatório preparado com carinho para a família', marginLeft, 292);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, 292, { align: 'right' });
        doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth / 2, 292, { align: 'center' });
    }

    return doc;
}

// ==========================================
// FUNÇÃO PRINCIPAL DE DOWNLOAD
// ==========================================

export function downloadPDF(tipo, crianca, sessao) {
    if (!window.jspdf) {
        console.error('jsPDF não está carregado');
        alert('Erro: Biblioteca de PDF não carregada. Recarregue a página.');
        return;
    }

    let doc;
    let filename;
    const nome = (crianca?.nome || sessao?.child_name || 'crianca')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
    const data = new Date().toISOString().split('T')[0];

    try {
        switch (tipo) {
            case 'tecnico':
                doc = gerarRelatorioTecnico(crianca, sessao);
                filename = `relatorio_tecnico_${nome}_${data}.pdf`;
                break;
            case 'pei':
                doc = gerarPEICompleto(crianca, sessao);
                filename = `pei_${nome}_${data}.pdf`;
                break;
            case 'familia':
                doc = gerarResumoFamilia(crianca, sessao);
                filename = `resumo_familia_${nome}_${data}.pdf`;
                break;
            default:
                console.error('Tipo de relatório inválido:', tipo);
                return;
        }

        doc.save(filename);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Verifique o console.');
    }
}

// Componente React (mantém compatibilidade)
export default function PDFReport({ onDownload }) {
    return null; // Componente não renderiza nada, só exporta funções
}