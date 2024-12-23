/**
 * Componente para exibir detalhes de uma reserva
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import reservaService from '../../services/reservaService';

const DetalhesReserva = () => {
    const [reserva, setReserva] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    
    const { id } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        carregarReserva();
    }, [id]);
    
    const carregarReserva = async () => {
        try {
            const data = await reservaService.obterReserva(id);
            setReserva(data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar detalhes da reserva');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };
    
    const handleConfirmar = async () => {
        try {
            await reservaService.confirmarReserva(id);
            await carregarReserva();
        } catch (error) {
            setErro('Erro ao confirmar reserva');
            console.error(error);
        }
    };
    
    const handleCancelar = async () => {
        if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
            return;
        }
        
        try {
            await reservaService.cancelarReserva(id);
            await carregarReserva();
        } catch (error) {
            setErro('Erro ao cancelar reserva');
            console.error(error);
        }
    };
    
    if (carregando) {
        return <div>Carregando...</div>;
    }
    
    if (!reserva) {
        return <div>Reserva não encontrada</div>;
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primaria">
                    Detalhes da Reserva
                </h2>
                <button
                    onClick={() => navigate('/reservas')}
                    className="text-gray-600 hover:text-gray-800"
                >
                    Voltar
                </button>
            </div>
            
            {erro && (
                <div className="bg-erro bg-opacity-10 text-erro p-4 rounded-md mb-4">
                    {erro}
                </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Informações da Reserva
                        </h3>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Status
                                </dt>
                                <dd className={`mt-1 text-sm ${
                                    reserva.status === 'CONFIRMADA'
                                        ? 'text-sucesso'
                                        : reserva.status === 'CANCELADA'
                                        ? 'text-erro'
                                        : 'text-alerta'
                                }`}>
                                    {reserva.status}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Data e Hora
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {format(
                                        new Date(reserva.data_hora),
                                        "dd 'de' MMMM 'de' yyyy', às' HH:mm",
                                        { locale: ptBR }
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Número de Pessoas
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {reserva.num_pessoas}
                                </dd>
                            </div>
                        </dl>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Mesa
                        </h3>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Número
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    Mesa {reserva.mesa.numero}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Capacidade
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {reserva.mesa.capacidade} pessoas
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Localização
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {reserva.mesa.localizacao}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
                
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Cliente
                    </h3>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                Nome
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {reserva.cliente.nome}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                Email
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {reserva.cliente.email}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">
                                Telefone
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {reserva.cliente.telefone}
                            </dd>
                        </div>
                    </dl>
                </div>
                
                {reserva.observacoes && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Observações
                        </h3>
                        <p className="text-sm text-gray-600">
                            {reserva.observacoes}
                        </p>
                    </div>
                )}
                
                {reserva.status === 'PENDENTE' && (
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={handleConfirmar}
                            className="px-4 py-2 bg-sucesso text-white rounded-md 
                                     hover:bg-sucesso-escuro"
                        >
                            Confirmar Reserva
                        </button>
                        <button
                            onClick={handleCancelar}
                            className="px-4 py-2 bg-erro text-white rounded-md 
                                     hover:bg-erro-escuro"
                        >
                            Cancelar Reserva
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetalhesReserva; 