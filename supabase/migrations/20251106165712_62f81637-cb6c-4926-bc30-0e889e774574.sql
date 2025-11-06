-- Make the secret-files bucket public so files can be accessed
UPDATE storage.buckets
SET public = true
WHERE id = 'secret-files';