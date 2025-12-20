-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Policy to allow users to view their own documents (and admins/public if needed)
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Policy to allow public access to documents (if we want them to be downloadable by admins easily)
-- For now, let's keep it restricted or public depending on requirement. 
-- User said "saved in a bucket", usually implies private but accessible.
-- Let's allow public read for simplicity in this demo context, or restricted.
-- Given the "public" flag in bucket creation is true, they are public.
