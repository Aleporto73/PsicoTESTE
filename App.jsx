import React, { useState, useEffect } from 'react';
import SessionController from './SessionController';
import VBMAPP_DATA from './data';
import PsicoTestesLayout from './PsicoTestesLayout';
import PsicoTestesContainer from './PsicoTestesContainer';
import CadastroSimples from './CadastroSimples';
import { ClipboardList, Activity } from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewMode, setViewMode] = useState('sessions');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCadastro, setShowCadastro] = useState(false);

  // Carregar sessões do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vbmapp_sessions');
    if (saved) {
      try {
        const parsedSessions = JSON.parse(saved);
        setSessions(parsedSessions);
      } catch (e) {
        localStorage.removeItem('vbmapp_sessions');
      }
    }
  }, []);

  // Salvar sessões no localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('vbmapp_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleStartNewEvaluation = () => {
    setShowCadastro(true);
  };

  const handleSaveCadastro = (dados) => {
    const newSession = {
      session_id: `session_${Date.now()}`,
      child_name: dados.child_name,
      child_age: dados.child_age,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      scores_snapshot: {},
      lacunas: [],
      barreiras: [],
      milestones_completo: false,
      tarefas_completas: false,
      barreiras_completas: false,
      transicao_completa: false,
      pei_completo: false,
      sessao_fechada: false,
      lastUpdated: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    setSelectedSession(newSession);
    setShowCadastro(false);
    setViewMode('evaluation');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdateSession = (updatedData) => {
    if (!selectedSession) return;

    const updatedSession = {
      ...selectedSession,
      ...updatedData,
      lastUpdated: new Date().toISOString()
    };

    setSelectedSession(updatedSession);
    setSessions(prev => prev.map(s =>
      s.session_id === selectedSession.session_id ? updatedSession : s
    ));
    setRefreshTrigger(prev => prev + 1);

    // Persistir imediatamente
    setTimeout(() => {
      try {
        const allSessions = JSON.parse(localStorage.getItem('vbmapp_sessions') || '[]');
        const updatedSessions = allSessions.map(s =>
          s.session_id === selectedSession.session_id ? updatedSession : s
        );
        localStorage.setItem('vbmapp_sessions', JSON.stringify(updatedSessions));
      } catch (error) {
        console.error("Erro ao persistir:", error);
      }
    }, 100);

    return updatedSession;
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setShowCadastro(false);
    setViewMode('sessions');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setViewMode('evaluation');
    setRefreshTrigger(prev => prev + 1);
  };

  const getHistoricoSessoes = (childName) => {
    return sessions.filter(s =>
      s.child_name === childName &&
      s.session_id !== selectedSession?.session_id
    );
  };

  const menuItems = [
    { id: 'dashboard', icon: ClipboardList, label: 'Painel de Avaliações' },
    { id: 'vbmapp', icon: Activity, label: 'VB-MAPP' },
  ];

  // ========================================
  // MODO DASHBOARD: Lista com layout bonito
  // ========================================
  if (viewMode === 'sessions' && !showCadastro) {
    return (
      <PsicoTestesLayout
        activeView="dashboard"
        setActiveView={(view) => {
          if (view === 'vbmapp') handleStartNewEvaluation();
        }}
        menuItems={menuItems}
      >
        <PsicoTestesContainer
          sessions={sessions}
          onStartNewEvaluation={handleStartNewEvaluation}
          onSelectSession={handleSelectSession}
        />
      </PsicoTestesLayout>
    );
  }

  // ========================================
  // MODO CADASTRO: Formulário de novo paciente
  // ========================================
  if (showCadastro) {
    return (
      <PsicoTestesLayout
        activeView="dashboard"
        setActiveView={() => { }}
        menuItems={menuItems}
      >
        <CadastroSimples
          onSave={handleSaveCadastro}
          onCancel={() => setShowCadastro(false)}
        />
      </PsicoTestesLayout>
    );
  }

  // ========================================
  // MODO TESTE: VB-MAPP em tela cheia
  // ========================================
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
        getHistoricoSessoes={getHistoricoSessoes}
        data={VBMAPP_DATA}
        includeGraphs={true}
        includePEI={false}
        templateVersion="v3"
      />
    </div>
  );
}