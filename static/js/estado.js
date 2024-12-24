class EstadoApp {
    constructor() {
        this._estado = {
            usuario: null,
            token: null,
            carregando: false,
            erro: null
        };
        this._observadores = [];
        this.inicializar();
    }

    // Getters e Setters
    get usuario() { return this._estado.usuario; }
    get token() { return this._estado.token; }
    get carregando() { return this._estado.carregando; }
    get erro() { return this._estado.erro; }

    set usuario(valor) {
        this._estado.usuario = valor;
        this._notificarMudanca();
    }

    set token(valor) {
        this._estado.token = valor;
        if (valor) {
            localStorage.setItem('token', valor);
        } else {
            localStorage.removeItem('token');
        }
        this._notificarMudanca();
    }

    set carregando(valor) {
        this._estado.carregando = valor;
        this._notificarMudanca();
    }

    set erro(valor) {
        this._estado.erro = valor;
        this._notificarMudanca();
    }

    // Funções de observadores
    adicionarObservador(callback) {
        console.log('Adicionando observador:', callback);
        if (typeof callback === 'function') {
            this._observadores.push(callback);
            callback({ ...this._estado });
        } else {
            console.error('O observador deve ser uma função');
        }
    }

    removerObservador(callback) {
        this._observadores = this._observadores.filter(obs => obs !== callback);
    }

    _notificarMudanca() {
        const estadoAtual = { ...this._estado };
        this._observadores.forEach(callback => {
            try {
                callback(estadoAtual);
            } catch (erro) {
                console.error('Erro ao notificar observador:', erro);
            }
        });
    }

    // Funções de autenticação
    async verificarToken() {
        try {
            const token = this.token;
            if (!token) return false;

            const partes = token.split('.');
            if (partes.length !== 3) {
                this.token = null;
                return false;
            }

            try {
                const payload = this._base64UrlDecode(partes[1]);
                const dados = JSON.parse(payload);

                const agora = Math.floor(Date.now() / 1000);
                if (dados.exp && dados.exp < agora) {
                    console.log('Token expirado');
                    this.token = null;
                    return false;
                }

                this.usuario = {
                    id: dados.sub || dados.id,
                    email: dados.email,
                    nome: dados.nome,
                    tipo: dados.tipo || 'usuario'
                };

                return true;
            } catch (erro) {
                console.error('Erro ao decodificar payload:', erro);
                this.token = null;
                return false;
            }
        } catch (erro) {
            console.error('Erro ao verificar token:', erro);
            this.token = null;
            return false;
        }
    }

    async setToken(token) {
        this.token = token;
        if (token) {
            return await this.verificarToken();
        } else {
            this.usuario = null;
            return false;
        }
    }

    // Funções de navegação
    irParaLogin() {
        window.location.href = '/templates/login.html';
    }

    irParaDashboard() {
        window.location.href = '/templates/dashboard.html';
    }

    // Funções de erro
    limparErro() {
        this.erro = null;
    }

    definirErro(mensagem) {
        this.erro = mensagem;
        setTimeout(() => this.limparErro(), 5000);
    }

    // Funções auxiliares
    _base64UrlDecode(str) {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const decoded = atob(base64);
        return decodeURIComponent(escape(decoded));
    }

    // Inicialização
    inicializar() {
        console.log('Inicializando estado...');
        const token = localStorage.getItem('token');
        if (token) {
            this._estado.token = token;
            this.verificarToken();
        }
    }
}

// Cria uma única instância do estado
const estadoApp = new EstadoApp();

// Adiciona ao window para debug
window.estadoApp = estadoApp;

// Exporta a instância
export default estadoApp; 