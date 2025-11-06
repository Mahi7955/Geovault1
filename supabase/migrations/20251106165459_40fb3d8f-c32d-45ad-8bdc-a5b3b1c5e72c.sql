-- Create storage bucket for secret files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'secret-files',
  'secret-files',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'application/pdf']
);

-- Add file_url column to secrets table
ALTER TABLE public.secrets
ADD COLUMN file_url TEXT;

-- RLS policies for secret-files bucket
CREATE POLICY "Users can upload their own secret files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'secret-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view files for secrets they have access to"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'secret-files'
);

CREATE POLICY "Users can delete their own secret files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'secret-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);