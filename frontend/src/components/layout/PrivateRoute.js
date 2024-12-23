/**
 * Componente para proteger rotas que requerem autenticação
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { usuario, autenticado } = useAuth();
    const location = useLocation();
    
    if (!autenticado) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (adminOnly && usuario.tipo !== 'admin') {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default PrivateRoute; 