"""
Modelo para mesas do restaurante.
"""
from .. import db
from enum import Enum


class LocalizacaoMesa(Enum):
    """Enumeração para as possíveis localizações das mesas."""
    INTERIOR = 'interior'
    VARANDA = 'varanda'
    AREA_VIP = 'area_vip'


class StatusMesa(Enum):
    """Enumeração para os possíveis estados das mesas."""
    DISPONIVEL = 'disponivel'
    RESERVADA = 'reservada'
    OCUPADA = 'ocupada'
    MANUTENCAO = 'manutencao'


class Mesa(db.Model):
    """Modelo para representar as mesas do restaurante."""
    
    __tablename__ = 'mesas'
    
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.String(10), unique=True, nullable=False)
    capacidade = db.Column(db.Integer, nullable=False)
    localizacao = db.Column(db.Enum(LocalizacaoMesa), nullable=False)
    status = db.Column(db.Enum(StatusMesa), default=StatusMesa.DISPONIVEL)
    
    # Relacionamentos
    reservas = db.relationship('Reserva', backref='mesa', lazy=True) 