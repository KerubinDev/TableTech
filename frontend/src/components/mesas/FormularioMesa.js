/**
 * Componente para criar/editar mesas
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import mesaService from '../../services/mesaService';

const FormularioMesa = () => {
    const [dados, setDados] = useState({
        numero: '',
        capacidade: '',
        localizacao: 'INTERIOR'
    });
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');
    
    const { id } = useParams();
    const navigate = useNavigate();
    const modoEdicao = !!id;
    
    useEffect(() => {
        if (modoEdicao) {
            carregarMesa();
        }
    }, [id]);
    
    const carregarMesa = async () => {
        try {
            setCarregando(true);
            const mesa = await mesaService.obterMesa(id);
            setDados({
                numero: mesa.numero,
                capacidade: mesa.capacidade,
                localizacao: mesa.localizacao
            });
        } catch (error) {
            setErro('Erro ao carregar dados da mesa');
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
                await mesaService.atualizarMesa(id, dados);
            } else {
                await mesaService.criarMesa(dados);
            }
            navigate('/mesas');
        } catch (error) {
            setErro(error.message || 'Erro ao salvar mesa');
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
                {modoEdicao ? 'Editar Mesa' : 'Nova Mesa'}
            </h2>
            
            {erro && (
                <div className="bg-erro bg-opacity-10 text-erro p-4 rounded-md mb-4">
                    {erro}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label 
                        htmlFor="numero" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Número
                    </label>
                    <input
                        type="text"
                        id="numero"
                        name="numero"
                        value={dados.numero}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div>
                    <label 
                        htmlFor="capacidade" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Capacidade
                    </label>
                    <input
                        type="number"
                        id="capacidade"
                        name="capacidade"
                        value={dados.capacidade}
                        onChange={handleChange}
                        required
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    />
                </div>
                
                <div>
                    <label 
                        htmlFor="localizacao" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Localização
                    </label>
                    <select
                        id="localizacao"
                        name="localizacao"
                        value={dados.localizacao}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 
                                 shadow-sm focus:border-primaria focus:ring-primaria"
                    >
                        <option value="INTERIOR">Interior</option>
                        <option value="VARANDA">Varanda</option>
                        <option value="AREA_VIP">Área VIP</option>
                    </select>
                </div>
                
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/mesas')}
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

export default FormularioMesa; 