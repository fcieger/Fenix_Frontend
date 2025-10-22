-- =====================================================
-- V5__Create_Additional_Indexes.sql
-- Criação de índices adicionais para otimização
-- =====================================================

-- Índices adicionais para nfe_status
CREATE INDEX idx_nfe_status_empresa_data_emissao ON nfe_status(empresa_id, data_emissao);
CREATE INDEX idx_nfe_status_empresa_data_autorizacao ON nfe_status(empresa_id, data_autorizacao);
CREATE INDEX idx_nfe_status_empresa_data_cancelamento ON nfe_status(empresa_id, data_cancelamento);
CREATE INDEX idx_nfe_status_status_data_emissao ON nfe_status(status, data_emissao);
CREATE INDEX idx_nfe_status_status_created_at ON nfe_status(status, created_at);
CREATE INDEX idx_nfe_status_empresa_status_data_emissao ON nfe_status(empresa_id, status, data_emissao);
CREATE INDEX idx_nfe_status_empresa_status_created_at ON nfe_status(empresa_id, status, created_at);
CREATE INDEX idx_nfe_status_tentativas_proxima_tentativa ON nfe_status(tentativas, proxima_tentativa);
CREATE INDEX idx_nfe_status_created_at_status ON nfe_status(created_at, status);
CREATE INDEX idx_nfe_status_updated_at ON nfe_status(updated_at);

-- Índices adicionais para empresa_nfe_config
CREATE INDEX idx_empresa_config_empresa_ativa ON empresa_nfe_config(empresa_id, ativa);
CREATE INDEX idx_empresa_config_cnpj_ativa ON empresa_nfe_config(cnpj, ativa);
CREATE INDEX idx_empresa_config_estado_ativa ON empresa_nfe_config(estado, ativa);
CREATE INDEX idx_empresa_config_ambiente_ativa ON empresa_nfe_config(ambiente, ativa);
CREATE INDEX idx_empresa_config_estado_ambiente_ativa ON empresa_nfe_config(estado, ambiente, ativa);
CREATE INDEX idx_empresa_config_serie_padrao_ativa ON empresa_nfe_config(serie_padrao, ativa);
CREATE INDEX idx_empresa_config_proximo_numero_ativa ON empresa_nfe_config(proximo_numero, ativa);
CREATE INDEX idx_empresa_config_created_at_ativa ON empresa_nfe_config(created_at, ativa);
CREATE INDEX idx_empresa_config_updated_at_ativa ON empresa_nfe_config(updated_at, ativa);

-- Índices adicionais para nfe_log
CREATE INDEX idx_nfe_log_empresa_created_at ON nfe_log(empresa_id, created_at);
CREATE INDEX idx_nfe_log_operacao_created_at ON nfe_log(operacao, created_at);
CREATE INDEX idx_nfe_log_status_created_at ON nfe_log(status, created_at);
CREATE INDEX idx_nfe_log_empresa_operacao_created_at ON nfe_log(empresa_id, operacao, created_at);
CREATE INDEX idx_nfe_log_empresa_status_created_at ON nfe_log(empresa_id, status, created_at);
CREATE INDEX idx_nfe_log_operacao_status_created_at ON nfe_log(operacao, status, created_at);
CREATE INDEX idx_nfe_log_empresa_operacao_status_created_at ON nfe_log(empresa_id, operacao, status, created_at);
CREATE INDEX idx_nfe_log_duracao_ms_created_at ON nfe_log(duracao_ms, created_at);
CREATE INDEX idx_nfe_log_nfe_status_created_at ON nfe_log(nfe_status_id, created_at);

-- Índices adicionais para nfe_metric
CREATE INDEX idx_nfe_metric_empresa_created_at ON nfe_metric(empresa_id, created_at);
CREATE INDEX idx_nfe_metric_operacao_created_at ON nfe_metric(operacao, created_at);
CREATE INDEX idx_nfe_metric_nome_metrica_created_at ON nfe_metric(nome_metrica, created_at);
CREATE INDEX idx_nfe_metric_empresa_operacao_created_at ON nfe_metric(empresa_id, operacao, created_at);
CREATE INDEX idx_nfe_metric_empresa_nome_metrica_created_at ON nfe_metric(empresa_id, nome_metrica, created_at);
CREATE INDEX idx_nfe_metric_operacao_nome_metrica_created_at ON nfe_metric(operacao, nome_metrica, created_at);
CREATE INDEX idx_nfe_metric_empresa_operacao_nome_metrica_created_at ON nfe_metric(empresa_id, operacao, nome_metrica, created_at);
CREATE INDEX idx_nfe_metric_valor_created_at ON nfe_metric(valor, created_at);
CREATE INDEX idx_nfe_metric_unidade_created_at ON nfe_metric(unidade, created_at);

