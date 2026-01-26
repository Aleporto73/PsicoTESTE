import React, { useState, useEffect } from 'react';
import {
    ECOICO_META,
    ECOICO_STRUCTURE,
    initEcoicoState,
    getInterpretation,
    finalizeGroupLogic,
    getGroupProgress
} from './ecoicoSubtest';

// 0. EXEMPLOS SUGERIDOS (Orientação Clínica)
const ECOICO_EXAMPLES = {
    1: ["aa", "au au", "papa", "boi", "tão", "dada", "muu", "baba", "ii", "uau", "uu", "oi", "mama", "buu", "eu"],
    2: ["copo", "gato", "faca", "vaca", "manhã", "saco", "azul", "nunca", "sino", "dedo", "pote", "coisa", "mesa", "moça", "boca", "fuga", "pato", "nada", "tudo", "vinho", "meu pé", "maçã", "dança", "café", "bota", "cinza", "minha", "doce", "tatu", "sapo"],
    3: ["casaco", "peteca", "buzina", "tomate", "banana", "batata", "sapato", "sozinho", "caminhão", "animal", "dominó", "vem aqui", "cômoda", "nadando", "começa", "camisa", "médico", "pesado", "menino", "pintinho", "montanha", "bonito", "amanhã", "pipoca", "cidade", "tudo bem", "cimento", "foguete", "casinha", "tucano"],
    4: ["essa **NÃO**", "tudo **BEM**", "vem a**QUI**", "é **MI**nha", "vamos **LÁ**", "a-**CHOU**", "**MEU** amor", "**PU**xa vida", "**O**-lha", "e a-**GO**-ra"],
    5: [
        "Entonação: canções familiares, vocalizações contínuas (“OO oo OO oo”)",
        "Intensidade: sussurro, voz baixa × voz alta",
        "Duração: sustentar “aaaaa” por ≥ 3 segundos"
    ]
};

