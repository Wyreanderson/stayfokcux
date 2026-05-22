-- PIT FLOW — Schema inicial

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Enums
do $$ begin
  create type prioridade_enum as enum ('critica','alta','media','baixa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_enum as enum ('agora','em_breve','pode_esperar','em_pausa','concluida');
exception when duplicate_object then null; end $$;

do $$ begin
  create type fonte_enum as enum ('texto','audio');
exception when duplicate_object then null; end $$;

-- Usuários
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  created_at timestamptz default now()
);

-- Categorias
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nome text unique not null,
  icone text,
  cor text
);

-- Seed das 8 categorias da spec
insert into categorias (nome, icone, cor) values
  ('Peças', 'wrench', '#34d399'),
  ('Ferramentas', 'hammer', '#10b981'),
  ('Compras', 'shopping-cart', '#7ee2bb'),
  ('Administrativo', 'clipboard-list', '#a7f3d0'),
  ('Estoque', 'package', '#2e7d6e'),
  ('Orçamento', 'calculator', '#1a6b5b'),
  ('Notas Fiscais', 'file-text', '#115e50'),
  ('Outros', 'circle-dot', '#0d4f44')
on conflict (nome) do nothing;

-- Tarefas
create table if not exists tarefas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  descricao text not null,
  descricao_resumida text,
  categoria_id uuid references categorias(id) on delete set null,
  prioridade prioridade_enum not null default 'media',
  prazo timestamptz,
  interruptivel boolean default true,
  status status_enum not null default 'em_breve',
  recorrencia int default 1,
  motivacao text,
  sugestao_horario text,
  palavras_chave text[] default '{}',
  notas text,
  fonte fonte_enum not null default 'texto',
  audio_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tarefas_usuario_status on tarefas(usuario_id, status);
create index if not exists idx_tarefas_prazo on tarefas(prazo) where status <> 'concluida';
create index if not exists idx_tarefas_palavras on tarefas using gin(palavras_chave);
create index if not exists idx_tarefas_descricao_trgm on tarefas using gin(descricao gin_trgm_ops);

-- Histórico
create table if not exists historico (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references tarefas(id) on delete cascade,
  acao text not null,
  data_hora timestamptz default now()
);

create index if not exists idx_historico_tarefa on historico(tarefa_id, data_hora desc);

-- Padrões do usuário
create table if not exists padroes_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  padrao text not null,
  frequencia int default 1,
  ultima_ocorrencia timestamptz default now(),
  unique (usuario_id, padrao)
);

create index if not exists idx_padroes_usuario on padroes_usuario(usuario_id, frequencia desc);

-- RLS permissivo (MVP single-user). Substituir por policies por auth.uid() quando habilitar multi-user.
alter table tarefas enable row level security;
alter table historico enable row level security;
alter table padroes_usuario enable row level security;
alter table categorias enable row level security;
alter table usuarios enable row level security;

drop policy if exists "single_user_all" on tarefas;
create policy "single_user_all" on tarefas for all using (true) with check (true);
drop policy if exists "single_user_all" on historico;
create policy "single_user_all" on historico for all using (true) with check (true);
drop policy if exists "single_user_all" on padroes_usuario;
create policy "single_user_all" on padroes_usuario for all using (true) with check (true);
drop policy if exists "single_user_read" on categorias;
create policy "single_user_read" on categorias for select using (true);
drop policy if exists "single_user_read" on usuarios;
create policy "single_user_read" on usuarios for select using (true);

-- Realtime
alter publication supabase_realtime add table tarefas;
