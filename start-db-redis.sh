#!/bin/bash

# Script para iniciar apenas PostgreSQL e Redis no Docker
# Para uso com backend nativo

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log "🐳 Iniciando PostgreSQL e Redis no Docker..."

# Parar backend se estiver rodando
docker-compose stop backend 2>/dev/null || true

# Iniciar apenas DB e Redis
docker-compose up -d db redis

# Aguardar serviços ficarem prontos
log "Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status
if docker-compose ps | grep -q "Up.*db"; then
    success "✅ PostgreSQL rodando na porta 5432"
else
    echo "❌ PostgreSQL não está rodando"
fi

if docker-compose ps | grep -q "Up.*redis"; then
    success "✅ Redis rodando na porta 6379"
else
    echo "❌ Redis não está rodando"
fi

echo ""
success "🎉 Serviços Docker iniciados!"
echo ""
echo "📊 STATUS:"
echo "=========="
docker-compose ps
echo ""
echo "🚀 Agora você pode iniciar o backend nativamente:"
echo "   ./start-backend-native.sh"


