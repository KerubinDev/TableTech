from flask import Blueprint, request
from datetime import datetime, timedelta
from app.models import db
from app.models.reserva import Reserva
from app.models.mesa import Mesa
from app.models.cliente import Cliente
from app.utils.respostas import *
from app.utils.validadores import (
    validar_data_hora_reserva, validar_capacidade_mesa,
    validar_duracao_reserva
)
from . import requer_login, requer_admin

reservas_bp = Blueprint('reservas', __name__)

@reservas_bp.route('/', methods=['GET'])
@requer_login
def listar_reservas():
    """Lista todas as reservas."""
    # Filtros
    data = request.args.get('data')
    status = request.args.get('status')
    cliente_id = request.args.get('cliente_id', type=int)
    mesa_id = request.args.get('mesa_id', type=int)
    
    # Query base
    query = Reserva.query
    
    # Aplica filtros
    if data:
        try:
            data = datetime.strptime(data, '%Y-%m-%d').date()
            query = query.filter(
                db.func.date(Reserva.data_hora) == data
            )
        except ValueError:
            return resposta_erro("Formato de data inválido. Use YYYY-MM-DD")
    
    if status:
        query = query.filter(Reserva.status == status)
    if cliente_id:
        query = query.filter(Reserva.cliente_id == cliente_id)
    if mesa_id:
        query = query.filter(Reserva.mesa_id == mesa_id)
    
    # Ordenação
    query = query.order_by(Reserva.data_hora)
    
    reservas = query.all()
    return resposta_sucesso([reserva.to_dict() for reserva in reservas])

@reservas_bp.route('/<int:reserva_id>', methods=['GET'])
@requer_login
def obter_reserva(reserva_id):
    """Obtém detalhes de uma reserva específica."""
    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        return resposta_nao_encontrado("Reserva não encontrada")
    
    # Inclui detalhes do cliente e mesa se solicitado
    incluir_detalhes = request.args.get('incluir_detalhes', type=bool)
    
    if incluir_detalhes:
        return resposta_sucesso({
            **reserva.to_dict(),
            'cliente': reserva.cliente.to_dict(),
            'mesa': reserva.mesa.to_dict()
        })
    
    return resposta_sucesso(reserva.to_dict())

@reservas_bp.route('/', methods=['POST'])
@requer_login
def criar_reserva():
    """Cria uma nova reserva."""
    dados = request.get_json()
    
    # Validação dos campos obrigatórios
    campos_obrigatorios = ['cliente_id', 'mesa_id', 'data_hora', 'num_pessoas']
    for campo in campos_obrigatorios:
        if campo not in dados:
            return resposta_erro(f"Campo '{campo}' é obrigatório")
    
    # Verifica se o cliente existe
    cliente = Cliente.query.get(dados['cliente_id'])
    if not cliente:
        return resposta_nao_encontrado("Cliente não encontrado")
    
    # Verifica se a mesa existe e está ativa
    mesa = Mesa.query.get(dados['mesa_id'])
    if not mesa:
        return resposta_nao_encontrado("Mesa não encontrada")
    if not mesa.ativa:
        return resposta_erro("Mesa não está ativa")
    
    try:
        # Converte a string de data/hora para objeto datetime
        data_hora = datetime.fromisoformat(dados['data_hora'].replace('Z', '+00:00'))
    except ValueError:
        return resposta_erro("Formato de data/hora inválido. Use ISO 8601")
    
    # Validações
    valido, mensagem = validar_data_hora_reserva(data_hora)
    if not valido:
        return resposta_erro(mensagem)
    
    valido, mensagem = validar_capacidade_mesa(dados['num_pessoas'], mesa.capacidade)
    if not valido:
        return resposta_erro(mensagem)
    
    duracao = dados.get('duracao', 120)  # Duração padrão: 2 horas
    valido, mensagem = validar_duracao_reserva(duracao)
    if not valido:
        return resposta_erro(mensagem)
    
    # Cria a nova reserva
    reserva = Reserva(
        cliente_id=dados['cliente_id'],
        mesa_id=dados['mesa_id'],
        data_hora=data_hora,
        duracao=duracao,
        num_pessoas=dados['num_pessoas'],
        observacoes=dados.get('observacoes')
    )
    
    # Verifica conflitos
    if reserva.verificar_conflito():
        return resposta_conflito("Já existe uma reserva para esta mesa neste horário")
    
    try:
        # Atualiza o status da mesa
        mesa.status = 'reservada'
        
        db.session.add(reserva)
        db.session.commit()
        
        # Atualiza última visita do cliente
        cliente.ultima_visita = datetime.utcnow()
        db.session.commit()
        
        return resposta_sucesso(reserva.to_dict(), "Reserva criada com sucesso")
    except Exception as e:
        db.session.rollback()
        return resposta_erro(f"Erro ao criar reserva: {str(e)}")

