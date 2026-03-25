import { useState, useEffect } from 'react';
import {
    ECOICO_META,
    ECOICO_STRUCTURE,
    initEcoicoState,
    getInterpretation,
    finalizeGroupLogic,
    getGroupProgress
} from '../data/ecoico';

// EXEMPLOS SUGERIDOS (Orientação Clínica)
export const ECOICO_EXAMPLES = {
    1: ["aa", "au au", "papa", "boi", "tão", "dada", "muu", "baba", "ii", "uau", "uu", "oi", "mama", "buu", "eu"],
    2: ["copo", "gato", "faca", "vaca", "manhã", "saco", "azul", "nunca", "sino", "dedo", "pote", "coisa", "mesa", "moça", "boca", "fuga", "pato", "nada", "tudo", "vinho", "meu pé", "maçã", "dança", "café", "bota", "cinza", "minha", "doce", "tatu", "sapo"],
    3: ["casaco", "peteca", "buzina", "tomate", "banana", "batata", "sapato", "sozinho", "caminhão", "animal", "dominó", "vem aqui", "cômoda", "nadando", "começa", "camisa", "médico", "pesado", "menino", "pintinho", "montanha", "bonito", "amanhã", "pipoca", "cidade", "tudo bem", "cimento", "foguete", "casinha", "tucano"],
    4: ["essa **NÃO**", "tudo **BEM**", "vem a**QUI**", "é **MI**nha", "vamos **LÁ**", "a-**CHOU**", "**MEU** amor", "**PU**xa vida", "**O**-lha", "e a-**GO**-ra"],
    5: [
        'Entonação: canções familiares, vocalizações contínuas ("OO oo OO oo")',
        'Intensidade: sussurro, voz baixa × voz alta',
        'Duração: sustentar "aaaaa" por ≥ 3 segundos'
    ]
};

export function useEcoicoLogic(sessionInfo, isReadOnly) {
    // STATE
    const [results, setResults] = useState([]);
    const [currentGroupId, setCurrentGroupId] = useState(1);
    const [localNotes, setLocalNotes] = useState('');

    // INITIALIZATION
    useEffect(() => {
        if (sessionInfo) {
            const initialState = initEcoicoState(sessionInfo);
            setResults(initialState);

            // Se já houver resultados, tenta ir para o primeiro não completo
            const firstIncomplete = initialState.find(r => !r.completed);
            if (firstIncomplete) {
                setCurrentGroupId(firstIncomplete.group_id);
            }
        }
    }, [sessionInfo]);

    // COMPUTED VALUES
    const currentResult = results.find(r => r.group_id === currentGroupId) || {};
    const currentDef = ECOICO_STRUCTURE.groups.find(g => g.group_id === currentGroupId) || {};
    const progress = getGroupProgress(results);
    const canFinalize = results.every(r => r.completed) || results.some(r => r.completed && !r.passed);

    // HANDLERS
    const handleAttempt = (isCorrect) => {
        if (isReadOnly || currentResult.completed) return;

        const stimuli = ECOICO_EXAMPLES[currentGroupId] || [];
        const currentIndex = currentResult.attempts || 0;

        // REGRA: Impedir tentativas além do tamanho da lista
        if (currentIndex >= stimuli.length) return;

        const stimulus = stimuli[currentIndex] || "---";

        const logEntry = {
            stimulus,
            correct: isCorrect,
            pattern: currentDef.pattern,
            timestamp: new Date().toISOString()
        };

        setResults(prev => prev.map(r =>
            r.group_id === currentGroupId
                ? {
                    ...r,
                    attempts: r.attempts + 1,
                    correct: isCorrect ? r.correct + 1 : r.correct,
                    attempt_log: [...(r.attempt_log || []), logEntry]
                }
                : r
        ));
    };

    const handleFinalizeGroup = () => {
        if (isReadOnly || currentResult.completed) return;

        // Confirmação se abaixo do mínimo
        if (!currentDef.qualitative_only && currentResult.attempts < currentDef.min_trials) {
            if (!window.confirm(`Sugerimos pelo menos ${currentDef.min_trials} tentativas para este nível. Continuar?`)) return;
        }

        const updatedGroup = finalizeGroupLogic(currentResult, currentDef, localNotes);

        setResults(prev => prev.map(r => r.group_id === currentGroupId ? updatedGroup : r));
        setLocalNotes('');
    };

    const setQualitative = (passed) => {
        if (isReadOnly || currentResult.completed) return;
        const updated = { ...currentResult, completed: true, passed, notes: localNotes };
        setResults(prev => prev.map(r => r.group_id === currentGroupId ? updated : r));
        setLocalNotes('');
    };

    const handleFinalizeSubtest = (onFinalize) => {
        if (isReadOnly) return;

        const summary = getInterpretation(results);
        const payload = {
            ...ECOICO_META,
            date_finished: new Date().toISOString(),
            ecoico_results: results,
            summary,
            session_id: sessionInfo?.session_id
        };

        onFinalize(payload);
    };

    return {
        // STATE
        results,
        currentGroupId,
        localNotes,
        setLocalNotes,
        setCurrentGroupId,

        // COMPUTED
        currentResult,
        currentDef,
        progress,
        canFinalize,

        // HANDLERS
        handleAttempt,
        handleFinalizeGroup,
        setQualitative,
        handleFinalizeSubtest,

        // CONSTANTS
        ECOICO_EXAMPLES
    };
}
