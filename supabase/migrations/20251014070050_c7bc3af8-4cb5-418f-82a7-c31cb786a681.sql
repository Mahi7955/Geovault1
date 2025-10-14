-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create secrets table
CREATE TABLE public.secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  encryption_key_hash TEXT NOT NULL,
  max_views INTEGER NOT NULL DEFAULT 1,
  remaining_views INTEGER NOT NULL,
  expire_at TIMESTAMP WITH TIME ZONE NOT NULL,
  geo_restrictions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their secrets"
  ON public.secrets FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create secrets"
  ON public.secrets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their secrets"
  ON public.secrets FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their secrets"
  ON public.secrets FOR DELETE
  USING (auth.uid() = owner_id);

-- Create access_requests table
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id UUID NOT NULL REFERENCES public.secrets(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  requester_ip TEXT,
  requester_location JSONB,
  justification TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Secret owners can view requests"
  ON public.access_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.secrets
      WHERE secrets.id = access_requests.secret_id
      AND secrets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create access requests"
  ON public.access_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Secret owners can update requests"
  ON public.access_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.secrets
      WHERE secrets.id = access_requests.secret_id
      AND secrets.owner_id = auth.uid()
    )
  );

-- Create whitelists table
CREATE TABLE public.whitelists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id UUID NOT NULL REFERENCES public.secrets(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  allowed_views INTEGER NOT NULL DEFAULT 1,
  remaining_views INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(secret_id, requester_email)
);

ALTER TABLE public.whitelists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Secret owners can view whitelists"
  ON public.whitelists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.secrets
      WHERE secrets.id = whitelists.secret_id
      AND secrets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Secret owners can manage whitelists"
  ON public.whitelists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.secrets
      WHERE secrets.id = whitelists.secret_id
      AND secrets.owner_id = auth.uid()
    )
  );

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id UUID NOT NULL REFERENCES public.secrets(id) ON DELETE CASCADE,
  viewer_email TEXT NOT NULL,
  viewer_ip TEXT,
  viewer_location JSONB,
  user_agent TEXT,
  action TEXT NOT NULL CHECK (action IN ('view', 'request', 'approve', 'reject')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Secret owners can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.secrets
      WHERE secrets.id = audit_logs.secret_id
      AND secrets.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_secrets_owner ON public.secrets(owner_id);
CREATE INDEX idx_secrets_expire ON public.secrets(expire_at) WHERE is_active = true;
CREATE INDEX idx_access_requests_secret ON public.access_requests(secret_id);
CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_whitelists_secret ON public.whitelists(secret_id);
CREATE INDEX idx_audit_logs_secret ON public.audit_logs(secret_id);

-- Create function to auto-deactivate expired secrets
CREATE OR REPLACE FUNCTION public.deactivate_expired_secrets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.secrets
  SET is_active = false
  WHERE is_active = true
  AND (expire_at < NOW() OR remaining_views <= 0);
END;
$$;