@reservas_bp.route('/<int:reserva_id>', methods=['PUT'])
@requer_login
def atualizar_reserva(reserva_id):
    """Atualiza uma reserva existente."""
    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        return resposta_nao_encontrado("Reserva não encontrada")
    
    dados = request.get_json()
    
    # Se houver mudança de mesa
    if 'mesa_id' in dados and dados['mesa_id'] != reserva.mesa_id:
        nova_mesa = Mesa.query.get(dados['mesa_id'])
        if not nova_mesa:
            return resposta_nao_encontrado("Mesa não encontrada")
        if not nova_mesa.ativa:
            return resposta_erro("Mesa não está ativa")
    
    # Se houver mudança de data/hora
    if 'data_hora' in dados:
        try:
            data_hora = datetime.fromisoformat(dados['data_hora'].replace('Z', '+00:00'))
            valido, mensagem = validar_data_hora_reserva(data_hora)
            if not valido:
                return resposta_erro(mensagem)
            reserva.data_hora = data_hora
        except ValueError:
            return resposta_erro("Formato de data/hora inválido. Use ISO 8601")
    
    # Atualiza os campos fornecidos
    campos_atualizaveis = ['mesa_id', 'num_pessoas', 'duracao', 'observacoes', 'status']
    for campo in campos_atualizaveis:
        if campo in dados:
            setattr(reserva, campo, dados[campo])
    
    # Validações após atualizações
    if 'num_pessoas' in dados or 'mesa_id' in dados:
        mesa = Mesa.query.get(reserva.mesa_id)
        valido, mensagem = validar_capacidade_mesa(reserva.num_pessoas, mesa.capacidade)
        if not valido:
            return resposta_erro(mensagem)
    
    if 'duracao' in dados:
        valido, mensagem = validar_duracao_reserva(reserva.duracao)
        if not valido:
            return resposta_erro(mensagem)
    
    # Verifica conflitos após todas as alterações
    if reserva.verificar_conflito():
        return resposta_conflito("Alteração causa conflito com outra reserva")
    
    try:
        db.session.commit()
        return resposta_sucesso(reserva.to_dict(), "Reserva atualizada com sucesso")
    except Exception as e:
        db.session.rollback()
        return resposta_erro(f"Erro ao atualizar reserva: {str(e)}")

@reservas_bp.route('/<int:reserva_id>', methods=['DELETE'])
@requer_login
def cancelar_reserva(reserva_id):
    """Cancela uma reserva."""
    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        return resposta_nao_encontrado("Reserva não encontrada")
    
    # Ao invés de deletar, marca como cancelada
    reserva.status = 'cancelada'
    
    try:
        # Se a mesa estava reservada para esta reserva, atualiza seu status
        if reserva.mesa.status == 'reservada':
            reserva.mesa.status = 'disponível'
        
        db.session.commit()
        return resposta_sucesso(mensagem="Reserva cancelada com sucesso")
    except Exception as e:
        db.session.rollback()
        return resposta_erro(f"Erro ao cancelar reserva: {str(e)}")

@reservas_bp.route('/disponiveis', methods=['GET'])
@requer_login
def verificar_disponibilidade():
    """Verifica mesas disponíveis para um determinado horário e número de pessoas."""
    try:
        data_hora = datetime.fromisoformat(request.args.get('data_hora', '').replace('Z', '+00:00'))
    except ValueError:
        return resposta_erro("Data/hora não fornecida ou formato inválido")
    
    num_pessoas = request.args.get('num_pessoas', type=int)
    if not num_pessoas:
        return resposta_erro("Número de pessoas não fornecido")
    
    # Validação da data/hora
    valido, mensagem = validar_data_hora_reserva(data_hora)
    if not valido:
        return resposta_erro(mensagem)
    
    # Busca mesas com capacidade adequada
    mesas_adequadas = Mesa.query.filter(
        Mesa.capacidade >= num_pessoas,
        Mesa.ativa == True
    ).all()
    
    mesas_disponiveis = []
    for mesa in mesas_adequadas:
        # Simula uma reserva para verificar conflitos
        reserva_teste = Reserva(
            mesa_id=mesa.id,
            data_hora=data_hora,
            duracao=120  # Duração padrão
        )
        if not reserva_teste.verificar_conflito():
            mesas_disponiveis.append(mesa.to_dict())
    
    return resposta_sucesso({
        'mesas_disponiveis': mesas_disponiveis,
        'total_disponiveis': len(mesas_disponiveis)
    })

@reservas_bp.route('/estatisticas', methods=['GET'])
@requer_admin
def obter_estatisticas():
    """Obtém estatísticas das reservas."""
    # Período de análise
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    try:
        if data_inicio:
            data_inicio = datetime.strptime(data_inicio, '%Y-%m-%d')
        else:
            data_inicio = datetime.utcnow() - timedelta(days=30)
        
        if data_fim:
            data_fim = datetime.strptime(data_fim, '%Y-%m-%d')
        else:
            data_fim = datetime.utcnow()
    except ValueError:
        return resposta_erro("Formato de data inválido. Use YYYY-MM-DD")
    
    # Query base para o período
    query = Reserva.query.filter(
        Reserva.data_hora.between(data_inicio, data_fim)
    )
    
    # Total de reservas
    total_reservas = query.count()
    
    # Reservas por status
    reservas_por_status = db.session.query(
        Reserva.status, db.func.count(Reserva.id)
    ).filter(
        Reserva.data_hora.between(data_inicio, data_fim)
    ).group_by(Reserva.status).all()
    
    # Média de pessoas por reserva
    media_pessoas = db.session.query(
        db.func.avg(Reserva.num_pessoas)
    ).filter(
        Reserva.data_hora.between(data_inicio, data_fim)
    ).scalar() or 0
    
    # Taxa de ocupação
    total_slots = Mesa.query.filter_by(ativa=True).count() * 12  # 12 slots por dia
    slots_ocupados = query.filter(Reserva.status.in_(['confirmada', 'concluída'])).count()
    taxa_ocupacao = (slots_ocupados / total_slots * 100) if total_slots > 0 else 0
    
    return resposta_sucesso({
        'periodo': {
            'inicio': data_inicio.strftime('%Y-%m-%d'),
            'fim': data_fim.strftime('%Y-%m-%d')
        },
        'total_reservas': total_reservas,
        'reservas_por_status': dict(reservas_por_status),
        'media_pessoas_por_reserva': round(float(media_pessoas), 2),
        'taxa_ocupacao': round(taxa_ocupacao, 2)
    }) 