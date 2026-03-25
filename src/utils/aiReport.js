// aiReport.js - Serviço de IA isolado (com suporte multi-instrumento)

import { getReportTemplate } from './reportTemplates';

/**
 * Gera relatório IA para o VB-MAPP (retrocompatível)
 */
export async function generateAIReport(input, config) {
    const template = getReportTemplate('vbmapp');

    const systemPrompt = template.systemPrompt;
    const userPrompt = template.buildUserPrompt(input);

    return await callOpenAI(systemPrompt, userPrompt, config);
}

/**
 * Gera relatório IA para qualquer instrumento usando templates
 *
 * @param {string} instrumentId - ID do instrumento (ex: 'mchat_rf')
 * @param {object} data - Dados reais do instrumento
 * @param {object} config - Configuração opcional { model, max_tokens }
 * @returns {string} Texto do relatório
 */
export async function generateInstrumentReport(instrumentId, data, config = {}) {
    const template = getReportTemplate(instrumentId);
    if (!template) {
        throw new Error(`Template de relatório não encontrado para: ${instrumentId}`);
    }

    const systemPrompt = template.systemPrompt;
    const userPrompt = template.buildUserPrompt(data);

    return await callOpenAI(systemPrompt, userPrompt, config);
}

/**
 * Chamada à API OpenAI (interno)
 */
async function callOpenAI(systemPrompt, userPrompt, config = {}) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('Chave da API OpenAI não configurada (VITE_OPENAI_API_KEY)');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: config.model || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: config.max_tokens || 500,
            temperature: 0.3
        })
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        throw new Error(`Erro ao gerar relatório com IA: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
}
