"""
Módulo principal da aplicação Flask para o sistema de reservas.

Este módulo inicializa a aplicação Flask e seus componentes principais,
incluindo banco de dados, autenticação e blueprints.
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Carrega variáveis de ambiente
load_dotenv()

# Inicializa extensões
db = SQLAlchemy()
login_manager = LoginManager()
jwt = JWTManager()

def criar_app():
    """
    Cria e configura a aplicação Flask.
    
    Returns:
        Flask: Instância configurada da aplicação Flask
    """
    app = Flask(__name__)
    
    # Configurações básicas
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # Inicializa extensões com app
    db.init_app(app)
    login_manager.init_app(app)
    jwt.init_app(app)
    
    # Registra blueprints
    from .rotas import auth_bp, mesa_bp, reserva_bp, cliente_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(mesa_bp)
    app.register_blueprint(reserva_bp)
    app.register_blueprint(cliente_bp)
    
    return app 