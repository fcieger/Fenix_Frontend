package br.com.fenix.nfe.util;

import lombok.extern.slf4j.Slf4j;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;

/**
 * Utilitários para manipulação de XML
 * 
 * @author Fenix Team
 * @version 1.0
 */
@Slf4j
public class XmlUtil {

    private static final DocumentBuilderFactory DOCUMENT_BUILDER_FACTORY = DocumentBuilderFactory.newInstance();
    private static final TransformerFactory TRANSFORMER_FACTORY = TransformerFactory.newInstance();

    static {
        DOCUMENT_BUILDER_FACTORY.setNamespaceAware(true);
        DOCUMENT_BUILDER_FACTORY.setValidating(false);
    }

    /**
     * Converte XML string para Document
     */
    public static Document stringToDocument(String xmlString) {
        try {
            DocumentBuilder builder = DOCUMENT_BUILDER_FACTORY.newDocumentBuilder();
            return builder.parse(new ByteArrayInputStream(xmlString.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("Erro ao converter string para Document: {}", e.getMessage());
            throw new RuntimeException("Erro ao processar XML", e);
        }
    }

    /**
     * Converte Document para XML string formatado
     */
    public static String documentToString(Document document) {
        try {
            Transformer transformer = TRANSFORMER_FACTORY.newTransformer();
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");

            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(document), new StreamResult(writer));
            return writer.toString();
        } catch (Exception e) {
            log.error("Erro ao converter Document para string: {}", e.getMessage());
            throw new RuntimeException("Erro ao formatar XML", e);
        }
    }

    /**
     * Obtém valor de um elemento XML por tag name
     */
    public static String getElementValue(Document document, String tagName) {
        try {
            NodeList nodeList = document.getElementsByTagName(tagName);
            if (nodeList.getLength() > 0) {
                return nodeList.item(0).getTextContent();
            }
            return null;
        } catch (Exception e) {
            log.error("Erro ao obter valor do elemento '{}': {}", tagName, e.getMessage());
            return null;
        }
    }

    /**
     * Obtém valor de um elemento XML por tag name e namespace
     */
    public static String getElementValue(Document document, String namespace, String tagName) {
        try {
            NodeList nodeList = document.getElementsByTagNameNS(namespace, tagName);
            if (nodeList.getLength() > 0) {
                return nodeList.item(0).getTextContent();
            }
            return null;
        } catch (Exception e) {
            log.error("Erro ao obter valor do elemento '{}:{}': {}", namespace, tagName, e.getMessage());
            return null;
        }
    }

    /**
     * Obtém atributo de um elemento XML
     */
    public static String getAttributeValue(Document document, String tagName, String attributeName) {
        try {
            NodeList nodeList = document.getElementsByTagName(tagName);
            if (nodeList.getLength() > 0) {
                Element element = (Element) nodeList.item(0);
                return element.getAttribute(attributeName);
            }
            return null;
        } catch (Exception e) {
            log.error("Erro ao obter atributo '{}' do elemento '{}': {}", attributeName, tagName, e.getMessage());
            return null;
        }
    }

    /**
     * Valida se o XML está bem formado
     */
    public static boolean isValidXml(String xmlString) {
        try {
            stringToDocument(xmlString);
            return true;
        } catch (Exception e) {
            log.debug("XML inválido: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Remove caracteres de controle e formata XML
     */
    public static String cleanAndFormatXml(String xmlString) {
        try {
            // Remove caracteres de controle
            String cleaned = xmlString.replaceAll("[\\x00-\\x1F\\x7F]", "");
            
            // Converte para Document e volta para string formatada
            Document document = stringToDocument(cleaned);
            return documentToString(document);
        } catch (Exception e) {
            log.error("Erro ao limpar e formatar XML: {}", e.getMessage());
            return xmlString;
        }
    }

    /**
     * Extrai chave de acesso do XML da NFe
     */
    public static String extractAccessKey(String nfeXml) {
        try {
            Document document = stringToDocument(nfeXml);
            
            // Tenta diferentes caminhos para encontrar a chave de acesso
            String accessKey = getElementValue(document, "chNFe");
            if (accessKey == null) {
                accessKey = getElementValue(document, "chave");
            }
            if (accessKey == null) {
                accessKey = getAttributeValue(document, "infNFe", "Id");
                if (accessKey != null && accessKey.startsWith("NFe")) {
                    accessKey = accessKey.substring(3); // Remove "NFe" do início
                }
            }
            
            return accessKey;
        } catch (Exception e) {
            log.error("Erro ao extrair chave de acesso do XML: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrai número da NFe do XML
     */
    public static String extractNFeNumber(String nfeXml) {
        try {
            Document document = stringToDocument(nfeXml);
            return getElementValue(document, "nNF");
        } catch (Exception e) {
            log.error("Erro ao extrair número da NFe do XML: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrai série da NFe do XML
     */
    public static String extractNFeSeries(String nfeXml) {
        try {
            Document document = stringToDocument(nfeXml);
            return getElementValue(document, "serie");
        } catch (Exception e) {
            log.error("Erro ao extrair série da NFe do XML: {}", e.getMessage());
            return null;
        }
    }
}
