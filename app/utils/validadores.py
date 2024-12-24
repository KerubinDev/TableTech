import re
from datetime import datetime, timedelta


def validar_campos_obrigatorios(dados, campos):
    """
    Verifica se todos os campos obrigatórios estão presentes.
    
    Args:
        dados (dict): Dicionário com os dados
        campos (list): Lista de campos obrigatórios
        
    Returns:
        bool: True se todos os campos estão presentes
    """
    if not dados or not isinstance(dados, dict):
        return False
        
    return all(campo in dados and dados[campo] is not None for campo in campos)


def validar_numero_positivo(numero):
    """
    Verifica se um número é positivo.
    
    Args:
        numero: Número a ser validado
        
    Returns:
        bool: True se o número é positivo
    """
    try:
        return float(numero) > 0
    except (TypeError, ValueError):
        return False


def validar_email(email):
    """Valida o formato do email."""
    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(padrao, email))


def validar_senha(senha):
    """
    Valida se a senha atende aos requisitos mínimos:
    - Mínimo 8 caracteres
    - Pelo menos uma letra maiúscula
    - Pelo menos uma letra minúscula
    - Pelo menos um número
    - Pelo menos um caractere especial
    """
    if len(senha) < 8:
        return False
        
    if not re.search(r'[A-Z]', senha):
        return False
        
    if not re.search(r'[a-z]', senha):
        return False
        
    if not re.search(r'\d', senha):
        return False
        
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', senha):
        return False
        
    return True


def validar_data(data_str):
    """Valida se a string está no formato de data correto (YYYY-MM-DD)."""
    try:
        datetime.strptime(data_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def validar_hora(hora_str):
    """Valida se a string está no formato de hora correto (HH:MM)."""
    try:
        datetime.strptime(hora_str, '%H:%M')
        return True
    except ValueError:
        return False


def validar_cpf(cpf):
    """
    Valida um CPF.
    Remove caracteres não numéricos e verifica se é um CPF válido.
    """
    # Remove caracteres não numéricos
    cpf = re.sub(r'[^0-9]', '', cpf)
    
    # Verifica se tem 11 dígitos
    if len(cpf) != 11:
        return False
        
    # Verifica se todos os dígitos são iguais
    if len(set(cpf)) == 1:
        return False
        
    # Calcula primeiro dígito verificador
    soma = 0
    for i in range(9):
        soma += int(cpf[i]) * (10 - i)
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    
    if int(cpf[9]) != digito1:
        return False
        
    # Calcula segundo dígito verificador
    soma = 0
    for i in range(10):
        soma += int(cpf[i]) * (11 - i)
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    
    return int(cpf[10]) == digito2


def validar_telefone(telefone):
    """
    Valida um número de telefone.
    Aceita formatos:
    - (XX) XXXXX-XXXX
    - (XX) XXXX-XXXX
    """
    # Remove caracteres não numéricos
    telefone = re.sub(r'[^0-9]', '', telefone)
    
    # Verifica se tem 10 ou 11 dígitos
    return len(telefone) in [10, 11]


def validar_capacidade_mesa(capacidade):
    """Valida se a capacidade da mesa está dentro dos limites aceitáveis."""
    try:
        capacidade = int(capacidade)
        return 1 <= capacidade <= 20
    except (ValueError, TypeError):
        return False


def validar_status_mesa(status):
    """Valida se o status da mesa é válido."""
    return status in ['livre', 'ocupada', 'reservada', 'manutencao']


def validar_numero_mesa(numero):
    """Valida se o número da mesa é válido."""
    try:
        numero = int(numero)
        return numero > 0
    except (ValueError, TypeError):
        return False


def validar_data_hora_reserva(data_hora):
    """
    Valida se a data/hora da reserva é válida.
    - Deve ser futura
    - Deve estar dentro do horário de funcionamento (11h às 23h)
    
    Args:
        data_hora (datetime): Data e hora da reserva
        
    Returns:
        tuple: (bool, str) - (True, None) se válido, (False, mensagem) se inválido
    """
    agora = datetime.now()
    
    # Verifica se é futura
    if data_hora <= agora:
        return False, "A data da reserva deve ser futura"
    
    # Verifica se está dentro do horário de funcionamento
    hora = data_hora.hour
    if hora < 11 or hora >= 23:
        return False, "Horário fora do período de funcionamento (11h às 23h)"
    
    return True, None


def validar_duracao_reserva(duracao):
    """
    Valida a duração da reserva.
    - Mínimo: 30 minutos
    - Máximo: 4 horas
    
    Args:
        duracao (int): Duração em minutos
        
    Returns:
        tuple: (bool, str) - (True, None) se válido, (False, mensagem) se inválido
    """
    try:
        duracao = int(duracao)
        
        if duracao < 30:
            return False, "Duração mínima de 30 minutos"
            
        if duracao > 240:
            return False, "Duração máxima de 4 horas"
            
        return True, None
        
    except (ValueError, TypeError):
        return False, "Duração inválida"


def validar_capacidade_reserva(num_pessoas, capacidade_mesa):
    """
    Valida se a mesa comporta o número de pessoas da reserva.
    
    Args:
        num_pessoas (int): Número de pessoas
        capacidade_mesa (int): Capacidade da mesa
        
    Returns:
        tuple: (bool, str) - (True, None) se válido, (False, mensagem) se inválido
    """
    try:
        num_pessoas = int(num_pessoas)
        capacidade_mesa = int(capacidade_mesa)
        
        if num_pessoas <= 0:
            return False, "Número de pessoas deve ser maior que zero"
            
        if num_pessoas > capacidade_mesa:
            return False, f"Mesa não comporta {num_pessoas} pessoas (capacidade: {capacidade_mesa})"
            
        return True, None
        
    except (ValueError, TypeError):
        return False, "Número de pessoas inválido" 