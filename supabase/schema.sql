-- ============================================================================
-- Chess Arena — Database Schema
-- Run this entire file in the Supabase SQL Editor to set up the database.
-- ============================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- User profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  rating integer default 1200 not null,
  games_played integer default 0 not null,
  games_won integer default 0 not null,
  games_lost integer default 0 not null,
  games_drawn integer default 0 not null,
  is_online boolean default false not null,
  last_seen timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Chess games
create table if not exists public.games (
  id uuid default uuid_generate_v4() primary key,
  white_player_id uuid references public.profiles(id) not null,
  black_player_id uuid references public.profiles(id) not null,
  status text default 'waiting' not null
    check (status in ('waiting', 'active', 'completed', 'abandoned')),
  fen text default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' not null,
  pgn text default '' not null,
  result text check (result in ('white', 'black', 'draw')),
  winner_id uuid references public.profiles(id),
  time_control integer default 600 not null,
  white_time_remaining integer default 600 not null,
  black_time_remaining integer default 600 not null,
  last_move_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Individual game moves (append-only log)
create table if not exists public.game_moves (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  move_number integer not null,
  move_san text not null,
  move_from text not null,
  move_to text not null,
  fen_after text not null,
  created_at timestamptz default now() not null
);

-- Friendships (bidirectional via requester/addressee)
create table if not exists public.friendships (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' not null
    check (status in ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_friendship unique (requester_id, addressee_id),
  constraint no_self_friendship check (requester_id != addressee_id)
);

-- Matchmaking queue
create table if not exists public.matchmaking_queue (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  rating integer not null,
  created_at timestamptz default now() not null
);

-- Game invitations
create table if not exists public.game_invites (
  id uuid default uuid_generate_v4() primary key,
  from_user_id uuid references public.profiles(id) on delete cascade not null,
  to_user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' not null
    check (status in ('pending', 'accepted', 'declined', 'expired')),
  time_control integer default 600 not null,
  created_at timestamptz default now() not null,
  constraint no_self_invite check (from_user_id != to_user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_games_white_player on public.games(white_player_id);
create index if not exists idx_games_black_player on public.games(black_player_id);
create index if not exists idx_games_status on public.games(status);
create index if not exists idx_game_moves_game_id on public.game_moves(game_id);
create index if not exists idx_game_moves_number on public.game_moves(game_id, move_number);
create index if not exists idx_friendships_requester on public.friendships(requester_id);
create index if not exists idx_friendships_addressee on public.friendships(addressee_id);
create index if not exists idx_friendships_status on public.friendships(status);
create index if not exists idx_game_invites_to on public.game_invites(to_user_id, status);
create index if not exists idx_game_invites_from on public.game_invites(from_user_id);
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_online on public.profiles(is_online);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_moves enable row level security;
alter table public.friendships enable row level security;
alter table public.matchmaking_queue enable row level security;
alter table public.game_invites enable row level security;

-- Profiles: public read, owner write
create policy "profiles_select" on public.profiles
  for select using (true);
create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- Games: public read, players write
create policy "games_select" on public.games
  for select using (true);
create policy "games_insert" on public.games
  for insert with check (auth.uid() in (white_player_id, black_player_id));
create policy "games_update" on public.games
  for update using (auth.uid() in (white_player_id, black_player_id));

-- Game moves: public read, game players insert
create policy "moves_select" on public.game_moves
  for select using (true);
create policy "moves_insert" on public.game_moves
  for insert with check (
    exists (
      select 1 from public.games
      where id = game_id
        and auth.uid() in (white_player_id, black_player_id)
    )
  );

-- Friendships: participants only
create policy "friendships_select" on public.friendships
  for select using (auth.uid() in (requester_id, addressee_id));
create policy "friendships_insert" on public.friendships
  for insert with check (auth.uid() = requester_id);
create policy "friendships_update" on public.friendships
  for update using (auth.uid() in (requester_id, addressee_id));
create policy "friendships_delete" on public.friendships
  for delete using (auth.uid() in (requester_id, addressee_id));

-- Matchmaking: authenticated users
create policy "queue_select" on public.matchmaking_queue
  for select using (auth.uid() is not null);
create policy "queue_insert" on public.matchmaking_queue
  for insert with check (auth.uid() = user_id);
create policy "queue_delete" on public.matchmaking_queue
  for delete using (auth.uid() = user_id);

-- Game invites: participants only
create policy "invites_select" on public.game_invites
  for select using (auth.uid() in (from_user_id, to_user_id));
create policy "invites_insert" on public.game_invites
  for insert with check (auth.uid() = from_user_id);
create policy "invites_update" on public.game_invites
  for update using (auth.uid() in (from_user_id, to_user_id));
create policy "invites_delete" on public.game_invites
  for delete using (auth.uid() in (from_user_id, to_user_id));

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Race-condition-safe matchmaking
create or replace function public.find_match(p_user_id uuid, p_rating integer)
returns uuid as $$
declare
  v_opponent record;
  v_game_id uuid;
begin
  -- Attempt to find the best-rated opponent (row-level lock prevents double-match)
  select * into v_opponent
  from public.matchmaking_queue
  where user_id != p_user_id
  order by abs(rating - p_rating), created_at
  limit 1
  for update skip locked;

  if v_opponent is null then
    -- No opponent available — enqueue this player
    insert into public.matchmaking_queue (user_id, rating)
    values (p_user_id, p_rating)
    on conflict (user_id) do update set rating = p_rating, created_at = now();
    return null;
  end if;

  -- Remove both players from the queue
  delete from public.matchmaking_queue where user_id in (p_user_id, v_opponent.user_id);

  -- Create the game with random color assignment
  if random() > 0.5 then
    insert into public.games (white_player_id, black_player_id, status)
    values (p_user_id, v_opponent.user_id, 'active')
    returning id into v_game_id;
  else
    insert into public.games (white_player_id, black_player_id, status)
    values (v_opponent.user_id, p_user_id, 'active')
    returning id into v_game_id;
  end if;

  return v_game_id;
end;
$$ language plpgsql security definer;

-- Accept a game invite and spin up a game
create or replace function public.accept_invite(p_invite_id uuid, p_user_id uuid)
returns uuid as $$
declare
  v_invite record;
  v_game_id uuid;
begin
  select * into v_invite
  from public.game_invites
  where id = p_invite_id and to_user_id = p_user_id and status = 'pending'
  for update;

  if v_invite is null then
    raise exception 'Invalid or expired invite';
  end if;

  update public.game_invites set status = 'accepted' where id = p_invite_id;

  if random() > 0.5 then
    insert into public.games (white_player_id, black_player_id, status, time_control)
    values (v_invite.from_user_id, v_invite.to_user_id, 'active', v_invite.time_control)
    returning id into v_game_id;
  else
    insert into public.games (white_player_id, black_player_id, status, time_control)
    values (v_invite.to_user_id, v_invite.from_user_id, 'active', v_invite.time_control)
    returning id into v_game_id;
  end if;

  return v_game_id;
end;
$$ language plpgsql security definer;

-- Update player stats after a game ends
create or replace function public.update_player_stats()
returns trigger as $$
begin
  if new.status = 'completed' and old.status = 'active' then
    -- Update games_played for both players
    update public.profiles set
      games_played = games_played + 1,
      updated_at = now()
    where id in (new.white_player_id, new.black_player_id);

    if new.result = 'draw' then
      update public.profiles set games_drawn = games_drawn + 1 where id in (new.white_player_id, new.black_player_id);
    elsif new.result = 'white' then
      update public.profiles set games_won = games_won + 1, rating = rating + 15 where id = new.white_player_id;
      update public.profiles set games_lost = games_lost + 1, rating = greatest(rating - 15, 100) where id = new.black_player_id;
    elsif new.result = 'black' then
      update public.profiles set games_won = games_won + 1, rating = rating + 15 where id = new.black_player_id;
      update public.profiles set games_lost = games_lost + 1, rating = greatest(rating - 15, 100) where id = new.white_player_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_game_completed on public.games;
create trigger on_game_completed
  after update on public.games
  for each row execute function public.update_player_stats();

-- ============================================================================
-- REALTIME
-- ============================================================================

alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.game_moves;
alter publication supabase_realtime add table public.game_invites;
alter publication supabase_realtime add table public.matchmaking_queue;
alter publication supabase_realtime add table public.friendships;
alter publication supabase_realtime add table public.profiles;
