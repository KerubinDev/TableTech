// Controlador de clientes
const clientesController = {
    // Estado local
    _estado: {
        clientes: [],
        clienteSelecionado: null,
        paginacao: {
            pagina: 1,
            porPagina: 10,
            total: 0,
            totalPaginas: 0
        },
        ordenacao: {
            campo: 'nome',
            direcao: 'asc'
        },
        termoBusca: '',
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
            await this.carregarClientes();
            this.configurarEventos();
            this.renderizar();
        } catch (erro) {
            console.error('Erro ao inicializar clientes:', erro);
            estadoApp.adicionarMensagem('erro', 'Erro ao carregar clientes');
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    // Métodos de dados
    async carregarClientes() {
        try {
            const params = {
                pagina: this._estado.paginacao.pagina,
                por_pagina: this._estado.paginacao.porPagina,
                ordem: this._estado.ordenacao.campo,
                direcao: this._estado.ordenacao.direcao
            };

            if (this._estado.termoBusca) {
                const resposta = await api.clientes.buscar(this._estado.termoBusca);
                this._estado.clientes = resposta.dados;
                this._estado.paginacao.total = resposta.dados.length;
                this._estado.paginacao.totalPaginas = 1;
            } else {
                const resposta = await api.clientes.listar(params);
                this._estado.clientes = resposta.dados.clientes;
                this._estado.paginacao.total = resposta.dados.total;
                this._estado.paginacao.totalPaginas = resposta.dados.paginas;
            }

            this._notificarMudanca();
        } catch (erro) {
            console.error('Erro ao carregar clientes:', erro);
            throw erro;
        }
    },

    async criarCliente(dados) {
        try {
            estadoApp.iniciarCarregamento();
            await api.clientes.criar(dados);
            await this.carregarClientes();
            estadoApp.adicionarMensagem('sucesso', 'Cliente criado com sucesso');
        } catch (erro) {
            console.error('Erro ao criar cliente:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async atualizarCliente(clienteId, dados) {
        try {
            estadoApp.iniciarCarregamento();
            await api.clientes.atualizar(clienteId, dados);
            await this.carregarClientes();
            estadoApp.adicionarMensagem('sucesso', 'Cliente atualizado com sucesso');
        } catch (erro) {
            console.error('Erro ao atualizar cliente:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async deletarCliente(clienteId) {
        try {
            estadoApp.iniciarCarregamento();
            await api.clientes.deletar(clienteId);
            await this.carregarClientes();
            estadoApp.adicionarMensagem('sucesso', 'Cliente deletado com sucesso');
        } catch (erro) {
            console.error('Erro ao deletar cliente:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    // Métodos de UI
    configurarEventos() {
        // Form de criação/edição
        const form = document.getElementById('clienteForm');
        if (form) {
            form.addEventListener('submit', async (evento) => {
                evento.preventDefault();
                const dados = Object.fromEntries(new FormData(form));
                
                try {
                    if (this._estado.modoEdicao) {
                        await this.atualizarCliente(this._estado.clienteSelecionado.id, dados);
                    } else {
                        await this.criarCliente(dados);
                    }
                    this.limparFormulario();
                } catch (erro) {
                    console.error('Erro ao salvar cliente:', erro);
                }
            });
        }

        // Campo de busca
        const campoBusca = document.getElementById('buscarCliente');
        if (campoBusca) {
            let timeoutBusca;
            campoBusca.addEventListener('input', () => {
                clearTimeout(timeoutBusca);
                timeoutBusca = setTimeout(() => {
                    this._estado.termoBusca = campoBusca.value;
                    this._estado.paginacao.pagina = 1;
                    this.carregarClientes();
                }, 300);
            });
        }

        // Ordenação
        const cabecalhos = document.querySelectorAll('[data-ordenar]');
        cabecalhos.forEach(cabecalho => {
            cabecalho.addEventListener('click', () => {
                const campo = cabecalho.dataset.ordenar;
                if (campo === this._estado.ordenacao.campo) {
                    this._estado.ordenacao.direcao = 
                        this._estado.ordenacao.direcao === 'asc' ? 'desc' : 'asc';
                } else {
                    this._estado.ordenacao.campo = campo;
                    this._estado.ordenacao.direcao = 'asc';
                }
                this.carregarClientes();
            });
        });
    },

    renderizar() {
        const container = document.getElementById('clientesContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="px-6 py-3 border-b cursor-pointer" data-ordenar="nome">
                                Nome ${this.renderizarSetaOrdenacao('nome')}
                            </th>
                            <th class="px-6 py-3 border-b cursor-pointer" data-ordenar="email">
                                Email ${this.renderizarSetaOrdenacao('email')}
                            </th>
                            <th class="px-6 py-3 border-b cursor-pointer" data-ordenar="telefone">
                                Telefone ${this.renderizarSetaOrdenacao('telefone')}
                            </th>
                            <th class="px-6 py-3 border-b cursor-pointer" data-ordenar="ultima_visita">
                                Última Visita ${this.renderizarSetaOrdenacao('ultima_visita')}
                            </th>
                            <th class="px-6 py-3 border-b">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this._estado.clientes.map(cliente => this.renderizarLinhaCliente(cliente)).join('')}
                    </tbody>
                </table>
            </div>
            ${this.renderizarPaginacao()}
        `;

        // Adiciona event listeners para as ações
        this._estado.clientes.forEach(cliente => {
            const linha = document.getElementById(`cliente-${cliente.id}`);
            if (linha) {
                // Botão editar
                const btnEditar = linha.querySelector('.btn-editar');
                if (btnEditar) {
                    btnEditar.addEventListener('click', () => this.editarCliente(cliente));
                }

                // Botão deletar
                const btnDeletar = linha.querySelector('.btn-deletar');
                if (btnDeletar) {
                    btnDeletar.addEventListener('click', () => this.confirmarDeletar(cliente));
                }

                // Botão ver detalhes
                const btnDetalhes = linha.querySelector('.btn-detalhes');
                if (btnDetalhes) {
                    btnDetalhes.addEventListener('click', () => this.verDetalhes(cliente));
                }
            }
        });
    },

    renderizarLinhaCliente(cliente) {
        return `
            <tr id="cliente-${cliente.id}" class="hover:bg-gray-50">
                <td class="px-6 py-4 border-b">${cliente.nome}</td>
                <td class="px-6 py-4 border-b">${cliente.email}</td>
                <td class="px-6 py-4 border-b">${cliente.telefone || '-'}</td>
                <td class="px-6 py-4 border-b">
                    ${cliente.ultima_visita ? new Date(cliente.ultima_visita).toLocaleDateString() : 'Nunca'}
                </td>
                <td class="px-6 py-4 border-b">
                    <div class="flex space-x-2">
                        <button class="btn-editar text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-detalhes text-green-600 hover:text-green-800">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-deletar text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    renderizarSetaOrdenacao(campo) {
        if (campo !== this._estado.ordenacao.campo) {
            return '<i class="fas fa-sort text-gray-400"></i>';
        }
        return this._estado.ordenacao.direcao === 'asc'
            ? '<i class="fas fa-sort-up text-blue-600"></i>'
            : '<i class="fas fa-sort-down text-blue-600"></i>';
    },

    renderizarPaginacao() {
        if (this._estado.paginacao.totalPaginas <= 1) return '';

        let paginas = [];
        const paginaAtual = this._estado.paginacao.pagina;
        const totalPaginas = this._estado.paginacao.totalPaginas;

        // Sempre mostra primeira página
        paginas.push(1);

        // Adiciona páginas ao redor da página atual
        for (let i = Math.max(2, paginaAtual - 1); i <= Math.min(totalPaginas - 1, paginaAtual + 1); i++) {
            paginas.push(i);
        }

        // Sempre mostra última página
        if (totalPaginas > 1) {
            paginas.push(totalPaginas);
        }

        // Adiciona reticências onde necessário
        const paginasComReticencias = [];
        for (let i = 0; i < paginas.length; i++) {
            if (i > 0 && paginas[i] - paginas[i-1] > 1) {
                paginasComReticencias.push('...');
            }
            paginasComReticencias.push(paginas[i]);
        }

        return `
            <div class="flex justify-center space-x-2 mt-4">
                <button class="px-3 py-1 rounded ${paginaAtual === 1 ? 'bg-gray-200' : 'bg-blue-600 text-white'}"
                        onclick="clientesController.mudarPagina(${paginaAtual - 1})"
                        ${paginaAtual === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${paginasComReticencias.map(pagina => 
                    pagina === '...' 
                        ? `<span class="px-3 py-1">...</span>`
                        : `<button class="px-3 py-1 rounded ${pagina === paginaAtual ? 'bg-blue-600 text-white' : 'bg-gray-200'}"
                                   onclick="clientesController.mudarPagina(${pagina})">
                               ${pagina}
                           </button>`
                ).join('')}
                
                <button class="px-3 py-1 rounded ${paginaAtual === totalPaginas ? 'bg-gray-200' : 'bg-blue-600 text-white'}"
                        onclick="clientesController.mudarPagina(${paginaAtual + 1})"
                        ${paginaAtual === totalPaginas ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    },

    // Métodos auxiliares
    mudarPagina(pagina) {
        if (pagina < 1 || pagina > this._estado.paginacao.totalPaginas) return;
        this._estado.paginacao.pagina = pagina;
        this.carregarClientes();
    },

    editarCliente(cliente) {
        this._estado.clienteSelecionado = cliente;
        this._estado.modoEdicao = true;
        
        const form = document.getElementById('clienteForm');
        if (form) {
            form.nome.value = cliente.nome;
            form.email.value = cliente.email;
            form.telefone.value = cliente.telefone || '';
            form.data_nascimento.value = cliente.data_nascimento || '';
            form.preferencias.value = cliente.preferencias || '';
            form.restricoes.value = cliente.restricoes || '';
            form.notas.value = cliente.notas || '';
            
            // Atualiza o texto do botão
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = 'Atualizar Cliente';
            }
        }
    },

    async verDetalhes(cliente) {
        try {
            estadoApp.iniciarCarregamento();
            const resposta = await api.clientes.obter(cliente.id, true);
            const clienteComHistorico = resposta.dados;
            
            // Aqui você pode implementar a lógica para mostrar os detalhes em um modal
            console.log('Detalhes do cliente:', clienteComHistorico);
            
        } catch (erro) {
            console.error('Erro ao carregar detalhes do cliente:', erro);
            estadoApp.adicionarMensagem('erro', 'Erro ao carregar detalhes do cliente');
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    limparFormulario() {
        this._estado.clienteSelecionado = null;
        this._estado.modoEdicao = false;
        
        const form = document.getElementById('clienteForm');
        if (form) {
            form.reset();
            
            // Restaura o texto do botão
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = 'Criar Cliente';
            }
        }
    },

    async confirmarDeletar(cliente) {
        if (confirm(`Deseja realmente deletar o cliente ${cliente.nome}?`)) {
            await this.deletarCliente(cliente.id);
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
async function inicializarClientes() {
    await clientesController.inicializar();
} 