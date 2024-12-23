/**
 * Componente de navegação principal
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    return (
        <nav className="bg-primaria text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold">
                        TableTech
                    </Link>
                    
                    {usuario ? (
                        <div className="flex items-center space-x-4">
                            <Link to="/reservas" className="hover:text-gray-300">
                                Reservas
                            </Link>
                            <Link to="/mesas" className="hover:text-gray-300">
                                Mesas
                            </Link>
                            <Link to="/clientes" className="hover:text-gray-300">
                                Clientes
                            </Link>
                            {usuario.tipo === 'admin' && (
                                <Link to="/admin" className="hover:text-gray-300">
                                    Admin
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="hover:text-gray-300"
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="hover:text-gray-300">
                            Entrar
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 