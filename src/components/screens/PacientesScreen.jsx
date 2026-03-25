import React, { useState, useMemo } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Search,
    Users,
    CheckCircle2,
    Clock,
    Calendar,
    FileText,
} from 'lucide-react';
import { getInstrument } from '../../registry/instrumentRegistry';

// Avatar por inicial com cor fixa por nome
const Avatar = ({ name, size = 'md' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-emerald-100 text-emerald-700',
        'bg-violet-100 text-violet-700',
        'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700',
        'bg-cyan-100 text-cyan-700',
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    const sizeClass = size === 'lg' ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-sm';

    return (
        <div className={`${sizeClass} rounded-full flex items-center justify-center font-semibold ${colors[colorIndex]}`}>
            {initial}
        </div>
    );
};

// Badge de status do instrumento
const StatusBadge = ({ status }) => {
    if (status === 'completed') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={12} />
                Finalizado
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <Clock size={12} />
            Em andamento
        </span>
    );
};

// Linha de instrumento dentro do paciente expandido
const InstrumentRow = ({ instrument, date, onOpen }) => {
    const meta = getInstrument(instrument.instrument_id);
    const name = meta?.name || instrument.instrument_id.toUpperCase();
    const color = meta?.color || '#6366f1';
    const completedDate = instrument.completed_at
        ? new Date(instrument.completed_at).toLocaleDateString('pt-BR')
        : null;

    return (
        <button
            onClick={() => onOpen && onOpen(instrument)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition text-left group"
        >
            <div
                className="w-1 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{name}</span>
                    <StatusBadge status={instrument.status} />
                </div>
                {completedDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                        Concluído em {completedDate}
                    </p>
                )}
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition flex-shrink-0" />
        </button>
    );
};

// VB-MAPP como "instrumento" virtual na lista
const VBMAPPRow = ({ session, onOpen }) => {
    const hasVBMAPP = session.milestones_completo || Object.keys(session.scores_snapshot || {}).length > 0;
    if (!hasVBMAPP) return null;

    const isFinalizado = session.sessao_fechada;
    const etapas = [
        { key: 'milestones_completo', label: 'Milestones' },
        { key: 'ecoico_completo', label: 'Ecoico' },
        { key: 'tarefas_completas', label: 'Subtestes' },
        { key: 'barreiras_completas', label: 'Barreiras' },
        { key: 'transicao_completa', label: 'Transição' },
        { key: 'pei_completo', label: 'PEI' },
    ];
    const completedSteps = etapas.filter(e => session[e.key]).length;

    return (
        <button
            onClick={() => onOpen && onOpen(session)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition text-left group"
        >
            <div
                className="w-1 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#6366f1' }}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">VB-MAPP</span>
                    <StatusBadge status={isFinalizado ? 'completed' : 'in_progress'} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                    {completedSteps}/{etapas.length} etapas concluídas
                </p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition flex-shrink-0" />
        </button>
    );
};

// Card de paciente (expandível)
const PacienteCard = ({ patient, sessions, onOpenSession }) => {
    const [expanded, setExpanded] = useState(false);

    // Total de testes e status
    const testSummary = useMemo(() => {
        let total = 0;
        let completed = 0;
        let inProgress = 0;

        sessions.forEach(s => {
            // VB-MAPP
            if (s.milestones_completo || Object.keys(s.scores_snapshot || {}).length > 0) {
                total++;
                if (s.sessao_fechada) completed++;
                else inProgress++;
            }
            // Instrumentos simples
            (s.instruments || []).forEach(inst => {
                total++;
                if (inst.status === 'completed') completed++;
                else inProgress++;
            });
        });

        return { total, completed, inProgress };
    }, [sessions]);

    const lastDate = sessions.length > 0
        ? new Date(sessions[0].date || sessions[0].created_at).toLocaleDateString('pt-BR')
        : '';

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden transition hover:shadow-sm">
            {/* Header do paciente — clicável */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left"
            >
                <Avatar name={patient.name} size="lg" />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-900 truncate">{patient.name}</span>
                        {patient.age && (
                            <span className="text-xs text-gray-400">{patient.age}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {lastDate}
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {testSummary.total} teste{testSummary.total !== 1 ? 's' : ''}
                        </span>
                        {testSummary.completed > 0 && (
                            <span className="text-emerald-600 font-medium">
                                {testSummary.completed} finalizado{testSummary.completed !== 1 ? 's' : ''}
                            </span>
                        )}
                        {testSummary.inProgress > 0 && (
                            <span className="text-amber-600 font-medium">
                                {testSummary.inProgress} em andamento
                            </span>
                        )}
                    </div>
                </div>

                <div className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
                    <ChevronRight size={20} className="text-gray-300" />
                </div>
            </button>

            {/* Lista de testes expandida */}
            {expanded && (
                <div className="border-t border-gray-50 bg-gray-50/50 px-3 py-2 space-y-0.5">
                    {sessions.map((session) => (
                        <div key={session.session_id}>
                            {/* VB-MAPP (se houver) */}
                            <VBMAPPRow
                                session={session}
                                onOpen={() => onOpenSession(session)}
                            />
                            {/* Instrumentos simples */}
                            {(session.instruments || []).map((inst, idx) => (
                                <InstrumentRow
                                    key={`${session.session_id}-${inst.instrument_id}-${idx}`}
                                    instrument={inst}
                                    date={session.date}
                                    onOpen={() => onOpenSession(session)}
                                />
                            ))}
                        </div>
                    ))}

                    {testSummary.total === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">
                            Nenhum teste aplicado ainda.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════
// TELA PRINCIPAL — PacientesScreen
// ════════════════════════════════════════════════════
export default function PacientesScreen({ sessions, onSelectSession }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Agrupar sessões por paciente (child_name)
    const patients = useMemo(() => {
        const map = {};
        sessions.forEach(s => {
            const name = s.child_name || 'Sem nome';
            if (!map[name]) {
                map[name] = {
                    name,
                    age: s.child_age || '',
                    sessions: [],
                };
            }
            map[name].sessions.push(s);
            // Usar a idade mais recente
            if (s.child_age) map[name].age = s.child_age;
        });

        // Ordenar por data mais recente
        return Object.values(map).sort((a, b) => {
            const dateA = new Date(a.sessions[0]?.date || 0);
            const dateB = new Date(b.sessions[0]?.date || 0);
            return dateB - dateA;
        });
    }, [sessions]);

    // Filtrar por busca
    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={16} />
                <input
                    type="text"
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
            </div>

            {/* Lista de pacientes */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="text-gray-300" size={24} />
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {searchTerm ? 'Tente ajustar sua busca.' : 'Crie uma nova avaliação para começar.'}
                        </p>
                    </div>
                ) : (
                    filtered.map(patient => (
                        <PacienteCard
                            key={patient.name}
                            patient={patient}
                            sessions={patient.sessions}
                            onOpenSession={onSelectSession}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
