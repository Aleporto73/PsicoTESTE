import React from 'react';
import { Bell, User, ClipboardList, Activity } from 'lucide-react';

export default function PsicoTestesLayout({ children, activeView, setActiveView, menuItems }) {
    const defaultMenuItems = menuItems || [
        { id: 'dashboard', icon: ClipboardList, label: 'Painel de Avaliações' },
        { id: 'vbmapp', icon: Activity, label: 'VB-MAPP' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 h-screen bg-blue-900 text-white fixed left-0 top-0 flex flex-col z-50">
                {/* Logo */}
                <div
                    className="h-16 flex items-center px-6 border-b border-blue-800 cursor-pointer hover:bg-blue-800 transition"
                    onClick={() => setActiveView('dashboard')}
                >
                    <span className="text-2xl mr-3">🧠</span>
                    <h1 className="text-xl font-bold">PsicoTestes</h1>
                </div>

                {/* Menu */}
                <nav className="flex-1 px-4 py-6">
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 px-4">
                        Instrumentos
                    </div>
                    <ul className="space-y-1">
                        {defaultMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;

                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveView(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {item.isNew && (
                                            <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                                                Novo
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-blue-800 text-center text-xs text-blue-400">
                    PsicoTestes v1.0
                </div>
            </aside>

            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-40 shadow-sm">
                <div className="text-sm text-gray-600">
                    Bem-vindo(a), <span className="font-semibold text-gray-900">Profissional</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg relative transition">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-900" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 ml-64 pt-16 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}