package br.com.fenix.nfe.api.dto.request;

import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;
import br.com.fenix.nfe.model.enums.NFePriorityEnum;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de entrada para emissão de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeRequest {

    @NotBlank(message = "ID da empresa é obrigatório")
    @Size(max = 20, message = "ID da empresa deve ter no máximo 20 caracteres")
    private String empresaId;

    @NotNull(message = "Número da NFe é obrigatório")
    @Min(value = 1, message = "Número da NFe deve ser maior que zero")
    private Integer numeroNfe;

    @NotNull(message = "Série é obrigatória")
    @Min(value = 1, message = "Série deve ser maior que zero")
    private Integer serie;

    @NotNull(message = "Ambiente é obrigatório")
    private NFeAmbienteEnum ambiente;

    @NotNull(message = "Estado é obrigatório")
    private NFeEstadoEnum estado;

    @NotNull(message = "Prioridade é obrigatória")
    private NFePriorityEnum priority;

    @NotBlank(message = "Natureza da operação é obrigatória")
    @Size(max = 100, message = "Natureza da operação deve ter no máximo 100 caracteres")
    private String naturezaOperacao;

    @NotNull(message = "Data de emissão é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataEmissao;

    @NotNull(message = "Data de saída/entrada é obrigatória")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataSaidaEntrada;

    @NotNull(message = "Tipo de NFe é obrigatório")
    @Min(value = 0, message = "Tipo de NFe deve ser 0 ou 1")
    @Max(value = 1, message = "Tipo de NFe deve ser 0 ou 1")
    private Integer tipoNfe;

    @NotNull(message = "Forma de pagamento é obrigatória")
    @Min(value = 0, message = "Forma de pagamento deve ser entre 0 e 3")
    @Max(value = 3, message = "Forma de pagamento deve ser entre 0 e 3")
    private Integer formaPagamento;

    @NotNull(message = "Forma de emissão é obrigatória")
    @Min(value = 1, message = "Forma de emissão deve ser entre 1 e 9")
    @Max(value = 9, message = "Forma de emissão deve ser entre 1 e 9")
    private Integer formaEmissao;

    @NotNull(message = "Finalidade é obrigatória")
    @Min(value = 1, message = "Finalidade deve ser entre 1 e 4")
    @Max(value = 4, message = "Finalidade deve ser entre 1 e 4")
    private Integer finalidade;

    @NotNull(message = "Consumidor final é obrigatório")
    private Boolean consumidorFinal;

    @NotNull(message = "Presença é obrigatória")
    @Min(value = 0, message = "Presença deve ser entre 0 e 9")
    @Max(value = 9, message = "Presença deve ser entre 0 e 9")
    private Integer presenca;

    @Valid
    @NotNull(message = "Emitente é obrigatório")
    private EmitenteRequest emitente;

    @Valid
    @NotNull(message = "Destinatário é obrigatório")
    private DestinatarioRequest destinatario;

    @Valid
    @NotEmpty(message = "Pelo menos um item é obrigatório")
    private List<ItemRequest> itens;

    @Valid
    private TransporteRequest transporte;

    @Valid
    private CobrancaRequest cobranca;

    @Valid
    private InformacoesAdicionaisRequest informacoesAdicionais;

    private String observacoes;

    // Construtores
    public NFeRequest() {
    }

    // Getters e Setters
    public String getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(String empresaId) {
        this.empresaId = empresaId;
    }

    public Integer getNumeroNfe() {
        return numeroNfe;
    }

    public void setNumeroNfe(Integer numeroNfe) {
        this.numeroNfe = numeroNfe;
    }

    public Integer getSerie() {
        return serie;
    }

    public void setSerie(Integer serie) {
        this.serie = serie;
    }

    public NFeAmbienteEnum getAmbiente() {
        return ambiente;
    }

    public void setAmbiente(NFeAmbienteEnum ambiente) {
        this.ambiente = ambiente;
    }

    public NFeEstadoEnum getEstado() {
        return estado;
    }

    public void setEstado(NFeEstadoEnum estado) {
        this.estado = estado;
    }

    public NFePriorityEnum getPriority() {
        return priority;
    }

    public void setPriority(NFePriorityEnum priority) {
        this.priority = priority;
    }

    public String getNaturezaOperacao() {
        return naturezaOperacao;
    }

    public void setNaturezaOperacao(String naturezaOperacao) {
        this.naturezaOperacao = naturezaOperacao;
    }

    public LocalDateTime getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(LocalDateTime dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public LocalDateTime getDataSaidaEntrada() {
        return dataSaidaEntrada;
    }

    public void setDataSaidaEntrada(LocalDateTime dataSaidaEntrada) {
        this.dataSaidaEntrada = dataSaidaEntrada;
    }

    public Integer getTipoNfe() {
        return tipoNfe;
    }

    public void setTipoNfe(Integer tipoNfe) {
        this.tipoNfe = tipoNfe;
    }

    public Integer getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(Integer formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public Integer getFormaEmissao() {
        return formaEmissao;
    }

    public void setFormaEmissao(Integer formaEmissao) {
        this.formaEmissao = formaEmissao;
    }

    public Integer getFinalidade() {
        return finalidade;
    }

    public void setFinalidade(Integer finalidade) {
        this.finalidade = finalidade;
    }

    public Boolean getConsumidorFinal() {
        return consumidorFinal;
    }

    public void setConsumidorFinal(Boolean consumidorFinal) {
        this.consumidorFinal = consumidorFinal;
    }

    public Integer getPresenca() {
        return presenca;
    }

    public void setPresenca(Integer presenca) {
        this.presenca = presenca;
    }

    public EmitenteRequest getEmitente() {
        return emitente;
    }

    public void setEmitente(EmitenteRequest emitente) {
        this.emitente = emitente;
    }

    public DestinatarioRequest getDestinatario() {
        return destinatario;
    }

    public void setDestinatario(DestinatarioRequest destinatario) {
        this.destinatario = destinatario;
    }

    public List<ItemRequest> getItens() {
        return itens;
    }

    public void setItens(List<ItemRequest> itens) {
        this.itens = itens;
    }

    public TransporteRequest getTransporte() {
        return transporte;
    }

    public void setTransporte(TransporteRequest transporte) {
        this.transporte = transporte;
    }

    public CobrancaRequest getCobranca() {
        return cobranca;
    }

    public void setCobranca(CobrancaRequest cobranca) {
        this.cobranca = cobranca;
    }

    public InformacoesAdicionaisRequest getInformacoesAdicionais() {
        return informacoesAdicionais;
    }

    public void setInformacoesAdicionais(InformacoesAdicionaisRequest informacoesAdicionais) {
        this.informacoesAdicionais = informacoesAdicionais;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    // Classes internas para DTOs aninhados
    public static class EmitenteRequest {
        @NotBlank(message = "CNPJ do emitente é obrigatório")
        @Pattern(regexp = "\\d{14}", message = "CNPJ deve ter 14 dígitos")
        private String cnpj;

        @NotBlank(message = "Razão social do emitente é obrigatória")
        @Size(max = 100, message = "Razão social deve ter no máximo 100 caracteres")
        private String razaoSocial;

        @NotBlank(message = "Nome fantasia do emitente é obrigatório")
        @Size(max = 100, message = "Nome fantasia deve ter no máximo 100 caracteres")
        private String nomeFantasia;

        @Valid
        @NotNull(message = "Endereço do emitente é obrigatório")
        private EnderecoRequest endereco;

        @NotBlank(message = "IE do emitente é obrigatória")
        @Size(max = 14, message = "IE deve ter no máximo 14 caracteres")
        private String ie;

        @Size(max = 14, message = "IEST deve ter no máximo 14 caracteres")
        private String iest;

        @Size(max = 14, message = "IM deve ter no máximo 14 caracteres")
        private String im;

        @NotBlank(message = "CNAE do emitente é obrigatório")
        @Pattern(regexp = "\\d{7}", message = "CNAE deve ter 7 dígitos")
        private String cnae;

        @NotNull(message = "CRT do emitente é obrigatório")
        @Min(value = 1, message = "CRT deve ser entre 1 e 3")
        @Max(value = 3, message = "CRT deve ser entre 1 e 3")
        private Integer crt;

        // Getters e Setters
        public String getCnpj() { return cnpj; }
        public void setCnpj(String cnpj) { this.cnpj = cnpj; }
        public String getRazaoSocial() { return razaoSocial; }
        public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
        public String getNomeFantasia() { return nomeFantasia; }
        public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }
        public EnderecoRequest getEndereco() { return endereco; }
        public void setEndereco(EnderecoRequest endereco) { this.endereco = endereco; }
        public String getIe() { return ie; }
        public void setIe(String ie) { this.ie = ie; }
        public String getIest() { return iest; }
        public void setIest(String iest) { this.iest = iest; }
        public String getIm() { return im; }
        public void setIm(String im) { this.im = im; }
        public String getCnae() { return cnae; }
        public void setCnae(String cnae) { this.cnae = cnae; }
        public Integer getCrt() { return crt; }
        public void setCrt(Integer crt) { this.crt = crt; }
    }

    public static class DestinatarioRequest {
        @NotBlank(message = "CNPJ/CPF do destinatário é obrigatório")
        @Pattern(regexp = "\\d{11}|\\d{14}", message = "CNPJ/CPF deve ter 11 ou 14 dígitos")
        private String cnpjCpf;

        @NotBlank(message = "Nome do destinatário é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        private String nome;

        @Valid
        @NotNull(message = "Endereço do destinatário é obrigatório")
        private EnderecoRequest endereco;

        @Size(max = 14, message = "IE deve ter no máximo 14 caracteres")
        private String ie;

        @Email(message = "Email deve ser válido")
        @Size(max = 100, message = "Email deve ter no máximo 100 caracteres")
        private String email;

        // Getters e Setters
        public String getCnpjCpf() { return cnpjCpf; }
        public void setCnpjCpf(String cnpjCpf) { this.cnpjCpf = cnpjCpf; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public EnderecoRequest getEndereco() { return endereco; }
        public void setEndereco(EnderecoRequest endereco) { this.endereco = endereco; }
        public String getIe() { return ie; }
        public void setIe(String ie) { this.ie = ie; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class EnderecoRequest {
        @NotBlank(message = "Logradouro é obrigatório")
        @Size(max = 100, message = "Logradouro deve ter no máximo 100 caracteres")
        private String logradouro;

        @NotBlank(message = "Número é obrigatório")
        @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
        private String numero;

        @Size(max = 50, message = "Complemento deve ter no máximo 50 caracteres")
        private String complemento;

        @NotBlank(message = "Bairro é obrigatório")
        @Size(max = 50, message = "Bairro deve ter no máximo 50 caracteres")
        private String bairro;

        @NotBlank(message = "Código do município é obrigatório")
        @Pattern(regexp = "\\d{7}", message = "Código do município deve ter 7 dígitos")
        private String codigoMunicipio;

        @NotBlank(message = "Nome do município é obrigatório")
        @Size(max = 50, message = "Nome do município deve ter no máximo 50 caracteres")
        private String nomeMunicipio;

        @NotBlank(message = "UF é obrigatória")
        @Pattern(regexp = "[A-Z]{2}", message = "UF deve ter 2 letras maiúsculas")
        private String uf;

        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{8}", message = "CEP deve ter 8 dígitos")
        private String cep;

        @NotBlank(message = "Código do país é obrigatório")
        @Pattern(regexp = "\\d{4}", message = "Código do país deve ter 4 dígitos")
        private String codigoPais;

        @NotBlank(message = "Nome do país é obrigatório")
        @Size(max = 50, message = "Nome do país deve ter no máximo 50 caracteres")
        private String nomePais;

        @Pattern(regexp = "\\d{10,11}", message = "Telefone deve ter 10 ou 11 dígitos")
        private String telefone;

        // Getters e Setters
        public String getLogradouro() { return logradouro; }
        public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
        public String getNumero() { return numero; }
        public void setNumero(String numero) { this.numero = numero; }
        public String getComplemento() { return complemento; }
        public void setComplemento(String complemento) { this.complemento = complemento; }
        public String getBairro() { return bairro; }
        public void setBairro(String bairro) { this.bairro = bairro; }
        public String getCodigoMunicipio() { return codigoMunicipio; }
        public void setCodigoMunicipio(String codigoMunicipio) { this.codigoMunicipio = codigoMunicipio; }
        public String getNomeMunicipio() { return nomeMunicipio; }
        public void setNomeMunicipio(String nomeMunicipio) { this.nomeMunicipio = nomeMunicipio; }
        public String getUf() { return uf; }
        public void setUf(String uf) { this.uf = uf; }
        public String getCep() { return cep; }
        public void setCep(String cep) { this.cep = cep; }
        public String getCodigoPais() { return codigoPais; }
        public void setCodigoPais(String codigoPais) { this.codigoPais = codigoPais; }
        public String getNomePais() { return nomePais; }
        public void setNomePais(String nomePais) { this.nomePais = nomePais; }
        public String getTelefone() { return telefone; }
        public void setTelefone(String telefone) { this.telefone = telefone; }
    }

    public static class ItemRequest {
        @NotNull(message = "Número do item é obrigatório")
        @Min(value = 1, message = "Número do item deve ser maior que zero")
        private Integer numeroItem;

        @NotBlank(message = "Código do produto é obrigatório")
        @Size(max = 20, message = "Código do produto deve ter no máximo 20 caracteres")
        private String codigoProduto;

        @Size(max = 20, message = "GTIN deve ter no máximo 20 caracteres")
        private String gtin;

        @NotBlank(message = "Descrição do produto é obrigatória")
        @Size(max = 200, message = "Descrição do produto deve ter no máximo 200 caracteres")
        private String descricaoProduto;

        @NotBlank(message = "NCM é obrigatório")
        @Pattern(regexp = "\\d{8}", message = "NCM deve ter 8 dígitos")
        private String ncm;

        @Pattern(regexp = "\\d{7}", message = "CEST deve ter 7 dígitos")
        private String cest;

        @NotBlank(message = "CFOP é obrigatório")
        @Pattern(regexp = "\\d{4}", message = "CFOP deve ter 4 dígitos")
        private String cfop;

        @NotBlank(message = "Unidade comercial é obrigatória")
        @Size(max = 10, message = "Unidade comercial deve ter no máximo 10 caracteres")
        private String unidadeComercial;

        @NotNull(message = "Quantidade comercial é obrigatória")
        @DecimalMin(value = "0.0001", message = "Quantidade comercial deve ser maior que zero")
        private BigDecimal quantidadeComercial;

        @NotNull(message = "Valor unitário comercial é obrigatório")
        @DecimalMin(value = "0.00", message = "Valor unitário comercial deve ser maior ou igual a zero")
        private BigDecimal valorUnitarioComercial;

        @NotNull(message = "Valor total do produto é obrigatório")
        @DecimalMin(value = "0.00", message = "Valor total do produto deve ser maior ou igual a zero")
        private BigDecimal valorTotalProduto;

        @NotBlank(message = "Unidade tributável é obrigatória")
        @Size(max = 10, message = "Unidade tributável deve ter no máximo 10 caracteres")
        private String unidadeTributavel;

        @NotNull(message = "Quantidade tributável é obrigatória")
        @DecimalMin(value = "0.0001", message = "Quantidade tributável deve ser maior que zero")
        private BigDecimal quantidadeTributavel;

        @NotNull(message = "Valor unitário tributável é obrigatório")
        @DecimalMin(value = "0.00", message = "Valor unitário tributável deve ser maior ou igual a zero")
        private BigDecimal valorUnitarioTributavel;

        @NotNull(message = "Indicador de total é obrigatório")
        @Min(value = 0, message = "Indicador de total deve ser 0 ou 1")
        @Max(value = 1, message = "Indicador de total deve ser 0 ou 1")
        private Integer indicadorTotal;

        // Getters e Setters
        public Integer getNumeroItem() { return numeroItem; }
        public void setNumeroItem(Integer numeroItem) { this.numeroItem = numeroItem; }
        public String getCodigoProduto() { return codigoProduto; }
        public void setCodigoProduto(String codigoProduto) { this.codigoProduto = codigoProduto; }
        public String getGtin() { return gtin; }
        public void setGtin(String gtin) { this.gtin = gtin; }
        public String getDescricaoProduto() { return descricaoProduto; }
        public void setDescricaoProduto(String descricaoProduto) { this.descricaoProduto = descricaoProduto; }
        public String getNcm() { return ncm; }
        public void setNcm(String ncm) { this.ncm = ncm; }
        public String getCest() { return cest; }
        public void setCest(String cest) { this.cest = cest; }
        public String getCfop() { return cfop; }
        public void setCfop(String cfop) { this.cfop = cfop; }
        public String getUnidadeComercial() { return unidadeComercial; }
        public void setUnidadeComercial(String unidadeComercial) { this.unidadeComercial = unidadeComercial; }
        public BigDecimal getQuantidadeComercial() { return quantidadeComercial; }
        public void setQuantidadeComercial(BigDecimal quantidadeComercial) { this.quantidadeComercial = quantidadeComercial; }
        public BigDecimal getValorUnitarioComercial() { return valorUnitarioComercial; }
        public void setValorUnitarioComercial(BigDecimal valorUnitarioComercial) { this.valorUnitarioComercial = valorUnitarioComercial; }
        public BigDecimal getValorTotalProduto() { return valorTotalProduto; }
        public void setValorTotalProduto(BigDecimal valorTotalProduto) { this.valorTotalProduto = valorTotalProduto; }
        public String getUnidadeTributavel() { return unidadeTributavel; }
        public void setUnidadeTributavel(String unidadeTributavel) { this.unidadeTributavel = unidadeTributavel; }
        public BigDecimal getQuantidadeTributavel() { return quantidadeTributavel; }
        public void setQuantidadeTributavel(BigDecimal quantidadeTributavel) { this.quantidadeTributavel = quantidadeTributavel; }
        public BigDecimal getValorUnitarioTributavel() { return valorUnitarioTributavel; }
        public void setValorUnitarioTributavel(BigDecimal valorUnitarioTributavel) { this.valorUnitarioTributavel = valorUnitarioTributavel; }
        public Integer getIndicadorTotal() { return indicadorTotal; }
        public void setIndicadorTotal(Integer indicadorTotal) { this.indicadorTotal = indicadorTotal; }
    }

    public static class TransporteRequest {
        @NotNull(message = "Modalidade do frete é obrigatória")
        @Min(value = 0, message = "Modalidade do frete deve ser entre 0 e 9")
        @Max(value = 9, message = "Modalidade do frete deve ser entre 0 e 9")
        private Integer modalidadeFrete;

        @Valid
        private TransportadoraRequest transportadora;

        // Getters e Setters
        public Integer getModalidadeFrete() { return modalidadeFrete; }
        public void setModalidadeFrete(Integer modalidadeFrete) { this.modalidadeFrete = modalidadeFrete; }
        public TransportadoraRequest getTransportadora() { return transportadora; }
        public void setTransportadora(TransportadoraRequest transportadora) { this.transportadora = transportadora; }
    }

    public static class TransportadoraRequest {
        @NotBlank(message = "CNPJ/CPF da transportadora é obrigatório")
        @Pattern(regexp = "\\d{11}|\\d{14}", message = "CNPJ/CPF deve ter 11 ou 14 dígitos")
        private String cnpjCpf;

        @NotBlank(message = "Nome da transportadora é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        private String nome;

        @Size(max = 14, message = "IE deve ter no máximo 14 caracteres")
        private String ie;

        @Valid
        private EnderecoRequest endereco;

        // Getters e Setters
        public String getCnpjCpf() { return cnpjCpf; }
        public void setCnpjCpf(String cnpjCpf) { this.cnpjCpf = cnpjCpf; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getIe() { return ie; }
        public void setIe(String ie) { this.ie = ie; }
        public EnderecoRequest getEndereco() { return endereco; }
        public void setEndereco(EnderecoRequest endereco) { this.endereco = endereco; }
    }

    public static class CobrancaRequest {
        @Valid
        private DuplicataRequest duplicata;

        // Getters e Setters
        public DuplicataRequest getDuplicata() { return duplicata; }
        public void setDuplicata(DuplicataRequest duplicata) { this.duplicata = duplicata; }
    }

    public static class DuplicataRequest {
        @NotBlank(message = "Número da duplicata é obrigatório")
        @Size(max = 20, message = "Número da duplicata deve ter no máximo 20 caracteres")
        private String numero;

        @NotNull(message = "Data de vencimento é obrigatória")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDateTime dataVencimento;

        @NotNull(message = "Valor da duplicata é obrigatório")
        @DecimalMin(value = "0.00", message = "Valor da duplicata deve ser maior ou igual a zero")
        private BigDecimal valor;

        // Getters e Setters
        public String getNumero() { return numero; }
        public void setNumero(String numero) { this.numero = numero; }
        public LocalDateTime getDataVencimento() { return dataVencimento; }
        public void setDataVencimento(LocalDateTime dataVencimento) { this.dataVencimento = dataVencimento; }
        public BigDecimal getValor() { return valor; }
        public void setValor(BigDecimal valor) { this.valor = valor; }
    }

    public static class InformacoesAdicionaisRequest {
        @Size(max = 5000, message = "Informações adicionais devem ter no máximo 5000 caracteres")
        private String informacoesAdicionais;

        @Size(max = 5000, message = "Informações complementares devem ter no máximo 5000 caracteres")
        private String informacoesComplementares;

        // Getters e Setters
        public String getInformacoesAdicionais() { return informacoesAdicionais; }
        public void setInformacoesAdicionais(String informacoesAdicionais) { this.informacoesAdicionais = informacoesAdicionais; }
        public String getInformacoesComplementares() { return informacoesComplementares; }
        public void setInformacoesComplementares(String informacoesComplementares) { this.informacoesComplementares = informacoesComplementares; }
    }
}

