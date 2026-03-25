import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEY } from '../data/constants';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewMode, setViewMode] = useState('sessions');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCadastro, setShowCadastro] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState(null);

  // Carregar sessões do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedSessions = JSON.parse(saved);
        setSessions(parsedSessions);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Salvar sessões no localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const startNewEvaluation = useCallback(() => {
    setShowCadastro(true);
  }, []);

  // Após cadastro: vai para seletor de instrumento
  const saveCadastro = useCallback((dados) => {
    const newSession = {
      session_id: `session_${Date.now()}`,
      child_name: dados.child_name,
      child_age: dados.child_age,                        // "4 anos e 3 meses"
      child_age_months: dados.child_age_months || null,   // "51 meses"
      child_age_total_months: dados.child_age_total_months || null, // 51 (número)
      genero: dados.genero || null,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      // Multi-instrumento
      instruments: [],
      // VB-MAPP campos legados (retrocompatibilidade)
      scores_snapshot: {},
      lacunas: [],
      barreiras: [],
      milestones_completo: false,
      tarefas_completas: false,
      barreiras_completas: false,
      transicao_completa: false,
      pei_completo: false,
      pei_plan: null,
      sessao_fechada: false,
      lastUpdated: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    setSelectedSession(newSession);
    setShowCadastro(false);
    setCurrentInstrument(null);
    setViewMode('instrument_selector');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Selecionar instrumento para aplicar
  const selectInstrument = useCallback((instrumentId) => {
    setCurrentInstrument(instrumentId);
    if (instrumentId === 'vbmapp') {
      setViewMode('evaluation');
    } else {
      setViewMode('instrument_evaluation');
    }
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Concluir instrumento (para testes simples)
  const completeInstrument = useCallback((instrumentId, data) => {
    setSelectedSession(prev => {
      if (!prev) return prev;

      const newInstrument = {
        instrument_id: instrumentId,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        data: data,
      };

      const updatedSession = {
        ...prev,
        instruments: [...(prev.instruments || []), newInstrument],
        lastUpdated: new Date().toISOString(),
      };

      setSessions(prevSessions => {
        const newSessions = prevSessions.map(s =>
          s.session_id === prev.session_id ? updatedSession : s
        );
        setTimeout(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
          } catch (error) {
            console.error("Erro ao persistir:", error);
          }
        }, 100);
        return newSessions;
      });

      setRefreshTrigger(t => t + 1);
      return updatedSession;
    });

    setCurrentInstrument(null);
    setViewMode('instrument_dashboard');
  }, []);

  const updateSession = useCallback((updatedData) => {
    setSelectedSession(prev => {
      if (!prev) return prev;
      const updatedSession = {
        ...prev,
        ...updatedData,
        lastUpdated: new Date().toISOString()
      };

      setSessions(prevSessions => {
        const newSessions = prevSessions.map(s =>
          s.session_id === prev.session_id ? updatedSession : s
        );
        setTimeout(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
          } catch (error) {
            console.error("Erro ao persistir:", error);
          }
        }, 100);
        return newSessions;
      });

      setRefreshTrigger(t => t + 1);
      return updatedSession;
    });
  }, []);

  const backToList = useCallback(() => {
    setSelectedSession(null);
    setShowCadastro(false);
    setCurrentInstrument(null);
    setViewMode('sessions');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const selectSession = useCallback((session) => {
    setSelectedSession(session);
    setCurrentInstrument(null);
    // Se a sessão tem instrumentos, vai para o dashboard; senão, seletor
    if (session.instruments && session.instruments.length > 0) {
      setViewMode('instrument_dashboard');
    } else if (session.milestones_completo || session.sessao_fechada) {
      // Sessão legada VB-MAPP
      setViewMode('evaluation');
    } else {
      setViewMode('instrument_selector');
    }
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const getHistoricoSessoes = useCallback((childName) => {
    return sessions.filter(s =>
      s.child_name === childName &&
      s.session_id !== selectedSession?.session_id
    );
  }, [sessions, selectedSession]);

  // Buscar avalia\u00e7\u00f5es de um instrumento espec\u00edfico para uma crian\u00e7a (AV1-AV4)
  const getInstrumentHistory = useCallback((childName, instrumentId) => {
    return sessions
      .filter(s => s.child_name === childName)
      .map(s => {
        const inst = (s.instruments || []).find(i => i.instrument_id === instrumentId && i.status === 'completed');
        if (!inst) return null;
        return {
          session_id: s.session_id,
          child_name: s.child_name,
          child_age: s.child_age,
          date: s.date || s.created_at,
          instrument: inst,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4) // M\u00e1x 4 avalia\u00e7\u00f5es (AV1-AV4)
      .map((item, idx) => ({ ...item, avLabel: `AV${idx + 1}` }));
  }, [sessions]);

  const value = useMemo(() => ({
    // State
    sessions,
    selectedSession,
    viewMode,
    refreshTrigger,
    showCadastro,
    currentInstrument,
    // Setters
    setViewMode,
    setSelectedSession,
    setShowCadastro,
    setCurrentInstrument,
    // Actions
    startNewEvaluation,
    saveCadastro,
    updateSession,
    backToList,
    selectSession,
    selectInstrument,
    completeInstrument,
    getHistoricoSessoes,
    getInstrumentHistory,
  }), [sessions, selectedSession, viewMode, refreshTrigger, showCadastro, currentInstrument,
    startNewEvaluation, saveCadastro, updateSession, backToList, selectSession, selectInstrument, completeInstrument, getHistoricoSessoes, getInstrumentHistory]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession deve ser usado dentro de um SessionProvider');
  }
  return context;
}

export default SessionContext;
