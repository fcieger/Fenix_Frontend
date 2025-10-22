-- =====================================================
-- V1__Create_NFe_Status_Table.sql
-- Criação da tabela principal de status das NFe
-- =====================================================

-- Criar tabela nfe_status
CREATE TABLE nfe_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id VARCHAR(20) NOT NULL,
    chave_acesso VARCHAR(44) NOT NULL UNIQUE,
    numero_nfe INTEGER NOT NULL,
    serie INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    protocolo VARCHAR(20),
    xml_nfe TEXT,
    xml_autorizado TEXT,
    data_emissao TIMESTAMP NOT NULL,
    data_autorizacao TIMESTAMP,
    data_cancelamento TIMESTAMP,
    motivo_cancelamento TEXT,
    tentativas INTEGER NOT NULL DEFAULT 0,
    proxima_tentativa TIMESTAMP,
    erros TEXT[],
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentários da tabela
COMMENT ON TABLE nfe_status IS 'Tabela principal para controle de status das NFe emitidas';
COMMENT ON COLUMN nfe_status.id IS 'Identificador único da NFe';
COMMENT ON COLUMN nfe_status.empresa_id IS 'ID da empresa emitente';
COMMENT ON COLUMN nfe_status.chave_acesso IS 'Chave de acesso da NFe (44 caracteres)';
COMMENT ON COLUMN nfe_status.numero_nfe IS 'Número da NFe';
COMMENT ON COLUMN nfe_status.serie IS 'Série da NFe';
COMMENT ON COLUMN nfe_status.status IS 'Status atual da NFe';
COMMENT ON COLUMN nfe_status.protocolo IS 'Protocolo de autorização da SEFAZ';
COMMENT ON COLUMN nfe_status.xml_nfe IS 'XML original da NFe';
COMMENT ON COLUMN nfe_status.xml_autorizado IS 'XML autorizado pela SEFAZ';
COMMENT ON COLUMN nfe_status.data_emissao IS 'Data e hora de emissão';
COMMENT ON COLUMN nfe_status.data_autorizacao IS 'Data e hora de autorização';
COMMENT ON COLUMN nfe_status.data_cancelamento IS 'Data e hora de cancelamento';
COMMENT ON COLUMN nfe_status.motivo_cancelamento IS 'Motivo do cancelamento';
COMMENT ON COLUMN nfe_status.tentativas IS 'Número de tentativas de processamento';
COMMENT ON COLUMN nfe_status.proxima_tentativa IS 'Data e hora da próxima tentativa';
COMMENT ON COLUMN nfe_status.erros IS 'Lista de erros ocorridos';
COMMENT ON COLUMN nfe_status.metadata IS 'Metadados adicionais em JSON';
COMMENT ON COLUMN nfe_status.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN nfe_status.updated_at IS 'Data e hora da última atualização';

-- Criar índices para performance
CREATE INDEX idx_nfe_status_empresa ON nfe_status(empresa_id);
CREATE INDEX idx_nfe_status_chave ON nfe_status(chave_acesso);
CREATE INDEX idx_nfe_status_status ON nfe_status(status);
CREATE INDEX idx_nfe_status_data_emissao ON nfe_status(data_emissao);
CREATE INDEX idx_nfe_status_empresa_status ON nfe_status(empresa_id, status);
CREATE INDEX idx_nfe_status_data_emissao_status ON nfe_status(data_emissao, status);
CREATE INDEX idx_nfe_status_protocolo ON nfe_status(protocolo);
CREATE INDEX idx_nfe_status_numero_serie ON nfe_status(empresa_id, numero_nfe, serie);
CREATE INDEX idx_nfe_status_tentativas ON nfe_status(tentativas);
CREATE INDEX idx_nfe_status_proxima_tentativa ON nfe_status(proxima_tentativa);
CREATE INDEX idx_nfe_status_created_at ON nfe_status(created_at);
CREATE INDEX idx_nfe_status_updated_at ON nfe_status(updated_at);

-- Criar índice GIN para busca em JSONB
CREATE INDEX idx_nfe_status_metadata_gin ON nfe_status USING GIN(metadata);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nfe_status_updated_at 
    BEFORE UPDATE ON nfe_status 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Criar constraint para validar status
ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_status 
    CHECK (status IN ('PENDENTE', 'PROCESSANDO', 'AUTORIZADA', 'REJEITADA', 'CANCELADA', 'ERRO', 'RETRY', 'INUTILIZADA'));

-- Criar constraint para validar chave de acesso
ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_chave_acesso 
    CHECK (LENGTH(chave_acesso) = 44);

-- Criar constraint para validar tentativas
ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_tentativas 
    CHECK (tentativas >= 0);

-- Criar constraint para validar número da NFe
ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_numero_nfe 
    CHECK (numero_nfe > 0);

-- Criar constraint para validar série
ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_serie 
    CHECK (serie > 0);

-- Criar constraint para validar datas
ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_datas 
    CHECK (data_autorizacao IS NULL OR data_autorizacao >= data_emissao);

ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_datas_cancelamento 
    CHECK (data_cancelamento IS NULL OR data_cancelamento >= data_emissao);

-- Criar constraint para validar protocolo
ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_protocolo 
    CHECK (protocolo IS NULL OR LENGTH(protocolo) > 0);

-- Criar constraint para validar empresa_id
ALTER TABLE nfe_status ADD CONSTRAINT chk_nfe_status_empresa_id 
    CHECK (LENGTH(empresa_id) > 0 AND LENGTH(empresa_id) <= 20);

-- Inserir dados de exemplo (opcional - apenas para desenvolvimento)
-- INSERT INTO nfe_status (empresa_id, chave_acesso, numero_nfe, serie, status, data_emissao) 
-- VALUES ('EMP001', '41251001389526000178550010000079481102551263', 1, 1, 'PENDENTE', CURRENT_TIMESTAMP);


