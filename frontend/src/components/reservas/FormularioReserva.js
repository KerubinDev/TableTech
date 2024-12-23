/**
 * Componente para criar/editar reservas
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addMinutes, parse } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import reservaService from '../../services/reservaService';
import clienteService from '../../services/clienteService';
import config from '../../config/config';

const FormularioReserva = () => {
    const [dados, setDados] = useState({
        cliente_id: '',
        mesa_id: '',
        data: format(new Date(), 'yyyy-MM-dd'),
        hora: format(new Date(), 'HH:mm'),
        num_pessoas: '',
        observacoes: ''
    });
    
    const [clientes, setClientes] = useState([]);
    const [mesasDisponiveis, setMesasDisponiveis] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    const [buscandoMesas, setBuscandoMesas] = useState(false);
    
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const modoEdicao = !!id;
    
    useEffect(() => {
        carregarClientes();
        if (modoEdicao) {
            carregarReserva();
        }
    }, [id]);
    
    useEffect(() => {
        if (dados.data && dados.hora && dados.num_pessoas) {
            verificarDisponibilidade();
        }
    }, [dados.data, dados.hora, dados.num_pessoas]);
    
    const carregarClientes = async () => {
        try {
            const data = await clienteService.listarClientes();
            setClientes(data);
        } catch (error) {
            setErro('Erro ao carregar lista de clientes');
            console.error(error);
        }
    };
    
    const carregarReserva = async () => {
        try {
            setCarregando(true);
            const reserva = await reservaService.obterReserva(id);
            const dataHora = new Date(reserva.data_hora);
            
            setDados({
                cliente_id: reserva.cliente.id,
                mesa_id: reserva.mesa.id,
                data: format(dataHora, 'yyyy-MM-dd'),
                hora: format(dataHora, 'HH:mm'),
                num_pessoas: reserva.num_pessoas,
                observacoes: reserva.observacoes || ''
            });
        } catch (error) {
            setErro('Erro ao carregar dados da reserva');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };
    
    const verificarDisponibilidade = async () => {
        try {
            setBuscandoMesas(true);
            const dataHora = parse(
                `${dados.data} ${dados.hora}`,
                'yyyy-MM-dd HH:mm',
                new Date()
            ).toISOString();
            
            const { mesas_disponiveis } = await reservaService.verificarDisponibilidade(
                dataHora,
                dados.num_pessoas
            );
            
            setMesasDisponiveis(mesas_disponiveis);
            
            // Se estiver editando e a mesa atual não estiver disponível,
            // mantém ela na lista
            if (modoEdicao && dados.mesa_id) {
                const mesaAtualDisponivel = mesas_disponiveis.some(
                    m => m.id === dados.mesa_id
                );
                if (!mesaAtualDisponivel) {
                    setDados(prev => ({ ...prev, mesa_id: '' }));
                }
            }
        } catch (error) {
            setErro('Erro ao verificar disponibilidade');
            console.error(error);
        } finally {
            setBuscandoMesas(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);
        
        try {
            const dataHora = parse(
                `${dados.data} ${dados.hora}`,
                'yyyy-MM-dd HH:mm',
                new Date()
            ).toISOString();
            
            const dadosReserva = {
                cliente_id: dados.cliente_id,
                mesa_id: dados.mesa_id,
                data_hora: dataHora,
                num_pessoas: parseInt(dados.num_pessoas),
                observacoes: dados.observacoes,
                criado_por: usuario.id
            };
            
            if (modoEdicao) {
                await reservaService.atualizarReserva(id, dadosReserva);
            } else {
                await reservaService.criarReserva(dadosReserva);
            }
            
            navigate('/reservas');
        } catch (error) {
            setErro(error.message || 'Erro ao salvar reserva');
        } finally {
            setCarregando(false);
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDados(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    if (carregando && modoEdicao) {
        return <div>Carregando...</div>;
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primaria mb-6">
                {modoEdicao ? 'Editar Reserva' : 'Nova Reserva'}
            </h2>
            
            {erro && (
                <div className="bg-erro bg-opacity-10 text-erro p-4 rounded-md mb-4">
                    {erro}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label 
                        htmlFor="cliente_id" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Cliente
                    </label>
                    <select
                        id="cliente_id"
                        name="cliente_id"
                        value={dados.cliente_id}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    >
                        <option value="">Selecione um cliente</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label 
                            htmlFor="data" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Data
                        </label>
                        <input
                            type="date"
                            id="data"
                            name="data"
                            value={dados.data}
                            onChange={handleChange}
                            required
                            min={format(new Date(), 'yyyy-MM-dd')}
                            className="mt-1 block w-full rounded-md border-gray-300 
                                     shadow-sm focus:border-primaria focus:ring-primaria"
                        />
                    </div>
                    
                    <div>
                        <label 
                            htmlFor="hora" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Hora
                        </label>
                        <input
                            type="time"
                            id="hora"
                            name="hora"
                            value={dados.hora}
                            onChange={handleChange}
                            required
                            min={config.HORARIO_INICIO}
                            max={config.HORARIO_FIM}
                            step={config.INTERVALO_RESERVA * 60}
                            className="mt-1 block w-full rounded-md border-gray-300 
                                     shadow-sm focus:border-primaria focus:ring-primaria"
                        />
                    </div>
                </div>
                
                <div>
                    <label 
                        htmlFor="num_pessoas" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Número de Pessoas
                    </label>
                    <input
                        type="number"
                        id="num_pessoas"
                        name="num_pessoas"
                        value={dados.num_pessoas}
                        onChange={handleChange}
                        required
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                {buscandoMesas ? (
                    <div className="text-center text-gray-600">
                        Verificando mesas disponíveis...
                    </div>
                ) : mesasDisponiveis.length > 0 && (
                    <div>
                        <label 
                            htmlFor="mesa_id" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Mesa
                        </label>
                        <select
                            id="mesa_id"
                            name="mesa_id"
                            value={dados.mesa_id}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 
                                     shadow-sm focus:border-primaria focus:ring-primaria"
                        >
                            <option value="">Selecione uma mesa</option>
                            {mesasDisponiveis.map(mesa => (
                                <option key={mesa.id} value={mesa.id}>
                                    Mesa {mesa.numero} - {mesa.capacidade} pessoas 
                                    ({mesa.localizacao})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                <div>
                    <label 
                        htmlFor="observacoes" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Observações
                    </label>
                    <textarea
                        id="observacoes"
                        name="observacoes"
                        value={dados.observacoes}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/reservas')}
                        className="px-4 py-2 border border-gray-300 rounded-md 
                                 text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={carregando || buscandoMesas || !dados.mesa_id}
                        className="px-4 py-2 bg-primaria text-white rounded-md 
                                 hover:bg-primaria-escuro disabled:opacity-50"
                    >
                        {carregando ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioReserva; 