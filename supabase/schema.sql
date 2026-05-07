-- Daily Core: gemeinsamer Stand für David, Michalis & Nico (anon-key im Client).
-- In Supabase: SQL Editor → New query → ausführen.
--
-- Bereits angelegte DB: Policies neu anlegen mit Nico:
--   drop policy if exists "insert known users" on fitness_user_state;
--   drop policy if exists "update known users" on fitness_user_state;
--   dann die beiden create policy … unten erneut ausführen (mit Nico in der Liste).

create table if not exists fitness_user_state (
  username text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table fitness_user_state enable row level security;

-- Zwei bekannte Nutzer: nur diese dürfen geschrieben werden; alle Zeilen lesbar.
create policy "read all" on fitness_user_state
  for select using (true);

create policy "insert known users" on fitness_user_state
  for insert with check (username in ('David', 'Michalis', 'Nico'));

create policy "update known users" on fitness_user_state
  for update using (username in ('David', 'Michalis', 'Nico'));

create or replace function fitness_user_state_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_fitness_user_state_updated on fitness_user_state;
create trigger tr_fitness_user_state_updated
  before update on fitness_user_state
  for each row execute function fitness_user_state_set_updated_at();
