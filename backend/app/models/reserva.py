"""
Modelo para reservas de mesas.
"""
from .. import db
from datetime import datetime
from enum import Enum


class StatusReserva(Enum):
    """Enumeração para os possíveis estados de uma reserva."""
    PENDENTE = 'pendente'
    CONFIRMADA = 'confirmada'
    CANCELADA = 'cancelada'
    CONCLUIDA = 'concluida'
    LISTA_ESPERA = 'lista_espera'


class Reserva(db.Model):
    """Modelo para gerenciar reservas de mesas."""
    
    __tablename__ = 'reservas'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(
        db.Integer, 
        db.ForeignKey('clientes.id'), 
        nullable=False
    )
    mesa_id = db.Column(
        db.Integer, 
        db.ForeignKey('mesas.id'), 
        nullable=False
    )
    data_hora = db.Column(db.DateTime, nullable=False)
    num_pessoas = db.Column(db.Integer, nullable=False)
    status = db.Column(
        db.Enum(StatusReserva), 
        default=StatusReserva.PENDENTE
    )
    
    # Campos de controle
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_modificacao = db.Column(
        db.DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    criado_por = db.Column(
        db.Integer, 
        db.ForeignKey('usuarios.id'), 
        nullable=False
    )
    observacoes = db.Column(db.Text)
    
    def confirmar(self):
        """Confirma a reserva."""
        if self.status == StatusReserva.PENDENTE:
            self.status = StatusReserva.CONFIRMADA
            self.mesa.status = 'RESERVADA'
    
    def cancelar(self):
        """Cancela a reserva."""
        if self.status in [StatusReserva.PENDENTE, StatusReserva.CONFIRMADA]:
            self.status = StatusReserva.CANCELADA
            self.mesa.status = 'DISPONIVEL'
    
    @staticmethod
    def verificar_disponibilidade(mesa_id, data_hora, duracao_minutos=120):
        """
        Verifica se uma mesa está disponível para reserva em um horário.
        
        Args:
            mesa_id: ID da mesa
            data_hora: DateTime do início da reserva
            duracao_minutos: Duração prevista em minutos
            
        Returns:
            bool: True se disponível, False caso contrário
        """
        fim_reserva = data_hora + timedelta(minutes=duracao_minutos)
        
        reservas_existentes = Reserva.query.filter(
            Reserva.mesa_id == mesa_id,
            Reserva.status.in_([
                StatusReserva.PENDENTE, 
                StatusReserva.CONFIRMADA
            ]),
            Reserva.data_hora.between(
                data_hora - timedelta(minutes=duracao_minutos),
                fim_reserva
            )
        ).count()
        
        return reservas_existentes == 0 