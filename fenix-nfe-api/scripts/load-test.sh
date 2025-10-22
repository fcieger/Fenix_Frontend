#!/bin/bash

# Script de testes de carga para Fenix NFe API
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
API_URL="${API_URL:-https://api.fenix.com.br}"
STAGING_URL="${STAGING_URL:-https://staging-api.fenix.com.br}"
LOCAL_URL="${LOCAL_URL:-http://localhost:8080}"

# Parâmetros de teste
CONCURRENT_USERS=${CONCURRENT_USERS:-10}
DURATION=${DURATION:-60}
RAMP_UP=${RAMP_UP:-10}
TEST_TYPE=${TEST_TYPE:-all}

# Resultados
TOTAL_REQUESTS=0
SUCCESSFUL_REQUESTS=0
FAILED_REQUESTS=0
AVERAGE_RESPONSE_TIME=0
MAX_RESPONSE_TIME=0
MIN_RESPONSE_TIME=999999
ERROR_RATE=0

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
}

# Função para verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        log_error "curl não está instalado!"
        exit 1
    fi
    
    # Verificar jq
    if ! command -v jq &> /dev/null; then
        log_error "jq não está instalado!"
        exit 1
    fi
    
    # Verificar bc
    if ! command -v bc &> /dev/null; then
        log_error "bc não está instalado!"
        exit 1
    fi
    
    log_success "Dependências verificadas!"
}

# Função para obter token de autenticação
get_auth_token() {
    log "Obtendo token de autenticação..."
    
    local login_response=$(curl -s -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "username": "test@fenix.com.br",
            "password": "test123"
        }')
    
    local token=$(echo "$login_response" | jq -r '.data.accessToken // empty')
    
    if [ -z "$token" ] || [ "$token" = "null" ]; then
        log_error "Falha ao obter token de autenticação!"
        return 1
    fi
    
    echo "$token"
}

# Função para testar health check
test_health_check() {
    log "Testando health check..."
    
    local start_time=$(date +%s%3N)
    local response=$(curl -s -w "%{http_code}" "$API_URL/health")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        log_success "Health check OK (${response_time}ms)"
        return 0
    else
        log_error "Health check falhou (HTTP $http_code)"
        return 1
    fi
}

