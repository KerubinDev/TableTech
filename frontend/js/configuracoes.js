// Classe para gerenciar as configurações do sistema
class GerenciadorConfiguracoes {
    constructor() {
        this._configuracoesGerais = null;
        this._configuracoesEmail = null;
    }

    // Carrega as configurações gerais do sistema
    async carregarConfiguracoesGerais() {
        try {
            const resposta = await api.get('/configuracoes/geral');
            this._configuracoesGerais = resposta.data;
            return this._configuracoesGerais;
        } catch (erro) {
            console.error('Erro ao carregar configurações gerais:', erro);
            throw erro;
        }
    }

    // Carrega as configurações de email
    async carregarConfiguracoesEmail() {
        try {
            const resposta = await api.get('/configuracoes/email');
            this._configuracoesEmail = resposta.data;
            return this._configuracoesEmail;
        } catch (erro) {
            console.error('Erro ao carregar configurações de email:', erro);
            throw erro;
        }
    }

    // Salva as configurações gerais
    async salvarConfiguracoesGerais(configuracoes) {
        try {
            const resposta = await api.put('/configuracoes/geral', configuracoes);
            this._configuracoesGerais = resposta.data;
            return this._configuracoesGerais;
        } catch (erro) {
            console.error('Erro ao salvar configurações gerais:', erro);
            throw erro;
        }
    }

    // Salva as configurações de email
    async salvarConfiguracoesEmail(configuracoes) {
        try {
            const resposta = await api.put('/configuracoes/email', configuracoes);
            this._configuracoesEmail = resposta.data;
            return this._configuracoesEmail;
        } catch (erro) {
            console.error('Erro ao salvar configurações de email:', erro);
            throw erro;
        }
    }

    // Testa as configurações de email
    async testarEmail() {
        try {
            await api.post('/configuracoes/email/teste');
        } catch (erro) {
            console.error('Erro ao testar configurações de email:', erro);
            throw erro;
        }
    }

    // Gera um backup do sistema
    async gerarBackup() {
        try {
            const resposta = await api.get('/configuracoes/backup', {
                responseType: 'blob'
            });
            
            // Cria um link para download do arquivo
            const url = window.URL.createObjectURL(new Blob([resposta.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup_${new Date().toISOString()}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (erro) {
            console.error('Erro ao gerar backup:', erro);
            throw erro;
        }
    }

    // Restaura um backup do sistema
    async restaurarBackup(arquivo) {
        try {
            const formData = new FormData();
            formData.append('arquivo', arquivo);
            
            await api.post('/configuracoes/backup/restaurar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (erro) {
            console.error('Erro ao restaurar backup:', erro);
            throw erro;
        }
    }

    // Retorna as configurações gerais em cache
    get configuracoesGerais() {
        return this._configuracoesGerais;
    }

    // Retorna as configurações de email em cache
    get configuracoesEmail() {
        return this._configuracoesEmail;
    }

    // Verifica se as configurações gerais foram carregadas
    get temConfiguracoesGerais() {
        return this._configuracoesGerais !== null;
    }

    // Verifica se as configurações de email foram carregadas
    get temConfiguracoesEmail() {
        return this._configuracoesEmail !== null;
    }
}

// Instância global do gerenciador de configurações
const gerenciadorConfiguracoes = new GerenciadorConfiguracoes(); 