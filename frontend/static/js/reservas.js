// Controlador de reservas
const reservasController = {
    // Estado local
    _estado: {
        reservas: [],
        reservaSelecionada: null,
        filtros: {
            data: null,
            status: '',
            cliente_id: null,
            mesa_id: null
        },
        modoEdicao: false,
        mesasDisponiveis: [],
        clientesSugeridos: []
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
            
            // Define a data inicial como hoje
            this._estado.filtros.data = new Date().toISOString().split('T')[0];
            
            await this.carregarReservas();
            this.configurarEventos();
            this.renderizar();
        } catch (erro) {
            console.error('Erro ao inicializar reservas:', erro);
            estadoApp.adicionarMensagem('erro', 'Erro ao carregar reservas');
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    // Métodos de dados
    async carregarReservas() {
        try {
            const resposta = await api.reservas.listar(this._estado.filtros);
            this._estado.reservas = resposta.dados;
            this._notificarMudanca();
        } catch (erro) {
            console.error('Erro ao carregar reservas:', erro);
            throw erro;
        }
    },

    async criarReserva(dados) {
        try {
            estadoApp.iniciarCarregamento();
            await api.reservas.criar(dados);
            await this.carregarReservas();
            estadoApp.adicionarMensagem('sucesso', 'Reserva criada com sucesso');
        } catch (erro) {
            console.error('Erro ao criar reserva:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async atualizarReserva(reservaId, dados) {
        try {
            estadoApp.iniciarCarregamento();
            await api.reservas.atualizar(reservaId, dados);
            await this.carregarReservas();
            estadoApp.adicionarMensagem('sucesso', 'Reserva atualizada com sucesso');
        } catch (erro) {
            console.error('Erro ao atualizar reserva:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async cancelarReserva(reservaId) {
        try {
            estadoApp.iniciarCarregamento();
            await api.reservas.cancelar(reservaId);
            await this.carregarReservas();
            estadoApp.adicionarMensagem('sucesso', 'Reserva cancelada com sucesso');
        } catch (erro) {
            console.error('Erro ao cancelar reserva:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async verificarDisponibilidade(dataHora, numPessoas) {
        try {
            estadoApp.iniciarCarregamento();
            const resposta = await api.reservas.verificarDisponibilidade({
                data_hora: dataHora,
                num_pessoas: numPessoas
            });
            this._estado.mesasDisponiveis = resposta.dados.mesas_disponiveis;
            this._notificarMudanca();
        } catch (erro) {
            console.error('Erro ao verificar disponibilidade:', erro);
            estadoApp.adicionarMensagem('erro', erro.message);
            throw erro;
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    async buscarClientes(termo) {
        try {
            if (!termo) {
                this._estado.clientesSugeridos = [];
                this._notificarMudanca();
                return;
            }

            const resposta = await api.clientes.buscar(termo);
            this._estado.clientesSugeridos = resposta.dados;
            this._notificarMudanca();
        } catch (erro) {
            console.error('Erro ao buscar clientes:', erro);
            this._estado.clientesSugeridos = [];
            this._notificarMudanca();
        }
    },

    // Métodos de UI
    configurarEventos() {
        // Form de criação/edição
        const form = document.getElementById('reservaForm');
        if (form) {
            form.addEventListener('submit', async (evento) => {
                evento.preventDefault();
                const formData = new FormData(form);
                const dados = {
                    cliente_id: parseInt(formData.get('cliente_id')),
                    mesa_id: parseInt(formData.get('mesa_id')),
                    data_hora: `${formData.get('data')}T${formData.get('hora')}:00`,
                    num_pessoas: parseInt(formData.get('num_pessoas')),
                    duracao: parseInt(formData.get('duracao')),
                    observacoes: formData.get('observacoes')
                };
                
                try {
                    if (this._estado.modoEdicao) {
                        await this.atualizarReserva(this._estado.reservaSelecionada.id, dados);
                    } else {
                        await this.criarReserva(dados);
                    }
                    this.limparFormulario();
                } catch (erro) {
                    console.error('Erro ao salvar reserva:', erro);
                }
            });

            // Verifica disponibilidade ao mudar data/hora/pessoas
            ['data', 'hora', 'num_pessoas'].forEach(campo => {
                form[campo].addEventListener('change', () => {
                    const data = form.data.value;
                    const hora = form.hora.value;
                    const numPessoas = parseInt(form.num_pessoas.value);

                    if (data && hora && numPessoas) {
                        this.verificarDisponibilidade(`${data}T${hora}:00`, numPessoas);
                    }
                });
            });

            // Busca de clientes
            const campoCliente = form.querySelector('[name="cliente_busca"]');
            if (campoCliente) {
                let timeoutBusca;
                campoCliente.addEventListener('input', () => {
                    clearTimeout(timeoutBusca);
                    timeoutBusca = setTimeout(() => {
                        this.buscarClientes(campoCliente.value);
                    }, 300);
                });
            }
        }

        // Filtros
        const filtroData = document.getElementById('filtroData');
        if (filtroData) {
            filtroData.value = this._estado.filtros.data;
            filtroData.addEventListener('change', () => {
                this._estado.filtros.data = filtroData.value;
                this.carregarReservas();
            });
        }

        const filtroStatus = document.getElementById('filtroStatus');
        if (filtroStatus) {
            filtroStatus.addEventListener('change', () => {
                this._estado.filtros.status = filtroStatus.value;
                this.carregarReservas();
            });
        }
    },

    renderizar() {
        const container = document.getElementById('reservasContainer');
        if (!container) return;

        // Agrupa reservas por horário
        const reservasPorHorario = this._agruparReservasPorHorario();

        container.innerHTML = `
            <div class="grid grid-cols-1 gap-6">
                ${Object.entries(reservasPorHorario).map(([horario, reservas]) => `
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <h3 class="text-lg font-semibold mb-4">${this._formatarHorario(horario)}</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${reservas.map(reserva => this.renderizarReserva(reserva)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Adiciona event listeners para as ações
        this._estado.reservas.forEach(reserva => {
            const reservaEl = document.getElementById(`reserva-${reserva.id}`);
            if (reservaEl) {
                // Botão editar
                const btnEditar = reservaEl.querySelector('.btn-editar');
                if (btnEditar) {
                    btnEditar.addEventListener('click', () => this.editarReserva(reserva));
                }

                // Botão cancelar
                const btnCancelar = reservaEl.querySelector('.btn-cancelar');
                if (btnCancelar) {
                    btnCancelar.addEventListener('click', () => this.confirmarCancelamento(reserva));
                }

                // Botão detalhes
                const btnDetalhes = reservaEl.querySelector('.btn-detalhes');
                if (btnDetalhes) {
                    btnDetalhes.addEventListener('click', () => this.verDetalhes(reserva));
                }
            }
        });

        // Renderiza sugestões de clientes
        this.renderizarSugestoes();

        // Renderiza mesas disponíveis
        this.renderizarMesasDisponiveis();
    },

    renderizarReserva(reserva) {
        const dataHora = new Date(reserva.data_hora);
        const status = this._getStatusInfo(reserva.status);

        return `
            <div id="reserva-${reserva.id}" class="bg-gray-50 rounded p-4 relative">
                <div class="absolute top-2 right-2 flex space-x-2">
                    <button class="btn-editar text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-detalhes text-green-600 hover:text-green-800">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-cancelar text-red-600 hover:text-red-800">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="mt-6 space-y-2">
                    <p class="font-medium">${reserva.cliente.nome}</p>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-users mr-1"></i> ${reserva.num_pessoas} pessoas
                    </p>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-table mr-1"></i> Mesa ${reserva.mesa.numero}
                    </p>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-clock mr-1"></i> ${this._formatarDuracao(reserva.duracao)}
                    </p>
                    <div class="flex items-center mt-2">
                        <span class="px-2 py-1 text-xs rounded-full ${status.classe}">
                            ${status.texto}
                        </span>
                    </div>
                </div>
            </div>
        `;
    },

    renderizarSugestoes() {
        const container = document.getElementById('clientesSugeridos');
        if (!container) return;

        container.innerHTML = this._estado.clientesSugeridos.map(cliente => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer"
                 onclick="reservasController.selecionarCliente(${cliente.id}, '${cliente.nome}')">
                <p class="font-medium">${cliente.nome}</p>
                <p class="text-sm text-gray-600">${cliente.email}</p>
            </div>
        `).join('');
    },

    renderizarMesasDisponiveis() {
        const container = document.getElementById('mesasDisponiveis');
        if (!container) return;

        if (this._estado.mesasDisponiveis.length === 0) {
            container.innerHTML = '<p class="text-gray-600">Nenhuma mesa disponível para os critérios selecionados.</p>';
            return;
        }

        container.innerHTML = this._estado.mesasDisponiveis.map(mesa => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer"
                 onclick="reservasController.selecionarMesa(${mesa.id})">
                <p class="font-medium">Mesa ${mesa.numero}</p>
                <p class="text-sm text-gray-600">
                    Capacidade: ${mesa.capacidade} pessoas
                    <br>
                    Localização: ${mesa.localizacao}
                </p>
            </div>
        `).join('');
    },

    // Métodos auxiliares
    _agruparReservasPorHorario() {
        return this._estado.reservas.reduce((grupos, reserva) => {
            const horario = reserva.data_hora.split('T')[1].substring(0, 5);
            if (!grupos[horario]) {
                grupos[horario] = [];
            }
            grupos[horario].push(reserva);
            return grupos;
        }, {});
    },

    _formatarHorario(horario) {
        return `${horario}h`;
    },

    _formatarDuracao(minutos) {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return horas > 0 
            ? `${horas}h${minutosRestantes > 0 ? ` ${minutosRestantes}min` : ''}`
            : `${minutosRestantes}min`;
    },

    _getStatusInfo(status) {
        const statusMap = {
            'pendente': {
                texto: 'Pendente',
                classe: 'bg-yellow-100 text-yellow-800'
            },
            'confirmada': {
                texto: 'Confirmada',
                classe: 'bg-green-100 text-green-800'
            },
            'cancelada': {
                texto: 'Cancelada',
                classe: 'bg-red-100 text-red-800'
            },
            'concluida': {
                texto: 'Concluída',
                classe: 'bg-blue-100 text-blue-800'
            }
        };
        return statusMap[status] || {
            texto: status.charAt(0).toUpperCase() + status.slice(1),
            classe: 'bg-gray-100 text-gray-800'
        };
    },

    selecionarCliente(clienteId, nomeCliente) {
        const form = document.getElementById('reservaForm');
        if (form) {
            form.cliente_id.value = clienteId;
            form.cliente_busca.value = nomeCliente;
            this._estado.clientesSugeridos = [];
            this._notificarMudanca();
        }
    },

    selecionarMesa(mesaId) {
        const form = document.getElementById('reservaForm');
        if (form) {
            form.mesa_id.value = mesaId;
        }
    },

    editarReserva(reserva) {
        this._estado.reservaSelecionada = reserva;
        this._estado.modoEdicao = true;
        
        const form = document.getElementById('reservaForm');
        if (form) {
            const dataHora = new Date(reserva.data_hora);
            
            form.cliente_id.value = reserva.cliente_id;
            form.cliente_busca.value = reserva.cliente.nome;
            form.mesa_id.value = reserva.mesa_id;
            form.data.value = dataHora.toISOString().split('T')[0];
            form.hora.value = dataHora.toTimeString().substring(0, 5);
            form.num_pessoas.value = reserva.num_pessoas;
            form.duracao.value = reserva.duracao;
            form.observacoes.value = reserva.observacoes || '';
            
            // Atualiza o texto do botão
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = 'Atualizar Reserva';
            }
        }
    },

    async verDetalhes(reserva) {
        try {
            estadoApp.iniciarCarregamento();
            const resposta = await api.reservas.obter(reserva.id, true);
            const reservaComDetalhes = resposta.dados;
            
            // Aqui você pode implementar a lógica para mostrar os detalhes em um modal
            console.log('Detalhes da reserva:', reservaComDetalhes);
            
        } catch (erro) {
            console.error('Erro ao carregar detalhes da reserva:', erro);
            estadoApp.adicionarMensagem('erro', 'Erro ao carregar detalhes da reserva');
        } finally {
            estadoApp.finalizarCarregamento();
        }
    },

    limparFormulario() {
        this._estado.reservaSelecionada = null;
        this._estado.modoEdicao = false;
        this._estado.mesasDisponiveis = [];
        this._estado.clientesSugeridos = [];
        
        const form = document.getElementById('reservaForm');
        if (form) {
            form.reset();
            
            // Restaura o texto do botão
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = 'Criar Reserva';
            }
        }

        this._notificarMudanca();
    },

    async confirmarCancelamento(reserva) {
        if (confirm(`Deseja realmente cancelar a reserva de ${reserva.cliente.nome}?`)) {
            await this.cancelarReserva(reserva.id);
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
async function inicializarReservas() {
    await reservasController.inicializar();
} 