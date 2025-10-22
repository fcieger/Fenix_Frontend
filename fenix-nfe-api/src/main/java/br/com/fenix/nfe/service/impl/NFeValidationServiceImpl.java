package br.com.fenix.nfe.service.impl;

import br.com.fenix.nfe.api.dto.request.NFeRequest;
import br.com.fenix.nfe.service.NFeValidationService;
import br.com.fenix.nfe.util.NFeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.util.regex.Pattern;

/**
 * Implementação do serviço de validações de NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
@Service
public class NFeValidationServiceImpl implements NFeValidationService {

    private static final Logger logger = LoggerFactory.getLogger(NFeValidationServiceImpl.class);

    // Padrões de validação
    private static final Pattern CNPJ_PATTERN = Pattern.compile("\\d{14}");
    private static final Pattern CPF_PATTERN = Pattern.compile("\\d{11}");
    private static final Pattern CEP_PATTERN = Pattern.compile("\\d{8}");
    private static final Pattern NCM_PATTERN = Pattern.compile("\\d{8}");
    private static final Pattern CFOP_PATTERN = Pattern.compile("\\d{4}");
    private static final Pattern CHAVE_ACESSO_PATTERN = Pattern.compile("\\d{44}");

    @Override
    public void validarNFeRequest(NFeRequest request) {
        logger.debug("Validando dados da NFe para empresa: {}", request.getEmpresaId());
        
        try {
            // Validar empresa
            if (request.getEmpresaId() == null || request.getEmpresaId().trim().isEmpty()) {
                throw new IllegalArgumentException("ID da empresa é obrigatório");
            }

            // Validar dados básicos
            if (request.getNumeroNfe() == null || request.getNumeroNfe() <= 0) {
                throw new IllegalArgumentException("Número da NFe deve ser maior que zero");
            }

            if (request.getSerie() == null || request.getSerie() <= 0) {
                throw new IllegalArgumentException("Série deve ser maior que zero");
            }

            if (request.getAmbiente() == null) {
                throw new IllegalArgumentException("Ambiente é obrigatório");
            }

            if (request.getEstado() == null) {
                throw new IllegalArgumentException("Estado é obrigatório");
            }

            // Validar emitente
            validarEmitente(request);

            // Validar destinatário
            validarDestinatario(request);

            // Validar itens
            validarItens(request);

            logger.debug("Validação da NFe concluída com sucesso");

        } catch (Exception e) {
            logger.error("Erro na validação da NFe: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Erro na validação: " + e.getMessage(), e);
        }
    }

    @Override
    public void validarXml(String xml) {
        logger.debug("Validando XML da NFe");
        
        try {
            if (xml == null || xml.trim().isEmpty()) {
                throw new IllegalArgumentException("XML não pode ser vazio");
            }

            // Validar estrutura XML
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            builder.parse(new java.io.ByteArrayInputStream(xml.getBytes()));

            logger.debug("XML válido");

        } catch (Exception e) {
            logger.error("Erro na validação do XML: {}", e.getMessage(), e);
            throw new IllegalArgumentException("XML inválido: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean validarCnpj(String cnpj) {
        if (cnpj == null || !CNPJ_PATTERN.matcher(cnpj).matches()) {
            return false;
        }
        return NFeUtil.validarCnpj(cnpj);
    }

    @Override
    public boolean validarCpf(String cpf) {
        if (cpf == null || !CPF_PATTERN.matcher(cpf).matches()) {
            return false;
        }
        return NFeUtil.validarCpf(cpf);
    }

    @Override
    public boolean validarCep(String cep) {
        return cep != null && CEP_PATTERN.matcher(cep).matches();
    }

    @Override
    public boolean validarNcm(String ncm) {
        return ncm != null && NCM_PATTERN.matcher(ncm).matches();
    }

    @Override
    public boolean validarCfop(String cfop) {
        return cfop != null && CFOP_PATTERN.matcher(cfop).matches();
    }

    @Override
    public boolean validarChaveAcesso(String chaveAcesso) {
        if (chaveAcesso == null || !CHAVE_ACESSO_PATTERN.matcher(chaveAcesso).matches()) {
            return false;
        }
        return NFeUtil.validarChaveAcesso(chaveAcesso);
    }

    @Override
    public boolean validarCertificado(String caminhoCertificado, String senhaCertificado) {
        if (caminhoCertificado == null || caminhoCertificado.trim().isEmpty()) {
            return false;
        }
        if (senhaCertificado == null || senhaCertificado.trim().isEmpty()) {
            return false;
        }

        try {
            File arquivo = new File(caminhoCertificado);
            return arquivo.exists() && arquivo.isFile() && arquivo.canRead();
        } catch (Exception e) {
            logger.error("Erro ao validar certificado: {}", e.getMessage(), e);
            return false;
        }
    }

    // Métodos auxiliares
    private void validarEmitente(NFeRequest request) {
        if (request.getEmitente() == null) {
            throw new IllegalArgumentException("Emitente é obrigatório");
        }

        NFeRequest.EmitenteRequest emitente = request.getEmitente();

        if (emitente.getCnpj() == null || !validarCnpj(emitente.getCnpj())) {
            throw new IllegalArgumentException("CNPJ do emitente inválido");
        }

        if (emitente.getRazaoSocial() == null || emitente.getRazaoSocial().trim().isEmpty()) {
            throw new IllegalArgumentException("Razão social do emitente é obrigatória");
        }

        if (emitente.getEndereco() == null) {
            throw new IllegalArgumentException("Endereço do emitente é obrigatório");
        }

        validarEndereco(emitente.getEndereco(), "emitente");
    }

    private void validarDestinatario(NFeRequest request) {
        if (request.getDestinatario() == null) {
            throw new IllegalArgumentException("Destinatário é obrigatório");
        }

        NFeRequest.DestinatarioRequest destinatario = request.getDestinatario();

        if (destinatario.getCnpjCpf() == null) {
            throw new IllegalArgumentException("CNPJ/CPF do destinatário é obrigatório");
        }

        if (!validarCnpj(destinatario.getCnpjCpf()) && !validarCpf(destinatario.getCnpjCpf())) {
            throw new IllegalArgumentException("CNPJ/CPF do destinatário inválido");
        }

        if (destinatario.getNome() == null || destinatario.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do destinatário é obrigatório");
        }

        if (destinatario.getEndereco() == null) {
            throw new IllegalArgumentException("Endereço do destinatário é obrigatório");
        }

        validarEndereco(destinatario.getEndereco(), "destinatário");
    }

    private void validarEndereco(NFeRequest.EnderecoRequest endereco, String tipo) {
        if (endereco.getLogradouro() == null || endereco.getLogradouro().trim().isEmpty()) {
            throw new IllegalArgumentException("Logradouro do " + tipo + " é obrigatório");
        }

        if (endereco.getNumero() == null || endereco.getNumero().trim().isEmpty()) {
            throw new IllegalArgumentException("Número do " + tipo + " é obrigatório");
        }

        if (endereco.getBairro() == null || endereco.getBairro().trim().isEmpty()) {
            throw new IllegalArgumentException("Bairro do " + tipo + " é obrigatório");
        }

        if (endereco.getCodigoMunicipio() == null || !endereco.getCodigoMunicipio().matches("\\d{7}")) {
            throw new IllegalArgumentException("Código do município do " + tipo + " deve ter 7 dígitos");
        }

        if (endereco.getNomeMunicipio() == null || endereco.getNomeMunicipio().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do município do " + tipo + " é obrigatório");
        }

        if (endereco.getUf() == null || !endereco.getUf().matches("[A-Z]{2}")) {
            throw new IllegalArgumentException("UF do " + tipo + " deve ter 2 letras maiúsculas");
        }

        if (endereco.getCep() == null || !validarCep(endereco.getCep())) {
            throw new IllegalArgumentException("CEP do " + tipo + " inválido");
        }
    }

    private void validarItens(NFeRequest request) {
        if (request.getItens() == null || request.getItens().isEmpty()) {
            throw new IllegalArgumentException("Pelo menos um item é obrigatório");
        }

        for (NFeRequest.ItemRequest item : request.getItens()) {
            validarItem(item);
        }
    }

    private void validarItem(NFeRequest.ItemRequest item) {
        if (item.getNumeroItem() == null || item.getNumeroItem() <= 0) {
            throw new IllegalArgumentException("Número do item deve ser maior que zero");
        }

        if (item.getCodigoProduto() == null || item.getCodigoProduto().trim().isEmpty()) {
            throw new IllegalArgumentException("Código do produto é obrigatório");
        }

        if (item.getDescricaoProduto() == null || item.getDescricaoProduto().trim().isEmpty()) {
            throw new IllegalArgumentException("Descrição do produto é obrigatória");
        }

        if (item.getNcm() == null || !validarNcm(item.getNcm())) {
            throw new IllegalArgumentException("NCM inválido");
        }

        if (item.getCfop() == null || !validarCfop(item.getCfop())) {
            throw new IllegalArgumentException("CFOP inválido");
        }

        if (item.getUnidadeComercial() == null || item.getUnidadeComercial().trim().isEmpty()) {
            throw new IllegalArgumentException("Unidade comercial é obrigatória");
        }

        if (item.getQuantidadeComercial() == null || item.getQuantidadeComercial().doubleValue() <= 0) {
            throw new IllegalArgumentException("Quantidade comercial deve ser maior que zero");
        }

        if (item.getValorUnitarioComercial() == null || item.getValorUnitarioComercial().doubleValue() < 0) {
            throw new IllegalArgumentException("Valor unitário comercial deve ser maior ou igual a zero");
        }

        if (item.getValorTotalProduto() == null || item.getValorTotalProduto().doubleValue() < 0) {
            throw new IllegalArgumentException("Valor total do produto deve ser maior ou igual a zero");
        }
    }
}
