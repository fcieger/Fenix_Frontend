-- Schema Core do Sistema FENIX
-- Tabelas essenciais: users, companies, user_companies

-- Criar extensões necessárias (com tratamento de erro)
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION WHEN OTHERS THEN
  -- Extensão pode já existir ou não ter permissão, continuar
  NULL;
END $$;

DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EXCEPTION WHEN OTHERS THEN
  -- Extensão pode já existir ou não ter permissão, continuar
  NULL;
END $$;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT,
  token TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  founded TEXT,
  nature TEXT,
  size TEXT,
  status TEXT,
  "mainActivity" TEXT,
  address JSONB,
  phones JSONB,
  emails JSONB,
  members JSONB,
  "defaultLocalEstoqueId" UUID,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento usuário-empresa
CREATE TABLE IF NOT EXISTS user_companies (
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  PRIMARY KEY ("userId", "companyId")
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users("isActive");
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies("isActive");
CREATE INDEX IF NOT EXISTS idx_user_companies_user ON user_companies("userId");
CREATE INDEX IF NOT EXISTS idx_user_companies_company ON user_companies("companyId");

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_users_updated_at ON users;
CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_companies_updated_at ON companies;
CREATE TRIGGER tr_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

