#!/bin/bash

# Script de setup de monitoramento
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
MONITORING_DIR="$PROJECT_DIR/monitoring"
NAMESPACE="fenix-nfe"
PROMETHEUS_NAMESPACE="monitoring"
GRAFANA_NAMESPACE="monitoring"

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
    
    # Verificar helm
    if ! command -v helm &> /dev/null; then
        log_error "Helm não está instalado!"
        exit 1
    fi
    
    # Verificar conexão com cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Não é possível conectar ao cluster Kubernetes!"
        exit 1
    fi
    
    log_success "Dependências verificadas!"
}

# Função para criar namespaces
create_namespaces() {
    log "Criando namespaces de monitoramento..."
    
    # Namespace para Prometheus
    if ! kubectl get namespace $PROMETHEUS_NAMESPACE &> /dev/null; then
        kubectl create namespace $PROMETHEUS_NAMESPACE
        log_success "Namespace $PROMETHEUS_NAMESPACE criado!"
    else
        log_warning "Namespace $PROMETHEUS_NAMESPACE já existe"
    fi
    
    # Namespace para Grafana
    if ! kubectl get namespace $GRAFANA_NAMESPACE &> /dev/null; then
        kubectl create namespace $GRAFANA_NAMESPACE
        log_success "Namespace $GRAFANA_NAMESPACE criado!"
    else
        log_warning "Namespace $GRAFANA_NAMESPACE já existe"
    fi
}

# Função para instalar Prometheus
install_prometheus() {
    log "Instalando Prometheus..."
    
    # Adicionar repositório Helm
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Instalar Prometheus
    helm upgrade --install prometheus prometheus-community/prometheus \
        --namespace $PROMETHEUS_NAMESPACE \
        --values "$MONITORING_DIR/prometheus/values.yaml" \
        --wait \
        --timeout=10m
    
    log_success "Prometheus instalado!"
}

# Função para instalar Grafana
install_grafana() {
    log "Instalando Grafana..."
    
    # Adicionar repositório Helm
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    
    # Instalar Grafana
    helm upgrade --install grafana grafana/grafana \
        --namespace $GRAFANA_NAMESPACE \
        --values "$MONITORING_DIR/grafana/values.yaml" \
        --wait \
        --timeout=10m
    
    log_success "Grafana instalado!"
}

# Função para instalar AlertManager
install_alertmanager() {
    log "Instalando AlertManager..."
    
    # Adicionar repositório Helm
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Instalar AlertManager
    helm upgrade --install alertmanager prometheus-community/alertmanager \
        --namespace $PROMETHEUS_NAMESPACE \
        --values "$MONITORING_DIR/alertmanager/values.yaml" \
        --wait \
        --timeout=10m
    
    log_success "AlertManager instalado!"
}

# Função para instalar Jaeger
install_jaeger() {
    log "Instalando Jaeger..."
    
    # Adicionar repositório Helm
    helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
    helm repo update
    
    # Instalar Jaeger
    helm upgrade --install jaeger jaegertracing/jaeger \
        --namespace $PROMETHEUS_NAMESPACE \
        --values "$MONITORING_DIR/jaeger/values.yaml" \
        --wait \
        --timeout=10m
    
    log_success "Jaeger instalado!"
}

# Função para instalar Elasticsearch
install_elasticsearch() {
    log "Instalando Elasticsearch..."
    
    # Adicionar repositório Helm
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    # Instalar Elasticsearch
    helm upgrade --install elasticsearch elastic/elasticsearch \
        --namespace $PROMETHEUS_NAMESPACE \
        --values "$MONITORING_DIR/elasticsearch/values.yaml" \
        --wait \
        --timeout=10m
    
    log_success "Elasticsearch instalado!"
}

# Função para instalar Kibana
install_kibana() {
    log "Instalando Kibana..."
    
    # Adicionar repositório Helm
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    # Instalar Kibana
    helm upgrade --install kibana elastic/kibana \
        --namespace $PROMETHEUS_NAMESPACE \
        --values "$MONITORING_DIR/kibana/values.yaml" \
        --wait \
        --timeout=10m
    
    log_success "Kibana instalado!"
}

