# 📖 Nicodemus — Guia de Deploy no Vercel

## Estrutura do projeto

```
nicodemus-web/
├── index.html       ← Interface do chat
├── api/
│   └── chat.js      ← Backend (serverless function)
├── package.json
├── vercel.json      ← Configuração de rotas
└── DEPLOY.md        ← Este arquivo
```

---

## PASSO 1 — Obter as chaves de API

### Anthropic (Claude) — obrigatória
1. Acesse https://console.anthropic.com
2. Crie uma conta e vá em **API Keys → Create Key**
3. Guarde a chave: `ANTHROPIC_API_KEY`

### API.Bible (versículos em tempo real) — opcional
1. Acesse https://scripture.api.bible
2. Clique em **Get Started Free** e crie uma conta
3. Vá em **My Apps → Add App**, dê um nome e clique em Create
4. Guarde a chave: `BIBLE_API_KEY`

> Se não configurar a BIBLE_API_KEY, o Nicodemus ainda funciona normalmente — apenas sem buscar o texto exato dos versículos em tempo real.

---

## PASSO 2 — Subir o código no GitHub

1. Acesse https://github.com e crie uma conta (se não tiver)
2. Clique em **New repository**
   - Nome: `nicodemus-web`
   - Visibilidade: Private (recomendado)
3. Faça upload dos arquivos:
   - `index.html`
   - `api/chat.js` (crie a pasta `api` digitando `api/chat.js` no nome do arquivo)
   - `package.json`
   - `vercel.json`

---

## PASSO 3 — Deploy no Vercel

1. Acesse https://vercel.com e entre com sua conta GitHub
2. Clique em **Add New → Project**
3. Selecione o repositório `nicodemus-web`
4. Clique em **Deploy** (as configurações já estão no `vercel.json`)

---

## PASSO 4 — Adicionar as variáveis de ambiente

No painel do Vercel, após o deploy:
1. Vá em **Settings → Environment Variables**
2. Adicione:

| Nome | Valor | Obrigatório |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sua chave da Anthropic | ✅ Sim |
| `BIBLE_API_KEY` | Sua chave da API.Bible | ⬜ Opcional |

3. Clique em **Save**
4. Vá em **Deployments → Redeploy** para aplicar

---

## PASSO 5 — Acessar o chat

Após o deploy, o Vercel fornece uma URL no formato:
```
https://nicodemus-web.vercel.app
```

Acesse pelo navegador — o Nicodemus já estará online! 🙏

---

## Atualizando o projeto

Para atualizar qualquer arquivo:
1. Edite o arquivo no GitHub
2. O Vercel faz o novo deploy automaticamente em ~30 segundos

---

## Dúvidas frequentes

**Posso usar um domínio próprio?**
Sim! No Vercel vá em Settings → Domains e adicione o seu.

**O chat salva o histórico?**
O histórico fica apenas na sessão do navegador. Ao recarregar, começa do zero.

**Quantos usuários simultâneos suporta?**
O plano gratuito suporta bem para testes e uso moderado.
