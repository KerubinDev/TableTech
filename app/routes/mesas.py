from flask import Blueprint, request, jsonify
from app.models.mesa import Mesa
from app.models.reserva import Reserva
from app.utils.validadores import validar_campos_obrigatorios, validar_numero_positivo
from app.utils.respostas import sucesso, erro
from datetime import datetime

mesas_bp = Blueprint('mesas', __name__)

@mesas_bp.route('/status', methods=['GET'])
def obter_status_mesas():
    try:
        # Obtém os parâmetros da query
        data = request.args.get('data', datetime.now().strftime('%Y-%m-%d'))
        hora = request.args.get('hora', datetime.now().strftime('%H:%M'))
        
        # Converte para datetime
        data_hora = datetime.strptime(f"{data} {hora}", '%Y-%m-%d %H:%M')
        
        # Obtém todas as mesas
        mesas = Mesa.query.all()
        
        # Obtém as reservas para o horário especificado
        reservas = Reserva.query.filter(
            Reserva.data_hora >= data_hora,
            Reserva.data_hora <= data_hora.replace(hour=23, minute=59, second=59)
        ).all()
        
        # Cria um dicionário de mesas reservadas
        mesas_reservadas = {
            reserva.mesa_id: reserva 
            for reserva in reservas 
            if reserva.status in ['confirmada', 'pendente']
        }
        
        # Prepara os dados de cada mesa
        dados_mesas = []
        for mesa in mesas:
            reserva = mesas_reservadas.get(mesa.id)
            status = 'manutenção' if not mesa.ativa else (
                'reservada' if reserva else 'disponível'
            )
            
            dados_mesa = {
                'id': mesa.id,
                'numero': mesa.numero,
                'capacidade': mesa.capacidade,
                'localizacao': mesa.localizacao,
                'status': status
            }
            
            if reserva:
                dados_mesa['horario_reserva'] = reserva.data_hora.isoformat()
            
            dados_mesas.append(dados_mesa)
        
        return sucesso(dados_mesas)
        
    except Exception as e:
        return erro(str(e))

@mesas_bp.route('', methods=['GET'])
def listar_mesas():
    try:
        mesas = Mesa.query.all()
        return sucesso([mesa.to_dict() for mesa in mesas])
    except Exception as e:
        return erro(str(e))

@mesas_bp.route('', methods=['POST'])
def criar_mesa():
    try:
        dados = request.get_json()
        
        # Valida campos obrigatórios
        campos = ['numero', 'capacidade', 'localizacao']
        if not validar_campos_obrigatorios(dados, campos):
            return erro('Campos obrigatórios faltando')
            
        # Valida números positivos
        if not validar_numero_positivo(dados.get('numero')):
            return erro('Número da mesa deve ser positivo')
        if not validar_numero_positivo(dados.get('capacidade')):
            return erro('Capacidade deve ser positiva')
            
        # Verifica se já existe mesa com o mesmo número
        if Mesa.query.filter_by(numero=dados['numero']).first():
            return erro('Já existe uma mesa com este número')
            
        # Cria a mesa
        mesa = Mesa(
            numero=dados['numero'],
            capacidade=dados['capacidade'],
            localizacao=dados['localizacao'],
            observacoes=dados.get('observacoes', '')
        )
        
        mesa.save()
        return sucesso(mesa.to_dict())
        
    except Exception as e:
        return erro(str(e))

@mesas_bp.route('/<int:id>', methods=['GET'])
def obter_mesa(id):
    try:
        mesa = Mesa.query.get(id)
        if not mesa:
            return erro('Mesa não encontrada')
        return sucesso(mesa.to_dict())
    except Exception as e:
        return erro(str(e))

@mesas_bp.route('/<int:id>', methods=['PUT'])
def atualizar_mesa(id):
    try:
        mesa = Mesa.query.get(id)
        if not mesa:
            return erro('Mesa não encontrada')
            
        dados = request.get_json()
        
        # Atualiza apenas os campos fornecidos
        if 'numero' in dados:
            if not validar_numero_positivo(dados['numero']):
                return erro('Número da mesa deve ser positivo')
            # Verifica se já existe outra mesa com o mesmo número
            mesa_existente = Mesa.query.filter_by(numero=dados['numero']).first()
            if mesa_existente and mesa_existente.id != id:
                return erro('Já existe uma mesa com este número')
            mesa.numero = dados['numero']
            
        if 'capacidade' in dados:
            if not validar_numero_positivo(dados['capacidade']):
                return erro('Capacidade deve ser positiva')
            mesa.capacidade = dados['capacidade']
            
        if 'localizacao' in dados:
            mesa.localizacao = dados['localizacao']
            
        if 'observacoes' in dados:
            mesa.observacoes = dados['observacoes']
            
        if 'ativa' in dados:
            mesa.ativa = dados['ativa']
        
        mesa.save()
        return sucesso(mesa.to_dict())
        
    except Exception as e:
        return erro(str(e))

@mesas_bp.route('/<int:id>', methods=['DELETE'])
def excluir_mesa(id):
    try:
        mesa = Mesa.query.get(id)
        if not mesa:
            return erro('Mesa não encontrada')
            
        # Verifica se existem reservas para esta mesa
        if Reserva.query.filter_by(mesa_id=id).first():
            return erro('Não é possível excluir mesa com reservas')
            
        mesa.delete()
        return sucesso({'mensagem': 'Mesa excluída com sucesso'})
        
    except Exception as e:
        return erro(str(e)) 