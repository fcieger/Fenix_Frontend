#!/bin/bash

# Script de deploy para Kubernetes
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
K8S_DIR="$PROJECT_DIR/k8s"
HELM_DIR="$PROJECT_DIR/helm/fenix-nfe-api"
NAMESPACE="fenix-nfe"
RELEASE_NAME="fenix-nfe-api"
ENVIRONMENT="${ENVIRONMENT:-production}"

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

# Função para criar namespace
create_namespace() {
    log "Criando namespace $NAMESPACE..."
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        log_warning "Namespace $NAMESPACE já existe"
    else
        kubectl apply -f "$K8S_DIR/namespace.yaml"
        log_success "Namespace $NAMESPACE criado!"
    fi
}

# Função para aplicar secrets
apply_secrets() {
    log "Aplicando secrets..."
    
    if [ -f "$K8S_DIR/secrets.yaml" ]; then
        kubectl apply -f "$K8S_DIR/secrets.yaml" -n $NAMESPACE
        log_success "Secrets aplicados!"
    else
        log_warning "Arquivo secrets.yaml não encontrado"
    fi
}

# Função para aplicar configmaps
apply_configmaps() {
    log "Aplicando configmaps..."
    
    if [ -f "$K8S_DIR/configmap.yaml" ]; then
        kubectl apply -f "$K8S_DIR/configmap.yaml" -n $NAMESPACE
        log_success "ConfigMaps aplicados!"
    else
        log_warning "Arquivo configmap.yaml não encontrado"
    fi
}

# Função para aplicar RBAC
apply_rbac() {
    log "Aplicando RBAC..."
    
    if [ -f "$K8S_DIR/rbac.yaml" ]; then
        kubectl apply -f "$K8S_DIR/rbac.yaml" -n $NAMESPACE
        log_success "RBAC aplicado!"
    else
        log_warning "Arquivo rbac.yaml não encontrado"
    fi
}

# Função para aplicar deployment
apply_deployment() {
    log "Aplicando deployment..."
    
    if [ -f "$K8S_DIR/deployment.yaml" ]; then
        kubectl apply -f "$K8S_DIR/deployment.yaml" -n $NAMESPACE
        log_success "Deployment aplicado!"
    else
        log_warning "Arquivo deployment.yaml não encontrado"
    fi
}

# Função para aplicar ingress
apply_ingress() {
    log "Aplicando ingress..."
    
    if [ -f "$K8S_DIR/ingress.yaml" ]; then
        kubectl apply -f "$K8S_DIR/ingress.yaml" -n $NAMESPACE
        log_success "Ingress aplicado!"
    else
        log_warning "Arquivo ingress.yaml não encontrado"
    fi
}

# Função para aplicar HPA
apply_hpa() {
    log "Aplicando HPA..."
    
    if [ -f "$K8S_DIR/hpa.yaml" ]; then
        kubectl apply -f "$K8S_DIR/hpa.yaml" -n $NAMESPACE
        log_success "HPA aplicado!"
    else
        log_warning "Arquivo hpa.yaml não encontrado"
    fi
}

# Função para deploy com Helm
deploy_with_helm() {
    log "Fazendo deploy com Helm..."
    
    if [ ! -d "$HELM_DIR" ]; then
        log_error "Diretório Helm não encontrado: $HELM_DIR"
        exit 1
    fi
    
    # Atualizar dependências
    helm dependency update "$HELM_DIR"
    
    # Deploy ou upgrade
    if helm list -n $NAMESPACE | grep -q $RELEASE_NAME; then
        log "Upgrading release $RELEASE_NAME..."
        helm upgrade $RELEASE_NAME "$HELM_DIR" \
            --namespace $NAMESPACE \
            --values "$HELM_DIR/values.yaml" \
            --wait \
            --timeout=10m
    else
        log "Installing release $RELEASE_NAME..."
        helm install $RELEASE_NAME "$HELM_DIR" \
            --namespace $NAMESPACE \
            --values "$HELM_DIR/values.yaml" \
            --wait \
            --timeout=10m
    fi
    
    log_success "Deploy com Helm concluído!"
}

# Função para verificar status
check_status() {
    log "Verificando status do deploy..."
    
    # Verificar pods
    log "Pods:"
    kubectl get pods -n $NAMESPACE -l app=nfe-api
    
    # Verificar services
    log "Services:"
    kubectl get services -n $NAMESPACE
    
    # Verificar ingress
    log "Ingress:"
    kubectl get ingress -n $NAMESPACE
    
    # Verificar HPA
    log "HPA:"
    kubectl get hpa -n $NAMESPACE
    
    # Verificar logs
    log "Logs recentes:"
    kubectl logs -n $NAMESPACE -l app=nfe-api --tail=10
}

