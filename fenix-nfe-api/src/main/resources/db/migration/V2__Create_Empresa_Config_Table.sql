-- =====================================================
-- V2__Create_Empresa_Config_Table.sql
-- Criação da tabela de configurações por empresa
-- =====================================================

-- Criar tabela empresa_nfe_config
CREATE TABLE empresa_nfe_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id VARCHAR(20) NOT NULL UNIQUE,
    cnpj VARCHAR(14) NOT NULL,
    razao_social VARCHAR(100) NOT NULL,
    certificado_path VARCHAR(500) NOT NULL,
    certificado_senha VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    ambiente VARCHAR(20) NOT NULL,
    serie_padrao INTEGER NOT NULL,
    proximo_numero INTEGER NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT true,
    configuracao_adicional JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentários da tabela
COMMENT ON TABLE empresa_nfe_config IS 'Configurações de NFe por empresa';
COMMENT ON COLUMN empresa_nfe_config.id IS 'Identificador único da configuração';
COMMENT ON COLUMN empresa_nfe_config.empresa_id IS 'ID único da empresa';
COMMENT ON COLUMN empresa_nfe_config.cnpj IS 'CNPJ da empresa (14 caracteres)';
COMMENT ON COLUMN empresa_nfe_config.razao_social IS 'Razão social da empresa';
COMMENT ON COLUMN empresa_nfe_config.certificado_path IS 'Caminho do certificado digital';
COMMENT ON COLUMN empresa_nfe_config.certificado_senha IS 'Senha do certificado digital';
COMMENT ON COLUMN empresa_nfe_config.estado IS 'Estado da empresa (UF)';
COMMENT ON COLUMN empresa_nfe_config.ambiente IS 'Ambiente (HOMOLOGACAO ou PRODUCAO)';
COMMENT ON COLUMN empresa_nfe_config.serie_padrao IS 'Série padrão para emissão';
COMMENT ON COLUMN empresa_nfe_config.proximo_numero IS 'Próximo número da NFe';
COMMENT ON COLUMN empresa_nfe_config.ativa IS 'Se a configuração está ativa';
COMMENT ON COLUMN empresa_nfe_config.configuracao_adicional IS 'Configurações adicionais em JSON';
COMMENT ON COLUMN empresa_nfe_config.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN empresa_nfe_config.updated_at IS 'Data e hora da última atualização';

-- Criar índices para performance
CREATE INDEX idx_empresa_config_empresa ON empresa_nfe_config(empresa_id);
CREATE INDEX idx_empresa_config_cnpj ON empresa_nfe_config(cnpj);
CREATE INDEX idx_empresa_config_ativa ON empresa_nfe_config(ativa);
CREATE INDEX idx_empresa_config_estado ON empresa_nfe_config(estado);
CREATE INDEX idx_empresa_config_ambiente ON empresa_nfe_config(ambiente);
CREATE INDEX idx_empresa_config_estado_ambiente ON empresa_nfe_config(estado, ambiente);
CREATE INDEX idx_empresa_config_ativa_estado ON empresa_nfe_config(ativa, estado);
CREATE INDEX idx_empresa_config_ativa_ambiente ON empresa_nfe_config(ativa, ambiente);
CREATE INDEX idx_empresa_config_ativa_estado_ambiente ON empresa_nfe_config(ativa, estado, ambiente);
CREATE INDEX idx_empresa_config_serie_padrao ON empresa_nfe_config(serie_padrao);
CREATE INDEX idx_empresa_config_proximo_numero ON empresa_nfe_config(proximo_numero);
CREATE INDEX idx_empresa_config_created_at ON empresa_nfe_config(created_at);
CREATE INDEX idx_empresa_config_updated_at ON empresa_nfe_config(updated_at);

-- Criar índice GIN para busca em JSONB
CREATE INDEX idx_empresa_config_configuracao_gin ON empresa_nfe_config USING GIN(configuracao_adicional);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_empresa_nfe_config_updated_at 
    BEFORE UPDATE ON empresa_nfe_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Criar constraint para validar CNPJ
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_cnpj 
    CHECK (LENGTH(cnpj) = 14 AND cnpj ~ '^[0-9]+$');

-- Criar constraint para validar estado
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_estado 
    CHECK (estado IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'));

-- Criar constraint para validar ambiente
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_ambiente 
    CHECK (ambiente IN ('HOMOLOGACAO', 'PRODUCAO'));

-- Criar constraint para validar série padrão
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_serie_padrao 
    CHECK (serie_padrao > 0);

-- Criar constraint para validar próximo número
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_proximo_numero 
    CHECK (proximo_numero > 0);

-- Criar constraint para validar empresa_id
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_empresa_id 
    CHECK (LENGTH(empresa_id) > 0 AND LENGTH(empresa_id) <= 20);

-- Criar constraint para validar razão social
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_razao_social 
    CHECK (LENGTH(razao_social) > 0 AND LENGTH(razao_social) <= 100);

-- Criar constraint para validar certificado_path
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_certificado_path 
    CHECK (LENGTH(certificado_path) > 0 AND LENGTH(certificado_path) <= 500);

-- Criar constraint para validar certificado_senha
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_certificado_senha 
    CHECK (LENGTH(certificado_senha) > 0 AND LENGTH(certificado_senha) <= 100);

-- Criar constraint para validar ativa
ALTER TABLE empresa_nfe_config ADD CONSTRAINT chk_empresa_config_ativa 
    CHECK (ativa IN (true, false));

-- Inserir dados de exemplo (opcional - apenas para desenvolvimento)
-- INSERT INTO empresa_nfe_config (empresa_id, cnpj, razao_social, certificado_path, certificado_senha, estado, ambiente, serie_padrao, proximo_numero) 
-- VALUES ('EMP001', '08667257000103', 'EMPRESA TESTE LTDA', '/certificados/empresa.pfx', 'senha123', 'PR', 'HOMOLOGACAO', 1, 1);


