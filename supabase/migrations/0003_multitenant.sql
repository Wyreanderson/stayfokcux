-- 0003: Multi-tenant — super_admin / patrao / colaborador

do $$ begin
  create type role_enum as enum ('super_admin','patrao','colaborador');
exception when duplicate_object then null; end $$;

alter table usuarios
  add column if not exists role role_enum not null default 'patrao',
  add column if not exists patrao_id uuid references usuarios(id) on delete cascade,
  add column if not exists username text unique,
  add column if not exists senha_hash text,
  add column if not exists codigo_acesso text;

alter table usuarios alter column email drop not null;

create unique index if not exists idx_usuarios_codigo_acesso
  on usuarios(codigo_acesso) where codigo_acesso is not null;

create table if not exists convites (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  patrao_id uuid not null references usuarios(id) on delete cascade,
  nome_sugerido text,
  criado_em timestamptz default now(),
  expira_em timestamptz default (now() + interval '30 days'),
  usado_em timestamptz,
  usuario_criado_id uuid references usuarios(id) on delete set null
);

create index if not exists idx_convites_token on convites(token);
create index if not exists idx_convites_patrao on convites(patrao_id, usado_em);

alter table tarefas
  add column if not exists solicitante_id uuid references usuarios(id) on delete set null,
  add column if not exists recusada_motivo text;

create index if not exists idx_tarefas_patrao_status on tarefas(usuario_id, status);
create index if not exists idx_tarefas_solicitante on tarefas(solicitante_id) where solicitante_id is not null;

alter type status_enum add value if not exists 'recusada';

alter table convites enable row level security;
drop policy if exists "single_user_all" on convites;
create policy "single_user_all" on convites for all using (true) with check (true);

drop policy if exists "single_user_read" on usuarios;
create policy "single_user_all_users" on usuarios for all using (true) with check (true);
