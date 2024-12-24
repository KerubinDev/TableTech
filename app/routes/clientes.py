from flask import Blueprint, request
from datetime import datetime, timedelta
from app.models import db
from app.models.cliente import Cliente
from app.models.reserva import Reserva
from app.utils.respostas import *
from app.utils.validadores import validar_email, validar_telefone
from . import requer_login, requer_admin

clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route('/', methods=['GET'])
@requer_login
def listar_clientes():
    """Lista todos os clientes."""
    # Ordenação
    ordem = request.args.get('ordem', 'nome')  # nome, email, ultima_visita
    direcao = request.args.get('direcao', 'asc')  # asc, desc
    
    # Paginação
    pagina = request.args.get('pagina', 1, type=int)
    por_pagina = request.args.get('por_pagina', 10, type=int)
    
    # Query base
    query = Cliente.query
    
    # Aplica ordenação
    if ordem == 'ultima_visita':
        query = query.order_by(
            Cliente.ultima_visita.desc() if direcao == 'desc' else Cliente.ultima_visita.asc()
        )
    else:
        coluna = getattr(Cliente, ordem)
        query = query.order_by(
            coluna.desc() if direcao == 'desc' else coluna.asc()
        )
    
    # Executa query com paginação
    paginacao = query.paginate(page=pagina, per_page=por_pagina)
    
    return resposta_sucesso({
        'clientes': [cliente.to_dict() for cliente in paginacao.items],
        'total': paginacao.total,
        'paginas': paginacao.pages,
        'pagina_atual': paginacao.page
    })

@clientes_bp.route('/<int:cliente_id>', methods=['GET'])
@requer_login
def obter_cliente(cliente_id):
    """Obtém detalhes de um cliente específico."""
    cliente = Cliente.query.get(cliente_id)
    if not cliente:
        return resposta_nao_encontrado("Cliente não encontrado")
    
    # Inclui histórico de reservas se solicitado
    incluir_historico = request.args.get('incluir_historico', type=bool)
    
    if incluir_historico:
        historico = Reserva.query.filter_by(cliente_id=cliente_id)\
            .order_by(Reserva.data_hora.desc()).all()
        
        return resposta_sucesso({
            **cliente.to_dict(),
            'historico_reservas': [reserva.to_dict() for reserva in historico]
        })
    
    return resposta_sucesso(cliente.to_dict())

@clientes_bp.route('/', methods=['POST'])
@requer_login
def criar_cliente():
    """Cria um novo cliente."""
    dados = request.get_json()
    
    # Validação dos campos obrigatórios
    campos_obrigatorios = ['nome', 'email']
    for campo in campos_obrigatorios:
        if campo not in dados:
            return resposta_erro(f"Campo '{campo}' é obrigatório")
    
    # Validação do email
    if not validar_email(dados['email']):
        return resposta_erro("Formato de email inválido")
    
    # Verifica se já existe cliente com o mesmo email
    if Cliente.query.filter_by(email=dados['email']).first():
        return resposta_conflito("Já existe um cliente com este email")
    
    # Validação do telefone (se fornecido)
    if 'telefone' in dados and dados['telefone']:
        if not validar_telefone(dados['telefone']):
            return resposta_erro("Formato de telefone inválido")
    
    # Cria o novo cliente
    cliente = Cliente(
        nome=dados['nome'],
        email=dados['email'],
        telefone=dados.get('telefone'),
        data_nascimento=datetime.strptime(dados['data_nascimento'], '%Y-%m-%d').date() if 'data_nascimento' in dados else None,
        preferencias=dados.get('preferencias'),
        restricoes=dados.get('restricoes'),
        notas=dados.get('notas')
    )
    
    try:
        db.session.add(cliente)
        db.session.commit()
        return resposta_sucesso(cliente.to_dict(), "Cliente criado com sucesso")
    except Exception as e:
        db.session.rollback()
        return resposta_erro(f"Erro ao criar cliente: {str(e)}")

