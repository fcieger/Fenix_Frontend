#!/bin/bash
echo "🛑 Parando serviços FENIX..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "spring-boot:run" 2>/dev/null || true
rm -f /tmp/fenix*.pid /tmp/fenix*.log
echo "✅ Serviços parados!"
