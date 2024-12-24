// Classe para gerenciar os relatórios do sistema
class GerenciadorRelatorios {
    constructor() {
        this._relatorioAtual = null;
        this._filtros = {
            dataInicio: null,
            dataFim: null,
            tipo: null,
            status: null
        };
    }

    // Define os filtros para o relatório
    setFiltros(filtros) {
        this._filtros = {
            ...this._filtros,
            ...filtros
        };
    }

    // Gera relatório de reservas
    async gerarRelatorioReservas() {
        try {
            const resposta = await api.get('/relatorios/reservas', {
                params: this._filtros,
                responseType: 'blob'
            });
            
            this._relatorioAtual = resposta.data;
            return this._relatorioAtual;
        } catch (erro) {
            console.error('Erro ao gerar relatório de reservas:', erro);
            throw erro;
        }
    }

    // Gera relatório de clientes
    async gerarRelatorioClientes() {
        try {
            const resposta = await api.get('/relatorios/clientes', {
                params: this._filtros,
                responseType: 'blob'
            });
            
            this._relatorioAtual = resposta.data;
            return this._relatorioAtual;
        } catch (erro) {
            console.error('Erro ao gerar relatório de clientes:', erro);
            throw erro;
        }
    }

    // Gera relatório de ocupação
    async gerarRelatorioOcupacao() {
        try {
            const resposta = await api.get('/relatorios/ocupacao', {
                params: this._filtros,
                responseType: 'blob'
            });
            
            this._relatorioAtual = resposta.data;
            return this._relatorioAtual;
        } catch (erro) {
            console.error('Erro ao gerar relatório de ocupação:', erro);
            throw erro;
        }
    }

    // Gera relatório financeiro
    async gerarRelatorioFinanceiro() {
        try {
            const resposta = await api.get('/relatorios/financeiro', {
                params: this._filtros,
                responseType: 'blob'
            });
            
            this._relatorioAtual = resposta.data;
            return this._relatorioAtual;
        } catch (erro) {
            console.error('Erro ao gerar relatório financeiro:', erro);
            throw erro;
        }
    }

    // Baixa o relatório atual
    baixarRelatorioAtual(nomeArquivo) {
        if (!this._relatorioAtual) {
            throw new Error('Nenhum relatório foi gerado ainda');
        }

        const url = window.URL.createObjectURL(new Blob([this._relatorioAtual]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    // Visualiza o relatório atual em uma nova janela
    visualizarRelatorioAtual() {
        if (!this._relatorioAtual) {
            throw new Error('Nenhum relatório foi gerado ainda');
        }

        const url = window.URL.createObjectURL(new Blob([this._relatorioAtual]));
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
    }

    // Envia o relatório atual por email
    async enviarRelatorioPorEmail(email, assunto, mensagem) {
        if (!this._relatorioAtual) {
            throw new Error('Nenhum relatório foi gerado ainda');
        }

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('assunto', assunto);
            formData.append('mensagem', mensagem);
            formData.append('arquivo', new Blob([this._relatorioAtual], { type: 'application/pdf' }));

            await api.post('/relatorios/enviar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (erro) {
            console.error('Erro ao enviar relatório por email:', erro);
            throw erro;
        }
    }

    // Retorna os filtros atuais
    get filtros() {
        return this._filtros;
    }

    // Verifica se existe um relatório gerado
    get temRelatorio() {
        return this._relatorioAtual !== null;
    }
}

// Instância global do gerenciador de relatórios
const gerenciadorRelatorios = new GerenciadorRelatorios(); 