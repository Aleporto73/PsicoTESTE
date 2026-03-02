import React from 'react';

// URLs dos avatares 3D (mesmos do PsicoBook ou alternativos estáveis)
const AVATARS = {
    boys: [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=William&backgroundColor=b6e3f4',
    ],
    girls: [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jia&backgroundColor=c0aede',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=b6e3f4',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=ffdfbf',
    ]
};

const getDefaultAvatar = (gender, name = '') => {
    // Seleciona baseado no nome para ser consistente
    const seed = name.length > 0 ? name : 'default';
    const index = seed.length % 4;

    if (gender === 'Feminino') {
        return AVATARS.girls[index];
    }
    return AVATARS.boys[index];
};

const PacienteAvatar = ({ url, gender, name, size = 'md', className = '' }) => {
    const avatarUrl = url || getDefaultAvatar(gender, name);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
        '2xl': 'w-28 h-28'
    };

    return (
        <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full overflow-hidden bg-blue-50 flex items-center justify-center border-2 border-white shadow-sm ${className}`}>
            <img
                src={avatarUrl}
                alt={name || 'Avatar'}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getDefaultAvatar(gender, name);
                }}
            />
        </div>
    );
};

export default PacienteAvatar;