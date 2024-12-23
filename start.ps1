# Criar e configurar o ambiente virtual Python
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependências do Python
pip install -r requirements.txt

# Configurar variáveis de ambiente
$env:FLASK_APP = "backend/app"
$env:FLASK_ENV = "development"
$env:DATABASE_URL = "sqlite:///app.db"
$env:JWT_SECRET_KEY = "codespace_secret_key_123"

# Inicializar o banco de dados
flask db upgrade

# Criar usuário admin (se não existir)
python -c "
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
        print('Usuário admin criado com sucesso!')
    else:
        print('Usuário admin já existe!')
"

# Instalar dependências do Node.js
cd frontend
npm install

# Iniciar os servidores
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\Activate.ps1; flask run" 