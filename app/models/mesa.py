from . import db

class Mesa(db.Model):
    """Modelo para mesas do restaurante."""
    
    __tablename__ = 'mesas'
    
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.String(10), unique=True, nullable=False)
    capacidade = db.Column(db.Integer, nullable=False)
    localizacao = db.Column(db.String(50), nullable=False)  # ex: 'interior', 'varanda'
    status = db.Column(db.String(20), default='disponível')  # 'disponível', 'ocupada', 'reservada', 'manutenção'
    observacoes = db.Column(db.Text)
    ativa = db.Column(db.Boolean, default=True)
    
    # Relacionamento com reservas
    reservas = db.relationship('Reserva', backref='mesa', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'numero': self.numero,
            'capacidade': self.capacidade,
            'localizacao': self.localizacao,
            'status': self.status,
            'observacoes': self.observacoes,
            'ativa': self.ativa
        } 