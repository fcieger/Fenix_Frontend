#!/bin/bash

# Script de validação completa da Fenix NFe API
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
NAMESPACE="fenix-nfe"
API_URL="https://api.fenix.com.br"
STAGING_URL="https://staging-api.fenix.com.br"
LOCAL_URL="http://localhost:8080"

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
    ((PASSED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
    ((FAILED_TESTS++))
}

# Função para executar teste
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TOTAL_TESTS++))
    log "Executando: $test_name"
    
    if eval "$test_command" &> /dev/null; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name"
        return 1
    fi
}

# Função para verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    # Verificar kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl não está instalado!"
        exit 1
    fi
    
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
    
    log_success "Dependências verificadas!"
}

# Função para verificar conectividade
check_connectivity() {
    log "Verificando conectividade..."
    
    # Verificar cluster Kubernetes
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Não é possível conectar ao cluster Kubernetes!"
        exit 1
    fi
    
    log_success "Conectividade verificada!"
}

# Função para verificar namespace
check_namespace() {
    log "Verificando namespace..."
    
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_error "Namespace $NAMESPACE não existe!"
        exit 1
    fi
    
    log_success "Namespace $NAMESPACE existe!"
}

# Função para verificar pods
check_pods() {
    log "Verificando pods..."
    
    local pods=$(kubectl get pods -n $NAMESPACE -l app=nfe-api -o jsonpath='{.items[*].metadata.name}')
    
    if [ -z "$pods" ]; then
        log_error "Nenhum pod da aplicação encontrado!"
        return 1
    fi
    
    for pod in $pods; do
        local status=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}')
        if [ "$status" != "Running" ]; then
            log_error "Pod $pod não está rodando (status: $status)"
            return 1
        fi
    done
    
    log_success "Todos os pods estão rodando!"
}

