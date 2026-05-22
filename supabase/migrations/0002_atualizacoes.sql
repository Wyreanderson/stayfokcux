-- 0002: Atualizações por tarefa (journal de progresso) + resumo cumulativo

create table if not exists atualizacoes_tarefa (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references tarefas(id) on delete cascade,
  fonte fonte_enum not null default 'texto',
  conteudo_original text not null,
  resumo_acao text not null,
  audio_url text,
  status_anterior status_enum,
  status_novo status_enum,
  razao_mudanca text,
  created_at timestamptz default now()
);

create index if not exists idx_atualizacoes_tarefa
  on atualizacoes_tarefa(tarefa_id, created_at desc);

alter table tarefas add column if not exists resumo_atual text;

alter table atualizacoes_tarefa enable row level security;
drop policy if exists "single_user_all" on atualizacoes_tarefa;
create policy "single_user_all" on atualizacoes_tarefa for all using (true) with check (true);

alter publication supabase_realtime add table atualizacoes_tarefa;