# Função para testar endpoint com carga
test_endpoint_load() {
    local endpoint="$1"
    local method="$2"
    local data="$3"
    local token="$4"
    local users="$5"
    local duration="$6"
    
    log "Testando $method $endpoint com $users usuários por $duration segundos..."
    
    local temp_file=$(mktemp)
    local start_time=$(date +%s)
    local end_time=$((start_time + duration))
    
    # Função para executar requisição
    execute_request() {
        local request_start=$(date +%s%3N)
        local response=$(curl -s -w "%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -H "X-Company-CNPJ: 11543862000187" \
            -d "$data" 2>/dev/null)
        local request_end=$(date +%s%3N)
        local request_time=$((request_end - request_start))
        
        local http_code="${response: -3}"
        local body="${response%???}"
        
        echo "$http_code,$request_time" >> "$temp_file"
    }
    
    # Executar requisições concorrentes
    while [ $(date +%s) -lt $end_time ]; do
        for i in $(seq 1 $users); do
            execute_request &
        done
        sleep 0.1
    done
    
    # Aguardar todas as requisições terminarem
    wait
    
    # Processar resultados
    local total_requests=$(wc -l < "$temp_file")
    local successful_requests=$(grep -c "^2" "$temp_file")
    local failed_requests=$((total_requests - successful_requests))
    
    local response_times=$(cut -d',' -f2 "$temp_file")
    local total_time=$(echo "$response_times" | paste -sd+ | bc)
    local average_time=$(echo "scale=2; $total_time / $total_requests" | bc)
    
    local max_time=$(echo "$response_times" | sort -n | tail -1)
    local min_time=$(echo "$response_times" | sort -n | head -1)
    
    local error_rate=$(echo "scale=2; $failed_requests * 100 / $total_requests" | bc)
    
    # Atualizar contadores globais
    TOTAL_REQUESTS=$((TOTAL_REQUESTS + total_requests))
    SUCCESSFUL_REQUESTS=$((SUCCESSFUL_REQUESTS + successful_requests))
    FAILED_REQUESTS=$((FAILED_REQUESTS + failed_requests))
    
    # Atualizar tempos de resposta
    if [ $(echo "$max_time > $MAX_RESPONSE_TIME" | bc) -eq 1 ]; then
        MAX_RESPONSE_TIME=$max_time
    fi
    
    if [ $(echo "$min_time < $MIN_RESPONSE_TIME" | bc) -eq 1 ]; then
        MIN_RESPONSE_TIME=$min_time
    fi
    
    # Mostrar resultados
    log_success "Teste concluído:"
    echo "  Total de requisições: $total_requests"
    echo "  Requisições bem-sucedidas: $successful_requests"
    echo "  Requisições falharam: $failed_requests"
    echo "  Taxa de erro: ${error_rate}%"
    echo "  Tempo médio de resposta: ${average_time}ms"
    echo "  Tempo máximo de resposta: ${max_time}ms"
    echo "  Tempo mínimo de resposta: ${min_time}ms"
    
    # Limpar arquivo temporário
    rm -f "$temp_file"
}

# Função para testar emissão de NFe
test_nfe_emission() {
    local token="$1"
    local users="$2"
    local duration="$3"
    
    log "Testando emissão de NFe..."
    
    local nfe_data='{
        "serie": 32,
        "numero": 1,
        "ambiente": "HOMOLOGACAO",
        "emitente": {
            "cnpj": "11543862000187",
            "nome": "EMPRESA TESTE LTDA",
            "inscricaoEstadual": "9110691308",
            "endereco": {
                "logradouro": "Rua Teste",
                "numero": "123",
                "bairro": "Centro",
                "cidade": "Curitiba",
                "uf": "PR",
                "cep": "80000-000"
            }
        },
        "destinatario": {
            "cnpj": "11543862000187",
            "nome": "DESTINATARIO TESTE LTDA",
            "inscricaoEstadual": "9110691308",
            "endereco": {
                "logradouro": "Rua Destino",
                "numero": "456",
                "bairro": "Centro",
                "cidade": "Curitiba",
                "uf": "PR",
                "cep": "80000-000"
            }
        },
        "itens": [
            {
                "codigo": "001",
                "descricao": "Produto Teste",
                "quantidade": 1.0,
                "valorUnitario": 100.00,
                "valorTotal": 100.00,
                "unidadeComercial": "UN",
                "codigoNCM": "12345678"
            }
        ],
        "imposto": {
            "icmsCst": "102",
            "pisCst": "07",
            "cofinsCst": "07"
        },
        "responsavelTecnico": {
            "cnpj": "17642368000156",
            "nome": "Fabio Ieger",
            "email": "fabio@icertus.com.br",
            "telefone": "4136536993"
        }
    }'
    
    test_endpoint_load "/api/nfe/emitir" "POST" "$nfe_data" "$token" "$users" "$duration"
}

# Função para testar consulta de NFe
test_nfe_consultation() {
    local token="$1"
    local users="$2"
    local duration="$3"
    
    log "Testando consulta de NFe..."
    
    test_endpoint_load "/api/nfe/consulta/numero/1" "GET" "" "$token" "$users" "$duration"
}

# Função para testar status de NFe
test_nfe_status() {
    local token="$1"
    local users="$2"
    local duration="$3"
    
    log "Testando status de NFe..."
    
    test_endpoint_load "/api/nfe/nfe-123456789/status" "GET" "" "$token" "$users" "$duration"
}

# Função para testar listagem de NFe
test_nfe_listing() {
    local token="$1"
    local users="$2"
    local duration="$3"
    
    log "Testando listagem de NFe..."
    
    test_endpoint_load "/api/nfe?page=0&size=10" "GET" "" "$token" "$users" "$duration"
}

