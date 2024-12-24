// Gerenciador de estado da aplicação
const estadoApp = {
    // Estado global
    _estado: {
        rotaAtual: null,
        dadosRota: null,
        mensagens: [],
        carregando: false
    },

    // Callbacks para mudanças no estado
    _callbacks: [],

    // Getters
    get estado() {
        return { ...this._estado };
    },

    // Setters com notificação de mudança
    set rotaAtual(rota) {
        this._estado.rotaAtual = rota;
        this._notificarMudanca();
    },

    set dadosRota(dados) {
        this._estado.dadosRota = dados;
        this._notificarMudanca();
    },

    // Métodos para gerenciar mensagens
    adicionarMensagem(tipo, texto, duracao = 5000) {
        const id = Date.now();
        this._estado.mensagens.push({ id, tipo, texto });
        this._notificarMudanca();

        // Remove a mensagem após a duração especificada
        setTimeout(() => {
            this.removerMensagem(id);
        }, duracao);

        return id;
    },

    removerMensagem(id) {
        this._estado.mensagens = this._estado.mensagens.filter(msg => msg.id !== id);
        this._notificarMudanca();
    },

    // Métodos para gerenciar estado de carregamento
    iniciarCarregamento() {
        this._estado.carregando = true;
        this._notificarMudanca();
    },

    finalizarCarregamento() {
        this._estado.carregando = false;
        this._notificarMudanca();
    },

    // Sistema de observadores
    adicionarCallback(callback) {
        this._callbacks.push(callback);
    },

    removerCallback(callback) {
        this._callbacks = this._callbacks.filter(cb => cb !== callback);
    },

    _notificarMudanca() {
        this._callbacks.forEach(callback => callback(this.estado));
    }
};

// Configuração das rotas
const rotas = {
    login: {
        path: '/login',
        template: 'login.html',
        titulo: 'Login - TableTech',
        publica: true
    },
    dashboard: {
        path: '/',
        template: 'dashboard.html',
        titulo: 'Dashboard - TableTech'
    },
    mesas: {
        path: '/mesas',
        template: 'mesas.html',
        titulo: 'Gerenciar Mesas - TableTech'
    },
    clientes: {
        path: '/clientes',
        template: 'clientes.html',
        titulo: 'Gerenciar Clientes - TableTech'
    },
    reservas: {
        path: '/reservas',
        template: 'reservas.html',
        titulo: 'Gerenciar Reservas - TableTech'
    },
    perfil: {
        path: '/perfil',
        template: 'perfil.html',
        titulo: 'Meu Perfil - TableTech'
    }
};

// Gerenciador de rotas
const roteador = {
    async inicializar() {
        // Adiciona listener para mudanças na URL
        window.addEventListener('popstate', () => this.navegar(window.location.pathname));
        
        // Configura links de navegação
        document.addEventListener('click', (evento) => {
            const link = evento.target.closest('a[data-rota]');
            if (link) {
                evento.preventDefault();
                this.navegar(link.getAttribute('data-rota'));
            }
        });

        // Navega para a rota inicial
        await this.navegar(window.location.pathname);
    },

    async navegar(caminho) {
        // Encontra a rota correspondente
        const rota = Object.values(rotas).find(r => r.path === caminho) || rotas.login;

        // Verifica autenticação
        if (!rota.publica && !authManager.estaAutenticado) {
            this.navegar('/login');
            return;
        }

        try {
            estadoApp.iniciarCarregamento();

            // Carrega o template
            const conteudo = await this.carregarTemplate(rota.template);
            
            // Atualiza a URL e o título
            window.history.pushState({}, rota.titulo, rota.path);
            document.title = rota.titulo;

            // Atualiza o estado
            estadoApp.rotaAtual = rota;
            estadoApp.dadosRota = null;

            // Renderiza o conteúdo
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = conteudo;

            // Inicializa os controladores específicos da rota
            await this.inicializarControladores(rota);

        } catch (erro) {
            console.error('Erro ao navegar:', erro);
            estadoApp.adicionarMensagem('erro', 'Erro ao carregar a página');
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async carregarTemplate(nomeTemplate) {
        try {
            const resposta = await fetch(`/templates/${nomeTemplate}`);
            if (!resposta.ok) throw new Error('Erro ao carregar template');
            return await resposta.text();
        } catch (erro) {
            console.error('Erro ao carregar template:', erro);
            return '<p>Erro ao carregar conteúdo</p>';
        }
    },

    async inicializarControladores(rota) {
        // Remove event listeners antigos
        const mainContent = document.getElementById('mainContent');
        const novoMainContent = mainContent.cloneNode(true);
        mainContent.parentNode.replaceChild(novoMainContent, mainContent);

        // Inicializa os controladores específicos da rota
        switch (rota.path) {
            case '/':
                await inicializarDashboard();
                break;
            case '/mesas':
                await inicializarMesas();
                break;
            case '/clientes':
                await inicializarClientes();
                break;
            case '/reservas':
                await inicializarReservas();
                break;
            case '/perfil':
                await inicializarPerfil();
                break;
        }
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o roteador
    roteador.inicializar();

    // Observa mudanças na autenticação
    authManager.adicionarCallback(({ estaAutenticado }) => {
        if (!estaAutenticado && estadoApp.rotaAtual?.path !== '/login') {
            roteador.navegar('/login');
        }
    });

    // Observa mudanças no estado para atualizar a UI
    estadoApp.adicionarCallback((estado) => {
        // Atualiza indicador de carregamento
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = estado.carregando ? 'block' : 'none';
        }

        // Atualiza mensagens
        const mensagensContainer = document.getElementById('mensagens');
        if (mensagensContainer) {
            mensagensContainer.innerHTML = estado.mensagens
                .map(msg => `
                    <div class="mensagem mensagem-${msg.tipo}">
                        ${msg.texto}
                        <button onclick="estadoApp.removerMensagem(${msg.id})">×</button>
                    </div>
                `)
                .join('');
        }
    });
}); 