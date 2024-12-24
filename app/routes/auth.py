from flask import Blueprint, request
from app.models.usuario import Usuario
from app.utils.auth import gerar_token, verificar_senha
from app.utils.validadores import validar_email, validar_senha
from app.utils.respostas import sucesso, erro, nao_autorizado

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Realiza o login do usuário."""
    try:
        dados = request.get_json()
        
        # Valida campos obrigatórios
        if not dados or 'email' not in dados or 'senha' not in dados:
            return erro('Email e senha são obrigatórios')
            
        email = dados['email']
        senha = dados['senha']
        
        # Valida formato do email
        if not validar_email(email):
            return erro('Email inválido')
            
        # Busca o usuário
        usuario = Usuario.query.filter_by(email=email).first()
        if not usuario:
            return nao_autorizado('Email ou senha inválidos')
            
        # Verifica a senha
        if not verificar_senha(senha, usuario.senha_hash):
            return nao_autorizado('Email ou senha inválidos')
            
        # Verifica se o usuário está ativo
        if not usuario.ativo:
            return nao_autorizado('Usuário inativo')
            
        # Gera o token
        token = gerar_token(usuario)
        
        return sucesso({
            'token': token,
            'usuario': usuario.to_dict()
        })
        
    except Exception as e:
        return erro(str(e))

@auth_bp.route('/registro', methods=['POST'])
def registro():
    """Registra um novo usuário."""
    try:
        dados = request.get_json()
        
        # Valida campos obrigatórios
        campos_obrigatorios = ['nome', 'email', 'senha']
        for campo in campos_obrigatorios:
            if campo not in dados:
                return erro(f'Campo {campo} é obrigatório')
                
        # Valida formato do email
        if not validar_email(dados['email']):
            return erro('Email inválido')
            
        # Valida formato da senha
        if not validar_senha(dados['senha']):
            return erro('Senha não atende aos requisitos mínimos')
            
        # Verifica se já existe usuário com o email
        if Usuario.query.filter_by(email=dados['email']).first():
            return erro('Email já cadastrado')
            
        # Cria o usuário
        usuario = Usuario(
            nome=dados['nome'],
            email=dados['email'],
            cargo=dados.get('cargo', 'usuario')
        )
        usuario.definir_senha(dados['senha'])
        
        usuario.save()
        
        return sucesso({
            'usuario': usuario.to_dict()
        }, 'Usuário registrado com sucesso')
        
    except Exception as e:
        return erro(str(e))

@auth_bp.route('/perfil', methods=['GET'])
def obter_perfil():
    """Obtém os dados do usuário atual."""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return nao_autorizado('Token não fornecido')
            
        # Decodifica o token
        dados = decodificar_token(token)
        usuario = Usuario.query.get(dados['id'])
        
        if not usuario:
            return nao_autorizado('Usuário não encontrado')
            
        return sucesso({
            'usuario': usuario.to_dict()
        })
        
    except Exception as e:
        return erro(str(e))

@auth_bp.route('/perfil', methods=['PUT'])
def atualizar_perfil():
    """Atualiza os dados do usuário atual."""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return nao_autorizado('Token não fornecido')
            
        # Decodifica o token
        dados_token = decodificar_token(token)
        usuario = Usuario.query.get(dados_token['id'])
        
        if not usuario:
            return nao_autorizado('Usuário não encontrado')
            
        dados = request.get_json()
        
        # Atualiza os campos permitidos
        if 'nome' in dados:
            usuario.nome = dados['nome']
            
        if 'email' in dados:
            if not validar_email(dados['email']):
                return erro('Email inválido')
                
            # Verifica se o email já está em uso
            usuario_existente = Usuario.query.filter_by(email=dados['email']).first()
            if usuario_existente and usuario_existente.id != usuario.id:
                return erro('Email já está em uso')
                
            usuario.email = dados['email']
            
        if 'senha_atual' in dados and 'nova_senha' in dados:
            # Verifica a senha atual
            if not verificar_senha(dados['senha_atual'], usuario.senha_hash):
                return erro('Senha atual incorreta')
                
            # Valida a nova senha
            if not validar_senha(dados['nova_senha']):
                return erro('Nova senha não atende aos requisitos mínimos')
                
            usuario.definir_senha(dados['nova_senha'])
            
        usuario.save()
        
        return sucesso({
            'usuario': usuario.to_dict()
        }, 'Perfil atualizado com sucesso')
        
    except Exception as e:
        return erro(str(e)) 