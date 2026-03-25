// ecoicoSubtest.js
// Subteste Ecoico — VB-MAPP
// v1.2 | Lógica Pura | Independente de React

/* =========================================================
   META / ESTRUTURA
========================================================= */

export const ECOICO_META = {
    subtest_id: "ecoico_v1_2",
    name: "Subteste Ecoico",
    description: "Avaliação complementar de repetição verbal (ecoico).",
    schema_version: "ecoico_v1_2"
};

export const ECOICO_STRUCTURE = {
    groups: [
        {
            group_id: 1,
            label: "Sílabas simples",
            pattern: "V / CV / reduplicação",
            min_trials: 10,
            reference_threshold: 0.8
        },
        {
            group_id: 2,
            label: "Palavras dissílabas",
            pattern: "CVCV / CV.CV",
            min_trials: 10,
            reference_threshold: 0.7
        },
        {
            group_id: 3,
            label: "Palavras trissílabas",
            pattern: "CVCVCV",
            min_trials: 10,
            reference_threshold: 0.7
        },
        {
            group_id: 4,
            label: "Frases curtas",
            pattern: "2–3 palavras",
            min_trials: 8,
            reference_threshold: 0.6
        },
        {
            group_id: 5,
            label: "Prosódia",
            pattern: "ritmo / entonação / ênfase",
            qualitative_only: true
        }
    ]
};

/* =========================================================
   PONTUAÇÃO → NÍVEL (baseado na planilha)
========================================================= */

export const ECOICO_SCORE_TO_LEVEL = {
    // Nível 1: 0-18 meses
    level1: [
        { min: 2, max: 4, milestone: "1M" },
        { min: 5, max: 9, milestone: "2M" },
        { min: 10, max: 14, milestone: "3M" },
        { min: 15, max: 24, milestone: "4M" },
        { min: 25, max: 49, milestone: "5M" },
    ],
    // Nível 2: 18-30 meses
    level2: [
        { min: 50, max: 59, milestone: "6M" },
        { min: 60, max: 69, milestone: "7M" },
        { min: 70, max: 79, milestone: "8M" },
        { min: 80, max: 89, milestone: "9M" },
        { min: 90, max: Infinity, milestone: "10M" },
    ]
};

/* =========================================================
   SESSÃO E INTERPRETAÇÃO
========================================================= */

export function initEcoicoState(sessionInfo = {}) {
    // Se já existe no sessionInfo, restaura. Senão, cria novo.
    if (sessionInfo.ecoico_results) {
        return sessionInfo.ecoico_results;
    }

    return ECOICO_STRUCTURE.groups.map(g => ({
        group_id: g.group_id,
        attempts: 0,
        correct: 0,
        completed: false,
        passed: false,
        notes: "",
        attempt_log: []
    }));
}

export function getInterpretation(results) {
    const highestPassed = Math.max(
        0,
        ...results.filter(r => r.passed).map(r => r.group_id)
    );

    const interpretationMap = {
        0: "Ecoico não funcional nos níveis avaliados",
        1: "Ecoico funcional restrito a sílabas simples",
        2: "Ecoico funcional até palavras dissílabas",
        3: "Ecoico funcional até palavras trissílabas",
        4: "Ecoico funcional em frases curtas",
        5: "Ecoico funcional com controle prosódico"
    };

    // Calcular pontuação total
    const totalScore = results.reduce((sum, r) => sum + r.correct, 0);

    // Determinar milestone baseado na pontuação
    let milestone = null;
    for (const level of [...ECOICO_SCORE_TO_LEVEL.level1, ...ECOICO_SCORE_TO_LEVEL.level2]) {
        if (totalScore >= level.min && totalScore <= level.max) {
            milestone = level.milestone;
            break;
        }
    }

    return {
        score: highestPassed,
        total_points: totalScore,
        milestone: milestone,
        text: interpretationMap[highestPassed],
        flag: highestPassed <= 2 ? "ecoico_limitado" : "ecoico_funcional",
        recommendation: highestPassed <= 2
            ? "Iniciar intervenção ecoica a partir do próximo nível acima do alcançado."
            : "Manter estímulos ecoicos em contexto funcional e expandir repertório verbal."
    };
}

export function finalizeGroupLogic(groupData, groupDef, manualNotes = "") {
    let passed = false;

    if (!groupDef.qualitative_only) {
        const rate = groupData.attempts > 0 ? groupData.correct / groupData.attempts : 0;
        passed = groupData.attempts >= groupDef.min_trials && rate >= groupDef.reference_threshold;
    } else {
        // Para prosódia, a passagem é decidida manualmente via setQualitative
        passed = groupData.passed;
    }

    return {
        ...groupData,
        completed: true,
        passed,
        notes: manualNotes || groupData.notes
    };
}

/* =========================================================
   HELPERS
========================================================= */

export function canAdvanceToNextGroup(results, currentGroupId) {
    const current = results.find(r => r.group_id === currentGroupId);
    return current?.completed && current?.passed === true;
}

export function getGroupProgress(results) {
    const completed = results.filter(r => r.completed).length;
    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    return {
        completed,
        passed,
        total,
        percentComplete: Math.round((completed / total) * 100),
        percentPassed: Math.round((passed / total) * 100)
    };
}