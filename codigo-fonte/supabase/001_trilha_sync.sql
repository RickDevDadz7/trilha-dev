-- Trilha Dev — sincronização por conta. Rodar UMA vez no SQL Editor do Supabase
-- (mesmo projeto do Deutsch mit Plan; não mexe na tabela sync_devices do app de alemão).
-- Uma linha por aparelho de cada conta. Cada aparelho grava só a própria linha
-- e lê as dos outros aparelhos DA MESMA CONTA para juntar o progresso.

create table if not exists public.trilha_sync (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  device_id  text        not null check (char_length(device_id) between 3 and 64),
  name       text        not null default 'Aparelho' check (char_length(name) <= 60),
  updated_at timestamptz not null default now(),
  data       text        not null check (octet_length(data) < 5000000),
  primary key (user_id, device_id)
);

-- Segurança: ninguém sem login acessa; cada conta só enxerga e altera as próprias linhas.
alter table public.trilha_sync enable row level security;
revoke all on public.trilha_sync from anon;
grant select, insert, update, delete on public.trilha_sync to authenticated;

drop policy if exists "trilha: ler as proprias linhas" on public.trilha_sync;
drop policy if exists "trilha: criar as proprias linhas" on public.trilha_sync;
drop policy if exists "trilha: alterar as proprias linhas" on public.trilha_sync;
drop policy if exists "trilha: apagar as proprias linhas" on public.trilha_sync;

create policy "trilha: ler as proprias linhas" on public.trilha_sync
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "trilha: criar as proprias linhas" on public.trilha_sync
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "trilha: alterar as proprias linhas" on public.trilha_sync
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "trilha: apagar as proprias linhas" on public.trilha_sync
  for delete to authenticated using ((select auth.uid()) = user_id);
