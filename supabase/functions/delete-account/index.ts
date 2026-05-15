// Supabase Edge Function: delete-account
//
// Hard-deletes the authenticated user from auth.users using the service-role
// key. All owner-scoped tables cascade off auth.users on delete (see
// supabase/migrations/0001_init.sql), so the cascade handles the data
// removal; this function only needs to call admin.deleteUser.
//
// Required by App Store guideline 5.1.1(v). Deployed via:
//
//   supabase functions deploy delete-account
//
// Env required at runtime (set via `supabase secrets set`):
//   SUPABASE_URL                — your project URL (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY   — service-role key (DO NOT commit)
//
// The function reads the caller's JWT from the Authorization header,
// extracts the user id from `auth.getUser()`, and asks the admin client
// to delete that user.

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Server not configured' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  const auth = req.headers.get('Authorization');
  if (!auth) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Missing Authorization' }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // Validate caller with anon key + their JWT
  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Invalid session' }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  const userId = userData.user.id;

  // Service-role client for the actual delete
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
    return new Response(
      JSON.stringify({ ok: false, error: delErr.message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
