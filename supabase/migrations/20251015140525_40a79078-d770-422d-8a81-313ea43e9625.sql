-- Fix RLS policies for proper access control

-- Drop existing secret viewing policy that's too restrictive
DROP POLICY IF EXISTS "Owners can view their secrets" ON public.secrets;

-- Create new policies for secrets table
-- 1. Owners can view their own secrets
CREATE POLICY "Owners can view their secrets" 
ON public.secrets 
FOR SELECT 
USING (auth.uid() = owner_id);

-- 2. Whitelisted users can view secrets
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

-- Update access_requests policies to ensure proper visibility
-- Drop and recreate the view policy with better join
DROP POLICY IF EXISTS "Secret owners can view requests" ON public.access_requests;

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