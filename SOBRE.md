# stayfokcux — Visão técnica

App web mobile-first (PWA instalável) para organização inteligente de tarefas de almoxarifado e oficina mecânica. Single-user MVP, captura de tarefas por texto ou voz, classificação automática via LLM, journal de progresso por áudio.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend / SSR | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilização | Tailwind v4 |
| Banco + Storage + Realtime | Supabase (Postgres 16) |
| LLM (classificação e raciocínio) | Anthropic Claude `claude-sonnet-4-5` via tool_use |
| Transcrição de áudio | OpenAI Whisper (`whisper-1`) |
| Validação | Zod |
| PWA | Manifest + Service Worker manual |
| Deploy | Vercel (auto-deploy via GitHub) |

---

## Funcionalidades principais

### 1. Captura de tarefas
- **Texto:** usuário digita uma frase qualquer (ex.: "lançar nota fiscal urgente, cliente está esperando").
- **Áudio:** usuário grava no microfone via `MediaRecorder` (webm).
- O backend pede ao Claude para classificar a tarefa retornando JSON estruturado (categoria, prioridade, prazo sugerido, interruptível, palavras-chave, motivação).

### 2. Modo Caos
- Áudio longo onde o usuário despeja várias coisas misturadas.
- Claude separa em múltiplas tarefas distintas (tool `registrar_lote`) e classifica cada uma.

### 3. Fila operacional
- Dashboard agrupa as tarefas abertas em 4 grupos: **AGORA / EM BREVE / PODE ESPERAR / EM PAUSA**.
- O grupo é derivado do `status` da tarefa.
- Atualização ao vivo via Supabase Realtime (`postgres_changes` no canal `tarefas`).

### 4. Journal de progresso (por tarefa)
- Cada tarefa tem um card "Onde parei" no topo da sua tela de detalhe.
- O usuário grava áudio (ou digita texto) contando o que aconteceu.
- Whisper transcreve. Claude recebe o contexto da tarefa + últimas 10 atualizações + novo relato, e retorna:
  - Resumo da ação (1 frase).
  - Resumo cumulativo atualizado.
  - Sugestão de novo status (ex.: "aguardando aprovação do cliente" → `em_pausa`), aplicada automaticamente.
- Timeline expandível mostra todas as atualizações em ordem cronológica.

### 5. Recorrência implícita
- Toda tarefa nova é cruzada (`overlaps` em `palavras_chave`) contra as anteriores.
- O contador `recorrencia` indica quantas vezes algo similar já foi pedido. Useful para detectar tarefas crônicas.

### 6. Histórico
- Tarefas concluídas saem da fila e aparecem em `/historico` (mais recentes primeiro).

### 7. PWA
- Instalável no iPhone (iOS 16.4+) e Android.
- Manifest + ícones + service worker para cache de shell offline.
- Header respeita `safe-area-inset-top` (notch).

---

## Arquitetura

### Cliente
- Server Components (RSC) renderizam fila, detalhe, histórico no servidor — zero JS para essas páginas.
- Client Components apenas onde precisa de interação (gravar áudio, formulário, timeline expandível).
- Server Actions para mutações (criar, atualizar, concluir, pausar, excluir).

### Servidor (Next.js Route Handlers)
- `POST /api/classificar` — texto → Claude → insere tarefa.
- `POST /api/transcrever` — áudio (multipart) → Whisper → texto + upload pro Storage.
- `POST /api/modo-caos` — áudio → Whisper → Claude (batch) → insere N tarefas.
- `POST /api/tarefa/[id]/atualizar` — áudio ou texto → Whisper + Claude → insere atualização + atualiza tarefa.

### Camada de dados
- Cliente browser usa `anon key` do Supabase para leituras com RLS.
- Server actions e route handlers usam `service_role` (bypass RLS) para escritas e leituras administrativas.

---

## Schema do banco (resumido)

```
usuarios(id, nome, email)
categorias(id, nome, icone, cor)            -- 8 seeds: Peças, Ferramentas, Compras, etc.
tarefas(id, usuario_id, descricao, descricao_resumida,
        categoria_id, prioridade, prazo, status, recorrencia,
        motivacao, palavras_chave[], fonte, audio_url,
        resumo_atual, created_at, updated_at)
atualizacoes_tarefa(id, tarefa_id, fonte,
                    conteudo_original, resumo_acao, audio_url,
                    status_anterior, status_novo, razao_mudanca,
                    created_at)
historico(id, tarefa_id, acao, data_hora)
padroes_usuario(id, usuario_id, padrao, frequencia, ultima_ocorrencia)
```

Enums: `prioridade` (critica/alta/media/baixa), `status` (agora/em_breve/pode_esperar/em_pausa/concluida), `fonte` (texto/audio).

Índices relevantes:
- `gin` em `palavras_chave` (overlap pra recorrência).
- `gin_trgm_ops` em `descricao` (busca por substring).
- `btree` em `(tarefa_id, created_at desc)` em atualizações e histórico.