# Função para verificar serviços
check_services() {
    log "Verificando serviços..."
    
    local services=$(kubectl get services -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
    
    if [ -z "$services" ]; then
        log_error "Nenhum serviço encontrado!"
        return 1
    fi
    
    for service in $services; do
        local endpoints=$(kubectl get endpoints $service -n $NAMESPACE -o jsonpath='{.subsets[*].addresses[*].ip}')
        if [ -z "$endpoints" ]; then
            log_error "Serviço $service não tem endpoints!"
            return 1
        fi
    done
    
    log_success "Todos os serviços têm endpoints!"
}

# Função para verificar ingress
check_ingress() {
    log "Verificando ingress..."
    
    local ingress=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$ingress" ]; then
        log_error "Nenhum ingress encontrado!"
        return 1
    fi
    
    local address=$(kubectl get ingress $ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -z "$address" ]; then
        log_warning "Ingress $ingress não tem IP externo"
    fi
    
    log_success "Ingress $ingress configurado!"
}

# Função para verificar health check
check_health() {
    log "Verificando health check..."
    
    local health_url="$API_URL/health"
    
    if ! curl -f -s "$health_url" &> /dev/null; then
        log_error "Health check falhou em $health_url"
        return 1
    fi
    
    local health_response=$(curl -s "$health_url")
    local status=$(echo "$health_response" | jq -r '.status // "UNKNOWN"')
    
    if [ "$status" != "UP" ]; then
        log_error "Status da aplicação: $status"
        return 1
    fi
    
    log_success "Health check OK!"
}

# Função para verificar API endpoints
check_api_endpoints() {
    log "Verificando endpoints da API..."
    
    # Verificar Swagger
    run_test "Swagger UI" "curl -f -s '$API_URL/swagger-ui.html'"
    
    # Verificar OpenAPI
    run_test "OpenAPI Spec" "curl -f -s '$API_URL/v3/api-docs'"
    
    # Verificar Actuator
    run_test "Actuator Health" "curl -f -s '$API_URL/actuator/health'"
    
    # Verificar Métricas
    run_test "Actuator Metrics" "curl -f -s '$API_URL/actuator/metrics'"
    
    # Verificar Info
    run_test "Actuator Info" "curl -f -s '$API_URL/actuator/info'"
}

# Função para verificar banco de dados
check_database() {
    log "Verificando banco de dados..."
    
    local postgres_pod=$(kubectl get pods -n $NAMESPACE -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$postgres_pod" ]; then
        log_error "Pod do PostgreSQL não encontrado!"
        return 1
    fi
    
    # Verificar conexão
    if ! kubectl exec -n $NAMESPACE $postgres_pod -- pg_isready -U fenix_user -d fenix_nfe &> /dev/null; then
        log_error "PostgreSQL não está respondendo!"
        return 1
    fi
    
    # Verificar tabelas
    local tables=$(kubectl exec -n $NAMESPACE $postgres_pod -- psql -U fenix_user -d fenix_nfe -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    if [ "$tables" -lt 4 ]; then
        log_error "Tabelas do banco não foram criadas corretamente!"
        return 1
    fi
    
    log_success "Banco de dados OK!"
}

# Função para verificar cache
check_cache() {
    log "Verificando cache..."
    
    local redis_pod=$(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$redis_pod" ]; then
        log_error "Pod do Redis não encontrado!"
        return 1
    fi
    
    # Verificar conexão
    if ! kubectl exec -n $NAMESPACE $redis_pod -- redis-cli ping &> /dev/null; then
        log_error "Redis não está respondendo!"
        return 1
    fi
    
    log_success "Cache OK!"
}

# Função para verificar filas
check_queues() {
    log "Verificando filas..."
    
    local rabbitmq_pod=$(kubectl get pods -n $NAMESPACE -l app=rabbitmq -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$rabbitmq_pod" ]; then
        log_error "Pod do RabbitMQ não encontrado!"
        return 1
    fi
    
    # Verificar status
    if ! kubectl exec -n $NAMESPACE $rabbitmq_pod -- rabbitmq-diagnostics ping &> /dev/null; then
        log_error "RabbitMQ não está respondendo!"
        return 1
    fi
    
    # Verificar filas
    local queues=$(kubectl exec -n $NAMESPACE $rabbitmq_pod -- rabbitmqctl list_queues name | wc -l)
    
    if [ "$queues" -lt 5 ]; then
        log_error "Filas não foram criadas corretamente!"
        return 1
    fi
    
    log_success "Filas OK!"
}

# Função para verificar monitoramento
check_monitoring() {
    log "Verificando monitoramento..."
    
    # Verificar Prometheus
    local prometheus_pod=$(kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$prometheus_pod" ]; then
        if kubectl exec -n monitoring $prometheus_pod -- wget -qO- http://localhost:9090/api/v1/query?query=up &> /dev/null; then
            log_success "Prometheus OK!"
        else
            log_warning "Prometheus não está respondendo"
        fi
    else
        log_warning "Prometheus não encontrado"
    fi
    
    # Verificar Grafana
    local grafana_pod=$(kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$grafana_pod" ]; then
        if kubectl exec -n monitoring $grafana_pod -- wget -qO- http://localhost:3000/api/health &> /dev/null; then
            log_success "Grafana OK!"
        else
            log_warning "Grafana não está respondendo"
        fi
    else
        log_warning "Grafana não encontrado"
    fi
}

# Função para verificar segurança
check_security() {
    log "Verificando segurança..."
    
    # Verificar HTTPS
    if ! curl -f -s "https://$API_URL/health" &> /dev/null; then
        log_error "HTTPS não está funcionando!"
        return 1
    fi
    
    # Verificar headers de segurança
    local security_headers=$(curl -s -I "https://$API_URL/health" | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection")
    
    if [ -z "$security_headers" ]; then
        log_warning "Headers de segurança não encontrados"
    else
        log_success "Headers de segurança OK!"
    fi
    
    # Verificar CORS
    local cors_headers=$(curl -s -I -H "Origin: https://example.com" "https://$API_URL/health" | grep -i "access-control-allow-origin")
    
    if [ -z "$cors_headers" ]; then
        log_warning "CORS não configurado"
    else
        log_success "CORS OK!"
    fi
}

# Função para verificar performance
check_performance() {
    log "Verificando performance..."
    
    local start_time=$(date +%s)
    curl -f -s "$API_URL/health" &> /dev/null
    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))
    
    if [ $response_time -gt 5 ]; then
        log_warning "Tempo de resposta alto: ${response_time}s"
    else
        log_success "Tempo de resposta OK: ${response_time}s"
    fi
}

# Função para verificar logs
check_logs() {
    log "Verificando logs..."
    
    local pods=$(kubectl get pods -n $NAMESPACE -l app=nfe-api -o jsonpath='{.items[*].metadata.name}')
    
    for pod in $pods; do
        local error_logs=$(kubectl logs $pod -n $NAMESPACE --since=1h | grep -i error | wc -l)
        
        if [ $error_logs -gt 10 ]; then
            log_warning "Pod $pod tem muitos erros: $error_logs"
        else
            log_success "Pod $pod logs OK!"
        fi
    done
}

# Função para verificar recursos
check_resources() {
    log "Verificando recursos..."
    
    # Verificar uso de CPU
    local cpu_usage=$(kubectl top pods -n $NAMESPACE -l app=nfe-api --no-headers | awk '{print $2}' | sed 's/m//' | head -1)
    
    if [ -n "$cpu_usage" ] && [ $cpu_usage -gt 1000 ]; then
        log_warning "Uso de CPU alto: ${cpu_usage}m"
    else
        log_success "Uso de CPU OK: ${cpu_usage}m"
    fi
    
    # Verificar uso de memória
    local memory_usage=$(kubectl top pods -n $NAMESPACE -l app=nfe-api --no-headers | awk '{print $3}' | sed 's/Mi//' | head -1)
    
    if [ -n "$memory_usage" ] && [ $memory_usage -gt 1000 ]; then
        log_warning "Uso de memória alto: ${memory_usage}Mi"
    else
        log_success "Uso de memória OK: ${memory_usage}Mi"
    fi
}

# Função para verificar certificados
check_certificates() {
    log "Verificando certificados..."
    
    local cert_pod=$(kubectl get pods -n $NAMESPACE -l app=nfe-api -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$cert_pod" ]; then
        # Verificar certificados
        local cert_files=$(kubectl exec -n $NAMESPACE $cert_pod -- find /app/certificates -name "*.pfx" 2>/dev/null | wc -l)
        
        if [ $cert_files -eq 0 ]; then
            log_error "Nenhum certificado encontrado!"
            return 1
        fi
        
        log_success "Certificados OK: $cert_files arquivo(s)"
    else
        log_error "Pod da aplicação não encontrado!"
        return 1
    fi
}

# Função para verificar configurações
check_configurations() {
    log "Verificando configurações..."
    
    # Verificar ConfigMaps
    local configmaps=$(kubectl get configmaps -n $NAMESPACE | wc -l)
    
    if [ $configmaps -lt 2 ]; then
        log_error "ConfigMaps insuficientes: $configmaps"
        return 1
    fi
    
    # Verificar Secrets
    local secrets=$(kubectl get secrets -n $NAMESPACE | wc -l)
    
    if [ $secrets -lt 3 ]; then
        log_error "Secrets insuficientes: $secrets"
        return 1
    fi
    
    log_success "Configurações OK!"
}

# Função para gerar relatório
generate_report() {
    log "Gerando relatório de validação..."
    
    local report_file="$PROJECT_DIR/validation-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== RELATÓRIO DE VALIDAÇÃO ==="
        echo "Data: $(date)"
        echo "Namespace: $NAMESPACE"
        echo "API URL: $API_URL"
        echo ""
        echo "=== RESUMO ==="
        echo "Total de testes: $TOTAL_TESTS"
        echo "Testes aprovados: $PASSED_TESTS"
        echo "Testes falharam: $FAILED_TESTS"
        echo "Taxa de sucesso: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
        echo ""
        echo "=== STATUS ==="
        if [ $FAILED_TESTS -eq 0 ]; then
            echo "✅ VALIDAÇÃO COMPLETA - SISTEMA PRONTO PARA PRODUÇÃO"
        else
            echo "❌ VALIDAÇÃO INCOMPLETA - CORRIGIR $FAILED_TESTS PROBLEMA(S)"
        fi
    } > "$report_file"
    
    log_success "Relatório salvo em: $report_file"
}

# Função para mostrar resumo
show_summary() {
    echo ""
    log "=== RESUMO DA VALIDAÇÃO ==="
    echo "Total de testes: $TOTAL_TESTS"
    echo "Testes aprovados: $PASSED_TESTS"
    echo "Testes falharam: $FAILED_TESTS"
    echo "Taxa de sucesso: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "VALIDAÇÃO COMPLETA - SISTEMA PRONTO PARA PRODUÇÃO!"
    else
        log_error "VALIDAÇÃO INCOMPLETA - CORRIGIR $FAILED_TESTS PROBLEMA(S)"
        exit 1
    fi
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  all         - Executa todas as validações"
    echo "  basic       - Validações básicas"
    echo "  api         - Validações da API"
    echo "  database    - Validações do banco"
    echo "  monitoring  - Validações de monitoramento"
    echo "  security    - Validações de segurança"
    echo "  performance - Validações de performance"
    echo "  help        - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 all"
    echo "  $0 basic"
    echo "  $0 api"
}

# Função principal
main() {
    case "${1:-all}" in
        "all")
            check_dependencies
            check_connectivity
            check_namespace
            check_pods
            check_services
            check_ingress
            check_health
            check_api_endpoints
            check_database
            check_cache
            check_queues
            check_monitoring
            check_security
            check_performance
            check_logs
            check_resources
            check_certificates
            check_configurations
            generate_report
            show_summary
            ;;
        "basic")
            check_dependencies
            check_connectivity
            check_namespace
            check_pods
            check_services
            check_ingress
            check_health
            show_summary
            ;;
        "api")
            check_health
            check_api_endpoints
            check_security
            check_performance
            show_summary
            ;;
        "database")
            check_database
            check_cache
            check_queues
            show_summary
            ;;
        "monitoring")
            check_monitoring
            check_logs
            check_resources
            show_summary
            ;;
        "security")
            check_security
            check_certificates
            check_configurations
            show_summary
            ;;
        "performance")
            check_performance
            check_resources
            check_logs
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
