package br.com.fenix.nfe.api.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para resposta de eventos de NFe
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resposta de eventos de NFe")
public class NFeEventoResponse {

    @Schema(description = "ID do evento", example = "evt-123456789")
    private String idEvento;

    @Schema(description = "Chave de acesso da NFe", example = "12345678901234567890123456789012345678901234")
    private String chaveAcesso;

    @Schema(description = "Tipo do evento", example = "CANCELAMENTO")
    private String tipoEvento;

    @Schema(description = "Sequência do evento", example = "1")
    private Integer sequencia;

    @Schema(description = "Status do evento", example = "PROCESSADO")
    private String statusEvento;

    @Schema(description = "Código de retorno da SEFAZ", example = "135")
    private String codigoRetorno;

    @Schema(description = "Mensagem de retorno da SEFAZ", example = "Evento registrado e vinculado a NF-e")
    private String mensagemRetorno;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Data e hora do processamento", example = "2024-01-22T10:30:00")
    private LocalDateTime dataProcessamento;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Data e hora do evento", example = "2024-01-22T10:25:00")
    private LocalDateTime dataEvento;

    @Schema(description = "Protocolo do evento", example = "123456789012345")
    private String protocoloEvento;

    @Schema(description = "XML do evento")
    private String xmlEvento;

    @Schema(description = "XML de retorno da SEFAZ")
    private String xmlRetorno;

    @Schema(description = "Justificativa do evento", example = "Cancelamento por solicitação do cliente")
    private String justificativa;

    @Schema(description = "CNPJ do autor do evento", example = "12345678000195")
    private String cnpjAutor;

    @Schema(description = "Observações do evento", example = "Evento processado com sucesso")
    private String observacoes;

    @Schema(description = "Detalhes do processamento")
    private List<DetalheProcessamento> detalhes;

    @Schema(description = "URLs de download")
    private UrlsDownload urls;

    @Schema(description = "Metadados do evento")
    private MetadadosEvento metadados;

    /**
     * DTO para detalhes do processamento
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Detalhes do processamento do evento")
    public static class DetalheProcessamento {
        @Schema(description = "Etapa do processamento", example = "VALIDACAO")
        private String etapa;

        @Schema(description = "Status da etapa", example = "SUCESSO")
        private String status;

        @Schema(description = "Mensagem da etapa", example = "Validação concluída com sucesso")
        private String mensagem;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Data e hora da etapa", example = "2024-01-22T10:30:00")
        private LocalDateTime dataHora;

        @Schema(description = "Duração da etapa em ms", example = "150")
        private Long duracaoMs;
    }

    /**
     * DTO para URLs de download
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "URLs de download do evento")
    public static class UrlsDownload {
        @Schema(description = "URL para download do XML do evento")
        private String xmlEvento;

        @Schema(description = "URL para download do XML de retorno")
        private String xmlRetorno;

        @Schema(description = "URL para download do PDF do evento")
        private String pdfEvento;

        @Schema(description = "URL para consulta do evento")
        private String consultaEvento;
    }

    /**
     * DTO para metadados do evento
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Metadados do evento")
    public static class MetadadosEvento {
        @Schema(description = "Versão do schema", example = "1.00")
        private String versaoSchema;

        @Schema(description = "Ambiente do evento", example = "HOMOLOGACAO")
        private String ambiente;

        @Schema(description = "ID da transação", example = "txn-123456789")
        private String idTransacao;

        @Schema(description = "Correlation ID", example = "corr-123456789")
        private String correlationId;

        @Schema(description = "Tags do evento")
        private List<String> tags;
    }
}
