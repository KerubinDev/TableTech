/**
 * Componente para criar/editar clientes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clienteService from '../../services/clienteService';

const RESTRICOES_ALIMENTARES = [
    { value: 'VEGETARIANO', label: 'Vegetariano' },
    { value: 'VEGANO', label: 'Vegano' },
    { value: 'GLUTEM', label: 'Sem Glúten' },
    { value: 'LACTOSE', label: 'Sem Lactose' },
    { value: 'FRUTOS_MAR', label: 'Alérgico a Frutos do Mar' },
    { value: 'AMENDOIM', label: 'Alérgico a Amendoim' }
];

const FormularioCliente = () => {
    const [dados, setDados] = useState({
        nome: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        restricoes: [],
        preferencias: '',
        notas_especiais: ''
    });
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    
    const { id } = useParams();
    const navigate = useNavigate();
    const modoEdicao = !!id;
    
    useEffect(() => {
        if (modoEdicao) {
            carregarCliente();
        }
    }, [id]);
    
    const carregarCliente = async () => {
        try {
            setCarregando(true);
            const cliente = await clienteService.obterCliente(id);
            setDados({
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone,
                data_nascimento: cliente.data_nascimento || '',
                restricoes: cliente.restricoes || [],
                preferencias: cliente.preferencias || '',
                notas_especiais: cliente.notas_especiais || ''
            });
        } catch (error) {
            setErro('Erro ao carregar dados do cliente');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);
        
        try {
            if (modoEdicao) {
                await clienteService.atualizarCliente(id, dados);
            } else {
                await clienteService.criarCliente(dados);
            }
            navigate('/clientes');
        } catch (error) {
            setErro(error.message || 'Erro ao salvar cliente');
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
    
    const handleRestricaoChange = (restricao) => {
        setDados(prev => {
            const novasRestricoes = prev.restricoes.includes(restricao)
                ? prev.restricoes.filter(r => r !== restricao)
                : [...prev.restricoes, restricao];
            
            return {
                ...prev,
                restricoes: novasRestricoes
            };
        });
    };
    
    if (carregando && modoEdicao) {
        return <div>Carregando...</div>;
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primaria mb-6">
                {modoEdicao ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            
            {erro && (
                <div className="bg-erro bg-opacity-10 text-erro p-4 rounded-md mb-4">
                    {erro}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label 
                        htmlFor="nome" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Nome
                    </label>
                    <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={dados.nome}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div>
                    <label 
                        htmlFor="email" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={dados.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div>
                    <label 
                        htmlFor="telefone" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Telefone
                    </label>
                    <input
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={dados.telefone}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div>
                    <label 
                        htmlFor="data_nascimento" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Data de Nascimento
                    </label>
                    <input
                        type="date"
                        id="data_nascimento"
                        name="data_nascimento"
                        value={dados.data_nascimento}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Restrições Alimentares
                    </label>
                    <div className="space-y-2">
                        {RESTRICOES_ALIMENTARES.map(restricao => (
                            <label
                                key={restricao.value}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={dados.restricoes.includes(restricao.value)}
                                    onChange={() => handleRestricaoChange(restricao.value)}
                                    className="rounded border-gray-300 text-primaria 
                                             focus:ring-primaria"
                                />
                                <span className="text-sm text-gray-700">
                                    {restricao.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
                
                <div>
                    <label 
                        htmlFor="preferencias" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Preferências
                    </label>
                    <textarea
                        id="preferencias"
                        name="preferencias"
                        value={dados.preferencias}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div>
                    <label 
                        htmlFor="notas_especiais" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Notas Especiais
                    </label>
                    <textarea
                        id="notas_especiais"
                        name="notas_especiais"
                        value={dados.notas_especiais}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/clientes')}
                        className="px-4 py-2 border border-gray-300 rounded-md 
                                 text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={carregando}
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

export default FormularioCliente; 