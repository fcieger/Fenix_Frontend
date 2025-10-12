#!/bin/bash

# Script para iniciar o projeto na porta 3004
echo "🔄 Parando processos existentes..."
pkill -f "next dev" 2>/dev/null || true

echo "🔄 Aguardando liberação da porta 3004..."
sleep 3

echo "🚀 Iniciando Next.js na porta 3004..."
PORT=3004 npm run dev
