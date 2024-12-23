"""
Rotas para gerenciamento de clientes do restaurante.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.cliente import Cliente, RestricaoAlimentar
from .. import db
from datetime import datetime

cliente_bp = Blueprint('cliente', __name__)


@cliente_bp.route('/clientes', methods=['GET'])
@jwt_required()
def listar_clientes():
    """Lista todos os clientes cadastrados."""
    clientes = Cliente.query.all()
    return jsonify([{
        'id': cliente.id,
        'nome': cliente.nome,
        'email': cliente.email,
        'telefone': cliente.telefone,
        'restricoes': cliente.restricoes
    } for cliente in clientes]), 200


@cliente_bp.route('/clientes/<int:cliente_id>', methods=['GET'])
@jwt_required()
def obter_cliente(cliente_id):
    """Obtém detalhes de um cliente específico."""
    cliente = Cliente.query.get_or_404(cliente_id)
    return jsonify({
        'id': cliente.id,
        'nome': cliente.nome,
        'email': cliente.email,
        'telefone': cliente.telefone,
        'data_nascimento': cliente.data_nascimento.isoformat() 
            if cliente.data_nascimento else None,
        'restricoes': cliente.restricoes,
        'preferencias': cliente.preferencias,
        'notas_especiais': cliente.notas_especiais
    }), 200


@cliente_bp.route('/clientes', methods=['POST'])
@jwt_required()
def criar_cliente():
    """Cadastra um novo cliente."""
    dados = request.get_json()
    
    try:
        novo_cliente = Cliente(
            nome=dados['nome'],
            email=dados['email'],
            telefone=dados['telefone']
        )
        
        if 'data_nascimento' in dados:
            novo_cliente.data_nascimento = datetime.strptime(
                dados['data_nascimento'], 
                '%Y-%m-%d'
            ).date()
        
        if 'restricoes' in dados:
            for restricao in dados['restricoes']:
                novo_cliente.adicionar_restricao(
                    RestricaoAlimentar(restricao)
                )
        
        if 'preferencias' in dados:
            novo_cliente.preferencias = dados['preferencias']
        
        if 'notas_especiais' in dados:
            novo_cliente.notas_especiais = dados['notas_especiais']
        
        db.session.add(novo_cliente)
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Cliente cadastrado com sucesso',
            'id': novo_cliente.id
        }), 201
        
    except KeyError as e:
        return jsonify({
            'mensagem': f'Campo obrigatório ausente: {str(e)}'
        }), 400
    except ValueError as e:
        return jsonify({
            'mensagem': f'Valor inválido: {str(e)}'
        }), 400


@cliente_bp.route('/clientes/<int:cliente_id>', methods=['PUT'])
@jwt_required()
def atualizar_cliente(cliente_id):
    """Atualiza informações de um cliente."""
    cliente = Cliente.query.get_or_404(cliente_id)
    dados = request.get_json()
    
    try:
        if 'nome' in dados:
            cliente.nome = dados['nome']
        if 'email' in dados:
            cliente.email = dados['email']
        if 'telefone' in dados:
            cliente.telefone = dados['telefone']
        if 'data_nascimento' in dados:
            cliente.data_nascimento = datetime.strptime(
                dados['data_nascimento'], 
                '%Y-%m-%d'
            ).date()
        if 'restricoes' in dados:
            cliente.restricoes = []
            for restricao in dados['restricoes']:
                cliente.adicionar_restricao(
                    RestricaoAlimentar(restricao)
                )
        if 'preferencias' in dados:
            cliente.preferencias = dados['preferencias']
        if 'notas_especiais' in dados:
            cliente.notas_especiais = dados['notas_especiais']
        
        db.session.commit()
        return jsonify({'mensagem': 'Cliente atualizado com sucesso'}), 200
        
    except ValueError as e:
        return jsonify({'mensagem': f'Valor inválido: {str(e)}'}), 400


@cliente_bp.route('/clientes/<int:cliente_id>', methods=['DELETE'])
@jwt_required()
def deletar_cliente(cliente_id):
    """Remove um cliente do sistema."""
    cliente = Cliente.query.get_or_404(cliente_id)
    
    # Verifica se existem reservas ativas
    reservas_ativas = [r for r in cliente.reservas if r.status.value 
                      in ['pendente', 'confirmada']]
    if reservas_ativas:
        return jsonify({
            'mensagem': 'Não é possível excluir cliente com reservas ativas'
        }), 400
    
    db.session.delete(cliente)
    db.session.commit()
    return jsonify({'mensagem': 'Cliente removido com sucesso'}), 200 