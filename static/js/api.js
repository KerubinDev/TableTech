// Importa o gerenciador de estado
import estadoApp from './estado.js';

// URL base da API
const API_URL = 'http://localhost:5000/api';

// Função auxiliar para fazer requisições HTTP
async function requisicaoHttp(endpoint, opcoes = {}) {
    try {
        // Adiciona o token de autenticação se existir
        const token = estadoApp.token;
        if (token) {
            opcoes.headers = {
                ...opcoes.headers,
                'Authorization': `Bearer ${token}`
            };
        }

        // Adiciona headers padrão
        opcoes.headers = {
            'Content-Type': 'application/json',
            ...opcoes.headers
        };

        // Faz a requisição
        const resposta = await fetch(`${API_URL}${endpoint}`, opcoes);
        
        // Tenta obter os dados da resposta
        let dados;
        const contentType = resposta.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            dados = await resposta.json();
        } else {
            dados = await resposta.text();
        }

        // Verifica se houve erro
        if (!resposta.ok) {
            // Se a resposta não for ok, verifica o status
            switch (resposta.status) {
                case 401: // Não autorizado
                    await estadoApp.setToken(null);
                    estadoApp.irParaLogin();
                    throw new Error('Sessão expirada. Por favor, faça login novamente.');
                
                case 403: // Proibido
                    throw new Error('Você não tem permissão para acessar este recurso.');
                
                case 404: // Não encontrado
                    throw new Error('Recurso não encontrado.');
                
                case 400: // Bad Request
                    throw new Error(typeof dados === 'string' ? dados : dados.mensagem || 'Dados inválidos.');
                
                case 500: // Erro interno do servidor
                    throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
                
                default:
                    throw new Error(typeof dados === 'string' ? dados : dados.mensagem || 'Erro na requisição');
            }
        }

        return dados;
    } catch (erro) {
        // Se o erro já foi tratado, apenas repassa
        if (erro.message) {
            throw erro;
        }
        
        // Se for erro de rede
        if (!navigator.onLine) {
            throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
        }

        // Erro genérico
        console.error('Erro na requisição:', erro);
        throw new Error('Erro ao comunicar com o servidor. Tente novamente mais tarde.');
    }
}

// Funções de autenticação
async function login(email, senha) {
    try {
        const dados = await requisicaoHttp('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        // Define o token e atualiza o estado
        if (dados.token) {
            const sucesso = await estadoApp.setToken(dados.token);
            if (sucesso) {
                estadoApp.irParaDashboard();
            } else {
                throw new Error('Token inválido recebido do servidor');
            }
        } else {
            throw new Error('Token não recebido do servidor');
        }

        return dados;
    } catch (erro) {
        console.error('Erro no login:', erro);
        throw erro;
    }
}

function logout() {
    estadoApp.setToken(null);
    estadoApp.irParaLogin();
}

// Funções de usuário
async function obterPerfilUsuario() {
    return await requisicaoHttp('/usuarios/perfil');
}

async function atualizarPerfilUsuario(dados) {
    return await requisicaoHttp('/usuarios/perfil', {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

// Funções de mesas
async function obterMesas() {
    return await requisicaoHttp('/mesas');
}

async function obterMesa(id) {
    return await requisicaoHttp(`/mesas/${id}`);
}

async function criarMesa(dados) {
    return await requisicaoHttp('/mesas', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function atualizarMesa(id, dados) {
    return await requisicaoHttp(`/mesas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

async function deletarMesa(id) {
    return await requisicaoHttp(`/mesas/${id}`, {
        method: 'DELETE'
    });
}

// Funções de clientes
async function obterClientes() {
    return await requisicaoHttp('/clientes');
}

async function obterCliente(id) {
    return await requisicaoHttp(`/clientes/${id}`);
}

async function criarCliente(dados) {
    return await requisicaoHttp('/clientes', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function atualizarCliente(id, dados) {
    return await requisicaoHttp(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

async function deletarCliente(id) {
    return await requisicaoHttp(`/clientes/${id}`, {
        method: 'DELETE'
    });
}

async function buscarClientes(termo) {
    return await requisicaoHttp(`/clientes/buscar?termo=${encodeURIComponent(termo)}`);
}

// Funções de reservas
async function obterReservas(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.mesa_id) params.append('mesa_id', filtros.mesa_id);
    
    return await requisicaoHttp(`/reservas?${params.toString()}`);
}

async function obterReserva(id) {
    return await requisicaoHttp(`/reservas/${id}`);
}

async function criarReserva(dados) {
    return await requisicaoHttp('/reservas', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function atualizarReserva(id, dados) {
    return await requisicaoHttp(`/reservas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

async function deletarReserva(id) {
    return await requisicaoHttp(`/reservas/${id}`, {
        method: 'DELETE'
    });
}

// Funções do dashboard
async function obterResumoDashboard() {
    return await requisicaoHttp('/dashboard/resumo');
}

// Exporta todas as funções
export default {
    // Autenticação
    login,
    logout,

    // Usuários
    obterPerfilUsuario,
    atualizarPerfilUsuario,

    // Mesas
    obterMesas,
    obterMesa,
    criarMesa,
    atualizarMesa,
    deletarMesa,

    // Clientes
    obterClientes,
    obterCliente,
    criarCliente,
    atualizarCliente,
    deletarCliente,
    buscarClientes,

    // Reservas
    obterReservas,
    obterReserva,
    criarReserva,
    atualizarReserva,
    deletarReserva,

    // Dashboard
    obterResumoDashboard
}; 