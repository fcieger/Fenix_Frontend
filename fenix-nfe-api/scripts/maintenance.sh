#!/bin/bash

# Script de manutenção para Fenix NFe API
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
LOG_DIR="$PROJECT_DIR/logs"
TEMP_DIR="$PROJECT_DIR/temp"

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Função para verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    # Verificar kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl não está instalado!"
        exit 1
    fi
    
    # Verificar conexão com cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Não é possível conectar ao cluster Kubernetes!"
        exit 1
    fi
    
    log_success "Dependências verificadas!"
}

# Função para limpeza de pods
cleanup_pods() {
    log "Limpando pods finalizados..."
    
    # Remover pods com status Succeeded
    kubectl delete pods -n $NAMESPACE --field-selector=status.phase=Succeeded --ignore-not-found=true
    
    # Remover pods com status Failed
    kubectl delete pods -n $NAMESPACE --field-selector=status.phase=Failed --ignore-not-found=true
    
    log_success "Pods finalizados removidos!"
}

# Função para limpeza de logs
cleanup_logs() {
    log "Limpando logs antigos..."
    
    # Criar diretório de logs se não existir
    mkdir -p "$LOG_DIR"
    
    # Remover logs antigos (mais de 7 dias)
    find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Remover logs de pods antigos
    kubectl logs -n $NAMESPACE -l app=nfe-api --since=24h > "$LOG_DIR/application-$(date +%Y%m%d).log" 2>/dev/null || true
    
    log_success "Logs antigos removidos!"
}

# Função para limpeza de recursos temporários
cleanup_temp() {
    log "Limpando recursos temporários..."
    
    # Criar diretório temp se não existir
    mkdir -p "$TEMP_DIR"
    
    # Remover arquivos temporários antigos
    find "$TEMP_DIR" -type f -mtime +1 -delete 2>/dev/null || true
    
    # Limpar cache do Maven
    rm -rf ~/.m2/repository/org/springframework/ 2>/dev/null || true
    
    # Limpar cache do Docker
    docker system prune -f 2>/dev/null || true
    
    log_success "Recursos temporários removidos!"
}

# Função para verificar saúde dos pods
check_pod_health() {
    log "Verificando saúde dos pods..."
    
    local unhealthy_pods=$(kubectl get pods -n $NAMESPACE -l app=nfe-api --field-selector=status.phase!=Running,status.phase!=Succeeded -o jsonpath='{.items[*].metadata.name}')
    
    if [ -n "$unhealthy_pods" ]; then
        log_warning "Pods não saudáveis encontrados: $unhealthy_pods"
        
        # Mostrar detalhes dos pods não saudáveis
        for pod in $unhealthy_pods; do
            log "Detalhes do pod $pod:"
            kubectl describe pod $pod -n $NAMESPACE
            echo ""
        done
    else
        log_success "Todos os pods estão saudáveis!"
    fi
}

# Função para verificar recursos
check_resources() {
    log "Verificando recursos..."
    
    # Verificar uso de CPU e memória
    log "=== USO DE RECURSOS ==="
    kubectl top pods -n $NAMESPACE --containers
    
    # Verificar eventos recentes
    log "=== EVENTOS RECENTES ==="
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
    
    # Verificar status dos serviços
    log "=== STATUS DOS SERVIÇOS ==="
    kubectl get services -n $NAMESPACE
    
    # Verificar status dos ingress
    log "=== STATUS DOS INGRESS ==="
    kubectl get ingress -n $NAMESPACE
}

# Função para verificar conectividade
check_connectivity() {
    log "Verificando conectividade..."
    
    # Obter URL do ingress
    local ingress_url=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].spec.rules[0].host}')
    
    if [ -n "$ingress_url" ]; then
        # Testar health check
        if curl -f -k "https://$ingress_url/health" &> /dev/null; then
            log_success "Health check OK: https://$ingress_url/health"
        else
            log_warning "Health check falhou: https://$ingress_url/health"
        fi
        
        # Testar API
        if curl -f -k "https://$ingress_url/api/health" &> /dev/null; then
            log_success "API OK: https://$ingress_url/api/health"
        else
            log_warning "API falhou: https://$ingress_url/api/health"
        fi
    else
        log_warning "Ingress não encontrado"
    fi
}

