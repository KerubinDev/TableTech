"""
Configurações do sistema de reservas.
"""
import os
from datetime import timedelta


class Config:
    """Configurações base do sistema."""
    
    # Configurações básicas
    SECRET_KEY = os.getenv('SECRET_KEY', 'chave-secreta-padrao')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-chave-secreta-padrao')
    
    # Configurações do banco de dados
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///restaurante.db'
    )
    
    # Configurações JWT
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Configurações de negócio
    DURACAO_PADRAO_RESERVA = 120  # minutos
    HORARIO_INICIO_EXPEDIENTE = '11:00'
    HORARIO_FIM_EXPEDIENTE = '23:00'
    INTERVALO_ENTRE_RESERVAS = 30  # minutos
    MAX_RESERVAS_SIMULTANEAS = 3  # por cliente
    TEMPO_CONFIRMACAO_RESERVA = 24  # horas
    
    # Configurações de e-mail
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv(
        'MAIL_DEFAULT_SENDER',
        'reservas@restaurante.com'
    )


class DevelopmentConfig(Config):
    """Configurações para ambiente de desenvolvimento."""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Configurações para ambiente de produção."""
    DEBUG = False
    
    # Sobrescreve configurações sensíveis
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    
    # Configurações adicionais de segurança
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True


class TestingConfig(Config):
    """Configurações para ambiente de testes."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 