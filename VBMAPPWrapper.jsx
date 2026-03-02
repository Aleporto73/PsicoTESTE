import React, { useState } from 'react';
import SessionController from './SessionController';
import VBMAPP_DATA from './data'; // Seu data.js atual

const VBMAPPWrapper = ({ session, onBack }) => {
    // Estados locais para manter compatibilidade com SessionController
    const [sessions, setSessions] = useState(session ? [session] : []);
    const [selectedSession, setSelectedSession] = useState(session);
    const [viewMode, setViewMode] = useState(session ? 'evaluation' : 'sessions');

    // Handlers que conectam com seu SessionController existente
    const handleStartNewEvaluation = () => {
        const newSession = {
            session_id: `session_${Date.now()}`,
            child_name: "Nova Criança",
            child_age: "",
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            scores_snapshot: {},
            lacunas: [],
            milestones_completo: false,
            tarefas_completas: false,
            barreiras_completas: false,
            transicao_completa: false,
            pei_completo: false,
            sessao_fechada: false
        };

        setSessions(prev => [newSession, ...prev]);
        setSelectedSession(newSession);
        setViewMode('evaluation');
    };

    const handleUpdateSession = (updatedData) => {
        if (!selectedSession) return;

        const updated = {
            ...selectedSession,
            ...updatedData,
            lastUpdated: new Date().toISOString()
        };

        setSelectedSession(updated);
        setSessions(prev => prev.map(s =>
            s.session_id === selectedSession.session_id ? updated : s
        ));

        // Persistir no localStorage (se quiser manter compatibilidade)
        localStorage.setItem('vbmapp_sessions', JSON.stringify(
            sessions.map(s => s.session_id === selectedSession.session_id ? updated : s)
        ));
    };

    const handleBackToList = () => {
        setSelectedSession(null);
        setViewMode('sessions');
        if (onBack) onBack();
    };

    const handleSelectSession = (sess) => {
        setSelectedSession(sess);
        setViewMode('evaluation');
    };

    return (
        <div className="vbmapp-wrapper">
            {/* Injetamos seu SessionController exatamente como está */}
            <SessionController
                viewMode={viewMode}
                setViewMode={setViewMode}
                sessions={sessions}
                selectedSession={selectedSession}
                setSelectedSession={setSelectedSession}
                data={VBMAPP_DATA}
                onStartNewEvaluation={handleStartNewEvaluation}
                onUpdateSession={handleUpdateSession}
                onBackToList={handleBackToList}
                onSelectSession={handleSelectSession}
                includeGraphs={true}
                includePEI={false}
                templateVersion="v3"
            />
        </div>
    );
};

export default VBMAPPWrapper;