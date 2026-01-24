import React, { useState, useEffect } from 'react';
import SessionController from './SessionController';
import VBMAPP_DATA from './data';  // ✅ IMPORTA OS 154 BLOCOS DO data.js

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewMode, setViewMode] = useState('sessions');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ✅ LOG para debug
  useEffect(() => {
    console.log("🎯 App inicializado com:", {
      dadosCarregados: !!VBMAPP_DATA,
      dominios: VBMAPP_DATA?.domains?.length || 0,
      totalBlocos: VBMAPP_DATA?.domains?.reduce((acc, d) => acc + (d.blocks?.length || 0), 0) || 0
    });
  }, []);

  // 1. Persistência - Carregar sessões salvas
  useEffect(() => {
    const saved = localStorage.getItem('vbmapp_sessions');
    if (saved) {
      try {
        const parsedSessions = JSON.parse(saved);
        setSessions(parsedSessions);
        console.log("📂 Sessões carregadas:", parsedSessions.length);
      } catch (e) {
        console.error("Erro ao carregar sessões:", e);
        localStorage.removeItem('vbmapp_sessions');
      }
    }
  }, []);

  // 2. Persistência - Salvar automaticamente
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('vbmapp_sessions', JSON.stringify(sessions));
      console.log("💾 Sessões salvas:", sessions.length);
    }
  }, [sessions]);

  // 3. Iniciar Nova Avaliação
  const handleStartNewEvaluation = () => {
    const newSession = {
      session_id: `session_${Date.now()}`,
      child_name: "Nova Criança",
      child_age: "5 anos",
      date: new Date().toISOString(),
      scores_snapshot: {},
      lacunas: [],
      milestones_completo: false,
      tarefas_completas: false,
      barreiras_completas: false,
      transicao_completa: false,
      pei_completo: false,
      sessao_fechada: false,
      lastUpdated: new Date().toISOString()
    };

    console.log("🚀 Nova sessão criada:", newSession.session_id);

    setSessions(prev => [newSession, ...prev]);
    setSelectedSession(newSession);
    setViewMode('evaluation');
    setRefreshTrigger(prev => prev + 1);
  };

  // 4. Atualização da Sessão
  const handleUpdateSession = (updatedData) => {
    if (!selectedSession) {
      console.error("❌ Não há sessão selecionada para atualizar");
      return;
    }

    console.log("🔄 Atualizando sessão:", updatedData);

    const updatedSession = {
      ...selectedSession,
      ...updatedData,
      lastUpdated: new Date().toISOString()
    };

    // Atualização síncrona
    setSelectedSession(updatedSession);
    setSessions(prev => prev.map(s =>
      s.session_id === selectedSession.session_id ? updatedSession : s
    ));
    setRefreshTrigger(prev => prev + 1);

    // Persistência
    setTimeout(() => {
      try {
        const allSessions = JSON.parse(localStorage.getItem('vbmapp_sessions') || '[]');
        const updatedSessions = allSessions.map(s =>
          s.session_id === selectedSession.session_id ? updatedSession : s
        );
        localStorage.setItem('vbmapp_sessions', JSON.stringify(updatedSessions));
      } catch (error) {
        console.error("❌ Erro ao persistir:", error);
      }
    }, 100);

    return updatedSession;
  };

  // 5. Voltar à lista
  const handleBackToList = () => {
    setSelectedSession(null);
    setViewMode('sessions');
    setRefreshTrigger(prev => prev + 1);
  };

  // 6. Selecionar sessão existente
  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setViewMode('evaluation');
    setRefreshTrigger(prev => prev + 1);
  };

  console.log("🎮 App - Estado:", {
    viewMode,
    selectedSessionId: selectedSession?.session_id,
    sessionsCount: sessions.length,
    dadosVB: `${VBMAPP_DATA.domains.length} domínios, ${VBMAPP_DATA.domains.reduce((acc, d) => acc + d.blocks.length, 0)} blocos`
  });

  return (
    <div className="app-container" key={`app-${refreshTrigger}`}>
      <SessionController
        viewMode={viewMode}
        setViewMode={setViewMode}
        sessions={sessions}
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
        onStartNewEvaluation={handleStartNewEvaluation}
        onUpdateSession={handleUpdateSession}
        onBackToList={handleBackToList}
        onSelectSession={handleSelectSession}
        data={VBMAPP_DATA}
        includeGraphs={true}
        includePEI={false}
        templateVersion="v3"
      />
    </div>
  );
}