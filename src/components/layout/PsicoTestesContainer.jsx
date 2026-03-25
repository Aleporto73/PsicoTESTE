import React, { useState } from 'react';
import {
    MoreVertical,
    Calendar,
    ChevronRight,
    Plus,
    Search,
    ClipboardList,
    Users,
    CheckCircle2,
    Clock,
} from 'lucide-react';

// Componente Avatar
const PacienteAvatar = ({ name }) => {
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

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${colors[colorIndex]}`}>
            {initial}
        </div>
    );
};

// Card de Estatística — minimalista
const StatCard = ({ icon: Icon, label, value, subtext, accentColor }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentColor}`}>
                    <Icon size={16} />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{subtext}</p>
        </div>
    );
};

// Linha de paciente — clean
const PacienteRow = ({ session, onSelect }) => {
    const dataFormatada = new Date(session.date).toLocaleDateString('pt-BR');
    const isFinalizada = session.sessao_fechada;

    // Calcular instrumentos ativos
    const instrumentCount = session.instruments ? Object.keys(session.instruments).length : 0;

    return (
        <button
            onClick={() => onSelect(session)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 transition group text-left"
        >
            <PacienteAvatar name={session.child_name} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900 text-sm truncate">
                        {session.child_name || "Sem nome"}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isFinalizada
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                    }`}>
                        {isFinalizada ? 'Finalizada' : 'Em andamento'}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {dataFormatada}
                    </span>
                    <span>{session.child_age || "Idade N/I"}</span>
                    {instrumentCount > 0 && (
                        <span>{instrumentCount} instrumento{instrumentCount > 1 ? 's' : ''}</span>
                    )}
                </div>
            </div>

            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition" />
        </button>
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
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Painel de Avaliações</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Gerencie suas sessões e acompanhe o progresso.</p>
                </div>
                <button
                    onClick={onStartNewEvaluation}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                    <Plus size={18} />
                    Nova Avaliação
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    icon={ClipboardList}
                    label="Sessões"
                    value={totalSessoes}
                    subtext={`${sessoesAndamento} em andamento`}
                    accentColor="bg-blue-50 text-blue-600"
                />
                <StatCard
                    icon={Users}
                    label="Pacientes"
                    value={totalPacientes}
                    subtext="Cadastrados"
                    accentColor="bg-violet-50 text-violet-600"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Concluídas"
                    value={sessoesFinalizadas}
                    subtext="Avaliações finalizadas"
                    accentColor="bg-emerald-50 text-emerald-600"
                />
            </div>

            {/* Lista */}
            <div className="bg-white rounded-xl border border-gray-100">
                {/* Search bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Sessões Recentes</h2>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-48"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
                        >
                            <option value="todos">Todos</option>
                            <option value="andamento">Em andamento</option>
                            <option value="finalizadas">Finalizadas</option>
                        </select>
                    </div>
                </div>

                {/* List content */}
                <div className="p-2">
                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ClipboardList className="text-gray-300" size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Nenhuma sessão encontrada</p>
                            <p className="text-xs text-gray-400 mb-4">
                                {searchTerm ? 'Tente ajustar sua busca.' : 'Comece criando uma nova avaliação.'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={onStartNewEvaluation}
                                    className="text-sm text-blue-600 font-medium hover:text-blue-700"
                                >
                                    Criar primeira avaliação →
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
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