# Função para testar autenticação
test_authentication() {
    local users="$1"
    local duration="$2"
    
    log "Testando autenticação..."
    
    local temp_file=$(mktemp)
    local start_time=$(date +%s)
    local end_time=$((start_time + duration))
    
    # Função para executar login
    execute_login() {
        local request_start=$(date +%s%3N)
        local response=$(curl -s -w "%{http_code}" -X POST "$API_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d '{
                "username": "test@fenix.com.br",
                "password": "test123"
            }' 2>/dev/null)
        local request_end=$(date +%s%3N)
        local request_time=$((request_end - request_start))
        
        local http_code="${response: -3}"
        echo "$http_code,$request_time" >> "$temp_file"
    }
    
    # Executar logins concorrentes
    while [ $(date +%s) -lt $end_time ]; do
        for i in $(seq 1 $users); do
            execute_login &
        done
        sleep 0.1
    done
    
    # Aguardar todas as requisições terminarem
    wait
    
    # Processar resultados
    local total_requests=$(wc -l < "$temp_file")
    local successful_requests=$(grep -c "^2" "$temp_file")
    local failed_requests=$((total_requests - successful_requests))
    
    local response_times=$(cut -d',' -f2 "$temp_file")
    local total_time=$(echo "$response_times" | paste -sd+ | bc)
    local average_time=$(echo "scale=2; $total_time / $total_requests" | bc)
    
    local max_time=$(echo "$response_times" | sort -n | tail -1)
    local min_time=$(echo "$response_times" | sort -n | head -1)
    
    local error_rate=$(echo "scale=2; $failed_requests * 100 / $total_requests" | bc)
    
    # Atualizar contadores globais
    TOTAL_REQUESTS=$((TOTAL_REQUESTS + total_requests))
    SUCCESSFUL_REQUESTS=$((SUCCESSFUL_REQUESTS + successful_requests))
    FAILED_REQUESTS=$((FAILED_REQUESTS + failed_requests))
    
    # Mostrar resultados
    log_success "Teste de autenticação concluído:"
    echo "  Total de requisições: $total_requests"
    echo "  Requisições bem-sucedidas: $successful_requests"
    echo "  Requisições falharam: $failed_requests"
    echo "  Taxa de erro: ${error_rate}%"
    echo "  Tempo médio de resposta: ${average_time}ms"
    echo "  Tempo máximo de resposta: ${max_time}ms"
    echo "  Tempo mínimo de resposta: ${min_time}ms"
    
    # Limpar arquivo temporário
    rm -f "$temp_file"
}

# Função para testar stress
test_stress() {
    local token="$1"
    local users="$2"
    local duration="$3"
    
    log "Testando stress com $users usuários por $duration segundos..."
    
    # Executar todos os testes simultaneamente
    test_health_check &
    test_nfe_emission "$token" "$users" "$duration" &
    test_nfe_consultation "$token" "$users" "$duration" &
    test_nfe_status "$token" "$users" "$duration" &
    test_nfe_listing "$token" "$users" "$duration" &
    test_authentication "$users" "$duration" &
    
    # Aguardar todos os testes terminarem
    wait
}

# Função para testar spike
test_spike() {
    local token="$1"
    
    log "Testando spike de carga..."
    
    # Fase 1: Carga normal (10 usuários por 30 segundos)
    log "Fase 1: Carga normal (10 usuários por 30 segundos)"
    test_nfe_emission "$token" 10 30
    
    # Fase 2: Spike (100 usuários por 10 segundos)
    log "Fase 2: Spike (100 usuários por 10 segundos)"
    test_nfe_emission "$token" 100 10
    
    # Fase 3: Carga normal (10 usuários por 30 segundos)
    log "Fase 3: Carga normal (10 usuários por 30 segundos)"
    test_nfe_emission "$token" 10 30
}

