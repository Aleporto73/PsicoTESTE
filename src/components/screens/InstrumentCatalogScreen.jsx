import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    Clock,
    Users,
    Plus,
    Search,
    Calendar,
    ArrowRight,
} from 'lucide-react';
import { listInstruments, getInstrument } from '../../registry/instrumentRegistry';

// Avatar
const Avatar = ({ name }) => {
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
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${colors[colorIndex]}`}>
            {initial}
        </div>
    );
};

// Card de instrumento no catálogo
const InstrumentCard = ({ instrument, isSelected, onSelect }) => {
    return (
        <button
            onClick={() => onSelect(instrument)}
            className={`w-full text-left rounded-xl border-2 p-5 transition hover:shadow-sm ${
                isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: instrument.color + '15' }}
                >
                    {instrument.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm">{instrument.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{instrument.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Users size={12} />
                            {instrument.ageRange}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {instrument.estimatedTime}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
};

// ════════════════════════════════════════════════
// TELA PRINCIPAL — Catálogo de Instrumentos
// ════════════════════════════════════════════════
export default function InstrumentCatalogScreen({
    sessions = [],
    onSelectPatientAndInstrument,
    onNewPatientWithInstrument,
}) {
    const instruments = listInstruments();
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Agrupar pacientes únicos a partir das sessões
    const patients = useMemo(() => {
        const map = {};
        sessions.forEach(s => {
            const name = s.child_name || 'Sem nome';
            if (!map[name]) {
                map[name] = {
                    name,
                    age: s.child_age || '',
                    lastSession: s,
                    sessionCount: 0,
                };
            }
            map[name].sessionCount++;
            // Manter a sessão mais recente
            if (new Date(s.date) > new Date(map[name].lastSession.date)) {
                map[name].lastSession = s;
                if (s.child_age) map[name].age = s.child_age;
            }
        });
        return Object.values(map).sort((a, b) =>
            new Date(b.lastSession.date) - new Date(a.lastSession.date)
        );
    }, [sessions]);

    // Filtrar pacientes por busca
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Verificar se paciente já tem esse instrumento aplicado (em andamento ou concluído)
    const getPatientInstrumentStatus = (patient, instrumentId) => {
        const session = patient.lastSession;
        // VB-MAPP check
        if (instrumentId === 'vbmapp') {
            if (session.milestones_completo || Object.keys(session.scores_snapshot || {}).length > 0) {
                return session.sessao_fechada ? 'completed' : 'in_progress';
            }
            return null;
        }
        // Instrumentos simples
        const inst = (session.instruments || []).find(i => i.instrument_id === instrumentId);
        return inst ? inst.status : null;
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Instrumentos</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    Selecione um teste e escolha o paciente para aplicar.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Coluna esquerda — Catálogo de instrumentos */}
                <div className="lg:col-span-2">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Testes Disponíveis
                    </h2>
                    <div className="space-y-2">
                        {instruments.map(inst => (
                            <InstrumentCard
                                key={inst.id}
                                instrument={inst}
                                isSelected={selectedInstrument?.id === inst.id}
                                onSelect={setSelectedInstrument}
                            />
                        ))}
                    </div>
                </div>

                {/* Coluna direita — Selecionar paciente */}
                <div className="lg:col-span-3">
                    {!selectedInstrument ? (
                        // Estado vazio — nenhum instrumento selecionado
                        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <ArrowRight className="text-gray-300" size={24} />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">
                                Selecione um teste ao lado
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                                Depois escolha o paciente para aplicar
                            </p>
                        </div>
                    ) : (
                        // Painel de seleção de paciente
                        <div className="bg-white rounded-xl border border-gray-100">
                            {/* Header com instrumento selecionado */}
                            <div className="px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                                        style={{ backgroundColor: selectedInstrument.color + '15' }}
                                    >
                                        {selectedInstrument.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Aplicar {selectedInstrument.name}
                                        </h3>
                                        <p className="text-xs text-gray-400">Escolha o paciente</p>
                                    </div>
                                </div>
                            </div>

                            {/* Novo paciente — sempre no topo */}
                            <div className="px-3 pt-3">
                                <button
                                    onClick={() => onNewPatientWithInstrument(selectedInstrument.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition"
                                >
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Plus size={18} className="text-blue-600" />
                                    </div>
                                    <span className="text-sm font-semibold">Novo Paciente</span>
                                </button>
                            </div>

                            {/* Busca */}
                            {patients.length > 3 && (
                                <div className="px-5 pt-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Buscar paciente..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Lista de pacientes existentes */}
                            <div className="p-3 space-y-0.5 max-h-96 overflow-y-auto">
                                {filteredPatients.length === 0 && patients.length > 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-6">Nenhum paciente encontrado.</p>
                                ) : (
                                    filteredPatients.map(patient => {
                                        const status = getPatientInstrumentStatus(patient, selectedInstrument.id);
                                        return (
                                            <button
                                                key={patient.name}
                                                onClick={() => onSelectPatientAndInstrument(patient.lastSession, selectedInstrument.id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition text-left group"
                                            >
                                                <Avatar name={patient.name} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-800 truncate">{patient.name}</span>
                                                        {status === 'completed' && (
                                                            <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">
                                                                Já aplicado
                                                            </span>
                                                        )}
                                                        {status === 'in_progress' && (
                                                            <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">
                                                                Em andamento
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        {patient.age}{patient.age && ' · '}{patient.sessionCount} sessão{patient.sessionCount > 1 ? 'ões' : ''}
                                                    </p>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
                                            </button>
                                        );
                                    })
                                )}

                                {patients.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-8">
                                        Nenhum paciente cadastrado.<br />
                                        Clique em "Novo Paciente" acima.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
