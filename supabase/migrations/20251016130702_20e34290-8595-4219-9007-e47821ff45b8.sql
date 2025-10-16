-- Remove access request and whitelist system

-- Drop RLS policies that reference these tables
DROP POLICY IF EXISTS "Whitelisted users can view secrets" ON public.secrets;

-- Drop the security definer function
DROP FUNCTION IF EXISTS public.is_whitelisted_for_secret(uuid, uuid);

-- Drop tables
DROP TABLE IF EXISTS public.whitelists;
DROP TABLE IF EXISTS public.access_requests;
