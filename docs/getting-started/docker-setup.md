# 🐳 FENIX ERP - Docker Setup

Este documento explica como executar o FENIX ERP usando Docker.

## 📋 **Pré-requisitos**

- Docker 20.10+
- Docker Compose 2.0+
- Git

## 🚀 **Início Rápido**

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/fenix-erp.git
cd fenix-erp
```

### 2. Configure as variáveis de ambiente
```bash
cp env.docker.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Inicie os serviços
```bash
./docker-start.sh start
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:3004
- **Backend API**: http://localhost:3001/api
- **Nginx (Proxy)**: http://localhost

## 🔧 **Comandos Disponíveis**

### Script Principal
```bash
./docker-start.sh [comando] [opções]
```

### Comandos Disponíveis
- `start` - Iniciar todos os serviços (padrão)
- `stop` - Parar todos os serviços
- `restart` - Reiniciar todos os serviços
- `rebuild` - Rebuild e reiniciar containers
- `status` - Mostrar status dos containers
- `logs` - Mostrar logs [service]
- `exec` - Executar comando no container
- `backup` - Fazer backup do banco
- `restore` - Restaurar backup do banco
- `clean` - Limpar containers e volumes
- `help` - Mostrar ajuda

### Exemplos de Uso
```bash
# Iniciar tudo
./docker-start.sh start

# Ver logs do frontend
./docker-start.sh logs frontend

# Executar comando no backend
./docker-start.sh exec backend "npm run migration:run"

# Fazer backup do banco
./docker-start.sh backup

# Rebuild completo
./docker-start.sh rebuild
```

## 🏗️ **Arquitetura Docker**

### Serviços
- **frontend** - Next.js (porta 3004)
- **backend** - NestJS (porta 3001)
- **db** - PostgreSQL (porta 5432)
- **redis** - Redis Cache (porta 6379)
- **nginx** - Proxy Reverso (porta 80)

### Volumes
- `postgres_data` - Dados do PostgreSQL
- `redis_data` - Dados do Redis
- `./uploads` - Arquivos de upload

### Networks
- `fenix-network` - Rede interna dos containers

## 📁 **Estrutura de Arquivos**

```
fenix-erp/
├── docker-compose.yml      # Orquestração dos containers
├── Dockerfile              # Imagem do frontend
├── Dockerfile.backend      # Imagem do backend
├── nginx.conf              # Configuração do Nginx
├── init.sql                # Script de inicialização do DB
├── docker-start.sh         # Script de gerenciamento
├── env.docker.example      # Exemplo de variáveis de ambiente
└── README.Docker.md        # Este arquivo
```

## 🔐 **Segurança**

### Variáveis de Ambiente
- Altere o `JWT_SECRET` para um valor seguro
- Use senhas fortes para o banco de dados
- Configure CORS adequadamente

### Firewall
- Apenas as portas necessárias estão expostas
- Nginx atua como proxy reverso
- Rate limiting configurado

## 📊 **Monitoramento**

### Logs
```bash
# Ver logs de todos os serviços
./docker-start.sh logs

# Ver logs de um serviço específico
./docker-start.sh logs frontend
./docker-start.sh logs backend
./docker-start.sh logs db
```

### Status
```bash
# Ver status dos containers
./docker-start.sh status

# Ver logs em tempo real
docker-compose logs -f
```

## 🔄 **Backup e Restore**

### Backup do Banco
```bash
./docker-start.sh backup
# Cria arquivo: backup_YYYYMMDD_HHMMSS.sql
```

### Restore do Banco
```bash
./docker-start.sh restore backup_20241219_143000.sql
```

## 🧹 **Limpeza**

### Limpar Containers e Volumes
```bash
./docker-start.sh clean
# ⚠️ ATENÇÃO: Remove todos os dados!
```

### Limpeza Manual
```bash
# Parar e remover containers
docker-compose down

# Remover volumes
docker-compose down -v

# Remover imagens
docker-compose down --rmi all

# Limpeza completa do Docker
docker system prune -a
```

## 🐛 **Troubleshooting**

### Problemas Comuns

#### Container não inicia
```bash
# Ver logs do container
docker-compose logs [service]

# Verificar status
docker-compose ps

# Rebuild do container
docker-compose build --no-cache [service]
```

#### Banco de dados não conecta
```bash
# Verificar se o PostgreSQL está rodando
docker-compose logs db

# Testar conexão
docker-compose exec db psql -U postgres -d fenix
```

#### Porta já em uso
```bash
# Verificar portas em uso
lsof -i :3004
lsof -i :3001
lsof -i :5432

# Parar serviços que estão usando as portas
```

### Logs Importantes
- **Frontend**: `docker-compose logs frontend`
- **Backend**: `docker-compose logs backend`
- **Database**: `docker-compose logs db`
- **Nginx**: `docker-compose logs nginx`

## 📈 **Performance**

### Otimizações
- Multi-stage builds para imagens menores
- Cache de dependências
- Nginx como proxy reverso
- Redis para cache
- Configurações otimizadas do PostgreSQL

### Recursos Recomendados
- **CPU**: 2+ cores
- **RAM**: 4GB+
- **Disk**: 10GB+ livre

## 🔄 **Desenvolvimento**

### Modo Desenvolvimento
```bash
# Para desenvolvimento, use os scripts originais
./iniciar  # Frontend e Backend nativos
```

### Modo Produção
```bash
# Para produção, use Docker
./docker-start.sh start
```

## 📞 **Suporte**

Se encontrar problemas:

1. Verifique os logs: `./docker-start.sh logs`
2. Verifique o status: `./docker-start.sh status`
3. Consulte este README
4. Abra uma issue no GitHub

---

**Última atualização**: 2024-12-19
**Versão Docker**: 1.0.0





