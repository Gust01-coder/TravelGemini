"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { marked } from 'marked';

// Adicionar estilos globais para animações
const globalStyles = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  
  @keyframes expandLine {
    0% {
      transform: scaleX(0);
    }
    100% {
      transform: scaleX(1);
    }
  }
  
  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideIn {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0);
    }
  }
  
  @keyframes slideOut {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
  
  @keyframes bounce-subtle {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  
  .animate-blob {
    animation: blob 7s infinite alternate;
  }
  
  .animate-expandLine {
    animation: expandLine 1s ease-in-out forwards;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-bounce-subtle {
    animation: bounce-subtle 2s ease-in-out infinite;
  }
  
  .delay-150 {
    animation-delay: 150ms;
  }
  
  .delay-300 {
    animation-delay: 300ms;
  }

  /* Estilos para renderização Markdown */
  .markdown-content h1, .markdown-content h2, .markdown-content h3 {
    color: #67e8f9;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
  }

  .markdown-content h1 {
    font-size: 1.5rem;
    border-bottom: 1px solid rgba(129, 140, 248, 0.3);
    padding-bottom: 0.5rem;
  }

  .markdown-content h2 {
    font-size: 1.25rem;
  }

  .markdown-content h3 {
    font-size: 1.125rem;
  }

  .markdown-content p {
    margin-bottom: 1rem;
  }

  .markdown-content ul, .markdown-content ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .markdown-content ul {
    list-style-type: disc;
  }

  .markdown-content ol {
    list-style-type: decimal;
  }

  .markdown-content li {
    margin-bottom: 0.5rem;
  }

  .markdown-content strong {
    color: white;
    font-weight: 600;
  }

  .markdown-content em {
    font-style: italic;
    color: #a5b4fc;
  }

  .markdown-content blockquote {
    border-left: 3px solid #67e8f9;
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 1rem;
    font-style: italic;
    color: #a5b4fc;
  }

  .markdown-content code {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .markdown-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .markdown-content th, .markdown-content td {
    border: 1px solid rgba(129, 140, 248, 0.3);
    padding: 0.5rem;
    text-align: left;
  }

  .markdown-content th {
    background-color: rgba(129, 140, 248, 0.1);
  }

  .markdown-content hr {
    border: 0;
    border-top: 1px solid rgba(129, 140, 248, 0.3);
    margin: 1.5rem 0;
  }
  
  /* Estilos para cartões de conteúdo */
  .card-destaque {
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
    border-left: 3px solid #38bdf8;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .card-importante {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%);
    border-left: 3px solid #f97316;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .card-dica {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
    border-left: 3px solid #10b981;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  /* Animações adicionais */
  @keyframes highlight {
    0% {
      background-color: rgba(103, 232, 249, 0.3);
    }
    100% {
      background-color: transparent;
    }
  }
  
  .highlight-effect {
    animation: highlight 2s ease-out forwards;
  }
  
  /* Efeitos de hover para elementos interativos */
  .hover-lift {
    transition: transform 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-2px);
  }
  
  /* Estilos para impressão */
  @media print {
    body {
      background: white !important;
      color: black !important;
      font-size: 12pt;
    }
    
    .container {
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    
    header, 
    button, 
    nav, 
    .bg-gradient-to-b,
    .bg-white\/5, 
    .backdrop-blur-md,
    .border,
    .bg-black\/20,
    .backdrop-blur-sm,
    .animate-blob,
    .absolute {
      display: none !important;
      background: none !important;
      color: black !important;
      border: none !important;
      box-shadow: none !important;
    }
    
    .p-6, .p-8, .p-4, .p-5 {
      padding: 0 !important;
    }
    
    .rounded-2xl, .rounded-xl, .rounded-lg {
      border-radius: 0 !important;
    }
    
    .markdown-content {
      display: block !important;
      page-break-inside: avoid;
      max-width: 100% !important;
      color: black !important;
    }
    
    .markdown-content h1, 
    .markdown-content h2, 
    .markdown-content h3,
    .markdown-content strong,
    .text-cyan-300,
    .text-cyan-400 {
      color: black !important;
      break-after: avoid;
    }
    
    .markdown-content a {
      color: blue !important;
      text-decoration: underline;
    }
    
    /* Mostrar apenas a aba selecionada */
    .animate-fadeIn:not(:first-child) {
      display: none !important;
    }
    
    .text-white,
    .text-indigo-200,
    .text-indigo-300 {
      color: black !important;
    }
    
    /* Adicionar URL depois dos links */
    .markdown-content a::after {
      content: " (" attr(href) ") ";
      font-size: 90%;
    }
    
    /* Garantir que as cartas sejam impressas com borda em vez de cor de fundo */
    .card-destaque,
    .card-importante,
    .card-dica {
      background: none !important;
      border: 1px solid #ccc !important;
      border-left: 3px solid #000 !important;
      break-inside: avoid;
    }
    
    /* Adicionar título da página */
    .container::before {
      content: "TravelGemini - Plano de Viagem";
      display: block;
      text-align: center;
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 20pt;
    }
    
    /* Forçar visualização de imagens */
    img {
      max-width: 500px !important;
      display: block !important;
    }
    
    /* Quebrar página em seções principais */
    h1, h2 {
      break-before: page;
    }
  }
`;

// Modificar a função processarMarkdown para melhorar o tratamento de tabelas
const processarMarkdown = (texto) => {
  if (!texto) return '';
  
  // Pré-processamento para lidar com formatos específicos das respostas do Gemini
  // Substituir marcações específicas antes de processar o Markdown
  let textoProcessado = texto
    // Escapar tags HTML literais para evitar que sejam renderizadas como texto
    .replace(/&lt;/g, '&amp;lt;')
    .replace(/&gt;/g, '&amp;gt;')
    .replace(/<(\/?)strong>/g, '&lt;$1strong&gt;')
    .replace(/<(\/?)em>/g, '&lt;$1em&gt;')
    .replace(/<(\/?)a(?:\s+[^>]*)?>/g, '&lt;$1a&gt;')
    .replace(/<(\/?)code>/g, '&lt;$1code&gt;')
    // Remover referências numéricas em colchetes
    .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
    // Remover emojis específicos não desejados
    .replace(/🏢|📍|🏠|🏨|🏙️/g, '')
    // Melhorar espaçamento em todos os lugares
    .replace(/(\w)(\*)/g, '$1 $2') // Adicionar espaço antes de asterisco
    .replace(/(\d+)([a-zA-Z])/g, '$1 $2') // Adicionar espaço entre números e letras
    .replace(/:(\w)/g, ': $1') // Adicionar espaço após dois pontos
    .replace(/(\.|\?|\!)(\w)/g, '$1 $2') // Espaço após pontuação
    .replace(/(\w)(http)/g, '$1 $2') // Espaço antes de URLs
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Espaço entre palavras sem espaço
    // Converter os asteriscos duplos para formatação de negrito
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Converter hashtags para cabeçalhos
    .replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>')
    .replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>')
    .replace(/^####\s+(.*?)$/gm, '<h4>$1</h4>')
    // Tratar listas com asteriscos
    .replace(/^\*\s+(.*?)$/gm, '<li>$1</li>')
    // Converter blocos de código
    .replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>')
    // Tratamento especial para tabelas
    .replace(/^\|(.*)\|$/gm, (match, content) => {
      // Captura conteúdo entre pipes
      const cells = content.split('|').map(cell => cell.trim());
      
      // Verifica se é uma linha separadora de cabeçalho
      if (cells.every(cell => cell === '' || cell.match(/^[-:]+$/))) {
        return '<table-separator>';
      }
      
      // Cria células de tabela
      const cellsHtml = cells.map(cell => `<td>${cell}</td>`).join('');
      return `<table-row>${cellsHtml}</table-row>`;
    })
    // Tratar links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-cyan-400 hover:underline">$1</a>')
    // Adicionar quebras de linha para melhorar formatação
    .replace(/\n{2,}/g, '\n\n')
    // Garantir espaço após asteriscos para evitar texto colado
    .replace(/\*\s*([A-Z])/g, '* $1')
    // Melhorar espaçamento entre pontuação e texto
    .replace(/\.\s*([A-Z])/g, '. $1')
    .replace(/\:\s*([A-Z])/g, ': $1');
  
  // Processar tabelas
  let inTable = false;
  let hasHeader = false;
  let tableHtml = '';
  const lines = textoProcessado.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('<table-row>')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<table class="w-full border-collapse my-4">';
        
        // Verificar se a próxima linha é um separador para determinar se temos um cabeçalho
        hasHeader = (i + 1 < lines.length && lines[i + 1] === '<table-separator>');
      }
      
      // Determinar se estamos no cabeçalho ou no corpo da tabela
      if (hasHeader && tableHtml.indexOf('<tbody>') === -1 && tableHtml.indexOf('<thead>') === -1) {
        tableHtml += '<thead>';
        tableHtml += line.replace(/<td>/g, '<th class="bg-indigo-600/20 text-white">').replace(/<\/td>/g, '</th>');
        tableHtml += '</thead>';
      } else {
        if (hasHeader && tableHtml.indexOf('<tbody>') === -1) {
          tableHtml += '<tbody>';
        }
        tableHtml += '<tr class="border-b border-indigo-500/20 hover:bg-indigo-500/10 transition-colors">' + 
                    line.substring(11, line.length - 12) + 
                    '</tr>';
      }
    } else if (line === '<table-separator>') {
      // Ignorar linha separadora, já foi processada
      continue;
    } else if (inTable && !line.startsWith('<table-row>') && line.trim() !== '') {
      // Final da tabela
      if (hasHeader && tableHtml.indexOf('</tbody>') === -1 && tableHtml.indexOf('<tbody>') !== -1) {
        tableHtml += '</tbody>';
      }
      tableHtml += '</table>';
      processedLines.push(tableHtml);
      inTable = false;
      processedLines.push(line);
    } else {
      // Linhas normais que não fazem parte de tabela
      processedLines.push(line);
    }
  }
  
  // Fechar a tabela se acabar o texto e ainda estivermos em uma tabela
  if (inTable) {
    if (hasHeader && tableHtml.indexOf('</tbody>') === -1 && tableHtml.indexOf('<tbody>') !== -1) {
      tableHtml += '</tbody>';
    }
    tableHtml += '</table>';
    processedLines.push(tableHtml);
  }
  
  textoProcessado = processedLines.join('\n');
  
  // Envolver itens de lista em tags ul
  textoProcessado = textoProcessado.replace(/<li>(.*?)(<li>|$)/gs, '<ul><li>$1</li></ul>$2');
  textoProcessado = textoProcessado.replace(/<\/ul><ul>/g, '');
  
  // Tratar tags HTML literais como texto
  textoProcessado = textoProcessado.replace(/<strong>Dia \d+:<\/strong>/g, match => {
    return match.replace(/<strong>(.*?)<\/strong>/, '<h3 class="text-cyan-300 font-bold">$1</h3>');
  });
  
  // Corrigir formatação de dias e listagens
  textoProcessado = textoProcessado.replace(/(<li>)(Manhã|Tarde|Noite):/g, '$1<span class="text-cyan-300 font-semibold">$2:</span>');
  
  // Configurar opções do marked
  marked.setOptions({
    breaks: true,
    gfm: true,
    sanitize: false,
    headerIds: false
  });
  
  try {
    // Converter Markdown para HTML
    const html = marked.parse(textoProcessado);
    
    // Pós-processamento para melhorar a apresentação visual
    return html
      // Adicionar classes às tabelas
      .replace(/<table>/g, '<table class="w-full border-collapse mb-4">')
      // Destacar valores monetários
      .replace(/R\$\s?(\d+[\.,]?\d*)/g, '<span class="text-green-400">R$ $1</span>')
      // Destacar números de telefone e contatos
      .replace(/(\(\d{2}\)\s?\d{4,5}-\d{4})/g, '<span class="text-yellow-300">$1</span>')
      // Destacar porcentagens
      .replace(/(\d+%)(?![^<]*>)/g, '<span class="text-purple-300">$1</span>')
      // Melhorar a formatação de dias
      .replace(/<h2>Dia (\d+):<\/h2>/g, '<h2 class="text-cyan-300 font-bold mt-6 mb-4 border-b border-cyan-700/30 pb-2">Dia $1</h2>')
      // Melhorar a formatação dos períodos do dia
      .replace(/<p>([Mm]anhã|[Tt]arde|[Nn]oite):\s*(.*?)<\/p>/g, '<p><span class="text-cyan-300 font-semibold">$1:</span> $2</p>')
      // Remover completamente referências em colchetes que possam ter escapado
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
      // Melhorar cards de destaque
      .replace(/>(DICA|DICAS?):/g, '><span class="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold">DICA</span>')
      .replace(/>(IMPORTANTE|ATENÇÃO|CUIDADO):/g, '><span class="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs font-bold">IMPORTANTE</span>')
      .replace(/>(DESTAQUE|IMPERDÍVEL):/g, '><span class="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-bold">DESTAQUE</span>')
      // Criar cards especiais
      .replace(/<p>💡\s*(.*?)<\/p>/g, '<div class="card-dica"><p>$1</p></div>')
      .replace(/<p>⚠️\s*(.*?)<\/p>/g, '<div class="card-importante"><p>$1</p></div>')
      .replace(/<p>🌟\s*(.*?)<\/p>/g, '<div class="card-destaque"><p>$1</p></div>')
      // Melhorar espaçamento entre elementos
      .replace(/<\/h3><p>/g, '</h3>\n<p>')
      .replace(/<\/p><p>/g, '</p>\n<p>')
      // Adicionar espaço entre os itens e pontos
      .replace(/\. ([A-Z])/g, '. $1')
      // Criar espaço entre asteriscos
      .replace(/\*([^\s*])/g, '* $1')
      // Remover emojis não desejados
      .replace(/🏢|📍|🏠|🏨|🏙️/g, '');
      
  } catch (error) {
    console.error('Erro ao processar markdown:', error);
    return texto;
  }
};

// Adicionar após const processarMarkdown = ...
// Função para exportar como PDF
const exportarComoPDF = (titulo) => {
  // Configurar a impressão para salvar como PDF
  const printOptions = {
    destination: 'save-as-pdf',
    filename: `TravelGemini_${titulo.replace(/\s+/g, '_')}.pdf`,
    landscape: false,
    margins: {
      top: 0.5,
      bottom: 0.5,
      left: 0.5,
      right: 0.5
    },
    scaleFactor: 1
  };

  // Adicionar classe temporária para estilo de impressão
  document.body.classList.add('printing');
  
  // Usar a API de impressão
  window.print();
  
  // Remover classe após impressão
  setTimeout(() => {
    document.body.classList.remove('printing');
  }, 1000);
};

// Adicionar após a função exportarComoPDF
const copiarParaAreaDeTransferencia = (conteudo, origem, destino) => {
  // Função para extrair texto do HTML
  const extrairTexto = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Montar texto formatado para área de transferência
  const textoFormatado = `
=== TRAVELGEMINI - PLANO DE VIAGEM DE ${origem.toUpperCase()} PARA ${destino.toUpperCase()} ===

${extrairTexto(conteudo)}

-----
Plano gerado por TravelGemini - https://travelgemini.vercel.app
  `.trim();

  // Copiar para a área de transferência
  navigator.clipboard.writeText(textoFormatado)
    .then(() => {
      // Feedback visual temporário
      const btnCopiar = document.getElementById('btn-copiar');
      if (btnCopiar) {
        const textoOriginal = btnCopiar.innerHTML;
        btnCopiar.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-green-400">Copiado!</span>
        `;
        
        setTimeout(() => {
          btnCopiar.innerHTML = textoOriginal;
        }, 2000);
      }
    })
    .catch(err => {
      console.error('Erro ao copiar: ', err);
      alert('Não foi possível copiar o texto. Por favor, tente novamente.');
    });
};

// Adicionar antes de export default function Home() para criar um componente de autocompletamento
const AutocompleteInput = ({ value, onChange, placeholder, label, icon }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Lista de cidades populares para sugestões
  const cities = useMemo(() => [
    "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília", "Salvador", 
    "Fortaleza", "Recife", "Porto Alegre", "Curitiba", "Manaus", "Belém", 
    "Goiânia", "Guarulhos", "Campinas", "Nova Iorque", "Paris", "Londres", 
    "Tóquio", "Roma", "Madrid", "Barcelona", "Berlim", "Amsterdam", "Lisboa", 
    "Toronto", "Miami", "Orlando", "Los Angeles", "Las Vegas", "Chicago", 
    "Buenos Aires", "Santiago", "Lima", "Bogotá", "Cidade do México", 
    "Cancún", "Dubai", "Sydney", "Melbourne", "Pequim", "Shangai", "Singapura", 
    "Bangkok", "Tulum", "Cusco", "Bariloche", "Montevidéu", "Punta del Este",
    "Vitória", "Vila Velha", "Porto Seguro", "Ilhéus", "João Pessoa", "Maceió",
    "Natal", "Florianópolis", "Balneário Camboriú", "Foz do Iguaçu", "Gramado",
    "Ouro Preto", "Santos", "Angra dos Reis", "Paraty", "Campos do Jordão",
    "Jericoacoara", "Fernando de Noronha", "Bonito", "Caldas Novas"
  ], []);

  useEffect(() => {
    // Simular carregamento para feedback visual
    if (value.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const filtered = cities.filter(city => 
          city.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5); // Limitar a 5 sugestões
        setSuggestions(filtered);
        setIsLoading(false);
      }, 200); // Pequeno delay para simular busca
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [value, cities]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group">
      <label className="block text-sm font-medium mb-2 text-cyan-300 group-hover:text-white transition-colors">
        <span className="flex items-center">
          {icon}
          {label}
        </span>
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:outline-none text-white placeholder-indigo-300/50 transition-all ${
            isFocused 
              ? "border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20" 
              : "border-indigo-300/30 hover:border-cyan-400/30"
          }`}
          placeholder={placeholder}
        />
        
        {/* Ícone de pesquisa ou carregamento */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className={`h-5 w-5 ${isFocused ? "text-cyan-400" : "text-indigo-300/70"} transition-colors`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        
        {/* Container de sugestões com animação */}
        {isFocused && (
          <div 
            ref={suggestionsRef}
            className={`absolute z-20 w-full mt-1 bg-indigo-900/95 border border-indigo-300/30 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm transition-all duration-200 ${
              suggestions.length > 0 || isLoading ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4 text-indigo-300">
                <span className="animate-pulse">Buscando cidades...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      onChange(suggestion);
                      setIsFocused(false);
                    }}
                    className="px-4 py-3 cursor-pointer hover:bg-indigo-800/80 text-white transition-colors flex items-center animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{suggestion}</span>
                  </div>
                ))}
                <div className="p-2 text-xs text-indigo-300/70 border-t border-indigo-400/20 bg-indigo-900/30">
                  Clique em uma cidade para selecionar
                </div>
              </>
            ) : value.length > 0 ? (
              <div className="p-4 text-indigo-300/70 text-center">
                Nenhuma cidade encontrada. Tente outro termo.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  // Estados para os campos do formulário
  const [origem, setOrigem] = useState("São Paulo");
  const [destino, setDestino] = useState("Vitória");
  const [dataIda, setDataIda] = useState("2025-08-20");
  const [dataVolta, setDataVolta] = useState("2025-12-09");
  const [orcamento, setOrcamento] = useState(9000);
  const [transporte, setTransporte] = useState("Carro");
  const [hospedagem, setHospedagem] = useState("Hotel");
  const [tipoViagem, setTipoViagem] = useState("Romântica");
  const [interesses, setInteresses] = useState({
    historiaCultura: true,
    natureza: true,
    gastronomia: true,
    compras: true,
    museus: false,
    vidaNoturna: false,
    praias: false,
    esportes: false,
    parques: false,
    vinícolas: false
  });
  const [viagemComCriancas, setViagemComCriancas] = useState(false);

  // Adicionar estado para quantidade de filhos
  const [quantidadeFilhos, setQuantidadeFilhos] = useState(1);

  // Estado para controlar o status do planejamento
  const [isLoading, setIsLoading] = useState(false);
  const [resultadoPlanejamento, setResultadoPlanejamento] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [abaSelecionada, setAbaSelecionada] = useState("Transporte");

  // Estados de animação e experiência
  const [formStep, setFormStep] = useState(1);
  const [showStars, setShowStars] = useState(false);

  // Adicionar novos estados para o chat perto dos outros estados
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Olá! Estou aqui para ajudar com seu planejamento de viagem para ' + destino + '. O que gostaria de saber?' }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef(null);

  // Adicionar useEffect para rolar para a mensagem mais recente quando o chat é atualizado
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    // Iniciar animação de estrelas após o carregamento
    setShowStars(true);

    // Simular mudança de etapas ao carregar
    const etapasInterval = setInterval(() => {
      if (isLoading) {
        setEtapaAtual(prev => (prev < 5 ? prev + 1 : prev));
      }
    }, 5500);

    return () => clearInterval(etapasInterval);
  }, [isLoading]);

  // Função para atualizar interesses
  const handleInteresseChange = (interesse) => {
    setInteresses(prev => ({
      ...prev,
      [interesse]: !prev[interesse]
    }));
  };
  


  // Função para enviar os dados para a API
  const planejarViagem = async () => {
    try {
      setIsLoading(true);
      setEtapaAtual(1); // Iniciar a primeira etapa

      // Preparar os dados para envio
      const dadosViagem = {
        origem,
        destino,
        dataIda,
        dataVolta,
        orcamento: Number(orcamento),
        transporte,
        hospedagem,
        tipoViagem,
        interesses: Object.keys(interesses).filter(key => interesses[key]),
        viagemComCriancas
      };

      const response = await fetchAgente(dadosViagem)
      const resultado = await response.json()

      setResultadoPlanejamento(resultado);

    } catch (error) {
      console.error('Erro ao planejar viagem:', error);
      alert('Houve um erro ao processar seu planejamento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se há um orçamento válido
  const isOrcamentoValido = orcamento > 0;
  // Verificar se há datas válidas
  const isDatasValidas = dataIda && dataVolta && new Date(dataIda) <= new Date(dataVolta);

  // Função para enviar mensagem no chat
  const sendChatMessage = async () => {
    if (!messageInput.trim() || isSendingMessage) return;
    
    const userMessage = messageInput.trim();
    setMessageInput('');
    setIsSendingMessage(true);
    
    // Adicionar mensagem do usuário ao chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      // Preparar contexto para a API
      const tripContext = `
        Destino: ${destino}
        Datas: ${dataIda} até ${dataVolta}
        Orçamento: R$ ${orcamento}
        Preferências de Transporte: ${transporte}
        Preferências de Hospedagem: ${hospedagem}
        Tipo de Viagem: ${tipoViagem}
        Interesses: ${Object.keys(interesses).filter(key => interesses[key]).join(', ')}
        Viagem com crianças: ${viagemComCriancas ? 'Sim, ' + quantidadeFilhos + ' criança(s)' : 'Não'}
      `;
      
      // Adicionar resultados do planejamento se disponíveis
      let planContext = '';
      if (resultadoPlanejamento) {
        // Extrair informações relevantes para incluir no contexto
        const transporteExcerpt = resultadoPlanejamento.transporte ? 
          resultadoPlanejamento.transporte.substring(0, 500) + '...' : '';
        
        const hospedagemExcerpt = resultadoPlanejamento.hospedagem ?
          resultadoPlanejamento.hospedagem.substring(0, 500) + '...' : '';
        
        const atracoesExcerpt = resultadoPlanejamento.atracoes ?
          resultadoPlanejamento.atracoes.substring(0, 500) + '...' : '';
        
        planContext = `
          Informações resumidas do plano de viagem gerado:
          
          TRANSPORTE:
          ${transporteExcerpt}
          
          HOSPEDAGEM:
          ${hospedagemExcerpt}
          
          ATRAÇÕES:
          ${atracoesExcerpt}
        `;
      }
      
      // Preparar dados para envio à API
      const chatData = {
        messages: [
          // Contexto da viagem como mensagem do sistema
          { role: 'system', content: `Você é um assistente de viagem especializado em ${destino}. Use estas informações como contexto: ${tripContext} ${planContext}` },
          // Histórico de mensagens limitado às últimas 10
          ...chatMessages.slice(-10).map(msg => ({ role: msg.role, content: msg.content })),
          // Nova mensagem do usuário
          { role: 'user', content: userMessage }
        ]
      };
      
      // Adicionar mensagem temporária de "digitando" após 1 segundo
      const typingTimerId = setTimeout(() => {
        setChatMessages(prev => {
          // Verifique se a última mensagem já não é do assistente
          if (prev[prev.length - 1].role === 'user') {
            return [...prev, { 
              role: 'assistant', 
              content: '...',
              isTyping: true
            }];
          }
          return prev;
        });
      }, 1000);
      
      // Enviar para a API de chat
      const response = await fetch('/api/planejar/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
      });
      
      // Limpar o timeout da mensagem de digitação
      clearTimeout(typingTimerId);
      
      if (!response.ok) {
        throw new Error(`Erro ao processar a mensagem: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Remover a mensagem de digitação, se existir
      setChatMessages(prev => prev.filter(msg => !msg.isTyping));
      
      // Verificar se a resposta tem conteúdo válido
      if (!data.response || typeof data.response !== 'string' || data.response.trim() === '') {
        throw new Error('A resposta do servidor está vazia ou inválida');
      }
      
      // Adicionar resposta ao chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Erro na conversa:', error);
      
      // Remover a mensagem de digitação, se existir
      setChatMessages(prev => prev.filter(msg => !msg.isTyping));
      
      // Adicionar mensagem de erro específica
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?' 
      }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Componente de Chat Sidebar para ser renderizado no final do componente principal
  const ChatModal = () => {
    // Adicionando estado para controlar tentativas de reenvio
    const [retryCount, setRetryCount] = useState(0);
    const [lastErrorTime, setLastErrorTime] = useState(null);

    // Função para tentar novamente a última mensagem
    const retryLastMessage = () => {
      if (chatMessages.length > 0) {
        // Encontrar a última mensagem do usuário
        const lastUserMessageIndex = [...chatMessages].reverse().findIndex(msg => msg.role === 'user');
        if (lastUserMessageIndex >= 0) {
          const lastUserMessage = chatMessages[chatMessages.length - 1 - lastUserMessageIndex];
          
          // Remover as mensagens de erro
          const filteredMessages = chatMessages.filter(msg => 
            msg.content !== 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?'
          );
          
          // Atualizar o chat
          setChatMessages(filteredMessages);
          
          // Definir a mensagem do usuário no input
          setMessageInput(lastUserMessage.content);
          
          // Incrementar contador de tentativas
          setRetryCount(prev => prev + 1);
          setLastErrorTime(new Date());
        }
      }
    };

  return (
      <div 
        className={`fixed left-0 top-0 bottom-0 z-50 flex ${showChat ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div className="bg-gradient-to-b from-indigo-950 to-purple-950 shadow-2xl flex-1 flex flex-col overflow-hidden border-r border-indigo-300/30">
        
        <div 
          className="absolute right-0 w-2 bg-gradient-to-b from-cyan-500 to-blue-500 cursor-pointer flex items-center justify-center h-full"
          onClick={() => setShowChat(false)}
        >
          <div className="w-1 h-20 rounded-full bg-white/30 hover:bg-white/50 transition-colors"></div>
        </div>
          {/* Cabeçalho do chat */}
          <div className="p-3 sm:p-4 border-b border-indigo-300/30 bg-indigo-900/50 flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-semibold text-cyan-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-0.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Conversar sobre {destino}
            </h3>
            <button 
              onClick={() => setShowChat(false)}
              className="text-indigo-300 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Área de mensagens */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-indigo-950/30">
            <div className="space-y-4">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                        : msg.isTyping
                          ? 'bg-white/5 backdrop-blur-sm border border-indigo-300/10'
                          : msg.content.includes('Desculpe, tive um problema')
                            ? 'bg-red-900/30 backdrop-blur-sm border border-red-400/30'
                            : 'bg-white/10 backdrop-blur-sm border border-indigo-300/20'
                    }`}
                  >
                    {msg.isTyping ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-300"></div>
                      </div>
                    ) : (
                      <div className="text-sm markdown-content prose-sm prose-invert max-w-none" 
                          dangerouslySetInnerHTML={{ __html: processarMarkdown(msg.content) }}>
                      </div>
                    )}
                    
                    {/* Botão de tentar novamente para mensagens de erro */}
                    {msg.role === 'assistant' && msg.content.includes('Desculpe, tive um problema') && (
                      <button 
                        onClick={retryLastMessage}
                        className="mt-2 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Tentar novamente
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
          
          {/* Área de input melhorada */}
          <div className="p-2 sm:p-3 border-t border-indigo-300/30 bg-indigo-900/50">
            <div className="flex items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder={`Pergunte sobre ${destino}...`}
                  className="w-full p-3 sm:p-4 rounded-l-lg bg-white/10 border border-indigo-300/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white text-base placeholder:text-indigo-300/70"
                  disabled={isSendingMessage}
                  autoFocus
                />
                {messageInput && (
                  <button
                    onClick={() => setMessageInput('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-300/50 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={sendChatMessage}
                disabled={isSendingMessage || !messageInput.trim()}
                className={`p-3 sm:p-4 rounded-r-lg ${
                  isSendingMessage || !messageInput.trim()
                    ? 'bg-indigo-700/50 text-indigo-300/50'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                } transition-colors flex items-center justify-center`}
              >
                {isSendingMessage ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Indicador de status com feedback */}
            {isSendingMessage && (
              <div className="mt-2 text-xs text-indigo-300 flex items-center justify-center">
                <span className="animate-pulse">Processando sua mensagem...</span>
              </div>
            )}
            
            {/* Área de dicas para o usuário - oculto em telas muito pequenas */}
            {!isSendingMessage && chatMessages.length <= 2 && (
              <div className="mt-3 text-xs text-indigo-300/70 p-2 bg-white/5 rounded-lg hidden sm:block">
                <p className="mb-1">💡 Dicas para conversar:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Pergunte sobre atrações específicas em {destino}</li>
                  <li>Solicite recomendações de restaurantes</li>
                  <li>Peça informações sobre clima e melhor época para visitar</li>
                  <li>Tire dúvidas sobre transporte local</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Adicionar dentro da função Home, após as declarações de estado
  // Adicionar após os estados actuais no export default function Home()
  const [moeda, setMoeda] = useState("BRL");

  // Mapeamento de países para moedas
  const moedasPorPais = useMemo(() => ({
    // América do Sul
    "Brasil": "BRL",
    "Argentina": "ARS",
    "Chile": "CLP",
    "Colômbia": "COP",
    "Peru": "PEN",
    "Uruguai": "UYU",
    // América do Norte
    "Estados Unidos": "USD",
    "Canadá": "CAD",
    "México": "MXN",
    // Europa
    "Portugal": "EUR",
    "Espanha": "EUR",
    "França": "EUR",
    "Alemanha": "EUR",
    "Itália": "EUR",
    "Reino Unido": "GBP",
    "Suíça": "CHF",
    // Ásia
    "Japão": "JPY",
    "China": "CNY",
    "Índia": "INR",
    "Tailândia": "THB",
    "Singapura": "SGD",
    // Oceania
    "Austrália": "AUD",
    "Nova Zelândia": "NZD",
  }), []);

  // Símbolos monetários para exibição
  const simbolosMoeda = useMemo(() => ({
    "BRL": "R$",
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "ARS": "$",
    "CLP": "$",
    "COP": "$",
    "PEN": "S/",
    "UYU": "$U",
    "CAD": "C$",
    "MXN": "$",
    "CHF": "CHF",
    "JPY": "¥",
    "CNY": "¥",
    "INR": "₹",
    "THB": "฿",
    "SGD": "S$",
    "AUD": "A$",
    "NZD": "NZ$"
  }), []);

  // Detectar país a partir do nome da cidade
  useEffect(() => {
    // Essa é uma versão simplificada. Em produção, você usaria um serviço
    // geocoding ou uma API mais robusta
    if (destino.includes("São Paulo") || destino.includes("Rio") || destino.includes("Brasília") || 
        destino.includes("Salvador") || destino.includes("Vitória")) {
      setMoeda("BRL");
    } else if (destino.includes("Nova Iorque") || destino.includes("Miami") || destino.includes("Orlando") ||
              destino.includes("Las Vegas") || destino.includes("Los Angeles")) {
      setMoeda("USD");
    } else if (destino.includes("Paris") || destino.includes("Madrid") || destino.includes("Barcelona") ||
              destino.includes("Roma") || destino.includes("Berlim") || destino.includes("Amsterdam") || 
              destino.includes("Lisboa")) {
      setMoeda("EUR");
    } else if (destino.includes("Londres")) {
      setMoeda("GBP");
    } else if (destino.includes("Tóquio")) {
      setMoeda("JPY");
    } else if (destino.includes("Sydney") || destino.includes("Melbourne")) {
      setMoeda("AUD");
    } else if (destino.includes("Buenos Aires") || destino.includes("Bariloche")) {
      setMoeda("ARS");
    }
  }, [destino]);

  // Adicionar depois do objeto simbolosMoeda
  // Mapeamento de moedas para bandeiras de países
  const bandeirasMoeda = useMemo(() => ({
    "BRL": "🇧🇷",
    "USD": "🇺🇸",
    "EUR": "🇪🇺",
    "GBP": "🇬🇧",
    "ARS": "🇦🇷",
    "CLP": "🇨🇱",
    "COP": "🇨🇴",
    "PEN": "🇵🇪",
    "UYU": "🇺🇾",
    "CAD": "🇨🇦",
    "MXN": "🇲🇽",
    "CHF": "🇨🇭",
    "JPY": "🇯🇵",
    "CNY": "🇨🇳",
    "INR": "🇮🇳",
    "THB": "🇹🇭",
    "SGD": "🇸🇬",
    "AUD": "🇦🇺",
    "NZD": "🇳🇿"
  }), []);

  // Formatar valor com base na moeda selecionada
  const formatarValor = (valor, moeda) => {
    try {
      const formatters = {
        "BRL": new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
        "USD": new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
        "EUR": new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
        "GBP": new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
        "ARS": new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }),
        "CLP": new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }),
        "COP": new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }),
        "PEN": new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }),
        "UYU": new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }),
        "CAD": new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
        "MXN": new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }),
        "CHF": new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }),
        "JPY": new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }),
        "CNY": new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }),
        "AUD": new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }),
        "NZD": new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }),
      };
      
      return formatters[moeda]?.format(valor) || `${simbolosMoeda[moeda]}${valor}`;
    } catch (error) {
      return `${simbolosMoeda[moeda]}${valor}`;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-900 text-white overflow-hidden relative ${showChat ? 'pl-[400px]' : ''} transition-all duration-300 ease-in-out`}>
      {/* Adicionar estilos globais */}
      <style jsx global>{globalStyles}</style>

      {/* Estrelas animadas */}
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-1000 ${showStars ? 'opacity-50' : ''}`}
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      {/* Elementos visuais decorativos */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-96 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 right-32 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Botão de Chat Flutuante */}
      <button 
        onClick={() => setShowChat(!showChat)}
        className={`fixed bottom-6 ${showChat ? 'left-[410px]' : 'left-6'} z-40 bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center group`}
        aria-label={showChat ? "Fechar chat" : "Abrir chat"}
      >
        {showChat ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute left-full ml-3 bg-white text-indigo-900 px-2 py-1 rounded text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
              Conversar sobre {destino}
            </span>
          </>
        )}
      </button>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header com animação sutíl */}
        <header className="flex flex-col items-center justify-center mb-12 mt-6">
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 pb-2 relative z-10">
              TravelGemini
            </h1>
            <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 rounded-full transform scale-x-0 animate-expandLine"></div>
          </div>
          <p className="text-cyan-300 mt-3 text-lg max-w-2xl text-center animate-fadeIn">
            Planeje sua viagem perfeita com inteligência artificial
          </p>
        </header>

        {/* Main Content com profundidade visual */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/10 transition-all duration-500 hover:border-cyan-500/20">
          {/* Multi-step form */}
          <div className="mb-8 hidden md:flex justify-center">
            <div className="flex items-center w-full max-w-3xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formStep >= 1 ? 'bg-cyan-500' : 'bg-indigo-700/50'} transition-colors duration-300`}>
                <span className="text-white font-bold">1</span>
              </div>
              <div className={`flex-1 h-1 ${formStep >= 2 ? 'bg-cyan-500' : 'bg-indigo-700/50'} transition-colors duration-300`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formStep >= 2 ? 'bg-cyan-500' : 'bg-indigo-700/50'} transition-colors duration-300`}>
                <span className="text-white font-bold">2</span>
              </div>
              <div className={`flex-1 h-1 ${formStep >= 3 ? 'bg-cyan-500' : 'bg-indigo-700/50'} transition-colors duration-300`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formStep >= 3 ? 'bg-cyan-500' : 'bg-indigo-700/50'} transition-colors duration-300`}>
                <span className="text-white font-bold">3</span>
              </div>
            </div>
          </div>

          {formStep === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-300">Detalhes da Viagem</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Origem - Substituir pelo input com autocomplete */}
                <AutocompleteInput
                  value={origem}
                  onChange={setOrigem}
                  placeholder="De onde você está partindo?"
                  label="Origem"
                  icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                  }
                />

                {/* Destino - Substituir pelo input com autocomplete */}
                <AutocompleteInput
                  value={destino}
                  onChange={setDestino}
                  placeholder="Para onde você quer ir?"
                  label="Destino"
                  icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                  }
                />

                {/* Datas - Com ícones e design moderno */}
                <div className="relative group">
                  <label className="block text-sm font-medium mb-2 text-cyan-300 group-hover:text-white transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Data de Ida
                    </span>
                  </label>
                  <input
                    type="date"
                    value={dataIda}
                    onChange={(e) => setDataIda(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-indigo-300/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none text-white transition-all hover:border-cyan-400/30"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium mb-2 text-cyan-300 group-hover:text-white transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Data de Volta
                    </span>
                  </label>
                  <input
                    type="date"
                    value={dataVolta}
                    onChange={(e) => setDataVolta(e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:outline-none text-white transition-all hover:border-cyan-400/30 ${!isDatasValidas ? 'border-red-500 focus:ring-red-400' : 'border-indigo-300/30 focus:ring-cyan-400'}`}
                    min={dataIda}
                  />
                  {!isDatasValidas && (
                    <p className="text-red-400 text-xs mt-1">A data de volta deve ser posterior à data de ida</p>
                  )}
                </div>

                {/* Orçamento - Com design melhorado e feedback visual */}
                <div className="relative group md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-cyan-300 group-hover:text-white transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Orçamento
                      {destino && (
                        <span className="ml-2 text-xs py-1 px-2 bg-indigo-500/30 rounded-full text-indigo-300">
                          Destino: {destino}
                        </span>
                      )}
                    </span>
                  </label>
                  
                  <div className="relative flex flex-col md:flex-row space-y-2 md:space-y-0">
                    {/* Redesenhado o seletor de moeda */}
                    <div className="bg-white/10 border border-indigo-300/30 md:rounded-l-lg md:rounded-r-none rounded-lg flex items-center px-3 md:w-32">
                      <div className="text-lg mr-2">{bandeirasMoeda[moeda]}</div>
                      <select 
                        value={moeda}
                        onChange={(e) => setMoeda(e.target.value)}
                        className="appearance-none bg-transparent border-0 text-white py-3 focus:outline-none"
                        style={{ 
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 20 20'%3e%3cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3e%3c/svg%3e")`, 
                          backgroundRepeat: 'no-repeat', 
                          backgroundPosition: 'right center', 
                          backgroundSize: '1.25em 1.25em',
                          paddingRight: '1.5rem'
                        }}
                      >
                        <option value="BRL">BRL</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="ARS">ARS</option>
                        <option value="CLP">CLP</option>
                        <option value="COP">COP</option>
                        <option value="PEN">PEN</option>
                        <option value="UYU">UYU</option>
                        <option value="CAD">CAD</option>
                        <option value="MXN">MXN</option>
                        <option value="JPY">JPY</option>
                        <option value="CNY">CNY</option>
                        <option value="AUD">AUD</option>
                        <option value="NZD">NZD</option>
                      </select>
                    </div>
                    
                    {/* Campo de entrada de orçamento */}
                    <div className="relative flex-1">
                  <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300">
                          {simbolosMoeda[moeda]}
                        </span>
                    <input
                      type="number"
                      value={orcamento}
                      min="1"
                      onChange={(e) => setOrcamento(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 bg-white/5 border md:rounded-l-none rounded-lg focus:ring-2 focus:outline-none text-white transition-all hover:border-cyan-400/30 ${!isOrcamentoValido ? 'border-red-500 focus:ring-red-400' : 'border-indigo-300/30 focus:ring-cyan-400'}`}
                      placeholder="Quanto você pretende gastar?"
                    />
                  </div>
                      
                      {/* Exibir valor formatado */}
                      {orcamento > 0 && (
                        <div className="absolute right-0 top-full mt-1 text-xs text-cyan-300">
                          Valor formatado: {formatarValor(orcamento, moeda)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!isOrcamentoValido && (
                    <p className="text-red-400 text-xs mt-1">O orçamento deve ser maior que zero</p>
                  )}
                  
                  {/* Dicas de conversão */}
                  {moeda !== "BRL" && orcamento > 0 && (
                    <div className="mt-2 p-2 bg-indigo-500/10 rounded-lg text-xs text-indigo-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Os valores serão calculados na moeda selecionada. Consulte a taxa de câmbio atual para referência.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <div></div> {/* Espaço vazio para alinhar botões */}
                <button
                  onClick={() => setFormStep(2)}
                  disabled={!origem || !destino || !isDatasValidas || !isOrcamentoValido}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <span>Próximo</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-300">Preferências de Viagem</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Transporte - Com ícones e design visual melhorado */}
                <div className="relative group">
                  <label className="block text-sm font-medium mb-2 text-cyan-300 group-hover:text-white transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Tipo de Transporte
                    </span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Carro', 'Avião', 'Ônibus', 'Trem'].map((tipo) => (
                      <div
                        key={tipo}
                        onClick={() => setTransporte(tipo)}
                        className={`px-4 py-3 rounded-lg cursor-pointer transition-all text-center ${
                          transporte === tipo
                            ? 'bg-gradient-to-r from-cyan-500/70 to-blue-500/70 text-white border-2 border-cyan-300'
                            : 'bg-white/5 text-indigo-200 border border-indigo-300/30 hover:bg-white/10'
                        }`}
                      >
                        <span className="flex flex-col items-center justify-center">
                          {tipo === 'Carro' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8a2 2 0 012 2v1a2 2 0 002 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 002-2V9a2 2 0 012-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
                              <circle cx="8" cy="16" r="1" />
                              <circle cx="16" cy="16" r="1" />
                            </svg>
                          )}
                          {tipo === 'Avião' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          )}
                          {tipo === 'Ônibus' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12M6 6v12a2 2 0 002 2h8a2 2 0 002-2V6M6 6a2 2 0 012-2h8a2 2 0 012 2" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14h8" />
                              <circle cx="8" cy="18" r="1" />
                              <circle cx="16" cy="18" r="1" />
                            </svg>
                          )}
                          {tipo === 'Trem' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18V12M8 18V12M16 18V12M7 6h10a1 1 0 011 1v3a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 16v1a2 2 0 01-2 2H10a2 2 0 01-2-2v-1" />
                            </svg>
                          )}
                          {tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hospedagem - Com ícones e design visual melhorado */}
                <div className="relative group">
                  <label className="block text-sm font-medium mb-2 text-cyan-300 group-hover:text-white transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Tipo de Hospedagem
                    </span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['Hotel', 'Pousada', 'Resort', 'Airbnb', 'Hostel'].map((tipo) => (
                      <div
                        key={tipo}
                        onClick={() => setHospedagem(tipo)}
                        className={`px-4 py-3 rounded-lg cursor-pointer transition-all text-center ${
                          hospedagem === tipo
                            ? 'bg-gradient-to-r from-cyan-500/70 to-blue-500/70 text-white border-2 border-cyan-300'
                            : 'bg-white/5 text-indigo-200 border border-indigo-300/30 hover:bg-white/10'
                        }`}
                      >
                        <span className="flex flex-col items-center justify-center">
                          {tipo === 'Hotel' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          {tipo === 'Pousada' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                          {tipo === 'Resort' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          )}
                          {tipo === 'Airbnb' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                          {tipo === 'Hostel' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                          {tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tipo de Viagem - Com ícones e design visual melhorado */}
                <div className="relative group md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-cyan-300 group-hover:text-white transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tipo de Viagem
                    </span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {['Romântica', 'Aventura', 'Família', 'Negócios', 'Cultural', 'Gastronômica', 'Praia', 'Religiosa', 'Relaxamento', 'Educativa', 'Mochilão', 'Luxo'].map((tipo) => (
                      <div
                        key={tipo}
                        onClick={() => setTipoViagem(tipo)}
                        className={`px-4 py-3 rounded-lg cursor-pointer transition-all text-center ${tipoViagem === tipo
                            ? 'bg-gradient-to-r from-cyan-500/70 to-blue-500/70 text-white border-2 border-cyan-300'
                            : 'bg-white/5 text-indigo-200 border border-indigo-300/30 hover:bg-white/10'
                          }`}
                      >
                        <span className="flex flex-col items-center justify-center">
                          {tipo === 'Romântica' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                          {tipo === 'Aventura' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                          {tipo === 'Família' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                          {tipo === 'Negócios' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {tipo === 'Cultural' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                          )}
                          {tipo === 'Gastronômica' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {tipo === 'Praia' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H8a4 4 0 00-5 3.9zm0 0a2 2 0 012-2h12a4 4 0 00-3-6M3 15h18" />
                            </svg>
                          )}
                          {tipo === 'Religiosa' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                          {tipo === 'Relaxamento' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                          {tipo === 'Educativa' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          )}
                          {tipo === 'Mochilão' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                          )}
                          {tipo === 'Luxo' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        {tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setFormStep(1)}
                  className="px-6 py-2 bg-white/10 text-white font-medium rounded-lg shadow-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Anterior</span>
                </button>
                <button
                  onClick={() => setFormStep(3)}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <span>Próximo</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-300">Interesses e Preferências</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Interesses - Novo design com cards em vez de checkboxes */}
                <div className="relative group">
                  <label className="block text-sm font-medium mb-3 text-cyan-300 group-hover:text-white transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Interesses
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.keys(interesses).map((key) => (
                      <div 
                        key={key}
                        onClick={() => handleInteresseChange(key)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden group/card ${
                          interesses[key] 
                            ? 'bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-indigo-400/50' 
                            : 'bg-white/5 border border-indigo-300/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 mr-2 rounded flex items-center justify-center transition-colors ${
                            interesses[key] ? 'bg-indigo-500 text-white' : 'bg-white/10'
                          }`}>
                            {interesses[key] && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                    </div>
                          <span className="font-medium">
                            {key === 'historiaCultura' ? 'História/Cultura' : 
                             key === 'vidaNoturna' ? 'Vida Noturna' : 
                             key === 'vinícolas' ? 'Vinícolas' : 
                             key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                    </div>
                        {interesses[key] && (
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl group-hover/card:w-16 group-hover/card:h-16 transition-all duration-300"></div>
                        )}
                    </div>
                    ))}
                  </div>
                </div>

                {/* Viagem com crianças - Novo design com card estilizado */}
                <div className="relative group">
                  <label className="block text-sm font-medium mb-3 text-cyan-300 group-hover:text-white transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Viagem com crianças
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setViagemComCriancas(!viagemComCriancas)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden group/card ${
                        viagemComCriancas 
                          ? 'bg-gradient-to-br from-blue-500/30 to-pink-500/30 border border-blue-400/50' 
                          : 'bg-white/5 border border-indigo-300/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 mr-2 rounded flex items-center justify-center transition-colors ${
                          viagemComCriancas ? 'bg-blue-500 text-white' : 'bg-white/10'
                        }`}>
                          {viagemComCriancas && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                  </div>
                        <div>
                          <span className="font-medium">Sim</span>
                          <p className="text-xs text-indigo-300 mt-1">Adaptaremos o plano</p>
                        </div>
                      </div>
                      {viagemComCriancas && (
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-500/20 rounded-full blur-xl"></div>
                      )}
                    </div>
                    
                    {viagemComCriancas && (
                      <div className="p-3 rounded-lg border border-indigo-300/20 bg-white/5 transition-all duration-300">
                        <label className="text-xs text-indigo-300 block mb-1">Número de crianças</label>
                        <div className="flex items-center">
                          <button 
                            onClick={() => setQuantidadeFilhos(prev => Math.max(1, prev - 1))}
                            className="w-7 h-7 rounded bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <div className="w-8 h-8 mx-2 rounded bg-indigo-500/20 flex items-center justify-center text-white font-medium">
                            {quantidadeFilhos}
                          </div>
                          
                          <button 
                            onClick={() => setQuantidadeFilhos(prev => Math.min(10, prev + 1))}
                            className="w-7 h-7 rounded bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setFormStep(2)}
                  className="px-6 py-2 bg-white/10 text-white font-medium rounded-lg shadow-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Anterior</span>
                </button>
                <button
                  onClick={planejarViagem}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <span>Planejar Minha Viagem</span>
                </button>
              </div>
            </div>
          )}

          {/* Área de Status */}
          {isLoading && (
            <div className="mt-10 p-5 bg-black/30 rounded-xl border border-indigo-300/30 backdrop-blur-sm animate-fadeIn">
              <h3 className="text-xl font-semibold mb-4 text-center text-cyan-300">Gerando seu plano de viagem</h3>
              <div className="space-y-5">
                <div className={`flex items-center space-x-3 ${etapaAtual >= 1 ? 'text-cyan-300' : 'text-indigo-300/50'} transition-colors duration-300`}>
                  <div className={`${etapaAtual === 1 ? "animate-pulse" : ""} w-7 h-7 rounded-full flex items-center justify-center ${etapaAtual >= 1 ? 'bg-cyan-500/20' : 'bg-indigo-700/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Iniciando planejamento da sua viagem...</p>
                    <p className="text-xs opacity-80">{etapaAtual === 1 && "Analisando preferências e requisitos"}</p>
                  </div>
                  {etapaAtual > 1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className={`flex items-center space-x-3 ${etapaAtual >= 2 ? 'text-cyan-300' : 'text-indigo-300/50'} transition-colors duration-300`}>
                  <div className={`${etapaAtual === 2 ? "animate-pulse" : ""} w-7 h-7 rounded-full flex items-center justify-center ${etapaAtual >= 2 ? 'bg-cyan-500/20' : 'bg-indigo-700/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a1 1 0 00.9-.5l3-5A1 1 0 0016 3H4a1 1 0 00-1 1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Buscando opções de transporte...</p>
                    <p className="text-xs opacity-80">{etapaAtual === 2 && "Comparando preços e disponibilidade"}</p>
                  </div>
                  {etapaAtual > 2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className={`flex items-center space-x-3 ${etapaAtual >= 3 ? 'text-cyan-300' : 'text-indigo-300/50'} transition-colors duration-300`}>
                  <div className={`${etapaAtual === 3 ? "animate-pulse" : ""} w-7 h-7 rounded-full flex items-center justify-center ${etapaAtual >= 3 ? 'bg-cyan-500/20' : 'bg-indigo-700/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Pesquisando hospedagens...</p>
                    <p className="text-xs opacity-80">{etapaAtual === 3 && "Verificando avaliações e comodidades"}</p>
                  </div>
                  {etapaAtual > 3 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className={`flex items-center space-x-3 ${etapaAtual >= 4 ? 'text-cyan-300' : 'text-indigo-300/50'} transition-colors duration-300`}>
                  <div className={`${etapaAtual === 4 ? "animate-pulse" : ""} w-7 h-7 rounded-full flex items-center justify-center ${etapaAtual >= 4 ? 'bg-cyan-500/20' : 'bg-indigo-700/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Planejando atrações e roteiro...</p>
                    <p className="text-xs opacity-80">{etapaAtual === 4 && "Baseado nos seus interesses selecionados"}</p>
                  </div>
                  {etapaAtual > 4 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className={`flex items-center space-x-3 ${etapaAtual >= 5 ? 'text-cyan-300' : 'text-indigo-300/50'} transition-colors duration-300`}>
                  <div className={`${etapaAtual === 5 ? "animate-pulse" : ""} w-7 h-7 rounded-full flex items-center justify-center ${etapaAtual >= 5 ? 'bg-cyan-500/20' : 'bg-indigo-700/20'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Finalizando seu plano de viagem...</p>
                    <p className="text-xs opacity-80">{etapaAtual === 5 && "Ajustando orçamento e cronograma"}</p>
                  </div>
                  {etapaAtual > 5 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="w-full bg-indigo-900/30 h-2 rounded-full mt-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(etapaAtual / 5) * 100}%` }}
                ></div>
              </div>
        </div>
          )}

          {/* Resultado */}
          {resultadoPlanejamento && !isLoading && (
            <div className="mt-8 animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-300">Seu plano está pronto!</h2>

              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-indigo-300/30 overflow-hidden">
                {/* Mudar de layout horizontal para vertical */}
                <div className="flex flex-col md:flex-row">
                  {/* Navegação vertical (em vez de horizontal) */}
                  <div className="border-r border-indigo-300/30 md:w-52">
                    <nav className="flex flex-col">
                    <button
                      onClick={() => setAbaSelecionada("Transporte")}
                        className={`py-4 px-4 text-left ${abaSelecionada === "Transporte" ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-medium border-l-4 border-cyan-400" : "text-indigo-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent"} transition-all`}
                    >
                      <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Transporte</span>
                      </span>
                    </button>
                    <button
                      onClick={() => setAbaSelecionada("Hospedagem")}
                        className={`py-4 px-4 text-left ${abaSelecionada === "Hospedagem" ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-medium border-l-4 border-cyan-400" : "text-indigo-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent"} transition-all`}
                    >
                      <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Hospedagem</span>
                      </span>
                    </button>
                    <button
                      onClick={() => setAbaSelecionada("Atrações")}
                        className={`py-4 px-4 text-left ${abaSelecionada === "Atrações" ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-medium border-l-4 border-cyan-400" : "text-indigo-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent"} transition-all`}
                    >
                      <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <span>Atrações</span>
                      </span>
                    </button>
                    <button
                      onClick={() => setAbaSelecionada("Plano Completo")}
                        className={`py-4 px-4 text-left ${abaSelecionada === "Plano Completo" ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-medium border-l-4 border-cyan-400" : "text-indigo-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent"} transition-all`}
                    >
                      <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Plano Completo</span>
                      </span>
                    </button>
                  </nav>
                </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                <div className="p-6">
                  {!resultadoPlanejamento ? (
                    <div className="text-center text-indigo-200 italic p-12 flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-indigo-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Os resultados do seu planejamento aparecerão aqui após o processamento.</p>
                    </div>
                  ) : (
                    <div>
                      {abaSelecionada === "Transporte" && (
                        <div className="animate-fadeIn">
                          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2 text-cyan-300">Opções de Transporte</h3>
                            <p className="text-indigo-200 text-sm">Baseado na sua preferência por <span className="text-white font-medium">{transporte}</span></p>
                          </div>
                          <div className="bg-black/30 p-5 rounded-lg border border-indigo-300/10">
                                <div className="markdown-content prose-sm prose-invert max-w-none" 
                                     dangerouslySetInnerHTML={{ __html: processarMarkdown(
                                       // Pré-processar para remover referências numéricas problemáticas
                                       resultadoPlanejamento.transporte
                                         .replace(/\[\d+(?:,\s*\d+)*\]/g, '') // Remover colchetes de referências numéricas
                                         .replace(/\n{2,}/g, '\n\n')
                                         .replace(/\*\s*([A-Z])/g, '* $1')
                                         .replace(/\. ([A-Z])/g, '. $1')
                                         // Melhorar espaçamento entre elementos
                                         .replace(/(\w)(\*)/g, '$1 $2') // Adicionar espaço antes de asterisco
                                         .replace(/(\d+)([a-zA-Z])/g, '$1 $2') // Adicionar espaço entre números e letras
                                         .replace(/:(\w)/g, ': $1') // Adicionar espaço após dois pontos
                                         .replace(/(\.|\?|\!)(\w)/g, '$1 $2') // Espaço após pontuação
                                         .replace(/(\w)(http)/g, '$1 $2') // Espaço antes de URLs
                                         .replace(/([a-z])([A-Z])/g, '$1 $2') // Espaço entre palavras sem espaço
                                         // Ajustes específicos para transporte
                                         .replace(/([0-9])horas/g, '$1 horas')
                                         .replace(/([0-9])dias/g, '$1 dias')
                                         .replace(/([a-z])R\$/g, '$1 R$')
                                         .replace(/Combustível:/g, 'Combustível: ')
                                         .replace(/Pedágios:/g, 'Pedágios: ')
                                         .replace(/Estimativa Geral:/g, 'Estimativa Geral: ')
                                         .replace(/gastocom/g, 'gasto com')
                                         .replace(/ZulOu/g, 'Zul+ ou')
                                     ) }}>
                                </div>
                          </div>
                        </div>
                      )}

                      {abaSelecionada === "Hospedagem" && (
                        <div className="animate-fadeIn">
                          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2 text-cyan-300">Opções de Hospedagem</h3>
                            <p className="text-indigo-200 text-sm">Baseado na sua preferência por <span className="text-white font-medium">{hospedagem}</span></p>
                          </div>
                          <div className="bg-black/30 p-5 rounded-lg border border-indigo-300/10">
                                <div className="markdown-content prose-sm prose-invert max-w-none" 
                                     dangerouslySetInnerHTML={{ __html: processarMarkdown(
                                       // Pré-processar para remover referências numéricas problemáticas
                                       resultadoPlanejamento.hospedagem
                                         .replace(/\[\d+(?:,\s*\d+)*\]/g, '') // Remover colchetes de referências numéricas
                                         .replace(/\n{2,}/g, '\n\n')
                                         .replace(/\*\s*([A-Z])/g, '* $1')
                                         .replace(/\. ([A-Z])/g, '. $1')
                                         // Melhorar espaçamento entre elementos
                                         .replace(/(\w)(\*)/g, '$1 $2') // Adicionar espaço antes de asterisco
                                         .replace(/(\d+)([a-zA-Z])/g, '$1 $2') // Adicionar espaço entre números e letras
                                         .replace(/:(\w)/g, ': $1') // Adicionar espaço após dois pontos
                                         .replace(/(\.|\?|\!)(\w)/g, '$1 $2') // Espaço após pontuação
                                         .replace(/(\w)(http)/g, '$1 $2') // Espaço antes de URLs
                                         .replace(/([a-z])([A-Z])/g, '$1 $2') // Espaço entre palavras sem espaço
                                         // Ajustes específicos para hospedagem
                                         .replace(/Custo-Benefício:/g, 'Custo-Benefício: ')
                                         .replace(/Opções Charmosas:/g, 'Opções Charmosas: ')
                                         .replace(/Luxo:/g, 'Luxo: ')
                                     ) }}>
                                </div>
                          </div>
                        </div>
                      )}

                      {abaSelecionada === "Atrações" && (
                        <div className="animate-fadeIn">
                          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2 text-cyan-300">Atrações Recomendadas</h3>
                            <p className="text-indigo-200 text-sm">Baseado nos seus interesses em: {Object.keys(interesses).filter(i => interesses[i]).join(', ')}</p>
                          </div>
                          <div className="bg-black/30 p-5 rounded-lg border border-indigo-300/10">
                                <div 
                                  className="markdown-content prose-sm prose-invert max-w-none" 
                                  dangerouslySetInnerHTML={{ 
                                    __html: processarMarkdown(
                                      // Pré-processar para corrigir formatações problemáticas
                                      resultadoPlanejamento.atracoes
                                        .replace(/^\* /gm, '• ')
                                        .replace(/<strong>Dia (\d+):<\/strong>/g, '## Dia $1:')
                                        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
                                        .replace(/\[\d+(?:,\s*\d+)*\]/g, '') // Remover colchetes de referências numéricas
                                        .replace(/\n{2,}/g, '\n\n')
                                        .replace(/\*\s*([A-Z])/g, '* $1')
                                        .replace(/\. ([A-Z])/g, '. $1')
                                    )
                                  }}>
                                </div>
                          </div>
                        </div>
                      )}

                      {abaSelecionada === "Plano Completo" && (
                        <div className="animate-fadeIn">
                          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2 text-cyan-300">Plano Completo da Viagem</h3>
                            <p className="text-indigo-200 text-sm">Todos os detalhes do seu planejamento para <span className="text-white font-medium">{destino}</span></p>
                          </div>
                              <div className="bg-black/30 p-5 rounded-lg border border-indigo-300/10 overflow-auto max-h-[60vh] relative" id="plano-completo-container">
                                <div className="markdown-content prose-sm prose-invert max-w-none" 
                                     dangerouslySetInnerHTML={{ 
                                       __html: marked.parse(resultadoPlanejamento.relatorio
                                         // Pré-processar o texto para corrigir problemas de formatação
                                         .replace(/\n{2,}/g, '\n\n')
                                         .replace(/\*\s*([A-Z])/g, '* $1')
                                         .replace(/\. ([A-Z])/g, '. $1')
                                         .replace(/\*([^\s*])/g, '* $1')
                                         // Converter asteriscos para formatação de negrito
                                         .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                         // Remover emojis e ícones não desejados
                                         .replace(/🏢|📍|🏠|🏨|🏙️/g, '')
                                         // Remover colchetes de referência
                                         .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
                                         ,
                                       {
                                         breaks: true,
                                         gfm: true,
                                         sanitize: false,
                                         headerIds: false
                                       })
                                     }}>
                                </div>
                                
                                <button 
                                  onClick={() => {
                                    document.getElementById('plano-completo-container').scrollTop = 0;
                                  }}
                                  className="fixed bottom-20 right-8 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 opacity-80 hover:opacity-100"
                                  title="Voltar ao topo"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                  </svg>
                                </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-indigo-300/30 p-4 bg-indigo-900/20 flex justify-between items-center">
                  <button onClick={() => setResultadoPlanejamento(null)} className="text-indigo-300 hover:text-white text-sm flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    <span>Novo planejamento</span>
                      </button>

                      {resultadoPlanejamento && (
                        <div className="flex space-x-3">
                          <button 
                            id="btn-copiar"
                            onClick={() => {
                              const conteudoAtual = abaSelecionada === "Plano Completo" 
                                ? resultadoPlanejamento.relatorio 
                                : (abaSelecionada === "Transporte" 
                                    ? resultadoPlanejamento.transporte 
                                    : (abaSelecionada === "Hospedagem" 
                                        ? resultadoPlanejamento.hospedagem 
                                        : resultadoPlanejamento.atracoes));
                              
                              copiarParaAreaDeTransferencia(
                                processarMarkdown(conteudoAtual), 
                                origem, 
                                destino
                              );
                            }}
                            className="text-indigo-300 hover:text-white text-sm flex items-center space-x-1 hover-lift"
                            title="Copiar conteúdo para a área de transferência"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>Copiar texto</span>
                          </button>

                          <button 
                            onClick={() => {
                              exportarComoPDF(`Plano_${destino}`);
                            }}
                            className="text-indigo-300 hover:text-white text-sm flex items-center space-x-1 hover-lift"
                            title="Imprimir ou salvar como PDF"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Salvar PDF</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              // Implementação simplificada para compartilhar
                              if (navigator.share) {
                                navigator.share({
                                  title: `Plano de Viagem para ${destino}`,
                                  text: `Confira meu plano de viagem para ${destino} gerado pelo TravelGemini!`,
                                  url: window.location.href,
                                });
                              } else {
                                // Fallback - copia URL para a área de transferência
                                navigator.clipboard.writeText(window.location.href)
                                  .then(() => alert('Link copiado para a área de transferência!'));
                              }
                            }}
                            className="text-indigo-300 hover:text-white text-sm flex items-center space-x-1 hover-lift"
                            title="Compartilhar plano de viagem"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span>Compartilhar</span>
                  </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs (quando não tem resultados) */}
          {!resultadoPlanejamento && !isLoading && formStep > 3 && (
            <div className="mt-8 animate-fadeIn">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-indigo-300/30 overflow-hidden">
                {/* Mudar de layout horizontal para vertical */}
                <div className="flex flex-col md:flex-row">
                  {/* Navegação vertical (em vez de horizontal) */}
                  <div className="border-r border-indigo-300/30 md:w-52">
                    <nav className="flex flex-col">
                      <button className="py-4 px-4 text-left bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-medium border-l-4 border-cyan-400">
                      <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Transporte</span>
                      </span>
                    </button>
                      <button className="py-4 px-4 text-left text-indigo-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent">
                      <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Hospedagem</span>
                      </span>
                    </button>
                      <button className="py-4 px-4 text-left text-indigo-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent">
                      <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <span>Atrações</span>
                      </span>
                    </button>
                      <button className="py-4 px-4 text-left text-indigo-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent">
                      <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Plano Completo</span>
                      </span>
                    </button>
                  </nav>
                </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1">
                <div className="p-12">
                  <div className="text-center text-indigo-200 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-indigo-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mb-4">Os resultados do seu planejamento aparecerão aqui após o processamento.</p>
                    <button
                      onClick={planejarViagem}
                      disabled={isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-cyan-400 mt-4"
                    >
                      <span>Planejar Minha Viagem</span>
                    </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Renderizar o modal do chat */}
      <ChatModal />
    </div>
  );
}

async function fetchAgente(dadosViagem) {
  const response = await fetch('/api/planejar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dadosViagem),
  });

  if (!response.ok) {
    throw new Error('Falha ao planejar a viagem');
  }
  return response;
}

