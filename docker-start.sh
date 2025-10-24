#!/bin/bash

# Script para iniciar o FENIX ERP com Docker
# Uso: ./docker-start.sh [opções]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Instale o Docker Compose primeiro."
    exit 1
fi

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Função para aguardar serviço ficar pronto
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    log "Aguardando $service_name ficar pronto..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            success "$service_name está pronto!"
            return 0
        fi
        
        log "Tentativa $attempt/$max_attempts - Aguardando $service_name..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "$service_name não ficou pronto após $max_attempts tentativas"
    return 1
}

# Função para mostrar status dos containers
show_status() {
    echo ""
    echo "📊 STATUS DOS CONTAINERS:"
    echo "========================="
    docker-compose ps
    echo ""
}

# Função para mostrar logs
show_logs() {
    local service=$1
    if [ -n "$service" ]; then
        log "Mostrando logs do $service..."
        docker-compose logs -f "$service"
    else
        log "Mostrando logs de todos os serviços..."
        docker-compose logs -f
    fi
}

# Função para parar todos os serviços
stop_services() {
    log "Parando todos os serviços..."
    docker-compose down
    success "Serviços parados!"
}

# Função para limpar containers e volumes
clean_all() {
    log "Limpando containers, volumes e imagens..."
    docker-compose down -v --rmi all
    docker system prune -f
    success "Limpeza concluída!"
}

# Função para rebuild dos containers
rebuild() {
    log "Fazendo rebuild dos containers..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    success "Rebuild concluído!"
}

# Função para executar comandos no container
exec_command() {
    local service=$1
    local command=$2
    
    if [ -z "$service" ] || [ -z "$command" ]; then
        error "Uso: $0 exec <service> <command>"
        exit 1
    fi
    
    log "Executando '$command' no container $service..."
    docker-compose exec "$service" sh -c "$command"
}

# Função para backup do banco
backup_db() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    log "Fazendo backup do banco de dados..."
    
    docker-compose exec db pg_dump -U postgres -d fenix > "$backup_file"
    success "Backup salvo em: $backup_file"
}

# Função para restaurar backup
restore_db() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        error "Uso: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    log "Restaurando backup: $backup_file"
    docker-compose exec -T db psql -U postgres -d fenix < "$backup_file"
    success "Backup restaurado!"
}

# Função principal para iniciar serviços
start_services() {
    log "🚀 Iniciando FENIX ERP com Docker..."
    
    # Verificar se já está rodando
    if docker-compose ps | grep -q "Up"; then
        warning "Alguns serviços já estão rodando. Use 'restart' para reiniciar."
        show_status
        return 0
    fi
    
    # Iniciar serviços
    log "Iniciando containers..."
    docker-compose up -d
    
    # Aguardar serviços ficarem prontos
    if wait_for_service "http://localhost:3004" "Frontend"; then
        success "Frontend iniciado com sucesso!"
    else
        warning "Frontend pode não estar totalmente pronto ainda"
    fi
    
    if wait_for_service "http://localhost:3001/api" "Backend"; then
        success "Backend iniciado com sucesso!"
    else
        warning "Backend pode não estar totalmente pronto ainda"
    fi
    
    if wait_for_service "http://localhost:80" "Nginx"; then
        success "Nginx iniciado com sucesso!"
    else
        warning "Nginx pode não estar totalmente pronto ainda"
    fi
    
    success "🎉 FENIX ERP iniciado com sucesso!"
    show_status
    
    echo ""
    echo "🔧 COMO USAR:"
    echo "============="
    echo "• Acesse: http://localhost"
    echo "• Frontend: http://localhost:3004"
    echo "• Backend: http://localhost:3001/api"
    echo "• Login: teste@ieger.com.br / 123456"
    echo ""
    echo "📝 COMANDOS ÚTEIS:"
    echo "=================="
    echo "• Ver logs: ./docker-start.sh logs [service]"
    echo "• Parar: ./docker-start.sh stop"
    echo "• Restart: ./docker-start.sh restart"
    echo "• Rebuild: ./docker-start.sh rebuild"
    echo "• Status: ./docker-start.sh status"
    echo "• Backup: ./docker-start.sh backup"
    echo "• Limpar: ./docker-start.sh clean"
    echo ""
}

# Processar argumentos
case "${1:-start}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        start_services
        ;;
    "rebuild")
        rebuild
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "exec")
        exec_command "$2" "$3"
        ;;
    "backup")
        backup_db
        ;;
    "restore")
        restore_db "$2"
        ;;
    "clean")
        clean_all
        ;;
    "help"|"-h"|"--help")
        echo "FENIX ERP - Docker Management Script"
        echo ""
        echo "Uso: $0 [comando] [opções]"
        echo ""
        echo "Comandos:"
        echo "  start     Iniciar todos os serviços (padrão)"
        echo "  stop      Parar todos os serviços"
        echo "  restart   Reiniciar todos os serviços"
        echo "  rebuild   Rebuild e reiniciar containers"
        echo "  status    Mostrar status dos containers"
        echo "  logs      Mostrar logs [service]"
        echo "  exec      Executar comando no container"
        echo "  backup    Fazer backup do banco"
        echo "  restore   Restaurar backup do banco"
        echo "  clean     Limpar containers e volumes"
        echo "  help      Mostrar esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  $0 start"
        echo "  $0 logs frontend"
        echo "  $0 exec backend 'npm run migration:run'"
        echo "  $0 backup"
        echo "  $0 restore backup_20241219_143000.sql"
        ;;
    *)
        error "Comando desconhecido: $1"
        echo "Use '$0 help' para ver os comandos disponíveis"
        exit 1
        ;;
esac

