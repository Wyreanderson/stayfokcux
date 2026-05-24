# stayfokcux

App web mobile-first (PWA instalável) de organização inteligente de tarefas. Captura por texto ou áudio, classificação automática via Claude. Multi-tenant simples: um **super_admin** cria contas de **gestor** (patrão), e cada gestor convida **colaboradores** que mandam pedidos via link único.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4
- Supabase (Postgres + Storage + Realtime)
- Claude API (`@anthropic-ai/sdk`) — classificação + journal
- OpenAI Whisper (`whisper-1`) — transcrição de áudio
- Vercel (deploy)

## Conceitos

- **super_admin** — você, dono da aplicação. Acessa `/admin` pra criar contas de gestor.
- **patrão (gestor)** — recebe tarefas próprias + solicitações dos colaboradores. Acessa via código de acesso (1 campo).
- **colaborador** — cria pedidos pro gestor dele. Acessa via usuário + senha. Vê só os pedidos que ele mesmo enviou.

Hierarquia 1:N (cada colaborador pertence a 1 gestor). Solicitações entram direto na fila do gestor com chip "👤 De [nome]"; gestor pode aceitar, atualizar (journal) ou recusar com motivo.

## Funcionalidades

- **Captura de tarefa** por texto ou áudio. Claude classifica em 8 categorias, prioridade, prazo e palavras-chave.
- **Fila operacional** com 4 grupos: AGORA / EM BREVE / PODE ESPERAR / EM PAUSA. Realtime via Supabase.
- **Visão geral** no dashboard com 2 slides swipáveis: contagem por status + pendências por categoria.
- **Modo Caos** — áudio longo dividido em N tarefas distintas pelo Claude.
- **Journal por tarefa** — em cada tarefa, grave atualizações por áudio/texto. Claude resume "onde parei" e (se faz sentido) muda o status automaticamente. Timeline expandível com histórico.
- **Convite de colaborador** por link único, com expiração em 30 dias.
- **PWA** instalável no iPhone (16.4+) e Android, com manifest, service worker e respeito ao safe-area.
- **Recusar solicitação** com motivo opcional (só aparece quando a tarefa veio de um colaborador).

## Setup

### 1. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
DEFAULT_USER_ID=...           # UUID do super_admin
APP_PASSWORD=...              # legado (pode deixar qualquer coisa)
AUTH_SIGNING_SECRET=...       # 64 chars hex — assina cookies de sessão
```

Gerar o `AUTH_SIGNING_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

APIs:
- Anthropic: https://console.anthropic.com
- OpenAI: https://platform.openai.com (apenas Whisper)

### 2. Banco de dados

No painel do Supabase → SQL Editor, rode em ordem:

1. `supabase/migrations/0001_init.sql` — schema base (usuários, categorias, tarefas, histórico, padrões).
2. `supabase/migrations/0002_atualizacoes.sql` — journal por tarefa.
3. `supabase/migrations/0003_multitenant.sql` — roles, convites, solicitante.

Crie o bucket privado de Storage `audios-tarefas` (Storage → New bucket).

Insira seu próprio usuário super_admin:
```sql
insert into usuarios (nome, email, role, codigo_acesso)
values ('Wyre', 'wyreanderson@gmail.com', 'super_admin', 'troque-por-um-codigo-forte')
returning id;
```

Copie o `id` para `DEFAULT_USER_ID` no `.env.local`.

### 3. Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000 no Chrome (DevTools → modo iPhone 14). Faça login deixando "Usuário" em branco e digitando o `codigo_acesso` que você definiu.

## Estrutura

