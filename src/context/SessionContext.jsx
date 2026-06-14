import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { STORAGE_KEY } from '../data/constants';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewMode, setViewMode] = useState('sessions');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCadastro, setShowCadastro] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState(null);

  // Controle de hidratação: só persistimos depois que a carga inicial terminou,
  // para o efeito de salvar não sobrescrever o localStorage com [] antes da carga.
  const hasLoadedStorageRef = useRef(false);

  // Carregar sessões do localStorage
  useEffect(() => {
    // StrictMode (dev) monta o efeito duas vezes; hidratar só uma vez evita
    // reler um storage que o efeito de salvar possa ter tocado nesse meio-tempo.
    if (hasLoadedStorageRef.current) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        let parsedSessions = JSON.parse(saved);
        
        // Mapeamento e Migração Legacy de DOM IDs
        // A versão ESTRUTURAL da migração de domínios vive em domain_schema_version.
        // Payloads filhos (Barreiras/Transição) têm versões próprias e não podem
        // acionar nem invalidar esta migração (Patch 8).
        const DOMAIN_ALIGN_VERSION = "vbmapp-domain-align-v1";
        // Sessões já alinhadas, incluindo as afetadas pelo bug antigo em que
        // payloads sobrescreviam schema_version na raiz:
        const LEGACY_ALIGNED_MARKERS = [
          DOMAIN_ALIGN_VERSION,
          "task_analysis_v2",
          "vbmapp_barreiras_v2",
          "vbmapp_transicao_v2"
        ];
        parsedSessions = parsedSessions.map(session => {
          const isDomainAligned =
            session.domain_schema_version === DOMAIN_ALIGN_VERSION ||
            LEGACY_ALIGNED_MARKERS.includes(session.schema_version);
          if (!isDomainAligned) {
            const migrateDOM = (id) => {
              if (!id || typeof id !== 'string') return id;
              if (id.includes('DOM14')) return id.replace('DOM14', 'DOM15');
              if (id.includes('DOM13')) return id.replace('DOM13', 'DOM14');
              if (id.includes('DOM12')) return id.replace('DOM12', 'DOM16');
              if (id.includes('DOM11')) return id.replace('DOM11', 'DOM13');
              if (id.includes('DOM10')) return id.replace('DOM10', 'DOM12');
              if (id.includes('DOM09')) return id.replace('DOM09', 'DOM11');
              if (id.includes('DOM08')) return id.replace('DOM08', 'DOM10');
              return id;
            };

            const migratedSession = {
              ...session,
              schema_version: DOMAIN_ALIGN_VERSION,
              domain_schema_version: DOMAIN_ALIGN_VERSION
            };

            if (migratedSession.scores_snapshot) {
              const newScores = {};
              for (const [key, value] of Object.entries(migratedSession.scores_snapshot)) {
                newScores[migrateDOM(key)] = value;
              }
              migratedSession.scores_snapshot = newScores;
            }

            if (migratedSession.lacunas) {
              migratedSession.lacunas = migratedSession.lacunas.map(lacuna => ({
                ...lacuna,
                domain_id: migrateDOM(lacuna.domain_id),
                block_id: migrateDOM(lacuna.block_id)
              }));
            }

            if (migratedSession.pei_metas) {
              migratedSession.pei_metas = migratedSession.pei_metas.map(meta => ({
                ...meta,
                domain_id: migrateDOM(meta.domain_id),
                block_id: migrateDOM(meta.block_id)
              }));
            }

            if (migratedSession.transicao?.valores_automaticos) {
              const newTrans = {};
              for (const [key, val] of Object.entries(migratedSession.transicao.valores_automaticos)) {
                newTrans[migrateDOM(key)] = val;
              }
              migratedSession.transicao.valores_automaticos = newTrans;
            }

            return migratedSession;
          }
          // Compatibilidade: sessão já alinhada (inclusive marcada apenas pelo
          // schema_version legado) recebe o campo estrutural dedicado.
          if (session.domain_schema_version !== DOMAIN_ALIGN_VERSION) {
            return { ...session, domain_schema_version: DOMAIN_ALIGN_VERSION };
          }
          return session;
        });

        setSessions(parsedSessions);
      } catch (e) {
        console.error("Erro ao carregar do localStorage:", e);
        // localStorage.removeItem(STORAGE_KEY); // Comentado para evitar perda de dados acidental
      }
    }

    // Hidratação inicial concluída — a partir daqui o efeito de salvar pode persistir.
    hasLoadedStorageRef.current = true;
  }, []);

  // Salvar sessões no localStorage
  useEffect(() => {
    // Enquanto a carga inicial não terminou, não persistir (evita gravar []).
    if (!hasLoadedStorageRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Erro ao salvar sessões no localStorage:", error);
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
      lastUpdated: new Date().toISOString(),
      schema_version: "vbmapp-domain-align-v1",
      domain_schema_version: "vbmapp-domain-align-v1"
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
    // Proteção (Patch 8): payloads filhos não podem sobrescrever as versões
    // estruturais da sessão na raiz (schema_version / domain_schema_version).
    const {
      schema_version: _ignoredSchemaVersion,
      domain_schema_version: _ignoredDomainVersion,
      ...safePayload
    } = updatedData || {};
    setSelectedSession(prev => {
      if (!prev) return prev;
      const updatedSession = {
        ...prev,
        ...safePayload,
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
