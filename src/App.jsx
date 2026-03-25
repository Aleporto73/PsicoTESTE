import React, { useState, useCallback } from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import SessionController from './SessionController';
import VBMAPP_DATA from './data/milestones';
import PsicoTestesLayout from './components/layout/PsicoTestesLayout';
import PsicoTestesContainer from './components/layout/PsicoTestesContainer';
import PacientesScreen from './components/screens/PacientesScreen';
import InstrumentCatalogScreen from './components/screens/InstrumentCatalogScreen';
import CadastroSimples from './components/screens/CadastroSimples';
import { ClipboardList, Activity, Users } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', icon: ClipboardList, label: 'Painel de Avaliações' },
  { id: 'pacientes', icon: Users, label: 'Pacientes' },
  { id: 'instruments', icon: Activity, label: 'Instrumentos' },
];

function AppContent() {
  const {
    sessions,
    selectedSession,
    viewMode,
    refreshTrigger,
    showCadastro,
    setShowCadastro,
    startNewEvaluation,
    saveCadastro,
    selectSession,
    selectInstrument,
    setViewMode,
  } = useSession();

  // Aba ativa no header
  const [activeTab, setActiveTab] = useState('dashboard');

  // Instrumento pendente (quando vem do catálogo → novo paciente)
  const [pendingInstrument, setPendingInstrument] = useState(null);

  // Navegação do header
  const handleNav = useCallback((view) => {
    if (view === 'dashboard' || view === 'pacientes' || view === 'instruments') {
      setActiveTab(view);
      setShowCadastro(false);
      setPendingInstrument(null);
      if (viewMode !== 'sessions') setViewMode('sessions');
    }
  }, [viewMode, setViewMode, setShowCadastro]);

  // Fluxo: Catálogo → Paciente existente + Instrumento
  const handleSelectPatientAndInstrument = useCallback((session, instrumentId) => {
    selectSession(session);
    // Pequeno delay pra garantir que selectSession settou o estado
    setTimeout(() => selectInstrument(instrumentId), 50);
  }, [selectSession, selectInstrument]);

  // Fluxo: Catálogo → Novo Paciente (com instrumento pré-selecionado)
  const handleNewPatientWithInstrument = useCallback((instrumentId) => {
    setPendingInstrument(instrumentId);
    setShowCadastro(true);
  }, [setShowCadastro]);

  // Override do saveCadastro quando tem instrumento pendente
  const handleSaveCadastro = useCallback((dados) => {
    saveCadastro(dados);
    if (pendingInstrument) {
      // Após criar sessão, selecionar o instrumento pendente
      setTimeout(() => selectInstrument(pendingInstrument), 100);
      setPendingInstrument(null);
    }
  }, [saveCadastro, pendingInstrument, selectInstrument]);

  // ══════════════════════════════════════════════════
  // MODO DASHBOARD / PACIENTES / INSTRUMENTOS
  // ══════════════════════════════════════════════════
  if (viewMode === 'sessions' && !showCadastro) {
    let content;

    if (activeTab === 'pacientes') {
      content = (
        <PacientesScreen
          sessions={sessions}
          onSelectSession={selectSession}
        />
      );
    } else if (activeTab === 'instruments') {
      content = (
        <InstrumentCatalogScreen
          sessions={sessions}
          onSelectPatientAndInstrument={handleSelectPatientAndInstrument}
          onNewPatientWithInstrument={handleNewPatientWithInstrument}
        />
      );
    } else {
      content = (
        <PsicoTestesContainer
          sessions={sessions}
          onStartNewEvaluation={startNewEvaluation}
          onSelectSession={selectSession}
        />
      );
    }

    return (
      <PsicoTestesLayout
        activeView={activeTab}
        setActiveView={handleNav}
        menuItems={menuItems}
      >
        {content}
      </PsicoTestesLayout>
    );
  }

  // ══════════════════════════════════════════════════
  // MODO CADASTRO
  // ══════════════════════════════════════════════════
  if (showCadastro) {
    return (
      <PsicoTestesLayout
        activeView={activeTab}
        setActiveView={handleNav}
        menuItems={menuItems}
      >
        <CadastroSimples
          onSave={handleSaveCadastro}
          onCancel={() => {
            setShowCadastro(false);
            setPendingInstrument(null);
          }}
        />
      </PsicoTestesLayout>
    );
  }

  // ══════════════════════════════════════════════════
  // MODO AVALIAÇÃO (qualquer instrumento)
  // ══════════════════════════════════════════════════
  return (
    <div className="app-container" key={`app-${refreshTrigger}`}>
      <SessionController
        data={VBMAPP_DATA}
        includeGraphs={true}
        includePEI={false}
        templateVersion="v3"
      />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
