import React from 'react';
import { Bell, User, ClipboardList, Activity, Brain } from 'lucide-react';

export default function PsicoTestesLayout({ children, activeView, setActiveView, menuItems }) {
    const defaultMenuItems = menuItems || [
        { id: 'dashboard', icon: ClipboardList, label: 'Painel de Avaliações' },
        { id: 'instruments', icon: Activity, label: 'Instrumentos' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header horizontal */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo + Nav */}
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <button
                                onClick={() => setActiveView('dashboard')}
                                className="flex items-center gap-2 hover:opacity-80 transition"
                            >
                                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <Brain size={20} className="text-white" />
                                </div>
                                <span className="text-lg font-bold text-gray-900 hidden sm:block">
                                    PsicoTestes
                                </span>
                            </button>

                            {/* Nav tabs */}
                            <nav className="flex items-center gap-1">
                                {defaultMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeView === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveView(item.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                            {item.isNew && (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                                                    Novo
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <button className="p-2 hover:bg-gray-100 rounded-lg relative transition text-gray-500 hover:text-gray-700">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="h-6 w-px bg-gray-200"></div>

                            <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-blue-700" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    Profissional
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content — full width */}
            <main className="min-h-[calc(100vh-4rem)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
