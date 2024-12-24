from app.models import db
from app.utils.auth import gerar_hash_senha
from datetime import datetime

class Usuario(db.Model):
    """Modelo para usuários do sistema."""
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(200), nullable=False)
    cargo = db.Column(db.String(20), nullable=False, default='usuario')
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    ultimo_acesso = db.Column(db.DateTime)

    def definir_senha(self, senha):
        """Define a senha do usuário."""
        self.senha_hash = gerar_hash_senha(senha)

    def to_dict(self):
        """Converte o usuário para dicionário."""
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'cargo': self.cargo,
            'ativo': self.ativo,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'ultimo_acesso': self.ultimo_acesso.isoformat() if self.ultimo_acesso else None
        }

    def save(self):
        """Salva o usuário no banco de dados."""
        db.session.add(self)
        db.session.commit() 