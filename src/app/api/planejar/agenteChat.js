/**
 * Agente de Chat para o TravelGemini
 * 
 * Este módulo exporta uma função para processar mensagens de chat
 * utilizando a API do Google Gemini, seguindo o mesmo padrão
 * dos outros agentes.
 */

/**
 * Processa uma solicitação de chat e gera uma resposta.
 * 
 * @param {Object} dadosChat - Os dados da solicitação de chat
 * @param {Array} dadosChat.messages - As mensagens do chat
 * @param {Object} ai - A instância do Google GenAI
 * @returns {Promise<string>} - O texto da resposta
 */
export async function agenteChat(dadosChat, ai) {
  const { messages } = dadosChat;
  
  // Extrair o contexto do sistema e as mensagens do usuário
  const systemMessage = messages.find(m => m.role === 'system');
  const chatHistory = messages.filter(m => m.role !== 'system');
  
  // Consolidar todas as mensagens anteriores em um único contexto de histórico
  let chatContext = "";
  if (chatHistory.length > 1) {
    chatContext = chatHistory.slice(0, -1).map(msg => 
      `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
    ).join('\n\n');
  }
  
  // Obter a pergunta atual (última mensagem)
  const currentQuestion = chatHistory[chatHistory.length - 1].content;
  
  // Criar o prompt completo
  const prompt = `
${systemMessage ? systemMessage.content : 'Você é um assistente de viagem para o TravelGemini.'}

${chatContext ? `Histórico da conversa:\n${chatContext}\n\n` : ''}

Pergunta atual do usuário: ${currentQuestion}
`;

  // Gerar resposta usando o mesmo padrão dos outros agentes
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash", // Usar o mesmo modelo dos outros agentes
    contents: prompt,
    config: {
      systemInstruction: `
        Você é um assistente de viagem especializado do TravelGemini.
        Sua função é ajudar o usuário com informações e orientações sobre sua viagem planejada.
        
        Siga estas diretrizes:
        1. Seja amigável, prestativo e informativo
        2. Forneça respostas detalhadas e personalizadas com base no contexto da viagem
        3. Se for solicitado informações que não possui, informe isso educadamente
        4. Sugira atividades, locais e experiências relevantes para o destino
        5. Mantenha um tom conversacional e natural
        6. Use formatação simples para melhorar a legibilidade quando necessário
        
        Responda sempre em português do Brasil.
        Use a ferramenta google_search quando precisar de informações atualizadas ou específicas.
      `,
      temperature: 0.7,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: 1000,
      tools: [{ googleSearch: {} }]
    },
  });

  // Extrair e retornar o texto da resposta, seguindo o mesmo padrão dos outros agentes
  return response.candidates[0].content.parts.filter((part, index, array) => {
    if (array.length === 2 && index === 0) {
      return false;
    }
    return true;
  })[0].text;
} 