# Função para configurar dashboards
configure_dashboards() {
    log "Configurando dashboards..."
    
    # Aplicar ConfigMaps dos dashboards
    kubectl apply -f "$MONITORING_DIR/grafana/dashboards/" -n $GRAFANA_NAMESPACE
    
    # Aplicar datasources
    kubectl apply -f "$MONITORING_DIR/grafana/datasources/" -n $GRAFANA_NAMESPACE
    
    log_success "Dashboards configurados!"
}

# Função para configurar alertas
configure_alerts() {
    log "Configurando alertas..."
    
    # Aplicar regras de alerta
    kubectl apply -f "$MONITORING_DIR/prometheus/rules/" -n $PROMETHEUS_NAMESPACE
    
    # Aplicar configuração do AlertManager
    kubectl apply -f "$MONITORING_DIR/alertmanager/" -n $PROMETHEUS_NAMESPACE
    
    log_success "Alertas configurados!"
}

# Função para verificar status
check_status() {
    log "Verificando status do monitoramento..."
    
    # Verificar Prometheus
    log "=== PROMETHEUS ==="
    kubectl get pods -n $PROMETHEUS_NAMESPACE -l app.kubernetes.io/name=prometheus
    
    # Verificar Grafana
    log "=== GRAFANA ==="
    kubectl get pods -n $GRAFANA_NAMESPACE -l app.kubernetes.io/name=grafana
    
    # Verificar AlertManager
    log "=== ALERTMANAGER ==="
    kubectl get pods -n $PROMETHEUS_NAMESPACE -l app.kubernetes.io/name=alertmanager
    
    # Verificar Jaeger
    log "=== JAEGER ==="
    kubectl get pods -n $PROMETHEUS_NAMESPACE -l app.kubernetes.io/name=jaeger
    
    # Verificar Elasticsearch
    log "=== ELASTICSEARCH ==="
    kubectl get pods -n $PROMETHEUS_NAMESPACE -l app=elasticsearch
    
    # Verificar Kibana
    log "=== KIBANA ==="
    kubectl get pods -n $PROMETHEUS_NAMESPACE -l app=kibana
}

# Função para mostrar URLs
show_urls() {
    log "URLs de monitoramento:"
    
    # Obter URLs dos serviços
    local prometheus_url=$(kubectl get service -n $PROMETHEUS_NAMESPACE -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[0].spec.clusterIP}')
    local grafana_url=$(kubectl get service -n $GRAFANA_NAMESPACE -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].spec.clusterIP}')
    local alertmanager_url=$(kubectl get service -n $PROMETHEUS_NAMESPACE -l app.kubernetes.io/name=alertmanager -o jsonpath='{.items[0].spec.clusterIP}')
    local jaeger_url=$(kubectl get service -n $PROMETHEUS_NAMESPACE -l app.kubernetes.io/name=jaeger -o jsonpath='{.items[0].spec.clusterIP}')
    local kibana_url=$(kubectl get service -n $PROMETHEUS_NAMESPACE -l app=kibana -o jsonpath='{.items[0].spec.clusterIP}')
    
    echo ""
    log "Prometheus: http://$prometheus_url:9090"
    log "Grafana: http://$grafana_url:3000"
    log "AlertManager: http://$alertmanager_url:9093"
    log "Jaeger: http://$jaeger_url:16686"
    log "Kibana: http://$kibana_url:5601"
    
    echo ""
    log "Para acessar externamente, use port-forward:"
    log "kubectl port-forward -n $PROMETHEUS_NAMESPACE service/prometheus-server 9090:80"
    log "kubectl port-forward -n $GRAFANA_NAMESPACE service/grafana 3000:80"
    log "kubectl port-forward -n $PROMETHEUS_NAMESPACE service/alertmanager 9093:80"
    log "kubectl port-forward -n $PROMETHEUS_NAMESPACE service/jaeger 16686:80"
    log "kubectl port-forward -n $PROMETHEUS_NAMESPACE service/kibana 5601:80"
}

