import React, { useState, useEffect } from 'react';
import PsicoTestesLayout from './PsicoTestesLayout';
import PsicoTestesContainer from './PsicoTestesContainer';
import CadastroSimples from './CadastroSimples';
import VBMAPPWrapper from './VBMAPPWrapper';
import { ClipboardList, Activity, FileText, Settings } from 'lucide-react';

// Menu de Testes disponíveis
const TEST_MENU_ITEMS = [
    {
        id: 'dashboard',
        icon: ClipboardList,
        label: 'Painel de Avaliações',
        isNew: false
    },
    {
        id: 'vbmapp',
        icon: Activity,
        label: 'VB-MAPP',
        isNew: false
    },
    // Futuros testes:
    // { id: 'mchat', icon: Stethoscope, label: 'M-CHAT', isNew: true },
    // { id: 'snapiv', icon: ClipboardCheck, label: 'SNAP-IV', isNew: true },
];

const AppPsicoTestes = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [sessions, setSessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [showCadastro, setShowCadastro] = useState(false);

    // Carregar sessões do localStorage ao iniciar
    useEffect(() => {
        const saved = localStorage.getItem('psicotestes_sessions');
        if (saved) {
            try {
                setSessions(JSON.parse(saved));
            } catch (e) {
                console.error('Erro ao carregar sessões:', e);
            }
        }
    }, []);

    // Salvar sessões quando mudar
    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem('psicotestes_sessions', JSON.stringify(sessions));
        }
    }, [sessions]);

    // Iniciar nova avaliação (abre cadastro)
    const handleStartNew = () => {
        setCurrentSession(null);
        setShowCadastro(true);
    };

    // Salvar cadastro e ir para o teste
    const handleSaveCadastro = (dados) => {
        const newSession = {
            session_id: `session_${Date.now()}`,
            ...dados,
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            scores_snapshot: {},
            lacunas: [],
            milestones_completo: false,
            tarefas_completas: false,
            barreiras_completas: false,
            transicao_completa: false,
            pei_completo: false,
            sessao_fechada: false,
            test_type: 'vbmapp' // Identifica qual teste
        };

        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        setShowCadastro(false);
        setActiveView('vbmapp');
    };

    // Selecionar sessão existente
    const handleSelectSession = (session) => {
        setCurrentSession(session);

        // Decide qual view abrir baseado no tipo de teste
        if (session.test_type === 'vbmapp' || !session.test_type) {
            setActiveView('vbmapp');
        }
    };

    // Renderizar conteúdo baseado na view ativa
    const renderContent = () => {
        if (showCadastro) {
            return (
                <CadastroSimples
                    onSave={handleSaveCadastro}
                    onCancel={() => setShowCadastro(false)}
                />
            );
        }

        switch (activeView) {
            case 'dashboard':
                return (
                    <PsicoTestesContainer
                        sessions={sessions}
                        onStartNewEvaluation={handleStartNew}
                        onSelectSession={handleSelectSession}
                    />
                );

            case 'vbmapp':
                return (
                    <VBMAPPWrapper
                        session={currentSession}
                        onBack={() => {
                            setActiveView('dashboard');
                            setCurrentSession(null);
                        }}
                    />
                );

            default:
                return (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Em desenvolvimento
                        </h2>
                        <p className="text-gray-500">
                            Este instrumento estará disponível em breve.
                        </p>
                    </div>
                );
        }
    };

    return (
        <PsicoTestesLayout
            activeView={activeView}
            setActiveView={(view) => {
                setActiveView(view);
                setShowCadastro(false);
                if (view === 'dashboard') setCurrentSession(null);
            }}
            menuItems={TEST_MENU_ITEMS}
        >
            {renderContent()}
        </PsicoTestesLayout>
    );
};

export default AppPsicoTestes;