# Função para verificar banco de dados
check_database() {
    log "Verificando banco de dados..."
    
    # Obter pod do PostgreSQL
    local postgres_pod=$(kubectl get pods -n $NAMESPACE -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$postgres_pod" ]; then
        # Verificar conexão
        if kubectl exec -n $NAMESPACE $postgres_pod -- pg_isready -U fenix_user -d fenix_nfe &> /dev/null; then
            log_success "Banco de dados conectado!"
        else
            log_warning "Banco de dados não conectado"
        fi
        
        # Verificar tamanho do banco
        local db_size=$(kubectl exec -n $NAMESPACE $postgres_pod -- psql -U fenix_user -d fenix_nfe -t -c "SELECT pg_size_pretty(pg_database_size('fenix_nfe'));" | tr -d ' ')
        log "Tamanho do banco: $db_size"
        
        # Verificar número de conexões
        local connections=$(kubectl exec -n $NAMESPACE $postgres_pod -- psql -U fenix_user -d fenix_nfe -t -c "SELECT count(*) FROM pg_stat_activity;" | tr -d ' ')
        log "Conexões ativas: $connections"
    else
        log_warning "Pod do PostgreSQL não encontrado"
    fi
}

# Função para verificar filas
check_queues() {
    log "Verificando filas..."
    
    # Obter pod do RabbitMQ
    local rabbitmq_pod=$(kubectl get pods -n $NAMESPACE -l app=rabbitmq -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$rabbitmq_pod" ]; then
        # Verificar status do RabbitMQ
        if kubectl exec -n $NAMESPACE $rabbitmq_pod -- rabbitmq-diagnostics ping &> /dev/null; then
            log_success "RabbitMQ conectado!"
        else
            log_warning "RabbitMQ não conectado"
        fi
        
        # Verificar filas
        kubectl exec -n $NAMESPACE $rabbitmq_pod -- rabbitmqctl list_queues name messages consumers
    else
        log_warning "Pod do RabbitMQ não encontrado"
    fi
}

# Função para verificar cache
check_cache() {
    log "Verificando cache..."
    
    # Obter pod do Redis
    local redis_pod=$(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$redis_pod" ]; then
        # Verificar conexão
        if kubectl exec -n $NAMESPACE $redis_pod -- redis-cli ping &> /dev/null; then
            log_success "Redis conectado!"
        else
            log_warning "Redis não conectado"
        fi
        
        # Verificar informações do Redis
        kubectl exec -n $NAMESPACE $redis_pod -- redis-cli info memory
    else
        log_warning "Pod do Redis não encontrado"
    fi
}

# Função para verificar monitoramento
check_monitoring() {
    log "Verificando monitoramento..."
    
    # Verificar Prometheus
    local prometheus_pod=$(kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$prometheus_pod" ]; then
        if kubectl exec -n monitoring $prometheus_pod -- wget -qO- http://localhost:9090/api/v1/query?query=up &> /dev/null; then
            log_success "Prometheus funcionando!"
        else
            log_warning "Prometheus não funcionando"
        fi
    else
        log_warning "Pod do Prometheus não encontrado"
    fi
    
    # Verificar Grafana
    local grafana_pod=$(kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$grafana_pod" ]; then
        if kubectl exec -n monitoring $grafana_pod -- wget -qO- http://localhost:3000/api/health &> /dev/null; then
            log_success "Grafana funcionando!"
        else
            log_warning "Grafana não funcionando"
        fi
    else
        log_warning "Pod do Grafana não encontrado"
    fi
}

# Função para otimizar performance
optimize_performance() {
    log "Otimizando performance..."
    
    # Reiniciar pods com alta utilização de memória
    local high_memory_pods=$(kubectl top pods -n $NAMESPACE --containers --sort-by=memory | tail -n +2 | awk '$3 > "1Gi" {print $1}')
    
    for pod in $high_memory_pods; do
        log "Reiniciando pod com alta utilização de memória: $pod"
        kubectl delete pod $pod -n $NAMESPACE
    done
    
    # Limpar cache do banco de dados
    local postgres_pod=$(kubectl get pods -n $NAMESPACE -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$postgres_pod" ]; then
        kubectl exec -n $NAMESPACE $postgres_pod -- psql -U fenix_user -d fenix_nfe -c "VACUUM ANALYZE;"
        log_success "Cache do banco de dados limpo!"
    fi
    
    # Limpar cache do Redis
    local redis_pod=$(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$redis_pod" ]; then
        kubectl exec -n $NAMESPACE $redis_pod -- redis-cli FLUSHDB
        log_success "Cache do Redis limpo!"
    fi
}

# Função para atualizar certificados
update_certificates() {
    log "Atualizando certificados..."
    
    # Verificar expiração dos certificados
    local cert_pod=$(kubectl get pods -n $NAMESPACE -l app=nfe-api -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$cert_pod" ]; then
        # Verificar certificados
        kubectl exec -n $NAMESPACE $cert_pod -- find /app/certificates -name "*.pfx" -exec openssl pkcs12 -in {} -noout -info \;
        
        log_success "Certificados verificados!"
    else
        log_warning "Pod da aplicação não encontrado"
    fi
}

# Função para backup de configurações
backup_configurations() {
    log "Fazendo backup das configurações..."
    
    local backup_dir="$PROJECT_DIR/backups/config-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup de ConfigMaps
    kubectl get configmaps -n $NAMESPACE -o yaml > "$backup_dir/configmaps.yaml"
    
    # Backup de Secrets
    kubectl get secrets -n $NAMESPACE -o yaml > "$backup_dir/secrets.yaml"
    
    # Backup de Deployments
    kubectl get deployments -n $NAMESPACE -o yaml > "$backup_dir/deployments.yaml"
    
    log_success "Configurações salvas em: $backup_dir"
}

# Função para mostrar relatório
show_report() {
    log "Gerando relatório de manutenção..."
    
    local report_file="$LOG_DIR/maintenance-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== RELATÓRIO DE MANUTENÇÃO ==="
        echo "Data: $(date)"
        echo "Namespace: $NAMESPACE"
        echo ""
        
        echo "=== PODS ==="
        kubectl get pods -n $NAMESPACE -o wide
        
        echo ""
        echo "=== RECURSOS ==="
        kubectl top pods -n $NAMESPACE --containers
        
        echo ""
        echo "=== EVENTOS ==="
        kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
        
        echo ""
        echo "=== SERVIÇOS ==="
        kubectl get services -n $NAMESPACE
        
        echo ""
        echo "=== INGRESS ==="
        kubectl get ingress -n $NAMESPACE
        
    } > "$report_file"
    
    log_success "Relatório salvo em: $report_file"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  cleanup     - Limpa recursos desnecessários"
    echo "  health      - Verifica saúde dos componentes"
    echo "  resources   - Verifica uso de recursos"
    echo "  connectivity - Verifica conectividade"
    echo "  database    - Verifica banco de dados"
    echo "  queues      - Verifica filas"
    echo "  cache       - Verifica cache"
    echo "  monitoring  - Verifica monitoramento"
    echo "  optimize    - Otimiza performance"
    echo "  certificates - Atualiza certificados"
    echo "  backup      - Backup de configurações"
    echo "  report      - Gera relatório"
    echo "  all         - Executa todos os comandos"
    echo "  help        - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 cleanup"
    echo "  $0 health"
    echo "  $0 all"
}

# Função principal
main() {
    case "${1:-help}" in
        "cleanup")
            check_dependencies
            cleanup_pods
            cleanup_logs
            cleanup_temp
            ;;
        "health")
            check_dependencies
            check_pod_health
            ;;
        "resources")
            check_dependencies
            check_resources
            ;;
        "connectivity")
            check_dependencies
            check_connectivity
            ;;
        "database")
            check_dependencies
            check_database
            ;;
        "queues")
            check_dependencies
            check_queues
            ;;
        "cache")
            check_dependencies
            check_cache
            ;;
        "monitoring")
            check_dependencies
            check_monitoring
            ;;
        "optimize")
            check_dependencies
            optimize_performance
            ;;
        "certificates")
            check_dependencies
            update_certificates
            ;;
        "backup")
            check_dependencies
            backup_configurations
            ;;
        "report")
            check_dependencies
            show_report
            ;;
        "all")
            check_dependencies
            cleanup_pods
            cleanup_logs
            cleanup_temp
            check_pod_health
            check_resources
            check_connectivity
            check_database
            check_queues
            check_cache
            check_monitoring
            optimize_performance
            update_certificates
            backup_configurations
            show_report
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
