-- =====================================================
-- V3__Create_NFe_Log_Table.sql
-- Criação da tabela de logs de operações
-- =====================================================

-- Criar tabela nfe_log
CREATE TABLE nfe_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nfe_status_id UUID,
    empresa_id VARCHAR(20) NOT NULL,
    operacao VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    mensagem TEXT,
    detalhes JSONB,
    duracao_ms INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentários da tabela
COMMENT ON TABLE nfe_log IS 'Logs de operações da NFe';
COMMENT ON COLUMN nfe_log.id IS 'Identificador único do log';
COMMENT ON COLUMN nfe_log.nfe_status_id IS 'ID da NFe relacionada (opcional)';
COMMENT ON COLUMN nfe_log.empresa_id IS 'ID da empresa';
COMMENT ON COLUMN nfe_log.operacao IS 'Tipo de operação realizada';
COMMENT ON COLUMN nfe_log.status IS 'Status da operação';
COMMENT ON COLUMN nfe_log.mensagem IS 'Mensagem do log';
COMMENT ON COLUMN nfe_log.detalhes IS 'Detalhes adicionais em JSON';
COMMENT ON COLUMN nfe_log.duracao_ms IS 'Duração da operação em milissegundos';
COMMENT ON COLUMN nfe_log.created_at IS 'Data e hora de criação do log';

-- Criar índices para performance
CREATE INDEX idx_nfe_log_nfe_status ON nfe_log(nfe_status_id);
CREATE INDEX idx_nfe_log_empresa ON nfe_log(empresa_id);
CREATE INDEX idx_nfe_log_operacao ON nfe_log(operacao);
CREATE INDEX idx_nfe_log_status ON nfe_log(status);
CREATE INDEX idx_nfe_log_created_at ON nfe_log(created_at);
CREATE INDEX idx_nfe_log_empresa_operacao ON nfe_log(empresa_id, operacao);
CREATE INDEX idx_nfe_log_empresa_status ON nfe_log(empresa_id, status);
CREATE INDEX idx_nfe_log_operacao_status ON nfe_log(operacao, status);
CREATE INDEX idx_nfe_log_empresa_operacao_status ON nfe_log(empresa_id, operacao, status);
CREATE INDEX idx_nfe_log_duracao_ms ON nfe_log(duracao_ms);
CREATE INDEX idx_nfe_log_created_at_desc ON nfe_log(created_at DESC);

-- Criar índice GIN para busca em JSONB
CREATE INDEX idx_nfe_log_detalhes_gin ON nfe_log USING GIN(detalhes);

-- Criar constraint para validar operação
ALTER TABLE nfe_log ADD CONSTRAINT chk_nfe_log_operacao 
    CHECK (operacao IN ('EMITIR', 'CONSULTAR_STATUS', 'CONSULTAR_XML', 'CONSULTAR_CADASTRO', 'CONSULTAR_DISTRIBUICAO', 
                       'CANCELAR', 'CARTA_CORRECAO', 'MANIFESTACAO', 'ATOR_INTERESSADO', 'INUTILIZAR', 'VALIDAR', 
                       'PROCESSAR_FILA', 'RETRY', 'DLQ'));

-- Criar constraint para validar status
ALTER TABLE nfe_log ADD CONSTRAINT chk_nfe_log_status 
    CHECK (status IN ('PENDENTE', 'PROCESSANDO', 'AUTORIZADA', 'REJEITADA', 'CANCELADA', 'ERRO', 'RETRY', 'INUTILIZADA'));

-- Criar constraint para validar duração
ALTER TABLE nfe_log ADD CONSTRAINT chk_nfe_log_duracao_ms 
    CHECK (duracao_ms IS NULL OR duracao_ms >= 0);

-- Criar constraint para validar empresa_id
ALTER TABLE nfe_log ADD CONSTRAINT chk_nfe_log_empresa_id 
    CHECK (LENGTH(empresa_id) > 0 AND LENGTH(empresa_id) <= 20);

-- Criar constraint para validar operação
ALTER TABLE nfe_log ADD CONSTRAINT chk_nfe_log_operacao_length 
    CHECK (LENGTH(operacao) > 0 AND LENGTH(operacao) <= 50);

-- Criar constraint para validar status
ALTER TABLE nfe_log ADD CONSTRAINT chk_nfe_log_status_length 
    CHECK (LENGTH(status) > 0 AND LENGTH(status) <= 20);

-- Criar constraint para validar mensagem
ALTER TABLE nfe_log ADD CONSTRAINT chk_nfe_log_mensagem 
    CHECK (mensagem IS NULL OR LENGTH(mensagem) > 0);

-- Criar foreign key para nfe_status (opcional)
ALTER TABLE nfe_log ADD CONSTRAINT fk_nfe_log_nfe_status 
    FOREIGN KEY (nfe_status_id) REFERENCES nfe_status(id) ON DELETE SET NULL;

-- Criar índice para foreign key
CREATE INDEX idx_nfe_log_nfe_status_fk ON nfe_log(nfe_status_id);

-- Inserir dados de exemplo (opcional - apenas para desenvolvimento)
-- INSERT INTO nfe_log (empresa_id, operacao, status, mensagem, duracao_ms) 
-- VALUES ('EMP001', 'EMITIR', 'PROCESSANDO', 'Iniciando emissão da NFe', 0);


