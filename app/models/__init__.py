from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy() 

# Função para inicializar o banco de dados
def init_db(app):
    db.init_app(app)
    
    # Importa os modelos
    from .usuario import Usuario
    from .mesa import Mesa
    from .cliente import Cliente
    from .reserva import Reserva
    
    # Cria as tabelas
    with app.app_context():
        db.create_all()
        
        # Cria o usuário admin se não existir
        admin = Usuario.query.filter_by(email='admin@tabletech.com').first()
        if not admin:
            admin = Usuario(
                nome='Administrador',
                email='admin@tabletech.com',
                cargo='admin',
                ativo=True
            )
            admin.definir_senha('Admin@123')
            db.session.add(admin)
            db.session.commit()
            print('Usuário admin criado com sucesso!') 