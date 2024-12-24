import estadoApp from './estado.js';

// Classe para gerenciar chamadas à API
class API {
    constructor() {
        this.baseURL = '/api';
    }

    // Método genérico para fazer requisições
    async _request(endpoint, options = {}) {
        try {
            // Adiciona headers padrão
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            // Adiciona token de autenticação se existir
            if (estadoApp.token) {
                headers['Authorization'] = `Bearer ${estadoApp.token}`;
            }

            // Faz a requisição
            const resposta = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            const dados = await resposta.json();

            // Verifica se houve erro
            if (!dados.sucesso) {
                throw new Error(dados.mensagem);
            }

            return dados.dados;

        } catch (erro) {
            console.error(`Erro na requisição para ${endpoint}:`, erro);
            throw erro;
        }
    }

    // Métodos de autenticação
    async login(email, senha) {
        const dados = await this._request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        estadoApp.definirDadosUsuario(dados.token, dados.usuario);
        return dados;
    }

    async logout() {
        estadoApp.limparDados();
        window.location.href = '/login.html';
    }

    async verificarToken() {
        return estadoApp.verificarToken();
    }

    // Métodos para mesas
    async obterMesas() {
        return this._request('/mesas');
    }

    async obterMesa(id) {
        return this._request(`/mesas/${id}`);
    }

    async criarMesa(dados) {
        return this._request('/mesas', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    }

    async atualizarMesa(id, dados) {
        return this._request(`/mesas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
    }

    async deletarMesa(id) {
        return this._request(`/mesas/${id}`, {
            method: 'DELETE'
        });
    }

    async obterStatusMesas(data, hora) {
        return this._request(`/mesas/status?data=${data}&hora=${hora}`);
    }

    // Métodos para clientes
    async obterClientes() {
        return this._request('/clientes');
    }

    async obterCliente(id) {
        return this._request(`/clientes/${id}`);
    }

    async criarCliente(dados) {
        return this._request('/clientes', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    }

    async atualizarCliente(id, dados) {
        return this._request(`/clientes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
    }

    async deletarCliente(id) {
        return this._request(`/clientes/${id}`, {
            method: 'DELETE'
        });
    }

    async buscarClientePorCPF(cpf) {
        return this._request(`/clientes/buscar?cpf=${cpf}`);
    }

    // Métodos para reservas
    async obterReservas() {
        return this._request('/reservas');
    }

    async obterReserva(id) {
        return this._request(`/reservas/${id}`);
    }

    async criarReserva(dados) {
        return this._request('/reservas', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    }

    async atualizarReserva(id, dados) {
        return this._request(`/reservas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
    }

    async cancelarReserva(id) {
        return this._request(`/reservas/${id}/cancelar`, {
            method: 'POST'
        });
    }

    async confirmarReserva(id) {
        return this._request(`/reservas/${id}/confirmar`, {
            method: 'POST'
        });
    }

    async verificarDisponibilidade(mesaId, data, hora) {
        return this._request(`/reservas/verificar-disponibilidade?mesa_id=${mesaId}&data=${data}&hora=${hora}`);
    }

    async obterReservasPorData(data) {
        return this._request(`/reservas/por-data?data=${data}`);
    }

    async obterReservasPorCliente(clienteId) {
        return this._request(`/reservas/por-cliente/${clienteId}`);
    }

    async obterReservasPorMesa(mesaId) {
        return this._request(`/reservas/por-mesa/${mesaId}`);
    }
}

// Exporta instância única
const api = new API();
export default api; 