# Função para testar volume
test_volume() {
    local token="$1"
    
    log "Testando volume de dados..."
    
    # Teste com muitos dados
    local large_nfe_data='{
        "serie": 32,
        "numero": 1,
        "ambiente": "HOMOLOGACAO",
        "emitente": {
            "cnpj": "11543862000187",
            "nome": "EMPRESA TESTE LTDA COM NOME MUITO LONGO PARA TESTAR VOLUME DE DADOS",
            "inscricaoEstadual": "9110691308",
            "endereco": {
                "logradouro": "Rua Teste Muito Longa Para Testar Volume de Dados",
                "numero": "123",
                "bairro": "Centro",
                "cidade": "Curitiba",
                "uf": "PR",
                "cep": "80000-000"
            }
        },
        "destinatario": {
            "cnpj": "11543862000187",
            "nome": "DESTINATARIO TESTE LTDA COM NOME MUITO LONGO",
            "inscricaoEstadual": "9110691308",
            "endereco": {
                "logradouro": "Rua Destino Muito Longa",
                "numero": "456",
                "bairro": "Centro",
                "cidade": "Curitiba",
                "uf": "PR",
                "cep": "80000-000"
            }
        },
        "itens": ['
    
    # Adicionar muitos itens
    for i in {1..100}; do
        large_nfe_data+="{
            \"codigo\": \"$i\",
            \"descricao\": \"Produto Teste $i com Descrição Muito Longa Para Testar Volume de Dados\",
            \"quantidade\": 1.0,
            \"valorUnitario\": 100.00,
            \"valorTotal\": 100.00,
            \"unidadeComercial\": \"UN\",
            \"codigoNCM\": \"12345678\"
        }"
        
        if [ $i -lt 100 ]; then
            large_nfe_data+=","
        fi
    done
    
    large_nfe_data+=',],
        "imposto": {
            "icmsCst": "102",
            "pisCst": "07",
            "cofinsCst": "07"
        },
        "responsavelTecnico": {
            "cnpj": "17642368000156",
            "nome": "Fabio Ieger",
            "email": "fabio@icertus.com.br",
            "telefone": "4136536993"
        }
    }'
    
    test_endpoint_load "/api/nfe/emitir" "POST" "$large_nfe_data" "$token" 5 30
}

# Função para gerar relatório
generate_report() {
    log "Gerando relatório de teste de carga..."
    
    local report_file="$PROJECT_DIR/load-test-report-$(date +%Y%m%d_%H%M%S).txt"
    
    # Calcular métricas finais
    local average_response_time=$(echo "scale=2; $AVERAGE_RESPONSE_TIME / $TOTAL_REQUESTS" | bc)
    local error_rate=$(echo "scale=2; $FAILED_REQUESTS * 100 / $TOTAL_REQUESTS" | bc)
    local throughput=$(echo "scale=2; $TOTAL_REQUESTS / $DURATION" | bc)
    
    {
        echo "=== RELATÓRIO DE TESTE DE CARGA ==="
        echo "Data: $(date)"
        echo "API URL: $API_URL"
        echo "Usuários concorrentes: $CONCURRENT_USERS"
        echo "Duração: $DURATION segundos"
        echo "Tipo de teste: $TEST_TYPE"
        echo ""
        echo "=== RESULTADOS ==="
        echo "Total de requisições: $TOTAL_REQUESTS"
        echo "Requisições bem-sucedidas: $SUCCESSFUL_REQUESTS"
        echo "Requisições falharam: $FAILED_REQUESTS"
        echo "Taxa de erro: ${error_rate}%"
        echo "Throughput: ${throughput} req/s"
        echo "Tempo médio de resposta: ${average_response_time}ms"
        echo "Tempo máximo de resposta: ${MAX_RESPONSE_TIME}ms"
        echo "Tempo mínimo de resposta: ${MIN_RESPONSE_TIME}ms"
        echo ""
        echo "=== ANÁLISE ==="
        if [ $(echo "$error_rate < 1" | bc) -eq 1 ]; then
            echo "✅ Taxa de erro aceitável (< 1%)"
        else
            echo "❌ Taxa de erro alta (>= 1%)"
        fi
        
        if [ $(echo "$average_response_time < 1000" | bc) -eq 1 ]; then
            echo "✅ Tempo de resposta aceitável (< 1s)"
        else
            echo "❌ Tempo de resposta alto (>= 1s)"
        fi
        
        if [ $(echo "$throughput > 10" | bc) -eq 1 ]; then
            echo "✅ Throughput adequado (> 10 req/s)"
        else
            echo "❌ Throughput baixo (<= 10 req/s)"
        fi
    } > "$report_file"
    
    log_success "Relatório salvo em: $report_file"
}

