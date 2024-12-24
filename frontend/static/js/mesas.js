// Controlador de mesas
const mesasController = {
    // Estado local
    _estado: {
        mesas: [],
        mesaSelecionada: null,
        filtros: {
            status: '',
            localizacao: ''
        },
        modoEdicao: false
    },

    // Callbacks
    _callbacks: [],

    // Getters
    get estado() {
        return { ...this._estado };
    },

    // Métodos de inicialização
    async inicializar() {
        try {
            estadoApp.iniciarCarregamento();
            await this.carregarMesas();
            this.configurarEventos();
            this.renderizar();
        } catch (erro) {
            console.error('Erro ao inicializar mesas:', erro);
            estadoApp.adicionarMensagem('erro', 'Erro ao carregar mesas');
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    // Métodos de dados
    async carregarMesas() {
        try {
            const resposta = await api.mesas.listar(this._estado.filtros);
            this._estado.mesas = resposta.dados;
            this._notificarMudanca();
        } catch (erro) {
            console.error('Erro ao carregar mesas:', erro);
            throw erro;
        }
    },

    async criarMesa(dados) {
        try {
            estadoApp.iniciarCarregamento();
            await api.mesas.criar(dados);
            await this.carregarMesas();
            estadoApp.adicionarMensagem('sucesso', 'Mesa criada com sucesso');
        } catch (erro) {
            console.error('Erro ao criar mesa:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async atualizarMesa(mesaId, dados) {
        try {
            estadoApp.iniciarCarregamento();
            await api.mesas.atualizar(mesaId, dados);
            await this.carregarMesas();
            estadoApp.adicionarMensagem('sucesso', 'Mesa atualizada com sucesso');
        } catch (erro) {
            console.error('Erro ao atualizar mesa:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async deletarMesa(mesaId) {
        try {
            estadoApp.iniciarCarregamento();
            await api.mesas.deletar(mesaId);
            await this.carregarMesas();
            estadoApp.adicionarMensagem('sucesso', 'Mesa deletada com sucesso');
        } catch (erro) {
            console.error('Erro ao deletar mesa:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async atualizarStatusMesa(mesaId, status) {
        try {
            estadoApp.iniciarCarregamento();
            await api.mesas.atualizarStatus(mesaId, status);
            await this.carregarMesas();
            estadoApp.adicionarMensagem('sucesso', 'Status da mesa atualizado');
        } catch (erro) {
            console.error('Erro ao atualizar status:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    // Métodos de UI
    configurarEventos() {
        // Form de criação/edição
        const form = document.getElementById('mesaForm');
        if (form) {
            form.addEventListener('submit', async (evento) => {
                evento.preventDefault();
                const dados = Object.fromEntries(new FormData(form));
                
                try {
                    if (this._estado.modoEdicao) {
                        await this.atualizarMesa(this._estado.mesaSelecionada.id, dados);
                    } else {
                        await this.criarMesa(dados);
                    }
                    this.limparFormulario();
                } catch (erro) {
                    console.error('Erro ao salvar mesa:', erro);
                }
            });
        }

        // Filtros
        const filtroStatus = document.getElementById('filtroStatus');
        if (filtroStatus) {
            filtroStatus.addEventListener('change', () => {
                this._estado.filtros.status = filtroStatus.value;
                this.carregarMesas();
            });
        }

        const filtroLocalizacao = document.getElementById('filtroLocalizacao');
        if (filtroLocalizacao) {
            filtroLocalizacao.addEventListener('change', () => {
                this._estado.filtros.localizacao = filtroLocalizacao.value;
                this.carregarMesas();
            });
        }
    },

    renderizar() {
        const container = document.getElementById('mesasContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${this._estado.mesas.map(mesa => this.renderizarMesa(mesa)).join('')}
            </div>
        `;

        // Adiciona event listeners para as ações das mesas
        this._estado.mesas.forEach(mesa => {
            const mesaEl = document.getElementById(`mesa-${mesa.id}`);
            if (mesaEl) {
                // Botão editar
                const btnEditar = mesaEl.querySelector('.btn-editar');
                if (btnEditar) {
                    btnEditar.addEventListener('click', () => this.editarMesa(mesa));
                }

                // Botão deletar
                const btnDeletar = mesaEl.querySelector('.btn-deletar');
                if (btnDeletar) {
                    btnDeletar.addEventListener('click', () => this.confirmarDeletar(mesa));
                }

                // Select de status
                const selectStatus = mesaEl.querySelector('.select-status');
                if (selectStatus) {
                    selectStatus.addEventListener('change', (e) => {
                        this.atualizarStatusMesa(mesa.id, e.target.value);
                    });
                }
            }
        });
    },

    renderizarMesa(mesa) {
        return `
            <div id="mesa-${mesa.id}" class="bg-white rounded-lg shadow-md p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Mesa ${mesa.numero}</h3>
                    <div class="flex space-x-2">
                        <button class="btn-editar text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-deletar text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <p>
                        <span class="font-medium">Capacidade:</span>
                        ${mesa.capacidade} pessoas
                    </p>
                    <p>
                        <span class="font-medium">Localização:</span>
                        ${mesa.localizacao}
                    </p>
                    <div class="flex items-center">
                        <span class="font-medium mr-2">Status:</span>
                        <select class="select-status form-select text-sm">
                            ${this.renderizarOpcoesStatus(mesa.status)}
                        </select>
                    </div>
                    ${mesa.observacoes ? `
                        <p class="text-sm text-gray-600">
                            <span class="font-medium">Observações:</span>
                            ${mesa.observacoes}
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderizarOpcoesStatus(statusAtual) {
        const opcoes = [
            'disponível',
            'ocupada',
            'reservada',
            'manutenção'
        ];

        return opcoes.map(status => `
            <option value="${status}" ${status === statusAtual ? 'selected' : ''}>
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
        `).join('');
    },

    // Métodos auxiliares
    editarMesa(mesa) {
        this._estado.mesaSelecionada = mesa;
        this._estado.modoEdicao = true;
        
        const form = document.getElementById('mesaForm');
        if (form) {
            form.numero.value = mesa.numero;
            form.capacidade.value = mesa.capacidade;
            form.localizacao.value = mesa.localizacao;
            form.observacoes.value = mesa.observacoes || '';
            
            // Atualiza o texto do botão
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = 'Atualizar Mesa';
            }
        }
    },

    limparFormulario() {
        this._estado.mesaSelecionada = null;
        this._estado.modoEdicao = false;
        
        const form = document.getElementById('mesaForm');
        if (form) {
            form.reset();
            
            // Restaura o texto do botão
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = 'Criar Mesa';
            }
        }
    },

    async confirmarDeletar(mesa) {
        if (confirm(`Deseja realmente deletar a Mesa ${mesa.numero}?`)) {
            await this.deletarMesa(mesa.id);
        }
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

// Função de inicialização chamada pelo roteador
async function inicializarMesas() {
    await mesasController.inicializar();
} 