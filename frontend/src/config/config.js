/**
 * Configurações globais do frontend
 */
const config = {
    // URL base da API
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    
    // Configurações de autenticação
    AUTH: {
        TOKEN_KEY: 'restaurante_token',
        REFRESH_TOKEN_KEY: 'restaurante_refresh_token',
    },
    
    // Configurações de paginação
    ITENS_POR_PAGINA: 10,
    
    // Horários de funcionamento
    HORARIO_INICIO: '11:00',
    HORARIO_FIM: '23:00',
    INTERVALO_RESERVA: 30, // minutos
    
    // Formatos de data/hora
    FORMATO_DATA: 'DD/MM/YYYY',
    FORMATO_HORA: 'HH:mm',
    FORMATO_DATA_HORA: 'DD/MM/YYYY HH:mm',
    
    // Temas e cores
    CORES: {
        primaria: '#2C3E50',
        secundaria: '#E74C3C',
        sucesso: '#27AE60',
        alerta: '#F1C40F',
        erro: '#C0392B',
        texto: '#2C3E50',
        fundo: '#ECF0F1',
    }
};

export default config; 