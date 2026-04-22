ALTER TABLE public.secrets
  ADD COLUMN IF NOT EXISTS face_descriptor jsonb,
  ADD COLUMN IF NOT EXISTS face_verification_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS face_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS otp_code_hash text,
  ADD COLUMN IF NOT EXISTS otp_expires_at timestamptz;