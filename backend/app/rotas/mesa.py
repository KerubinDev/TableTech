"""
Rotas para gerenciamento de mesas do restaurante.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.mesa import Mesa, StatusMesa, LocalizacaoMesa
from ..models.usuario import Usuario, TipoUsuario
from .. import db

mesa_bp = Blueprint('mesa', __name__)


def verificar_permissao_admin():
    """Verifica se o usuário atual é um administrador."""
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(usuario_id)
    return usuario and usuario.tipo == TipoUsuario.ADMIN


@mesa_bp.route('/mesas', methods=['GET'])
@jwt_required()
def listar_mesas():
    """Lista todas as mesas do restaurante."""
    mesas = Mesa.query.all()
    return jsonify([{
        'id': mesa.id,
        'numero': mesa.numero,
        'capacidade': mesa.capacidade,
        'localizacao': mesa.localizacao.value,
        'status': mesa.status.value
    } for mesa in mesas]), 200


@mesa_bp.route('/mesas/<int:mesa_id>', methods=['GET'])
@jwt_required()
def obter_mesa(mesa_id):
    """Obtém detalhes de uma mesa específica."""
    mesa = Mesa.query.get_or_404(mesa_id)
    return jsonify({
        'id': mesa.id,
        'numero': mesa.numero,
        'capacidade': mesa.capacidade,
        'localizacao': mesa.localizacao.value,
        'status': mesa.status.value
    }), 200


@mesa_bp.route('/mesas', methods=['POST'])
@jwt_required()
def criar_mesa():
    """Cria uma nova mesa."""
    if not verificar_permissao_admin():
        return jsonify({'mensagem': 'Permissão negada'}), 403
    
    dados = request.get_json()
    
    try:
        nova_mesa = Mesa(
            numero=dados['numero'],
            capacidade=dados['capacidade'],
            localizacao=LocalizacaoMesa(dados['localizacao'])
        )
        db.session.add(nova_mesa)
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Mesa criada com sucesso',
            'id': nova_mesa.id
        }), 201
        
    except KeyError as e:
        return jsonify({
            'mensagem': f'Campo obrigatório ausente: {str(e)}'
        }), 400
    except ValueError as e:
        return jsonify({
            'mensagem': f'Valor inválido: {str(e)}'
        }), 400


@mesa_bp.route('/mesas/<int:mesa_id>', methods=['PUT'])
@jwt_required()
def atualizar_mesa(mesa_id):
    """Atualiza informações de uma mesa existente."""
    if not verificar_permissao_admin():
        return jsonify({'mensagem': 'Permissão negada'}), 403
    
    mesa = Mesa.query.get_or_404(mesa_id)
    dados = request.get_json()
    
    try:
        if 'numero' in dados:
            mesa.numero = dados['numero']
        if 'capacidade' in dados:
            mesa.capacidade = dados['capacidade']
        if 'localizacao' in dados:
            mesa.localizacao = LocalizacaoMesa(dados['localizacao'])
        if 'status' in dados:
            mesa.status = StatusMesa(dados['status'])
        
        db.session.commit()
        return jsonify({'mensagem': 'Mesa atualizada com sucesso'}), 200
        
    except ValueError as e:
        return jsonify({'mensagem': f'Valor inválido: {str(e)}'}), 400


@mesa_bp.route('/mesas/<int:mesa_id>', methods=['DELETE'])
@jwt_required()
def deletar_mesa(mesa_id):
    """Remove uma mesa do sistema."""
    if not verificar_permissao_admin():
        return jsonify({'mensagem': 'Permissão negada'}), 403
    
    mesa = Mesa.query.get_or_404(mesa_id)
    
    # Verifica se existem reservas associadas
    if mesa.reservas:
        return jsonify({
            'mensagem': 'Não é possível excluir mesa com reservas'
        }), 400
    
    db.session.delete(mesa)
    db.session.commit()
    return jsonify({'mensagem': 'Mesa removida com sucesso'}), 200


@mesa_bp.route('/mesas/disponiveis', methods=['GET'])
@jwt_required()
def listar_mesas_disponiveis():
    """Lista todas as mesas disponíveis para reserva."""
    mesas = Mesa.query.filter_by(status=StatusMesa.DISPONIVEL).all()
    return jsonify([{
        'id': mesa.id,
        'numero': mesa.numero,
        'capacidade': mesa.capacidade,
        'localizacao': mesa.localizacao.value
    } for mesa in mesas]), 200 