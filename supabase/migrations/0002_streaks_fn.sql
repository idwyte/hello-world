-- Streak maintenance trigger.
-- After a session is inserted/updated to completed=true, recompute the
-- user's streak based on date(ended_at).

create or replace function public.recompute_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dates date[];
  v_current int := 0;
  v_longest int := 0;
  v_run int := 0;
  v_prev date;
  v_d date;
begin
  select array_agg(distinct (ended_at at time zone 'UTC')::date order by (ended_at at time zone 'UTC')::date)
    into v_dates
  from public.sessions
  where user_id = p_user_id and completed = true and ended_at is not null;

  if v_dates is null or array_length(v_dates, 1) is null then
    insert into public.streaks (user_id, current, longest, last_session_date)
      values (p_user_id, 0, 0, null)
    on conflict (user_id) do update
      set current = 0, longest = excluded.longest, last_session_date = null;
    return;
  end if;

  v_prev := null;
  foreach v_d in array v_dates loop
    if v_prev is null then
      v_run := 1;
    elsif v_d = v_prev + 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    if v_run > v_longest then
      v_longest := v_run;
    end if;
    v_prev := v_d;
  end loop;
  v_current := v_run;

  insert into public.streaks (user_id, current, longest, last_session_date)
    values (p_user_id, v_current, v_longest, v_prev)
  on conflict (user_id) do update
    set current = excluded.current,
        longest = greatest(public.streaks.longest, excluded.longest),
        last_session_date = excluded.last_session_date;
end;
$$;

create or replace function public.on_session_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completed = true and (tg_op = 'INSERT' or old.completed is distinct from new.completed) then
    perform public.recompute_streak(new.user_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sessions_after_complete on public.sessions;
create trigger trg_sessions_after_complete
  after insert or update of completed on public.sessions
  for each row execute function public.on_session_completed();
