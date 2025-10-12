#!/bin/bash

echo "🔧 Configurando arquivos de ambiente para o FENIX..."

# Frontend
echo "📁 Configurando Frontend..."
if [ ! -f ".env.local" ]; then
    cp env.frontend.txt .env.local
    echo "✅ Arquivo .env.local criado para o frontend"
else
    echo "⚠️  Arquivo .env.local já existe no frontend"
fi

# Backend
echo "📁 Configurando Backend..."
cd ../fenix-backend
if [ ! -f ".env" ]; then
    cp env.backend.txt .env
    echo "✅ Arquivo .env criado para o backend"
else
    echo "⚠️  Arquivo .env já existe no backend"
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Inicie o banco de dados: cd ../fenix-backend && docker-compose up -d postgres"
echo "2. Inicie o backend: cd ../fenix-backend && npm run start:dev"
echo "3. Inicie o frontend: npm run dev:3004"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:3004"
echo "- Backend: http://localhost:3001"
echo "- Banco: localhost:5432"

