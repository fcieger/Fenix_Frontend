#!/bin/bash

# Script para configurar FENIX ERP em modo híbrido
# Docker para DB/Redis + Backend nativo

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

log "🚀 Configurando FENIX ERP em modo híbrido..."

# 1. Parar backend Docker se estiver rodando
log "Parando backend Docker..."
docker-compose stop backend 2>/dev/null || true

# 2. Iniciar apenas DB e Redis no Docker
log "Iniciando PostgreSQL e Redis no Docker..."
docker-compose up -d db redis

# 3. Aguardar serviços ficarem prontos
log "Aguardando PostgreSQL e Redis ficarem prontos..."
sleep 10

# 4. Verificar se estão funcionando
if docker-compose ps | grep -q "Up.*db"; then
    success "PostgreSQL rodando no Docker"
else
    error "PostgreSQL não está rodando"
    exit 1
fi

if docker-compose ps | grep -q "Up.*redis"; then
    success "Redis rodando no Docker"
else
    error "Redis não está rodando"
    exit 1
fi

# 5. Configurar backend nativo
log "Configurando backend nativo..."

# Ir para o diretório do backend
cd ../fenix-backend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    log "Instalando dependências do backend..."
    npm install
else
    log "Dependências já instaladas"
fi

# 6. Configurar variáveis de ambiente
log "Configurando variáveis de ambiente..."

# Criar arquivo .env para o backend
cat > .env << EOF
# Configurações do Backend FENIX
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:fenix123@localhost:5432/fenix
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=fenix123
DB_DATABASE=fenix

# TypeORM
TYPEORM_HOST=localhost
TYPEORM_PORT=5432
TYPEORM_USERNAME=postgres
TYPEORM_PASSWORD=fenix123
TYPEORM_DATABASE=fenix

# JWT
JWT_SECRET=seu_jwt_secret_aqui

# Encryption
ENCRYPTION_KEY=chave_de_criptografia_super_segura_123456789

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3004,http://localhost:3000,http://localhost:80
EOF

success "Arquivo .env criado para o backend"

# 7. Testar conexão com o banco
log "Testando conexão com PostgreSQL..."
if docker-compose -f ../fenix/docker-compose.yml exec -T db psql -U postgres -d fenix -c "SELECT 1;" > /dev/null 2>&1; then
    success "Conexão com PostgreSQL OK"
else
    warning "Não foi possível testar conexão com PostgreSQL"
fi

# 8. Iniciar backend nativo
log "Iniciando backend nativo..."
success "🎉 Configuração híbrida concluída!"

echo ""
echo "📊 STATUS DA CONFIGURAÇÃO HÍBRIDA:"
echo "=================================="
echo "🐳 Docker:"
echo "  • PostgreSQL - porta 5432"
echo "  • Redis - porta 6379"
echo ""
echo "💻 Nativo:"
echo "  • Backend NestJS - porta 3001"
echo "  • Frontend Next.js - porta 3004"
echo ""
echo "🚀 COMANDOS PARA USAR:"
echo "======================"
echo "• Iniciar backend: cd ../fenix-backend && npm run start:dev"
echo "• Iniciar frontend: cd ../fenix && npm run dev:3004"
echo "• Ver logs Docker: docker-compose logs -f"
echo "• Parar Docker: docker-compose down"
echo ""
echo "✅ Pronto para usar! O backend agora roda nativamente sem problemas de Docker!"

