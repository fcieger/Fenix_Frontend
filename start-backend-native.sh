#!/bin/bash

# Script para iniciar o backend FENIX nativamente
# Usa PostgreSQL e Redis do Docker

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

log "🚀 Iniciando FENIX Backend nativamente..."

# Configurar variáveis de ambiente
export NODE_ENV=development
export PORT=3001
export DATABASE_URL="postgresql://postgres:fenix123@localhost:5432/fenix"
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=fenix123
export DB_DATABASE=fenix
export TYPEORM_HOST=localhost
export TYPEORM_PORT=5432
export TYPEORM_USERNAME=postgres
export TYPEORM_PASSWORD=fenix123
export TYPEORM_DATABASE=fenix
export JWT_SECRET="seu_jwt_secret_aqui"
export ENCRYPTION_KEY="chave_de_criptografia_super_segura_123456789"
export REDIS_URL="redis://localhost:6379"
export CORS_ORIGIN="http://localhost:3004,http://localhost:3000,http://localhost:80"

# Ir para o diretório do backend
cd ../fenix-backend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    log "Instalando dependências..."
    npm install
fi

# Iniciar o backend
log "Iniciando backend na porta 3001..."
success "Backend configurado para rodar nativamente!"
echo ""
echo "📊 CONFIGURAÇÃO HÍBRIDA:"
echo "========================"
echo "🐳 Docker: PostgreSQL (5432) + Redis (6379)"
echo "💻 Nativo: Backend NestJS (3001)"
echo ""
echo "🚀 Para iniciar: npm run start:dev"
echo ""

npm run start:dev


