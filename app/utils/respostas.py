from flask import jsonify


def sucesso(dados=None, mensagem=None, codigo=200):
    """
    Retorna uma resposta de sucesso padronizada.
    
    Args:
        dados: Dados a serem retornados (opcional)
        mensagem: Mensagem de sucesso (opcional)
        codigo: Código HTTP (default: 200)
        
    Returns:
        Response: Resposta Flask com o JSON formatado
    """
    resposta = {
        'sucesso': True
    }
    
    if dados is not None:
        resposta['dados'] = dados
        
    if mensagem is not None:
        resposta['mensagem'] = mensagem
        
    return jsonify(resposta), codigo


def erro(mensagem, codigo=400):
    """
    Retorna uma resposta de erro padronizada.
    
    Args:
        mensagem: Mensagem de erro
        codigo: Código HTTP (default: 400)
        
    Returns:
        Response: Resposta Flask com o JSON formatado
    """
    return jsonify({
        'sucesso': False,
        'mensagem': mensagem
    }), codigo


def nao_encontrado(mensagem='Recurso não encontrado'):
    """
    Retorna uma resposta 404 padronizada.
    
    Args:
        mensagem: Mensagem de erro (default: 'Recurso não encontrado')
        
    Returns:
        Response: Resposta Flask com o JSON formatado
    """
    return erro(mensagem, 404)


def nao_autorizado(mensagem='Não autorizado'):
    """
    Retorna uma resposta 401 padronizada.
    
    Args:
        mensagem: Mensagem de erro (default: 'Não autorizado')
        
    Returns:
        Response: Resposta Flask com o JSON formatado
    """
    return erro(mensagem, 401)


def proibido(mensagem='Acesso proibido'):
    """
    Retorna uma resposta 403 padronizada.
    
    Args:
        mensagem: Mensagem de erro (default: 'Acesso proibido')
        
    Returns:
        Response: Resposta Flask com o JSON formatado
    """
    return erro(mensagem, 403)


def conflito(mensagem='Conflito de recursos'):
    """
    Retorna uma resposta 409 padronizada.
    
    Args:
        mensagem: Mensagem de erro (default: 'Conflito de recursos')
        
    Returns:
        Response: Resposta Flask com o JSON formatado
    """
    return erro(mensagem, 409)


def erro_interno(mensagem='Erro interno do servidor'):
    """
    Retorna uma resposta 500 padronizada.
    
    Args:
        mensagem: Mensagem de erro (default: 'Erro interno do servidor')
        
    Returns:
        Response: Resposta Flask com o JSON formatado
    """
    return erro(mensagem, 500) 