RLS habilitada em todas as tabelas, policies permissivas (MVP single-user) prontas para serem trocadas por `auth.uid()` quando multi-user.

---

## Pipelines de IA

### Classificação (tarefa nova)
```
texto → POST /api/classificar
  → Claude (system: prompt + tool registrar_tarefa)
  → JSON validado (zod) → insert + cross-check de palavras-chave
  → retorna tarefa criada
```

### Áudio → texto
```
blob → POST /api/transcrever
  → Whisper (response_format=text, language=pt)
  → upload do blob pro bucket privado audios-tarefas
  → retorna { texto, audioUrl }
```

### Atualização de tarefa em andamento
```
áudio ou texto + tarefaId → POST /api/tarefa/[id]/atualizar
  → (se áudio) Whisper
  → carrega tarefa atual + últimas 10 atualizações
  → Claude (tool registrar_atualizacao) com contexto
  → JSON validado (zod)
  → insert atualizacoes_tarefa + update tarefas.resumo_atual (+ status se mudou)
  → revalidatePath
```

Cada chamada Claude usa `tool_choice: { type: "tool", name: "..." }` forçando saída estruturada via JSONSchema, eliminando parsing frágil.

---

## Segurança / Acesso

- **Senha única no app via Next.js Proxy** (`proxy.ts` — equivalente do middleware até Next 15, renomeado em Next 16).
- Sem cookie válido → redirect pra `/login`.
- Cookie `httpOnly, sameSite=lax, secure (prod)`, expira em 30 dias.
- Senha lida de `APP_PASSWORD` (env var na Vercel).
- **Todas as rotas protegidas**, incluindo `/api/*`, porque os endpoints chamam APIs pagas (Claude, Whisper).
- Excluídos do matcher: `_next/static`, `_next/image`, `manifest.webmanifest`, `sw.js`, `favicon.ico`, `icons/*` — necessário pro PWA funcionar.

---

## Componentes UX notáveis

- **FAB de captura** (botão flutuante verde) sempre presente.
- **Bottom nav** com 3 abas (Hoje / Histórico / Modo Caos).
- **Waveform live** durante gravação de áudio (Web Audio API + `<canvas>`).
- **Realtime na fila**: ao inserir/editar/concluir uma tarefa, qualquer aba aberta atualiza sozinha (`postgres_changes`).
- **Timeline expandível** na tarefa: card colapsado por padrão, abre lista com timestamp relativo, ícone de fonte (mic/teclado), badge de transição de status.

---

## Custo operacional (estimativa)

- Claude por classificação: ~US$ 0,01-0,02
- Claude por atualização: ~US$ 0,01-0,02
- Whisper: ~US$ 0,006/min de áudio
- Supabase: free tier confortável para single-user (limite 500MB DB / 1GB Storage)
- Vercel: free tier (hobby), suficiente para uso pessoal

Uso intenso (100 tarefas + 50 atualizações de áudio por mês) ≈ US$ 2-3/mês de APIs.

---

## Deploy

- Repo privado no GitHub.
- Vercel conectada via OAuth → auto-deploy a cada push em `main`.
- 7 env vars configuradas no dashboard Vercel:
  - Supabase (URL, anon, service_role)
  - Anthropic API key
  - OpenAI API key
  - DEFAULT_USER_ID (UUID do usuário único na tabela `usuarios`)
  - APP_PASSWORD (senha do gate de acesso)
- Build: `next build` (Turbopack). ~4s de compile + ~3s de typecheck.

---

## Pontos de extensão futuros

- **Multi-usuário real:** trocar `DEFAULT_USER_ID` por Supabase Auth (email/senha ou magic link). RLS já está habilitada — só trocar policies para `auth.uid() = usuario_id`.
- **Push notifications (Web Push):** cron na Vercel cobrando crítica/alta a cada X min. VAPID keys + `web-push` lib + handler no service worker. Schema novo: `push_subscriptions`.
- **Anexos de imagem em tarefas:** Vision do Claude para descrever, Storage para guardar.
- **Analytics:** dashboard de produtividade por categoria/prazo, usando dados de `historico`.

---

## Decisões técnicas que vale destacar

- **Claude tool_use em vez de prompt parser:** força saída em JSONSchema, validada por zod no servidor. Zero retry por output malformado.
- **Server Actions em vez de mais endpoints REST:** simplifica fluxo de mutação. Type-safe end-to-end.
- **PWA com SW manual** em vez de `next-pwa`: dependência menor, controle total sobre cache strategy.
- **Senha no Proxy em vez de NextAuth:** suficiente pra single-user; troca-se por auth real quando precisar de multi.
- **Migration `.sql` em vez de Supabase CLI:** roda manualmente no SQL Editor — menos atrito de tooling pro MVP.
