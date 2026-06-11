-- Seed: exercise catalog. Mirrors lib/exercises.ts (which is the local M1 source of truth).

insert into public.exercises (slug, name, description, difficulty, phase_template) values
  ('quick_flicks', 'Quick Flicks',
   'Short, fast contractions. Train the fast-twitch fibers responsible for control.',
   1,
   '{"sets":2,"reps":10,"phases":[{"kind":"squeeze","durationMs":1000},{"kind":"release","durationMs":1500}],"restBetweenSetsMs":20000}'::jsonb),
  ('short_holds', 'Short Holds',
   'Standard pelvic-floor contraction: squeeze, hold briefly, release fully.',
   1,
   '{"sets":2,"reps":8,"phases":[{"kind":"squeeze","durationMs":1000},{"kind":"hold","durationMs":3000},{"kind":"release","durationMs":3000}],"restBetweenSetsMs":30000}'::jsonb),
  ('long_holds', 'Long Holds',
   'Build endurance with sustained contractions.',
   2,
   '{"sets":2,"reps":5,"phases":[{"kind":"squeeze","durationMs":1500},{"kind":"hold","durationMs":8000},{"kind":"release","durationMs":5000}],"restBetweenSetsMs":45000}'::jsonb),
  ('endurance_ladder', 'Endurance Ladder',
   'Progressive holds increasing each rep.',
   3,
   '{"sets":1,"reps":5,"phases":[{"kind":"squeeze","durationMs":1500},{"kind":"hold","durationMs":5000},{"kind":"release","durationMs":5000}],"restBetweenSetsMs":0}'::jsonb)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      difficulty = excluded.difficulty,
      phase_template = excluded.phase_template;
