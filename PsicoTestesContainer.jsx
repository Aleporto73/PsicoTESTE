import React, { useState } from 'react';
import {
    MoreVertical,
    Calendar,
    ChevronRight,
    Plus,
    Search,
    ClipboardList
} from 'lucide-react';

// ESTILOS INLINE (CSS-in-JS) - Funciona sem Tailwind
const styles = {
    container: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 4px 0',
    },
    subtitle: {
        color: '#64748b',
        margin: 0,
    },
    btnPrimary: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#1e3a8a',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '14px',
        boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.2)',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
    },
    statHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    statLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '4px',
    },
    statValue: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0',
    },
    statSubtext: {
        fontSize: '13px',
        color: '#94a3b8',
        marginTop: '4px',
    },
    statIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
    },
    mainCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
    },
    cardHeader: {
        padding: '24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#0f172a',
        margin: 0,
    },
    searchContainer: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
    },
    searchBox: {
        position: 'relative',
    },
    searchInput: {
        padding: '10px 12px 10px 40px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        width: '240px',
        outline: 'none',
    },
    select: {
        padding: '10px 12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    listContainer: {
        padding: '24px',
        backgroundColor: '#f8fafc',
    },
    patientRow: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'box-shadow 0.2s',
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fcd34d, #fb923c)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        color: '#374151',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flexShrink: 0,
    },
    patientInfo: {
        flex: 1,
        minWidth: 0,
    },
    patientName: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px',
    },
    name: {
        fontWeight: '600',
        color: '#0f172a',
        fontSize: '16px',
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '500',
    },
    badgeBlue: {
        backgroundColor: '#dbeafe',
        color: '#1d4ed8',
    },
    badgeGreen: {
        backgroundColor: '#dcfce7',
        color: '#15803d',
    },
    metaInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#64748b',
    },
    progressContainer: {
        width: '128px',
        display: 'none',
    },
    progressBar: {
        height: '8px',
        backgroundColor: '#e2e8f0',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginTop: '4px',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1e3a8a',
        borderRadius: '9999px',
        transition: 'width 0.5s',
    },
    actions: {
        display: 'flex',
        gap: '8px',
    },
    btnAction: {
        padding: '8px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        color: '#64748b',
    },
    btnContinue: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 16px',
        backgroundColor: '#1e3a8a',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    emptyState: {
        textAlign: 'center',
        padding: '48px',
    },
    emptyIcon: {
        width: '64px',
        height: '64px',
        backgroundColor: '#f1f5f9',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
    },
    link: {
        color: '#1e3a8a',
        fontWeight: '500',
        textDecoration: 'none',
    },
};

// Componente Avatar
const PacienteAvatar = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div style={styles.avatar}>
            {initial}
        </div>
    );
};

// Card de Estatística
const StatCard = ({ emoji, label, value, subtext, bgColor }) => {
    return (
        <div style={styles.statCard}>
            <div style={styles.statHeader}>
                <div>
                    <p style={styles.statLabel}>{label}</p>
                    <h3 style={styles.statValue}>{value}</h3>
                    <p style={styles.statSubtext}>{subtext}</p>
                </div>
                <div style={{ ...styles.statIcon, backgroundColor: bgColor }}>
                    {emoji}
                </div>
            </div>
        </div>
    );
};

