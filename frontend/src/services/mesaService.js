/**
 * Serviço para gerenciamento de mesas
 */
import api from './apiService';

class MesaService {
    async listarMesas() {
        const response = await api.get('/mesas');
        return response.data;
    }
    
    async obterMesa(id) {
        const response = await api.get(`/mesas/${id}`);
        return response.data;
    }
    
    async criarMesa(dados) {
        const response = await api.post('/mesas', dados);
        return response.data;
    }
    
    async atualizarMesa(id, dados) {
        const response = await api.put(`/mesas/${id}`, dados);
        return response.data;
    }
    
    async deletarMesa(id) {
        const response = await api.delete(`/mesas/${id}`);
        return response.data;
    }
    
    async listarMesasDisponiveis() {
        const response = await api.get('/mesas/disponiveis');
        return response.data;
    }
}

export default new MesaService(); 