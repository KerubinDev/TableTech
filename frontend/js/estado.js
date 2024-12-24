// Classe para gerenciar o estado global da aplicação
class EstadoApp {
    constructor() {
        this._carregando = false;
        this._mensagens = [];
        this._paginaAtual = null;
        this._dadosGlobais = {};
        this._callbacks = {
            carregamento: [],
            mensagem: [],
            navegacao: [],
            dados: []
        };
    }

    // Inicia o estado de carregamento
    iniciarCarregamento() {
        this._carregando = true;
        this._notificarCallbacks('carregamento');
        this._mostrarIndicadorCarregamento();
    }

    // Finaliza o estado de carregamento
    finalizarCarregamento() {
        this._carregando = false;
        this._notificarCallbacks('carregamento');
        this._ocultarIndicadorCarregamento();
    }

    // Adiciona uma mensagem ao sistema
    adicionarMensagem(tipo, texto, duracao = 5000) {
        const mensagem = {
            id: Date.now(),
            tipo,
            texto,
            duracao
        };

        this._mensagens.push(mensagem);
        this._notificarCallbacks('mensagem');
        this._mostrarMensagem(mensagem);

        // Remove a mensagem após a duração especificada
        if (duracao > 0) {
            setTimeout(() => this.removerMensagem(mensagem.id), duracao);
        }
    }

    // Remove uma mensagem do sistema
    removerMensagem(id) {
        const index = this._mensagens.findIndex(m => m.id === id);
        if (index !== -1) {
            this._mensagens.splice(index, 1);
            this._notificarCallbacks('mensagem');
            this._removerElementoMensagem(id);
        }
    }

    // Navega para uma nova página
    navegarPara(pagina, dados = null) {
        this._paginaAtual = pagina;
        if (dados) {
            this._dadosGlobais[pagina] = dados;
        }
        this._notificarCallbacks('navegacao');
        window.history.pushState({ pagina, dados }, '', `/${pagina}`);
    }

    // Define dados globais
    setDadosGlobais(chave, valor) {
        this._dadosGlobais[chave] = valor;
        this._notificarCallbacks('dados');
    }

    // Obtém dados globais
    getDadosGlobais(chave) {
        return this._dadosGlobais[chave];
    }

    // Remove dados globais
    removerDadosGlobais(chave) {
        delete this._dadosGlobais[chave];
        this._notificarCallbacks('dados');
    }

    // Adiciona um callback para um tipo de evento
    adicionarCallback(tipo, callback) {
        if (this._callbacks[tipo]) {
            this._callbacks[tipo].push(callback);
        }
    }

    // Remove um callback
    removerCallback(tipo, callback) {
        if (this._callbacks[tipo]) {
            const index = this._callbacks[tipo].indexOf(callback);
            if (index !== -1) {
                this._callbacks[tipo].splice(index, 1);
            }
        }
    }

    // Notifica todos os callbacks de um tipo
    _notificarCallbacks(tipo) {
        if (this._callbacks[tipo]) {
            this._callbacks[tipo].forEach(callback => callback(this));
        }
    }

    // Mostra o indicador de carregamento
    _mostrarIndicadorCarregamento() {
        let indicador = document.getElementById('indicadorCarregamento');
        
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'indicadorCarregamento';
            indicador.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50';
            indicador.innerHTML = `
                <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            `;
            document.body.appendChild(indicador);
        } else {
            indicador.classList.remove('hidden');
        }
    }

    // Oculta o indicador de carregamento
    _ocultarIndicadorCarregamento() {
        const indicador = document.getElementById('indicadorCarregamento');
        if (indicador) {
            indicador.classList.add('hidden');
        }
    }

    // Mostra uma mensagem na tela
    _mostrarMensagem(mensagem) {
        const container = document.getElementById('mensagensContainer');
        
        if (!container) {
            const novoContainer = document.createElement('div');
            novoContainer.id = 'mensagensContainer';
            novoContainer.className = 'fixed bottom-4 right-4 flex flex-col space-y-2 z-50';
            document.body.appendChild(novoContainer);
        }

        const elemento = document.createElement('div');
        elemento.id = `mensagem-${mensagem.id}`;
        elemento.className = `p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ease-in-out ${this._getClasseMensagem(mensagem.tipo)}`;
        elemento.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    ${this._getIconeMensagem(mensagem.tipo)}
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-white">
                        ${mensagem.texto}
                    </p>
                </div>
                <div class="ml-auto pl-3">
                    <button type="button" class="text-white hover:text-gray-200 focus:outline-none">
                        <span class="sr-only">Fechar</span>
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Adiciona evento de clique no botão de fechar
        const btnFechar = elemento.querySelector('button');
        btnFechar.addEventListener('click', () => this.removerMensagem(mensagem.id));

        document.getElementById('mensagensContainer').appendChild(elemento);

        // Adiciona classe para animar a entrada
        requestAnimationFrame(() => {
            elemento.classList.add('translate-y-0', 'opacity-100');
        });
    }

    // Remove um elemento de mensagem do DOM
    _removerElementoMensagem(id) {
        const elemento = document.getElementById(`mensagem-${id}`);
        if (elemento) {
            // Adiciona classe para animar a saída
            elemento.classList.add('opacity-0', 'translate-y-2');
            
            // Remove o elemento após a animação
            setTimeout(() => elemento.remove(), 300);
        }
    }

    // Retorna a classe CSS para o tipo de mensagem
    _getClasseMensagem(tipo) {
        switch (tipo) {
            case 'sucesso':
                return 'bg-green-600';
            case 'erro':
                return 'bg-red-600';
            case 'aviso':
                return 'bg-yellow-600';
            case 'info':
                return 'bg-blue-600';
            default:
                return 'bg-gray-600';
        }
    }

    // Retorna o ícone para o tipo de mensagem
    _getIconeMensagem(tipo) {
        switch (tipo) {
            case 'sucesso':
                return '<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
            case 'erro':
                return '<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
            case 'aviso':
                return '<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
            case 'info':
                return '<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
            default:
                return '<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        }
    }

    // Getters
    get carregando() {
        return this._carregando;
    }

    get mensagens() {
        return [...this._mensagens];
    }

    get paginaAtual() {
        return this._paginaAtual;
    }
}

// Instância global do estado da aplicação
const estadoApp = new EstadoApp(); 