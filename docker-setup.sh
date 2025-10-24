#!/bin/bash

# Script de configuração inicial do Docker para FENIX ERP
# Uso: ./docker-setup.sh

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

log "🐳 Configurando FENIX ERP para Docker..."

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

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    log "Criando arquivo .env..."
    cp env.docker.example .env
    success "Arquivo .env criado! Edite as configurações conforme necessário."
else
    warning "Arquivo .env já existe. Mantendo configurações atuais."
fi

# Criar diretório de uploads se não existir
if [ ! -d "uploads" ]; then
    log "Criando diretório de uploads..."
    mkdir -p uploads
    success "Diretório de uploads criado!"
fi

# Criar diretório SSL se não existir
if [ ! -d "ssl" ]; then
    log "Criando diretório SSL..."
    mkdir -p ssl
    success "Diretório SSL criado!"
fi

# Verificar se o backend existe
if [ ! -d "../fenix-backend" ]; then
    error "Diretório do backend não encontrado: ../fenix-backend"
    error "Certifique-se de que o backend está no diretório correto."
    exit 1
fi

# Verificar se o Dockerfile do backend existe
if [ ! -f "../fenix-backend/Dockerfile" ]; then
    error "Dockerfile do backend não encontrado: ../fenix-backend/Dockerfile"
    exit 1
fi

# Testar build das imagens
log "Testando build das imagens Docker..."

# Build do frontend
log "Buildando imagem do frontend..."
if docker build -t fenix-frontend . > /dev/null 2>&1; then
    success "Imagem do frontend buildada com sucesso!"
else
    error "Falha ao buildar imagem do frontend"
    exit 1
fi

# Build do backend
log "Buildando imagem do backend..."
if docker build -t fenix-backend ../fenix-backend > /dev/null 2>&1; then
    success "Imagem do backend buildada com sucesso!"
else
    error "Falha ao buildar imagem do backend"
    exit 1
fi

# Verificar se as portas estão livres
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Verificar portas
ports=(80 3001 3004 5432 6379)
for port in "${ports[@]}"; do
    if check_port $port; then
        warning "Porta $port está em uso. Pode causar conflitos."
    else
        log "Porta $port está livre ✓"
    fi
done

# Mostrar resumo
echo ""
success "🎉 Configuração Docker concluída com sucesso!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "==================="
echo "1. Edite o arquivo .env com suas configurações"
echo "2. Execute: ./docker-start.sh start"
echo "3. Acesse: http://localhost"
echo ""
echo "📝 COMANDOS ÚTEIS:"
echo "=================="
echo "• Iniciar: ./docker-start.sh start"
echo "• Parar: ./docker-start.sh stop"
echo "• Logs: ./docker-start.sh logs"
echo "• Status: ./docker-start.sh status"
echo "• Ajuda: ./docker-start.sh help"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "================"
echo "• README.Docker.md - Documentação completa do Docker"
echo "• CONTEXTO.md - Contexto completo do projeto"
echo ""

success "Pronto para usar! 🚀"


