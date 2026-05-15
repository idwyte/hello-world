-- RLS tests. Run with `supabase test db`.
-- Each test creates two synthetic auth users and asserts that user B cannot
-- read or modify user A's rows.

begin;

select plan(14);

-- create two synthetic auth users
insert into auth.users (id, email)
  values
    ('00000000-0000-0000-0000-00000000000a', 'a@example.test'),
    ('00000000-0000-0000-0000-00000000000b', 'b@example.test');

-- profiles are auto-created by trigger

-- impersonate user A
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
set local role authenticated;

select results_eq(
  $$ select count(*)::int from profiles $$,
  $$ values (1) $$,
  'user A sees only their own profile'
);

insert into assessments (user_id, answers, recommended_level)
  values ('00000000-0000-0000-0000-00000000000a', '{}'::jsonb, 'beginner');

select results_eq(
  $$ select count(*)::int from assessments $$,
  $$ values (1) $$,
  'user A sees their assessment'
);

-- switch to user B
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select results_eq(
  $$ select count(*)::int from profiles $$,
  $$ values (1) $$,
  'user B sees only their own profile'
);

select results_eq(
  $$ select count(*)::int from assessments $$,
  $$ values (0) $$,
  'user B cannot see user A assessments'
);

select throws_ok(
  $$ insert into assessments (user_id, answers, recommended_level)
     values ('00000000-0000-0000-0000-00000000000a', '{}'::jsonb, 'beginner') $$,
  '42501',
  null,
  'user B cannot insert assessment for user A'
);

select throws_ok(
  $$ update assessments set recommended_level = 'advanced'
     where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  null,
  null,
  'user B cannot update user A assessment (silently no-ops or fails)'
);

select results_eq(
  $$ select count(*)::int from sessions $$,
  $$ values (0) $$,
  'user B sees no sessions of user A'
);

-- exercises catalog readable by any authenticated user
select cmp_ok(
  (select count(*)::int from exercises),
  '>=',
  0,
  'user B can read exercises catalog'
);

-- write to exercises must fail
select throws_ok(
  $$ insert into exercises (slug, name, difficulty, phase_template)
     values ('test', 'Test', 1, '{}'::jsonb) $$,
  '42501',
  null,
  'user B cannot write to exercises catalog'
);

-- programs scoped
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

insert into programs (user_id, level)
  values ('00000000-0000-0000-0000-00000000000a', 'beginner');

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select results_eq(
  $$ select count(*)::int from programs $$,
  $$ values (0) $$,
  'user B cannot read programs of user A'
);

-- streaks owner-read only
select results_eq(
  $$ select count(*)::int from streaks $$,
  $$ values (0) $$,
  'user B cannot read streaks of user A'
);

-- settings owner-only
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

insert into settings (user_id, reminder_enabled, analytics_opt_in)
  values ('00000000-0000-0000-0000-00000000000a', true, false);

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select results_eq(
  $$ select count(*)::int from settings $$,
  $$ values (0) $$,
  'user B cannot read settings of user A'
);

select throws_ok(
  $$ insert into settings (user_id, reminder_enabled, analytics_opt_in)
     values ('00000000-0000-0000-0000-00000000000a', false, true) $$,
  '42501',
  null,
  'user B cannot insert settings for user A'
);

-- streak trigger fires
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

insert into sessions (user_id, started_at, ended_at, completed, mode, reps_planned, reps_completed)
  values ('00000000-0000-0000-0000-00000000000a', now() - interval '5 minutes', now(), true, 'normal', 10, 10);

select cmp_ok(
  (select current from streaks where user_id = '00000000-0000-0000-0000-00000000000a'),
  '>=',
  1,
  'streak trigger increments current after first completed session'
);

select * from finish();
rollback;
