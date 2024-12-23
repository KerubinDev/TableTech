/**
 * Serviço para gerenciamento de clientes
 */
import api from './apiService';

class ClienteService {
    async listarClientes() {
        const response = await api.get('/clientes');
        return response.data;
    }
    
    async obterCliente(id) {
        const response = await api.get(`/clientes/${id}`);
        return response.data;
    }
    
    async criarCliente(dados) {
        const response = await api.post('/clientes', dados);
        return response.data;
    }
    
    async atualizarCliente(id, dados) {
        const response = await api.put(`/clientes/${id}`, dados);
        return response.data;
    }
    
    async deletarCliente(id) {
        const response = await api.delete(`/clientes/${id}`);
        return response.data;
    }
}

export default new ClienteService(); 