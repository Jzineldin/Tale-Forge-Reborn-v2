-- Create storage bucket for story images
-- Migration: Create story-images bucket for generated story illustrations

-- Create the story-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-images',
  'story-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for story-images bucket

-- Allow authenticated users to read story images
CREATE POLICY "Authenticated users can view story images" ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'story-images');

-- Allow authenticated users to upload story images
CREATE POLICY "Authenticated users can upload story images" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'story-images');

-- Allow service role to manage all story images (for edge functions)
CREATE POLICY "Service role can manage story images" ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'story-images');

-- Allow public access to story images (for viewing stories)
CREATE POLICY "Public can view story images" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'story-images');

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_storage_objects_story_images 
ON storage.objects (bucket_id, name) 
WHERE bucket_id = 'story-images';