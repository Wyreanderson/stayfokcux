# Supabase migrations

## Rodar a migration

1. Abra o painel do projeto Supabase → SQL Editor → New Query
2. Cole o conteúdo de `0001_init.sql` e execute
3. Crie o bucket de Storage:
   - Storage → New bucket → nome `audios-tarefas` → Private
4. Insira o usuário padrão para o MVP single-user:
   ```sql
   insert into usuarios (nome, email) values ('Almoxarife', 'wyreanderson@gmail.com') returning id;
   ```
   Copie o `id` retornado e coloque em `.env.local` como `DEFAULT_USER_ID=...`
