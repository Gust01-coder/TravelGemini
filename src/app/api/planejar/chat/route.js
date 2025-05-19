import { GoogleGenAI } from "@google/genai";
import { agenteChat } from "../agenteChat";

export async function POST(request) {
  try {
    const data = await request.json();
    const { messages } = data;

    // Verificar se existem mensagens
    if (!messages || messages.length === 0) {
      return Response.json({ 
        erro: true, 
        mensagem: 'Nenhuma mensagem fornecida' 
      }, { status: 400 });
    }

    // IMPORTANTE: Usando a mesma chave API do outro endpoint
    const apiKey = "GOOGLE_API_KEY";

    if (!apiKey) {
      throw new Error('API_KEY não configurada nas variáveis de ambiente');
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Usar o agente de chat especializado
    const responseText = await agenteChat({ messages }, ai);

    return Response.json({ response: responseText }, { status: 200 });
  } catch (error) {
    console.error('Erro na API de chat:', error);
    return Response.json({
      erro: true,
      mensagem: 'Erro ao processar a mensagem do chat'
    }, { status: 500 });
  }
} 