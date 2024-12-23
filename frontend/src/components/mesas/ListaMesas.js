/**
 * Componente para listar e gerenciar mesas
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mesaService from '../../services/mesaService';
import { useAuth } from '../../contexts/AuthContext';

const ListaMesas = () => {
    const [mesas, setMesas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    
    const { usuario } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        carregarMesas();
    }, []);
    
    const carregarMesas = async () => {
        try {
            const data = await mesaService.listarMesas();
            setMesas(data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar mesas');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };
    
    const handleDeletar = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta mesa?')) {
            return;
        }
        
        try {
            await mesaService.deletarMesa(id);
            await carregarMesas();
        } catch (error) {
            setErro('Erro ao deletar mesa');
            console.error(error);
        }
    };
    
    if (carregando) {
        return <div>Carregando...</div>;
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primaria">Mesas</h2>
                {usuario.tipo === 'admin' && (
                    <button
                        onClick={() => navigate('/mesas/nova')}
                        className="bg-primaria text-white px-4 py-2 rounded-md 
                                 hover:bg-primaria-escuro"
                    >
                        Nova Mesa
                    </button>
                )}
            </div>
            
            {erro && (
                <div className="bg-erro bg-opacity-10 text-erro p-4 rounded-md mb-4">
                    {erro}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mesas.map(mesa => (
                    <div
                        key={mesa.id}
                        className="bg-white p-4 rounded-lg shadow-md"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Mesa {mesa.numero}
                                </h3>
                                <p className="text-gray-600">
                                    Capacidade: {mesa.capacidade} pessoas
                                </p>
                                <p className="text-gray-600">
                                    Localização: {mesa.localizacao}
                                </p>
                                <p className={`mt-2 font-medium ${
                                    mesa.status === 'DISPONIVEL' 
                                        ? 'text-sucesso' 
                                        : 'text-erro'
                                }`}>
                                    {mesa.status}
                                </p>
                            </div>
                            
                            {usuario.tipo === 'admin' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/mesas/${mesa.id}/editar`)}
                                        className="text-primaria hover:text-primaria-escuro"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeletar(mesa.id)}
                                        className="text-erro hover:text-erro-escuro"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListaMesas; 