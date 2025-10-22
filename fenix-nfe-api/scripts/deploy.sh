#!/bin/bash

# Script de deploy para produção
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
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env.prod"

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
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado!"
        exit 1
    fi
    
    # Verificar se o arquivo .env.prod existe
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Arquivo .env.prod não encontrado!"
        log "Crie o arquivo .env.prod com as variáveis necessárias."
        exit 1
    fi
    
    log_success "Dependências verificadas!"
}

# Função para carregar variáveis de ambiente
load_env() {
    log "Carregando variáveis de ambiente..."
    
    if [ -f "$ENV_FILE" ]; then
        export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
        log_success "Variáveis de ambiente carregadas!"
    else
        log_error "Arquivo .env.prod não encontrado!"
        exit 1
    fi
}

# Função para backup
backup() {
    log "Criando backup..."
    
    local backup_dir="$PROJECT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup do banco de dados
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps postgres | grep -q "Up"; then
        log "Fazendo backup do PostgreSQL..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_dump -U fenix_user fenix_nfe > "$backup_dir/postgres_backup.sql"
    fi
    
    # Backup dos volumes
    log "Fazendo backup dos volumes..."
    docker run --rm -v fenix-nfe-api_postgres_data:/data -v "$backup_dir":/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
    docker run --rm -v fenix-nfe-api_rabbitmq_data:/data -v "$backup_dir":/backup alpine tar czf /backup/rabbitmq_data.tar.gz -C /data .
    docker run --rm -v fenix-nfe-api_redis_data:/data -v "$backup_dir":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
    
    log_success "Backup criado em: $backup_dir"
}

# Função para build da aplicação
build_app() {
    log "Fazendo build da aplicação..."
    
    cd "$PROJECT_DIR"
    
    # Build com Maven
    log "Executando Maven build..."
    ./mvnw clean package -DskipTests -Pproduction
    
    # Build da imagem Docker
    log "Construindo imagem Docker..."
    docker build -f docker/Dockerfile.optimized -t fenix-nfe-api:latest .
    
    log_success "Build concluído!"
}

# Função para deploy
deploy() {
    log "Iniciando deploy..."
    
    # Parar serviços existentes
    log "Parando serviços existentes..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
    
    # Remover imagens antigas
    log "Removendo imagens antigas..."
    docker image prune -f
    
    # Subir serviços
    log "Subindo serviços..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Aguardar serviços ficarem prontos
    log "Aguardando serviços ficarem prontos..."
    sleep 30
    
    # Verificar saúde dos serviços
    check_health
    
    log_success "Deploy concluído!"
}

# Função para verificar saúde dos serviços
check_health() {
    log "Verificando saúde dos serviços..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Tentativa $attempt/$max_attempts - Verificando saúde..."
        
        # Verificar NFe API
        if curl -f http://localhost:8081/actuator/health >/dev/null 2>&1; then
            log_success "NFe API está saudável!"
        else
            log_warning "NFe API ainda não está pronta..."
        fi
        
        # Verificar PostgreSQL
        if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U fenix_user >/dev/null 2>&1; then
            log_success "PostgreSQL está saudável!"
        else
            log_warning "PostgreSQL ainda não está pronto..."
        fi
        
        # Verificar RabbitMQ
        if curl -f http://localhost:15672/api/overview >/dev/null 2>&1; then
            log_success "RabbitMQ está saudável!"
        else
            log_warning "RabbitMQ ainda não está pronto..."
        fi
        
        # Verificar Redis
        if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping >/dev/null 2>&1; then
            log_success "Redis está saudável!"
        else
            log_warning "Redis ainda não está pronto..."
        fi
        
        # Se todos os serviços estão prontos, sair do loop
        if curl -f http://localhost:8081/actuator/health >/dev/null 2>&1 && \
           docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U fenix_user >/dev/null 2>&1 && \
           curl -f http://localhost:15672/api/overview >/dev/null 2>&1 && \
           docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping >/dev/null 2>&1; then
            log_success "Todos os serviços estão saudáveis!"
            return 0
        fi
        
        sleep 10
        attempt=$((attempt + 1))
    done
    
    log_error "Alguns serviços não ficaram saudáveis após $max_attempts tentativas!"
    return 1
}

# Função para rollback
rollback() {
    log "Executando rollback..."
    
    # Parar serviços
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Restaurar backup mais recente
    local latest_backup=$(ls -t "$PROJECT_DIR/backups" | head -n1)
    if [ -n "$latest_backup" ]; then
        log "Restaurando backup: $latest_backup"
        # Implementar restauração do backup
    fi
    
    # Subir serviços
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    log_success "Rollback concluído!"
}

# Função para mostrar status
show_status() {
    log "Status dos serviços:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    echo ""
    log "Logs da aplicação:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50 fenix-nfe-api
}

# Função para mostrar logs
show_logs() {
    local service=${1:-fenix-nfe-api}
    local lines=${2:-100}
    
    log "Mostrando logs do serviço: $service"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=$lines $service
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  deploy     - Executa deploy completo"
    echo "  build      - Apenas build da aplicação"
    echo "  backup     - Cria backup dos dados"
    echo "  rollback   - Executa rollback"
    echo "  status     - Mostra status dos serviços"
    echo "  logs       - Mostra logs da aplicação"
    echo "  health     - Verifica saúde dos serviços"
    echo "  help       - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 deploy"
    echo "  $0 logs fenix-nfe-api 200"
    echo "  $0 status"
}

# Função principal
main() {
    case "${1:-deploy}" in
        "deploy")
            check_dependencies
            load_env
            backup
            build_app
            deploy
            ;;
        "build")
            check_dependencies
            load_env
            build_app
            ;;
        "backup")
            check_dependencies
            load_env
            backup
            ;;
        "rollback")
            check_dependencies
            load_env
            rollback
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2" "$3"
            ;;
        "health")
            check_health
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
