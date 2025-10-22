#!/bin/bash

# Script de backup para Fenix NFe API
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
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="fenix-nfe-backup-$TIMESTAMP"
NAMESPACE="fenix-nfe"
RETENTION_DAYS=${RETENTION_DAYS:-30}

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
    
    # Verificar se namespace existe
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_error "Namespace $NAMESPACE não existe!"
        exit 1
    fi
    
    log_success "Dependências verificadas!"
}

# Função para criar diretório de backup
create_backup_dir() {
    log "Criando diretório de backup..."
    
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    log_success "Diretório de backup criado: $BACKUP_DIR/$BACKUP_NAME"
}

# Função para backup do banco de dados
backup_database() {
    log "Fazendo backup do banco de dados..."
    
    # Obter pod do PostgreSQL
    local postgres_pod=$(kubectl get pods -n $NAMESPACE -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$postgres_pod" ]; then
        # Fazer backup do banco
        kubectl exec -n $NAMESPACE $postgres_pod -- pg_dump -U fenix_user fenix_nfe > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
        log_success "Backup do banco de dados concluído!"
    else
        log_warning "Pod do PostgreSQL não encontrado"
    fi
}

# Função para backup dos volumes persistentes
backup_volumes() {
    log "Fazendo backup dos volumes persistentes..."
    
    # Listar PVCs
    local pvcs=$(kubectl get pvc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}')
    
    for pvc in $pvcs; do
        log "Fazendo backup do PVC: $pvc"
        
        # Obter pod que está usando o PVC
        local pod=$(kubectl get pods -n $NAMESPACE -o jsonpath="{.items[?(@.spec.volumes[?(@.persistentVolumeClaim.claimName=='$pvc')])].metadata.name}")
        
        if [ -n "$pod" ]; then
            # Criar diretório para o PVC
            mkdir -p "$BACKUP_DIR/$BACKUP_NAME/volumes/$pvc"
            
            # Fazer backup do conteúdo do PVC
            kubectl exec -n $NAMESPACE $pod -- tar czf - -C /app . > "$BACKUP_DIR/$BACKUP_NAME/volumes/$pvc/backup.tar.gz"
            log_success "Backup do PVC $pvc concluído!"
        else
            log_warning "Pod usando PVC $pvc não encontrado"
        fi
    done
}

# Função para backup das configurações
backup_configurations() {
    log "Fazendo backup das configurações..."
    
    # Backup de ConfigMaps
    kubectl get configmaps -n $NAMESPACE -o yaml > "$BACKUP_DIR/$BACKUP_NAME/configmaps.yaml"
    
    # Backup de Secrets
    kubectl get secrets -n $NAMESPACE -o yaml > "$BACKUP_DIR/$BACKUP_NAME/secrets.yaml"
    
    # Backup de Deployments
    kubectl get deployments -n $NAMESPACE -o yaml > "$BACKUP_DIR/$BACKUP_NAME/deployments.yaml"
    
    # Backup de Services
    kubectl get services -n $NAMESPACE -o yaml > "$BACKUP_DIR/$BACKUP_NAME/services.yaml"
    
    # Backup de Ingress
    kubectl get ingress -n $NAMESPACE -o yaml > "$BACKUP_DIR/$BACKUP_NAME/ingress.yaml"
    
    # Backup de HPA
    kubectl get hpa -n $NAMESPACE -o yaml > "$BACKUP_DIR/$BACKUP_NAME/hpa.yaml"
    
    # Backup de PVCs
    kubectl get pvc -n $NAMESPACE -o yaml > "$BACKUP_DIR/$BACKUP_NAME/pvcs.yaml"
    
    log_success "Backup das configurações concluído!"
}

# Função para backup dos logs
backup_logs() {
    log "Fazendo backup dos logs..."
    
    # Obter pods da aplicação
    local pods=$(kubectl get pods -n $NAMESPACE -l app=nfe-api -o jsonpath='{.items[*].metadata.name}')
    
    for pod in $pods; do
        log "Fazendo backup dos logs do pod: $pod"
        
        # Criar diretório para o pod
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/logs/$pod"
        
        # Fazer backup dos logs
        kubectl logs -n $NAMESPACE $pod > "$BACKUP_DIR/$BACKUP_NAME/logs/$pod/application.log"
        
        # Fazer backup dos logs anteriores se existirem
        kubectl logs -n $NAMESPACE $pod --previous > "$BACKUP_DIR/$BACKUP_NAME/logs/$pod/application-previous.log" 2>/dev/null || true
        
        log_success "Backup dos logs do pod $pod concluído!"
    done
}

# Função para backup dos certificados
backup_certificates() {
    log "Fazendo backup dos certificados..."
    
    # Obter pod da aplicação
    local pod=$(kubectl get pods -n $NAMESPACE -l app=nfe-api -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$pod" ]; then
        # Criar diretório para certificados
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/certificates"
        
        # Fazer backup dos certificados
        kubectl exec -n $NAMESPACE $pod -- tar czf - -C /app/certificates . > "$BACKUP_DIR/$BACKUP_NAME/certificates/backup.tar.gz"
        log_success "Backup dos certificados concluído!"
    else
        log_warning "Pod da aplicação não encontrado"
    fi
}

# Função para backup dos dados de monitoramento
backup_monitoring() {
    log "Fazendo backup dos dados de monitoramento..."
    
    # Backup do Prometheus
    local prometheus_pod=$(kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$prometheus_pod" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/monitoring/prometheus"
        kubectl exec -n monitoring $prometheus_pod -- tar czf - -C /prometheus . > "$BACKUP_DIR/$BACKUP_NAME/monitoring/prometheus/backup.tar.gz"
        log_success "Backup do Prometheus concluído!"
    fi
    
    # Backup do Grafana
    local grafana_pod=$(kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$grafana_pod" ]; then
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/monitoring/grafana"
        kubectl exec -n monitoring $grafana_pod -- tar czf - -C /var/lib/grafana . > "$BACKUP_DIR/$BACKUP_NAME/monitoring/grafana/backup.tar.gz"
        log_success "Backup do Grafana concluído!"
    fi
}

# Função para criar arquivo de metadados
create_metadata() {
    log "Criando arquivo de metadados..."
    
    cat > "$BACKUP_DIR/$BACKUP_NAME/metadata.json" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "namespace": "$NAMESPACE",
  "cluster": "$(kubectl config current-context)",
  "version": "$(kubectl version --client -o json | jq -r '.clientVersion.gitVersion')",
  "components": {
    "database": true,
    "volumes": true,
    "configurations": true,
    "logs": true,
    "certificates": true,
    "monitoring": true
  },
  "retention_days": $RETENTION_DAYS
}
EOF
    
    log_success "Arquivo de metadados criado!"
}

# Função para comprimir backup
compress_backup() {
    log "Comprimindo backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    log_success "Backup comprimido: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
}

# Função para upload para storage
upload_backup() {
    log "Fazendo upload do backup..."
    
    local backup_file="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
    
    # Upload para AWS S3
    if [ -n "$AWS_S3_BUCKET" ]; then
        log "Uploading para AWS S3..."
        aws s3 cp "$backup_file" "s3://$AWS_S3_BUCKET/backups/"
        log_success "Upload para AWS S3 concluído!"
    fi
    
    # Upload para Google Cloud Storage
    if [ -n "$GCS_BUCKET" ]; then
        log "Uploading para Google Cloud Storage..."
        gsutil cp "$backup_file" "gs://$GCS_BUCKET/backups/"
        log_success "Upload para Google Cloud Storage concluído!"
    fi
    
    # Upload para Azure Blob Storage
    if [ -n "$AZURE_STORAGE_ACCOUNT" ]; then
        log "Uploading para Azure Blob Storage..."
        az storage blob upload --account-name "$AZURE_STORAGE_ACCOUNT" --container-name backups --file "$backup_file" --name "$BACKUP_NAME.tar.gz"
        log_success "Upload para Azure Blob Storage concluído!"
    fi
}

# Função para limpeza de backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos..."
    
    # Limpar backups locais
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    # Limpar backups no S3
    if [ -n "$AWS_S3_BUCKET" ]; then
        aws s3 ls "s3://$AWS_S3_BUCKET/backups/" | while read -r line; do
            create_date=$(echo $line | awk '{print $1" "$2}')
            create_date_epoch=$(date -d "$create_date" +%s)
            older_than_epoch=$(date -d "$RETENTION_DAYS days ago" +%s)
            if [ $create_date_epoch -lt $older_than_epoch ]; then
                file_name=$(echo $line | awk '{print $4}')
                aws s3 rm "s3://$AWS_S3_BUCKET/backups/$file_name"
            fi
        done
    fi
    
    log_success "Limpeza de backups antigos concluída!"
}

# Função para verificar integridade do backup
verify_backup() {
    log "Verificando integridade do backup..."
    
    local backup_file="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
    
    if [ -f "$backup_file" ]; then
        # Verificar se o arquivo não está corrompido
        if tar -tzf "$backup_file" > /dev/null 2>&1; then
            log_success "Backup verificado com sucesso!"
        else
            log_error "Backup corrompido!"
            exit 1
        fi
    else
        log_error "Arquivo de backup não encontrado!"
        exit 1
    fi
}

# Função para mostrar status
show_status() {
    log "Status dos backups:"
    
    echo ""
    log "=== BACKUPS LOCAIS ==="
    ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "Nenhum backup local encontrado"
    
    echo ""
    log "=== BACKUPS NO S3 ==="
    if [ -n "$AWS_S3_BUCKET" ]; then
        aws s3 ls "s3://$AWS_S3_BUCKET/backups/" 2>/dev/null || echo "Nenhum backup no S3 encontrado"
    else
        echo "S3 não configurado"
    fi
    
    echo ""
    log "=== ESPAÇO EM DISCO ==="
    df -h "$BACKUP_DIR"
}

# Função para restaurar backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log_error "Arquivo de backup não especificado!"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    log "Restaurando backup: $backup_file"
    
    # Extrair backup
    local restore_dir="$BACKUP_DIR/restore-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$restore_dir"
    tar -xzf "$backup_file" -C "$restore_dir"
    
    # Restaurar configurações
    kubectl apply -f "$restore_dir"/*/configmaps.yaml -n $NAMESPACE
    kubectl apply -f "$restore_dir"/*/secrets.yaml -n $NAMESPACE
    kubectl apply -f "$restore_dir"/*/deployments.yaml -n $NAMESPACE
    kubectl apply -f "$restore_dir"/*/services.yaml -n $NAMESPACE
    kubectl apply -f "$restore_dir"/*/ingress.yaml -n $NAMESPACE
    kubectl apply -f "$restore_dir"/*/hpa.yaml -n $NAMESPACE
    kubectl apply -f "$restore_dir"/*/pvcs.yaml -n $NAMESPACE
    
    # Restaurar banco de dados
    local postgres_pod=$(kubectl get pods -n $NAMESPACE -l app=postgresql -o jsonpath='{.items[0].metadata.name}')
    if [ -n "$postgres_pod" ]; then
        kubectl exec -n $NAMESPACE $postgres_pod -- psql -U fenix_user -d fenix_nfe -f /tmp/restore.sql < "$restore_dir"/*/database.sql
    fi
    
    log_success "Backup restaurado com sucesso!"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO] [ARQUIVO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  backup      - Executa backup completo"
    echo "  restore     - Restaura backup (especificar arquivo)"
    echo "  status      - Mostra status dos backups"
    echo "  cleanup     - Limpa backups antigos"
    echo "  verify      - Verifica integridade do backup"
    echo "  help        - Mostra esta ajuda"
    echo ""
    echo "Variáveis de ambiente:"
    echo "  RETENTION_DAYS - Dias para manter backups (padrão: 30)"
    echo "  AWS_S3_BUCKET - Bucket S3 para upload"
    echo "  GCS_BUCKET - Bucket Google Cloud Storage"
    echo "  AZURE_STORAGE_ACCOUNT - Conta Azure Storage"
    echo ""
    echo "Exemplos:"
    echo "  $0 backup"
    echo "  $0 restore /path/to/backup.tar.gz"
    echo "  $0 status"
}

# Função principal
main() {
    case "${1:-backup}" in
        "backup")
            check_dependencies
            create_backup_dir
            backup_database
            backup_volumes
            backup_configurations
            backup_logs
            backup_certificates
            backup_monitoring
            create_metadata
            compress_backup
            upload_backup
            verify_backup
            cleanup_old_backups
            log_success "Backup completo concluído!"
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "verify")
            verify_backup
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
