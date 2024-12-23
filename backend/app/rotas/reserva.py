"""
Rotas para gerenciamento de reservas do restaurante.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.reserva import Reserva, StatusReserva
from ..models.mesa import Mesa, StatusMesa
from ..models.cliente import Cliente
from ..models.usuario import Usuario
from datetime import datetime, timedelta
from .. import db

reserva_bp = Blueprint('reserva', __name__)


@reserva_bp.route('/reservas', methods=['GET'])
@jwt_required()
def listar_reservas():
    """Lista todas as reservas com filtros opcionais."""
    # Parâmetros de filtro
    data = request.args.get('data')
    status = request.args.get('status')
    cliente_id = request.args.get('cliente_id')
    
    query = Reserva.query
    
    if data:
        data_inicio = datetime.strptime(data, '%Y-%m-%d')
        data_fim = data_inicio + timedelta(days=1)
        query = query.filter(
            Reserva.data_hora >= data_inicio,
            Reserva.data_hora < data_fim
        )
    
    if status:
        query = query.filter(Reserva.status == StatusReserva(status))
    
    if cliente_id:
        query = query.filter(Reserva.cliente_id == cliente_id)
    
    reservas = query.all()
    
    return jsonify([{
        'id': r.id,
        'cliente': {
            'id': r.cliente.id,
            'nome': r.cliente.nome
        },
        'mesa': {
            'id': r.mesa.id,
            'numero': r.mesa.numero
        },
        'data_hora': r.data_hora.isoformat(),
        'num_pessoas': r.num_pessoas,
        'status': r.status.value,
        'observacoes': r.observacoes
    } for r in reservas]), 200


@reserva_bp.route('/reservas/<int:reserva_id>', methods=['GET'])
@jwt_required()
def obter_reserva(reserva_id):
    """Obtém detalhes de uma reserva específica."""
    reserva = Reserva.query.get_or_404(reserva_id)
    
    return jsonify({
        'id': reserva.id,
        'cliente': {
            'id': reserva.cliente.id,
            'nome': reserva.cliente.nome,
            'email': reserva.cliente.email,
            'telefone': reserva.cliente.telefone
        },
        'mesa': {
            'id': reserva.mesa.id,
            'numero': reserva.mesa.numero,
            'capacidade': reserva.mesa.capacidade,
            'localizacao': reserva.mesa.localizacao.value
        },
        'data_hora': reserva.data_hora.isoformat(),
        'num_pessoas': reserva.num_pessoas,
        'status': reserva.status.value,
        'observacoes': reserva.observacoes,
        'data_criacao': reserva.data_criacao.isoformat(),
        'data_modificacao': reserva.data_modificacao.isoformat()
    }), 200


@reserva_bp.route('/reservas', methods=['POST'])
@jwt_required()
def criar_reserva():
    """Cria uma nova reserva."""
    dados = request.get_json()
    usuario_id = get_jwt_identity()
    
    try:
        # Validações básicas
        cliente = Cliente.query.get_or_404(dados['cliente_id'])
        mesa = Mesa.query.get_or_404(dados['mesa_id'])
        data_hora = datetime.fromisoformat(dados['data_hora'])
        
        # Validação de capacidade
        if dados['num_pessoas'] > mesa.capacidade:
            return jsonify({
                'mensagem': 'Número de pessoas excede a capacidade da mesa'
            }), 400
        
        # Verifica disponibilidade
        if not Reserva.verificar_disponibilidade(
            mesa.id, 
            data_hora,
            dados.get('duracao_minutos', 120)
        ):
            return jsonify({
                'mensagem': 'Mesa não disponível neste horário'
            }), 400
        
        nova_reserva = Reserva(
            cliente_id=cliente.id,
            mesa_id=mesa.id,
            data_hora=data_hora,
            num_pessoas=dados['num_pessoas'],
            observacoes=dados.get('observacoes'),
            criado_por=usuario_id
        )
        
        # Atualiza status da mesa
        mesa.status = StatusMesa.RESERVADA
        
        db.session.add(nova_reserva)
        db.session.commit()
        
        return jsonify({
            'mensagem': 'Reserva criada com sucesso',
            'id': nova_reserva.id
        }), 201
        
    except KeyError as e:
        return jsonify({
            'mensagem': f'Campo obrigatório ausente: {str(e)}'
        }), 400
    except ValueError as e:
        return jsonify({
            'mensagem': f'Valor inválido: {str(e)}'
        }), 400


@reserva_bp.route('/reservas/<int:reserva_id>', methods=['PUT'])
@jwt_required()
def atualizar_reserva(reserva_id):
    """Atualiza uma reserva existente."""
    reserva = Reserva.query.get_or_404(reserva_id)
    dados = request.get_json()
    
    try:
        if 'data_hora' in dados:
            nova_data = datetime.fromisoformat(dados['data_hora'])
            if nova_data != reserva.data_hora:
                # Verifica disponibilidade para nova data/hora
                if not Reserva.verificar_disponibilidade(
                    reserva.mesa_id,
                    nova_data,
                    dados.get('duracao_minutos', 120)
                ):
                    return jsonify({
                        'mensagem': 'Mesa não disponível no novo horário'
                    }), 400
                reserva.data_hora = nova_data
        
        if 'num_pessoas' in dados:
            if dados['num_pessoas'] > reserva.mesa.capacidade:
                return jsonify({
                    'mensagem': 'Número de pessoas excede a capacidade da mesa'
                }), 400
            reserva.num_pessoas = dados['num_pessoas']
        
        if 'observacoes' in dados:
            reserva.observacoes = dados['observacoes']
        
        if 'status' in dados:
            novo_status = StatusReserva(dados['status'])
            if novo_status != reserva.status:
                if novo_status == StatusReserva.CONFIRMADA:
                    reserva.confirmar()
                elif novo_status == StatusReserva.CANCELADA:
                    reserva.cancelar()
                else:
                    reserva.status = novo_status
        
        db.session.commit()
        return jsonify({'mensagem': 'Reserva atualizada com sucesso'}), 200
        
    except ValueError as e:
        return jsonify({'mensagem': f'Valor inválido: {str(e)}'}), 400


@reserva_bp.route('/reservas/<int:reserva_id>/confirmar', methods=['POST'])
@jwt_required()
def confirmar_reserva(reserva_id):
    """Confirma uma reserva pendente."""
    reserva = Reserva.query.get_or_404(reserva_id)
    
    if reserva.status != StatusReserva.PENDENTE:
        return jsonify({
            'mensagem': 'Apenas reservas pendentes podem ser confirmadas'
        }), 400
    
    reserva.confirmar()
    db.session.commit()
    
    return jsonify({'mensagem': 'Reserva confirmada com sucesso'}), 200


@reserva_bp.route('/reservas/<int:reserva_id>/cancelar', methods=['POST'])
@jwt_required()
def cancelar_reserva(reserva_id):
    """Cancela uma reserva."""
    reserva = Reserva.query.get_or_404(reserva_id)
    
    if reserva.status not in [StatusReserva.PENDENTE, StatusReserva.CONFIRMADA]:
        return jsonify({
            'mensagem': 'Esta reserva não pode ser cancelada'
        }), 400
    
    reserva.cancelar()
    db.session.commit()
    
    return jsonify({'mensagem': 'Reserva cancelada com sucesso'}), 200


@reserva_bp.route('/reservas/disponiveis', methods=['GET'])
@jwt_required()
def verificar_disponibilidade():
    """Verifica disponibilidade de mesas para uma data/hora específica."""
    data_hora = request.args.get('data_hora')
    num_pessoas = request.args.get('num_pessoas', type=int)
    
    if not data_hora or not num_pessoas:
        return jsonify({
            'mensagem': 'Data/hora e número de pessoas são obrigatórios'
        }), 400
    
    try:
        data_hora = datetime.fromisoformat(data_hora)
        
        # Busca mesas com capacidade adequada
        mesas_disponiveis = []
        mesas = Mesa.query.filter(Mesa.capacidade >= num_pessoas).all()
        
        for mesa in mesas:
            if Reserva.verificar_disponibilidade(mesa.id, data_hora):
                mesas_disponiveis.append({
                    'id': mesa.id,
                    'numero': mesa.numero,
                    'capacidade': mesa.capacidade,
                    'localizacao': mesa.localizacao.value
                })
        
        return jsonify({
            'data_hora': data_hora.isoformat(),
            'num_pessoas': num_pessoas,
            'mesas_disponiveis': mesas_disponiveis
        }), 200
        
    except ValueError as e:
        return jsonify({'mensagem': f'Valor inválido: {str(e)}'}), 400 