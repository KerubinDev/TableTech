from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Carrega variáveis de ambiente
load_dotenv()

# Inicializa o app Flask
app = Flask(__name__, 
    static_folder='frontend/static',
    template_folder='frontend/templates'
)

# Configurações
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_key_123')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///tabletech.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializa extensões
from app.models import db, init_db
init_db(app)
CORS(app)

# Importa e registra os blueprints
from app.routes.auth import auth_bp
from app.routes.mesas import mesas_bp
from app.routes.clientes import clientes_bp
from app.routes.reservas import reservas_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(mesas_bp, url_prefix='/api/mesas')
app.register_blueprint(clientes_bp, url_prefix='/api/clientes')
app.register_blueprint(reservas_bp, url_prefix='/api/reservas')

# Rota para servir o index.html
@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

# Rota para servir outros arquivos HTML
@app.route('/<path:path>')
def serve_pages(path):
    if path.endswith('.html'):
        return send_from_directory('frontend', path)
    return send_from_directory('frontend/static', path)

# Rota de status da API
@app.route('/api/status')
def status():
    return jsonify({
        'status': 'online',
        'versao': '1.0.0',
        'mensagem': 'Bem-vindo ao TableTech!',
        'endpoints': {
            'auth': '/api/auth',
            'mesas': '/api/mesas',
            'clientes': '/api/clientes',
            'reservas': '/api/reservas'
        }
    })

if __name__ == '__main__':
    app.run(debug=True) 