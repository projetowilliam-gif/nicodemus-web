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
- Mantenha respostas claras, com no máximo 4 parágrafos
- Se a pergunta não for relacionada à Bíblia, redirecione gentilmente: "Sou o Nicodemus, especialista em Bíblia! Me pergunte algo sobre as Escrituras 😊"
- Nunca invente versículos — se não souber com precisão, diga que não tem certeza do trecho exato`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Converte histórico para formato do Gemini
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({ error: 'Resposta vazia do Gemini' });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Erro:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Erro interno ao processar a mensagem' });
  }
};
