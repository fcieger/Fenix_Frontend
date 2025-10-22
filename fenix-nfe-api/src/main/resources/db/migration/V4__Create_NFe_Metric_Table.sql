-- =====================================================
-- V4__Create_NFe_Metric_Table.sql
-- Criação da tabela de métricas customizadas
-- =====================================================

-- Criar tabela nfe_metric
CREATE TABLE nfe_metric (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id VARCHAR(20) NOT NULL,
    operacao VARCHAR(50) NOT NULL,
    nome_metrica VARCHAR(100) NOT NULL,
    valor DECIMAL(15,4) NOT NULL,
    unidade VARCHAR(50),
    tags JSONB,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentários da tabela
COMMENT ON TABLE nfe_metric IS 'Métricas customizadas da NFe';
COMMENT ON COLUMN nfe_metric.id IS 'Identificador único da métrica';
COMMENT ON COLUMN nfe_metric.empresa_id IS 'ID da empresa';
COMMENT ON COLUMN nfe_metric.operacao IS 'Tipo de operação';
COMMENT ON COLUMN nfe_metric.nome_metrica IS 'Nome da métrica';
COMMENT ON COLUMN nfe_metric.valor IS 'Valor da métrica';
COMMENT ON COLUMN nfe_metric.unidade IS 'Unidade da métrica';
COMMENT ON COLUMN nfe_metric.tags IS 'Tags da métrica em JSON';
COMMENT ON COLUMN nfe_metric.metadata IS 'Metadados adicionais em JSON';
COMMENT ON COLUMN nfe_metric.created_at IS 'Data e hora de criação da métrica';

-- Criar índices para performance
CREATE INDEX idx_nfe_metric_empresa ON nfe_metric(empresa_id);
CREATE INDEX idx_nfe_metric_operacao ON nfe_metric(operacao);
CREATE INDEX idx_nfe_metric_nome_metrica ON nfe_metric(nome_metrica);
CREATE INDEX idx_nfe_metric_created_at ON nfe_metric(created_at);
CREATE INDEX idx_nfe_metric_empresa_operacao ON nfe_metric(empresa_id, operacao);
CREATE INDEX idx_nfe_metric_empresa_nome_metrica ON nfe_metric(empresa_id, nome_metrica);
CREATE INDEX idx_nfe_metric_operacao_nome_metrica ON nfe_metric(operacao, nome_metrica);
CREATE INDEX idx_nfe_metric_empresa_operacao_nome_metrica ON nfe_metric(empresa_id, operacao, nome_metrica);
CREATE INDEX idx_nfe_metric_valor ON nfe_metric(valor);
CREATE INDEX idx_nfe_metric_unidade ON nfe_metric(unidade);
CREATE INDEX idx_nfe_metric_created_at_desc ON nfe_metric(created_at DESC);

-- Criar índices GIN para busca em JSONB
CREATE INDEX idx_nfe_metric_tags_gin ON nfe_metric USING GIN(tags);
CREATE INDEX idx_nfe_metric_metadata_gin ON nfe_metric USING GIN(metadata);

-- Criar constraint para validar operação
ALTER TABLE nfe_metric ADD CONSTRAINT chk_nfe_metric_operacao 
    CHECK (operacao IN ('EMITIR', 'CONSULTAR_STATUS', 'CONSULTAR_XML', 'CONSULTAR_CADASTRO', 'CONSULTAR_DISTRIBUICAO', 
                       'CANCELAR', 'CARTA_CORRECAO', 'MANIFESTACAO', 'ATOR_INTERESSADO', 'INUTILIZAR', 'VALIDAR', 
                       'PROCESSAR_FILA', 'RETRY', 'DLQ'));

-- Criar constraint para validar nome da métrica
ALTER TABLE nfe_metric ADD CONSTRAINT chk_nfe_metric_nome_metrica 
    CHECK (LENGTH(nome_metrica) > 0 AND LENGTH(nome_metrica) <= 100);

-- Criar constraint para validar valor
ALTER TABLE nfe_metric ADD CONSTRAINT chk_nfe_metric_valor 
    CHECK (valor IS NOT NULL);

-- Criar constraint para validar unidade
ALTER TABLE nfe_metric ADD CONSTRAINT chk_nfe_metric_unidade 
    CHECK (unidade IS NULL OR (LENGTH(unidade) > 0 AND LENGTH(unidade) <= 50));

-- Criar constraint para validar empresa_id
ALTER TABLE nfe_metric ADD CONSTRAINT chk_nfe_metric_empresa_id 
    CHECK (LENGTH(empresa_id) > 0 AND LENGTH(empresa_id) <= 20);

-- Criar constraint para validar operação
ALTER TABLE nfe_metric ADD CONSTRAINT chk_nfe_metric_operacao_length 
    CHECK (LENGTH(operacao) > 0 AND LENGTH(operacao) <= 50);

-- Inserir dados de exemplo (opcional - apenas para desenvolvimento)
-- INSERT INTO nfe_metric (empresa_id, operacao, nome_metrica, valor, unidade) 
-- VALUES ('EMP001', 'EMITIR', 'tempo_processamento', 1500.50, 'ms');