# Função para aguardar pods ficarem prontos
wait_for_pods() {
    log "Aguardando pods ficarem prontos..."
    
    kubectl wait --for=condition=ready pod -l app=nfe-api -n $NAMESPACE --timeout=300s
    
    log_success "Pods estão prontos!"
}

# Função para testar aplicação
test_application() {
    log "Testando aplicação..."
    
    # Obter URL do ingress
    local ingress_url=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].spec.rules[0].host}')
    
    if [ -n "$ingress_url" ]; then
        log "Testando health check em https://$ingress_url/health"
        
        # Aguardar ingress ficar disponível
        sleep 30
        
        if curl -f -k "https://$ingress_url/health" &> /dev/null; then
            log_success "Aplicação está respondendo!"
        else
            log_warning "Aplicação pode não estar respondendo ainda"
        fi
    else
        log_warning "Ingress não encontrado"
    fi
}

# Função para rollback
rollback() {
    log "Executando rollback..."
    
    if helm list -n $NAMESPACE | grep -q $RELEASE_NAME; then
        local current_revision=$(helm list -n $NAMESPACE -o json | jq -r '.[0].revision')
        local previous_revision=$((current_revision - 1))
        
        if [ $previous_revision -gt 0 ]; then
            helm rollback $RELEASE_NAME $previous_revision -n $NAMESPACE
            log_success "Rollback para revisão $previous_revision concluído!"
        else
            log_error "Não há revisão anterior para rollback"
        fi
    else
        log_error "Release não encontrado para rollback"
    fi
}

# Função para mostrar logs
show_logs() {
    local lines=${1:-100}
    
    log "Mostrando logs (últimas $lines linhas):"
    kubectl logs -n $NAMESPACE -l app=nfe-api --tail=$lines -f
}

# Função para mostrar status detalhado
show_status() {
    log "Status detalhado:"
    
    echo ""
    log "=== PODS ==="
    kubectl get pods -n $NAMESPACE -l app=nfe-api -o wide
    
    echo ""
    log "=== SERVICES ==="
    kubectl get services -n $NAMESPACE
    
    echo ""
    log "=== INGRESS ==="
    kubectl get ingress -n $NAMESPACE
    
    echo ""
    log "=== HPA ==="
    kubectl get hpa -n $NAMESPACE
    
    echo ""
    log "=== EVENTS ==="
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  deploy     - Executa deploy completo"
    echo "  helm       - Deploy apenas com Helm"
    echo "  kubectl    - Deploy apenas com kubectl"
    echo "  status     - Mostra status dos recursos"
    echo "  logs       - Mostra logs da aplicação"
    echo "  test       - Testa a aplicação"
    echo "  rollback   - Executa rollback"
    echo "  cleanup    - Remove todos os recursos"
    echo "  help       - Mostra esta ajuda"
    echo ""
    echo "Variáveis de ambiente:"
    echo "  ENVIRONMENT - Ambiente (production, staging, development)"
    echo "  NAMESPACE   - Namespace do Kubernetes"
    echo "  RELEASE_NAME - Nome do release Helm"
    echo ""
    echo "Exemplos:"
    echo "  $0 deploy"
    echo "  $0 helm"
    echo "  $0 status"
    echo "  $0 logs 200"
}

# Função para cleanup
cleanup() {
    log "Removendo todos os recursos..."
    
    # Remover Helm release
    if helm list -n $NAMESPACE | grep -q $RELEASE_NAME; then
        helm uninstall $RELEASE_NAME -n $NAMESPACE
        log_success "Helm release removido!"
    fi
    
    # Remover recursos kubectl
    kubectl delete -f "$K8S_DIR/" --ignore-not-found=true -n $NAMESPACE
    
    # Remover namespace
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    
    log_success "Cleanup concluído!"
}

# Função principal
main() {
    case "${1:-deploy}" in
        "deploy")
            check_dependencies
            create_namespace
            apply_secrets
            apply_configmaps
            apply_rbac
            apply_deployment
            apply_ingress
            apply_hpa
            wait_for_pods
            check_status
            test_application
            ;;
        "helm")
            check_dependencies
            create_namespace
            deploy_with_helm
            wait_for_pods
            check_status
            test_application
            ;;
        "kubectl")
            check_dependencies
            create_namespace
            apply_secrets
            apply_configmaps
            apply_rbac
            apply_deployment
            apply_ingress
            apply_hpa
            wait_for_pods
            check_status
            test_application
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "test")
            test_application
            ;;
        "rollback")
            rollback
            ;;
        "cleanup")
            cleanup
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
