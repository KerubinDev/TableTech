from . import db
from datetime import datetime

class Reserva(db.Model):
    """Modelo para reservas de mesas."""
    
    __tablename__ = 'reservas'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    mesa_id = db.Column(db.Integer, db.ForeignKey('mesas.id'), nullable=False)
    data_hora = db.Column(db.DateTime, nullable=False)
    duracao = db.Column(db.Integer, default=120)  # Duração em minutos
    num_pessoas = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='confirmada')  # 'confirmada', 'cancelada', 'concluída', 'em_espera'
    observacoes = db.Column(db.Text)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_modificacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'mesa_id': self.mesa_id,
            'data_hora': self.data_hora.isoformat(),
            'duracao': self.duracao,
            'num_pessoas': self.num_pessoas,
            'status': self.status,
            'observacoes': self.observacoes,
            'data_criacao': self.data_criacao.isoformat(),
            'data_modificacao': self.data_modificacao.isoformat()
        }
    
    def verificar_conflito(self):
        """Verifica se há conflito com outras reservas para a mesma mesa."""
        fim_reserva = self.data_hora + timedelta(minutes=self.duracao)
        
        return Reserva.query.filter(
            Reserva.mesa_id == self.mesa_id,
            Reserva.id != self.id,
            Reserva.status == 'confirmada',
            Reserva.data_hora < fim_reserva,
            (Reserva.data_hora + timedelta(minutes=Reserva.duracao)) > self.data_hora
        ).first() is not None 