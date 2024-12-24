# TableTech - Sistema de Gerenciamento de Reservas

## 🚀 Como Executar

### Pré-requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes do Python)

### Passos para Execução

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd TableTech
```

2. Crie um ambiente virtual (opcional, mas recomendado):
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/MacOS
python3 -m venv venv
source venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Execute o programa:
```bash
python main.py
```

O servidor iniciará em `http://localhost:5000`

## 📝 Notas
- O sistema utiliza SQLite como banco de dados por padrão
- As configurações podem ser alteradas no arquivo `.env`
- Para ambiente de produção, altere as chaves secretas no arquivo `.env`

## 🛠️ Tecnologias Utilizadas
- Flask
- SQLAlchemy
- Flask-Login
- JWT
- SQLite 