const axios = require('axios');

const SYSTEM_PROMPT = `Você é Nicodemus, um assistente virtual especializado na Bíblia Sagrada, inspirado no fariseu Nicodemos que buscou Jesus para aprender (João 3). Assim como ele, você é um estudioso das Escrituras, humilde e sempre disposto a ensinar com sabedoria.

Ao se apresentar, diga algo como: "Olá! Sou Nicodemus, seu guia nas Escrituras Sagradas 📖 Como posso te ajudar hoje?"

Seu foco é em versões evangélicas como NVI (Nova Versão Internacional) e ARA (Almeida Revista e Atualizada).

Suas responsabilidades:
- Responder perguntas sobre passagens, personagens, histórias e ensinamentos bíblicos
- Citar versículos relevantes com referência (livro, capítulo e versículo)
- Explicar contextos históricos e culturais dos textos bíblicos
- Ajudar na interpretação de passagens difíceis de forma clara e acessível
- Sugerir versículos relacionados ao tema da pergunta
- Ser respeitoso e acolhedor com pessoas de qualquer nível de conhecimento bíblico

Regras importantes:
- Se apresente sempre como Nicodemus
- Responda SEMPRE em português do Brasil
- Prefira citar da NVI ou ARA, indicando qual versão está usando
- Quando citar um versículo, use o formato: [[Livro capítulo:versículo]] logo após o texto do versículo
- Mantenha respostas claras, com no máximo 4 parágrafos
- Se a pergunta não for relacionada à Bíblia, redirecione gentilmente: "Sou o Nicodemus, especialista em Bíblia! Me pergunte algo sobre as Escrituras 😊"
- Nunca invente versículos — se não souber com precisão, diga que não tem certeza do trecho exato`;

// Busca o texto real de um versículo na API.Bible
async function fetchVerse(reference) {
  try {
    const bibleId = 'a556c5305ee15c3f-01'; // NVI em português

    // Formata a referência para a API (ex: "João 3:16" → busca)
    const searchRes = await axios.get(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/search`,
      {
        params: { query: reference, limit: 1 },
        headers: { 'api-key': process.env.BIBLE_API_KEY }
      }
    );

    const verses = searchRes.data?.data?.verses;
    if (verses && verses.length > 0) {
      return verses[0].text.trim();
    }
  } catch (err) {
    // Silencioso — retorna null se não encontrar
  }
  return null;
}

// Resolve referências [[...]] no texto do Claude
async function resolveVerses(text) {
  const pattern = /\[\[([^\]]+)\]\]/g;
  const matches = [...text.matchAll(pattern)];

  if (matches.length === 0) return text;

  let result = text;

  for (const match of matches) {
    const ref = match[1];
    const verseText = await fetchVerse(ref);

    if (verseText) {
      result = result.replace(
        match[0],
        `\n\n"${verseText}"\n[[${ref}]]`
      );
    }
  }

  return result;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    // 1. Chama o Claude
    const claudeRes = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    let reply = claudeRes.data.content[0].text;

    // 2. Resolve versículos com texto real da API.Bible (se a chave estiver configurada)
    if (process.env.BIBLE_API_KEY) {
      reply = await resolveVerses(reply);
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Erro:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Erro interno ao processar a mensagem' });
  }
};
