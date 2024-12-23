/**
 * Componente para listar e gerenciar reservas
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import reservaService from '../../services/reservaService';

const ListaReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [filtros, setFiltros] = useState({
        data: format(new Date(), 'yyyy-MM-dd'),
        status: 'TODOS'
    });
    
    const navigate = useNavigate();
    
    useEffect(() => {
        carregarReservas();
    }, [filtros]);
    
    const carregarReservas = async () => {
        try {
            setCarregando(true);
            const data = await reservaService.listarReservas(filtros);
            setReservas(data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar reservas');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };
    
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMADA':
                return 'text-sucesso';
            case 'CANCELADA':
                return 'text-erro';
            default:
                return 'text-alerta';
        }
    };
    
    return (
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primaria">
                    Reservas
                </h2>
                <button
                    onClick={() => navigate('/reservas/nova')}
                    className="px-4 py-2 bg-primaria text-white rounded-md 
                             hover:bg-primaria-escuro"
                >
                    Nova Reserva
                </button>
            </div>
            
            {erro && (
                <div className="bg-erro bg-opacity-10 text-erro p-4 rounded-md mb-4">
                    {erro}
                </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label 
                            htmlFor="data" 
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Data
                        </label>
                        <input
                            type="date"
                            id="data"
                            name="data"
                            value={filtros.data}
                            onChange={handleFiltroChange}
                            className="block w-full rounded-md border-gray-300 
                                     shadow-sm focus:border-primaria focus:ring-primaria"
                        />
                    </div>
                    
                    <div>
                        <label 
                            htmlFor="status" 
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={filtros.status}
                            onChange={handleFiltroChange}
                            className="block w-full rounded-md border-gray-300 
                                     shadow-sm focus:border-primaria focus:ring-primaria"
                        >
                            <option value="TODOS">Todos</option>
                            <option value="PENDENTE">Pendente</option>
                            <option value="CONFIRMADA">Confirmada</option>
                            <option value="CANCELADA">Cancelada</option>
                        </select>
                    </div>
                </div>
                
                {carregando ? (
                    <div className="text-center py-4">Carregando...</div>
                ) : reservas.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        Nenhuma reserva encontrada
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium 
                                               text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium 
                                               text-gray-500 uppercase tracking-wider">
                                        Data/Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium 
                                               text-gray-500 uppercase tracking-wider">
                                        Mesa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium 
                                               text-gray-500 uppercase tracking-wider">
                                        Pessoas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium 
                                               text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium 
                                               text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservas.map(reserva => (
                                    <tr key={reserva.id} 
                                        className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {reserva.cliente.nome}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {reserva.cliente.telefone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {format(
                                                    new Date(reserva.data_hora),
                                                    "dd 'de' MMMM",
                                                    { locale: ptBR }
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {format(
                                                    new Date(reserva.data_hora),
                                                    "HH:mm"
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                Mesa {reserva.mesa.numero}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {reserva.mesa.localizacao}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap 
                                                   text-sm text-gray-900">
                                            {reserva.num_pessoas}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm 
                                                ${getStatusColor(reserva.status)}`}>
                                                {reserva.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap 
                                                   text-sm font-medium">
                                            <button
                                                onClick={() => navigate(
                                                    `/reservas/${reserva.id}`
                                                )}
                                                className="text-primaria 
                                                         hover:text-primaria-escuro mr-4"
                                            >
                                                Detalhes
                                            </button>
                                            {reserva.status === 'PENDENTE' && (
                                                <button
                                                    onClick={() => navigate(
                                                        `/reservas/${reserva.id}/editar`
                                                    )}
                                                    className="text-secundaria 
                                                             hover:text-secundaria-escuro"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListaReservas; 