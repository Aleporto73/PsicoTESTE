// aiReport.js - Serviço de IA isolado

export async function generateAIReport(input, config) {
    const systemPrompt = `Você é uma IA de apoio clínico-descritivo.
Seu papel é APENAS melhorar a comunicação do relatório VB-MAPP, sem diagnóstico,
sem prescrição, sem gerar PEI e sem sugerir intervenções formais.

Contexto:
- Avaliação funcional baseada no VB-MAPP.
- Dados fornecidos: percentuais gerais, distribuição por domínio e por nível.
- Público: profissionais da saúde/educação e responsáveis.

Regras obrigatórias:
1. NÃO diagnosticar.
2. NÃO prescrever tratamento ou plano terapêutico.
3. NÃO usar termos médicos conclusivos.
4. Evite termos como: déficit, prejuízo, atraso severo, transtorno.
5. Linguagem clara, ética e descritiva.
6. Texto curto (1–3 parágrafos, máximo 300 palavras).
7. Foco em leitura de padrões funcionais observados.
8. Sempre incluir aviso implícito de que se trata de rastreio funcional.

Responda APENAS com o texto do relatório, sem preâmbulos ou formatação markdown.`;

    const userPrompt = `Dados da avaliação VB-MAPP:

Percentuais gerais:
- Dominado: ${input.percentuais.dominado}%
- Emergente: ${input.percentuais.emergente}%
- Não observado: ${input.percentuais.nao_observado}%

Domínios (top 5 por desempenho):
${input.dominios
            .sort((a, b) => parseFloat(b.perc_dominado) - parseFloat(a.perc_dominado))
            .slice(0, 5)
            .map(d => `- ${d.nome}: ${d.perc_dominado}% dominado`)
            .join('\n')}

Níveis:
${input.niveis.map(n => `- ${n.nivel}: ${n.dominado} dominados, ${n.emergente} emergentes, ${n.nao_observado} não observados`).join('\n')}

Gere um relatório interpretativo claro e ético.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: config.max_tokens,
            temperature: 0.3
        })
    });

    if (!response.ok) {
        throw new Error('Erro ao gerar relatório com IA');
    }

    const result = await response.json();
    return result.choices[0].message.content;
}