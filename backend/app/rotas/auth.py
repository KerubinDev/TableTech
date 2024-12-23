"""
Rotas de autenticação do sistema.
"""
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from ..models.usuario import Usuario
from .. import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Rota de login que retorna tokens JWT."""
    dados = request.get_json()
    
    if not dados or not dados.get('email') or not dados.get('senha'):
        return jsonify({
            'mensagem': 'Dados de login incompletos'
        }), 400
    
    usuario = Usuario.query.filter_by(email=dados['email']).first()
    
    if not usuario or not usuario.verificar_senha(dados['senha']):
        return jsonify({
            'mensagem': 'Email ou senha inválidos'
        }), 401
    
    if not usuario.ativo:
        return jsonify({
            'mensagem': 'Usuário desativado'
        }), 401
    
    # Atualiza último acesso
    usuario.ultimo_acesso = datetime.utcnow()
    db.session.commit()
    
    # Gera tokens
    access_token = create_access_token(identity=usuario.id)
    refresh_token = create_refresh_token(identity=usuario.id)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'tipo_usuario': usuario.tipo.value
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Renova o token de acesso usando refresh token."""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Realiza o logout do usuário."""
    # Aqui poderíamos implementar uma lista negra de tokens
    return jsonify({'mensagem': 'Logout realizado com sucesso'}), 200 