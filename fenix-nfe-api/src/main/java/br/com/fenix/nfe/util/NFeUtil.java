package br.com.fenix.nfe.util;

import br.com.fenix.nfe.model.enums.NFeAmbienteEnum;
import br.com.fenix.nfe.model.enums.NFeEstadoEnum;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utilitários para NFe
 * 
 * @author Fenix Team
 * @version 1.0.0
 */
public class NFeUtil {

    /**
     * Gera chave de acesso da NFe
     * 
     * @param codigoUf Código da UF
     * @param dataEmissao Data de emissão
     * @param cnpj CNPJ do emitente
     * @param serie Série da NFe
     * @param numeroNfe Número da NFe
     * @param codigoAmbiente Código do ambiente
     * @return Chave de acesso
     */
    public static String gerarChaveAcesso(int codigoUf, LocalDateTime dataEmissao, String cnpj, 
                                        Integer serie, Integer numeroNfe, int codigoAmbiente) {
        StringBuilder chave = new StringBuilder();
        
        // Código da UF (2 dígitos)
        chave.append(String.format("%02d", codigoUf));
        
        // Ano e mês de emissão (4 dígitos)
        chave.append(dataEmissao.format(DateTimeFormatter.ofPattern("yyMM")));
        
        // CNPJ (14 dígitos)
        chave.append(cnpj);
        
        // Modelo do documento (2 dígitos) - sempre 55 para NFe
        chave.append("55");
        
        // Série (3 dígitos)
        chave.append(String.format("%03d", serie));
        
        // Número da NFe (9 dígitos)
        chave.append(String.format("%09d", numeroNfe));
        
        // Tipo de emissão (1 dígito) - sempre 1 para emissão normal
        chave.append("1");
        
        // Código numérico (8 dígitos) - gerado aleatoriamente
        chave.append(String.format("%08d", (int) (Math.random() * 100000000)));
        
        // Código do ambiente (1 dígito)
        chave.append(codigoAmbiente);
        
        // Calcular dígito verificador
        String chaveSemDV = chave.toString();
        int dv = calcularDigitoVerificador(chaveSemDV);
        chave.append(dv);
        
        return chave.toString();
    }

    /**
     * Calcula dígito verificador da chave de acesso
     * 
     * @param chave Chave sem dígito verificador
     * @return Dígito verificador
     */
    private static int calcularDigitoVerificador(String chave) {
        int soma = 0;
        int peso = 2;
        
        // Percorrer a chave de trás para frente
        for (int i = chave.length() - 1; i >= 0; i--) {
            int digito = Character.getNumericValue(chave.charAt(i));
            soma += digito * peso;
            peso = peso == 9 ? 2 : peso + 1;
        }
        
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    /**
     * Valida CNPJ
     * 
     * @param cnpj CNPJ a ser validado
     * @return true se válido
     */
    public static boolean validarCnpj(String cnpj) {
        if (cnpj == null || cnpj.length() != 14) {
            return false;
        }
        
        // Verificar se todos os dígitos são iguais
        if (cnpj.matches("(\\d)\\1{13}")) {
            return false;
        }
        
        // Calcular primeiro dígito verificador
        int soma = 0;
        int peso = 5;
        for (int i = 0; i < 12; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * peso;
            peso = peso == 2 ? 9 : peso - 1;
        }
        
        int dv1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (Character.getNumericValue(cnpj.charAt(12)) != dv1) {
            return false;
        }
        
        // Calcular segundo dígito verificador
        soma = 0;
        peso = 6;
        for (int i = 0; i < 13; i++) {
            soma += Character.getNumericValue(cnpj.charAt(i)) * peso;
            peso = peso == 2 ? 9 : peso - 1;
        }
        
        int dv2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        return Character.getNumericValue(cnpj.charAt(13)) == dv2;
    }

    /**
     * Valida CPF
     * 
     * @param cpf CPF a ser validado
     * @return true se válido
     */
    public static boolean validarCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return false;
        }
        
        // Verificar se todos os dígitos são iguais
        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }
        
        // Calcular primeiro dígito verificador
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }
        
        int dv1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (Character.getNumericValue(cpf.charAt(9)) != dv1) {
            return false;
        }
        
        // Calcular segundo dígito verificador
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }
        
        int dv2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        return Character.getNumericValue(cpf.charAt(10)) == dv2;
    }

    /**
     * Valida chave de acesso
     * 
     * @param chaveAcesso Chave de acesso a ser validada
     * @return true se válida
     */
    public static boolean validarChaveAcesso(String chaveAcesso) {
        if (chaveAcesso == null || chaveAcesso.length() != 44) {
            return false;
        }
        
        // Verificar se contém apenas dígitos
        if (!chaveAcesso.matches("\\d{44}")) {
            return false;
        }
        
        // Calcular dígito verificador
        String chaveSemDV = chaveAcesso.substring(0, 43);
        int dvCalculado = calcularDigitoVerificador(chaveSemDV);
        int dvInformado = Character.getNumericValue(chaveAcesso.charAt(43));
        
        return dvCalculado == dvInformado;
    }

    /**
     * Formata CNPJ
     * 
     * @param cnpj CNPJ sem formatação
     * @return CNPJ formatado
     */
    public static String formatarCnpj(String cnpj) {
        if (cnpj == null || cnpj.length() != 14) {
            return cnpj;
        }
        return cnpj.substring(0, 2) + "." + cnpj.substring(2, 5) + "." + 
               cnpj.substring(5, 8) + "/" + cnpj.substring(8, 12) + "-" + cnpj.substring(12);
    }

    /**
     * Formata CPF
     * 
     * @param cpf CPF sem formatação
     * @return CPF formatado
     */
    public static String formatarCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return cpf;
        }
        return cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + 
               cpf.substring(6, 9) + "-" + cpf.substring(9);
    }

    /**
     * Formata CEP
     * 
     * @param cep CEP sem formatação
     * @return CEP formatado
     */
    public static String formatarCep(String cep) {
        if (cep == null || cep.length() != 8) {
            return cep;
        }
        return cep.substring(0, 5) + "-" + cep.substring(5);
    }

    /**
     * Remove formatação de CNPJ/CPF
     * 
     * @param documento Documento formatado
     * @return Documento sem formatação
     */
    public static String removerFormatacao(String documento) {
        if (documento == null) {
            return null;
        }
        return documento.replaceAll("[^0-9]", "");
    }

    /**
     * Obtém código da UF para SEFAZ
     * 
     * @param estado Estado
     * @return Código da UF
     */
    public static int obterCodigoUf(NFeEstadoEnum estado) {
        return estado.getCodigoSefaz();
    }

    /**
     * Obtém código do ambiente para SEFAZ
     * 
     * @param ambiente Ambiente
     * @return Código do ambiente
     */
    public static int obterCodigoAmbiente(NFeAmbienteEnum ambiente) {
        return ambiente.getCodigoSefaz();
    }

    /**
     * Gera número aleatório para código numérico
     * 
     * @return Número aleatório de 8 dígitos
     */
    public static String gerarCodigoNumerico() {
        return String.format("%08d", (int) (Math.random() * 100000000));
    }

    /**
     * Valida se a data está no formato correto
     * 
     * @param data Data a ser validada
     * @return true se válida
     */
    public static boolean validarData(LocalDateTime data) {
        return data != null && data.isBefore(LocalDateTime.now().plusDays(1));
    }

    /**
     * Obtém timestamp atual em formato ISO
     * 
     * @return Timestamp atual
     */
    public static String obterTimestampAtual() {
        return LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
