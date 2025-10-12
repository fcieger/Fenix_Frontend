'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, ArrowLeft, Sparkles, Package } from 'lucide-react';
import { apiService } from '@/lib/api';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: string;
}

interface ProdutosAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProdutosAIAssistant({ isOpen, onClose }: ProdutosAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! Sou seu assistente de IA para criação de produtos. Descreva o produto que você gostaria de cadastrar e eu vou ajudá-lo a criar todos os dados necessários.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simular processamento da IA
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Processar apenas o que o usuário enviou
      const processedData = await processUserInput(inputValue);

      // Criar mensagem detalhada com dados extraídos
      let content = `Perfeito! Identifiquei e extraí os seguintes dados do produto:\n\n`;
      
      content += `**Nome do Produto:** ${processedData.nome}\n`;
      content += `**Categoria:** ${processedData.categoria}\n`;
      content += `**Marca:** ${processedData.marca}\n`;
      content += `**Modelo:** ${processedData.modelo}\n`;
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
      
      content += `\nClique em "Cadastrar Produto" para salvar!`;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      // Armazenar dados processados para aplicação
      (window as any).generatedProdutoData = processedData;

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processUserInput = async (userInput: string) => {
    console.log('🔍 Processando input do produto:', userInput);
    
    // Extrair campos específicos do texto
    const extractedData = extractFieldsFromText(userInput);
    console.log('📋 Dados extraídos do produto:', extractedData);
    
    return {
      ...extractedData,
      originalInput: userInput,
      processedAt: new Date().toISOString()
    };
  };

  const extractFieldsFromText = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Extrair nome do produto (remover verbos, artigos e palavras desnecessárias)
    let nome = text
      .replace(/\b(cadastre|cadastrar|crie|criar|inclua|incluir|adicione|adicionar|insira|inserir|registre|registrar|produto|item|artigo|mercadoria|bem)\b/gi, '')
      .replace(/\b(o|a|os|as|um|uma|uns|umas)\b/gi, '')
      .replace(/\b(da|do|das|dos|de|em|na|no|nas|nos|para|com|por|sobre|entre|através|mediante|que|qual|quem|onde|quando|como)\b/gi, '')
      .replace(/\b(preço|preco|valor|custo|venda|marca|modelo|categoria|unidade|medida|peso|comprimento|largura|altura|material|cor|descrição|descricao|tipo|classe|grupo)\b/gi, '')
      .replace(/\b\d+[.,]?\d*\s*(reais|r\$|rs|kg|g|cm|m|ml|l|un|pc|cx|dz|gr|metros|centimetros|quilogramas|gramas|litros|mililitros)\b/gi, '') // Remove valores e unidades
      .replace(/\b\d{8,14}\b/g, '') // Remove códigos de barras
      .replace(/\b(iphone|samsung|dell|nike|adidas|apple|sony|lg|motorola|xiaomi|huawei)\b/gi, '') // Remove marcas conhecidas do nome
      .replace(/\s+/g, ' ')
      .trim();

    // Extrair preços com melhor reconhecimento
    const precoCustoMatch = text.match(/\b(?:custo|preço\s*custo|preco\s*custo|valor\s*custo|preço\s*de\s*custo|preco\s*de\s*custo)[\s:]*r?\$?\s*(\d+[.,]?\d*)/i);
    const precoCusto = precoCustoMatch ? precoCustoMatch[1].replace(',', '.') : null;
    
    const precoVendaMatch = text.match(/\b(?:venda|preço\s*venda|preco\s*venda|valor\s*venda|preço\s*de\s*venda|preco\s*de\s*venda|valor\s*de\s*venda|preço|preco|valor)[\s:]*r?\$?\s*(\d+[.,]?\d*)/i);
    const precoVenda = precoVendaMatch ? precoVendaMatch[1].replace(',', '.') : null;

    // Extrair marca (primeiro tenta extrair explicitamente, depois detecta marcas conhecidas)
    let marca = null;
    const marcaMatch = text.match(/\b(?:marca|brand)[\s:]*([a-záàâãéèêíìîóòôõúùûç\s]+)/i);
    if (marcaMatch) {
      marca = marcaMatch[1].trim();
    } else {
      // Detectar marcas conhecidas no texto
      const marcasConhecidas = [
        'samsung', 'apple', 'iphone', 'ipad', 'macbook', 'imac', 'airpods',
        'lg', 'sony', 'nike', 'adidas', 'puma', 'reebok', 'converse',
        'coca-cola', 'coca cola', 'pepsi', 'nestle', 'unilever', 'procter', 'gamble',
        'intel', 'amd', 'nvidia', 'microsoft', 'google', 'amazon', 'xiaomi', 'huawei',
        'motorola', 'nokia', 'blackberry', 'dell', 'hp', 'lenovo', 'asus', 'acer',
        'canon', 'nikon', 'panasonic', 'philips', 'bosch', 'whirlpool', 'electrolux',
        'volkswagen', 'ford', 'chevrolet', 'fiat', 'toyota', 'honda', 'hyundai',
        'bmw', 'mercedes', 'audi', 'ferrari', 'lamborghini', 'porsche'
      ];
      
      for (const marcaConhecida of marcasConhecidas) {
        if (lowerText.includes(marcaConhecida)) {
          marca = marcaConhecida.charAt(0).toUpperCase() + marcaConhecida.slice(1);
          break;
        }
      }
    }

    // Extrair modelo
    const modeloMatch = text.match(/\b(?:modelo|model)[\s:]*([a-záàâãéèêíìîóòôõúùûç0-9\s\-]+)/i);
    const modelo = modeloMatch ? modeloMatch[1].trim() : null;

    // Extrair categoria
    const categoriaMatch = text.match(/\b(?:categoria|category|tipo)[\s:]*([a-záàâãéèêíìîóòôõúùûç\s]+)/i);
    const categoria = categoriaMatch ? categoriaMatch[1].trim() : null;

    // Extrair código de barras
    const codigoBarrasMatch = text.match(/\b(?:código|codigo|barras|ean|upc)[\s:]*(\d{8,14})\b/i);
    const codigoBarras = codigoBarrasMatch ? codigoBarrasMatch[1] : null;

    // Extrair NCM
    const ncmMatch = text.match(/\b(?:ncm)[\s:]*(\d{8})\b/i);
    const ncm = ncmMatch ? ncmMatch[1] : null;

    // Extrair CEST
    const cestMatch = text.match(/\b(?:cest)[\s:]*(\d{7})\b/i);
    const cest = cestMatch ? cestMatch[1] : null;

    // Extrair unidade de medida com melhor reconhecimento
    let unidadeMedida = 'UN';
    const unidadeMatch = text.match(/\b(?:unidade|medida|un)[\s:]*([a-záàâãéèêíìîóòôõúùûç0-9\s\(\)]+)/i);
    if (unidadeMatch) {
      const unidade = unidadeMatch[1].toUpperCase();
      if (unidade.includes('KG') || unidade.includes('QUILO') || unidade.includes('QUILOGRAMA')) unidadeMedida = 'KG';
      else if (unidade.includes('G') || unidade.includes('GRAMA') || unidade.includes('GRAMAS')) unidadeMedida = 'G';
      else if (unidade.includes('L') || unidade.includes('LITRO') || unidade.includes('LITROS')) unidadeMedida = 'L';
      else if (unidade.includes('ML') || unidade.includes('MILILITRO') || unidade.includes('MILILITROS')) unidadeMedida = 'ML';
      else if (unidade.includes('M') || unidade.includes('METRO') || unidade.includes('METROS')) unidadeMedida = 'M';
      else if (unidade.includes('CM') || unidade.includes('CENTIMETRO') || unidade.includes('CENTIMETROS')) unidadeMedida = 'CM';
      else if (unidade.includes('M2') || unidade.includes('M²') || unidade.includes('METRO QUADRADO')) unidadeMedida = 'M2';
      else if (unidade.includes('M3') || unidade.includes('M³') || unidade.includes('METRO CUBICO')) unidadeMedida = 'M3';
      else if (unidade.includes('CX') || unidade.includes('CAIXA') || unidade.includes('CAIXAS')) unidadeMedida = 'CX';
      else if (unidade.includes('PC') || unidade.includes('PEÇA') || unidade.includes('PEÇAS')) unidadeMedida = 'PC';
      else if (unidade.includes('DZ') || unidade.includes('DÚZIA') || unidade.includes('DUZIA')) unidadeMedida = 'DZ';
      else if (unidade.includes('GR') || unidade.includes('GROSA') || unidade.includes('GROSAS')) unidadeMedida = 'GR';
    } else {
      // Detectar unidade por palavras-chave no texto
      if (lowerText.includes('quilograma') || lowerText.includes('quilo') || lowerText.includes('kg')) unidadeMedida = 'KG';
      else if (lowerText.includes('grama') || lowerText.includes('gramas') || lowerText.includes('g ')) unidadeMedida = 'G';
      else if (lowerText.includes('litro') || lowerText.includes('litros') || lowerText.includes('l ')) unidadeMedida = 'L';
      else if (lowerText.includes('mililitro') || lowerText.includes('ml')) unidadeMedida = 'ML';
      else if (lowerText.includes('metro') || lowerText.includes('metros') || lowerText.includes('m ')) unidadeMedida = 'M';
      else if (lowerText.includes('centimetro') || lowerText.includes('cm')) unidadeMedida = 'CM';
      else if (lowerText.includes('caixa') || lowerText.includes('cx')) unidadeMedida = 'CX';
      else if (lowerText.includes('peça') || lowerText.includes('peca') || lowerText.includes('pc')) unidadeMedida = 'PC';
      else if (lowerText.includes('dúzia') || lowerText.includes('duzia') || lowerText.includes('dz')) unidadeMedida = 'DZ';
      else if (lowerText.includes('grosa') || lowerText.includes('gr')) unidadeMedida = 'GR';
    }

    // Extrair especificações técnicas
    const especificacoes: any = {};
    
    // Dimensões
    const comprimentoMatch = text.match(/\b(?:comprimento|length)[\s:]*(\d+[.,]?\d*)\s*(?:cm|m|mm)?/i);
    if (comprimentoMatch) especificacoes.comprimento = comprimentoMatch[1];

    const larguraMatch = text.match(/\b(?:largura|width)[\s:]*(\d+[.,]?\d*)\s*(?:cm|m|mm)?/i);
    if (larguraMatch) especificacoes.largura = larguraMatch[1];

    const alturaMatch = text.match(/\b(?:altura|height)[\s:]*(\d+[.,]?\d*)\s*(?:cm|m|mm)?/i);
    if (alturaMatch) especificacoes.altura = alturaMatch[1];

    // Peso
    const pesoMatch = text.match(/\b(?:peso|weight)[\s:]*(\d+[.,]?\d*)\s*(?:kg|g|gramas|quilos)?/i);
    if (pesoMatch) especificacoes.peso = pesoMatch[1];

    // Material
    const materialMatch = text.match(/\b(?:material|materia)[\s:]*([a-záàâãéèêíìîóòôõúùûç\s]+)/i);
    if (materialMatch) especificacoes.material = materialMatch[1].trim();

    // Cor
    const corMatch = text.match(/\b(?:cor|color)[\s:]*([a-záàâãéèêíìîóòôõúùûç\s]+)/i);
    if (corMatch) especificacoes.cor = corMatch[1].trim();

    // Descrição
    const descricaoMatch = text.match(/\b(?:descrição|descricao|description)[\s:]*([^.]*)/i);
    const descricao = descricaoMatch ? descricaoMatch[1].trim() : null;

    // Detectar categoria baseada em palavras-chave mais inteligente
    let categoriaDetectada = categoria;
    if (!categoriaDetectada) {
      // Eletrônicos e Tecnologia
      if (lowerText.includes('eletrônico') || lowerText.includes('eletronico') || lowerText.includes('celular') || 
          lowerText.includes('smartphone') || lowerText.includes('iphone') || lowerText.includes('samsung') ||
          lowerText.includes('computador') || lowerText.includes('notebook') || lowerText.includes('laptop') ||
          lowerText.includes('tablet') || lowerText.includes('ipad') || lowerText.includes('monitor') ||
          lowerText.includes('teclado') || lowerText.includes('mouse') || lowerText.includes('fone') ||
          lowerText.includes('headphone') || lowerText.includes('câmera') || lowerText.includes('camera') ||
          lowerText.includes('tv') || lowerText.includes('televisão') || lowerText.includes('televisao')) {
        categoriaDetectada = 'Eletrônicos';
      }
      // Vestuário e Moda
      else if (lowerText.includes('roupa') || lowerText.includes('vestuário') || lowerText.includes('vestuario') || 
               lowerText.includes('camiseta') || lowerText.includes('calça') || lowerText.includes('calca') ||
               lowerText.includes('camisa') || lowerText.includes('blusa') || lowerText.includes('vestido') ||
               lowerText.includes('sapato') || lowerText.includes('tênis') || lowerText.includes('tenis') ||
               lowerText.includes('bota') || lowerText.includes('sandália') || lowerText.includes('sandalia') ||
               lowerText.includes('bolsa') || lowerText.includes('mochila') || lowerText.includes('cinto') ||
               lowerText.includes('relógio') || lowerText.includes('relogio') || lowerText.includes('óculos') ||
               lowerText.includes('oculos') || lowerText.includes('joia') || lowerText.includes('joia')) {
        categoriaDetectada = 'Vestuário';
      }
      // Casa e Decoração
      else if (lowerText.includes('casa') || lowerText.includes('decoração') || lowerText.includes('decoracao') || 
               lowerText.includes('móvel') || lowerText.includes('moveis') || lowerText.includes('mesa') ||
               lowerText.includes('cadeira') || lowerText.includes('sofá') || lowerText.includes('sofa') ||
               lowerText.includes('cama') || lowerText.includes('armário') || lowerText.includes('armario') ||
               lowerText.includes('estante') || lowerText.includes('prateleira') || lowerText.includes('quadro') ||
               lowerText.includes('vaso') || lowerText.includes('luminária') || lowerText.includes('luminaria') ||
               lowerText.includes('cortina') || lowerText.includes('tapete') || lowerText.includes('almofada')) {
        categoriaDetectada = 'Casa e Decoração';
      }
      // Esportes e Fitness
      else if (lowerText.includes('esporte') || lowerText.includes('fitness') || lowerText.includes('academia') || 
               lowerText.includes('corrida') || lowerText.includes('caminhada') || lowerText.includes('bicicleta') ||
               lowerText.includes('bike') || lowerText.includes('futebol') || lowerText.includes('basquete') ||
               lowerText.includes('tênis') || lowerText.includes('tenis') || lowerText.includes('natação') ||
               lowerText.includes('natacao') || lowerText.includes('musculação') || lowerText.includes('musculacao') ||
               lowerText.includes('yoga') || lowerText.includes('pilates') || lowerText.includes('crossfit')) {
        categoriaDetectada = 'Esportes';
      }
      // Livros e Papelaria
      else if (lowerText.includes('livro') || lowerText.includes('papelaria') || lowerText.includes('escritório') || 
               lowerText.includes('escritorio') || lowerText.includes('caneta') || lowerText.includes('lápis') ||
               lowerText.includes('lapis') || lowerText.includes('caderno') || lowerText.includes('bloco') ||
               lowerText.includes('papel') || lowerText.includes('impressora') || lowerText.includes('cartucho') ||
               lowerText.includes('mochila') || lowerText.includes('estojo') || lowerText.includes('régua') ||
               lowerText.includes('regua') || lowerText.includes('calculadora') || lowerText.includes('agenda')) {
        categoriaDetectada = 'Livros e Papelaria';
      }
      // Beleza e Cuidados
      else if (lowerText.includes('beleza') || lowerText.includes('cosmético') || lowerText.includes('cosmetico') || 
               lowerText.includes('perfume') || lowerText.includes('shampoo') || lowerText.includes('condicionador') ||
               lowerText.includes('sabonete') || lowerText.includes('creme') || lowerText.includes('loção') ||
               lowerText.includes('lacao') || lowerText.includes('batom') || lowerText.includes('sombra') ||
               lowerText.includes('base') || lowerText.includes('pó') || lowerText.includes('po') ||
               lowerText.includes('esmalte') || lowerText.includes('pincel') || lowerText.includes('espelho')) {
        categoriaDetectada = 'Beleza e Cuidados';
      }
      // Brinquedos e Jogos
      else if (lowerText.includes('brinquedo') || lowerText.includes('jogo') || lowerText.includes('infantil') || 
               lowerText.includes('boneca') || lowerText.includes('carrinho') || lowerText.includes('lego') ||
               lowerText.includes('puzzle') || lowerText.includes('quebra-cabeça') || lowerText.includes('quebracabeca') ||
               lowerText.includes('videogame') || lowerText.includes('console') || lowerText.includes('playstation') ||
               lowerText.includes('xbox') || lowerText.includes('nintendo') || lowerText.includes('tabuleiro')) {
        categoriaDetectada = 'Brinquedos e Jogos';
      }
      // Automotivo
      else if (lowerText.includes('automotivo') || lowerText.includes('carro') || lowerText.includes('moto') || 
               lowerText.includes('peça') || lowerText.includes('peca') || lowerText.includes('pneu') ||
               lowerText.includes('óleo') || lowerText.includes('oleo') || lowerText.includes('bateria') ||
               lowerText.includes('filtro') || lowerText.includes('vela') || lowerText.includes('correia') ||
               lowerText.includes('freio') || lowerText.includes('amortecedor') || lowerText.includes('escapamento') ||
               lowerText.includes('volante') || lowerText.includes('banco') || lowerText.includes('cinto')) {
        categoriaDetectada = 'Automotivo';
      }
      // Ferramentas e Construção
      else if (lowerText.includes('ferramenta') || lowerText.includes('construção') || lowerText.includes('construcao') || 
               lowerText.includes('ferro') || lowerText.includes('madeira') || lowerText.includes('cimento') ||
               lowerText.includes('concreto') || lowerText.includes('tijolo') || lowerText.includes('areia') ||
               lowerText.includes('pedra') || lowerText.includes('martelo') || lowerText.includes('chave') ||
               lowerText.includes('furadeira') || lowerText.includes('parafuso') || lowerText.includes('prego') ||
               lowerText.includes('tinta') || lowerText.includes('pincel') || lowerText.includes('rolo')) {
        categoriaDetectada = 'Ferramentas e Construção';
      }
      // Alimentos e Bebidas
      else if (lowerText.includes('alimento') || lowerText.includes('comida') || lowerText.includes('bebida') || 
               lowerText.includes('café') || lowerText.includes('cafe') || lowerText.includes('açúcar') ||
               lowerText.includes('acucar') || lowerText.includes('sal') || lowerText.includes('óleo') ||
               lowerText.includes('oleo') || lowerText.includes('arroz') || lowerText.includes('feijão') ||
               lowerText.includes('feijao') || lowerText.includes('macarrão') || lowerText.includes('macarrao') ||
               lowerText.includes('carne') || lowerText.includes('frango') || lowerText.includes('peixe') ||
               lowerText.includes('leite') || lowerText.includes('queijo') || lowerText.includes('pão') ||
               lowerText.includes('pao') || lowerText.includes('bolo') || lowerText.includes('doce')) {
        categoriaDetectada = 'Alimentos e Bebidas';
      }
      // Saúde e Medicamentos
      else if (lowerText.includes('medicamento') || lowerText.includes('remédio') || lowerText.includes('remedio') || 
               lowerText.includes('vitamina') || lowerText.includes('suplemento') || lowerText.includes('curativo') ||
               lowerText.includes('bandagem') || lowerText.includes('termômetro') || lowerText.includes('termometro') ||
               lowerText.includes('máscara') || lowerText.includes('mascara') || lowerText.includes('álcool') ||
               lowerText.includes('alcool') || lowerText.includes('seringa') || lowerText.includes('agulha')) {
        categoriaDetectada = 'Saúde e Medicamentos';
      }
      // Pet Shop
      else if (lowerText.includes('pet') || lowerText.includes('cachorro') || lowerText.includes('gato') || 
               lowerText.includes('ração') || lowerText.includes('racao') || lowerText.includes('brinquedo') ||
               lowerText.includes('coleira') || lowerText.includes('guia') || lowerText.includes('casinha') ||
               lowerText.includes('bebedouro') || lowerText.includes('comedouro') || lowerText.includes('areia') ||
               lowerText.includes('shampoo') || lowerText.includes('medicamento') || lowerText.includes('vacina')) {
        categoriaDetectada = 'Pet Shop';
      }
      else {
        categoriaDetectada = 'Geral';
      }
    }

    // Marca já foi detectada na seção anterior
    let marcaDetectada = marca;

    return {
      nome: nome || 'Produto não identificado',
      categoria: categoriaDetectada || 'Geral',
      marca: marcaDetectada || '',
      modelo: modelo || '',
      unidadeMedida,
      precoCusto: precoCusto || '',
      precoVenda: precoVenda || '',
      descricao: descricao || '',
      codigoBarras: codigoBarras || '',
      ncm: ncm || '',
      cest: cest || '',
      origem: '0', // Nacional
      especificacoes: Object.keys(especificacoes).length > 0 ? especificacoes : null
    };
  };

  const handleApplyData = async () => {
    const data = (window as any).generatedProdutoData;
    if (!data) return;

    setIsSaving(true);
    
    try {
      // Preparar dados para envio
      const produtoData = {
        nome: data.nome,
        categoria: data.categoria,
        marca: data.marca,
        modelo: data.modelo,
        unidadeMedida: data.unidadeMedida,
        precoCusto: data.precoCusto ? parseFloat(data.precoCusto) : 0,
        precoVenda: data.precoVenda ? parseFloat(data.precoVenda) : 0,
        descricao: data.descricao,
        codigoBarras: data.codigoBarras,
        ncm: data.ncm,
        cest: data.cest,
        origem: data.origem,
        // Especificações técnicas
        comprimento: data.especificacoes?.comprimento ? parseFloat(data.especificacoes.comprimento) : undefined,
        largura: data.especificacoes?.largura ? parseFloat(data.especificacoes.largura) : undefined,
        altura: data.especificacoes?.altura ? parseFloat(data.especificacoes.altura) : undefined,
        peso: data.especificacoes?.peso ? parseFloat(data.especificacoes.peso) : undefined,
        material: data.especificacoes?.material || '',
        cor: data.especificacoes?.cor || '',
        // Outros campos com valores padrão
        sku: '',
        garantia: '',
        certificacoes: '',
        informacoesAdicionais: `Produto cadastrado via IA: ${data.originalInput}`
      };

      // Salvar no banco de dados
      const token = localStorage.getItem('fenix_token') || '';
      await apiService.createProduto(produtoData, token);
      
      // Adicionar mensagem de sucesso
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: '✅ Produto salvo com sucesso! Redirecionando para a listagem...',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, successMessage]);
      
      // Fechar modal e redirecionar após um pequeno delay
      setTimeout(() => {
        onClose();
        // Redirecionar para a página de produtos
        window.location.href = '/produtos';
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: '❌ Erro ao salvar o produto. Tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
                <p className="text-sm text-white text-opacity-90">Criação inteligente de produtos</p>
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
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Botão Cadastrar Produto - apenas para mensagens da IA com dados processados */}
                    {message.type === 'ai' && (window as any).generatedProdutoData && (
                      <div className="mt-3 flex justify-center">
                        <button
                          onClick={handleApplyData}
                          disabled={isSaving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
                        >
                          <Sparkles className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                          <span>{isSaving ? 'Salvando...' : 'Cadastrar Produto'}</span>
                        </button>
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
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
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
