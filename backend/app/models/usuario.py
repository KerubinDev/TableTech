"""
Modelo para usuários do sistema (funcionários e administradores).
"""
from .. import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime
from enum import Enum


class TipoUsuario(Enum):
    """Enumeração para os tipos de usuário do sistema."""
    ADMIN = 'admin'
    FUNCIONARIO = 'funcionario'


class Usuario(UserMixin, db.Model):
    """Modelo de usuário para funcionários e administradores."""
    
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _senha_hash = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.Enum(TipoUsuario), nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_acesso = db.Column(db.DateTime)
    
    @property
    def senha(self):
        """Impede acesso direto à senha."""
        raise AttributeError('senha não é um atributo legível')
    
    @senha.setter
    def senha(self, senha):
        """Define a senha do usuário usando hash."""
        self._senha_hash = generate_password_hash(senha)
    
    def verificar_senha(self, senha):
        """Verifica se a senha fornecida está correta."""
        return check_password_hash(self._senha_hash, senha) 