-- Índices parciais para otimização
CREATE INDEX idx_nfe_status_processando_retry ON nfe_status(created_at) 
    WHERE status = 'PROCESSANDO' AND (proxima_tentativa IS NULL OR proxima_tentativa <= CURRENT_TIMESTAMP);

CREATE INDEX idx_nfe_status_erro_retry ON nfe_status(created_at) 
    WHERE status = 'ERRO' AND tentativas < 5 AND (proxima_tentativa IS NULL OR proxima_tentativa <= CURRENT_TIMESTAMP);

CREATE INDEX idx_nfe_status_autorizadas ON nfe_status(data_autorizacao) 
    WHERE status = 'AUTORIZADA' AND data_autorizacao IS NOT NULL;

CREATE INDEX idx_nfe_status_rejeitadas ON nfe_status(data_emissao) 
    WHERE status = 'REJEITADA';

CREATE INDEX idx_nfe_status_canceladas ON nfe_status(data_cancelamento) 
    WHERE status = 'CANCELADA' AND data_cancelamento IS NOT NULL;

CREATE INDEX idx_nfe_log_erros ON nfe_log(created_at) 
    WHERE status IN ('ERRO', 'REJEITADA');

CREATE INDEX idx_nfe_log_sucessos ON nfe_log(created_at) 
    WHERE status = 'AUTORIZADA';

CREATE INDEX idx_nfe_log_performance ON nfe_log(duracao_ms) 
    WHERE duracao_ms IS NOT NULL;

CREATE INDEX idx_empresa_config_ativas ON empresa_nfe_config(estado, ambiente) 
    WHERE ativa = true;

-- Índices para busca de texto
CREATE INDEX idx_nfe_log_mensagem_text ON nfe_log USING GIN(to_tsvector('portuguese', mensagem));

-- Índices para busca de CNPJ na chave de acesso
CREATE INDEX idx_nfe_status_cnpj_chave ON nfe_status(SUBSTRING(chave_acesso, 1, 14));

-- Índices para busca de data por período
CREATE INDEX idx_nfe_status_data_emissao_ano_mes ON nfe_status(DATE_TRUNC('month', data_emissao));
CREATE INDEX idx_nfe_status_data_emissao_ano ON nfe_status(DATE_TRUNC('year', data_emissao));

CREATE INDEX idx_nfe_log_created_at_ano_mes ON nfe_log(DATE_TRUNC('month', created_at));
CREATE INDEX idx_nfe_log_created_at_ano ON nfe_log(DATE_TRUNC('year', created_at));

CREATE INDEX idx_nfe_metric_created_at_ano_mes ON nfe_metric(DATE_TRUNC('month', created_at));
CREATE INDEX idx_nfe_metric_created_at_ano ON nfe_metric(DATE_TRUNC('year', created_at));

-- Índices para estatísticas
CREATE INDEX idx_nfe_status_empresa_status_count ON nfe_status(empresa_id, status) 
    WHERE status IN ('AUTORIZADA', 'REJEITADA', 'CANCELADA', 'ERRO');

CREATE INDEX idx_nfe_log_empresa_operacao_status_count ON nfe_log(empresa_id, operacao, status);

CREATE INDEX idx_nfe_metric_empresa_nome_metrica_avg ON nfe_metric(empresa_id, nome_metrica, valor);

-- Comentários dos índices
COMMENT ON INDEX idx_nfe_status_processando_retry IS 'Índice para buscar NFes processando para retry';
COMMENT ON INDEX idx_nfe_status_erro_retry IS 'Índice para buscar NFes com erro para retry';
COMMENT ON INDEX idx_nfe_status_autorizadas IS 'Índice para buscar NFes autorizadas';
COMMENT ON INDEX idx_nfe_status_rejeitadas IS 'Índice para buscar NFes rejeitadas';
COMMENT ON INDEX idx_nfe_status_canceladas IS 'Índice para buscar NFes canceladas';
COMMENT ON INDEX idx_nfe_log_erros IS 'Índice para buscar logs de erro';
COMMENT ON INDEX idx_nfe_log_sucessos IS 'Índice para buscar logs de sucesso';
COMMENT ON INDEX idx_nfe_log_performance IS 'Índice para buscar logs de performance';
COMMENT ON INDEX idx_empresa_config_ativas IS 'Índice para buscar configurações ativas';


