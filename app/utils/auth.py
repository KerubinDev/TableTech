import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app


def gerar_token(usuario):
    """
    Gera um token JWT para o usuário.
    
    Args:
        usuario: Instância do modelo Usuario
        
    Returns:
        str: Token JWT
    """
    try:
        payload = {
            'id': usuario.id,
            'email': usuario.email,
            'cargo': usuario.cargo,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        
        return jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
    except Exception as e:
        print(f"Erro ao gerar token: {str(e)}")
        raise


def decodificar_token(token):
    """
    Decodifica um token JWT.
    
    Args:
        token (str): Token JWT
        
    Returns:
        dict: Dados do payload do token
        
    Raises:
        jwt.ExpiredSignatureError: Se o token expirou
        jwt.InvalidTokenError: Se o token é inválido
    """
    try:
        return jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        
    except jwt.ExpiredSignatureError:
        raise Exception('Token expirado')
        
    except jwt.InvalidTokenError:
        raise Exception('Token inválido')


def gerar_hash_senha(senha):
    """
    Gera um hash seguro para a senha.
    
    Args:
        senha (str): Senha em texto plano
        
    Returns:
        str: Hash da senha
    """
    return generate_password_hash(senha)


def verificar_senha(senha, hash_senha):
    """
    Verifica se a senha corresponde ao hash.
    
    Args:
        senha (str): Senha em texto plano
        hash_senha (str): Hash da senha
        
    Returns:
        bool: True se a senha corresponde ao hash, False caso contrário
    """
    return check_password_hash(hash_senha, senha) 