// ecoicoSubtest.js
// Subteste Ecoico — VB-MAPP
// v1.2 | Condicional | Funcional | Alinhado à planilha | Copyright-safe

/* =========================================================
   META / INSTITUCIONAL
========================================================= */

export const ECOICO_META = {
    subtest_id: "ecoico_v1_2",
    name: "Subteste Ecoico",
    description:
        "Avaliação funcional de repetição verbal (ecoico), aplicada apenas quando há lacuna identificada nos Milestones.",
    schema_version: "ecoico_v1_2",
    affects_milestones_score: false,
    nature: "aprofundamento_funcional"
};

export const ECOICO_UI_DISCLAIMER =
    "As sugestões por idade servem apenas como orientação inicial. " +
    "A classificação final é baseada exclusivamente no desempenho funcional observado.";

/* =========================================================
   ESTRUTURA DO SUBTESTE (ABSTRATA, SEM ITENS PROTEGIDOS)
========================================================= */

export const ECOICO_STRUCTURE = {
    groups: [
        {
            group_id: 1,
            label: "Sílabas simples",
            pattern: "V / CV / reduplicação",
            min_trials: 10,
            reference_threshold: 0.8,
            interpretation: "Consistência funcional em sílabas simples"
        },
        {
            group_id: 2,
            label: "Palavras dissílabas",
            pattern: "CVCV / CV.CV",
            min_trials: 10,
            reference_threshold: 0.7,
            interpretation: "Repetição funcional de palavras simples"
        },
        {
            group_id: 3,
            label: "Palavras trissílabas",
            pattern: "CVCVCV",
            min_trials: 10,
            reference_threshold: 0.7,
            interpretation: "Expansão do repertório ecoico"
        },
        {
            group_id: 4,
            label: "Frases curtas",
            pattern: "2–3 palavras",
            min_trials: 8,
            reference_threshold: 0.6,
            interpretation: "Ecoico funcional em cadeias verbais curtas"
        },
        {
            group_id: 5,
            label: "Prosódia",
            pattern: "ritmo / entonação / ênfase",
            qualitative_only: true,
            interpretation: "Análise qualitativa da prosódia"
        }
    ]
};

/* =========================================================
   IDADE → ORIENTAÇÃO DE UI (NÃO DECIDE RESULTADO)
========================================================= */

export function getEcoicoPriorityByAge(ageMonths) {
    if (ageMonths == null) return null;

    if (ageMonths <= 18) {
        return {
            expected_groups: [1],
            emerging_groups: [2],
            note: "Expectativa funcional típica até sílabas simples"
        };
    }

    if (ageMonths <= 30) {
        return {
            expected_groups: [2],
            emerging_groups: [1, 3],
            note: "Expansão para palavras dissílabas"
        };
    }

    if (ageMonths <= 48) {
        return {
            expected_groups: [3, 4],
            emerging_groups: [2, 5],
            note: "Ecoico funcional em palavras e frases curtas"
        };
    }

    return {
        expected_groups: [3, 4],
        emerging_groups: [5],
        note: "Avaliação funcional independente da idade cronológica"
    };
}

/* =========================================================
   SESSÃO
========================================================= */

export function initEcoicoSession(sessionInfo = {}) {
    const ageMonths = sessionInfo.age_months ?? null;
    const uiPriority =
        ageMonths != null ? getEcoicoPriorityByAge(ageMonths) : null;

    return {
        ...ECOICO_META,
        session_id: sessionInfo.session_id,
        child_name: sessionInfo.child_name,
        age_months: ageMonths,
        ui_priority: uiPriority,
        triggered_by: "milestone_lacuna",
        started_at: new Date().toISOString(),
        results: ECOICO_STRUCTURE.groups.map(g => ({
            group_id: g.group_id,
            attempts: 0,
            correct: 0,
            completed: false,
            passed: false,
            notes: ""
        })),
        finished_at: null
    };
}

/* =========================================================
   REGISTRO DE TENTATIVAS
========================================================= */

export function recordEcoicoAttempt(state, groupId, isCorrect) {
    return {
        ...state,
        results: state.results.map(r =>
            r.group_id === groupId && !r.completed
                ? {
                    ...r,
                    attempts: r.attempts + 1,
                    correct: isCorrect ? r.correct + 1 : r.correct
                }
                : r
        )
    };
}

/* =========================================================
   FINALIZAÇÃO DE GRUPO (CRITÉRIO FUNCIONAL)
========================================================= */

export function finalizeEcoicoGroup(state, groupId, notes = "") {
    const def = ECOICO_STRUCTURE.groups.find(g => g.group_id === groupId);

    return {
        ...state,
        results: state.results.map(r => {
            if (r.group_id !== groupId) return r;

            let passed = false;

            if (!def.qualitative_only) {
                const rate = r.attempts > 0 ? r.correct / r.attempts : 0;
                passed =
                    r.attempts >= def.min_trials &&
                    rate >= def.reference_threshold;
            }

            return {
                ...r,
                completed: true,
                passed,
                notes
            };
        })
    };
}

/* =========================================================
   DECISÃO QUALITATIVA (PROSÓDIA)
========================================================= */

export function setQualitativeDecision(state, groupId, passed, notes = "") {
    return {
        ...state,
        results: state.results.map(r =>
            r.group_id === groupId
                ? {
                    ...r,
                    completed: true,
                    passed: !!passed,
                    notes
                }
                : r
        )
    };
}

/* =========================================================
   FINALIZAÇÃO DA SESSÃO / LEITURA CLÍNICA
========================================================= */

export function finalizeEcoicoSession(state) {
    const highestPassed = Math.max(
        0,
        ...state.results.filter(r => r.passed).map(r => r.group_id)
    );

    const interpretationMap = {
        0: "Ecoico não funcional nos níveis avaliados",
        1: "Ecoico funcional restrito a sílabas simples",
        2: "Ecoico funcional até palavras dissílabas",
        3: "Ecoico funcional até palavras trissílabas",
        4: "Ecoico funcional em frases curtas",
        5: "Ecoico funcional com controle prosódico"
    };

    return {
        ...state,
        finished_at: new Date().toISOString(),
        summary: {
            highest_group_passed: highestPassed,
            interpretation: interpretationMap[highestPassed],
            clinical_flag:
                highestPassed <= 2 ? "ecoico_limitado" : "ecoico_funcional",
            recommendation:
                highestPassed <= 2
                    ? "Iniciar intervenção ecoica a partir do próximo nível acima do alcançado."
                    : "Manter estímulos ecoicos em contexto funcional e expandir repertório verbal."
        }
    };
}

/* =========================================================
   CONTROLE DE PROGRESSÃO
========================================================= */

export function canAdvanceToNextGroup(state, currentGroupId) {
    const current = state.results.find(r => r.group_id === currentGroupId);
    return current?.completed && current?.passed === true;
}
