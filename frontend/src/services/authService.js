/**
 * Serviço para gerenciamento de autenticação
 */
import axios from 'axios';
import config from '../config/config';

const API_URL = config.API_URL;

class AuthService {
    async login(email, senha) {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                senha
            });
            
            if (response.data.access_token) {
                localStorage.setItem(
                    config.AUTH.TOKEN_KEY, 
                    response.data.access_token
                );
                localStorage.setItem(
                    config.AUTH.REFRESH_TOKEN_KEY, 
                    response.data.refresh_token
                );
            }
            
            return response.data;
        } catch (error) {
            throw this._tratarErro(error);
        }
    }
    
    logout() {
        localStorage.removeItem(config.AUTH.TOKEN_KEY);
        localStorage.removeItem(config.AUTH.REFRESH_TOKEN_KEY);
    }
    
    getToken() {
        return localStorage.getItem(config.AUTH.TOKEN_KEY);
    }
    
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem(
                config.AUTH.REFRESH_TOKEN_KEY
            );
            
            if (!refreshToken) {
                throw new Error('Refresh token não encontrado');
            }
            
            const response = await axios.post(
                `${API_URL}/refresh`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`
                    }
                }
            );
            
            if (response.data.access_token) {
                localStorage.setItem(
                    config.AUTH.TOKEN_KEY, 
                    response.data.access_token
                );
            }
            
            return response.data.access_token;
        } catch (error) {
            this.logout();
            throw this._tratarErro(error);
        }
    }
    
    _tratarErro(error) {
        if (error.response) {
            return new Error(
                error.response.data.mensagem || 'Erro no servidor'
            );
        }
        return error;
    }
}

export default new AuthService(); 