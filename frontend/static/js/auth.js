// Gerenciador de autenticação
const authManager = {
    // Estado do usuário
    _usuario: null,
    _carregando: true,
    _callbacks: [],

    // Getters
    get usuario() {
        return this._usuario;
    },

    get estaAutenticado() {
        return !!this._usuario;
    },

    get estaCarregando() {
        return this._carregando;
    },

    get ehAdmin() {
        return this._usuario?.cargo === 'admin';
    },

    // Métodos de gerenciamento de estado
    async inicializar() {
        this._carregando = true;
        this._notificarMudanca();

        try {
            // Tenta recuperar o usuário do localStorage
            const usuarioSalvo = localStorage.getItem('usuario');
            if (usuarioSalvo) {
                this._usuario = JSON.parse(usuarioSalvo);
            }

            // Verifica se o token ainda é válido
            if (localStorage.getItem('accessToken')) {
                const resposta = await api.auth.verificarToken();
                this._usuario = resposta.dados.usuario;
                this._salvarUsuario(this._usuario);
            }
        } catch (erro) {
            console.error('Erro ao inicializar auth:', erro);
            this._limparDados();
        } finally {
            this._carregando = false;
            this._notificarMudanca();
        }
    },

    async login(email, senha) {
        try {
            const resposta = await api.auth.login(email, senha);
            
            // Salva tokens e dados do usuário
            localStorage.setItem('accessToken', resposta.dados.access_token);
            localStorage.setItem('refreshToken', resposta.dados.refresh_token);
            this._usuario = resposta.dados.usuario;
            this._salvarUsuario(this._usuario);
            
            this._notificarMudanca();
            return true;
        } catch (erro) {
            console.error('Erro no login:', erro);
            this._limparDados();
            throw erro;
        }
    },

    async logout() {
        try {
            await api.auth.logout();
        } catch (erro) {
            console.error('Erro no logout:', erro);
        } finally {
            this._limparDados();
            this._notificarMudanca();
        }
    },

    async atualizarPerfil(dados) {
        try {
            const resposta = await api.auth.atualizarPerfil(dados);
            this._usuario = resposta.dados;
            this._salvarUsuario(this._usuario);
            this._notificarMudanca();
            return true;
        } catch (erro) {
            console.error('Erro ao atualizar perfil:', erro);
            throw erro;
        }
    },

    // Métodos auxiliares
    _salvarUsuario(usuario) {
        localStorage.setItem('usuario', JSON.stringify(usuario));
    },

    _limparDados() {
        this._usuario = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('usuario');
    },

    // Sistema de observadores para mudanças no estado
    adicionarCallback(callback) {
        this._callbacks.push(callback);
    },

    removerCallback(callback) {
        this._callbacks = this._callbacks.filter(cb => cb !== callback);
    },

    _notificarMudanca() {
        this._callbacks.forEach(callback => callback({
            usuario: this._usuario,
            estaAutenticado: this.estaAutenticado,
            estaCarregando: this._carregando,
            ehAdmin: this.ehAdmin
        }));
    }
};

// Inicializa o gerenciador de autenticação
document.addEventListener('DOMContentLoaded', () => {
    authManager.inicializar();
}); 