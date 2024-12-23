/**
 * Componente para listar e gerenciar clientes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clienteService from '../../services/clienteService';

const ListaClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    
    const navigate = useNavigate();
    
    useEffect(() => {
        carregarClientes();
    }, []);
    
    const carregarClientes = async () => {
        try {
            const data = await clienteService.listarClientes();
            setClientes(data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar clientes');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };
    
    const handleDeletar = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
            return;
        }
        
        try {
            await clienteService.deletarCliente(id);
            await carregarClientes();
        } catch (error) {
            setErro('Erro ao deletar cliente');
            console.error(error);
        }
    };
    
    if (carregando) {
        return <div>Carregando...</div>;
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primaria">Clientes</h2>
                <button
                    onClick={() => navigate('/clientes/novo')}
                    className="bg-primaria text-white px-4 py-2 rounded-md 
                             hover:bg-primaria-escuro"
                >
                    Novo Cliente
                </button>
            </div>
            
            {erro && (
                <div className="bg-erro bg-opacity-10 text-erro p-4 rounded-md mb-4">
                    {erro}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientes.map(cliente => (
                    <div
                        key={cliente.id}
                        className="bg-white p-4 rounded-lg shadow-md"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {cliente.nome}
                                </h3>
                                <p className="text-gray-600">
                                    {cliente.email}
                                </p>
                                <p className="text-gray-600">
                                    {cliente.telefone}
                                </p>
                                {cliente.restricoes && cliente.restricoes.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium text-gray-700">
                                            Restrições:
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {cliente.restricoes.map((restricao, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs font-medium 
                                                             bg-alerta bg-opacity-10 
                                                             text-alerta rounded-full"
                                                >
                                                    {restricao}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                                    className="text-primaria hover:text-primaria-escuro"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeletar(cliente.id)}
                                    className="text-erro hover:text-erro-escuro"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListaClientes; 