@clientes_bp.route('/<int:cliente_id>', methods=['PUT'])
@requer_login
def atualizar_cliente(cliente_id):
    """Atualiza um cliente existente."""
    cliente = Cliente.query.get(cliente_id)
    if not cliente:
        return resposta_nao_encontrado("Cliente não encontrado")
    
    dados = request.get_json()
    
    # Validação do email (se fornecido)
    if 'email' in dados and dados['email'] != cliente.email:
        if not validar_email(dados['email']):
            return resposta_erro("Formato de email inválido")
        if Cliente.query.filter_by(email=dados['email']).first():
            return resposta_conflito("Já existe um cliente com este email")
    
    # Validação do telefone (se fornecido)
    if 'telefone' in dados and dados['telefone']:
        if not validar_telefone(dados['telefone']):
            return resposta_erro("Formato de telefone inválido")
    
    # Atualiza os campos
    campos_atualizaveis = [
        'nome', 'email', 'telefone', 'preferencias', 
        'restricoes', 'notas'
    ]
    
    for campo in campos_atualizaveis:
        if campo in dados:
            setattr(cliente, campo, dados[campo])
    
    # Atualiza data de nascimento se fornecida
    if 'data_nascimento' in dados:
        cliente.data_nascimento = datetime.strptime(dados['data_nascimento'], '%Y-%m-%d').date() if dados['data_nascimento'] else None
    
    try:
        db.session.commit()
        return resposta_sucesso(cliente.to_dict(), "Cliente atualizado com sucesso")
    except Exception as e:
        db.session.rollback()
        return resposta_erro(f"Erro ao atualizar cliente: {str(e)}")

@clientes_bp.route('/<int:cliente_id>', methods=['DELETE'])
@requer_admin
def deletar_cliente(cliente_id):
    """Deleta um cliente."""
    cliente = Cliente.query.get(cliente_id)
    if not cliente:
        return resposta_nao_encontrado("Cliente não encontrado")
    
    # Verifica se há reservas associadas
    if cliente.reservas:
        return resposta_erro("Não é possível deletar cliente com reservas associadas")
    
    try:
        db.session.delete(cliente)
        db.session.commit()
        return resposta_sucesso(mensagem="Cliente deletado com sucesso")
    except Exception as e:
        db.session.rollback()
        return resposta_erro(f"Erro ao deletar cliente: {str(e)}")

@clientes_bp.route('/busca', methods=['GET'])
@requer_login
def buscar_clientes():
    """Busca clientes por nome, email ou telefone."""
    termo = request.args.get('termo', '')
    if not termo:
        return resposta_erro("Termo de busca não fornecido")
    
    clientes = Cliente.query.filter(
        db.or_(
            Cliente.nome.ilike(f'%{termo}%'),
            Cliente.email.ilike(f'%{termo}%'),
            Cliente.telefone.ilike(f'%{termo}%')
        )
    ).all()
    
    return resposta_sucesso([cliente.to_dict() for cliente in clientes])

@clientes_bp.route('/<int:cliente_id>/ultima-visita', methods=['PATCH'])
@requer_login
def atualizar_ultima_visita(cliente_id):
    """Atualiza a data da última visita do cliente."""
    cliente = Cliente.query.get(cliente_id)
    if not cliente:
        return resposta_nao_encontrado("Cliente não encontrado")
    
    cliente.ultima_visita = datetime.utcnow()
    
    try:
        db.session.commit()
        return resposta_sucesso(cliente.to_dict(), "Data da última visita atualizada com sucesso")
    except Exception as e:
        db.session.rollback()
        return resposta_erro(f"Erro ao atualizar data da última visita: {str(e)}")

@clientes_bp.route('/estatisticas', methods=['GET'])
@requer_admin
def obter_estatisticas():
    """Obtém estatísticas dos clientes."""
    total_clientes = Cliente.query.count()
    
    # Clientes com reservas no último mês
    um_mes_atras = datetime.utcnow() - timedelta(days=30)
    clientes_ativos = db.session.query(Cliente.id).distinct()\
        .join(Reserva)\
        .filter(Reserva.data_hora >= um_mes_atras)\
        .count()
    
    # Clientes novos no último mês
    clientes_novos = Cliente.query.filter(
        Cliente.data_cadastro >= um_mes_atras
    ).count()
    
    # Média de reservas por cliente
    media_reservas = db.session.query(
        db.func.avg(
            db.session.query(Reserva).filter_by(cliente_id=Cliente.id).count()
        )
    ).scalar() or 0
    
    return resposta_sucesso({
        'total_clientes': total_clientes,
        'clientes_ativos_ultimo_mes': clientes_ativos,
        'clientes_novos_ultimo_mes': clientes_novos,
        'media_reservas_por_cliente': round(float(media_reservas), 2)
    }) 