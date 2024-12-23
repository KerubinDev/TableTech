/**
 * Contexto para gerenciamento do estado de autenticação
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    
    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            // TODO: Implementar verificação do token e carregamento do usuário
            setCarregando(false);
        } else {
            setCarregando(false);
        }
    }, []);
    
    const login = async (email, senha) => {
        try {
            const data = await authService.login(email, senha);
            setUsuario({
                id: data.id,
                nome: data.nome,
                email: data.email,
                tipo: data.tipo_usuario
            });
            return data;
        } catch (error) {
            throw error;
        }
    };
    
    const logout = () => {
        authService.logout();
        setUsuario(null);
    };
    
    if (carregando) {
        return <div>Carregando...</div>;
    }
    
    return (
        <AuthContext.Provider 
            value={{ 
                usuario, 
                login, 
                logout,
                autenticado: !!usuario 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}; 