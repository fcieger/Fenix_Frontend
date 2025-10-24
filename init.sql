-- Script de inicialização do banco de dados FENIX
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Criar schema se não existir
CREATE SCHEMA IF NOT EXISTS fenix;

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar usuário específico para a aplicação (opcional)
-- CREATE USER fenix_user WITH PASSWORD 'fenix123';
-- GRANT ALL PRIVILEGES ON DATABASE fenix TO fenix_user;

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Recarregar configurações
SELECT pg_reload_conf();

-- Log de inicialização
INSERT INTO pg_stat_statements_reset() VALUES (1);