# Função para mostrar resumo
show_summary() {
    echo ""
    log "=== RESUMO DO TESTE DE CARGA ==="
    echo "Total de requisições: $TOTAL_REQUESTS"
    echo "Requisições bem-sucedidas: $SUCCESSFUL_REQUESTS"
    echo "Requisições falharam: $FAILED_REQUESTS"
    echo "Taxa de erro: $(echo "scale=2; $FAILED_REQUESTS * 100 / $TOTAL_REQUESTS" | bc)%"
    echo "Throughput: $(echo "scale=2; $TOTAL_REQUESTS / $DURATION" | bc) req/s"
    echo "Tempo médio de resposta: $(echo "scale=2; $AVERAGE_RESPONSE_TIME / $TOTAL_REQUESTS" | bc)ms"
    echo "Tempo máximo de resposta: ${MAX_RESPONSE_TIME}ms"
    echo "Tempo mínimo de resposta: ${MIN_RESPONSE_TIME}ms"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO] [OPÇÕES]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  all         - Executa todos os testes"
    echo "  basic       - Testes básicos"
    echo "  stress      - Teste de stress"
    echo "  spike       - Teste de spike"
    echo "  volume      - Teste de volume"
    echo "  help        - Mostra esta ajuda"
    echo ""
    echo "Opções:"
    echo "  CONCURRENT_USERS=N    - Número de usuários concorrentes (padrão: 10)"
    echo "  DURATION=N            - Duração em segundos (padrão: 60)"
    echo "  RAMP_UP=N             - Tempo de rampa em segundos (padrão: 10)"
    echo "  API_URL=URL           - URL da API (padrão: https://api.fenix.com.br)"
    echo ""
    echo "Exemplos:"
    echo "  $0 all"
    echo "  $0 stress CONCURRENT_USERS=50 DURATION=120"
    echo "  $0 spike API_URL=https://staging-api.fenix.com.br"
}

# Função principal
main() {
    case "${1:-all}" in
        "all")
            check_dependencies
            local token=$(get_auth_token)
            test_health_check
            test_nfe_emission "$token" "$CONCURRENT_USERS" "$DURATION"
            test_nfe_consultation "$token" "$CONCURRENT_USERS" "$DURATION"
            test_nfe_status "$token" "$CONCURRENT_USERS" "$DURATION"
            test_nfe_listing "$token" "$CONCURRENT_USERS" "$DURATION"
            test_authentication "$CONCURRENT_USERS" "$DURATION"
            generate_report
            show_summary
            ;;
        "basic")
            check_dependencies
            test_health_check
            show_summary
            ;;
        "stress")
            check_dependencies
            local token=$(get_auth_token)
            test_stress "$token" "$CONCURRENT_USERS" "$DURATION"
            generate_report
            show_summary
            ;;
        "spike")
            check_dependencies
            local token=$(get_auth_token)
            test_spike "$token"
            generate_report
            show_summary
            ;;
        "volume")
            check_dependencies
            local token=$(get_auth_token)
            test_volume "$token"
            generate_report
            show_summary
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Comando inválido: $1"
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