export default function EcoicoSubtestScreen({
    sessionInfo,
    onFinalize,
    onBack,
    isReadOnly
}) {
    // 1. ESTADOS
    const [results, setResults] = useState([]);
    const [currentGroupId, setCurrentGroupId] = useState(1);
    const [localNotes, setLocalNotes] = useState('');

    // 2. CARREGAMENTO DA SESSÃO
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

    // 3. AUXILIARES
    const currentResult = results.find(r => r.group_id === currentGroupId) || {};
    const currentDef = ECOICO_STRUCTURE.groups.find(g => g.group_id === currentGroupId) || {};
    const progress = getGroupProgress(results);

    // 4. HANDLERS
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

    const handleFinalizeSubtest = () => {
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

    // Verificar se pode finalizar
    const canFinalize = results.every(r => r.completed) || results.some(r => r.completed && !r.passed);

    // 5. RENDER
    return (
        <div className="ecoico-screen">
            <style>{getStyles()}</style>

            <header className="ecoico-header">
                <div className="header-info">
                    <span className="badge">SUBTESTE ECOICO</span>
                    <h1>🔊 {sessionInfo?.child_name || 'Criança'} — Avaliação Ecoica</h1>
                    <p className="subtitle">Repetição verbal funcional • Tela 1.5/5</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={onBack}>
                        ← Pular / Voltar
                    </button>
                    {!isReadOnly && (
                        <button
                            className={`btn btn-success ${!canFinalize ? 'disabled' : ''}`}
                            onClick={handleFinalizeSubtest}
                            disabled={!canFinalize}
                        >
                            ✓ Finalizar Subteste
                        </button>
                    )}
                </div>
            </header>

            {/* Barra de progresso */}
            <div className="progress-bar-container">
                <div className="progress-info">
                    <span>Progresso: {progress.completed}/{progress.total} níveis</span>
                    <span className="passed-info">{progress.passed} aprovados</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress.percentComplete}%` }}
                    ></div>
                </div>
            </div>

            <main className="ecoico-layout">
                <aside className="ecoico-sidebar">
                    <h3>Níveis</h3>
                    {ECOICO_STRUCTURE.groups.map(g => {
                        const res = results.find(r => r.group_id === g.group_id) || {};
                        const isSelected = currentGroupId === g.group_id;
                        const prevGroup = results.find(r => r.group_id === g.group_id - 1);
                        const isLocked = g.group_id > 1 && prevGroup && !prevGroup.passed && !prevGroup.completed;

                        return (
                            <button
                                key={g.group_id}
                                className={`nav-item ${isSelected ? 'active' : ''} ${res.completed ? (res.passed ? 'passed' : 'failed') : ''} ${isLocked ? 'locked' : ''}`}
                                onClick={() => !isLocked && setCurrentGroupId(g.group_id)}
                                disabled={isLocked && !isReadOnly}
                            >
                                <div className="nav-top">
                                    <span className="lvl">Nível {g.group_id}</span>
                                    {res.completed && (
                                        <span className="status-ico">{res.passed ? '✅' : '❌'}</span>
                                    )}
                                </div>
                                <span className="label">{g.label}</span>
                                {!res.completed && !isLocked && (
                                    <span className="attempts-info">
                                        {res.attempts || 0} tentativas
                                    </span>
                                )}
                                {isLocked && !isReadOnly && <span className="lock-msg">🔒 Bloqueado</span>}
                            </button>
                        );
                    })}

                    <div className="sidebar-note">
                        <p>💡 A avaliação deve parar se a criança falhar em um nível.</p>
                    </div>
                </aside>

                <section className="ecoico-content">
                    <div className="group-card">
                        <div className="card-header">
                            <div className="card-title">
                                <span className="level-badge">Nível {currentGroupId}</span>
                                <h2>{currentDef.label}</h2>
                            </div>
                            <p>Padrão fonético: <strong>{currentDef.pattern}</strong></p>
                            {!currentDef.qualitative_only && (
                                <p className="threshold-info">
                                    Critério: mínimo {currentDef.min_trials} tentativas,
                                    {Math.round(currentDef.reference_threshold * 100)}% de acertos
                                </p>
                            )}
                        </div>

                        {/* BLOCO DE EXEMPLOS SUGERIDOS */}
                        <div className="examples-block">
                            <details open={currentGroupId <= 1}>
                                <summary>
                                    <span className="summary-icon">💡</span>
                                    Exemplos ilustrativos de estímulos ecoicos possíveis (não exaustivos)
                                </summary>
                                <div className="examples-content">
                                    <div className="stimuli-note">
                                        <em>A avaliação considera a correspondência ao padrão fonético, não a palavra específica utilizada.</em>
                                    </div>
                                    <div className="stimuli-list">
                                        {ECOICO_EXAMPLES[currentGroupId]?.map((item, idx) => {
                                            if (currentGroupId === 4) {
                                                // Renderizar negrito para o grupo 4
                                                const parts = item.split('**');
                                                return (
                                                    <span key={idx} className="stimulus-item">
                                                        {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}
                                                        {idx < ECOICO_EXAMPLES[currentGroupId].length - 1 && <span className="separator">·</span>}
                                                    </span>
                                                );
                                            }
                                            if (currentGroupId === 5) {
                                                return <div key={idx} className="stimulus-item-full">• {item}</div>;
                                            }
                                            return (
                                                <span key={idx} className="stimulus-item">
                                                    {item}
                                                    {idx < ECOICO_EXAMPLES[currentGroupId].length - 1 && <span className="separator">·</span>}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <p className="examples-footer">
                                        *Os exemplos apresentados são apenas orientativos e não constituem lista normativa de estímulos.
                                        A avaliação ecoica baseia-se na qualidade funcional da resposta verbal, conforme os princípios do VB-MAPP.
                                    </p>
                                </div>
                            </details>
                        </div>

                        {currentResult.completed ? (
                            <div className="group-summary">
                                <div className={`result-box ${currentResult.passed ? 'passed' : 'failed'}`}>
                                    <div className="result-icon">
                                        {currentResult.passed ? '✅' : '❌'}
                                    </div>
                                    <h3>{currentResult.passed ? 'Nível Aprovado!' : 'Nível Não Atingido'}</h3>
                                    <p>{currentResult.passed ? 'Desempenho proficiente' : 'Desempenho abaixo do critério'}</p>
                                    {!currentDef.qualitative_only && (
                                        <div className="stats">
                                            <span className="stat">
                                                <strong>{currentResult.correct}</strong>/{currentResult.attempts} acertos
                                            </span>
                                            <span className="stat">
                                                <strong>{currentResult.attempts > 0 ? Math.round((currentResult.correct / currentResult.attempts) * 100) : 0}%</strong> taxa
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {currentResult.notes && (
                                    <div className="notes-view">
                                        <strong>Observações:</strong> {currentResult.notes}
                                    </div>
                                )}

                                {currentResult.passed && currentGroupId < 5 ? (
                                    <button
                                        className="btn btn-primary btn-large"
                                        onClick={() => setCurrentGroupId(prev => prev + 1)}
                                    >
                                        Avançar para Nível {currentGroupId + 1} →
                                    </button>
                                ) : !currentResult.passed ? (
                                    <div className="stop-message">
                                        <p>⚠️ Como a criança não atingiu o critério neste nível,
                                            recomenda-se encerrar a avaliação ecoica aqui.</p>
                                        <button
                                            className="btn btn-success"
                                            onClick={handleFinalizeSubtest}
                                        >
                                            Finalizar Subteste Ecoico
                                        </button>
                                    </div>
                                ) : (
                                    <div className="complete-message">
                                        <p>🎉 Todos os níveis foram avaliados!</p>
                                        <button
                                            className="btn btn-success"
                                            onClick={handleFinalizeSubtest}
                                        >
                                            Finalizar Subteste Ecoico
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="evaluation-area">
                                {!currentDef.qualitative_only ? (
                                    <div className="scoring">
                                        <div className="instruction-box">
                                            <p>Apresente estímulos verbais que sigam o padrão fonético do nível e registre se a criança emite resposta ecoica funcional.</p>
                                        </div>

                                        <div className="counters">
                                            <div className="count-item">
                                                <span className="val">{currentResult.attempts || 0}</span>
                                                <span className="lbl">Tentativas</span>
                                            </div>
                                            <div className="count-item correct">
                                                <span className="val">{currentResult.correct || 0}</span>
                                                <span className="lbl">Acertos</span>
                                            </div>
                                            <div className="count-item rate">
                                                <span className="val">
                                                    {currentResult.attempts > 0
                                                        ? Math.round((currentResult.correct / currentResult.attempts) * 100)
                                                        : 0}%
                                                </span>
                                                <span className="lbl">Taxa</span>
                                            </div>
                                        </div>

                                        <div className="stimulus-card-area">
                                            {(() => {
                                                const stimuli = ECOICO_EXAMPLES[currentGroupId] || [];
                                                const attempts = currentResult.attempts || 0;
                                                const isFinished = attempts >= stimuli.length;

                                                return (
                                                    <div className={`stimulus-card ${isFinished ? 'finished' : ''}`}>
                                                        <span className="card-label">
                                                            {isFinished ? "Nível Concluído" : "Apresente o estímulo:"}
                                                        </span>
                                                        <div className="stimulus-display">
                                                            {(() => {
                                                                if (isFinished) return "✓";
                                                                const text = stimuli[attempts] || "---";
                                                                if (currentGroupId === 4) {
                                                                    const parts = text.split('**');
                                                                    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
                                                                }
                                                                return text;
                                                            })()}
                                                        </div>
                                                        <div className="stimulus-counter">
                                                            {isFinished
                                                                ? "Todos os estímulos deste nível foram apresentados"
                                                                : `Item ${attempts + 1} de ${stimuli.length}`
                                                            }
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            <p className="clinical-disclaimer">
                                                “Os estímulos apresentados são padronizados para controle experimental.
                                                A avaliação considera a correspondência ecoica funcional, não a palavra em si.”
                                            </p>
                                        </div>

                                        {(() => {
                                            const stimuli = ECOICO_EXAMPLES[currentGroupId] || [];
                                            const isFinished = (currentResult.attempts || 0) >= stimuli.length;

                                            return (
                                                <div className="buttons-grid">
                                                    <button
                                                        className={`btn-score err ${isFinished ? 'disabled' : ''}`}
                                                        onClick={() => handleAttempt(false)}
                                                        disabled={isReadOnly || isFinished}
                                                    >
                                                        ✗ Não corresponde ao padrão
                                                    </button>
                                                    <button
                                                        className={`btn-score ok ${isFinished ? 'disabled' : ''}`}
                                                        onClick={() => handleAttempt(true)}
                                                        disabled={isReadOnly || isFinished}
                                                    >
                                                        ✓ Resposta ecoica funcional
                                                    </button>
                                                </div>
                                            );
                                        })()}

                                        <div className="group-actions">
                                            <textarea
                                                placeholder="Observações do nível (opcional)..."
                                                value={localNotes}
                                                onChange={e => setLocalNotes(e.target.value)}
                                                disabled={isReadOnly}
                                            />
                                            <button
                                                className="btn btn-primary btn-full"
                                                onClick={handleFinalizeGroup}
                                                disabled={isReadOnly}
                                            >
                                                Finalizar Nível {currentGroupId}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="qualitative">
                                        <div className="instruction-box">
                                            <p>Esta etapa é <strong>qualitativa</strong>. Avalie se a prosódia
                                                (ritmo, entonação e ênfase) está adequada para a faixa etária.</p>
                                        </div>

                                        <textarea
                                            placeholder="Descreva a qualidade da prosódia observada..."
                                            value={localNotes}
                                            onChange={e => setLocalNotes(e.target.value)}
                                            disabled={isReadOnly}
                                        />

                                        <div className="buttons-grid">
                                            <button
                                                className="btn-score err"
                                                onClick={() => setQualitative(false)}
                                                disabled={isReadOnly}
                                            >
                                                ✗ INADEQUADA
                                            </button>
                                            <button
                                                className="btn-score ok"
                                                onClick={() => setQualitative(true)}
                                                disabled={isReadOnly}
                                            >
                                                ✓ ADEQUADA
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="clinical-info">
                        <h3>📋 Nota Clínica e Auditoria</h3>
                        <p>O subteste ecoico avalia a capacidade de repetição verbal funcional.
                            Cada tentativa agora registra o estímulo apresentado para fins de auditoria clínica.</p>
                        <p>Os estímulos ecoicos são variados e avaliados conforme correspondência funcional ao padrão fonético do nível, com registro individual por tentativa.</p>
                        <p>A avaliação deve ser interrompida quando a criança falha em um nível, pois isso indica o teto atual de seu repertório ecoico.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}

function getStyles() {
    return `
    .ecoico-screen { 
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); 
        min-height: 100vh; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    }

    .ecoico-header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem 2rem; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        flex-wrap: wrap;
        gap: 1rem;
    }

    .header-info h1 { 
        margin: 0; 
        font-size: 1.5rem; 
        font-weight: 700;
    }

    .header-info .subtitle {
        margin: 0.25rem 0 0;
        opacity: 0.9;
        font-size: 0.9rem;
    }

    .badge { 
        background: rgba(255,255,255,0.2); 
        color: white; 
        padding: 4px 12px; 
        border-radius: 20px; 
        font-size: 0.7rem; 
        font-weight: bold; 
        display: inline-block;
        margin-bottom: 0.5rem;
    }

    .header-actions {
        display: flex;
        gap: 0.75rem;
    }

    .progress-bar-container {
        background: white;
        padding: 1rem 2rem;
        border-bottom: 1px solid #e0e0e0;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.5rem;
    }

    .passed-info {
        color: #4caf50;
        font-weight: 600;
    }

    .progress-bar {
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .ecoico-layout { 
        display: grid; 
        grid-template-columns: 280px 1fr; 
        gap: 2rem; 
        padding: 2rem; 
        max-width: 1200px; 
        margin: 0 auto; 
    }

    @media (max-width: 900px) {
        .ecoico-layout {
            grid-template-columns: 1fr;
        }
    }

    .ecoico-sidebar { 
        display: flex; 
        flex-direction: column; 
        gap: 0.75rem; 
    }

    .ecoico-sidebar h3 {
        margin: 0 0 0.5rem;
        color: #333;
        font-size: 1rem;
    }

    .nav-item { 
        background: #fff; 
        border: 2px solid #e0e0e0; 
        border-radius: 12px; 
        padding: 1rem; 
        text-align: left; 
        cursor: pointer; 
        transition: all 0.2s; 
    }

    .nav-item:hover:not(.locked) { 
        border-color: #667eea; 
        background: #f8f9ff; 
        transform: translateY(-2px);
    }

    .nav-item.active { 
        border-color: #667eea; 
        background: #eef0ff;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .nav-item.passed { 
        border-left: 5px solid #4caf50; 
    }

    .nav-item.failed { 
        border-left: 5px solid #f44336; 
    }

    .nav-item.locked { 
        opacity: 0.5; 
        cursor: not-allowed; 
        background: #f5f5f5; 
    }

    .nav-top { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 4px; 
    }

    .lvl { 
        font-size: 0.7rem; 
        font-weight: bold; 
        color: #666; 
        text-transform: uppercase;
    }

    .label { 
        font-weight: 600; 
        color: #333; 
        display: block;
    }

    .attempts-info {
        font-size: 0.75rem;
        color: #999;
        display: block;
        margin-top: 4px;
    }

    .lock-msg { 
        font-size: 0.7rem; 
        color: #999; 
        display: block; 
        margin-top: 4px; 
    }

    .sidebar-note {
        margin-top: 1rem;
        padding: 1rem;
        background: #fff3cd;
        border-radius: 8px;
        font-size: 0.8rem;
        color: #856404;
    }

    .sidebar-note p {
        margin: 0;
    }

    .group-card { 
        background: #fff; 
        border-radius: 16px; 
        border: 1px solid #e0e0e0; 
        overflow: hidden; 
        box-shadow: 0 4px 20px rgba(0,0,0,0.05); 
    }

    .card-header { 
        padding: 1.5rem 2rem; 
        border-bottom: 1px solid #eee; 
        background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
    }

    .card-title {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    .level-badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
    }

    .card-header h2 { 
        margin: 0; 
        font-size: 1.5rem; 
        color: #1a1a1a; 
    }

    .card-header p { 
        margin: 0.5rem 0 0; 
        color: #666; 
        font-size: 0.9rem; 
    }

    .threshold-info {
        background: #e3f2fd;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.85rem !important;
        color: #1565c0 !important;
        margin-top: 1rem !important;
    }

    .evaluation-area, .group-summary { 
        padding: 2rem; 
    }

    .instruction-box {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }

    .instruction-box p {
        margin: 0;
        color: #555;
    }

    .scoring { 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        gap: 2rem; 
    }

    .counters { 
        display: flex; 
        gap: 2rem; 
        justify-content: center;
    }

    .count-item { 
        text-align: center;
        background: #f8f9fa;
        padding: 1.5rem 2rem;
        border-radius: 12px;
        min-width: 100px;
    }

    .count-item.correct {
        background: #e8f5e9;
    }

    .count-item.rate {
        background: #e3f2fd;
    }

    .count-item .val { 
        font-size: 2.5rem; 
        font-weight: 800; 
        display: block; 
        color: #333;
    }

    .count-item .lbl { 
        font-size: 0.75rem; 
        color: #666; 
        text-transform: uppercase; 
        letter-spacing: 1px; 
    }

    .buttons-grid { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 1rem; 
        width: 100%;
        max-width: 400px;
    }

    .btn-score { 
        height: 80px; 
        border-radius: 12px; 
        border: none; 
        font-weight: bold; 
        font-size: 1.1rem; 
        cursor: pointer; 
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .btn-score:active { 
        transform: scale(0.95); 
    }

    .btn-score:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-score.ok { 
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); 
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .btn-score.ok:hover:not(:disabled) {
        background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
    }

    .btn-score.err { 
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); 
        color: white;
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
    }

    .btn-score.err:hover:not(:disabled) {
        background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
    }

    .group-actions { 
        width: 100%; 
        display: flex; 
        flex-direction: column; 
        gap: 1rem;
        max-width: 400px;
    }

    textarea { 
        width: 100%; 
        border: 2px solid #e0e0e0; 
        border-radius: 10px; 
        padding: 1rem; 
        font-family: inherit; 
        resize: vertical; 
        box-sizing: border-box;
        min-height: 80px;
        transition: border-color 0.2s;
    }

    textarea:focus {
        outline: none;
        border-color: #667eea;
    }

    textarea:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
    }

    .btn-full { 
        padding: 1rem; 
        font-size: 1rem; 
    }

    .result-box { 
        padding: 2rem; 
        border-radius: 12px; 
        text-align: center; 
        margin-bottom: 1.5rem;
    }

    .result-box.passed { 
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); 
        border: 2px solid #a5d6a7; 
    }

    .result-box.failed { 
        background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); 
        border: 2px solid #ef9a9a; 
    }

    .result-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }

    .result-box h3 {
        margin: 0 0 0.5rem;
        font-size: 1.3rem;
    }

    .result-box.passed h3 { color: #2e7d32; }
    .result-box.failed h3 { color: #c62828; }

    .result-box p {
        margin: 0;
        color: #666;
    }

    .result-box .stats {
        display: flex;
        gap: 2rem;
        justify-content: center;
        margin-top: 1rem;
    }

    .result-box .stat {
        font-size: 0.9rem;
        color: #555;
    }

    .notes-view { 
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-size: 0.9rem; 
        color: #555;
    }

    /* REGISTRO DE ESTÍMULO - CARDS */
    .stimulus-card-area {
        width: 100%;
        max-width: 500px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 2rem;
    }

    .stimulus-card {
        background: white;
        border: 2px solid #667eea;
        border-radius: 20px;
        padding: 2rem;
        text-align: center;
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: transform 0.2s;
    }

    .stimulus-card:hover {
        transform: translateY(-4px);
    }

    .stimulus-card.finished {
        border-color: #4caf50;
        background: #f0fdf4;
    }

    .stimulus-card.finished .stimulus-display {
        color: #2e7d32;
    }

    .card-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .stimulus-display {
        font-size: 3.5rem;
        font-weight: 800;
        color: #1a202c;
        line-height: 1.2;
        word-break: break-all;
    }

    .stimulus-counter {
        font-size: 0.85rem;
        color: #94a3b8;
        font-weight: 600;
    }

    .clinical-disclaimer {
        font-size: 0.8rem;
        font-style: italic;
        color: #64748b;
        text-align: center;
        padding: 0 1rem;
        line-height: 1.5;
    }

    .btn-score.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(1);
    }

    .stop-message, .complete-message {
        text-align: center;
        padding: 1.5rem;
        background: #fff8e1;
        border-radius: 12px;
        border: 1px solid #ffe082;
    }

    .complete-message {
        background: #e8f5e9;
        border-color: #a5d6a7;
    }

    .stop-message p, .complete-message p {
        margin: 0 0 1rem;
        color: #666;
    }

    .btn-large {
        padding: 1rem 2rem;
        font-size: 1.1rem;
    }

    .qualitative {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }

    .qualitative textarea {
        width: 100%;
        max-width: 500px;
        min-height: 100px;
    }

    .clinical-info { 
        margin-top: 2rem; 
        padding: 1.5rem; 
        background: #fff; 
        border-radius: 12px; 
        border: 1px solid #e0e0e0;
    }

    .clinical-info h3 { 
        margin: 0 0 0.75rem; 
        font-size: 1rem;
        color: #333;
    }

    .clinical-info p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
        line-height: 1.6;
    }

    /* EXEMPLOS SUGERIDOS */
    .examples-block {
        padding: 0 2rem 1rem;
        border-bottom: 1px solid #eee;
        background: #fafafa;
    }

    .examples-block details {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
    }

    .examples-block summary {
        padding: 12px 16px;
        font-size: 0.9rem;
        font-weight: 700;
        color: #475569;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f1f5f9;
        user-select: none;
    }

    .examples-block summary:hover {
        background: #e2e8f0;
    }

    .summary-icon {
        font-size: 1.1rem;
    }

    .examples-content {
        padding: 16px;
    }

    .stimuli-note {
        font-size: 0.85rem;
        color: #64748b;
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .stimuli-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        align-items: baseline;
    }

    .stimulus-item {
        font-size: 0.95rem;
        color: #334155;
    }

    .stimulus-item-full {
        width: 100%;
        font-size: 0.9rem;
        color: #334155;
        margin-bottom: 4px;
        border-left: 3px solid #667eea;
        padding-left: 10px;
    }

    .separator {
        color: #cbd5e1;
        margin-left: 12px;
        font-weight: bold;
    }

    .examples-footer {
        margin: 16px 0 0;
        font-size: 0.8rem;
        font-style: italic;
        color: #64748b;
        line-height: 1.4;
        border-top: 1px dashed #e2e8f0;
        padding-top: 12px;
    }

    @media (max-width: 600px) {
        .examples-block {
            padding: 0 1rem 1rem;
        }
    }

    .btn { 
        padding: 0.75rem 1.5rem; 
        border-radius: 8px; 
        border: none; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.2s;
        font-size: 0.95rem;
    }

    .btn:hover:not(:disabled) { 
        transform: translateY(-1px);
    }

    .btn:disabled, .btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-primary { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary { 
        background: #fff; 
        color: #333;
        border: 2px solid #e0e0e0;
    }

    .btn-secondary:hover:not(:disabled) {
        background: #f5f5f5;
    }

    .btn-success { 
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); 
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
    `;
}