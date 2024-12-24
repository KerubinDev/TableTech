// Classe para gerenciar o estado global da aplicação
class EstadoApp {
    constructor() {
        this._usuario = null;
        this._token = null;
        this._callbacks = [];
        
        // Carrega dados do localStorage
        this.carregarDados();
    }
    
    // Getters
    get usuario() {
        return this._usuario;
    }
    
    get token() {
        return this._token;
    }
    
    get estaLogado() {
        return !!this._token;
    }
    
    // Adiciona callback para mudanças de estado
    adicionarCallback(callback) {
        this._callbacks.push(callback);
    }
    
    // Notifica callbacks sobre mudanças
    _notificarCallbacks() {
        this._callbacks.forEach(callback => callback(this.estaLogado));
    }
    
    // Salva dados no localStorage
    _salvarDados() {
        if (this._token) {
            localStorage.setItem('token', this._token);
        } else {
            localStorage.removeItem('token');
        }
        
        if (this._usuario) {
            localStorage.setItem('usuario', JSON.stringify(this._usuario));
        } else {
            localStorage.removeItem('usuario');
        }
    }
    
    // Carrega dados do localStorage
    carregarDados() {
        this._token = localStorage.getItem('token');
        const usuarioStr = localStorage.getItem('usuario');
        this._usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    }
    
    // Define os dados do usuário após login
    definirDadosUsuario(token, usuario) {
        this._token = token;
        this._usuario = usuario;
        this._salvarDados();
        this._notificarCallbacks();
    }
    
    // Limpa os dados do usuário após logout
    limparDados() {
        this._token = null;
        this._usuario = null;
        this._salvarDados();
        this._notificarCallbacks();
    }
    
    // Verifica se o usuário tem permissão de admin
    ehAdmin() {
        return this._usuario && this._usuario.cargo === 'admin';
    }
    
    // Verifica se o token ainda é válido
    async verificarToken() {
        if (!this._token) {
            return false;
        }
        
        try {
            const resposta = await fetch('/api/auth/perfil', {
                headers: {
                    'Authorization': `Bearer ${this._token}`
                }
            });
            
            const dados = await resposta.json();
            
            if (!dados.sucesso) {
                this.limparDados();
                return false;
            }
            
            this._usuario = dados.dados.usuario;
            localStorage.setItem('usuario', JSON.stringify(this._usuario));
            return true;
            
        } catch (erro) {
            console.error('Erro ao verificar token:', erro);
            this.limparDados();
            return false;
        }
    }
}

// Exporta instância única
const estadoApp = new EstadoApp();
export default estadoApp; 