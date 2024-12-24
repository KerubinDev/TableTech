from . import db
from datetime import datetime

class Cliente(db.Model):
    """Modelo para clientes do restaurante."""
    
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telefone = db.Column(db.String(20))
    data_nascimento = db.Column(db.Date)
    preferencias = db.Column(db.Text)  # Preferências alimentares
    restricoes = db.Column(db.Text)    # Restrições alimentares
    notas = db.Column(db.Text)         # Notas especiais
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    ultima_visita = db.Column(db.DateTime)
    
    # Relacionamento com reservas
    reservas = db.relationship('Reserva', backref='cliente', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'telefone': self.telefone,
            'data_nascimento': self.data_nascimento.isoformat() if self.data_nascimento else None,
            'preferencias': self.preferencias,
            'restricoes': self.restricoes,
            'notas': self.notas,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'ultima_visita': self.ultima_visita.isoformat() if self.ultima_visita else None
        } 