import React, { useState } from 'react';
import { ChevronLeft, User, Calendar, Check } from 'lucide-react';

const CadastroSimples = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        child_name: '',
        child_age: '',
        genero: 'Masculino',
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.child_name.trim() || formData.child_name.length < 3) {
            newErrors.child_name = 'Nome deve ter pelo menos 3 caracteres';
        }
        if (!formData.child_age.trim()) {
            newErrors.child_age = 'Informe a idade';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
                    <p className="text-gray-500 text-sm">
                        Preencha os dados básicos para iniciar a avaliação.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Avatar */}
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                            {formData.child_name ? formData.child_name.charAt(0).toUpperCase() : '👤'}
                        </div>
                    </div>

                    {/* Nome */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Nome Completo *
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={formData.child_name}
                                onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                                placeholder="Digite o nome da criança"
                                className={`w-full pl-12 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${errors.child_name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-900'
                                    }`}
                            />
                        </div>
                        {errors.child_name && <p className="mt-1 text-sm text-red-500">{errors.child_name}</p>}
                    </div>

                    {/* Idade e Gênero */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Idade *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={formData.child_age}
                                    onChange={(e) => setFormData({ ...formData, child_age: e.target.value })}
                                    placeholder="Ex: 5 anos e 3 meses"
                                    className={`w-full pl-12 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${errors.child_age ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-900'
                                        }`}
                                />
                            </div>
                            {errors.child_age && <p className="mt-1 text-sm text-red-500">{errors.child_age}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Gênero
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, genero: 'Masculino' })}
                                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition ${formData.genero === 'Masculino'
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Masculino
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, genero: 'Feminino' })}
                                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition ${formData.genero === 'Feminino'
                                            ? 'bg-pink-50 border-pink-500 text-pink-700'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Feminino
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 px-6 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-6 bg-blue-900 text-white font-medium rounded-xl hover:bg-blue-800 transition flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            Iniciar Avaliação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CadastroSimples;