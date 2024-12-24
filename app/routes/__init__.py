from functools import wraps
from flask import request
from app.utils.auth import decodificar_token
from app.utils.respostas import nao_autorizado, erro
from app.models.usuario import Usuario


def requer_login(f):
    """Decorator para verificar se o usuário está autenticado."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                return nao_autorizado('Token não fornecido')
                
            dados = decodificar_token(token)
            usuario = Usuario.query.get(dados['id'])
            
            if not usuario:
                return nao_autorizado('Usuário não encontrado')
                
            if not usuario.ativo:
                return nao_autorizado('Usuário inativo')
                
            return f(*args, **kwargs)
            
        except Exception as e:
            return erro(str(e))
            
    return decorated


def requer_admin(f):
    """Decorator para verificar se o usuário é administrador."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                return nao_autorizado('Token não fornecido')
                
            dados = decodificar_token(token)
            usuario = Usuario.query.get(dados['id'])
            
            if not usuario:
                return nao_autorizado('Usuário não encontrado')
                
            if not usuario.ativo:
                return nao_autorizado('Usuário inativo')
                
            if usuario.cargo != 'admin':
                return nao_autorizado('Acesso restrito a administradores')
                
            return f(*args, **kwargs)
            
        except Exception as e:
            return erro(str(e))
            
    return decorated 