// Classe para gerenciar o perfil do usuário
class GerenciadorPerfil {
    constructor() {
        this._dadosUsuario = null;
    }

    // Carrega os dados do usuário do servidor
    async carregarDados() {
        try {
            const resposta = await api.get('/usuarios/perfil');
            this._dadosUsuario = resposta.data;
            return this._dadosUsuario;
        } catch (erro) {
            console.error('Erro ao carregar dados do usuário:', erro);
            throw erro;
        }
    }

    // Atualiza o perfil do usuário
    async atualizarPerfil(dados) {
        try {
            const resposta = await api.put('/usuarios/perfil', dados);
            this._dadosUsuario = resposta.data;
            
            // Atualiza os dados no authManager
            if (authManager) {
                authManager.atualizarDadosUsuario(this._dadosUsuario);
            }
            
            return this._dadosUsuario;
        } catch (erro) {
            console.error('Erro ao atualizar perfil:', erro);
            throw erro;
        }
    }

    // Altera a senha do usuário
    async alterarSenha(senhaAtual, novaSenha) {
        try {
            await api.put('/usuarios/senha', {
                senha_atual: senhaAtual,
                nova_senha: novaSenha
            });
        } catch (erro) {
            console.error('Erro ao alterar senha:', erro);
            throw erro;
        }
    }

    // Retorna os dados do usuário em cache
    get dadosUsuario() {
        return this._dadosUsuario;
    }

    // Verifica se o usuário tem permissão específica
    temPermissao(permissao) {
        if (!this._dadosUsuario || !this._dadosUsuario.permissoes) {
            return false;
        }
        return this._dadosUsuario.permissoes.includes(permissao);
    }

    // Verifica se o usuário é administrador
    get isAdmin() {
        return this.temPermissao('admin');
    }
}

// Instância global do gerenciador de perfil
const gerenciadorPerfil = new GerenciadorPerfil(); 