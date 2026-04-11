-- Create a SECURITY DEFINER function to upsert a visitor bypassing RLS safely
-- Apply this in Supabase SQL Editor or via migrations

create or replace function public.create_visitor_safe(
  p_email text,
  p_name text,
  p_type text default 'visitor',
  p_profile jsonb default '{}'::jsonb
)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
begin
  insert into public.users (email, name, type, profile)
  values (p_email, p_name, coalesce(p_type, 'visitor'), p_profile)
  on conflict (email) do update set
    name = excluded.name,
    type = excluded.type,
    profile = excluded.profile
  returning * into v_user;

  return v_user;
end;
$$;

-- Restrict and grant execute to client roles
revoke all on function public.create_visitor_safe(text, text, text, jsonb) from public;
grant execute on function public.create_visitor_safe(text, text, text, jsonb) to anon, authenticated;
