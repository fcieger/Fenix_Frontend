#!/bin/bash

# TESTE COMPLETO PARA CONFIGURAÇÃO POR ESTADO
# Este script testa a API diretamente usando curl

set -e

# Configurações
BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
EMAIL="teste@ieger.com.br"
PASSWORD="123456"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} ${message}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} ${message}"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${message}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} ${message}"
            ;;
    esac
}

# Função para verificar se o backend está rodando
check_backend() {
    log "INFO" "Verificando se o backend está rodando..."
    
    if curl -s "$BASE_URL/api" > /dev/null; then
        log "SUCCESS" "Backend está rodando"
        return 0
    else
        log "ERROR" "Backend não está rodando"
        return 1
    fi
}

# Função para fazer login e obter token
login() {
    log "INFO" "Fazendo login..."
    
    local response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    
    if echo "$response" | grep -q "access_token"; then
        TOKEN=$(echo "$response" | jq -r '.access_token')
        log "SUCCESS" "Login realizado com sucesso"
        return 0
    else
        log "ERROR" "Falha no login: $response"
        return 1
    fi
}

# Função para listar naturezas de operação
list_naturezas() {
    log "INFO" "Listando naturezas de operação..."
    
    local response=$(curl -s -X GET "$BASE_URL/api/natureza-operacao" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q "Venda teste"; then
        NATUREZA_ID=$(echo "$response" | jq -r '.[] | select(.nome == "Venda teste") | .id')
        log "SUCCESS" "Natureza 'Venda teste' encontrada: $NATUREZA_ID"
        return 0
    else
        log "ERROR" "Natureza 'Venda teste' não encontrada"
        return 1
    fi
}

# Função para testar configuração de estados
test_configuracao_estados() {
    log "INFO" "Testando configuração de estados..."
    
    # Dados de teste para múltiplos estados
    local configuracao_data='[
        {
            "uf": "AC",
            "habilitado": true,
            "cfop": "1101",
            "naturezaOperacaoDescricao": "Venda de mercadoria - Acre",
            "localDestinoOperacao": "interna",
            "icmsAliquota": 18.0,
            "icmsCST": "60",
            "icmsOrigem": "0",
            "icmsModalidade": "0",
            "icmsReducaoBase": 0,
            "pisAliquota": 1.65,
            "pisCST": "01",
            "cofinsAliquota": 7.6,
            "cofinsCST": "01",
            "issAliquota": 5.0,
            "ipiAliquota": 10.0,
            "ipiCST": "50"
        },
        {
            "uf": "AL",
            "habilitado": true,
            "cfop": "1102",
            "naturezaOperacaoDescricao": "Venda de mercadoria - Alagoas",
            "localDestinoOperacao": "interestadual",
            "icmsAliquota": 18.0,
            "icmsCST": "60",
            "icmsOrigem": "0",
            "icmsModalidade": "0",
            "icmsReducaoBase": 0,
            "pisAliquota": 1.65,
            "pisCST": "01",
            "cofinsAliquota": 7.6,
            "cofinsCST": "01",
            "issAliquota": 5.0,
            "ipiAliquota": 10.0,
            "ipiCST": "50"
        },
        {
            "uf": "SP",
            "habilitado": true,
            "cfop": "1103",
            "naturezaOperacaoDescricao": "Venda de mercadoria - São Paulo",
            "localDestinoOperacao": "interna",
            "icmsAliquota": 18.0,
            "icmsCST": "60",
            "icmsOrigem": "0",
            "icmsModalidade": "0",
            "icmsReducaoBase": 0,
            "pisAliquota": 1.65,
            "pisCST": "01",
            "cofinsAliquota": 7.6,
            "cofinsCST": "01",
            "issAliquota": 5.0,
            "ipiAliquota": 10.0,
            "ipiCST": "50"
        }
    ]'
    
    log "INFO" "Enviando configuração para $NATUREZA_ID..."
    
    local response=$(curl -s -X POST "$BASE_URL/api/natureza-operacao/$NATUREZA_ID/configuracao-estados" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$configuracao_data")
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/natureza-operacao/$NATUREZA_ID/configuracao-estados" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$configuracao_data")
    
    if [ "$status_code" -eq 201 ]; then
        log "SUCCESS" "Configurações salvas com sucesso (Status: $status_code)"
        return 0
    else
        log "ERROR" "Falha ao salvar configurações (Status: $status_code): $response"
        return 1
    fi
}

# Função para verificar configurações salvas
verify_configuracao() {
    log "INFO" "Verificando configurações salvas..."
    
    local response=$(curl -s -X GET "$BASE_URL/api/natureza-operacao/$NATUREZA_ID/configuracao-estados" \
        -H "Authorization: Bearer $TOKEN")
    
    local count=$(echo "$response" | jq '. | length')
    
    if [ "$count" -ge 3 ]; then
        log "SUCCESS" "Configurações verificadas: $count estados configurados"
        echo "$response" | jq '.'
        return 0
    else
        log "ERROR" "Configurações não encontradas ou incompletas"
        return 1
    fi
}

# Função para testar campos específicos
test_campos_especificos() {
    log "INFO" "Testando campos específicos..."
    
    # Testar com campos mais complexos
    local configuracao_complexa='[
        {
            "uf": "RJ",
            "habilitado": true,
            "cfop": "1104",
            "naturezaOperacaoDescricao": "Venda de mercadoria - Rio de Janeiro",
            "localDestinoOperacao": "exterior",
            "icmsAliquota": 20.0,
            "icmsCST": "10",
            "icmsOrigem": "1",
            "icmsModalidade": "1",
            "icmsReducaoBase": 5.0,
            "icmsStAliquota": 18.0,
            "icmsStCST": "60",
            "icmsStMva": 10.0,
            "icmsStReducaoBase": 0,
            "pisAliquota": 2.0,
            "pisCST": "02",
            "cofinsAliquota": 8.0,
            "cofinsCST": "02",
            "issAliquota": 6.0,
            "ipiAliquota": 15.0,
            "ipiCST": "49",
            "outrosImpostos": ["ICMS Diferido", "PIS Importação"]
        }
    ]'
    
    local response=$(curl -s -X POST "$BASE_URL/api/natureza-operacao/$NATUREZA_ID/configuracao-estados" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$configuracao_complexa")
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/natureza-operacao/$NATUREZA_ID/configuracao-estados" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$configuracao_complexa")
    
    if [ "$status_code" -eq 201 ]; then
        log "SUCCESS" "Configuração complexa salva com sucesso"
        return 0
    else
        log "ERROR" "Falha ao salvar configuração complexa (Status: $status_code): $response"
        return 1
    fi
}

# Função principal
main() {
    log "INFO" "=== INICIANDO TESTE COMPLETO DE CONFIGURAÇÃO POR ESTADO ==="
    
    # Verificar dependências
    if ! command -v jq &> /dev/null; then
        log "ERROR" "jq não está instalado. Instale com: sudo apt-get install jq"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        log "ERROR" "curl não está instalado"
        exit 1
    fi
    
    # Executar testes
    check_backend || exit 1
    login || exit 1
    list_naturezas || exit 1
    test_configuracao_estados || exit 1
    verify_configuracao || exit 1
    test_campos_especificos || exit 1
    
    log "SUCCESS" "=== TESTE CONCLUÍDO COM SUCESSO! ==="
    log "INFO" "Todas as configurações foram salvas corretamente no banco de dados"
}

# Executar função principal
main "$@"

