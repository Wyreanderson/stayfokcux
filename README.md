# PIT FLOW

App web responsivo (mobile-first, PWA) de organização inteligente de tarefas para almoxarifado/oficina. Captura por texto ou áudio, classificação automática via Claude API, fila operacional em 4 grupos.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres + Storage + Realtime)
- Claude API (`@anthropic-ai/sdk`)
- OpenAI Whisper (transcrição de áudio)
- Vercel (deploy)

## Setup

### 1. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
DEFAULT_USER_ID=...
```

- Anthropic: https://console.anthropic.com
- OpenAI: https://platform.openai.com (apenas Whisper)

### 2. Banco de dados

No painel do Supabase → SQL Editor, rode `supabase/migrations/0001_init.sql`.

Crie o bucket privado de Storage chamado `audios-tarefas` (Storage → New bucket).

Insira o usuário padrão (MVP single-user):

```sql
insert into usuarios (nome, email)
values ('Almoxarife', 'wyreanderson@gmail.com')
returning id;
```

Copie o `id` para `DEFAULT_USER_ID` no `.env.local`.

### 3. Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000 no Chrome (DevTools → modo mobile / iPhone 14).

## Estrutura

```
app/
  (main)/            # Layout mobile com bottom nav e FAB
    page.tsx         # Dashboard / fila operacional
    capturar/        # Captura por texto+áudio
    tarefa/[id]/     # Detalhes/edição
    historico/       # Histórico inteligente
    modo-caos/       # Despejo de várias tarefas em 1 áudio
  api/
    classificar/     # texto → Claude → tarefa
    transcrever/     # áudio blob → Whisper → texto
    modo-caos/       # áudio longo → várias tarefas
components/          # ui, fila, captura, tarefa, shared
lib/
  ai/                # Claude e Whisper clients
  supabase/          # client/server/types
  tarefas/           # queries, mutations (Server Actions), grupos
supabase/migrations/ # SQL inicial
public/              # manifest, sw.js, ícones
```

## Verificação end-to-end

1. **Setup:** `npm run dev` → abrir em Chrome DevTools (iPhone 14)
2. **Fila vazia:** primeiro acesso mostra empty state
3. **Captura texto:** "lançar nota fiscal urgente, cliente está esperando" → vai para AGORA
4. **Captura áudio:** gravar 10s → ver waveform → texto transcrito → confirmar
5. **Detalhes:** abrir card → editar prioridade → salvar
6. **Histórico:** concluir tarefa → desaparecer da fila → aparecer no histórico
7. **Recorrência:** criar 3x "pesquisar preço embreagem" → contador "3x"
8. **Filtros:** filtrar por categoria → só tarefas dela
9. **Modo Caos:** áudio longo com 4 tarefas → 4 cards criados
10. **PWA:** adicionar à tela inicial → abrir como app

## Deploy (Vercel)

1. Importe o repo
2. Configure as mesmas envs do `.env.local`
3. Build & deploy
