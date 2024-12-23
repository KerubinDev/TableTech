#!/bin/bash

# Criar e configurar o ambiente virtual Python
python -m venv venv
source venv/bin/activate

# Instalar dependências do Python
pip install -r requirements.txt

# Configurar variáveis de ambiente
export FLASK_APP=backend/app
export FLASK_ENV=development
export DATABASE_URL=sqlite:///app.db
export JWT_SECRET_KEY=codespace_secret_key_123

# Inicializar o banco de dados
flask db upgrade

# Criar usuário admin (se não existir)
python << END
from backend.app import create_app, db
from backend.app.models.usuario import Usuario

app = create_app()
with app.app_context():
    if not Usuario.query.filter_by(email='admin@exemplo.com').first():
        admin = Usuario(
            nome='Administrador',
            email='admin@exemplo.com',
            senha='senha123',
            admin=True
        )
        db.session.add(admin)
        db.session.commit()
        print("Usuário admin criado com sucesso!")
    else:
        print("Usuário admin já existe!")
END

# Instalar dependências do Node.js
cd frontend
npm install

# Iniciar os servidores em terminais separados
echo "Iniciando os servidores..."
tmux new-session -d -s tabletech 'cd frontend && npm start'
tmux split-window -h 'source ../venv/bin/activate && flask run'
tmux -2 attach-session -d 