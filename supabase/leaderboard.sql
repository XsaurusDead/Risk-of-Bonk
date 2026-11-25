-- Risk of Bonk: public online leaderboard (Supabase / PostgreSQL 15+)
--
-- Paste this whole file into Supabase -> SQL Editor -> "Run". It is safe to run again.
--
-- Security model: the browser only has the public (anon / publishable) key. That key can
-- NOT read or write the tables directly (row level security is on with no policies).
-- It can only call the four functions below:
--   register_player(name)              -> claims a unique username, returns {id, secret}
--   rename_player(id, secret, name)    -> changes your username
--   submit_run(id, secret, run)        -> adds a finished run, returns its global rank
--   get_leaderboard(char_id, limit)    -> best run per player, ranked by kills
-- The secret is stored only in the player's browser (and as a SHA-256 hash here), so nobody
-- can post runs under someone else's name.

-- ------------------------------------------------------------------ tables
create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  secret_hash text not null,
  created_at  timestamptz not null default now(),
  constraint players_name_ok check (name ~ '^[A-Za-z0-9ÄÖÜäöüß_.-]([A-Za-z0-9ÄÖÜäöüß_. -]{1,14})[A-Za-z0-9ÄÖÜäöüß_.-]$')
);
create unique index if not exists players_name_unique on public.players (lower(name));

create table if not exists public.runs (
  id             bigint generated always as identity primary key,
  player_id      uuid not null references public.players (id) on delete cascade,
  char_id        text not null check (char_id ~ '^[a-z0-9_]{1,32}$'),
  costume        smallint not null default 0 check (costume between 0 and 20),
  kills          integer not null check (kills >= 0),
  score          integer not null check (score between 0 and 2000000000),
  stage          smallint not null check (stage between 1 and 10000),
  stages_cleared smallint not null check (stages_cleared between 0 and 10000),
  time_s         integer not null check (time_s between 0 and 864000),
  level          smallint not null check (level between 1 and 30000),
  items          integer not null check (items between 0 and 1000000),
  victory        boolean not null default false,
  reason         text not null check (reason in ('death', 'victory', 'quit')),
  created_at     timestamptz not null default now()
);
-- no limit on kills (or kills per second): older versions of this file had one, remove it
alter table public.runs drop constraint if exists runs_kill_rate;
alter table public.runs drop constraint if exists runs_kills_check;
alter table public.runs add constraint runs_kills_check check (kills >= 0);
create index if not exists runs_rank_idx on public.runs (kills desc, score desc, created_at);
create index if not exists runs_player_idx on public.runs (player_id, created_at desc);

alter table public.players enable row level security;
alter table public.runs enable row level security;
-- no policies on purpose: the public key cannot touch the tables, only the functions below
revoke all on public.players, public.runs from anon, authenticated;

-- ------------------------------------------------------------------ helpers
create or replace function public._lb_hash(p_secret text)
returns text language sql immutable set search_path = public, pg_catalog as $$
  select encode(sha256(convert_to(coalesce(p_secret, ''), 'UTF8')), 'hex');
$$;

create or replace function public._lb_check_player(p_player uuid, p_secret text)
returns void language plpgsql stable security definer set search_path = public, pg_catalog as $$
begin
  if not exists (select 1 from players where id = p_player and secret_hash = _lb_hash(p_secret)) then
    raise exception 'bad_credentials' using errcode = '28000';
  end if;
end;
$$;

-- ------------------------------------------------------------------ api
create or replace function public.register_player(p_name text)
returns json language plpgsql volatile security definer set search_path = public, pg_catalog as $$
declare
  v_secret text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  v_id uuid;
  v_name text := btrim(p_name);
begin
  -- at most 30 new names per minute across everyone (spam brake)
  if (select count(*) from players where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  insert into players (name, secret_hash) values (v_name, _lb_hash(v_secret)) returning id into v_id;
  return json_build_object('id', v_id, 'secret', v_secret, 'name', v_name);
end;
$$;

create or replace function public.rename_player(p_player uuid, p_secret text, p_name text)
returns json language plpgsql volatile security definer set search_path = public, pg_catalog as $$
begin
  perform _lb_check_player(p_player, p_secret);
  update players set name = btrim(p_name) where id = p_player;
  return json_build_object('name', btrim(p_name));
end;
$$;

create or replace function public.submit_run(p_player uuid, p_secret text, p_run json)
returns json language plpgsql volatile security definer set search_path = public, pg_catalog as $$
declare
  v_kills int := (p_run ->> 'kills')::int;
  v_score int := (p_run ->> 'score')::int;
  v_rank bigint;
  v_best boolean;
begin
  perform _lb_check_player(p_player, p_secret);
  -- one run every 15 seconds per player is plenty (a recorded run lasts at least 20 s)
  if exists (select 1 from runs where player_id = p_player and created_at > now() - interval '15 seconds') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  insert into runs (player_id, char_id, costume, kills, score, stage, stages_cleared, time_s, level, items, victory, reason)
  values (
    p_player,
    p_run ->> 'charId',
    coalesce((p_run ->> 'costume')::smallint, 0),
    v_kills,
    v_score,
    (p_run ->> 'stage')::smallint,
    coalesce((p_run ->> 'stagesCleared')::smallint, 0),
    (p_run ->> 'time')::int,
    coalesce((p_run ->> 'level')::smallint, 1),
    coalesce((p_run ->> 'items')::int, 0),
    coalesce((p_run ->> 'victory')::boolean, false),
    coalesce(p_run ->> 'reason', 'death')
  );
  -- is it this player's new personal best?
  v_best := not exists (
    select 1 from runs where player_id = p_player
      and (kills > v_kills or (kills = v_kills and score > v_score))
  );
  -- global rank of this run among every other player's best run
  select 1 + count(*) into v_rank from (
    select distinct on (player_id) player_id, kills, score from runs
    where player_id <> p_player
    order by player_id, kills desc, score desc
  ) b where b.kills > v_kills or (b.kills = v_kills and b.score > v_score);
  return json_build_object('rank', v_rank, 'personalBest', v_best);
end;
$$;

-- best run per player, ranked by kills (then score); optionally only one survivor
create or replace function public.get_leaderboard(p_char text default null, p_limit int default 100)
returns table (
  rank bigint, player_id uuid, name text, char_id text, costume smallint, kills int, score int,
  stage smallint, stages_cleared smallint, time_s int, level smallint, items int, victory boolean,
  reason text, created_at timestamptz
)
language sql stable security definer set search_path = public, pg_catalog as $$
  select row_number() over (order by b.kills desc, b.score desc, b.created_at), b.*
  from (
    select distinct on (r.player_id)
      r.player_id, p.name, r.char_id, r.costume, r.kills, r.score, r.stage, r.stages_cleared,
      r.time_s, r.level, r.items, r.victory, r.reason, r.created_at
    from runs r join players p on p.id = r.player_id
    where p_char is null or r.char_id = p_char
    order by r.player_id, r.kills desc, r.score desc, r.created_at
  ) b
  order by b.kills desc, b.score desc, b.created_at
  limit least(greatest(coalesce(p_limit, 100), 1), 200);
$$;

-- only the api functions are callable from the browser
revoke all on function public._lb_hash(text), public._lb_check_player(uuid, text) from public, anon, authenticated;
revoke all on function public.register_player(text), public.rename_player(uuid, text, text),
  public.submit_run(uuid, text, json), public.get_leaderboard(text, int) from public;
grant execute on function public.register_player(text), public.rename_player(uuid, text, text),
  public.submit_run(uuid, text, json), public.get_leaderboard(text, int) to anon, authenticated;
