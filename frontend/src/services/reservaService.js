/**
 * Serviço para gerenciamento de reservas
 */
import api from './apiService';

class ReservaService {
    async listarReservas(filtros = {}) {
        const params = new URLSearchParams();
        if (filtros.data) params.append('data', filtros.data);
        if (filtros.status) params.append('status', filtros.status);
        if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
        
        const response = await api.get(`/reservas?${params.toString()}`);
        return response.data;
    }
    
    async obterReserva(id) {
        const response = await api.get(`/reservas/${id}`);
        return response.data;
    }
    
    async criarReserva(dados) {
        const response = await api.post('/reservas', dados);
        return response.data;
    }
    
    async atualizarReserva(id, dados) {
        const response = await api.put(`/reservas/${id}`, dados);
        return response.data;
    }
    
    async confirmarReserva(id) {
        const response = await api.post(`/reservas/${id}/confirmar`);
        return response.data;
    }
    
    async cancelarReserva(id) {
        const response = await api.post(`/reservas/${id}/cancelar`);
        return response.data;
    }
    
    async verificarDisponibilidade(data_hora, num_pessoas) {
        const params = new URLSearchParams({
            data_hora,
            num_pessoas: num_pessoas.toString()
        });
        
        const response = await api.get(`/reservas/disponiveis?${params}`);
        return response.data;
    }
}

export default new ReservaService(); 