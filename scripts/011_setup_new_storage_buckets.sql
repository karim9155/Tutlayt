-- Create storage buckets for specific user types
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('interpreter-documents', 'interpreter-documents', true),
  ('sworn-translator-documents', 'sworn-translator-documents', true),
  ('client-documents', 'client-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for interpreter documents
DROP POLICY IF EXISTS "Give full access to interpreter documents to authenticated users" ON storage.objects;
CREATE POLICY "Give full access to interpreter documents to authenticated users"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'interpreter-documents' )
WITH CHECK ( bucket_id = 'interpreter-documents' );

-- Policy for sworn translator documents
DROP POLICY IF EXISTS "Give full access to translator documents to authenticated users" ON storage.objects;
CREATE POLICY "Give full access to translator documents to authenticated users"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'sworn-translator-documents' )
WITH CHECK ( bucket_id = 'sworn-translator-documents' );

-- Policy for client documents
DROP POLICY IF EXISTS "Give full access to client documents to authenticated users" ON storage.objects;
CREATE POLICY "Give full access to client documents to authenticated users"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'client-documents' )
WITH CHECK ( bucket_id = 'client-documents' );
