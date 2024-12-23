/**
 * Formulário de login
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);
        
        try {
            await login(email, senha);
            navigate('/');
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-fundo">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div>
                    <h2 className="text-center text-3xl font-bold text-primaria">
                        Login
                    </h2>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {erro && (
                        <div className="text-erro text-sm text-center">
                            {erro}
                        </div>
                    )}
                    
                    <div>
                        <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 
                                     shadow-sm focus:border-primaria 
                                     focus:ring-primaria"
                        />
                    </div>
                    
                    <div>
                        <label 
                            htmlFor="senha" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Senha
                        </label>
                        <input
                            id="senha"
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 
                                     shadow-sm focus:border-primaria 
                                     focus:ring-primaria"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full flex justify-center py-2 px-4 border 
                                 border-transparent rounded-md shadow-sm text-sm 
                                 font-medium text-white bg-primaria 
                                 hover:bg-primaria-escuro focus:outline-none 
                                 focus:ring-2 focus:ring-offset-2 
                                 focus:ring-primaria disabled:opacity-50"
                    >
                        {carregando ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm; 