-- Fix infinite recursion in RLS policies by using security definer function

-- Create a security definer function to check whitelist access
CREATE OR REPLACE FUNCTION public.is_whitelisted_for_secret(_secret_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.whitelists w
    INNER JOIN public.profiles p ON p.email = w.requester_email
    WHERE w.secret_id = _secret_id
    AND p.id = _user_id
    AND w.remaining_views > 0
  )
$$;

-- Drop and recreate the whitelist policy using the security definer function
DROP POLICY IF EXISTS "Whitelisted users can view secrets" ON public.secrets;

CREATE POLICY "Whitelisted users can view secrets" 
ON public.secrets 
FOR SELECT 
USING (public.is_whitelisted_for_secret(id, auth.uid()));