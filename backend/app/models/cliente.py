"""
Modelo para clientes do restaurante.
"""
from .. import db
from datetime import datetime
from enum import Enum


class RestricaoAlimentar(Enum):
    """Enumeração para restrições alimentares comuns."""
    VEGETARIANO = 'vegetariano'
    VEGANO = 'vegano'
    GLUTEM = 'sem_glutem'
    LACTOSE = 'sem_lactose'
    FRUTOS_MAR = 'alergico_frutos_mar'
    AMENDOIM = 'alergico_amendoim'


class Cliente(db.Model):
    """Modelo para armazenar informações dos clientes."""
    
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    data_nascimento = db.Column(db.Date)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Preferências e restrições
    restricoes = db.Column(db.JSON)  # Lista de RestricaoAlimentar
    preferencias = db.Column(db.Text)
    notas_especiais = db.Column(db.Text)
    
    # Relacionamentos
    reservas = db.relationship('Reserva', backref='cliente', lazy=True)
    
    def adicionar_restricao(self, restricao: RestricaoAlimentar):
        """Adiciona uma restrição alimentar ao cliente."""
        if not self.restricoes:
            self.restricoes = []
        if restricao.value not in self.restricoes:
            self.restricoes.append(restricao.value)
    
    def remover_restricao(self, restricao: RestricaoAlimentar):
        """Remove uma restrição alimentar do cliente."""
        if self.restricoes and restricao.value in self.restricoes:
            self.restricoes.remove(restricao.value) 