# Função para testar monitoramento
test_monitoring() {
    log "Testando monitoramento..."
    
    # Testar Prometheus
    local prometheus_pod=$(kubectl get pods -n $PROMETHEUS_NAMESPACE -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[0].metadata.name}')
    if kubectl exec -n $PROMETHEUS_NAMESPACE $prometheus_pod -- wget -qO- http://localhost:9090/api/v1/query?query=up &> /dev/null; then
        log_success "Prometheus está funcionando!"
    else
        log_warning "Prometheus pode não estar funcionando"
    fi
    
    # Testar Grafana
    local grafana_pod=$(kubectl get pods -n $GRAFANA_NAMESPACE -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}')
    if kubectl exec -n $GRAFANA_NAMESPACE $grafana_pod -- wget -qO- http://localhost:3000/api/health &> /dev/null; then
        log_success "Grafana está funcionando!"
    else
        log_warning "Grafana pode não estar funcionando"
    fi
}

# Função para limpar monitoramento
cleanup_monitoring() {
    log "Removendo monitoramento..."
    
    # Remover Helm releases
    helm uninstall prometheus -n $PROMETHEUS_NAMESPACE --ignore-not-found
    helm uninstall grafana -n $GRAFANA_NAMESPACE --ignore-not-found
    helm uninstall alertmanager -n $PROMETHEUS_NAMESPACE --ignore-not-found
    helm uninstall jaeger -n $PROMETHEUS_NAMESPACE --ignore-not-found
    helm uninstall elasticsearch -n $PROMETHEUS_NAMESPACE --ignore-not-found
    helm uninstall kibana -n $PROMETHEUS_NAMESPACE --ignore-not-found
    
    # Remover namespaces
    kubectl delete namespace $PROMETHEUS_NAMESPACE --ignore-not-found
    kubectl delete namespace $GRAFANA_NAMESPACE --ignore-not-found
    
    log_success "Monitoramento removido!"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  setup       - Instala todo o stack de monitoramento"
    echo "  prometheus  - Instala apenas Prometheus"
    echo "  grafana     - Instala apenas Grafana"
    echo "  alertmanager - Instala apenas AlertManager"
    echo "  jaeger      - Instala apenas Jaeger"
    echo "  elasticsearch - Instala apenas Elasticsearch"
    echo "  kibana      - Instala apenas Kibana"
    echo "  status      - Mostra status dos componentes"
    echo "  urls        - Mostra URLs de acesso"
    echo "  test        - Testa os componentes"
    echo "  cleanup     - Remove todo o monitoramento"
    echo "  help        - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 setup"
    echo "  $0 prometheus"
    echo "  $0 status"
}

# Função principal
main() {
    case "${1:-setup}" in
        "setup")
            check_dependencies
            create_namespaces
            install_prometheus
            install_grafana
            install_alertmanager
            install_jaeger
            install_elasticsearch
            install_kibana
            configure_dashboards
            configure_alerts
            check_status
            show_urls
            test_monitoring
            ;;
        "prometheus")
            check_dependencies
            create_namespaces
            install_prometheus
            check_status
            ;;
        "grafana")
            check_dependencies
            create_namespaces
            install_grafana
            configure_dashboards
            check_status
            ;;
        "alertmanager")
            check_dependencies
            create_namespaces
            install_alertmanager
            configure_alerts
            check_status
            ;;
        "jaeger")
            check_dependencies
            create_namespaces
            install_jaeger
            check_status
            ;;
        "elasticsearch")
            check_dependencies
            create_namespaces
            install_elasticsearch
            check_status
            ;;
        "kibana")
            check_dependencies
            create_namespaces
            install_kibana
            check_status
            ;;
        "status")
            check_status
            ;;
        "urls")
            show_urls
            ;;
        "test")
            test_monitoring
            ;;
        "cleanup")
            cleanup_monitoring
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