```
app/
  (main)/                  # layout do gestor (header + bottom nav + FAB)
    page.tsx               # dashboard / fila + overview
    capturar/              # nova tarefa (texto/áudio)
    tarefa/[id]/           # detalhe + journal + recusar
    historico/             # concluídas + recusadas
    modo-caos/             # áudio longo → N tarefas
    admin/                 # super_admin: criar gestores
    colaboradores/         # patrão: gerar convites + lista
  colaborador/             # layout do colaborador (limitado)
    page.tsx               # dashboard simples + lista própria
    nova/                  # form de nova solicitação
    tarefa/[id]/           # ver tarefa + ResumoCard + notas
    historico/             # próprias concluídas/recusadas
  convite/[token]/         # público — onboarding do colaborador
  login/                   # 2 campos: usuário + senha-ou-código
  api/
    classificar/           # texto → Claude → tarefa
    transcrever/           # áudio blob → Whisper → texto
    modo-caos/             # áudio longo → várias tarefas
    tarefa/[id]/atualizar/ # journal (áudio/texto) → Claude → update
components/
  ui/ shared/ fila/ captura/ tarefa/
  dashboard/Overview.tsx   # carrossel 2 slides (status / categorias)
  admin/ colaboradores/ colaborador/
lib/
  ai/                      # Claude (claude.ts), Whisper (whisper.ts), schemas
  auth/                    # session.ts (HMAC), usuarios.ts (scrypt + convites)
  supabase/                # client/server/types
  tarefas/                 # queries, mutations (Server Actions), grupos
proxy.ts                   # auth gate + roteamento por role
supabase/migrations/       # 0001 init, 0002 journal, 0003 multitenant
public/                    # manifest, sw.js, ícones
```

## Auth (resumo técnico)

- Cookie `pitflow-session` httpOnly, sameSite=lax, secure em prod, 30 dias.
- Valor: `{userId}:{role}:{exp}.{HMAC_SHA256}` assinado com `AUTH_SIGNING_SECRET` via `node:crypto`. Sem dependência externa.
- Senha de colaborador hasheada com `scrypt` (salt random por usuário).
- `proxy.ts` valida a assinatura e roteia: super_admin → tudo; patrão → tudo menos `/admin/*` e `/colaborador/*`; colaborador → só `/colaborador/*`.

## Verificação end-to-end

1. Login com código → cai no dashboard. Overview visível.
2. Captura texto + áudio → tarefas classificadas, áudios no bucket.
3. Detalhe de tarefa → editar prioridade/status, gravar atualização, ver "onde parei".
4. Modo Caos → áudio longo vira N tarefas separadas.
5. Histórico → concluídas e recusadas aparecem.
6. `/admin` (super_admin) → criar novo gestor com código.
7. Login do novo gestor → dashboard limpo. Cria convite em `/colaboradores`.
8. Link de convite em aba anônima → cria conta de colaborador.
9. Colaborador manda pedido → cai no dashboard do gestor com chip do solicitante.
10. Gestor recusa com motivo → colaborador vê na lista dele em vermelho.
11. PWA → adicionar à tela inicial no iPhone, abrir como app.

## Deploy (Vercel)

1. Push pro GitHub.
2. Vercel → Import repo.
3. Adicione as 7 envs do `.env.local` no dashboard da Vercel.
4. Build & deploy. Push em `main` dispara redeploy automático.

## Segurança

- Códigos de acesso de gestor com 6+ chars (alfanuméricos recomendados).
- Erro genérico ao criar gestor com código duplicado (não revela existência — protege contra oracle attack).
- Cookie assinado HMAC inviável de forjar sem o `AUTH_SIGNING_SECRET`.
- Senha de colaborador armazenada como `scrypt(senha, salt)`.
- RLS habilitada em todas as tabelas (policies permissivas + service_role no servidor — substituir por `auth.uid()` quando migrar pra Supabase Auth).
- Rotacione `AUTH_SIGNING_SECRET` em produção, isso invalida todas as sessões ativas.

## Pontos de extensão

- **Notificações push** quando colaborador manda pedido / gestor atualiza tarefa (Web Push + Vercel Cron).
- **Múltiplos gestores por colaborador** (hoje 1:N).
- **Reset de senha de colaborador** automatizado (hoje gestor revoga + reconvida).
- **Supabase Auth real** (substituir cookie próprio por Supabase Auth com policies por `auth.uid()`).
- **Audit log** detalhado de quem mudou o quê.
