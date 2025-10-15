-- Fix RLS policies for proper access control

-- Drop existing policies
DROP POLICY IF EXISTS "Whitelisted users can view secrets" ON public.secrets;
DROP POLICY IF EXISTS "Owners can view their secrets" ON public.secrets;
DROP POLICY IF EXISTS "Secret owners can view requests" ON public.access_requests;

-- Recreate secrets viewing policies
-- 1. Owners can view their own secrets
CREATE POLICY "Owners can view their secrets" 
ON public.secrets 
FOR SELECT 
USING (auth.uid() = owner_id);

-- 2. Whitelisted users can view secrets (only if they have remaining views)
CREATE POLICY "Whitelisted users can view secrets" 
ON public.secrets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.whitelists w
    INNER JOIN public.profiles p ON p.email = w.requester_email
    WHERE w.secret_id = secrets.id 
    AND p.id = auth.uid()
    AND w.remaining_views > 0
  )
);

-- Recreate access_requests viewing policy
CREATE POLICY "Secret owners can view requests" 
ON public.access_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.secrets s
    WHERE s.id = access_requests.secret_id 
    AND s.owner_id = auth.uid()
  )
);