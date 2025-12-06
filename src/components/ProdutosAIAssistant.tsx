"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, ArrowLeft, Sparkles, Package } from "lucide-react";
import { createProduct } from "@/services/products-service";
import type { CreateProductDto } from "@/types/sdk";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: string;
}

interface ProdutosAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData?: (data: any) => void;
}

export default function ProdutosAIAssistant({
  isOpen,
  onClose,
  onApplyData,
}: ProdutosAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Olá! Sou seu assistente de IA para criação de produtos. Descreva o produto que você gostaria de cadastrar e eu vou ajudá-lo a criar todos os dados necessários.",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simular processamento da IA
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Processar apenas o que o usuário enviou
      const processedData = await processUserInput(inputValue);

      // Criar mensagem detalhada com dados extraídos
      let content = `Perfeito! Identifiquei e extraí os seguintes dados do produto:\n\n`;

      content += `**Nome do Produto:** ${processedData.nome}\n`;
      if (processedData.categoria) {
        content += `**Categoria:** ${processedData.categoria}\n`;
      }
      if (processedData.marca) {
        content += `**Marca:** ${processedData.marca}\n`;
      }
      if (processedData.modelo) {
        content += `**Modelo:** ${processedData.modelo}\n`;
      }
      content += `**Unidade de Medida:** ${processedData.unidadeMedida}\n\n`;

      // Mostrar dados extraídos se existirem
      if (processedData.precoCusto) {
        content += `**Preço de Custo:** R$ ${processedData.precoCusto}\n`;
      }
      if (processedData.precoVenda) {
        content += `**Preço de Venda:** R$ ${processedData.precoVenda}\n`;
      }
      if (processedData.descricao) {
        content += `**Descrição:** ${processedData.descricao}\n`;
      }
      if (processedData.codigoBarras) {
        content += `**Código de Barras:** ${processedData.codigoBarras}\n`;
      }
      if (processedData.ncm) {
        content += `**NCM:** ${processedData.ncm}\n`;
      }
      if (processedData.cest) {
        content += `**CEST:** ${processedData.cest}\n`;
      }
      if (processedData.origem) {
        content += `**Origem:** ${processedData.origem}\n`;
      }

      // Especificações técnicas se existirem
      if (processedData.especificacoes) {
        content += `\n**Especificações Técnicas:**\n`;
        if (processedData.especificacoes.comprimento) {
          content += `- Comprimento: ${processedData.especificacoes.comprimento} cm\n`;
        }
        if (processedData.especificacoes.largura) {
          content += `- Largura: ${processedData.especificacoes.largura} cm\n`;
        }
        if (processedData.especificacoes.altura) {
          content += `- Altura: ${processedData.especificacoes.altura} cm\n`;
        }
        if (processedData.especificacoes.peso) {
          content += `- Peso: ${processedData.especificacoes.peso} kg\n`;
        }
        if (processedData.especificacoes.material) {
          content += `- Material: ${processedData.especificacoes.material}\n`;
        }
        if (processedData.especificacoes.cor) {
          content += `- Cor: ${processedData.especificacoes.cor}\n`;
        }
      }

      content += `\nClique em "${
        onApplyData ? "Aplicar ao Formulário" : "Cadastrar Produto"
      }" para ${onApplyData ? "preencher o formulário" : "salvar"}!`;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Armazenar dados processados para aplicação
      (window as any).generatedProdutoData = processedData;
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processUserInput = async (userInput: string) => {
    console.log("🔍 Processando input do produto:", userInput);

    // Extrair campos específicos do texto
    const extractedData = extractFieldsFromText(userInput);
    console.log("📋 Dados extraídos do produto:", extractedData);

    return {
      ...extractedData,
      originalInput: userInput,
      processedAt: new Date().toISOString(),
    };
  };

  const extractFieldsFromText = (text: string) => {
    const lowerText = text.toLowerCase();

    // Extrair nome do produto de forma mais inteligente
    let nome = text;

    // Remover comandos de cadastro
    nome = nome.replace(
      /\b(cadastre|cadastrar|crie|criar|inclua|incluir|adicione|adicionar|insira|inserir|registre|registrar|produto|item|artigo|mercadoria|bem)\b/gi,
      ""
    );

    // Remover artigos e preposições
    nome = nome.replace(/\b(o|a|os|as|um|uma|uns|umas)\b/gi, "");
    nome = nome.replace(
      /\b(da|do|das|dos|de|em|na|no|nas|nos|para|com|por|sobre|entre|através|mediante|que|qual|quem|onde|quando|como)\b/gi,
      ""
    );

    // Remover palavras técnicas que não fazem parte do nome
    nome = nome.replace(
      /\b(preço|preco|valor|custo|venda|marca|modelo|categoria|unidade|medida|peso|comprimento|largura|altura|material|cor|descrição|descricao|tipo|classe|grupo)\b/gi,
      ""
    );

    // Remover valores monetários e unidades
    nome = nome.replace(
      /\b\d+[.,]?\d*\s*(reais|r\$|rs|kg|g|cm|m|ml|l|un|pc|cx|dz|gr|metros|centimetros|quilogramas|gramas|litros|mililitros|unidade|unidades)\b/gi,
      ""
    );

    // Remover valores monetários isolados
    nome = nome.replace(/\b\d+[.,]?\d*\b/g, "");

    // Remover unidades isoladas que sobraram
    nome = nome.replace(/\b(un|kg|g|l|ml|m|cm|pc|cx|dz|gr)\b/gi, "");

    // Remover hífens e traços desnecessários
    nome = nome.replace(/^[\s\-]+|[\s\-]+$/g, "");
    nome = nome.replace(/\s*-\s*/g, " ");

    // Remover códigos de barras
    nome = nome.replace(/\b\d{8,14}\b/g, "");

    // Remover NCM e CEST
    nome = nome.replace(/\b(ncm|cest)[\s:]*\d+\b/gi, "");

    // Limpar espaços extras
    nome = nome.replace(/\s+/g, " ").trim();

    // Se o nome ficou muito curto ou vazio, tentar extrair de forma diferente
    if (nome.length < 3) {
      // Tentar extrair apenas a parte principal do produto
      const palavras = text.split(/\s+/);
      const palavrasImportantes = palavras.filter(
        (palavra) =>
          palavra.length > 2 &&
          !/\b(cadastre|cadastrar|crie|criar|inclua|incluir|adicione|adicionar|insira|inserir|registre|registrar|produto|item|artigo|mercadoria|bem|preço|preco|valor|custo|venda|marca|modelo|categoria|unidade|medida|peso|comprimento|largura|altura|material|cor|descrição|descricao|tipo|classe|grupo|com|por|para|de|da|do|das|dos|em|na|no|nas|nos|o|a|os|as|um|uma|uns|umas)\b/gi.test(
            palavra
          ) &&
          !/^\d+[.,]?\d*$/.test(palavra) && // Não é número
          !/^\d{8,14}$/.test(palavra) // Não é código de barras
      );
      nome = palavrasImportantes.join(" ");
    }

    // Se ainda estiver vazio, usar o texto original limpo
    if (!nome || nome.length < 2) {
      nome = text
        .replace(
          /\b(cadastre|cadastrar|crie|criar|inclua|incluir|adicione|adicionar|insira|inserir|registre|registrar|produto|item|artigo|mercadoria|bem)\b/gi,
          ""
        )
        .trim();
    }

    // Extrair preços com melhor reconhecimento
    let precoCusto = null;
    let precoVenda = null;

    // Primeiro, tentar extrair preço de venda (mais comum)
    const precoVendaMatch = text.match(
      /\b(?:venda|preço\s*venda|preco\s*venda|valor\s*venda|preço\s*de\s*venda|preco\s*de\s*venda|valor\s*de\s*venda|preço|preco|valor|por|r\$)[\s:]*r?\$?\s*(\d+[.,]?\d*)/i
    );
    if (precoVendaMatch) {
      precoVenda = precoVendaMatch[1].replace(",", ".");
    }

    // Se não encontrou preço de venda, tentar qualquer valor mencionado
    if (!precoVenda) {
      const valorMatch = text.match(/\b(?:r\$|rs|reais?)[\s:]*(\d+[.,]?\d*)/i);
      if (valorMatch) {
        precoVenda = valorMatch[1].replace(",", ".");
      }
    }

    // Se ainda não encontrou, tentar qualquer número que pareça preço
    if (!precoVenda) {
      const numeroMatch = text.match(
        /\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\b/
      );
      if (numeroMatch) {
        precoVenda = numeroMatch[1].replace(/\./g, "").replace(",", ".");
      }
    }

    // Extrair preço de custo
    const precoCustoMatch = text.match(
      /\b(?:custo|preço\s*custo|preco\s*custo|valor\s*custo|preço\s*de\s*custo|preco\s*de\s*custo)[\s:]*r?\$?\s*(\d+[.,]?\d*)/i
    );
    if (precoCustoMatch) {
      precoCusto = precoCustoMatch[1].replace(",", ".");
    }

    // Extrair marca - apenas se explicitamente mencionada
    let marca = null;
    const marcaMatch = text.match(
      /\b(?:marca|brand)[\s:]*([a-záàâãéèêíìîóòôõúùûç\s]+)/i
    );
    if (marcaMatch) {
      marca = marcaMatch[1].trim();
    }

    // Extrair modelo
    const modeloMatch = text.match(
      /\b(?:modelo|model)[\s:]*([a-záàâãéèêíìîóòôõúùûç0-9\s\-]+)/i
    );
    const modelo = modeloMatch ? modeloMatch[1].trim() : null;

    // Extrair categoria
    const categoriaMatch = text.match(
      /\b(?:categoria|category|tipo)[\s:]*([a-záàâãéèêíìîóòôõúùûç\s]+)/i
    );
    const categoria = categoriaMatch ? categoriaMatch[1].trim() : null;

    // Extrair código de barras
    const codigoBarrasMatch = text.match(
      /\b(?:código|codigo|barras|ean|upc)[\s:]*(\d{8,14})\b/i
    );
    const codigoBarras = codigoBarrasMatch ? codigoBarrasMatch[1] : null;

    // Extrair NCM - apenas se explicitamente mencionado
    let ncm = null;
    const ncmMatch = text.match(/\b(?:ncm)[\s:]*(\d{8})\b/i);
    if (ncmMatch) {
      ncm = ncmMatch[1];
    }

    // Extrair CEST
    const cestMatch = text.match(/\b(?:cest)[\s:]*(\d{7})\b/i);
    const cest = cestMatch ? cestMatch[1] : null;

    // Extrair unidade de medida com melhor reconhecimento
    let unidadeMedida = "UN";

    // Primeiro, tentar extrair unidade explicitamente mencionada
    const unidadeMatch = text.match(
      /\b(?:unidade|medida|un)[\s:]*([a-záàâãéèêíìîóòôõúùûç0-9\s\(\)]+)/i
    );
    if (unidadeMatch) {
      const unidade = unidadeMatch[1].toUpperCase();
      if (
        unidade.includes("KG") ||
        unidade.includes("QUILO") ||
        unidade.includes("QUILOGRAMA")
      )
        unidadeMedida = "KG";
      else if (
        unidade.includes("G") ||
        unidade.includes("GRAMA") ||
        unidade.includes("GRAMAS")
      )
        unidadeMedida = "G";
      else if (
        unidade.includes("L") ||
        unidade.includes("LITRO") ||
        unidade.includes("LITROS")
      )
        unidadeMedida = "L";
      else if (
        unidade.includes("ML") ||
        unidade.includes("MILILITRO") ||
        unidade.includes("MILILITROS")
      )
        unidadeMedida = "ML";
      else if (
        unidade.includes("M") ||
        unidade.includes("METRO") ||
        unidade.includes("METROS")
      )
        unidadeMedida = "M";
      else if (
        unidade.includes("CM") ||
        unidade.includes("CENTIMETRO") ||
        unidade.includes("CENTIMETROS")
      )
        unidadeMedida = "CM";
      else if (
        unidade.includes("M2") ||
        unidade.includes("M²") ||
        unidade.includes("METRO QUADRADO")
      )
        unidadeMedida = "M2";
      else if (
        unidade.includes("M3") ||
        unidade.includes("M³") ||
        unidade.includes("METRO CUBICO")
      )
        unidadeMedida = "M3";
      else if (
        unidade.includes("CX") ||
        unidade.includes("CAIXA") ||
        unidade.includes("CAIXAS")
      )
        unidadeMedida = "CX";
      else if (
        unidade.includes("PC") ||
        unidade.includes("PEÇA") ||
        unidade.includes("PEÇAS")
      )
        unidadeMedida = "PC";
      else if (
        unidade.includes("DZ") ||
        unidade.includes("DÚZIA") ||
        unidade.includes("DUZIA")
      )
        unidadeMedida = "DZ";
      else if (
        unidade.includes("GR") ||
        unidade.includes("GROSA") ||
        unidade.includes("GROSAS")
      )
        unidadeMedida = "GR";
      else if (
        unidade.includes("UN") ||
        unidade.includes("UNIDADE") ||
        unidade.includes("UNIDADES")
      )
        unidadeMedida = "UN";
    } else {
      // Detectar unidade por palavras-chave no texto (mais inteligente)
      // Priorizar detecção de "UN" quando mencionado explicitamente
      if (
        lowerText.includes("unidade") ||
        lowerText.includes("unidades") ||
        lowerText.includes("un ")
      ) {
        unidadeMedida = "UN";
      } else if (
        lowerText.includes("quilograma") ||
        lowerText.includes("quilo") ||
        lowerText.includes("kg")
      ) {
        unidadeMedida = "KG";
      } else if (
        lowerText.includes("grama") ||
        lowerText.includes("gramas") ||
        lowerText.includes("g ")
      ) {
        unidadeMedida = "G";
      } else if (
        lowerText.includes("litro") ||
        lowerText.includes("litros") ||
        lowerText.includes("l ")
      ) {
        unidadeMedida = "L";
      } else if (lowerText.includes("mililitro") || lowerText.includes("ml")) {
        unidadeMedida = "ML";
      } else if (
        lowerText.includes("metro") ||
        lowerText.includes("metros") ||
        lowerText.includes("m ")
      ) {
        unidadeMedida = "M";
      } else if (lowerText.includes("centimetro") || lowerText.includes("cm")) {
        unidadeMedida = "CM";
      } else if (lowerText.includes("caixa") || lowerText.includes("cx")) {
        unidadeMedida = "CX";
      } else if (
        lowerText.includes("peça") ||
        lowerText.includes("peca") ||
        lowerText.includes("pc")
      ) {
        unidadeMedida = "PC";
      } else if (
        lowerText.includes("dúzia") ||
        lowerText.includes("duzia") ||
        lowerText.includes("dz")
      ) {
        unidadeMedida = "DZ";
      } else if (lowerText.includes("grosa") || lowerText.includes("gr")) {
        unidadeMedida = "GR";
      }
    }

    // Extrair especificações técnicas
    const especificacoes: any = {};

    // Dimensões
    const comprimentoMatch = text.match(
      /\b(?:comprimento|length)[\s:]*(\d+[.,]?\d*)\s*(?:cm|m|mm)?/i
    );
    if (comprimentoMatch) especificacoes.comprimento = comprimentoMatch[1];

    const larguraMatch = text.match(
      /\b(?:largura|width)[\s:]*(\d+[.,]?\d*)\s*(?:cm|m|mm)?/i
    );
    if (larguraMatch) especificacoes.largura = larguraMatch[1];

    const alturaMatch = text.match(
      /\b(?:altura|height)[\s:]*(\d+[.,]?\d*)\s*(?:cm|m|mm)?/i
    );
    if (alturaMatch) especificacoes.altura = alturaMatch[1];

    // Peso
    const pesoMatch = text.match(
      /\b(?:peso|weight)[\s:]*(\d+[.,]?\d*)\s*(?:kg|g|gramas|quilos)?/i
    );
    if (pesoMatch) especificacoes.peso = pesoMatch[1];

    // Material
    const materialMatch = text.match(
      /\b(?:material|materia)[\s:]*([a-záàâãéèêíìîóòôõúùûç\s]+)/i
    );
    if (materialMatch) especificacoes.material = materialMatch[1].trim();

    // Cor
    const corMatch = text.match(
      /\b(?:cor|color)[\s:]*([a-záàâãéèêíìîóòôõúùûç\s]+)/i
    );
    if (corMatch) especificacoes.cor = corMatch[1].trim();

    // Descrição
    const descricaoMatch = text.match(
      /\b(?:descrição|descricao|description)[\s:]*([^.]*)/i
    );
    const descricao = descricaoMatch ? descricaoMatch[1].trim() : null;

    // Usar categoria apenas se explicitamente mencionada
    let categoriaDetectada = categoria || "";

    // Marca já foi detectada na seção anterior
    let marcaDetectada = marca;

    return {
      nome: nome || "Produto não identificado",
      categoria: categoriaDetectada || "",
      marca: marcaDetectada || "",
      modelo: modelo || "",
      unidadeMedida,
      precoCusto: precoCusto || "",
      precoVenda: precoVenda || "",
      descricao: descricao || "",
      codigoBarras: codigoBarras || "",
      ncm: ncm || "",
      cest: cest || "",
      origem: "", // Apenas se mencionado
      especificacoes:
        Object.keys(especificacoes).length > 0 ? especificacoes : null,
    };
  };

  const handleApplyData = async () => {
    const data = (window as any).generatedProdutoData;
    if (!data) return;

    setIsSaving(true);

    try {
      // Preparar dados no formato do formulário
      const formData = {
        nome: data.nome || "",
        codigo: data.codigoBarras || "",
        descricao: data.descricao || "",
        unidadeMedida: data.unidadeMedida || "UN",
        ncm: data.ncm || "",
        cest: data.cest || "",
        precoVenda: data.precoVenda
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(parseFloat(data.precoVenda))
          : "",
      };

      // Se há callback, usar para preencher o formulário
      if (onApplyData) {
        onApplyData(formData);

        // Adicionar mensagem de sucesso
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content:
            "✅ Dados aplicados ao formulário! Revise e salve o produto.",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, successMessage]);

        // Fechar modal após um pequeno delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Fallback: comportamento antigo (criar produto diretamente)
        // Converter para o formato esperado pelo SDK
        const produtoData: CreateProductDto = {
          code:
            data.codigoBarras ||
            data.nome.substring(0, 20).toUpperCase().replace(/\s/g, "_"),
          description: data.nome,
          ncm: data.ncm || "",
          cest: data.cest || undefined,
          unit: data.unidadeMedida || "UN",
          price: data.precoVenda ? parseFloat(data.precoVenda) : 0,
        };

        // Usar SDK ao invés de apiService
        await createProduct(produtoData);

        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content:
            "✅ Produto salvo com sucesso! Redirecionando para a listagem...",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, successMessage]);

        setTimeout(() => {
          onClose();
          window.location.href = "/products";
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao aplicar dados:", error);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "ai",
        content: "❌ Erro ao aplicar os dados. Tente novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Assistente IA</h2>
                <p className="text-sm text-white text-opacity-90">
                  Criação inteligente de produtos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Área de conversa */}
        <div className="flex-1 p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.type === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {message.type === "ai" && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Botão Aplicar Dados - apenas para mensagens da IA com dados processados */}
                    {message.type === "ai" &&
                      (window as any).generatedProdutoData && (
                        <div className="mt-3 flex justify-center">
                          <button
                            onClick={handleApplyData}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
                          >
                            <Sparkles
                              className={`w-4 h-4 ${
                                isSaving ? "animate-spin" : ""
                              }`}
                            />
                            <span>
                              {isSaving
                                ? "Aplicando..."
                                : onApplyData
                                ? "Aplicar ao Formulário"
                                : "Cadastrar Produto"}
                            </span>
                          </button>
                        </div>
                      )}

                    <p
                      className={`text-xs mt-1 ${
                        message.type === "user"
                          ? "text-purple-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Área de input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Descreva o produto que você quer cadastrar..."
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pressione Enter para enviar • Shift+Enter para nova linha
              </p>
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Botão voltar */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