// Linha de paciente
const PacienteRow = ({ session, onSelect }) => {
    const dataFormatada = new Date(session.date).toLocaleDateString('pt-BR');
    const isFinalizada = session.sessao_fechada;

    const progresso = session.milestones_completo
        ? (session.tarefas_completas
            ? (session.barreiras_completas
                ? (session.pei_completo ? 100 : 80)
                : 60)
            : 40)
        : 20;

    return (
        <div style={styles.patientRow}>
            <PacienteAvatar name={session.child_name} />

            <div style={styles.patientInfo}>
                <div style={styles.patientName}>
                    <h4 style={styles.name}>
                        {session.child_name || "Sem nome"}
                    </h4>
                    <span style={{
                        ...styles.badge,
                        ...(isFinalizada ? styles.badgeGreen : styles.badgeBlue)
                    }}>
                        {isFinalizada ? 'Finalizada' : 'Em andamento'}
                    </span>
                </div>

                <div style={styles.metaInfo}>
                    <Calendar size={14} />
                    <span>{dataFormatada}</span>
                    <span>•</span>
                    <span>{session.child_age || "Idade não informada"}</span>
                    <span>•</span>
                    <span>{Object.keys(session.scores_snapshot || {}).length} marcos</span>
                </div>
            </div>

            <div style={{ ...styles.progressContainer, display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                    <span>Progresso</span>
                    <span>{progresso}%</span>
                </div>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progresso}%` }} />
                </div>
            </div>

            <div style={styles.actions}>
                <button
                    onClick={() => onSelect(session)}
                    style={styles.btnAction}
                >
                    <MoreVertical size={18} />
                </button>
                <button
                    onClick={() => onSelect(session)}
                    style={styles.btnContinue}
                >
                    {isFinalizada ? 'Ver' : 'Continuar'}
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

const PsicoTestesContainer = ({
    sessions = [],
    onStartNewEvaluation,
    onSelectSession,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');

    const totalSessoes = sessions.length;
    const sessoesFinalizadas = sessions.filter(s => s.sessao_fechada).length;
    const sessoesAndamento = totalSessoes - sessoesFinalizadas;
    const totalPacientes = new Set(sessions.map(s => s.child_name)).size;

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = (session.child_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'todos'
            ? true
            : filterStatus === 'finalizadas'
                ? session.sessao_fechada
                : !session.sessao_fechada;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Painel de Avaliações</h1>
                    <p style={styles.subtitle}>Acompanhe os testes aplicados e gerencie suas sessões.</p>
                </div>

                <button
                    onClick={onStartNewEvaluation}
                    style={styles.btnPrimary}
                >
                    <Plus size={20} />
                    Nova Avaliação
                </button>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <StatCard
                    emoji="📋"
                    label="Total de Sessões"
                    value={totalSessoes}
                    subtext={`${sessoesAndamento} em andamento`}
                    bgColor="#dbeafe"
                />
                <StatCard
                    emoji="👥"
                    label="Pacientes Únicos"
                    value={totalPacientes}
                    subtext="Cadastrados no sistema"
                    bgColor="#e9d5ff"
                />
                <StatCard
                    emoji="✅"
                    label="Concluídas"
                    value={sessoesFinalizadas}
                    subtext="Avaliações finalizadas"
                    bgColor="#d1fae5"
                />
            </div>

            {/* Lista */}
            <div style={styles.mainCard}>
                <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>Sessões Recentes</h2>

                    <div style={styles.searchContainer}>
                        <div style={styles.searchBox}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={styles.select}
                        >
                            <option value="todos">Todos</option>
                            <option value="andamento">Em andamento</option>
                            <option value="finalizadas">Finalizadas</option>
                        </select>
                    </div>
                </div>

                <div style={styles.listContainer}>
                    {filteredSessions.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <ClipboardList style={{ color: '#94a3b8' }} size={28} />
                            </div>
                            <h3 style={{ color: '#0f172a', fontWeight: '500', marginBottom: '4px' }}>Nenhuma sessão encontrada</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                                {searchTerm ? 'Tente ajustar sua busca.' : 'Comece criando uma nova avaliação.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={onStartNewEvaluation}
                                    style={{ ...styles.link, background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Criar primeira avaliação →
                                </button>
                            )}
                        </div>
                    ) : (
                        <div>
                            {filteredSessions.map((session) => (
                                <PacienteRow
                                    key={session.session_id}
                                    session={session}
                                    onSelect={onSelectSession}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PsicoTestesContainer;