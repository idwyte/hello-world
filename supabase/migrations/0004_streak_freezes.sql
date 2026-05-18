-- Streak freezes: forgive a single missed day if the user has earned a freeze.
-- A freeze is consumed automatically when a session lands exactly 2 days after
-- the previous one (the "missed yesterday" case). A freeze is earned after a
-- 7-day clean run, capped at 2.
--
-- The trigger on `sessions` from 0002_streaks_fn.sql still fires; we replace
-- the function body. Backfill is a no-op — defaults handle existing rows.

alter table public.streaks
  add column if not exists freezes int not null default 0
    check (freezes between 0 and 2);

alter table public.streaks
  add column if not exists last_freeze_earned_at date;

create or replace function public.recompute_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dates date[];
  v_d date;
  v_prev date;
  v_run int := 0;
  v_longest int := 0;
  v_freezes int := 0;
  v_last_earned date := null;
  v_existing record;
begin
  select array_agg(distinct (ended_at at time zone 'UTC')::date order by (ended_at at time zone 'UTC')::date)
    into v_dates
  from public.sessions
  where user_id = p_user_id and completed = true and ended_at is not null;

  -- Read any existing freeze state so freezes earned in prior runs aren't
  -- lost when we recompute from scratch. We still recompute current/longest
  -- deterministically from the session history.
  select freezes, last_freeze_earned_at
    into v_existing
    from public.streaks
    where user_id = p_user_id;
  if found then
    v_freezes := coalesce(v_existing.freezes, 0);
    v_last_earned := v_existing.last_freeze_earned_at;
  end if;

  if v_dates is null or array_length(v_dates, 1) is null then
    insert into public.streaks (user_id, current, longest, last_session_date, freezes, last_freeze_earned_at)
      values (p_user_id, 0, 0, null, v_freezes, v_last_earned)
    on conflict (user_id) do update
      set current = 0,
          last_session_date = null;
    return;
  end if;

  v_prev := null;
  foreach v_d in array v_dates loop
    if v_prev is null then
      v_run := 1;
    elsif v_d = v_prev + 1 then
      v_run := v_run + 1;
      -- Earn a freeze every 7 consecutive days, capped at 2. Only earn once
      -- per calendar day to keep the cap honest under same-day session bursts.
      if v_run > 0 and v_run % 7 = 0 and v_freezes < 2 and (v_last_earned is null or v_last_earned <> v_d) then
        v_freezes := v_freezes + 1;
        v_last_earned := v_d;
      end if;
    elsif v_d = v_prev + 2 and v_freezes > 0 then
      -- Consume one freeze to bridge a single missed day.
      v_freezes := v_freezes - 1;
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    if v_run > v_longest then
      v_longest := v_run;
    end if;
    v_prev := v_d;
  end loop;

  insert into public.streaks (user_id, current, longest, last_session_date, freezes, last_freeze_earned_at)
    values (p_user_id, v_run, v_longest, v_prev, v_freezes, v_last_earned)
  on conflict (user_id) do update
    set current = excluded.current,
        longest = greatest(public.streaks.longest, excluded.longest),
        last_session_date = excluded.last_session_date,
        freezes = excluded.freezes,
        last_freeze_earned_at = excluded.last_freeze_earned_at;
end;
$$;
