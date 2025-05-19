import { GoogleGenAI } from "@google/genai";

let resultadoTransporte = null;
let resultadoHospedagem = null;
let resultadoAtracoes = null;

export async function POST(request) {
  try {
    const dadosViagem = await request.json();

    // IMPORTANTE: Substitua "GOOGLE_API_KEY" pela sua chave de API do Google Gemini
    // Obtenha sua chave em: https://makersuite.google.com/app/apikey
    const apiKey = "GOOGLE_API_KEY"

    if (!apiKey) {
      throw new Error('API_KEY não configurada nas variáveis de ambiente');
    }

    const ai = new GoogleGenAI({ apiKey });

    const responseTransporte = await agenteTransporte(dadosViagem, ai)
    resultadoTransporte = responseTransporte

    const responseHospedagem = await agenteHospedagem(dadosViagem, ai)
    resultadoHospedagem = responseHospedagem

    const responseAtracoes = await agenteAtracoes(dadosViagem, ai)
    resultadoAtracoes = responseAtracoes

    const responseRelatorio = await agenteRelatorio(
      dadosViagem,
      resultadoTransporte,
      resultadoHospedagem,
      resultadoAtracoes,
      ai
    )

    const resultado = {
      atracoes: responseAtracoes,
      hospedagem: responseHospedagem,
      relatorio: responseRelatorio,
      transporte: responseTransporte
    }

    return Response.json(resultado, { status: 200 });
  } catch (error) {
    console.error('Erro ao processar planejamento:', error);
    return Response.json({
      erro: true,
      mensagem: 'Erro ao processar o planejamento da viagem'
    }, { status: 500 });
  }
}

async function agenteTransporte({ origem, destino, dataIda, dataVolta, transporte }, ai) {
  const prompt = `
    Origem: ${origem}
    Destino: ${destino}
    Data de ida: ${dataIda}
    Data de volta: ${dataVolta}
    Preferências: ${transporte}
  `

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction: `
        Você é um especialista em busca de transporte para viagens.
        Sua função é pesquisar e listar as melhores opções de transporte entre a origem
        e o destino nas datas especificadas, considerando:

        1. Diferentes modalidades (avião, ônibus, trem, carro particular/alugado)
        2. Preços estimados atuais para cada opção (em R$)
        3. Tempo de viagem
        4. Vantagens e desvantagens de cada opção
        5. Recomendações considerando as preferências do viajante

        Use a ferramenta google_search para encontrar informações reais e atualizadas.
        Organize os resultados em formato estruturado usando markdown para fácil comparação.

        IMPORTANTE: Para viagens internacionais, inclua informações sobre documentação necessária.
      `,
      tools: [{ googleSearch: {} }]
    },
  });

  return response.candidates[0].content.parts.filter((part, index, array) => {
    if(array.length === 2 && index === 0){
      return false;
    }
    return true;
  })[0].text;
}

async function agenteHospedagem({ destino, dataIda, dataVolta, orcamento, transporte }, ai) {
  const prompt = `
    Destino: ${destino}
    Data de check-in: ${dataIda}
    Data de check-out: ${dataVolta}
    Orçamento total para hospedagem: R$ ${orcamento}
    Preferências/necessidades: ${transporte}
  `

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction: `
        Você é um consultor especializado em hospedagem para viagens.
        Sua tarefa é pesquisar e recomendar opções de hospedagem no destino
        especificado, considerando:

        1. Diferentes categorias (hotéis, pousadas, hostels, apartamentos/casas)
        2. Faixas de preço dentro do orçamento informado
        3. Localização estratégica para turismo
        4. Avaliações e reputação
        5. Amenidades relevantes conforme preferências do viajante

        Use a ferramenta google_search para encontrar opções reais e atualizadas.
        Para cada categoria, indique pelo menos 2-3 opções específicas com nome,
        localização, preço estimado e principais diferenciais.

        Indique claramente quais são as melhores opções custo-benefício e as mais luxuosas.
        Use formatação markdown para tornar a apresentação mais clara e organizada.
      `,
      tools: [{ googleSearch: {} }]
    },
  });

  return response.candidates[0].content.parts.filter((part, index, array) => {
    if(array.length === 2 && index === 0){
      return false;
    }
    return true;
  })[0].text;
}

async function agenteAtracoes({ destino, dataIda, dataVolta, interesses, viagemComCrianças, tipoViagem }, ai) {
  const duracaoEstadia = Math.ceil((new Date(dataVolta) - new Date(dataIda)) / (1000 * 60 * 60 * 24));

  const prompt = `
    Destino: ${destino}
    Duração da estadia: ${duracaoEstadia} dias
    Interesses: ${interesses.join(", ")}
    Viagem com crianças: ${viagemComCrianças ? "Sim" : "Não"}
    Tipo de viagem: ${tipoViagem}
  `

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction: `
        Você é um guia turístico virtual especializado.
        Sua missão é criar um roteiro de atrações para o destino indicado,
        considerando:

        1. As principais atrações turísticas e pontos imperdíveis
        2. Experiências locais autênticas e menos conhecidas
        3. Atividades alinhadas com os interesses específicos do viajante
        4. Opções adequadas para o tipo de viagem (romântica, familiar, aventura, etc.)
        5. Restaurantes e experiências gastronômicas recomendadas

        Se a viagem for romântica, inclua sugestões especiais para casais.
        Se houver crianças, indique atividades adequadas para a família.

        Use a ferramenta google_search para encontrar informações atualizadas.

        Organize as atrações em um roteiro dia a dia com tempos estimados,
        localização e dicas práticas (melhor horário, como chegar, etc.).
        Use formatação markdown para tornar o roteiro visualmente organizado.
      `,
      tools: [{ googleSearch: {} }]
    },
  });

  return response.candidates[0].content.parts.filter((part, index, array) => {
    if(array.length === 2 && index === 0){
      return false;
    }
    return true;
  })[0].text;
}

async function agenteRelatorio({ destino, orcamento }, dadosTransporte, dadosHospedagem, dadosAtracoes, ai) {
  const prompt = `
    Destino: ${destino}
    Orçamento total disponível: R$ ${orcamento}

    --- INFORMAÇÕES DE TRANSPORTE ---
    ${dadosTransporte}

    --- INFORMAÇÕES DE HOSPEDAGEM ---
    ${dadosHospedagem}

    --- INFORMAÇÕES DE ATRAÇÕES ---
    ${dadosAtracoes}
  `

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction: `
        Você é um especialista em planejamento de viagens.
        Sua tarefa é compilar todas as informações de transporte, hospedagem e atrações
        em um plano de viagem abrangente, coeso e bem estruturado.

        Além de organizar todas as informações de forma lógica, você deve:

        1. Criar um resumo executivo da viagem no início
        2. Organizar um itinerário dia a dia detalhado
        3. Incluir um orçamento estimado total categorizado
        4. Adicionar dicas práticas e recomendações personalizadas
        5. Identificar e resolver possíveis inconsistências entre as diferentes partes

        O relatório deve ser visualmente organizado com seções claras e fácil de consultar.
        Use formatação markdown para melhorar a legibilidade, incluindo emojis para tornar
        o documento mais visualmente atraente.

        Inclua uma checklist pré-viagem com itens essenciais a lembrar.
      `,
    },
  });

  return response.candidates[0].content.parts[0].text;
}
